/* Product use cases — problem statements an organisation actually faces, and the
   step-by-step way VerisZone solves each. Help/Guides content (rendered in the
   Governance Academy "Use Cases" view), not a governed product surface.

   Bilingual: each field carries an `*Ar` variant; the view renders the reader's
   language and falls back to English where an Arabic variant is absent. `steps[].s`
   names the VerisZone surface that does the work. Acronyms/law names kept in
   original form inside the Arabic text so references stay verifiable. */

export const USE_CASES = [
  {
    id: "shadow-ai",
    cat: "Enforcement",
    title: "Shadow AI is everywhere and we can't see it",
    titleAr: "الذكاء الاصطناعي الظلّي منتشر ولا نستطيع رؤيته",
    problem: "Employees paste company data into public AI tools. We have no visibility into what's being used, and no control over what leaves the boundary.",
    problemAr: "يُدخل الموظفون بيانات الشركة في أدوات ذكاء اصطناعي عامة. لا رؤية لدينا لما يُستخدَم، ولا سيطرة على ما يغادر حدود المؤسسة.",
    steps: [
      { t: "Turn on Veris Enforce discovery — every AI call is classified Enforced, Observed or Shadow, so you see the whole estate honestly.", tAr: "شغّل اكتشاف Veris Enforce — يُصنَّف كل استدعاء ذكاء اصطناعي: مُنفَّذ أو مُراقَب أو ظِلّي، فترى المنشأة كاملةً بأمانة.", s: "Enforcement Coverage" },
      { t: "Route sanctioned traffic through the AI Gateway — policy checks, PII masking and egress validation happen at the boundary.", tAr: "وجِّه الحركة المُصرَّح بها عبر بوابة الذكاء الاصطناعي — فحص السياسة، وإخفاء البيانات الشخصية، والتحقق من الإخراج عند الحدود.", s: "AI Gateway" },
      { t: "Publish an approved-tools AI Hub so staff have a governed alternative instead of public chat.", tAr: "انشر مركز ذكاء اصطناعي بالأدوات المعتمدة ليكون للموظفين بديل مُحوكَم عن الدردشة العامة.", s: "AI Hub" },
      { t: "Every interaction is recorded to Trust & Evidence with a tamper-evident Article 12 log.", tAr: "يُسجَّل كل تفاعل في الثقة والأدلة مع سجل المادة 12 المقاوم للعبث.", s: "Trust & Evidence" },
    ],
    outcome: "Shadow AI becomes measured, then governed — nothing leaves the enterprise boundary unseen or unlogged.",
    outcomeAr: "يتحوّل الذكاء الاصطناعي الظلّي إلى مقيس ثم مُحوكَم — لا شيء يغادر حدود المؤسسة دون رؤية أو تسجيل.",
    frameworks: "EU AI Act Art.12 · ISO 42001 · OWASP LLM",
  },
  {
    id: "regulator-ready",
    cat: "Compliance",
    title: "A regulator or the board asked: are your AI systems compliant?",
    titleAr: "سألت جهة تنظيمية أو المجلس: هل أنظمة الذكاء الاصطناعي لديكم ممتثلة؟",
    problem: "We can't quickly produce evidence that our AI systems meet the frameworks that apply to us — and every framework asks for something slightly different.",
    problemAr: "لا نستطيع بسرعة تقديم دليل على أن أنظمتنا تستوفي الأطر المنطبقة علينا — وكل إطار يطلب شيئاً مختلفاً قليلاً.",
    steps: [
      { t: "Select your jurisdiction in the Framework Library — the applicable stack surfaces automatically, with computed posture.", tAr: "اختر ولايتك القضائية في مكتبة الأطر — تظهر الحزمة المنطبقة تلقائياً بوضعية محسوبة.", s: "Framework Library" },
      { t: "Map each obligation to a control via the Convergence Crosswalk — build one control, satisfy four frameworks.", tAr: "اربط كل التزام بضابط عبر مصفوفة التقارب — ابنِ ضابطاً واحداً واستوفِ أربعة أطر.", s: "Convergence Crosswalk" },
      { t: "Generate the Statement of Applicability and evidence artifacts, pre-filled from your live controls — never a blank document.", tAr: "ولّد بيان قابلية التطبيق وقطع الأدلة، مُعبّأة مسبقاً من ضوابطك الحيّة — لا وثيقة فارغة أبداً.", s: "ISO 42001 Readiness" },
      { t: "Export the board or regulator pack with posture computed from real controls, never asserted.", tAr: "صدّر حزمة المجلس أو الجهة التنظيمية بوضعية محسوبة من ضوابط حقيقية، لا مُدّعاة.", s: "Reports" },
    ],
    outcome: "A defensible, evidence-backed compliance posture in hours, not weeks.",
    outcomeAr: "وضعية امتثال قابلة للدفاع ومدعومة بالأدلة في ساعات، لا أسابيع.",
    frameworks: "EU AI Act · ISO 42001 · NIST AI RMF · GDPR",
  },
  {
    id: "high-risk-decision",
    cat: "Governance",
    title: "We're deploying an AI that decides about people (credit, hiring)",
    titleAr: "ننشر ذكاءً اصطناعياً يتّخذ قرارات بشأن الأشخاص (الائتمان، التوظيف)",
    problem: "Our AI makes decisions with legal effect on individuals. We could breach the EU AI Act or GDPR Art.22 and not find out until it's a complaint.",
    problemAr: "يتّخذ ذكاؤنا الاصطناعي قرارات ذات أثر قانوني على الأفراد. قد نخالف القانون الأوروبي أو المادة 22 من GDPR دون أن ندري حتى تصلنا شكوى.",
    steps: [
      { t: "Screen the system against the eight prohibited practices (Art.5) before any risk tiering — where the answer is stop, not control.", tAr: "افحص النظام مقابل الممارسات المحظورة الثماني (المادة 5) قبل أي تصنيف مخاطر — حيث يكون الجواب الإيقاف لا الضبط.", s: "Prohibited Practices" },
      { t: "Run one Impact Assessment — the same nine questions close the AIA, DPIA and FRIA for four regulators at once.", tAr: "أجرِ تقييم أثر واحداً — تُغلق التسعة أسئلة نفسها AIA وDPIA وFRIA لأربع جهات تنظيمية دفعةً واحدة.", s: "Impact Assessments" },
      { t: "Put human-in-the-loop gates and a circuit breaker on the decision path.", tAr: "ضع بوابات الإنسان في الحلقة وقاطع دائرة على مسار القرار.", s: "HITL Gates" },
      { t: "Log every inference to the automatic, tamper-evident Article 12 record.", tAr: "سجّل كل استدلال في سجل المادة 12 الآلي المقاوم للعبث.", s: "Article 12 Log" },
    ],
    outcome: "The high-risk system ships with conformity evidence and human oversight built in from day one.",
    outcomeAr: "يُطلَق النظام عالي الخطورة بأدلة مطابقة وإشراف بشري مُدمَجَين من اليوم الأول.",
    frameworks: "EU AI Act Art.5/27 · GDPR Art.22 · ISO 42001",
  },
  {
    id: "breach-clock",
    cat: "Incident",
    title: "A data breach or AI incident just happened — the clock is running",
    titleAr: "وقع خرق بيانات أو حادث ذكاء اصطناعي للتو — الساعة تعمل",
    problem: "We may have a reportable breach and don't know which authorities to notify, or how many hours we have before we're late.",
    problemAr: "قد يكون لدينا خرق واجب الإبلاغ ولا نعرف أيّ الجهات نُخطر، ولا كم ساعة أمامنا قبل أن نتأخّر.",
    steps: [
      { t: "Open the Breach Notification workflow — it computes each regime's clock (GDPR 72h, UAE PDPL, CERT-In 6h) from the moment of discovery.", tAr: "افتح سير عمل الإبلاغ عن الخرق — يحتسب ساعة كل نظام (GDPR 72 ساعة، PDPL الإماراتي، CERT-In 6 ساعات) من لحظة الاكتشاف.", s: "Breach Notification" },
      { t: "Scope the affected data and jurisdictions; the register tracks every authority and data-subject notice owed.", tAr: "حدّد نطاق البيانات المتأثرة والولايات القضائية؛ يتتبّع السجل كل جهة وإشعار مستحق لأصحاب البيانات.", s: "Breach register" },
      { t: "Draft the notifications and record the full decision trail as evidence.", tAr: "صُغ الإخطارات وسجّل مسار القرار الكامل كدليل.", s: "Trust & Evidence" },
    ],
    outcome: "You notify the right authorities inside the window, with a defensible record of what you decided and when.",
    outcomeAr: "تُخطر الجهات الصحيحة ضمن المدة، بسجل قابل للدفاع لما قرّرته ومتى.",
    frameworks: "GDPR Art.33 · UAE PDPL Art.9 · EU AI Act Art.73",
  },
  {
    id: "uae-residency",
    cat: "UAE / Dubai",
    title: "We operate in the UAE and must keep regulated data in-region",
    titleAr: "نعمل في الإمارات ويجب إبقاء البيانات المنظّمة داخل المنطقة",
    problem: "UAE PDPL and DESC require data residency and approved-cloud controls. We're not sure our AI keeps regulated data inside the country.",
    problemAr: "يتطلّب قانون حماية البيانات الإماراتي (PDPL) وDESC إقامة البيانات وضوابط السحابة المعتمدة. لسنا متأكّدين أن ذكاءنا الاصطناعي يُبقي البيانات المنظّمة داخل الدولة.",
    steps: [
      { t: "Select UAE · Dubai in the Framework Library — PDPL, DIFC, ADGM and DESC obligations load with computed posture.", tAr: "اختر الإمارات · دبي في مكتبة الأطر — تُحمَّل التزامات PDPL وDIFC وADGM وDESC بوضعية محسوبة.", s: "Framework Library" },
      { t: "Set egress residency controls — deny-by-default destinations so regulated data can't leave approved boundaries.", tAr: "اضبط ضوابط إقامة الإخراج — رفض الوجهات افتراضياً كي لا تغادر البيانات المنظّمة الحدود المعتمدة.", s: "Veris Enforce · Egress" },
      { t: "Classify data and map approved clouds per the DESC / Dubai data policy.", tAr: "صنّف البيانات واربط السُّحُب المعتمدة وفق سياسة DESC / بيانات دبي.", s: "Data Provenance" },
    ],
    outcome: "Regulated data provably stays in-region, with the classification and controls a UAE audit asks for.",
    outcomeAr: "تبقى البيانات المنظّمة داخل المنطقة بشكل مُثبَت، مع التصنيف والضوابط التي يطلبها تدقيق إماراتي.",
    frameworks: "UAE PDPL · DIFC · ADGM · DESC",
  },
  {
    id: "ai-roi",
    cat: "Value",
    title: "AI spend is climbing and leadership asks: what's the ROI?",
    titleAr: "إنفاق الذكاء الاصطناعي يتصاعد والقيادة تسأل: ما العائد؟",
    problem: "We're investing across many AI programs but can't show which return value and which quietly leak budget ahead of any return.",
    problemAr: "نستثمر عبر برامج ذكاء اصطناعي كثيرة لكن لا نستطيع إظهار أيّها يعيد قيمة وأيّها يستهلك الميزانية بهدوء قبل أي عائد.",
    steps: [
      { t: "Open the CFO command center — portfolio ROI, value realized vs value leaked, and monthly run-rate, each traceable to its source.", tAr: "افتح مركز قيادة المدير المالي — عائد المحفظة، والقيمة المُحقّقة مقابل المتسرّبة، ومعدّل التشغيل الشهري، وكلٌّ يتتبّع مصدره.", s: "CFO Center" },
      { t: "Each initiative's value, adoption and risk are computed from its live record, not a slide.", tAr: "تُحتسب قيمة كل مبادرة وتبنّيها ومخاطرها من سجلها الحيّ، لا من شريحة عرض.", s: "AI PMO" },
      { t: "Veris Intelligence recommends scale or retire at each gate, with the reason and a confidence score.", tAr: "توصي استخبارات فيريس بالتوسّع أو التقاعد عند كل بوابة، بالسبب ودرجة ثقة.", s: "Veris Intelligence" },
    ],
    outcome: "Fund what returns, retire what leaks — with the evidence to defend the call to the board.",
    outcomeAr: "موّل ما يعيد قيمة، وأنهِ ما يتسرّب — بالأدلة للدفاع عن القرار أمام المجلس.",
    frameworks: "Computed posture · AI PMO · Value analytics",
  },
  {
    id: "data-provenance",
    cat: "Governance",
    title: "We can't tell what data trained our models",
    titleAr: "لا نستطيع معرفة البيانات التي درّبت نماذجنا",
    problem: "We don't know the provenance of our AI's training and grounding data — an IP claim or a privacy complaint could blindside us.",
    problemAr: "لا نعرف مصدر بيانات تدريب ذكائنا الاصطناعي وإسناده — قد تباغتنا مطالبة ملكية فكرية أو شكوى خصوصية.",
    steps: [
      { t: "Build a Data Provenance record per system — source lineage, lawful basis, IP clearance, PII class and a content hash.", tAr: "ابنِ سجل مصدر بيانات لكل نظام — تتبّع المصدر، والأساس القانوني، وإخلاء الملكية الفكرية، وتصنيف البيانات الشخصية، وبصمة محتوى.", s: "Data Provenance" },
      { t: "Flag the gaps and route each to an owner for clearance.", tAr: "علّم الفجوات ووجّه كلاً منها إلى مسؤول لإخلائها.", s: "Data Provenance" },
      { t: "One artifact answers EU AI Act Art.10, ISO 42001 A.7 and OWASP LLM03 at once.", tAr: "قطعة دليل واحدة تُجيب المادة 10 من القانون الأوروبي، والأيزو 42001 A.7، وOWASP LLM03 دفعةً واحدة.", s: "Convergence Crosswalk" },
    ],
    outcome: "Every model's data is traceable and defensible — no surprise IP or privacy exposure.",
    outcomeAr: "بيانات كل نموذج قابلة للتتبّع والدفاع — دون مفاجأة تعرّض للملكية الفكرية أو الخصوصية.",
    frameworks: "EU AI Act Art.10 · ISO 42001 A.7 · OWASP LLM03",
  },
  {
    id: "agent-autonomy",
    cat: "Enforcement",
    title: "Our AI agents act on their own and we're nervous",
    titleAr: "وكلاؤنا للذكاء الاصطناعي يتصرّفون تلقائياً ونشعر بالقلق",
    problem: "Agents call tools and chain together. One could exfiltrate data or exceed its mandate through a path no single step revealed.",
    problemAr: "يستدعي الوكلاء أدوات ويتسلسلون. قد يُسرّب أحدهم بيانات أو يتجاوز تفويضه عبر مسار لم تكشفه أي خطوة منفردة.",
    steps: [
      { t: "Issue least-privilege capability tokens — short-lived, signed, per-tool-call grants; agents hold no standing keys.", tAr: "أصدر رموز قدرة بالحد الأدنى — منح قصيرة الأجل موقّعة لكل استدعاء أداة؛ لا يحمل الوكلاء مفاتيح دائمة.", s: "Capability broker" },
      { t: "Record every attempted tool call in the hash-chained Tool-Call Ledger — a tampered row breaks every later row.", tAr: "سجّل كل استدعاء أداة مُحاوَل في سجل استدعاء الأدوات المُسلسَل بالتجزئة — أي صف مُعبَث به يكسر كل صف لاحق.", s: "Tool-Call Ledger" },
      { t: "A circuit breaker revokes an agent's capabilities in real time when a threshold is breached.", tAr: "يُلغي قاطع الدائرة قدرات الوكيل فوراً عند تجاوز عتبة.", s: "Circuit Breaker" },
    ],
    outcome: "Agents can act — but they can never escalate, chain or exfiltrate unseen.",
    outcomeAr: "يمكن للوكلاء التصرّف — لكن لا يمكنهم التصعيد أو التسلسل أو التسريب دون رؤية.",
    frameworks: "Least privilege · MITRE ATLAS · EU AI Act Art.14",
  },
];

export const USE_CASE_CATS = ["Enforcement", "Compliance", "Governance", "Incident", "UAE / Dubai", "Value"];

/* Arabic labels for the categories (English fallback at the call site). */
export const USE_CASE_CAT_AR = {
  Enforcement: "الإنفاذ", Compliance: "الامتثال", Governance: "الحوكمة",
  Incident: "الحوادث", "UAE / Dubai": "الإمارات / دبي", Value: "القيمة", all: "الكل",
};
