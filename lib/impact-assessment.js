/* ── AI impact assessment (AIA · DPIA · FRIA) ──────────────────────────────
   One assessment object per AI system, run once and mapped to every regime
   that demands an impact assessment — so the same record discharges the EU AI
   Act fundamental-rights assessment (Art. 27) and risk-management file (Art. 9),
   the GDPR DPIA (Art. 35), ISO/IEC 42001's AI system impact assessment (A.5.2),
   the NIST AI RMF Map function, Brazil's algorithmic impact assessment (PL 2338)
   and South Korea's high-impact assessment at once.

   The register derives its scope from the canonical AI asset list (so coverage
   is measured against the real estate) and scores each assessment's
   completeness from its dimension statuses — pure arithmetic, deterministic and
   SSR-safe (no Date.now / Math.random). Posture the compliance packs read is
   therefore computed, never asserted.

   Pure data + arithmetic, deterministic, client-safe. */

import { AI_ASSETS } from "./ai-assets";

/* ── 1 · The dimensions a combined AIA / DPIA / FRIA covers ───────────────
   Each dimension names the instruments it helps satisfy, so the surface can
   show one assessment discharging many duties. */
export const ASSESSMENT_DIMENSIONS = [
  { id: "purpose",   label: "Purpose, necessity & proportionality", satisfies: ["EU AI Act Art. 27", "GDPR Art. 35", "ISO 42001 A.5.2"] },
  { id: "data",      label: "Personal data & lawful basis",         satisfies: ["GDPR Art. 35", "India DPDP"] },
  { id: "affected",  label: "Affected individuals & groups",        satisfies: ["EU AI Act Art. 27", "Brazil PL 2338"] },
  { id: "rights",    label: "Fundamental-rights impact",            satisfies: ["EU AI Act Art. 27", "Korea AI Basic Act"] },
  { id: "autodec",   label: "Automated decisions & legal effect",   satisfies: ["GDPR Art. 22", "EU AI Act Art. 14"] },
  { id: "bias",      label: "Bias, fairness & discrimination",      satisfies: ["EU AI Act Art. 9", "NIST RMF Map 1.1"] },
  { id: "oversight", label: "Human oversight & contestability",     satisfies: ["EU AI Act Art. 14", "Korea AI Basic Act"] },
  { id: "security",  label: "Security, robustness & accuracy",      satisfies: ["EU AI Act Art. 15", "ISO 42001 A.5.2"] },
  { id: "mitigate",  label: "Mitigations & residual risk",          satisfies: ["EU AI Act Art. 9", "NIST RMF Map 5.1"] },
];

/* ── 2 · The instruments an impact assessment discharges ─────────────────── */
export const AIA_REGIMES = [
  { id: "euai-27",  regime: "EU AI Act",       basis: "Art. 27",   kind: "Fundamental-rights impact assessment (FRIA)" },
  { id: "euai-9",   regime: "EU AI Act",       basis: "Art. 9",    kind: "Risk-management system file" },
  { id: "gdpr-35",  regime: "GDPR",            basis: "Art. 35",   kind: "Data protection impact assessment (DPIA)" },
  { id: "iso-52",   regime: "ISO/IEC 42001",   basis: "A.5.2",     kind: "AI system impact assessment" },
  { id: "nist-map", regime: "NIST AI RMF",     basis: "Map",       kind: "Context & impact mapping" },
  { id: "br-2338",  regime: "Brazil PL 2338",  basis: "Ch. II",    kind: "Algorithmic impact assessment (AIA)" },
  { id: "kr-basic", regime: "Korea AI Basic Act", basis: "High-impact", kind: "High-impact AI assessment" },
];

const RG = Object.fromEntries(AIA_REGIMES.map(r => [r.id, r]));

/* dimension status weights → completeness */
const DIM_WEIGHT = { Complete: 1, "In review": 0.5, Gap: 0 };
const D = (complete = [], review = [], gap = []) => {
  const m = {};
  complete.forEach(id => (m[id] = "Complete"));
  review.forEach(id => (m[id] = "In review"));
  gap.forEach(id => (m[id] = "Gap"));
  ASSESSMENT_DIMENSIONS.forEach(d => { if (!m[d.id]) m[d.id] = "Gap"; });
  return m;
};

/* ── 3 · The register — one assessment per in-scope AI system ─────────────
   Authored answers, keyed to the canonical initiative ids so the register and
   the estate never disagree. `regimes` are the instruments this assessment
   discharges given the system's tier and data. */
export const AIA_REGISTER = [
  { id: "AIA-002", initiativeId: "ai-002", system: "Credit Decision Assurance", tier: "High-risk",
    triggers: ["Automated decision with legal effect", "Annex III — access to credit", "Personal & financial data"],
    regimes: ["euai-27", "euai-9", "gdpr-35", "iso-52", "nist-map", "br-2338", "kr-basic"],
    dims: D(["purpose", "data", "affected", "rights", "autodec", "bias", "oversight", "security", "mitigate"]),
    owner: "Priya Mehta · CDPO", residualBefore: 12, residualAfter: 5,
    classification: "High-risk, Annex III. Full FRIA + DPIA complete; mandatory human oversight (Art. 14), Art. 22 reason codes and a quarterly outcome audit are the standing mitigations." },
  { id: "AIA-004", initiativeId: "ai-004", system: "Workforce Skills Navigator", tier: "High-risk",
    triggers: ["Annex III — employment & worker management", "Personal data", "Profiling / recommendation"],
    regimes: ["euai-27", "euai-9", "gdpr-35", "iso-52", "nist-map", "br-2338", "kr-basic"],
    dims: D(["purpose", "data", "affected", "rights", "autodec", "bias", "oversight", "security", "mitigate"]),
    owner: "Leila Haddad · CAIO", residualBefore: 10, residualAfter: 4,
    classification: "High-risk (employment). FRIA + DPIA complete; consent, bias evaluation and worker-facing transparency are the standing mitigations, with human review of any adverse recommendation." },
  { id: "AIA-001", initiativeId: "ai-001", system: "Customer Resolution Copilot", tier: "Limited-risk",
    triggers: ["Personal data in prompts", "Customer-facing AI interaction"],
    regimes: ["gdpr-35", "iso-52", "nist-map"],
    dims: D(["purpose", "data", "affected", "security", "mitigate"], ["rights", "bias", "oversight"]),
    owner: "Priya Mehta · CDPO", residualBefore: 9, residualAfter: 5,
    classification: "Limited-risk. DPIA complete on the personal-data flow; fundamental-rights, bias and oversight sections are in review ahead of any expansion into decisioning." },
  { id: "AIA-003", initiativeId: "ai-003", system: "Finance Close Automation", tier: "Limited-risk",
    triggers: ["Process automation over financial records", "Approval gate in place"],
    regimes: ["iso-52", "nist-map"],
    dims: D(["purpose", "security", "mitigate"], ["data", "affected"]),
    owner: "D. Osei · Model Risk", residualBefore: 6, residualAfter: 3,
    classification: "Limited-risk, no personal data of consequence and a human approval gate — screened in, impact assessment light, DPIA not required." },
];

/* attach the resolved asset name where the register and estate should agree */
AIA_REGISTER.forEach(a => { const asset = AI_ASSETS.find(x => x.id === a.initiativeId); if (asset) a.system = asset.name; });

/* completeness 0–100 for one assessment, from its dimension statuses */
export function aiaCompleteness(row) {
  const vals = ASSESSMENT_DIMENSIONS.map(d => DIM_WEIGHT[row.dims[d.id]] ?? 0);
  return Math.round((vals.reduce((s, v) => s + v, 0) / ASSESSMENT_DIMENSIONS.length) * 100);
}

/* status derived from completeness + tier */
export function aiaStatus(row) {
  const c = aiaCompleteness(row);
  if (c >= 100) return { label: "Complete", tone: "good" };
  if (c >= 55) return { label: "In review", tone: "warn" };
  return { label: "Required", tone: "crit" };
}

/* regimes this assessment discharges, resolved to full objects */
export const aiaRegimesFor = row => (row.regimes || []).map(id => RG[id]).filter(Boolean);

/* ── 4 · The assessment lifecycle ────────────────────────────────────────── */
export const ASSESSMENT_WORKFLOW = [
  { n: 1, stage: "Screen",   owner: "CAIO + CDPO",  crit: "Does the system need an assessment? Tier it (Annex III / automated decision / personal data) and pick the regimes in scope." },
  { n: 2, stage: "Assess",   owner: "System owner", crit: "Work every dimension — purpose, data, affected people, fundamental rights, bias, oversight, security." },
  { n: 3, stage: "Consult",  owner: "CDPO + Legal", crit: "Consult affected stakeholders and, where residual risk stays high, the supervisory authority (GDPR Art. 36)." },
  { n: 4, stage: "Mitigate", owner: "CAIO + CRO",   crit: "Design controls until residual risk is acceptable; route them to the Risk Center as treatments." },
  { n: 5, stage: "Sign-off", owner: "Governance Forum", crit: "Accountable sign-off records the classification and the deploy / hold decision before go-live." },
  { n: 6, stage: "Review",   owner: "Governance Office", crit: "Re-open on material change or on cadence; keep the record fresh in the Evidence Fabric." },
];

/* ── 5 · Portfolio stats for the surface + compliance packs ──────────────── */
export function aiaStats() {
  const governed = AI_ASSETS.length;
  const assessed = AIA_REGISTER.length;
  const complete = AIA_REGISTER.filter(r => aiaCompleteness(r) >= 100).length;
  const highRisk = AIA_REGISTER.filter(r => r.tier === "High-risk");
  const friaComplete = highRisk.filter(r => aiaCompleteness(r) >= 100).length;
  const dpiaRows = AIA_REGISTER.filter(r => (r.regimes || []).includes("gdpr-35"));
  const dpiaComplete = dpiaRows.filter(r => aiaCompleteness(r) >= 100).length;
  const avgCompleteness = assessed ? Math.round(AIA_REGISTER.reduce((s, r) => s + aiaCompleteness(r), 0) / assessed) : 0;
  const residualCut = AIA_REGISTER.reduce((s, r) => s + Math.max(0, (r.residualBefore || 0) - (r.residualAfter || 0)), 0);
  return {
    governed, assessed, complete,
    coverage: assessed ? Math.round((complete / assessed) * 100) : 0,
    highRisk: highRisk.length, friaComplete,
    friaCoverage: highRisk.length ? Math.round((friaComplete / highRisk.length) * 100) : 100,
    dpia: dpiaRows.length, dpiaComplete,
    dpiaCoverage: dpiaRows.length ? Math.round((dpiaComplete / dpiaRows.length) * 100) : 100,
    avgCompleteness, residualCut, regimes: AIA_REGIMES.length,
  };
}
