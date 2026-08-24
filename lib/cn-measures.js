/* ── China (PRC) AI regulatory pack ──────────────────────────────────────
   China runs one of the most developed AI regimes in the world: a stack of
   binding measures (algorithm recommendation, deep synthesis, generative AI),
   a 2025 content-labelling regime backed by a mandatory national standard, an
   ethics-review requirement, and the PIPL / DSL / CSL data trio. This module
   promotes "China AI Regulations" from a thin summary to a first-class pack —
   the specific instruments, and each core obligation mapped to a control
   VerisZone already runs. Posture is COMPUTED from the mapping (Met = 100,
   Partial = 60), never asserted.

   Pure data + arithmetic. Deterministic, client-safe. */

/* The instruments in force, newest-anchored. `reg` = enforcing body,
   `eff` = effective date, `req` = what it obliges. */
export const CN_INSTRUMENTS = [
  { id: "algo-rec",   short: "Algorithm Recommendation Provisions", cn: "算法推荐管理规定", reg: "CAC + 3 ministries", eff: "Mar 2022",
    req: "Filing of recommendation algorithms; user opt-out & transparency; no unlawful price discrimination; protect minors, elderly and workers." },
  { id: "deep-syn",   short: "Deep Synthesis Provisions", cn: "深度合成规定", reg: "CAC", eff: "Jan 2023",
    req: "Label deep-synthesis / AI-generated content (explicit + implicit); real-identity verification; security assessment; no illegal content." },
  { id: "genai",      short: "Generative AI Interim Measures", cn: "生成式人工智能服务管理暂行办法", reg: "CAC + 6 bodies", eff: "Aug 2023",
    req: "Lawful training data & IP; content upholds core values; security assessment + algorithm filing for public-opinion-capable services; label output; protect personal info." },
  { id: "labelling",  short: "AI-Generated Content Labelling Measures", cn: "人工智能生成合成内容标识办法", reg: "CAC", eff: "Sep 2025",
    req: "Explicit labels + implicit metadata on all AI-generated synthetic content; conformance to mandatory national standard GB 45438-2025." },
  { id: "ethics",     short: "Science & Technology Ethics Review Measures", cn: "科技伦理审查办法(试行)", reg: "MOST", eff: "Dec 2023",
    req: "Ethics committee & ethics review for AI R&D with human / societal impact; expert re-review for listed high-risk activities." },
  { id: "pipl",       short: "PIPL · DSL · CSL data trio", cn: "个人信息保护法 · 数据安全法 · 网络安全法", reg: "CAC", eff: "In force",
    req: "Personal-information protection & consent; data classification & security; CAC security assessment / standard contract for cross-border transfer." },
  { id: "tc260",      short: "TC260 Basic Security Requirements (GenAI)", cn: "生成式人工智能服务安全基本要求", reg: "TC260", eff: "2024",
    req: "Technical baseline for the security assessment: training-corpus safety, content safety, model safety, and problem-response controls." },
];

const CN_INST = Object.fromEntries(CN_INSTRUMENTS.map(i => [i.id, i.short]));

/* Each obligation → the VerisZone control that meets it, its surface, status,
   and the instrument it comes from. Same row shape as the SG/AU packs, plus
   an `instrument` tag the China panel groups by. */
export const CN_REQS = [
  { n: 1,  name: "Algorithm filing & registry (备案)", inst: "algo-rec",  desc: "File recommendation algorithms and large-model services with the CAC registry.", control: "AI Model Registry — every model an owned, filed object with a filing record", surface: "AI Central · Repository", status: "Met" },
  { n: 2,  name: "Security assessment — public-opinion services", inst: "genai", desc: "Self-assessment + CAC assessment for services with public-opinion or social-mobilisation capability.", control: "Risk Center residual engine + security self-assessment workflow", surface: "Risk Center", status: "Partial" },
  { n: 3,  name: "Explicit AI-content labelling", inst: "labelling", desc: "Visible label on AI-generated text, image, audio and video shown to users.", control: "AI-interaction disclosure — visible “AI-assisted” label on every AI reply", surface: "My AI Assistant", status: "Met" },
  { n: 4,  name: "Implicit metadata labelling (GB 45438)", inst: "labelling", desc: "Embed machine-readable provenance metadata per the mandatory national standard.", control: "Content provenance metadata + per-inference record", surface: "Article 12 Log", status: "Partial" },
  { n: 5,  name: "Lawful, IP-clean training data", inst: "genai", desc: "Training corpus from lawful sources with respect for IP and personal-data consent.", control: "Data Provenance — per-system record with lawful basis + IP / licence clearance per source", surface: "Data Provenance", status: "Met" },
  { n: 6,  name: "Content upholds core values", inst: "genai", desc: "Prevent generation of prohibited or unlawful content.", control: "Gateway guardrails + content classifier + HITL on high-stakes output", surface: "HITL Gates", status: "Partial" },
  { n: 7,  name: "Real-identity verification", inst: "deep-syn", desc: "Verify the real identity of users of deep-synthesis / generative services.", control: "Auth.js identity + tenant user registry (SSO / verified accounts)", surface: "Admin · Users & RBAC", status: "Met" },
  { n: 8,  name: "User transparency & opt-out", inst: "algo-rec", desc: "Disclose recommendation logic and let users switch algorithmic recommendation off.", control: "Decision transparency + user controls", surface: "Decisions / Approvals", status: "Partial" },
  { n: 9,  name: "Personal-information protection (PIPL)", inst: "pipl", desc: "Consent, minimisation and protection of personal information in AI processing.", control: "Gateway data scopes + PII masking + egress policy", surface: "Veris Enforce · Egress Policy", status: "Met" },
  { n: 10, name: "Cross-border data security assessment", inst: "pipl", desc: "CAC security assessment or standard contract before exporting data / model traffic offshore.", control: "Egress policy — deny-by-default destinations + data-residency scoping", surface: "Veris Enforce · Egress Policy", status: "Partial" },
  { n: 11, name: "Science & technology ethics review", inst: "ethics", desc: "Ethics-committee review of AI R&D with human or societal impact.", control: "Governance forum + AI Impact Assessment (AIA) with ethics gate", surface: "Risk Center · AIA", status: "Partial" },
  { n: 12, name: "TC260 content & model safety baseline", inst: "tc260", desc: "Meet the technical security baseline used in the assessment (corpus, content, model, response).", control: "Guardrail coverage + red-team + drift monitoring", surface: "Drift Monitor / Red-Team", status: "Partial" },
  { n: 13, name: "Minors protection & anti-addiction", inst: "genai", desc: "Protect minors from over-reliance and unsuitable content.", control: "Role & data-class access controls + usage guardrails", surface: "Admin · Users & RBAC", status: "Met" },
  { n: 14, name: "Complaint & reporting mechanism", inst: "deep-syn", desc: "Accept and handle public complaints about AI content and decisions.", control: "Incident register + decision-appeal / escalation path", surface: "AI Incidents", status: "Met" },
  { n: 15, name: "Algorithm audit trail for inspection", inst: "tc260", desc: "Keep tamper-evident records available for regulatory inspection.", control: "Tool-Call Ledger — tamper-evident hash chain + Evidence Fabric", surface: "Tool-Call Ledger", status: "Met" },
];

/* attach the readable instrument label for the grouped view */
CN_REQS.forEach(r => { r.instrument = CN_INST[r.inst] || r.inst; });

const WEIGHT = { Met: 100, Partial: 60 };
export function cnStats() {
  const met = CN_REQS.filter(r => r.status === "Met").length;
  const partial = CN_REQS.filter(r => r.status === "Partial").length;
  const score = Math.round(CN_REQS.reduce((s, r) => s + (WEIGHT[r.status] || 0), 0) / CN_REQS.length);
  return { total: CN_REQS.length, met, partial, score, instruments: CN_INSTRUMENTS.length };
}
export const CN_POSTURE_SCORE = cnStats().score;
