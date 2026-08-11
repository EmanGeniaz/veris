/* ── Singapore Model AI Governance Framework (GenAI & Agentic) ────────────
   Promotes the framework from "Mapped" to "Operational" by mapping each of its
   governance dimensions to a control VerisZone already runs — posture computed
   from that mapping, not asserted. Singapore's framework is the one written for
   generative and *agentic* AI, so it maps cleanly onto the enforcement plane,
   the agent-chain permissions and the circuit breaker.

   Status per dimension: Met (a live control satisfies it) / Partial (a defined
   control exists, coverage growing). Pure data + arithmetic, deterministic. */

export const SG_DIMENSIONS = [
  { n: 1, name: "Accountability", desc: "Clear ownership and governance over AI systems.", control: "EOS ownership model — accountable owner per initiative & agent", surface: "AI Central · Governance", status: "Met" },
  { n: 2, name: "Data", desc: "Data quality, provenance and governance for AI.", control: "Gateway data scopes + PII masking + egress policy", surface: "Veris Enforce · Egress Policy", status: "Met" },
  { n: 3, name: "Trusted development & deployment", desc: "Transparency over model development and deployment.", control: "AI Model Registry + governed lifecycle + Evidence Fabric", surface: "AI Central · Repository", status: "Met" },
  { n: 4, name: "Incident reporting", desc: "Processes to report and respond to AI incidents.", control: "Incident register + convergence crosswalk", surface: "AI Incidents", status: "Met" },
  { n: 5, name: "Testing & assurance", desc: "Independent testing and assurance of AI systems.", control: "Drift Monitor (PSI) + red-team + validation", surface: "Drift Monitor / Red-Team", status: "Partial" },
  { n: 6, name: "Security", desc: "Protect AI systems against adversarial threats.", control: "Veris Enforce — least privilege, MCP registry, circuit breaker", surface: "Veris Enforce", status: "Met" },
  { n: 7, name: "Content provenance", desc: "Disclose and trace AI-generated content.", control: "AI interaction disclosure + Art.12 per-inference record", surface: "Article 12 Log", status: "Partial" },
  { n: 8, name: "Safety & alignment", desc: "Guardrails and human oversight keep agents aligned.", control: "Agent-chain permissions + HITL gates + circuit breaker", surface: "Agent Chain Permissions", status: "Met" },
  { n: 9, name: "AI for public good", desc: "Responsible, inclusive value from AI.", control: "Value realization + multi-stakeholder feedback + Academy", surface: "AI Central · Value", status: "Partial" },
];

const WEIGHT = { Met: 100, Partial: 60 };

export function sgDimensionStats() {
  const met = SG_DIMENSIONS.filter(d => d.status === "Met").length;
  const partial = SG_DIMENSIONS.filter(d => d.status === "Partial").length;
  const score = Math.round(SG_DIMENSIONS.reduce((s, d) => s + (WEIGHT[d.status] || 0), 0) / SG_DIMENSIONS.length);
  return { total: SG_DIMENSIONS.length, met, partial, score };
}

export const SG_POSTURE_SCORE = sgDimensionStats().score;
