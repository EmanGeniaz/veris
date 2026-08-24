/* ── Data provenance & governance ────────────────────────────────────────
   The data control the AI-data frameworks all point at from different angles:
   EU AI Act Art. 10 (data & data governance), ISO/IEC 42001 A.7 (data for AI
   systems), the NIST AI-security data-poisoning defence, OWASP LLM03
   (training-data poisoning) and China's lawful, IP-clean training-data duty.

   One record per AI system captures where its training and grounding data came
   from and whether it is governed: source lineage, a documented lawful basis,
   IP / licence clearance, PII classification & minimisation, quality &
   representativeness, integrity / poisoning defence, retention, and an
   immutable provenance record with a content hash. Completeness is scored from
   those dimensions — computed, never asserted.

   Pure + client-safe, fully deterministic: no Date.now / Math.random anywhere,
   so the same estate always produces the same figures (SSR and client). */

import { acInitiatives } from "./platform-models";

/* deterministic hash / jitter (djb2) — stands in for the SHA-256 the gateway
   computes server-side; keeps the record verifiable in the pure engine. */
function h32(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h; }
const hash = s => h32(s).toString(16).padStart(8, "0");
const frac = s => (h32(s) % 1000) / 1000;

/* The eight dimensions a governed data record must cover. */
export const DATA_DIMENSIONS = [
  { id: "lineage",   name: "Source catalogue & lineage",        desc: "Every training / grounding source catalogued with its origin." },
  { id: "lawful",    name: "Lawful basis",                      desc: "A documented lawful basis per source (GDPR Art. 6 / DPDP)." },
  { id: "ip",        name: "IP & licence clearance",            desc: "Sources are licensed and IP-clean for the intended use." },
  { id: "pii",       name: "PII classification & minimisation", desc: "Personal data classified and minimised to the purpose." },
  { id: "quality",   name: "Quality & representativeness",      desc: "Data quality, bias and representativeness checked (Art. 10(3))." },
  { id: "integrity", name: "Integrity & poisoning defence",     desc: "Sources signed / pinned; tamper and poisoning defence." },
  { id: "retention", name: "Retention & purge",                 desc: "Retention schedule and purge on completion." },
  { id: "record",    name: "Provenance record",                desc: "Immutable data-governance record with a content hash." },
];

/* Representative data sources by system category. */
function sourcesFor(i) {
  const cat = `${i.category || ""} ${i.name || ""}`.toLowerCase();
  if (/copilot|genai|assistant|resolution|content|chat/.test(cat)) return ["Support ticket history", "Product knowledge base", "Foundation model (vendor, licensed)"];
  if (/credit|decision|risk|fraud|scoring/.test(cat)) return ["Bureau credit data", "Internal application records", "Adverse-action outcomes"];
  if (/automation|close|process|reconcil/.test(cat)) return ["ERP ledger extracts", "Reconciliation rules"];
  if (/recommend|skills|navigator|people|workforce/.test(cat)) return ["HRIS skills profiles", "Learning catalogue", "Role taxonomy"];
  return ["Enterprise data warehouse", "Third-party enrichment (licensed)"];
}

/* A per-system data-governance record. Higher-maturity (production/scaling)
   systems are further along; a couple of dimensions stay open on earlier ones
   so completeness varies honestly. */
export function dataRecord(i) {
  const mature = /production|scal|monitor/i.test(i.lifecycle);
  const mid = /implementation|pilot|deploy/i.test(i.lifecycle);
  const sources = sourcesFor(i);
  const pii = /credit|decision|copilot|resolution|people|workforce|skills/i.test(`${i.category} ${i.name}`) ? "High" : /finance|close|automation/i.test(`${i.category} ${i.name}`) ? "Low" : "Medium";
  // per-dimension state — deterministic from the system id + dimension
  const checks = DATA_DIMENSIONS.map(d => {
    const r = frac(i.id + d.id);
    let st;
    if (mature) st = r < 0.82 ? "Met" : "Partial";
    else if (mid) st = r < 0.55 ? "Met" : r < 0.85 ? "Partial" : "Open";
    else st = r < 0.35 ? "Met" : r < 0.75 ? "Partial" : "Open";
    // a governed record is the anchor: mature systems always hold one
    if (d.id === "record" && mature) st = "Met";
    return { ...d, status: st };
  });
  const met = checks.filter(c => c.status === "Met").length;
  const partial = checks.filter(c => c.status === "Partial").length;
  const completeness = Math.round((met * 100 + partial * 60) / checks.length);
  const lawfulBasis = /credit|decision/i.test(`${i.category} ${i.name}`) ? "Legal obligation + legitimate interest" : /copilot|resolution|people|workforce|skills/i.test(`${i.category} ${i.name}`) ? "Contract + consent" : "Legitimate interest";
  const status = completeness >= 85 ? "Governed" : completeness >= 60 ? "In review" : "Gaps";
  const ipCleared = checks.find(c => c.id === "ip").status === "Met";
  const validated = checks.find(c => c.id === "integrity").status === "Met";
  return { id: i.id, name: i.name, unit: i.unit, sources, pii, lawfulBasis, ipCleared, validated,
    checks, met, partial, completeness, status,
    provenanceHash: hash(i.id + "|" + sources.join("|") + "|" + lawfulBasis) };
}

export function dataRecords() { return acInitiatives.map(dataRecord); }

/* The governance workflow that produces a record. */
export const PROVENANCE_WORKFLOW = [
  { n: 1, stage: "Catalogue",  owner: "Data owner + CDPO",  crit: "List every training and grounding source with its origin and lineage." },
  { n: 2, stage: "Classify",   owner: "CDPO",               crit: "Classify personal data, tag sensitivity, and minimise to the purpose." },
  { n: 3, stage: "Clear",      owner: "Legal + Data owner", crit: "Confirm a lawful basis per source and clear IP / licence for the use." },
  { n: 4, stage: "Validate",   owner: "ML engineering",     crit: "Check quality and representativeness; sign / pin sources against poisoning." },
  { n: 5, stage: "Record",     owner: "Governance Office",  crit: "Write the immutable data-governance record with a content hash." },
  { n: 6, stage: "Review",     owner: "CDPO",               crit: "Re-verify on material data change or on cadence; keep the record fresh." },
];

export function provenanceStats() {
  const rows = dataRecords();
  const total = rows.length;
  const governed = rows.filter(r => r.status === "Governed").length;
  const ipClean = rows.filter(r => r.ipCleared).length;
  const validated = rows.filter(r => r.validated).length;      // poisoning-defence coverage
  const highPii = rows.filter(r => r.pii === "High").length;
  const avgCompleteness = Math.round(rows.reduce((s, r) => s + r.completeness, 0) / total);
  const cataloguedSources = rows.reduce((s, r) => s + r.sources.length, 0);
  return { total, governed, ipClean, validated, highPii, avgCompleteness, cataloguedSources,
    ipCleanPct: Math.round(ipClean / total * 100), validatedPct: Math.round(validated / total * 100),
    dimensions: DATA_DIMENSIONS.length };
}
