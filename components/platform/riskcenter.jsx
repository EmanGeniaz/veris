"use client";

import { readBus, pushBus } from "@/lib/bus";
import { Map } from "lucide-react";
import { useState, useEffect } from "react";
import { acInitiatives, riskRegister, kriRegister, AI_GOV_ENGINES, acAssessments } from "@/lib/platform-models";
import { liveResidual, levelFor, riskMath, inherentOf } from "@/lib/risk-engine";
import { T, AI_GOLD, AI_GOLD_INK, ROLES, F, CountUp, Tag, PTag, STag, Bar, Card, SHead } from "./core";
import { PageAISpine } from "./spine";
import { SmartSelect } from "./smartselect";
import { SECURITY_EVENTS } from "@/lib/role-centers";
import { useLang, ts, registerContent } from "@/lib/i18n";

/* Arabic content for the Risk Center (PageRiskCenter + RiskAssessmentCascade)
   and the register/KRI/engine data it renders. Keys are the exact English
   strings; missing keys fall back to English. Reuses house vocabulary already
   registered by the role centers (Treatments, KRIs, Priority, Low/Medium/
   High/Critical, Accept, Action, Status, Model, Framework, Residual, …). */
registerContent({
  // ── chrome / labels ──
  "Initiative": "المبادرة",
  "VerisZone proprietary governance engines · run automatically per initiative": "محرّكات حوكمة مملوكة لفيرِس زون · تعمل تلقائياً لكل مبادرة",
  "Risks on register": "المخاطر في السجل",
  "Critical / high open": "الحرجة/العالية المفتوحة",
  "Treatments in progress": "المعالجات قيد التنفيذ",
  "KRIs breaching": "مؤشّرات المخاطر المتجاوِزة",
  "Risk Register": "سجل المخاطر",
  "Assessments": "التقييمات",
  "Heat Map": "خريطة الحرارة",
  "Residual & Trends": "المتبقّي والاتجاهات",
  "Risk Drift": "انحراف المخاطر",
  "Category": "الفئة",
  "Business unit": "وحدة الأعمال",
  "Business Unit": "وحدة الأعمال",
  "Executive owner": "المالك التنفيذي",
  "Risk owner": "مالك الخطر",
  "Inherent score": "درجة المتأصّل",
  "Residual score": "درجة المتبقّي",
  "Residual math": "حساب المتبقّي",
  "AI recommendation": "توصية الذكاء الاصطناعي",
  "Key risk indicators": "مؤشّرات المخاطر الرئيسية",
  "Related incidents & vulnerabilities": "الحوادث والثغرات ذات الصلة",
  "Assessment history": "سجل التقييمات",
  "Risk Center": "مركز المخاطر",
  "The system of record for every AI risk. Owned once, viewed many times - every risk traces to its initiative, executive owner, controls, frameworks and treatment evidence. ISO 42001 C.8.2 / C.8.3.": "نظام التسجيل لكل مخاطر الذكاء الاصطناعي. يُملَك مرة، ويُعرَض مرات - كل خطر يتتبّع إلى مبادرته ومالكه التنفيذي وضوابطه وأطره وأدلة معالجته. الأيزو 42001 C.8.2 / C.8.3.",
  "Close": "إغلاق",
  "+ New risk": "+ خطر جديد",
  "Register a risk": "سجّل خطراً",
  "Category, unit, owners and framework are governed vocabularies — pick, add or request a value inline. New risks land Open, awaiting assessment.": "الفئة والوحدة والمُلّاك والإطار مفردات مُحوكَمة — اختر أو أضِف أو اطلب قيمة مباشرةً. المخاطر الجديدة تصل بحالة مفتوحة، بانتظار التقييم.",
  "Risk title": "عنوان الخطر",
  "Control framework": "إطار الضوابط",
  "Likelihood (1-5)": "الاحتمالية (1-5)",
  "Impact (1-5)": "الأثر (1-5)",
  "Level": "المستوى",
  "Treatment strategy": "استراتيجية المعالجة",
  "e.g. Model drift on credit engine": "مثال: انحراف النموذج على محرّك الائتمان",
  "Mitigate": "تخفيف",
  "Transfer": "نقل",
  "Avoid": "تجنّب",
  "Register risk": "سجّل الخطر",
  "A risk title is required": "عنوان الخطر مطلوب",
  "View by": "عرض حسب",
  "Executive": "التنفيذي",
  "EU AI Act": "قانون الذكاء الاصطناعي الأوروبي",
  "All": "الكل",
  "Initiative / Unit": "المبادرة / الوحدة",
  "Strategy": "الاستراتيجية",
  "Owner / deadline": "المالك / الموعد النهائي",
  "Inherent risk heat map": "خريطة حرارة المخاطر المتأصّلة",
  "Click a cell to see the risks behind it. Rows are impact, columns likelihood.": "انقر خلية لرؤية المخاطر وراءها. الصفوف هي الأثر، والأعمدة الاحتمالية.",
  "lower likelihood": "احتمالية أدنى",
  "higher likelihood": "احتمالية أعلى",
  "All risks in view": "كل المخاطر في العرض",
  "No risks sit in this cell - the register has nothing at this likelihood and impact.": "لا مخاطر في هذه الخلية - السجل لا يحوي شيئاً عند هذه الاحتمالية والأثر.",
  "Evidence recorded": "الأدلة مُسجَّلة",
  "Start treatment": "ابدأ المعالجة",
  "Mark complete": "حدّد كمكتمل",
  "Inherent vs residual by initiative": "المتأصّل مقابل المتبقّي حسب المبادرة",
  "How far treatment has driven each initiative's exposure down. Click a row to open its risks.": "إلى أي مدى خفّضت المعالجة تعرّض كل مبادرة. انقر صفاً لفتح مخاطره.",
  "Control effectiveness": "فعالية الضوابط",
  "Breaching": "متجاوِز",
  "Within appetite": "ضمن الحد المقبول",
  "Enterprise-level": "على مستوى المؤسسة",
  "Treatment complete": "المعالجة مكتملة",
  "Manage treatment": "أدِر المعالجة",
  // ── governance engines (AI_GOV_ENGINES) ──
  "AI Opportunity Assessment": "تقييم فرص الذكاء الاصطناعي",
  "AI Impact Assessment": "تقييم أثر الذكاء الاصطناعي",
  "AI Risk Assessment": "تقييم مخاطر الذكاء الاصطناعي",
  "AI Security Assessment": "تقييم أمن الذكاء الاصطناعي",
  "AI Privacy Assessment": "تقييم خصوصية الذكاء الاصطناعي",
  "AI Compliance Assessment": "تقييم امتثال الذكاء الاصطناعي",
  "AI Governance Assessment": "تقييم حوكمة الذكاء الاصطناعي",
  "AI Risk Treatment": "معالجة مخاطر الذكاء الاصطناعي",
  "Is this opportunity worth qualifying?": "هل تستحق هذه الفرصة التأهيل؟",
  "Who and what does this system affect?": "من وماذا يؤثّر فيه هذا النظام؟",
  "What can go wrong and how badly?": "ما الذي قد يسوء وإلى أي مدى؟",
  "Can it be attacked or leak data?": "هل يمكن مهاجمته أو تسريب البيانات منه؟",
  "Is personal data processed lawfully?": "هل تُعالَج البيانات الشخصية بشكل قانوني؟",
  "Which frameworks apply and are we covered?": "أي الأطر تنطبق وهل نحن مُغطّون؟",
  "Are ownership, oversight and evidence in place?": "هل الملكية والإشراف والأدلة قائمة؟",
  "Are the risks being driven down?": "هل يجري تخفيض المخاطر؟",
  // ── engine drill hints (ref-code-only hints fall back to English) ──
  "Opportunity record": "سجل الفرصة",
  "Impact drives RSK-001..003": "الأثر يقود RSK-001..003",
  "RSK-001 treatment": "معالجة RSK-001",
  "RSK-002 treatment": "معالجة RSK-002",
  "RSK-005 treatment": "معالجة RSK-005",
  "RSK-008 treatment": "معالجة RSK-008",
  "Governance module": "وحدة الحوكمة",
  "Treatments tab": "علامة المعالجات",
  "Impact drives RSK-004/005": "الأثر يقود RSK-004/005",
  "Security controls": "ضوابط الأمن",
  "EU AI Act row": "صف قانون الذكاء الاصطناعي الأوروبي",
  "Approval gate": "بوابة الاعتماد",
  "Impact record": "سجل الأثر",
  "Privacy record": "سجل الخصوصية",
  "SOX controls": "ضوابط SOX",
  "Impact drives RSK-008/009": "الأثر يقود RSK-008/009",
  "Phase gate": "بوابة المرحلة",
  // ── engine outcomes (acAssessments) ──
  "Qualified: high-volume support workload, $4.8M value hypothesis validated.": "مؤهّل: عبء عمل دعم كبير الحجم، وفرضية قيمة 4.8 مليون دولار مُثبَتة.",
  "Customer-facing GenAI; affects customers and agents; human handoff required.": "ذكاء توليدي موجّه للعملاء؛ يؤثّر في العملاء والوكلاء؛ يلزم تسليم بشري.",
  "3 risks registered (1 Critical bias, 2 High). Inherent 20/25 max.": "3 مخاطر مُسجَّلة (1 تحيّز حرج، 2 عالية). المتأصّل 20/25 كحد أقصى.",
  "Prompt-shield live; red-team evidence pack outstanding (CISO).": "درع الإدخالات فعّال؛ حزمة أدلة الفريق الأحمر معلّقة (CISO).",
  "PII masking at gateway verified; 30-day retention set.": "إخفاء البيانات الشخصية عند البوابة مُتحقَّق منه؛ ضُبِط الاحتفاظ لـ 30 يوماً.",
  "ISO 42001 + EU AI Act mapping complete; Art.9 documentation current.": "اكتمل ربط الأيزو 42001 وقانون الذكاء الاصطناعي الأوروبي؛ توثيق المادة 9 محدَّث.",
  "Owners assigned, HITL configured, evidence flowing. Guardrail 82%.": "المُلّاك مُعيَّنون، وبوابة الإنسان في الحلقة مُهيَّأة، والأدلة متدفّقة. الحاجز 82%.",
  "3 treatments running; bias monitoring live, red-team pack due May 24.": "3 معالجات جارية؛ مراقبة التحيّز فعّالة، وحزمة الفريق الأحمر مستحقة 24 مايو.",
  "Qualified: $7.2M value in decision assurance; board-sponsored.": "مؤهّل: قيمة 7.2 مليون دولار في ضمان القرار؛ برعاية المجلس.",
  "High impact: automated decisions with legal effect on customers (Art.22).": "أثر عالٍ: قرارات آلية ذات أثر قانوني على العملاء (المادة 22).",
  "2 High risks: adverse decision harm, explainability gap.": "خطران عاليان: ضرر القرار السلبي، وفجوة القابلية للتفسير.",
  "Internal model, no external exposure; access controls verified.": "نموذج داخلي، دون تعرّض خارجي؛ ضوابط الوصول مُتحقَّق منها.",
  "Art.22 processing basis documented; disclosure template with Legal.": "أساس معالجة المادة 22 موثّق؛ قالب الإفصاح لدى القانون.",
  "EU AI Act high-risk conformity path open; Art.14 oversight pending.": "مسار مطابقة عالي الخطورة لقانون الذكاء الاصطناعي الأوروبي مفتوح؛ إشراف المادة 14 معلّق.",
  "Human-oversight design record awaiting approval - blocks Testing exit.": "سجل تصميم الإشراف البشري بانتظار الاعتماد - يحجب الخروج من الاختبار.",
  "SHAP explainability in build; HITL review gate planned for Jun 5.": "قابلية تفسير SHAP قيد البناء؛ بوابة مراجعة الإنسان في الحلقة مُخطَّطة لـ 5 يونيو.",
  "Qualified: close-cycle automation, clear SOX-safe value case.": "مؤهّل: أتمتة دورة الإقفال، وحالة قيمة واضحة آمنة لـ SOX.",
  "Internal process impact only; controller review preserves accountability.": "أثر على العملية الداخلية فقط؛ مراجعة المراقب المالي تحفظ المساءلة.",
  "2 Medium risks, both mitigated to residual 4/25.": "خطران متوسطان، كلاهما خُفِّف إلى متبقٍّ 4/25.",
  "No external model calls; SoD enforced at workflow layer.": "لا استدعاءات نماذج خارجية؛ فصل المهام مُنفَّذ في طبقة سير العمل.",
  "No personal data in scope beyond employee IDs; retention compliant.": "لا بيانات شخصية في النطاق عدا معرّفات الموظفين؛ الاحتفاظ ممتثل.",
  "SOX 404 evidence trail automated; monthly sampling in audit pack.": "أثر أدلة SOX 404 مؤتمت؛ أخذ عيّنات شهري في حزمة التدقيق.",
  "Guardrail 91%; evidence complete through Optimization.": "الحاجز 91%؛ الأدلة مكتملة حتى مرحلة التحسين.",
  "All treatments complete; controls monitored, drift low.": "جميع المعالجات مكتملة؛ الضوابط مُراقَبة، والانحراف منخفض.",
  "Qualified with conditions: $2.4M value dependent on adoption.": "مؤهّل بشروط: قيمة 2.4 مليون دولار تعتمد على التبنّي.",
  "Employment-related AI - EU AI Act Annex III high-risk classification.": "ذكاء اصطناعي متعلّق بالتوظيف - تصنيف عالي الخطورة وفق الملحق الثالث لقانون الذكاء الاصطناعي الأوروبي.",
  "2 High risks: profiling and bias in matching. Residual 9-12/25.": "خطران عاليان: التنميط والتحيّز في المطابقة. المتبقّي 9-12/25.",
  "Internal deployment; access limited to People analytics group.": "نشر داخلي؛ الوصول مقصور على مجموعة تحليلات الموارد البشرية.",
  "DPIA overdue - required before any rollout beyond assessment.": "تقييم الأثر متأخر - مطلوب قبل أي طرح يتجاوز التقييم.",
  "Annex III conformity path undecided; fairness workbook incomplete.": "مسار مطابقة الملحق الثالث غير محسوم؛ مصنّف الإنصاف غير مكتمل.",
  "Guardrail 67%; fairness assessment blocks the Governance gate.": "الحاجز 67%؛ تقييم الإنصاف يحجب بوابة الحوكمة.",
  "Treatment plan drafted; starts once fairness workbook lands.": "خطة المعالجة مُصاغة؛ تبدأ فور وصول مصنّف الإنصاف.",
  // ── initiative cascade blockers (acInitiatives.blockedBy) ──
  "CISO prompt-injection evidence due": "أدلة حقن الإدخالات من CISO مستحقة",
  "Human oversight design record awaiting approval": "سجل تصميم الإشراف البشري بانتظار الاعتماد",
  "Fairness assessment workbook incomplete": "مصنّف تقييم الإنصاف غير مكتمل",
  // ── risk titles (riskRegister.title) ──
  "Prompt injection": "حقن الإدخالات",
  "Data leakage via prompts": "تسريب البيانات عبر الإدخالات",
  "Bias and fairness - differential response quality": "التحيّز والإنصاف - جودة استجابة تفاضلية",
  "Adverse decision harm": "ضرر القرار السلبي",
  "Explainability gap": "فجوة القابلية للتفسير",
  "Incorrect journal suggestion": "اقتراح قيد محاسبي خاطئ",
  "Segregation of duties": "الفصل بين المهام",
  "Employee profiling": "تنميط الموظفين",
  "Bias in opportunity matching": "التحيّز في مطابقة الفرص",
  "Unmasked PII in training data": "بيانات شخصية غير مُخفاة في بيانات التدريب",
  "Confident incorrect summaries": "ملخّصات خاطئة بثقة",
  "Unsafe maintenance prediction": "تنبؤ صيانة غير آمن",
  // ── risk categories (riskRegister.category) ──
  "Model Security": "أمن النموذج",
  "Data Privacy": "خصوصية البيانات",
  "Bias & Fairness": "التحيّز والإنصاف",
  "Consumer Harm": "ضرر المستهلك",
  "Transparency": "الشفافية",
  "Financial Accuracy": "الدقة المالية",
  "Process Control": "ضبط العملية",
  "Hallucination": "الهلوسة",
  "Safety": "السلامة",
  "Operational": "تشغيلي",
  // ── business units (riskRegister.unit) ──
  "Customer Operations": "عمليات العملاء",
  "Retail Banking": "المصرفية للأفراد",
  "Finance": "المالية",
  "People": "الموارد البشرية",
  "Security": "الأمن",
  "Operations": "العمليات",
  // ── risk descriptions (riskRegister.desc) ──
  "Adversarial prompts could override system instructions and exfiltrate data or trigger unapproved actions in the copilot.": "قد تتجاوز الإدخالات العدائية تعليمات النظام وتسرّب البيانات أو تُطلق إجراءات غير معتمدة في المساعد.",
  "Agents may paste customer PII into prompts; unmasked data could reach an external model provider.": "قد يلصق الوكلاء بيانات العملاء الشخصية في الإدخالات؛ وقد تصل البيانات غير المُخفاة إلى مزوّد نموذج خارجي.",
  "Bias testing found disproportionate response quality for non-native English speakers. Art.9 risk management must document this.": "وجد اختبار التحيّز جودة استجابة غير متكافئة لغير الناطقين بالإنجليزية كلغة أم. يجب أن توثّق إدارة مخاطر المادة 9 هذا.",
  "An incorrect automated credit decision has direct legal effect on a customer. Human oversight design is still awaiting approval.": "لقرار ائتماني آلي خاطئ أثر قانوني مباشر على العميل. لا يزال تصميم الإشراف البشري بانتظار الاعتماد.",
  "Decision logic is opaque to affected individuals; Art.22 requires a meaningful explanation for automated decisions with legal effect.": "منطق القرار غير شفّاف للأفراد المتأثّرين؛ تتطلّب المادة 22 تفسيراً ذا معنى للقرارات الآلية ذات الأثر القانوني.",
  "A wrong automated journal entry could misstate financials; all suggestions post through controller review.": "قد يؤدّي قيد محاسبي آلي خاطئ إلى تحريف البيانات المالية؛ تُرحَّل جميع الاقتراحات عبر مراجعة المراقب المالي.",
  "The automation must never both propose and approve an entry; role separation is enforced at the workflow layer.": "يجب ألّا تقترح الأتمتة قيداً وتعتمده معاً أبداً؛ فصل الأدوار مُنفَّذ في طبقة سير العمل.",
  "Skill recommendations could constitute employee profiling; a DPIA is required before any rollout beyond assessment.": "قد تشكّل توصيات المهارات تنميطاً للموظفين؛ يلزم تقييم أثر قبل أي طرح يتجاوز التقييم.",
  "Employment-related AI is High-Risk under EU AI Act Annex III; the fairness assessment workbook is incomplete and blocks the phase gate.": "الذكاء الاصطناعي المتعلّق بالتوظيف عالي الخطورة وفق الملحق الثالث لقانون الذكاء الاصطناعي الأوروبي؛ ومصنّف تقييم الإنصاف غير مكتمل ويحجب بوابة المرحلة.",
  "The fraud model's training dataset contains unmasked PII; provenance and bias documentation are incomplete.": "تحتوي مجموعة بيانات تدريب نموذج الاحتيال على بيانات شخصية غير مُخفاة؛ وتوثيق المصدر والتحيّز غير مكتمل.",
  "Summaries can be confidently wrong; decisions made on fabricated content in legal or financial contexts are the exposure.": "قد تكون الملخّصات خاطئة بثقة؛ والتعرّض هو القرارات المبنية على محتوى مُلفَّق في السياقات القانونية أو المالية.",
  "An incorrect prediction could contribute to equipment failure and physical harm; potential High-Risk classification.": "قد يسهم تنبؤ خاطئ في تعطّل المعدّات وضرر مادي؛ تصنيف محتمل عالي الخطورة.",
  // ── treatment actions (riskRegister.treatment.action) ──
  "Gateway prompt-shield detectors, output filtering and red-team evidence pack before pilot exit. CISO evidence due.": "كواشف درع الإدخالات في البوابة، وتصفية المخرجات، وحزمة أدلة الفريق الأحمر قبل الخروج من التجربة. أدلة CISO مستحقة.",
  "Gateway masking for PII and card patterns; retention limited to 30 days; DLP audit weekly.": "إخفاء البيانات الشخصية وأنماط البطاقات في البوابة؛ الاحتفاظ محدود بـ 30 يوماً؛ تدقيق منع تسريب البيانات أسبوعياً.",
  "Continuous bias monitoring with automated alerts; retrain on balanced dataset; fairness guardrails pre-go-live.": "مراقبة تحيّز مستمرة مع تنبيهات آلية؛ إعادة تدريب على مجموعة بيانات متوازنة؛ حواجز إنصاف قبل الإطلاق.",
  "HITL review for all adverse decisions; oversight design record to be approved; quarterly outcome audit.": "مراجعة الإنسان في الحلقة لكل القرارات السلبية؛ اعتماد سجل تصميم الإشراف؛ تدقيق نتائج ربع سنوي.",
  "SHAP explainability layer; automated Art.22 decision explanations; legal disclosure template; model card update.": "طبقة قابلية تفسير SHAP؛ تفسيرات آلية لقرارات المادة 22؛ قالب إفصاح قانوني؛ تحديث بطاقة النموذج.",
  "Controller review gate on every suggested entry; monthly accuracy sampling into the SOX audit trail.": "بوابة مراجعة المراقب المالي على كل قيد مقترح؛ أخذ عيّنات دقّة شهري في أثر تدقيق SOX.",
  "Workflow-enforced role separation; quarterly access review evidence into the audit pack.": "فصل أدوار مُنفَّذ بسير العمل؛ أدلة مراجعة وصول ربع سنوية في حزمة التدقيق.",
  "Complete DPIA; purpose limitation in the data contract; works-council briefing before pilot.": "إكمال تقييم الأثر؛ تحديد الغرض في عقد البيانات؛ إحاطة مجلس العمل قبل التجربة.",
  "Complete the fairness assessment workbook; bias testing across protected attributes; conformity path decision.": "إكمال مصنّف تقييم الإنصاف؛ اختبار التحيّز عبر السمات المحمية؛ قرار مسار المطابقة.",
  "Differential-privacy anonymisation of the training set; performance re-validation; C.7.2 documentation update.": "إخفاء هوية مجموعة التدريب بالخصوصية التفاضلية؛ إعادة التحقق من الأداء؛ تحديث توثيق C.7.2.",
  "Mandatory human review in legal/financial contexts; confidence score displayed; hallucination rate tracked.": "مراجعة بشرية إلزامية في السياقات القانونية/المالية؛ عرض درجة الثقة؛ تتبّع معدّل الهلوسة.",
  "Hard safety threshold override; fail-safe mode for critical equipment; C.8.5 kill-switch deployment.": "تجاوز عتبة سلامة صارم؛ وضع الأمان عند الفشل للمعدّات الحرجة؛ نشر مفتاح الإيقاف C.8.5.",
  // ── AI recommendations (riskRegister.aiRecommendation) ──
  "Hold pilot-exit approval until the red-team evidence lands; detector block-rate is trending down 12% week over week.": "علّق اعتماد الخروج من التجربة حتى وصول أدلة الفريق الأحمر؛ معدّل حجب الكواشف يتراجع 12% أسبوعياً.",
  "Masking now intercepts 100% of card patterns in the log sample - keep weekly DLP audit until two clean cycles.": "يعترض الإخفاء الآن 100% من أنماط البطاقات في عيّنة السجل - أبقِ تدقيق منع تسريب البيانات أسبوعياً حتى دورتين نظيفتين.",
  "Bias alert rate is above threshold - recommend blocking Scale until two consecutive weeks under 2.5 alerts/1k.": "معدّل تنبيهات التحيّز فوق العتبة - يُوصى بحجب التوسّع حتى أسبوعين متتاليين دون 2.5 تنبيه/ألف.",
  "This is the initiative's approval blocker - expedite the human-oversight design record; every week of delay defers $138k of expected value.": "هذا هو حاجز اعتماد المبادرة - عجّل بسجل تصميم الإشراف البشري؛ كل أسبوع تأخير يؤجّل 138 ألف دولار من القيمة المتوقّعة.",
  "Pair the SHAP rollout with the oversight record (RSK-004) - both feed the same Art.14 approval gate.": "اقرِن طرح SHAP بسجل الإشراف (RSK-004) - كلاهما يغذّي بوابة اعتماد المادة 14 نفسها.",
  "Controls are effective and drift is low - no action needed; keep monthly sampling as scale evidence.": "الضوابط فعّالة والانحراف منخفض - لا يلزم إجراء؛ أبقِ أخذ العيّنات الشهري كدليل توسّع.",
  "Include the Q2 access review in the scale decision pack - it is the last SoD evidence item.": "أدرِج مراجعة وصول الربع الثاني في حزمة قرار التوسّع - إنها آخر بند دليل لفصل المهام.",
  "Sequence the DPIA before the fairness workbook completes so both gate artifacts land in the same phase review.": "رتّب تقييم الأثر قبل اكتمال مصنّف الإنصاف كي تصل مخرجات البوابة كلاهما في مراجعة المرحلة نفسها.",
  "This blocker holds the initiative in Assessment - the workbook is 60% complete; two analyst-weeks close it.": "يُبقي هذا الحاجز المبادرة في مرحلة التقييم - المصنّف مكتمل 60%؛ أسبوعا محلّل يُغلقانه.",
  "Onboard this model into AI Central as a governed initiative - it currently runs outside the lifecycle.": "أدرِج هذا النموذج في مركز الذكاء الاصطناعي كمبادرة مُحوكَمة - فهو يعمل حالياً خارج دورة الحياة.",
  "Accepted with controls - revisit if the hallucination KRI worsens for two consecutive months.": "مقبول مع الضوابط - أعِد النظر إذا ساء مؤشّر مخاطر الهلوسة لشهرين متتاليين.",
  "Classify under Annex III now - if High-Risk, the kill-switch becomes a mandatory control, not an enhancement.": "صنّف وفق الملحق الثالث الآن - إذا كان عالي الخطورة، يصبح مفتاح الإيقاف ضابطاً إلزامياً وليس تحسيناً.",
  // ── key risk indicators (kriRegister) ──
  "Guardrail violation rate": "معدّل انتهاك الحواجز",
  "HITL override rate": "معدّل تجاوز الإنسان في الحلقة",
  "Model drift index": "مؤشّر انحراف النموذج",
  "Bias alert rate": "معدّل تنبيهات التحيّز",
  "Evidence coverage": "تغطية الأدلة",
  "Incident response MTTR": "متوسط زمن الاستجابة للحوادث",
  "% of calls": "% من الاستدعاءات",
  "% of decisions": "% من القرارات",
  "per 1k responses": "لكل ألف استجابة",
  "% of controls": "% من الضوابط",
  "hours": "ساعات",
  "improving": "يتحسّن",
  "worsening": "يسوء",
  "stable": "مستقر",
  // ── related security events (SECURITY_EVENTS.title / severity) ──
  "Prompt-injection attempt blocked at gateway": "محاولة حقن إدخالات محجوبة عند البوابة",
  "Model drift → integrity risk on fraud signals": "انحراف النموذج ← خطر سلامة على إشارات الاحتيال",
  "Unauthenticated inference endpoint on staging model": "نقطة نهاية استدلال غير موثّقة على نموذج تجريبي",
  "Verbose error messages leak schema hints": "رسائل أخطاء مُطوَّلة تُسرِّب تلميحات المخطّط",
  "P1 · Critical": "P1 · حرج",
  "P2 · High": "P2 · عالٍ",
});

/* Each CXO owns a slice of the register — the Risk Center opens scoped to
   the risks that executive is accountable for, with a toggle to see all. */
const RISK_OWNER_OF = { ceo:"CEO", ciso:"CISO", cdpo:"CDPO", caio:"CAIO", cro:"CRO", cfo:"CFO", coo:"COO", cio:"CIO" };
const evColor = c => c==="crit"?"#B42318":c==="warn"?"#C99A2E":c==="info"?"#0B4EA2":"#6B7280";

export function RiskAssessmentCascade({setTab,setAiCentralView,fixed}){
  const lang=useLang(); const ar=lang==="ar"; const T_=en=>ts(lang,en);
  const [selId,setSelId]=useState(fixed||acInitiatives[0].id);
  const ini=acInitiatives.find(i=>i.id===selId)||acInitiatives[0];
  const outcomes=acAssessments[selId]||[];
  const stC=st=>st==="Complete"?T.green:st==="In Progress"?T.amber:T.ink4;
  const drillTo=d=>{
    if(d.surface==="compliance")setTab&&setTab("compliance");
    else if(d.surface==="aicentral"){setAiCentralView&&setAiCentralView("controls");setTab&&setTab("aicentral");}
    /* riskcenter drills stay on this surface - the register/treatments tabs hold the detail */
  };
  return <div>
    {!fixed&&<Card style={{padding:"12px 14px",marginBottom:12,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
      <span style={{fontSize:9,color:T.ink4,fontFamily:F.m,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.06em"}}>{T_("Initiative")}</span>
      {acInitiatives.map(i=><button key={i.id} onClick={()=>setSelId(i.id)} style={{background:selId===i.id?AI_GOLD+"20":T.s2,border:`1px solid ${selId===i.id?AI_GOLD+"55":T.border}`,color:selId===i.id?AI_GOLD:T.ink3,borderRadius:7,padding:"5px 10px",fontSize:10,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{i.name}</button>)}
      <span style={{marginLeft:"auto",fontSize:9,color:T.ink4,fontFamily:F.m}}>{T_("VerisZone proprietary governance engines · run automatically per initiative")}</span>
    </Card>}
    <div style={{display:"grid",gap:8}}>
      {AI_GOV_ENGINES.map((e,idx)=>{
        const o=outcomes.find(x=>x.engine===e.code);
        if(!o)return null;
        const c=stC(o.status);
        const scoreCol=o.score>=80?T.green:o.score>=60?T.amber:T.red;
        return <div key={e.code}>
          <Card style={{padding:"13px 15px",border:`1px solid ${c}30`}}>
            <div style={{display:"grid",gridTemplateColumns:"64px 1.2fr 2fr auto",gap:14,alignItems:"center"}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:13,fontWeight:900,fontFamily:F.m,color:AI_GOLD_INK}}>{e.code}</div>
                <div style={{fontSize:16,fontWeight:900,fontFamily:F.m,color:scoreCol,marginTop:3}}>{o.score}</div>
              </div>
              <div>
                <div style={{fontSize:11.5,fontWeight:800,color:T.ink,fontFamily:F.b}}>{T_(e.name)}</div>
                <div style={{fontSize:9,color:T.ink4,fontFamily:F.b,marginTop:2}}>{T_(e.question)}</div>
                <div style={{marginTop:5,display:"flex",gap:6,alignItems:"center"}}><STag s={o.status}/><span style={{fontSize:8.5,color:T.ink4,fontFamily:F.m}}>{ar?"المالك: ":"Owner: "}{e.owner}</span></div>
              </div>
              <div style={{fontSize:10.5,color:T.ink2,fontFamily:F.b,lineHeight:1.6}}>{T_(o.outcome)}</div>
              <button onClick={()=>drillTo(o.drill)} title={T_(o.drill.hint)} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:7,padding:"7px 11px",color:T.ink2,fontSize:9.5,fontWeight:800,fontFamily:F.b,cursor:"pointer",whiteSpace:"nowrap"}}>{T_(o.drill.hint)} {ar?"←":"→"}</button>
            </div>
          </Card>
          {idx<AI_GOV_ENGINES.length-1&&<div style={{textAlign:"center",fontSize:11,color:T.ink4,lineHeight:1,padding:"2px 0"}}>↓</div>}
        </div>;
      })}
    </div>
    {ini.blockedBy&&<div style={{marginTop:10,background:T.redL,border:`1px solid ${T.red}40`,borderRadius:9,padding:"10px 13px",fontSize:11,color:T.ink2,fontFamily:F.b}}><strong style={{color:T.red}}>{ar?"عائق التتابع:":"Cascade blocker:"}</strong> {T_(ini.blockedBy)}</div>}
  </div>;
}

/* ── Risk Center: system of record for every AI risk ──────────────
   Owned once, viewed many times - the initiative Risks tab, dashboards
   and reports render filtered views of this register. Every risk drills
   back to its initiative, executive, controls, frameworks and treatment. */
export function PageRiskCenter({role,tab,setTab,setAiCentralView,showToast}){
  const lang=useLang(); const ar=lang==="ar"; const T_=en=>ts(lang,en);
  const R=ROLES[role]||ROLES.caio;
  const RC_LEGACY={riskcenter:"register",aira:"register",airt:"treatments",aia:"assessments",aiia:"assessments"};
  const [rcTab,setRcTab]=useState(RC_LEGACY[tab]||"register");
  const [dimBy,setDimBy]=useState("Enterprise");
  const [dimVal,setDimVal]=useState("All");
  const myOwner=RISK_OWNER_OF[role];
  const [sel,setSel]=useState(()=>riskRegister.find(r=>r.execOwner===myOwner)||riskRegister[0]);
  const [mineOnly,setMineOnly]=useState(()=>!!myOwner&&riskRegister.some(r=>r.execOwner===myOwner));
  const [cell,setCell]=useState(null);
  const [bumped,setBumped]=useState({});
  const [extra,setExtra]=useState([]);
  const [rHydrated,setRHydrated]=useState(false);
  const [createOpen,setCreateOpen]=useState(false);
  const [rdraft,setRdraft]=useState({title:"",category:"",unit:"",execOwner:"",riskOwner:"",framework:"",likelihood:"3",impact:"3",level:"Medium",strategy:"Mitigate"});
  useEffect(()=>{try{const s=JSON.parse(localStorage.getItem("vz-risks")||"[]");if(Array.isArray(s)&&s.length)setExtra(s);}catch{/* ignore */}setRHydrated(true);},[]);
  useEffect(()=>{if(!rHydrated)return;try{localStorage.setItem("vz-risks",JSON.stringify(extra));}catch{/* ignore */}},[extra,rHydrated]);
  const ALL_RISKS=[...extra,...riskRegister];
  /* Role-scoped working set: this CXO's own risks unless "all" is toggled. */
  const scopedRisks=ALL_RISKS.filter(r=>!mineOnly||!myOwner||r.execOwner===myOwner);
  const setRK=k=>v=>setRdraft(d=>({...d,[k]:v}));
  const createRisk=()=>{
    if(!rdraft.title.trim()){showToast&&showToast(T_("A risk title is required"),"error");return;}
    const n=extra.length+riskRegister.length+1;
    const L=Number(rdraft.likelihood),I=Number(rdraft.impact);
    const rec={id:`RSK-X${String(n).padStart(2,"0")}`,title:rdraft.title.trim(),system:rdraft.title.trim(),category:rdraft.category||"Operational",
      initiativeId:null,unit:rdraft.unit||"Enterprise",execOwner:rdraft.execOwner||"Unassigned",riskOwner:rdraft.riskOwner||"Unassigned",
      likelihood:L,impact:I,residual:L*I<=25?Math.max(1,Math.round(L*I*0.7)):L*I,level:rdraft.level,status:"Open",
      frameworks:rdraft.framework?[rdraft.framework]:[],controls:[],kris:[],desc:"Newly registered risk awaiting assessment and treatment planning.",
      treatment:{strategy:rdraft.strategy,action:"Treatment plan to be defined by the risk owner.",owner:rdraft.riskOwner||"Unassigned",deadline:"TBD",status:"Planned",priority:rdraft.level},
      aiRecommendation:"Assign a risk owner and complete the AI risk assessment to set inherent and residual scores."};
    setExtra([rec,...extra]);setSel(rec);setCreateOpen(false);setRcTab("register");
    setRdraft({title:"",category:"",unit:"",execOwner:"",riskOwner:"",framework:"",likelihood:"3",impact:"3",level:"Medium",strategy:"Mitigate"});
    showToast&&showToast(ar?`أُضيف ${rec.id} إلى سجل المخاطر`:`${rec.id} added to the risk register`);
  };
  const lvColor=l=>l==="Critical"?T.red:l==="High"?T.amber:l==="Medium"?T.blue:T.green;
  const initOf=r=>r.initiativeId?acInitiatives.find(i=>i.id===r.initiativeId):null;
  const openInitiative=()=>{setAiCentralView&&setAiCentralView("initiatives");setTab&&setTab("aicentral");};
  const FW_FAMILIES=["ISO 42001","ISO 27001","EU AI Act","GDPR","NIST AI RMF","SOX","OWASP"];
  const dimValues=dimBy==="Business Unit"?[...new Set(ALL_RISKS.map(r=>r.unit))]
    :dimBy==="Project"?acInitiatives.filter(i=>ALL_RISKS.some(r=>r.initiativeId===i.id)).map(i=>i.name)
    :dimBy==="Executive"?[...new Set(ALL_RISKS.map(r=>r.execOwner))]
    :dimBy==="Model"?[...new Set(ALL_RISKS.map(r=>r.system))]
    :dimBy==="Framework"?FW_FAMILIES.filter(fw=>ALL_RISKS.some(r=>r.frameworks.some(f=>f.startsWith(fw))))
    :[];
  const matchDim=r=>{
    if(dimBy==="Enterprise"||dimVal==="All")return true;
    if(dimBy==="Business Unit")return r.unit===dimVal;
    if(dimBy==="Project"){const ini=initOf(r);return (ini&&ini.name)===dimVal;}
    if(dimBy==="Executive")return r.execOwner===dimVal;
    if(dimBy==="Model")return r.system===dimVal;
    if(dimBy==="Framework")return r.frameworks.some(f=>f.startsWith(dimVal));
    return true;
  };
  const rows=scopedRisks.filter(matchDim);
  const effT=r=>bumped[r.id]||r.treatment.status;
  const advance=r=>{
    const cur=effT(r);
    if(cur==="Complete")return;
    const next=cur==="Planned"?"In Progress":"Complete";
    setBumped(prev=>({...prev,[r.id]:next}));
    const ini=initOf(r);
    pushBus("vz-gw-evidence",{item:`Treatment update: ${r.id} ${r.title} -> ${next}`,initiative:ini?ini.name:r.unit,scope:ini?"Project":"Enterprise",control:`Risk Center - ISO 42001 C.8.3 (${r.controls.join(", ")})`,risk:r.category,owner:r.treatment.owner,status:"Complete",approval:"Recorded",version:"v1",time:"Just now"});
    showToast&&showToast(ar?`معالجة ${r.id} ${next==="Complete"?"اكتملت":"بدأت"} - الأدلة مُسجَّلة`:`${r.id} treatment ${next==="Complete"?"completed":"started"} - evidence recorded`);
  };
  const kriBreach=k=>k.direction==="above"?k.value>k.threshold:k.value<k.threshold;
  const openCritHigh=scopedRisks.filter(r=>{const l=levelFor(r,effT(r));return (l==="Critical"||l==="High")&&r.status!=="Closed";}).length;
  const inProg=scopedRisks.filter(r=>effT(r)==="In Progress").length;
  const breaching=kriRegister.filter(kriBreach).length;
  const kpis=[
    ["Risks on register",scopedRisks.length,T.blue,"register"],
    ["Critical / high open",openCritHigh,T.red,"heatmap"],
    ["Treatments in progress",inProg,T.violet,"treatments"],
    ["KRIs breaching",breaching,T.amber,"kris"],
  ];
  const TABS=[["register","Risk Register"],["assessments","Assessments"],["heatmap","Heat Map"],["treatments","Treatments"],["residual","Residual & Trends"],["kris","KRIs"],["drift","Risk Drift"]];
  const Dots=({n,color})=><div style={{display:"flex",gap:2}}>{[1,2,3,4,5].map(x=><div key={x} style={{width:7,height:7,borderRadius:2,background:x<=n?color:T.border}}/>)}</div>;
  const selMath=sel&&riskMath(sel,effT(sel));
  const detail=sel&&<Card style={{overflow:"hidden",position:"sticky",top:70,height:"fit-content",boxShadow:`0 0 28px ${lvColor(selMath.level)}10`,animation:"fade .25s ease"}}>
    <div style={{background:`linear-gradient(135deg,${lvColor(selMath.level)}18,${T.s3})`,borderBottom:`1px solid ${lvColor(selMath.level)}30`,padding:"14px 16px"}}>
      <div style={{display:"flex",gap:7,alignItems:"center"}}><Tag label={selMath.level} color={lvColor(selMath.level)} bg={lvColor(selMath.level)+"20"}/><STag s={sel.status}/><span style={{fontSize:9,color:T.ink4,fontFamily:F.m,marginLeft:"auto"}}>{sel.id}</span></div>
      <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink,marginTop:9,lineHeight:1.3}}>{T_(sel.title)}</h3>
      <p style={{fontSize:10,color:T.ink3,fontFamily:F.m,marginTop:3}}>{sel.system}</p>
    </div>
    <div style={{padding:16}}>
      <p style={{fontSize:11,color:T.ink3,lineHeight:1.7,fontFamily:F.b,marginBottom:12}}>{T_(sel.desc)}</p>
      {[["Category",sel.category],["Business unit",sel.unit],["Executive owner",sel.execOwner],["Risk owner",sel.riskOwner],["Inherent score",`${selMath.inherent}/25`],["Residual score",`${selMath.live}/25`]].map(([l,v])=><div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${T.border}`}}>
        <span style={{fontSize:9,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.05em"}}>{T_(l)}</span>
        <span style={{fontSize:10,color:T.ink,fontFamily:F.m,fontWeight:600,textAlign:"right",maxWidth:170}}>{T_(v)}</span>
      </div>)}
      {/* ── Risk math: residual computed from inherent minus treatment
          buy-down, live with the treatment status. ── */}
      <div style={{marginTop:12,background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px"}}>
        <div style={{fontSize:9,fontWeight:800,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:8}}>{T_("Residual math")}</div>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",fontFamily:F.m}}>
          <span style={{fontSize:11,fontWeight:800,color:T.ink2}} title={ar?"الاحتمالية × الأثر":"likelihood × impact"}>{ar?"المتأصّل":"Inherent"} {selMath.inherent}</span>
          <span style={{color:T.ink4,fontSize:11}}>−</span>
          <span style={{fontSize:11,fontWeight:800,color:selMath.progressed?T.green:T.ink3}} title={ar?"مُخفَّض بالمعالجة":"bought down by treatment"}>{ar?"تخفيض":"buy-down"} {selMath.boughtDown}</span>
          <span style={{color:T.ink4,fontSize:11}}>=</span>
          <span style={{fontSize:13,fontWeight:900,color:lvColor(selMath.level)}}>{selMath.live}</span>
          <Tag label={T_(selMath.level)} color={lvColor(selMath.level)} bg={lvColor(selMath.level)+"18"}/>
          {selMath.progressed&&<span style={{fontSize:9,fontWeight:900,fontFamily:F.m,color:T.green,background:T.green+"18",borderRadius:999,padding:"2px 8px"}}>{ar?`▼ من ${selMath.assessed}`:`▼ from ${selMath.assessed}`}</span>}
        </div>
        <div style={{fontSize:9.5,color:T.ink3,fontFamily:F.b,lineHeight:1.5,marginTop:7}}>{selMath.note}</div>
      </div>
      <div style={{display:"flex",gap:5,flexWrap:"wrap",margin:"11px 0 0"}}>
        {sel.frameworks.map(f=><Tag key={f} label={f} color={T.blue} bg={T.blue+"14"}/>)}
        {sel.controls.map(c=><button key={c} onClick={()=>setTab&&setTab("controls")} title={ar?"افتح في مكتبة الضوابط":"Open in the control library"} style={{background:T.violet+"14",border:`1px solid ${T.violet}40`,borderRadius:6,padding:"2px 8px",color:T.violet,fontSize:9,fontWeight:800,fontFamily:F.m,cursor:"pointer"}}>{c}</button>)}
      </div>
      <div style={{marginTop:13,background:T.s3,borderRadius:8,padding:"10px 12px",borderLeft:`3px solid ${T.violet}`}}>
        <div style={{fontSize:9,fontWeight:800,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:5}}>{ar?"المعالجة":"Treatment"} - {T_(sel.treatment.strategy)} · {sel.treatment.owner} · {ar?"تُستحق":"due"} {sel.treatment.deadline}</div>
        <p style={{fontSize:10.5,color:T.ink2,lineHeight:1.65,fontFamily:F.b,margin:0}}>{T_(sel.treatment.action)}</p>
      </div>
      <div style={{marginTop:10,background:AI_GOLD+"0d",border:`1px solid ${AI_GOLD}30`,borderRadius:8,padding:"10px 12px"}}>
        <div style={{fontSize:9,fontWeight:800,color:AI_GOLD_INK,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:5}}>{T_("AI recommendation")}</div>
        <p style={{fontSize:10.5,color:T.ink2,lineHeight:1.65,fontFamily:F.b,margin:0}}>{T_(sel.aiRecommendation)}</p>
      </div>
      {(()=>{
        const relKris=(sel.kris||[]).map(id=>kriRegister.find(k=>k.id===id)).filter(Boolean);
        const relEvents=SECURITY_EVENTS.filter(e=>e.projectId&&e.projectId===sel.initiativeId);
        const assessments=acAssessments[sel.initiativeId]||[];
        return <>
          {relKris.length>0&&<div style={{marginTop:10}}>
            <div style={{fontSize:9,fontWeight:800,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:6}}>{T_("Key risk indicators")}</div>
            {relKris.map(k=>{const breach=k.direction==="above"?k.value>k.threshold:k.value<k.threshold;return <div key={k.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,padding:"6px 0",borderBottom:`1px solid ${T.border}`}}>
              <span style={{fontSize:10,color:T.ink2,fontFamily:F.b}}>{T_(k.name)}</span>
              <span style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}><span style={{fontSize:10,fontWeight:800,color:breach?T.red:T.green,fontFamily:F.m}}>{k.value}{k.unit.startsWith("%")?"%":""}</span><Tag label={T_(breach?"Breaching":"Within")} color={breach?T.red:T.green} bg={(breach?T.red:T.green)+"16"}/></span>
            </div>;})}
          </div>}
          {relEvents.length>0&&<div style={{marginTop:12}}>
            <div style={{fontSize:9,fontWeight:800,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:6}}>{T_("Related incidents & vulnerabilities")}</div>
            {relEvents.map(e=><div key={e.ref} style={{display:"flex",gap:8,alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${T.border}`}}>
              <span style={{fontSize:9,fontFamily:F.m,fontWeight:900,color:T.ink4,flexShrink:0}}>{e.ref}</span>
              <span style={{fontSize:10,color:T.ink2,fontFamily:F.b,flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{T_(e.title)}</span>
              {e.severity&&<span style={{fontSize:8.5,fontWeight:800,fontFamily:F.m,color:evColor(e.severity[1]),border:`1px solid ${evColor(e.severity[1])}55`,borderRadius:20,padding:"1px 7px",flexShrink:0}}>{T_(e.severity[0])}</span>}
            </div>)}
          </div>}
          {assessments.length>0&&<div style={{marginTop:12,background:T.s3,borderRadius:8,padding:"9px 12px"}}>
            <div style={{fontSize:9,fontWeight:800,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:4}}>{T_("Assessment history")}</div>
            <span style={{fontSize:10.5,color:T.ink2,fontFamily:F.b}}>{ar?`${assessments.length} تقييم مُسجَّل`:`${assessments.length} assessment${assessments.length>1?"s":""} on record`} · <button onClick={()=>setRcTab("assessments")} style={{background:"none",border:"none",padding:0,color:AI_GOLD_INK,fontWeight:800,fontFamily:F.b,fontSize:10.5,cursor:"pointer"}}>{ar?"افتح التتابع ←":"open cascade →"}</button></span>
          </div>}
        </>;
      })()}
      <div style={{display:"grid",gridTemplateColumns:initOf(sel)?"1fr 1fr":"1fr",gap:8,marginTop:12}}>
        <button onClick={()=>{setRcTab("treatments");}} style={{background:T.violet,border:"none",borderRadius:7,padding:"9px",color:"#fff",fontSize:10.5,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{T_(effT(sel)==="Complete"?"Treatment complete":"Manage treatment")}</button>
        {initOf(sel)&&<button onClick={openInitiative} style={{background:AI_GOLD+"16",border:`1px solid ${AI_GOLD}45`,borderRadius:7,padding:"9px",color:AI_GOLD_INK,fontSize:10.5,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>{ar?"افتح المبادرة ←":"Open initiative →"}</button>}
      </div>
    </div>
  </Card>;
  const fLabel=l=><span style={{fontSize:9,fontWeight:900,fontFamily:F.m,letterSpacing:"0.1em",textTransform:"uppercase",color:T.ink4}}>{l}</span>;
  const fieldStyle={background:T.s2,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 11px",color:T.ink,fontSize:12,fontFamily:F.b,width:"100%",outline:"none"};
  return <div style={{animation:"up .3s ease"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
      <SHead title={T_("Risk Center")} sub={T_("The system of record for every AI risk. Owned once, viewed many times - every risk traces to its initiative, executive owner, controls, frameworks and treatment evidence. ISO 42001 C.8.2 / C.8.3.")}/>
      <button onClick={()=>setCreateOpen(o=>!o)} style={{flexShrink:0,background:createOpen?"transparent":T.red+"14",border:`1px solid ${T.red}${createOpen?"55":"45"}`,borderRadius:8,padding:"9px 15px",color:T.red,fontSize:11,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>{T_(createOpen?"Close":"+ New risk")}</button>
    </div>
    {createOpen&&<Card style={{padding:18,marginBottom:14,border:`1px solid ${T.red}45`,animation:"up .25s ease"}}>
      <h3 style={{fontSize:14,color:T.ink,fontWeight:800,margin:"0 0 4px"}}>{T_("Register a risk")}</h3>
      <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,margin:"0 0 12px"}}>{T_("Category, unit, owners and framework are governed vocabularies — pick, add or request a value inline. New risks land Open, awaiting assessment.")}</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10,marginBottom:12}}>
        <label style={{display:"grid",gap:5}}>{fLabel(T_("Risk title"))}<input value={rdraft.title} onChange={e=>setRdraft({...rdraft,title:e.target.value})} placeholder={T_("e.g. Model drift on credit engine")} style={fieldStyle}/></label>
        <label style={{display:"grid",gap:5}}>{fLabel(T_("Category"))}<SmartSelect vocab="riskCategory" value={rdraft.category} onChange={setRK("category")} role={role} showToast={showToast} requestedBy={R.name}/></label>
        <label style={{display:"grid",gap:5}}>{fLabel(T_("Business unit"))}<SmartSelect vocab="unit" value={rdraft.unit} onChange={setRK("unit")} role={role} showToast={showToast} requestedBy={R.name}/></label>
        <label style={{display:"grid",gap:5}}>{fLabel(T_("Executive owner"))}<SmartSelect vocab="person" value={rdraft.execOwner} onChange={setRK("execOwner")} role={role} showToast={showToast} requestedBy={R.name} placeholder={ar?"اختر أو أضِف مالكاً":"Choose or add an owner"}/></label>
        <label style={{display:"grid",gap:5}}>{fLabel(T_("Risk owner"))}<SmartSelect vocab="person" value={rdraft.riskOwner} onChange={setRK("riskOwner")} role={role} showToast={showToast} requestedBy={R.name} placeholder={ar?"اختر أو أضِف مالكاً":"Choose or add an owner"}/></label>
        <label style={{display:"grid",gap:5}}>{fLabel(T_("Control framework"))}<SmartSelect vocab="framework" value={rdraft.framework} onChange={setRK("framework")} role={role} showToast={showToast} requestedBy={R.name}/></label>
        <label style={{display:"grid",gap:5}}>{fLabel(T_("Likelihood (1-5)"))}
          <select value={rdraft.likelihood} onChange={e=>setRdraft({...rdraft,likelihood:e.target.value})} style={{...fieldStyle,cursor:"pointer"}}>{["1","2","3","4","5"].map(s=><option key={s} value={s}>{s}</option>)}</select>
        </label>
        <label style={{display:"grid",gap:5}}>{fLabel(T_("Impact (1-5)"))}
          <select value={rdraft.impact} onChange={e=>setRdraft({...rdraft,impact:e.target.value})} style={{...fieldStyle,cursor:"pointer"}}>{["1","2","3","4","5"].map(s=><option key={s} value={s}>{s}</option>)}</select>
        </label>
        <label style={{display:"grid",gap:5}}>{fLabel(T_("Level"))}
          <select value={rdraft.level} onChange={e=>setRdraft({...rdraft,level:e.target.value})} style={{...fieldStyle,cursor:"pointer"}}>{["Low","Medium","High","Critical"].map(s=><option key={s} value={s}>{T_(s)}</option>)}</select>
        </label>
        <label style={{display:"grid",gap:5}}>{fLabel(T_("Treatment strategy"))}
          <select value={rdraft.strategy} onChange={e=>setRdraft({...rdraft,strategy:e.target.value})} style={{...fieldStyle,cursor:"pointer"}}>{["Mitigate","Accept","Transfer","Avoid"].map(s=><option key={s} value={s}>{T_(s)}</option>)}</select>
        </label>
      </div>
      <button onClick={createRisk} style={{background:T.red,border:"none",borderRadius:8,padding:"10px 16px",color:"#fff",fontSize:12,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>{T_("Register risk")}</button>
    </Card>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:10,marginBottom:14}}>
      {kpis.map(([l,v,c,t])=><Card key={l} onClick={()=>setRcTab(t)} style={{padding:14,cursor:"pointer"}}>
        <div style={{fontSize:9,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:900,fontFamily:F.m,marginBottom:8}}>{T_(l)}</div>
        <div style={{fontSize:22,fontWeight:900,fontFamily:F.m,color:c}}><CountUp value={v}/></div>
      </Card>)}
    </div>
    {myOwner&&<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,background:mineOnly?AI_GOLD+"12":T.s2,border:`1px solid ${mineOnly?AI_GOLD+"40":T.border}`,borderRadius:9,padding:"9px 13px",flexWrap:"wrap"}}>
      <span style={{fontSize:11,fontWeight:800,color:mineOnly?AI_GOLD:T.ink3,fontFamily:F.b}}>{mineOnly?(ar?`عرض مخاطر ${R.label}`:`Showing ${R.label}'s risks`):(ar?"عرض جميع مخاطر المؤسسة":"Showing all enterprise risks")}</span>
      <span style={{fontSize:10.5,color:T.ink3,fontFamily:F.b}}>{mineOnly?(ar?`${scopedRisks.length} مخاطر أنت مسؤول عنها كمالك تنفيذي.`:`${scopedRisks.length} risks you are accountable for as executive owner.`):(ar?"كل خطر عبر المحفظة.":"Every risk across the portfolio.")}</span>
      <button onClick={()=>setMineOnly(m=>!m)} style={{marginLeft:"auto",background:T.s2,border:`1px solid ${T.border}`,borderRadius:7,padding:"6px 12px",color:T.ink2,fontSize:10.5,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{mineOnly?(ar?"عرض كل المخاطر ←":"View all risks →"):(ar?`عرض مخاطر ${R.label} فقط ←`:`View only ${R.label}'s risks →`)}</button>
    </div>}
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
      {TABS.map(([id,label])=><button key={id} onClick={()=>setRcTab(id)} style={{background:rcTab===id?T.red+"18":T.s2,border:`1px solid ${rcTab===id?T.red+"50":T.border}`,color:rcTab===id?T.red:T.ink2,borderRadius:8,padding:"7px 12px",fontSize:11,fontWeight:700,fontFamily:F.b,cursor:"pointer",transition:"all .15s"}}>{T_(label)}</button>)}
    </div>
    {(rcTab==="register"||rcTab==="heatmap")&&<Card style={{padding:"12px 14px",marginBottom:12,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
      <span style={{fontSize:9,color:T.ink4,fontFamily:F.m,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.06em"}}>{T_("View by")}</span>
      {["Enterprise","Business Unit","Project","Executive","Model","Framework"].map(d=><button key={d} onClick={()=>{setDimBy(d);setDimVal("All");}} style={{background:dimBy===d?T.blue+"18":T.s2,border:`1px solid ${dimBy===d?T.blue+"50":T.border}`,color:dimBy===d?T.blue:T.ink3,borderRadius:7,padding:"5px 10px",fontSize:10,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{d==="Enterprise"?(ar?"المؤسسة":"Enterprise"):T_(d)}</button>)}
      {dimValues.length>0&&<div style={{display:"flex",gap:5,flexWrap:"wrap",borderLeft:`1px solid ${T.border}`,paddingLeft:10}}>
        {["All",...dimValues].map(v=><button key={v} onClick={()=>setDimVal(v)} style={{background:dimVal===v?AI_GOLD+"20":T.s2,border:`1px solid ${dimVal===v?AI_GOLD+"55":T.border}`,color:dimVal===v?AI_GOLD:T.ink3,borderRadius:7,padding:"4px 9px",fontSize:9.5,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{T_(v)}</button>)}
      </div>}
      <Tag label={ar?`${rows.length} خطر`:`${rows.length} risks`} color={T.red} bg={T.red+"14"}/>
    </Card>}
    {rcTab==="register"&&<div style={{display:"grid",gridTemplateColumns:"1fr minmax(0,340px)",gap:14}}>
      <div>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1.1fr 60px 60px 90px",padding:"8px 12px",background:T.s3,borderRadius:"8px 8px 0 0",border:`1px solid ${T.border}`,borderBottom:"none"}}>
          {["Risk","Initiative / Unit","L","I","Residual"].map(h=><span key={h} style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m}}>{h==="Risk"?(ar?"الخطر":"Risk"):T_(h)}</span>)}
        </div>
        <div style={{border:`1px solid ${T.border}`,borderRadius:"0 0 8px 8px",overflow:"hidden"}}>
          {rows.map((r,i)=>{
            const rLvl=levelFor(r,effT(r));const rRes=liveResidual(r,effT(r));const moved=rRes!==(r.residual??inherentOf(r));
            const c=lvColor(rLvl);const ini=initOf(r);
            return <div key={r.id} onClick={()=>setSel(r)} style={{display:"grid",gridTemplateColumns:"2fr 1.1fr 60px 60px 90px",padding:"11px 12px",alignItems:"center",cursor:"pointer",borderBottom:i<rows.length-1?`1px solid ${T.border}`:"none",background:sel&&sel.id===r.id?T.s3:i%2===0?T.s1:T.bg,borderLeft:sel&&sel.id===r.id?`3px solid ${c}`:"3px solid transparent",transition:"all .15s"}}>
              <div>
                <div style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:2}}>{T_(r.title)}</div>
                <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{r.id} · {r.riskOwner}</span>
              </div>
              <div>
                <div style={{fontSize:10,color:ini?AI_GOLD:T.ink2,fontFamily:F.b,fontWeight:ini?800:500}}>{ini?ini.name:T_(r.unit)}</div>
                <span style={{fontSize:8.5,color:T.ink4,fontFamily:F.m}}>{ini?T_("Initiative"):(ar?"المؤسسة":"Enterprise")} · {ar?"تنفيذي":"Exec"}: {r.execOwner}</span>
              </div>
              <Dots n={r.likelihood} color={T.amber}/>
              <Dots n={r.impact} color={c}/>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:16,fontWeight:800,fontFamily:F.m,color:c}} title={moved?(ar?`المُقيَّم ${r.residual} ← الحالي ${rRes} بعد تقدّم المعالجة`:`Assessed ${r.residual} → live ${rRes} after treatment progress`):undefined}>{rRes}{moved&&<span style={{fontSize:9,color:T.green,marginLeft:2}}>▼</span>}</span>
                <Tag label={T_(rLvl)} color={c} bg={c+"18"}/>
              </div>
            </div>;
          })}
        </div>
      </div>
      {detail}
    </div>}
    {rcTab==="heatmap"&&<div style={{display:"grid",gridTemplateColumns:"minmax(0,420px) 1fr",gap:14}}>
      <Card style={{padding:16}}>
        <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:800,color:T.ink,margin:"0 0 4px"}}>{T_("Inherent risk heat map")}</h3>
        <p style={{fontSize:10,color:T.ink3,fontFamily:F.b,margin:"0 0 12px"}}>{T_("Click a cell to see the risks behind it. Rows are impact, columns likelihood.")}</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:4}}>
          {[5,4,3,2,1].map(imp=>[1,2,3,4,5].map(lik=>{
            const cellRisks=rows.filter(r=>r.likelihood===lik&&r.impact===imp);
            const sc=lik*imp;
            const bg=sc>=16?T.red:sc>=10?T.amber:sc>=5?T.blue:T.green;
            const active=cell&&cell.l===lik&&cell.i===imp;
            return <button key={`${imp}-${lik}`} onClick={()=>setCell(active?null:{l:lik,i:imp})} style={{height:52,borderRadius:6,background:active?bg:bg+(cellRisks.length?"45":"18"),border:active?`2px solid ${bg}`:`1px solid ${bg}30`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:900,fontFamily:F.m,color:active?"#fff":cellRisks.length?T.ink:"transparent"}}>{cellRisks.length||0}</button>;
          }))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
          <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{ar?"→":"←"} {T_("lower likelihood")}</span>
          <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{T_("higher likelihood")} {ar?"←":"→"}</span>
        </div>
      </Card>
      <Card style={{padding:16}}>
        <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:800,color:T.ink,margin:"0 0 10px"}}>{cell?(ar?`المخاطر عند احتمالية ${cell.l} × أثر ${cell.i}`:`Risks at likelihood ${cell.l} × impact ${cell.i}`):T_("All risks in view")}</h3>
        <div style={{display:"grid",gap:8}}>
          {(cell?rows.filter(r=>r.likelihood===cell.l&&r.impact===cell.i):rows).map(r=>{
            const c=lvColor(r.level);const ini=initOf(r);
            return <div key={r.id} style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:10,alignItems:"center",background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px"}}>
              <div><div style={{fontSize:11.5,fontWeight:800,color:T.ink,fontFamily:F.b}}>{T_(r.title)}</div><div style={{fontSize:9,color:T.ink3,fontFamily:F.b,marginTop:2}}>{ini?ini.name:T_(r.unit)} · {T_(r.category)}</div></div>
              <Tag label={T_(r.level)} color={c} bg={c+"16"}/>
              <button onClick={()=>{setSel(r);setRcTab("register");}} style={{background:"transparent",border:`1px solid ${T.border}`,borderRadius:7,padding:"5px 10px",color:T.ink2,fontSize:9.5,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{ar?"افتح ←":"Open →"}</button>
            </div>;
          })}
          {cell&&rows.filter(r=>r.likelihood===cell.l&&r.impact===cell.i).length===0&&<div style={{fontSize:11,color:T.ink3,fontFamily:F.b}}>{T_("No risks sit in this cell - the register has nothing at this likelihood and impact.")}</div>}
        </div>
      </Card>
    </div>}
    {rcTab==="treatments"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1.6fr 90px 1fr 90px 110px 150px",padding:"8px 12px",background:T.s3,borderRadius:"8px 8px 0 0",border:`1px solid ${T.border}`,borderBottom:"none"}}>
        {["Risk","Strategy","Owner / deadline","Priority","Status","Action"].map(h=><span key={h} style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m}}>{h==="Risk"?(ar?"الخطر":"Risk"):T_(h)}</span>)}
      </div>
      <div style={{border:`1px solid ${T.border}`,borderRadius:"0 0 8px 8px",overflow:"hidden"}}>
        {riskRegister.map((r,i)=>{
          const st=effT(r);
          return <div key={r.id} style={{display:"grid",gridTemplateColumns:"1.6fr 90px 1fr 90px 110px 150px",padding:"10px 12px",alignItems:"center",borderBottom:i<riskRegister.length-1?`1px solid ${T.border}`:"none",background:i%2===0?T.s1:T.bg}}>
            <div>
              <div style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:2}}>{T_(r.title)}</div>
              <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{r.id} · {r.system}</span>
            </div>
            <STag s={r.treatment.strategy}/>
            <div><div style={{fontSize:10,color:T.ink2,fontFamily:F.b}}>{r.treatment.owner}</div><span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{ar?"تُستحق":"due"} {r.treatment.deadline}</span></div>
            <PTag p={r.treatment.priority}/>
            <STag s={st}/>
            <button onClick={()=>advance(r)} disabled={st==="Complete"} style={{background:st==="Complete"?T.s3:T.violet,color:st==="Complete"?T.green:"#fff",border:st==="Complete"?`1px solid ${T.green}40`:"none",borderRadius:7,padding:"7px 8px",fontSize:9.5,fontWeight:700,fontFamily:F.b,cursor:st==="Complete"?"default":"pointer"}}>{T_(st==="Complete"?"Evidence recorded":st==="Planned"?"Start treatment":"Mark complete")}</button>
          </div>;
        })}
      </div>
    </div>}
    {rcTab==="assessments"&&<RiskAssessmentCascade setTab={setTab} setAiCentralView={setAiCentralView}/>}
    {rcTab==="residual"&&<div>
      <Card style={{padding:16,marginBottom:12}}>
        <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:800,color:T.ink,margin:"0 0 4px"}}>{T_("Inherent vs residual by initiative")}</h3>
        <p style={{fontSize:10,color:T.ink3,fontFamily:F.b,margin:"0 0 12px"}}>{T_("How far treatment has driven each initiative's exposure down. Click a row to open its risks.")}</p>
        <div style={{display:"grid",gap:10}}>
          {acInitiatives.map(i=>{
            const rs=riskRegister.filter(r=>r.initiativeId===i.id);
            if(!rs.length)return null;
            const inh=Math.max(...rs.map(r=>r.likelihood*r.impact));
            const res=Math.max(...rs.map(r=>r.residual));
            return <button key={i.id} onClick={()=>{setDimBy("Project");setDimVal(i.name);setRcTab("register");}} style={{display:"grid",gridTemplateColumns:"180px 1fr 1fr 90px",gap:12,alignItems:"center",background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 13px",cursor:"pointer",textAlign:"left"}}>
              <span style={{fontSize:11,fontWeight:800,color:T.ink,fontFamily:F.b}}>{i.name}</span>
              <div><div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,marginBottom:3}}>{ar?"المتأصّل":"INHERENT"} {inh}/25</div><Bar value={inh*4} color={T.red}/></div>
              <div><div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,marginBottom:3}}>{ar?"المتبقّي":"RESIDUAL"} {res}/25</div><Bar value={res*4} color={res<=6?T.green:T.amber}/></div>
              <Tag label={ar?`-${inh-res} نقطة`:`-${inh-res} pts`} color={T.green} bg={T.greenL}/>
            </button>;
          })}
        </div>
      </Card>
      <Card style={{padding:16}}>
        <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:800,color:T.ink,margin:"0 0 10px"}}>{T_("Control effectiveness")}</h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:8}}>
          {[...new Set(riskRegister.flatMap(r=>r.controls))].map(c=>{
            const linked=riskRegister.filter(r=>r.controls.includes(c));
            const done=linked.filter(r=>r.treatment.status==="Complete").length;
            const eff=Math.round((done/linked.length)*100);
            const col=eff>=70?T.green:eff>=40?T.amber:T.red;
            return <button key={c} onClick={()=>setTab&&setTab("controls")} title={ar?"افتح في مكتبة الضوابط":"Open in the control library"} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px",cursor:"pointer",textAlign:"left"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:10.5,fontWeight:800,color:T.ink,fontFamily:F.m}}>{c}</span>
                <span style={{fontSize:11,fontWeight:900,fontFamily:F.m,color:col}}>{eff}%</span>
              </div>
              <div style={{fontSize:9,color:T.ink3,fontFamily:F.b,marginBottom:5}}>{ar?`يغطّي ${linked.map(r=>r.id).join(", ")} · ${done}/${linked.length} معالجات مكتملة`:`Covers ${linked.map(r=>r.id).join(", ")} · ${done}/${linked.length} treatments complete`}</div>
              <Bar value={eff} color={col}/>
            </button>;
          })}
        </div>
      </Card>
    </div>}
    {rcTab==="kris"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:10}}>
      {kriRegister.map(k=>{
        const breach=kriBreach(k);
        const c=breach?T.red:T.green;
        const ini=k.initiativeId?acInitiatives.find(i=>i.id===k.initiativeId):null;
        const linked=riskRegister.filter(r=>r.kris.includes(k.id));
        return <Card key={k.id} style={{padding:15,border:`1px solid ${c}30`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <Tag label={T_(breach?"Breaching":"Within appetite")} color={c} bg={c+"16"}/>
            <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{k.id} · {ar?"اتجاه":"trend"} {T_(k.trend)}</span>
          </div>
          <div style={{fontSize:13,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:3}}>{T_(k.name)}</div>
          <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:8}}>
            <span style={{fontSize:24,fontWeight:900,fontFamily:F.m,color:c}}>{k.value}</span>
            <span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{T_(k.unit)} · {ar?"عتبة":"threshold"} {k.direction==="above"?"≤":"≥"} {k.threshold}</span>
          </div>
          <div style={{fontSize:9.5,color:T.ink3,fontFamily:F.b,marginBottom:10}}>{ar?`يحمي ${k.framework}${linked.length>0?` · يراقب ${linked.map(r=>r.id).join(", ")}`:""}`:`Protects ${k.framework}${linked.length>0?` · watches ${linked.map(r=>r.id).join(", ")}`:""}`}</div>
          {ini?<button onClick={openInitiative} style={{background:AI_GOLD+"14",border:`1px solid ${AI_GOLD}40`,borderRadius:7,padding:"6px 11px",color:AI_GOLD_INK,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>{ini.name} {ar?"←":"→"}</button>
          :<Tag label={T_("Enterprise-level")} color={T.blue} bg={T.blue+"14"}/>}
        </Card>;
      })}
    </div>}
    {rcTab==="drift"&&<PageAISpine mode="riskdrift" setTab={setTab}/>}
  </div>;
}

