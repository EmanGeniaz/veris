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

/* ── Executive Workspace intelligence ─────────────────────────── */

export type ExecLink = { ac?: ACModuleId; tab?: string };

export type ExecBriefEntry = {
  focus: string;
  headline: string;
  body: string;
  deltas: [string, "up" | "down" | "flat", string][];
};

export type ExecPriorityItem = {
  title: string;
  owner: string;
  priority: "Critical" | "High" | "Medium";
  due: string;
  impact: string;
  benefit: string;
  link: ExecLink;
  initiativeId?: string;
};

export type ExecDecisionItem = {
  title: string;
  context: string;
  impact: string;
  risk: "High" | "Medium" | "Low";
  aiRec: string;
  evidence: string;
  link: ExecLink;
  initiativeId?: string;
};

export type ExecRecommendationItem = {
  action: string;
  metric: string;
  value: string;
  rationale: string;
  link: ExecLink;
  initiativeId?: string;
};

export type FrameworkPosture = { id: string; name: string; score: number; sub: string };

export type ExecKpiInsight = {
  rootCause: string;
  impact: string;
  aiRec: string;
  link: ExecLink;
};
