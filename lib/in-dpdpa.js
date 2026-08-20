/* ── India DPDPA regulatory pack ──────────────────────────────────────────
   India's personal-data regime is anchored by the Digital Personal Data
   Protection Act, 2023 (DPDP Act) — enacted, with the operational Draft DPDP
   Rules, 2025 out for consultation — layered over the interim SPDI Rules, the
   CERT-In incident-reporting directions, MeitY's IT/AI advisories, and
   sector-specific data-localisation directives (RBI / SEBI / IRDAI). This
   module promotes "India Responsible AI Framework" from a thin library summary
   to a first-class DPDPA pack: the specific instruments, and each core
   obligation mapped to a control VerisZone already runs. Posture is COMPUTED
   from the mapping (Met = 100, Partial = 60), never asserted.

   Pure data + arithmetic. Deterministic, client-safe. */

/* The instruments in force / in flight. `reg` = enforcing body, `cite` = the
   statutory citation shown to a reviewer, `eff` = status/date, `req` = what it
   obliges. */
export const IN_INSTRUMENTS = [
  { id: "dpdp-act",  short: "Digital Personal Data Protection Act, 2023", cite: "No. 22 of 2023", reg: "MeitY", eff: "Enacted 2023",
    req: "Consent-based processing of digital personal data; notice; data-principal rights; data-fiduciary duties; children's data; cross-border transfer; penalties up to ₹250 cr." },
  { id: "dpdp-rules", short: "Draft DPDP Rules, 2025", cite: "Draft · MeitY consultation", reg: "MeitY", eff: "Draft 2025",
    req: "Operational detail: Consent Manager registration, breach-notification timelines & content, verifiable parental consent, SDF audit/DPIA, retention periods." },
  { id: "dpb",       short: "Data Protection Board of India", cite: "DPDP Act, Ch. V", reg: "DPB (statutory)", eff: "On notification",
    req: "Adjudicatory body: receives breach reports, investigates non-compliance, directs remedial action, imposes financial penalties." },
  { id: "spdi",      short: "SPDI Rules, 2011 (IT Act s.43A)", cite: "IT Act 2000 · s.43A / s.72A", reg: "MeitY", eff: "Interim, in force",
    req: "Reasonable security practices for Sensitive Personal Data or Information (SPDI); privacy policy; consent for collection — interim until DPDP fully supersedes." },
  { id: "certin",    short: "CERT-In Cyber Incident Directions, 2022", cite: "CERT-In · 20(3)/2022", reg: "CERT-In", eff: "In force",
    req: "Report specified cyber incidents within 6 hours; maintain logs for 180 days; synchronise clocks — applies to AI systems processing personal data." },
  { id: "sectoral",  short: "Sectoral data-localisation directives", cite: "RBI · SEBI · IRDAI", reg: "Sector regulators", eff: "In force",
    req: "Payment-system data storage in India (RBI); regulated-entity data residency & audit (SEBI, IRDAI) — governs where AI may store and route regulated data." },
];

const IN_INST = Object.fromEntries(IN_INSTRUMENTS.map(i => [i.id, i.short]));

/* Each obligation → the VerisZone control that meets it, its surface, status,
   and the instrument it comes from. Same row shape as the CN/SG/AU packs, plus
   an `instrument` tag the India panel groups by. */
export const IN_REQS = [
  { n: 1,  name: "Notice & consent for processing", inst: "dpdp-act",  desc: "Clear notice and free, specific, informed, unambiguous consent before processing personal data (s.5–6).", control: "Gateway data scopes + consent record on the processing purpose", surface: "Veris Enforce · Egress Policy", status: "Partial" },
  { n: 2,  name: "Purpose limitation & data minimisation", inst: "dpdp-act", desc: "Process only the personal data necessary for the specified lawful purpose (s.6).", control: "Data-classification + PII masking + least-scope prompts at the gateway", surface: "Veris Enforce · Egress Policy", status: "Partial" },
  { n: 3,  name: "Data-principal rights — access & correction", inst: "dpdp-act", desc: "Right to access a summary of, and to correct / complete / update, personal data (s.11–12).", control: "DSAR workflow + per-tenant data record", surface: "Admin · Users & RBAC", status: "Partial" },
  { n: 4,  name: "Right to erasure", inst: "dpdp-act", desc: "Right to erasure of personal data once the purpose is served or consent withdrawn (s.12).", control: "Retention policy + data-purge workflow", surface: "Admin · Data Retention", status: "Partial" },
  { n: 5,  name: "Grievance redressal & nomination", inst: "dpdp-act", desc: "Readily available grievance-redressal mechanism; right to nominate (s.13–14).", control: "Incident register + decision-appeal / escalation path", surface: "AI Incidents", status: "Met" },
  { n: 6,  name: "Security safeguards", inst: "dpdp-act", desc: "Reasonable security safeguards to prevent personal-data breach (s.8(5)).", control: "Veris Enforce — egress policy, PII masking, deny-by-default destinations", surface: "Veris Enforce · Egress Policy", status: "Met" },
  { n: 7,  name: "Breach notification to DPB & principals", inst: "dpdp-rules", desc: "Notify the Data Protection Board and affected data principals of a personal-data breach (s.8(6) + Rules).", control: "Incident register + breach-notification workflow", surface: "AI Incidents", status: "Partial" },
  { n: 8,  name: "Retention limitation & erasure on completion", inst: "dpdp-rules", desc: "Erase personal data on purpose completion / consent withdrawal per prescribed periods.", control: "Retention schedule + expired-data purge control", surface: "Admin · Data Retention", status: "Partial" },
  { n: 9,  name: "Children's data — verifiable consent", inst: "dpdp-act", desc: "Verifiable parental consent for under-18s; no tracking, behavioural monitoring or targeted ads (s.9).", control: "Role & data-class access controls + age-gate on data class", surface: "Admin · Users & RBAC", status: "Partial" },
  { n: 10, name: "Significant Data Fiduciary — DPIA & audit", inst: "dpdp-act", desc: "SDFs must run periodic DPIA and independent data-audit (s.10).", control: "AI Impact Assessment (AIA) workflow + independent audit evidence", surface: "Risk Center · AIA", status: "Partial" },
  { n: 11, name: "SDF — Data Protection Officer in India", inst: "dpdp-act", desc: "SDF must appoint a DPO based in India, accountable to the board (s.10).", control: "EOS ownership — accountable DPO / owner per data domain & agent", surface: "AI Central · Governance", status: "Met" },
  { n: 12, name: "Processing accountability & records", inst: "spdi", desc: "Demonstrable accountability and records of processing for inspection.", control: "Tool-Call Ledger — tamper-evident hash chain + Evidence Fabric", surface: "Tool-Call Ledger", status: "Met" },
  { n: 13, name: "Cross-border transfer restriction", inst: "dpdp-act", desc: "Transfer of personal data outside India restricted to permitted countries (s.16).", control: "Egress policy — data-residency scoping + deny-by-default destinations", surface: "Veris Enforce · Egress Policy", status: "Partial" },
  { n: 14, name: "Sectoral data localisation", inst: "sectoral", desc: "Store / route regulated data within India per RBI, SEBI, IRDAI directions.", control: "Egress policy destination categories + residency guardrail", surface: "Veris Enforce · Egress Policy", status: "Partial" },
  { n: 15, name: "CERT-In incident reporting & log retention", inst: "certin", desc: "Report specified cyber incidents within 6 hours; retain logs 180 days.", control: "Incident register + Article 12 per-inference log (retained)", surface: "Article 12 Log", status: "Met" },
];

/* attach the readable instrument label for the grouped view */
IN_REQS.forEach(r => { r.instrument = IN_INST[r.inst] || r.inst; });

const WEIGHT = { Met: 100, Partial: 60 };
export function inStats() {
  const met = IN_REQS.filter(r => r.status === "Met").length;
  const partial = IN_REQS.filter(r => r.status === "Partial").length;
  const score = Math.round(IN_REQS.reduce((s, r) => s + (WEIGHT[r.status] || 0), 0) / IN_REQS.length);
  return { total: IN_REQS.length, met, partial, score, instruments: IN_INSTRUMENTS.length };
}
export const IN_POSTURE_SCORE = inStats().score;
