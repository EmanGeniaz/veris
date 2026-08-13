/* ── Regional regulation → control mappings (China · Brazil · South Korea) ──
   Promotes three national instruments from the library to Operational by
   mapping each regulation's core requirements to a control VerisZone already
   runs. Posture is computed from the mapping (Met=100, Partial=60), never
   asserted. Same row shape as the AU/SG mappings, so the compliance panel
   renders them through one config-driven component.

   Pure data + arithmetic, deterministic, client-safe. */

const WEIGHT = { Met: 100, Partial: 60 };
function statsFor(rows) {
  const met = rows.filter(r => r.status === "Met").length;
  const partial = rows.filter(r => r.status === "Partial").length;
  const score = Math.round(rows.reduce((s, r) => s + (WEIGHT[r.status] || 0), 0) / rows.length);
  return { total: rows.length, met, partial, score };
}

/* China — Algorithm Recommendation, Deep Synthesis & Generative AI measures. */
export const CN_REQS = [
  { n: 1, name: "Algorithm filing & registry", desc: "Register recommendation algorithms and models.", control: "AI Model Registry — every model an owned, filed object", surface: "AI Central · Repository", status: "Met" },
  { n: 2, name: "Deep-synthesis / AI content labelling", desc: "Mark and disclose AI-generated content.", control: "AI interaction disclosure + Art.12 per-inference record", surface: "Article 12 Log", status: "Partial" },
  { n: 3, name: "Security self-assessment", desc: "Assess security of algorithms with public-opinion impact.", control: "Risk Center residual engine + security review", surface: "Risk Center", status: "Met" },
  { n: 4, name: "Lawful-content guardrails", desc: "Prevent generation of prohibited content.", control: "Gateway guardrails + HITL on high-stakes output", surface: "HITL Gates", status: "Partial" },
  { n: 5, name: "User transparency & opt-out", desc: "Disclose recommendation logic; allow opt-out.", control: "Decision transparency + user controls", surface: "Decisions / Approvals", status: "Partial" },
  { n: 6, name: "Personal information protection", desc: "Protect personal data (PIPL alignment).", control: "Gateway data scopes + PII masking + egress policy", surface: "Veris Enforce · Egress Policy", status: "Met" },
  { n: 7, name: "Algorithm audit trail", desc: "Keep records for regulatory inspection.", control: "Tool-Call Ledger — tamper-evident hash chain", surface: "Tool-Call Ledger", status: "Met" },
];

/* Brazil — AI Regulatory Framework (PL 2338), risk-based & rights-based. */
export const BR_REQS = [
  { n: 1, name: "Risk classification", desc: "Classify AI systems by risk tier.", control: "Risk Center — computed residual over the canonical register", surface: "Risk Center", status: "Met" },
  { n: 2, name: "Rights of affected persons", desc: "Information, contestation and human review of decisions.", control: "Decision escalation + HITL review path", surface: "Decisions / Approvals", status: "Partial" },
  { n: 3, name: "Governance & accountability", desc: "Owned governance over AI systems.", control: "EOS ownership model — accountable owner per initiative & agent", surface: "AI Central · Governance", status: "Met" },
  { n: 4, name: "Algorithmic impact assessment", desc: "Assess impact of high-risk AI.", control: "AI Impact Assessment (AIA) workflow", surface: "Risk Center · AIA", status: "Partial" },
  { n: 5, name: "Non-discrimination & bias", desc: "Prevent discriminatory outcomes.", control: "Bias monitoring + fairness review", surface: "Drift Monitor", status: "Partial" },
  { n: 6, name: "Transparency", desc: "Disclose AI use and decision basis.", control: "Article 12 per-inference record + disclosure", surface: "Article 12 Log", status: "Met" },
  { n: 7, name: "Security & incident response", desc: "Secure AI systems and report incidents.", control: "Veris Enforce + incident register", surface: "Veris Enforce / AI Incidents", status: "Met" },
];

/* South Korea — AI Basic Act (high-impact AI). */
export const KR_REQS = [
  { n: 1, name: "High-impact AI identification", desc: "Identify and classify high-impact AI.", control: "Risk Center — tiering over the canonical register", surface: "Risk Center", status: "Met" },
  { n: 2, name: "Transparency / notify AI use", desc: "Notify users of AI-based interactions.", control: "AI interaction disclosure + Art.12 record", surface: "Article 12 Log", status: "Partial" },
  { n: 3, name: "Safety & reliability assurance", desc: "Assure safety and reliability of AI.", control: "Drift Monitor (PSI) + validation + red-team", surface: "Drift Monitor", status: "Partial" },
  { n: 4, name: "Human oversight", desc: "Meaningful human control of high-impact AI.", control: "HITL gates + circuit breaker (real-time revocation)", surface: "HITL Gates / Circuit Breaker", status: "Met" },
  { n: 5, name: "Risk management", desc: "Manage AI risks through the lifecycle.", control: "Risk Center residual engine", surface: "Risk Center", status: "Met" },
  { n: 6, name: "Accountability & documentation", desc: "Keep records enabling accountability.", control: "EOS ownership + Tool-Call Ledger", surface: "Tool-Call Ledger", status: "Met" },
  { n: 7, name: "Impact assessment", desc: "Assess impact of high-impact AI.", control: "AI Impact Assessment (AIA) workflow", surface: "Risk Center · AIA", status: "Partial" },
];

export const cnStats = () => statsFor(CN_REQS);
export const brStats = () => statsFor(BR_REQS);
export const krStats = () => statsFor(KR_REQS);

export const CN_POSTURE_SCORE = statsFor(CN_REQS).score;
export const BR_POSTURE_SCORE = statsFor(BR_REQS).score;
export const KR_POSTURE_SCORE = statsFor(KR_REQS).score;
