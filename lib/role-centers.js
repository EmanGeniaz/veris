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
      ["P1 — prompt-injection in progress", "Injection attempt on Resolution Copilot blocked at gateway; forensics open.", "Open incident", "crit"],
      ["Critical vuln — model endpoint", "Unauthenticated inference path on a staging model. Patch pending.", "Assign fix", "crit"],
      ["Guardrail gap — 2 models", "Output filtering not enforced on Skills Navigator + Supplier Screener.", "Enforce", "warn"],
    ],
    kpis: [["Security posture", "79", "good", "/100 · +3 QoQ"], ["Threats blocked", "2,410", "gold", "prompt-inj · jailbreak"], ["Open vulnerabilities", "6", "warn", "1 critical · 2 high"], ["Data-leak events", "0", "good", "30d · monitors green"], ["Guardrail coverage", "86%", "info", "of production models"], ["MTTR", "3.1h", "good", "P1 mean-time-to-respond"]],
    panels: [
      P("AI threat surface", "Attempts blocked by vector (30d)", [["Prompt injection", "", 1240, "crit"], ["Jailbreak / policy evasion", "", 690, "warn"], ["Sensitive-data exfiltration", "", 320, "info"], ["Model DoS / abuse", "", 160, "violet"]], { raw: true }),
      TB("Incident & vulnerability queue", "Ranked by severity", ["Ref", "Item", "Severity", "Status"], [["INC-1042", "Prompt-injection attempt", ["P1 · Critical", "crit"], ["Investigating", "info"]], ["VUL-318", "Unauth inference endpoint", ["Critical", "crit"], ["Patching", "warn"]], ["VUL-311", "Verbose error → data hint", ["High", "warn"], ["Fix ready", "good"]], ["INC-1039", "Model drift → integrity", ["P2 · High", "warn"], ["Mitigating", "warn"]]]),
    ],
    surfaces: [
      { id: "ciso_threat", label: "Threat Center", sub: "The live AI attack surface by vector.", blocks: [
        P("Attempts blocked by vector", "Last 30 days", [["Prompt injection", "", 1240, "crit"], ["Jailbreak", "", 690, "warn"], ["Data exfiltration", "", 320, "info"], ["Model DoS", "", 160, "violet"]], { raw: true }) ] },
      { id: "ciso_incidents", label: "AI Incidents", badge: "3", sub: "Security incidents from ServiceNow / SIEM, ranked by severity.", blocks: [
        TB("Open incident queue", "Priority & status", ["Ref", "Summary", "Severity", "Status"], [["INC-1042", "Prompt-injection attempt blocked", ["P1 · Critical", "crit"], ["Investigating", "info"]], ["INC-1039", "Model drift → integrity", ["P2 · High", "warn"], ["Mitigating", "warn"]], ["INC-1030", "Anomalous inference volume", ["P3 · Medium", "info"], ["Triage", "ink3"]]]) ] },
      { id: "ciso_vuln", label: "Vulnerabilities", sub: "Open vulnerabilities across models, endpoints and pipelines.", blocks: [
        TB("Vulnerability register", "Severity & remediation", ["Ref", "Finding", "Severity", "Fix"], [["VUL-318", "Unauth inference endpoint", ["Critical", "crit"], ["Patching", "warn"]], ["VUL-311", "Verbose error → data hint", ["High", "warn"], ["Ready", "good"]], ["VUL-305", "Weak prompt-log redaction", ["Medium", "info"], ["Planned", "ink3"]]]) ] },
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

  /* ══════════ Employee — My AI Workspace ══════════ */
  employee: {
    label: "My AI Workspace", navHd: "My Workspace",
    thesis: "The employee's lens: get more done safely — my assistant, my tasks, my growth.",
    greet: "You saved 6.2 hours this week",
    sub: "3 tasks waiting, one approval pending, and your governance path is 2 modules from complete. The Gateway blocked 1 unsafe prompt for you.",
    hero: ["6.2h", "Time saved this week", "142 prompts · streak 9 days"],
    attn: [
      ["Task — draft complaint response", "Assigned by your manager · due today. Assistant has a draft ready.", "Open assistant", "info"],
      ["Approval waiting", "Your 'auto-triage tickets' idea needs manager sign-off.", "View idea", "warn"],
      ["Learning due — 2 modules", "Finish 'GDPR Art.22 for analysts' to keep your safe-use badge.", "Resume", "info"],
    ],
    kpis: [["Time saved", "6.2h", "good", "this week"], ["Prompts run", "142", "info", "via Gateway"], ["Guardrail saves", "1", "gold", "unsafe prompt blocked"], ["Learning", "78%", "warn", "safe-use path"], ["Ideas submitted", "3", "violet", "1 in review"], ["Adoption streak", "9d", "good", "daily active"]],
    panels: [
      TB("My tasks & approvals", "What's on your plate", ["Item", "From", "Due", "Status"], [["Draft complaint response", "Manager", "Today", ["Ready", "good"]], ["Summarise account history", "Self", "Today", ["Draft", "info"]], ["Auto-triage idea", "You → Mgr", "—", ["In review", "warn"]]]),
      P("My learning path", "Safe & effective AI use", [["Responsible AI basics", "", 100, "good"], ["Prompt fluency", "", 85, "good"], ["GDPR Art.22 for analysts", "", 60, "warn"], ["Data handling", "", 40, "warn"]]),
    ],
    surfaces: [
      { id: "emp_assistant", label: "AI Assistant", sub: "Your governed AI assistant — every prompt runs through the Gateway.", blocks: [
        { t: "text", eye: "AI Assistant", h3: "Ask anything — safely", body: "Prompts route through the enterprise Gateway: sensitive data is masked, unsafe requests are blocked, and every answer is source-labelled. Your recent drafts appear in My Tasks." },
        { t: "kpis", items: [["Prompts (week)", "142", "info", "via Gateway"], ["Masked items", "4", "good", "protected"], ["Blocked", "1", "gold", "unsafe"]] } ] },
      { id: "emp_learning", label: "My Learning", sub: "Your responsible-AI learning path and badges.", blocks: [
        P("My learning path", "Progress by module", [["Responsible AI basics", "", 100, "good"], ["Prompt fluency", "", 85, "good"], ["GDPR Art.22", "", 60, "warn"], ["Data handling", "", 40, "warn"]]) ] },
      { id: "emp_ideas", label: "My Ideas", sub: "AI ideas you've submitted and their status.", blocks: [
        TB("My AI ideas", "Submitted & status", ["Idea", "Submitted", "Status"], [["Auto-triage tickets", "This week", ["In review", "warn"]], ["Summarise call notes", "Last week", ["Approved", "good"]], ["Draft KB articles", "This month", ["Piloting", "info"]]]) ] },
      { id: "emp_usage", label: "My Usage", sub: "Your AI usage and the time it's saving you.", blocks: [
        { t: "kpis", items: [["Time saved", "6.2h", "good", "this week"], ["This month", "24h", "good", "cumulative"], ["Streak", "9d", "info", "daily active"], ["Top use", "Drafting", "violet", "of your prompts"]] } ] },
    ],
  },

  /* ══════════ Manager — Team AI Workspace ══════════ */
  manager: {
    label: "Team AI Workspace", navHd: "Team Workspace",
    thesis: "The manager's lens: is my team getting value from AI, safely — and what needs my sign-off.",
    greet: "Your team is 64% adopted",
    sub: "14 of 22 people active this week, 5 approvals waiting on you, and team time-saved is up 21%. Two members need enablement.",
    hero: ["64%", "Team AI adoption", "14/22 active · time saved +21%"],
    attn: [
      ["5 approvals waiting", "Idea sign-offs and a policy exception need your decision.", "Review queue", "warn"],
      ["2 members need enablement", "Below-threshold usage; a nudge or session would help.", "Open plan", "info"],
      ["At-risk deliverable", "'Resolution SLA' automation slipping — capacity check.", "Rebalance", "crit"],
    ],
    kpis: [["Team adoption", "64%", "good", "14 of 22 active"], ["Time saved", "118h", "good", "team · this month"], ["Approvals", "5", "warn", "waiting on you"], ["Team learning", "71%", "warn", "safe-use complete"], ["Team ideas", "7", "violet", "2 in pipeline"], ["Usage cost", "$1.2K", "info", "this month"]],
    panels: [
      TB("Team roster & adoption", "Who's active, who needs a nudge", ["Member", "Role", "Adoption", "Learning"], [["L. Haddad", "Analyst", ["High", "good"], "78%"], ["J. Okafor", "Analyst", ["Med", "warn"], "55%"], ["S. Kim", "Specialist", ["High", "good"], "90%"], ["R. Diaz", "Associate", ["Low", "crit"], "32%"]]),
      P("Team AI usage", "Where the team applies AI", [["Response drafting", "", 82, "good"], ["Case summarisation", "", 68, "good"], ["Knowledge search", "", 54, "warn"], ["QA & review", "", 39, "warn"]]),
    ],
    surfaces: [
      { id: "mgr_assistant", label: "AI Assistant", sub: "Your governed assistant for team work.", blocks: [
        { t: "text", eye: "AI Assistant", h3: "Draft, summarise, plan — governed", body: "Every team prompt runs through the Gateway with masking and safe-use guardrails. Use it to prep reviews, summarise team output and draft plans." } ] },
      { id: "mgr_adoption", label: "Team Adoption", sub: "Adoption and value across your team.", blocks: [
        P("Adoption by member", "Active use this week", [["L. Haddad", "", 88, "good"], ["S. Kim", "", 90, "good"], ["J. Okafor", "", 55, "warn"], ["R. Diaz", "", 32, "crit"]], { legend: [["Active", "good"], ["Nudge", "warn"], ["At risk", "crit"]] }) ] },
      { id: "mgr_approvals", label: "Approvals", badge: "5", sub: "Decisions waiting on you.", blocks: [
        { t: "actions", eye: "Approvals queue", h3: "5 waiting on you", items: [
          [1, "warn", "Idea — auto-triage tickets (L. Haddad)", "Team member proposes automating ticket triage. Low risk, high time-save.", "Approve", "Decline"],
          [2, "info", "Policy exception — extended data retention", "30-day pilot waiver requested for a summarisation flow.", "Approve", "Defer"],
          [3, "warn", "New tool access — model sandbox", "Two analysts request sandbox access for a prototype.", "Grant", "Decline"] ] } ] },
      { id: "mgr_learning", label: "Team Learning", sub: "Your team's responsible-AI learning.", blocks: [
        P("Team learning", "Safe-use completion", [["Responsible AI basics", "", 92, "good"], ["Prompt fluency", "", 74, "warn"], ["Data handling", "", 61, "warn"], ["GDPR for teams", "", 48, "warn"]]) ] },
      { id: "mgr_reports", label: "Reports", sub: "Build a team report and export.", blocks: [
        { t: "report", eye: "Report builder", h3: "Team report", dims: ["Adoption", "Time saved", "Learning", "Ideas", "Usage cost", "By member"] } ] },
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
