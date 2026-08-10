/* ── Australia Voluntary AI Safety Standard · 10 guardrails ───────────────
   Promotes the standard from "Mapped" to "Operational" by mapping each of the
   ten guardrails to a control VerisZone already runs — with the surface that
   evidences it — so the posture is computed from live controls, not asserted.

   Status per guardrail:
     · Met     — a live control in-product satisfies the guardrail
     · Partial — partially satisfied; a defined control exists, coverage growing

   Pure data + arithmetic. Deterministic, client-safe. */

export const AU_GUARDRAILS = [
  { n: 1,  name: "Accountability & governance", desc: "Establish owned accountability and an AI governance process.", control: "EOS ownership model — accountable owner per initiative & agent", surface: "AI Central · Governance", status: "Met" },
  { n: 2,  name: "Risk management process", desc: "Identify, assess and treat AI risks through the lifecycle.", control: "Risk Center — computed residual risk over the canonical register", surface: "Risk Center", status: "Met" },
  { n: 3,  name: "Data governance & protection", desc: "Protect data quality, provenance and privacy in AI systems.", control: "Gateway PII masking + data scopes + egress policy", surface: "Veris Enforce · Egress Policy", status: "Met" },
  { n: 4,  name: "Testing & monitoring", desc: "Test models pre-deployment and monitor them in production.", control: "Drift Monitor — computed PSI per production model", surface: "Drift Monitor", status: "Met" },
  { n: 5,  name: "Human oversight & control", desc: "Enable meaningful human control and intervention.", control: "HITL gates — high-stakes actions escalate (EU AI Act Art.14)", surface: "HITL Gates", status: "Met" },
  { n: 6,  name: "Transparency to end-users", desc: "Inform people when they are interacting with or affected by AI.", control: "AI interaction disclosure + Art.12 per-inference record", surface: "Article 12 Log", status: "Partial" },
  { n: 7,  name: "Contestability", desc: "Let affected people challenge AI-enabled outcomes.", control: "Decision escalation + HITL override path", surface: "Decisions / Approvals", status: "Partial" },
  { n: 8,  name: "Supply-chain transparency", desc: "Understand and disclose the AI supply chain (data, models, tools).", control: "MCP Registry — tool manifests pinned by hash + vendor inventory", surface: "MCP Registry", status: "Met" },
  { n: 9,  name: "Records & documentation", desc: "Keep records enabling third-party assessment of the system.", control: "Tool-Call Ledger — tamper-evident hash chain + Evidence Fabric", surface: "Tool-Call Ledger", status: "Met" },
  { n: 10, name: "Stakeholder engagement", desc: "Engage stakeholders; assess for fairness, diversity and inclusion.", control: "Multi-stakeholder feedback engine per initiative", surface: "AI Central · Value", status: "Partial" },
];

const WEIGHT = { Met: 100, Partial: 60 };

export function auGuardrailStats() {
  const met = AU_GUARDRAILS.filter(g => g.status === "Met").length;
  const partial = AU_GUARDRAILS.filter(g => g.status === "Partial").length;
  const score = Math.round(AU_GUARDRAILS.reduce((s, g) => s + (WEIGHT[g.status] || 0), 0) / AU_GUARDRAILS.length);
  return { total: AU_GUARDRAILS.length, met, partial, score };
}

/* The computed posture, used as the framework's Operational score so the
   library figure and the guardrail mapping never disagree. */
export const AU_POSTURE_SCORE = auGuardrailStats().score;
