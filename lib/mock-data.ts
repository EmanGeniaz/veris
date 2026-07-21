import {
  Archive,
  Building2,
  ClipboardCheck,
  Network,
  Scale
} from "lucide-react";
import type {
  AIAsset,
  AuditEvent,
  Control,
  EvidenceItem,
  Framework,
  GovernanceLayer,
  HITLApproval,
  Risk,
  TreatmentPlan,
  UserRole
} from "@/lib/types";

export const governanceLayers: GovernanceLayer[] = [
  {
    id: "governance",
    name: "AI Governance",
    shortName: "Governance",
    scope: "Strategy, ownership, risk appetite",
    description: "Executive ownership model for AI strategy, risk appetite, accountability, and operating cadence.",
    question: "Are AI decisions owned by the right accountable executives with a defensible risk appetite?",
    readiness: 91,
    assurance: "Strong",
    icon: Building2,
    kpis: [
      { label: "Named owners", value: "98%" },
      { label: "Board updates", value: "12/12" },
      { label: "Policy exceptions", value: "3" }
    ]
  },
  {
    id: "regulatory",
    name: "Regulatory",
    shortName: "Regulatory",
    scope: "EU AI Act, ISO 42001, GDPR, NIST AI RMF",
    description: "Regulatory posture and obligation mapping across global AI and data governance frameworks.",
    question: "Can leadership prove which obligations apply to each AI system and why?",
    readiness: 84,
    assurance: "Managed",
    icon: Scale,
    kpis: [
      { label: "Obligations mapped", value: "87%" },
      { label: "High-risk systems", value: "14" },
      { label: "Gaps aging", value: "19d" }
    ]
  },
  {
    id: "controls",
    name: "Controls",
    shortName: "Controls",
    scope: "Policies, standards, control mapping",
    description: "Control library that maps policy intent to measurable standards, tests, and control owners.",
    question: "Are controls designed, assigned, and testable against the actual AI estate?",
    readiness: 78,
    assurance: "Improving",
    icon: ClipboardCheck,
    kpis: [
      { label: "Control coverage", value: "82%" },
      { label: "Tests passing", value: "76%" },
      { label: "Owner gaps", value: "6" }
    ]
  },
  {
    id: "execution",
    name: "Execution",
    shortName: "Execution",
    scope: "HITL workflows, approvals, escalations",
    description: "Human-in-the-loop operating layer for model launch, change approvals, escalations, and exceptions.",
    question: "Are consequential AI actions reviewed by the right humans before they reach production impact?",
    readiness: 86,
    assurance: "Strong",
    icon: Network,
    kpis: [
      { label: "SLA compliance", value: "93%" },
      { label: "Pending approvals", value: "8" },
      { label: "Escalations", value: "4" }
    ]
  },
  {
    id: "evidence",
    name: "Evidence",
    shortName: "Evidence",
    scope: "Audit trail, assurance, board reporting",
    description: "Evidence vault for regulator-ready audit trails, control assurance, and board reporting packages.",
    question: "Can every governance claim be traced to current evidence without manual reconstruction?",
    readiness: 88,
    assurance: "Board ready",
    icon: Archive,
    kpis: [
      { label: "Evidence freshness", value: "94%" },
      { label: "Audit events", value: "18.2k" },
      { label: "Report packs", value: "9" }
    ]
  }
];

export const roleProfiles: Record<
  UserRole,
  {
    mandate: string;
    commandBrief: string;
    priorityLayers: Array<GovernanceLayer["id"]>;
    reports: Array<{ title: string; summary: string; status: "Active" | "Approved" | "Pending" }>;
  }
> = {
  CAIO: {
    mandate: "Own AI strategy and enterprise accountability.",
    commandBrief: "CAIO view prioritizes board-level readiness, model accountability, risk appetite, and launch governance.",
    priorityLayers: ["governance", "execution", "evidence"],
    reports: [
      { title: "AI Governance Board Pack", summary: "Quarterly posture, exceptions, and treatment progress.", status: "Active" },
      { title: "High-Risk AI Launch Memo", summary: "Decision record for material production deployments.", status: "Pending" }
    ]
  },
  CISO: {
    mandate: "Secure AI systems and operational controls.",
    commandBrief: "CISO view emphasizes control coverage, HITL breakpoints, incident evidence, and model access governance.",
    priorityLayers: ["controls", "execution", "evidence"],
    reports: [
      { title: "AI Security Control Attestation", summary: "Control test status and exception aging.", status: "Active" },
      { title: "Incident Evidence Packet", summary: "Chain of custody for AI security events.", status: "Approved" }
    ]
  },
  CIO: {
    mandate: "Operate the AI estate with reliability.",
    commandBrief: "CIO view tracks AI asset ownership, lifecycle status, integration risk, and operational dependencies.",
    priorityLayers: ["governance", "controls", "execution"],
    reports: [
      { title: "AI Estate Operating Review", summary: "Asset inventory, lifecycle, and workflow throughput.", status: "Active" },
      { title: "Technology Dependency Register", summary: "Critical vendors, platforms, and integration risks.", status: "Pending" }
    ]
  },
  CDPO: {
    mandate: "Protect data rights and privacy obligations.",
    commandBrief: "CDPO view connects GDPR duties, data lineage, DPIA evidence, and privacy-sensitive AI workflows.",
    priorityLayers: ["regulatory", "controls", "evidence"],
    reports: [
      { title: "AI DPIA Evidence Pack", summary: "Privacy review status and lawful basis evidence.", status: "Active" },
      { title: "Data Subject Rights Readout", summary: "Rights impact for AI-assisted decisions.", status: "Approved" }
    ]
  },
  CGO: {
    mandate: "Assure governance and regulatory integrity.",
    commandBrief: "CGO view consolidates governance policy adherence, regulatory traceability, and assurance evidence.",
    priorityLayers: ["governance", "regulatory", "evidence"],
    reports: [
      { title: "Regulator Readiness Dossier", summary: "Obligation mapping, controls, and evidence lineage.", status: "Active" },
      { title: "Governance Exception Register", summary: "Policy exceptions, owners, due dates, and decisions.", status: "Pending" }
    ]
  }
};

export const aiAssets: AIAsset[] = [
  {
    id: "asset-1",
    name: "Credit Decision Copilot",
    domain: "Financial services",
    owner: "Lending AI Office",
    layer: "Execution",
    layerId: "execution",
    riskTier: "Critical",
    status: "Monitoring",
    purpose: "Assists underwriters with credit decision recommendations and adverse-action rationale review.",
    modelType: "LLM + rules ensemble",
    businessImpact: "Material customer decision support",
    lastReview: "2026-05-16"
  },
  {
    id: "asset-2",
    name: "Clinical Intake Summarizer",
    domain: "Healthcare operations",
    owner: "Care Experience",
    layer: "Regulatory",
    layerId: "regulatory",
    riskTier: "High",
    status: "Active",
    purpose: "Summarizes patient intake notes for clinician review before appointment triage.",
    modelType: "LLM summarization",
    businessImpact: "Clinical workflow acceleration",
    lastReview: "2026-05-11"
  },
  {
    id: "asset-3",
    name: "Enterprise Code Assistant",
    domain: "Software delivery",
    owner: "Platform Engineering",
    layer: "Controls",
    layerId: "controls",
    riskTier: "Medium",
    status: "Active",
    purpose: "Provides engineering code suggestions inside approved development environments.",
    modelType: "Code generation model",
    businessImpact: "Developer productivity",
    lastReview: "2026-05-09"
  },
  {
    id: "asset-4",
    name: "Claims Fraud Triage",
    domain: "Insurance",
    owner: "Special Investigations",
    layer: "Evidence",
    layerId: "evidence",
    riskTier: "High",
    status: "Active",
    purpose: "Ranks claims for investigator review using claim, network, and historical signal features.",
    modelType: "Gradient boosted classifier",
    businessImpact: "Investigation prioritization",
    lastReview: "2026-05-13"
  },
  {
    id: "asset-5",
    name: "HR Mobility Recommender",
    domain: "People operations",
    owner: "Talent Strategy",
    layer: "Governance",
    layerId: "governance",
    riskTier: "Medium",
    status: "Draft",
    purpose: "Recommends internal mobility paths to employees based on skills and open roles.",
    modelType: "Recommendation system",
    businessImpact: "Employee experience",
    lastReview: "2026-05-04"
  }
];

export const risks: Risk[] = [
  { id: "risk-1", title: "Insufficient human review for adverse decisions", severity: "Critical", owner: "CAIO", framework: "EU AI Act", status: "Mitigating", layerId: "execution" },
  { id: "risk-2", title: "Unmapped lawful basis for employee profiling", severity: "High", owner: "CDPO", framework: "GDPR", status: "Open", layerId: "regulatory" },
  { id: "risk-3", title: "Control ownership gap in model change process", severity: "High", owner: "CISO", framework: "ISO 42001", status: "Mitigating", layerId: "controls" },
  { id: "risk-4", title: "Board risk appetite not linked to launch gates", severity: "Medium", owner: "CGO", framework: "NIST AI RMF", status: "Monitoring", layerId: "governance" },
  { id: "risk-5", title: "Evidence freshness below regulator threshold", severity: "Medium", owner: "CGO", framework: "ISO 42001", status: "Monitoring", layerId: "evidence" },
  { id: "risk-6", title: "Vendor model cards missing residual risk statement", severity: "Low", owner: "CIO", framework: "NIST AI RMF", status: "Open", layerId: "regulatory" }
];

export const treatmentPlans: TreatmentPlan[] = [
  { id: "plan-1", riskId: "risk-1", owner: "Model Risk Committee", action: "Add dual approval gate for high-impact overrides.", dueDate: "2026-06-07" },
  { id: "plan-2", riskId: "risk-3", owner: "Security Governance", action: "Assign control owners and automate evidence collection.", dueDate: "2026-06-14" }
];

export const hitlApprovals: HITLApproval[] = [
  { id: "hitl-1", title: "Launch approval: Credit Decision Copilot v2.1", summary: "Production expansion to two new regions with adverse-action review controls.", requester: "Lending AI Office", sla: "18h", status: "Escalated", layerId: "execution" },
  { id: "hitl-2", title: "Exception request: vendor model card delay", summary: "Temporary exception for third-party documentation pending contractual update.", requester: "Procurement Risk", sla: "2d", status: "Pending", layerId: "regulatory" },
  { id: "hitl-3", title: "Control test sign-off: prompt injection guardrail", summary: "Security validation completed; owner approval required before release gate opens.", requester: "Platform Engineering", sla: "9h", status: "Pending", layerId: "controls" },
  { id: "hitl-4", title: "Board evidence packet certification", summary: "Final assurance check for quarterly governance reporting.", requester: "Governance Office", sla: "1d", status: "Pending", layerId: "evidence" }
];

export const controls: Control[] = [
  { id: "ctrl-1", name: "Board-approved AI risk appetite", owner: "CGO", status: "Active", layerId: "governance" },
  { id: "ctrl-2", name: "High-risk AI classification review", owner: "Legal", status: "Active", layerId: "regulatory" },
  { id: "ctrl-3", name: "Model change approval gate", owner: "CIO", status: "Monitoring", layerId: "controls" },
  { id: "ctrl-4", name: "Human override and escalation workflow", owner: "CAIO", status: "Active", layerId: "execution" },
  { id: "ctrl-5", name: "Immutable evidence retention policy", owner: "CISO", status: "Active", layerId: "evidence" },
  { id: "ctrl-6", name: "Privacy impact assessment linkage", owner: "CDPO", status: "Draft", layerId: "regulatory" }
];

export const frameworks: Framework[] = [
  {
    id: "fw-1",
    name: "EU AI Act",
    shortName: "EU AI",
    owner: "Legal and AI Governance",
    coverage: 86,
    mappings: [
      { layerId: "regulatory", controlId: "ctrl-2", article: "Art. 6" },
      { layerId: "execution", controlId: "ctrl-4", article: "Art. 14" },
      { layerId: "evidence", controlId: "ctrl-5", article: "Art. 12" }
    ]
  },
  {
    id: "fw-2",
    name: "ISO 42001",
    shortName: "ISO",
    owner: "Governance Office",
    coverage: 79,
    mappings: [
      { layerId: "governance", controlId: "ctrl-1", article: "A.5" },
      { layerId: "controls", controlId: "ctrl-3", article: "A.8" },
      { layerId: "evidence", controlId: "ctrl-5", article: "A.10" }
    ]
  },
  {
    id: "fw-3",
    name: "GDPR",
    shortName: "GDPR",
    owner: "Data Protection Office",
    coverage: 91,
    mappings: [
      { layerId: "regulatory", controlId: "ctrl-6", article: "Art. 35" },
      { layerId: "execution", controlId: "ctrl-4", article: "Art. 22" },
      { layerId: "evidence", controlId: "ctrl-5", article: "Art. 30" }
    ]
  },
  {
    id: "fw-4",
    name: "NIST AI RMF",
    shortName: "NIST",
    owner: "Risk Office",
    coverage: 83,
    mappings: [
      { layerId: "governance", controlId: "ctrl-1", article: "Govern 1.1" },
      { layerId: "controls", controlId: "ctrl-3", article: "Manage 2.4" },
      { layerId: "regulatory", controlId: "ctrl-2", article: "Map 1.2" }
    ]
  }
];

export const evidenceItems: EvidenceItem[] = [
  { id: "ev-1", title: "Board AI risk appetite minutes", source: "Board portal", layerId: "governance", retention: "7 years" },
  { id: "ev-2", title: "EU AI high-risk classification memo", source: "Legal repository", layerId: "regulatory", retention: "10 years" },
  { id: "ev-3", title: "Control test result: launch gate", source: "GRC system", layerId: "controls", retention: "7 years" },
  { id: "ev-4", title: "HITL approval transcript", source: "Workflow engine", layerId: "execution", retention: "7 years" },
  { id: "ev-5", title: "Quarterly assurance packet", source: "Evidence vault", layerId: "evidence", retention: "10 years" }
];

export const auditEvents: AuditEvent[] = [
  { id: "audit-1", action: "Approval escalated", actor: "Model Risk Committee", timestamp: "2026-05-19 09:40 IST", object: "Credit Decision Copilot v2.1" },
  { id: "audit-2", action: "Control evidence refreshed", actor: "Security Governance", timestamp: "2026-05-19 08:15 IST", object: "Prompt injection guardrail" },
  { id: "audit-3", action: "Framework mapping updated", actor: "Data Protection Office", timestamp: "2026-05-18 17:30 IST", object: "GDPR Art. 35" },
  { id: "audit-4", action: "Board report generated", actor: "Governance Office", timestamp: "2026-05-18 15:05 IST", object: "AI Governance Board Pack" }
];

export const operatingSignals = [
  { label: "HITL SLA", value: "93%", delta: "+4.2%", status: "On track" },
  { label: "Regulatory Gaps", value: "11", delta: "-6", status: "Improving" },
  { label: "Evidence Freshness", value: "94%", delta: "+8.1%", status: "Board ready" },
  { label: "High-Risk AI", value: "14", delta: "+2", status: "Under review" }
];

export const maturityDomains = [
  { domain: "Leadership & Accountability", score: 88, target: 92, owner: "CAIO", layerId: "governance", summary: "Board cadence, RACI coverage, and accountable AI owners are established." },
  { domain: "Regulatory Intelligence", score: 76, target: 88, owner: "CGO", layerId: "regulatory", summary: "EU AI Act, GDPR, ISO 42001, and NIST mappings are present but need final obligation rationale." },
  { domain: "Control Design", score: 72, target: 86, owner: "CISO", layerId: "controls", summary: "Core policy controls are live; automated control testing is still expanding." },
  { domain: "Human Oversight", score: 84, target: 90, owner: "CAIO", layerId: "execution", summary: "HITL escalation paths are operating with strong SLA adherence." },
  { domain: "Evidence & Assurance", score: 81, target: 90, owner: "CGO", layerId: "evidence", summary: "Audit packets are board-ready; regulator exports need richer provenance metadata." },
  { domain: "Lifecycle Monitoring", score: 69, target: 84, owner: "CIO", layerId: "controls", summary: "Runtime model drift and vendor changes need tighter continuous monitoring." }
];

export const isoReadinessChecklist = [
  { clause: "4.3", title: "AIMS Scope", owner: "CGO", done: 4, total: 5, evidence: "Scope memo and system boundary register" },
  { clause: "5.3", title: "Roles & Authorities", owner: "CAIO", done: 5, total: 6, evidence: "AI governance RACI and committee charter" },
  { clause: "6.1", title: "Risk Planning", owner: "Risk Office", done: 4, total: 5, evidence: "Risk appetite and treatment criteria" },
  { clause: "8.2", title: "AI Risk Assessment", owner: "Model Risk", done: 2, total: 3, evidence: "Assessment records and launch gate reviews" },
  { clause: "8.5", title: "Deployment & Operation", owner: "CIO", done: 3, total: 4, evidence: "Rollback plan, monitoring plan, kill-switch proof" },
  { clause: "9.2", title: "Internal Audit", owner: "Internal Audit", done: 2, total: 4, evidence: "Audit plan and sampled control test results" }
];

export const implementationRoadmap = [
  { quarter: "Q2 2026", title: "Governance foundation", status: "Complete", layerId: "governance", focus: "Board risk appetite, AI policy, RACI, asset inventory baseline" },
  { quarter: "Q3 2026", title: "Regulatory conformity", status: "In progress", layerId: "regulatory", focus: "EU AI Act classification, GDPR DPIA linkage, ISO 42001 clause evidence" },
  { quarter: "Q4 2026", title: "Control automation", status: "Planned", layerId: "controls", focus: "Automated control tests, owner attestations, model change evidence" },
  { quarter: "Q1 2027", title: "Assurance operating rhythm", status: "Planned", layerId: "evidence", focus: "Regulator exports, board reports, audit-grade evidence lineage" }
];
