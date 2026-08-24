/* Jurisdiction Atlas — the multi-regime obligation map. The enterprise runs AI
   across Americas, EMEA and APAC; each regime self-flags Applies / Monitor / Out
   of scope from where the estate actually operates, with effective dates and
   penalty exposure. Many sets of obligations collapse into one control set via
   the convergence crosswalk — this Atlas is the "which regimes bind us" input. */

import { PORTFOLIO } from "./portfolio";

/* Regions the estate actually operates in (drives Applies vs Out of scope). */
export const OPERATING_REGIONS = [...new Set(PORTFOLIO.map(p => p.region).filter(r => r && r !== "—"))];

export const REGIMES = [
  { id: "euai",   regime: "EU AI Act",                    geo: "European Union", region: "EMEA",     instrument: "Regulation", status: "applies", effective: "Aug 2026 · high-risk Aug 2027", penalty: "Up to €35M or 7% global turnover", note: "High-risk deployer duties plus potential GPAI provider obligations." },
  { id: "gdpr",   regime: "GDPR",                          geo: "European Union", region: "EMEA",     instrument: "Regulation", status: "applies", effective: "In force",                    penalty: "Up to €20M or 4% turnover",        note: "Lawful basis, Art. 22 automated-decision safeguards, Art. 44 transfers." },
  { id: "ukgdpr", regime: "UK GDPR + DPDI",                geo: "United Kingdom", region: "EMEA",     instrument: "Regulation", status: "applies", effective: "In force",                    penalty: "Up to £17.5M or 4%",               note: "UK data protection; pro-innovation AI principles overlay." },
  { id: "co",     regime: "Colorado AI Act (SB 205)",      geo: "Colorado, US",   region: "Americas", instrument: "Law",        status: "applies", effective: "Feb 2026",                    penalty: "AG enforcement · deceptive-trade",  note: "High-risk AI consumer-protection duty of care." },
  { id: "eeoc",   regime: "US EEOC / ADA guidance",        geo: "United States",  region: "Americas", instrument: "Guidance",   status: "applies", effective: "In force",                    penalty: "Discrimination liability",          note: "Employment-AI non-discrimination." },
  { id: "nist",   regime: "NIST AI RMF",                   geo: "United States",  region: "Americas", instrument: "Framework",  status: "applies", effective: "Voluntary",                   penalty: "None · procurement expectation",    note: "Govern / Map / Measure / Manage baseline." },
  { id: "sg",     regime: "Singapore Model AI Gov + FEAT", geo: "Singapore",      region: "APAC",     instrument: "Guidance",   status: "applies", effective: "In force",                    penalty: "Voluntary · MAS FEAT for finance",  note: "Model AI Governance Framework; FEAT principles." },
  { id: "uae",    regime: "UAE / Dubai Data & AI",         geo: "United Arab Emirates", region: "EMEA", instrument: "Law + free-zone", status: "applies", effective: "In force",                penalty: "UAE Data Office · DIFC / ADGM fines", note: "Federal PDPL (45/2021), DIFC & ADGM data laws, DESC security & cloud, UAE AI ethics." },
  { id: "iso",    regime: "ISO/IEC 42001",                 geo: "Global",         region: "Global",   instrument: "Standard",   status: "applies", effective: "Certifiable now",             penalty: "Certification / market access",     note: "AI management system — the certifiable backbone." },
  { id: "nyc144", regime: "NYC Local Law 144",             geo: "New York City",  region: "Americas", instrument: "Law",        status: "monitor", effective: "In force",                    penalty: "$500–$1,500 per violation/day",     note: "Bias audit for automated employment decision tools." },
  { id: "caadmt", regime: "California ADMT / CPRA",        geo: "California, US", region: "Americas", instrument: "Regulation", status: "monitor", effective: "2026 rulemaking",             penalty: "CPPA enforcement",                  note: "Automated decision-making tech + opt-out rights." },
  { id: "aida",   regime: "Canada AIDA (C-27)",            geo: "Canada",         region: "Americas", instrument: "Bill",       status: "monitor", effective: "Pending royal assent",        penalty: "Up to CAD 25M or 5%",               note: "High-impact AI systems — watch for enactment." },
  { id: "cn",     regime: "China AI Regulations (7 instruments)", geo: "China",     region: "APAC",     instrument: "Regulation", status: "monitor", effective: "In force · labelling Sep 2025", penalty: "CAC enforcement · suspension",      note: "Algorithm filing, deep synthesis, GenAI interim measures, content labelling (GB 45438), ethics review, PIPL/DSL/CSL, TC260 baseline." },
  { id: "kr",     regime: "Korea AI Framework Act",        geo: "South Korea",    region: "APAC",     instrument: "Law",        status: "monitor", effective: "Jan 2026",                    penalty: "Fines · corrective orders",         note: "High-impact AI transparency + safety." },
  { id: "au",     regime: "Australia AI Guardrails",       geo: "Australia",      region: "APAC",     instrument: "Proposed",   status: "monitor", effective: "Consultation",                penalty: "To be determined",                  note: "Mandatory guardrails for high-risk AI (proposed)." },
  { id: "br",     regime: "Brazil PL 2338 (AI Bill)",      geo: "Brazil",         region: "Americas", instrument: "Bill",       status: "out",     effective: "Not enacted",                 penalty: "n/a",                               note: "No operations in Brazil — out of scope, tracked only." },
];

export const REGIME_STATUS_META = {
  applies: { label: "Applies",      tone: "crit" },
  monitor: { label: "Monitor",      tone: "warn" },
  out:     { label: "Out of scope", tone: "ink3" },
};

export function jurisdictionStats() {
  const by = s => REGIMES.filter(r => r.status === s).length;
  return {
    total: REGIMES.length,
    applies: by("applies"),
    monitor: by("monitor"),
    out: by("out"),
    regions: OPERATING_REGIONS.length,
  };
}
