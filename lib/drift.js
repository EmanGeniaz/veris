/* Automated model-drift detection. Computes a real Population Stability Index
   (PSI) per production model from a baseline vs current feature distribution —
   the standard signal for behavioural shift when the data, or the underlying
   model, changes. Bands: <0.10 stable · 0.10–0.25 warning · >0.25 drift.
   Maps to EU AI Act Art.72 post-market monitoring. The PSI is computed here,
   not asserted — swap the distributions for live telemetry and it recomputes. */

/* Share of scored traffic per bucket (4 buckets), baseline vs current window. */
export const DRIFT_MODELS = [
  { id: "ai-001",  model: "Customer Resolution Copilot", feature: "response-confidence", owner: "Platform AI",     baseline: [0.30, 0.40, 0.20, 0.10], current: [0.28, 0.38, 0.22, 0.12] },
  { id: "pf-fraud", model: "Fraud Detection Model",       feature: "txn-risk-score",      owner: "Risk Engineering", baseline: [0.55, 0.25, 0.13, 0.07], current: [0.30, 0.25, 0.25, 0.20] },
  { id: "ai-002",  model: "Credit Decision Assurance",   feature: "applicant-score-band", owner: "Model Risk",      baseline: [0.25, 0.35, 0.25, 0.15], current: [0.15, 0.28, 0.32, 0.25] },
  { id: "ai-003",  model: "Finance Close Automation",    feature: "match-confidence",    owner: "Enterprise Apps",  baseline: [0.60, 0.25, 0.10, 0.05], current: [0.59, 0.26, 0.10, 0.05] },
  { id: "ai-004",  model: "Workforce Skills Navigator",  feature: "match-relevance",     owner: "Data Science",     baseline: [0.20, 0.30, 0.30, 0.20], current: [0.24, 0.31, 0.28, 0.17] },
  { id: "pf-maint", model: "Predictive Maintenance",     feature: "anomaly-score",       owner: "Ops",              baseline: [0.70, 0.20, 0.07, 0.03], current: [0.66, 0.22, 0.08, 0.04] },
];

const EPS = 1e-4;

/* Population Stability Index: Σ (cur% − base%) · ln(cur% / base%). */
export function psi(baseline, current) {
  let s = 0;
  for (let i = 0; i < baseline.length; i++) {
    const b = Math.max(baseline[i], EPS), c = Math.max(current[i], EPS);
    s += (c - b) * Math.log(c / b);
  }
  return Math.round(s * 1000) / 1000;
}

export function driftBand(v) { return v > 0.25 ? "drift" : v >= 0.10 ? "warning" : "stable"; }

export const DRIFT_META = {
  stable:  { label: "Stable",  tone: "good" },
  warning: { label: "Warning", tone: "warn" },
  drift:   { label: "Drift",   tone: "crit" },
};

export function driftRows() {
  return DRIFT_MODELS.map(m => {
    const v = psi(m.baseline, m.current);
    return { ...m, psi: v, band: driftBand(v) };
  });
}

export function driftStats() {
  const rows = driftRows();
  const by = b => rows.filter(r => r.band === b).length;
  return { total: rows.length, stable: by("stable"), warning: by("warning"), drift: by("drift"), coverage: 100 };
}
