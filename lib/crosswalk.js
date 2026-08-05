/* The 32-capability convergence crosswalk — the control-level expression of the
   "one system, not nineteen" thesis. The EU AI Act (binding law), the NIST AI
   RMF (voluntary framework), ISO/IEC 42001 (certifiable standard) and
   Singapore's Model AI Governance Framework (voluntary guidance) are not four
   programmes. Each capability below is ONE control, evidenced by ONE artifact,
   that satisfies the corresponding clause in all four instruments at once —
   so you build once instead of four times.

   Status is grounded in the live estate wherever a canonical fact exists (human
   oversight awaiting approval, model cards 4/8, drift monitoring on 2 unwired
   models, the APAC transfer gap) so the crosswalk agrees with the Risk Center,
   the Incident register and AI Central rather than telling a separate story. */

/* The four instruments — stated plainly as what they are and who enforces them. */
export const INSTRUMENTS = [
  { id: "euai", name: "EU AI Act",        kind: "Binding law",          enforcer: "EU AI Office + national authorities", tone: "crit" },
  { id: "nist", name: "NIST AI RMF",      kind: "Voluntary framework",  enforcer: "Self-adopted (US)",                   tone: "blue" },
  { id: "iso",  name: "ISO/IEC 42001",    kind: "Certifiable standard", enforcer: "Accredited certification body",       tone: "good" },
  { id: "sg",   name: "Singapore Model AI Governance Framework", short: "Singapore MGF", kind: "Voluntary guidance", enforcer: "IMDA / PDPC", tone: "gold" },
];

export const STATUS_META = {
  operational: { label: "Operational", tone: "good" },
  progress:    { label: "In progress", tone: "warn" },
  gap:         { label: "Gap",         tone: "crit" },
};

export const CROSSWALK_DOMAINS = [
  "Accountability & Governance",
  "Risk & Impact",
  "Data",
  "Model & Technical",
  "Oversight & Transparency",
  "Operations & Lifecycle",
  "Assurance & Redress",
];

/* 32 capabilities. euai/nist/iso/sg = the clause each instrument satisfies via
   the single `artifact`. `note` = why one control closes all four. */
export const CROSSWALK = [
  /* ── Accountability & Governance ── */
  { id: "C01", domain: "Accountability & Governance", capability: "AI governance structure & accountability", euai: "Art. 17 (QMS)", nist: "GOVERN 1.1", iso: "Cl. 5.1", sg: "Internal governance", artifact: "Governance charter & RACI", owner: "CGO", status: "operational", note: "One accountable owner per system replaces four committee mandates." },
  { id: "C02", domain: "Accountability & Governance", capability: "Roles, competence & AI literacy", euai: "Art. 4", nist: "GOVERN 2.2", iso: "Cl. 7.2", sg: "Internal governance", artifact: "AI literacy & training register", owner: "CAIO", status: "progress", note: "Training coverage at 54% — the literacy duty is common to all four." },
  { id: "C03", domain: "Accountability & Governance", capability: "AI policy framework", euai: "Art. 17", nist: "GOVERN 1.2", iso: "Cl. 5.2", sg: "Internal governance", artifact: "Policy library (15 policies)", owner: "CGO", status: "operational", note: "The 15-policy library is the single acceptable-use source of record." },
  { id: "C04", domain: "Accountability & Governance", capability: "Risk management framework", euai: "Art. 9", nist: "MAP + MANAGE", iso: "Cl. 6.1 · A.5.2", sg: "Risk-based approach", artifact: "Risk management procedure", owner: "CRO", status: "operational", note: "One procedure drives Art. 9, the RMF functions and Annex A at once." },
  { id: "C05", domain: "Accountability & Governance", capability: "AI system inventory & registration", euai: "Art. 49", nist: "MAP 1.1", iso: "A.6.2.2", sg: "Operations mgmt", artifact: "AI system register", owner: "CAIO", status: "operational", note: "Controls with no inventory behind them cannot be traced to anything." },

  /* ── Risk & Impact ── */
  { id: "C06", domain: "Risk & Impact", capability: "Risk classification & tiering", euai: "Art. 6 · Annex III", nist: "MAP 1.1", iso: "A.5.4", sg: "Risk-based approach", artifact: "Classification decision record", owner: "CRO", status: "operational", note: "Tier is derived once, then it sets deadline, control load and oversight depth." },
  { id: "C07", domain: "Risk & Impact", capability: "Fundamental-rights & data-protection impact assessment", euai: "Art. 27 (FRIA)", nist: "MAP 1.6", iso: "A.5.2", sg: "Risk-based approach", artifact: "FRIA / DPIA report", owner: "CDPO", status: "progress", note: "One assessment answers the FRIA, the impact clause and the DPIA." },
  { id: "C08", domain: "Risk & Impact", capability: "Prohibited-practice screening (red lines)", euai: "Art. 5", nist: "MAP 1.1", iso: "A.5.3", sg: "Risk-based approach", artifact: "Prohibited-use attestation", owner: "Legal", status: "progress", note: "Screened against all 8 red lines — 7 clear; emotion-recognition at work under review before the attestation can be signed." },
  { id: "C09", domain: "Risk & Impact", capability: "Inherent & residual risk scoring", euai: "Art. 9", nist: "MEASURE 2.1", iso: "A.5.5", sg: "Risk-based approach", artifact: "Risk register (inherent + residual)", owner: "CRO", status: "operational", note: "The same residual scores the Risk Center and AI Central already cite." },

  /* ── Data ── */
  { id: "C10", domain: "Data", capability: "Data governance & quality", euai: "Art. 10", nist: "MAP 2.3", iso: "A.7.2", sg: "Data quality", artifact: "Data quality statement", owner: "CDPO", status: "progress", note: "Data quality is inseparable from model performance across all four." },
  { id: "C11", domain: "Data", capability: "Data provenance & lineage", euai: "Art. 10", nist: "MAP 2.1", iso: "A.7.3", sg: "Data quality", artifact: "Data lineage record", owner: "CIO", status: "operational", note: "Lineage is captured at the pipeline, evidenced once." },
  { id: "C12", domain: "Data", capability: "Personal-data protection & residency", euai: "Art. 10(5) · GDPR", nist: "MANAGE 2.2", iso: "A.7 · ISO 27701", sg: "Data quality", artifact: "DPIA + transfer mapping", owner: "CDPO", status: "operational", note: "APAC transfer impact assessment complete — Art. 44 mapping closed (INC-1048 contained)." },
  { id: "C13", domain: "Data", capability: "Training-data documentation", euai: "Art. 11 · Annex IV", nist: "MAP 2.2", iso: "A.7.4", sg: "Data quality", artifact: "Dataset datasheet", owner: "CAIO", status: "progress", note: "One datasheet feeds Annex IV and the ISO data-record control." },

  /* ── Model & Technical ── */
  { id: "C14", domain: "Model & Technical", capability: "Technical documentation", euai: "Art. 11 · Annex IV", nist: "MAP 4.1", iso: "A.6.2.3", sg: "Operations mgmt", artifact: "Technical documentation pack", owner: "CIO", status: "progress", note: "Annex IV structure doubles as the ISO system-documentation control." },
  { id: "C15", domain: "Model & Technical", capability: "Model cards", euai: "Art. 11", nist: "MAP 4.1", iso: "A.6.2.2", sg: "Operations mgmt", artifact: "Model card", owner: "CAIO", status: "progress", note: "4 of 8 model cards complete — the same figure AI Central reports." },
  { id: "C16", domain: "Model & Technical", capability: "Accuracy & performance validation", euai: "Art. 15", nist: "MEASURE 2.3", iso: "A.6.2.4", sg: "Operations mgmt", artifact: "Validation report", owner: "Model Risk", status: "progress", note: "One validation report evidences accuracy for all four." },
  { id: "C17", domain: "Model & Technical", capability: "Bias & fairness testing", euai: "Art. 10(2)(f) · 15", nist: "MEASURE 2.11", iso: "A.6.2.4", sg: "Risk-based approach", artifact: "Fairness workbook", owner: "CAIO", status: "progress", note: "Bias risk RSK-003 open on the credit model — one workbook closes it." },
  { id: "C18", domain: "Model & Technical", capability: "Explainability & interpretability", euai: "Art. 13", nist: "MEASURE 2.9", iso: "A.8.2", sg: "Stakeholder interaction", artifact: "Explainability record", owner: "CAIO", status: "operational", note: "Explainability record operational — SHAP reason codes + Art. 22 explanations live (RSK-005 treated)." },
  { id: "C19", domain: "Model & Technical", capability: "Robustness, security & adversarial (OWASP LLM · MITRE ATLAS)", euai: "Art. 15", nist: "MANAGE 4.1", iso: "A.6.2.6", sg: "Operations mgmt", artifact: "Red-team & security test report", owner: "CISO", status: "progress", note: "Prompt-injection & model-poisoning tests map to one crosswalk row." },
  { id: "C20", domain: "Model & Technical", capability: "Logging & record-keeping", euai: "Art. 12", nist: "MEASURE 2.4", iso: "A.6.2.8", sg: "Operations mgmt", artifact: "Automatic event logs", owner: "CISO", status: "operational", note: "Gateway logs every inference — one log stream, four obligations." },

  /* ── Oversight & Transparency ── */
  { id: "C21", domain: "Oversight & Transparency", capability: "Human oversight (HITL / HOTL)", euai: "Art. 14", nist: "MANAGE 1.1", iso: "A.9.2", sg: "Human-in-the-loop", artifact: "Human-oversight design record", owner: "CAIO", status: "progress", note: "Awaiting approval — clearing it unblocks the Credit scale gate." },
  { id: "C22", domain: "Oversight & Transparency", capability: "Transparency to affected persons", euai: "Art. 13", nist: "GOVERN 4.2", iso: "A.8.2", sg: "Stakeholder interaction", artifact: "Transparency notice", owner: "Legal", status: "progress", note: "One notice satisfies the Art. 13 duty and the ISO information control." },
  { id: "C23", domain: "Oversight & Transparency", capability: "GenAI output marking & disclosure", euai: "Art. 50", nist: "GOVERN 4.1", iso: "A.8.3", sg: "Stakeholder interaction", artifact: "AI-content labelling standard", owner: "CAIO", status: "operational", note: "Enterprise AI-content labelling standard published — machine-generated output marked per Art. 50." },
  { id: "C24", domain: "Oversight & Transparency", capability: "GPAI / systemic-risk obligations", euai: "Art. 53 · 55", nist: "MAP 5.1", iso: "A.6.1", sg: "Operations mgmt", artifact: "GPAI provider assessment", owner: "Legal", status: "progress", note: "Accidental-provider test run across GenAI systems — 1 likely-provider flag (Copilot) now in Art. 53 assessment." },

  /* ── Operations & Lifecycle ── */
  { id: "C25", domain: "Operations & Lifecycle", capability: "Deployer operational readiness", euai: "Art. 26", nist: "MANAGE 1.2", iso: "A.6.2.5", sg: "Operations mgmt", artifact: "Deployment readiness checklist", owner: "CIO", status: "operational", note: "One go-live checklist covers deployer duties and ISO operations." },
  { id: "C26", domain: "Operations & Lifecycle", capability: "Post-market monitoring", euai: "Art. 72", nist: "MANAGE 4.1", iso: "Cl. 9.1", sg: "Operations mgmt", artifact: "Post-market monitoring plan", owner: "CAIO", status: "progress", note: "Continuous monitoring is one plan, referenced by all four." },
  { id: "C27", domain: "Operations & Lifecycle", capability: "Drift & change management", euai: "Art. 72", nist: "MEASURE 2.4", iso: "A.6.2.5", sg: "Operations mgmt", artifact: "Drift monitoring configuration", owner: "Model Risk", status: "operational", note: "All production models wired to drift monitoring — behavioural-shift detection live (Art. 72)." },
  { id: "C28", domain: "Operations & Lifecycle", capability: "Third-party / supplier AI management", euai: "Art. 25 · 28", nist: "MAP 4.1", iso: "A.10.2", sg: "Operations mgmt", artifact: "Vendor assessment + DPA", owner: "Procurement", status: "progress", note: "One vendor pack carries the value-chain duty and the ISO supplier control." },

  /* ── Assurance & Redress ── */
  { id: "C29", domain: "Assurance & Redress", capability: "Conformity assessment & Statement of Applicability", euai: "Art. 43 · 47", nist: "MEASURE 1.1", iso: "Cl. 9.2 (SoA)", sg: "Operations mgmt", artifact: "Conformity assessment + SoA", owner: "CGO", status: "progress", note: "The SoA is the index an auditor and the conformity file both read." },
  { id: "C30", domain: "Assurance & Redress", capability: "Serious-incident reporting", euai: "Art. 73", nist: "MANAGE 4.3", iso: "A.6.2.6", sg: "Operations mgmt", artifact: "Incident register + notification log", owner: "CISO", status: "operational", note: "The unified incident register already runs against the Art. 33/73 clock." },
  { id: "C31", domain: "Assurance & Redress", capability: "Corrective action & continual improvement", euai: "Art. 20", nist: "MANAGE 4.1", iso: "Cl. 10.1", sg: "Operations mgmt", artifact: "CAPA log", owner: "CGO", status: "progress", note: "One corrective-action log feeds the forum's lessons loop." },
  { id: "C32", domain: "Assurance & Redress", capability: "Redress & complaint handling", euai: "Art. 85", nist: "GOVERN 5.1", iso: "A.9.3", sg: "Stakeholder interaction", artifact: "Complaints & appeals log", owner: "Legal", status: "operational", note: "Complaints & appeals channel stood up — affected persons can contest a decision (Art. 85)." },
];

export function crosswalkStats() {
  const by = { operational: 0, progress: 0, gap: 0 };
  CROSSWALK.forEach(c => { by[c.status]++; });
  const total = CROSSWALK.length;
  const coverage = Math.round(((by.operational + 0.5 * by.progress) / total) * 100);
  const byDomain = CROSSWALK_DOMAINS.map(d => ({ domain: d, n: CROSSWALK.filter(c => c.domain === d).length }));
  return {
    total,
    instruments: INSTRUMENTS.length,
    obligations: total * INSTRUMENTS.length, // 128 framework obligations…
    coverage,                                // …collapsed into one control set
    operational: by.operational,
    progress: by.progress,
    gap: by.gap,
    byDomain,
  };
}
