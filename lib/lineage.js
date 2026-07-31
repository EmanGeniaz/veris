/* ── Data lineage ───────────────────────────────────────────────────
   Every number on the platform should answer "where did you come from?".
   lineageFor(label, value) returns the derivation of a metric: the
   formula, a note, and the source records that roll up into it — each
   linked to the initiative behind it, so a click drills to the last part.
   This is the reusable spine behind "make everything clickable". */

import { AI_ASSETS } from "./ai-assets";

export function lineageFor(label, value){
  const l = String(label || "").toLowerCase();
  const A = AI_ASSETS;
  const mk = (formula, rows, note) => ({ label: String(label || "Metric"), value: value == null ? "" : String(value), formula, rows, note });
  const rowsOf = (fn, valFn) => fn.map(a => ({ name: a.name, v: valFn(a), id: a.id, unit: a.unit }));

  if (/adopt/.test(l)) return mk("mean(adoption) across the portfolio", rowsOf(A, a => a.adoption + "%"), "Averaged from each initiative's measured adoption.");
  if (/hours?\s*saved|time\s*saved|productiv/.test(l)) return mk("sum of hours saved across active AI use", rowsOf(A, a => a.arch.ttv), "Rolled up from usage across initiatives.");
  if (/roi|value|realiz|realis|return|budget|spend|cost/.test(l)) return mk("Σ realized value ÷ Σ invested", rowsOf(A, a => `${a.roi} · ${a.actual}/${a.expected}`), "Blended from each initiative's realized value vs investment.");
  if (/risk|critical|exposure|guardrail|vuln/.test(l)) return mk("count where residual risk ∈ {High, Critical}", rowsOf(A.filter(a => a.risk === "High" || a.risk === "Critical"), a => a.risk), "Counted from each initiative's residual risk grade.");
  if (/complian|control|policy|policies|iso|conform/.test(l)) return mk("controls met ÷ controls in scope", rowsOf(A, a => `${(a.controls || []).length} controls`), "Rolled up from mapped controls and evidence per initiative.");
  if (/initiative|portfolio|project|active|pilot|production|scaling|approval|pending/.test(l)) return mk("initiatives in scope", rowsOf(A, a => a.lifecycle), "Every governed initiative that contributes to this figure.");
  return mk("rolls up from the governed initiative record", rowsOf(A, a => a.lifecycle), "This figure derives from the initiative portfolio and its evidence.");
}
