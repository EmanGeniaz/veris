/* ── i18n scaffolding (milestone M-AR · charter D8) ───────────────────────
   Pilot-first Arabic + RTL support. This is the infrastructure — a tiny
   dictionary keyed by string id, a `t()` lookup with an English fallback, and
   the language list — applied to ONE pilot surface first (the Arabic
   Governance Briefing) to prove the pattern before any estate-wide rollout.

   Deliberately not a heavy i18n framework: no network, no context gymnastics,
   deterministic and client-safe. A missing translation falls back to the
   English string passed in, so nothing ever renders blank.

   Rollout (later milestone) extends AR with the full string set and moves the
   language toggle into the global header. */

export const LANGS = [
  { code: "en", label: "English", dir: "ltr", native: "English" },
  { code: "ar", label: "Arabic",  dir: "rtl", native: "العربية" },
];

export const dirFor = lang => (LANGS.find(l => l.code === lang) || LANGS[0]).dir;

/* Arabic dictionary for the pilot surface + shared chrome. Keys are stable ids;
   English is always passed as the fallback at the call site. */
export const AR = {
  "gb.title": "موجز حوكمة الذكاء الاصطناعي",
  "gb.sub": "لمحة عن الامتثال والضوابط عبر منصة فيرِس زون — محسوبة من الضوابط الفعلية، وليست مُدّعاة.",
  "gb.pilotNote": "هذه واجهة تجريبية توضّح دعم اللغة العربية والكتابة من اليمين إلى اليسار. تُترجم بقية المنصة على مراحل.",
  "gb.frameworks": "الأطر المُغطّاة",
  "gb.operational": "قيد التشغيل",
  "gb.ofTotal": "من إجمالي الأطر",
  "gb.liveControls": "مقابل ضوابط فعلية",
  "gb.uaePosture": "جاهزية الإمارات / دبي",
  "gb.computed": "محسوبة من الضوابط",
  "gb.topFw": "أبرز الأطر التنظيمية",
  "gb.keyControls": "الضوابط الرئيسية",
  "gb.posture": "الجاهزية",
  "gb.framework": "الإطار",
  "gb.control": "الضابط",
  "gb.surface": "الواجهة",
  "gb.honesty": "تعرض فيرِس زون مدى تغطية الضوابط وجاهزية التدقيق — وليست امتثالاً قانونياً؛ فذلك يقرّه مدقّق خارجي.",
  "gb.langLabel": "اللغة",
  // control names (pilot subset)
  "ctrl.breach": "سير عمل الإبلاغ عن خرق البيانات",
  "ctrl.dpia": "تقييم الأثر (DPIA / تقييم أثر الذكاء الاصطناعي)",
  "ctrl.provenance": "مصدر البيانات وحوكمتها",
  "ctrl.gateway": "الإنفاذ عبر بوابة الذكاء الاصطناعي",
  "ctrl.residency": "ضوابط إقامة البيانات ومنع التسريب",
  // framework names (pilot subset)
  "fw.uae": "تنظيم الإمارات / دبي للبيانات والذكاء الاصطناعي",
  "fw.euai": "قانون الذكاء الاصطناعي الأوروبي",
  "fw.iso42001": "الأيزو 42001 — نظام إدارة الذكاء الاصطناعي",
  "fw.gdpr": "اللائحة العامة لحماية البيانات (GDPR)",
  "fw.nist": "إطار إدارة مخاطر الذكاء الاصطناعي (NIST)",
};

/* t(lang, key, en): return the Arabic string for `key` when lang==="ar" and it
   exists; otherwise the English fallback `en`. */
export function t(lang, key, en) {
  if (lang === "ar" && Object.prototype.hasOwnProperty.call(AR, key)) return AR[key];
  return en;
}

/* ── Navigation / shell chrome dictionary (keyed by the English label) ─────
   Translates the sidebar nav labels, section headers and header chrome for the
   shell-level Arabic rollout. Missing labels fall back to English, so partial
   coverage never renders blank. aria-labels stay English (so tests and the
   click-integrity harness keep working) — only the visible text is swapped. */
export const NAV_AR = {
  // section headers
  "Enterprise Governance": "حوكمة المؤسسة", "Enterprise": "المؤسسة", "Administration": "الإدارة",
  "CEO Cockpit": "لوحة الرئيس التنفيذي", "Executive": "القيادة التنفيذية", "Platform": "المنصة",
  "Workspace": "مساحة العمل", "Leadership": "القيادة", "AI Governance Office": "مكتب حوكمة الذكاء الاصطناعي",
  // shared / home
  "Overview": "نظرة عامة", "Home": "الرئيسية", "My AI Workspace": "مساحة عملي للذكاء الاصطناعي",
  "My AI Assistant": "مساعدي للذكاء الاصطناعي", "Governance Academy": "أكاديمية الحوكمة", "Team View": "عرض الفريق",
  "AI Central": "مركز الذكاء الاصطناعي", "Admin Portal": "بوابة الإدارة", "Reports": "التقارير", "Reporting": "إعداد التقارير",
  // governance surfaces (CGO + shared)
  "Governance Forum": "منتدى الحوكمة", "Incident Playbook": "دليل الاستجابة للحوادث",
  "Breach Notification": "الإبلاغ عن خرق البيانات", "Data Provenance": "مصدر البيانات وحوكمتها",
  "Impact Assessments": "تقييمات الأثر", "Impact Assessment (AIA)": "تقييم الأثر (AIA)",
  "Environmental Footprint": "البصمة البيئية", "Convergence Crosswalk": "مصفوفة التقارب",
  "Prohibited Practices": "الممارسات المحظورة", "GPAI Exposure": "التعرّض للنماذج العامة (GPAI)",
  "Gap Closure": "سد الفجوات", "Jurisdiction Atlas": "أطلس الولايات القضائية",
  "Template Library": "مكتبة القوالب", "ISO 42001 Readiness": "جاهزية الأيزو 42001",
  "Evidence Freshness": "حداثة الأدلة", "Governance Glossary": "مسرد الحوكمة",
  "Drift Monitor": "مراقبة الانحراف", "Agent Chain Permissions": "أذونات سلاسل الوكلاء",
  "Article 12 Log": "سجل المادة 12", "Policy-as-a-Service": "السياسة كخدمة",
  "Veris Enforce": "فيرِس إنفورس", "Enforcement Coverage": "تغطية الإنفاذ",
  "Tool-Call Ledger": "سجل استدعاء الأدوات", "MCP Registry": "سجل MCP", "HITL Gates": "بوابات الإشراف البشري",
  "Circuit Breaker": "قاطع الدائرة", "Governance Playbook": "دليل الحوكمة",
  "Policies & Controls": "السياسات والضوابط", "Regulatory Posture": "الجاهزية التنظيمية",
  "Board & Audit": "المجلس والتدقيق", "Enterprise Risk": "مخاطر المؤسسة",
  "Regulatory Map": "الخريطة التنظيمية", "Contracts & IP": "العقود والملكية الفكرية",
  "Conformity": "المطابقة", "Legal Evidence": "الأدلة القانونية",
  // risk / security / privacy
  "Risk Center": "مركز المخاطر", "Risk Appetite": "الرغبة في المخاطرة", "Risk Register": "سجل المخاطر",
  "Controls & KRIs": "الضوابط ومؤشرات المخاطر", "Audit Readiness": "جاهزية التدقيق", "Operational Risk": "المخاطر التشغيلية",
  "Financial Risk": "المخاطر المالية", "AI Incidents": "حوادث الذكاء الاصطناعي", "Vulnerabilities": "الثغرات",
  "Guardrails & Controls": "الحواجز والضوابط", "Red-Team": "الفريق الأحمر", "Threat Center": "مركز التهديدات",
  "Agent Authority": "صلاحيات الوكلاء", "Egress Policy": "سياسة الإخراج",
  "DPIA & Assessments": "تقييمات أثر الخصوصية", "Data Map & Residency": "خريطة البيانات وإقامتها",
  "Consent & Rights": "الموافقة والحقوق", "Privacy Incidents": "حوادث الخصوصية", "Privacy Playbook": "دليل الخصوصية",
  // exec / ops / finance / people / platform
  "AI Playbook": "دليل الذكاء الاصطناعي", "My Playbook": "دليلي", "Portfolio": "المحفظة",
  "Investment Portfolio": "محفظة الاستثمار", "Budget": "الميزانية", "Budget & Forecast": "الميزانية والتوقعات",
  "My Action Items": "مهامي", "Value & ROI": "القيمة والعائد", "Value Realization": "تحقيق القيمة",
  "Cost & Run-rate": "التكلفة ومعدل التشغيل", "Cost & Performance": "التكلفة والأداء",
  "Operations Playbook": "دليل العمليات", "Process Automation": "أتمتة العمليات",
  "Performance & SLAs": "الأداء واتفاقيات الخدمة", "Workforce Capacity": "طاقة القوى العاملة",
  "Workforce Playbook": "دليل القوى العاملة", "Adoption & Enablement": "التبنّي والتمكين",
  "Skills & Reskilling": "المهارات وإعادة التأهيل", "Role Impact": "أثر الأدوار", "Sentiment & Feedback": "المشاعر والتغذية الراجعة",
  "Platform Health": "صحة المنصة", "Model Registry": "سجل النماذج", "Gateway & Routing": "البوابة والتوجيه",
  "Integrations": "التكاملات", "Compliance & Standards": "الامتثال والمعايير",
  "Governance & Compliance": "الحوكمة والامتثال", "Governance Library": "مكتبة الحوكمة",
  "Controls & Compliance": "الضوابط والامتثال", "Policies & Standards": "السياسات والمعايير",
  "Trust Center": "مركز الثقة", "Evidence Fabric": "نسيج الأدلة", "Templates & Register": "القوالب والسجل",
  "Executive Dashboard": "لوحة القيادة التنفيذية", "AI Strategy": "استراتيجية الذكاء الاصطناعي",
  "AI Portfolio": "محفظة الذكاء الاصطناعي", "AI Repository": "مستودع الذكاء الاصطناعي",
  "AI Inventory": "جرد الذكاء الاصطناعي", "AI Lifecycle": "دورة حياة الذكاء الاصطناعي",
  "AI Gateway": "بوابة الذكاء الاصطناعي", "AI Agents": "وكلاء الذكاء الاصطناعي", "Audit Center": "مركز التدقيق",
  // AI Central module subtitles + intro
  "Enterprise command center": "مركز القيادة المؤسسي",
  "Ambition, investment and roadmap": "الطموح والاستثمار وخارطة الطريق",
  "Initiatives by business unit": "المبادرات حسب وحدة الأعمال",
  "Models, agents, prompts, tools": "النماذج والوكلاء والمطالبات والأدوات",
  "Systems, datasets, vendors": "الأنظمة ومجموعات البيانات والموردون",
  "Governed pilot-to-scale journey": "رحلة مُحوكَمة من التجربة إلى التوسّع",
  "Runtime control plane": "مستوى تحكّم وقت التشغيل",
  "Least-privilege capability control": "ضبط القدرات بأقل صلاحية",
  "AI risk framework and treatment": "إطار مخاطر الذكاء الاصطناعي ومعالجتها",
  "Live posture and attestations": "الوضع الحيّ والإقرارات",
  "Searchable, versioned proof": "دليل قابل للبحث ومُصدَّر",
  "Pre-filled governance templates": "قوالب حوكمة مملوءة مسبقاً",
  "Control matrix and frameworks": "مصفوفة الضوابط والأطر",
  "Policy library and standards": "مكتبة السياسات والمعايير",
  "Expected vs realized ROI": "العائد المتوقّع مقابل المُحقَّق",
  "Readiness and learning": "الجاهزية والتعلّم",
  "Immutable audit trail": "أثر تدقيق غير قابل للتغيير",
  "Enterprise control plane where AI initiatives are planned, governed, monitored and decided to scale or retire.": "مستوى تحكّم مؤسسي تُخطَّط فيه مبادرات الذكاء الاصطناعي وتُحوكَم وتُراقَب ويُقرَّر توسيعها أو إحالتها.",
  // header chrome
  "Search everything...": "ابحث في كل شيء...", "Language": "اللغة",
};

/* tn(lang, label): translate a nav / chrome label, English fallback. */
export function tn(lang, label) {
  if (lang === "ar" && label && Object.prototype.hasOwnProperty.call(NAV_AR, label)) return NAV_AR[label];
  return label;
}

/* ── Surface-content translation (rollout, surface by surface) ─────────────
   Keyed by the ENGLISH string so a component can wrap its literals directly —
   ts(lang, "Breach Notification") — with no key bookkeeping. A missing string
   falls back to English, so a partially-translated surface still renders. Each
   content cycle adds its surface's strings here. */
export const CONTENT_AR = {};

/* register a batch of {english: arabic} pairs (one call per surface) */
export function registerContent(pairs) { Object.assign(CONTENT_AR, pairs); }

/* ts(lang, en): translate a content string, English fallback. */
export function ts(lang, en) {
  if (lang === "ar" && en != null && Object.prototype.hasOwnProperty.call(CONTENT_AR, en)) return CONTENT_AR[en];
  return en;
}

/* ── Language context — lets any surface read the active language without
   prop-drilling. Provided once at the app root; consumed via useLang(). ── */
import { createContext, useContext } from "react";
export const LangContext = createContext("en");
export const useLang = () => useContext(LangContext);
