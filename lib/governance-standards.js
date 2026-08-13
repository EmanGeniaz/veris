/* ── Governance-stack standards → control mappings (ISO 37000/38500/38505) ──
   AI governance doesn't sit alone — it's the top layer of a nested governance
   hierarchy the board already runs:

     ISO 37000 (organization) → 38500 (IT) → 38505 (data) → 38507 (AI)

   VerisZone operates the AI tier (38507) deeply and covers a real slice of data
   governance (38505) through the gateway. For corporate (37000) and IT (38500)
   governance it covers only the AI-relevant intersection — those tiers are the
   enterprise's own. The mappings and scores reflect that honestly: full scope
   for data/AI, AI-scoped for corporate/IT.

   Pure data + arithmetic, deterministic, client-safe. */

const WEIGHT = { Met: 100, Partial: 60 };
function statsFor(rows) {
  const met = rows.filter(r => r.status === "Met").length;
  const partial = rows.filter(r => r.status === "Partial").length;
  const score = Math.round(rows.reduce((s, r) => s + (WEIGHT[r.status] || 0), 0) / rows.length);
  return { total: rows.length, met, partial, score };
}

/* ISO 37000 — Governance of organizations (AI-scoped: the AI slice only). */
export const ISO37000_REQS = [
  { n: 1, name: "Purpose & value creation", desc: "AI serves organizational purpose and creates value.", control: "Value realization — expected vs realized", surface: "AI Central · Value", status: "Met" },
  { n: 2, name: "Board oversight of AI", desc: "The governing body oversees AI.", control: "HITL gates + board reporting packs", surface: "Reporting", status: "Met" },
  { n: 3, name: "Accountability", desc: "Clear accountability for AI decisions.", control: "EOS ownership model + Tool-Call Ledger", surface: "AI Central · Governance", status: "Met" },
  { n: 4, name: "Strategy & performance", desc: "AI strategy is set and performance overseen.", control: "AI strategy / roadmap + monitoring", surface: "AI Central · Strategy", status: "Partial" },
  { n: 5, name: "Stakeholder engagement", desc: "Stakeholders are engaged in AI governance.", control: "Multi-stakeholder feedback engine", surface: "AI Central · Value", status: "Partial" },
  { n: 6, name: "Ethics & responsibility", desc: "AI use is ethical and responsible.", control: "Responsible-AI controls + guardrails", surface: "Compliance · Frameworks", status: "Partial" },
  { n: 7, name: "Transparency & reporting", desc: "Transparent governance reporting.", control: "Reporting packs + Article 12 record", surface: "Reporting", status: "Partial" },
];

/* ISO 38500 — Governance of IT (AI-scoped: the AI-relevant intersection). */
export const ISO38500_REQS = [
  { n: 1, name: "Responsibility", desc: "Clear responsibilities for AI systems.", control: "EOS ownership model", surface: "AI Central · Governance", status: "Met" },
  { n: 2, name: "Strategy", desc: "AI aligned to business strategy.", control: "AI strategy / roadmap alignment", surface: "AI Central · Strategy", status: "Met" },
  { n: 3, name: "Acquisition", desc: "AI models & tools acquired with due diligence.", control: "Model Registry + MCP Registry (hash-pinned)", surface: "MCP Registry", status: "Met" },
  { n: 4, name: "Performance", desc: "AI delivers and is monitored in production.", control: "Drift Monitor + value realization", surface: "Drift Monitor", status: "Partial" },
  { n: 5, name: "Conformance", desc: "AI conforms to policy and regulation.", control: "Global Framework Library + control mappings", surface: "Compliance · Frameworks", status: "Partial" },
  { n: 6, name: "Human behaviour", desc: "AI respects human behaviour and needs.", control: "Academy readiness + HITL oversight", surface: "Governance Academy", status: "Partial" },
];

/* ISO 38505 — Governance of data (full scope: strong gateway coverage). */
export const ISO38505_REQS = [
  { n: 1, name: "Data accountability & ownership", desc: "Ownership and stewardship of data.", control: "Data ownership + EOS accountability", surface: "AI Central · Governance", status: "Met" },
  { n: 2, name: "Data quality & provenance", desc: "Data quality and lineage are managed.", control: "Data scopes + provenance tracking", surface: "Veris Enforce", status: "Met" },
  { n: 3, name: "Data protection & privacy", desc: "Personal and sensitive data is protected.", control: "PII masking + egress policy", surface: "Veris Enforce · Egress Policy", status: "Met" },
  { n: 4, name: "Data value", desc: "Data value is realised responsibly.", control: "Value realization + usage analytics", surface: "AI Central · Value", status: "Partial" },
  { n: 5, name: "Data lifecycle & retention", desc: "Data is retained and retired appropriately.", control: "Retention policy + responsible retirement", surface: "Compliance · Policies", status: "Partial" },
  { n: 6, name: "Data risk", desc: "Data risks are identified and treated.", control: "Risk Center — data-risk tiering", surface: "Risk Center", status: "Met" },
  { n: 7, name: "Data conformance", desc: "Data use conforms to law (GDPR etc.).", control: "Framework Library — data-protection stack", surface: "Compliance · Frameworks", status: "Met" },
];

export const iso37000Stats = () => statsFor(ISO37000_REQS);
export const iso38500Stats = () => statsFor(ISO38500_REQS);
export const iso38505Stats = () => statsFor(ISO38505_REQS);

export const ISO37000_POSTURE_SCORE = statsFor(ISO37000_REQS).score;
export const ISO38500_POSTURE_SCORE = statsFor(ISO38500_REQS).score;
export const ISO38505_POSTURE_SCORE = statsFor(ISO38505_REQS).score;

/* The nested governance lineage — corporate → IT → data → AI. `scope` says how
   far VerisZone reaches into each tier; the enterprise owns the broader tiers. */
export const GOVERNANCE_LINEAGE = [
  { id: "iso-37000", tier: "Corporate", label: "ISO 37000", sub: "Governance of the organization", scope: "AI-scoped", owner: "Enterprise · AI touchpoints" },
  { id: "iso-38500", tier: "IT",        label: "ISO 38500", sub: "Governance of IT",              scope: "AI-scoped", owner: "Enterprise · AI intersection" },
  { id: "iso-38505", tier: "Data",      label: "ISO 38505", sub: "Governance of data",            scope: "Full",      owner: "VerisZone gateway" },
  { id: "iso-38507", tier: "AI",        label: "ISO 38507", sub: "Governance of AI",              scope: "Full",      owner: "VerisZone core" },
];
