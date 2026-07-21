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
