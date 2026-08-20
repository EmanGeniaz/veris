/* ── Enforcement coverage ─────────────────────────────────────────────────
   The honest answer to "how can Veris Enforce decide what an agent does if the
   customer built it elsewhere?" — it can, but ONLY for traffic that routes
   through the enforcement plane. Enforcement is a chokepoint, not action at a
   distance. So the estate splits into three planes, and the number that
   matters is how much of it is actually on the plane:

     • enforced — inline: model calls route through the Gateway and/or tool
       calls run on capability tokens + the egress policy. Veris can BLOCK,
       MASK, REVOKE and DENY in real time.
     • observed — out-of-band: a third-party AI feature Veris does not sit
       inline on. The CASB / browser-extension fleet inspects paste & egress
       at the edge (some containment), but the model action itself is not
       inline-controllable. Veris can ALERT and mask at the boundary, not
       decide the action.
     • shadow — detected only: an ungoverned tool surfaced by egress telemetry
       / the browser extension. Veris can SEE and FLAG it; nothing is enforced
       until it is onboarded to the plane.

   This module never claims control it does not have — the design honesty rule.
   Coverage is computed from the estate, not asserted.

   Pure data + arithmetic, deterministic, client-safe (no Date.now /
   Math.random). */

import { AI_AGENTS } from "./agent-registry";
import { PAAS_CLIENTS } from "./policy-service";

/* What each plane means, and what Veris can actually do there. */
export const PLANES = {
  enforced: { label: "Enforced", tone: "good", short: "Inline on the plane",
    can: "Block · mask · revoke · scope · deny egress — in real time",
    how: "Model calls route through the Gateway; tool calls run on short-lived capability tokens behind deny-by-default egress." },
  observed: { label: "Observed", tone: "warn", short: "Out-of-band telemetry",
    can: "Alert · mask risky paste at the edge — not the model action itself",
    how: "A third-party AI feature Veris is not inline on. The CASB / browser-extension fleet inspects paste & egress; the model call is not inline-controllable." },
  shadow:   { label: "Shadow", tone: "crit", short: "Detected, ungoverned",
    can: "See · flag · recommend onboarding — nothing is enforced yet",
    how: "Surfaced by egress telemetry / the browser extension. No control until it is routed onto the plane." },
};

/* The tracked AI estate, each classified by the plane it is actually on.
   The eight enforced rows are the registered agents (which run tools through
   capability tokens + egress) plus governed in-app apps; observed rows are the
   third-party SaaS AI features the workforce uses; shadow rows are what the
   extension has caught but nobody has onboarded. `mechanism` names the chokepoint. */
export const ENFORCEMENT_ESTATE = [
  // ── enforced (inline on the plane) ──
  { id: "ai-001", system: "Customer Resolution Copilot", unit: "Customer Operations", owner: "Platform AI",      kind: "Agent",       model: "Claude Sonnet · via Gateway", plane: "enforced", mechanism: "Gateway (inline) + capability tokens + egress" },
  { id: "ai-002", system: "Credit Decision Assurance",   unit: "Retail Banking",      owner: "Risk Engineering", kind: "Agent",       model: "Scorecard + LLM rationale",   plane: "enforced", mechanism: "Capability tokens + egress + HITL gate" },
  { id: "ai-003", system: "Finance Close Automation",    unit: "Finance",             owner: "Enterprise Apps",  kind: "Agent",       model: "GPT-4o · via Gateway",        plane: "enforced", mechanism: "Gateway (inline) + capability tokens + egress" },
  { id: "ai-004", system: "Workforce Skills Navigator",  unit: "People",              owner: "Data Science",     kind: "Agent",       model: "Gradient-boosted ranker",     plane: "enforced", mechanism: "Capability tokens + egress deny-by-default" },
  { id: "pf-doc", system: "Doc Summarisation AI",        unit: "Customer Operations", owner: "Platform AI",      kind: "Agent",       model: "GPT-4o · via Gateway",        plane: "enforced", mechanism: "Gateway (inline) + capability tokens + egress" },
  { id: "pf-fraud", system: "Fraud Detection Model",     unit: "Retail Banking",      owner: "Risk Engineering", kind: "Agent",       model: "Internal · risk-scorer-v3",   plane: "enforced", mechanism: "Capability tokens + egress + circuit breaker" },
  { id: "app-kb", system: "Knowledge Assistant (in-app)", unit: "Enterprise",         owner: "Platform AI",      kind: "App",         model: "Claude · via Gateway",        plane: "enforced", mechanism: "Gateway (inline) + RAG grounding + disclosure" },
  { id: "app-hr", system: "HR Policy Q&A (in-app)",      unit: "People",              owner: "People Tech",      kind: "App",         model: "Claude · via Gateway",        plane: "enforced", mechanism: "Gateway (inline) + PII masking + egress" },

  // ── observed (out-of-band; SaaS AI features Veris is not inline on) ──
  { id: "saas-m365", system: "Microsoft 365 Copilot",    unit: "Enterprise",          owner: "IT / Productivity", kind: "SaaS feature", model: "Vendor-hosted",             plane: "observed", mechanism: "CASB egress + browser-extension paste DLP" },
  { id: "saas-cgpt", system: "ChatGPT Enterprise",       unit: "Marketing",           owner: "Marketing Ops",     kind: "SaaS feature", model: "Vendor-hosted",             plane: "observed", mechanism: "Browser-extension paste/upload guard" },
  { id: "saas-gem",  system: "Gemini in Workspace",      unit: "Enterprise",          owner: "IT / Productivity", kind: "SaaS feature", model: "Vendor-hosted",             plane: "observed", mechanism: "CASB egress inspection" },
  { id: "saas-ghc",  system: "GitHub Copilot",           unit: "Engineering",         owner: "Platform Eng",      kind: "SaaS feature", model: "Vendor-hosted",             plane: "observed", mechanism: "CI/CD content guardrail + endpoint telemetry" },
  { id: "saas-crm",  system: "CRM AI (vendor add-on)",   unit: "Sales",               owner: "Revenue Ops",       kind: "SaaS feature", model: "Vendor-hosted",             plane: "observed", mechanism: "CASB egress + audit-log ingest" },

  // ── shadow (detected only; ungoverned) ──
  { id: "shad-writer", system: "Unsanctioned AI writer", unit: "Marketing",           owner: "— (unassigned)",    kind: "Shadow tool", model: "Unknown (consumer)",        plane: "shadow", mechanism: "Browser-extension egress telemetry — detected" },
  { id: "shad-code",   system: "Unapproved code assistant", unit: "Engineering",       owner: "— (unassigned)",    kind: "Shadow tool", model: "Unknown (consumer)",        plane: "shadow", mechanism: "Endpoint egress to consumer AI host — detected" },
  { id: "shad-meet",   system: "Consumer meeting-notes bot", unit: "Sales",            owner: "— (unassigned)",    kind: "Shadow tool", model: "Unknown (consumer)",        plane: "shadow", mechanism: "CASB flagged upload to unknown AI host" },
];

/* attach the plane metadata to each row for the renderer */
export const estateRows = () => ENFORCEMENT_ESTATE.map(r => ({ ...r, planeMeta: PLANES[r.plane] }));

/* coverage rollup — computed, never asserted */
export function coverageStats() {
  const total = ENFORCEMENT_ESTATE.length;
  const enforced = ENFORCEMENT_ESTATE.filter(r => r.plane === "enforced").length;
  const observed = ENFORCEMENT_ESTATE.filter(r => r.plane === "observed").length;
  const shadow = ENFORCEMENT_ESTATE.filter(r => r.plane === "shadow").length;
  const pct = n => (total ? Math.round((n / total) * 100) : 0);
  return {
    total, enforced, observed, shadow,
    enforcedPct: pct(enforced),
    observedPct: pct(observed),
    shadowPct: pct(shadow),
    governedPct: pct(enforced + observed),   // enforced + observed = anything Veris can at least see
    byUnit: unitRollup(),
  };
}

/* per-business-unit coverage — where the shadow risk concentrates */
function unitRollup() {
  const units = {};
  for (const r of ENFORCEMENT_ESTATE) {
    const u = units[r.unit] || (units[r.unit] = { unit: r.unit, enforced: 0, observed: 0, shadow: 0, total: 0 });
    u[r.plane]++; u.total++;
  }
  return Object.values(units).sort((a, b) => (b.shadow - a.shadow) || (b.total - a.total));
}

/* the channels that provide each plane's coverage — reuse the PaaS clients,
   mapped to the plane they enforce on. */
export const COVERAGE_CHANNELS = PAAS_CLIENTS.map(c => ({
  ...c,
  plane: c.id === "gateway" ? "enforced" : c.type === "Shadow-AI" || c.type === "Network" ? "observed" : c.id === "cicd" ? "observed" : "observed",
  role: c.id === "gateway" ? "Inline chokepoint — the only place the model action itself is decided"
      : c.type === "Shadow-AI" ? "Edge DLP on consumer AI — turns shadow into observed"
      : c.type === "Network" ? "Network egress inspection — observes third-party AI traffic"
      : "Pipeline / partner inspection",
}));
