import type {
  ACCxoAlignment,
  DeploymentMode,
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
  ACPmoRecord,
  ACPhaseTemplate,
  ACRoleAccess,
  GatewayLogEntry,
  GatewayRetentionConfig,
  GatewayRoutingRule,
  GuardrailDetector,
  KnowledgeAsset,
  KriRecord,
  RiskRecord,
  GovEngine,
  EngineOutcome,
  PlaybookLens,
  ExecQuickAction,
  ExecRecentChange,
  GatewayPolicy,
  GatewayProvider,
  WorkbenchConversation,
} from "./types";

/* ── AI Central operating layer data ──────────────────────────── */

/* Standard implementation phases. Every initiative follows these.
   Missing mandatory artifacts prevent progression to the next phase. */
export const AC_PHASES: ACPhaseTemplate[] = [
  { id: "opportunity", order: 1, name: "Opportunity", objective: "Frame the business opportunity and who it serves before anything is built.",
    deliverables: ["Opportunity Statement", "Business Problem", "Stakeholder Map", "Initial Value Hypothesis"],
    raci: { responsible: "Business Owner", accountable: "Executive Sponsor", consulted: "AI Champion", informed: "CAIO" } },
  { id: "businesscase", order: 2, name: "Business Case", objective: "Prove the investment is worth making - ROI, budget, benefits and success measures.",
    deliverables: ["Business Case", "Expected ROI Model", "Budget", "Benefits Map", "Success Metrics"],
    raci: { responsible: "Business Owner", accountable: "CFO", consulted: "CAIO", informed: "Board" } },
  { id: "discovery", order: 3, name: "Discovery", objective: "Understand the data, feasibility and vendor landscape before committing to a design.",
    deliverables: ["Data Discovery", "Use Case Definition", "Feasibility Assessment", "Vendor Scan", "Data Classification"],
    raci: { responsible: "Data Science", accountable: "CAIO", consulted: "CDPO / CISO", informed: "Business Owner" } },
  { id: "architecture", order: 4, name: "Architecture", objective: "Define the solution, model selection, integrations and gateway posture.",
    deliverables: ["Solution Architecture", "Model Selection", "Integration Design", "Gateway Configuration"],
    raci: { responsible: "Technical Owner", accountable: "CIO", consulted: "CISO / CAIO", informed: "Business Owner" } },
  { id: "governance", order: 5, name: "Governance", objective: "Assess risk and impact, map policies and select controls before any build.",
    deliverables: ["Risk Assessment (AIRA)", "AI Impact Assessment", "DPIA", "Policy Mapping", "Control Selection", "Risk Treatment Plan"],
    raci: { responsible: "Risk Officer", accountable: "CAIO", consulted: "CISO / CDPO / Legal", informed: "Executive Sponsor" } },
  { id: "development", order: 6, name: "Development", objective: "Build and configure with evidence captured automatically as work completes.",
    deliverables: ["Development", "Prompt Library", "Agent Configuration", "Unit Evidence"],
    raci: { responsible: "Implementation Team", accountable: "AI Project Manager", consulted: "Technical Owner", informed: "CAIO" } },
  { id: "testing", order: 7, name: "Testing", objective: "Prove it is safe, fair, secure and signed off by humans before exposure.",
    deliverables: ["Test Plan", "Bias & Fairness Testing", "Security / Red-Team Results", "Human Oversight Design", "UAT Sign-off"],
    raci: { responsible: "QA / Risk Officer", accountable: "CISO", consulted: "Compliance Officer", informed: "CAIO" } },
  { id: "pilot", order: 8, name: "Pilot", objective: "Run controlled real-world use with HITL gates and structured feedback.",
    deliverables: ["Pilot Plan", "HITL Configuration", "Pilot Metrics", "Feedback Log"],
    raci: { responsible: "Business Owner", accountable: "CAIO", consulted: "Risk Officer", informed: "Executive Sponsor" } },
  { id: "deployment", order: 9, name: "Deployment", objective: "Controlled go-live with approvals, rollback and operational readiness confirmed.",
    deliverables: ["Production Approvals", "Go-Live Checklist", "Rollback Plan", "Operational Runbook"],
    raci: { responsible: "AI Project Manager", accountable: "Business Unit Head", consulted: "CIO", informed: "CEO / Board" } },
  { id: "monitoring", order: 10, name: "Monitoring", objective: "Watch value, drift, incidents, KRIs and adoption continuously in production.",
    deliverables: ["Usage Monitoring", "KRI Tracking", "Incident Log", "Drift Reports", "Adoption Tracking"],
    raci: { responsible: "Business Owner", accountable: "Business Unit Head", consulted: "Risk Officer", informed: "CAIO" } },
  { id: "optimization", order: 11, name: "Optimization", objective: "Tune performance and cost, act on feedback, retrain where the evidence says so.",
    deliverables: ["Performance Tuning", "Cost Optimization", "Retraining Records", "Feedback Actions"],
    raci: { responsible: "Technical Owner", accountable: "CIO", consulted: "Business Owner", informed: "CFO" } },
  { id: "scale", order: 12, name: "Scale", objective: "A governed executive decision to expand, backed by ROI, risk and value evidence.",
    deliverables: ["Scale Decision Record", "Expansion Plan", "ROI Review", "Risk Review", "Readiness Evidence"],
    raci: { responsible: "CAIO", accountable: "CEO", consulted: "CFO / Risk Officer", informed: "Board" } },
  { id: "retire", order: 13, name: "Retire", objective: "A governed end of life - decommission, capture knowledge, archive evidence.",
    deliverables: ["Retirement Decision Record", "Decommission Plan", "Knowledge Capture", "Lessons Learned", "Evidence Archive"],
    raci: { responsible: "Technical Owner", accountable: "CAIO", consulted: "Business Owner", informed: "Board" } },
];

/* Role-based access into AI Central. Everyone enters; each role sees
   a different lens. One product, multiple perspectives. */
export const AC_RBAC: Record<string, ACRoleAccess> = {
  ceo:  { lens: "Executive",  modules: ["dashboard", "initiatives", "pmo", "models", "portfolio", "governance", "academy"], focus: "Portfolio, ROI, risk, growth and board metrics" },
  coo:  { lens: "Operations", modules: ["dashboard", "initiatives", "pmo", "academy"], focus: "Rollout health, adoption and operating exceptions" },
  cfo:  { lens: "Value",      modules: ["dashboard", "initiatives", "pmo", "models", "portfolio", "governance", "academy"], focus: "Budget utilization, ROI confidence and benefit realization" },
  chro: { lens: "Workforce",  modules: ["dashboard", "initiatives", "academy"], focus: "Readiness, adoption resistance and learning completion" },
  ciso: { lens: "Security",   modules: ["dashboard", "initiatives", "models", "governance", "evidence", "gateway"], focus: "Model security, gateway enforcement and control evidence" },
  caio: { lens: "Governance", modules: ["dashboard", "initiatives", "pmo", "models", "approvals", "portfolio", "governance", "evidence", "gateway", "admin", "academy"], focus: "Implementation, controls, evidence and lifecycle gates" },
  cio:  { lens: "Delivery",   modules: ["dashboard", "initiatives", "pmo", "models", "approvals", "portfolio", "governance", "evidence", "gateway", "admin", "academy"], focus: "Delivery, architecture, platform controls and adoption" },
  cdpo: { lens: "Privacy",    modules: ["dashboard", "initiatives", "governance", "evidence"], focus: "DPIAs, data classification and privacy evidence" },
  cgo:  { lens: "Compliance", modules: ["dashboard", "initiatives", "governance", "evidence", "academy"], focus: "Policy compliance, exceptions and audit readiness" },
  employee: { lens: "Operations", modules: ["dashboard"], focus: "Your governed AI activity" },
  manager:  { lens: "Operations", modules: ["dashboard"], focus: "Team adoption and governed usage" },
};

export const acInitiatives: ACInitiativeRecord[] = [
  {
    id: "ai-001", name: "Customer Resolution Copilot", unit: "Customer Operations", category: "GenAI Copilot", lifecycle: "Pilot",
    businessOwner: "Priya Mehta", technicalOwner: "Platform AI", sponsor: "Aisha Patel", champion: "Leila Haddad", cxo: "CAIO, COO, CISO",
    status: "In Progress", priority: "Critical", risk: "High", expected: "$4.8M", actual: "$1.2M", stage: "Governance Review",
    guardrail: 82, adoption: 64, valueScore: 76,
    policies: ["Responsible GenAI Use", "Human Oversight Standard"], controls: ["CTRL-AI-014", "CTRL-SEC-022"], audits: ["AUD-Q2-09"],
    risks: ["Prompt injection", "Data leakage"], roi: "22%", savings: "$1.2M", revenue: "$0.6M", productivity: "18%", training: "68%", resistance: "Medium",
    problem: "Customer resolution takes 11 minutes on average and 28% of cases need a second contact - cost and churn are climbing.",
    vision: "Every customer conversation resolved in one contact, with AI drafting compliant responses agents approve in seconds.",
    objective: "Cut average handle time 40% and second-contact rate below 12% by Q4 FY26 while meeting EU AI Act oversight duties.",
    budget: "$2.1M", spent: "$1.3M", timeline: "Jan 2026 - Nov 2026",
    successMetrics: ["AHT -40%", "Second-contact <12%", "CSAT +8pts", "HITL override <5%"],
    phaseIndex: 4, phaseArtifactsDone: 4, blockedBy: "CISO prompt-injection evidence due",
  },
  {
    id: "ai-002", name: "Credit Decision Assurance", unit: "Retail Banking", category: "Decision Support", lifecycle: "Implementation",
    businessOwner: "Omar Khan", technicalOwner: "Risk Engineering", sponsor: "Rafael Torres", champion: "Dana Wolfe", cxo: "CEO, CAIO, CRO, Legal",
    status: "Awaiting Approval", priority: "Critical", risk: "Critical", expected: "$7.2M", actual: "$0.9M", stage: "Human Oversight Review",
    guardrail: 74, adoption: 42, valueScore: 69,
    policies: ["High-Risk AI Policy", "Adverse Decision Review"], controls: ["CTRL-AI-001", "CTRL-GRC-044"], audits: ["AUD-EUAI-03"],
    risks: ["Adverse decision harm", "Explainability gap"], roi: "14%", savings: "$0.7M", revenue: "$1.1M", productivity: "11%", training: "54%", resistance: "High",
    problem: "Manual credit reviews average 6 days, decline reasons are inconsistent, and adverse-decision appeals are rising.",
    vision: "Consistent, explainable credit decisions in under 24 hours with human accountability on every adverse outcome.",
    objective: "Approve 70% of applications same-day with zero unexplained adverse decisions, fully EU AI Act Art.6 conformant.",
    budget: "$3.4M", spent: "$1.9M", timeline: "Oct 2025 - Dec 2026",
    successMetrics: ["Same-day decisions 70%", "Appeal rate -30%", "Explainability 100%", "Zero regulatory findings"],
    phaseIndex: 6, phaseArtifactsDone: 3, blockedBy: "Human oversight design record awaiting approval",
  },
  {
    id: "ai-003", name: "Finance Close Automation", unit: "Finance", category: "Process Automation", lifecycle: "Production",
    businessOwner: "Elena Rossi", technicalOwner: "Enterprise Apps", sponsor: "Marcus Reid", champion: "Tom Adeyemi", cxo: "CFO, CIO, COO",
    status: "Build", priority: "High", risk: "Medium", expected: "$3.1M", actual: "$1.8M", stage: "Build",
    guardrail: 91, adoption: 79, valueScore: 88,
    policies: ["Automation Control Policy", "Audit Evidence Policy"], controls: ["CTRL-FIN-008", "CTRL-AUD-019"], audits: ["AUD-SOX-11"],
    risks: ["Incorrect journal suggestion", "Segregation of duties"], roi: "31%", savings: "$1.8M", revenue: "$0.1M", productivity: "26%", training: "82%", resistance: "Low",
    problem: "Month-end close takes 9 working days; 60% of close effort is manual reconciliation and journal preparation.",
    vision: "A five-day close where AI prepares reconciliations and journals and controllers focus on judgment calls.",
    objective: "Close in 5 days by FY26 year-end with SOX-clean automation evidence and zero unreviewed AI journal postings.",
    budget: "$1.6M", spent: "$1.1M", timeline: "Aug 2025 - Sep 2026",
    successMetrics: ["Close 9d to 5d", "Manual recs -60%", "SOX exceptions 0", "Controller hours -35%"],
    phaseIndex: 10, phaseArtifactsDone: 3, blockedBy: null,
  },
  {
    id: "ai-004", name: "Workforce Skills Navigator", unit: "People", category: "Recommendation", lifecycle: "Assessment",
    businessOwner: "Hannah Lee", technicalOwner: "Data Science", sponsor: "Niamh Lynch", champion: "Sofia Marin", cxo: "CHRO, CDPO, CAIO",
    status: "Risk Assessment", priority: "Medium", risk: "High", expected: "$2.4M", actual: "$0.2M", stage: "Risk Assessment",
    guardrail: 67, adoption: 31, valueScore: 58,
    policies: ["Employee Data Use", "Fairness and Bias Standard"], controls: ["CTRL-PRV-012", "CTRL-RAI-006"], audits: ["AUD-PRV-02"],
    risks: ["Employee profiling", "Bias in opportunity matching"], roi: "8%", savings: "$0.2M", revenue: "$0", productivity: "7%", training: "39%", resistance: "Medium",
    problem: "Internal mobility is at 9% and skills data is stale - roles are filled externally while capable employees are invisible.",
    vision: "Every employee sees a fair, bias-tested path to their next role; every manager sees the skills they already have.",
    objective: "Lift internal fill rate to 25% within 12 months with a fairness-assessed recommendation engine under CHRO oversight.",
    budget: "$0.9M", spent: "$0.3M", timeline: "Mar 2026 - Mar 2027",
    successMetrics: ["Internal fill 25%", "Fairness parity >0.95", "Profile coverage 90%", "Attrition -3pts"],
    phaseIndex: 4, phaseArtifactsDone: 2, blockedBy: "Fairness assessment workbook incomplete",
  },
];


export const acPmo: Record<string, ACPmoRecord> = {
  "ai-001": {
    milestones: [
      { name: "Governance evidence pack accepted", due: "Aug 08", status: "At Risk" },
      { name: "Pilot cohort expansion (250 agents)", due: "Sep 05", status: "On Track" },
      { name: "Scale-gate review", due: "Oct 17", status: "Not Started" },
    ],
    raid: [
      { kind: "Risk", item: "Prompt injection via pasted customer content", owner: "CISO Office", status: "Treatment in progress" },
      { kind: "Assumption", item: "Anthropic API latency stays under 800ms P95", owner: "Platform AI", status: "Holding" },
      { kind: "Issue", item: "CISO prompt-injection evidence overdue", owner: "L. Haddad", status: "Open - blocking" },
      { kind: "Dependency", item: "Contact-platform SSO upgrade (IT-2214)", owner: "CIO Office", status: "Due Aug 01" },
    ],
    decisions: [
      { decision: "Approve expansion to billing queries", by: "A. Patel", date: "Jul 08", rationale: "Pilot CSAT +9pts, override rate 3.1%" },
      { decision: "Reject autonomous send - human approval stays", by: "CISO", date: "Jun 20", rationale: "EU AI Act oversight duty" },
    ],
    resources: [
      { role: "Product lead", name: "Priya Mehta", allocation: "100%" },
      { role: "ML engineer", name: "Platform AI pod (3)", allocation: "80%" },
      { role: "Compliance partner", name: "GRC - D. Osei", allocation: "40%" },
    ],
    meetings: [
      { name: "Steering committee", cadence: "Monthly", next: "Aug 04" },
      { name: "Delivery stand-up", cadence: "Daily", next: "Tomorrow 09:30" },
      { name: "Risk & controls review", cadence: "Bi-weekly", next: "Jul 29" },
    ],
    changeRequests: [
      { id: "CR-014", title: "Add refunds intent to scope", impact: "+$0.2M, +3 weeks", status: "Awaiting sponsor" },
      { id: "CR-011", title: "Swap toxicity filter vendor", impact: "Cost neutral", status: "Approved" },
    ],
    sprint: { name: "Sprint 14", dates: "Jul 21 - Aug 01", goal: "Close governance evidence gaps; ship agent feedback loop", committed: 21, done: 9 },
  },
  "ai-002": {
    milestones: [
      { name: "Human-oversight design sign-off", due: "Jul 30", status: "At Risk" },
      { name: "Parallel-run vs manual decisions", due: "Sep 12", status: "Not Started" },
      { name: "Art.43 conformity assessment", due: "Nov 21", status: "Not Started" },
    ],
    raid: [
      { kind: "Risk", item: "Adverse decision harm without explanation", owner: "CRO", status: "Control design" },
      { kind: "Assumption", item: "Historic decisions are a lawful training base", owner: "Legal", status: "Under review" },
      { kind: "Issue", item: "Oversight design record awaiting approval", owner: "O. Khan", status: "Open - blocking" },
      { kind: "Dependency", item: "Fraud screen shares feature store", owner: "Risk Engineering", status: "Aligned" },
    ],
    decisions: [
      { decision: "Dual-model challenger retired", by: "R. Torres", date: "Jun 27", rationale: "Champion meets fairness bar; cost -18%" },
    ],
    resources: [
      { role: "Business owner", name: "Omar Khan", allocation: "60%" },
      { role: "Risk engineering", name: "Squad Delta (4)", allocation: "100%" },
      { role: "Legal counsel", name: "T. Brandt", allocation: "25%" },
    ],
    meetings: [
      { name: "Credit risk board", cadence: "Monthly", next: "Aug 11" },
      { name: "Model validation sync", cadence: "Weekly", next: "Jul 25" },
    ],
    changeRequests: [
      { id: "CR-021", title: "Extend to SME lending", impact: "+$0.9M, new Annex III scope", status: "Deferred to FY27" },
    ],
    sprint: { name: "Sprint 9", dates: "Jul 14 - Jul 25", goal: "Oversight workflow build + reason-code library", committed: 18, done: 13 },
  },
  "ai-003": {
    milestones: [
      { name: "Optimization phase artifacts complete", due: "Aug 15", status: "On Track" },
      { name: "FY26 close dry-run at 5 days", due: "Sep 26", status: "On Track" },
      { name: "Scale decision - all entities", due: "Oct 10", status: "Not Started" },
    ],
    raid: [
      { kind: "Risk", item: "Incorrect journal suggestion posts unreviewed", owner: "Controller", status: "Mitigated - dual approval" },
      { kind: "Assumption", item: "ERP API rate limits hold at close peak", owner: "Enterprise Apps", status: "Validated" },
      { kind: "Dependency", item: "SOX evidence automation (AUD-SOX-11)", owner: "Internal Audit", status: "On track" },
    ],
    decisions: [
      { decision: "Scale to EMEA entities approved", by: "M. Reid", date: "Jul 02", rationale: "Close time -3.5 days in pilot; zero SOX exceptions" },
    ],
    resources: [
      { role: "Finance owner", name: "Elena Rossi", allocation: "50%" },
      { role: "Automation engineers", name: "Enterprise Apps (2)", allocation: "70%" },
    ],
    meetings: [
      { name: "Close excellence council", cadence: "Monthly", next: "Aug 06" },
    ],
    changeRequests: [
      { id: "CR-008", title: "Add intercompany matching", impact: "+$0.15M", status: "Approved" },
    ],
    sprint: { name: "Sprint 18", dates: "Jul 21 - Aug 01", goal: "Variance-analysis copilot to controller UAT", committed: 15, done: 11 },
  },
  "ai-004": {
    milestones: [
      { name: "Fairness assessment workbook complete", due: "Aug 01", status: "At Risk" },
      { name: "Works-council consultation", due: "Aug 22", status: "On Track" },
      { name: "Pilot - Engineering org", due: "Oct 03", status: "Not Started" },
    ],
    raid: [
      { kind: "Risk", item: "Bias in opportunity matching", owner: "CDPO", status: "Assessment running" },
      { kind: "Assumption", item: "Employees opt in at >60%", owner: "CHRO Office", status: "Survey pending" },
      { kind: "Issue", item: "Fairness workbook incomplete", owner: "S. Marin", status: "Open - blocking" },
      { kind: "Dependency", item: "HRIS skills taxonomy v2", owner: "People Systems", status: "Due Aug 15" },
    ],
    decisions: [
      { decision: "No manager-visible ranking of employees", by: "N. Lynch", date: "Jun 12", rationale: "Profiling risk; recommendations only" },
    ],
    resources: [
      { role: "People lead", name: "Hannah Lee", allocation: "80%" },
      { role: "Data science", name: "DS pod (2)", allocation: "60%" },
      { role: "Privacy counsel", name: "CDPO - M. Novak", allocation: "30%" },
    ],
    meetings: [
      { name: "People-AI ethics board", cadence: "Monthly", next: "Aug 13" },
      { name: "Delivery sync", cadence: "Weekly", next: "Jul 28" },
    ],
    changeRequests: [],
    sprint: { name: "Sprint 5", dates: "Jul 14 - Jul 25", goal: "Complete fairness workbook; taxonomy mapping", committed: 12, done: 5 },
  },
};

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
  employee:{focus:"AI Workbench Copilot",headline:"Your governed AI workbench is ready.",body:"Every prompt is policy-checked, enriched with enterprise knowledge and routed to an approved model.",deltas:[["Prompts","up","84"],["Time saved","up","11.5h"],["Blocked","flat","3"],["Leaks","flat","0"]]},
  manager:{focus:"Team AI Adoption Advisor",headline:"Team adoption is healthy; one unit needs support.",body:"Aggregated team usage shows strong productivity gains with zero data leakage.",deltas:[["Adoption","up","64%"],["Value","up","$1.2M"],["Compliance","up","92%"],["Blocked","flat","3"]]},
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
  caio:{focus:"Veris Intelligence",headline:"Governance is healthy; two initiatives need a lifecycle decision.",
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
  employee:[
    {title:"Continue your risk register draft",owner:"You",priority:"Medium",due:"Today",impact:"Evidence auto-captured",benefit:"Enriched with the risk library",link:{tab:"workbench"}},
    {title:"Review your masked-content warning",owner:"You",priority:"Medium",due:"Today",impact:"Prompt hygiene",benefit:"Learn what triggered the mask",link:{tab:"aiusage"}},
  ],
  manager:[
    {title:"Review team adoption trend",owner:"You",priority:"Medium",due:"This week",impact:"Adoption 64%",benefit:"Aggregates only - no prompt content",link:{tab:"aiusage"}},
    {title:"Assign training to close the gap",owner:"You",priority:"Medium",due:"This week",impact:"People unit lagging",benefit:"Auto-recommended learning path",link:{tab:"aiusage"}},
  ],
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
  employee:["Your prompts are governed - sensitive data is masked before leaving the boundary.","Drafting a register, assessment or policy auto-creates evidence.","Try the approved prompt library for faster, safer results."],
  manager:["Team adoption is 64% - the People unit lags behind.","3 prompts were blocked this month; nothing left the boundary.","Private prompt content stays hidden - you see aggregates only."],
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

/* ── Employee Workspace / Enterprise AI Gateway config ────────── */

/* Configurable routing: which provider serves which scope. */
export const gatewayRouting: GatewayRoutingRule[] = [
  { id: "rt-hr",    scope: "People (HR)",     providerId: "gw-copilot",  reason: "M365-native workflows and HR document context" },
  { id: "rt-eng",   scope: "Engineering",     providerId: "gw-claude",   reason: "Code reasoning quality and long-context reviews" },
  { id: "rt-legal", scope: "Legal",           providerId: "gw-azure",    reason: "EU data boundary and contractual DPA" },
  { id: "rt-fin",   scope: "Finance",         providerId: "gw-azure",    reason: "SOX-scoped tenant isolation" },
  { id: "rt-cust",  scope: "Customer Operations", providerId: "gw-bedrock", reason: "Latency and regional deployment" },
  { id: "rt-high",  scope: "High Risk",       providerId: "gw-internal", reason: "Confidential workloads never leave the enterprise" },
];

/* Sensitive-content detectors and their configured actions. */
export const guardrailDetectors: GuardrailDetector[] = [
  { id: "det-pii",   name: "PII Detection",                action: "Redact",  triggeredMtd: 1284 },
  { id: "det-phi",   name: "PHI Detection",                action: "Block",   triggeredMtd: 42 },
  { id: "det-pci",   name: "PCI / Card Data",              action: "Block",   triggeredMtd: 17 },
  { id: "det-fin",   name: "Financial Data",               action: "Warn",    triggeredMtd: 236 },
  { id: "det-code",  name: "Source Code",                  action: "Warn",    triggeredMtd: 388 },
  { id: "det-cred",  name: "Credentials & API Keys",       action: "Block",   triggeredMtd: 61 },
  { id: "det-doc",   name: "Confidential Documents",       action: "Require justification", triggeredMtd: 149 },
  { id: "det-cust",  name: "Sensitive Customer Data",      action: "Mask",    triggeredMtd: 512 },
  { id: "det-trade", name: "Trade Secrets",                action: "Escalate", triggeredMtd: 9 },
];

export const deploymentModes: DeploymentMode[] = [
  { id: "mode-workspace", name: "Enterprise Workspace", desc: "Prompts intercepted inside VerisZone before any model call.", status: "Active" },
  { id: "mode-copilot",   name: "Microsoft Copilot Integration", desc: "Consume Copilot telemetry via Graph, Purview and Defender APIs.", status: "Available" },
  { id: "mode-api",       name: "API Gateway", desc: "Enterprise applications call the VerisZone Gateway before invoking models.", status: "Active" },
  { id: "mode-ext",       name: "Browser Extension", desc: "Inspect prompts on external AI sites: warn, block, redact, log.", status: "Planned" },
  { id: "mode-byol",      name: "Bring Your Own LLM", desc: "Any compatible endpoint configured as a connector - no redesign required.", status: "Available" },
];

export const gatewayRetention: GatewayRetentionConfig[] = [
  { setting: "Prompt storage",        value: "Metadata only", note: "Raw prompt text is not retained by default policy" },
  { setting: "Conversation retention", value: "90 days",      note: "Configurable per business unit and classification" },
  { setting: "Evidence retention",     value: "7 years",      note: "Aligned to enterprise audit policy" },
  { setting: "Regional compliance",    value: "EU / US",      note: "Requests pinned to the user's data region" },
  { setting: "Manager prompt access",  value: "Disabled",     note: "Aggregates only; content review requires explicit permission" },
];

/* Internal Knowledge Engine: enterprise assets used for prompt enrichment.
   Every approved artifact can graduate into this repository. */
export const knowledgeAssets: KnowledgeAsset[] = [
  { id: "ka-genai",   title: "Responsible GenAI Use Policy",        kind: "Policy",               sourceRef: "POL-RAI-001 v6",        addedBy: "Governance Office", reuseCount: 312 },
  { id: "ka-iso",     title: "ISO 42001 Control Checklist",         kind: "Framework",            sourceRef: "ISO 42001 workspace",   addedBy: "CAIO Office",       reuseCount: 214 },
  { id: "ka-nist",    title: "NIST AI RMF Mapping",                 kind: "Framework",            sourceRef: "Compliance scorecard",  addedBy: "CAIO Office",       reuseCount: 168 },
  { id: "ka-risklib", title: "Enterprise AI Risk Library",          kind: "Risk Library",         sourceRef: "AIRA register",         addedBy: "Risk Office",        reuseCount: 190 },
  { id: "ka-riskreg", title: "Credit Decision risk register",       kind: "Evidence",             sourceRef: "ai-002 Assess phase",   addedBy: "Auto-captured",      reuseCount: 57 },
  { id: "ka-dpia",    title: "DPIA / Privacy Assessment Template",  kind: "Template",             sourceRef: "CAIO-1008",             addedBy: "Privacy Office",     reuseCount: 84 },
  { id: "ka-lessons", title: "Finance Close Automation lessons",    kind: "Lessons Learned",      sourceRef: "ai-003 Operate phase",  addedBy: "Auto-captured",      reuseCount: 73 },
  { id: "ka-arch",    title: "AI Reference Architecture Standard",  kind: "Architecture Standard", sourceRef: "Design phase kit",     addedBy: "CIO Office",         reuseCount: 121 },
  { id: "ka-prompts", title: "Approved Prompt Library",             kind: "Prompt Library",       sourceRef: "Build phase artifacts", addedBy: "Platform AI",        reuseCount: 402 },
  { id: "ka-play",    title: "Pilot-to-Scale Playbook",             kind: "Playbook",             sourceRef: "Governance Library",    addedBy: "Transformation Office", reuseCount: 95 },
];

/* Seeded workbench conversations - Demo Center only; real employee
   workspaces start clean per the tenant data policy. */
export const demoConversations: WorkbenchConversation[] = [
  {
    id: "cv-risk", title: "AI Risk Register - Copilot rollout", unit: "Engineering", project: "Customer Resolution Copilot",
    initiativeId: "ai-001", providerId: "gw-claude", model: "Claude Sonnet", classification: "Confidential",
    created: "2026-07-18", lastActivity: "Today 14:02", riskScore: 34, policyDecision: "Allowed with enrichment",
    evidenceLinks: 2, retention: "90 days",
    messages: [
      { id: "m1", from: "user", text: "Create an AI risk register for the Customer Resolution Copilot pilot." },
      { id: "m2", from: "assistant", text: "Drafted a 12-entry risk register aligned to your enterprise risk library. Prompt-injection and data-leakage entries inherit controls CTRL-AI-014 and CTRL-SEC-022 from the initiative record; residual scores follow the ISO 42001 scale your risk office uses.", enrichedWith: ["Enterprise AI Risk Library", "ISO 42001 Control Checklist", "Credit Decision risk register", "Responsible GenAI Use Policy"] },
      { id: "m3", from: "user", text: "Add the customer PII exposure scenario. Sample record: jordan.smith@example.com, account 4556-9871-2201-8834." },
      { id: "m4", from: "assistant", text: "Added the PII exposure scenario. Your sample contained live-looking card data - it was masked before leaving the enterprise boundary and the register entry references the redacted token instead.", guardrail: { action: "Masked", detector: "PCI / Card Data" }, enrichedWith: ["Enterprise AI Risk Library"] },
    ],
  },
  {
    id: "cv-agent", title: "AI Agent design - invoice triage", unit: "Finance", project: "Finance Close Automation",
    initiativeId: "ai-003", providerId: "gw-azure", model: "GPT-4o", classification: "Internal",
    created: "2026-07-19", lastActivity: "Today 11:40", riskScore: 18, policyDecision: "Allowed",
    evidenceLinks: 1, retention: "90 days",
    messages: [
      { id: "m1", from: "user", text: "Design an agent that triages incoming invoices and routes exceptions to controllers." },
      { id: "m2", from: "assistant", text: "Proposed a three-step agent aligned to the AI Reference Architecture Standard: classify, match against PO, route exceptions with HITL approval for amounts over threshold. Segregation-of-duties controls from the Finance Close initiative are pre-mapped.", enrichedWith: ["AI Reference Architecture Standard", "Finance Close Automation lessons", "Approved Prompt Library"] },
    ],
  },
  {
    id: "cv-sales", title: "Sales proposal - Nordic bank", unit: "Customer Operations", project: "Regional expansion",
    initiativeId: null, providerId: "gw-bedrock", model: "Claude Sonnet", classification: "Internal",
    created: "2026-07-20", lastActivity: "Yesterday", riskScore: 12, policyDecision: "Allowed",
    evidenceLinks: 0, retention: "90 days",
    messages: [
      { id: "m1", from: "user", text: "Draft a proposal summary for the Nordic bank opportunity using our standard structure." },
      { id: "m2", from: "assistant", text: "Draft ready using the approved proposal template. Compliance positioning references your EU AI Act conformity posture; no client-confidential data was needed from outside the enterprise boundary.", enrichedWith: ["Approved Prompt Library", "Pilot-to-Scale Playbook"] },
    ],
  },
  {
    id: "cv-legal", title: "Legal review - vendor DPA", unit: "Legal", project: "Vendor onboarding",
    initiativeId: null, providerId: "gw-azure", model: "GPT-4o", classification: "Restricted",
    created: "2026-07-17", lastActivity: "2 days ago", riskScore: 41, policyDecision: "Justification recorded",
    evidenceLinks: 1, retention: "30 days",
    messages: [
      { id: "m1", from: "user", text: "Summarise the differences between this vendor DPA draft and our standard clauses." },
      { id: "m2", from: "assistant", text: "This conversation is classified Restricted: a business justification was recorded and the confidential document stayed within the EU boundary. Three clause deviations found - liability cap, sub-processor notice period and audit rights.", guardrail: { action: "Justification required", detector: "Confidential Documents" }, enrichedWith: ["Responsible GenAI Use Policy"] },
    ],
  },
];

/* Employee usage rollup - Demo Center seed; derived live in real tenants. */
export const employeeUsageSeed = {
  timeSavedHrs: 11.5, prompts: 84, blocked: 3, warnings: 6, successRate: 93,
  knowledgeReuse: 61, topSkills: ["Risk drafting", "Proposal writing", "Agent design"],
  preferredModels: ["Claude Sonnet", "GPT-4o"], learningProgress: 68,
};

/* ── Canonical risk register ─────────────────────────────────────
   Risk Center is the system of record. Every risk carries its owning
   initiative (or business unit for enterprise risks), accountable
   executive, controls, frameworks and treatment plan. The former AIRA
   register, AIRT treatments and per-initiative risk lists are merged
   here - owned once, viewed many times. */
export const riskRegister: RiskRecord[] = [
  { id: "RSK-001", title: "Prompt injection", system: "Customer Resolution Copilot", category: "Model Security",
    initiativeId: "ai-001", unit: "Customer Operations", execOwner: "CISO", riskOwner: "Platform AI",
    likelihood: 4, impact: 4, residual: 9, level: "High", status: "Treating",
    frameworks: ["ISO 42001 C.8.2", "OWASP LLM01", "NIST AI RMF MS-2"], controls: ["CTRL-SEC-022", "CTRL-AI-014"], kris: ["KRI-01"],
    desc: "Adversarial prompts could override system instructions and exfiltrate data or trigger unapproved actions in the copilot.",
    treatment: { strategy: "Mitigate", action: "Gateway prompt-shield detectors, output filtering and red-team evidence pack before pilot exit. CISO evidence due.", owner: "CISO", deadline: "May 24", status: "In Progress", priority: "Critical" },
    aiRecommendation: "Hold pilot-exit approval until the red-team evidence lands; detector block-rate is trending down 12% week over week." },
  { id: "RSK-002", title: "Data leakage via prompts", system: "Customer Resolution Copilot", category: "Data Privacy",
    initiativeId: "ai-001", unit: "Customer Operations", execOwner: "CDPO", riskOwner: "Priya Mehta",
    likelihood: 3, impact: 5, residual: 8, level: "High", status: "Treating",
    frameworks: ["ISO 42001 C.7.2", "GDPR Art.5"], controls: ["CTRL-AI-014"], kris: ["KRI-01"],
    desc: "Agents may paste customer PII into prompts; unmasked data could reach an external model provider.",
    treatment: { strategy: "Mitigate", action: "Gateway masking for PII and card patterns; retention limited to 30 days; DLP audit weekly.", owner: "CDPO", deadline: "May 18", status: "In Progress", priority: "High" },
    aiRecommendation: "Masking now intercepts 100% of card patterns in the log sample - keep weekly DLP audit until two clean cycles." },
  { id: "RSK-003", title: "Bias and fairness - differential response quality", system: "Customer Resolution Copilot", category: "Bias & Fairness",
    initiativeId: "ai-001", unit: "Customer Operations", execOwner: "CAIO", riskOwner: "Leila Haddad",
    likelihood: 4, impact: 5, residual: 12, level: "Critical", status: "Treating",
    frameworks: ["ISO 42001 C.8.2", "EU AI Act Art.9"], controls: ["CTRL-RAI-006"], kris: ["KRI-04"],
    desc: "Bias testing found disproportionate response quality for non-native English speakers. Art.9 risk management must document this.",
    treatment: { strategy: "Mitigate", action: "Continuous bias monitoring with automated alerts; retrain on balanced dataset; fairness guardrails pre-go-live.", owner: "CAIO", deadline: "May 15", status: "In Progress", priority: "Critical" },
    aiRecommendation: "Bias alert rate is above threshold - recommend blocking Scale until two consecutive weeks under 2.5 alerts/1k." },
  { id: "RSK-004", title: "Adverse decision harm", system: "Credit Decision Assurance", category: "Consumer Harm",
    initiativeId: "ai-002", unit: "Retail Banking", execOwner: "CEO", riskOwner: "Omar Khan",
    likelihood: 3, impact: 5, residual: 10, level: "High", status: "Open",
    frameworks: ["EU AI Act Art.14", "GDPR Art.22"], controls: ["CTRL-AI-001", "CTRL-GRC-044"], kris: ["KRI-02"],
    desc: "An incorrect automated credit decision has direct legal effect on a customer. Human oversight design is still awaiting approval.",
    treatment: { strategy: "Mitigate", action: "HITL review for all adverse decisions; oversight design record to be approved; quarterly outcome audit.", owner: "Risk Engineering", deadline: "Jun 5", status: "Planned", priority: "Critical" },
    aiRecommendation: "This is the initiative's approval blocker - expedite the human-oversight design record; every week of delay defers $138k of expected value." },
  { id: "RSK-005", title: "Explainability gap", system: "Credit Decision Assurance", category: "Transparency",
    initiativeId: "ai-002", unit: "Retail Banking", execOwner: "CAIO", riskOwner: "Legal",
    likelihood: 3, impact: 5, residual: 9, level: "High", status: "Treating",
    frameworks: ["EU AI Act Art.13", "GDPR Art.22", "ISO 42001 C.8.4"], controls: ["CTRL-GRC-044"], kris: ["KRI-02"],
    desc: "Decision logic is opaque to affected individuals; Art.22 requires a meaningful explanation for automated decisions with legal effect.",
    treatment: { strategy: "Mitigate", action: "SHAP explainability layer; automated Art.22 decision explanations; legal disclosure template; model card update.", owner: "CAIO / Legal", deadline: "May 30", status: "In Progress", priority: "High" },
    aiRecommendation: "Pair the SHAP rollout with the oversight record (RSK-004) - both feed the same Art.14 approval gate." },
  { id: "RSK-006", title: "Incorrect journal suggestion", system: "Finance Close Automation", category: "Financial Accuracy",
    initiativeId: "ai-003", unit: "Finance", execOwner: "CFO", riskOwner: "Elena Rossi",
    likelihood: 2, impact: 4, residual: 4, level: "Medium", status: "Monitored",
    frameworks: ["SOX 404", "ISO 42001 C.9.1"], controls: ["CTRL-FIN-008", "CTRL-AUD-019"], kris: ["KRI-03"],
    desc: "A wrong automated journal entry could misstate financials; all suggestions post through controller review.",
    treatment: { strategy: "Mitigate", action: "Controller review gate on every suggested entry; monthly accuracy sampling into the SOX audit trail.", owner: "Enterprise Apps", deadline: "Ongoing", status: "Complete", priority: "Medium" },
    aiRecommendation: "Controls are effective and drift is low - no action needed; keep monthly sampling as scale evidence." },
  { id: "RSK-007", title: "Segregation of duties", system: "Finance Close Automation", category: "Process Control",
    initiativeId: "ai-003", unit: "Finance", execOwner: "CFO", riskOwner: "Enterprise Apps",
    likelihood: 2, impact: 4, residual: 4, level: "Medium", status: "Monitored",
    frameworks: ["SOX 404", "ISO 27001 A.5"], controls: ["CTRL-FIN-008"], kris: [],
    desc: "The automation must never both propose and approve an entry; role separation is enforced at the workflow layer.",
    treatment: { strategy: "Mitigate", action: "Workflow-enforced role separation; quarterly access review evidence into the audit pack.", owner: "Enterprise Apps", deadline: "Ongoing", status: "Complete", priority: "Medium" },
    aiRecommendation: "Include the Q2 access review in the scale decision pack - it is the last SoD evidence item." },
  { id: "RSK-008", title: "Employee profiling", system: "Workforce Skills Navigator", category: "Data Privacy",
    initiativeId: "ai-004", unit: "People", execOwner: "CDPO", riskOwner: "Hannah Lee",
    likelihood: 3, impact: 4, residual: 9, level: "High", status: "Open",
    frameworks: ["GDPR Art.35", "ISO 42001 C.7.2"], controls: ["CTRL-PRV-012"], kris: [],
    desc: "Skill recommendations could constitute employee profiling; a DPIA is required before any rollout beyond assessment.",
    treatment: { strategy: "Mitigate", action: "Complete DPIA; purpose limitation in the data contract; works-council briefing before pilot.", owner: "CDPO", deadline: "Jun 20", status: "Planned", priority: "High" },
    aiRecommendation: "Sequence the DPIA before the fairness workbook completes so both gate artifacts land in the same phase review." },
  { id: "RSK-009", title: "Bias in opportunity matching", system: "Workforce Skills Navigator", category: "Bias & Fairness",
    initiativeId: "ai-004", unit: "People", execOwner: "CHRO", riskOwner: "Data Science",
    likelihood: 4, impact: 4, residual: 12, level: "High", status: "Treating",
    frameworks: ["EU AI Act Annex III", "ISO 42001 C.8.4"], controls: ["CTRL-RAI-006"], kris: ["KRI-04"],
    desc: "Employment-related AI is High-Risk under EU AI Act Annex III; the fairness assessment workbook is incomplete and blocks the phase gate.",
    treatment: { strategy: "Mitigate", action: "Complete the fairness assessment workbook; bias testing across protected attributes; conformity path decision.", owner: "Data Science", deadline: "Jun 15", status: "In Progress", priority: "High" },
    aiRecommendation: "This blocker holds the initiative in Assessment - the workbook is 60% complete; two analyst-weeks close it." },
  { id: "RSK-010", title: "Unmasked PII in training data", system: "Fraud Detection Model", category: "Data Privacy",
    initiativeId: null, unit: "Security", execOwner: "CISO", riskOwner: "ML Engineering",
    likelihood: 2, impact: 4, residual: 5, level: "Medium", status: "Treating",
    frameworks: ["ISO 42001 C.7.2", "GDPR Art.5"], controls: ["CTRL-PRV-012"], kris: [],
    desc: "The fraud model's training dataset contains unmasked PII; provenance and bias documentation are incomplete.",
    treatment: { strategy: "Mitigate", action: "Differential-privacy anonymisation of the training set; performance re-validation; C.7.2 documentation update.", owner: "CISO / ML Eng", deadline: "Jun 1", status: "In Progress", priority: "Medium" },
    aiRecommendation: "Onboard this model into AI Central as a governed initiative - it currently runs outside the lifecycle." },
  { id: "RSK-011", title: "Confident incorrect summaries", system: "Document Summarisation AI", category: "Hallucination",
    initiativeId: null, unit: "Operations", execOwner: "COO", riskOwner: "Product",
    likelihood: 3, impact: 3, residual: 5, level: "Medium", status: "Monitored",
    frameworks: ["ISO 42001 C.9.1"], controls: ["CTRL-AI-014"], kris: ["KRI-03"],
    desc: "Summaries can be confidently wrong; decisions made on fabricated content in legal or financial contexts are the exposure.",
    treatment: { strategy: "Accept", action: "Mandatory human review in legal/financial contexts; confidence score displayed; hallucination rate tracked.", owner: "Product", deadline: "Done", status: "Complete", priority: "Medium" },
    aiRecommendation: "Accepted with controls - revisit if the hallucination KRI worsens for two consecutive months." },
  { id: "RSK-012", title: "Unsafe maintenance prediction", system: "Predictive Maintenance AI", category: "Safety",
    initiativeId: null, unit: "Operations", execOwner: "COO", riskOwner: "Engineering",
    likelihood: 2, impact: 5, residual: 6, level: "Medium", status: "Treating",
    frameworks: ["EU AI Act Annex III", "ISO 42001 C.8.5"], controls: ["CTRL-SEC-022"], kris: [],
    desc: "An incorrect prediction could contribute to equipment failure and physical harm; potential High-Risk classification.",
    treatment: { strategy: "Mitigate", action: "Hard safety threshold override; fail-safe mode for critical equipment; C.8.5 kill-switch deployment.", owner: "Engineering", deadline: "Jun 30", status: "Planned", priority: "Medium" },
    aiRecommendation: "Classify under Annex III now - if High-Risk, the kill-switch becomes a mandatory control, not an enhancement." },
];

/* Key risk indicators - each linked to the initiative and framework it protects. */
export const kriRegister: KriRecord[] = [
  { id: "KRI-01", name: "Guardrail violation rate", value: 1.8, unit: "% of calls", threshold: 2.0, direction: "above", trend: "improving", initiativeId: "ai-001", framework: "ISO 42001 C.9.1" },
  { id: "KRI-02", name: "HITL override rate", value: 6.4, unit: "% of decisions", threshold: 5.0, direction: "above", trend: "worsening", initiativeId: "ai-002", framework: "EU AI Act Art.14" },
  { id: "KRI-03", name: "Model drift index", value: 0.12, unit: "PSI", threshold: 0.2, direction: "above", trend: "stable", initiativeId: "ai-003", framework: "ISO 42001 C.9.1" },
  { id: "KRI-04", name: "Bias alert rate", value: 3.1, unit: "per 1k responses", threshold: 2.5, direction: "above", trend: "worsening", initiativeId: "ai-004", framework: "EU AI Act Art.9" },
  { id: "KRI-05", name: "Evidence coverage", value: 87, unit: "% of controls", threshold: 85, direction: "below", trend: "improving", initiativeId: null, framework: "ISO 42001 C.7.5" },
  { id: "KRI-06", name: "Incident response MTTR", value: 26, unit: "hours", threshold: 24, direction: "above", trend: "improving", initiativeId: null, framework: "NIST AI RMF MG-4" },
];

/* ── Governance engines: VerisZone IP ───────────────────────────
   Every AI initiative automatically runs the cascade. The engines are
   never navigation - their outcomes surface in Risk Center assessments,
   dashboards, reports and recommendations. */
export const AI_GOV_ENGINES: GovEngine[] = [
  { code: "AiOA", name: "AI Opportunity Assessment", question: "Is this opportunity worth qualifying?", owner: "CGO / Business Owner" },
  { code: "AiIA", name: "AI Impact Assessment", question: "Who and what does this system affect?", owner: "CAIO / Risk Officer" },
  { code: "AiRA", name: "AI Risk Assessment", question: "What can go wrong and how badly?", owner: "Risk Officer" },
  { code: "AiSA", name: "AI Security Assessment", question: "Can it be attacked or leak data?", owner: "CISO" },
  { code: "AiPA", name: "AI Privacy Assessment", question: "Is personal data processed lawfully?", owner: "CDPO" },
  { code: "AiCA", name: "AI Compliance Assessment", question: "Which frameworks apply and are we covered?", owner: "Compliance Officer" },
  { code: "AiGA", name: "AI Governance Assessment", question: "Are ownership, oversight and evidence in place?", owner: "CAIO" },
  { code: "AiRT", name: "AI Risk Treatment", question: "Are the risks being driven down?", owner: "Risk Officer" },
];

/* Engine outcomes per initiative - derived from the same facts the
   register and lifecycle already hold. One truth, another view. */
export const acAssessments: Record<string, EngineOutcome[]> = {
  "ai-001": [
    { engine: "AiOA", score: 88, status: "Complete", outcome: "Qualified: high-volume support workload, $4.8M value hypothesis validated.", drill: { surface: "aicentral", hint: "Opportunity record" } },
    { engine: "AiIA", score: 81, status: "Complete", outcome: "Customer-facing GenAI; affects customers and agents; human handoff required.", drill: { surface: "riskcenter", hint: "Impact drives RSK-001..003" } },
    { engine: "AiRA", score: 76, status: "Complete", outcome: "3 risks registered (1 Critical bias, 2 High). Inherent 20/25 max.", drill: { surface: "riskcenter", hint: "RSK-001, RSK-002, RSK-003" } },
    { engine: "AiSA", score: 64, status: "In Progress", outcome: "Prompt-shield live; red-team evidence pack outstanding (CISO).", drill: { surface: "riskcenter", hint: "RSK-001 treatment" } },
    { engine: "AiPA", score: 79, status: "Complete", outcome: "PII masking at gateway verified; 30-day retention set.", drill: { surface: "riskcenter", hint: "RSK-002 treatment" } },
    { engine: "AiCA", score: 82, status: "Complete", outcome: "ISO 42001 + EU AI Act mapping complete; Art.9 documentation current.", drill: { surface: "compliance", hint: "Framework posture" } },
    { engine: "AiGA", score: 82, status: "Complete", outcome: "Owners assigned, HITL configured, evidence flowing. Guardrail 82%.", drill: { surface: "aicentral", hint: "Governance module" } },
    { engine: "AiRT", score: 58, status: "In Progress", outcome: "3 treatments running; bias monitoring live, red-team pack due May 24.", drill: { surface: "riskcenter", hint: "Treatments tab" } },
  ],
  "ai-002": [
    { engine: "AiOA", score: 90, status: "Complete", outcome: "Qualified: $7.2M value in decision assurance; board-sponsored.", drill: { surface: "aicentral", hint: "Opportunity record" } },
    { engine: "AiIA", score: 68, status: "Complete", outcome: "High impact: automated decisions with legal effect on customers (Art.22).", drill: { surface: "riskcenter", hint: "Impact drives RSK-004/005" } },
    { engine: "AiRA", score: 71, status: "Complete", outcome: "2 High risks: adverse decision harm, explainability gap.", drill: { surface: "riskcenter", hint: "RSK-004, RSK-005" } },
    { engine: "AiSA", score: 77, status: "Complete", outcome: "Internal model, no external exposure; access controls verified.", drill: { surface: "riskcenter", hint: "Security controls" } },
    { engine: "AiPA", score: 74, status: "Complete", outcome: "Art.22 processing basis documented; disclosure template with Legal.", drill: { surface: "riskcenter", hint: "RSK-005 treatment" } },
    { engine: "AiCA", score: 70, status: "In Progress", outcome: "EU AI Act high-risk conformity path open; Art.14 oversight pending.", drill: { surface: "compliance", hint: "EU AI Act row" } },
    { engine: "AiGA", score: 66, status: "In Progress", outcome: "Human-oversight design record awaiting approval - blocks Testing exit.", drill: { surface: "aicentral", hint: "Approval gate" } },
    { engine: "AiRT", score: 52, status: "In Progress", outcome: "SHAP explainability in build; HITL review gate planned for Jun 5.", drill: { surface: "riskcenter", hint: "Treatments tab" } },
  ],
  "ai-003": [
    { engine: "AiOA", score: 92, status: "Complete", outcome: "Qualified: close-cycle automation, clear SOX-safe value case.", drill: { surface: "aicentral", hint: "Opportunity record" } },
    { engine: "AiIA", score: 89, status: "Complete", outcome: "Internal process impact only; controller review preserves accountability.", drill: { surface: "riskcenter", hint: "Impact record" } },
    { engine: "AiRA", score: 90, status: "Complete", outcome: "2 Medium risks, both mitigated to residual 4/25.", drill: { surface: "riskcenter", hint: "RSK-006, RSK-007" } },
    { engine: "AiSA", score: 91, status: "Complete", outcome: "No external model calls; SoD enforced at workflow layer.", drill: { surface: "riskcenter", hint: "RSK-007" } },
    { engine: "AiPA", score: 93, status: "Complete", outcome: "No personal data in scope beyond employee IDs; retention compliant.", drill: { surface: "riskcenter", hint: "Privacy record" } },
    { engine: "AiCA", score: 90, status: "Complete", outcome: "SOX 404 evidence trail automated; monthly sampling in audit pack.", drill: { surface: "compliance", hint: "SOX controls" } },
    { engine: "AiGA", score: 91, status: "Complete", outcome: "Guardrail 91%; evidence complete through Optimization.", drill: { surface: "aicentral", hint: "Governance module" } },
    { engine: "AiRT", score: 88, status: "Complete", outcome: "All treatments complete; controls monitored, drift low.", drill: { surface: "riskcenter", hint: "Treatments tab" } },
  ],
  "ai-004": [
    { engine: "AiOA", score: 74, status: "Complete", outcome: "Qualified with conditions: $2.4M value dependent on adoption.", drill: { surface: "aicentral", hint: "Opportunity record" } },
    { engine: "AiIA", score: 55, status: "In Progress", outcome: "Employment-related AI - EU AI Act Annex III high-risk classification.", drill: { surface: "riskcenter", hint: "Impact drives RSK-008/009" } },
    { engine: "AiRA", score: 61, status: "Complete", outcome: "2 High risks: profiling and bias in matching. Residual 9-12/25.", drill: { surface: "riskcenter", hint: "RSK-008, RSK-009" } },
    { engine: "AiSA", score: 78, status: "Complete", outcome: "Internal deployment; access limited to People analytics group.", drill: { surface: "riskcenter", hint: "Security controls" } },
    { engine: "AiPA", score: 48, status: "In Progress", outcome: "DPIA overdue - required before any rollout beyond assessment.", drill: { surface: "riskcenter", hint: "RSK-008 treatment" } },
    { engine: "AiCA", score: 63, status: "In Progress", outcome: "Annex III conformity path undecided; fairness workbook incomplete.", drill: { surface: "compliance", hint: "EU AI Act row" } },
    { engine: "AiGA", score: 67, status: "In Progress", outcome: "Guardrail 67%; fairness assessment blocks the Governance gate.", drill: { surface: "aicentral", hint: "Phase gate" } },
    { engine: "AiRT", score: 44, status: "Scheduled", outcome: "Treatment plan drafted; starts once fairness workbook lands.", drill: { surface: "riskcenter", hint: "Treatments tab" } },
  ],
};

/* Playbook role lenses - same project, different perspective. */
export const PLAYBOOK_LENS: Record<string, PlaybookLens> = {
  ceo: { title: "Business value lens", angle: "What outcome does this phase protect or unlock?",
    phaseGuidance: { early: "Confirm the value hypothesis and sponsor accountability before money flows.", mid: "Watch evidence quality - a weak gate now becomes a board problem at scale.", late: "Scale only where value is proven; retirement is a governed decision, not a failure." } },
  cfo: { title: "Financial lens", angle: "Where does the money go and when does it come back?",
    phaseGuidance: { early: "Lock the business case, budget and payback assumptions in this phase.", mid: "Track burn vs plan; testing and pilot are where forecasts slip first.", late: "Compare realized ROI to the case before releasing second-wave budget." } },
  cio: { title: "Architecture lens", angle: "Will this hold up in production?",
    phaseGuidance: { early: "Set integration and platform decisions here - retrofits cost 5x later.", mid: "Deployment readiness: rollback, runbooks and latency budgets are gate items.", late: "Optimization and routing decisions belong to the platform, not the project." } },
  ciso: { title: "Security lens", angle: "Can it be attacked, and would we know?",
    phaseGuidance: { early: "Classify data and threat-model before architecture hardens.", mid: "Red-team evidence and prompt-shield results gate Testing exit.", late: "Production monitoring must alert on injection and leakage patterns." } },
  caio: { title: "Governance lens", angle: "Is the lifecycle evidence complete?",
    phaseGuidance: { early: "Ownership, policy mapping and the assessment cascade start here.", mid: "No phase advances with missing mandatory artifacts - no exceptions.", late: "The scale/retire gate consumes everything this playbook produced." } },
  coo: { title: "Operations lens", angle: "Does the operation absorb this without breaking?",
    phaseGuidance: { early: "Map the process change and capacity impact before build.", mid: "Pilot with the receiving team, not around them - SLA impact surfaces here.", late: "Monitoring owns incident trends; scale follows operational stability." } },
  chro: { title: "Workforce lens", angle: "Are the people ready and willing?",
    phaseGuidance: { early: "Identify affected roles and resistance early - it prices the change program.", mid: "Training completion gates pilot exit as much as any technical artifact.", late: "Adoption tells the truth about value; invest in the lagging unit." } },
  cdpo: { title: "Privacy lens", angle: "Is personal data processed lawfully end to end?",
    phaseGuidance: { early: "DPIA and data classification are Governance-phase gate items.", mid: "Verify masking and retention in Testing with real traffic patterns.", late: "Monitoring includes sensitive-prompt and consent drift signals." } },
  cgo: { title: "Growth lens", angle: "Does this compound into the pipeline?",
    phaseGuidance: { early: "Qualify hard - unqualified opportunities pollute the portfolio.", mid: "Capture lessons as reusable assets while they are cheap.", late: "A scaled initiative should seed the next two qualified opportunities." } },
};

/* Dashboard quick actions - every action lands on a real surface. */
export const EXEC_QUICK_ACTIONS: Record<string, ExecQuickAction[]> = {
  ceo: [ { label: "Review board decisions", tab: "home" }, { label: "Open portfolio", tab: "aicentral", ac: "portfolio" }, { label: "Generate board pack", tab: "reports" }, { label: "Strategic risks", tab: "riskcenter" } ],
  cfo: [ { label: "Portfolio ROI", tab: "aicentral", ac: "portfolio" }, { label: "Export portfolio CSV", tab: "reports" }, { label: "Financial risks", tab: "riskcenter" }, { label: "Business cases", tab: "playbook" } ],
  cio: [ { label: "Delivery status", tab: "aicentral", ac: "initiatives" }, { label: "Gateway & routing", tab: "aicentral", ac: "admin" }, { label: "Delivery risks", tab: "riskcenter" }, { label: "Architecture playbook", tab: "playbook" } ],
  ciso: [ { label: "Security risks", tab: "riskcenter" }, { label: "Gateway enforcement", tab: "aicentral", ac: "gateway" }, { label: "Control library", tab: "controls" }, { label: "Evidence", tab: "aicentral", ac: "evidence" } ],
  caio: [ { label: "Record gate decisions", tab: "decisions" }, { label: "Lifecycle board", tab: "aicentral", ac: "initiatives" }, { label: "Audit pack", tab: "reports" }, { label: "Assessment cascade", tab: "riskcenter" } ],
  coo: [ { label: "Rollout status", tab: "aicentral", ac: "initiatives" }, { label: "Operational risks", tab: "riskcenter" }, { label: "Execution playbook", tab: "playbook" }, { label: "Adoption report", tab: "reports" } ],
  chro: [ { label: "Assign learning paths", tab: "academy" }, { label: "Adoption by unit", tab: "reports" }, { label: "People risks", tab: "riskcenter" }, { label: "Workforce initiative", tab: "playbook" } ],
  cdpo: [ { label: "Privacy risks", tab: "riskcenter" }, { label: "Privacy evidence", tab: "aicentral", ac: "evidence" }, { label: "Framework posture", tab: "compliance" }, { label: "DPIA in playbook", tab: "playbook" } ],
  cgo: [ { label: "Qualify opportunities", tab: "aicentral", ac: "initiatives" }, { label: "Compliance posture", tab: "compliance" }, { label: "Pipeline report", tab: "reports" }, { label: "Policy updates", tab: "compliance" } ],
};

/* Recent changes - the last meaningful platform events for each lens.
   Seeded for demo; live evidence-bus records merge in at render time. */
export const EXEC_RECENT_CHANGES: Record<string, ExecRecentChange[]> = {
  ceo: [ { what: "Finance Close Automation reached scale-ready with all six gate checks green", initiative: "Finance Close Automation", when: "Today", kind: "decision" }, { what: "Workforce Navigator flagged as retire-trending by the feedback engine", initiative: "Workforce Skills Navigator", when: "Yesterday", kind: "risk" }, { what: "Q2 board pack generated with portfolio value $9.2M expected / $4.1M realized", initiative: "Portfolio", when: "2 days ago", kind: "evidence" } ],
  cfo: [ { what: "Realized ROI updated: Finance Close at 31%, $1.8M savings booked", initiative: "Finance Close Automation", when: "Today", kind: "evidence" }, { what: "Credit Decision benefits re-baselined - $0.4M behind case", initiative: "Credit Decision Assurance", when: "Yesterday", kind: "risk" }, { what: "Gateway routing change cut model spend ~$76K/month", initiative: "Enterprise Gateway", when: "3 days ago", kind: "deployment" } ],
  cio: [ { what: "Integration hardening started for the Finance scale wave", initiative: "Finance Close Automation", when: "Today", kind: "deployment" }, { what: "Model routing optimization deployed (-14% inference cost)", initiative: "Enterprise Gateway", when: "2 days ago", kind: "deployment" }, { what: "Platform control coverage moved 76% → 79%", initiative: "Portfolio", when: "This week", kind: "evidence" } ],
  ciso: [ { what: "Gateway blocked 563 policy violations this month, zero leaks", initiative: "Enterprise Gateway", when: "Today", kind: "evidence" }, { what: "Red-team evidence pack for Copilot due May 24 - in progress", initiative: "Customer Resolution Copilot", when: "Yesterday", kind: "risk" }, { what: "Kill-switch verified on Finance Close production path", initiative: "Finance Close Automation", when: "This week", kind: "deployment" } ],
  caio: [ { what: "AiRT treatment RSK-003 bias monitoring went live", initiative: "Customer Resolution Copilot", when: "Today", kind: "risk" }, { what: "Scale gate evidence completed through Optimization phase", initiative: "Finance Close Automation", when: "Yesterday", kind: "evidence" }, { what: "Human-oversight design record submitted for approval", initiative: "Credit Decision Assurance", when: "2 days ago", kind: "decision" } ],
  coo: [ { what: "Customer Ops pilot expanded to second support queue", initiative: "Customer Resolution Copilot", when: "Today", kind: "deployment" }, { what: "Retail Banking rollout still blocked on oversight evidence", initiative: "Credit Decision Assurance", when: "Yesterday", kind: "risk" }, { what: "Close-cycle time down 26% in Finance", initiative: "Finance Close Automation", when: "This week", kind: "evidence" } ],
  chro: [ { what: "3 learning paths staged for auto-assignment to People unit", initiative: "Workforce Skills Navigator", when: "Today", kind: "learning" }, { what: "Customer Ops training completion reached 68%", initiative: "Customer Resolution Copilot", when: "Yesterday", kind: "learning" }, { what: "Resistance survey: People unit flagged medium-high", initiative: "Workforce Skills Navigator", when: "This week", kind: "risk" } ],
  cdpo: [ { what: "PII masking verified at 100% on card patterns in gateway sample", initiative: "Customer Resolution Copilot", when: "Today", kind: "evidence" }, { what: "Workforce Navigator DPIA flagged overdue - drafted for review", initiative: "Workforce Skills Navigator", when: "Yesterday", kind: "risk" }, { what: "Retention policy applied: 30-day prompt log window", initiative: "Enterprise Gateway", when: "This week", kind: "deployment" } ],
  cgo: [ { what: "Two AI opportunities await AiOA qualification (~$2.4M)", initiative: "Pipeline", when: "Today", kind: "decision" }, { what: "Responsible-use policy update ready for approval", initiative: "Portfolio", when: "Yesterday", kind: "decision" }, { what: "Governance coverage reached 87% of controls", initiative: "Portfolio", when: "This week", kind: "evidence" } ],
};
