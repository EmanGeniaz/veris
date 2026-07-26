/* ── AI Central — role lens config ──────────────────────────────────
   One control plane, a role-specific lens. Each role gets a framing
   question, a hero metric, portfolio KPIs and a set of table columns
   over the SAME initiative portfolio (real acInitiatives). RBAC module
   access comes from AC_RBAC (lib/platform-models); the rail dims + locks
   the modules a role can't open. Column accessors take a live initiative
   and return a string, or [text, colorKey] to render as a pill. */

const money = v => parseFloat(String(v).replace(/[^0-9.]/g, "")) || 0;
const riskKey = r => (r === "Critical" || r === "High") ? "crit" : r === "Medium" ? "warn" : "ink3";
const lifeKey = l => ["Scaling"].includes(l) ? "good" : ["Production", "Pilot"].includes(l) ? "gold" : ["Completed"].includes(l) ? "ink3" : ["Retired"].includes(l) ? "crit" : "info";
const govKey = g => g >= 85 ? "good" : g >= 70 ? "warn" : "crit";
const pct = n => `${n}%`;

/* Shared column builders over a live initiative record. */
const cName = ["Initiative", i => i.name];
const cStage = ["Stage", i => [i.lifecycle, lifeKey(i.lifecycle)]];
const cUnit = ["Business unit", i => i.unit];
const cRisk = ["Risk", i => [i.risk, riskKey(i.risk)]];
const cValue = ["Value at stake", i => i.expected];
const cRealized = ["Realized", i => i.actual];
const cGuard = ["Guardrail", i => [pct(i.guardrail), govKey(i.guardrail)]];
const cGov = ["Governance", i => [pct(i.guardrail), govKey(i.guardrail)]];
const cAdopt = ["Adoption", i => [pct(i.adoption), i.adoption >= 60 ? "good" : i.adoption >= 40 ? "warn" : "crit"]];
const cHealth = ["Health", i => String(i.valueScore)];
const cOwner = ["Owner", i => i.sponsor];

export const AC_LENS = {
  ceo: {
    question: "“Should I worry?” — value at stake and what’s ready to scale.",
    hero: ["$4.1M", "Portfolio value", "realized of $17.5M expected"],
    kpis: [["Ready to scale", "2", "good", "1 needs your gate"], ["Enterprise health", "78", "good", "weighted"], ["High-risk", "2", "crit", "of the portfolio"], ["Blocked", "1", "warn", "Resolution Copilot"]],
    cols: [cName, cStage, cValue, cHealth],
  },
  coo: {
    question: "“Can we deliver and operate this?” — delivery status and adoption.",
    hero: ["71%", "Straight-through", "across live programs"],
    kpis: [["Delivery on track", "3/4", "good", "1 at risk"], ["Adoption", "61%", "warn", "4 units"], ["Blocked", "1", "crit", "evidence overdue"], ["Go-live this Q", "2", "info", "pending readiness"]],
    cols: [cName, cStage, cAdopt, cOwner],
  },
  cfo: {
    question: "“Is this investment creating value?” — expected vs realized and health.",
    hero: ["+22%", "Portfolio ROI", "$4.6M realized of $8.0M"],
    kpis: [["Invested", "$8.0M", "gold", "FY26"], ["Realized", "$4.6M", "good", "57%"], ["Value at risk", "$2.1M", "warn", "no value yet"], ["Reforecast", "2", "crit", "programs"]],
    cols: [cName, cValue, cRealized, cHealth],
  },
  chro: {
    question: "“Is the workforce ready?” — adoption and enablement by unit.",
    hero: ["61%", "Workforce adoption", "2,790 people"],
    kpis: [["Adoption", "61%", "good", "4 units"], ["Below threshold", "1", "crit", "People team"], ["Reskilling", "410", "good", "of 750"], ["Sentiment", "+64", "good", "net"]],
    cols: [cName, cUnit, cAdopt, cHealth],
  },
  ciso: {
    question: "“Can I trust this AI?” — guardrail coverage, risk and evidence.",
    hero: ["79", "Security posture", "2,410 attacks blocked"],
    kpis: [["Guardrail coverage", "86%", "info", "production models"], ["Guardrail gaps", "2", "warn", "2 models"], ["Open incidents", "1", "crit", "P1 prompt-injection"], ["Sec evidence", "82%", "good", "of lifecycle"]],
    cols: [cName, cRisk, cGuard, cHealth],
  },
  caio: {
    question: "“Is this AI responsible and governed?” — the full control plane.",
    hero: ["72", "Governance score", "/100 · all modules"],
    kpis: [["Governance score", "72", "good", "+4 QoQ"], ["Active initiatives", "4", "info", "2 high-risk"], ["Approvals pending", "3", "warn", "need decisions"], ["Evidence", "84%", "good", "of lifecycle"]],
    cols: [cName, cStage, cGov, cRisk],
  },
  cio: {
    question: "“Will this integrate and scale?” — platform readiness and adoption.",
    hero: ["99.94%", "Platform uptime", "models under gateway"],
    kpis: [["Models in prod", "14", "info", "of 21"], ["p95 latency", "420ms", "good", "SLO 600ms"], ["Cost / 1k calls", "$1.90", "warn", "+14% MoM"], ["Integrations", "23", "gold", "1 degraded"]],
    cols: [cName, cStage, cGuard, cAdopt],
  },
  cdpo: {
    question: "“Does this protect personal information?” — data, risk and residency.",
    hero: ["9/11", "DPIA coverage", "2 Art.22 systems"],
    kpis: [["DPIA coverage", "9/11", "gold", "systems"], ["Art.22 systems", "2", "warn", "automated decisions"], ["Consent", "98%", "good", "documented"], ["Privacy incidents", "0", "good", "30d"]],
    cols: [cName, cUnit, cRisk, cGuard],
  },
  cgo: {
    question: "“Can this legally operate?” — governance, risk and audit readiness.",
    hero: ["88%", "Controls effective", "21 of 24"],
    kpis: [["Controls effective", "88%", "good", "21/24"], ["Open findings", "5", "warn", "2 high"], ["Evidence", "84%", "good", "lifecycle"], ["Frameworks", "5", "info", "aligned"]],
    cols: [cName, cGov, cRisk, cStage],
  },
  manager: {
    question: "“How are my team’s initiatives doing?” — the programs your team runs.",
    hero: ["2", "My team’s initiatives", "Customer Operations"],
    kpis: [["Team initiatives", "2", "info", "in flight"], ["On track", "1", "good", "1 blocked"], ["Team adoption", "64%", "warn", "14/22 active"], ["Approvals", "5", "warn", "waiting on you"]],
    cols: [cName, cStage, cAdopt, cOwner],
    filter: i => /customer/i.test(i.unit),
  },
  employee: {
    question: "“What am I working on, and what’s next?” — your initiatives and tasks.",
    hero: ["2", "My active initiatives", "1 task due today"],
    kpis: [["My initiatives", "2", "info", "contributing"], ["My tasks", "3", "warn", "1 due today"], ["Guardrail saves", "1", "gold", "this week"], ["Learning", "78%", "warn", "safe-use"]],
    cols: [cName, cStage, cAdopt, cOwner],
    filter: i => /customer/i.test(i.unit),
  },
};

export const acLensFor = role => AC_LENS[role] || AC_LENS.caio;
