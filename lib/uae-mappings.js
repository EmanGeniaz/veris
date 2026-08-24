/* ── UAE / Dubai regulatory pack ──────────────────────────────────────────
   The Emirates run a layered data + security regime: a federal data-protection
   law, two free-zone laws (DIFC, ADGM) that bind entities established there,
   Dubai's electronic-security and cloud rules (DESC), and the national
   information-assurance baseline. This pack promotes "UAE / Dubai" to a
   first-class regime by mapping each core obligation to a control VerisZone
   already runs. Posture is COMPUTED from the mapping (Met=100, Partial=60,
   Gap=0), never asserted — the same honesty rule the other packs follow.

   Pure data + arithmetic, deterministic, client-safe. */

/* The instruments in force, with the citation and enforcing body. `cite` is the
   legal reference the compliance panel shows (inst.cite || inst.cn). */
/* Bilingual (Arabic alongside English). Display fields carry `*Ar` variants that
   the compliance surface renders when the app language is Arabic; legal citations
   (`cite`) and acronyms (PDPL, DIFC, ADGM, DESC, GDPR, DSAR, HITL, MCP, DPIA,
   Veris Enforce) are kept in original form so references stay verifiable. */
export const UAE_INSTRUMENTS = [
  { id: "pdpl",   short: "UAE Federal PDPL", shortAr: "قانون حماية البيانات الاتحادي الإماراتي (PDPL)", cite: "Federal Decree-Law No. 45 of 2021", reg: "UAE Data Office", regAr: "مكتب بيانات الإمارات", eff: "In force", effAr: "ساري",
    req: "Federal personal-data protection: lawful basis & consent, data-subject rights, breach notification, cross-border transfer, security, DPO and DPIA.",
    reqAr: "حماية البيانات الشخصية الاتحادية: الأساس القانوني والموافقة، وحقوق أصحاب البيانات، والإبلاغ عن الخرق، والنقل عبر الحدود، والأمن، ومسؤول حماية البيانات، وتقييم الأثر." },
  { id: "difc",   short: "DIFC Data Protection Law", shortAr: "قانون حماية بيانات DIFC", cite: "DIFC Law No. 5 of 2020 (+2022 amd.)", reg: "DIFC Commissioner of Data Protection", regAr: "مفوّض حماية البيانات في DIFC", eff: "In force", effAr: "ساري",
    req: "Free-zone data law for DIFC entities; GDPR-aligned, with specific duties on high-risk and autonomous/AI-driven processing (Art. 10).",
    reqAr: "قانون بيانات المنطقة الحرة لكيانات DIFC؛ متوافق مع GDPR، مع واجبات محددة على المعالجة عالية الخطورة والمستقلّة/المدفوعة بالذكاء الاصطناعي (المادة 10)." },
  { id: "adgm",   short: "ADGM Data Protection Regs", shortAr: "لوائح حماية بيانات ADGM", cite: "ADGM DP Regulations 2021", reg: "ADGM Office of Data Protection", regAr: "مكتب حماية البيانات في ADGM", eff: "In force", effAr: "ساري",
    req: "Free-zone data regulations for ADGM entities; GDPR-aligned rights, DPIA, breach notification and transfer safeguards.",
    reqAr: "لوائح بيانات المنطقة الحرة لكيانات ADGM؛ حقوق متوافقة مع GDPR، وتقييم الأثر، والإبلاغ عن الخرق، وضمانات النقل." },
  { id: "desc",   short: "DESC Information Security Reg.", shortAr: "لائحة أمن المعلومات DESC", cite: "Dubai Electronic Security Center · ISR v2 + Cloud policy", reg: "DESC", regAr: "مركز دبي للأمن الإلكتروني", eff: "In force", effAr: "ساري",
    req: "Dubai information-security regulation and cloud policy: data classification, approved-cloud controls and residency for Dubai-government-linked entities.",
    reqAr: "لائحة أمن المعلومات وسياسة السحابة في دبي: تصنيف البيانات، وضوابط السحابة المعتمدة، والإقامة للكيانات المرتبطة بحكومة دبي." },
  { id: "ia",     short: "UAE Information Assurance", shortAr: "ضمان المعلومات الإماراتي", cite: "NESA / SIA IA Standards", reg: "UAE Cyber Security Council", regAr: "مجلس الأمن السيبراني الإماراتي", eff: "In force", effAr: "ساري",
    req: "National information-assurance baseline — security controls, risk management and incident handling for critical entities.",
    reqAr: "خط الأساس الوطني لضمان المعلومات — الضوابط الأمنية وإدارة المخاطر ومعالجة الحوادث للكيانات الحيوية." },
  { id: "ethics", short: "UAE AI Ethics Principles", shortAr: "مبادئ أخلاقيات الذكاء الاصطناعي الإماراتية", cite: "UAE Office for AI · AI Ethics Guidelines", reg: "UAE Office for AI", regAr: "مكتب الإمارات للذكاء الاصطناعي", eff: "Guidance", effAr: "إرشادات",
    req: "Fairness, accountability, transparency, human oversight and safety principles for AI systems deployed in the UAE.",
    reqAr: "مبادئ العدالة والمساءلة والشفافية والإشراف البشري والسلامة لأنظمة الذكاء الاصطناعي المنشورة في الإمارات." },
];

const UAE_INST = Object.fromEntries(UAE_INSTRUMENTS.map(i => [i.id, i.short]));
const UAE_INST_AR = Object.fromEntries(UAE_INSTRUMENTS.map(i => [i.id, i.shortAr || i.short]));

/* Each obligation → the VerisZone control that meets it, its surface, status and
   the instrument it comes from. Same row shape as the India / China packs. */
export const UAE_REQS = [
  { n: 1,  name: "Lawful basis & consent", nameAr: "الأساس القانوني والموافقة", inst: "pdpl", desc: "Establish a lawful basis and obtain consent where required (PDPL Art. 4–6).", descAr: "إرساء أساس قانوني والحصول على الموافقة عند الاقتضاء (PDPL المواد 4–6).", control: "Gateway data scopes + consent record on the processing purpose", controlAr: "نطاقات بيانات البوابة + سجل موافقة على غرض المعالجة", surface: "Veris Enforce · Egress Policy", surfaceAr: "Veris Enforce · سياسة الإخراج", status: "Partial" },
  { n: 2,  name: "Data-subject rights", nameAr: "حقوق أصحاب البيانات", inst: "pdpl", desc: "Access, correction, erasure, portability and objection (PDPL Art. 13–17).", descAr: "الوصول والتصحيح والمحو وقابلية النقل والاعتراض (PDPL المواد 13–17).", control: "DSAR workflow + per-tenant data record", controlAr: "سير عمل DSAR + سجل بيانات لكل مستأجر", surface: "Admin · Users & RBAC", surfaceAr: "الإدارة · المستخدمون وRBAC", status: "Partial" },
  { n: 3,  name: "Breach notification", nameAr: "الإبلاغ عن الخرق", inst: "pdpl", desc: "Notify the UAE Data Office and affected data subjects of a personal-data breach (PDPL Art. 9).", descAr: "إخطار مكتب بيانات الإمارات وأصحاب البيانات المتأثرين بخرق البيانات الشخصية (PDPL المادة 9).", control: "Breach-notification workflow — authority + subject notices on the regulatory clock", controlAr: "سير عمل الإبلاغ عن الخرق — إخطارات الجهة والأصحاب على الساعة التنظيمية", surface: "Breach Notification", surfaceAr: "الإبلاغ عن خرق البيانات", status: "Met" },
  { n: 4,  name: "Cross-border data transfer", nameAr: "نقل البيانات عبر الحدود", inst: "pdpl", desc: "Transfer personal data abroad only with adequacy or appropriate safeguards (PDPL Art. 22–23).", descAr: "نقل البيانات الشخصية للخارج فقط بالكفاية أو بضمانات ملائمة (PDPL المواد 22–23).", control: "Egress policy — data-residency scoping + deny-by-default destinations", controlAr: "سياسة الإخراج — تحديد نطاق إقامة البيانات + رفض الوجهات افتراضياً", surface: "Veris Enforce · Egress Policy", surfaceAr: "Veris Enforce · سياسة الإخراج", status: "Met" },
  { n: 5,  name: "Data residency & localisation", nameAr: "إقامة البيانات وتوطينها", inst: "desc", desc: "Keep classified / regulated data within approved UAE / Dubai boundaries.", descAr: "إبقاء البيانات المصنّفة/المنظّمة ضمن الحدود الإماراتية/الدبيّة المعتمدة.", control: "Egress residency controls + approved-destination allow-list", controlAr: "ضوابط إقامة الإخراج + قائمة سماح بالوجهات المعتمدة", surface: "Veris Enforce · Egress Policy", surfaceAr: "Veris Enforce · سياسة الإخراج", status: "Partial" },
  { n: 6,  name: "Records of processing & accountability", nameAr: "سجلات المعالجة والمساءلة", inst: "pdpl", desc: "Maintain records demonstrating accountability (PDPL Art. 7).", descAr: "الاحتفاظ بسجلات تُثبت المساءلة (PDPL المادة 7).", control: "Tool-Call Ledger — tamper-evident hash chain + Article 12 log", controlAr: "سجل استدعاء الأدوات — سلسلة تجزئة مقاومة للعبث + سجل المادة 12", surface: "Tool-Call Ledger", surfaceAr: "سجل استدعاء الأدوات", status: "Met" },
  { n: 7,  name: "Security of processing", nameAr: "أمن المعالجة", inst: "pdpl", desc: "Appropriate technical & organisational security measures (PDPL Art. 20).", descAr: "تدابير أمنية تقنية وتنظيمية ملائمة (PDPL المادة 20).", control: "Veris Enforce — egress policy, PII masking, encryption in transit", controlAr: "Veris Enforce — سياسة الإخراج، وإخفاء البيانات الشخصية، والتشفير أثناء النقل", surface: "Veris Enforce", surfaceAr: "Veris Enforce", status: "Met" },
  { n: 8,  name: "DPO appointment", nameAr: "تعيين مسؤول حماية البيانات", inst: "pdpl", desc: "Appoint a Data Protection Officer where thresholds are met (PDPL Art. 10).", descAr: "تعيين مسؤول لحماية البيانات عند بلوغ العتبات (PDPL المادة 10).", control: "EOS ownership — accountable CDPO role (organisational)", controlAr: "ملكية EOS — دور CDPO مسؤول (تنظيمي)", surface: "Admin · Users & RBAC", surfaceAr: "الإدارة · المستخدمون وRBAC", status: "Partial" },
  { n: 9,  name: "Data Protection Impact Assessment", nameAr: "تقييم أثر حماية البيانات", inst: "pdpl", desc: "Assess impact of high-risk processing (PDPL Art. 21).", descAr: "تقييم أثر المعالجة عالية الخطورة (PDPL المادة 21).", control: "Impact Assessment register — DPIA per personal-data system, computed completeness", controlAr: "سجل تقييم الأثر — DPIA لكل نظام بيانات شخصية، اكتمال محسوب", surface: "Impact Assessments", surfaceAr: "تقييمات الأثر", status: "Met" },
  { n: 10, name: "Automated processing & profiling safeguards", nameAr: "ضمانات المعالجة الآلية والتنميط", inst: "difc", desc: "Safeguards on automated / autonomous decision-making (DIFC Art. 10).", descAr: "ضمانات على صنع القرار الآلي/المستقل (DIFC المادة 10).", control: "HITL gates + circuit breaker + decision transparency", controlAr: "بوابات HITL + قاطع الدائرة + شفافية القرار", surface: "HITL Gates", surfaceAr: "بوابات HITL", status: "Partial" },
  { n: 11, name: "Data classification", nameAr: "تصنيف البيانات", inst: "desc", desc: "Classify data by sensitivity per DESC / Dubai Data policy.", descAr: "تصنيف البيانات حسب الحساسية وفق سياسة DESC / بيانات دبي.", control: "Data Provenance — per-system PII classification & minimisation dimension", controlAr: "مصدر البيانات — تصنيف البيانات الشخصية والتقليل لكل نظام", surface: "Data Provenance", surfaceAr: "مصدر البيانات", status: "Met" },
  { n: 12, name: "Approved-cloud & cloud security", nameAr: "السحابة المعتمدة وأمن السحابة", inst: "desc", desc: "Use approved cloud providers with the required security controls.", descAr: "استخدام مزوّدي سحابة معتمدين بالضوابط الأمنية المطلوبة.", control: "MCP supply-chain quarantine + egress approved-destination controls", controlAr: "حجر سلسلة توريد MCP + ضوابط الوجهات المعتمدة للإخراج", surface: "Veris Enforce · MCP", surfaceAr: "Veris Enforce · MCP", status: "Partial" },
  { n: 13, name: "Information-assurance controls", nameAr: "ضوابط ضمان المعلومات", inst: "ia", desc: "Meet the national information-assurance security baseline.", descAr: "استيفاء خط الأساس الأمني الوطني لضمان المعلومات.", control: "Common control library + Veris Enforce + red-team", controlAr: "مكتبة الضوابط المشتركة + Veris Enforce + الفريق الأحمر", surface: "Compliance · Controls", surfaceAr: "الامتثال · الضوابط", status: "Partial" },
  { n: 14, name: "AI ethics — fairness, transparency, oversight", nameAr: "أخلاقيات الذكاء الاصطناعي — العدالة والشفافية والإشراف", inst: "ethics", desc: "Deploy AI per the UAE AI ethics principles.", descAr: "نشر الذكاء الاصطناعي وفق مبادئ الأخلاقيات الإماراتية.", control: "Governance forum + AIA ethics gate + AI-interaction disclosure", controlAr: "منتدى الحوكمة + بوابة أخلاقيات AIA + الإفصاح عن التفاعل مع الذكاء الاصطناعي", surface: "AI Central · Governance", surfaceAr: "AI Central · الحوكمة", status: "Partial" },
];

/* attach the readable instrument label (EN + AR) for the grouped view */
UAE_REQS.forEach(r => { r.instrument = UAE_INST[r.inst] || r.inst; r.instrumentAr = UAE_INST_AR[r.inst] || r.instrument; });

/* Arabic labels for the computed statuses (English fallback at the call site). */
export const UAE_STATUS_AR = { Met: "مُستوفى", Partial: "جزئي", Gap: "فجوة" };

const WEIGHT = { Met: 100, Partial: 60, Gap: 0 };
export function uaeStats() {
  const met = UAE_REQS.filter(r => r.status === "Met").length;
  const partial = UAE_REQS.filter(r => r.status === "Partial").length;
  const gap = UAE_REQS.filter(r => r.status === "Gap").length;
  const score = Math.round(UAE_REQS.reduce((s, r) => s + (WEIGHT[r.status] || 0), 0) / UAE_REQS.length);
  return { total: UAE_REQS.length, met, partial, gap, score, instruments: UAE_INSTRUMENTS.length };
}
export const UAE_POSTURE_SCORE = uaeStats().score;
