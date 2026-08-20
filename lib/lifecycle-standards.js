/* ── AI lifecycle & foundational ISO standards → control mappings ──────────
   Promotes the five remaining library standards to Operational by mapping each
   one's core concerns to a control VerisZone already runs:

     ISO/IEC 22989 — AI concepts & terminology
     ISO/IEC 23053 — framework for ML-based AI systems
     ISO/IEC 24027 — bias in AI systems & AI-aided decision making
     ISO/IEC 25059 — quality model for AI systems (SQuaRE extension)
     ISO/IEC 5338  — AI system lifecycle processes (12207/15288 for AI)

   These are foundational standards — terminology, reference architecture,
   quality and lifecycle process — so VerisZone aligns strongly to most of
   them through structures it already has (the canonical 13-phase lifecycle,
   the model registry, the glossary, the drift monitor, the impact-assessment
   register). Posture is COMPUTED from the mapping (Met=100, Partial=60), never
   asserted — an honest Partial marks where the alignment is real but not yet
   fully evidenced. Same row shape { n, name, desc, control, surface, status }
   as every other pack, so the compliance panel renders them through the one
   config-driven component.

   Pure data + arithmetic, deterministic, client-safe. */

const WEIGHT = { Met: 100, Partial: 60 };
function statsFor(rows) {
  const met = rows.filter(r => r.status === "Met").length;
  const partial = rows.filter(r => r.status === "Partial").length;
  const score = Math.round(rows.reduce((s, r) => s + (WEIGHT[r.status] || 0), 0) / rows.length);
  return { total: rows.length, met, partial, score };
}

/* ISO/IEC 22989 — AI concepts & terminology. Adopted as the shared vocabulary
   the whole platform speaks; the Glossary is the evidence it is used. */
export const ISO22989_REQS = [
  { n: 1, name: "Common AI terminology adopted", desc: "One agreed vocabulary for AI concepts across the program.", control: "Governance Glossary — every platform term of art, in plain language", surface: "Governance Glossary", status: "Met" },
  { n: 2, name: "AI system & stakeholder concepts", desc: "Define AI systems and the stakeholders around them.", control: "EOS ownership model — accountable owner + stakeholder per initiative & agent", surface: "AI Central · Governance", status: "Met" },
  { n: 3, name: "AI lifecycle model defined", desc: "A named, shared model of the AI lifecycle.", control: "Canonical 13-phase AI lifecycle with evidence gates", surface: "AI Central · Lifecycle", status: "Met" },
  { n: 4, name: "AI system components described", desc: "Functional and system components named consistently.", control: "AI Model Registry — every model an owned object with a model card", surface: "AI Central · Repository", status: "Met" },
  { n: 5, name: "Data concepts in AI", desc: "Consistent concepts for data used by AI.", control: "Data governance record + provenance on the model card", surface: "AI Central · Repository", status: "Partial" },
  { n: 6, name: "Trustworthiness characteristics vocabulary", desc: "Shared terms for the trustworthiness properties.", control: "Trust Center + convergence crosswalk characteristics", surface: "Compliance · Crosswalk", status: "Met" },
  { n: 7, name: "Consistent use across artifacts", desc: "The terminology is actually used in generated artifacts.", control: "Template Library — packs generate pre-filled from the shared vocabulary", surface: "Template Library", status: "Partial" },
];

/* ISO/IEC 23053 — framework for ML-based AI systems. Mapped to the registry,
   the data pipeline record, the lifecycle gates and the drift monitor. */
export const ISO23053_REQS = [
  { n: 1, name: "ML system components & architecture", desc: "Describe the ML components and how they fit together.", control: "AI Model Registry — model card captures approach & architecture", surface: "AI Central · Repository", status: "Met" },
  { n: 2, name: "ML task & approach documented", desc: "State the ML task, approach and assumptions.", control: "Model card — task, method and intended use", surface: "AI Central · Repository", status: "Met" },
  { n: 3, name: "Training data pipeline", desc: "Govern the data that trains and validates the model.", control: "Data governance record + provenance", surface: "AI Central · Repository", status: "Partial" },
  { n: 4, name: "Model building & training process", desc: "A defined process for building and training models.", control: "13-phase lifecycle — build/train phases with evidence gates", surface: "AI Central · Lifecycle", status: "Met" },
  { n: 5, name: "Model verification & evaluation", desc: "Verify and evaluate the model before use.", control: "Model validation + Drift Monitor baseline", surface: "Drift Monitor", status: "Partial" },
  { n: 6, name: "Deployment & operation", desc: "Deploy and operate the ML system under control.", control: "AI Gateway — governed routing + policy enforcement", surface: "Veris Enforce", status: "Met" },
  { n: 7, name: "Continuous ML monitoring", desc: "Monitor the model in production for shift.", control: "Drift Monitor — Population Stability Index per model", surface: "Drift Monitor", status: "Met" },
];

/* ISO/IEC 24027 — bias in AI systems & AI-aided decision making. Mapped to the
   impact-assessment bias dimension, the drift monitor and the HITL path. */
export const ISO24027_REQS = [
  { n: 1, name: "Bias sources identification", desc: "Identify where bias can enter the system.", control: "Impact Assessment — bias, fairness & discrimination dimension", surface: "Impact Assessments", status: "Met" },
  { n: 2, name: "Data bias assessment", desc: "Assess bias in training and input data.", control: "Data governance record + representativeness review", surface: "AI Central · Repository", status: "Partial" },
  { n: 3, name: "Algorithmic / model bias measurement", desc: "Measure model bias against fairness criteria.", control: "Drift Monitor + fairness metrics on production models", surface: "Drift Monitor", status: "Partial" },
  { n: 4, name: "Human-cognitive bias in AI-aided decisions", desc: "Address bias introduced by human use of AI output.", control: "HITL gates + decision transparency on high-stakes output", surface: "HITL Gates", status: "Met" },
  { n: 5, name: "Bias mitigation", desc: "Apply and track mitigations for identified bias.", control: "AIA mitigations routed to Risk Center treatments", surface: "Risk Center", status: "Met" },
  { n: 6, name: "Bias monitoring over time", desc: "Re-check bias as data and behaviour drift.", control: "Drift Monitor (PSI) + review cadence", surface: "Drift Monitor", status: "Partial" },
  { n: 7, name: "Bias in fundamental-rights impact", desc: "Treat bias as a fundamental-rights concern.", control: "Impact Assessment — fundamental-rights assessment (FRIA)", surface: "Impact Assessments", status: "Met" },
];

/* ISO/IEC 25059 — quality model for AI systems (SQuaRE / 25010 extension).
   Mapped to validation, cost/latency, drift, enforcement and reporting. */
export const ISO25059_REQS = [
  { n: 1, name: "Functional correctness & suitability", desc: "The AI system does what it is meant to, correctly.", control: "Model validation + evaluation against acceptance criteria", surface: "Drift Monitor", status: "Partial" },
  { n: 2, name: "Performance efficiency", desc: "Efficient use of compute, time and cost.", control: "Cost engine — token/compute metering + latency", surface: "Cost Governance", status: "Met" },
  { n: 3, name: "Reliability & robustness", desc: "Stable, robust behaviour under stress and drift.", control: "Drift Monitor + red-team program", surface: "Drift Monitor / Red-Team", status: "Partial" },
  { n: 4, name: "Security", desc: "Protect the AI system and its data.", control: "Veris Enforce — guardrails, egress policy, PII masking", surface: "Veris Enforce", status: "Met" },
  { n: 5, name: "Transparency & user-facing quality", desc: "Users can understand and appropriately rely on output.", control: "AI-interaction disclosure + source-cited grounding", surface: "My AI Assistant", status: "Met" },
  { n: 6, name: "Maintainability & versioning", desc: "The system can be changed and versioned safely.", control: "Model Registry versioning + lifecycle change gates", surface: "AI Central · Repository", status: "Met" },
  { n: 7, name: "Functional adaptability & autonomy quality", desc: "Quality of the system's autonomous behaviour.", control: "Agent least-privilege capability registry + HITL gates", surface: "Veris Enforce · Capabilities", status: "Partial" },
  { n: 8, name: "Quality evaluation & measurement", desc: "Measure and report the quality characteristics.", control: "Reporting packs + Evidence Fabric", surface: "Reporting", status: "Partial" },
];

/* ISO/IEC 5338 — AI system lifecycle processes (12207/15288 tailored to AI).
   Mapped to EOS ownership, the AI PMO, the canonical lifecycle and drift. */
export const ISO5338_REQS = [
  { n: 1, name: "Organizational & agreement processes", desc: "Governed project-enabling and agreement processes.", control: "EOS ownership model + governance operating model", surface: "AI Central · Governance", status: "Met" },
  { n: 2, name: "Technical management processes", desc: "Plan, control, and manage risk and configuration.", control: "AI PMO + Risk Center — planning, risk & config control", surface: "AI Central · PMO", status: "Met" },
  { n: 3, name: "Knowledge & data acquisition process", desc: "Acquire and govern the data/knowledge the AI needs.", control: "Data governance record + provenance", surface: "AI Central · Repository", status: "Partial" },
  { n: 4, name: "AI system lifecycle stages", desc: "A defined set of lifecycle stages with entry/exit.", control: "Canonical 13-phase lifecycle with evidence gates", surface: "AI Central · Lifecycle", status: "Met" },
  { n: 5, name: "Verification & validation processes", desc: "Verify and validate through the lifecycle.", control: "Model validation + Drift Monitor baseline gates", surface: "Drift Monitor", status: "Partial" },
  { n: 6, name: "Operation & monitoring", desc: "Operate and monitor the AI system in service.", control: "AI Gateway + Drift Monitor (post-market monitoring)", surface: "Drift Monitor", status: "Met" },
  { n: 7, name: "Continuous validation & re-training", desc: "Re-validate and re-train as the system drifts.", control: "Drift Monitor + lifecycle re-entry on material change", surface: "AI Central · Lifecycle", status: "Partial" },
  { n: 8, name: "Retirement & decommission", desc: "Retire the AI system cleanly at end of life.", control: "Lifecycle end-of-life phase + evidence retention", surface: "AI Central · Lifecycle", status: "Met" },
];

export const iso22989Stats = () => statsFor(ISO22989_REQS);
export const iso23053Stats = () => statsFor(ISO23053_REQS);
export const iso24027Stats = () => statsFor(ISO24027_REQS);
export const iso25059Stats = () => statsFor(ISO25059_REQS);
export const iso5338Stats = () => statsFor(ISO5338_REQS);

export const ISO22989_POSTURE_SCORE = statsFor(ISO22989_REQS).score;
export const ISO23053_POSTURE_SCORE = statsFor(ISO23053_REQS).score;
export const ISO24027_POSTURE_SCORE = statsFor(ISO24027_REQS).score;
export const ISO25059_POSTURE_SCORE = statsFor(ISO25059_REQS).score;
export const ISO5338_POSTURE_SCORE = statsFor(ISO5338_REQS).score;
