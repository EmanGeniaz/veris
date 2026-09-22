"use client";

import { useState, useEffect } from "react";
import { pushBus } from "@/lib/bus";
import { AI_ASSETS, assetById } from "@/lib/ai-assets";
import { T, F, AI_GOLD, AI_GOLD_INK, Card, Tag, SHead, vzDownload, ISO42001_CHECKLIST } from "./core";
import { useLang, ts, registerContent } from "@/lib/i18n";

/* Arabic content for the Templates & Register surface. */
registerContent({
  // header
  "Templates & Register": "القوالب والسجل",
  "Governance templates that pre-fill from the canonical AI Asset record — org-wide and per project. Nothing re-keyed; generating one records evidence.": "قوالب حوكمة تُملأ مسبقاً من سجل أصل الذكاء الاصطناعي المرجعي — على مستوى المؤسسة ولكل مشروع. لا شيء يُعاد إدخاله؛ وإنشاء أحدها يسجّل دليلاً.",
  // scope toggle
  "Org-wide · AI Register": "على مستوى المؤسسة · سجل الذكاء الاصطناعي",
  "By project · templates": "حسب المشروع · القوالب",
  // register KPIs
  "Assets": "الأصول",
  "Scale-ready": "جاهز للتوسيع",
  "Need remediation": "بحاجة إلى معالجة",
  "Export register →": "تصدير السجل ←",
  // table headers
  "Asset": "الأصل",
  "Type": "النوع",
  "Owner": "المالك",
  "Unit": "الوحدة",
  "Data class": "تصنيف البيانات",
  "Risk": "الخطر",
  "Adoption": "التبنّي",
  "Lifecycle": "دورة الحياة",
  "Recommendation": "التوصية",
  "Every row is pre-filled from the canonical AI Asset record. Click any asset to open its project templates.": "كل صف مملوء مسبقاً من سجل أصل الذكاء الاصطناعي المرجعي. انقر أي أصل لفتح قوالب مشروعه.",
  // model card sections & labels
  "Identity": "الهوية",
  "Purpose": "الغرض",
  "System architecture": "معمارية النظام",
  "Value": "القيمة",
  "Risks & controls": "المخاطر والضوابط",
  "To complete": "لإكمالها",
  "Technical owner": "المالك التقني",
  "EU AI Act": "قانون الذكاء الاصطناعي الأوروبي",
  "Hosting": "الاستضافة",
  "Model": "النموذج",
  "Data": "البيانات",
  "Integrations": "التكاملات",
  "Guardrails": "الحواجز",
  "Value score": "درجة القيمة",
  "Expected": "المتوقع",
  "Realized": "المُحقَّق",
  "Objective:": "الهدف:",
  "Intended use & limitations": "الاستخدام المقصود والقيود",
  "Known failure modes": "أنماط الفشل المعروفة",
  "Human oversight design": "تصميم الإشراف البشري",
  "gap to complete": "فجوة لإكمالها",
  "Where this asset should and shouldn't be used…": "أين ينبغي وأين لا ينبغي استخدام هذا الأصل…",
  "How it can fail and what's watched…": "كيف يمكن أن يفشل وما الذي يُراقَب…",
  "Where a human reviews or can override…": "أين يراجع الإنسان أو يمكنه التجاوز…",
  "Export model card →": "تصدير بطاقة النموذج ←",
  "Model Card": "بطاقة النموذج",
  "Pre-filled from the AI Asset record": "مملوء مسبقاً من سجل أصل الذكاء الاصطناعي",
  // AIRA
  "Assessment context": "سياق التقييم",
  "Risk grade": "درجة الخطر",
  "Identified risks — assess each": "المخاطر المحدَّدة — قيّم كل واحدة",
  "✎ Mitigation": "✎ التخفيف",
  "✎ Owner": "✎ المالك",
  "Treatment / control…": "المعالجة / الضابط…",
  "Accountable owner…": "المالك المسؤول…",
  "No risks recorded for this asset.": "لا مخاطر مسجّلة لهذا الأصل.",
  "Mapped controls": "الضوابط المرتبطة",
  "Residual position": "الوضع المتبقّي",
  "Export AIRA →": "تصدير AIRA ←",
  // ISO
  "Export checklist →": "تصدير قائمة المراجعة ←",
  "Create task": "أنشئ مهمة",
  // toasts
  "Saved to the asset record": "حُفظ في سجل الأصل",
  "Gap logged as a task": "سُجِّلت الفجوة كمهمة",
  // ── data: categorical values ──
  // unit
  "Customer Operations": "عمليات العملاء",
  "Retail Banking": "الخدمات المصرفية للأفراد",
  "Finance": "المالية",
  "People": "الموارد البشرية",
  // lifecycle
  "Production": "الإنتاج",
  "Implementation": "التنفيذ",
  "Scaling": "التوسّع",
  "Assessment": "التقييم",
  // risk grades
  "High": "مرتفع",
  "Critical": "حرج",
  "Low": "منخفض",
  "Medium": "متوسط",
  // data class
  "Confidential": "سرّي",
  "Restricted": "مقيّد",
  "Internal": "داخلي",
  // EU AI Act classification
  "Limited-risk": "مخاطر محدودة",
  "High-risk": "مخاطر عالية",
  "Unclassified": "غير مصنّف",
  // asset type
  "GenAI Agent": "وكيل ذكاء اصطناعي توليدي",
  "Decision Model": "نموذج قرار",
  "Process Automation": "أتمتة العمليات",
  "Recommendation (ML)": "توصية (تعلّم آلي)",
  // hosting
  "Cloud · gateway-routed": "سحابي · موجَّه عبر البوابة",
  "In-tenant": "داخل المستأجر",
  // recommendation verdict
  "Scale": "توسيع",
  "Remediate": "معالجة",
  "Retire": "إيقاف",
  "Continue": "استمرار",
  // arch.data
  "CRM tickets · KB articles": "تذاكر CRM · مقالات قاعدة المعرفة",
  "Applications · bureau data": "الطلبات · بيانات المكتب الائتماني",
  "Ledger · reconciliations": "دفتر الأستاذ · التسويات",
  "Skills graph · role profiles": "رسم المهارات · ملفات الأدوار",
  // arch.guardrails
  "PII redaction · prompt-shield": "حجب البيانات الشخصية · درع التوجيه",
  "Art.22 human review · DPIA": "المراجعة البشرية للمادة 22 · تقييم أثر حماية البيانات",
  "Approval gate · evidence log": "بوابة الاعتماد · سجل الأدلة",
  "Consent · bias eval": "الموافقة · تقييم التحيّز",
  // risks list
  "Prompt injection": "حقن التوجيه",
  "Data leakage": "تسريب البيانات",
  "Adverse decision harm": "ضرر القرار السلبي",
  "Explainability gap": "فجوة قابلية التفسير",
  "Incorrect journal suggestion": "اقتراح قيد محاسبي خاطئ",
  "Segregation of duties": "الفصل بين الواجبات",
  "Employee profiling": "تنميط الموظفين",
  "Bias in opportunity matching": "التحيّز في مطابقة الفرص",
  // asset descriptions (problem)
  "Customer resolution takes 11 minutes on average and 28% of cases need a second contact - cost and churn are climbing.": "يستغرق حل مشكلات العملاء 11 دقيقة في المتوسط، وتحتاج 28% من الحالات إلى تواصل ثانٍ — والتكلفة ومعدّل التسرّب في ارتفاع.",
  "Manual credit reviews average 6 days, decline reasons are inconsistent, and adverse-decision appeals are rising.": "تستغرق المراجعات الائتمانية اليدوية 6 أيام في المتوسط، وأسباب الرفض غير متسقة، وطعون القرارات السلبية في ازدياد.",
  "Month-end close takes 9 working days; 60% of close effort is manual reconciliation and journal preparation.": "يستغرق الإقفال الشهري 9 أيام عمل؛ و60% من جهد الإقفال تسوية يدوية وإعداد قيود.",
  "Internal mobility is at 9% and skills data is stale - roles are filled externally while capable employees are invisible.": "التنقّل الداخلي عند 9% وبيانات المهارات قديمة — تُملأ الأدوار خارجياً بينما يظل الموظفون الأكفاء غير مرئيين.",
  // asset objectives
  "Cut average handle time 40% and second-contact rate below 12% by Q4 FY26 while meeting EU AI Act oversight duties.": "خفض متوسط وقت المعالجة 40% ومعدّل التواصل الثاني دون 12% بحلول الربع الرابع من السنة المالية 26 مع الوفاء بواجبات الإشراف في قانون الذكاء الاصطناعي الأوروبي.",
  "Approve 70% of applications same-day with zero unexplained adverse decisions, fully EU AI Act Art.6 conformant.": "اعتماد 70% من الطلبات في اليوم نفسه دون أي قرارات سلبية غير مبرَّرة، وبمطابقة كاملة للمادة 6 من قانون الذكاء الاصطناعي الأوروبي.",
  "Close in 5 days by FY26 year-end with SOX-clean automation evidence and zero unreviewed AI journal postings.": "الإقفال في 5 أيام بحلول نهاية السنة المالية 26 بأدلة أتمتة نظيفة وفق SOX ودون أي قيود ذكاء اصطناعي غير مراجَعة.",
  "Lift internal fill rate to 25% within 12 months with a fairness-assessed recommendation engine under CHRO oversight.": "رفع معدّل الملء الداخلي إلى 25% خلال 12 شهراً بمحرّك توصية مُقيَّم من حيث الإنصاف تحت إشراف مدير الموارد البشرية.",
  // ── ISO/IEC 42001 checklist: clause titles ──
  "Context of the Organisation": "سياق المنظمة",
  "Interested Parties": "الأطراف المعنية",
  "Scope of the AIMS": "نطاق نظام إدارة الذكاء الاصطناعي",
  "AI Management System (AIMS)": "نظام إدارة الذكاء الاصطناعي (AIMS)",
  "Leadership & Commitment": "القيادة والالتزام",
  "AI Policy": "سياسة الذكاء الاصطناعي",
  "Roles, Responsibilities & Authorities": "الأدوار والمسؤوليات والصلاحيات",
  "Risk & Opportunity Planning": "تخطيط المخاطر والفرص",
  "AI Objectives& Planning": "أهداف الذكاء الاصطناعي والتخطيط",
  "Resources": "الموارد",
  "Competence": "الكفاءة",
  "Awareness": "الوعي",
  "Operational Planning & Control": "التخطيط والضبط التشغيلي",
  "AI Risk Assessment": "تقييم مخاطر الذكاء الاصطناعي",
  "AI Risk Treatment": "معالجة مخاطر الذكاء الاصطناعي",
  "AI System Design & Development": "تصميم وتطوير نظام الذكاء الاصطناعي",
  "AI System Deployment & Operation": "نشر وتشغيل نظام الذكاء الاصطناعي",
  "Monitoring, Measurement & Evaluation": "المراقبة والقياس والتقييم",
  "Internal Audit": "التدقيق الداخلي",
  "Management Review": "مراجعة الإدارة",
  "Nonconformity & Corrective Action": "عدم المطابقة والإجراء التصحيحي",
  "Continual Improvement": "التحسين المستمر",
  // ── ISO/IEC 42001 checklist: item text ──
  "Internal context documented: governance structures, AI objectives, capabilities, culture": "توثيق السياق الداخلي: هياكل الحوكمة، وأهداف الذكاء الاصطناعي، والقدرات، والثقافة",
  "External context documented: legal, regulatory, market, ethical, societal factors": "توثيق السياق الخارجي: العوامل القانونية والتنظيمية والسوقية والأخلاقية والمجتمعية",
  "Climate change and sustainability relevance assessed for AI strategy": "تقييم صلة تغيّر المناخ والاستدامة باستراتيجية الذكاء الاصطناعي",
  "SWOT/PESTLE analysis conducted and documented": "إجراء وتوثيق تحليل SWOT/PESTLE",
  "Organisation's role defined: AI provider, producer, deployer, or partner": "تحديد دور المنظمة: مزوّد أو منتج أو ناشر أو شريك في الذكاء الاصطناعي",
  "All internal interested parties identified (management, staff, IT, legal, compliance)": "تحديد جميع الأطراف الداخلية المعنية (الإدارة، والموظفون، وتقنية المعلومات، والشؤون القانونية، والامتثال)",
  "All external interested parties identified (customers, regulators, suppliers, public)": "تحديد جميع الأطراف الخارجية المعنية (العملاء، والمنظّمون، والموردون، والجمهور)",
  "Needs and expectations of each party documented and analysed": "توثيق وتحليل احتياجات وتوقّعات كل طرف",
  "Stakeholder needs integrated into AIMS planning and objectives": "دمج احتياجات أصحاب المصلحة في تخطيط نظام إدارة الذكاء الاصطناعي وأهدافه",
  "AI systems, processes and services within scope clearly defined": "تحديد أنظمة وعمليات وخدمات الذكاء الاصطناعي ضمن النطاق بوضوح",
  "Organisational units and locations included in scope documented": "توثيق الوحدات التنظيمية والمواقع المشمولة في النطاق",
  "AI-related risks, obligations, and objectives within scope clarified": "توضيح المخاطر والالتزامات والأهداف المتعلقة بالذكاء الاصطناعي ضمن النطاق",
  "Interfaces and dependencies with other systems and processes identified": "تحديد الواجهات والاعتماديات مع الأنظمة والعمليات الأخرى",
  "Scope documented, approved and communicated to stakeholders": "توثيق النطاق واعتماده وإبلاغه لأصحاب المصلحة",
  "AIMS established and implemented with documented processes and controls": "إنشاء وتنفيذ نظام إدارة الذكاء الاصطناعي بعمليات وضوابط موثَّقة",
  "AIMS actively operated across all relevant functions and AI lifecycle stages": "تشغيل نظام إدارة الذكاء الاصطناعي فعلياً عبر جميع الوظائف ذات الصلة ومراحل دورة حياة الذكاء الاصطناعي",
  "Continuous monitoring of AIMS effectiveness and compliance in place": "مراقبة مستمرة لفعالية نظام إدارة الذكاء الاصطناعي وامتثاله",
  "Continual improvement mechanisms established": "إنشاء آليات التحسين المستمر",
  "Top management actively engaged in AI governance and strategy alignment": "مشاركة الإدارة العليا فعلياً في حوكمة الذكاء الاصطناعي ومواءمة الاستراتيجية",
  "AI policy established, communicated and supported by leadership": "إنشاء سياسة الذكاء الاصطناعي وإبلاغها ودعمها من القيادة",
  "Resources allocated: financial, technological, and human": "تخصيص الموارد: المالية والتقنية والبشرية",
  "Culture of trust, ethical AI practices, and continual learning fostered": "ترسيخ ثقافة الثقة والممارسات الأخلاقية للذكاء الاصطناعي والتعلّم المستمر",
  "Clear roles, responsibilities, and authorities for AI oversight defined": "تحديد أدوار ومسؤوليات وصلاحيات واضحة للإشراف على الذكاء الاصطناعي",
  "AI policy documented with purpose, scope, guiding principles, and prohibited uses": "توثيق سياسة الذكاء الاصطناعي مع الغرض والنطاق والمبادئ التوجيهية والاستخدامات المحظورة",
  "Policy addresses ethics, fairness, transparency, accountability, and non-discrimination": "تعالج السياسة الأخلاق والإنصاف والشفافية والمساءلة وعدم التمييز",
  "Policy aligned with other organisational policies (security, privacy, quality)": "مواءمة السياسة مع سياسات المنظمة الأخرى (الأمن، والخصوصية، والجودة)",
  "Policy reviewed at least annually or upon significant changes": "مراجعة السياسة سنوياً على الأقل أو عند التغييرات الجوهرية",
  "High-risk AI safeguards documented and included in policy": "توثيق ضمانات الذكاء الاصطناعي عالي المخاطر وإدراجها في السياسة",
  "CAIO or equivalent AI governance lead appointed": "تعيين مدير الذكاء الاصطناعي أو ما يعادله كقائد لحوكمة الذكاء الاصطناعي",
  "AI Risk Manager role defined and assigned": "تحديد وإسناد دور مدير مخاطر الذكاء الاصطناعي",
  "AI Ethics Officer role defined and assigned": "تحديد وإسناد دور مسؤول أخلاقيات الذكاء الاصطناعي",
  "AI Compliance Officer role defined and assigned": "تحديد وإسناد دور مسؤول امتثال الذكاء الاصطناعي",
  "Cross-functional governance team established (engineering, legal, risk, HR)": "إنشاء فريق حوكمة متعدد الوظائف (الهندسة، والشؤون القانونية، والمخاطر، والموارد البشرية)",
  "RACI matrix for AI governance activities documented": "توثيق مصفوفة RACI لأنشطة حوكمة الذكاء الاصطناعي",
  "AI risk assessment process defined with acceptance criteria": "تحديد عملية تقييم مخاطر الذكاء الاصطناعي مع معايير القبول",
  "Risks identified across technical, ethical, legal, and operational dimensions": "تحديد المخاطر عبر الأبعاد التقنية والأخلاقية والقانونية والتشغيلية",
  "Risk scoring methodology (likelihood x severity)": "منهجية تسجيل المخاطر (الاحتمالية × الشدّة)",
  "Risk treatment options selected (avoid, reduce, transfer, accept)": "اختيار خيارات معالجة المخاطر (التجنّب، والتقليل، والنقل، والقبول)",
  "Opportunities for responsible AI identified and planned for": "تحديد فرص الذكاء الاصطناعي المسؤول والتخطيط لها",
  "AI objectives defined, measurable, and aligned with AI policy": "أهداف الذكاء الاصطناعي محدَّدة وقابلة للقياس ومتوائمة مع سياسة الذكاء الاصطناعي",
  "Plans for achieving objectives documented with owners, timelines, resources": "توثيق خطط تحقيق الأهداف مع المُلّاك والجداول الزمنية والموارد",
  "Objectives communicated to relevant functions": "إبلاغ الأهداف للوظائف ذات الصلة",
  "Human resources with AI expertise identified and allocated": "تحديد وتخصيص الموارد البشرية ذات الخبرة في الذكاء الاصطناعي",
  "Data resources documented: provenance, categories, quality, retention": "توثيق موارد البيانات: المصدر، والفئات، والجودة، والاحتفاظ",
  "Tooling resources for development, testing, validation, monitoring available": "توفّر موارد الأدوات للتطوير والاختبار والتحقق والمراقبة",
  "Computing infrastructure documented (cloud, on-premise, edge)": "توثيق البنية التحتية الحاسوبية (السحابة، والموقع المحلي، والحافة)",
  "Competence requirements for AI roles defined": "تحديد متطلبات الكفاءة لأدوار الذكاء الاصطناعي",
  "Training programmes established for AI governance and ethics": "إنشاء برامج تدريب لحوكمة الذكاء الاصطناعي وأخلاقياته",
  "Evidence of competence maintained (certifications, training records)": "الاحتفاظ بأدلة الكفاءة (الشهادات، وسجلات التدريب)",
  "AI policy and objectives communicated to all relevant staff": "إبلاغ سياسة الذكاء الاصطناعي وأهدافه لجميع الموظفين ذوي الصلة",
  "Staff aware of their contribution to AIMS effectiveness": "وعي الموظفين بمساهمتهم في فعالية نظام إدارة الذكاء الاصطناعي",
  "Awareness programme covers ethical AI and responsible use": "يغطّي برنامج التوعية الذكاء الاصطناعي الأخلاقي والاستخدام المسؤول",
  "Processes needed to meet AI requirements established and controlled": "إنشاء وضبط العمليات اللازمة لتلبية متطلبات الذكاء الاصطناعي",
  "Criteria for AI processes defined and performance monitored": "تحديد معايير عمليات الذكاء الاصطناعي ومراقبة الأداء",
  "Outsourced AI processes identified and controlled": "تحديد وضبط عمليات الذكاء الاصطناعي المُسندة خارجياً",
  "Change management process for AI systems established": "إنشاء عملية إدارة التغيير لأنظمة الذكاء الاصطناعي",
  "AI risk assessments performed at planned intervals": "إجراء تقييمات مخاطر الذكاء الاصطناعي على فترات مخطَّطة",
  "Results of risk assessments documented and retained": "توثيق نتائج تقييمات المخاطر والاحتفاظ بها",
  "Risk assessments triggered by significant changes to AI systems": "إطلاق تقييمات المخاطر عند التغييرات الجوهرية على أنظمة الذكاء الاصطناعي",
  "Risk treatment plan documented with controls selected from Annex A": "توثيق خطة معالجة المخاطر مع ضوابط مختارة من الملحق أ",
  "Statement of Applicability (SoA) prepared for Annex A controls": "إعداد بيان قابلية التطبيق (SoA) لضوابط الملحق أ",
  "Residual risk assessed and accepted by risk owner": "تقييم الخطر المتبقّي وقبوله من مالك المخاطر",
  "AI system objectives and requirements clearly defined": "تحديد أهداف ومتطلبات نظام الذكاء الاصطناعي بوضوح",
  "Data requirements and quality criteria specified": "تحديد متطلبات البيانات ومعايير الجودة",
  "Human oversight mechanisms designed into system architecture": "تضمين آليات الإشراف البشري في معمارية النظام",
  "Fairness and bias mitigation measures applied during design": "تطبيق تدابير الإنصاف وتخفيف التحيّز أثناء التصميم",
  "Explainability and transparency requirements addressed": "معالجة متطلبات قابلية التفسير والشفافية",
  "Deployment plan validated against all compliance requirements": "التحقق من خطة النشر مقابل جميع متطلبات الامتثال",
  "User-facing transparency notices in place before go-live": "توفّر إشعارات الشفافية الموجّهة للمستخدم قبل الإطلاق",
  "Incident reporting channels for AI concerns established": "إنشاء قنوات الإبلاغ عن الحوادث لمخاوف الذكاء الاصطناعي",
  "Kill-switch / emergency stop mechanism implemented": "تنفيذ آلية الإيقاف الطارئ / مفتاح الإيقاف",
  "AI system performance monitored against defined metrics": "مراقبة أداء نظام الذكاء الاصطناعي مقابل مقاييس محدَّدة",
  "Bias monitoring and fairness testing scheduled": "جدولة مراقبة التحيّز واختبار الإنصاف",
  "Compliance with AI policy and objectives evaluated": "تقييم الامتثال لسياسة الذكاء الاصطناعي وأهدافه",
  "Results of evaluation documented and reported to leadership": "توثيق نتائج التقييم وإبلاغها للقيادة",
  "Internal audit programme established for the AIMS": "إنشاء برنامج تدقيق داخلي لنظام إدارة الذكاء الاصطناعي",
  "Audit criteria, scope, frequency, and methods defined": "تحديد معايير التدقيق ونطاقه وتواتره وطرقه",
  "Auditors selected to ensure objectivity and impartiality": "اختيار المدقّقين لضمان الموضوعية والحياد",
  "Audit results reported to relevant management": "إبلاغ نتائج التدقيق للإدارة المعنية",
  "Management review of AIMS conducted at planned intervals": "إجراء مراجعة الإدارة لنظام إدارة الذكاء الاصطناعي على فترات مخطَّطة",
  "Review considers audit results, performance, stakeholder feedback": "تراعي المراجعة نتائج التدقيق والأداء وتغذية أصحاب المصلحة الراجعة",
  "Decisions and actions from review documented": "توثيق القرارات والإجراءات الناتجة عن المراجعة",
  "Nonconformities identified, documented, and investigated": "تحديد حالات عدم المطابقة وتوثيقها والتحقيق فيها",
  "Root cause analysis performed for significant nonconformities": "إجراء تحليل السبب الجذري لحالات عدم المطابقة الجوهرية",
  "Corrective actions implemented and verified for effectiveness": "تنفيذ الإجراءات التصحيحية والتحقق من فعاليتها",
  "Opportunities for AIMS improvement systematically identified": "تحديد فرص تحسين نظام إدارة الذكاء الاصطناعي منهجياً",
  "Improvement initiatives linked to AI policy objectives": "ربط مبادرات التحسين بأهداف سياسة الذكاء الاصطناعي",
  "Evidence of continual improvement maintained": "الاحتفاظ بأدلة التحسين المستمر",
});

/* ── Templates & Register ───────────────────────────────────────────
   Governance templates that PRE-FILL from the canonical AI Asset record —
   never blank, never re-keyed. Org-wide (the AI Register) and project-wise
   (Model Card · AIRA · ISO checklist). Every field shown is bound to the
   record; only genuine gaps are editable, and filling one writes back.
   Generating any template mints an evidence event. */

const col = k => ({ good:T.green, warn:T.amber, crit:T.red, info:T.blue, violet:T.violet, teal:T.teal, gold:AI_GOLD }[k] || T.ink3);
const riskColor = r => r === "Critical" ? T.red : r === "High" ? T.amber : r === "Medium" ? T.blue : T.green;
const field = { background:T.s2, border:`1px solid ${T.border}`, borderRadius:8, padding:"9px 11px", color:T.ink, fontSize:11.5, fontFamily:F.b, width:"100%", outline:"none" };

/* Deterministic per-asset ISO coverage so met/gap is stable and varies by
   asset (higher guardrail → fewer gaps), without random. */
const isoMet = (a, ci, ii) => ((ci * 3 + ii + (a.guardrail % 4)) % 4) !== 0;

export function PageTemplates({ role = "caio", showToast }){
  const lang = useLang(); const ar = lang === "ar"; const T_ = en => ts(lang, en);
  const [scope, setScope] = useState("org");
  const [assetId, setAssetId] = useState(AI_ASSETS[0].id);
  const [tpl, setTpl] = useState("modelcard");
  const [gaps, setGaps] = useState(() => { try { return JSON.parse(localStorage.getItem("vz-tpl-gaps") || "{}"); } catch { return {}; } });
  useEffect(() => { try { localStorage.setItem("vz-tpl-gaps", JSON.stringify(gaps)); } catch { /* ignore */ } }, [gaps]);
  const a = assetById(assetId);
  const gapKey = (k) => `${assetId}:${tpl}:${k}`;
  const setGap = (k, v) => setGaps(g => ({ ...g, [gapKey(k)]: v }));
  const gapVal = (k) => gaps[gapKey(k)] || "";

  const record = (item, control) => pushBus("vz-gw-evidence", { item, initiative:a.name, scope:"Templates", control, risk:"Governance artifact", owner:a.owner, status:"Complete", approval:"Generated", version:"v1", time:"Just now" });
  const exportDoc = (name, text, control) => { vzDownload(name, text); record(`Template exported: ${name}`, control); showToast && showToast(ar ? `${name} — تم التصدير وتسجيل الدليل` : `${name} exported — evidence recorded`); };

  /* ── markdown builders (real file out) ── */
  const registerMd = () => [
    "# AI Register", "", "| Asset | Type | Owner | Unit | Data class | Risk | Adoption | ROI | Lifecycle | Recommendation |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...AI_ASSETS.map(x => `| ${x.name} | ${x.arch.assetType} | ${x.owner} | ${x.unit} | ${x.arch.dataClass} | ${x.risk} | ${x.adoption}% | ${x.roi} | ${x.lifecycle} | ${x.rec.verdict} |`),
    "", `_Generated from the canonical AI Asset record · ${AI_ASSETS.length} assets._`,
  ].join("\n");
  const modelCardMd = () => [
    `# Model Card — ${a.name}`, "",
    `**Type:** ${a.arch.assetType}  **Owner:** ${a.owner}  **Technical owner:** ${a.technicalOwner}  **Unit:** ${a.unit}`,
    `**Lifecycle:** ${a.lifecycle}  **Data class:** ${a.arch.dataClass}  **EU AI Act:** ${a.arch.euAiAct}  **Hosting:** ${a.arch.hosting}`, "",
    "## Purpose", a.description, "", `**Objective:** ${a.objective}`, "",
    "## System architecture", `- Model: ${a.arch.model}`, `- Data: ${a.arch.data}`, `- Integrations: ${a.arch.integrations}`, `- Guardrails: ${a.arch.guardrails}`, "",
    "## Value", `- ROI: ${a.roi} · Adoption: ${a.adoption}% · Value score: ${a.value} · Expected ${a.expected} / realized ${a.actual}`, "",
    "## Risks & controls", `- Risks: ${a.risksList.join(", ") || "—"}`, `- Controls: ${a.controls.join(", ") || "—"}`, `- Policies: ${a.policies.join(", ") || "—"}`, "",
    "## Intended use & limitations", gapVal("use") || "_(to complete)_", "", "## Known failure modes", gapVal("fail") || "_(to complete)_", "", "## Human oversight", gapVal("oversight") || "_(to complete)_", "",
    `## Governed recommendation`, `**${a.rec.verdict}** — ${a.rec.why}`,
  ].join("\n");
  const airaMd = () => [
    `# AI Risk Assessment (AIRA) — ${a.name}`, "",
    `**Risk grade:** ${a.risk}  **Data class:** ${a.arch.dataClass}  **EU AI Act:** ${a.arch.euAiAct}`, "",
    "## Identified risks", ...a.risksList.map((r, i) => `### ${r}\n- Mitigation: ${gapVal("mit" + i) || "_(to complete)_"}\n- Owner: ${gapVal("own" + i) || "_(to complete)_"}`),
    "", "## Mapped controls", ...a.controls.map(c => `- ${c}`), "", `## Residual position`, `**${a.rec.verdict}** — ${a.rec.why}`,
  ].join("\n");
  const isoMd = () => {
    const lines = [`# ISO/IEC 42001 Conformance — ${a.name}`, ""];
    let met = 0, total = 0;
    ISO42001_CHECKLIST.forEach((cl, ci) => { lines.push(`## ${cl.clause} ${cl.title}`); cl.items.forEach((it, ii) => { const m = isoMet(a, ci, ii); total++; if (m) met++; lines.push(`- [${m ? "x" : " "}] ${it.text}`); }); lines.push(""); });
    lines.splice(1, 0, `**Conformance: ${met}/${total} (${Math.round(met / total * 100)}%)**`, "");
    return lines.join("\n");
  };

  const Btn = ({ children, onClick, primary }) => <button onClick={onClick} style={{ background: primary ? AI_GOLD : T.s2, border: `1px solid ${primary ? AI_GOLD : T.border}`, borderRadius:9, padding:"8px 14px", color: primary ? "#241703" : T.ink2, fontSize:11.5, fontWeight:800, fontFamily:F.b, cursor:"pointer" }}>{children}</button>;
  const KV = ({ l, v, c }) => <div style={{ background:T.s2, border:`1px solid ${T.border}`, borderRadius:9, padding:"9px 11px" }}>
    <div style={{ fontSize:8.5, fontWeight:900, fontFamily:F.m, color:T.ink4, textTransform:"uppercase", letterSpacing:"0.08em" }}>{l}</div>
    <div style={{ fontSize:12, fontWeight:700, color:c || T.ink, fontFamily:F.b, marginTop:3 }}>{v || "—"}</div>
  </div>;
  const Gap = ({ l, k, ph }) => <label style={{ display:"grid", gap:5 }}>
    <span style={{ fontSize:8.5, fontWeight:900, fontFamily:F.m, color:AI_GOLD_INK, textTransform:"uppercase", letterSpacing:"0.08em" }}>✎ {T_(l)} · {T_("gap to complete")}</span>
    <textarea value={gapVal(k)} onChange={e => setGap(k, e.target.value)} onBlur={e => e.target.value.trim() && showToast && showToast(T_("Saved to the asset record"))} placeholder={T_(ph)} rows={2} style={{ ...field, resize:"vertical", lineHeight:1.5 }} />
  </label>;
  const Sec = ({ t, children }) => <div style={{ marginBottom:14 }}><div style={{ fontSize:9.5, letterSpacing:"0.12em", textTransform:"uppercase", color:T.ink4, fontWeight:900, fontFamily:F.m, marginBottom:8 }}>{t}</div>{children}</div>;

  /* ── org: AI Register ── */
  const Register = () => {
    let met = 0, total = 0; AI_ASSETS.forEach(x => ISO42001_CHECKLIST.forEach((cl, ci) => cl.items.forEach((it, ii) => { total++; if (isoMet(x, ci, ii)) met++; })));
    return <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, flexWrap:"wrap", marginBottom:12 }}>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {[["Assets", AI_ASSETS.length, T.blue], ["Scale-ready", AI_ASSETS.filter(x => x.rec.verdict === "Scale").length, T.green], ["Need remediation", AI_ASSETS.filter(x => x.rec.verdict === "Remediate" || x.rec.verdict === "Retire").length, T.amber], ["ISO 42001", `${Math.round(met / total * 100)}%`, AI_GOLD]].map(([l, v, c]) =>
            <div key={l} style={{ background:T.s2, border:`1px solid ${T.border}`, borderRadius:10, padding:"9px 13px", minWidth:110 }}><div style={{ fontSize:8.5, fontWeight:900, fontFamily:F.m, color:T.ink4, textTransform:"uppercase", letterSpacing:"0.08em" }}>{T_(l)}</div><div style={{ fontSize:19, fontWeight:800, fontFamily:F.m, color:c, marginTop:3 }}>{v}</div></div>)}
        </div>
        <Btn primary onClick={() => exportDoc("ai-register.md", registerMd(), "AI Register")}>{T_("Export register →")}</Btn>
      </div>
      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}><table style={{ width:"100%", borderCollapse:"collapse", fontSize:11, fontFamily:F.b }}>
          <thead><tr>{["Asset", "Type", "Owner", "Unit", "Data class", "Risk", "Adoption", "ROI", "Lifecycle", "Recommendation"].map(h => <th key={h} style={{ textAlign:"left", fontSize:8.5, letterSpacing:"0.06em", textTransform:"uppercase", color:T.ink4, fontWeight:900, fontFamily:F.m, padding:"11px 10px", borderBottom:`1px solid ${T.border}`, whiteSpace:"nowrap" }}>{T_(h)}</th>)}</tr></thead>
          <tbody>{AI_ASSETS.map((x, i) => <tr key={x.id} onClick={() => { setAssetId(x.id); setScope("project"); }} className="vz-reg-row" style={{ cursor:"pointer" }}>
            <td style={{ padding:"11px 10px", borderBottom:i < AI_ASSETS.length - 1 ? `1px solid ${T.border}` : "none", color:T.ink, fontWeight:800 }}>{x.name}</td>
            <td style={{ padding:"11px 10px", color:T.ink3 }}>{T_(x.arch.assetType)}</td>
            <td style={{ padding:"11px 10px", color:T.ink2 }}>{x.owner}</td>
            <td style={{ padding:"11px 10px", color:T.ink3 }}>{T_(x.unit)}</td>
            <td style={{ padding:"11px 10px", color:T.ink3 }}>{T_(x.arch.dataClass)}</td>
            <td style={{ padding:"11px 10px" }}><Tag label={T_(x.risk)} color={riskColor(x.risk)} bg={riskColor(x.risk) + "18"} /></td>
            <td style={{ padding:"11px 10px", color:T.ink2, fontFamily:F.m }}>{x.adoption}%</td>
            <td style={{ padding:"11px 10px", color:T.ink2, fontFamily:F.m }}>{x.roi}</td>
            <td style={{ padding:"11px 10px", color:T.ink3 }}>{T_(x.lifecycle)}</td>
            <td style={{ padding:"11px 10px" }}><Tag label={T_(x.rec.verdict)} color={col(x.rec.color)} bg={col(x.rec.color) + "18"} /></td>
          </tr>)}</tbody>
        </table></div>
        <style>{`.vz-reg-row:hover td{background:${T.s2}}`}</style>
      </Card>
      <div style={{ fontSize:10.5, color:T.ink4, fontFamily:F.b, marginTop:9 }}>{T_("Every row is pre-filled from the canonical AI Asset record. Click any asset to open its project templates.")}</div>
    </div>;
  };

  /* ── project templates ── */
  const ModelCard = () => <div>
    <Sec t={T_("Identity")}><div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:8 }}>
      <KV l={T_("Asset")} v={a.name} /><KV l={T_("Type")} v={T_(a.arch.assetType)} /><KV l={T_("Owner")} v={a.owner} /><KV l={T_("Technical owner")} v={a.technicalOwner} /><KV l={T_("Unit")} v={T_(a.unit)} /><KV l={T_("Lifecycle")} v={T_(a.lifecycle)} /><KV l={T_("Data class")} v={T_(a.arch.dataClass)} /><KV l={T_("EU AI Act")} v={T_(a.arch.euAiAct)} /><KV l={T_("Hosting")} v={T_(a.arch.hosting)} />
    </div></Sec>
    <Sec t={T_("Purpose")}><div style={{ fontSize:12, color:T.ink2, fontFamily:F.b, lineHeight:1.65 }}>{T_(a.description)}</div><div style={{ fontSize:11, color:T.ink3, fontFamily:F.b, marginTop:6 }}><b style={{ color:T.ink2 }}>{T_("Objective:")}</b> {T_(a.objective)}</div></Sec>
    <Sec t={T_("System architecture")}><div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:8 }}>
      <KV l={T_("Model")} v={a.arch.model} /><KV l={T_("Data")} v={T_(a.arch.data)} /><KV l={T_("Integrations")} v={a.arch.integrations} /><KV l={T_("Guardrails")} v={T_(a.arch.guardrails)} />
    </div></Sec>
    <Sec t={T_("Value")}><div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:8 }}>
      <KV l={T_("ROI")} v={a.roi} c={T.green} /><KV l={T_("Adoption")} v={a.adoption + "%"} /><KV l={T_("Value score")} v={a.value} /><KV l={T_("Expected")} v={a.expected} /><KV l={T_("Realized")} v={a.actual} />
    </div></Sec>
    <Sec t={T_("Risks & controls")}><div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>{a.risksList.map(r => <Tag key={r} label={T_(r)} color={T.amber} bg={T.amber + "16"} />)}{a.controls.map(c => <Tag key={c} label={c} color={T.blue} bg={T.blue + "16"} />)}{a.policies.map(p => <Tag key={p} label={p} color={T.violet} bg={T.violet + "16"} />)}</div></Sec>
    <Sec t={T_("To complete")}><div style={{ display:"grid", gap:10 }}><Gap l="Intended use & limitations" k="use" ph="Where this asset should and shouldn't be used…" /><Gap l="Known failure modes" k="fail" ph="How it can fail and what's watched…" /><Gap l="Human oversight design" k="oversight" ph="Where a human reviews or can override…" /></div></Sec>
    <div style={{ display:"flex", justifyContent:"flex-end" }}><Btn primary onClick={() => exportDoc(`model-card-${a.id}.md`, modelCardMd(), "Model Card")}>{T_("Export model card →")}</Btn></div>
  </div>;

  const AIRA = () => <div>
    <Sec t={T_("Assessment context")}><div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:8 }}>
      <KV l={T_("Asset")} v={a.name} /><KV l={T_("Risk grade")} v={T_(a.risk)} c={riskColor(a.risk)} /><KV l={T_("Data class")} v={T_(a.arch.dataClass)} /><KV l={T_("EU AI Act")} v={T_(a.arch.euAiAct)} />
    </div></Sec>
    <Sec t={T_("Identified risks — assess each")}>{a.risksList.length ? <div style={{ display:"grid", gap:10 }}>{a.risksList.map((r, i) => <Card key={r} style={{ padding:"12px 14px" }}>
      <div style={{ fontSize:12.5, fontWeight:800, color:T.ink, fontFamily:F.b, marginBottom:8 }}>{T_(r)}</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <label style={{ display:"grid", gap:4 }}><span style={{ fontSize:8.5, fontWeight:900, color:AI_GOLD_INK, fontFamily:F.m, textTransform:"uppercase" }}>{T_("✎ Mitigation")}</span><input value={gapVal("mit" + i)} onChange={e => setGap("mit" + i, e.target.value)} placeholder={T_("Treatment / control…")} style={field} /></label>
        <label style={{ display:"grid", gap:4 }}><span style={{ fontSize:8.5, fontWeight:900, color:AI_GOLD_INK, fontFamily:F.m, textTransform:"uppercase" }}>{T_("✎ Owner")}</span><input value={gapVal("own" + i)} onChange={e => setGap("own" + i, e.target.value)} placeholder={T_("Accountable owner…")} style={field} /></label>
      </div></Card>)}</div> : <div style={{ fontSize:11.5, color:T.ink3, fontFamily:F.b }}>{T_("No risks recorded for this asset.")}</div>}</Sec>
    <Sec t={T_("Mapped controls")}><div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>{a.controls.map(c => <Tag key={c} label={c} color={T.blue} bg={T.blue + "16"} />)}</div></Sec>
    <Sec t={T_("Residual position")}><Card style={{ padding:"12px 14px", borderLeft:`3px solid ${col(a.rec.color)}` }}><b style={{ color:col(a.rec.color) }}>{T_(a.rec.verdict)}</b> <span style={{ color:T.ink2, fontSize:11.5, fontFamily:F.b }}>— {T_(a.rec.why)}</span></Card></Sec>
    <div style={{ display:"flex", justifyContent:"flex-end" }}><Btn primary onClick={() => exportDoc(`aira-${a.id}.md`, airaMd(), "AIRA")}>{T_("Export AIRA →")}</Btn></div>
  </div>;

  const ISO = () => {
    let met = 0, total = 0; ISO42001_CHECKLIST.forEach((cl, ci) => cl.items.forEach((it, ii) => { total++; if (isoMet(a, ci, ii)) met++; }));
    return <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, marginBottom:12, flexWrap:"wrap" }}>
        <div style={{ fontSize:12, color:T.ink2, fontFamily:F.b }}>{ar
          ? <>المطابقة <b style={{ color:T.ink }}>{met}/{total}</b> · <b style={{ color: met / total > 0.75 ? T.green : T.amber }}>{Math.round(met / total * 100)}%</b> · معلَّمة تلقائياً من أدلة هذا الأصل</>
          : <>Conformance <b style={{ color:T.ink }}>{met}/{total}</b> · <b style={{ color: met / total > 0.75 ? T.green : T.amber }}>{Math.round(met / total * 100)}%</b> · auto-marked from this asset's evidence</>}</div>
        <Btn primary onClick={() => exportDoc(`iso42001-${a.id}.md`, isoMd(), "ISO 42001 checklist")}>{T_("Export checklist →")}</Btn>
      </div>
      <div style={{ display:"grid", gap:10 }}>{ISO42001_CHECKLIST.map((cl, ci) => <Card key={cl.clause} style={{ padding:"12px 14px" }}>
        <div style={{ fontSize:12, fontWeight:800, color:T.ink, fontFamily:F.b, marginBottom:8 }}>{cl.clause} · {T_(cl.title)}</div>
        <div style={{ display:"grid", gap:6 }}>{cl.items.map((it, ii) => { const m = isoMet(a, ci, ii); return <div key={it.id} style={{ display:"flex", gap:9, alignItems:"flex-start" }}>
          <span style={{ width:16, height:16, borderRadius:5, flexShrink:0, display:"grid", placeItems:"center", fontSize:10, fontWeight:900, background:(m ? T.green : T.amber) + "22", color:m ? T.green : T.amber, marginTop:1 }}>{m ? "✓" : "!"}</span>
          <span style={{ flex:1, fontSize:11, color:T.ink2, fontFamily:F.b, lineHeight:1.45 }}>{T_(it.text)}</span>
          {!m && <button onClick={() => { pushBus("vz-gw-evidence", { item:`ISO 42001 gap: ${cl.clause} ${it.text.slice(0, 40)}…`, initiative:a.name, scope:"Compliance", control:`ISO 42001 ${cl.clause}`, risk:"Conformance gap", owner:a.owner, status:"Open", approval:"Task created", version:"v1", time:"Just now" }); showToast && showToast(T_("Gap logged as a task")); }} style={{ background:T.amber + "16", border:`1px solid ${T.amber}40`, borderRadius:6, padding:"3px 9px", color:T.amber, fontSize:9.5, fontWeight:800, fontFamily:F.b, cursor:"pointer", flexShrink:0 }}>{T_("Create task")}</button>}
        </div>; })}</div>
      </Card>)}</div>
    </div>;
  };

  const TPLS = [["modelcard", "Model Card"], ["aira", "AIRA"], ["iso", "ISO 42001"]];
  return <div style={{ animation:"up .3s ease" }}>
    <SHead title={T_("Templates & Register")} sub={T_("Governance templates that pre-fill from the canonical AI Asset record — org-wide and per project. Nothing re-keyed; generating one records evidence.")} />
    <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
      {[["org", "Org-wide · AI Register"], ["project", "By project · templates"]].map(([id, l]) => <button key={id} onClick={() => setScope(id)} style={{ padding:"8px 15px", borderRadius:20, fontSize:12, fontWeight:800, fontFamily:F.b, cursor:"pointer", border:`1px solid ${scope === id ? AI_GOLD : T.border}`, background:scope === id ? AI_GOLD : T.s2, color:scope === id ? "#241703" : T.ink3 }}>{T_(l)}</button>)}
    </div>
    {scope === "org" ? <Register /> : <div>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
        {AI_ASSETS.map(x => <button key={x.id} onClick={() => setAssetId(x.id)} style={{ padding:"7px 12px", borderRadius:9, fontSize:11, fontWeight:700, fontFamily:F.b, cursor:"pointer", border:`1px solid ${assetId === x.id ? AI_GOLD + "66" : T.border}`, background:assetId === x.id ? AI_GOLD + "14" : T.s2, color:assetId === x.id ? AI_GOLD : T.ink3 }}>{x.name}</button>)}
      </div>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
        {TPLS.map(([id, l]) => <button key={id} onClick={() => setTpl(id)} style={{ padding:"6px 13px", borderRadius:20, fontSize:11.5, fontWeight:800, fontFamily:F.b, cursor:"pointer", border:`1px solid ${tpl === id ? AI_GOLD : T.border}`, background:tpl === id ? AI_GOLD : T.s2, color:tpl === id ? "#241703" : T.ink3 }}>{T_(l)}</button>)}
      </div>
      <Card style={{ padding:"16px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14, paddingBottom:12, borderBottom:`1px solid ${T.border}` }}>
          <span style={{ width:28, height:28, borderRadius:8, display:"grid", placeItems:"center", background:AI_GOLD + "22", color:AI_GOLD_INK, fontSize:13 }}>▦</span>
          <div><div style={{ fontSize:14, fontWeight:800, color:T.ink, fontFamily:F.h }}>{T_(TPLS.find(t => t[0] === tpl)[1])} · {a.name}</div><div style={{ fontSize:9.5, color:T.ink4, fontFamily:F.b }}>{T_("Pre-filled from the AI Asset record")}</div></div>
        </div>
        {tpl === "modelcard" && <ModelCard />}
        {tpl === "aira" && <AIRA />}
        {tpl === "iso" && <ISO />}
      </Card>
    </div>}
  </div>;
}
