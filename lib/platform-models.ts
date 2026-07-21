import type {
  ACCxoAlignment,
  ACFeedbackScores,
  ACEvidenceRecord,
  ACGuardrailGroup,
  ACInitiativeRecord,
  ACPhaseTemplate,
  ACRoleAccess,
  AIInitiative,
  AIInitiativeDNA,
  AuditEvent,
  ControlActivation,
  CXOReview,
  DepartmentPilot,
  EvidenceConfidenceScore,
  GatewayLogEntry,
  GatewayPolicy,
  GatewayProvider,
  RBACRole,
  RiskDriftSignal,
  ScaleGateDecision,
  StrategicTask,
} from "./types";

export const aiInitiatives: AIInitiative[] = [
  {
    id: "aii-001",
    name: "Customer Resolution Copilot",
    businessUnit: "Customer Operations",
    proposedDepartment: "Tier 1 Support",
    executiveSponsor: "COO",
    businessOwner: "Priya Mehta",
    technicalOwner: "Marcus Reid",
    status: "Pilot Running",
    riskTier: "High",
    governanceClass: "High Risk",
    valueHypothesis: "Reduce repeat contacts while preserving human oversight for escalations.",
    budgetEstimate: 420000,
    expectedRoi: "18 month payback",
    createdAt: "2026-06-01",
  },
  {
    id: "aii-002",
    name: "Finance Close Automation",
    businessUnit: "Finance",
    proposedDepartment: "Controllership",
    executiveSponsor: "CFO",
    businessOwner: "Elena Rossi",
    technicalOwner: "Marcus Reid",
    status: "Scale Gate",
    riskTier: "Medium",
    governanceClass: "Limited Risk",
    valueHypothesis: "Shorten month-end close and improve audit sampling confidence.",
    budgetEstimate: 310000,
    expectedRoi: "14 month payback",
    createdAt: "2026-05-18",
  },
];

export const departmentPilots: DepartmentPilot[] = [
  {
    id: "pilot-001",
    initiativeId: "aii-001",
    department: "Tier 1 Support",
    wave: 1,
    status: "Active",
    adoptionScore: 64,
    complianceScore: 79,
    valueScore: 73,
    riskDrift: 6,
    inheritedLearningIds: [],
  },
  {
    id: "pilot-002",
    initiativeId: "aii-002",
    department: "Controllership",
    wave: 1,
    status: "Ready for Scale",
    adoptionScore: 79,
    complianceScore: 88,
    valueScore: 84,
    riskDrift: -3,
    inheritedLearningIds: ["lesson-001", "lesson-002"],
  },
];

export const cxoReviews: CXOReview[] = [
  {
    id: "review-001",
    initiativeId: "aii-001",
    reviewerRole: "CIO",
    reviewType: "Technical Feasibility",
    status: "Approved",
    decisionNotes: "Architecture can support a bounded support pilot with approved logging.",
    dueDate: "2026-06-10",
  },
  {
    id: "review-002",
    initiativeId: "aii-001",
    reviewerRole: "CAIO",
    reviewType: "AI Suitability",
    status: "Changes Requested",
    decisionNotes: "Add HITL override policy and prompt injection test evidence before expansion.",
    dueDate: "2026-06-22",
  },
  {
    id: "review-003",
    initiativeId: "aii-002",
    reviewerRole: "CFO",
    reviewType: "Finance",
    status: "Approved",
    decisionNotes: "Value evidence is sufficient for a controlled second-wave rollout.",
    dueDate: "2026-06-20",
  },
];

export const strategicTasks: StrategicTask[] = [
  {
    id: "task-001",
    initiativeId: "aii-001",
    ownerRole: "CISO",
    title: "Complete prompt injection evidence pack",
    status: "In Progress",
    dueDate: "2026-06-24",
    evidenceRequired: true,
  },
  {
    id: "task-002",
    initiativeId: "aii-002",
    ownerRole: "CFO",
    title: "Approve second-wave budget release",
    status: "Open",
    dueDate: "2026-06-25",
    evidenceRequired: true,
  },
];

export const scaleGateDecisions: ScaleGateDecision[] = [
  {
    id: "scale-001",
    initiativeId: "aii-001",
    pilotId: "pilot-001",
    outcome: "Hold",
    readinessScore: 76,
    evidenceConfidence: 82,
    riskDriftScore: 6,
    valueConfidence: 73,
    rationale: "Pilot value is promising, but security evidence must close before second wave.",
    decidedBy: "CAIO",
    decidedAt: "2026-06-18T09:20:00Z",
  },
  {
    id: "scale-002",
    initiativeId: "aii-002",
    pilotId: "pilot-002",
    outcome: "Scale",
    readinessScore: 88,
    evidenceConfidence: 91,
    riskDriftScore: -3,
    valueConfidence: 84,
    rationale: "Controls, adoption, and audit evidence meet scale threshold.",
    decidedBy: "CFO",
    decidedAt: "2026-06-18T14:30:00Z",
  },
];

export const aiInitiativeDna: AIInitiativeDNA[] = [
  {
    initiativeId: "aii-001",
    useCasePattern: "Customer-facing assistance with human escalation",
    affectedCxos: ["COO", "CIO", "CAIO", "CISO", "CDPO"],
    controlFamilies: ["Human oversight", "Security testing", "Data minimization", "Customer transparency"],
    evidenceRequirements: ["Model card", "Prompt injection results", "HITL approval log", "DPIA summary"],
    scaleIntent: "Multi Department",
  },
  {
    initiativeId: "aii-002",
    useCasePattern: "Internal financial process automation",
    affectedCxos: ["CFO", "CIO", "CAIO", "CGO"],
    controlFamilies: ["SOX evidence", "Segregation of duties", "Change management", "Audit sampling"],
    evidenceRequirements: ["Control test results", "Exception log", "Budget approval", "Close-cycle benchmark"],
    scaleIntent: "Enterprise",
  },
];

export const controlActivations: ControlActivation[] = [
  {
    id: "activation-001",
    initiativeId: "aii-001",
    controlId: "CTRL-SEC-022",
    trigger: "Customer-facing generative AI",
    ownerRole: "CISO",
    status: "Monitoring",
    evidenceItemIds: ["ev-001", "ev-002"],
  },
  {
    id: "activation-002",
    initiativeId: "aii-001",
    controlId: "CTRL-AI-001",
    trigger: "High-risk human impact workflow",
    ownerRole: "CAIO",
    status: "Activated",
    evidenceItemIds: ["ev-003"],
  },
  {
    id: "activation-003",
    initiativeId: "aii-002",
    controlId: "CTRL-AUD-019",
    trigger: "Financial reporting automation",
    ownerRole: "CFO",
    status: "Complete",
    evidenceItemIds: ["ev-004"],
  },
];

export const riskDriftSignals: RiskDriftSignal[] = [
  {
    id: "drift-001",
    initiativeId: "aii-001",
    pilotId: "pilot-001",
    signal: "Escalation overrides trending above approved appetite",
    driftScore: 6,
    severity: "High",
    recommendedAction: "Hold expansion until override rationale is reviewed.",
  },
  {
    id: "drift-002",
    initiativeId: "aii-002",
    pilotId: "pilot-002",
    signal: "Risk movement below baseline after second control test",
    driftScore: -3,
    severity: "Low",
    recommendedAction: "Proceed to scale gate review.",
  },
];

export const evidenceConfidenceScores: EvidenceConfidenceScore[] = [
  {
    initiativeId: "aii-001",
    pilotId: "pilot-001",
    completeness: 82,
    freshness: 78,
    approverCoverage: 86,
    confidence: 82,
  },
  {
    initiativeId: "aii-002",
    pilotId: "pilot-002",
    completeness: 92,
    freshness: 88,
    approverCoverage: 94,
    confidence: 91,
  },
];

export const rbacRoles: RBACRole[] = [
  {
    id: "DEMO",
    name: "Demo Center",
    permissions: ["view:demo", "view:workspace", "view:aicentral", "export:reports"],
  },
  {
    id: "CAIO",
    name: "Chief AI Officer",
    permissions: ["view:workspace", "approve:cxo", "approve:hitl", "view:aicentral", "manage:aicentral", "export:reports"],
  },
  {
    id: "CIO",
    name: "Chief Information Officer",
    permissions: ["view:workspace", "approve:cxo", "view:aicentral"],
  },
  {
    id: "CISO",
    name: "Chief Information Security Officer",
    permissions: ["view:workspace", "approve:hitl", "view:aicentral"],
  },
];

export const auditEvents: AuditEvent[] = [
  {
    id: "audit-001",
    action: "Scale gate outcome set to Hold",
    actor: "Aisha Patel",
    timestamp: "2026-06-18T09:20:00Z",
    object: "Customer Resolution Copilot",
    entityType: "ScaleGateDecision",
    entityId: "scale-001",
    metadata: { outcome: "Hold", readinessScore: 76 },
  },
  {
    id: "audit-002",
    action: "Board pack export generated",
    actor: "Elena Rossi",
    timestamp: "2026-06-18T14:45:00Z",
    object: "Finance Close Automation",
    entityType: "BoardPackExport",
    entityId: "export-001",
    metadata: { format: "PDF", retentionYears: 7 },
  },
];

export const postgresReadyTables = [
  "organizations",
  "users",
  "rbac_roles",
  "ai_initiatives",
  "department_pilots",
  "cxo_reviews",
  "strategic_tasks",
  "control_activations",
  "risk_drift_signals",
  "evidence_confidence_scores",
  "scale_gate_decisions",
  "audit_events",
  "board_pack_exports",
] as const;

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
