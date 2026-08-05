/* ISO/IEC 42001 Statement of Applicability + certification-readiness.
   The SoA is the index an auditor reads first: every Annex A control, whether
   it is applicable, the justification, and the evidence artifact that proves it.
   The readiness checklist is built around what an auditor actually asks for
   (clauses 4–10), not the structure of the standard. Both derive their roll-ups
   from the rows, so the headline number can't drift from the detail. */

/* Annex A control themes → representative controls, each with applicability,
   implementation status and the evidence artifact that closes it. */
export const SOA_CONTROLS = [
  { id: "A.2.2",  theme: "AI policy",              control: "AI management policy",                 applicable: true,  status: "implemented", evidence: "AI policy library (15 policies)",   ref: "C03" },
  { id: "A.3.2",  theme: "Roles",                  control: "AI roles & responsibilities",          applicable: true,  status: "implemented", evidence: "Governance charter & RACI",         ref: "C01" },
  { id: "A.4.2",  theme: "Resources",              control: "Resourcing for the AI system",         applicable: true,  status: "implemented", evidence: "AI platform + gateway",             ref: "C25" },
  { id: "A.5.2",  theme: "Impact assessment",      control: "AI system impact assessment process",  applicable: true,  status: "partial",     evidence: "FRIA / DPIA report",               ref: "C07" },
  { id: "A.5.4",  theme: "Impact assessment",      control: "Assessing AI impact on individuals",   applicable: true,  status: "partial",     evidence: "Risk classification record",        ref: "C06" },
  { id: "A.6.1.2",theme: "Lifecycle",              control: "AI system lifecycle objectives",       applicable: true,  status: "implemented", evidence: "13-phase lifecycle model",          ref: "C05" },
  { id: "A.6.2.2",theme: "Lifecycle",              control: "AI system requirements & specification",applicable: true, status: "implemented", evidence: "Model card + system register",      ref: "C15" },
  { id: "A.6.2.4",theme: "Lifecycle",              control: "AI system verification & validation",  applicable: true,  status: "partial",     evidence: "Validation report + fairness workbook", ref: "C16" },
  { id: "A.6.2.6",theme: "Lifecycle",              control: "AI system operation & monitoring",     applicable: true,  status: "partial",     evidence: "Post-market monitoring plan",       ref: "C26" },
  { id: "A.7.2",  theme: "Data",                   control: "Data for AI systems",                  applicable: true,  status: "partial",     evidence: "Data quality statement + lineage",  ref: "C10" },
  { id: "A.8.2",  theme: "Information for users",   control: "System documentation & transparency",  applicable: true,  status: "implemented", evidence: "Transparency notice + explainability record", ref: "C18" },
  { id: "A.9.2",  theme: "Use of AI systems",      control: "Responsible use & human oversight",    applicable: true,  status: "implemented", evidence: "Human-oversight design record",     ref: "C21" },
  { id: "A.10.2", theme: "Third parties",          control: "Supplier & third-party AI management",  applicable: true,  status: "partial",     evidence: "Vendor assessment + DPA",           ref: "C28" },
  { id: "A.10.4", theme: "Third parties",          control: "Customers of the AI system",           applicable: false, status: "na",          evidence: "Not a downstream AI supplier",      ref: "—" },
];

export const SOA_STATUS_META = {
  implemented: { label: "Implemented", tone: "good" },
  partial:     { label: "Partial",     tone: "warn" },
  planned:     { label: "Planned",     tone: "info" },
  na:          { label: "Not applicable", tone: "ink3" },
};

/* Certification-readiness by management-system clause (what the auditor asks). */
export const CERT_CLAUSES = [
  { clause: "4", name: "Context of the organization", ask: "Scope statement, interested parties, AI system boundaries.", score: 90 },
  { clause: "5", name: "Leadership",                  ask: "AI policy signed by top management; roles assigned.",        score: 88 },
  { clause: "6", name: "Planning",                    ask: "AI risks & opportunities, impact assessment, objectives.",   score: 74 },
  { clause: "7", name: "Support",                     ask: "Competence, awareness, documented information control.",      score: 78 },
  { clause: "8", name: "Operation",                   ask: "Operational planning, impact assessment, controls in use.",   score: 72 },
  { clause: "9", name: "Performance evaluation",      ask: "Monitoring, internal audit, management review records.",      score: 68 },
  { clause: "10",name: "Improvement",                 ask: "Nonconformity, corrective action, continual improvement.",    score: 76 },
];

export function soaStats() {
  const appl = SOA_CONTROLS.filter(c => c.applicable);
  const implemented = appl.filter(c => c.status === "implemented").length;
  const partial = appl.filter(c => c.status === "partial").length;
  const readiness = Math.round(CERT_CLAUSES.reduce((s, c) => s + c.score, 0) / CERT_CLAUSES.length);
  return {
    total: SOA_CONTROLS.length,
    applicable: appl.length,
    notApplicable: SOA_CONTROLS.length - appl.length,
    implemented,
    partial,
    implementedPct: Math.round((implemented / appl.length) * 100),
    readiness,
  };
}
