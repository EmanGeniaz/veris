/* ── Canonical AI Asset record ──────────────────────────────────────
   One profile per AI asset, assembled from the seeded initiative data so
   every template and register reads from a single source (never re-keyed).
   buildAsset(initiative) -> normalized record; AI_ASSETS -> all of them.
   The scale/retire recommendation is COMPUTED from the record (ROI +
   adoption + risk), so Veris advises from real numbers, not guesses. */

import { acInitiatives } from "./platform-models";

/* Per-asset system architecture (models + tools) and governance metadata
   that isn't on the raw initiative. Keyed by initiative id. */
const ARCH = {
  "ai-001": { assetType:"GenAI Agent",          model:"Claude Sonnet · via AI Gateway", data:"CRM tickets · KB articles",     integrations:"ServiceNow · Zendesk",  guardrails:"PII redaction · prompt-shield",  hosting:"Cloud · gateway-routed", dataClass:"Confidential", ttv:"7 months", euAiAct:"Limited-risk" },
  "ai-002": { assetType:"Decision Model",        model:"Scorecard + LLM rationale",       data:"Applications · bureau data",    integrations:"Loan origination",       guardrails:"Art.22 human review · DPIA",     hosting:"In-tenant",              dataClass:"Restricted",   ttv:"11 months", euAiAct:"High-risk" },
  "ai-003": { assetType:"Process Automation",    model:"GPT-4o · via AI Gateway",         data:"Ledger · reconciliations",     integrations:"ERP · close workflow",   guardrails:"Approval gate · evidence log",   hosting:"Cloud · gateway-routed", dataClass:"Confidential", ttv:"6 months",  euAiAct:"Limited-risk" },
  "ai-004": { assetType:"Recommendation (ML)",   model:"Gradient-boosted ranker",         data:"Skills graph · role profiles", integrations:"HRIS · LMS",             guardrails:"Consent · bias eval",            hosting:"In-tenant",              dataClass:"Restricted",   ttv:"9 months",  euAiAct:"High-risk" },
};
const DEFAULT_ARCH = { assetType:"AI System", model:"—", data:"—", integrations:"—", guardrails:"—", hosting:"—", dataClass:"Internal", ttv:"—", euAiAct:"Unclassified" };

const num = v => { const m = String(v ?? "").match(/-?\d+(\.\d+)?/); return m ? parseFloat(m[0]) : 0; };

/* The governed scale-or-retire recommendation, computed from the record. */
export function assetRecommendation(a){
  const roi = num(a.roi), adopt = a.adoption || 0, riskBad = a.risk === "Critical" || a.risk === "High";
  if (riskBad && adopt < 50) return { verdict:"Remediate", color:"warn", why:`${a.risk} residual risk at ${adopt}% adoption — resolve risk before any scale decision.` };
  if (roi >= 25 && adopt >= 70 && !riskBad) return { verdict:"Scale", color:"good", why:`ROI ${a.roi} and ${adopt}% adoption clear the bar — ready for a governed scale decision.` };
  if (roi < 10 && adopt < 40) return { verdict:"Retire", color:"crit", why:`Low ROI (${a.roi}) and ${adopt}% adoption — a governed retirement may be indicated.` };
  return { verdict:"Continue", color:"info", why:"Healthy but below the scale bar — keep operating and monitoring." };
}

export function buildAsset(i){
  const arch = ARCH[i.id] || DEFAULT_ARCH;
  const a = {
    id: i.id, name: i.name, unit: i.unit, category: i.category, lifecycle: i.lifecycle, status: i.status,
    owner: i.businessOwner, technicalOwner: i.technicalOwner, sponsor: i.sponsor, champion: i.champion, cxo: i.cxo,
    description: i.problem, vision: i.vision, objective: i.objective,
    roi: i.roi, adoption: i.adoption, value: i.valueScore, guardrail: i.guardrail,
    expected: i.expected, actual: i.actual, budget: i.budget, spent: i.spent, timeline: i.timeline,
    risk: i.risk, priority: i.priority, blockedBy: i.blockedBy,
    policies: i.policies || [], controls: i.controls || [], audits: i.audits || [],
    risksList: i.risks || [], successMetrics: i.successMetrics || [],
    arch,
  };
  a.rec = assetRecommendation(a);
  return a;
}

export const AI_ASSETS = acInitiatives.map(buildAsset);
export const assetById = id => AI_ASSETS.find(x => x.id === id) || AI_ASSETS[0];
