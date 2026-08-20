/* ── Breach-notification workflow ─────────────────────────────────────────
   The "Notify" stage of the converged incident playbook, made first-class.

   A breach or serious AI incident triggers a regulatory clock: several regimes
   oblige notification to an authority — and sometimes to affected individuals —
   within a fixed window. This module models those duties as data and runs the
   notification decision workflow over the canonical incident register:

     • NOTIFICATION_REGIMES — who must be told, by when, on what trigger.
     • BREACH_REGISTER     — every breach assessed for notifiability, each with
                             the applicable regimes and a computed clock.
     • NOTIFICATION_WORKFLOW — the five-stage decision (assess → scope → decide
                             → notify → log) that produces the evidence.

   The clock is MODELLED, not live: each breach carries an `elapsedH` (hours
   since detection) and each regime a `deadlineH`, so remaining time and clock
   state are pure arithmetic — deterministic and SSR-safe (no Date.now /
   Math.random anywhere in the module). Posture the compliance packs read is
   therefore reproducible.

   Pure data + arithmetic, deterministic, client-safe. */

import { UNIFIED_INCIDENTS } from "./convergence";

/* ── 1 · The regimes that impose a notification clock ────────────────────
   `deadlineH` is the outer window in hours; `deadline` is the human phrasing
   (some regimes vary the window by severity — kept in the label, modelled at
   the outer bound). `audience` is who must be told. */
export const NOTIFICATION_REGIMES = [
  { id: "gdpr-33",  regime: "GDPR",            basis: "Art. 33",           region: "EU / EEA", deadlineH: 72,  deadline: "72 hours from awareness",              audience: "Supervisory authority",            who: "Lead DPA",
    trigger: "Any personal-data breach likely to result in a risk to individuals." },
  { id: "gdpr-34",  regime: "GDPR",            basis: "Art. 34",           region: "EU / EEA", deadlineH: 72,  deadline: "Without undue delay · high risk",       audience: "Affected data subjects",           who: "Data subjects",
    trigger: "A breach likely to result in a HIGH risk to individuals' rights." },
  { id: "euai-73",  regime: "EU AI Act",       basis: "Art. 73",           region: "EU",       deadlineH: 360, deadline: "15 days · 2d widespread · 10d on death", audience: "Market-surveillance authority",    who: "MSA",
    trigger: "A serious incident of a high-risk AI system." },
  { id: "dpdp-8",   regime: "India DPDP Act",  basis: "s. 8(6) + Rules",   region: "India",    deadlineH: 72,  deadline: "Without delay · Rules-prescribed",      audience: "Data Protection Board + principals", who: "DPB + principals",
    trigger: "Any personal-data breach — no materiality threshold." },
  { id: "certin",   regime: "India CERT-In",   basis: "Direction 20(3)/2022", region: "India", deadlineH: 6,   deadline: "6 hours from noticing",                 audience: "CERT-In",                          who: "CERT-In",
    trigger: "A specified cyber-security incident (AI systems included)." },
  { id: "lgpd",     regime: "Brazil LGPD",     basis: "Art. 48",           region: "Brazil",   deadlineH: 48,  deadline: "~2 business days · reasonable term",    audience: "ANPD + data subjects",             who: "ANPD",
    trigger: "A security incident that may create risk or relevant damage." },
];

const REGIME = Object.fromEntries(NOTIFICATION_REGIMES.map(r => [r.id, r]));

/* ── 2 · The breach register — every incident assessed for notification ──
   Rows derive from the canonical incident register (linked by `incidentId`)
   plus historical notified breaches the live queue no longer shows. Each row:
     personalData — did personal data / a serious AI harm actually occur?
     regimes      — which regimes' clocks apply once it is in scope
     decision     — assessed | notifiable | notified
     elapsedH     — modelled hours since detection (drives the clock)
     notifiedInH  — hours taken to notify, when decision === "notified"
   The assessment `rationale` mirrors the incident's own `reg` note so the two
   surfaces never disagree. */
export const BREACH_REGISTER = [
  { id: "BRN-0042", incidentId: "INC-1042", title: "Prompt-injection attempt on Resolution Copilot", system: "Customer Resolution Copilot", cls: "Security",
    personalData: false, regimes: ["gdpr-33"], decision: "assessed", elapsedH: 6, owner: "Omar Khan · CISO",
    rationale: "Attack blocked at the gateway; no personal data left the boundary — assessed under Art. 33, no notification, decision logged." },
  { id: "BRN-0035", incidentId: "INC-1035", title: "PII near-miss in prompt logs", system: "Customer Resolution Copilot", cls: "Data breach",
    personalData: true, regimes: ["gdpr-33", "dpdp-8"], decision: "assessed", elapsedH: 40, owner: "Priya Mehta · CDPO",
    rationale: "Masked before egress; contained in-boundary — assessed as a near-miss, not notifiable, retained under Art. 33(5) internal record." },
  { id: "BRN-0031", incidentId: null, title: "Sub-processor mis-config exposed export bucket", system: "Analytics data pipeline", cls: "Data breach",
    personalData: true, regimes: ["gdpr-33", "gdpr-34", "dpdp-8"], decision: "notified", elapsedH: 96, notifiedInH: 61, owner: "Priya Mehta · CDPO",
    rationale: "Confirmed personal-data breach via a vendor — notified the lead DPA at 61h (within 72h) and affected principals; evidence pack filed." },
  { id: "BRN-0048", incidentId: "INC-1048", title: "Cross-border data flow without transfer mapping (APAC)", system: "Predictive Maintenance", cls: "Regulatory",
    personalData: true, regimes: ["gdpr-33"], decision: "assessed", elapsedH: 72, owner: "Priya Mehta · CDPO",
    rationale: "A transfer-governance gap, not a confided-data breach — transfer impact assessment completed, mapping in place, no notification duty." },
  { id: "BRN-0053", incidentId: null, title: "Vendor model API leaked truncated records in error payload", system: "Skills Navigator (vendor LLM)", cls: "Data breach",
    personalData: true, regimes: ["gdpr-33", "gdpr-34", "dpdp-8", "certin"], decision: "notifiable", elapsedH: 18, owner: "Priya Mehta · CDPO",
    rationale: "Confirmed personal-data breach — notifiable. CERT-In 6h window met; DPA + DPB notification drafted, principal notice in review against the 72h clock." },
];

/* tightest applicable regime deadline for a breach (the binding clock) */
export function tightestDeadlineH(row) {
  const hs = (row.regimes || []).map(id => REGIME[id]?.deadlineH).filter(h => typeof h === "number");
  return hs.length ? Math.min(...hs) : null;
}

/* clock state for a register row — pure arithmetic over modelled hours.
   A breach runs several clocks at once; the binding LIVE clock is the tightest
   window that is still open (a tighter window already elapsed was, in a run
   process, already met — e.g. CERT-In's 6h notice files first, then the 72h
   authority/principal clocks keep running). */
export function breachClock(row) {
  if (row.decision === "notified") {
    const dl = tightestDeadlineH(row);
    const onTime = typeof row.notifiedInH === "number" && dl != null ? row.notifiedInH <= dl : true;
    return { state: "notified", tone: onTime ? "good" : "crit", label: onTime ? `Notified in ${row.notifiedInH}h` : `Notified late (${row.notifiedInH}h)`, remainingH: null };
  }
  if (!row.personalData || row.decision === "assessed") {
    return { state: "closed", tone: "ink3", label: "Assessed · not notifiable", remainingH: null };
  }
  const elapsed = row.elapsedH || 0;
  const rems = (row.regimes || []).map(id => REGIME[id]?.deadlineH).filter(h => typeof h === "number").map(dl => dl - elapsed);
  if (!rems.length) return { state: "closed", tone: "ink3", label: "No clock", remainingH: null };
  const open = rems.filter(r => r > 0);
  if (!open.length) { const over = Math.abs(Math.max(...rems)); return { state: "overdue", tone: "crit", label: `Overdue by ${over}h`, remainingH: Math.max(...rems) }; }
  const remainingH = Math.min(...open);
  if (remainingH <= 24) return { state: "due", tone: "warn", label: `${remainingH}h to notify`, remainingH };
  return { state: "clock", tone: "gold", label: `${remainingH}h to notify`, remainingH };
}

/* regimes a breach must act on, resolved to full regime objects */
export const regimesFor = row => (row.regimes || []).map(id => REGIME[id]).filter(Boolean);

/* ── 3 · The five-stage notification decision workflow ───────────────────
   More specific than the generic incident playbook's single "Notify" stage:
   this is the decision that produces the regulator-facing evidence. */
export const NOTIFICATION_WORKFLOW = [
  { n: 1, stage: "Assess",   owner: "CDPO + CISO",          crit: "Is this a personal-data breach or a serious AI incident? Confirm what data / harm actually occurred." },
  { n: 2, stage: "Scope",    owner: "CDPO + Legal",         crit: "Whose data, which jurisdictions, which authorities — resolve every regime whose clock now runs." },
  { n: 3, stage: "Decide",   owner: "CDPO + CGO",           crit: "Notifiable? Test each regime's threshold against the facts and start the tightest clock." },
  { n: 4, stage: "Notify",   owner: "CDPO + Legal + Comms", crit: "Notify the authority within the window; notify affected individuals without undue delay where the risk is high." },
  { n: 5, stage: "Log",      owner: "Governance Office",    crit: "File the notification record + evidence pack — the Art. 33(5) internal register and the Article 12 log." },
];

/* ── 4 · Portfolio stats for the surface + compliance packs ─────────────── */
export function breachStats() {
  const total = BREACH_REGISTER.length;
  const notifiable = BREACH_REGISTER.filter(r => r.decision === "notifiable").length;
  const notified = BREACH_REGISTER.filter(r => r.decision === "notified").length;
  const assessed = BREACH_REGISTER.filter(r => r.decision === "assessed").length;
  const onClock = BREACH_REGISTER.filter(r => breachClock(r).remainingH != null).length;
  // notified breaches that met the tightest deadline
  const notifiedRows = BREACH_REGISTER.filter(r => r.decision === "notified");
  const onTime = notifiedRows.filter(r => { const dl = tightestDeadlineH(r); return dl == null || r.notifiedInH <= dl; }).length;
  const onTimeRate = notifiedRows.length ? Math.round((onTime / notifiedRows.length) * 100) : 100;
  // tightest live clock across everything still running
  const live = BREACH_REGISTER.map(breachClock).filter(c => typeof c.remainingH === "number");
  const tightestRemainingH = live.length ? Math.min(...live.map(c => c.remainingH)) : null;
  return { total, notifiable, notified, assessed, onClock, onTimeRate, tightestRemainingH, regimes: NOTIFICATION_REGIMES.length };
}

/* coverage: share of the canonical incident register that has a breach
   assessment on record (every breach/security/regulatory incident should). */
export function breachCoverage() {
  const inScope = UNIFIED_INCIDENTS.filter(i => ["Data breach", "Security", "Regulatory"].includes(i.cls));
  const assessedIds = new Set(BREACH_REGISTER.map(r => r.incidentId).filter(Boolean));
  const covered = inScope.filter(i => assessedIds.has(i.id)).length;
  return { inScope: inScope.length, covered, pct: inScope.length ? Math.round((covered / inScope.length) * 100) : 100 };
}
