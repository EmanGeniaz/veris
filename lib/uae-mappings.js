/* ── UAE / Dubai regulatory pack ──────────────────────────────────────────
   The Emirates run a layered data + security regime: a federal data-protection
   law, two free-zone laws (DIFC, ADGM) that bind entities established there,
   Dubai's electronic-security and cloud rules (DESC), and the national
   information-assurance baseline. This pack promotes "UAE / Dubai" to a
   first-class regime by mapping each core obligation to a control VerisZone
   already runs. Posture is COMPUTED from the mapping (Met=100, Partial=60,
   Gap=0), never asserted — the same honesty rule the other packs follow.

   Pure data + arithmetic, deterministic, client-safe. */

/* The instruments in force, with the citation and enforcing body. `cite` is the
   legal reference the compliance panel shows (inst.cite || inst.cn). */
export const UAE_INSTRUMENTS = [
  { id: "pdpl",   short: "UAE Federal PDPL", cite: "Federal Decree-Law No. 45 of 2021", reg: "UAE Data Office", eff: "In force",
    req: "Federal personal-data protection: lawful basis & consent, data-subject rights, breach notification, cross-border transfer, security, DPO and DPIA." },
  { id: "difc",   short: "DIFC Data Protection Law", cite: "DIFC Law No. 5 of 2020 (+2022 amd.)", reg: "DIFC Commissioner of Data Protection", eff: "In force",
    req: "Free-zone data law for DIFC entities; GDPR-aligned, with specific duties on high-risk and autonomous/AI-driven processing (Art. 10)." },
  { id: "adgm",   short: "ADGM Data Protection Regs", cite: "ADGM DP Regulations 2021", reg: "ADGM Office of Data Protection", eff: "In force",
    req: "Free-zone data regulations for ADGM entities; GDPR-aligned rights, DPIA, breach notification and transfer safeguards." },
  { id: "desc",   short: "DESC Information Security Reg.", cite: "Dubai Electronic Security Center · ISR v2 + Cloud policy", reg: "DESC", eff: "In force",
    req: "Dubai information-security regulation and cloud policy: data classification, approved-cloud controls and residency for Dubai-government-linked entities." },
  { id: "ia",     short: "UAE Information Assurance", cite: "NESA / SIA IA Standards", reg: "UAE Cyber Security Council", eff: "In force",
    req: "National information-assurance baseline — security controls, risk management and incident handling for critical entities." },
  { id: "ethics", short: "UAE AI Ethics Principles", cite: "UAE Office for AI · AI Ethics Guidelines", reg: "UAE Office for AI", eff: "Guidance",
    req: "Fairness, accountability, transparency, human oversight and safety principles for AI systems deployed in the UAE." },
];

const UAE_INST = Object.fromEntries(UAE_INSTRUMENTS.map(i => [i.id, i.short]));

/* Each obligation → the VerisZone control that meets it, its surface, status and
   the instrument it comes from. Same row shape as the India / China packs. */
export const UAE_REQS = [
  { n: 1,  name: "Lawful basis & consent", inst: "pdpl", desc: "Establish a lawful basis and obtain consent where required (PDPL Art. 4–6).", control: "Gateway data scopes + consent record on the processing purpose", surface: "Veris Enforce · Egress Policy", status: "Partial" },
  { n: 2,  name: "Data-subject rights", inst: "pdpl", desc: "Access, correction, erasure, portability and objection (PDPL Art. 13–17).", control: "DSAR workflow + per-tenant data record", surface: "Admin · Users & RBAC", status: "Partial" },
  { n: 3,  name: "Breach notification", inst: "pdpl", desc: "Notify the UAE Data Office and affected data subjects of a personal-data breach (PDPL Art. 9).", control: "Breach-notification workflow — authority + subject notices on the regulatory clock", surface: "Breach Notification", status: "Met" },
  { n: 4,  name: "Cross-border data transfer", inst: "pdpl", desc: "Transfer personal data abroad only with adequacy or appropriate safeguards (PDPL Art. 22–23).", control: "Egress policy — data-residency scoping + deny-by-default destinations", surface: "Veris Enforce · Egress Policy", status: "Met" },
  { n: 5,  name: "Data residency & localisation", inst: "desc", desc: "Keep classified / regulated data within approved UAE / Dubai boundaries.", control: "Egress residency controls + approved-destination allow-list", surface: "Veris Enforce · Egress Policy", status: "Partial" },
  { n: 6,  name: "Records of processing & accountability", inst: "pdpl", desc: "Maintain records demonstrating accountability (PDPL Art. 7).", control: "Tool-Call Ledger — tamper-evident hash chain + Article 12 log", surface: "Tool-Call Ledger", status: "Met" },
  { n: 7,  name: "Security of processing", inst: "pdpl", desc: "Appropriate technical & organisational security measures (PDPL Art. 20).", control: "Veris Enforce — egress policy, PII masking, encryption in transit", surface: "Veris Enforce", status: "Met" },
  { n: 8,  name: "DPO appointment", inst: "pdpl", desc: "Appoint a Data Protection Officer where thresholds are met (PDPL Art. 10).", control: "EOS ownership — accountable CDPO role (organisational)", surface: "Admin · Users & RBAC", status: "Partial" },
  { n: 9,  name: "Data Protection Impact Assessment", inst: "pdpl", desc: "Assess impact of high-risk processing (PDPL Art. 21).", control: "Impact Assessment register — DPIA per personal-data system, computed completeness", surface: "Impact Assessments", status: "Met" },
  { n: 10, name: "Automated processing & profiling safeguards", inst: "difc", desc: "Safeguards on automated / autonomous decision-making (DIFC Art. 10).", control: "HITL gates + circuit breaker + decision transparency", surface: "HITL Gates", status: "Partial" },
  { n: 11, name: "Data classification", inst: "desc", desc: "Classify data by sensitivity per DESC / Dubai Data policy.", control: "Data Provenance — per-system PII classification & minimisation dimension", surface: "Data Provenance", status: "Met" },
  { n: 12, name: "Approved-cloud & cloud security", inst: "desc", desc: "Use approved cloud providers with the required security controls.", control: "MCP supply-chain quarantine + egress approved-destination controls", surface: "Veris Enforce · MCP", status: "Partial" },
  { n: 13, name: "Information-assurance controls", inst: "ia", desc: "Meet the national information-assurance security baseline.", control: "Common control library + Veris Enforce + red-team", surface: "Compliance · Controls", status: "Partial" },
  { n: 14, name: "AI ethics — fairness, transparency, oversight", inst: "ethics", desc: "Deploy AI per the UAE AI ethics principles.", control: "Governance forum + AIA ethics gate + AI-interaction disclosure", surface: "AI Central · Governance", status: "Partial" },
];

/* attach the readable instrument label for the grouped view */
UAE_REQS.forEach(r => { r.instrument = UAE_INST[r.inst] || r.inst; });

const WEIGHT = { Met: 100, Partial: 60, Gap: 0 };
export function uaeStats() {
  const met = UAE_REQS.filter(r => r.status === "Met").length;
  const partial = UAE_REQS.filter(r => r.status === "Partial").length;
  const gap = UAE_REQS.filter(r => r.status === "Gap").length;
  const score = Math.round(UAE_REQS.reduce((s, r) => s + (WEIGHT[r.status] || 0), 0) / UAE_REQS.length);
  return { total: UAE_REQS.length, met, partial, gap, score, instruments: UAE_INSTRUMENTS.length };
}
export const UAE_POSTURE_SCORE = uaeStats().score;
