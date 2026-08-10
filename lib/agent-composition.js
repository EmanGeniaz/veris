/* ── Veris Enforce · Compositional layer ─────────────────────────────────
   Per-step least privilege (lib/agent-workflows) proves no single agent can
   escalate through a chain. Two risks live ABOVE the single step, and this is
   where they're caught:

   1. Orchestrator delegation. An orchestrator agent delegates a task to a
      sub-agent at runtime. Deny-by-default must apply to the DELEGATION, not
      just the agent: a sub-agent runs with the INTERSECTION of its own grants
      and the orchestrator's mandate — min(orchestrator, sub-agent). An
      orchestrator may borrow a capability it lacks (that is the point of
      delegating), but it can never WIDEN its own data reach through one. A
      delegation whose data scope falls outside the orchestrator's mandate is
      scope-widening — blocked at the delegation boundary even though the
      sub-agent legitimately holds the tool.

   2. Compositional (emergent) risk. Each step in a chain can be individually
      allowed, yet the COMPOSITION is unsafe: sensitive data enters at one step
      and reaches an egress sink at a later step with no mask or human gate
      between them. Per-step least privilege cannot see this — it judges steps
      in isolation. Taint analysis across the whole chain can.

   Pure + client-safe + deterministic. Reuses the capability model in
   lib/agent-registry and the authored chains in lib/agent-workflows. */

import { agentById, capabilityCheck } from "./agent-registry";
import { workflowRows } from "./agent-workflows";

/* Per-tool composition metadata: the data scope a tool touches, its kind
   (read / transform / sink), and — for sinks — whether it crosses the trust
   boundary (egress / external effect). Grounded in the registry's tool set. */
const TOOL_META = {
  read_kb:             { scope: "KB articles",        kind: "read",      sensitive: false },
  read_crm_ticket:     { scope: "CRM tickets",        kind: "read",      sensitive: true  },
  read_bureau:         { scope: "Bureau data",        kind: "read",      sensitive: true  },
  read_ledger:         { scope: "Ledger",             kind: "read",      sensitive: true  },
  read_txn_stream:     { scope: "Transaction stream", kind: "read",      sensitive: true  },
  read_hris_full:      { scope: "HRIS",               kind: "read",      sensitive: true  },
  read_docs:           { scope: "Uploaded documents", kind: "read",      sensitive: true  },
  read_skills_graph:   { scope: "Skills graph",       kind: "read",      sensitive: false },
  draft_response:      { scope: "CRM tickets",        kind: "transform", sensitive: false },
  summarise:           { scope: "Uploaded documents", kind: "transform", sensitive: false },
  score_application:   { scope: "Applications",       kind: "transform", sensitive: true  },
  reconcile:           { scope: "Reconciliations",    kind: "transform", sensitive: false },
  draft_journal:       { scope: "Ledger",             kind: "transform", sensitive: false },
  recommend_role:      { scope: "Role profiles",      kind: "transform", sensitive: false },
  flag_transaction:    { scope: "Transaction stream", kind: "transform", sensitive: false },
  notify_employee:     { scope: "Role profiles",      kind: "sink",      egress: false },
  send_customer_email: { scope: "CRM tickets",        kind: "sink",      egress: true  },
  external_web_fetch:  { scope: "Open web",           kind: "sink",      egress: true  },
  issue_decision:      { scope: "Applications",       kind: "sink",      egress: true  },
  post_journal:        { scope: "Ledger",             kind: "sink",      egress: false },
  block_account:       { scope: "Transaction stream", kind: "sink",      egress: false },
  write_ledger:        { scope: "Ledger",             kind: "sink",      egress: false },
};
export const toolMeta = t => TOOL_META[t] || { scope: "—", kind: "other", sensitive: false };

/* Delegation decision taxonomy. `widen` is the new containment this layer adds:
   a sub-agent legitimately holds the tool, but the delegation would widen the
   orchestrator's data reach — blocked at the delegation boundary. */
export const DELEG_DECISION_META = {
  allow:    { label: "Allowed",        tone: "good" },
  escalate: { label: "HITL gate",      tone: "warn" },
  deny:     { label: "Blocked",        tone: "crit" },
  widen:    { label: "Scope-widening", tone: "crit" },
};

/* Orchestrations — an orchestrator agent delegating to sub-agents at runtime.
   `mandate` is the data the orchestrator is itself authorised over; a delegation
   cannot reach beyond it. */
export const ORCHESTRATIONS = [
  { id: "orc-resolve", name: "Resolution orchestrator", orchestrator: "agent-crc",
    mandate: ["CRM tickets", "KB articles", "Uploaded documents"],
    trigger: "Inbound ticket with attachment", owner: "Customer Operations",
    delegations: [
      { to: "agent-doc", tool: "read_docs",          note: "Sub-agent reads the attached document" },
      { to: "agent-doc", tool: "summarise",          note: "Sub-agent summarises it for the reply" },
      { to: "agent-doc", tool: "external_web_fetch", note: "Sub-agent enriches the answer from the open web", handoff: true },
    ] },
  { id: "orc-credit", name: "Adjudication orchestrator", orchestrator: "agent-credit",
    mandate: ["Applications", "Bureau data"],
    trigger: "Loan application", owner: "Retail Banking",
    delegations: [
      { to: "agent-credit", tool: "read_bureau",       note: "Read bureau data — within mandate" },
      { to: "agent-skills", tool: "read_hris_full",    note: "Delegate pulling the full HRIS employment record", handoff: true },
      { to: "agent-credit", tool: "score_application", note: "Score the application under mandate" },
    ] },
  { id: "orc-close", name: "Close orchestrator", orchestrator: "agent-close",
    mandate: ["Ledger", "Reconciliations"],
    trigger: "Period-end close", owner: "Finance",
    delegations: [
      { to: "agent-close", tool: "read_ledger",  note: "Read ledger balances — within mandate" },
      { to: "agent-close", tool: "reconcile",    note: "Reconcile accounts — within mandate" },
      { to: "agent-close", tool: "post_journal", note: "Delegate posting the entry to the GL", handoff: true },
    ] },
];

/* Deny-by-default on a delegation. Runs the sub-agent's own capability check
   first, then the mandate-intersection: a sensitive read whose data scope falls
   outside the orchestrator's mandate is scope-widening — the orchestrator cannot
   reach that data itself, so it cannot reach it through a sub-agent either. */
export function checkDelegation(orc, d) {
  const cap = capabilityCheck(d.to, d.tool);
  const meta = toolMeta(d.tool);
  if (!cap.allowed) {
    return { ...d, decision: cap.decision === "escalate" ? "escalate" : "deny", allowed: false,
      reason: cap.reason, control: cap.control || "Least-privilege boundary",
      scope: meta.scope, effective: "denied at the agent boundary" };
  }
  if (meta.sensitive && meta.kind === "read" && !orc.mandate.includes(meta.scope)) {
    return { ...d, decision: "widen", allowed: false,
      reason: `Sub-agent holds ${d.tool}, but its data scope “${meta.scope}” is outside the orchestrator's mandate (${orc.mandate.join(", ")}). Delegation cannot widen the orchestrator's reach — min(orchestrator, sub-agent) denies it.`,
      control: "Delegation boundary · privilege intersection",
      scope: meta.scope, effective: `∅ · ${meta.scope} ∉ mandate` };
  }
  return { ...d, decision: "allow", allowed: true,
    reason: `Within mandate · ${cap.control}`, control: cap.control,
    scope: meta.scope, effective: meta.scope };
}

/* Compositional (emergent) risk across an ordered chain of steps. A step that
   reads/derives sensitive data taints the chain context; a mask, HITL gate, or
   block clears it; an egress sink reached while tainted, un-gated, is an
   emergent exfiltration path — even though every step is individually allowed. */
export function compositionalRisk(steps) {
  const findings = [];
  let taintedBy = null;
  steps.forEach((st, i) => {
    const meta = toolMeta(st.tool);
    const dec = st.decision;
    // A barrier clears taint: mask redacts the payload; escalate/deny/block
    // mean the step did not run autonomously, so nothing flows past it.
    if (dec === "mask" || dec === "escalate" || dec === "deny" || dec === "block") { taintedBy = null; }
    // A sensitive source that actually ran (allow) taints the context.
    else if ((meta.kind === "read" || meta.kind === "transform") && meta.sensitive && dec === "allow") {
      taintedBy = taintedBy || st;
    }
    // An egress sink reached while tainted, individually allowed → emergent path.
    if (meta.kind === "sink" && meta.egress && dec === "allow" && taintedBy) {
      const src = toolMeta(taintedBy.tool);
      findings.push({
        at: i, sink: st, source: taintedBy,
        path: `${taintedBy.agent} · ${taintedBy.tool} → … → ${st.agent} · ${st.tool}`,
        detail: `Sensitive data (${src.scope}) can reach an egress sink (${st.tool}) with no mask or human gate between them. Each step passes least privilege; the composition is a data-exfiltration path.`,
      });
    }
  });
  return findings;
}

/* An orchestration, fully evaluated: delegation decisions + emergent paths. */
export function orchestrationRows() {
  return ORCHESTRATIONS.map(o => {
    const orc = agentById(o.orchestrator);
    const delegations = o.delegations.map(d => checkDelegation(o, d));
    // For taint, a widened/blocked delegation stops the flow like any barrier.
    const risks = compositionalRisk(delegations.map(d => ({
      agent: d.to, tool: d.tool, decision: (d.decision === "widen" ? "deny" : d.decision),
    })));
    return { ...o, orchestratorName: orc ? orc.name : o.orchestrator, delegations, risks,
      widened: delegations.filter(d => d.decision === "widen").length,
      blocked: delegations.filter(d => d.decision === "deny").length,
      gated: delegations.filter(d => d.decision === "escalate").length,
      // HITL gates and per-agent blocks are containment working as designed;
      // only a scope-widening delegation or an emergent path is a live risk.
      safe: risks.length === 0 && delegations.filter(d => d.decision === "widen").length === 0 };
  });
}

/* Run compositional analysis over the authored workflows too, so the surface
   shows emergent-path coverage across every chain — not only orchestrations. */
export function workflowCompositionRows() {
  return workflowRows().map(w => ({
    id: w.id, name: w.name, owner: w.owner,
    risks: compositionalRisk(w.steps.map(s => ({ agent: s.agent, tool: s.tool, decision: s.decision }))),
  }));
}

export function compositionStats() {
  const orc = orchestrationRows();
  const wf = workflowCompositionRows();
  const emergentPaths = orc.reduce((n, r) => n + r.risks.length, 0) + wf.reduce((n, r) => n + r.risks.length, 0);
  const chainsAnalysed = orc.length + wf.length;
  return {
    orchestrations: orc.length,
    delegations: orc.reduce((n, r) => n + r.delegations.length, 0),
    widened: orc.reduce((n, r) => n + r.widened, 0),
    delegBlocked: orc.reduce((n, r) => n + r.blocked + r.gated, 0),
    chainsAnalysed,
    emergentPaths,
    contained: emergentPaths, // every path found is flagged for a mask/gate
  };
}
