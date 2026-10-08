/* ── Governed agent runtime (#182 §08 · governance agents) ───────────────
   The substrate every GenVeris monitoring / governance agent runs under. The
   principle is "govern the governors": an agent is just another actor, so it
   gets no more latitude than a tool call — least-privilege capability scope,
   human-in-the-loop before any outward or state-changing action, the Article-12
   audit chain on every run, circuit-breaker awareness, and entitlement gating.

   This module is PURE (no db, no node, no React) and unit-tested in isolation:
   it decides WHETHER and HOW an agent may run (planAgentRun) and defines the run
   lifecycle. It never performs an action itself — the caller records the planned
   run and, for read-only monitors, derives findings; anything that would change
   state outside GenVeris is returned as `requiresApproval` and left for a human. */

/* What an agent is allowed to do with its output:
   - monitor  : read-only; raises findings/metrics. Never changes anything.
   - propose  : drafts a change (a task, a decision) for a human to apply.
   - act      : would change external/state. ALWAYS human-gated; never autonomous. */
export const AGENT_ACTION_CLASSES = ["monitor", "propose", "act"] as const;
export type AgentActionClass = (typeof AGENT_ACTION_CLASSES)[number];

export const AGENT_RUN_STATES = ["scheduled", "running", "completed", "proposed", "blocked", "failed"] as const;
export type AgentRunState = (typeof AGENT_RUN_STATES)[number];

export type AgentCadence = "manual" | "hourly" | "daily" | "weekly";

export interface AgentDef {
  id: string;
  name: string;
  purpose: string;
  actionClass: AgentActionClass;
  capabilities: string[];                 // least-privilege: the ONLY reads/tools the run may use
  requiresEntitlement?: "enforce" | "discover" | null;
  cadence: AgentCadence;
  status: "available" | "planned";        // only "available" agents can actually run in step 1
}

/* The governance/monitoring agent catalogue (§08). Honest: only agents actually
   wired are "available"; the rest are "planned" — shown for direction, never
   runnable, never reporting activity they don't produce. Each declares the
   minimum capabilities it needs (least privilege). */
export const AGENT_REGISTRY: AgentDef[] = [
  { id: "evidence-gaps", name: "Evidence & assessment monitor", purpose: "Flags high/critical AI systems missing an assessment and open findings; raises canonical Findings into the Evidence Fabric.", actionClass: "monitor", capabilities: ["fabric:read", "audit:read", "fabric:write"], requiresEntitlement: null, cadence: "daily", status: "available" },
  { id: "drift-kri", name: "Drift & KRI monitor", purpose: "Watches model/behavioural drift and KRI thresholds; raises findings when a threshold is breached.", actionClass: "monitor", capabilities: ["fabric:read", "kri:read"], requiresEntitlement: null, cadence: "hourly", status: "planned" },
  { id: "evidence-freshness", name: "Evidence-freshness agent", purpose: "Flags stale evidence and overdue attestations; proposes refresh tasks to owners.", actionClass: "propose", capabilities: ["fabric:read", "evidence:read", "task:write"], requiresEntitlement: null, cadence: "daily", status: "planned" },
  { id: "policy-review", name: "Policy-review agent", purpose: "Drives the policy lifecycle review cadence; proposes reviews and records acknowledgements.", actionClass: "propose", capabilities: ["policy:read", "task:write"], requiresEntitlement: null, cadence: "weekly", status: "planned" },
  { id: "cost-guard", name: "FinOps cost-guard agent", purpose: "Watches spend vs budget; proposes throttle/deny when a budget is breached.", actionClass: "propose", capabilities: ["cost:read"], requiresEntitlement: null, cadence: "hourly", status: "planned" },
  { id: "incident-triage", name: "Incident-triage agent", purpose: "Triages AI incidents and opens ServiceNow/Jira hand-offs.", actionClass: "act", capabilities: ["incident:read", "servicenow:write"], requiresEntitlement: null, cadence: "manual", status: "planned" },
  { id: "enforce-ingest", name: "Enforce-telemetry ingest agent", purpose: "Pulls governed decisions from a connected Veris Enforce engine into the Evidence Fabric.", actionClass: "act", capabilities: ["enforce:read", "fabric:write"], requiresEntitlement: "enforce", cadence: "hourly", status: "planned" },
  { id: "shadow-discovery", name: "Shadow-AI discovery agent", purpose: "Scheduled governed re-scan of the estate; diffs new/changed systems into the Fabric.", actionClass: "act", capabilities: ["discover:read", "fabric:write"], requiresEntitlement: "discover", cadence: "daily", status: "planned" },
];

export function agentById(id: string): AgentDef | undefined {
  return AGENT_REGISTRY.find((a) => a.id === id);
}

export interface AgentRunPlan {
  allow: boolean;             // may the run proceed at all?
  state: AgentRunState;       // the resulting lifecycle state
  mode: "live" | "demo";      // honest data mode
  capabilityScope: string[];  // exactly the agent's declared capabilities — never more
  requiresApproval: boolean;  // true for propose/act — a human must approve before any effect
  reason: string;             // honest explanation of the decision
}

/* The governance envelope. Decides whether/how an agent may run NOW. Order of
   gates (fail-closed, most restrictive first):
     1. unknown/planned agent        → blocked
     2. circuit breaker open         → blocked (safety)
     3. entitlement required, absent → blocked (strictly-Enforce / plane gating)
     4. act / propose                → requiresApproval; act stays "proposed" (never autonomous)
     5. monitor                      → may complete; read-only
   The capability scope granted is ALWAYS exactly the agent's declared
   capabilities (least privilege). `mode` is demo unless a DB is configured. */
export function planAgentRun(input: {
  agent: AgentDef;
  entitledPlanes?: string[];
  dbConfigured: boolean;
  breakerOpen?: boolean;
  approved?: boolean;
}): AgentRunPlan {
  const { agent } = input;
  const mode: "live" | "demo" = input.dbConfigured ? "live" : "demo";
  const scope = [...agent.capabilities];
  const base = { mode, capabilityScope: scope };

  if (!agent || agent.status !== "available") {
    return { ...base, allow: false, state: "blocked", requiresApproval: false, reason: "agent not available (planned — not yet wired to run)" };
  }
  if (input.breakerOpen) {
    return { ...base, allow: false, state: "blocked", requiresApproval: false, reason: "circuit breaker open — agent runs are suspended" };
  }
  if (agent.requiresEntitlement && !(input.entitledPlanes || []).includes(agent.requiresEntitlement)) {
    return { ...base, allow: false, state: "blocked", requiresApproval: false, reason: `not entitled to the ${agent.requiresEntitlement} plane` };
  }
  if (agent.actionClass === "act") {
    // Acting agents never run autonomously in the runtime — a human approves the
    // outward action. Even approved, step-1 records intent rather than executing.
    return { ...base, allow: true, state: "proposed", requiresApproval: true, reason: "acting agent — outward action requires human approval (HITL)" };
  }
  if (agent.actionClass === "propose") {
    return { ...base, allow: true, state: "proposed", requiresApproval: true, reason: "proposing agent — drafts a change for a human to apply" };
  }
  // monitor: read-only, may complete
  return { ...base, allow: true, state: "completed", requiresApproval: false, reason: `monitor run (${mode})` };
}
