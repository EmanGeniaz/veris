/* Canonical AI Governance Score — the single enterprise composite.

   The headline score is COMPUTED as the weighted mean of the six governance
   inputs, so the number always equals its own breakdown. Previously the
   composite was a hand-typed literal (72) that contradicted the inputs it
   claimed to summarise (which average to ~75). Import GOVERNANCE_SCORE
   everywhere the enterprise "AI Governance Score" headline is shown.

   NOTE: this is distinct from other governance-flavoured metrics that carry
   their own labels — AI Central's "portfolio control compliance" (avgGuard),
   per-initiative guardrail %, and the Academy maturity/readiness score are
   separate measures and are not unified here. */

export const GOVERNANCE_INPUTS = [
  { k: "Transparency & explainability", v: 76, w: 0.18, src: "Model cards, reason codes" },
  { k: "Accountability & ownership",    v: 82, w: 0.16, src: "Named owner, RACI, sign-offs" },
  { k: "Fairness & bias control",       v: 68, w: 0.18, src: "Bias tests, subgroup metrics" },
  { k: "Human oversight",               v: 74, w: 0.16, src: "HITL gates, override logs" },
  { k: "Security & robustness",         v: 79, w: 0.16, src: "Red-team, guardrail coverage" },
  { k: "Data governance & privacy",     v: 70, w: 0.16, src: "DPIA, lineage, retention" },
];

/** Weighted composite (weights sum to 1.00), rounded to a whole score. */
export const GOVERNANCE_SCORE = Math.round(
  GOVERNANCE_INPUTS.reduce((s, i) => s + i.v * i.w, 0)
);

/** Quarter-over-quarter delta shown next to the headline. */
export const GOVERNANCE_DELTA = 4;
