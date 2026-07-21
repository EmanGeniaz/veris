import type { LucideIcon } from "lucide-react";

export type UserRole = "CAIO" | "CISO" | "CIO" | "CDPO" | "CGO";

export type PlatformUserRole =
  | "CEO"
  | "COO"
  | "CFO"
  | "CHRO"
  | "CAIO"
  | "CISO"
  | "CIO"
  | "CDPO"
  | "CGO"
  | "DEMO"
  | "AI_CENTRAL";

export type GovernanceLayerId = "governance" | "regulatory" | "controls" | "execution" | "evidence";

export type RiskSeverity = "Critical" | "High" | "Medium" | "Low";

export type GovernanceLayer = {
  id: GovernanceLayerId;
  name: string;
  shortName: string;
  scope: string;
  description: string;
  question: string;
  readiness: number;
  assurance: string;
  icon: LucideIcon;
  kpis: Array<{ label: string; value: string }>;
};

export type AIAsset = {
  id: string;
  name: string;
  domain: string;
  owner: string;
  layer: string;
  layerId: GovernanceLayerId;
  riskTier: RiskSeverity;
  status: "Active" | "Monitoring" | "Draft";
  purpose: string;
  modelType: string;
  businessImpact: string;
  lastReview: string;
};

export type Risk = {
  id: string;
  title: string;
  severity: RiskSeverity;
  owner: string;
  framework: string;
  status: "Open" | "Mitigating" | "Monitoring";
  layerId: GovernanceLayerId;
};

export type TreatmentPlan = {
  id: string;
  riskId: string;
  owner: string;
  action: string;
  dueDate: string;
};

export type HITLApproval = {
  id: string;
  title: string;
  summary: string;
  requester: string;
  sla: string;
  status: "Pending" | "Approved" | "Rejected" | "Escalated";
  layerId: GovernanceLayerId;
};

export type Framework = {
  id: string;
  name: string;
  shortName: string;
  owner: string;
  coverage: number;
  mappings: Array<{ layerId: GovernanceLayerId; controlId: string; article: string }>;
};

export type Control = {
  id: string;
  name: string;
  owner: string;
  status: "Active" | "Monitoring" | "Draft";
  layerId: GovernanceLayerId;
};

export type EvidenceItem = {
  id: string;
  title: string;
  source: string;
  layerId: GovernanceLayerId;
  retention: string;
};

export type AuditEvent = {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  object: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, string | number | boolean>;
};

export type AIInitiativeStatus =
  | "Idea Intake"
  | "CIO Feasibility"
  | "CAIO Governance Review"
  | "CXO Approval"
  | "Pilot Running"
  | "Scale Gate"
  | "Scaled"
  | "Stopped";

export type ScaleGateOutcome = "Scale" | "Hold" | "Remediate" | "Stop";

export type AIInitiative = {
  id: string;
  name: string;
  businessUnit: string;
  proposedDepartment: string;
  executiveSponsor: PlatformUserRole;
  businessOwner: string;
  technicalOwner: string;
  status: AIInitiativeStatus;
  riskTier: RiskSeverity;
  governanceClass: "Low Impact" | "Limited Risk" | "High Risk" | "Prohibited";
  valueHypothesis: string;
  budgetEstimate: number;
  expectedRoi: string;
  createdAt: string;
};

export type DepartmentPilot = {
  id: string;
  initiativeId: string;
  department: string;
  wave: number;
  status: "Not Started" | "Active" | "At Risk" | "Ready for Scale" | "Complete";
  adoptionScore: number;
  complianceScore: number;
  valueScore: number;
  riskDrift: number;
  inheritedLearningIds: string[];
};

export type CXOReview = {
  id: string;
  initiativeId: string;
  reviewerRole: PlatformUserRole;
  reviewType: "Technical Feasibility" | "AI Suitability" | "Privacy" | "Security" | "Finance" | "Operations" | "People" | "Governance";
  status: "Not Started" | "In Review" | "Approved" | "Rejected" | "Changes Requested";
  decisionNotes: string;
  dueDate: string;
};

export type StrategicTask = {
  id: string;
  initiativeId: string;
  ownerRole: PlatformUserRole;
  title: string;
  status: "Open" | "In Progress" | "Blocked" | "Complete";
  dueDate: string;
  evidenceRequired: boolean;
};

export type ScaleGateDecision = {
  id: string;
  initiativeId: string;
  pilotId: string;
  outcome: ScaleGateOutcome;
  readinessScore: number;
  evidenceConfidence: number;
  riskDriftScore: number;
  valueConfidence: number;
  rationale: string;
  decidedBy: PlatformUserRole;
  decidedAt: string;
};

export type AIInitiativeDNA = {
  initiativeId: string;
  useCasePattern: string;
  affectedCxos: PlatformUserRole[];
  controlFamilies: string[];
  evidenceRequirements: string[];
  scaleIntent: "Single Department" | "Multi Department" | "Enterprise";
};

export type ControlActivation = {
  id: string;
  initiativeId: string;
  controlId: string;
  trigger: string;
  ownerRole: PlatformUserRole;
  status: "Activated" | "Monitoring" | "Exception" | "Complete";
  evidenceItemIds: string[];
};

export type RiskDriftSignal = {
  id: string;
  initiativeId: string;
  pilotId: string;
  signal: string;
  driftScore: number;
  severity: RiskSeverity;
  recommendedAction: string;
};

export type EvidenceConfidenceScore = {
  initiativeId: string;
  pilotId: string;
  completeness: number;
  freshness: number;
  approverCoverage: number;
  confidence: number;
};

export type RBACPermission =
  | "view:demo"
  | "view:workspace"
  | "manage:profile"
  | "approve:cxo"
  | "approve:hitl"
  | "view:aicentral"
  | "manage:aicentral"
  | "export:reports";

export type RBACRole = {
  id: PlatformUserRole;
  name: string;
  permissions: RBACPermission[];
};

/* ── AI Central operating layer ───────────────────────────────── */

export type ACModuleId =
  | "dashboard"
  | "initiatives"
  | "governance"
  | "evidence"
  | "gateway"
  | "academy";

export type ACLens =
  | "Executive"
  | "Operations"
  | "Value"
  | "Workforce"
  | "Security"
  | "Governance"
  | "Delivery"
  | "Privacy"
  | "Compliance";

export type ACRoleAccess = {
  lens: ACLens;
  modules: ACModuleId[];
  focus: string;
};

export type ACRaci = {
  responsible: string;
  accountable: string;
  consulted: string;
  informed: string;
};

export type ACPhaseTemplate = {
  id: string;
  order: number;
  name: string;
  objective: string;
  deliverables: string[];
  raci: ACRaci;
};

export type ACLifecycleCategory =
  | "New Ideas"
  | "Assessment"
  | "Approved"
  | "Implementation"
  | "Pilot"
  | "Production"
  | "Scaling"
  | "Completed"
  | "Retired";

export type ACInitiativeRecord = {
  id: string;
  name: string;
  unit: string;
  category: string;
  lifecycle: ACLifecycleCategory;
  businessOwner: string;
  technicalOwner: string;
  sponsor: string;
  champion: string;
  cxo: string;
  status: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  risk: "Critical" | "High" | "Medium" | "Low";
  expected: string;
  actual: string;
  stage: string;
  guardrail: number;
  adoption: number;
  valueScore: number;
  policies: string[];
  controls: string[];
  audits: string[];
  risks: string[];
  roi: string;
  savings: string;
  revenue: string;
  productivity: string;
  training: string;
  resistance: "High" | "Medium" | "Low";
  /* 0-based index into AC_PHASES; the phase currently in progress */
  phaseIndex: number;
  /* artifacts completed within the active phase */
  phaseArtifactsDone: number;
  blockedBy: string | null;
};

export type GatewayProviderStatus = "Approved" | "Restricted" | "Blocked";

export type GatewayProvider = {
  id: string;
  name: string;
  kind: "Copilot" | "Cloud" | "Frontier" | "Internal";
  status: GatewayProviderStatus;
  models: string[];
  routedShare: number;
  costMtd: string;
};

export type GatewayPolicy = {
  id: string;
  name: string;
  category: string;
  enforcement: "Block" | "Redact" | "Route to review" | "Log only";
  triggeredMtd: number;
  status: "Active" | "Draft";
};

export type GatewayLogEntry = {
  id: string;
  time: string;
  user: string;
  unit: string;
  provider: string;
  model: string;
  riskScore: number;
  action: "Allowed" | "Redacted" | "Blocked" | "Escalated";
  policy: string;
  tokens: number;
};

export type ACGuardrailGroup = { cat: string; items: string[] };

export type ACCxoAlignment = { role: string; focus: string; count: number; score: number };

export type ACEvidenceRecord = {
  item: string;
  initiative: string;
  scope: "Project" | "Business Unit" | "Organization";
  control: string;
  risk: string;
  owner: string;
  status: string;
  approval: string;
  version: string;
  time: string;
};

export type ACFeedbackScores = {
  user: number;
  business: number;
  executive: number;
  risk: number;
  operational: number;
  value: number;
  adoption: number;
};

export type ACFeedbackDecision = "Scale" | "Continue" | "Improve" | "Retire";
