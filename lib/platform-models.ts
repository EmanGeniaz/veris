import type {
  AIInitiative,
  AIInitiativeDNA,
  AuditEvent,
  ControlActivation,
  CXOReview,
  DepartmentPilot,
  EvidenceConfidenceScore,
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
