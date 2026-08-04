/* ── Data lineage ───────────────────────────────────────────────────
   Every number on the platform should answer "where did you come from?".
   lineageFor(label, value) returns the derivation of a metric: the
   formula, a note, and the source records that roll up into it — each
   linked to the initiative behind it, so a click drills to the last part.
   This is the reusable spine behind "make everything clickable". */

import { AI_ASSETS } from "./ai-assets";

/* ── Metric provenance ──────────────────────────────────────────────
   The "no hallucinated metrics" law, made explicit: every number declares
   how it came to be. Five honest states — never dress an assumption up as
   a fact, and never invent a value that has no source. */
export const PROVENANCE = {
  actual:     { key: "actual",     label: "Actual",     tone: "#2BA88A", def: "Directly measured or recorded — a booked value or a count of real records." },
  calculated: { key: "calculated", label: "Calculated", tone: "#3B7DFF", def: "Deterministically derived from actuals by a formula — no assumptions." },
  estimated:  { key: "estimated",  label: "Estimated",  tone: "#E2A64B", def: "Derived using assumptions or heuristics — directionally reliable, not exact." },
  predicted:  { key: "predicted",  label: "Predicted",  tone: "#8B6FE0", def: "A forward-looking projection — not yet observed." },
  missing:    { key: "missing",    label: "Not available", tone: "#E0654E", def: "No source yet — shown as unavailable, never invented." },
};

/* Classify a metric by its label (and value) into a provenance state. */
export function provenanceFor(label, value){
  const v = value == null ? "" : String(value).trim();
  if (v === "" || v === "—" || v === "-" || /^(n\/?a|tbd|unknown|not available)$/i.test(v)) return "missing";
  const l = String(label || "").toLowerCase();
  if (/forecast|projec|predict|\beta\b|expected|target|on track to|by q[1-4]|next quarter|run-?rate|payback/.test(l)) return "predicted";
  if (/hours?\s*saved|time\s*saved|productiv|sentiment|estimat|readiness|resistance/.test(l)) return "estimated";
  if (/initiative|portfolio|\bcount\b|risk|critical|\bopen\b|pilot|policies|violation|incident|approval|assets|records/.test(l)) return "actual";
  if (/adopt|roi|value|realiz|realis|return|ratio|score|maturity|complian|control|budget|spend|%/.test(l)) return "calculated";
  return "calculated";
}

export function lineageFor(label, value){
  const l = String(label || "").toLowerCase();
  const A = AI_ASSETS;
  const mk = (formula, rows, note, prov) => ({ label: String(label || "Metric"), value: value == null ? "" : String(value), formula, rows, note, provenance: prov || provenanceFor(label, value) });
  const rowsOf = (fn, valFn) => fn.map(a => ({ name: a.name, v: valFn(a), id: a.id, unit: a.unit }));

  if (/adopt/.test(l)) return mk("mean(adoption) across the portfolio", rowsOf(A, a => a.adoption + "%"), "Averaged from each initiative's measured adoption.");
  if (/hours?\s*saved|time\s*saved|productiv/.test(l)) return mk("sum of hours saved across active AI use", rowsOf(A, a => a.arch.ttv), "Rolled up from usage across initiatives.");
  if (/roi|value|realiz|realis|return|budget|spend|cost/.test(l)) return mk("Σ realized value ÷ Σ invested", rowsOf(A, a => `${a.roi} · ${a.actual}/${a.expected}`), "Blended from each initiative's realized value vs investment.");
  if (/risk|critical|exposure|guardrail|vuln/.test(l)) return mk("count where residual risk ∈ {High, Critical}", rowsOf(A.filter(a => a.risk === "High" || a.risk === "Critical"), a => a.risk), "Counted from each initiative's residual risk grade.");
  if (/complian|control|policy|policies|iso|conform/.test(l)) return mk("controls met ÷ controls in scope", rowsOf(A, a => `${(a.controls || []).length} controls`), "Rolled up from mapped controls and evidence per initiative.");
  if (/initiative|portfolio|project|active|pilot|production|scaling|approval|pending/.test(l)) return mk("initiatives in scope", rowsOf(A, a => a.lifecycle), "Every governed initiative that contributes to this figure.");
  return mk("rolls up from the governed initiative record", rowsOf(A, a => a.lifecycle), "This figure derives from the initiative portfolio and its evidence.");
}
