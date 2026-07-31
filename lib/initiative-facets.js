/* ── Cross-functional initiative facets ─────────────────────────────
   One initiative is a single shared object; every CXO sees a FACET of
   it. A facet is an owned gate with a status that can block — computed
   from the canonical AI Asset record so every executive reads the same
   truth, framed for their domain. This binds the CXO dashboards together:
   the CISO sees security, the CFO finance, the CHRO readiness, the CEO
   the composite — all of the SAME initiative. */

import { AI_ASSETS, assetById } from "./ai-assets";

export const FACET_STATUS = {
  cleared: { label: "Cleared",   color: "good" },
  review:  { label: "In review", color: "info" },
  pending: { label: "Pending",   color: "ink3" },
  blocked: { label: "Blocked",   color: "crit" },
};

const roi = a => parseInt(a.roi, 10) || 0;

/* Compute every facet's status from the record. Deterministic — the same
   initiative reads the same way for everyone; only the framing differs. */
export function facetsFor(a){
  const g = a.guardrail || 0, adopt = a.adoption || 0;
  const riskBad = a.risk === "Critical" || a.risk === "High";
  const priv = (a.risksList || []).some(r => /privacy|data|profil|employee/i.test(r)) || a.arch.dataClass === "Restricted";
  const secRisk = (a.risksList || []).some(r => /inject|leak|exfil|security|adversar/i.test(r));
  const highRisk = a.arch.euAiAct === "High-risk";
  const s = k => ({ key: k, ...FACET_STATUS[k] });
  return [
    { domain: "Security",       owner: "CISO",  role: "ciso",  ...s(secRisk && g < 80 ? "blocked" : g < 85 ? "review" : "cleared"), note: secRisk ? `Guardrail ${g}% · injection / leak vectors under review` : `Guardrail coverage ${g}% · no open vectors` },
    { domain: "Infrastructure", owner: "CIO",   role: "cio",   ...s(a.lifecycle === "Production" || a.lifecycle === "Scaling" ? "cleared" : "review"), note: `${a.arch.hosting} · ${a.arch.model}` },
    { domain: "Data & Privacy", owner: "CDPO",  role: "cdpo",  ...s(priv ? (highRisk ? "blocked" : "review") : "cleared"), note: priv ? `${a.arch.dataClass} data · DPIA ${highRisk ? "overdue" : "required"}` : `${a.arch.dataClass} · no personal data` },
    { domain: "Finance",        owner: "CFO",   role: "cfo",   ...s(roi(a) >= 25 ? "cleared" : roi(a) >= 10 ? "review" : "pending"), note: `ROI ${a.roi} · ${a.actual} of ${a.expected} realized` },
    { domain: "Readiness",      owner: "CHRO",  role: "chro",  ...s(adopt >= 70 ? "cleared" : adopt >= 45 ? "review" : "pending"), note: `Adoption ${adopt}% · ${adopt < 70 ? "enablement needed" : "teams ready"}` },
    { domain: "Risk",           owner: "CRO",   role: "cro",   ...s(riskBad ? (adopt < 50 ? "blocked" : "review") : "cleared"), note: `${a.risk} residual · ${(a.risksList || []).length} tracked risks` },
    { domain: "Legal",          owner: "Legal", role: "legal", ...s(highRisk ? "review" : "cleared"), note: highRisk ? "EU AI Act high-risk · conformity assessment due" : "Limited-risk · standard terms" },
    { domain: "Governance",     owner: "CAIO",  role: "caio",  ...s(a.rec.verdict === "Scale" ? "cleared" : a.rec.verdict === "Retire" ? "blocked" : "review"), note: `${a.lifecycle} · Veris recommends: ${a.rec.verdict}` },
  ];
}

/* The single facet a given role owns — drives each CXO's "needs your
   review" queue. */
export const ROLE_FACET = { ciso: "Security", cio: "Infrastructure", cdpo: "Data & Privacy", cfo: "Finance", chro: "Readiness", cro: "Risk", legal: "Legal", caio: "Governance" };

/* Initiatives whose facet for `role` still needs attention (not cleared). */
export function initiativesForRole(role){
  const domain = ROLE_FACET[role];
  if (!domain) return [];
  return AI_ASSETS
    .map(a => ({ a, facet: facetsFor(a).find(f => f.domain === domain) }))
    .filter(x => x.facet && x.facet.key !== "cleared");
}

/* Composite RAG across every facet — the CEO / AI Central view. */
export function facetRollup(a){
  const f = facetsFor(a);
  return { cleared: f.filter(x => x.key === "cleared").length, review: f.filter(x => x.key === "review").length,
           pending: f.filter(x => x.key === "pending").length, blocked: f.filter(x => x.key === "blocked").length, total: f.length,
           worst: f.find(x => x.key === "blocked") || f.find(x => x.key === "review") || f.find(x => x.key === "pending") || null };
}

export { AI_ASSETS, assetById };
