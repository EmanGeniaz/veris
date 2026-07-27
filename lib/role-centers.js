/* ── Role Command Centers — config data ─────────────────────────────
   Each role gets a distinct lens (hero metric, attention, KPIs, panels)
   and a set of sidebar surfaces. Rendered by components/platform/
   rolecenters.jsx and wired into the sidebar via core.jsx. Names/titles
   come from ROLES; this holds the role-specific governance content.

   Colour keys: good warn crit info violet teal gold ink3.
   Block types: kpis · attn · bars · table · scores · report · actions ·
   library · picker · text. A table cell may be [text, colorKey] → pill. */

const P = (eye, h3, rows, extra = {}) => ({ t: "bars", eye, h3, rows, ...extra });
const TB = (eye, h3, head, rows) => ({ t: "table", eye, h3, head, rows });
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
    sub: "18% efficiency lift YTD — 2 automations blocked, one SLA at risk, capacity tight in Retail Ops.",
    hero: ["34%", "Value chain automated", "straight-through +12pts YTD"],
    attn: [
      ["Onboarding automation blocked", "KYC model awaiting bias sign-off — 3-day slip to go-live.", "Escalate", "crit"],
      ["SLA at risk — Claims", "Cycle-time drifting to 34h vs 24h target as volume spikes.", "Rebalance capacity", "warn"],
      ["Capacity — Retail Ops", "Agent augmentation at 92% utilisation; hiring or automation needed.", "Open plan", "info"],
    ],
    kpis: [["Automation coverage", "34%", "gold", "of eligible processes"], ["Straight-through", "71%", "good", "+12pts YTD"], ["Cost-to-serve", "−18%", "good", "vs FY25 baseline"], ["Avg cycle-time", "−26%", "good", "across 9 flows"], ["Ops adoption", "64%", "warn", "4 business units"], ["Operational incidents", "3", "warn", "this month · 0 breach"]],
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
      ["Budget overrun — Resolution Copilot", "Consumed 83% of budget at 17% of value. Reforecast proposed.", "Open reforecast", "crit"],
      ["Value-at-risk — Q3", "$1.9M allocated ahead of realized value across 2 programs.", "Reallocate", "warn"],
      ["Run-rate rising", "Inference + licensing run-rate up 14% MoM as usage scales.", "Review cost", "info"],
    ],
    kpis: [["AI investment", "$8.0M", "gold", "FY26 allocated"], ["Value realized", "$4.6M", "good", "57% to value"], ["Value leaked", "$2.1M", "warn", "consumed, no value"], ["ROI", "+22%", "good", "portfolio blended"], ["Run-rate cost", "$310K/mo", "info", "compute+licences+people"], ["Payback", "14 mo", "ink3", "avg · fastest 6mo"]],
    panels: [
      TB("ROI by program", "Investment · realized · ROI · payback", ["Program", "Budget", "Realized", "ROI", "Payback"], [["Finance Close Automation", "$0.9M", "$1.6M", ["+78%", "good"], "6mo"], ["Fraud Detection", "$1.4M", "$2.0M", ["+43%", "good"], "9mo"], ["Resolution Copilot", "$1.8M", "$0.3M", ["−12%", "warn"], "—"], ["Credit Decision", "$2.2M", "$0.0M", ["Pending", "ink3"], "—"]]),
      P("Where the money goes", "Run-rate cost breakdown", [["Compute / inference", "", 44, "gold"], ["Model & SaaS licensing", "", 31, "info"], ["People / delivery", "", 18, "violet"], ["Data & tooling", "", 7, "teal"]]),
    ],
    surfaces: [
      { id: "cfo_portfolio", label: "Investment Portfolio", sub: "Every AI investment, its stage and its financial return.", blocks: [
        TB("Investment portfolio", "Budget · consumed · realized", ["Program", "Budget", "Consumed", "Realized", "State"], [["Finance Close", "$0.9M", "$0.9M", "$1.6M", ["Returning", "good"]], ["Fraud Detection", "$1.4M", "$1.4M", "$2.0M", ["Returning", "good"]], ["Resolution Copilot", "$1.8M", "$1.5M", "$0.3M", ["At risk", "warn"]], ["Credit Decision", "$2.2M", "$1.9M", "$0.0M", ["Pre-value", "info"]]]) ] },
      { id: "cfo_value", label: "Value & ROI", sub: "Realized value, ROI and time-to-value across the book.", blocks: [
        { t: "kpis", items: [["Value realized", "$4.6M", "good", "57% to value"], ["ROI", "+22%", "good", "blended"], ["Value leaked", "$2.1M", "warn", "no value yet"], ["Avg TTV", "7.4mo", "info", "fastest 4.2"]] },
        TB("ROI by program", "Return & payback", ["Program", "Realized", "ROI", "TTV"], [["Finance Close", "$1.6M", ["+78%", "good"], "5.1mo"], ["Fraud Detection", "$2.0M", ["+43%", "good"], "6.4mo"], ["Resolution Copilot", "$0.3M", ["−12%", "warn"], "9.8mo"]]) ] },
      { id: "cfo_cost", label: "Cost & Run-rate", sub: "The monthly cost of running AI — compute, licensing, people.", blocks: [
        P("Run-rate breakdown", "Monthly $310K", [["Compute / inference", "", 44, "gold"], ["Model & SaaS licensing", "", 31, "info"], ["People / delivery", "", 18, "violet"], ["Data & tooling", "", 7, "teal"]]),
        { t: "kpis", items: [["Run-rate", "$310K/mo", "info", "+14% MoM"], ["Cost / 1k calls", "$1.90", "warn", "up on volume"], ["Committed spend", "$2.4M", "gold", "remaining FY"]] } ] },
      { id: "cfo_budget", label: "Budget & Forecast", sub: "Budget vs actual and the rolling reforecast.", blocks: [
        TB("Budget vs actual", "By program", ["Program", "Budget", "Actual", "Variance"], [["Finance Close", "$0.9M", "$0.9M", ["0%", "good"]], ["Resolution Copilot", "$1.8M", "$1.5M", ["+9% burn", "warn"]], ["Credit Decision", "$2.2M", "$1.9M", ["On plan", "good"]]]) ] },
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
      ["Reskilling gap — 340 roles", "Roles with >40% task automation lack an active reskilling path.", "Open pipeline", "crit"],
      ["Adoption below threshold — People", "31% adoption; enablement program needed this quarter.", "Launch enablement", "warn"],
      ["Role-impact assessment due", "Skills Navigator expansion needs a workforce-impact review.", "Start review", "info"],
    ],
    kpis: [["Adoption", "61%", "good", "4 business units"], ["Reskilled (YTD)", "410", "good", "of 750 target"], ["Roles augmented", "1,180", "info", "vs 60 displaced"], ["Training completion", "73%", "warn", "safe-use"], ["Sentiment", "+64", "good", "net · 1,140 responses"], ["People-risk", "Low", "good", "ethics + displacement"]],
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
    kpis: [["Security posture", "79", "good", "/100 · +3 QoQ"], ["Threats blocked", "2,410", "gold", "prompt-inj · jailbreak"], ["Open vulnerabilities", "6", "warn", "1 critical · 2 high"], ["Data-leak events", "0", "good", "30d · monitors green"], ["Guardrail coverage", "86%", "info", "of production models"], ["MTTR", "3.1h", "good", "P1 mean-time-to-respond"]],
    panels: [
      P("AI threat surface", "Attempts blocked by vector (30d)", [["Prompt injection", "", 1240, "crit"], ["Jailbreak / policy evasion", "", 690, "warn"], ["Sensitive-data exfiltration", "", 320, "info"], ["Model DoS / abuse", "", 160, "violet"]], { raw: true }),
      RG("Incident & vulnerability queue", "Ranked by severity — click any row to drill in", "Item", [CISO_INCIDENTS[0], CISO_VULNS[0], CISO_VULNS[1], CISO_INCIDENTS[1]]),
    ],
    surfaces: [
      { id: "ciso_threat", label: "Threat Center", sub: "The live AI attack surface by vector.", blocks: [
        P("Attempts blocked by vector", "Last 30 days", [["Prompt injection", "", 1240, "crit"], ["Jailbreak", "", 690, "warn"], ["Data exfiltration", "", 320, "info"], ["Model DoS", "", 160, "violet"]], { raw: true }) ] },
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
      ["Integration degraded — core banking", "Latency on the payments connector up 3×; retries climbing.", "Investigate", "crit"],
      ["Inference cost spike", "Cost/call +14% MoM as Copilot traffic grows — routing review.", "Optimise routing", "warn"],
      ["Model deprecation — 30d", "Two models on an end-of-life provider version; migration due.", "Plan migration", "info"],
    ],
    kpis: [["Service uptime", "99.94%", "good", "30d rolling"], ["Inference latency", "420ms", "good", "p95 · SLO 600ms"], ["Cost / 1k calls", "$1.90", "warn", "+14% MoM"], ["Models in prod", "14", "info", "of 21 registered"], ["Integrations", "23", "gold", "1 degraded · 22 healthy"], ["Platform incidents", "2", "good", "30d · 0 SEV1"]],
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
      ["DPIA overdue — Skills Navigator", "Processes employee data with profiling; DPIA past due.", "Complete DPIA", "crit"],
      ["Subject-rights SLA — 3 requests", "Two erasure + one access request near the 30-day limit.", "Action requests", "warn"],
      ["Data residency — APAC", "Predictive Maintenance logs routed outside region; review.", "Review transfer", "info"],
    ],
    kpis: [["Privacy compliance", "92%", "good", "GDPR + local"], ["DPIA coverage", "9/11", "gold", "systems assessed"], ["Art.22 systems", "2", "warn", "automated decisions"], ["Consent / lawful basis", "98%", "good", "documented"], ["Subject-rights (open)", "3", "warn", "SLA 30d · 0 breached"], ["Privacy incidents", "0", "good", "30d · 1 near-miss"]],
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
      ["Board pack due — 6 days", "Q3 governance report consolidating risk, compliance & value.", "Assemble pack", "crit"],
      ["Control gap — 3 ineffective", "Model-validation + access-review controls failing test.", "Remediate", "warn"],
      ["Policy review overdue", "Acceptable-use policy past its review cycle by 12 days.", "Review & ratify", "info"],
    ],
    kpis: [["Governance maturity", "74", "good", "/100 · +5 YoY"], ["Policies in force", "24", "gold", "3 overdue review"], ["Control effectiveness", "88%", "good", "21 of 24 effective"], ["Open audit findings", "5", "warn", "2 high · closing"], ["Regulatory posture", "Strong", "good", "5 frameworks"], ["Enterprise risk", "Moderate", "warn", "score 12/25"]],
    panels: [
      TB("Regulatory & framework posture", "Where the enterprise stands", ["Framework", "Type", "Coverage", "Status"], [["EU AI Act", "Regulation", "High-risk", ["84%", "good"]], ["ISO 42001", "AI mgmt", "Enterprise", ["81%", "gold"]], ["ISO 27001", "Security", "Enterprise", ["90%", "good"]], ["NIST AI RMF", "Framework", "All AI", ["77%", "good"]], ["GDPR", "Regulation", "Personal data", ["92%", "good"]]]),
      { t: "scores", eye: "Governance operating model", h3: "Health of the governance engine", ring: 74, rows: [["Board & council cadence", 88, "good"], ["Policy lifecycle", 76, "good"], ["Control library", 84, "good"], ["Risk management", 70, "warn"], ["Audit & assurance", 68, "warn"]] },
    ],
    surfaces: [
      { id: "cgo_playbook", label: "Governance Playbook", sub: "The enterprise governance operating model.", blocks: [
        { t: "text", eye: "Operating model", h3: "How the enterprise is governed", body: "A monthly governance council, quarterly board oversight, a living policy library and a tested control set — every AI system inherits this frame." } ] },
      { id: "cgo_policies", label: "Policies & Controls", sub: "Policy library health and control effectiveness.", blocks: [
        TB("Policy & control health", "In force & effective", ["Item", "Type", "Status"], [["Acceptable-use", "Policy", ["Review overdue", "warn"]], ["Human-oversight", "Policy", ["In force", "good"]], ["Model-validation", "Control", ["Ineffective", "crit"]], ["Access-review", "Control", ["Ineffective", "crit"]]]) ] },
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
      ["2 tasks due today", "Validate an AI output and acknowledge the updated Data Handling policy.", "Open tasks", "crit"],
      ["1 prompt pending approval", "Your 'Customer email draft' prompt needs manager sign-off before reuse.", "Review", "warn"],
      ["Training due Friday", "Secure AI Use refresher — 12 min — keeps your tool access active.", "Start", "info"],
      ["A guardrail saved you", "PII auto-redacted from a support draft this week — nothing left your workspace.", "See event", "good"],
    ],
    kpis: [["AI productivity", "82", "good", "+8 this month"], ["Hours saved", "6.2h", "good", "this week"], ["Approved tools", "6", "info", "available to you"], ["Sessions", "23", "teal", "this week"], ["Guardrail saves", "4", "gold", "this month"], ["Compliance", "On track", "good", "1 action open"]],
    panels: [
      TB("Recent AI sessions", "Your last governed sessions", ["Session", "Tool", "Risk", "Outcome"], [["Draft release notes", "Claude", ["Low", "good"], ["Saved 40m", "good"]], ["Summarise incident", "Copilot", ["Low", "good"], ["Saved 25m", "good"]], ["Customer email draft", "ChatGPT Ent.", ["Med", "warn"], ["Redacted PII", "warn"]], ["Code review helper", "GitHub Copilot", ["Low", "good"], ["Saved 55m", "good"]]]),
      P("Where you use AI", "By activity this month", [["Drafting & writing", "", 78, "good"], ["Code assist", "", 64, "good"], ["Summarisation", "", 52, "warn"], ["Knowledge search", "", 41, "warn"]]),
    ],
    surfaces: [
      { id: "emp_assistant", label: "My AI Assistant", sub: "Ask anything — routed through the AI Gateway with policy, redaction and evidence.", blocks: [
        { t: "text", eye: "My AI Assistant", h3: "One assistant, every approved model", body: "You don't pick the model — the Gateway routes your request to the right approved AI (Copilot, Claude, ChatGPT Enterprise, Gemini or an internal model), applies policy, redacts sensitive data and stores evidence. Ask, and it governs the rest." } ] },
      { id: "emp_hub", label: "AI Hub", sub: "The AI you're approved to use — your governed marketplace.", blocks: [
        { t: "kpis", items: [["Approved for you", "6", "good", "tools"], ["Restricted", "2", "warn", "need approval"], ["Blocked", "3", "crit", "not permitted"], ["Requests open", "1", "info", "pending"]] },
        TB("Approved AI catalogue", "Status · data class · risk · owner", ["Tool", "Status", "Data allowed", "Risk", "Owner"], [
          ["Microsoft Copilot", ["Approved", "good"], "Internal", ["Low", "good"], "CIO"],
          ["GitHub Copilot", ["Approved", "good"], "Internal", ["Low", "good"], "CIO"],
          ["Claude (Enterprise)", ["Approved", "good"], "Confidential", ["Medium", "warn"], "CAIO"],
          ["ChatGPT Enterprise", ["Approved", "good"], "Confidential", ["Medium", "warn"], "CAIO"],
          ["Gemini Enterprise", ["Approved", "good"], "Internal", ["Low", "good"], "CIO"],
          ["Internal HR AI", ["Approved", "good"], "Restricted", ["Medium", "warn"], "CHRO"],
          ["Finance AI", ["Restricted", "warn"], "Restricted", ["High", "crit"], "CFO"],
          ["Public ChatGPT", ["Blocked", "crit"], "None", ["High", "crit"], "CISO"]]) ] },
      { id: "emp_sessions", label: "AI Sessions", sub: "Every conversation, an auditable session with evidence.", blocks: [
        { t: "kpis", items: [["Sessions (week)", "23", "info", "governed"], ["Tokens", "184K", "teal", "consumed"], ["Est. cost", "$3.10", "good", "your usage"], ["Evidence", "23", "gold", "records minted"]] },
        TB("Session log", "Tool · purpose · risk · evidence", ["Session", "Tool · model", "Purpose", "Risk", "Evidence"], [
          ["Draft release notes", "Claude · Sonnet", "Product", ["Low", "good"], ["Stored", "good"]],
          ["Summarise incident", "Copilot · GPT-4o", "Ops", ["Low", "good"], ["Stored", "good"]],
          ["Customer email draft", "ChatGPT · GPT-4o", "Support", ["Med · redacted", "warn"], ["Stored", "good"]],
          ["Code review helper", "GitHub Copilot", "Engineering", ["Low", "good"], ["Stored", "good"]],
          ["Budget variance q", "Finance AI", "Finance", ["Blocked", "crit"], ["Logged", "warn"]]]) ] },
      { id: "emp_prompts", label: "Prompt Library", sub: "Reusable prompts with governance metadata — your prompt assets.", blocks: [
        { t: "library", items: [
          ["Release-notes drafter", "Turns a changelog into customer-ready notes.", "Approved · v3", "good"],
          ["Incident summariser", "Summarises an incident thread into a postmortem stub.", "Approved · v2", "good"],
          ["Customer email draft", "Drafts a support reply from ticket context.", "Pending approval", "warn"],
          ["Code explainer", "Explains a diff for review.", "Approved · v1", "good"],
          ["Meeting-notes cleaner", "Structures raw notes into actions.", "Approved · v4", "good"],
          ["Job description writer", "Drafts a JD from a role brief.", "Draft", "ink3"]] },
        TB("Prompt metadata", "Creator · uses · rating", ["Prompt", "Creator", "Uses", "Rating"], [["Release-notes drafter", "You", "48", "4.6★"], ["Incident summariser", "S. Kim", "132", "4.8★"], ["Code explainer", "You", "27", "4.4★"], ["Meeting-notes cleaner", "Team", "210", "4.7★"]]) ] },
      { id: "emp_vault", label: "Knowledge Vault", sub: "Governed access to organisation knowledge — permission-checked before retrieval.", blocks: [
        { t: "text", eye: "Knowledge Vault", h3: "Reference the org, safely", body: "Search policies, SOPs, contracts, product manuals and architecture docs. Before anything is retrieved, VerisZone checks your permissions and applies governance rules — you only see what you're cleared to see." },
        { t: "library", items: [
          ["Responsible AI Policy v6", "How to use AI safely here.", "You may view", "good"],
          ["Data Handling Standard v4", "Classification & redaction rules.", "You may view", "good"],
          ["Product architecture", "System design docs.", "You may view", "good"],
          ["Customer contracts", "Restricted — legal only.", "No access", "crit"],
          ["Engineering SOPs", "Runbooks & procedures.", "You may view", "good"],
          ["Board minutes", "Restricted.", "No access", "crit"]] } ] },
      { id: "emp_projects", label: "My Projects", sub: "How your work connects to enterprise AI initiatives.", blocks: [
        { t: "kpis", items: [["Assigned", "2", "info", "initiatives"], ["Evidence submitted", "7", "good", "artifacts"], ["Open risks", "1", "warn", "on your work"], ["AI contribution", "High", "good", "Copilot rollout"]] },
        TB("Your initiatives", "Progress · deliverable · evidence", ["Initiative", "Progress", "Your deliverable", "Evidence"], [["Resolution Copilot", ["Piloting", "info"], "Prompt pack", ["Submitted", "good"]], ["Support Automation", ["Scaling", "good"], "Test evidence", ["Submitted", "good"]]]) ] },
      { id: "emp_tasks", label: "My Tasks", sub: "AI-assigned and governance work on your plate.", blocks: [
        { t: "actions", eye: "Your tasks", h3: "3 tasks · 2 due today", items: [
          [1, "crit", "Validate AI output — release notes", "Confirm the AI-drafted release notes are accurate before publish.", "Mark validated", "Flag issue"],
          [2, "warn", "Acknowledge policy — Data Handling v4", "Updated redaction rules apply to your workspace.", "Acknowledge", "Read policy"],
          [3, "info", "Complete training — Secure AI Use", "12-minute refresher, due Friday.", "Start", "Snooze"]] } ] },
      { id: "emp_usage", label: "AI Usage", sub: "Your own analytics — sessions, hours saved, tools and trend.", blocks: [
        { t: "text", eye: "AI Usage", h3: "Your usage analytics", body: "See your sessions, hours saved, tokens, cost, most-used tools and your adoption and productivity trend." } ] },
      { id: "emp_risk", label: "Risk & Guardrails", sub: "Guardrails that explain — why it was flagged and how to fix it.", blocks: [
        { t: "kpis", items: [["Guardrail saves", "4", "gold", "this month"], ["Blocks", "1", "crit", "unsafe prompt"], ["Warnings", "2", "warn", "you resolved"], ["Your risk score", "Low", "good", "12/100"]] },
        TB("Guardrail events — explained", "Risk · status · why & remediation", ["Risk detected", "Status", "Why & what to do"], [
          ["Customer data in prompt", ["Blocked", "crit"], "PII present — remove personal data before retrying (POL-DH-002)"],
          ["Source code shared", ["Warning", "warn"], "Repository is Confidential — keep it in-tenant"],
          ["Financial forecast", ["Approval", "info"], "Manager approval needed before sharing"],
          ["Prompt injection", ["Blocked", "crit"], "Malicious instruction — session terminated, escalated to CISO"]]) ] },
      { id: "emp_learning", label: "Learning Center", sub: "Training recommended from how you actually work.", blocks: [
        { t: "text", eye: "Learning Center", h3: "Recommended for you", body: "Your learning path adapts to observed behaviour — prompt engineering, responsible AI, secure use and role-specific skills." } ] },
      { id: "emp_productivity", label: "Productivity", sub: "Is AI actually helping you? The measurable answer.", blocks: [
        { t: "kpis", items: [["Hours saved", "24h", "good", "this month"], ["Tasks accelerated", "31", "good", "with AI"], ["Reused prompts", "6", "teal", "your library"], ["AI deliverables", "12", "violet", "shipped"]] },
        P("Where AI saves you time", "By activity", [["Drafting & writing", "", 82, "good"], ["Code assist", "", 70, "good"], ["Summarisation", "", 58, "warn"], ["Research", "", 44, "warn"]]),
        { t: "library", items: [["Automate release notes", "You draft these weekly — a saved workflow could halve the time.", "Suggested", "gold"], ["Batch incident summaries", "Group similar incidents into one summarisation run.", "Suggested", "gold"]] } ] },
      { id: "emp_approvals", label: "Approvals", sub: "One inbox for your governance requests.", blocks: [
        { t: "actions", eye: "Your requests", h3: "Requests & approvals", items: [
          [1, "warn", "Prompt approval — Customer email draft", "Awaiting your manager's sign-off before it's reusable.", "Nudge approver", "Withdraw"],
          [2, "info", "Tool access — Finance AI", "You requested access; pending CFO office review.", "View request", "Cancel"]] } ] },
      { id: "emp_compliance", label: "My Compliance", sub: "Always know your standing — policies, training, actions.", blocks: [
        { t: "kpis", items: [["Policies acknowledged", "7/8", "warn", "1 outstanding"], ["Training", "82%", "good", "on track"], ["Open actions", "1", "warn", "policy ack"], ["Violations", "0", "good", "90 days"]] },
        TB("Compliance record", "Item · status · date", ["Item", "Status", "Date"], [["Responsible AI Policy v6", ["Acknowledged", "good"], "Feb 2026"], ["Data Handling v4", ["Outstanding", "warn"], "Due now"], ["Secure AI Use training", ["In progress", "info"], "Due Fri"], ["GDPR basics", ["Complete", "good"], "Jan 2026"]]) ] },
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
      ["5 approvals waiting", "Prompt sign-offs, a policy exception and tool-access requests need your decision.", "Review queue", "warn"],
      ["2 members need enablement", "Below-threshold usage; a nudge or session would help.", "Open plan", "info"],
      ["Team guardrail event", "A blocked prompt-injection attempt on the team this week — no data left.", "Review", "crit"],
      ["Team compliance gap", "3 members have an outstanding policy acknowledgement.", "Send reminder", "warn"],
    ],
    kpis: [["Team adoption", "64%", "good", "14 of 22 active"], ["Time saved", "118h", "good", "team · month"], ["Approvals", "5", "warn", "waiting on you"], ["Team compliance", "86%", "warn", "3 outstanding"], ["Guardrail saves", "9", "gold", "team · month"], ["Usage cost", "$1.2K", "info", "this month"]],
    panels: [
      TB("Team roster & adoption", "Who's active, who needs a nudge", ["Member", "Role", "Adoption", "Compliance"], [["L. Haddad", "Analyst", ["High", "good"], ["OK", "good"]], ["J. Okafor", "Analyst", ["Med", "warn"], ["1 due", "warn"]], ["S. Kim", "Specialist", ["High", "good"], ["OK", "good"]], ["R. Diaz", "Associate", ["Low", "crit"], ["2 due", "crit"]]]),
      P("Team AI usage", "Where the team applies AI", [["Response drafting", "", 82, "good"], ["Case summarisation", "", 68, "good"], ["Knowledge search", "", 54, "warn"], ["QA & review", "", 39, "warn"]]),
    ],
    surfaces: [
      { id: "mgr_assistant", label: "My AI Assistant", sub: "Your governed assistant — routed through the Gateway like everyone's.", blocks: [
        { t: "text", eye: "My AI Assistant", h3: "Draft, summarise, plan — governed", body: "Your prompts route through the Gateway with policy, redaction and evidence, exactly like your team's. Use it to prep reviews, summarise team output and draft plans." } ] },
      { id: "mgr_hub", label: "Team AI Hub", sub: "The AI your team is approved to use, and what needs your grant.", blocks: [
        { t: "kpis", items: [["Team-approved", "6", "good", "tools"], ["Awaiting your grant", "2", "warn", "requests"], ["Blocked", "3", "crit", "org policy"], ["Team spend", "$1.2K", "info", "this month"]] },
        TB("Team tool catalogue", "Status · adoption · owner", ["Tool", "Status", "Team adoption", "Owner"], [["Microsoft Copilot", ["Approved", "good"], "18/22", "CIO"], ["GitHub Copilot", ["Approved", "good"], "9/22", "CIO"], ["Claude (Enterprise)", ["Approved", "good"], "12/22", "CAIO"], ["ChatGPT Enterprise", ["Approved", "good"], "14/22", "CAIO"], ["Finance AI", ["Restricted", "warn"], "2/22", "CFO"], ["Public ChatGPT", ["Blocked", "crit"], "0/22", "CISO"]]) ] },
      { id: "mgr_sessions", label: "Team Sessions", sub: "Governed session aggregates — never private prompt content.", blocks: [
        { t: "kpis", items: [["Sessions (week)", "312", "info", "team total"], ["Tokens", "4.1M", "teal", "consumed"], ["Est. cost", "$1.2K", "good", "team month"], ["Evidence", "312", "gold", "records"]] },
        TB("Session volume by member", "Aggregates only, by policy", ["Member", "Sessions", "Top use", "Risk"], [["L. Haddad", "88", "Drafting", ["Low", "good"]], ["S. Kim", "102", "Summarising", ["Low", "good"]], ["J. Okafor", "54", "Search", ["Low", "good"]], ["R. Diaz", "31", "Drafting", ["Med", "warn"]]]) ] },
      { id: "mgr_prompts", label: "Team Prompt Library", sub: "Shared, approved team prompts and what's pending your sign-off.", blocks: [
        { t: "library", items: [
          ["Incident summariser", "Team standard for postmortems.", "Approved · v2", "good"],
          ["Meeting-notes cleaner", "Structures raw notes into actions.", "Approved · v4", "good"],
          ["Customer email draft", "Support reply from ticket context.", "Pending your approval", "warn"],
          ["Release-notes drafter", "Changelog → customer notes.", "Approved · v3", "good"]] },
        { t: "actions", eye: "Prompt approvals", h3: "Pending your sign-off", items: [
          [1, "warn", "Approve prompt — Customer email draft (L. Haddad)", "Low-risk support prompt; redaction on. Approving makes it reusable team-wide.", "Approve", "Request changes"]] } ] },
      { id: "mgr_vault", label: "Knowledge Vault", sub: "Team-governed knowledge — permission-checked before retrieval.", blocks: [
        { t: "library", items: [["Team runbooks", "Engineering SOPs & procedures.", "Team access", "good"], ["Responsible AI Policy v6", "Safe-use policy.", "Team access", "good"], ["Data Handling v4", "Classification rules.", "Team access", "good"], ["Customer contracts", "Restricted — legal only.", "No access", "crit"]] } ] },
      { id: "mgr_projects", label: "Team Projects", sub: "The AI initiatives your team contributes to.", blocks: [
        { t: "kpis", items: [["Team initiatives", "2", "info", "in flight"], ["On track", "1", "good", "1 at risk"], ["Team evidence", "23", "good", "artifacts"], ["Open risks", "2", "warn", "team work"]] },
        TB("Team initiatives", "Progress · owner · risk", ["Initiative", "Progress", "Lead", "Risk"], [["Resolution Copilot", ["Piloting", "info"], "S. Kim", ["Medium", "warn"]], ["Support Automation", ["Scaling", "good"], "L. Haddad", ["Low", "good"]]]) ] },
      { id: "mgr_tasks", label: "Team Tasks", sub: "Governance work assigned to you and your team.", blocks: [
        { t: "actions", eye: "Team tasks", h3: "What needs doing", items: [
          [1, "crit", "Chase policy acknowledgements", "3 team members have Data Handling v4 outstanding.", "Send reminder", "Escalate"],
          [2, "warn", "Enablement — R. Diaz", "Below-threshold usage; schedule a coaching session.", "Book session", "Snooze"],
          [3, "info", "Review team prompt library", "2 shared prompts due for a version review.", "Review", "Later"]] } ] },
      { id: "mgr_usage", label: "Team Usage", sub: "Team analytics — adoption, hours saved, cost and trend.", blocks: [
        { t: "text", eye: "Team Usage", h3: "Team usage analytics", body: "Adoption, hours saved, tokens, cost, most-used tools and the team's adoption and productivity trend — aggregates only." } ] },
      { id: "mgr_risk", label: "Team Risk & Guardrails", sub: "Team guardrail events, explained — and who needs coaching.", blocks: [
        { t: "kpis", items: [["Guardrail saves", "9", "gold", "team month"], ["Blocks", "2", "crit", "unsafe prompts"], ["Warnings", "6", "warn", "resolved"], ["Team risk score", "Low", "good", "18/100"]] },
        TB("Team guardrail events", "Member · risk · status", ["Member", "Risk detected", "Status", "Action"], [["R. Diaz", "Customer data in prompt", ["Blocked", "crit"], "Coaching booked"], ["J. Okafor", "Source code shared", ["Warning", "warn"], "Resolved"], ["Unknown", "Prompt injection", ["Blocked", "crit"], "Escalated to CISO"]]) ] },
      { id: "mgr_learning", label: "Team Learning", sub: "Your team's responsible-AI learning and recommendations.", blocks: [
        { t: "text", eye: "Team Learning", h3: "Team learning path", body: "Track safe-use completion across the team and see who needs which training next, recommended from observed behaviour." } ] },
      { id: "mgr_productivity", label: "Team Productivity", sub: "Is AI helping the team? The measurable answer.", blocks: [
        { t: "kpis", items: [["Hours saved", "118h", "good", "team month"], ["Tasks accelerated", "240", "good", "with AI"], ["Reused prompts", "14", "teal", "team library"], ["AI deliverables", "63", "violet", "shipped"]] },
        P("Team time saved", "By activity", [["Response drafting", "", 84, "good"], ["Summarisation", "", 66, "good"], ["QA & review", "", 48, "warn"], ["Research", "", 38, "warn"]]) ] },
      { id: "mgr_approvals", label: "Approvals", badge: "5", sub: "One inbox for team governance decisions.", blocks: [
        { t: "actions", eye: "Approvals queue", h3: "5 waiting on you", items: [
          [1, "warn", "Prompt approval — Customer email draft (L. Haddad)", "Low-risk support prompt; makes it reusable team-wide.", "Approve", "Decline"],
          [2, "info", "Policy exception — extended data retention", "30-day pilot waiver for a summarisation flow.", "Approve", "Defer"],
          [3, "warn", "Tool access — model sandbox (2 analysts)", "Sandbox access requested for a prototype.", "Grant", "Decline"]] } ] },
      { id: "mgr_compliance", label: "Team Compliance", sub: "The team's compliance standing at a glance.", blocks: [
        { t: "kpis", items: [["Team compliance", "86%", "warn", "3 outstanding"], ["Training complete", "71%", "warn", "safe-use"], ["Open actions", "5", "warn", "across team"], ["Violations", "0", "good", "90 days"]] },
        TB("Compliance by member", "Policies · training · actions", ["Member", "Policies", "Training", "Actions"], [["L. Haddad", ["8/8", "good"], "92%", ["0", "good"]], ["J. Okafor", ["7/8", "warn"], "74%", ["1", "warn"]], ["S. Kim", ["8/8", "good"], "90%", ["0", "good"]], ["R. Diaz", ["6/8", "crit"], "48%", ["2", "crit"]]]) ] },
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
      ["Critical model risk — Credit Decision", "Residual High after treatment; Art.22 exposure needs board note.", "Open risk", "crit"],
      ["Overdue treatment — data drift", "Servicing model drift mitigation 6 days past due.", "Escalate", "warn"],
      ["Control gap — guardrail coverage", "Two production models below guardrail threshold.", "Assign", "info"],
    ],
    kpis: [["Residual risk", "Amber", "warn", "within appetite"], ["Controls effective", "88%", "good", "21 of 24"], ["Critical risks", "1", "crit", "Credit Decision"], ["Open treatments", "3", "warn", "1 overdue"], ["KRIs breached", "2", "warn", "of 14 tracked"], ["Audit findings", "5", "info", "2 high"]],
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
      ["EU AI Act conformity gap", "Credit Decision needs Art.43 conformity assessment before scale.", "Open", "crit"],
      ["Contract clause — vendor liability", "Two AI vendor contracts lack model-liability terms.", "Review", "warn"],
      ["IP provenance — training data", "One model's training-data provenance is unclassified.", "Assign", "info"],
    ],
    kpis: [["Controls effective", "88%", "good", "21 of 24"], ["Conformity gaps", "1", "crit", "EU AI Act"], ["Consent documented", "98%", "good", "of scope"], ["Contracts flagged", "2", "warn", "liability terms"], ["Frameworks aligned", "5", "info", "regulatory"], ["Regulatory changes", "3", "violet", "tracked this Q"]],
    panels: [
      TB("Regulatory obligations", "By framework and status", ["Obligation", "Framework", "Status", "Owner"], [["High-risk classification", "EU AI Act Art.6", ["Gap", "crit"], "Legal-1"], ["Transparency notices", "EU AI Act Art.52", ["Met", "good"], "Legal-2"], ["Lawful basis & consent", "GDPR Art.6", ["Met", "good"], "Privacy"], ["Automated-decision safeguards", "GDPR Art.22", ["Partial", "warn"], "Legal-1"]]),
      P("Legal defensibility by system", "Evidence and conformity strength", [["Resolution Copilot", "", 86, "good"], ["Credit Decision", "", 58, "warn"], ["Finance Close", "", 91, "good"], ["Skills Navigator", "", 74, "warn"]], { legend: [["Defensible", "good"], ["Needs work", "warn"]] }),
    ],
    surfaces: [
      { id: "legal_regulatory", label: "Regulatory Map", sub: "Every applicable regulation and where obligations are met.", blocks: [
        { t: "text", eye: "Regulatory posture", h3: "Applicable AI regulation", body: "EU AI Act (high-risk obligations), GDPR (lawful basis, Art.22 safeguards), sectoral rules for credit and employment, and contractual duties with AI vendors — tracked with evidence per obligation." },
        TB("Obligation tracker", "Framework · status", ["Obligation", "Framework", "Status", "Due"], [["Art.43 conformity", "EU AI Act", ["Open", "crit"], "Aug 2026"], ["Transparency notices", "EU AI Act", ["Met", "good"], "—"], ["Art.22 safeguards", "GDPR", ["Partial", "warn"], "Sep 2026"]]) ] },
      { id: "legal_contracts", label: "Contracts & IP", sub: "AI vendor contracts, liability terms and IP provenance.", blocks: [
        TB("AI vendor contracts", "Liability · IP · status", ["Vendor", "Liability terms", "IP clause", "Status"], [["Anthropic", ["Present", "good"], ["Clear", "good"], ["OK", "good"]], ["Azure OpenAI", ["Missing", "warn"], ["Clear", "good"], ["Review", "warn"]], ["Internal models", ["N/A", "info"], ["Provenance gap", "warn"], ["Assign", "warn"]]]) ] },
      { id: "legal_conformity", label: "Conformity", sub: "Conformity assessments and legal sign-offs before scale.", blocks: [
        { t: "kpis", items: [["Conformity done", "3/4", "good", "high-risk systems"], ["Open assessments", "1", "crit", "Credit Decision"], ["Sign-offs pending", "2", "warn", "before scale"], ["Defensibility", "88%", "good", "avg"]] },
        P("Conformity by system", "Assessment completeness", [["Resolution Copilot", "", 100, "good"], ["Finance Close", "", 100, "good"], ["Skills Navigator", "", 82, "warn"], ["Credit Decision", "", 45, "crit"]], { legend: [["Complete", "good"], ["Partial", "warn"], ["Open", "crit"]] }) ] },
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
