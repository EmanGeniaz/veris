/* ── Role Command Centers — config data ─────────────────────────────
   Each role gets a distinct lens (hero metric, attention, KPIs, panels)
   and a set of sidebar surfaces. Rendered by components/platform/
   rolecenters.jsx and wired into the sidebar via core.jsx. Names/titles
   come from ROLES; this holds the role-specific governance content.

   Colour keys: good warn crit info violet teal gold ink3.
   Block types: kpis · attn · bars · table · scores · report · actions ·
   library · picker · text. A table cell may be [text, colorKey] → pill. */

const P = (eye, h3, rows, extra = {}) => ({ t: "bars", eye, h3, rows, ...extra });
const TB = (eye, h3, head, rows, linkKind) => ({ t: "table", eye, h3, head, rows, ...(linkKind ? { linkKind } : {}) });
/* Explicit KPI lineage — a metric that answers ITS OWN question, not a
   generic initiative rollup. Attached as the 5th element of a KPI item;
   rows are {name, v, unit} the drawer lists under "what rolls into this". */
const LN = (formula, rows, note) => ({ formula, rows: rows.map(r => Array.isArray(r) ? { name: r[0], v: r[1], unit: r[2] } : r), note });
/* Register block — a deep, drill-in list. Each item carries its owning
   project (with projectId → the initiative it maps to), owner, timeline
   and an action / treatment plan surfaced in the drill-in drawer. */
const RG = (eye, h3, kindLabel, items) => ({ t: "register", eye, h3, kindLabel, items });

/* CISO incidents — each linked to the AI system it hit, with a response plan. */
const CISO_INCIDENTS = [
  { ref: "INC-1042", title: "Prompt-injection attempt blocked at gateway", project: "Customer Resolution Copilot", projectId: "ai-001",
    severity: ["P1 · Critical", "crit"], status: ["Investigating", "info"], owner: "Omar Khan · CISO office", detected: "Today 09:14", due: "Contain < 4h",
    summary: "A crafted prompt tried to override system instructions on the Resolution Copilot and exfiltrate customer context. The gateway prompt-shield blocked it; forensics are open to confirm no data left the boundary.",
    plan: [["Confirm gateway block held across all sessions", "good"], ["Pull 24h prompt logs for the attacker signature", "warn"], ["Add detector rule for the observed pattern", "ink3"], ["Brief CAIO + close with evidence pack", "ink3"]],
    timeline: [["09:14", "Injection attempt detected & blocked at gateway"], ["09:20", "P1 opened, CISO office paged"], ["09:41", "Forensics started on prompt logs"]] },
  { ref: "INC-1039", title: "Model drift → integrity risk on fraud signals", project: "Fraud Detection Model", projectId: "ai-002",
    severity: ["P2 · High", "warn"], status: ["Mitigating", "warn"], owner: "D. Osei · Model Risk", detected: "Yesterday 14:30", due: "Mitigate < 48h",
    summary: "Population drift on transaction features pushed the fraud model outside its validated envelope, risking degraded detection and integrity of downstream decisions.",
    plan: [["Freeze auto-actioning on low-confidence scores", "good"], ["Trigger retraining on the last 30d window", "warn"], ["Re-run bias + performance eval before promote", "ink3"]],
    timeline: [["1d ago", "Drift monitor breached threshold"], ["1d ago", "P2 opened, auto-action throttled"]] },
  { ref: "INC-1030", title: "Anomalous inference volume from single tenant", project: "Supplier Risk Screener", projectId: null,
    severity: ["P3 · Medium", "info"], status: ["Triage", "ink3"], owner: "SecOps on-call", detected: "2d ago", due: "Assess < 5d",
    summary: "A 6x spike in inference calls from one business unit — possible abuse or a runaway batch job. Under triage to classify before rate-limit changes.",
    plan: [["Identify calling service & intent", "warn"], ["Apply temporary rate-limit if abuse confirmed", "ink3"]],
    timeline: [["2d ago", "Volume anomaly flagged by monitor"]] },
];
/* CISO vulnerabilities — each with the asset it sits on and a remediation plan. */
const CISO_VULNS = [
  { ref: "VUL-318", title: "Unauthenticated inference endpoint on staging model", project: "Workforce Skills Navigator", projectId: "ai-004",
    severity: ["Critical", "crit"], status: ["Patching", "warn"], owner: "Platform Security", detected: "3d ago", due: "Patch < 24h",
    summary: "A staging deployment exposed an inference path without auth, allowing unapproved queries against the model. No production data is reachable, but the path must be closed before pilot exit.",
    plan: [["Take the staging endpoint offline", "good"], ["Add mTLS + token auth to the inference gateway", "warn"], ["Scan for other unauthenticated paths", "ink3"], ["Re-test and record evidence", "ink3"]],
    timeline: [["3d ago", "Found in red-team sweep"], ["2d ago", "Endpoint isolated from prod network"]] },
  { ref: "VUL-311", title: "Verbose error messages leak schema hints", project: "Customer Resolution Copilot", projectId: "ai-001",
    severity: ["High", "warn"], status: ["Fix ready", "good"], owner: "App Security", detected: "1w ago", due: "Deploy this sprint",
    summary: "Stack traces returned to callers exposed internal field names that could aid an attacker mapping the data model. Fix is code-reviewed and staged.",
    plan: [["Suppress stack traces in prod responses", "good"], ["Deploy behind this sprint's release gate", "warn"]],
    timeline: [["1w ago", "Reported by pen-test"], ["3d ago", "Fix merged, awaiting release"]] },
  { ref: "VUL-305", title: "Weak redaction on prompt-log retention", project: "AI Gateway (shared)", projectId: null,
    severity: ["Medium", "info"], status: ["Planned", "ink3"], owner: "Data Protection", detected: "2w ago", due: "Next cycle",
    summary: "Prompt logs retained PII fragments that the redaction pass missed for certain formats. Scoped for the next hardening cycle with CDPO.",
    plan: [["Extend redaction patterns to the missed formats", "ink3"], ["Backfill-scrub existing retained logs", "ink3"]],
    timeline: [["2w ago", "Identified in DLP audit"]] },
];

/* Normalized security events (incidents + vulnerabilities), exported so the
   Risk Center can show the events related to a given risk / initiative. */
export const SECURITY_EVENTS = [
  ...CISO_INCIDENTS.map(x => ({ ref: x.ref, title: x.title, kind: "Incident", projectId: x.projectId, project: x.project, severity: x.severity, status: x.status })),
  ...CISO_VULNS.map(x => ({ ref: x.ref, title: x.title, kind: "Vulnerability", projectId: x.projectId, project: x.project, severity: x.severity, status: x.status })),
];

export const ROLE_CENTERS = {

  /* ══════════ COO — Operations ══════════ */
  coo: {
    label: "Operations Command Center", navHd: "Operations",
    thesis: "The COO's lens: how much of the value chain runs itself, and where throughput breaks.",
    greet: "Operations are running hot",
    sub: "18% efficiency lift YTD — 1 automation blocked, one SLA at risk, capacity tight in Retail Ops.",
    hero: ["34%", "Value chain automated", "straight-through +12pts YTD"],
    attn: [
      ["Onboarding automation blocked", "KYC model awaiting bias sign-off — 3-day slip to go-live.", "Escalate", "crit", "coo_automation"],
      ["SLA at risk — Claims", "Cycle-time drifting to 34h vs 24h target as volume spikes.", "Rebalance capacity", "warn", "coo_sla"],
      ["Capacity — Retail Ops", "Agent augmentation at 92% utilisation; hiring or automation needed.", "Open plan", "info", "coo_capacity"],
    ],
    kpis: [ ["Automation coverage","34%","gold","of eligible processes", LN("automated share of eligible processes; per-process coverage shown", [["Customer onboarding","78%","KYC/AML"],["Claims processing","62%","claims"],["Payments ops","71%","payments"],["Servicing & support","48%","support"],["Back-office recon","88%","recon"]], "Overall 34% weights every eligible process; see Process Automation.")], ["Straight-through","71%","good","+12pts YTD", LN("current STP rate vs FY start", [["FY25 start","59%","baseline"],["Current","71%","+12pts"]], "71% of volume completes with no manual touch; see the Throughput & SLA table.")], ["Cost-to-serve","−18%","good","vs FY25 baseline", LN("Σ cost-reduction drivers vs FY25", [["Automation labour savings","−11%","largest"],["Fewer reworks & incidents","−5%","quality"],["Vendor & licence optimization","−2%","spend"]], "Drivers sum to −18% vs FY25; see Value & ROI.")], ["Avg cycle-time","−26%","good","across 9 flows", LN("avg cycle-time reduction across 9 flows", [["Onboarding","−31%","fastest"],["Payments","−34%","fastest"],["Servicing","−21%","flow"],["Claims","−18%","slowest"]], "Representative flows average −26%; see the Throughput & SLA table.")], ["Ops adoption","64%","warn","4 business units", LN("avg adoption across 4 business units", [["Payments","78%","On track"],["Onboarding","71%","On track"],["Servicing","55%","Watch"],["Claims","52%","At risk"]], "Unit-level adoption averages 64%; see the Throughput & SLA table.")], ["Operational incidents","3","warn","this month · 0 breach", LN("count of ops incidents this month; 0 SLA breach", [["Claims — SLA slip","1","At risk"],["Servicing — latency","1","Watch"],["Payments — retry spike","1","On track"]], "Three incidents, none breaching SLA; see the Throughput & SLA table.")] ],
    panels: [
      P("AI across the value chain", "Automation coverage by process", [["Customer onboarding", "KYC/AML", 78, "good"], ["Claims processing", "", 62, "gold"], ["Payments ops", "", 71, "good"], ["Servicing & support", "", 48, "warn"], ["Back-office recon", "", 88, "good"]], { legend: [["On target", "good"], ["Ramping", "gold"], ["Below target", "warn"]] }),
      TB("Throughput & SLA by function", "Where flow is healthy vs breaking", ["Function", "Throughput", "SLA", "Trend"], [["Onboarding", "1,240/wk", ["On track", "good"], "▲"], ["Claims", "880/wk", ["At risk", "warn"], "▼"], ["Payments", "3,100/wk", ["On track", "good"], "▲"], ["Servicing", "2,050/wk", ["Watch", "info"], "▬"]]),
    ],
    surfaces: [
      { id: "coo_playbook", label: "Operations Playbook", sub: "Operating strategy, change plans and the runbooks that keep AI operations governed.", blocks: [
        { t: "text", eye: "Operating strategy", h3: "AI in operations — the plan", body: "Automate the highest-volume, lowest-variance flows first; keep a human gate on customer-impacting decisions; scale automation only past an SLA-stability bar." },
        TB("Change & rollout plan", "Operating changes in flight", ["Change", "Function", "Wave", "Status"], [["Auto-triage tickets", "Servicing", "Wave 3", ["Ready", "good"]], ["Straight-through claims", "Claims", "Wave 4", ["Blocked", "crit"]], ["Onboarding KYC", "Onboarding", "Wave 3", ["Pilot", "info"]]]) ] },
      { id: "coo_automation", label: "Process Automation", sub: "Every automation, its coverage, and the human gate that governs it.", blocks: [
        P("Automation coverage", "By process", [["Customer onboarding", "", 78, "good"], ["Claims processing", "", 62, "gold"], ["Payments ops", "", 71, "good"], ["Servicing & support", "", 48, "warn"], ["Back-office recon", "", 88, "good"]]),
        TB("Automation register", "Coverage · human gate · owner", ["Process", "Coverage", "Human gate", "Owner"], [["Onboarding KYC", "78%", ["Required", "info"], "Ops-1"], ["Claims", "62%", ["Required", "info"], "Ops-2"], ["Recon", "88%", ["Sampled", "good"], "Ops-3"]]) ] },
      { id: "coo_sla", label: "Performance & SLAs", sub: "Throughput, cycle-time and SLA adherence across operations.", blocks: [
        { t: "kpis", items: [["SLA adherence", "94%", "good", "rolling 30d"], ["Avg cycle-time", "−26%", "good", "vs baseline"], ["Throughput", "7.3k/wk", "info", "across flows"], ["Rework rate", "4.1%", "warn", "target <3%"]] },
        TB("SLA by function", "Adherence & trend", ["Function", "Target", "Actual", "Status"], [["Onboarding", "24h", "19h", ["On track", "good"]], ["Claims", "24h", "34h", ["Breach risk", "warn"]], ["Payments", "4h", "3h", ["On track", "good"]]]) ] },
      { id: "coo_capacity", label: "Workforce Capacity", sub: "Human-in-the-loop capacity and where AI augmentation relieves load.", blocks: [
        P("Capacity & augmentation", "Utilisation by team", [["Retail Ops", "", 92, "crit"], ["Claims", "", 84, "warn"], ["Payments", "", 68, "good"], ["Servicing", "", 74, "good"]], { legend: [["Healthy", "good"], ["Stretched", "warn"], ["At limit", "crit"]] }) ] },
      { id: "coo_risk", label: "Operational Risk", sub: "Operational and process risk introduced by AI in the value chain.", blocks: [
        TB("Operational risk register", "Highest exposure first", ["Risk", "Process", "Grade", "Treatment"], [["Automation error cascade", "Claims", ["High · 8", "warn"], ["Mitigate", "info"]], ["Model drift → mis-route", "Servicing", ["Medium · 6", "info"], ["Monitor", "good"]], ["Capacity failure", "Retail Ops", ["High · 7", "warn"], ["Mitigate", "info"]]]) ] },
      { id: "coo_reports", label: "Reports", sub: "Build an operations report by dimension and export.", blocks: [
        { t: "report", eye: "Report builder", h3: "Operations report", dims: ["By function", "Automation coverage", "SLA & throughput", "Capacity", "Operational risk", "By time"] } ] },
    ],
  },

  /* ══════════ CFO — Finance ══════════ */
  cfo: {
    label: "Financial Command Center", navHd: "Finance",
    thesis: "The CFO's lens: every dollar in, the value out, and where money leaks before it returns.",
    greet: "The AI book is net-positive",
    sub: "$4.6M realized of $8.0M invested — ROI +22%, but $2.1M is consumed ahead of value and 2 programs need a reforecast.",
    hero: ["+22%", "Portfolio ROI", "$4.6M realized · payback 14mo"],
    attn: [
      ["Budget overrun — Resolution Copilot", "Consumed 83% of budget at 17% of value. Reforecast proposed.", "Open reforecast", "crit", "cfo_budget"],
      ["Value-at-risk — Q3", "$1.9M allocated ahead of realized value across 2 programs.", "Reallocate", "warn", "cfo_risk"],
      ["Run-rate rising", "Inference + licensing run-rate up 14% MoM as usage scales.", "Review cost", "info", "cfo_cost"],
    ],
    kpis: [ ["AI investment","$8.0M","gold","FY26 allocated", LN("capital allocated across programs (portfolio $8.0M)", [["Credit Decision","$2.2M","invested"],["Resolution Copilot","$1.8M","invested"],["Fraud Detection","$1.4M","invested"],["Finance Close Automation","$0.9M","invested"]], "Tracked programs shown; full $8.0M allocation in the ROI by program table.")], ["Value realized","$4.6M","good","57% to value", LN("Σ value realized; 57% of $8.0M allocated", [["Fraud Detection","$2.0M","realized"],["Finance Close Automation","$1.6M","realized"],["Resolution Copilot","$0.3M","realized"],["Credit Decision","$0.0M","pending"]], "Realized value is 57% of allocation; see the ROI by program table.")], ["Value leaked","$2.1M","warn","consumed, no value", LN("invested − value realized on underperformers", [["Resolution Copilot","$1.8M in / $0.3M out","−12%"],["Credit Decision","$2.2M in / $0.0M out","pending"]], "$2.1M consumed without return, concentrated here; see the ROI by program table.")], ["ROI","+22%","good","portfolio blended", LN("Σ value ÷ Σ invested − 1 (blended)", [["Finance Close Automation","+78%","6mo"],["Fraud Detection","+43%","9mo"],["Resolution Copilot","−12%","—"],["Credit Decision","Pending","—"]], "Blended portfolio ROI +22%; see the ROI by program table.")], ["Run-rate cost","$310K/mo","info","compute+licences+people", LN("Σ monthly run-rate by category", [["Compute / inference","44%","~$136K"],["Model & SaaS licensing","31%","~$96K"],["People / delivery","18%","~$56K"],["Data & tooling","7%","~$22K"]], "Categories sum to $310K/mo; see Run-rate cost breakdown.")], ["Payback","14 mo","ink3","avg · fastest 6mo", LN("avg months to recoup; fastest 6mo", [["Finance Close Automation","6mo","fastest"],["Fraud Detection","9mo","realized"],["Resolution Copilot","—","pending"],["Credit Decision","—","pending"]], "Portfolio averages 14mo incl. pending programs; see the ROI by program table.")] ],
    panels: [
      TB("ROI by program", "Investment · realized · ROI · payback", ["Program", "Budget", "Realized", "ROI", "Payback"], [["Finance Close Automation", "$0.9M", "$1.6M", ["+78%", "good"], "6mo"], ["Fraud Detection", "$1.4M", "$2.0M", ["+43%", "good"], "9mo"], ["Resolution Copilot", "$1.8M", "$0.3M", ["−12%", "warn"], "—"], ["Credit Decision", "$2.2M", "$0.0M", ["Pending", "ink3"], "—"]]),
      P("Where the money goes", "Run-rate cost breakdown", [["Compute / inference", "", 44, "gold"], ["Model & SaaS licensing", "", 31, "info"], ["People / delivery", "", 18, "violet"], ["Data & tooling", "", 7, "teal"]]),
    ],
    surfaces: [
      { id: "cfo_portfolio", label: "Investment Portfolio", sub: "Every AI investment, its stage and its financial return.", blocks: [
        TB("Investment portfolio", "Budget · consumed · realized", ["Program", "Budget", "Consumed", "Realized", "State"], [["Finance Close", "$0.9M", "$0.9M", "$1.6M", ["Returning", "good"]], ["Fraud Detection", "$1.4M", "$1.4M", "$2.0M", ["Returning", "good"]], ["Resolution Copilot", "$1.8M", "$1.5M", "$0.3M", ["At risk", "warn"]], ["Credit Decision", "$2.2M", "$1.9M", "$0.0M", ["Pre-value", "info"]]]) ] },
      { id: "cfo_value", label: "Value & ROI", sub: "Realized value, ROI and time-to-value across the book.", blocks: [
        { t: "kpis", items: [["Value realized", "$7.3M", "good", "74% to value"], ["Realized / invested", "84%", "good", "per $ spent"], ["Consumed, no value", "$2.3M", "warn", "pre-payload programs"], ["Avg TTV", "6.2mo", "info", "fastest 4.2 · slowest 9.8"]] },
        TB("ROI by program", "Return & payback", ["Program", "Realized", "ROI", "TTV"], [["Finance Close", "$1.6M", ["+78%", "good"], "5.1mo"], ["Fraud Detection", "$2.0M", ["+43%", "good"], "6.4mo"], ["Resolution Copilot", "$0.3M", ["−12%", "warn"], "9.8mo"]]) ] },
      { id: "cfo_cost", label: "Cost & Run-rate", sub: "The monthly cost of running AI — compute, licensing, people.", blocks: [
        P("Run-rate breakdown", "Monthly $310K", [["Compute / inference", "", 44, "gold"], ["Model & SaaS licensing", "", 31, "info"], ["People / delivery", "", 18, "violet"], ["Data & tooling", "", 7, "teal"]]),
        { t: "kpis", items: [["Run-rate", "$310K/mo", "info", "+14% MoM"], ["Cost / 1k calls", "$1.90", "warn", "up on volume"], ["Committed spend", "$2.4M", "gold", "remaining FY"]] } ] },
      { id: "cfo_budget", label: "Budget & Forecast", sub: "Budget vs actual and the rolling reforecast.", blocks: [
        TB("Budget vs actual", "By program", ["Program", "Budget", "Actual", "Variance"], [["Finance Close", "$0.9M", "$0.9M", ["0%", "good"]], ["Resolution Copilot", "$1.8M", "$1.5M", ["83% used · under review", "warn"]], ["Credit Decision", "$2.2M", "$1.9M", ["On plan", "good"]]]) ] },
      { id: "cfo_risk", label: "Financial Risk", sub: "Value-at-risk and the financial exposure of the AI book.", blocks: [
        TB("Financial risk register", "Exposure & mitigation", ["Risk", "Program", "Exposure", "Action"], [["Value never realized", "Resolution Copilot", ["$1.5M", "crit"], ["Reforecast", "info"]], ["Cost overrun", "Portfolio", ["$0.4M", "warn"], ["Routing optim", "good"]], ["Vendor lock-in", "Portfolio", ["Medium", "info"], ["Second-source", "good"]]]) ] },
      { id: "cfo_reports", label: "Reports", sub: "Build a financial report by dimension and export.", blocks: [
        { t: "report", eye: "Report builder", h3: "Financial report", dims: ["Value & ROI", "Cost & run-rate", "Budget vs actual", "By program", "Payback", "Financial risk"] } ] },
    ],
  },

  /* ══════════ CHRO — Workforce ══════════ */
  chro: {
    label: "Workforce Command Center", navHd: "People & Workforce",
    thesis: "The CHRO's lens: is AI augmenting people and lifting skills, or leaving teams behind.",
    greet: "The workforce is adopting — unevenly",
    sub: "61% adoption across 2,790 people, sentiment +64 net, but the People team is below threshold and 340 roles need reskilling plans.",
    hero: ["61%", "Workforce AI adoption", "2,790 people · sentiment +64"],
    attn: [
      ["Reskilling gap — 340 roles", "Roles with >40% task automation lack an active reskilling path.", "Open pipeline", "crit", "chro_skills"],
      ["Adoption below threshold — People", "31% adoption; enablement program needed this quarter.", "Launch enablement", "warn", "chro_adoption"],
      ["Role-impact assessment due", "Skills Navigator expansion needs a workforce-impact review.", "Start review", "info", "chro_impact"],
    ],
    kpis: [ ["Adoption","61%","good","4 business units", LN("headcount-weighted adoption across functions", [["Finance · 380","79%","good"],["Customer Ops · 1,240","64%","good"],["Retail Banking · 910","42%","warn"],["People · 260","31%","crit"]], "Weighted across 4 functions; see Adoption & augmentation by function.")], ["Reskilled (YTD)","410","good","of 750 target", LN("reskilled to date vs 750 target", [["Reskill — augmented roles","410","38% · Priority"],["Data literacy","540","44%"],["Prompt & tooling fluency","980","61%"],["AI governance & safe-use","1,240","73%"]], "410 of 750 reskilled, led by the augmented-role track; see the Skills & reskilling pipeline.")], ["Roles augmented","1,180","info","vs 60 displaced", LN("Σ headcount × adoption (augmented) vs 60 displaced", [["Customer Ops","1,240 hc","64%"],["Retail Banking","910 hc","42%"],["Finance","380 hc","79%"],["People","260 hc","31%"]], "1,180 roles augmented against 60 displaced; see Adoption & augmentation by function.")], ["Training completion","73%","warn","safe-use", LN("completion of safe-use training track", [["AI governance & safe-use — completed","73%","1,240 enrolled"],["Remaining in progress","27%","to complete"]], "Safe-use completion at 73%; see the Skills & reskilling pipeline.")], ["Sentiment","+64","good","net · 1,140 responses", LN("% positive − % negative (net), n=1,140", [["Positive","74%","promoters"],["Neutral","16%","passive"],["Negative","10%","detractors"]], "Net +64 from 1,140 responses; see the engagement survey.")], ["People-risk","Low","good","ethics + displacement", LN("composite of ethics + displacement risk", [["Ethics & safe-use","Low","73% trained"],["Displacement","Low","60 vs 1,180 augmented"],["Adoption equity","Watch","People fn 31%"]], "Composite people-risk rated Low; see Adoption & augmentation by function.")] ],
    panels: [
      P("Adoption & augmentation by function", "With headcount in each unit", [["Customer Ops · 1,240", "", 64, "good"], ["Finance · 380", "", 79, "good"], ["Retail Banking · 910", "", 42, "warn"], ["People · 260", "", 31, "crit"]], { legend: [["On target", "good"], ["Enablement needed", "warn"], ["Below threshold", "crit"]] }),
      TB("Skills & reskilling pipeline", "Building capability where AI changes the work", ["Skill track", "Enrolled", "Complete", "Status"], [["AI governance & safe-use", "1,240", "73%", ["On track", "good"]], ["Prompt & tooling fluency", "980", "61%", ["Ramping", "gold"]], ["Data literacy", "540", "44%", ["Behind", "warn"]], ["Reskill — augmented roles", "410", "38%", ["Priority", "crit"]]]),
    ],
    surfaces: [
      { id: "chro_playbook", label: "Workforce Playbook", sub: "Workforce AI strategy — augmentation-first, reskilling, responsible use.", blocks: [
        { t: "text", eye: "Workforce strategy", h3: "Augment, don't replace", body: "Every automated task pairs with a reskilling path; no role is displaced without a transition plan; adoption is enabled, not mandated." } ] },
      { id: "chro_adoption", label: "Adoption & Enablement", sub: "Who's adopting AI, with headcount, and where enablement is needed.", blocks: [
        P("Adoption by function", "With headcount", [["Customer Ops · 1,240", "", 64, "good"], ["Finance · 380", "", 79, "good"], ["Retail Banking · 910", "", 42, "warn"], ["People · 260", "", 31, "crit"]]) ] },
      { id: "chro_skills", label: "Skills & Reskilling", sub: "The reskilling pipeline for roles AI is changing.", blocks: [
        TB("Reskilling pipeline", "Tracks & progress", ["Track", "Enrolled", "Complete", "Status"], [["Governance & safe-use", "1,240", "73%", ["On track", "good"]], ["Prompt fluency", "980", "61%", ["Ramping", "gold"]], ["Data literacy", "540", "44%", ["Behind", "warn"]], ["Augmented-role reskill", "410", "38%", ["Priority", "crit"]]]) ] },
      { id: "chro_impact", label: "Role Impact", sub: "How AI changes each role — augmented vs displaced.", blocks: [
        TB("Role-impact register", "Task automation & transition", ["Role family", "Tasks automated", "Impact", "Plan"], [["Customer service", "38%", ["Augmented", "good"], ["Reskill", "info"]], ["Back-office", "62%", ["High change", "warn"], ["Transition", "warn"]], ["Analysis", "24%", ["Augmented", "good"], ["Uplift", "good"]]]) ] },
      { id: "chro_sentiment", label: "Sentiment & Feedback", sub: "How people feel about AI at work.", blocks: [
        { t: "kpis", items: [["Net sentiment", "+64", "good", "1,140 responses"], ["Trust in AI tools", "72%", "good", "+8pts"], ["Concern — job security", "18%", "warn", "monitored"], ["Enablement ask", "Top 1", "info", "core-system integration"]] } ] },
      { id: "chro_reports", label: "Reports", sub: "Build a workforce report by dimension and export.", blocks: [
        { t: "report", eye: "Report builder", h3: "Workforce report", dims: ["Adoption", "Reskilling", "Role impact", "Sentiment", "By function", "Responsible use"] } ] },
    ],
  },

  /* ══════════ CISO — Security ══════════ */
  ciso: {
    label: "Security Command Center", navHd: "AI Security",
    thesis: "The CISO's lens: the AI attack surface — what's being thrown at it, what got through, what's exposed.",
    greet: "Posture is holding, one active P1",
    sub: "Security posture 79/100, 2,410 attacks blocked this quarter, but a prompt-injection P1 is open and 2 models have guardrail gaps.",
    hero: ["79", "AI security posture", "/100 · 2,410 attacks blocked"],
    attn: [
      ["P1 — prompt-injection in progress", "Injection attempt on Resolution Copilot blocked at gateway; forensics open.", "Open incident", "crit", "ciso_incidents"],
      ["Critical vuln — model endpoint", "Unauthenticated inference path on a staging model. Patch pending.", "Assign fix", "crit", "ciso_vuln"],
      ["Guardrail gap — 2 models", "Output filtering not enforced on Skills Navigator + Supplier Screener.", "Enforce", "warn", "ciso_guardrails"],
    ],
    kpis: [["Security posture","79","good","/100 · +3 QoQ",LN("Σ pillar scores ÷ 4",[["Threat defense",82,"pts"],["Vulnerability posture",70,"pts"],["Data protection",90,"pts"],["Guardrail coverage",74,"pts"]],"Composite trust score averaged across security pillars; see the Security Posture center.")],["Threats blocked","2,410","gold","prompt-inj · jailbreak",LN("Σ attempts blocked by vector, 30d",[["Prompt injection",1240,"blocked"],["Jailbreak / policy evasion",690,"blocked"],["Sensitive-data exfiltration",320,"blocked"],["Model DoS / abuse",160,"blocked"]],"Blocks summed across attack vectors; see the Threat Center.")],["Open vulnerabilities","3","warn","1 critical · 1 high",LN("Σ open vulns by severity",[["Critical",1,"model endpoint"],["High",1,"model endpoint"],["Medium",1,"open"]],"One critical and one high sit on model endpoints; see the Incident & vulnerability queue.")],["Data-leak events","0","good","30d · monitors green",LN("Σ confirmed leak events by channel, 30d",[["Model output / API",0,"events"],["Email / egress",0,"events"],["Storage / exfiltration",0,"events"]],"All DLP monitors green with zero confirmed leaks; see the Data-leak monitors.")],["Guardrail coverage","86%","info","of production models",LN("traffic-weighted Σ(model coverage) ÷ production models",[["Fraud Detection v3",96,"% covered"],["Resolution Copilot",88,"% covered"],["Skills Navigator",62,"% covered"],["Supplier Screener",58,"% covered"]],"Production-weighted so high-traffic models dominate; see the Model Registry guardrail view.")],["MTTR","3.1h","good","P1 mean-time-to-respond",LN("Σ response phases (P1 mean)",[["Detect",0.4,"h"],["Triage",0.9,"h"],["Contain & respond",1.8,"h"]],"Mean across P1 incidents such as INC-1042; see the Incident & vulnerability queue.")]],
    panels: [
      P("AI threat surface", "Attempts blocked by vector (30d)", [["Prompt injection", "", 1240, "crit"], ["Jailbreak / policy evasion", "", 690, "warn"], ["Sensitive-data exfiltration", "", 320, "info"], ["Model DoS / abuse", "", 160, "violet"]], { raw: true }),
      RG("Incident & vulnerability queue", "Ranked by severity — click any row to drill in", "Item", [CISO_INCIDENTS[0], CISO_VULNS[0], CISO_VULNS[1], CISO_INCIDENTS[1]]),
    ],
    surfaces: [
      { id: "ciso_enforce", label: "Veris Enforce", sub: "The enforcement plane — every agent tool call decided at runtime, deny-by-default.", blocks: [
        { t: "text", eye: "Enforcement", h3: "Governance that actually enforces", body: "Policy → enforcement → evidence in one control set. Every agent tool call is decided at call time — capability tokens, egress and human-in-the-loop — and signed into a tamper-evident ledger." } ] },
      { id: "ciso_authority", label: "Agent Authority", sub: "Short-lived, scoped capability tokens — no agent holds a standing key.", blocks: [
        { t: "text", eye: "Least privilege", h3: "Tokens, not standing keys", body: "To call a tool an agent must be issued a scoped, short-lived capability token; issuance runs the least-privilege boundary first, so ungranted or high-stakes calls never mint a token." } ] },
      { id: "ciso_ledger", label: "Tool-Call Ledger", sub: "Prove what agents were allowed to do — and what they actually did.", blocks: [
        { t: "text", eye: "Evidence", h3: "Tamper-evident tool-call record", body: "Every tool call is a signed row — the authorised grant beside the actual call — hash-chained so altering any row breaks every later one. The Art.12 / ISO 42001 audit artifact." } ] },
      { id: "ciso_mcp", label: "MCP Registry", sub: "Supply-chain control — pin tool manifests by hash, catch rug-pulls.", blocks: [
        { t: "text", eye: "Supply chain", h3: "Catch the rug-pull before an agent binds", body: "MCP servers are third-party code that can change under you. Manifests are pinned by hash at approval and signed; any server whose current manifest hash no longer matches the pinned one is quarantined before an agent can be issued a token against its tools." } ] },
      { id: "ciso_threat", label: "Threat Center", sub: "The live AI attack surface by vector.", blocks: [
        P("Attempts blocked by vector", "Last 30 days", [["Prompt injection", "", 1240, "crit"], ["Jailbreak", "", 690, "warn"], ["Data exfiltration", "", 320, "info"], ["Model DoS", "", 160, "violet"]], { raw: true }) ] },
      { id: "ciso_workflows", label: "Workflow Permissions", sub: "Least privilege across multi-agent workflows.", blocks: [
        { t: "text", eye: "Autonomy", h3: "Agents can't escalate through a workflow", body: "Every step in a multi-agent chain is re-checked against that agent's own capabilities; high-stakes steps escalate to human approval and privilege-escalation attempts are blocked at the gateway." } ] },
      { id: "ciso_incidents", label: "AI Incidents", badge: "3", sub: "Security incidents from ServiceNow / SIEM — each linked to its AI system, with a response plan.", blocks: [
        RG("Open incident queue", "Every incident traces to its AI system, owner and response plan", "Incident", CISO_INCIDENTS) ] },
      { id: "ciso_vuln", label: "Vulnerabilities", sub: "Open vulnerabilities across models, endpoints and pipelines — with the asset and remediation plan.", blocks: [
        RG("Vulnerability register", "Every finding traces to its asset, owner and remediation plan", "Vulnerability", CISO_VULNS) ] },
      { id: "ciso_guardrails", label: "Guardrails & Controls", sub: "Guardrail and control coverage by production model.", blocks: [
        P("Guardrail coverage by model", "Input/output filtering, rate-limits, logging", [["Fraud Detection v3", "", 96, "good"], ["Resolution Copilot", "", 88, "good"], ["Skills Navigator", "", 62, "warn"], ["Supplier Screener", "", 58, "warn"]], { legend: [["Enforced", "good"], ["Gap", "warn"]] }) ] },
      { id: "ciso_redteam", label: "Red-Team", sub: "Adversarial testing results and coverage.", blocks: [
        { t: "kpis", items: [["Models red-teamed", "11/14", "good", "this quarter"], ["Findings", "9", "warn", "3 fixed · 6 open"], ["Jailbreak resistance", "84%", "good", "eval score"], ["Next campaign", "Q4", "info", "high-risk models"]] } ] },
      { id: "ciso_reports", label: "Reports", sub: "Build a security report by dimension and export.", blocks: [
        { t: "report", eye: "Report builder", h3: "Security report", dims: ["Threat surface", "Incidents", "Vulnerabilities", "Guardrail coverage", "Red-team", "By model"] } ] },
    ],
  },

  /* ══════════ CIO — Technology ══════════ */
  cio: {
    label: "Technology Command Center", navHd: "AI Platform",
    thesis: "The CIO's lens: is the AI platform reliable, fast, affordable and well-integrated.",
    greet: "The platform is stable",
    sub: "AI services 99.94% uptime, 14 models in production, but inference cost per call is up 14% and one integration is degraded.",
    hero: ["99.94%", "AI service uptime", "30d · SLO 99.9%"],
    attn: [
      ["Integration degraded — core banking", "Latency on the payments connector up 3×; retries climbing.", "Investigate", "crit", "cio_integrations"],
      ["Inference cost spike", "Cost/call +14% MoM as Copilot traffic grows — routing review.", "Optimise routing", "warn", "cio_gateway"],
      ["Model deprecation — 30d", "Two models on an end-of-life provider version; migration due.", "Plan migration", "info", "cio_registry"],
    ],
    kpis: [["Service uptime","99.94%","good","30d rolling",LN("composite availability across gateway & model-ops, 30d",[["Gateway availability",99,"% avail"],["Model routing success",97,"% avail"],["Guardrail middleware",95,"% avail"],["Data pipelines",90,"% avail"]],"Weighted composite of critical-path subsystems; see the Platform Health status page.")],["Inference latency","420ms","good","p95 · SLO 600ms",LN("Σ p95 latency by stage",[["Gateway / routing",40,"ms"],["Model inference",330,"ms"],["Guardrail middleware",50,"ms"]],"p95 budget split across the request path; see Observability traces.")],["Cost / 1k calls","$1.90","warn","+14% MoM",LN("Σ cost components per 1k calls",[["Model compute / GPU",1.30,"$"],["Tokens / API",0.40,"$"],["Guardrail & egress",0.20,"$"]],"Increase driven by compute up 14% MoM; see the FinOps cost explorer.")],["Models in prod","14","info","of 21 registered",LN("in-production ÷ registered = 14 ÷ 21",[["Healthy / serving",12,"models"],["On watch — Resolution Copilot",1,"models"],["Deprecating — RecoEngine",1,"models"]],"Fourteen of twenty-one registered models serve production; see the Model Registry.")],["Integrations","23","gold","1 degraded · 22 healthy",LN("Σ integrations by health",[["Healthy",22,"connectors"],["Degraded — core banking",1,"connectors"]],"Only core banking is degraded; see the Integrations center.")],["Platform incidents","2","good","30d · 0 SEV1",LN("Σ incidents by severity, 30d",[["SEV1",0,"incidents"],["SEV2",1,"incidents"],["SEV3",1,"incidents"]],"No SEV1 in the window; see the Incident queue.")]],
    panels: [
      P("Gateway & model-ops health", "Signal health across the control plane", [["Gateway availability", "", 99, "good"], ["Model routing success", "", 97, "good"], ["Guardrail middleware", "", 95, "good"], ["Eval / drift pipeline", "", 82, "warn"], ["Data pipelines", "", 90, "good"]]),
      TB("Model registry & lifecycle", "Production models & their state", ["Model", "Use", "Version", "State"], [["Fraud Detection", "Retail Banking", "v3", ["Healthy", "good"]], ["Resolution Copilot", "Customer Ops", "v2", ["Watch · latency", "warn"]], ["Finance Close", "Finance", "v4", ["Healthy", "good"]], ["RecoEngine", "Retail Banking", "v2", ["Deprecating", "crit"]]]),
    ],
    surfaces: [
      { id: "cio_health", label: "Platform Health", sub: "Uptime, latency and the health of the AI control plane.", blocks: [
        P("Control-plane health", "Signal availability", [["Gateway", "", 99, "good"], ["Routing", "", 97, "good"], ["Guardrails", "", 95, "good"], ["Eval/drift", "", 82, "warn"], ["Pipelines", "", 90, "good"]]),
        { t: "kpis", items: [["Uptime", "99.94%", "good", "30d"], ["p95 latency", "420ms", "good", "SLO 600ms"], ["Error rate", "0.06%", "good", "of calls"]] } ] },
      { id: "cio_registry", label: "Model Registry", sub: "Every model, its version and lifecycle state.", blocks: [
        TB("Model registry", "Production & staged models", ["Model", "Use", "Version", "State"], [["Fraud Detection", "Retail Banking", "v3", ["Healthy", "good"]], ["Resolution Copilot", "Customer Ops", "v2", ["Watch", "warn"]], ["Finance Close", "Finance", "v4", ["Healthy", "good"]], ["RecoEngine", "Retail Banking", "v2", ["Deprecating", "crit"]]]) ] },
      { id: "cio_gateway", label: "Gateway & Routing", sub: "How inference is routed, guarded and rate-limited.", blocks: [
        { t: "kpis", items: [["Routing success", "97%", "good", "primary→fallback"], ["Guardrail hits", "2,410", "gold", "blocked upstream"], ["Rate-limit events", "38", "info", "30d"], ["Providers", "4", "violet", "multi-model"]] } ] },
      { id: "cio_integrations", label: "Integrations", sub: "Systems AI connects to and their health.", blocks: [
        TB("Integration map", "Connectors & status", ["System", "Type", "Latency", "Status"], [["Core banking", "Payments", "1.9s", ["Degraded", "crit"]], ["ServiceNow", "ITSM", "240ms", ["Healthy", "good"]], ["CRM", "Customer", "310ms", ["Healthy", "good"]], ["Data lake", "Data", "180ms", ["Healthy", "good"]]]) ] },
      { id: "cio_cost", label: "Cost & Performance", sub: "The performance and unit-cost of inference.", blocks: [
        P("Cost & performance", "By workload", [["Resolution Copilot", "", 44, "warn"], ["Fraud Detection", "", 26, "good"], ["Finance Close", "", 18, "good"], ["Other", "", 12, "info"]], { legend: [["Efficient", "good"], ["Optimise", "warn"]] }) ] },
      { id: "cio_reports", label: "Reports", sub: "Build a platform report by dimension and export.", blocks: [
        { t: "report", eye: "Report builder", h3: "Platform report", dims: ["Uptime & latency", "Model registry", "Gateway & routing", "Integrations", "Cost & performance", "Incidents"] } ] },
    ],
  },

  /* ══════════ CDPO — Privacy ══════════ */
  cdpo: {
    label: "Privacy Command Center", navHd: "Data Protection",
    thesis: "The CDPO's lens: where personal data flows through AI, and whether every use is lawful, consented and contained.",
    greet: "Privacy is compliant, watch two items",
    sub: "92% privacy compliance across 11 personal-data systems, but a DPIA is overdue and 3 subject-rights requests approach SLA.",
    hero: ["92%", "Privacy compliance", "DPIA coverage 9/11 systems"],
    attn: [
      ["DPIA overdue — Skills Navigator", "Processes employee data with profiling; DPIA past due.", "Complete DPIA", "crit", "cdpo_dpia"],
      ["Subject-rights SLA — 3 requests", "Two erasure + one access request near the 30-day limit.", "Action requests", "warn", "cdpo_consent"],
      ["Data residency — APAC", "Predictive Maintenance logs routed outside region; review.", "Review transfer", "info", "cdpo_datamap"],
    ],
    kpis: [["Privacy compliance","92%","good","GDPR + local",LN("data-volume-weighted Σ regional compliance",[["EMEA · London, Frankfurt",96,"% compliant"],["Americas · NYC, São Paulo",90,"% compliant"],["APAC · Singapore, Sydney",78,"% compliant"]],"Weighted by processing volume so EMEA dominates; see Personal-data processing by region.")],["DPIA coverage","9/11","gold","systems assessed",LN("assessed ÷ in-scope systems = 9 ÷ 11",[["Assessed",9,"systems"],["DPIA due — incl. Skills Navigator",2,"systems"]],"Two systems remain outstanding including Skills Navigator; see DPIA & Assessments.")],["Art.22 systems","2","warn","automated decisions",LN("count of legal/significant-effect systems",[["Credit Decision",1,"legal effect"],["Skills Navigator",1,"significant"]],"Fraud Detection is limited-effect and excluded; see the Automated-decision register.")],["Consent / lawful basis","98%","good","documented",LN("documented ÷ processing activities",[["Documented lawful basis",98,"%"],["Pending documentation",2,"%"]],"Nearly all activities carry a recorded lawful basis; see the Consent & Lawful-basis register.")],["Subject-rights (open)","3","warn","SLA 30d · 0 breached",LN("Σ open requests by type",[["Erasure",2,"requests"],["Access",1,"requests"]],"All three near the 30-day SLA with none breached; see the Subject-Rights (DSAR) queue.")],["Privacy incidents","0","good","30d · 1 near-miss",LN("confirmed incidents, 30d",[["Confirmed incidents",0,"events"],["Near-miss — PRV-204",1,"logged"]],"Zero confirmed with one logged near-miss; see the Privacy incident log.")]],
    panels: [
      TB("Automated-decision register", "Art.22 systems & their safeguards", ["System", "Data", "Decision effect", "Safeguard"], [["Credit Decision", "Financial", ["Legal effect", "crit"], ["Human review", "good"]], ["Skills Navigator", "Employee", ["Significant", "warn"], ["DPIA due", "warn"]], ["Fraud Detection", "Transactional", ["Limited", "info"], ["Logged + review", "good"]]]),
      P("Personal-data processing by region", "Systems & residency compliance", [["EMEA · London, Frankfurt", "", 96, "good"], ["Americas · NYC, São Paulo", "", 90, "good"], ["APAC · Singapore, Sydney", "", 78, "warn"]], { legend: [["Compliant", "good"], ["Review", "warn"]] }),
    ],
    surfaces: [
      { id: "cdpo_playbook", label: "Privacy Playbook", sub: "Privacy-by-design strategy for AI systems.", blocks: [
        { t: "text", eye: "Privacy strategy", h3: "Lawful, minimal, contained", body: "No personal data enters an AI system without a lawful basis and a completed DPIA where profiling or automated decisions apply; data stays in-region unless a transfer mechanism is documented." } ] },
      { id: "cdpo_dpia", label: "DPIA & Assessments", sub: "Data-protection impact assessments across AI systems.", blocks: [
        TB("DPIA register", "Coverage & status", ["System", "Personal data", "Profiling", "DPIA"], [["Credit Decision", "Financial", "Yes", ["Complete", "good"]], ["Skills Navigator", "Employee", "Yes", ["Overdue", "crit"]], ["Fraud Detection", "Transactional", "No", ["Complete", "good"]], ["Resolution Copilot", "Contact", "No", ["Complete", "good"]]]) ] },
      { id: "cdpo_datamap", label: "Data Map & Residency", sub: "Where personal data lives and flows, by region.", blocks: [
        P("Processing by region", "Residency compliance", [["EMEA", "", 96, "good"], ["Americas", "", 90, "good"], ["APAC", "", 78, "warn"]]),
        TB("Transfers", "Cross-border data flows", ["Flow", "Mechanism", "Status"], [["EU → US (Copilot)", "SCCs + TIA", ["Valid", "good"]], ["APAC logs → EU", "Under review", ["Review", "warn"]]]) ] },
      { id: "cdpo_consent", label: "Consent & Rights", sub: "Lawful basis, consent and subject-rights requests.", blocks: [
        { t: "kpis", items: [["Lawful basis", "98%", "good", "documented"], ["Consent coverage", "94%", "good", "where required"], ["Open SAR/erasure", "3", "warn", "SLA 30d"], ["Avg response", "11d", "good", "within SLA"]] } ] },
      { id: "cdpo_incidents", label: "Privacy Incidents", sub: "Privacy incidents and near-misses.", blocks: [
        TB("Privacy incident log", "Severity & status", ["Ref", "Event", "Severity", "Status"], [["PRV-204", "PII near-miss in prompt logs", ["Near-miss", "info"], ["Closed", "good"]], ["PRV-198", "Over-retention flagged", ["Low", "ink3"], ["Remediating", "warn"]]]) ] },
      { id: "cdpo_reports", label: "Reports", sub: "Build a privacy report by dimension and export.", blocks: [
        { t: "report", eye: "Report builder", h3: "Privacy report", dims: ["Compliance", "DPIA coverage", "Data map & residency", "Consent & rights", "Incidents", "Art.22 register"] } ] },
    ],
  },

  /* ══════════ CGO — Governance / Board ══════════ */
  cgo: {
    label: "Governance & Board Center", navHd: "Enterprise Governance",
    thesis: "The CGO's lens: is the enterprise governed, defensible to regulators, and ready for the board.",
    greet: "Board-ready, two gaps to close",
    sub: "Governance maturity 74/100, 24 policies in force, but 3 controls are ineffective and the Q3 board pack is due in 6 days.",
    hero: ["74", "Governance maturity", "/100 · board-ready 82%"],
    attn: [
      ["Board pack due — 6 days", "Q3 governance report consolidating risk, compliance & value.", "Assemble pack", "crit", "cgo_reports"],
      ["Control gap — 3 ineffective", "Model-validation + access-review controls failing test.", "Remediate", "warn", "cgo_policies"],
      ["Policy review overdue", "Acceptable-use policy past its review cycle by 12 days.", "Review & ratify", "info", "cgo_policies"],
    ],
    kpis: [["Governance maturity","74","good","/100 · +5 YoY",LN("Weighted mean of 5 governance domains, indexed /100",[["Board & council cadence","88","/100"],["Policy lifecycle","76","/100"],["Control library","84","/100"],["Risk management","70","/100"],["Audit & assurance","68","/100"]],"Domains are weighted, not a flat mean; see Governance operating model.")],["Policies in force","24","gold","3 overdue review",LN("Σ in-cycle + overdue = 24",[["Within review cycle","21","policies"],["Overdue review","3","policies"]],"Split by review status; see the Policy Register.")],["Control effectiveness","88%","good","21 of 24 effective",LN("21 ÷ 24 = 88%",[["Effective","21","controls"],["Not yet effective","3","controls"]],"Per-control ratings live in the Control library.")],["Open audit findings","5","warn","2 high · closing",LN("Σ by severity = 5",[["High","2","findings"],["Medium / low","3","findings"]],"Severity and remediation status; see Audit & assurance.")],["Regulatory posture","Strong","good","5 frameworks",LN("Mean framework coverage ≈ 85% → Strong",[["EU AI Act","84%","coverage"],["ISO 42001","81%","coverage"],["ISO 27001","90%","coverage"],["NIST AI RMF","77%","coverage"],["GDPR","92%","coverage"]],"Coverage per framework; see Regulatory & framework posture.")],["Enterprise risk","Moderate","warn","score 12/25",LN("Likelihood × impact = 12 ÷ 25",[["Likelihood","3","1-5"],["Impact","4","1-5"]],"Inherent-to-residual scoring detail; see the Risk Register.")]],
    panels: [
      TB("Regulatory & framework posture", "Where the enterprise stands", ["Framework", "Type", "Coverage", "Status"], [["EU AI Act", "Regulation", "High-risk", ["84%", "good"]], ["ISO 42001", "AI mgmt", "Enterprise", ["81%", "gold"]], ["ISO 27001", "Security", "Enterprise", ["90%", "good"]], ["NIST AI RMF", "Framework", "All AI", ["77%", "good"]], ["GDPR", "Regulation", "Personal data", ["92%", "good"]]]),
      { t: "scores", eye: "Governance operating model", h3: "Health of the governance engine", ring: 74, rows: [["Board & council cadence", 88, "good"], ["Policy lifecycle", 76, "good"], ["Control library", 84, "good"], ["Risk management", 70, "warn"], ["Audit & assurance", 68, "warn"]] },
    ],
    surfaces: [
      { id: "cgo_forum", label: "Governance Forum", sub: "One converged data + AI governance forum.", blocks: [
        { t: "text", eye: "Convergence", h3: "Unified governance forum", body: "One senior forum owning policy, risk tiering, exceptions and escalation across data + AI." } ] },
      { id: "cgo_incidents", label: "Incident Playbook", sub: "One response playbook across every incident class.", blocks: [
        { t: "text", eye: "Convergence", h3: "Converged incident response", body: "One playbook spanning breaches, model failures, harmful outputs and regulatory notifications." } ] },
      { id: "cgo_crosswalk", label: "Convergence Crosswalk", sub: "32 capabilities mapped across all four instruments.", blocks: [
        { t: "text", eye: "Convergence", h3: "One control set, not four", body: "Each capability is one control, evidenced by one artifact, satisfying the EU AI Act, NIST AI RMF, ISO/IEC 42001 and Singapore's Model AI Governance Framework at once." } ] },
      { id: "cgo_redlines", label: "Prohibited Practices", sub: "The eight EU AI Act Art. 5 red lines, screened.", blocks: [
        { t: "text", eye: "Scope · stop", h3: "Where the answer is stop, not control", body: "Every system is screened against the eight prohibited practices before any risk tiering — including emotion recognition at work, the red line that catches ordinary enterprises." } ] },
      { id: "cgo_gpai", label: "GPAI Exposure", sub: "The accidental-provider test (Art. 53/55).", blocks: [
        { t: "text", eye: "The edges", h3: "Did you become a provider by accident?", body: "Modify a general-purpose model and share it beyond the team that modified it, and you may hold provider obligations under Articles 53 and 55 — with no procurement or board decision ever taken." } ] },
      { id: "cgo_gapclosure", label: "Gap Closure", sub: "The last crosswalk gaps, owned and evidenced.", blocks: [
        { t: "text", eye: "Convergence complete", h3: "From gap to owned control", body: "The five capabilities the crosswalk last flagged as gaps are now owned closures — two operational, three in-flight pending a live finding. No unowned gaps remain across the 32 capabilities." } ] },
      { id: "cgo_jurisdictions", label: "Jurisdiction Atlas", sub: "Which regimes bind the enterprise, and where.", blocks: [
        { t: "text", eye: "Scope", h3: "Many regimes, one control set", body: "Each regime self-flags Applies / Monitor / Out of scope from where the estate operates, with effective dates and penalty exposure — and maps to the shared 32-capability crosswalk." } ] },
      { id: "cgo_soa", label: "ISO 42001 Readiness", sub: "Statement of Applicability + certification readiness.", blocks: [
        { t: "text", eye: "Assurance", h3: "The SoA an auditor reads first", body: "Every Annex A control — applicable, justified, evidenced — plus certification readiness by management-system clause, built around what an auditor actually asks for." } ] },
      { id: "cgo_freshness", label: "Evidence Freshness", sub: "Stale-flag every artifact past its review date.", blocks: [
        { t: "text", eye: "Assurance", h3: "Fresh evidence, not last year's", body: "Every evidence artifact carries a review cadence; anything past its review date is flagged Stale so it surfaces without being hunted for." } ] },
      { id: "cgo_glossary", label: "Governance Glossary", sub: "Every term of art, in plain language.", blocks: [
        { t: "text", eye: "Reference", h3: "So the platform stands alone", body: "Every acronym and concept an executive, auditor or engineer will hit on a governance surface — searchable, categorised, in plain language." } ] },
      { id: "cgo_drift", label: "Drift Monitor", sub: "Automated behavioural-shift detection (PSI).", blocks: [
        { t: "text", eye: "Operate", h3: "Detect drift before it degrades decisions", body: "A Population Stability Index is computed per production model from baseline vs current distributions — the standard drift signal, mapped to EU AI Act Art.72 post-market monitoring." } ] },
      { id: "cgo_workflows", label: "Workflow Permissions", sub: "Least privilege across multi-agent workflows.", blocks: [
        { t: "text", eye: "Autonomy", h3: "An agent can't escalate through a workflow", body: "Every step in a multi-agent chain is re-checked against that agent's own capabilities (deny-by-default); high-stakes steps escalate to human approval and privilege-escalation attempts are blocked." } ] },
      { id: "cgo_art12", label: "Article 12 Log", sub: "Tamper-evident per-inference record-keeping.", blocks: [
        { t: "text", eye: "Assurance", h3: "The record a regulator reads", body: "Every gateway inference appends a structured, hash-chained event (SHA-256) — model, agent, tool, decision, data class, tokens — the automatic logging EU AI Act Art.12 requires." } ] },
      { id: "cgo_enforce", label: "Veris Enforce", sub: "The enforcement plane that closes the loop — policy → enforcement → evidence.", blocks: [
        { t: "text", eye: "Enforcement", h3: "Governance you can prove was enforced", body: "Enforce decides every agent tool call at runtime (deny-by-default, capability tokens, egress, HITL) and signs each decision into the same evidence chain the board reads — enforcement without governance is a firewall nobody can explain; this is both." } ] },
      { id: "cgo_ledger", label: "Tool-Call Ledger", sub: "Prove what agents were allowed to do — and what they actually did.", blocks: [
        { t: "text", eye: "Evidence", h3: "The audit artifact nobody else owns", body: "Every agent tool call is a signed, hash-chained row — authorised grant beside actual call — the record EU AI Act Art.12 and ISO 42001 push toward, that neither guardrail nor GRC vendors hold." } ] },
      { id: "cgo_mcp", label: "MCP Registry", sub: "AI supply-chain provenance — pinned, signed tool manifests.", blocks: [
        { t: "text", eye: "Supply chain", h3: "Provenance over the tool supply chain", body: "Every MCP server the estate depends on is signed by a trusted publisher and pinned by manifest hash; a rug-pulled server whose manifest drifts after approval is quarantined — the LLM03 supply-chain control an auditor asks for." } ] },
      { id: "cgo_playbook", label: "Governance Playbook", sub: "The enterprise governance operating model.", blocks: [
        { t: "text", eye: "Operating model", h3: "How the enterprise is governed", body: "A monthly governance council, quarterly board oversight, a living policy library and a tested control set — every AI system inherits this frame." } ] },
      { id: "cgo_policies", label: "Policies & Controls", sub: "Policy library health and control effectiveness.", blocks: [
        TB("Policy & control health — owner & next review", "In force · owner · effectiveness", ["Item", "Owner", "Status"], [["Acceptable-use policy", "CGO office · review overdue", ["Review overdue", "warn"]], ["Human-oversight policy", "CAIO office", ["In force", "good"]], ["Model-validation control", "Model Risk · D. Osei", ["Ineffective", "crit"]], ["Access-review control", "CISO office", ["Ineffective", "crit"]], ["Vendor-risk control", "Procurement · T. Brandt", ["Ineffective", "crit"]]]) ] },
      { id: "cgo_regulatory", label: "Regulatory Posture", sub: "Standing across every regulatory framework.", blocks: [
        TB("Framework posture", "Coverage & status", ["Framework", "Coverage", "Status"], [["EU AI Act", "High-risk", ["84%", "good"]], ["ISO 42001", "Enterprise", ["81%", "gold"]], ["ISO 27001", "Enterprise", ["90%", "good"]], ["NIST AI RMF", "All AI", ["77%", "good"]], ["GDPR", "Personal data", ["92%", "good"]]]) ] },
      { id: "cgo_board", label: "Board & Audit", sub: "Board reporting cadence and open audit findings.", blocks: [
        { t: "kpis", items: [["Board-readiness", "82%", "good", "Q3 pack"], ["Open findings", "5", "warn", "2 high"], ["Next board", "6 days", "info", "pack due"], ["Assurance coverage", "88%", "good", "controls tested"]] } ] },
      { id: "cgo_risk", label: "Enterprise Risk", sub: "The enterprise AI risk heatmap.", blocks: [
        TB("Enterprise risk register", "Top exposures", ["Risk", "Domain", "Grade", "Treatment"], [["Adverse-decision harm", "AI/Credit", ["High · 12", "crit"], ["Mitigate", "info"]], ["Regulatory non-conformity", "Compliance", ["Medium · 7", "warn"], ["Close gap", "good"]], ["Control failure", "Governance", ["Medium · 6", "warn"], ["Remediate", "info"]]]) ] },
      { id: "cgo_reports", label: "Reports", sub: "Assemble the board / audit pack.", blocks: [
        { t: "report", eye: "Report builder", h3: "Board & audit pack", dims: ["Governance maturity", "Regulatory posture", "Policies & controls", "Enterprise risk", "Audit findings", "By framework"] } ] },
    ],
  },

  /* ══════════ Employee — My AI Workspace (governance cockpit) ══════════
     The digital cockpit for one employee. Fifteen surfaces (Home = the
     Overview) answering: what AI may I use · how am I using it · am I
     creating value · am I creating risk · how can I improve. The assistant,
     usage and learning surfaces route to their bespoke pages via
     ROLE_PAGE_OVERRIDE; the rest render here. */
  employee: {
    label: "My AI Workspace", navHd: "My Workspace",
    thesis: "Your cockpit: what AI you can use, how you use it, the value you create, the risk you avoid, and how to improve.",
    greet: "You saved 6.2 hours this week",
    sub: "3 tasks due, 2 sessions in progress and 1 prompt pending approval — your AI productivity score is up 8 points.",
    hero: ["82", "AI productivity", "6.2h saved this week · +8"],
    attn: [
      ["2 tasks due today", "Validate an AI output and acknowledge the updated Data Handling policy.", "Open tasks", "crit", "emp_tasks"],
      ["1 prompt pending approval", "Your 'Customer email draft' prompt needs manager sign-off before reuse.", "Review", "warn", "emp_requests"],
      ["Training due Friday", "Secure AI Use refresher — 12 min — keeps your tool access active.", "Start", "info", "emp_learning"],
      ["A guardrail saved you", "PII auto-redacted from a support draft this week — nothing left your workspace.", "See event", "good", "emp_risk"],
    ],
    kpis: [
      ["AI productivity", "82", "good", "+8 this month", LN("weighted index of your governed AI activity", [["Hours saved", "6.2h", "this week"], ["Active use", "23 sessions", "this week"], ["Knowledge reuse", "61%", "answers enriched internally"], ["Safe use", "0 violations", "90 days"]], "Your productivity score blends how much you use AI, the time it saves you, how much you reuse governed knowledge and your safe-use record. Up 8 points this month.")],
      ["Hours saved", "6.2h", "good", "this week", LN("Σ time saved across your governed sessions this week", [["Drafting & writing", "2.4h", "39%"], ["Code assist", "1.8h", "29%"], ["Summarisation", "1.2h", "19%"], ["Knowledge search", "0.8h", "13%"]], "Time saved is estimated per governed session and summed for the week — 6.2h across four activity areas.")],
      ["Approved tools", "6", "info", "available to you", LN("AI tools cleared for your role & data class", [["Microsoft Copilot", "Internal · Low", "CIO"], ["GitHub Copilot", "Internal · Low", "CIO"], ["Claude (Enterprise)", "Confidential · Medium", "CAIO"], ["ChatGPT Enterprise", "Confidential · Medium", "CAIO"], ["Gemini Enterprise", "Internal · Low", "CIO"], ["Internal HR AI", "Restricted · Medium", "CHRO"]], "The six tools you're cleared to use, governed through the Gateway. Two more are restricted (owner approval) and three are blocked by policy — see AI Hub.")],
      ["Sessions", "23", "teal", "this week", LN("governed AI sessions through the Gateway this week", [["Claude (Enterprise)", "8", "sessions"], ["Microsoft Copilot", "6", "sessions"], ["ChatGPT Enterprise", "5", "sessions"], ["GitHub Copilot", "4", "sessions"]], "Every session routes through the Gateway with policy and evidence — 23 this week across four tools.")],
      ["Guardrail saves", "4", "gold", "this month", LN("guardrail interventions that protected you this month", [["Customer data in prompt", "Blocked", "Resolution Copilot · Aug 1"], ["Source code shared", "Warning", "Code review helper · Jul 30"], ["Financial forecast", "Approval", "Sales proposal · Jul 29"], ["Prompt injection", "Blocked", "Support chat · Jul 28"]], "Each is a moment the Gateway caught unsafe or non-compliant content before it left your workspace — see Risk & Compliance for the full record.")],
      ["Compliance", "On track", "good", "1 action open", LN("your policy, training and action standing", [["Policies acknowledged", "7 of 8", "Data Handling v4 outstanding"], ["Training", "82%", "on track"], ["Open actions", "1", "acknowledge Data Handling v4"], ["Violations", "0", "90 days"]], "On track means no overdue violations. One action is open — acknowledge Data Handling v4 — see Risk & Compliance.")],
    ],
    panels: [
      TB("Recent AI sessions", "Your last governed sessions", ["Session", "Tool", "Risk", "Outcome"], [["Draft release notes", "Claude", ["Low", "good"], ["Saved 40m", "good"]], ["Summarise incident", "Copilot", ["Low", "good"], ["Saved 25m", "good"]], ["Customer email draft", "ChatGPT Ent.", ["Med", "warn"], ["Redacted PII", "warn"]], ["Code review helper", "GitHub Copilot", ["Low", "good"], ["Saved 55m", "good"]]], "session"),
      P("Where you use AI", "By activity this month", [["Drafting & writing", "", 78, "good"], ["Code assist", "", 64, "good"], ["Summarisation", "", 52, "warn"], ["Knowledge search", "", 41, "warn"]]),
    ],
    surfaces: [
      { id: "emp_assistant", label: "My AI Assistant", sub: "Ask anything — routed through the AI Gateway with policy, redaction and evidence.", blocks: [
        { t: "text", eye: "My AI Assistant", h3: "One assistant, every approved model", body: "You don't pick the model — the Gateway routes your request to the right approved AI (Copilot, Claude, ChatGPT Enterprise, Gemini or an internal model), applies policy, redacts sensitive data and stores evidence. Ask, and it governs the rest." } ] },
      { id: "emp_hub", label: "AI Hub", sub: "The AI you're approved to use — your governed marketplace.", blocks: [
        { t: "kpis", items: [["Approved for you", "6", "good", "tools"], ["Restricted", "2", "warn", "need approval"], ["Blocked", "3", "crit", "not permitted"], ["Requests open", "1", "info", "pending"]] },
        TB("Approved AI catalogue — click a tool for its policy & how to get access", "Status · data class · risk · owner", ["Tool", "Status", "Data allowed", "Risk", "Owner"], [
          ["Microsoft Copilot", ["Approved", "good"], "Internal", ["Low", "good"], "CIO"],
          ["GitHub Copilot", ["Approved", "good"], "Internal", ["Low", "good"], "CIO"],
          ["Claude (Enterprise)", ["Approved", "good"], "Confidential", ["Medium", "warn"], "CAIO"],
          ["ChatGPT Enterprise", ["Approved", "good"], "Confidential", ["Medium", "warn"], "CAIO"],
          ["Gemini Enterprise", ["Approved", "good"], "Internal", ["Low", "good"], "CIO"],
          ["Internal HR AI", ["Approved", "good"], "Restricted", ["Medium", "warn"], "CHRO"],
          ["Finance AI", ["Restricted", "warn"], "Restricted", ["High", "crit"], "CFO"],
          ["Public ChatGPT", ["Blocked", "crit"], "None", ["High", "crit"], "CISO"]], "tool") ] },
      { id: "emp_projects", label: "My Initiatives", sub: "The enterprise AI initiatives you contribute to — and where you can propose a new one.", blocks: [
        { t: "newproject", eye: "Start something new", h3: "Propose a new AI initiative", body: "Have an idea for an AI initiative? Submit it here. New initiatives need your manager's approval before they become active and governed — so it goes to their queue first." },
        { t: "kpis", items: [["Assigned", "2", "info", "Resolution Copilot · Support Automation"], ["Evidence submitted", "7", "good", "prompt pack, model tests, DPIA inputs"], ["Open risks", "1", "warn", "on Resolution Copilot"], ["AI contribution", "High", "good", "Copilot rollout"]] },
        TB("Your initiatives", "Progress · your deliverable · evidence · open risk on your work", ["Initiative", "Progress", "Your deliverable", "Evidence", "Open risk"], [
          ["Resolution Copilot", ["Piloting", "info"], "Prompt pack (12 governed prompts)", ["Submitted", "good"], ["1 · PII redaction", "warn"]],
          ["Support Automation", ["Scaling", "good"], "Model test report", ["Submitted", "good"], "None"]]) ] },
      { id: "emp_tasks", label: "My Tasks", sub: "AI-assigned and governance work on your plate — each with why it matters, who raised it and what's next.", blocks: [
        { t: "actions", eye: "Your tasks", h3: "3 tasks · 2 due today", items: [
          [1, "crit", "Validate AI output — release notes", "Confirm the AI-drafted release notes are accurate before publish.", "Mark validated", "Flag issue",
            { by: "AI Gateway — auto-raised when AI drafted a customer-bound artifact", why: "Human oversight is mandatory before AI content ships externally (POL-DH-002, Art.14 human-in-the-loop). Publishing unverified is a reportable control gap.", next: "Mark validated → notes publish and evidence is minted. Flag issue → routes to your manager, Riley Chen.", ref: "Initiative: Q3 Release Notes · Policy POL-DH-002" }],
          [2, "warn", "Acknowledge policy — Data Handling v4", "Updated redaction rules apply to your workspace.", "Acknowledge", "Read policy",
            { by: "CDPO office (Niamh Lynch) — policy update pushed to all Confidential-data users", why: "Redaction rules changed; until you acknowledge, your access to Confidential-class tools is at risk of suspension.", next: "Acknowledge → access stays active and the ack is logged. Read policy → opens Data Handling v4 first.", wait: "Due now · access review Friday", ref: "Policy: Data Handling v4 (POL-DH-004)" }],
          [3, "info", "Complete training — Secure AI Use", "12-minute refresher, due Friday.", "Start", "Snooze",
            { by: "Assigned by your manager, Riley Chen (not self-initiated)", why: "Your Secure-AI-Use certification is expiring; it's required to keep sandbox and Confidential-tool access.", next: "Start → 12-min refresher; completion auto-logs as governance evidence and renews the cert.", wait: "Due Friday", ref: "Course: Secure AI Use · Governance Academy" }]] } ] },
      { id: "emp_usage", label: "How I'm doing", sub: "Where you stand — measured against your peers, your business unit and the whole org.", blocks: [
        { t: "text", eye: "How I'm doing", h3: "Your standing, not a score in a vacuum", body: "See where you stand on the things that matter — hours saved, active use, knowledge reuse and safe use — benchmarked against people who do your job, your business unit and the org, with the one move that would lift you." } ] },
      { id: "emp_risk", label: "Risk & Compliance", sub: "Your governance standing in one place — guardrail events, and your policies, training and actions.", blocks: [
        { t: "kpis", items: [["Guardrail saves", "4", "gold", "this month"], ["Blocks", "2", "crit", "unsafe prompts stopped"], ["Warnings", "2", "warn", "you resolved"], ["Your risk score", "Low", "good", "12/100"]] },
        TB("Guardrail events — explained", "Risk · where it happened · why & remediation", ["Risk detected", "Status", "Where · when", "Why & what to do"], [
          ["Customer data in prompt", ["Blocked", "crit"], "Resolution Copilot · Aug 1", "PII present — remove personal data before retrying (POL-DH-002)"],
          ["Source code shared", ["Warning", "warn"], "Code review helper · Jul 30", "Repository is Confidential — keep it in-tenant"],
          ["Financial forecast", ["Approval", "info"], "Sales proposal · Jul 29", "Manager approval needed before sharing"],
          ["Prompt injection", ["Blocked", "crit"], "Support chat · Jul 28", "Malicious instruction — session terminated, escalated to CISO"]]),
        { t: "kpis", items: [["Policies acknowledged", "7/8", "warn", "Data Handling v4 outstanding"], ["Training", "82%", "good", "on track"], ["Open actions", "1", "warn", "acknowledge Data Handling v4"], ["Violations", "0", "good", "90 days"]] },
        TB("Compliance record — what you owe & who set it", "Policy / item · who initiated it · status", ["Item", "Owner / scope", "Status", "Date"], [
          ["Responsible AI Policy v6", "CAIO office · org-wide", ["Acknowledged", "good"], "Feb 2026"],
          ["Data Handling v4", "CDPO office · org-wide", ["Outstanding", "warn"], "Due now"],
          ["Secure AI Use training", "Mgr · Riley Chen · you", ["In progress", "info"], "Due Fri"],
          ["GDPR basics", "Legal · org-wide", ["Complete", "good"], "Jan 2026"]]) ] },
      { id: "emp_learning", label: "Governance Academy", sub: "Your learning hub — courses, certifications and the training your role and activity require.", blocks: [
        { t: "text", eye: "Governance Academy", h3: "Learn to use AI safely and well", body: "Your learning path adapts to how you actually work — prompt engineering, responsible AI, secure use and role-specific skills. Completing it keeps your tool access active and becomes governance evidence automatically." } ] },
      { id: "emp_requests", label: "My Requests", sub: "Track the governance requests you've submitted — and where each one stands.", blocks: [
        { t: "actions", eye: "Your requests", h3: "Requests you've submitted", items: [
          [1, "warn", "New project — Support Insights Copilot", "Submitted to your manager for approval before it can start.", "Nudge approver", "Withdraw",
            { by: "You — self-initiated 2 days ago", why: "New AI initiatives can't be built until a manager owns the risk; approval opens a governed workspace with AIRA + evidence.", next: "Approved → it appears in My Initiatives and you can start. Declined → returns with a reason.", wait: "Manager Riley Chen · pending 2 days", ref: "Would become AI initiative · Customer Ops" }],
          [2, "warn", "Prompt approval — Customer email draft", "Awaiting your manager's sign-off before it's reusable.", "Nudge approver", "Withdraw",
            { by: "You — flagged by the Gateway as customer-facing", why: "Reusable prompts touching customer communications need sign-off so an approved, PII-safe version enters the shared library.", next: "Approved → prompt joins your Assistant's library for reuse. Declined → stays private to you.", wait: "Manager Riley Chen · pending 1 day", ref: "Prompt · linked to Resolution Copilot" }],
          [3, "info", "Tool access — Finance AI", "You requested access; pending CFO office review.", "View request", "Cancel",
            { by: "You — access request 3 days ago", why: "Finance AI is a Restricted-class system owned by Finance; access needs the data owner's approval, not your manager's.", next: "Granted → the tool appears in your AI Hub. Denied → you'll see the reason and any alternative.", wait: "CFO office (Elena Rossi) · pending 3 days", ref: "Tool: Finance AI · Restricted · owner CFO" }]] } ] },
      { id: "emp_reports", label: "My Reports", sub: "Build an evidence-grade report on your AI activity, then export it as PDF or Excel.", blocks: [
        { t: "report", eye: "Report builder", h3: "My AI report", dims: ["AI usage", "Hours saved & impact", "Tasks & requests", "Risk & compliance", "Training completed", "By activity", "By time"],
          completed: [["Responsible AI Foundations", "Completed Jun 2026"], ["Data Handling Level 2", "Completed Feb 2026"], ["Secure Prompting Basics", "Completed May 2026"]] } ] },
      { id: "emp_help", label: "Help", sub: "Guidance, safe-use answers and how to escalate.", blocks: [
        { t: "text", eye: "Help", h3: "Getting help", body: "Quick answers on safe AI use, why something was blocked, and how to request access or an exception. If you're stuck, escalate to your manager or the AI Governance Office from any blocked event." },
        { t: "library", items: [["Why was my prompt blocked?", "Understand guardrail decisions and how to retry safely.", "Guide", "info"], ["Request tool access", "How to request a restricted AI tool.", "Guide", "info"], ["Report an issue", "Flag an incorrect AI output or a guardrail problem.", "Action", "warn"], ["Contact governance", "Reach the AI Governance Office.", "Escalate", "violet"]] } ] },
    ],
  },

  /* ══════════ Manager — Team AI Workspace (team cockpit) ══════════
     The team-level parallel of the Employee Workspace: the same fifteen
     surfaces, aggregated for the people a manager leads — never their
     private prompts, only governed aggregates by policy. */
  manager: {
    label: "Team AI Workspace", navHd: "Team Workspace",
    thesis: "Your team's cockpit: what AI they use, how they use it, the value they create, the risk they carry, and what needs your sign-off.",
    greet: "Your team is 64% adopted",
    sub: "14 of 22 people active this week, 5 approvals waiting on you and team time-saved is up 21% — two members need enablement.",
    hero: ["64%", "Team AI adoption", "14/22 active · saved +21%"],
    attn: [
      ["5 approvals waiting", "Prompt sign-offs, a policy exception and tool-access requests need your decision.", "Review queue", "warn", "mgr_approvals"],
      ["2 members need enablement", "Below-threshold usage; a nudge or session would help.", "Open plan", "info", "mgr_tasks"],
      ["Team guardrail event", "A blocked prompt-injection attempt on the team this week — no data left.", "Review", "crit", "mgr_risk"],
      ["Team compliance gap", "3 members have an outstanding policy acknowledgement.", "Send reminder", "warn", "mgr_risk"],
    ],
    kpis: [
      ["Team adoption", "64%", "good", "14 of 22 active", LN("team members active on AI this week ÷ team size", [["L. Haddad", "High", "Analyst"], ["S. Kim", "High", "Specialist"], ["J. Okafor", "Medium", "Analyst"], ["R. Diaz", "Low", "Associate · below threshold"]], "14 of 22 people used AI through the Gateway this week. Two are below threshold — see Team roster to plan enablement.")],
      ["Time saved", "118h", "good", "team · month", LN("Σ time saved across the team's governed sessions this month", [["Response drafting", "44h", "37%"], ["Case summarisation", "31h", "26%"], ["Knowledge search", "24h", "20%"], ["QA & review", "19h", "16%"]], "118h saved this month across four activity areas, estimated per governed session — see Team Usage.")],
      ["Approvals", "5", "warn", "waiting on you", LN("governance decisions waiting on your sign-off", [["Prompt approval — Customer email draft", "L. Haddad", "pending 1d"], ["Policy exception — data retention", "S. Kim", "→ CDPO"], ["Tool access — model sandbox", "2 analysts", "pending 1d"], ["New project — Support Insights Copilot", "J. Okafor", "→ AI Central"], ["Scale gate — Support Automation", "pilot → scale", "with you"]], "Five decisions sit in your queue — open Approvals to action each with its context and routing.")],
      ["Team compliance", "86%", "warn", "3 outstanding", LN("team policy adherence — acknowledged ÷ required", [["Policies acknowledged", "86%", "3 members outstanding"], ["Training complete", "71%", "safe-use"], ["Open actions", "5", "across team"], ["Violations", "0", "90 days"]], "86% adherence; three members owe a Data Handling v4 acknowledgement — see Team Risk & Compliance.")],
      ["Guardrail saves", "9", "gold", "team · month", LN("guardrail interventions that protected the team this month", [["Unsafe prompts blocked", "2", "customer data / code"], ["Warnings resolved", "6", "coaching applied"], ["Prompt injection stopped", "1", "escalated to CISO"]], "Nine moments the Gateway caught unsafe or non-compliant content before it left the team — see Team Risk & Compliance.")],
      ["Usage cost", "$1.2K", "info", "this month", LN("team AI spend this month — compute + licences", [["ChatGPT Enterprise", "$0.5K", "14 users"], ["Claude (Enterprise)", "$0.4K", "12 users"], ["Microsoft Copilot", "$0.2K", "18 users"], ["GitHub Copilot", "$0.1K", "9 users"]], "$1.2K this month across four tools — about $54 per active user. See Team Usage for the tool mix.")],
    ],
    panels: [
      TB("Team roster & adoption", "Who's active, who needs a nudge", ["Member", "Role", "Adoption", "Compliance"], [["L. Haddad", "Analyst", ["High", "good"], ["OK", "good"]], ["J. Okafor", "Analyst", ["Med", "warn"], ["1 due", "warn"]], ["S. Kim", "Specialist", ["High", "good"], ["OK", "good"]], ["R. Diaz", "Associate", ["Low", "crit"], ["2 due", "crit"]]], "member"),
      P("Team AI usage", "Where the team applies AI", [["Response drafting", "", 82, "good"], ["Case summarisation", "", 68, "good"], ["Knowledge search", "", 54, "warn"], ["QA & review", "", 39, "warn"]]),
    ],
    surfaces: [
      { id: "mgr_assistant", label: "My AI Assistant", sub: "Your governed assistant — routed through the Gateway like everyone's.", blocks: [
        { t: "text", eye: "My AI Assistant", h3: "Draft, summarise, plan — governed", body: "Your prompts route through the Gateway with policy, redaction and evidence, exactly like your team's. Use it to prep reviews, summarise team output and draft plans." } ] },
      { id: "mgr_hub", label: "Team AI Hub", sub: "The AI your team is approved to use, and what needs your grant.", blocks: [
        { t: "kpis", items: [["Team-approved", "6", "good", "tools"], ["Awaiting your grant", "2", "warn", "requests"], ["Blocked", "3", "crit", "org policy"], ["Team spend", "$1.2K", "info", "this month"]] },
        TB("Team tool catalogue", "Status · adoption · owner", ["Tool", "Status", "Team adoption", "Owner"], [["Microsoft Copilot", ["Approved", "good"], "18/22", "CIO"], ["GitHub Copilot", ["Approved", "good"], "9/22", "CIO"], ["Claude (Enterprise)", ["Approved", "good"], "12/22", "CAIO"], ["ChatGPT Enterprise", ["Approved", "good"], "14/22", "CAIO"], ["Finance AI", ["Restricted", "warn"], "2/22", "CFO"], ["Public ChatGPT", ["Blocked", "crit"], "0/22", "CISO"]]) ] },
      { id: "mgr_projects", label: "Team Projects", sub: "The AI initiatives your team contributes to.", blocks: [
        { t: "kpis", items: [["Team initiatives", "2", "info", "in flight"], ["On track", "1", "good", "1 at risk"], ["Team evidence", "23", "good", "artifacts"], ["Open risks", "2", "warn", "team work"]] },
        TB("Team initiatives", "Progress · owner · risk", ["Initiative", "Progress", "Lead", "Risk"], [["Resolution Copilot", ["Piloting", "info"], "S. Kim", ["Medium", "warn"]], ["Support Automation", ["Scaling", "good"], "L. Haddad", ["Low", "good"]]]) ] },
      { id: "mgr_tasks", label: "Team Tasks", sub: "Governance work on your plate as a manager — each with why it matters, who raised it and what's next.", blocks: [
        { t: "actions", eye: "Team tasks", h3: "3 tasks · 1 overdue", items: [
          [1, "crit", "Chase policy acknowledgements", "3 team members have Data Handling v4 outstanding.", "Send reminder", "Escalate",
            { by: "CDPO office (Niamh Lynch) — cascaded to you as the people-manager of record", why: "Data Handling v4 changed redaction rules; unacknowledged members risk losing Confidential-tool access, and the gap counts against your team's compliance score (86%).", next: "Send reminder → nudges J. Okafor, R. Diaz and one other. Escalate → routes the overdue names to the CDPO office.", wait: "Overdue · access review Friday", ref: "Policy: Data Handling v4 (POL-DH-004) · 3 of 22 members" }],
          [2, "warn", "Enablement — R. Diaz", "Below-threshold usage; schedule a coaching session.", "Book session", "Snooze",
            { by: "Adoption engine — auto-flagged when a report stayed below the active-use threshold two weeks running", why: "R. Diaz is at Low adoption with 2 policies and safe-use training outstanding; left alone this becomes both a value gap and a compliance risk on your team.", next: "Book session → schedules a coaching slot and logs the enablement action. Snooze → defers 1 week, then re-flags.", wait: "No action logged yet · 2 weeks below threshold", ref: "Member: R. Diaz · Associate · 48% training" }],
          [3, "info", "Review team prompt library", "2 shared prompts due for a version review.", "Review", "Later",
            { by: "Prompt library — version-review timer on prompts last approved over the review window", why: "Shared prompts are reused team-wide; stale versions can drift from current policy, so approved prompts are re-reviewed on a cycle to keep the library trustworthy.", next: "Review → opens the two prompts to re-approve or request changes. Later → defers without changing their approved status.", wait: "Due this cycle", ref: "Prompt library · Incident summariser v2, Release-notes drafter v3" }]] } ] },
      { id: "mgr_usage", label: "Team Usage", sub: "Team analytics and impact — adoption, hours saved, cost, top skills and trend.", blocks: [
        { t: "text", eye: "Team Usage", h3: "Team usage and impact", body: "Adoption, hours saved, tokens, cost, most-used tools, top skills and the team's productivity trend — aggregates only, the measurable answer to whether AI is helping the team." } ] },
      { id: "mgr_risk", label: "Team Risk & Compliance", sub: "Your team's governance standing — guardrail events, plus the team's policies, training and actions.", blocks: [
        { t: "kpis", items: [["Guardrail saves", "9", "gold", "team month"], ["Blocks", "2", "crit", "unsafe prompts"], ["Warnings", "6", "warn", "resolved"], ["Team risk score", "Low", "good", "18/100"]] },
        TB("Team guardrail events", "Member · risk · status", ["Member", "Risk detected", "Status", "Action"], [["R. Diaz", "Customer data in prompt", ["Blocked", "crit"], "Coaching booked"], ["J. Okafor", "Source code shared", ["Warning", "warn"], "Resolved"], ["Unknown", "Prompt injection", ["Blocked", "crit"], "Escalated to CISO"]]),
        { t: "kpis", items: [["Team compliance", "86%", "warn", "3 outstanding"], ["Training complete", "71%", "warn", "safe-use"], ["Open actions", "5", "warn", "across team"], ["Violations", "0", "good", "90 days"]] },
        TB("Compliance by member", "Policies · training · actions", ["Member", "Policies", "Training", "Actions"], [["L. Haddad", ["8/8", "good"], "92%", ["0", "good"]], ["J. Okafor", ["7/8", "warn"], "74%", ["1", "warn"]], ["S. Kim", ["8/8", "good"], "90%", ["0", "good"]], ["R. Diaz", ["6/8", "crit"], "48%", ["2", "crit"]]]) ] },
      { id: "mgr_learning", label: "Team Academy", sub: "Team learning, the shared prompt library and team knowledge — one place to learn, reuse and reference.", blocks: [
        { t: "text", eye: "Team Academy", h3: "Learn, reuse and reference — as a team", body: "Track safe-use completion across the team and see who needs which training next. Alongside it, your shared Prompt Library (approved, reusable team prompts) and team Knowledge (permission-checked) live here too." },
        { t: "library", items: [
          ["Incident summariser", "Team standard for postmortems.", "Approved · v2", "good"],
          ["Meeting-notes cleaner", "Structures raw notes into actions.", "Approved · v4", "good"],
          ["Customer email draft", "Support reply from ticket context.", "Pending your approval", "warn"],
          ["Release-notes drafter", "Changelog → customer notes.", "Approved · v3", "good"]] },
        { t: "actions", eye: "Prompt approvals", h3: "Shared prompts pending your sign-off", items: [
          [1, "warn", "Approve prompt — Customer email draft (L. Haddad)", "Low-risk support prompt; redaction on. Approving makes it reusable team-wide.", "Approve", "Request changes"]] },
        { t: "library", items: [["Team runbooks", "Engineering SOPs & procedures.", "Team access", "good"], ["Responsible AI Policy v6", "Safe-use policy.", "Team access", "good"], ["Data Handling v4", "Classification rules.", "Team access", "good"], ["Customer contracts", "Restricted — legal only.", "No access", "crit"]] } ] },
      { id: "mgr_approvals", label: "Approvals", badge: "5", sub: "One inbox for team governance decisions — each with its context and where it routes.", blocks: [
        { t: "actions", eye: "Approvals queue", h3: "5 waiting on you", items: [
          [1, "warn", "Prompt approval — Customer email draft (L. Haddad)", "A support-reply prompt using ticket context; PII redaction is on. Approving makes it reusable team-wide and records evidence.", "Approve", "Decline",
            { by: "L. Haddad (Analyst) — submitted a shared prompt; Gateway flagged it customer-facing", why: "Reusable prompts that touch customer communications need a manager's sign-off so a PII-safe, approved version — not an ad-hoc one — enters the shared library.", next: "Approve → prompt joins the team library at v1 and evidence is minted. Decline → returns to L. Haddad with your reason; stays private.", wait: "Pending 1 day · with you", ref: "Prompt · linked to Resolution Copilot · redaction on" }],
          [2, "info", "Policy exception — extended data retention", "A 30-day retention waiver for a summarisation flow, above the standard 90-day rule. Routes to the CDPO office if approved.", "Approve", "Defer",
            { by: "S. Kim (Specialist) — requested on behalf of the Resolution Copilot pilot", why: "The flow needs 120-day retention to evaluate summary quality over a full quarter, beyond the standard 90-day rule; without the waiver the evaluation window is cut short.", next: "Approve → your sign-off routes to the CDPO office (Niamh Lynch) for final ratification and a dated exception record. Defer → holds for more detail.", wait: "Pending 2 days · then CDPO ratification", ref: "Initiative: Resolution Copilot · exception EXC-2026-014" }],
          [3, "warn", "Tool access — model sandbox (2 analysts)", "Two analysts requested sandbox access to prototype a workflow; access is time-boxed and logged.", "Grant", "Decline",
            { by: "L. Haddad and J. Okafor (Analysts) — joint request to prototype an automation", why: "Sandbox access lets them test a workflow against real models without touching production data; it's time-boxed and fully logged so the risk stays bounded.", next: "Grant → 30-day sandbox access for both, auto-expiring with an audit trail. Decline → returns with your reason.", wait: "Pending 1 day · with you", ref: "Tool: Model sandbox · time-boxed 30 days · 2 members" }],
          [4, "warn", "New project — Support Insights Copilot (J. Okafor)", "A proposed AI initiative from your team; approving files it into AI Central intake and creates the cross-functional facets.", "Approve", "Decline",
            { by: "J. Okafor (Analyst) — self-initiated proposal 2 days ago", why: "A new AI initiative can't be built until a manager owns the risk; your approval opens a governed workspace with an AI-risk assessment and evidence, and files it into AI Central intake.", next: "Approve → creates the initiative and its Legal/Risk/Security facets in AI Central. Decline → returns to J. Okafor with a reason.", wait: "Pending 2 days · with you", ref: "Would become AI initiative · Customer Ops" }],
          [5, "info", "Scale gate — Support Automation", "The pilot met its adoption and risk bar; approve to move it into the scaling wave with a governed decision record.", "Approve", "Hold",
            { by: "Gate engine — auto-raised when Support Automation cleared its pilot exit criteria", why: "The pilot hit its adoption (9/22) and residual-risk (Low) thresholds; moving to scale needs a manager's governed decision so the wave change is on the record, not implicit.", next: "Approve → advances it to the scaling wave with a dated decision record and notifies AI Central. Hold → keeps it in pilot pending your review.", wait: "Awaiting your decision · lead L. Haddad", ref: "Initiative: Support Automation · pilot → scale gate" }]] } ] },
      { id: "mgr_reports", label: "Team Reports", sub: "Build a team report by dimension and export.", blocks: [
        { t: "report", eye: "Report builder", h3: "Team report", dims: ["Team adoption", "Time saved & impact", "Approvals", "Team risk & compliance", "By member", "By time"] } ] },
      { id: "mgr_help", label: "Help", sub: "Guidance for you and your team, and how to escalate.", blocks: [
        { t: "text", eye: "Help", h3: "Getting help", body: "Guidance on approvals, coaching under-adopting members, why prompts are blocked, and how to escalate to the AI Governance Office." },
        { t: "library", items: [["Coach an under-adopter", "How to lift a team member's safe, effective AI use.", "Guide", "info"], ["Handle an approval", "What each approval type means and how to decide.", "Guide", "info"], ["Escalate an incident", "Route a serious guardrail event to governance.", "Escalate", "violet"]] } ] },
    ],
  },

  /* ══════════ CRO — Enterprise Risk ══════════ */
  cro: {
    label: "Risk Command Center", navHd: "Enterprise Risk",
    thesis: "The CRO's lens: is AI risk inside appetite, are controls effective, and what needs treatment now.",
    greet: "AI risk is inside appetite — two exposures need treatment",
    sub: "Residual risk trending down, 88% of controls effective, but one critical model risk and an overdue treatment need decisions this week.",
    hero: ["Amber", "Enterprise AI risk", "within appetite · 2 exposures open"],
    attn: [
      ["Critical model risk — Credit Decision", "Residual High after treatment; Art.22 exposure needs board note.", "Open risk", "crit", "cro_register"],
      ["Overdue treatment — data drift", "Servicing model drift mitigation 6 days past due.", "Escalate", "warn", "cro_controls"],
      ["Control gap — guardrail coverage", "Two production models below guardrail threshold.", "Assign", "info", "cro_controls"],
    ],
    kpis: [["Residual risk","Amber","warn","within appetite",LN("Highest residual = 8 (High) → Amber",[["Automated adverse decision","High · 8","residual"],["Model drift → mis-route","Medium · 6","residual"],["Prompt injection","Medium · 5","residual"],["Vendor concentration","Low · 3","residual"]],"Ranked highest-first; see the Risk Register.")],["Controls effective","88%","good","21 of 24",LN("21 ÷ 24 = 88%",[["Effective","21","controls"],["Not yet effective","3","controls"]],"By-domain scores in Control effectiveness by domain.")],["Critical risks","1","crit","Credit Decision",LN("Count residual = High → 1",[["Automated adverse decision (Credit Decision)","High · 8","critical"],["All other register risks","≤ Medium","below threshold"]],"Only Credit Decision breaches critical; see the Risk Register.")],["Open treatments","3","warn","1 overdue",LN("Σ active treatments = 3",[["Mitigate","2","treatments"],["Monitor","1","treatment"]],"Accepted risks excluded, 1 overdue; see the Risk Register.")],["KRIs breached","2","warn","of 14 tracked",LN("2 ÷ 14 tracked breached",[["Breached","2","of 14"],["Within threshold","12","of 14"]],"Per-indicator thresholds; see the Risk Register.")],["Audit findings","5","info","2 high",LN("Σ by severity = 5",[["High","2","findings"],["Medium / low","3","findings"]],"Severity and owners; see the Audit Findings register.")]],
    panels: [
      TB("Enterprise AI risk register", "Highest residual exposure first", ["Risk", "Initiative", "Residual", "Treatment"], [["Automated adverse decision", "Credit Decision", ["High · 8", "crit"], ["Mitigate", "warn"]], ["Model drift → mis-route", "Servicing Copilot", ["Medium · 6", "warn"], ["Monitor", "info"]], ["Prompt injection", "Resolution Copilot", ["Medium · 5", "warn"], ["Mitigate", "info"]], ["Vendor concentration", "Portfolio", ["Low · 3", "good"], ["Accept", "good"]]]),
      P("Control effectiveness by domain", "Where controls hold vs slip", [["Security controls", "", 86, "good"], ["Privacy controls", "", 82, "good"], ["Model controls", "", 74, "warn"], ["Operational controls", "", 69, "warn"], ["Vendor controls", "", 91, "good"]], { legend: [["Effective", "good"], ["Needs work", "warn"]] }),
    ],
    surfaces: [
      { id: "cro_appetite", label: "Risk Appetite", sub: "Enterprise AI risk appetite and where exposure sits against it.", blocks: [
        { t: "text", eye: "Risk appetite", h3: "AI risk appetite statement", body: "Moderate appetite for productivity and growth AI; low appetite for automated decisions affecting customers without human oversight; near-zero appetite for privacy or safety breaches." },
        { t: "kpis", items: [["Exposure vs appetite", "Within", "good", "amber band"], ["Appetite breaches", "0", "good", "quarter to date"], ["High-risk systems", "2", "warn", "Art.22 scope"], ["Board escalations", "1", "info", "this quarter"]] } ] },
      { id: "cro_register", label: "Risk Register", sub: "Every AI risk, its residual grade and treatment status.", blocks: [
        TB("AI risk register", "Residual grade · owner · treatment", ["Risk", "Grade", "Owner", "Treatment"], [["Automated adverse decision", ["High · 8", "crit"], "Risk-1", ["Mitigate", "warn"]], ["Model drift", ["Medium · 6", "warn"], "Risk-2", ["Monitor", "info"]], ["Prompt injection", ["Medium · 5", "warn"], "Risk-3", ["Mitigate", "info"]], ["Vendor concentration", ["Low · 3", "good"], "Risk-4", ["Accept", "good"]]]) ] },
      { id: "cro_controls", label: "Controls & KRIs", sub: "Control effectiveness and key risk indicators.", blocks: [
        { t: "kpis", items: [["Controls effective", "88%", "good", "21/24"], ["KRIs breached", "2", "warn", "of 14"], ["Overdue treatments", "1", "crit", "data drift"], ["Coverage", "86%", "good", "of production"]] },
        TB("Key risk indicators", "Threshold vs actual", ["KRI", "Threshold", "Actual", "Status"], [["Guardrail coverage", "≥90%", "86%", ["Breach", "warn"]], ["Model drift", "<5%", "3.1%", ["OK", "good"]], ["Incident rate", "<2/mo", "1", ["OK", "good"]], ["Overdue treatments", "0", "1", ["Breach", "crit"]]]) ] },
      { id: "cro_audit", label: "Audit Readiness", sub: "Findings, evidence and regulator readiness.", blocks: [
        P("Audit readiness by framework", "Evidence completeness", [["ISO 42001", "", 84, "good"], ["EU AI Act", "", 71, "warn"], ["NIST AI RMF", "", 78, "good"], ["SOC 2", "", 88, "good"]], { legend: [["Ready", "good"], ["Gaps", "warn"]] }) ] },
      { id: "cro_reports", label: "Reports", sub: "Build a risk report by dimension and export.", blocks: [
        { t: "report", eye: "Report builder", h3: "Enterprise risk report", dims: ["By residual grade", "Control effectiveness", "KRIs", "Treatments", "Audit findings", "By time"] } ] },
    ],
  },

  /* ══════════ Legal — Legal & Compliance ══════════ */
  legal: {
    label: "Legal & Compliance Center", navHd: "Legal & Compliance",
    thesis: "The General Counsel's lens: can each AI system legally operate, and is the evidence defensible.",
    greet: "Regulatory posture is solid — one conformity gap open",
    sub: "88% of controls effective and consent documented, but an EU AI Act conformity assessment and two contract clauses need attention before scale.",
    hero: ["88%", "Legally defensible", "controls effective · 1 gap open"],
    attn: [
      ["EU AI Act conformity gap", "Credit Decision needs Art.43 conformity assessment before scale.", "Open", "crit", "legal_conformity"],
      ["Contract clause — vendor liability", "Two AI vendor contracts lack model-liability terms.", "Review", "warn", "legal_contracts"],
      ["IP provenance — training data", "One model's training-data provenance is unclassified.", "Assign", "info", "legal_contracts"],
    ],
    kpis: [["Controls effective","88%","good","21 of 24",LN("21 ÷ 24 = 88%",[["Effective","21","controls"],["Not yet effective","3","controls"]],"System-level scores in Legal defensibility by system.")],["Conformity gaps","1","crit","EU AI Act",LN("Count status = Gap → 1",[["High-risk classification (EU AI Act Art.6)","Gap","status"],["Automated-decision safeguards (GDPR Art.22)","Partial","status"],["Transparency & lawful basis","Met","status"]],"One open gap on Art.6; see Regulatory obligations by framework.")],["Consent documented","98%","good","of scope",LN("Documented ÷ in-scope = 98%",[["Documented","98%","of scope"],["Pending / exception","2%","of scope"]],"Lawful basis GDPR Art.6; see Privacy.")],["Contracts flagged","2","warn","liability terms",LN("Σ flagged terms = 2",[["Liability / limitation","1","contract"],["Indemnity terms","1","contract"]],"Flagged clauses; see Contracts & IP.")],["Frameworks aligned","5","info","regulatory",LN("Σ aligned frameworks = 5",[["EU AI Act","1","framework"],["GDPR","1","framework"],["Others tracked centrally","3","frameworks"]],"Full framework list lives in Regulatory Posture.")],["Regulatory changes","3","violet","tracked this Q",LN("Σ tracked this quarter = 3",[["New regulation","1","item"],["Amendment","1","item"],["Guidance","1","item"]],"Change detail and impact; see the Regulatory Change Log.")]],
    panels: [
      TB("Regulatory obligations", "By framework and status", ["Obligation", "Framework", "Status", "Owner"], [["High-risk classification", "EU AI Act Art.6", ["Gap", "crit"], "Legal-1"], ["Transparency notices", "EU AI Act Art.52", ["Met", "good"], "Legal-2"], ["Lawful basis & consent", "GDPR Art.6", ["Met", "good"], "Privacy"], ["Automated-decision safeguards", "GDPR Art.22", ["Partial", "warn"], "Legal-1"]]),
      P("Legal defensibility by system", "Evidence and conformity strength", [["Resolution Copilot", "", 86, "good"], ["Credit Decision", "", 58, "warn"], ["Finance Close", "", 91, "good"], ["Skills Navigator", "", 74, "warn"]], { legend: [["Defensible", "good"], ["Needs work", "warn"]] }),
    ],
    surfaces: [
      { id: "legal_regulatory", label: "Regulatory Map", sub: "Every applicable regulation and where obligations are met.", blocks: [
        { t: "text", eye: "Regulatory posture", h3: "Applicable AI regulation", body: "EU AI Act (high-risk obligations), GDPR (lawful basis, Art.22 safeguards), sectoral rules for credit and employment, and contractual duties with AI vendors — tracked with evidence per obligation." },
        TB("Obligation tracker", "Framework · status", ["Obligation", "Framework", "Status", "Due"], [["Art.43 conformity", "EU AI Act", ["Open", "crit"], "Aug 2026"], ["Transparency notices", "EU AI Act", ["Met", "good"], "—"], ["Art.22 safeguards", "GDPR", ["Partial", "warn"], "Sep 2026"]]) ] },
      { id: "legal_crosswalk", label: "Convergence Crosswalk", sub: "32 capabilities mapped across all four instruments.", blocks: [
        { t: "text", eye: "One control set", h3: "One artifact per obligation, four instruments", body: "Each capability maps to the exact clause it satisfies in the EU AI Act, NIST AI RMF, ISO/IEC 42001 and Singapore's Model AI Governance Framework — so counsel can trace any legal obligation to the single evidence artifact that closes it." } ] },
      { id: "legal_jurisdictions", label: "Jurisdiction Atlas", sub: "Every regime, its status, dates and penalty exposure.", blocks: [
        { t: "text", eye: "Scope", h3: "Which regimes bind us, and where", body: "The multi-regime obligation map — Applies / Monitor / Out of scope from where the estate operates, with effective dates and penalty exposure counsel needs." } ] },
      { id: "legal_contracts", label: "Contracts & IP", sub: "AI vendor contracts, liability terms and IP provenance.", blocks: [
        TB("AI vendor contracts", "Liability · IP · status", ["Vendor", "Liability terms", "IP clause", "Status"], [["Anthropic", ["Present", "good"], ["Clear", "good"], ["OK", "good"]], ["Azure OpenAI", ["Missing", "warn"], ["Clear", "good"], ["Review", "warn"]], ["Internal models", ["N/A", "info"], ["Provenance gap", "warn"], ["Assign", "warn"]]]) ] },
      { id: "legal_conformity", label: "Conformity", sub: "Conformity assessments and legal sign-offs before scale.", blocks: [
        { t: "kpis", items: [["Conformity done", "3/4", "good", "high-risk systems"], ["Open assessments", "1", "crit", "Credit Decision"], ["Sign-offs pending", "2", "warn", "before scale"], ["Defensibility", "88%", "good", "avg"]] },
        P("Conformity by system", "Assessment completeness", [["Resolution Copilot", "", 100, "good"], ["Finance Close", "", 100, "good"], ["Skills Navigator", "", 82, "warn"], ["Credit Decision", "", 45, "crit"]], { legend: [["Complete", "good"], ["Partial", "warn"], ["Open", "crit"]] }) ] },
      { id: "legal_art12", label: "Article 12 Log", sub: "Tamper-evident per-inference record-keeping.", blocks: [
        { t: "text", eye: "Assurance", h3: "The record a regulator reads", body: "Every gateway inference appends a structured, hash-chained event (SHA-256) — the automatic per-inference logging EU AI Act Art.12 requires, exportable for the audit file." } ] },
      { id: "legal_evidence", label: "Legal Evidence", sub: "Defensible evidence and audit-ready records.", blocks: [
        P("Evidence by obligation", "Completeness", [["Transparency", "", 92, "good"], ["Consent records", "", 98, "good"], ["Conformity", "", 71, "warn"], ["Contract terms", "", 80, "good"]]) ] },
      { id: "legal_reports", label: "Reports", sub: "Build a legal & compliance report and export.", blocks: [
        { t: "report", eye: "Report builder", h3: "Legal & compliance report", dims: ["Regulatory obligations", "Contracts & IP", "Conformity", "Evidence", "Regulatory changes", "By time"] } ] },
    ],
  },
};

/* The roles that use the generic Role Command Center engine. */
export const ROLE_CENTER_IDS = Object.keys(ROLE_CENTERS);

/* Build the tab id for a role surface. Overview is the shared `home` tab. */
export const roleSurfaceTab = (role, id) => id;
