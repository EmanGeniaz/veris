/* ── Foundational framework → control mappings (ISO 23894 · NIST GenAI 600-1) ──
   Promotes the two remaining foundational frameworks from Mapped to Operational
   with real control mappings. Posture computed from the mapping (Met=100,
   Partial=60), not asserted. Same row shape as the other mappings, so the
   compliance panel renders them through one config-driven component.

   Pure data + arithmetic, deterministic, client-safe. */

const WEIGHT = { Met: 100, Partial: 60 };
function statsFor(rows) {
  const met = rows.filter(r => r.status === "Met").length;
  const partial = rows.filter(r => r.status === "Partial").length;
  const score = Math.round(rows.reduce((s, r) => s + (WEIGHT[r.status] || 0), 0) / rows.length);
  return { total: rows.length, met, partial, score };
}

/* ISO/IEC 23894 — AI risk management (ISO 31000 tailored to AI). */
export const ISO23894_REQS = [
  { n: 1, name: "Risk management framework & leadership", desc: "Governed, owned AI risk-management framework.", control: "EOS ownership model + governance operating model", surface: "AI Central · Governance", status: "Met" },
  { n: 2, name: "Risk identification", desc: "Identify AI risks across the lifecycle.", control: "Risk Center — canonical risk register", surface: "Risk Center", status: "Met" },
  { n: 3, name: "Risk analysis", desc: "Analyse likelihood and impact.", control: "Risk Center — computed residual engine", surface: "Risk Center", status: "Met" },
  { n: 4, name: "Risk evaluation & tiering", desc: "Evaluate and tier risks against criteria.", control: "Risk tiering + AIA impact scoring", surface: "Risk Center", status: "Met" },
  { n: 5, name: "Risk treatment", desc: "Select and apply mitigations.", control: "Control mappings + mitigation plans", surface: "Compliance · Controls", status: "Partial" },
  { n: 6, name: "Monitoring & review", desc: "Monitor risk and re-evaluate over time.", control: "Drift Monitor (PSI) + review cadence", surface: "Drift Monitor", status: "Met" },
  { n: 7, name: "Recording & reporting", desc: "Record and report risk information.", control: "Tool-Call Ledger + Reporting packs", surface: "Reporting", status: "Partial" },
];

/* NIST AI 600-1 — Generative AI Profile (companion to the AI RMF). */
export const NISTGENAI_REQS = [
  { n: 1, name: "Govern GenAI use", desc: "Policies and ownership for generative AI.", control: "EOS ownership model + AI policy register", surface: "AI Central · Governance", status: "Met" },
  { n: 2, name: "Confabulation / hallucination", desc: "Manage fabricated or ungrounded output.", control: "RAG grounding + source-cited evidence", surface: "AI Central · Assistant", status: "Partial" },
  { n: 3, name: "Dangerous & violent content", desc: "Prevent harmful content generation (incl. CBRN).", control: "Gateway guardrails + HITL on high-stakes output", surface: "HITL Gates", status: "Partial" },
  { n: 4, name: "Data privacy & IP", desc: "Protect personal data and intellectual property.", control: "Gateway data scopes + PII masking + egress policy", surface: "Veris Enforce · Egress Policy", status: "Met" },
  { n: 5, name: "Content provenance", desc: "Track and disclose AI-generated content.", control: "AI interaction disclosure + Art.12 record", surface: "Article 12 Log", status: "Partial" },
  { n: 6, name: "Human-AI oversight", desc: "Meaningful human configuration and control.", control: "HITL gates + circuit breaker (real-time revocation)", surface: "Circuit Breaker", status: "Met" },
  { n: 7, name: "Red-team & incident response", desc: "Test adversarially and respond to incidents.", control: "Red-team + incident register + MITRE ATLAS mapping", surface: "Red-Team / AI Incidents", status: "Met" },
];

export const iso23894Stats = () => statsFor(ISO23894_REQS);
export const nistGenAIStats = () => statsFor(NISTGENAI_REQS);

export const ISO23894_POSTURE_SCORE = statsFor(ISO23894_REQS).score;
export const NISTGENAI_POSTURE_SCORE = statsFor(NISTGENAI_REQS).score;
