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

/* China's AI pack now lives in its own module (cn-measures.js) — deeper than
   the Brazil/Korea summaries, mirroring how Singapore has its own file. Re-
   exported here so existing imports (frameworks.js, compliance.jsx) are stable. */
export { CN_INSTRUMENTS, CN_REQS, cnStats, CN_POSTURE_SCORE } from "./cn-measures";

/* India's DPDPA pack lives in its own module (in-dpdpa.js), same depth as the
   China pack. Re-exported here so imports (frameworks.js, compliance.jsx) stay
   consistent with the other regional packs. */
export { IN_INSTRUMENTS, IN_REQS, inStats, IN_POSTURE_SCORE } from "./in-dpdpa";

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
  { n: 2, name: "Transparency / notify AI use", desc: "Notify users of AI-based interactions.", control: "AI-interaction disclosure on every AI reply + Art.12 record", surface: "My AI Assistant", status: "Met" },
  { n: 3, name: "Safety & reliability assurance", desc: "Assure safety and reliability of AI.", control: "Drift Monitor (PSI) + validation + red-team", surface: "Drift Monitor", status: "Partial" },
  { n: 4, name: "Human oversight", desc: "Meaningful human control of high-impact AI.", control: "HITL gates + circuit breaker (real-time revocation)", surface: "HITL Gates / Circuit Breaker", status: "Met" },
  { n: 5, name: "Risk management", desc: "Manage AI risks through the lifecycle.", control: "Risk Center residual engine", surface: "Risk Center", status: "Met" },
  { n: 6, name: "Accountability & documentation", desc: "Keep records enabling accountability.", control: "EOS ownership + Tool-Call Ledger", surface: "Tool-Call Ledger", status: "Met" },
  { n: 7, name: "Impact assessment", desc: "Assess impact of high-impact AI.", control: "AI Impact Assessment (AIA) workflow", surface: "Risk Center · AIA", status: "Partial" },
];

/* United Kingdom — the pro-innovation approach: 5 cross-sectoral principles
   (2023 White Paper) delivered through existing regulators, plus the AI
   assurance ecosystem (DSIT/CDEI) and UK GDPR under the ICO. */
export const UK_REQS = [
  { n: 1, name: "Safety, security & robustness", desc: "AI functions safely, securely and robustly throughout its lifecycle.", control: "Veris Enforce + Drift Monitor + red-team", surface: "Veris Enforce / Drift Monitor", status: "Met" },
  { n: 2, name: "Appropriate transparency & explainability", desc: "Communicate when and how AI is used and explain its decisions.", control: "AI-interaction disclosure on every AI reply + decision transparency + Art.12 record", surface: "My AI Assistant", status: "Met" },
  { n: 3, name: "Fairness", desc: "AI does not undermine legal rights or discriminate unfairly.", control: "Bias monitoring + fairness review", surface: "Drift Monitor", status: "Partial" },
  { n: 4, name: "Accountability & governance", desc: "Clear accountability and governance across the AI lifecycle.", control: "EOS ownership model — accountable owner per initiative & agent", surface: "AI Central · Governance", status: "Met" },
  { n: 5, name: "Contestability & redress", desc: "Routes to contest AI decisions and seek redress.", control: "Decision-appeal / escalation path + incident register", surface: "AI Incidents", status: "Partial" },
  { n: 6, name: "AI assurance (independent evidence)", desc: "Assurance techniques evidencing trustworthy AI (DSIT/CDEI portfolio).", control: "Evidence Fabric + Tool-Call Ledger (tamper-evident hash chain)", surface: "Tool-Call Ledger", status: "Partial" },
  { n: 7, name: "Data protection (UK GDPR / ICO)", desc: "Lawful, fair processing of personal data in AI.", control: "Gateway data scopes + PII masking + egress policy", surface: "Veris Enforce · Egress Policy", status: "Met" },
];

/* Canada — Directive on Automated Decision-Making (Algorithmic Impact
   Assessment, impact levels I–IV) and the forthcoming AIDA (Bill C-27). */
export const CA_REQS = [
  { n: 1, name: "Algorithmic Impact Assessment", desc: "Complete an AIA before deploying an automated decision system.", control: "AI Impact Assessment (AIA) workflow", surface: "Risk Center · AIA", status: "Met" },
  { n: 2, name: "Impact-level classification (I–IV)", desc: "Determine the impact level and scale requirements accordingly.", control: "Risk Center — tiering over the canonical register", surface: "Risk Center", status: "Met" },
  { n: 3, name: "Transparency notice", desc: "Notify affected individuals that a decision is automated.", control: "AI-interaction disclosure on every AI reply + decision transparency", surface: "My AI Assistant", status: "Met" },
  { n: 4, name: "Meaningful explanation", desc: "Provide a meaningful explanation of automated decisions.", control: "Decision transparency + model card + Art.12 record", surface: "Article 12 Log", status: "Partial" },
  { n: 5, name: "Human intervention", desc: "Human-in-the-loop scaled to the impact level.", control: "HITL gates + circuit breaker (real-time revocation)", surface: "HITL Gates / Circuit Breaker", status: "Met" },
  { n: 6, name: "Monitoring & quality assurance", desc: "Monitor outcomes and assure ongoing quality.", control: "Drift Monitor (PSI) + validation", surface: "Drift Monitor", status: "Partial" },
  { n: 7, name: "Recourse & peer review", desc: "Recourse options and peer review of the system.", control: "Decision-appeal path + peer/governance review", surface: "AI Incidents", status: "Partial" },
];

/* Japan — AI Guidelines for Business (METI/MIC, 2024) unifying the Social
   Principles of Human-Centric AI. Principles-based, innovation-friendly. */
export const JP_REQS = [
  { n: 1, name: "Human-centric & human rights", desc: "AI respects human rights and human agency.", control: "EOS governance + human oversight (HITL)", surface: "AI Central · Governance", status: "Met" },
  { n: 2, name: "Safety", desc: "Avoid harm to life, body and property.", control: "Veris Enforce guardrails + Drift Monitor", surface: "Veris Enforce / Drift Monitor", status: "Partial" },
  { n: 3, name: "Fairness", desc: "Avoid unfair bias and discrimination.", control: "Bias monitoring + fairness review", surface: "Drift Monitor", status: "Partial" },
  { n: 4, name: "Privacy protection", desc: "Respect and protect personal data and privacy.", control: "Gateway data scopes + PII masking + egress policy", surface: "Veris Enforce · Egress Policy", status: "Met" },
  { n: 5, name: "Security", desc: "Ensure the security of AI systems.", control: "Veris Enforce + MCP supply-chain quarantine", surface: "Veris Enforce", status: "Met" },
  { n: 6, name: "Transparency & accountability", desc: "Explain AI use and maintain accountability.", control: "AI-interaction disclosure on every AI reply + Art.12 record + EOS ownership", surface: "My AI Assistant", status: "Met" },
  { n: 7, name: "Education & literacy", desc: "Build AI literacy across the organisation.", control: "Governance Academy — role-based AI learning paths", surface: "Governance Academy", status: "Partial" },
];

export const brStats = () => statsFor(BR_REQS);
export const krStats = () => statsFor(KR_REQS);
export const ukStats = () => statsFor(UK_REQS);
export const caStats = () => statsFor(CA_REQS);
export const jpStats = () => statsFor(JP_REQS);

export const BR_POSTURE_SCORE = statsFor(BR_REQS).score;
export const KR_POSTURE_SCORE = statsFor(KR_REQS).score;
export const UK_POSTURE_SCORE = statsFor(UK_REQS).score;
export const CA_POSTURE_SCORE = statsFor(CA_REQS).score;
export const JP_POSTURE_SCORE = statsFor(JP_REQS).score;
