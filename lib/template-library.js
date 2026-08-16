/* ── Template Library ─────────────────────────────────────────────────
   A browsable repository of governance template packs. Each pack maps to a
   framework in the Global AI Framework Library and ships concrete, ready-to-
   fill artifacts (policy, Statement of Applicability, control checklist,
   impact assessment, RACI, evidence register). Generating one produces a
   REAL markdown file (via vzDownload in the surface) and mints an evidence
   event — never a blank template.

   Builders pull from the canonical checklists / SoA already in the product,
   so a generated document reflects the actual control set, not placeholder
   text. Pure data + deterministic builders (client-safe). */

import { ISO42001_CHECKLIST, ISO27001_CHECKLIST } from "@/components/platform/core";
import { SOA_CONTROLS, SOA_STATUS_META, CERT_CLAUSES } from "@/lib/soa";
import { FRAMEWORKS } from "@/lib/frameworks";

const fw = id => FRAMEWORKS.find(f => f.id === id) || {};
const H = (title, sub) => [`# ${title}`, "", sub ? `_${sub}_` : "", ""].filter((l, i) => !(i === 2 && !sub)).join("\n");
const foot = pack => `\n\n---\n_Generated from VerisZone Template Library · ${pack} · pre-filled from the canonical control set. Fill the bracketed fields, then attach to the initiative to record evidence._`;

/* ── shared builders ── */
const policyMd = (name, framework, clauses) => [
  H(`${name}`, `Template · aligned to ${framework}`),
  "## 1. Purpose", "[Why this policy exists and what outcome it protects.]", "",
  "## 2. Scope", "[Which AI systems, units and data classes this applies to.]", "",
  "## 3. Policy statements",
  ...clauses.map((c, i) => `${i + 1}. ${c}`), "",
  "## 4. Roles & responsibilities", "[Accountable owner, responsible parties, oversight body.]", "",
  "## 5. Review", "Owner: [name] · Review cycle: [12 months] · Last reviewed: [date] · Approved by: [top management].",
].join("\n");

const checklistMd = (name, framework, groups, itemKey) => [
  H(name, `Control checklist · ${framework}`),
  "| Ref | Requirement | Status | Evidence |",
  "| --- | --- | --- | --- |",
  ...groups.flatMap(g => (g.items || []).map(it =>
    `| ${g.clause || g.id} | ${it.text} | ☐ Open | [link] |`)),
].join("\n");

const soaMd = () => [
  H("Statement of Applicability", "ISO/IEC 42001 Annex A · pre-filled from the live control set"),
  "| Control | Theme | Applicable | Status | Evidence |",
  "| --- | --- | --- | --- | --- |",
  ...SOA_CONTROLS.map(c =>
    `| ${c.id} — ${c.control} | ${c.theme} | ${c.applicable ? "Yes" : "No"} | ${(SOA_STATUS_META[c.status] || {}).label || c.status} | ${c.evidence} |`),
  "",
  "## Certification readiness by clause",
  "| Clause | Name | Auditor asks for | Readiness |",
  "| --- | --- | --- | --- |",
  ...CERT_CLAUSES.map(c => `| ${c.clause} | ${c.name} | ${c.ask} | ${c.score}% |`),
].join("\n");

const raciMd = (framework) => [
  H("Roles & Responsibilities (RACI)", `${framework} governance roles`),
  "| Activity | Accountable | Responsible | Consulted | Informed |",
  "| --- | --- | --- | --- | --- |",
  ...[
    ["Approve AI policy", "Top management", "CAIO / CGO", "Legal, CISO", "All staff"],
    ["Impact assessment", "CAIO", "Initiative owner", "DPO, Risk", "Governance forum"],
    ["Control operation", "CISO", "Control owners", "CAIO", "Audit"],
    ["Human oversight", "Business owner", "Reviewer", "CAIO", "Board"],
    ["Evidence & audit", "CGO", "Governance office", "External auditor", "Board"],
  ].map(r => `| ${r.join(" | ")} |`),
].join("\n");

const iaMd = (framework, extra) => [
  H("AI System Impact Assessment", `${framework} · per-initiative`),
  "**System:** [name]  **Owner:** [name]  **Lifecycle phase:** [phase]  **Risk tier:** [tier]", "",
  "## 1. Purpose & context", "[What the system does and who it affects.]", "",
  "## 2. Affected individuals & rights", "[Groups affected; rights and freedoms at stake.]", "",
  "## 3. Risks identified", "[Bias, safety, privacy, security, societal — likelihood × impact.]", "",
  ...(extra || []),
  "## 4. Mitigations & controls", "[Controls applied; residual risk after treatment.]", "",
  "## 5. Human oversight", "[Who reviews, when, and with what authority to stop the system.]", "",
  "## 6. Decision", "[Proceed / proceed-with-conditions / do-not-proceed · approver · date.]",
].join("\n");

const riskRegisterMd = (framework) => [
  H("AI Risk Register", `${framework} · risk treatment`),
  "| ID | Risk | Category | Likelihood | Impact | Inherent | Treatment | Owner | Residual |",
  "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  "| R-01 | [risk] | [bias/security/privacy] | [1-5] | [1-5] | [L×I] | [mitigate/accept] | [owner] | [score] |",
].join("\n");

/* ── the packs ── */
export const TEMPLATE_PACKS = [
  {
    id: "iso-42001", framework: "ISO/IEC 42001", name: "AI Management System (AIMS)",
    blurb: "Everything to stand up and certify an ISO/IEC 42001 AI management system — policy, Statement of Applicability, clause checklist, impact assessment and roles.",
    accent: "gold",
    artifacts: [
      { id: "aims-policy", name: "AI Management Policy", kind: "Policy", build: () => policyMd("AI Management Policy", "ISO/IEC 42001", ["AI is developed and used in line with our values, the law and this AIMS.", "Every AI system has a named accountable owner and a documented purpose.", "Risks and impacts are assessed before deployment and monitored after.", "Human oversight is designed into high-impact systems.", "Evidence is retained for audit across the AI lifecycle."]) },
      { id: "aims-soa", name: "Statement of Applicability (Annex A)", kind: "SoA", build: soaMd },
      { id: "aims-checklist", name: "AIMS Clause Checklist (4–10)", kind: "Checklist", build: () => checklistMd("ISO/IEC 42001 AIMS Checklist", "ISO/IEC 42001", ISO42001_CHECKLIST) },
      { id: "aims-ia", name: "AI System Impact Assessment", kind: "Assessment", build: () => iaMd("ISO/IEC 42001 / 42005") },
      { id: "aims-raci", name: "Roles & Responsibilities (RACI)", kind: "RACI", build: () => raciMd("ISO/IEC 42001") },
    ],
  },
  {
    id: "iso-27001", framework: "ISO/IEC 27001", name: "Information Security (ISMS)",
    blurb: "The security backbone under the AI program — information security policy, ISMS control checklist and a risk treatment register.",
    accent: "blue",
    artifacts: [
      { id: "isms-policy", name: "Information Security Policy", kind: "Policy", build: () => policyMd("Information Security Policy", "ISO/IEC 27001", ["Information is classified and protected according to its sensitivity.", "Access follows least privilege and is reviewed regularly.", "Security is built into AI systems and their supply chain.", "Incidents are detected, reported and learned from.", "Controls are audited and continually improved."]) },
      { id: "isms-checklist", name: "ISO 27001 Control Checklist", kind: "Checklist", build: () => checklistMd("ISO/IEC 27001 Checklist", "ISO/IEC 27001", ISO27001_CHECKLIST) },
      { id: "isms-rtp", name: "Risk Treatment Register", kind: "Register", build: () => riskRegisterMd("ISO/IEC 27001") },
      { id: "isms-raci", name: "Roles & Responsibilities (RACI)", kind: "RACI", build: () => raciMd("ISO/IEC 27001") },
    ],
  },
  {
    id: "nist-rmf", framework: "NIST AI RMF 1.0", name: "AI Risk Management Profile",
    blurb: "Design an AI risk program on the NIST AI RMF — a Govern/Map/Measure/Manage profile and a risk register.",
    accent: "violet",
    artifacts: [
      { id: "rmf-profile", name: "AI RMF Profile (Govern·Map·Measure·Manage)", kind: "Profile", build: () => [
        H("NIST AI RMF Profile", "Govern · Map · Measure · Manage"),
        "## Govern", "[Policies, roles, accountability and culture for AI risk.]", "",
        "## Map", "[Context, intended use, actors and impacts identified.]", "",
        "## Measure", "[Metrics, test methods and tracked risk indicators.]", "",
        "## Manage", "[Prioritisation, treatment, monitoring and response.]",
      ].join("\n") },
      { id: "rmf-register", name: "AI Risk Register", kind: "Register", build: () => riskRegisterMd("NIST AI RMF") },
      { id: "rmf-policy", name: "Responsible AI Policy", kind: "Policy", build: () => policyMd("Responsible AI Policy", "NIST AI RMF", ["AI risks are governed, mapped, measured and managed across the lifecycle.", "Trustworthiness characteristics are defined and tested.", "Accountability for each AI system is assigned and documented."]) },
    ],
  },
  {
    id: "eu-ai-act", framework: "EU AI Act", name: "EU AI Act Compliance",
    blurb: "The binding EU obligations — risk classification, high-risk technical documentation, a fundamental-rights impact assessment and GPAI transparency.",
    accent: "green",
    artifacts: [
      { id: "eu-classify", name: "AI Risk Classification Record", kind: "Record", build: () => [
        H("EU AI Act — Risk Classification Record", "Prohibited · High-risk · Limited · Minimal · GPAI"),
        "**System:** [name]  **Provider/Deployer:** [role]", "",
        "## Screening", "- Prohibited practice (Art.5)? [yes/no]", "- High-risk use (Annex III)? [yes/no]", "- GPAI / systemic-risk model? [yes/no]", "- Transparency obligations (Art.50)? [yes/no]", "",
        "## Determination", "[Tier] · [rationale] · [obligations triggered] · approver · date.",
      ].join("\n") },
      { id: "eu-techdoc", name: "High-Risk Technical Documentation (Annex IV)", kind: "Checklist", build: () => [
        H("EU AI Act — Technical Documentation", "Annex IV · high-risk systems"),
        "| # | Required content | Status |",
        "| --- | --- | --- |",
        ...["General description & intended purpose", "System design & development process", "Data & data governance", "Risk management system", "Human oversight measures", "Accuracy, robustness & cybersecurity", "Post-market monitoring plan", "Logging & record-keeping (Art.12)"].map((r, i) => `| ${i + 1} | ${r} | ☐ Open |`),
      ].join("\n") },
      { id: "eu-fria", name: "Fundamental Rights Impact Assessment (FRIA)", kind: "Assessment", build: () => iaMd("EU AI Act · Art.27", ["## 3a. Fundamental rights affected", "[Dignity, non-discrimination, privacy, effective remedy…]", ""]) },
      { id: "eu-gpai", name: "GPAI Transparency Statement", kind: "Policy", build: () => policyMd("GPAI Transparency Statement", "EU AI Act Art.53/55", ["Training data governance and copyright policy are documented.", "Capabilities, limitations and intended use are published.", "Systemic-risk evaluation and incident reporting are in place where applicable."]) },
    ],
  },
];

export { foot as _templateFoot };

/* Deterministic catalogue stats. */
export function templateLibraryStats() {
  const artifacts = TEMPLATE_PACKS.reduce((s, p) => s + p.artifacts.length, 0);
  return {
    packs: TEMPLATE_PACKS.length,
    artifacts,
    frameworks: TEMPLATE_PACKS.map(p => p.framework),
    kinds: [...new Set(TEMPLATE_PACKS.flatMap(p => p.artifacts.map(a => a.kind)))],
  };
}

/* Pack status/score sourced from the framework library so the catalogue and
   the compliance posture never disagree. */
export const packPosture = id => { const f = fw(id); return { status: f.status || "Library", score: f.score, name: f.name }; };
