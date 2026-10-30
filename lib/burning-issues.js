/* ── Burning issues — "what needs me right now" ─────────────────────────────
   The first screen after sign-in leads with the handful of governance issues
   that most need THIS person's attention, instead of a wall of tiles.

   Pure and deterministic: the caller passes the source records (risks, KRIs,
   approvals, incidents, breach clocks, evidence freshness, budget, posture)
   and the signed-in role; this ranks them through that role's lens and returns
   the top few, each with WHY it burns, the metric behind it, an owner and the
   one action that moves it. Nothing here invents a record — an empty source
   list yields an empty result, and the UI shows an honest "all clear". */

export const ISSUE_SEVERITY = ["critical", "high", "medium"];
const BASE = { critical: 88, high: 70, medium: 52 };

/* Which kinds of issue each role's lens surfaces. Approvals are always
   personal (only the role's own queue), so they are not listed here. */
export const ROLE_LENS = {
  ceo:      ["risk", "incident", "breach", "budget", "posture", "kri"],
  caio:     ["risk", "kri", "incident", "evidence", "posture", "budget"],
  ciso:     ["risk", "incident", "breach", "kri"],
  cio:      ["risk", "budget", "incident"],
  cdpo:     ["breach", "incident", "evidence", "risk"],
  cgo:      ["posture", "evidence", "kri", "risk"],
  cro:      ["kri", "risk", "incident"],
  cfo:      ["budget", "risk"],
  coo:      ["risk", "incident"],
  chro:     ["risk"],
  legal:    ["posture", "breach", "evidence", "incident"],
  manager:  [],
  employee: [],
};

const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const norm = s => String(s || "").trim();

/* A free-text due string ("2 days overdue", "Overdue 3 days") counts as overdue. */
export function isOverdueText(text) {
  return /overdue/i.test(norm(text));
}

/* KRI breach: value past threshold in the KRI's own direction. */
export function kriBreached(k) {
  if (!k || typeof k.value !== "number" || typeof k.threshold !== "number") return false;
  return k.direction === "below" ? k.value < k.threshold : k.value > k.threshold;
}

function severityFromLevel(level) {
  const l = norm(level).toLowerCase();
  if (l.startsWith("crit")) return "critical";
  if (l.startsWith("high")) return "high";
  return "medium";
}

/* ── per-source issue builders (each pure; unknown/irrelevant rows → null) ── */

function fromApproval(a, role) {
  const sev = severityFromLevel(a.risk);
  const overdue = isOverdueText(a.time);
  return {
    id: `approval:${a.id}`, kind: "approval", severity: sev,
    score: clamp(BASE[sev] + 6 + (overdue ? 8 : 0)),
    title: norm(a.title) || "Decision awaiting your approval",
    why: norm(a.reasoning),
    metric: { label: "Waiting", value: norm(a.time) || "Pending" },
    owner: role.toUpperCase(), ref: norm(a.clause),
    action: { label: "Review decision", nav: { type: "approval" } },
    ask: `Summarise the decision "${norm(a.title)}" and what I should weigh before approving.`,
  };
}

function fromRisk(r) {
  const sev = severityFromLevel(r.level);
  if (sev === "medium") return null;
  if (/complete|monitored|closed/i.test(norm(r.status))) return null;
  const residual = typeof r.residual === "number" ? r.residual : null;
  return {
    id: `risk:${r.id}`, kind: "risk", severity: sev,
    score: clamp(BASE[sev] + (residual != null ? Math.round(residual / 2) : 0) + (/open/i.test(r.status) ? 4 : 0)),
    title: `${norm(r.title)} — ${norm(r.system)}`,
    why: norm(r.desc) || `${sev === "critical" ? "Critical" : "High"} risk with treatment ${norm(r.status).toLowerCase() || "pending"}.`,
    metric: { label: "Residual", value: residual != null ? String(residual) : "—" },
    owner: norm(r.execOwner || r.riskOwner), ref: norm(r.id), execOwner: norm(r.execOwner).toLowerCase(),
    action: { label: "Open treatment", nav: { type: "risk" } },
    ask: `What is the fastest credible treatment for risk ${norm(r.id)} (${norm(r.title)})?`,
  };
}

function fromKri(k) {
  if (!kriBreached(k)) return null;
  const worsening = /worsen/i.test(norm(k.trend));
  const sev = worsening ? "high" : "medium";
  return {
    id: `kri:${k.id}`, kind: "kri", severity: sev,
    score: clamp(BASE[sev] + (worsening ? 6 : 0)),
    title: `${norm(k.name)} breached its threshold`,
    why: `${k.value}${k.unit ? " " + norm(k.unit) : ""} against a ${k.direction === "below" ? "floor" : "ceiling"} of ${k.threshold} — trend ${norm(k.trend) || "unknown"}.`,
    metric: { label: "Now / limit", value: `${k.value} / ${k.threshold}` },
    owner: "CRO", ref: norm(k.framework),
    action: { label: "Open KRIs", nav: { type: "kpiRisks" } },
    ask: `Why is ${norm(k.name)} breaching and what should we do this week?`,
  };
}

function fromIncident(i) {
  if (/contained|closed|resolved/i.test(norm(i.status))) return null;
  const p1 = /p1|critical/i.test(norm(i.severity)) || i.sev === "crit";
  const sev = p1 ? "critical" : "high";
  return {
    id: `incident:${i.id}`, kind: "incident", severity: sev,
    score: clamp(BASE[sev] + (p1 ? 6 : 0) + (/triage|investigat/i.test(norm(i.status)) ? 3 : 0)),
    title: norm(i.title),
    why: `${norm(i.cls) || "Incident"} on ${norm(i.system)} — ${norm(i.status).toLowerCase()}. ${norm(i.reg)}`.trim(),
    metric: { label: "Detected", value: norm(i.detected) || "—" },
    owner: norm(i.owner), ref: norm(i.id), p1,
    action: { label: "Open incident", tab: "incidents" },
    ask: `Give me a status brief on incident ${norm(i.id)} and the next containment step.`,
  };
}

function fromBreach(b, clockFor) {
  const c = typeof clockFor === "function" ? clockFor(b) : null;
  if (!c || (c.state !== "due" && c.state !== "overdue" && c.state !== "clock")) return null;
  const sev = c.state === "overdue" || c.state === "due" ? "critical" : "high";
  return {
    id: `breach:${b.id}`, kind: "breach", severity: sev,
    score: clamp(BASE[sev] + (c.state === "overdue" ? 10 : c.state === "due" ? 6 : 0)),
    title: `Notification clock running — ${norm(b.title)}`,
    why: `${norm(b.cls) || "Breach"} on ${norm(b.system)} involving personal data; regulator notification window is open.`,
    metric: { label: "Clock", value: norm(c.label) },
    owner: norm(b.owner), ref: norm(b.id),
    action: { label: "Open breach clock", tab: "breach" },
    ask: `Which regulators must be notified for ${norm(b.id)} and by when?`,
  };
}

function fromEvidence(e) {
  const f = norm(e.freshness);
  if (f !== "stale" && f !== "due") return null;
  const sev = f === "stale" ? "high" : "medium";
  return {
    id: `evidence:${e.id}`, kind: "evidence", severity: sev,
    score: clamp(BASE[sev] + (isOverdueText(e.due) ? 6 : 0)),
    title: `${f === "stale" ? "Stale" : "Due"} evidence — ${norm(e.artifact)}`,
    why: `Last reviewed ${norm(e.lastReviewed) || "—"} on a ${norm(e.cadence).toLowerCase() || "set"} cadence; governance that was true then is not evidence today.`,
    metric: { label: "Due", value: norm(e.due) || "—" },
    owner: norm(e.owner), ref: norm(e.id), execOwner: norm(e.owner).toLowerCase(),
    action: { label: "Refresh evidence", tab: "freshness" },
    ask: `What does it take to refresh "${norm(e.artifact)}" and who should sign it off?`,
  };
}

function fromBudget(p) {
  if (!p || !p.overBudget) return null;
  const pct = typeof p.utilization === "number" ? p.utilization : (p.budget ? Math.round((p.cost / p.budget) * 100) : null);
  const sev = pct != null && pct >= 120 ? "critical" : "high";
  return {
    id: `budget:${p.id}`, kind: "budget", severity: sev,
    score: clamp(BASE[sev] + (pct != null ? Math.min(10, Math.round((pct - 100) / 5)) : 0)),
    title: `AI spend over budget — ${norm(p.name || p.id)}`,
    why: "Month-to-date model spend has passed the allocated cap for this provider.",
    metric: { label: "Of budget", value: pct != null ? `${pct}%` : "over" },
    owner: "CFO", ref: norm(p.id),
    action: { label: "Open AI FinOps", nav: { type: "portfolioValue" } },
    ask: `Where is the ${norm(p.name || p.id)} overspend coming from and how do we bring it back under cap?`,
  };
}

function fromPosture(p) {
  if (!p || typeof p.score !== "number" || typeof p.target !== "number" || p.score >= p.target) return null;
  const gap = p.target - p.score;
  const sev = gap >= 20 ? "critical" : gap >= 10 ? "high" : "medium";
  return {
    id: `posture:${p.id}`, kind: "posture", severity: sev,
    score: clamp(BASE[sev] + Math.min(8, gap)),
    title: `${norm(p.name)} control coverage below target`,
    why: `Computed coverage is ${p.score}% against a ${p.target}% readiness target — ${p.gaps || 0} gap(s) and ${p.partial || 0} partial control(s).`,
    metric: { label: "Coverage", value: `${p.score}%` },
    owner: "CGO", ref: norm(p.id),
    action: { label: "Open frameworks", nav: { type: "compliance" } },
    ask: `Which ${norm(p.name)} gaps move our coverage most for the least effort?`,
  };
}

/* ── ranking ──────────────────────────────────────────────────────────── */

export function deriveBurningIssues(sources = {}, { role = "caio", limit = 5 } = {}) {
  const r = norm(role).toLowerCase();
  const lens = new Set(ROLE_LENS[r] || []);
  const out = [];
  const push = x => { if (x) out.push(x); };

  (sources.approvals || []).forEach(a => push(fromApproval(a, r)));
  if (lens.has("risk")) (sources.risks || []).forEach(x => {
    const i = fromRisk(x);
    // Non-executive-wide lenses only see the risks they own.
    if (i && (["ceo", "caio", "cro", "cgo"].includes(r) || i.execOwner === r)) push(i);
  });
  if (lens.has("kri")) (sources.kris || []).forEach(x => push(fromKri(x)));
  if (lens.has("incident")) (sources.incidents || []).forEach(x => {
    const i = fromIncident(x);
    if (i && (r !== "ceo" || i.p1)) push(i);
  });
  if (lens.has("breach")) (sources.breaches || []).forEach(x => push(fromBreach(x, sources.breachClock)));
  if (lens.has("evidence")) (sources.evidence || []).forEach(x => {
    const i = fromEvidence(x);
    if (i && (["cgo", "caio", "legal"].includes(r) || i.execOwner === r)) push(i);
  });
  if (lens.has("budget")) (sources.budget || []).forEach(x => push(fromBudget(x)));
  if (lens.has("posture")) (sources.posture || []).forEach(x => push(fromPosture(x)));

  // De-duplicate by id, rank by score then severity order, stable on title.
  const seen = new Set();
  const uniq = out.filter(i => (seen.has(i.id) ? false : (seen.add(i.id), true)));
  uniq.sort((a, b) => b.score - a.score
    || ISSUE_SEVERITY.indexOf(a.severity) - ISSUE_SEVERITY.indexOf(b.severity)
    || a.title.localeCompare(b.title));
  return uniq.slice(0, Math.max(0, limit));
}

/* Headline counts for the greeting line ("3 critical · 2 high"). */
export function issueSummary(issues = []) {
  const s = { critical: 0, high: 0, medium: 0, total: issues.length };
  issues.forEach(i => { if (s[i.severity] != null) s[i.severity] += 1; });
  return s;
}

/* Time-of-day greeting from an explicit hour (keeps rendering deterministic). */
export function greetingFor(hour) {
  const h = Number(hour);
  if (!Number.isFinite(h)) return "Hello";
  if (h < 5) return "Working late";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/* Ask-bar intent routing: a typed request that names a place opens it
   directly; anything else goes to Veris Intelligence. Returns a destination
   descriptor or null. Kept deliberately small and literal — no guessing. */
const INTENTS = [
  { re: /\b(risk register|risks?|treatment)\b|المخاطر/i, nav: { type: "risk" }, label: "Risk Center" },
  { re: /\b(approv\w*|decisions?|sign[- ]?off)\b|القرارات|الموافقات/i, nav: { type: "approval" }, label: "Decision Workspace" },
  { re: /\b(incidents?)\b|الحوادث/i, tab: "incidents", label: "Incidents" },
  { re: /\b(breach(es)?|notification clock)\b/i, tab: "breach", label: "Breach notification" },
  { re: /\b(evidence|freshness)\b|الأدلة/i, tab: "freshness", label: "Evidence freshness" },
  { re: /\b(polic(y|ies))\b|السياسات/i, nav: { type: "policy" }, label: "Policy register" },
  { re: /\b(frameworks?|compliance|eu ai act|iso ?42001|nist)\b|الامتثال/i, nav: { type: "compliance" }, label: "Compliance & Standards" },
  { re: /\b(portfolio|initiatives?)\b/i, nav: { type: "portfolio" }, label: "Portfolio" },
  { re: /\b(reports?|board pack)\b|التقارير/i, nav: { type: "report" }, label: "Reports" },
  { re: /\b(academy|training|course)\b/i, nav: { type: "learning" }, label: "Governance Academy" },
];
export function routeIntent(text) {
  const t = norm(text);
  if (!/^(open|go to|show( me)?|take me to|navigate to)\b|^(افتح|اعرض|اذهب إلى|انتقل إلى)/i.test(t)) return null;
  const hit = INTENTS.find(x => x.re.test(t));
  return hit ? { label: hit.label, nav: hit.nav, tab: hit.tab } : null;
}
