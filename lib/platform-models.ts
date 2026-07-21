import type {
  ACCxoAlignment,
  ExecBriefEntry,
  ExecKpiInsight,
  ExecDecisionItem,
  ExecPriorityItem,
  ExecRecommendationItem,
  FrameworkPosture,
  ACEvidenceRecord,
  ACFeedbackScores,
  ACGuardrailGroup,
  ACInitiativeRecord,
  ACPhaseTemplate,
  ACRoleAccess,
  GatewayLogEntry,
  GatewayPolicy,
  GatewayProvider,
} from "./types";

/* ── AI Central operating layer data ──────────────────────────── */

/* Standard implementation phases. Every initiative follows these.
   Missing mandatory artifacts prevent progression to the next phase. */
export const AC_PHASES: ACPhaseTemplate[] = [
  { id: "discover", order: 1, name: "Discover", objective: "Frame the business problem and success measures before any build.",
    deliverables: ["Business Problem Statement", "Stakeholder Map", "Use Cases", "Objectives", "Success Metrics"],
    raci: { responsible: "Business Owner", accountable: "Executive Sponsor", consulted: "AI Champion", informed: "Transformation Office" } },
  { id: "assess", order: 2, name: "Assess", objective: "Understand risk, data and vendor exposure before committing.",
    deliverables: ["AIRA", "AIIA", "Risk Analysis", "Data Classification", "Vendor Assessment"],
    raci: { responsible: "Risk Officer", accountable: "CAIO", consulted: "CISO / CDPO", informed: "Program Manager" } },
  { id: "design", order: 3, name: "Design", objective: "Define the architecture, controls and gateway posture.",
    deliverables: ["Architecture", "Policies", "Controls", "Gateway Configuration", "Model Selection"],
    raci: { responsible: "Technical Owner", accountable: "CIO", consulted: "CISO / CAIO", informed: "Business Owner" } },
  { id: "build", order: 4, name: "Build", objective: "Develop, test and configure with evidence captured automatically.",
    deliverables: ["Development", "Testing", "Prompt Library", "Agent Configuration"],
    raci: { responsible: "Implementation Team", accountable: "AI Project Manager", consulted: "Technical Owner", informed: "Executive Sponsor" } },
  { id: "validate", order: 5, name: "Validate", objective: "Prove it is safe, compliant and approved by humans.",
    deliverables: ["Security Validation", "Compliance Validation", "Business Validation", "Human Approval"],
    raci: { responsible: "Risk Officer", accountable: "CISO", consulted: "Compliance Officer", informed: "CAIO" } },
  { id: "deploy", order: 6, name: "Deploy", objective: "Controlled go-live with operational readiness confirmed.",
    deliverables: ["Production Approvals", "Go-Live", "Operational Checklist"],
    raci: { responsible: "AI Project Manager", accountable: "Business Unit Head", consulted: "CIO", informed: "CEO / Board" } },
  { id: "operate", order: 7, name: "Operate", objective: "Monitor value, incidents, adoption and feedback continuously.",
    deliverables: ["Usage Monitoring", "ROI Tracking", "Incident Log", "Feedback Collection", "Adoption Tracking", "Continuous Monitoring"],
    raci: { responsible: "Business Owner", accountable: "Business Unit Head", consulted: "Risk Officer", informed: "CAIO" } },
  { id: "scale", order: 8, name: "Scale or Retire", objective: "An executive decision backed by ROI, risk and value evidence.",
    deliverables: ["ROI Review", "Risk Review", "Business Value Review", "Executive Decision", "Knowledge Capture"],
    raci: { responsible: "CAIO", accountable: "CEO", consulted: "CFO / Risk Officer", informed: "Board" } },
];

/* Role-based access into AI Central. Everyone enters; each role sees
   a different lens. One product, multiple perspectives. */
export const AC_RBAC: Record<string, ACRoleAccess> = {
  ceo:  { lens: "Executive",  modules: ["dashboard", "initiatives", "governance", "academy"], focus: "Portfolio, ROI, risk, growth and board metrics" },
  coo:  { lens: "Operations", modules: ["dashboard", "initiatives", "academy"], focus: "Rollout health, adoption and operating exceptions" },
  cfo:  { lens: "Value",      modules: ["dashboard", "initiatives", "governance", "academy"], focus: "Budget utilization, ROI confidence and benefit realization" },
  chro: { lens: "Workforce",  modules: ["dashboard", "initiatives", "academy"], focus: "Readiness, adoption resistance and learning completion" },
  ciso: { lens: "Security",   modules: ["dashboard", "initiatives", "governance", "evidence", "gateway"], focus: "Model security, gateway enforcement and control evidence" },
  caio: { lens: "Governance", modules: ["dashboard", "initiatives", "governance", "evidence", "gateway", "academy"], focus: "Implementation, controls, evidence and lifecycle gates" },
  cio:  { lens: "Delivery",   modules: ["dashboard", "initiatives", "governance", "evidence", "gateway", "academy"], focus: "Delivery, architecture, platform controls and adoption" },
  cdpo: { lens: "Privacy",    modules: ["dashboard", "initiatives", "governance", "evidence"], focus: "DPIAs, data classification and privacy evidence" },
  cgo:  { lens: "Compliance", modules: ["dashboard", "governance", "evidence", "academy"], focus: "Policy compliance, exceptions and audit readiness" },
};

export const acInitiatives: ACInitiativeRecord[] = [
  {
    id: "ai-001", name: "Customer Resolution Copilot", unit: "Customer Operations", category: "GenAI Copilot", lifecycle: "Pilot",
    businessOwner: "Priya Mehta", technicalOwner: "Platform AI", sponsor: "Aisha Patel", champion: "Leila Haddad", cxo: "CAIO, COO, CISO",
    status: "In Progress", priority: "Critical", risk: "High", expected: "$4.8M", actual: "$1.2M", stage: "Governance Review",
    guardrail: 82, adoption: 64, valueScore: 76,
    policies: ["Responsible GenAI Use", "Human Oversight Standard"], controls: ["CTRL-AI-014", "CTRL-SEC-022"], audits: ["AUD-Q2-09"],
    risks: ["Prompt injection", "Data leakage"], roi: "22%", savings: "$1.2M", revenue: "$0.6M", productivity: "18%", training: "68%", resistance: "Medium",
    phaseIndex: 2, phaseArtifactsDone: 3, blockedBy: "CISO prompt-injection evidence due",
  },
  {
    id: "ai-002", name: "Credit Decision Assurance", unit: "Retail Banking", category: "Decision Support", lifecycle: "Implementation",
    businessOwner: "Omar Khan", technicalOwner: "Risk Engineering", sponsor: "Rafael Torres", champion: "Dana Wolfe", cxo: "CEO, CAIO, CRO, Legal",
    status: "Awaiting Approval", priority: "Critical", risk: "Critical", expected: "$7.2M", actual: "$0.9M", stage: "Human Oversight Review",
    guardrail: 74, adoption: 42, valueScore: 69,
    policies: ["High-Risk AI Policy", "Adverse Decision Review"], controls: ["CTRL-AI-001", "CTRL-GRC-044"], audits: ["AUD-EUAI-03"],
    risks: ["Adverse decision harm", "Explainability gap"], roi: "14%", savings: "$0.7M", revenue: "$1.1M", productivity: "11%", training: "54%", resistance: "High",
    phaseIndex: 4, phaseArtifactsDone: 3, blockedBy: "Human oversight design record awaiting approval",
  },
  {
    id: "ai-003", name: "Finance Close Automation", unit: "Finance", category: "Process Automation", lifecycle: "Production",
    businessOwner: "Elena Rossi", technicalOwner: "Enterprise Apps", sponsor: "Marcus Reid", champion: "Tom Adeyemi", cxo: "CFO, CIO, COO",
    status: "Build", priority: "High", risk: "Medium", expected: "$3.1M", actual: "$1.8M", stage: "Build",
    guardrail: 91, adoption: 79, valueScore: 88,
    policies: ["Automation Control Policy", "Audit Evidence Policy"], controls: ["CTRL-FIN-008", "CTRL-AUD-019"], audits: ["AUD-SOX-11"],
    risks: ["Incorrect journal suggestion", "Segregation of duties"], roi: "31%", savings: "$1.8M", revenue: "$0.1M", productivity: "26%", training: "82%", resistance: "Low",
    phaseIndex: 3, phaseArtifactsDone: 4, blockedBy: null,
  },
  {
    id: "ai-004", name: "Workforce Skills Navigator", unit: "People", category: "Recommendation", lifecycle: "Assessment",
    businessOwner: "Hannah Lee", technicalOwner: "Data Science", sponsor: "Niamh Lynch", champion: "Sofia Marin", cxo: "CHRO, CDPO, CAIO",
    status: "Risk Assessment", priority: "Medium", risk: "High", expected: "$2.4M", actual: "$0.2M", stage: "Risk Assessment",
    guardrail: 67, adoption: 31, valueScore: 58,
    policies: ["Employee Data Use", "Fairness and Bias Standard"], controls: ["CTRL-PRV-012", "CTRL-RAI-006"], audits: ["AUD-PRV-02"],
    risks: ["Employee profiling", "Bias in opportunity matching"], roi: "8%", savings: "$0.2M", revenue: "$0", productivity: "7%", training: "39%", resistance: "Medium",
    phaseIndex: 1, phaseArtifactsDone: 2, blockedBy: "Fairness assessment workbook incomplete",
  },
];

export const acGuardrails: ACGuardrailGroup[] = [
  { cat: "Strategic", items: ["Business objective linked", "Executive sponsor required", "Business value hypothesis", "Success metrics defined"] },
  { cat: "Governance", items: ["AI owner assigned", "Risk owner assigned", "Governance review completed", "Policy mapping completed", "AI inventory updated"] },
  { cat: "Compliance", items: ["ISO 42001 checklist", "ISO 27001 checklist", "NIST AI RMF checklist", "GDPR/DPDP checklist", "Regulatory impact assessment"] },
  { cat: "Security", items: ["Data classification completed", "Access control reviewed", "Prompt injection risk reviewed", "Model security review completed", "Vendor risk reviewed"] },
  { cat: "Responsible AI", items: ["Fairness assessment", "Bias assessment", "Explainability assessment", "Transparency statement", "Accountability mapping"] },
  { cat: "Human Oversight", items: ["HITL for critical decisions", "HOTL monitoring", "Human-in-command for high risk", "Escalation owner", "Manual override process"] },
  { cat: "Audit", items: ["Evidence repository updated", "Approval history retained", "Risk decisions logged", "Control testing captured", "Open findings tracked"] },
];

export const acCxoAlignment: ACCxoAlignment[] = [
  { role: "CEO", focus: "Strategic value and enterprise transformation", count: 7, score: 84 },
  { role: "CIO", focus: "Technology architecture and platform readiness", count: 9, score: 78 },
  { role: "CAIO", focus: "AI governance, lifecycle, and adoption", count: 14, score: 82 },
  { role: "CISO", focus: "Cybersecurity, model security, and data leakage risk", count: 8, score: 74 },
  { role: "CFO", focus: "Investment, ROI, and cost optimization", count: 5, score: 80 },
  { role: "CHRO", focus: "Workforce readiness and AI training", count: 4, score: 69 },
  { role: "COO", focus: "Operational adoption and process change", count: 6, score: 76 },
  { role: "CRO", focus: "Enterprise risk and risk acceptance", count: 5, score: 72 },
  { role: "Legal", focus: "Regulatory and policy compliance", count: 10, score: 81 },
];

export const acEvidence: ACEvidenceRecord[] = [
  { item: "Human oversight design record", initiative: "Credit Decision Assurance", scope: "Project", control: "CTRL-AI-001", risk: "Adverse decision harm", owner: "Model Risk", status: "In Review", approval: "Awaiting Approval", version: "v3", time: "2026-06-18 09:20" },
  { item: "Prompt injection test results", initiative: "Customer Resolution Copilot", scope: "Project", control: "CTRL-SEC-022", risk: "Prompt injection", owner: "CISO Office", status: "Complete", approval: "Approved", version: "v2", time: "2026-06-17 16:10" },
  { item: "Fairness assessment workbook", initiative: "Workforce Skills Navigator", scope: "Project", control: "CTRL-RAI-006", risk: "Bias in opportunity matching", owner: "People Analytics", status: "In Progress", approval: "Pending", version: "v1", time: "2026-06-16 11:45" },
  { item: "SOX automation audit sample", initiative: "Finance Close Automation", scope: "Project", control: "CTRL-AUD-019", risk: "Segregation of duties", owner: "Internal Audit", status: "Complete", approval: "Approved", version: "v4", time: "2026-06-15 14:30" },
  { item: "Responsible GenAI use policy", initiative: "Organization-wide", scope: "Organization", control: "POL-RAI-001", risk: "Policy coverage", owner: "Governance Office", status: "Complete", approval: "Approved", version: "v6", time: "2026-06-12 10:05" },
  { item: "Retail Banking model review minutes", initiative: "Business Unit board", scope: "Business Unit", control: "CTRL-GRC-044", risk: "Oversight cadence", owner: "BU Governance", status: "Complete", approval: "Approved", version: "v2", time: "2026-06-10 15:40" },
];

export const gatewayProviders: GatewayProvider[] = [
  { id: "gw-copilot",  name: "Microsoft Copilot", kind: "Copilot",  status: "Approved",   models: ["Copilot for M365"], routedShare: 34, costMtd: "$18.2K" },
  { id: "gw-azure",    name: "Azure OpenAI",      kind: "Cloud",    status: "Approved",   models: ["GPT-4o", "o4-mini"], routedShare: 22, costMtd: "$24.6K" },
  { id: "gw-bedrock",  name: "AWS Bedrock",       kind: "Cloud",    status: "Approved",   models: ["Claude Sonnet", "Titan"], routedShare: 14, costMtd: "$11.9K" },
  { id: "gw-openai",   name: "OpenAI",            kind: "Frontier", status: "Restricted", models: ["GPT-4o (pilot only)"], routedShare: 6, costMtd: "$4.1K" },
  { id: "gw-claude",   name: "Claude",            kind: "Frontier", status: "Approved",   models: ["Claude Opus", "Claude Sonnet"], routedShare: 16, costMtd: "$13.4K" },
  { id: "gw-gemini",   name: "Gemini",            kind: "Frontier", status: "Restricted", models: ["Gemini Pro (eval)"], routedShare: 3, costMtd: "$1.8K" },
  { id: "gw-internal", name: "Internal Models",   kind: "Internal", status: "Approved",   models: ["risk-scorer-v3", "doc-classifier-v2"], routedShare: 5, costMtd: "$2.2K" },
];

export const gatewayPolicies: GatewayPolicy[] = [
  { id: "pol-pii",   name: "PII Detection & Redaction", category: "Data Protection", enforcement: "Redact", triggeredMtd: 1284, status: "Active" },
  { id: "pol-filt",  name: "Prompt Filtering",          category: "Content Safety",  enforcement: "Block", triggeredMtd: 312, status: "Active" },
  { id: "pol-sens",  name: "Sensitive Data Protection", category: "Data Protection", enforcement: "Block", triggeredMtd: 97, status: "Active" },
  { id: "pol-model", name: "Approved Model Allowlist",  category: "Vendor Control",  enforcement: "Block", triggeredMtd: 154, status: "Active" },
  { id: "pol-cost",  name: "Cost & Token Guard",        category: "FinOps",          enforcement: "Route to review", triggeredMtd: 41, status: "Active" },
  { id: "pol-hitl",  name: "High-Risk Prompt Approval", category: "Human Oversight", enforcement: "Route to review", triggeredMtd: 68, status: "Active" },
  { id: "pol-log",   name: "Full Prompt Logging",       category: "Audit",           enforcement: "Log only", triggeredMtd: 48211, status: "Active" },
];

export const gatewayLog: GatewayLogEntry[] = [
  { id: "log-1", time: "14:52", user: "j.rivera", unit: "Customer Operations", provider: "Azure OpenAI", model: "GPT-4o", riskScore: 12, action: "Allowed", policy: "Full Prompt Logging", tokens: 1840 },
  { id: "log-2", time: "14:50", user: "s.okafor", unit: "Retail Banking", provider: "Claude", model: "Claude Sonnet", riskScore: 71, action: "Escalated", policy: "High-Risk Prompt Approval", tokens: 960 },
  { id: "log-3", time: "14:47", user: "m.tanaka", unit: "Finance", provider: "Microsoft Copilot", model: "Copilot for M365", riskScore: 8, action: "Allowed", policy: "Full Prompt Logging", tokens: 410 },
  { id: "log-4", time: "14:44", user: "a.novak", unit: "People", provider: "OpenAI", model: "GPT-4o", riskScore: 64, action: "Redacted", policy: "PII Detection & Redaction", tokens: 1220 },
  { id: "log-5", time: "14:41", user: "d.mensah", unit: "Procurement", provider: "Gemini", model: "Gemini Pro", riskScore: 88, action: "Blocked", policy: "Approved Model Allowlist", tokens: 0 },
  { id: "log-6", time: "14:38", user: "l.fournier", unit: "Customer Operations", provider: "AWS Bedrock", model: "Claude Sonnet", riskScore: 22, action: "Allowed", policy: "Full Prompt Logging", tokens: 2310 },
];

export const gatewayStats = {
  requestsMtd: "412K",
  tokensMtd: "196M",
  costMtd: "$76.2K",
  blockedMtd: 563,
  avgRiskScore: 21,
};

/* Feedback engine seeds: multi-stakeholder scores per initiative that the
   dashboard turns into a Scale / Continue / Improve / Retire recommendation. */
export const acFeedback: Record<string, ACFeedbackScores> = {
  "ai-001": { user: 78, business: 74, executive: 70, risk: 55, operational: 72, value: 76, adoption: 64 },
  "ai-002": { user: 58, business: 62, executive: 66, risk: 38, operational: 54, value: 69, adoption: 42 },
  "ai-003": { user: 86, business: 88, executive: 84, risk: 78, operational: 82, value: 88, adoption: 79 },
  "ai-004": { user: 44, business: 48, executive: 50, risk: 35, operational: 41, value: 58, adoption: 31 },
};

/* Single source of truth for framework posture - referenced by AI Central
   Governance and the Executive Workspace Governance Health section. */
export const AC_FRAMEWORK_POSTURE: FrameworkPosture[] = [
  { id: "iso42001", name: "ISO 42001", score: 74, sub: "AI management system" },
  { id: "iso27001", name: "ISO 27001", score: 79, sub: "Information security" },
  { id: "nist",     name: "NIST AI RMF", score: 71, sub: "Risk management framework" },
  { id: "euai",     name: "EU AI Act", score: 68, sub: "Regulatory conformity" },
  { id: "gdpr",     name: "GDPR", score: 83, sub: "Data protection" },
  { id: "internal", name: "Internal Controls", score: 81, sub: "Enterprise control set" },
];

/* ── Executive Workspace 4.0 intelligence seeds ───────────────── */
export const EXEC_BRIEF: Record<string, ExecBriefEntry> = {
  ceo:{focus:"AI Chief Strategy Officer",headline:"Portfolio is scaling, one initiative needs a board-level call.",
    body:"Enterprise AI maturity rose to 78/100 as two pilots reached scale-readiness. Finance Close Automation is board-pack ready and projects $1.8M value; Customer Resolution Copilot is held pending CISO evidence. One initiative is trending to retirement on weak adoption. Approving the scale package unlocks an estimated 9% portfolio ROI uplift this quarter.",
    deltas:[["AI maturity","up","+6"],["Value realized","up","$3.6M"],["Scale-ready pilots","up","2"],["At-risk initiatives","down","1"]]},
  coo:{focus:"AI Operating Advisor",headline:"Adoption is up but two department rollouts are blocked.",
    body:"Operating adoption reached 64% across active pilots. Finance is ready for its second wave; Retail Banking is at risk on evidence gaps and People shows high change resistance. Clearing the two blocked tasks would return an estimated 26% productivity gain in the affected units.",
    deltas:[["Adoption","up","+4"],["Active pilots","flat","4"],["Blocked tasks","up","3"],["Productivity","up","+18%"]]},
  cfo:{focus:"AI Financial Advisor",headline:"ROI confidence is strong; one business case is under-delivering.",
    body:"Portfolio ROI confidence is 88% with 6% budget variance. Finance Close Automation is beating its business case (+$1.8M realized vs plan). Credit Decision Assurance is behind on benefits with a 14-month payback slipping. A value-recovery review is recommended before the next investment gate.",
    deltas:[["ROI confidence","up","88%"],["Budget variance","down","6%"],["Value realized","up","$3.6M"],["Payback","flat","14mo"]]},
  chro:{focus:"AI Workforce Advisor",headline:"Readiness is improving but one unit is resisting adoption.",
    body:"Enterprise training completion is 68% and AI literacy 77%. Finance shows low resistance and strong uptake; People (HR) has the lowest adoption at 31% with high resistance. Assigning the targeted change program would lift readiness an estimated 14 points in that unit.",
    deltas:[["Training","up","68%"],["AI literacy","up","77%"],["Lowest adoption","down","31%"],["Resistance","flat","1 unit"]]},
  ciso:{focus:"AI Security Operations Advisor",headline:"Security posture improved, but critical evidence is still open.",
    body:"Enterprise security score rose to 72/100 on patch and MFA progress. The AI Gateway blocked 563 policy violations this month and shadow-AI exposure is contained. Customer Resolution Copilot still lacks prompt-injection evidence, blocking its scale gate. Approving the remediation package reduces projected enterprise risk ~18%.",
    deltas:[["Security score","up","+8"],["Blocked prompts","up","563"],["Open risks","down","6"],["Critical evidence","up","1 due"]]},
  caio:{focus:"AI Chief of Staff",headline:"Governance is healthy; two initiatives need a lifecycle decision.",
    body:"AI governance maturity is 72/100 with 7 HITL approvals pending. Finance Close Automation is scale-ready; Workforce Skills Navigator is trending to retirement on weak feedback and adoption. Two governed scale/retire decisions are waiting on you, and one initiative is blocked on missing Phase artifacts.",
    deltas:[["Maturity","up","72"],["HITL pending","flat","7"],["Scale-ready","up","1"],["Retire candidates","up","1"]]},
  cio:{focus:"AI Enterprise Architect",headline:"Platform is stable; integration debt is the next constraint.",
    body:"IT operations score is 74/100 across 47 AI assets. Model routing through the Gateway is balanced across approved providers. Two initiatives depend on integrations not yet hardened for production. Prioritising the architecture review unblocks the Finance scale wave.",
    deltas:[["Ops score","up","+5"],["AI assets","flat","47"],["Roadmap items","flat","12"],["Controls","up","79%"]]},
  cdpo:{focus:"AI Privacy Advisor",headline:"Privacy posture is solid; one DPIA is overdue.",
    body:"Privacy score is 81/100 with 11 DPIAs tracked. PII redaction in the Gateway triggered 1,284 times this month with no confirmed leakage. Workforce Skills Navigator processes employee data and its fairness/DPIA evidence is incomplete, blocking progression. Completing it clears the privacy gate.",
    deltas:[["Privacy score","up","81"],["DPIAs","flat","11"],["PII redactions","up","1284"],["Overdue","up","1"]]},
  cgo:{focus:"AI Growth Advisor",headline:"Governance coverage is up; new AI opportunities are unqualified.",
    body:"Governance coverage rose 5 points across frameworks. The opportunity pipeline holds several unscored ideas with commercial upside. Qualifying the top two use cases would add an estimated $2.4M to the value forecast while staying inside risk appetite.",
    deltas:[["Coverage","up","+5"],["Open risks","down","23"],["Pipeline ideas","up","6"],["Forecast upside","up","$2.4M"]]},
};

export const EXEC_PRIORITIES: Record<string, ExecPriorityItem[]> = {
  ceo:[
    {title:"Approve Finance Close Automation scale package",owner:"Maya Chen",priority:"Critical",due:"Today",impact:"$1.8M value unlock",benefit:"9% portfolio ROI uplift",link:{ac:"initiatives"}},
    {title:"Decide on Workforce Skills Navigator retirement",owner:"Aisha Patel",priority:"High",due:"2 days",impact:"Stops $0.2M sunk spend",benefit:"Frees budget for scale-ready pilots",link:{ac:"initiatives"}},
    {title:"Review board AI risk pack",owner:"Rafael Torres",priority:"Medium",due:"This week",impact:"Board readiness",benefit:"Auto-compiled from evidence",link:{ac:"evidence"}},
  ],
  coo:[
    {title:"Clear Retail Banking evidence blocker",owner:"Omar Khan",priority:"Critical",due:"Today",impact:"Unblocks second wave",benefit:"26% productivity in unit",link:{ac:"initiatives"}},
    {title:"Approve department enablement plan",owner:"Priya Mehta",priority:"High",due:"2 days",impact:"Adoption +12%",benefit:"AI can draft the rollout comms",link:{tab:"hitl"}},
    {title:"Review People change-resistance report",owner:"Hannah Lee",priority:"Medium",due:"This week",impact:"Lowest-adoption unit",benefit:"Targeted learning recommended",link:{tab:"academy"}},
  ],
  cfo:[
    {title:"Approve second-wave budget release",owner:"Elena Rossi",priority:"Critical",due:"Today",impact:"$3.1M program",benefit:"ROI confidence 88%",link:{ac:"initiatives"}},
    {title:"Order value-recovery review: Credit Decision Assurance",owner:"Omar Khan",priority:"High",due:"3 days",impact:"Payback slipping",benefit:"AI drafts the benefits re-forecast",link:{ac:"initiatives"}},
    {title:"Sign off benefits realization evidence",owner:"Internal Audit",priority:"Medium",due:"This week",impact:"Audit readiness",benefit:"Evidence auto-captured",link:{ac:"evidence"}},
  ],
  chro:[
    {title:"Assign change program to People unit",owner:"Hannah Lee",priority:"Critical",due:"Today",impact:"Adoption 31% to 45%",benefit:"AI selects the learning path",link:{tab:"academy"}},
    {title:"Approve AI literacy curriculum update",owner:"L&D",priority:"High",due:"2 days",impact:"Enterprise readiness",benefit:"Completion becomes evidence",link:{tab:"academy"}},
    {title:"Review resistance sentiment by unit",owner:"People Analytics",priority:"Medium",due:"This week",impact:"Early warning",benefit:"AI flags at-risk teams",link:{ac:"dashboard"}},
  ],
  ciso:[
    {title:"Approve prompt-injection remediation package",owner:"Jordan Sinclair",priority:"Critical",due:"Today",impact:"-18% enterprise risk",benefit:"Unblocks Copilot scale gate",link:{ac:"gateway"}},
    {title:"Review 14 critical vulnerabilities",owner:"Security Eng",priority:"High",due:"2 days",impact:"3 initiatives affected",benefit:"AI clusters by root cause",link:{ac:"governance"}},
    {title:"Sign off shadow-AI exposure report",owner:"CISO Office",priority:"Medium",due:"This week",impact:"Gateway coverage",benefit:"Auto-generated from logs",link:{ac:"gateway"}},
  ],
  caio:[
    {title:"Record Finance Close Automation scale decision",owner:"Aisha Patel",priority:"Critical",due:"Today",impact:"Board-pack ready",benefit:"Governed decision + evidence",link:{ac:"initiatives"}},
    {title:"Decide Workforce Skills Navigator: improve or retire",owner:"Aisha Patel",priority:"High",due:"2 days",impact:"Weak feedback score",benefit:"Feedback engine recommends Retire",link:{ac:"initiatives"}},
    {title:"Clear 7 HITL approvals",owner:"CAIO Office",priority:"Medium",due:"This week",impact:"Pipeline flow",benefit:"AI pre-summarises each",link:{tab:"hitl"}},
  ],
  cio:[
    {title:"Approve architecture review for Finance wave",owner:"Marcus Reid",priority:"Critical",due:"Today",impact:"Unblocks production",benefit:"AI maps integration gaps",link:{ac:"initiatives"}},
    {title:"Rationalise model routing policy",owner:"Platform AI",priority:"High",due:"2 days",impact:"Cost + resilience",benefit:"Gateway usage analysed",link:{ac:"gateway"}},
    {title:"Review platform control coverage",owner:"IT GRC",priority:"Medium",due:"This week",impact:"79% to target",benefit:"Evidence auto-captured",link:{ac:"governance"}},
  ],
  cdpo:[
    {title:"Complete Workforce Navigator DPIA",owner:"Niamh Lynch",priority:"Critical",due:"Today",impact:"Clears privacy gate",benefit:"AI drafts the DPIA from template",link:{ac:"evidence"}},
    {title:"Review cross-border data flows",owner:"Privacy Office",priority:"High",due:"3 days",impact:"GDPR Art.44",benefit:"AI maps transfers",link:{ac:"governance"}},
    {title:"Confirm PII redaction thresholds",owner:"Data Protection",priority:"Medium",due:"This week",impact:"Gateway policy",benefit:"1,284 redactions reviewed",link:{ac:"gateway"}},
  ],
  cgo:[
    {title:"Qualify top 2 AI opportunities",owner:"Rafael Torres",priority:"Critical",due:"Today",impact:"+$2.4M forecast",benefit:"AI scores impact/feasibility/risk",link:{ac:"initiatives"}},
    {title:"Approve responsible-use policy update",owner:"Governance Office",priority:"High",due:"2 days",impact:"+12% compliance",benefit:"Policy drafted from kit",link:{ac:"governance"}},
    {title:"Review growth value forecast",owner:"Strategy",priority:"Medium",due:"This week",impact:"Commercialization",benefit:"AI trend analysis",link:{ac:"dashboard"}},
  ],
};

export const EXEC_RECOMMENDATIONS: Record<string, ExecRecommendationItem[]> = {
  ceo:[
    {action:"Scale Finance Close Automation",metric:"Projected ROI",value:"+31%",rationale:"Readiness 88%, evidence 91%, board-pack ready.",link:{ac:"initiatives"}},
    {action:"Retire Workforce Skills Navigator",metric:"Annual savings",value:"$0.2M",rationale:"Weak multi-stakeholder feedback; adoption 31%.",link:{ac:"initiatives"}},
    {action:"Rebalance portfolio to scale-ready pilots",metric:"Portfolio ROI",value:"+9%",rationale:"Two pilots at scale gate; capital better deployed.",link:{ac:"dashboard"}},
  ],
  coo:[
    {action:"Fast-track Finance second wave",metric:"Productivity",value:"+26%",rationale:"Adoption 79%, resistance low, evidence ready.",link:{ac:"initiatives"}},
    {action:"Deploy targeted enablement to People",metric:"Adoption",value:"+14%",rationale:"Lowest-adoption unit with high resistance.",link:{tab:"academy"}},
    {action:"Automate rollout comms",metric:"Cycle time",value:"-3 days",rationale:"AI can draft and personalise department comms.",link:{ac:"initiatives"}},
  ],
  cfo:[
    {action:"Approve second-wave budget",metric:"ROI confidence",value:"88%",rationale:"Value evidence supports controlled rollout.",link:{ac:"initiatives"}},
    {action:"Re-forecast Credit Decision Assurance",metric:"Payback",value:"-2mo",rationale:"Benefits behind plan; recover before gate.",link:{ac:"initiatives"}},
    {action:"Consolidate AI spend via Gateway",metric:"Cost avoidance",value:"$76K/mo",rationale:"Routing and cost guard reduce provider spend.",link:{ac:"gateway"}},
  ],
  chro:[
    {action:"Assign change program to People",metric:"Readiness",value:"+14pts",rationale:"Lowest adoption; targeted learning indicated.",link:{tab:"academy"}},
    {action:"Roll out AI literacy refresh",metric:"Literacy",value:"+8%",rationale:"Completion becomes governance evidence.",link:{tab:"academy"}},
    {action:"Monitor resistance signals",metric:"Early warning",value:"2 teams",rationale:"Sentiment trending down in two units.",link:{ac:"dashboard"}},
  ],
  ciso:[
    {action:"Deploy prompt firewall to Copilot",metric:"Risk reduction",value:"22%",rationale:"Closes prompt-injection exposure; unblocks scale.",link:{ac:"gateway"}},
    {action:"Approve AI procurement policy",metric:"Compliance",value:"+12%",rationale:"Standardises vendor and model controls.",link:{ac:"governance"}},
    {action:"Expand Gateway logging to all units",metric:"Coverage",value:"+11%",rationale:"Reduces shadow-AI blind spots.",link:{ac:"gateway"}},
  ],
  caio:[
    {action:"Scale Finance Close Automation",metric:"Projected ROI",value:"+31%",rationale:"Governed scale decision ready to record.",link:{ac:"initiatives"}},
    {action:"Retire Workforce Skills Navigator",metric:"Annual savings",value:"$0.2M",rationale:"Feedback engine recommends retirement.",link:{ac:"initiatives"}},
    {action:"Auto-generate missing Phase artifacts",metric:"Unblocks",value:"1 initiative",rationale:"Copilot blocked on Design-phase evidence.",link:{ac:"evidence"}},
  ],
  cio:[
    {action:"Harden integrations for Finance wave",metric:"Time to prod",value:"-2 wks",rationale:"Two dependencies not production-ready.",link:{ac:"initiatives"}},
    {action:"Optimise model routing",metric:"Cost",value:"-14%",rationale:"Shift eligible load to internal models.",link:{ac:"gateway"}},
    {action:"Lift platform control coverage",metric:"Coverage",value:"79% to 88%",rationale:"Close gaps flagged in governance.",link:{ac:"governance"}},
  ],
  cdpo:[
    {action:"Generate Workforce Navigator DPIA",metric:"Clears gate",value:"1 blocker",rationale:"AI drafts DPIA from approved template.",link:{ac:"evidence"}},
    {action:"Tighten cross-border transfer controls",metric:"GDPR risk",value:"-1 tier",rationale:"Art.44 mapping incomplete for one flow.",link:{ac:"governance"}},
    {action:"Tune PII redaction sensitivity",metric:"Leakage risk",value:"-9%",rationale:"1,284 redactions; threshold review due.",link:{ac:"gateway"}},
  ],
  cgo:[
    {action:"Qualify top 2 opportunities",metric:"Forecast",value:"+$2.4M",rationale:"Highest impact/feasibility, within appetite.",link:{ac:"initiatives"}},
    {action:"Approve responsible-use policy",metric:"Compliance",value:"+12%",rationale:"Unlocks GenAI adoption across units.",link:{ac:"governance"}},
    {action:"Commercialise Finance Copilot pattern",metric:"New value",value:"$1.1M",rationale:"Proven pattern reusable in Procurement.",link:{ac:"initiatives"}},
  ],
};

export const EXEC_DECISIONS: Record<string, ExecDecisionItem[]> = {
  ceo:[
    {title:"Scale Finance Close Automation to Procurement",context:"Pilot met scale threshold; board pack ready.",impact:"$1.8M value, 88% readiness",risk:"Medium",aiRec:"Approve",evidence:"Scale gate + evidence ledger",link:{ac:"initiatives"}},
    {title:"Retire Workforce Skills Navigator",context:"Weak feedback and adoption after assessment.",impact:"Stops $0.2M spend",risk:"Low",aiRec:"Retire with reason",evidence:"Feedback engine + risk review",link:{ac:"initiatives"}},
  ],
  coo:[
    {title:"Release Retail Banking second wave",context:"Blocked on evidence; value case strong.",impact:"26% productivity",risk:"Medium",aiRec:"Approve after blocker clears",evidence:"Pilot control room",link:{ac:"initiatives"}},
    {title:"Approve People enablement budget",context:"Lowest adoption unit needs change support.",impact:"Adoption +14%",risk:"Low",aiRec:"Approve",evidence:"Academy readiness",link:{tab:"academy"}},
  ],
  cfo:[
    {title:"Release second-wave investment",context:"Finance program value evidence sufficient.",impact:"$3.1M program",risk:"Low",aiRec:"Approve",evidence:"Benefits realization pack",link:{ac:"initiatives"}},
    {title:"Hold Credit Decision Assurance funding",context:"Benefits behind plan; payback slipping.",impact:"Protects ROI",risk:"Medium",aiRec:"Request changes",evidence:"Value re-forecast",link:{ac:"initiatives"}},
  ],
  chro:[
    {title:"Approve People change program",context:"Highest resistance, lowest adoption.",impact:"Readiness +14pts",risk:"Low",aiRec:"Approve",evidence:"Learning completion records",link:{tab:"academy"}},
    {title:"Mandate AI literacy for high-risk roles",context:"Roles exposed to AI decisions need baseline.",impact:"Compliance evidence",risk:"Low",aiRec:"Approve",evidence:"Governance Academy",link:{tab:"academy"}},
  ],
  ciso:[
    {title:"Approve prompt-injection remediation",context:"Copilot blocked on security evidence.",impact:"-18% enterprise risk",risk:"High",aiRec:"Approve",evidence:"Gateway logs + test results",link:{ac:"gateway"}},
    {title:"Restrict two frontier models",context:"Vendor risk review pending on Gemini/OpenAI.",impact:"Reduces exposure",risk:"Medium",aiRec:"Restrict pending review",evidence:"Vendor risk assessment",link:{ac:"gateway"}},
  ],
  caio:[
    {title:"Record Finance scale decision",context:"Governed scale decision ready.",impact:"Unlocks next wave",risk:"Medium",aiRec:"Approve to scale",evidence:"Scale gate captured",link:{ac:"initiatives"}},
    {title:"Retire Workforce Skills Navigator",context:"Feedback engine recommends retirement.",impact:"$0.2M saved",risk:"Low",aiRec:"Retire with reason",evidence:"Feedback + governed decision",link:{ac:"initiatives"}},
  ],
  cio:[
    {title:"Approve architecture review",context:"Finance wave depends on hardened integrations.",impact:"Unblocks production",risk:"Medium",aiRec:"Approve",evidence:"Architecture record",link:{ac:"initiatives"}},
    {title:"Approve model-routing policy change",context:"Shift eligible load to internal models.",impact:"-14% cost",risk:"Low",aiRec:"Approve",evidence:"Gateway analytics",link:{ac:"gateway"}},
  ],
  cdpo:[
    {title:"Approve Workforce Navigator DPIA",context:"Employee-data processing needs sign-off.",impact:"Clears privacy gate",risk:"Medium",aiRec:"Approve after DPIA",evidence:"DPIA + fairness workbook",link:{ac:"evidence"}},
    {title:"Approve cross-border transfer controls",context:"One flow lacks Art.44 mapping.",impact:"GDPR alignment",risk:"Medium",aiRec:"Request changes",evidence:"Transfer impact assessment",link:{ac:"governance"}},
  ],
  cgo:[
    {title:"Approve top opportunity for intake",context:"Highest scored idea, within appetite.",impact:"+$2.4M forecast",risk:"Low",aiRec:"Approve",evidence:"Use-case scoring",link:{ac:"initiatives"}},
    {title:"Approve responsible-use policy",context:"Enables governed GenAI adoption.",impact:"+12% compliance",risk:"Low",aiRec:"Approve",evidence:"Policy pack",link:{ac:"governance"}},
  ],
};

export const ASSISTANT_NUDGES: Record<string, string[]> = {
  ceo:["2 governed decisions are waiting for you.","Finance Close Automation is ready to scale (ROI +31%).","One initiative is trending to retirement - review before the board meeting."],
  coo:["Retail Banking is blocked on evidence - clearing it unlocks the second wave.","People has the lowest AI adoption in the org.","I can draft the department rollout comms for you."],
  cfo:["Second-wave budget release is pending your approval.","Credit Decision Assurance is behind on benefits - want a re-forecast?","AI spend can be reduced ~$76K/mo via the Gateway."],
  chro:["People unit adoption is 31% - a change program is recommended.","Assigning targeted learning could lift readiness 14 points.","3 learning paths are ready to auto-assign."],
  ciso:["Customer Resolution Copilot is missing prompt-injection evidence.","14 critical vulnerabilities span 3 initiatives.","The Gateway blocked 563 policy violations this month."],
  caio:["2 initiatives need a scale/retire decision.","7 HITL approvals are pending - I can pre-summarise each.","Copilot cannot advance to Build - missing Design artifacts."],
  cio:["Finance scale wave is blocked on integration hardening.","Model routing can be optimised for -14% cost.","Platform control coverage is 79% against target."],
  cdpo:["Workforce Navigator DPIA is overdue - I can draft it.","One cross-border flow lacks Art.44 mapping.","PII redaction threshold review is due."],
  cgo:["2 high-value opportunities are unqualified in the pipeline.","Qualifying them adds ~$2.4M to the forecast.","The responsible-use policy update is ready to approve."],
};


/* Authored root-cause intelligence for KPI and domain-metric labels.
   Metrics without an entry fall back to an honest derived summary -
   nothing is fabricated per-metric at render time. */
export const KPI_INSIGHTS: Record<string, ExecKpiInsight> = {
  "Mean Time to Detect (MTTD)": { rootCause: "Alert triage backlog after SIEM rule expansion doubled event volume.", impact: "Slower detection widens the breach exposure window across all AI workloads.", aiRec: "Auto-tune the new rule set and route AI-workload alerts to the priority queue.", link: { ac: "gateway" } },
  "Mean Time to Respond (MTTR)": { rootCause: "Escalations wait on manual approval outside business hours.", impact: "Response delay increases incident cost and audit findings.", aiRec: "Enable pre-approved containment playbooks for P1 AI incidents.", link: { ac: "governance" } },
  "Critical Patch SLA": { rootCause: "Two legacy inference hosts cannot take live patches.", impact: "91% vs 96% target leaves critical CVEs open past SLA.", aiRec: "Schedule maintenance windows and isolate the two hosts behind the Gateway.", link: { ac: "governance" } },
  "Security Score": { rootCause: "Open prompt-injection evidence and 8 cloud misconfigurations drag the composite.", impact: "Blocks the Copilot scale gate and weakens board posture.", aiRec: "Approve the remediation package - projected -18% enterprise risk.", link: { ac: "governance" } },
  "MFA Coverage": { rootCause: "Contractor accounts in two business units remain on legacy auth.", impact: "94% vs 100% target is the top identity finding for audit.", aiRec: "Enforce MFA at the identity provider for the remaining 6%.", link: { ac: "governance" } },
  "Vendor Risk Index": { rootCause: "Two frontier-model vendors pending security review.", impact: "Unreviewed vendors carry data-handling risk into pilots.", aiRec: "Keep both restricted in the Gateway until reviews close.", link: { ac: "gateway" } },
  "Misconfiguration Count": { rootCause: "Drift after the last infrastructure release bypassed policy-as-code checks.", impact: "8 open misconfigurations expose storage and network paths.", aiRec: "Re-run the compliance scan and gate releases on policy checks.", link: { ac: "governance" } },
  "Cybersecurity Score": { rootCause: "Patch and MFA progress offset by open critical vulnerabilities.", impact: "Score gates enterprise scale decisions on two initiatives.", aiRec: "Prioritise the 14 critical vulnerabilities clustered on 3 initiatives.", link: { ac: "governance" } },
  "Threat Detection (MTTD)": { rootCause: "Alert triage backlog after SIEM rule expansion.", impact: "Detection delay widens exposure on AI workloads.", aiRec: "Auto-tune rules; prioritise AI-workload alerts.", link: { ac: "gateway" } },
  "Patch Compliance": { rootCause: "Legacy hosts excluded from automated patching.", impact: "SLA misses accumulate audit findings.", aiRec: "Isolate legacy hosts and automate the remainder.", link: { ac: "governance" } },
  "Open Vulnerabilities": { rootCause: "14 criticals concentrated in 3 AI initiatives.", impact: "Blocks scale gates and raises enterprise risk.", aiRec: "Approve the clustered remediation package.", link: { ac: "governance" } },
  "EU AI Act Conformity": { rootCause: "High-risk classification evidence incomplete for one credit system.", impact: "Conformity gap delays production approval in the EU.", aiRec: "Complete the Art.9 risk evidence via the Assess phase artifacts.", link: { ac: "evidence" } },
  "Model Cards Complete": { rootCause: "10 of 17 models lack completed cards after registry import.", impact: "Incomplete cards fail ISO 42001 documentation checks.", aiRec: "Auto-draft the 10 missing cards from registry metadata.", link: { ac: "evidence" } },
  "Fairness Score": { rootCause: "Bias findings open on the workforce recommendation model.", impact: "Blocks the People initiative at the Assess gate.", aiRec: "Complete the fairness workbook before any progression.", link: { ac: "initiatives" } },
  "HITL Override Rate": { rootCause: "Operators overriding low-confidence copilot suggestions.", impact: "Rising overrides signal model quality drift.", aiRec: "Retrain on override samples; review confidence thresholds.", link: { ac: "initiatives" } },
  "Drift Detection Cvg.": { rootCause: "Two production models not yet wired to drift monitoring.", impact: "Undetected drift risks silent decision degradation.", aiRec: "Extend monitoring via the Operate-phase checklist.", link: { ac: "initiatives" } },
  "Avg. Model Accuracy": { rootCause: "Stable across production models this quarter.", impact: "Supports scale decisions with quality evidence.", aiRec: "Maintain monitoring cadence; no action required.", link: { ac: "initiatives" } },
  "Audit Readiness Score": { rootCause: "Evidence completeness at 67% across active initiatives.", impact: "Gaps extend audit preparation time.", aiRec: "Close the two overdue evidence packs first.", link: { ac: "evidence" } },
  "Consent Validity": { rootCause: "Legacy consent records predate the current notice version.", impact: "Invalid consent risks GDPR processing findings.", aiRec: "Trigger re-consent for the affected cohort.", link: { ac: "governance" } },
  "DSAR Closure (avg.)": { rootCause: "Manual redaction slows subject-access responses.", impact: "Closure time trending toward the statutory limit.", aiRec: "Use Gateway PII detection to pre-redact DSAR bundles.", link: { ac: "gateway" } },
  "Data Classification": { rootCause: "Unclassified legacy datasets in two business units.", impact: "Unclassified data cannot enter AI pipelines compliantly.", aiRec: "Run auto-classification before pipeline admission.", link: { ac: "governance" } },
  "Residency Violations": { rootCause: "One cross-border flow lacks Art.44 transfer mapping.", impact: "Residency breach risk in one jurisdiction.", aiRec: "Complete the transfer impact assessment.", link: { ac: "governance" } },
  "Vendor DPA Compliance": { rootCause: "Two AI vendors on outdated data-processing agreements.", impact: "DPA gaps transfer privacy risk to the enterprise.", aiRec: "Renew DPAs before the next procurement gate.", link: { ac: "governance" } },
  "System Availability": { rootCause: "Stable; no AI-platform incidents this period.", impact: "Meets operational SLOs for AI workloads.", aiRec: "No action - continue monitoring.", link: { ac: "dashboard" } },
  "Ticket SLA (P1)": { rootCause: "P1 volume up after the last rollout wave.", impact: "SLA pressure on the operations team.", aiRec: "Deploy the support copilot pattern to deflect P1 triage.", link: { ac: "initiatives" } },
  "Change Failure Rate": { rootCause: "Failures concentrated in un-gated integration changes.", impact: "Rework slows the delivery roadmap.", aiRec: "Gate changes on the Design-phase architecture checks.", link: { ac: "initiatives" } },
  "Cloud Cost Savings": { rootCause: "Model routing shifted eligible load to internal models.", impact: "Savings fund the next pilot wave.", aiRec: "Extend routing optimisation to remaining workloads.", link: { ac: "gateway" } },
  "Automation Coverage": { rootCause: "Two eligible processes await automation approval.", impact: "Unrealised productivity in operations.", aiRec: "Approve the queued automation business cases.", link: { ac: "initiatives" } },
  "GRC Maturity Level": { rootCause: "Control coverage strong; exception handling still manual.", impact: "Manual exceptions slow governance throughput.", aiRec: "Automate exception workflow with HITL approval.", link: { ac: "governance" } },
  "Regulatory Compliance": { rootCause: "EU AI Act conformity is the lagging framework.", impact: "Drags the composite below target.", aiRec: "Close the Art.9 evidence gap on the credit system.", link: { ac: "governance" } },
  "Audit Findings Closed": { rootCause: "Two findings wait on initiative-level evidence.", impact: "Open findings extend the audit cycle.", aiRec: "Auto-attach phase artifacts to both findings.", link: { ac: "evidence" } },
  "Board Pack On-Time": { rootCause: "Manual compilation from multiple sources.", impact: "Late packs compress board review time.", aiRec: "Generate the pack from the evidence repository.", link: { ac: "evidence" } },
  "Enterprise Risk Score": { rootCause: "Concentration risk in two critical AI initiatives.", impact: "Drives the enterprise appetite discussion.", aiRec: "Rebalance via the scale/retire decisions pending.", link: { ac: "initiatives" } },
  "RTO Achievement": { rootCause: "Recovery tests passing for all AI platform services.", impact: "Resilience evidence ready for audit.", aiRec: "No action - schedule next test cycle.", link: { ac: "evidence" } },
  "Vendor Risk Assessed": { rootCause: "Assessment backlog cleared except frontier vendors.", impact: "Remaining gap concentrated in two vendors.", aiRec: "Complete the two open frontier-vendor reviews.", link: { ac: "gateway" } },
};
