/* Jurisdiction Atlas — the multi-regime obligation map. The enterprise runs AI
   across Americas, EMEA and APAC; each regime self-flags Applies / Monitor / Out
   of scope from where the estate actually operates, with effective dates and
   penalty exposure. Many sets of obligations collapse into one control set via
   the convergence crosswalk — this Atlas is the "which regimes bind us" input. */

import { PORTFOLIO } from "./portfolio";

/* Regions the estate actually operates in (drives Applies vs Out of scope). */
export const OPERATING_REGIONS = [...new Set(PORTFOLIO.map(p => p.region).filter(r => r && r !== "—"))];

/* Bilingual (Arabic alongside English). Each regime carries Arabic variants of
   the display fields (`*Ar`); the Jurisdiction Atlas renders them when the app
   language is Arabic, falling back to English where an Arabic variant is absent.
   Proper nouns / acronyms (EU AI Act, GDPR, DIFC, ADGM, DESC, ISO, FEAT, GPAI)
   are kept in original form inside the Arabic text so citations stay verifiable. */
export const REGIMES = [
  { id: "euai",   regime: "EU AI Act",                    regimeAr: "قانون الذكاء الاصطناعي الأوروبي",           geo: "European Union", geoAr: "الاتحاد الأوروبي",          region: "EMEA",     instrument: "Regulation", instrumentAr: "لائحة",            status: "applies", effective: "Aug 2026 · high-risk Aug 2027", effectiveAr: "أغسطس 2026 · عالي الخطورة أغسطس 2027", penalty: "Up to €35M or 7% global turnover", penaltyAr: "حتى 35 مليون يورو أو 7% من الإيرادات العالمية", note: "High-risk deployer duties plus potential GPAI provider obligations.", noteAr: "واجبات مُشغّل عالي الخطورة إضافةً إلى التزامات محتملة كمزوّد GPAI." },
  { id: "gdpr",   regime: "GDPR",                          regimeAr: "اللائحة العامة لحماية البيانات (GDPR)",       geo: "European Union", geoAr: "الاتحاد الأوروبي",          region: "EMEA",     instrument: "Regulation", instrumentAr: "لائحة",            status: "applies", effective: "In force",                    effectiveAr: "سارية",                              penalty: "Up to €20M or 4% turnover",        penaltyAr: "حتى 20 مليون يورو أو 4% من الإيرادات",         note: "Lawful basis, Art. 22 automated-decision safeguards, Art. 44 transfers.", noteAr: "الأساس القانوني، وضمانات القرار الآلي (المادة 22)، والنقل (المادة 44)." },
  { id: "ukgdpr", regime: "UK GDPR + DPDI",                regimeAr: "اللائحة البريطانية لحماية البيانات + DPDI",   geo: "United Kingdom", geoAr: "المملكة المتحدة",           region: "EMEA",     instrument: "Regulation", instrumentAr: "لائحة",            status: "applies", effective: "In force",                    effectiveAr: "ساري",                               penalty: "Up to £17.5M or 4%",               penaltyAr: "حتى 17.5 مليون جنيه أو 4%",                    note: "UK data protection; pro-innovation AI principles overlay.", noteAr: "حماية البيانات البريطانية؛ مع طبقة مبادئ ذكاء اصطناعي داعمة للابتكار." },
  { id: "co",     regime: "Colorado AI Act (SB 205)",      regimeAr: "قانون كولورادو للذكاء الاصطناعي (SB 205)",    geo: "Colorado, US",   geoAr: "كولورادو، الولايات المتحدة", region: "Americas", instrument: "Law",        instrumentAr: "قانون",            status: "applies", effective: "Feb 2026",                    effectiveAr: "فبراير 2026",                        penalty: "AG enforcement · deceptive-trade",  penaltyAr: "إنفاذ النائب العام · تجارة خادعة",             note: "High-risk AI consumer-protection duty of care.", noteAr: "واجب عناية لحماية المستهلك من الذكاء الاصطناعي عالي الخطورة." },
  { id: "eeoc",   regime: "US EEOC / ADA guidance",        regimeAr: "إرشادات EEOC / ADA الأمريكية",                geo: "United States",  geoAr: "الولايات المتحدة",          region: "Americas", instrument: "Guidance",   instrumentAr: "إرشادات",          status: "applies", effective: "In force",                    effectiveAr: "سارية",                              penalty: "Discrimination liability",          penaltyAr: "مسؤولية التمييز",                              note: "Employment-AI non-discrimination.", noteAr: "عدم التمييز في ذكاء التوظيف." },
  { id: "nist",   regime: "NIST AI RMF",                   regimeAr: "إطار NIST لإدارة مخاطر الذكاء الاصطناعي",      geo: "United States",  geoAr: "الولايات المتحدة",          region: "Americas", instrument: "Framework",  instrumentAr: "إطار",             status: "applies", effective: "Voluntary",                   effectiveAr: "طوعي",                               penalty: "None · procurement expectation",    penaltyAr: "لا شيء · توقّع في المشتريات",                  note: "Govern / Map / Measure / Manage baseline.", noteAr: "خط أساس: الحوكمة / الرسم / القياس / الإدارة." },
  { id: "sg",     regime: "Singapore Model AI Gov + FEAT", regimeAr: "إطار سنغافورة النموذجي لحوكمة الذكاء الاصطناعي + FEAT", geo: "Singapore", geoAr: "سنغافورة",             region: "APAC",     instrument: "Guidance",   instrumentAr: "إرشادات",          status: "applies", effective: "In force",                    effectiveAr: "ساري",                               penalty: "Voluntary · MAS FEAT for finance",  penaltyAr: "طوعي · FEAT من MAS للتمويل",                   note: "Model AI Governance Framework; FEAT principles.", noteAr: "إطار حوكمة الذكاء الاصطناعي النموذجي؛ ومبادئ FEAT." },
  { id: "uae",    regime: "UAE / Dubai Data & AI",         regimeAr: "بيانات وذكاء الإمارات / دبي",                 geo: "United Arab Emirates", geoAr: "الإمارات العربية المتحدة", region: "EMEA", instrument: "Law + free-zone", instrumentAr: "قانون + منطقة حرة", status: "applies", effective: "In force",                effectiveAr: "ساري",                               penalty: "UAE Data Office · DIFC / ADGM fines", penaltyAr: "مكتب بيانات الإمارات · غرامات DIFC / ADGM",  note: "Federal PDPL (45/2021), DIFC & ADGM data laws, DESC security & cloud, UAE AI ethics.", noteAr: "قانون حماية البيانات الاتحادي (45/2021)، وقوانين بيانات DIFC وADGM، وأمن وسحابة DESC، وأخلاقيات الذكاء الاصطناعي الإماراتية." },
  { id: "iso",    regime: "ISO/IEC 42001",                 regimeAr: "الأيزو 42001",                                geo: "Global",         geoAr: "عالمي",                     region: "Global",   instrument: "Standard",   instrumentAr: "معيار",            status: "applies", effective: "Certifiable now",             effectiveAr: "قابل للاعتماد الآن",                 penalty: "Certification / market access",     penaltyAr: "الاعتماد / الوصول إلى السوق",                  note: "AI management system — the certifiable backbone.", noteAr: "نظام إدارة الذكاء الاصطناعي — العمود القابل للاعتماد." },
  { id: "nyc144", regime: "NYC Local Law 144",             regimeAr: "قانون نيويورك المحلي 144",                    geo: "New York City",  geoAr: "مدينة نيويورك",             region: "Americas", instrument: "Law",        instrumentAr: "قانون",            status: "monitor", effective: "In force",                    effectiveAr: "ساري",                               penalty: "$500–$1,500 per violation/day",     penaltyAr: "500–1,500 دولار لكل مخالفة/يوم",               note: "Bias audit for automated employment decision tools.", noteAr: "تدقيق التحيّز لأدوات قرارات التوظيف الآلية." },
  { id: "caadmt", regime: "California ADMT / CPRA",        regimeAr: "تقنية القرار الآلي بكاليفورنيا / CPRA",       geo: "California, US", geoAr: "كاليفورنيا، الولايات المتحدة", region: "Americas", instrument: "Regulation", instrumentAr: "لائحة",           status: "monitor", effective: "2026 rulemaking",             effectiveAr: "وضع القواعد 2026",                   penalty: "CPPA enforcement",                  penaltyAr: "إنفاذ CPPA",                                   note: "Automated decision-making tech + opt-out rights.", noteAr: "تقنية صنع القرار الآلي + حقوق الانسحاب." },
  { id: "aida",   regime: "Canada AIDA (C-27)",            regimeAr: "قانون كندا AIDA (C-27)",                      geo: "Canada",         geoAr: "كندا",                      region: "Americas", instrument: "Bill",       instrumentAr: "مشروع قانون",      status: "monitor", effective: "Pending royal assent",        effectiveAr: "بانتظار الموافقة الملكية",           penalty: "Up to CAD 25M or 5%",               penaltyAr: "حتى 25 مليون دولار كندي أو 5%",                note: "High-impact AI systems — watch for enactment.", noteAr: "أنظمة ذكاء اصطناعي عالية الأثر — يُترقّب سنّها." },
  { id: "cn",     regime: "China AI Regulations (7 instruments)", regimeAr: "لوائح الصين للذكاء الاصطناعي (7 أدوات)", geo: "China", geoAr: "الصين",                  region: "APAC",     instrument: "Regulation", instrumentAr: "لائحة",            status: "monitor", effective: "In force · labelling Sep 2025", effectiveAr: "ساري · الوسم سبتمبر 2025",         penalty: "CAC enforcement · suspension",      penaltyAr: "إنفاذ CAC · تعليق",                            note: "Algorithm filing, deep synthesis, GenAI interim measures, content labelling (GB 45438), ethics review, PIPL/DSL/CSL, TC260 baseline.", noteAr: "تسجيل الخوارزميات، والتركيب العميق، والتدابير المؤقتة للذكاء التوليدي، ووسم المحتوى (GB 45438)، ومراجعة الأخلاقيات، وPIPL/DSL/CSL، وخط أساس TC260." },
  { id: "kr",     regime: "Korea AI Framework Act",        regimeAr: "قانون إطار كوريا للذكاء الاصطناعي",           geo: "South Korea",    geoAr: "كوريا الجنوبية",            region: "APAC",     instrument: "Law",        instrumentAr: "قانون",            status: "monitor", effective: "Jan 2026",                    effectiveAr: "يناير 2026",                         penalty: "Fines · corrective orders",         penaltyAr: "غرامات · أوامر تصحيحية",                       note: "High-impact AI transparency + safety.", noteAr: "شفافية وسلامة الذكاء الاصطناعي عالي الأثر." },
  { id: "au",     regime: "Australia AI Guardrails",       regimeAr: "ضوابط أستراليا للذكاء الاصطناعي",             geo: "Australia",      geoAr: "أستراليا",                  region: "APAC",     instrument: "Proposed",   instrumentAr: "مقترح",            status: "monitor", effective: "Consultation",                effectiveAr: "قيد التشاور",                        penalty: "To be determined",                  penaltyAr: "يُحدَّد لاحقاً",                                note: "Mandatory guardrails for high-risk AI (proposed).", noteAr: "ضوابط إلزامية للذكاء الاصطناعي عالي الخطورة (مقترحة)." },
  { id: "br",     regime: "Brazil PL 2338 (AI Bill)",      regimeAr: "مشروع قانون البرازيل PL 2338",                geo: "Brazil",         geoAr: "البرازيل",                  region: "Americas", instrument: "Bill",       instrumentAr: "مشروع قانون",      status: "out",     effective: "Not enacted",                 effectiveAr: "لم يُسَنّ",                           penalty: "n/a",                               penaltyAr: "لا ينطبق",                                     note: "No operations in Brazil — out of scope, tracked only.", noteAr: "لا عمليات في البرازيل — خارج النطاق، متابَعة فقط." },
];

export const REGIME_STATUS_META = {
  applies: { label: "Applies",      labelAr: "ينطبق",       tone: "crit" },
  monitor: { label: "Monitor",      labelAr: "مراقبة",      tone: "warn" },
  out:     { label: "Out of scope", labelAr: "خارج النطاق", tone: "ink3" },
};

/* Arabic labels for operating regions (English fallback at the call site). */
export const REGION_AR = {
  Americas: "الأمريكتان",
  EMEA: "أوروبا والشرق الأوسط وأفريقيا",
  APAC: "آسيا والمحيط الهادئ",
  Global: "عالمي",
};

export function jurisdictionStats() {
  const by = s => REGIMES.filter(r => r.status === s).length;
  return {
    total: REGIMES.length,
    applies: by("applies"),
    monitor: by("monitor"),
    out: by("out"),
    regions: OPERATING_REGIONS.length,
  };
}
