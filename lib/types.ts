/* ── AI Central operating layer ───────────────────────────────── */

export type ACModuleId =
  | "dashboard"
  | "initiatives"
  | "portfolio"
  | "governance"
  | "evidence"
  | "gateway"
  | "admin"
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
  /* Program charter - executive summary of why the initiative exists */
  problem?: string;
  vision?: string;
  objective?: string;
  budget?: string;
  spent?: string;
  timeline?: string;
  successMetrics?: string[];
};

/* Execution-management data for the AI PMO workspace, keyed by initiative id */
export type ACPmoRecord = {
  milestones: { name: string; due: string; status: "Complete" | "On Track" | "At Risk" | "Not Started" }[];
  raid: { kind: "Risk" | "Assumption" | "Issue" | "Dependency"; item: string; owner: string; status: string }[];
  decisions: { decision: string; by: string; date: string; rationale: string }[];
  resources: { role: string; name: string; allocation: string }[];
  meetings: { name: string; cadence: string; next: string }[];
  changeRequests: { id: string; title: string; impact: string; status: string }[];
  sprint: { name: string; dates: string; goal: string; committed: number; done: number };
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

/* ── Employee Workspace / Enterprise AI Gateway ───────────────── */

export type GatewayAuthStatus = "Connected" | "Pending" | "Error";

export type GatewayRoutingRule = {
  id: string;
  scope: string;            /* business unit or risk class */
  providerId: string;
  reason: string;
};

export type GuardrailDetector = {
  id: string;
  name: string;
  action: "Allow" | "Warn" | "Require justification" | "Mask" | "Redact" | "Block" | "Escalate";
  triggeredMtd: number;
};

export type DeploymentMode = {
  id: string;
  name: string;
  desc: string;
  status: "Active" | "Available" | "Planned";
};

export type KnowledgeAssetKind =
  | "Policy" | "Framework" | "Template" | "Risk Library" | "Lessons Learned"
  | "Playbook" | "Evidence" | "Prompt Library" | "Architecture Standard";

export type KnowledgeAsset = {
  id: string;
  title: string;
  kind: KnowledgeAssetKind;
  sourceRef: string;
  addedBy: string;
  reuseCount: number;
};

export type WorkbenchGuardrailEvent = { action: string; detector: string };

export type WorkbenchMessage = {
  id: string;
  from: "user" | "assistant";
  text: string;
  enrichedWith?: string[];
  guardrail?: WorkbenchGuardrailEvent | null;
};

export type WorkbenchConversation = {
  id: string;
  title: string;
  unit: string;
  project: string;
  initiativeId: string | null;
  providerId: string;
  model: string;
  classification: "Public" | "Internal" | "Confidential" | "Restricted";
  created: string;
  lastActivity: string;
  riskScore: number;
  policyDecision: string;
  evidenceLinks: number;
  retention: string;
  messages: WorkbenchMessage[];
};

export type GatewayRetentionConfig = { setting: string; value: string; note: string };

/* ── Canonical risk register (Risk Center is the system of record) ──
   One risk record, many views: the initiative Risks tab, dashboards and
   reports all render filtered views of this register. */
export type RiskTreatmentPlan = {
  strategy: "Mitigate" | "Transfer" | "Accept" | "Avoid";
  action: string;
  owner: string;
  deadline: string;
  status: "Planned" | "In Progress" | "Complete";
  priority: "Critical" | "High" | "Medium" | "Low";
};

export type RiskRecord = {
  id: string;
  title: string;
  system: string;
  category: string;
  initiativeId: string | null;
  unit: string;
  execOwner: string;
  riskOwner: string;
  likelihood: number;
  impact: number;
  residual: number;
  level: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "Treating" | "Monitored" | "Closed";
  frameworks: string[];
  controls: string[];
  kris: string[];
  desc: string;
  treatment: RiskTreatmentPlan;
  aiRecommendation: string;
};

export type KriRecord = {
  id: string;
  name: string;
  value: number;
  unit: string;
  threshold: number;
  direction: "above" | "below";
  trend: "improving" | "stable" | "worsening";
  initiativeId: string | null;
  framework: string;
};

/* ── Governance engines (VerisZone IP) ──────────────────────────
   The engines power assessments across the platform; users experience
   outcomes, never methodology pages. */
export type GovEngine = {
  code: string;
  name: string;
  question: string;
  owner: string;
};

export type EngineOutcome = {
  engine: string;
  score: number;
  status: "Complete" | "In Progress" | "Scheduled";
  outcome: string;
  drill: { surface: "riskcenter" | "compliance" | "aicentral"; hint: string };
};

export type PlaybookLens = {
  title: string;
  angle: string;
  phaseGuidance: Record<string, string>;
};

export type ExecQuickAction = {
  label: string;
  tab: string;
  ac?: string;
};

export type ExecRecentChange = {
  what: string;
  initiative: string;
  when: string;
  kind: "evidence" | "decision" | "risk" | "deployment" | "learning";
};
