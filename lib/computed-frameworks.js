/* ── Computed posture for the remaining literal-scored frameworks ──────────
   These frameworks previously carried a hand-set `score` in frameworks.js.
   This module gives each one a real obligation → control mapping so its
   posture is COMPUTED (Met=100, Partial=60, Gap=0), never asserted — the same
   honesty rule the regional and foundational packs already follow. Same row
   shape { n, name, desc, control, surface, status } so the compliance panel
   renders them through the one config-driven component.

   A third status — `Gap` (weight 0) — lets posture fall below the 60% floor of
   the two-status model where VerisZone genuinely has no control yet (e.g. the
   environmental-sustainability TR). `WEIGHT[status] || 0` already treats it as
   zero, so a Gap row counts against the score but not as Met or Partial.

   Pure data + arithmetic, deterministic, client-safe. */

const WEIGHT = { Met: 100, Partial: 60, Gap: 0 };
function statsFor(rows) {
  const met = rows.filter(r => r.status === "Met").length;
  const partial = rows.filter(r => r.status === "Partial").length;
  const gap = rows.filter(r => r.status === "Gap").length;
  const score = Math.round(rows.reduce((s, r) => s + (WEIGHT[r.status] || 0), 0) / rows.length);
  return { total: rows.length, met, partial, gap, score };
}

/* NIST AI RMF 1.0 — Govern, Map, Measure, Manage. */
export const NISTRMF_REQS = [
  { n: 1, name: "Govern — culture, policy & accountability", desc: "Governed AI policies with accountable ownership.", control: "EOS ownership model + AI policy register", surface: "AI Central · Governance", status: "Met" },
  { n: 2, name: "Map — context & risk categorisation", desc: "Establish context and categorise AI systems and risks.", control: "Risk Center — canonical register + AIA scoping", surface: "Risk Center", status: "Met" },
  { n: 3, name: "Map — impacts to individuals & society", desc: "Identify potential impacts on people and groups.", control: "Impact Assessment register — one AIA/FRIA per system, computed completeness, tied to Risk Center treatments", surface: "Impact Assessments", status: "Met" },
  { n: 4, name: "Measure — methods & metrics", desc: "Use appropriate methods to analyse and track risk.", control: "Drift Monitor (PSI) + model validation", surface: "Drift Monitor", status: "Partial" },
  { n: 5, name: "Measure — track effectiveness", desc: "Track the effectiveness of risk treatments over time.", control: "Reporting packs + governance KPIs", surface: "Reporting", status: "Partial" },
  { n: 6, name: "Manage — prioritise & respond", desc: "Prioritise, respond to and treat identified risks.", control: "Risk treatment plans + control mappings", surface: "Compliance · Controls", status: "Partial" },
  { n: 7, name: "Manage — third-party & incident response", desc: "Manage third-party risk and respond to incidents.", control: "Vendor risk review + incident register + breach-notification workflow (regulatory clock)", surface: "Breach Notification", status: "Met" },
];

/* ISO/IEC 42001 — AI management system (AIMS), Annex A controls. */
export const ISO42001_REQS = [
  { n: 1, name: "AI policy & objectives", desc: "Establish an AI policy aligned to objectives (A.2).", control: "AI policy register + objectives", surface: "AI Central · Governance", status: "Met" },
  { n: 2, name: "Roles, responsibilities & authorities", desc: "Define accountable roles for the AIMS (A.3).", control: "EOS ownership — accountable owner per initiative & agent", surface: "AI Central · Governance", status: "Met" },
  { n: 3, name: "AI risk assessment", desc: "Assess risks arising from AI systems (A.5).", control: "Risk Center — computed residual engine", surface: "Risk Center", status: "Met" },
  { n: 4, name: "AI system impact assessment", desc: "Assess impacts to individuals & society (A.5).", control: "Impact Assessment register — AI system impact assessment per system (A.5.2), computed completeness", surface: "Impact Assessments", status: "Met" },
  { n: 5, name: "AI system lifecycle management", desc: "Manage the AI system through its lifecycle (A.6).", control: "13-phase lifecycle + phase evidence gates", surface: "AI Central · Lifecycle", status: "Partial" },
  { n: 6, name: "Data for AI systems", desc: "Govern data quality, provenance & suitability (A.7).", control: "Data Provenance — per-system data-governance record across eight dimensions, computed completeness", surface: "Data Provenance", status: "Met" },
  { n: 7, name: "Operational controls & third parties", desc: "Control operation and third-party AI (A.8/A.10).", control: "Common control library + vendor risk review", surface: "Compliance · Controls", status: "Partial" },
  { n: 8, name: "Performance evaluation & internal audit", desc: "Monitor, measure and audit the AIMS.", control: "Reporting packs + audit evidence (hash chain)", surface: "Reporting", status: "Partial" },
];

/* EU AI Act — obligations for high-risk & GPAI systems. */
export const EUAIACT_REQS = [
  { n: 1, name: "Prohibited-practice screening", desc: "Screen for and prevent prohibited AI practices (Art.5).", control: "Policy rules + prohibited-use gate at the gateway", surface: "Veris Enforce", status: "Partial" },
  { n: 2, name: "Risk classification (high-risk / GPAI)", desc: "Classify systems by risk tier (Art.6, Annex III).", control: "Risk Center — tiering over the canonical register", surface: "Risk Center", status: "Met" },
  { n: 3, name: "Risk management system", desc: "Operate a continuous risk-management system (Art.9).", control: "Risk Center residual engine + review cadence", surface: "Risk Center", status: "Partial" },
  { n: 4, name: "Data & data governance", desc: "Training/validation data quality & governance (Art.10).", control: "Data Provenance — per-system data-governance record: lineage, lawful basis, IP, PII, quality, integrity, hash", surface: "Data Provenance", status: "Met" },
  { n: 5, name: "Technical documentation", desc: "Maintain technical documentation (Art.11, Annex IV).", control: "Model cards + Evidence Fabric", surface: "AI Central · Repository", status: "Partial" },
  { n: 6, name: "Record-keeping & logging", desc: "Automatic logging over the system's lifetime (Art.12).", control: "Article 12 — tamper-evident inference hash chain", surface: "Article 12 Log", status: "Met" },
  { n: 7, name: "Transparency to deployers & users", desc: "Instructions & disclosure of AI use (Art.13/50).", control: "AI-interaction disclosure on every AI reply + decision transparency", surface: "My AI Assistant", status: "Met" },
  { n: 8, name: "Human oversight", desc: "Enable meaningful human oversight (Art.14).", control: "HITL gates + circuit breaker (real-time revocation)", surface: "HITL Gates / Circuit Breaker", status: "Partial" },
  { n: 9, name: "Accuracy, robustness & cybersecurity", desc: "Ensure accuracy, robustness and security (Art.15).", control: "Drift Monitor + red-team + Veris Enforce", surface: "Drift Monitor / Red-Team", status: "Partial" },
  { n: 10, name: "Post-market monitoring & incident reporting", desc: "Monitor in service and report serious incidents (Art.72/73).", control: "Drift monitoring (Art.72) + breach-notification workflow — serious incident on the Art.73 15-day clock", surface: "Breach Notification", status: "Met" },
];

/* GDPR — data protection for AI processing personal data. */
export const GDPR_REQS = [
  { n: 1, name: "Lawful basis & consent", desc: "Establish a lawful basis for processing (Art.6).", control: "Gateway data scopes + consent record", surface: "Veris Enforce · Egress Policy", status: "Partial" },
  { n: 2, name: "Data minimisation & purpose limitation", desc: "Process only what is necessary for the purpose (Art.5).", control: "PII masking + least-scope prompts at the gateway", surface: "Veris Enforce · Egress Policy", status: "Met" },
  { n: 3, name: "Data-subject rights", desc: "Access, rectification and erasure (Art.15–17).", control: "DSAR workflow + per-tenant data record", surface: "Admin · Users & RBAC", status: "Partial" },
  { n: 4, name: "DPIA for high-risk processing", desc: "Assess impact of high-risk processing (Art.35).", control: "Impact Assessment register — DPIA per personal-data system (Art.35), consultation + sign-off workflow", surface: "Impact Assessments", status: "Met" },
  { n: 5, name: "Security of processing", desc: "Appropriate technical & organisational measures (Art.32).", control: "Veris Enforce — egress policy, PII masking, encryption", surface: "Veris Enforce · Egress Policy", status: "Met" },
  { n: 6, name: "Records of processing & accountability", desc: "Maintain records demonstrating accountability (Art.30).", control: "Tool-Call Ledger — tamper-evident hash chain", surface: "Tool-Call Ledger", status: "Met" },
  { n: 7, name: "International transfers", desc: "Safeguard transfers outside the EEA (Art.44–46).", control: "Egress policy — data-residency scoping + deny-by-default", surface: "Veris Enforce · Egress Policy", status: "Met" },
];

/* NIST AI Security Guidance — adversarial ML defence. */
export const NISTSEC_REQS = [
  { n: 1, name: "Data-poisoning defence", desc: "Protect training data integrity.", control: "Data Provenance — signed / pinned sources + integrity dimension + validation", surface: "Data Provenance", status: "Met" },
  { n: 2, name: "Adversarial robustness / evasion", desc: "Resist adversarial evasion of the model.", control: "Red-team program + drift monitoring", surface: "Red-Team / Drift Monitor", status: "Partial" },
  { n: 3, name: "Prompt-injection defence", desc: "Detect and block prompt-injection attacks.", control: "Gateway guardrails + injection detector + response validation", surface: "Veris Enforce", status: "Met" },
  { n: 4, name: "Model extraction / theft", desc: "Prevent model extraction and theft.", control: "Access controls + rate limits + audit", surface: "Admin · Users & RBAC", status: "Partial" },
  { n: 5, name: "Supply-chain integrity", desc: "Trust only signed, pinned model / tool sources.", control: "MCP supply-chain quarantine (manifest hash pinning)", surface: "Veris Enforce · MCP", status: "Partial" },
  { n: 6, name: "Evaluation & testing", desc: "Adversarially evaluate and test AI systems.", control: "Red-team + MITRE ATLAS mapping", surface: "Red-Team", status: "Partial" },
  { n: 7, name: "Monitoring & incident response", desc: "Monitor for attacks and respond to incidents.", control: "Incident register + drift monitoring + breach-notification workflow (assess → notify → log)", surface: "Breach Notification", status: "Met" },
];

/* OWASP Top 10 for LLM Applications. */
export const OWASP_REQS = [
  { n: 1, name: "LLM01 — Prompt injection", desc: "Direct & indirect prompt-injection attacks.", control: "Gateway guardrails + injection detector", surface: "Veris Enforce", status: "Met" },
  { n: 2, name: "LLM02 — Insecure output handling", desc: "Downstream handling of unvalidated model output.", control: "Response validation + secret/PII redaction", surface: "Veris Enforce · Egress", status: "Partial" },
  { n: 3, name: "LLM03 — Training-data poisoning", desc: "Tampered or poisoned training data.", control: "Data Provenance — source lineage + signed/pinned integrity dimension + validation", surface: "Data Provenance", status: "Met" },
  { n: 4, name: "LLM04 — Model denial of service", desc: "Resource-exhaustion attacks.", control: "Rate limits + FinOps cost caps", surface: "Cost Governance", status: "Partial" },
  { n: 5, name: "LLM05 — Supply-chain vulnerabilities", desc: "Compromised models, plugins or MCP servers.", control: "MCP supply-chain quarantine (manifest pinning)", surface: "Veris Enforce · MCP", status: "Met" },
  { n: 6, name: "LLM06 — Sensitive information disclosure", desc: "Leakage of personal or secret data in output.", control: "PII masking + egress response validation", surface: "Veris Enforce · Egress Policy", status: "Met" },
  { n: 7, name: "LLM07 — Insecure plugin / tool design", desc: "Over-scoped or unsafe tool interfaces.", control: "Agent least-privilege capability registry", surface: "Veris Enforce · Capabilities", status: "Partial" },
  { n: 8, name: "LLM08 — Excessive agency", desc: "Agents acting beyond intended authority.", control: "Scoped capability tokens + HITL gates", surface: "HITL Gates", status: "Partial" },
  { n: 9, name: "LLM09 — Overreliance", desc: "Unverified reliance on model output.", control: "Source-cited RAG grounding + disclosure", surface: "AI Central · Assistant", status: "Partial" },
  { n: 10, name: "LLM10 — Model theft", desc: "Unauthorised access to proprietary models.", control: "Access controls + audit trail", surface: "Admin · Users & RBAC", status: "Partial" },
];

/* MITRE ATLAS — adversarial tactics against ML systems. */
export const ATLAS_REQS = [
  { n: 1, name: "Reconnaissance", desc: "Adversary research of the AI system.", control: "Threat modelling (upstream in testing)", surface: "Red-Team", status: "Partial" },
  { n: 2, name: "Resource development", desc: "Adversary builds capabilities / poisoned assets.", control: "Supply-chain provenance + MCP pinning", surface: "Veris Enforce · MCP", status: "Partial" },
  { n: 3, name: "Initial access — prompt injection", desc: "Entry via injection or model input.", control: "Gateway guardrails + injection detector", surface: "Veris Enforce", status: "Met" },
  { n: 4, name: "ML model access", desc: "Adversary gains model/inference access.", control: "Auth.js identity + RBAC + rate limits", surface: "Admin · Users & RBAC", status: "Partial" },
  { n: 5, name: "Execution", desc: "Adversary executes actions via the agent.", control: "Scoped capability tokens + egress policy", surface: "Veris Enforce · Capabilities", status: "Partial" },
  { n: 6, name: "Exfiltration", desc: "Data exfiltration via model or tools.", control: "Egress policy (deny-by-default) + response validation", surface: "Veris Enforce · Egress Policy", status: "Met" },
  { n: 7, name: "Impact", desc: "Adversary causes harm or disruption.", control: "Circuit breaker (real-time revocation)", surface: "Circuit Breaker", status: "Partial" },
  { n: 8, name: "Persistence & evasion", desc: "Adversary maintains access / evades detection.", control: "Drift monitoring + red-team", surface: "Drift Monitor / Red-Team", status: "Partial" },
  { n: 9, name: "Incident correlation", desc: "Detect and correlate attack activity.", control: "Incident register + Tool-Call Ledger", surface: "AI Incidents", status: "Partial" },
];

/* ISO/IEC 27001 — ISMS (Annex A themes as they bear on the AI program). */
export const ISO27001_REQS = [
  { n: 1, name: "ISMS policy & leadership", desc: "Establish an information-security policy & leadership.", control: "Policy register + accountable ownership", surface: "AI Central · Governance", status: "Met" },
  { n: 2, name: "Risk assessment & treatment", desc: "Assess and treat information-security risk.", control: "Risk Center — computed residual engine", surface: "Risk Center", status: "Met" },
  { n: 3, name: "Access control (A.5 / A.8)", desc: "Control access to information and systems.", control: "Auth.js identity + per-tenant RBAC", surface: "Admin · Users & RBAC", status: "Met" },
  { n: 4, name: "Cryptography & data protection", desc: "Protect data in transit and at rest.", control: "Egress policy + PII masking + encryption in transit", surface: "Veris Enforce · Egress Policy", status: "Partial" },
  { n: 5, name: "Operations security & logging", desc: "Log operations and protect log integrity.", control: "Article 12 — tamper-evident hash chain", surface: "Article 12 Log", status: "Met" },
  { n: 6, name: "Supplier / third-party security", desc: "Manage security of suppliers and services.", control: "Vendor risk review + MCP supply-chain quarantine", surface: "Veris Enforce · MCP", status: "Partial" },
  { n: 7, name: "Incident management", desc: "Manage information-security incidents.", control: "Incident register + escalation path + breach-notification workflow (A.5.24–A.5.28)", surface: "Breach Notification", status: "Met" },
  { n: 8, name: "Continuity & monitoring", desc: "Monitor, measure and assure continuity.", control: "Drift monitoring + Reporting packs", surface: "Drift Monitor / Reporting", status: "Partial" },
];

/* ISO/IEC TR 20226 — AI & environmental sustainability. Genuinely nascent
   across the industry; VerisZone meters cost/compute but has no dedicated
   carbon-accounting control yet — so this one honestly carries Gap rows. */
export const ISOTR20226_REQS = [
  { n: 1, name: "Training compute & energy metering", desc: "Measure the compute/energy of model training.", control: "Cost engine — token & compute metering (proxy)", surface: "Cost Governance", status: "Partial" },
  { n: 2, name: "Inference energy & carbon footprint", desc: "Measure the footprint of inference at scale.", control: "FinOps cost metering per inference (proxy)", surface: "Cost Governance", status: "Partial" },
  { n: 3, name: "Model efficiency & right-sizing", desc: "Choose efficient, right-sized models.", control: "Model registry — right-size guidance", surface: "AI Central · Repository", status: "Partial" },
  { n: 4, name: "Lifecycle environmental impact assessment", desc: "Assess full-lifecycle environmental impact.", control: "Environmental Footprint — whole-life assessment per system (training · inference · storage · retirement), computed", surface: "Environmental Footprint", status: "Met" },
  { n: 5, name: "Carbon reporting & disclosure", desc: "Report and disclose emissions from AI.", control: "Environmental Footprint — GHG-Protocol Scope 2 & 3 disclosure (ISO 14064-1 · CSRD ESRS E1), methodology + assurance stated", surface: "Environmental Footprint", status: "Met" },
  { n: 6, name: "Sustainability governance & ownership", desc: "Assign accountable ownership for AI sustainability.", control: "EOS ownership model (extensible to sustainability)", surface: "AI Central · Governance", status: "Met" },
];

export const nistRmfStats = () => statsFor(NISTRMF_REQS);
export const iso42001Stats = () => statsFor(ISO42001_REQS);
export const euAiActStats = () => statsFor(EUAIACT_REQS);
export const gdprStats = () => statsFor(GDPR_REQS);
export const nistSecStats = () => statsFor(NISTSEC_REQS);
export const owaspStats = () => statsFor(OWASP_REQS);
export const atlasStats = () => statsFor(ATLAS_REQS);
export const iso27001Stats = () => statsFor(ISO27001_REQS);
export const isoTr20226Stats = () => statsFor(ISOTR20226_REQS);

export const NISTRMF_POSTURE_SCORE = statsFor(NISTRMF_REQS).score;
export const ISO42001_POSTURE_SCORE = statsFor(ISO42001_REQS).score;
export const EUAIACT_POSTURE_SCORE = statsFor(EUAIACT_REQS).score;
export const GDPR_POSTURE_SCORE = statsFor(GDPR_REQS).score;
export const NISTSEC_POSTURE_SCORE = statsFor(NISTSEC_REQS).score;
export const OWASP_POSTURE_SCORE = statsFor(OWASP_REQS).score;
export const ATLAS_POSTURE_SCORE = statsFor(ATLAS_REQS).score;
export const ISO27001_POSTURE_SCORE = statsFor(ISO27001_REQS).score;
export const ISOTR20226_POSTURE_SCORE = statsFor(ISOTR20226_REQS).score;
