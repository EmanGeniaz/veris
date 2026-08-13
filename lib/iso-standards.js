/* ── ISO/IEC lifecycle standards → control mappings (38507 · 42005) ───────
   Promotes the two lifecycle-governance ISO standards from the library to
   Operational by mapping each standard's considerations to a control VerisZone
   already runs. Posture computed from the mapping (Met=100, Partial=60), not
   asserted. Same row shape as the regional mappings, so the compliance panel
   renders them through one config-driven component.

   Pure data + arithmetic, deterministic, client-safe. */

const WEIGHT = { Met: 100, Partial: 60 };
function statsFor(rows) {
  const met = rows.filter(r => r.status === "Met").length;
  const partial = rows.filter(r => r.status === "Partial").length;
  const score = Math.round(rows.reduce((s, r) => s + (WEIGHT[r.status] || 0), 0) / rows.length);
  return { total: rows.length, met, partial, score };
}

/* ISO/IEC 38507 — governance implications of the use of AI by organizations
   (what a governing body must oversee). */
export const ISO38507_REQS = [
  { n: 1, name: "Value oversight", desc: "The governing body ensures AI delivers value.", control: "Value realization — expected vs realized across the portfolio", surface: "AI Central · Value", status: "Met" },
  { n: 2, name: "Risk oversight", desc: "Oversight of AI risk at board level.", control: "Risk Center — computed residual over the canonical register", surface: "Risk Center", status: "Met" },
  { n: 3, name: "Accountability", desc: "Clear accountability for AI outcomes.", control: "EOS ownership model — accountable owner per initiative & agent", surface: "AI Central · Governance", status: "Met" },
  { n: 4, name: "Policies & controls", desc: "An AI policy and control framework is in place.", control: "Policy register + Common Control Library", surface: "Compliance · Policies", status: "Met" },
  { n: 5, name: "Stakeholder transparency", desc: "Transparent reporting to stakeholders and the board.", control: "Board reporting packs + Article 12 record", surface: "Reporting", status: "Met" },
  { n: 6, name: "Human oversight", desc: "The organization ensures human oversight of AI.", control: "HITL gates + circuit breaker", surface: "HITL Gates", status: "Partial" },
  { n: 7, name: "Compliance obligations", desc: "Legal and regulatory obligations are met.", control: "Global Framework Library — applied jurisdiction stack", surface: "Compliance · Frameworks", status: "Partial" },
];

/* ISO/IEC 42005 — AI system impact assessment (the process & its records). */
export const ISO42005_REQS = [
  { n: 1, name: "Impact-assessment process", desc: "A defined process to assess AI system impact.", control: "AI Impact Assessment (AIA) workflow", surface: "Risk Center · AIA", status: "Met" },
  { n: 2, name: "Scope & context", desc: "System scope, purpose and context documented.", control: "Initiative registry — one object, full context", surface: "AI Central · Portfolio", status: "Met" },
  { n: 3, name: "Affected stakeholders", desc: "Individuals and groups impacted are identified.", control: "AIA stakeholder analysis + feedback engine", surface: "Risk Center · AIA", status: "Partial" },
  { n: 4, name: "Harms & benefits", desc: "Potential harms and benefits are analysed.", control: "Risk Center residual + AIA harm analysis", surface: "Risk Center", status: "Partial" },
  { n: 5, name: "Sensitive use & data", desc: "Sensitive uses and data are assessed.", control: "Gateway data scopes + PII masking", surface: "Veris Enforce · Egress Policy", status: "Met" },
  { n: 6, name: "Documentation & records", desc: "The assessment is recorded for reuse and audit.", control: "Evidence Fabric + Tool-Call Ledger", surface: "Evidence Fabric", status: "Met" },
  { n: 7, name: "Risk integration & review", desc: "Linked to risk management and reviewed over time.", control: "Risk Center — residual recompute + review cadence", surface: "Risk Center", status: "Partial" },
];

export const iso38507Stats = () => statsFor(ISO38507_REQS);
export const iso42005Stats = () => statsFor(ISO42005_REQS);

export const ISO38507_POSTURE_SCORE = statsFor(ISO38507_REQS).score;
export const ISO42005_POSTURE_SCORE = statsFor(ISO42005_REQS).score;
