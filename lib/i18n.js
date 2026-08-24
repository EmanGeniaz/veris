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
