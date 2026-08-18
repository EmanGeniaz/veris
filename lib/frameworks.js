/* ── Global AI Framework Library ──────────────────────────────────────────
   VerisZone ships the whole landscape hardcoded, not a subset. No single
   framework covers everything — the real work is applying the right
   combination for the customer's jurisdiction. So every framework carries the
   region(s) it applies in, and selecting a customer's country auto-surfaces
   exactly the stack that governs them: the global foundational + security +
   lifecycle standards that apply everywhere, plus that country's own
   national law or standard.

   `status` is how far VerisZone operationalises each one today:
     · Operational — mapped to live controls, posture and evidence in-product
     · Mapped      — control-mapped and demo-ready, posture to be populated
     · Library     — in the hardcoded library, ready to activate for a tenant

   Pure data + selectors. Deterministic, client-safe. */

import { AU_POSTURE_SCORE } from "./au-guardrails";
import { SG_POSTURE_SCORE } from "./sg-dimensions";
import { CN_POSTURE_SCORE, BR_POSTURE_SCORE, KR_POSTURE_SCORE } from "./regional-mappings";
import { ISO38507_POSTURE_SCORE, ISO42005_POSTURE_SCORE } from "./iso-standards";
import { ISO23894_POSTURE_SCORE, NISTGENAI_POSTURE_SCORE } from "./foundational-mappings";
import { OECD_POSTURE_SCORE, UNESCO_POSTURE_SCORE } from "./principle-mappings";
import { ISO37000_POSTURE_SCORE, ISO38500_POSTURE_SCORE, ISO38505_POSTURE_SCORE } from "./governance-standards";

/* Jurisdictions we can scope a customer to. `global` = show the full library. */
export const REGIONS = [
  { code: "global", label: "Global · all frameworks", flag: "🌐" },
  { code: "eu", label: "European Union",  flag: "🇪🇺" },
  { code: "us", label: "United States",   flag: "🇺🇸" },
  { code: "uk", label: "United Kingdom",  flag: "🇬🇧" },
  { code: "ca", label: "Canada",          flag: "🇨🇦" },
  { code: "sg", label: "Singapore",       flag: "🇸🇬" },
  { code: "jp", label: "Japan",           flag: "🇯🇵" },
  { code: "au", label: "Australia",       flag: "🇦🇺" },
  { code: "cn", label: "China",           flag: "🇨🇳" },
  { code: "in", label: "India",           flag: "🇮🇳" },
  { code: "kr", label: "South Korea",     flag: "🇰🇷" },
  { code: "br", label: "Brazil",          flag: "🇧🇷" },
];
export const regionLabel = c => (REGIONS.find(r => r.code === c) || {}).label || c;

export const FW_CATEGORIES = [
  { id: "foundational", label: "Global foundational", note: "Principles & enterprise AI risk management — apply everywhere" },
  { id: "governance",   label: "Governance stack", note: "Corporate → IT → data → AI governance, layered — AI is the top tier" },
  { id: "regional",     label: "National / regional", note: "The legal or regulatory overlay for the customer's jurisdiction" },
  { id: "security",     label: "AI security & technical", note: "Adversarial ML, LLM & agent security — apply everywhere" },
  { id: "lifecycle",    label: "Lifecycle & domain standards", note: "Concepts, quality, bias & governance across the AI lifecycle" },
];

/* GLOBAL = applies in every jurisdiction. `applies:["global"]` frameworks show
   for every region; national ones list their own region code. */
export const FRAMEWORKS = [
  /* ── Global foundational ── */
  { id: "nist-rmf", name: "NIST AI RMF 1.0", body: "NIST (US)", cat: "foundational", type: "Voluntary framework", obligation: "Voluntary", applies: ["global"], focus: "Govern, Map, Measure, Manage across the AI lifecycle", bestFor: "Enterprise AI risk management & program design", status: "Operational", score: 71 },
  { id: "nist-genai", name: "NIST GenAI Profile (600-1)", body: "NIST (US)", cat: "foundational", type: "Profile / guidance", obligation: "Voluntary", applies: ["global"], focus: "Risks unique to generative AI / LLMs", bestFor: "GenAI & LLM-specific risk considerations", status: "Operational", score: NISTGENAI_POSTURE_SCORE },
  { id: "iso-42001", name: "ISO/IEC 42001", body: "ISO (Intl.)", cat: "foundational", type: "Management system", obligation: "Certifiable standard", applies: ["global"], focus: "Establish, run and improve an AI management system (AIMS)", bestFor: "Building an auditable AI governance system", status: "Operational", score: 74 },
  { id: "iso-23894", name: "ISO/IEC 23894", body: "ISO (Intl.)", cat: "foundational", type: "Guidance", obligation: "Guidance", applies: ["global"], focus: "AI-specific risk management (identify, assess, treat, monitor)", bestFor: "AI risk assessment & treatment guidance", status: "Operational", score: ISO23894_POSTURE_SCORE },
  { id: "oecd", name: "OECD AI Principles", body: "OECD (Intl.)", cat: "foundational", type: "Policy principles", obligation: "Principles", applies: ["global"], focus: "Values-based principles for trustworthy AI (updated 2024)", bestFor: "High-level policy alignment & stakeholder trust", status: "Operational", score: OECD_POSTURE_SCORE },
  { id: "unesco", name: "UNESCO AI Ethics Recommendation", body: "UNESCO (UN)", cat: "foundational", type: "International recommendation", obligation: "Recommendation", applies: ["global"], focus: "Human rights, ethics & social impact (adopted by 194 countries)", bestFor: "Ethical baseline & global responsible-AI alignment", status: "Operational", score: UNESCO_POSTURE_SCORE },

  /* ── National / regional ── */
  { id: "eu-ai-act", name: "EU AI Act", body: "European Union", cat: "regional", type: "Law (binding)", obligation: "Binding law", applies: ["eu"], focus: "Risk-based classification: prohibited, high-risk, GPAI, systemic risk", bestFor: "Compliance with EU legal obligations", status: "Operational", score: 68 },
  { id: "gdpr", name: "GDPR", body: "European Union", cat: "regional", type: "Law (binding)", obligation: "Binding law", applies: ["eu"], focus: "Lawful basis, DPIA, data-subject rights for AI processing personal data", bestFor: "Data protection for AI touching personal data", status: "Operational", score: 83 },
  { id: "uk-assurance", name: "UK AI Principles & Assurance", body: "United Kingdom", cat: "regional", type: "Principles + assurance", obligation: "Principles + assurance", applies: ["uk"], focus: "5 principles + AI assurance for trustworthy, accountable AI", bestFor: "UK market use & independent assurance", status: "Library" },
  { id: "canada-aia", name: "Canada AIA (Directive)", body: "Canada", cat: "regional", type: "Directive + assessment", obligation: "Binding (public sector)", applies: ["ca"], focus: "Algorithmic Impact Assessment (65+ risk & 41 mitigation questions)", bestFor: "Public-sector ADS use & impact screening", status: "Library" },
  { id: "sg-model", name: "Singapore Model AI Governance (GenAI & Agentic)", body: "Singapore", cat: "regional", type: "Framework + guidance", obligation: "Voluntary", applies: ["sg"], focus: "Practical governance for AI, GenAI and agentic AI (updated 2026)", bestFor: "Implementing AI/agent governance with practical controls", status: "Operational", score: SG_POSTURE_SCORE },
  { id: "japan-guidelines", name: "Japan AI Guidelines for Business", body: "Japan", cat: "regional", type: "Guidelines", obligation: "Guidance", applies: ["jp"], focus: "Principles-based guidance for responsible AI use in business", bestFor: "AI development & use in Japan", status: "Library" },
  { id: "au-safety", name: "Australia Voluntary AI Safety Standard", body: "Australia", cat: "regional", type: "Voluntary standard", obligation: "Voluntary", applies: ["au"], focus: "10 AI guardrails (accountability, transparency, security, human oversight, …)", bestFor: "Building safe & reliable AI aligned to best practice", status: "Operational", score: AU_POSTURE_SCORE },
  { id: "china-regs", name: "China AI Regulations (Algorithm, GenAI, Labelling)", body: "China (CAC / MOST / TC260)", cat: "regional", type: "Regulations", obligation: "Binding law", applies: ["cn"], focus: "7 instruments — algorithm filing, deep synthesis, GenAI interim measures, 2025 content-labelling (GB 45438), ethics review, PIPL/DSL/CSL data trio, TC260 security baseline", bestFor: "Operating AI products & services in China", status: "Operational", score: CN_POSTURE_SCORE },
  { id: "india-rai", name: "India Responsible AI Framework", body: "India", cat: "regional", type: "Principles + guidance", obligation: "Principles + guidance", applies: ["in"], focus: "Responsible-AI principles, DPDP Act, sectoral expectations, innovation focus", bestFor: "AI governance aligned to Indian laws & expectations", status: "Library" },
  { id: "korea-act", name: "South Korea AI Act & National Strategy", body: "South Korea", cat: "regional", type: "Law + strategy", obligation: "Binding law", applies: ["kr"], focus: "High-impact AI transparency, safety, accountability, national capability", bestFor: "AI governance & compliance in South Korea", status: "Operational", score: KR_POSTURE_SCORE },
  { id: "brazil-framework", name: "Brazil AI Regulatory Framework (in progress)", body: "Brazil", cat: "regional", type: "Proposed law", obligation: "Proposed law", applies: ["br"], focus: "Risk classification, rights, transparency, high-risk AI obligations", bestFor: "Preparing for Brazil's upcoming AI regulation", status: "Operational", score: BR_POSTURE_SCORE },

  /* ── AI security & technical ── */
  { id: "nist-sec", name: "NIST AI Security Guidance", body: "NIST (US)", cat: "security", type: "Guidance", obligation: "Voluntary", applies: ["global"], focus: "Adversarial ML, data poisoning, model security, evaluation & testing", bestFor: "Security & technical controls for AI systems", status: "Mapped", score: 62 },
  { id: "owasp-llm", name: "OWASP Top 10 for LLM Applications", body: "OWASP", cat: "security", type: "Guidance", obligation: "Voluntary", applies: ["global"], focus: "LLM/GenAI security risks: prompt injection, excessive agency, data leakage", bestFor: "Securing LLM applications & agents", status: "Operational", score: 70 },
  { id: "mitre-atlas", name: "MITRE ATLAS", body: "MITRE", cat: "security", type: "Knowledge base", obligation: "Reference", applies: ["global"], focus: "Adversarial threat knowledge base for ML/AI systems", bestFor: "Threat modelling & red-teaming AI (upstream in testing)", status: "Operational", score: 69 },

  /* ── Lifecycle & domain standards ── */
  { id: "iso-22989", name: "ISO/IEC 22989", body: "ISO (Intl.)", cat: "lifecycle", type: "Standard", obligation: "Standard", applies: ["global"], focus: "AI concepts & terminology", bestFor: "Shared terminology across the AI program", status: "Library" },
  { id: "iso-23053", name: "ISO/IEC 23053", body: "ISO (Intl.)", cat: "lifecycle", type: "Standard", obligation: "Standard", applies: ["global"], focus: "Framework for ML-based AI systems", bestFor: "ML system architecture & lifecycle", status: "Library" },
  { id: "iso-24027", name: "ISO/IEC 24027", body: "ISO (Intl.)", cat: "lifecycle", type: "Standard", obligation: "Standard", applies: ["global"], focus: "Bias in AI systems & AI-aided decision making", bestFor: "Bias assessment & fairness", status: "Library" },
  { id: "iso-25059", name: "ISO/IEC 25059", body: "ISO (Intl.)", cat: "lifecycle", type: "Standard", obligation: "Standard", applies: ["global"], focus: "Quality model for AI systems", bestFor: "AI system quality evaluation", status: "Library" },
  { id: "iso-5338", name: "ISO/IEC 5338", body: "ISO (Intl.)", cat: "lifecycle", type: "Standard", obligation: "Standard", applies: ["global"], focus: "AI system lifecycle processes", bestFor: "Lifecycle process definition", status: "Library" },
  { id: "iso-37000", name: "ISO 37000", body: "ISO (Intl.)", cat: "governance", type: "Standard", obligation: "Standard", applies: ["global"], scope: "AI-scoped", focus: "Governance of the organization — AI serves organizational purpose", bestFor: "Corporate governance, applied to AI", status: "Operational", score: ISO37000_POSTURE_SCORE },
  { id: "iso-38500", name: "ISO/IEC 38500", body: "ISO (Intl.)", cat: "governance", type: "Standard", obligation: "Standard", applies: ["global"], scope: "AI-scoped", focus: "Governance of IT — responsibility, strategy, acquisition, performance", bestFor: "IT governance, applied to AI", status: "Operational", score: ISO38500_POSTURE_SCORE },
  { id: "iso-38505", name: "ISO/IEC 38505", body: "ISO (Intl.)", cat: "governance", type: "Standard", obligation: "Standard", applies: ["global"], scope: "Full", focus: "Governance of data — accountability, quality, protection, value", bestFor: "Data governance — data-first", status: "Operational", score: ISO38505_POSTURE_SCORE },
  { id: "iso-38507", name: "ISO/IEC 38507", body: "ISO (Intl.)", cat: "governance", type: "Standard", obligation: "Standard", applies: ["global"], scope: "Full", focus: "Governance of AI — the governing body's oversight of AI use", bestFor: "Board-level AI governance", status: "Operational", score: ISO38507_POSTURE_SCORE },
  { id: "iso-42005", name: "ISO/IEC 42005", body: "ISO (Intl.)", cat: "lifecycle", type: "Standard", obligation: "Standard", applies: ["global"], focus: "AI system impact assessment", bestFor: "Structured AI impact assessment", status: "Operational", score: ISO42005_POSTURE_SCORE },
  { id: "iso-27001", name: "ISO/IEC 27001", body: "ISO (Intl.)", cat: "lifecycle", type: "Management system", obligation: "Certifiable standard", applies: ["global"], focus: "Information security management system (ISMS)", bestFor: "Security backbone under the AI program", status: "Operational", score: 79 },
  { id: "iso-tr20226", name: "ISO/IEC TR 20226", body: "ISO (Intl.)", cat: "lifecycle", type: "Technical report", obligation: "Guidance", applies: ["global"], focus: "AI & environmental sustainability", bestFor: "Measuring the environmental footprint of AI", status: "Operational", score: 47 },
];

/* Frameworks that govern a customer in `code`: everything global, plus that
   jurisdiction's own. `global` returns the entire hardcoded library. */
export function frameworksForRegion(code) {
  if (!code || code === "global") return FRAMEWORKS;
  return FRAMEWORKS.filter(f => f.applies.includes("global") || f.applies.includes(code));
}

export const STATUS_META = {
  Operational: { tone: "good", note: "Mapped to live controls & posture" },
  Mapped:      { tone: "info", note: "Control-mapped, demo-ready" },
  Library:     { tone: "ink3", note: "In the library, ready to activate" },
};

export function frameworkStats(code) {
  const list = frameworksForRegion(code);
  const by = s => list.filter(f => f.status === s).length;
  const regional = list.filter(f => f.cat === "regional").length;
  return {
    total: list.length,
    operational: by("Operational"),
    mapped: by("Mapped"),
    library: by("Library"),
    regional,
    binding: list.filter(f => /Binding|Certifiable|law/i.test(f.obligation)).length,
  };
}
