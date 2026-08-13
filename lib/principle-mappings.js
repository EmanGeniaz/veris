/* ── Principle framework → control mappings (OECD · UNESCO) ───────────────
   OECD AI Principles and the UNESCO Recommendation are values/principles
   rather than clause-by-clause standards — so the mapping shows how VerisZone
   operationalises each principle with a live control. Posture computed from the
   mapping (Met=100, Partial=60), not asserted. Same row shape as the other
   mappings, rendered through the one config-driven panel.

   Pure data + arithmetic, deterministic, client-safe. */

const WEIGHT = { Met: 100, Partial: 60 };
function statsFor(rows) {
  const met = rows.filter(r => r.status === "Met").length;
  const partial = rows.filter(r => r.status === "Partial").length;
  const score = Math.round(rows.reduce((s, r) => s + (WEIGHT[r.status] || 0), 0) / rows.length);
  return { total: rows.length, met, partial, score };
}

/* OECD AI Principles — the five values-based principles (2019, updated 2024). */
export const OECD_REQS = [
  { n: 1, name: "Inclusive growth & well-being", desc: "AI benefits people and the planet.", control: "Value realization + sustainability footprint (TR 20226)", surface: "AI Central · Value", status: "Met" },
  { n: 2, name: "Human-centred values & fairness", desc: "Respect rights, fairness and human agency.", control: "HITL gates + bias / fairness monitoring", surface: "HITL Gates", status: "Partial" },
  { n: 3, name: "Transparency & explainability", desc: "Meaningful transparency about AI systems.", control: "Article 12 record + decision lineage / explainability", surface: "Article 12 Log", status: "Met" },
  { n: 4, name: "Robustness, security & safety", desc: "Systems are robust, secure and safe over their lifecycle.", control: "Veris Enforce + Drift Monitor + circuit breaker", surface: "Veris Enforce", status: "Met" },
  { n: 5, name: "Accountability", desc: "Actors are accountable for AI systems.", control: "EOS ownership model + Tool-Call Ledger", surface: "AI Central · Governance", status: "Met" },
];

/* UNESCO Recommendation on the Ethics of AI — core principles. */
export const UNESCO_REQS = [
  { n: 1, name: "Proportionality & do no harm", desc: "AI use is proportionate and avoids harm.", control: "Risk Center tiering + gateway guardrails", surface: "Risk Center", status: "Partial" },
  { n: 2, name: "Safety & security", desc: "AI systems are safe and secure.", control: "Veris Enforce — least privilege, egress, circuit breaker", surface: "Veris Enforce", status: "Met" },
  { n: 3, name: "Fairness & non-discrimination", desc: "Prevent bias and discriminatory outcomes.", control: "Bias monitoring + fairness review", surface: "Drift Monitor", status: "Partial" },
  { n: 4, name: "Sustainability", desc: "Assess AI's environmental and social impact.", control: "Environmental footprint (ISO/IEC TR 20226)", surface: "AI Central · Value", status: "Met" },
  { n: 5, name: "Privacy & data protection", desc: "Protect privacy throughout the lifecycle.", control: "Gateway data scopes + PII masking + egress policy", surface: "Veris Enforce · Egress Policy", status: "Met" },
  { n: 6, name: "Human oversight & determination", desc: "Humans retain oversight and final determination.", control: "HITL gates + circuit breaker (real-time revocation)", surface: "Circuit Breaker", status: "Met" },
  { n: 7, name: "Transparency & explainability", desc: "AI decisions are transparent and explainable.", control: "Article 12 record + decision lineage", surface: "Article 12 Log", status: "Partial" },
  { n: 8, name: "Responsibility & accountability", desc: "Clear responsibility for AI outcomes.", control: "EOS ownership model + Tool-Call Ledger", surface: "AI Central · Governance", status: "Met" },
];

export const oecdStats = () => statsFor(OECD_REQS);
export const unescoStats = () => statsFor(UNESCO_REQS);

export const OECD_POSTURE_SCORE = statsFor(OECD_REQS).score;
export const UNESCO_POSTURE_SCORE = statsFor(UNESCO_REQS).score;
