/* Evidence freshness — governance that was true last year is not evidence today.
   Every evidence artifact carries a review cadence and a last-reviewed date;
   anything past its review date is flagged Stale so it surfaces without being
   hunted for. Freshness is stored per artifact (demo dates) and the roll-up
   derives from it, so the "stale count" on the dashboard can't drift. */

export const EVIDENCE_ARTIFACTS = [
  { id: "EV-01", artifact: "Human-oversight design record", owner: "CAIO",        cadence: "Quarterly", lastReviewed: "18 Jun 2026", due: "18 Sep 2026", freshness: "fresh", ref: "C21" },
  { id: "EV-02", artifact: "Risk register (inherent + residual)", owner: "CRO",   cadence: "Monthly",   lastReviewed: "02 Aug 2026", due: "02 Sep 2026", freshness: "fresh", ref: "C09" },
  { id: "EV-03", artifact: "Model card — Resolution Copilot", owner: "CAIO",      cadence: "Per release", lastReviewed: "11 Jul 2026", due: "on next release", freshness: "fresh", ref: "C15" },
  { id: "EV-04", artifact: "FRIA / DPIA report", owner: "CDPO",                   cadence: "Annual",    lastReviewed: "20 Aug 2025", due: "20 Aug 2026", freshness: "due", ref: "C07" },
  { id: "EV-05", artifact: "Statement of Applicability", owner: "CGO",            cadence: "Annual",    lastReviewed: "15 Sep 2025", due: "15 Sep 2026", freshness: "due", ref: "C29" },
  { id: "EV-06", artifact: "Data quality statement", owner: "CDPO",              cadence: "Semi-annual", lastReviewed: "10 Jan 2026", due: "10 Jul 2026", freshness: "stale", ref: "C10" },
  { id: "EV-07", artifact: "Transfer impact assessment (APAC)", owner: "CDPO",    cadence: "On change", lastReviewed: "05 Aug 2026", due: "on next change", freshness: "fresh", ref: "C12" },
  { id: "EV-08", artifact: "Red-team & security test report", owner: "CISO",      cadence: "Quarterly", lastReviewed: "28 Jun 2026", due: "28 Sep 2026", freshness: "fresh", ref: "C19" },
  { id: "EV-09", artifact: "Conformity assessment — Credit", owner: "CGO",        cadence: "Per system", lastReviewed: "05 Mar 2026", due: "before scale gate", freshness: "due", ref: "C29" },
  { id: "EV-10", artifact: "Acceptable-use policy", owner: "CGO",                cadence: "Annual",    lastReviewed: "01 Aug 2025", due: "overdue 12 days", freshness: "stale", ref: "C03" },
  { id: "EV-11", artifact: "Fairness workbook — eligibility", owner: "CAIO",      cadence: "Per release", lastReviewed: "09 Jul 2026", due: "on next release", freshness: "fresh", ref: "C17" },
  { id: "EV-12", artifact: "Vendor DPA — frontier model", owner: "Procurement",   cadence: "Annual",    lastReviewed: "12 Feb 2026", due: "12 Feb 2027", freshness: "fresh", ref: "C28" },
];

export const FRESHNESS_META = {
  fresh: { label: "Fresh",     tone: "good" },
  due:   { label: "Due soon",  tone: "warn" },
  stale: { label: "Stale",     tone: "crit" },
};

export function freshnessStats() {
  const by = s => EVIDENCE_ARTIFACTS.filter(e => e.freshness === s).length;
  const total = EVIDENCE_ARTIFACTS.length;
  const fresh = by("fresh");
  return { total, fresh, due: by("due"), stale: by("stale"), freshPct: Math.round((fresh / total) * 100) };
}
