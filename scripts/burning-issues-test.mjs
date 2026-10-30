/* GenVeris · Burning issues tests (Intelligence Home)
   Locks the "what needs me now" ranking that leads the first screen after
   sign-in: it is a pure function of the records it is given (nothing is
   invented), each role sees issues through its own lens, the ordering is
   deterministic, and the ask-bar only routes explicit "open …" requests.
   Run: npx tsx scripts/burning-issues-test.mjs */
// Dynamic import: Node's CJS named-export detection misses some of this module's
// exports after tsx's transform; a namespace import always sees all of them.
const {
  deriveBurningIssues, issueSummary, greetingFor, routeIntent, kriBreached, isOverdueText, ROLE_LENS, briefFor, PROVENANCE,
} = await import("../lib/burning-issues.js");
const { breachClock } = await import("../lib/breach-notification.js");

const R = [];
const check = (name, cond) => { R.push([cond ? "PASS" : "FAIL", name]); };

const approvals = {
  caio: [{ id: "a1", title: "LLM v2 go-live", risk: "Critical", time: "2 days overdue", clause: "EU AI Act Art.6", reasoning: "High-risk system." }],
  cfo: [],
};
const risks = [
  { id: "RSK-1", title: "Prompt injection", system: "Copilot", level: "Critical", status: "Open", residual: 12, execOwner: "CISO", desc: "Injection risk." },
  { id: "RSK-2", title: "Bias", system: "Navigator", level: "High", status: "Treating", residual: 8, execOwner: "CAIO" },
  { id: "RSK-3", title: "Done risk", system: "X", level: "Critical", status: "Complete", residual: 2, execOwner: "CEO" },
  { id: "RSK-4", title: "Minor", system: "Y", level: "Medium", status: "Open", residual: 4, execOwner: "CFO" },
];
const kris = [
  { id: "K1", name: "HITL override rate", value: 6.4, threshold: 5, direction: "above", trend: "worsening", framework: "Art.14" },
  { id: "K2", name: "Evidence coverage", value: 87, threshold: 85, direction: "below", trend: "improving" },
  { id: "K3", name: "Coverage floor", value: 80, threshold: 85, direction: "below", trend: "stable" },
];
const incidents = [
  { id: "INC-1", title: "Injection attempt", severity: "P1 · Critical", sev: "crit", system: "Copilot", status: "Investigating", cls: "Security", detected: "Today" },
  { id: "INC-2", title: "Biased output", severity: "P2 · High", sev: "warn", system: "Nav", status: "Triage", cls: "Harmful output" },
  { id: "INC-3", title: "Old", severity: "P2 · High", sev: "warn", system: "Z", status: "Contained" },
];
const breaches = [
  { id: "B1", title: "Export bucket", system: "Pipeline", cls: "Data breach", personalData: true, regimes: ["gdpr-33"], decision: "pending", elapsedH: 60, owner: "CDPO" },
  { id: "B2", title: "Assessed", system: "Copilot", personalData: false, regimes: ["gdpr-33"], decision: "assessed", elapsedH: 6 },
];
const evidence = [
  { id: "EV-1", artifact: "AUP", owner: "CGO", cadence: "Annual", lastReviewed: "2025", due: "overdue 12 days", freshness: "stale" },
  { id: "EV-2", artifact: "DPIA", owner: "CDPO", cadence: "Annual", lastReviewed: "2025", due: "Aug", freshness: "due" },
  { id: "EV-3", artifact: "Model card", owner: "CAIO", freshness: "fresh" },
];
const budget = [
  { id: "gw-claude", name: "Anthropic", overBudget: true, utilization: 128 },
  { id: "gw-x", name: "X", overBudget: false, utilization: 40 },
];
const posture = [
  { id: "euaiact", name: "EU AI Act", score: 64, target: 85, gaps: 2, partial: 5 },
  { id: "nist", name: "NIST AI RMF", score: 90, target: 85 },
];
const all = { approvals: approvals.caio, risks, kris, incidents, breaches, breachClock, evidence, budget, posture };

/* ── 1 · nothing invented ── */
{
  check("no sources → no issues (honest all-clear)", deriveBurningIssues({}, { role: "caio" }).length === 0);
  check("empty source arrays → no issues", deriveBurningIssues({ risks: [], kris: [], incidents: [] }, { role: "ceo" }).length === 0);
  const out = deriveBurningIssues(all, { role: "caio", limit: 50 });
  const ids = new Set(out.map(i => i.id));
  check("every issue traces to a supplied record", out.every(i => /^(approval|risk|kri|incident|breach|evidence|budget|posture):/.test(i.id)));
  check("closed/complete risks are not burning", !ids.has("risk:RSK-3"));
  check("medium risks are not burning", !ids.has("risk:RSK-4"));
  check("contained incidents are not burning", !ids.has("incident:INC-3"));
  check("fresh evidence is not burning", !ids.has("evidence:EV-3"));
  check("within-budget providers are not burning", !ids.has("budget:gw-x"));
  check("posture above target is not burning", !ids.has("posture:nist"));
}

/* ── 2 · KRI + clock maths ── */
{
  check("KRI above-direction breach detected", kriBreached(kris[0]));
  check("KRI below-direction within floor not breached", !kriBreached(kris[1]));
  check("KRI below-direction under floor breached", kriBreached(kris[2]));
  check("malformed KRI never breaches", !kriBreached({ value: "x", threshold: 1 }) && !kriBreached(null));
  check("overdue text detected", isOverdueText("2 days overdue") && isOverdueText("Overdue 3 days") && !isOverdueText("Pending 1 day"));
  const caio = deriveBurningIssues(all, { role: "caio", limit: 50 });
  check("open breach clock surfaces for CDPO", deriveBurningIssues(all, { role: "cdpo", limit: 50 }).some(i => i.id === "breach:B1"));
  check("assessed (non-notifiable) breach does not burn", !deriveBurningIssues(all, { role: "cdpo", limit: 50 }).some(i => i.id === "breach:B2"));
  check("breach clock carries the live label", deriveBurningIssues(all, { role: "cdpo", limit: 50 }).find(i => i.id === "breach:B1")?.metric.value.length > 0);
  check("CAIO lens excludes breach clocks", !caio.some(i => i.kind === "breach"));
}

/* ── 3 · role lenses ── */
{
  const cfo = deriveBurningIssues({ ...all, approvals: approvals.cfo }, { role: "cfo", limit: 50 });
  check("CFO sees budget overrun", cfo.some(i => i.id === "budget:gw-claude"));
  check("CFO does not see incidents", !cfo.some(i => i.kind === "incident"));
  check("CFO only sees risks they own", cfo.filter(i => i.kind === "risk").every(i => i.execOwner === "cfo"));
  const ceo = deriveBurningIssues(all, { role: "ceo", limit: 50 });
  check("CEO sees only P1 incidents", ceo.filter(i => i.kind === "incident").every(i => i.p1) && ceo.some(i => i.id === "incident:INC-1"));
  const ciso = deriveBurningIssues(all, { role: "ciso", limit: 50 });
  check("CISO sees the risk they own", ciso.some(i => i.id === "risk:RSK-1") && !ciso.some(i => i.id === "risk:RSK-2"));
  const cdpo = deriveBurningIssues(all, { role: "cdpo", limit: 50 });
  check("CDPO sees their own due evidence, not CGO's", cdpo.some(i => i.id === "evidence:EV-2") && !cdpo.some(i => i.id === "evidence:EV-1"));
  check("CGO sees posture gap", deriveBurningIssues(all, { role: "cgo", limit: 50 }).some(i => i.id === "posture:euaiact"));
  check("employee lens is empty without personal approvals", deriveBurningIssues({ ...all, approvals: [] }, { role: "employee" }).length === 0);
  check("approvals are personal: passed approvals always surface", deriveBurningIssues({ approvals: approvals.caio }, { role: "employee" }).length === 1);
  check("unknown role sees approvals only", deriveBurningIssues({ ...all, approvals: [] }, { role: "nobody" }).length === 0);
  check("every RBAC-visible role has a lens entry", ["ceo","caio","ciso","cio","cdpo","cgo","cro","cfo","coo","chro","legal","manager","employee"].every(r => Array.isArray(ROLE_LENS[r])));
}

/* ── 4 · ranking, limit, shape ── */
{
  const caio = deriveBurningIssues(all, { role: "caio", limit: 50 });
  check("ranked by score descending", caio.every((x, i) => i === 0 || caio[i - 1].score >= x.score));
  check("overdue critical approval ranks first for CAIO", caio[0]?.id === "approval:a1");
  check("scores clamped 0..100", caio.every(i => i.score >= 0 && i.score <= 100));
  check("limit respected (default 5)", deriveBurningIssues(all, { role: "caio" }).length <= 5);
  check("limit 0 → none", deriveBurningIssues(all, { role: "caio", limit: 0 }).length === 0);
  check("deterministic across calls", JSON.stringify(deriveBurningIssues(all, { role: "cgo" })) === JSON.stringify(deriveBurningIssues(all, { role: "cgo" })));
  check("each issue has title, why, metric, action and an ask prompt", caio.every(i => i.title && typeof i.why === "string" && i.metric?.label && i.action?.label && (i.action.nav || i.action.tab) && i.ask));
  check("duplicates collapse", deriveBurningIssues({ approvals: [approvals.caio[0], approvals.caio[0]] }, { role: "caio" }).length === 1);
  const s = issueSummary(caio);
  check("summary counts add up", s.critical + s.high + s.medium === s.total && s.total === caio.length);
}

/* ── 5 · greeting + intent routing ── */
{
  check("greeting by hour", greetingFor(8) === "Good morning" && greetingFor(13) === "Good afternoon" && greetingFor(20) === "Good evening" && greetingFor(2) === "Working late");
  check("greeting tolerates bad input", greetingFor("x") === "Hello");
  check("'open risk register' routes to Risk Center", routeIntent("open the risk register")?.nav?.type === "risk");
  check("'show me incidents' routes to incidents tab", routeIntent("show me incidents")?.tab === "incidents");
  check("a question is not hijacked as navigation", routeIntent("what are our biggest risks this quarter?") === null);
  check("unknown destination falls through to the assistant", routeIntent("open the pod bay doors") === null);
  check("Arabic 'open the risk register' routes to Risk Center", routeIntent("افتح سجل المخاطر")?.nav?.type === "risk");
  check("Arabic question is not hijacked as navigation", routeIntent("ما أكبر المخاطر التي تحتاج قراري؟") === null);
}

/* ── briefs: six questions, provenance marks, no invented decision or enforcement ── */
{
  const issues = deriveBurningIssues(all, { role: "caio", limit: 50 });
  const briefs = issues.map(i => briefFor(i, { role: "caio" }));
  const claims = b => [...b.changed, ...b.matters];
  check("every issue yields a brief", briefs.length === issues.length && briefs.every(Boolean));
  check("every brief answers all six questions", briefs.every(b => b.changed.length && b.matters.length && b.evidence && b.uncertainty && b.who && b.action));
  check("every brief says why it was shown", briefs.every(b => /^Shown because: /.test(b.shownBecause) && b.shownBecause.includes("CAIO lens")));
  check("marks are only known provenance classes or framing (null)", briefs.every(b => claims(b).every(([, p]) => p === null || p in PROVENANCE)));
  check("no brief claims a human decision or verified enforcement", briefs.every(b => claims(b).every(([, p]) => p !== "D" && p !== "E")));
  check("register-derived briefs carry no AI interpretation", briefs.filter(b => b.kind !== "approval").every(b => claims(b).every(([, p]) => p !== "I" && p !== "R")));
  check("register-derived briefs are low uncertainty", briefs.filter(b => b.kind !== "approval" && b.kind !== "kri").every(b => b.uncertainty.level === "low"));
  const ap = briefs.find(b => b.kind === "approval");
  check("approval reasoning is marked as AI interpretation", ap && ap.matters.some(([, p]) => p === "I"));
  check("approval brief says it is in your queue and overdue", ap && /approval queue/.test(ap.shownBecause) && /overdue/.test(ap.shownBecause));
  check("evidence carries its source register and facts", briefs.every(b => b.evidence.source && Array.isArray(b.evidence.facts)));
  const risk = briefs.find(b => b.id === "risk:RSK-1");
  check("risk evidence facts include residual and owner", risk && risk.evidence.facts.some(([k, v]) => k === "Residual" && v === "12") && risk.evidence.facts.some(([k]) => k === "Executive owner"));
  check("residual is marked calculated", risk && risk.changed.some(([t, p]) => /Residual/.test(t) && p === "C"));
  check("empty fact values are dropped", briefs.every(b => b.evidence.facts.every(([, v]) => String(v).trim() !== "")));
  const kri = briefs.find(b => b.id === "kri:K1");
  check("worsening KRI is named in why-shown", kri && /worsening/.test(kri.shownBecause));
  const noOwner = briefFor({ ...issues.find(i => i.kind === "risk"), owner: "" }, { role: "cro" });
  check("missing owner is shown as a gap, not filled in", noOwner.who === "No owner recorded" && noOwner.ownerMissing === true);
  check("low-confidence recommendation is high uncertainty", briefFor({ ...issues.find(i => i.kind === "approval"), conf: 55 }).uncertainty.level === "high");
  check("unrecorded confidence is medium uncertainty", briefFor({ ...issues.find(i => i.kind === "approval"), conf: null }).uncertainty.level === "medium");
  check("briefFor(null) → null", briefFor(null) === null && briefFor({}) === null);
}

const failed = R.filter(([s]) => s === "FAIL");
for (const [s, n] of R) console.log(`${s}  ${n}`);
console.log(`\n${R.length - failed.length}/${R.length} passed`);
process.exit(failed.length ? 1 : 0);
