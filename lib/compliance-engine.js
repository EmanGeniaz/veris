/* ── Compliance walk-back engine ────────────────────────────────────
   "Prove we comply" is not a status field — it is a traceable chain.
   This engine walks BACK from a control to the things that actually make
   it true: the framework clauses it satisfies, the evidence records that
   prove it operates, the policies that govern it, and the open corrective
   actions against it. Crucially, evidence validity is COMPUTED from the
   expiry date versus today — so a control asserted "Implemented" whose
   evidence has lapsed is reported honestly as at-risk, not conformant.

   Pure module (data + date math only). The canonical control/evidence/
   policy/action tables live in core; this joins them into one trace. */
import { COMMON_CONTROLS, EVIDENCE_LIBRARY, ISO27001_POLICIES, CORRECTIVE_ACTIONS } from "@/components/platform/core";

const MONTHS = { jan:0, feb:1, mar:2, apr:3, may:4, jun:5, jul:6, aug:7, sep:8, oct:9, nov:10, dec:11 };

/* "Jun 2026" → a Date at the end of that month (evidence is valid through
   the stated month). "Never"/blank → null (no valid-through date). */
export function monthToDate(s) {
  if (!s) return null;
  const m = String(s).trim().toLowerCase().match(/([a-z]{3})[a-z]*\s+(\d{4})/);
  if (!m || !(m[1] in MONTHS)) return null;
  const month = MONTHS[m[1]], year = Number(m[2]);
  return new Date(year, month + 1, 0); // last day of that month
}

/* Evidence health from expiry vs today — the real state, not the seeded
   label. Expired = past; Expiring = within 60 days; else Valid. */
export function evidenceHealth(expires, today = new Date()) {
  const d = monthToDate(expires);
  if (!d) return { state: "Unknown", tone: "#8792A6" };
  const days = Math.round((d - today) / 86400000);
  if (days < 0) return { state: "Expired", tone: "#E0654E", days };
  if (days <= 60) return { state: "Expiring", tone: "#E2A64B", days };
  return { state: "Valid", tone: "#2BA88A", days };
}

const baseFromStatus = (s) => (s === "Implemented" ? 100 : s === "Partial" ? 62 : 34);

/* Walk back from a control to everything that substantiates it, and
   compute a conformity verdict from the real state of that evidence. */
export function walkBack(controlId, today = new Date()) {
  const c = COMMON_CONTROLS.find((x) => x.id === controlId) || COMMON_CONTROLS[0];
  /* The set of framework clause refs this control is mapped to — the keys
     every evidence/policy/action record is filed against. */
  const clauses = new Set(Object.values(c.mappings));
  const frameworks = Object.entries(c.mappings).map(([fw, ref]) => ({ fw, ref }));

  const evidence = EVIDENCE_LIBRARY
    .filter((e) => clauses.has(e.control))
    .map((e) => ({ ...e, health: evidenceHealth(e.expires, today) }));
  const policies = ISO27001_POLICIES.filter((p) => (p.linked || []).some((l) => clauses.has(l)));
  const actions = CORRECTIVE_ACTIONS.filter((a) => clauses.has(a.linked));

  /* Conformity: start from the asserted status, then subtract for the
     real gaps the walk-back surfaces. Evidence that has lapsed is the
     loudest signal — a control cannot be conformant on expired proof. */
  let score = baseFromStatus(c.status);
  const reasons = [];
  const expired = evidence.filter((e) => e.health.state === "Expired");
  const expiring = evidence.filter((e) => e.health.state === "Expiring");
  if (!evidence.length) { score -= 30; reasons.push("No evidence records traced to this control"); }
  if (expired.length) { score -= 22 + 8 * (expired.length - 1); reasons.push(`${expired.length} evidence record${expired.length > 1 ? "s have" : " has"} expired`); }
  if (expiring.length) { score -= 8; reasons.push(`${expiring.length} evidence record${expiring.length > 1 ? "s" : ""} expiring within 60 days`); }
  const openActions = actions.filter((a) => a.status !== "Closed" && a.status !== "Complete");
  const overdue = openActions.filter((a) => a.status === "Overdue");
  if (openActions.length) { score -= 6 * openActions.length; reasons.push(`${openActions.length} open corrective action${openActions.length > 1 ? "s" : ""}${overdue.length ? ` (${overdue.length} overdue)` : ""}`); }
  const staleP = policies.filter((p) => p.status === "Draft" || p.status === "Needs Update" || p.reviewed === "Never");
  if (staleP.length) { score -= 5 * staleP.length; reasons.push(`${staleP.length} governing polic${staleP.length > 1 ? "ies" : "y"} draft/overdue`); }
  score = Math.max(0, Math.min(100, Math.round(score)));

  /* The verdict names the failure mode, not just a number — an auditor
     reads "Evidence lapsed", not "63%". */
  let verdict, tone;
  if (expired.length && c.status === "Implemented") { verdict = "Evidence lapsed"; tone = "#E0654E"; }
  else if (score >= 85) { verdict = "Conformant"; tone = "#2BA88A"; }
  else if (score >= 60) { verdict = "Partially conformant"; tone = "#E2A64B"; }
  else { verdict = "Gap — not substantiated"; tone = "#E0654E"; }

  return { control: c, frameworks, evidence, policies, actions, openActions, expired, expiring, verdict, tone, score, reasons };
}

/* Portfolio conformity across every control — the honest headline number,
   computed from each control's walk-back rather than asserted. */
export function conformitySummary(today = new Date()) {
  const rows = COMMON_CONTROLS.map((c) => walkBack(c.id, today));
  const avg = Math.round(rows.reduce((a, r) => a + r.score, 0) / (rows.length || 1));
  return {
    score: avg,
    conformant: rows.filter((r) => r.verdict === "Conformant").length,
    lapsed: rows.filter((r) => r.verdict === "Evidence lapsed").length,
    gaps: rows.filter((r) => r.verdict.startsWith("Gap")).length,
    total: rows.length,
    rows,
  };
}
