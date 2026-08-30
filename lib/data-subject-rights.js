/* ── Data-subject rights lifecycle ───────────────────────────────────────
   The people-facing half of data governance: for every AI system that
   processes personal data, can the enterprise honour the data-subject's
   rights — see, correct, delete, port their data, and prove consent was
   given and can be withdrawn — within the statutory clock the applicable
   regime sets?

   One operating record per system captures how the four rights are handled
   (access/portability, rectification, erasure/retention, consent
   capture/withdraw), the consent model, the retention schedule, and the live
   request queue running against a computed deadline. Coverage is scored from
   the rights — computed, never asserted. This is the single control the
   data-subject-rights duties of GDPR Ch. III (Art. 15-22), the UAE PDPL, DIFC
   DP Law, India's DPDP Act and Brazil's LGPD all point at.

   The clock is MODELLED, not live: each request carries an `elapsedD` (days
   since it was lodged) and each regime a `deadlineD`, so remaining time and
   clock state are pure arithmetic — deterministic and SSR-safe (no Date.now /
   Math.random anywhere), so the same estate always produces the same figures. */

import { acInitiatives } from "./platform-models";

/* deterministic hash (djb2) — same primitive the provenance engine uses. */
function h32(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h; }
const frac = s => (h32(s) % 1000) / 1000;
/* a stable pseudonymous data-subject reference (never a real identity). */
const subjectRef = s => "DS-" + (1000 + (h32(s) % 9000));

/* ── The four data-subject rights this control operates. ─────────────── */
export const DSR_RIGHTS = [
  { id: "access",  name: "Access & portability",       art: "GDPR Art. 15/20 · DPDP §11",  desc: "The subject can see and receive a machine-readable copy of their data." },
  { id: "rectify", name: "Rectification",              art: "GDPR Art. 16 · DPDP §12",     desc: "Inaccurate or incomplete personal data is corrected on request." },
  { id: "erase",   name: "Erasure & retention",        art: "GDPR Art. 17 · DPDP §12",     desc: "Data is deleted on request or when its retention window closes." },
  { id: "consent", name: "Consent capture / withdraw", art: "GDPR Art. 6-7 · DPDP §6",     desc: "Consent is recorded, provable, and as easy to withdraw as to give." },
];

/* ── The statutory response clocks (days) — the binding window per regime.
   `deadlineD` is the outer window in days; `label` keeps the human phrasing. */
export const DSR_REGIMES = {
  gdpr: { regime: "GDPR",        basis: "Art. 12(3)",     region: "EU / EEA",   deadlineD: 30, label: "One month" },
  difc: { regime: "DIFC DP Law", basis: "Art. 34",        region: "DIFC",       deadlineD: 30, label: "One month" },
  pdpl: { regime: "UAE PDPL",    basis: "Art. 13-16",     region: "UAE",        deadlineD: 30, label: "Without undue delay" },
  dpdp: { regime: "India DPDP",  basis: "§11-13 + Rules", region: "India",      deadlineD: 30, label: "Rules-prescribed" },
  lgpd: { regime: "Brazil LGPD", basis: "Art. 19",        region: "Brazil",     deadlineD: 15, label: "15 days · access" },
  cpra: { regime: "US CPRA",     basis: "§1798.130",      region: "California", deadlineD: 45, label: "45 days" },
};

/* the regime whose clock binds each system (modelled by portfolio/region). */
const REGIME_FOR = { "ai-001": "gdpr", "ai-002": "pdpl", "ai-003": "difc", "ai-004": "dpdp" };

/* retention schedule by system category — purpose-bound, honest. */
function retentionFor(i) {
  const cat = `${i.category || ""} ${i.name || ""}`.toLowerCase();
  if (/copilot|genai|assistant|resolution|chat/.test(cat)) return "Conversations purged at 90 days · no training reuse";
  if (/credit|decision|risk|scoring/.test(cat)) return "Decision records 7 years (reg.) · features 24 months";
  if (/automation|close|process|reconcil|finance/.test(cat)) return "Ledger evidence 7 years · intermediates 30 days";
  if (/recommend|skills|navigator|people|workforce/.test(cat)) return "Profiles refreshed 12 months · purge on exit";
  return "Purpose-bound · reviewed annually";
}

/* consent / lawful-basis model — mirrors the provenance engine's mapping. */
function consentModelFor(i) {
  const k = `${i.category} ${i.name}`;
  if (/credit|decision/i.test(k)) return "Legal obligation + legitimate interest";
  if (/copilot|resolution|people|workforce|skills/i.test(k)) return "Contract + consent";
  return "Legitimate interest";
}

/* per-system PII sensitivity — same heuristic as the provenance record. */
function piiFor(i) {
  const k = `${i.category} ${i.name}`;
  if (/credit|decision|copilot|resolution|people|workforce|skills/i.test(k)) return "High";
  if (/finance|close|automation/i.test(k)) return "Low";
  return "Medium";
}

/* A per-system data-subject-rights operating record. Maturer systems honour
   more rights end-to-end; earlier-stage systems carry open rights honestly. */
export function dsrRecord(i) {
  const mature = /production|scal|monitor/i.test(i.lifecycle);
  const mid = /implementation|pilot|deploy/i.test(i.lifecycle);
  const rights = DSR_RIGHTS.map(rt => {
    const r = frac(i.id + rt.id);
    let st;
    if (mature) st = r < 0.80 ? "Met" : "Partial";
    else if (mid) st = r < 0.50 ? "Met" : r < 0.82 ? "Partial" : "Open";
    else st = r < 0.32 ? "Met" : r < 0.70 ? "Partial" : "Open";
    // consent is the anchor for consent-based systems: they must hold it
    if (rt.id === "consent" && /consent/i.test(consentModelFor(i)) && mature) st = "Met";
    return { ...rt, status: st };
  });
  const met = rights.filter(r => r.status === "Met").length;
  const partial = rights.filter(r => r.status === "Partial").length;
  const coverage = Math.round((met * 100 + partial * 60) / rights.length);
  const status = coverage >= 85 ? "Operational" : coverage >= 60 ? "In review" : "Gaps";
  const regime = REGIME_FOR[i.id] || "gdpr";
  return {
    id: i.id, name: i.name, unit: i.unit, pii: piiFor(i),
    consentModel: consentModelFor(i), retention: retentionFor(i),
    regime, regimeName: DSR_REGIMES[regime].regime,
    rights, met, partial, coverage, status,
    canErase: rights.find(r => r.id === "erase").status === "Met",
    consentHeld: rights.find(r => r.id === "consent").status === "Met",
  };
}

export function dsrRecords() { return acInitiatives.map(dsrRecord); }

/* ── The live request queue — modelled open rights requests, each running
   against its system's binding regime clock. `elapsedD` drives the clock. */
const REQUEST_SEEDS = [
  { sys: "ai-001", type: "access",      elapsedD: 9,  requester: "Customer" },
  { sys: "ai-001", type: "erase",       elapsedD: 26, requester: "Customer" },
  { sys: "ai-002", type: "access",      elapsedD: 33, requester: "Applicant" },
  { sys: "ai-003", type: "rectify",     elapsedD: 11, requester: "Vendor contact" },
  { sys: "ai-004", type: "erase",       elapsedD: 22, requester: "Former employee" },
  { sys: "ai-004", type: "portability", elapsedD: 5,  requester: "Employee" },
];

const TYPE_LABEL = { access: "Access", rectify: "Rectification", erase: "Erasure", portability: "Portability" };

/* clock state for a request — pure arithmetic over the modelled days. */
export function requestClock(elapsedD, deadlineD) {
  const daysLeft = deadlineD - elapsedD;
  const state = daysLeft < 0 ? "overdue" : daysLeft <= 7 ? "due" : "ok";
  return { daysLeft, state };
}

export function dsrRequests() {
  const byId = Object.fromEntries(acInitiatives.map(i => [i.id, i]));
  return REQUEST_SEEDS.map((q, idx) => {
    const sys = byId[q.sys] || { name: q.sys };
    const regime = REGIME_FOR[q.sys] || "gdpr";
    const { deadlineD, regime: regimeName, basis } = DSR_REGIMES[regime];
    const { daysLeft, state } = requestClock(q.elapsedD, deadlineD);
    const stage = state === "overdue" ? "Escalated" : state === "due" ? "Actioning"
      : ["Verifying", "Locating", "Actioning"][idx % 3];
    return {
      id: "REQ-" + (2401 + idx),
      subject: subjectRef(q.sys + q.type + q.elapsedD),
      requester: q.requester,
      type: q.type, typeLabel: TYPE_LABEL[q.type],
      system: sys.name, unit: sys.unit,
      regime, regimeName, basis, deadlineD,
      elapsedD: q.elapsedD, daysLeft, state, stage,
    };
  });
}

/* the six-stage workflow that answers a request within the clock. */
export const DSR_WORKFLOW = [
  { n: 1, stage: "Receive",  owner: "Privacy Ops",          crit: "Intake the request through any channel and log it against the clock." },
  { n: 2, stage: "Verify",   owner: "Privacy Ops",          crit: "Verify the requester's identity without collecting excess data." },
  { n: 3, stage: "Locate",   owner: "Data owners",          crit: "Find every system and copy holding the subject's personal data." },
  { n: 4, stage: "Action",   owner: "Data owner + CDPO",    crit: "Access, correct, erase or export per the right invoked — and its exemptions." },
  { n: 5, stage: "Respond",  owner: "CDPO",                 crit: "Respond within the statutory window, in the subject's language." },
  { n: 6, stage: "Log",      owner: "Governance Office",    crit: "Record the request, action taken and proof for audit and reporting." },
];

/* estate-level stats — all computed from the records + the queue. */
export function dsrStats() {
  const rows = dsrRecords();
  const reqs = dsrRequests();
  const total = rows.length;
  const operational = rows.filter(r => r.status === "Operational").length;
  const avgCoverage = Math.round(rows.reduce((s, r) => s + r.coverage, 0) / total);
  const consentHeld = rows.filter(r => r.consentHeld).length;
  const eraseReady = rows.filter(r => r.canErase).length;
  const rightCells = rows.length * DSR_RIGHTS.length;
  const rightsMet = rows.reduce((s, r) => s + r.met, 0);
  const open = reqs.length;
  const overdue = reqs.filter(r => r.state === "overdue").length;
  const onTimePct = open ? Math.round((open - overdue) / open * 100) : 100;
  return {
    total, operational, avgCoverage,
    consentHeldPct: Math.round(consentHeld / total * 100),
    eraseReadyPct: Math.round(eraseReady / total * 100),
    rightsAutomatedPct: Math.round(rightsMet / rightCells * 100),
    open, overdue, onTimePct,
    rights: DSR_RIGHTS.length,
  };
}
