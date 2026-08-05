/* Governance glossary — so the platform stands alone. Every acronym and term of
   art an executive, auditor or engineer will hit on a governance surface, in
   plain language. Grouped by category; the surface filters and searches over it. */

export const GLOSSARY = [
  // Regulatory
  { term: "EU AI Act", cat: "Regulatory", def: "The EU's binding, risk-tiered AI regulation. Bans some uses, imposes strict duties on high-risk systems, and lighter transparency duties elsewhere." },
  { term: "High-risk AI", cat: "Regulatory", def: "AI whose use materially affects safety or fundamental rights (e.g. credit, employment). Carries the heaviest EU AI Act obligations (Annex III)." },
  { term: "Prohibited practice", cat: "Regulatory", def: "A use the EU AI Act bans outright (Art. 5) — e.g. social scoring, emotion recognition at work. The answer is stop, not control." },
  { term: "GPAI", cat: "Regulatory", def: "General-purpose AI model. Modifying one and sharing it beyond your team can make you a provider with Art. 53/55 duties." },
  { term: "Conformity assessment", cat: "Regulatory", def: "The formal check that a high-risk AI system meets EU AI Act requirements before it goes to market (Art. 43)." },
  { term: "Post-market monitoring", cat: "Regulatory", def: "Ongoing monitoring of an AI system in production for new risks and drift (EU AI Act Art. 72)." },
  { term: "GDPR Art. 22", cat: "Regulatory", def: "The right not to be subject to solely automated decisions with legal or similarly significant effects, absent safeguards." },
  { term: "FRIA", cat: "Regulatory", def: "Fundamental Rights Impact Assessment — required for certain high-risk deployers under EU AI Act Art. 27." },
  // Standards
  { term: "ISO/IEC 42001", cat: "Standards", def: "The certifiable AI management-system standard. Structured like ISO 27001 (clauses 4–10 + Annex A controls)." },
  { term: "ISO/IEC 27001", cat: "Standards", def: "The information-security management-system standard; the security backbone AI governance inherits from." },
  { term: "NIST AI RMF", cat: "Standards", def: "The US voluntary AI Risk Management Framework, organised into four functions: Govern, Map, Measure, Manage." },
  { term: "Statement of Applicability (SoA)", cat: "Standards", def: "The index listing every Annex A control, whether it applies, why, and the evidence — the first thing an ISO auditor reads." },
  { term: "Singapore Model AI Governance Framework", cat: "Standards", def: "Singapore's voluntary guidance on responsible AI: internal governance, human oversight, operations and stakeholder communication." },
  { term: "OWASP LLM Top 10", cat: "Standards", def: "The community list of the top security risks specific to LLM applications (e.g. prompt injection, excessive agency)." },
  { term: "MITRE ATLAS", cat: "Standards", def: "A knowledge base of adversarial tactics and techniques against AI/ML systems, modelled on MITRE ATT&CK." },
  // Technical
  { term: "Model drift", cat: "Technical", def: "When a model's behaviour degrades because the live data (or the underlying model) has shifted away from what it was validated on." },
  { term: "Explainability", cat: "Technical", def: "The ability to give a human-understandable reason for a model's output — e.g. reason codes for an adverse decision." },
  { term: "Bias / fairness testing", cat: "Technical", def: "Checking whether a model produces systematically different outcomes across protected groups." },
  { term: "HITL / HOTL", cat: "Technical", def: "Human-in-the-loop / human-on-the-loop — a person approves each action, or supervises and can intervene." },
  { term: "Prompt injection", cat: "Technical", def: "An attack that hides instructions in input to make an AI ignore its guardrails or leak data." },
  { term: "RAG", cat: "Technical", def: "Retrieval-augmented generation — grounding a model's answer in retrieved enterprise documents rather than its training alone." },
  { term: "Guardrail", cat: "Technical", def: "An automated control that blocks, masks or redacts unsafe input or output at the AI gateway boundary." },
  { term: "Model card", cat: "Technical", def: "A standardised document describing a model's purpose, data, performance, limitations and governance." },
  // Governance
  { term: "Residual risk", cat: "Governance", def: "The risk that remains after controls are applied — scored likelihood × impact, tracked to appetite." },
  { term: "Least privilege", cat: "Governance", def: "Granting an agent or user only the capabilities they need; everything else is denied by default." },
  { term: "Capability-based access control", cat: "Governance", def: "Access defined per action an agent may take, not per role or model — enforced at call time." },
  { term: "Evidence artifact", cat: "Governance", def: "The single document or record that proves a control is in place and satisfies its clause across frameworks." },
  { term: "Convergence crosswalk", cat: "Governance", def: "A map of capabilities to the clause each satisfies in every framework at once — build one control, satisfy four." },
  { term: "KRI", cat: "Governance", def: "Key Risk Indicator — a monitored metric with a threshold that signals rising risk before it becomes an incident." },
  { term: "Risk appetite", cat: "Governance", def: "The amount and type of risk an organisation is willing to accept in pursuit of its objectives." },
  { term: "Statement of exception", cat: "Governance", def: "A time-boxed, approved deviation from a policy, with conditions and an owner — not a silent gap." },
  // Roles
  { term: "CAIO", cat: "Roles", def: "Chief AI Officer — owns AI systems, lifecycle and model governance." },
  { term: "CGO", cat: "Roles", def: "Chief Governance Officer — chairs the converged forum; owns policy, risk tiering, exceptions and escalation." },
  { term: "CDPO", cat: "Roles", def: "Chief Data Protection Officer — owns data lineage, DPIAs, retention and residency." },
  { term: "Model Risk", cat: "Roles", def: "The function that independently validates models and owns drift, performance and validation evidence." },
];

export const GLOSSARY_CATEGORIES = ["Regulatory", "Standards", "Technical", "Governance", "Roles"];
