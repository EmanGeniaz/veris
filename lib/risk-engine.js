/* ── Live residual-risk engine ──────────────────────────────────────
   Residual risk is not a frozen number — it is inherent exposure minus
   the effect of treatment. This engine makes that real: it starts from
   the assessed residual on the register and moves it as the treatment
   progresses (the same live status the Treatments tab bumps), then bands
   the result into a level. Complete a treatment and the residual drops
   and the grade can improve — computed, explainable, and responsive.

   Pure module (arithmetic only). Baseline is preserved exactly: at the
   risk's assessed treatment status the live residual equals the recorded
   residual and the level equals the recorded level, so nothing shifts
   until a treatment actually moves. */

/* How far along a treatment is — drives how much of the inherent
   exposure has been bought down. */
const RANK = { Open: 0, Planned: 0, "Not Started": 0, "In Progress": 1, Implemented: 2, Monitored: 2, Complete: 3, Closed: 3 };
const rankOf = (s) => (s in RANK ? RANK[s] : 0);

export function inherentOf(r) {
  return (r.likelihood || 0) * (r.impact || 0);
}

/* Each step of treatment progress buys down ~13% of inherent exposure;
   residual can never reach zero (some risk always remains). */
export function liveResidual(r, effStatus) {
  const inherent = inherentOf(r);
  const step = Math.max(1, Math.round(inherent * 0.13));
  const floor = Math.max(1, Math.round(inherent * 0.12));
  const delta = rankOf(effStatus) - rankOf(r.treatment && r.treatment.status);
  const res = (r.residual ?? inherent) - delta * step;
  return Math.max(floor, Math.min(inherent, Math.round(res)));
}

/* Band a residual score (out of 25) into a level. */
export function bandLevel(res) {
  if (res >= 12) return "Critical";
  if (res >= 7) return "High";
  if (res >= 3) return "Medium";
  return "Low";
}

/* The live level: the recorded grade at the assessed status (so baselines
   are preserved exactly, including hand-set grades), the banded grade once
   treatment has moved. */
export function levelFor(r, effStatus) {
  const moved = rankOf(effStatus) !== rankOf(r.treatment && r.treatment.status);
  return moved ? bandLevel(liveResidual(r, effStatus)) : r.level;
}

/* Full derivation for the "risk math" display. */
export function riskMath(r, effStatus) {
  const inherent = inherentOf(r);
  const assessed = r.residual ?? inherent;
  const live = liveResidual(r, effStatus);
  const level = levelFor(r, effStatus);
  const delta = rankOf(effStatus) - rankOf(r.treatment && r.treatment.status);
  const controls = (r.controls || []).length;
  return {
    inherent, assessed, live, level, delta, controls,
    progressed: delta > 0,
    boughtDown: Math.max(0, inherent - live),
    note: delta > 0
      ? `Treatment now ${effStatus}: bought down ${assessed - live} more point${assessed - live === 1 ? "" : "s"} from the assessed residual.`
      : delta < 0
        ? `Treatment regressed to ${effStatus}: residual risen from the assessed ${assessed}.`
        : `Assessed residual — ${controls} control${controls === 1 ? "" : "s"} mapped, treatment ${effStatus}.`,
  };
}

/* Register-wide rollup by live level. */
export function riskRollup(rows, effStatusOf) {
  const lv = (r) => levelFor(r, effStatusOf ? effStatusOf(r) : (r.treatment && r.treatment.status));
  const open = rows.filter((r) => r.status !== "Closed");
  return {
    critical: open.filter((r) => lv(r) === "Critical").length,
    high: open.filter((r) => lv(r) === "High").length,
    criticalHigh: open.filter((r) => { const l = lv(r); return l === "Critical" || l === "High"; }).length,
  };
}
