"use client";

import { useState } from "react";
import { T, F, AI_GOLD, AI_GOLD_INK, Card } from "./core";
import {
  FORUM_COUNCIL, FORUM_CADENCE, OWNERSHIP_MATRIX, forumAgenda,
  UNIFIED_INCIDENTS, INCIDENT_STAGES, INCIDENT_CLASSES, incidentStats,
} from "@/lib/convergence";
import {
  NOTIFICATION_REGIMES, BREACH_REGISTER, NOTIFICATION_WORKFLOW,
  breachClock, regimesFor, tightestDeadlineH, breachStats, breachCoverage,
} from "@/lib/breach-notification";
import { useLang, ts, registerContent } from "@/lib/i18n";

/* Arabic content for the Breach Notification surface (content cycle 1). Keyed
   by the English string; missing strings fall back to English. */
registerContent({
  // headings / chrome
  "Breach Notification": "الإبلاغ عن خرق البيانات",
  "The Notify stage of the incident playbook, made first-class. A confirmed personal-data breach or serious AI incident starts a regulatory clock — several regimes oblige notification to an authority, and sometimes to affected individuals, within a fixed window. This workspace runs that decision over the one incident register and keeps the evidence.": "مرحلة «الإبلاغ» من دليل الاستجابة للحوادث، بصفتها ركناً أساسياً. يؤدي خرق بيانات شخصية مؤكَّد أو حادث ذكاء اصطناعي جسيم إلى بدء ساعة تنظيمية — تُلزم عدة أنظمة بالإبلاغ إلى جهة رقابية، وأحياناً إلى الأفراد المتأثرين، خلال مهلة محددة. تُدير هذه المساحة ذلك القرار عبر سجل الحوادث الموحّد وتحتفظ بالأدلة.",
  "One clock, every regime": "ساعة واحدة، وكل نظام",
  "Assess once — notify every authority whose window is running": "قيّم مرة واحدة — وأبلغ كل جهة تسري مهلتها",
  "A single breach can run the GDPR 72-hour clock, India's DPDP and CERT-In 6-hour clocks and the EU AI Act serious-incident clock at once. The workflow resolves them together, notifies against the tightest, and files one evidence pack — never four separate scrambles.": "قد يُشغّل خرق واحد ساعة الـ72 ساعة في GDPR، وساعتَي DPDP وCERT-In (6 ساعات) في الهند، وساعة الحادث الجسيم في قانون الذكاء الاصطناعي الأوروبي — كلها معاً. يحلّها سير العمل مجتمعةً، ويُبلغ وفق الأضيق مهلةً، ويودِع حزمة أدلة واحدة — لا أربع محاولات متفرقة.",
  "NOTIFICATION REGIMES": "أنظمة الإبلاغ",
  // KPIs
  "Breaches assessed": "خروقات جرى تقييمها", "Notifiable now": "واجبة الإبلاغ الآن",
  "Notified on time": "أُبلغت في الوقت", "Tightest live clock": "أضيق ساعة سارية",
  "on the regulatory clock": "على الساعة التنظيمية", "to the binding deadline": "حتى المهلة المُلزِمة",
  // regime table
  "The clocks · who must be told, by when": "الساعات · من يجب إبلاغه، ومتى",
  "Every notification duty the estate is exposed to": "كل واجب إبلاغ تتعرّض له المنشأة",
  "Regime": "النظام", "Basis": "الأساس", "Region": "الإقليم", "Who is notified": "من يُبلَّغ", "Window": "المهلة", "Trigger": "المُحفِّز",
  // regime data
  "EU AI Act": "قانون الذكاء الاصطناعي الأوروبي", "India DPDP Act": "قانون DPDP الهندي",
  "India CERT-In": "CERT-In الهندية", "Brazil LGPD": "قانون LGPD البرازيلي",
  "EU / EEA": "الاتحاد الأوروبي / المنطقة الاقتصادية", "EU": "الاتحاد الأوروبي", "India": "الهند", "Brazil": "البرازيل",
  "Supervisory authority": "الجهة الرقابية", "Affected data subjects": "أصحاب البيانات المتأثرون",
  "Market-surveillance authority": "جهة مراقبة السوق", "Data Protection Board + principals": "مجلس حماية البيانات + الأفراد",
  "CERT-In": "CERT-In", "ANPD + data subjects": "ANPD + أصحاب البيانات",
  "72 hours from awareness": "72 ساعة من العِلم", "Without undue delay · high risk": "دون تأخير غير مبرَّر · خطورة عالية",
  "15 days · 2d widespread · 10d on death": "15 يوماً · يومان للانتشار الواسع · 10 أيام عند الوفاة",
  "Without delay · Rules-prescribed": "دون تأخير · وفق اللوائح", "6 hours from noticing": "6 ساعات من الملاحظة",
  "~2 business days · reasonable term": "~يومَا عمل · مدة معقولة",
  "Any personal-data breach likely to result in a risk to individuals.": "أي خرق لبيانات شخصية يُرجَّح أن يُنشئ خطراً على الأفراد.",
  "A breach likely to result in a HIGH risk to individuals' rights.": "خرق يُرجَّح أن يُنشئ خطراً عالياً على حقوق الأفراد.",
  "A serious incident of a high-risk AI system.": "حادث جسيم لنظام ذكاء اصطناعي عالي الخطورة.",
  "Any personal-data breach — no materiality threshold.": "أي خرق لبيانات شخصية — دون حدّ جوهرية.",
  "A specified cyber-security incident (AI systems included).": "حادث أمن سيبراني محدَّد (تشمل أنظمة الذكاء الاصطناعي).",
  "A security incident that may create risk or relevant damage.": "حادث أمني قد يُنشئ خطراً أو ضرراً ذا صلة.",
  // register
  "The register · every breach assessed for notifiability": "السجل · كل خرق جرى تقييمه لوجوب الإبلاغ",
  "Assess → decide → notify → log — click any row for the decision": "قيّم ← قرّر ← أبلغ ← وثّق — انقر أي صف لعرض القرار",
  "Most breaches are assessed and found not notifiable — the workflow still records that decision. The clock shows only where a duty is live.": "معظم الخروقات تُقيَّم ويتبيّن أنها غير واجبة الإبلاغ — ويسجّل سير العمل ذلك القرار مع ذلك. ولا تظهر الساعة إلا حيث يكون الواجب سارياً.",
  "Ref": "المرجع", "Breach": "الخرق", "System": "النظام", "Personal data": "بيانات شخصية", "Regimes": "الأنظمة", "Clock": "الساعة", "Decision": "القرار",
  "Yes": "نعم", "No": "لا", "historical": "سابق",
  "Notified": "أُبلغ", "Notifiable": "واجب الإبلاغ", "Assessed": "مُقيَّم",
  "Assessed · not notifiable": "مُقيَّم · غير واجب الإبلاغ", "No clock": "لا ساعة",
  "notification decision:": "قرار الإبلاغ:", "Owner:": "المسؤول:",
  // breach register data
  "Prompt-injection attempt on Resolution Copilot": "محاولة حقن تعليمات على مساعد الحلول",
  "PII near-miss in prompt logs": "شبه تسريب لبيانات شخصية في سجلات الإدخالات",
  "Sub-processor mis-config exposed export bucket": "خطأ إعداد لدى معالج فرعي كشف حاوية تصدير",
  "Cross-border data flow without transfer mapping (APAC)": "تدفّق بيانات عابر للحدود دون خريطة نقل (آسيا-الهادئ)",
  "Vendor model API leaked truncated records in error payload": "واجهة نموذج مورّد سرّبت سجلات مقتطعة في حمولة خطأ",
  "Attack blocked at the gateway; no personal data left the boundary — assessed under Art. 33, no notification, decision logged.": "صُدّ الهجوم عند البوابة؛ ولم تغادر أي بيانات شخصية الحدود — قُيّم بموجب المادة 33، دون إبلاغ، وسُجّل القرار.",
  "Masked before egress; contained in-boundary — assessed as a near-miss, not notifiable, retained under Art. 33(5) internal record.": "أُخفيت قبل الإخراج؛ واحتُويت داخل الحدود — قُيّم كشبه تسريب، غير واجب الإبلاغ، واحتُفظ به بموجب سجل المادة 33(5) الداخلي.",
  "Confirmed personal-data breach via a vendor — notified the lead DPA at 61h (within 72h) and affected principals; evidence pack filed.": "خرق بيانات شخصية مؤكَّد عبر مورّد — أُبلغت الجهة الرقابية الرئيسية عند 61 ساعة (ضمن 72) والأفراد المتأثرون؛ وأُودعت حزمة الأدلة.",
  "A transfer-governance gap, not a confided-data breach — transfer impact assessment completed, mapping in place, no notification duty.": "فجوة في حوكمة النقل، لا خرق بيانات مُودَعة — اكتمل تقييم أثر النقل، والخريطة قائمة، ولا واجب إبلاغ.",
  "Confirmed personal-data breach — notifiable. CERT-In 6h window met; DPA + DPB notification drafted, principal notice in review against the 72h clock.": "خرق بيانات شخصية مؤكَّد — واجب الإبلاغ. استُوفيت مهلة CERT-In (6 ساعات)؛ وصيغت إشعارات الجهة الرقابية والمجلس، وإشعار الأفراد قيد المراجعة مقابل ساعة الـ72.",
  // workflow
  "The decision · five stages that produce the evidence": "القرار · خمس مراحل تُنتج الأدلة",
  "Assess": "التقييم", "Scope": "التحديد", "Decide": "القرار", "Notify": "الإبلاغ", "Log": "التوثيق",
  "Is this a personal-data breach or a serious AI incident? Confirm what data / harm actually occurred.": "هل هذا خرق بيانات شخصية أم حادث ذكاء اصطناعي جسيم؟ أكّد البيانات / الضرر الذي وقع فعلاً.",
  "Whose data, which jurisdictions, which authorities — resolve every regime whose clock now runs.": "بيانات مَن، وأي ولايات قضائية، وأي جهات — حدّد كل نظام تسري ساعته الآن.",
  "Notifiable? Test each regime's threshold against the facts and start the tightest clock.": "واجب الإبلاغ؟ اختبر حدّ كل نظام مقابل الوقائع وابدأ الساعة الأضيق.",
  "Notify the authority within the window; notify affected individuals without undue delay where the risk is high.": "أبلغ الجهة ضمن المهلة؛ وأبلغ الأفراد المتأثرين دون تأخير غير مبرَّر حيث تكون الخطورة عالية.",
  "File the notification record + evidence pack — the Art. 33(5) internal register and the Article 12 log.": "وثّق سجل الإبلاغ + حزمة الأدلة — سجل المادة 33(5) الداخلي وسجل المادة 12.",
  "CDPO + CISO": "مسؤول حماية البيانات + مسؤول الأمن", "CDPO + Legal": "مسؤول حماية البيانات + الشؤون القانونية",
  "CDPO + CGO": "مسؤول حماية البيانات + مسؤول الحوكمة", "CDPO + Legal + Comms": "مسؤول حماية البيانات + القانونية + الاتصال",
  "Governance Office": "مكتب الحوكمة",
  // owners (people)
  "Omar Khan · CISO": "عمر خان · مسؤول الأمن", "Priya Mehta · CDPO": "بريا ميهتا · مسؤول حماية البيانات",
  "Customer Resolution Copilot": "مساعد حلول العملاء", "Analytics data pipeline": "خط بيانات التحليلات",
  "Predictive Maintenance": "الصيانة التنبؤية", "Skills Navigator (vendor LLM)": "مُوجّه المهارات (نموذج مورّد)",
  // who (authority short names)
  "Lead DPA": "الجهة الرقابية الرئيسية", "Data subjects": "أصحاب البيانات", "MSA": "جهة مراقبة السوق",
  "DPB + principals": "المجلس + الأفراد", "ANPD": "الهيئة الوطنية (ANPD)",
  // buttons
  "Start a breach assessment": "ابدأ تقييم خرق", "Export notification pack": "تصدير حزمة الإبلاغ",
});

/* Arabic content for the Impact Assessments surface (content cycle 1b). */
registerContent({
  "Impact Assessments": "تقييمات الأثر",
  "One assessment per AI system, run once and mapped to every regime that demands one — so the same record discharges the EU AI Act fundamental-rights assessment (Art. 27) and risk file (Art. 9), the GDPR DPIA (Art. 35), ISO 42001's system impact assessment, the NIST RMF Map function, Brazil's algorithmic impact assessment and Korea's high-impact assessment at once.": "تقييم واحد لكل نظام ذكاء اصطناعي، يُجرى مرة واحدة ويُربط بكل نظام يتطلبه — فيؤدي السجل نفسه تقييم الأثر على الحقوق الأساسية في قانون الذكاء الاصطناعي الأوروبي (المادة 27) وملف المخاطر (المادة 9)، وتقييم أثر الخصوصية في GDPR (المادة 35)، وتقييم أثر النظام في الأيزو 42001، ووظيفة الرسم في إطار NIST، وتقييم الأثر الخوارزمي البرازيلي، وتقييم عالي الأثر الكوري — دفعة واحدة.",
  "Assess once, satisfy seven": "قيّم مرة، واستوفِ سبعة",
  "One impact assessment, every regime that asks for one": "تقييم أثر واحد، وكل نظام يطلبه",
  "A fundamental-rights assessment, a DPIA and an algorithmic impact assessment are the same nine questions asked by four regulators. Answer them once per system, tie the mitigations to the Risk Center, and the FRIA, DPIA, ISO, NIST, Brazil and Korea obligations close together.": "تقييم الحقوق الأساسية وتقييم أثر الخصوصية وتقييم الأثر الخوارزمي هي الأسئلة التسعة نفسها التي تطرحها أربع جهات تنظيمية. أجب عنها مرة واحدة لكل نظام، واربط الإجراءات بمركز المخاطر، فتُغلَق التزامات FRIA وDPIA والأيزو وNIST والبرازيل وكوريا معاً.",
  "REGIMES DISCHARGED": "الأنظمة المستوفاة",
  // KPIs
  "High-risk FRIA coverage": "تغطية FRIA عالية الخطورة", "DPIA coverage": "تغطية DPIA",
  "Assessments complete": "تقييمات مكتملة", "Residual risk retired": "خطر متبقٍ مُزال",
  "across the assessed estate": "عبر المنشأة المُقيَّمة",
  // register
  "The register · one assessment per system": "السجل · تقييم واحد لكل نظام",
  "Screen → assess → mitigate → sign-off — click any row for the dimensions": "فرز ← تقييم ← معالجة ← اعتماد — انقر أي صف لعرض الأبعاد",
  "High-risk systems carry a full fundamental-rights assessment; limited-risk systems a proportionate one. Completeness is scored from the nine dimensions.": "تحمل الأنظمة عالية الخطورة تقييماً كاملاً للحقوق الأساسية؛ والأنظمة محدودة الخطورة تقييماً متناسباً. وتُحتسب نسبة الاكتمال من الأبعاد التسعة.",
  "Ref": "المرجع", "System": "النظام", "Tier": "الفئة", "Discharges": "يستوفي", "Completeness": "الاكتمال", "Residual": "المتبقي", "Status": "الحالة",
  "classification:": "التصنيف:", "Owner:": "المسؤول:",
  // tiers + statuses + dim states
  "High-risk": "عالي الخطورة", "Limited-risk": "محدود الخطورة",
  "Complete": "مكتمل", "In review": "قيد المراجعة", "Required": "مطلوب", "Gap": "فجوة", "Assessed": "مُقيَّم",
  // dimensions
  "Purpose, necessity & proportionality": "الغرض والضرورة والتناسب", "Personal data & lawful basis": "البيانات الشخصية والأساس القانوني",
  "Affected individuals & groups": "الأفراد والفئات المتأثرون", "Fundamental-rights impact": "الأثر على الحقوق الأساسية",
  "Automated decisions & legal effect": "القرارات الآلية والأثر القانوني", "Bias, fairness & discrimination": "التحيّز والإنصاف والتمييز",
  "Human oversight & contestability": "الإشراف البشري وقابلية الطعن", "Security, robustness & accuracy": "الأمن والمتانة والدقة",
  "Mitigations & residual risk": "الإجراءات والخطر المتبقي",
  // systems
  "Credit Decision Assurance": "ضمان قرارات الائتمان", "Workforce Skills Navigator": "مُوجّه مهارات القوى العاملة",
  "Finance Close Automation": "أتمتة إقفال الحسابات",
  "Leila Haddad · CAIO": "ليلى حداد · مسؤول الذكاء الاصطناعي", "D. Osei · Model Risk": "د. أوسي · مخاطر النماذج",
  // classifications
  "High-risk, Annex III. Full FRIA + DPIA complete; mandatory human oversight (Art. 14), Art. 22 reason codes and a quarterly outcome audit are the standing mitigations.": "عالي الخطورة، الملحق الثالث. اكتمل تقييم الحقوق الأساسية + تقييم الخصوصية؛ والإشراف البشري الإلزامي (المادة 14)، ورموز أسباب المادة 22، وتدقيق النتائج الفصلي هي الإجراءات القائمة.",
  "High-risk (employment). FRIA + DPIA complete; consent, bias evaluation and worker-facing transparency are the standing mitigations, with human review of any adverse recommendation.": "عالي الخطورة (التوظيف). اكتمل تقييم الحقوق الأساسية + تقييم الخصوصية؛ والموافقة، وتقييم التحيّز، والشفافية تجاه العاملين هي الإجراءات القائمة، مع مراجعة بشرية لأي توصية سلبية.",
  "Limited-risk. DPIA complete on the personal-data flow; fundamental-rights, bias and oversight sections are in review ahead of any expansion into decisioning.": "محدود الخطورة. اكتمل تقييم الخصوصية على تدفّق البيانات الشخصية؛ وأقسام الحقوق الأساسية والتحيّز والإشراف قيد المراجعة قبل أي توسّع نحو اتخاذ القرار.",
  "Limited-risk, no personal data of consequence and a human approval gate — screened in, impact assessment light, DPIA not required.": "محدود الخطورة، دون بيانات شخصية ذات أثر ومع بوابة اعتماد بشرية — فُرز، وتقييم الأثر مخفّف، وتقييم الخصوصية غير مطلوب.",
  // triggers
  "Annex III — access to credit": "الملحق الثالث — الحصول على الائتمان", "Annex III — employment & worker management": "الملحق الثالث — التوظيف وإدارة العاملين",
  "Approval gate in place": "بوابة اعتماد قائمة", "Automated decision with legal effect": "قرار آلي بأثر قانوني",
  "Customer-facing AI interaction": "تفاعل ذكاء اصطناعي مع العملاء", "Personal & financial data": "بيانات شخصية ومالية",
  "Personal data in prompts": "بيانات شخصية في الإدخالات", "Personal data": "بيانات شخصية",
  "Process automation over financial records": "أتمتة عمليات على السجلات المالية", "Profiling / recommendation": "التنميط / التوصية",
  // workflow
  "The lifecycle · one assessment, six stages": "دورة الحياة · تقييم واحد، ست مراحل",
  "Screen": "الفرز", "Consult": "الاستشارة", "Mitigate": "المعالجة", "Sign-off": "الاعتماد", "Review": "المراجعة",
  "Does the system need an assessment? Tier it (Annex III / automated decision / personal data) and pick the regimes in scope.": "هل يحتاج النظام إلى تقييم؟ صنّفه (الملحق الثالث / قرار آلي / بيانات شخصية) واختر الأنظمة في النطاق.",
  "Work every dimension — purpose, data, affected people, fundamental rights, bias, oversight, security.": "اعمل على كل بُعد — الغرض، البيانات، المتأثرون، الحقوق الأساسية، التحيّز، الإشراف، الأمن.",
  "Consult affected stakeholders and, where residual risk stays high, the supervisory authority (GDPR Art. 36).": "استشر أصحاب المصلحة المتأثرين، وحيث يبقى الخطر المتبقي عالياً، الجهة الرقابية (GDPR المادة 36).",
  "Design controls until residual risk is acceptable; route them to the Risk Center as treatments.": "صمّم الضوابط حتى يصبح الخطر المتبقي مقبولاً؛ ووجّهها إلى مركز المخاطر كإجراءات.",
  "Accountable sign-off records the classification and the deploy / hold decision before go-live.": "يسجّل الاعتماد المسؤول التصنيف وقرار النشر / التعليق قبل الإطلاق.",
  "Re-open on material change or on cadence; keep the record fresh in the Evidence Fabric.": "أعد الفتح عند تغيّر جوهري أو دورياً؛ وأبقِ السجل حديثاً في نسيج الأدلة.",
  "CAIO + CDPO": "مسؤول الذكاء الاصطناعي + حماية البيانات", "System owner": "مالك النظام", "CAIO + CRO": "مسؤول الذكاء الاصطناعي + المخاطر",
  "Governance Forum": "منتدى الحوكمة",
  // buttons
  "Screen a new system": "افرز نظاماً جديداً", "Export assessment pack": "تصدير حزمة التقييم",
});
import {
  INSTRUMENTS, CROSSWALK, CROSSWALK_DOMAINS, STATUS_META, crosswalkStats,
} from "@/lib/crosswalk";
import { PROHIBITED_PRACTICES, PP_RESULT_META, prohibitedStats } from "@/lib/prohibited";
import { GPAI_QUESTIONS, GPAI_REGISTER, EXPOSURE_META, gpaiExposure, gpaiStats } from "@/lib/gpai";
import { gapClosureRows, gapClosureStats } from "@/lib/gap-closure";
import {
  ASSESSMENT_DIMENSIONS, AIA_REGIMES, AIA_REGISTER, ASSESSMENT_WORKFLOW,
  aiaCompleteness, aiaStatus, aiaRegimesFor, aiaStats,
} from "@/lib/impact-assessment";

/* Arabic content for the six converged surfaces — Governance Forum, Incident
   Playbook, Convergence Crosswalk, Prohibited Practices, GPAI Exposure and Gap
   Closure. Keyed by the English string; missing strings fall back to English.
   Already-registered keys (EU AI Act, Governance Forum, system + person names,
   Yes/No/Ref/Status/Gap/Notify/Basis, the shared incident titles) are reused,
   not re-declared. */
registerContent({
  /* ── shared status / role vocabulary ── */
  "Operational": "تشغيلي", "In progress": "قيد التنفيذ", "Gaps": "الفجوات",
  "Security": "الأمن", "Owner": "المالك", "Capability": "القدرة", "Evidence artifact": "أثر الأدلة",
  "Article": "المادة", "Legal": "الشؤون القانونية", "Model Risk": "مخاطر النماذج", "Procurement": "المشتريات",
  "Fraud Detection Model": "نموذج كشف الاحتيال",

  /* ── 1 · Governance Forum ── */
  "One senior forum owning policy, risk tiering, exceptions and escalation across data + AI — not parallel committees running different playbooks. Every item below traces to the live registers.": "منتدى واحد رفيع المستوى يملك السياسات وتصنيف المخاطر والاستثناءات والتصعيد عبر البيانات والذكاء الاصطناعي — لا لجان متوازية تُشغّل أدلة مختلفة. وكل بند أدناه يتتبّع إلى السجلات الحيّة.",
  "Convergence charter": "ميثاق التقارب",
  "Data & AI governance, run as one agenda": "حوكمة البيانات والذكاء الاصطناعي، تُدار كأجندة واحدة",
  "Monthly council · weekly triage · quarterly board oversight": "مجلس شهري · فرز أسبوعي · إشراف مجلس فصلي",
  "✦ Assemble council pack": "✦ تجميع حزمة المجلس",
  "The council · single operating rhythm": "المجلس · إيقاع تشغيلي واحد",
  "One seat per domain — no silos": "مقعد واحد لكل مجال — بلا صوامع",
  "Chair · Enterprise Governance": "الرئيس · حوكمة المؤسسة",
  "Policy, risk tiering, exceptions, escalation": "السياسات، تصنيف المخاطر، الاستثناءات، التصعيد",
  "AI Governance Office": "مكتب حوكمة الذكاء الاصطناعي",
  "AI systems, lifecycle, model governance": "أنظمة الذكاء الاصطناعي، دورة الحياة، حوكمة النماذج",
  "Access, threat, model misuse, breach response": "الوصول، التهديد، إساءة استخدام النماذج، الاستجابة للخروقات",
  "Data Protection & Privacy": "حماية البيانات والخصوصية",
  "Data lineage, DPIA, retention, residency": "سلالة البيانات، تقييم أثر الخصوصية، الاحتفاظ، الإقامة",
  "Enterprise Risk": "مخاطر المؤسسة",
  "Risk appetite, KRIs, treatment sign-off": "شهية المخاطر، مؤشرات المخاطر الرئيسية، اعتماد المعالجة",
  "AI Platform": "منصة الذكاء الاصطناعي",
  "Data platform, gateway, integrations": "منصة البيانات، البوابة، التكاملات",
  "Single-point ownership · cross-trigger": "ملكية بنقطة واحدة · تحفيز متبادل",
  "Data policy and AI review move together": "سياسة البيانات ومراجعة الذكاء الاصطناعي تتحركان معاً",
  "Domain": "المجال", "Lead": "المسؤول الأول", "Automatic cross-trigger": "تحفيز متبادل تلقائي",
  "Data governance": "حوكمة البيانات",
  "Data-policy change → AI use-case review": "تغيّر سياسة البيانات ← مراجعة حالة استخدام الذكاء الاصطناعي",
  "AI governance": "حوكمة الذكاء الاصطناعي",
  "New / changed model → DPIA + risk re-tier": "نموذج جديد / مُعدَّل ← تقييم أثر الخصوصية + إعادة تصنيف الخطر",
  "Privacy": "الخصوصية",
  "New personal-data flow → residency + retention check": "تدفّق بيانات شخصية جديد ← فحص الإقامة والاحتفاظ",
  "Access / exposure change → control re-test": "تغيّر الوصول / التعرّض ← إعادة اختبار الضابط",
  "Enterprise risk": "مخاطر المؤسسة",
  "Material risk change → board escalation": "تغيّر خطر جوهري ← تصعيد إلى المجلس",
  "This month's agenda · one queue across data + AI": "أجندة هذا الشهر · قائمة واحدة عبر البيانات والذكاء الاصطناعي",
  "Risk tiering · exceptions · escalations — the forum's live decisions": "تصنيف المخاطر · الاستثناءات · التصعيدات — قرارات المنتدى الحيّة",
  "Type": "النوع", "Item": "البند", "Tier": "الفئة",
  "Risk tiering": "تصنيف المخاطر", "Policy exception": "استثناء سياسة", "Escalation": "تصعيد", "Policy review": "مراجعة سياسة",
  "Critical": "حرِج", "High": "عالٍ", "Medium": "متوسط", "Low": "منخفض",
  "Confirm tier & treatment": "تأكيد الفئة والمعالجة",
  "Grant / deny with conditions": "منح / رفض بشروط",
  "Escalate to board · set remediation deadline": "تصعيد إلى المجلس · تحديد مهلة المعالجة",
  "Ratify updated policy": "المصادقة على السياسة المُحدَّثة",
  "Data-retention exception — Customer Ops pilot (30-day window)": "استثناء الاحتفاظ بالبيانات — تجربة عمليات العملاء (نافذة 30 يوماً)",
  "Model-validation control ineffective across 3 systems": "ضابط التحقق من النماذج غير فعّال عبر 3 أنظمة",
  "Acceptable-use policy overdue 12 days": "سياسة الاستخدام المقبول متأخرة 12 يوماً",

  /* ── 2 · Incident Playbook ── */
  "Incident Playbook": "دليل الاستجابة للحوادث",
  "One response playbook across breaches, model failures, harmful outputs and regulatory notifications — consolidating what used to be separate AI, security and privacy incident queues.": "دليل استجابة واحد عبر الخروقات وإخفاقات النماذج والمخرجات الضارة والإبلاغات التنظيمية — يوحّد ما كان قوائم حوادث منفصلة للذكاء الاصطناعي والأمن والخصوصية.",
  "Open incidents": "حوادث مفتوحة",
  "On the regulatory clock": "على الساعة التنظيمية", "notification in progress": "الإبلاغ قيد التنفيذ",
  "Classes covered": "الفئات المشمولة", "one register, one playbook": "سجل واحد، دليل واحد",
  "The one register · every incident class": "السجل الواحد · كل فئة حادث",
  "Breach · model failure · harmful output · regulatory · security": "خرق · إخفاق نموذج · مخرج ضار · تنظيمي · أمني",
  "Data breach": "خرق بيانات", "Model failure": "إخفاق نموذج", "Harmful output": "مخرج ضار", "Regulatory": "تنظيمي",
  "Incident": "الحادث", "Class": "الفئة", "Regulatory clock": "الساعة التنظيمية",
  "Biased / harmful response in eligibility scoring": "استجابة متحيّزة / ضارة في تقييم الأهلية",
  "Model drift breached the validated envelope — fraud signals": "انحراف النموذج تجاوز النطاق المُتحقَّق منه — إشارات احتيال",
  "P1 · Critical": "P1 · حرِج", "P2 · High": "P2 · عالٍ", "P3 · Medium": "P3 · متوسط",
  "Today 09:14": "اليوم 09:14", "Today 11:02": "اليوم 11:02", "3d ago": "قبل 3 أيام", "Yesterday 14:30": "أمس 14:30", "2d ago": "قبل يومين",
  "Investigating": "قيد التحقيق", "Triage": "الفرز", "Contained": "مُحتوى", "Mitigating": "قيد التخفيف",
  "GDPR Art.33 assessed — attack blocked, no data left the boundary": "قُيّم بموجب GDPR المادة 33 — صُدّ الهجوم، ولم تغادر بيانات الحدود",
  "EU AI Act Art.14 human-oversight review triggered": "أُطلقت مراجعة الإشراف البشري بموجب قانون الذكاء الاصطناعي الأوروبي المادة 14",
  "GDPR Art.44 transfer impact assessment complete — mapping in place": "اكتمل تقييم أثر النقل بموجب GDPR المادة 44 — الخريطة قائمة",
  "Internal — no external notification required": "داخلي — لا يلزم إبلاغ خارجي",
  "GDPR Art.33 assessed — near-miss, no notification (logged)": "قُيّم بموجب GDPR المادة 33 — شبه تسريب، دون إبلاغ (مُوثَّق)",
  "One response playbook · same stages for every class": "دليل استجابة واحد · المراحل نفسها لكل فئة",
  "Detect": "الكشف", "Contain": "الاحتواء", "Remediate": "المعالجة", "Evidence": "الأدلة",
  "One intake for every signal — gateway, drift monitor, DLP, SIEM or user report.": "مدخل واحد لكل إشارة — البوابة، مراقب الانحراف، DLP، SIEM أو بلاغ مستخدم.",
  "Automated / any lead": "آلي / أي مسؤول",
  "Classify (breach / model / harmful / regulatory), set severity, assign a single owner.": "صنّف (خرق / نموذج / ضار / تنظيمي)، حدّد الخطورة، وعيّن مالكاً واحداً.",
  "On-call + domain lead": "المناوب + مسؤول المجال",
  "Stop the harm: block, throttle, roll back, revoke access or mask.": "أوقف الضرر: احجب، اخنق، تراجع، ألغِ الوصول أو أخفِ.",
  "Domain lead": "مسؤول المجال",
  "One notification decision against the regulatory clock — GDPR Art.33 (72h), EU AI Act, sector rules.": "قرار إبلاغ واحد مقابل الساعة التنظيمية — GDPR المادة 33 (72 ساعة)، قانون الذكاء الاصطناعي الأوروبي، قواعد القطاع.",
  "CDPO + Legal + CGO": "مسؤول حماية البيانات + القانونية + مسؤول الحوكمة",
  "Fix root cause: retrain, patch, re-tier risk, update controls & policy.": "عالج السبب الجذري: أعد التدريب، رقّع، أعد تصنيف الخطر، حدّث الضوابط والسياسة.",
  "Close with an evidence pack in the Evidence Fabric; feed lessons back to the forum.": "أغلِق بحزمة أدلة في نسيج الأدلة؛ وأعد الدروس إلى المنتدى.",
  "Start a response run": "ابدأ جولة استجابة", "Export evidence pack": "تصدير حزمة الأدلة",

  /* ── 3 · Convergence Crosswalk ── */
  "Convergence Crosswalk": "جدول التقارب",
  "One control set, not four. Each capability below is a single control — evidenced by a single artifact — that satisfies the matching clause in the EU AI Act, the NIST AI RMF, ISO/IEC 42001 and Singapore's Model AI Governance Framework at once. Build once instead of four times.": "مجموعة ضوابط واحدة، لا أربع. كل قدرة أدناه هي ضابط واحد — مُثبَت بأثر واحد — يستوفي البند المقابل في قانون الذكاء الاصطناعي الأوروبي وإطار NIST لإدارة مخاطر الذكاء الاصطناعي والأيزو/IEC 42001 وإطار سنغافورة النموذجي لحوكمة الذكاء الاصطناعي دفعة واحدة. ابنِ مرة واحدة بدل أربع.",
  "The master map": "الخريطة الرئيسية",
  "CONVERGENCE COVERAGE": "تغطية التقارب",
  "Capabilities": "القدرات", "one control each": "ضابط واحد لكلٍّ", "evidenced & fresh": "مُثبَت وحديث",
  "artifact being closed": "الأثر قيد الإغلاق", "no artifact yet": "لا أثر بعد",
  "The four instruments · one system": "الأدوات الأربع · نظام واحد",
  "Binding law, a framework, a standard and guidance — mapped together": "قانون مُلزِم، وإطار، ومعيار، وإرشاد — مُخطَّطة معاً",
  "Binding law": "قانون مُلزِم", "Voluntary framework": "إطار طوعي", "Certifiable standard": "معيار قابل للاعتماد", "Voluntary guidance": "إرشاد طوعي",
  "Singapore MGF": "إطار سنغافورة",
  "EU AI Office + national authorities": "مكتب الذكاء الاصطناعي الأوروبي + السلطات الوطنية",
  "Self-adopted (US)": "مُتبنّى ذاتياً (الولايات المتحدة)",
  "Accredited certification body": "جهة اعتماد معتمدة",
  "All domains": "كل المجالات",
  "One artifact satisfies all four — click any row": "أثر واحد يستوفي الأربعة جميعاً — انقر أي صف",
  "Export crosswalk": "تصدير الجدول",
  "Accountability & Governance": "المساءلة والحوكمة", "Risk & Impact": "المخاطر والأثر", "Data": "البيانات",
  "Model & Technical": "النموذج والتقني", "Oversight & Transparency": "الإشراف والشفافية",
  "Operations & Lifecycle": "العمليات ودورة الحياة", "Assurance & Redress": "الضمان والإنصاف",
  "Internal governance": "الحوكمة الداخلية", "Risk-based approach": "نهج قائم على المخاطر", "Data quality": "جودة البيانات",
  "Operations mgmt": "إدارة العمليات", "Stakeholder interaction": "تفاعل أصحاب المصلحة", "Human-in-the-loop": "الإنسان في الحلقة",
  "AI governance structure & accountability": "هيكل حوكمة الذكاء الاصطناعي والمساءلة",
  "Governance charter & RACI": "ميثاق الحوكمة وRACI",
  "One accountable owner per system replaces four committee mandates.": "مالك مسؤول واحد لكل نظام يحل محل أربع تفويضات لجان.",
  "Roles, competence & AI literacy": "الأدوار والكفاءة ومعرفة الذكاء الاصطناعي",
  "AI literacy & training register": "سجل معرفة الذكاء الاصطناعي والتدريب",
  "Training coverage at 54% — the literacy duty is common to all four.": "تغطية التدريب 54% — واجب المعرفة مشترك بين الأربعة جميعاً.",
  "AI policy framework": "إطار سياسات الذكاء الاصطناعي",
  "Policy library (15 policies)": "مكتبة السياسات (15 سياسة)",
  "The 15-policy library is the single acceptable-use source of record.": "مكتبة السياسات الخمس عشرة هي المصدر المرجعي الوحيد للاستخدام المقبول.",
  "Risk management framework": "إطار إدارة المخاطر",
  "Risk management procedure": "إجراء إدارة المخاطر",
  "One procedure drives Art. 9, the RMF functions and Annex A at once.": "إجراء واحد يقود المادة 9 ووظائف RMF والملحق A دفعة واحدة.",
  "AI system inventory & registration": "جرد أنظمة الذكاء الاصطناعي وتسجيلها",
  "AI system register": "سجل أنظمة الذكاء الاصطناعي",
  "Controls with no inventory behind them cannot be traced to anything.": "الضوابط التي لا جرد وراءها لا يمكن تتبّعها إلى أي شيء.",
  "Risk classification & tiering": "تصنيف المخاطر وتحديد فئاتها",
  "Classification decision record": "سجل قرار التصنيف",
  "Tier is derived once, then it sets deadline, control load and oversight depth.": "تُشتق الفئة مرة واحدة، ثم تحدد المهلة وحِمل الضوابط وعمق الإشراف.",
  "Fundamental-rights & data-protection impact assessment": "تقييم الأثر على الحقوق الأساسية وحماية البيانات",
  "FRIA / DPIA report": "تقرير FRIA / DPIA",
  "One assessment answers the FRIA, the impact clause and the DPIA.": "تقييم واحد يجيب عن FRIA وبند الأثر وDPIA.",
  "Prohibited-practice screening (red lines)": "فرز الممارسات المحظورة (الخطوط الحمراء)",
  "Prohibited-use attestation": "إقرار عدم الاستخدام المحظور",
  "Screened against all 8 red lines — 7 clear; emotion-recognition at work under review before the attestation can be signed.": "فُرزت مقابل الخطوط الحمراء الثمانية جميعاً — 7 خالية؛ والتعرّف على المشاعر في العمل قيد المراجعة قبل التمكن من توقيع الإقرار.",
  "Inherent & residual risk scoring": "تسجيل الخطر المتأصل والمتبقي",
  "Risk register (inherent + residual)": "سجل المخاطر (المتأصل + المتبقي)",
  "The same residual scores the Risk Center and AI Central already cite.": "درجات الخطر المتبقي نفسها التي يستشهد بها مركز المخاطر ومركز الذكاء الاصطناعي بالفعل.",
  "Data governance & quality": "حوكمة البيانات وجودتها",
  "Data quality statement": "بيان جودة البيانات",
  "Data quality is inseparable from model performance across all four.": "جودة البيانات لا تنفصل عن أداء النماذج عبر الأربعة جميعاً.",
  "Data provenance & lineage": "مصدر البيانات وسلالتها",
  "Data lineage record": "سجل سلالة البيانات",
  "Lineage is captured at the pipeline, evidenced once.": "تُلتقط السلالة عند خط المعالجة، وتُثبَت مرة واحدة.",
  "Personal-data protection & residency": "حماية البيانات الشخصية والإقامة",
  "DPIA + transfer mapping": "DPIA + خريطة النقل",
  "APAC transfer impact assessment complete — Art. 44 mapping closed (INC-1048 contained).": "اكتمل تقييم أثر النقل لآسيا-الهادئ — أُغلقت خريطة المادة 44 (احتُوي INC-1048).",
  "Training-data documentation": "توثيق بيانات التدريب",
  "Dataset datasheet": "صحيفة بيانات المجموعة",
  "One datasheet feeds Annex IV and the ISO data-record control.": "صحيفة بيانات واحدة تُغذّي الملحق الرابع وضابط سجل البيانات في الأيزو.",
  "Technical documentation": "التوثيق التقني",
  "Technical documentation pack": "حزمة التوثيق التقني",
  "Annex IV structure doubles as the ISO system-documentation control.": "بنية الملحق الرابع تعمل أيضاً كضابط توثيق النظام في الأيزو.",
  "Model cards": "بطاقات النماذج",
  "Model card": "بطاقة النموذج",
  "4 of 8 model cards complete — the same figure AI Central reports.": "اكتملت 4 من 8 بطاقات نماذج — الرقم نفسه الذي يبلغ عنه مركز الذكاء الاصطناعي.",
  "Accuracy & performance validation": "التحقق من الدقة والأداء",
  "Validation report": "تقرير التحقق",
  "One validation report evidences accuracy for all four.": "تقرير تحقق واحد يُثبت الدقة للأربعة جميعاً.",
  "Bias & fairness testing": "اختبار التحيّز والإنصاف",
  "Fairness workbook": "دفتر عمل الإنصاف",
  "Bias risk RSK-003 open on the credit model — one workbook closes it.": "خطر التحيّز RSK-003 مفتوح على نموذج الائتمان — دفتر عمل واحد يغلقه.",
  "Explainability & interpretability": "القابلية للتفسير والتأويل",
  "Explainability record": "سجل القابلية للتفسير",
  "Explainability record operational — SHAP reason codes + Art. 22 explanations live (RSK-005 treated).": "سجل القابلية للتفسير تشغيلي — رموز أسباب SHAP + تفسيرات المادة 22 مباشرة (عُولج RSK-005).",
  "Robustness, security & adversarial (OWASP LLM · MITRE ATLAS)": "المتانة والأمن والخصومة (OWASP LLM · MITRE ATLAS)",
  "Red-team & security test report": "تقرير اختبار الفريق الأحمر والأمن",
  "Prompt-injection & model-poisoning tests map to one crosswalk row.": "اختبارات حقن التعليمات وتسميم النماذج تُخطَّط إلى صف واحد في الجدول.",
  "Logging & record-keeping": "التسجيل وحفظ السجلات",
  "Automatic event logs": "سجلات أحداث تلقائية",
  "Gateway logs every inference — one log stream, four obligations.": "تسجّل البوابة كل استدلال — تيار سجل واحد، أربعة التزامات.",
  "Human oversight (HITL / HOTL)": "الإشراف البشري (HITL / HOTL)",
  "Human-oversight design record": "سجل تصميم الإشراف البشري",
  "Awaiting approval — clearing it unblocks the Credit scale gate.": "بانتظار الاعتماد — إنهاؤه يفكّ حجب بوابة توسّع الائتمان.",
  "Transparency to affected persons": "الشفافية تجاه الأشخاص المتأثرين",
  "Transparency notice": "إشعار الشفافية",
  "One notice satisfies the Art. 13 duty and the ISO information control.": "إشعار واحد يستوفي واجب المادة 13 وضابط المعلومات في الأيزو.",
  "GenAI output marking & disclosure": "وسم مخرجات الذكاء الاصطناعي التوليدي والإفصاح",
  "AI-content labelling standard": "معيار وسم محتوى الذكاء الاصطناعي",
  "Enterprise AI-content labelling standard published — machine-generated output marked per Art. 50.": "نُشر معيار المؤسسة لوسم محتوى الذكاء الاصطناعي — تُوسَم المخرجات المولّدة آلياً وفق المادة 50.",
  "GPAI / systemic-risk obligations": "التزامات الذكاء الاصطناعي العام / المخاطر النظامية",
  "GPAI provider assessment": "تقييم مزوّد الذكاء الاصطناعي العام",
  "Accidental-provider test run across GenAI systems — 1 likely-provider flag (Copilot) now in Art. 53 assessment.": "أُجري اختبار المزوّد العَرَضي عبر أنظمة الذكاء الاصطناعي التوليدي — إشارة مزوّد محتمل واحدة (Copilot) قيد تقييم المادة 53 الآن.",
  "Deployer operational readiness": "الجاهزية التشغيلية للمُشغِّل",
  "Deployment readiness checklist": "قائمة تحقق جاهزية النشر",
  "One go-live checklist covers deployer duties and ISO operations.": "قائمة إطلاق واحدة تغطي واجبات المُشغِّل وعمليات الأيزو.",
  "Post-market monitoring": "مراقبة ما بعد السوق",
  "Post-market monitoring plan": "خطة مراقبة ما بعد السوق",
  "Continuous monitoring is one plan, referenced by all four.": "المراقبة المستمرة خطة واحدة، تشير إليها الأربعة جميعاً.",
  "Drift & change management": "إدارة الانحراف والتغيير",
  "Drift monitoring configuration": "إعداد مراقبة الانحراف",
  "All production models wired to drift monitoring — behavioural-shift detection live (Art. 72).": "جميع نماذج الإنتاج موصولة بمراقبة الانحراف — كشف التحوّل السلوكي مباشر (المادة 72).",
  "Third-party / supplier AI management": "إدارة الذكاء الاصطناعي للأطراف الثالثة / المورّدين",
  "Vendor assessment + DPA": "تقييم المورّد + DPA",
  "One vendor pack carries the value-chain duty and the ISO supplier control.": "حزمة مورّد واحدة تحمل واجب سلسلة القيمة وضابط المورّد في الأيزو.",
  "Conformity assessment & Statement of Applicability": "تقييم المطابقة وبيان قابلية التطبيق",
  "Conformity assessment + SoA": "تقييم المطابقة + SoA",
  "The SoA is the index an auditor and the conformity file both read.": "بيان قابلية التطبيق هو الفهرس الذي يقرأه كل من المدقّق وملف المطابقة.",
  "Serious-incident reporting": "الإبلاغ عن الحوادث الجسيمة",
  "Incident register + notification log": "سجل الحوادث + سجل الإبلاغ",
  "The unified incident register already runs against the Art. 33/73 clock.": "سجل الحوادث الموحّد يعمل بالفعل مقابل ساعة المادة 33/73.",
  "Corrective action & continual improvement": "الإجراء التصحيحي والتحسين المستمر",
  "CAPA log": "سجل CAPA",
  "One corrective-action log feeds the forum's lessons loop.": "سجل إجراء تصحيحي واحد يُغذّي حلقة دروس المنتدى.",
  "Redress & complaint handling": "الإنصاف ومعالجة الشكاوى",
  "Complaints & appeals log": "سجل الشكاوى والطعون",
  "Complaints & appeals channel stood up — affected persons can contest a decision (Art. 85).": "أُنشئت قناة الشكاوى والطعون — يمكن للأشخاص المتأثرين الطعن في قرار (المادة 85).",

  /* ── 4 · Prohibited Practices ── */
  "Prohibited Practices": "الممارسات المحظورة",
  "The eight red lines of EU AI Act Article 5. These are a stop, not a control: a system in scope is not governed, it is not deployed. Every system is screened here before any risk tiering begins.": "الخطوط الحمراء الثمانية في المادة 5 من قانون الذكاء الاصطناعي الأوروبي. هذه إيقاف، لا ضابط: النظام الواقع في النطاق لا يُحوكَم، ولا يُنشَر. ويُفرَز كل نظام هنا قبل أن يبدأ أي تصنيف للمخاطر.",
  "The one that catches ordinary companies": "الخط الذي يوقع الشركات العادية",
  "Practices screened": "ممارسات جرى فرزها", "EU AI Act Art. 5": "قانون الذكاء الاصطناعي الأوروبي المادة 5",
  "Clear": "خالٍ", "no system in scope": "لا نظام في النطاق",
  "Under review": "قيد المراجعة", "confirm before deploy": "أكّد قبل النشر",
  "Prohibited in use": "محظور قيد الاستخدام", "would require a stop": "يستلزم إيقافاً",
  "The eight red lines · screened against the estate": "الخطوط الحمراء الثمانية · مفروزة مقابل المنشأة",
  "Where the answer is stop, not control": "حيث يكون الجواب إيقافاً، لا ضبطاً",
  "Prohibited practice": "الممارسة المحظورة", "What it catches": "ما الذي تلتقطه",
  "System in scope": "النظام في النطاق", "Screen": "الفرز", "everyday risk": "خطر يومي",
  "In scope here:": "في النطاق هنا:",
  "Subliminal or manipulative techniques": "تقنيات لا شعورية أو تلاعبية",
  "Techniques beyond a person's awareness that materially distort behaviour and cause significant harm.": "تقنيات تتجاوز وعي الشخص فتشوّه السلوك جوهرياً وتسبب ضرراً بالغاً.",
  "No persuasion or nudging system in the estate operates below user awareness.": "لا يوجد نظام إقناع أو توجيه في المنشأة يعمل دون وعي المستخدم.",
  "Exploiting vulnerabilities": "استغلال نقاط الضعف",
  "Exploiting age, disability or socio-economic situation to distort behaviour.": "استغلال العمر أو الإعاقة أو الوضع الاجتماعي-الاقتصادي لتشويه السلوك.",
  "No system targets a protected vulnerable group.": "لا يستهدف أي نظام فئة ضعيفة محمية.",
  "Social scoring": "التقييم الاجتماعي",
  "General-purpose scoring of people from unrelated behaviour that leads to detrimental treatment.": "تقييم عام للأشخاص من سلوك غير ذي صلة يؤدي إلى معاملة ضارة.",
  "Credit scoring is regulated high-risk (Annex III), NOT Art. 5 social scoring — confirmed scoped-out.": "تقييم الائتمان عالي الخطورة منظَّم (الملحق الثالث)، وليس تقييماً اجتماعياً بموجب المادة 5 — أُكّد خروجه من النطاق.",
  "Predictive policing from profiling": "الشرطة التنبؤية من التنميط",
  "Predicting criminal offending from profiling or personality traits alone.": "التنبؤ بارتكاب الجرائم من التنميط أو سمات الشخصية وحدها.",
  "No law-enforcement or offence-prediction use.": "لا استخدام لإنفاذ القانون أو التنبؤ بالجرائم.",
  "Untargeted facial-image scraping": "الكشط غير المستهدف لصور الوجوه",
  "Building or expanding facial-recognition databases by untargeted scraping of the web or CCTV.": "بناء أو توسيع قواعد بيانات التعرّف على الوجوه بالكشط غير المستهدف للويب أو كاميرات المراقبة.",
  "No facial-recognition database is built or expanded.": "لا تُبنى أو تُوسَّع أي قاعدة بيانات للتعرّف على الوجوه.",
  "Emotion recognition at work or in education": "التعرّف على المشاعر في العمل أو التعليم",
  "Inferring the emotions of employees or students — the red line that catches ordinary enterprises through HR and productivity tooling.": "استنتاج مشاعر الموظفين أو الطلاب — الخط الأحمر الذي يوقع المؤسسات العادية عبر أدوات الموارد البشرية والإنتاجية.",
  "Confirm the sentiment tooling classifies feedback text only and does NOT infer individual employee emotions. Attestation is blocked until confirmed.": "أكّد أن أداة تحليل المشاعر تصنّف نص الملاحظات فقط ولا تستنتج مشاعر الموظفين الأفراد. الإقرار محجوب حتى التأكيد.",
  "Workforce Skills Navigator · Sentiment & Feedback": "مُوجّه مهارات القوى العاملة · المشاعر والملاحظات",
  "Biometric categorisation of sensitive traits": "التصنيف الحيوي للسمات الحساسة",
  "Inferring race, political opinion, union membership, religion, sex life or sexual orientation from biometric data.": "استنتاج العِرق أو الرأي السياسي أو العضوية النقابية أو الدين أو الحياة الجنسية أو التوجّه الجنسي من البيانات الحيوية.",
  "No biometric categorisation in the estate.": "لا تصنيف حيوي في المنشأة.",
  "Real-time remote biometric identification": "التعرّف الحيوي عن بُعد في الوقت الفعلي",
  "Live remote biometric identification in public spaces for law enforcement (narrow exceptions only).": "تعرّف حيوي مباشر عن بُعد في الأماكن العامة لإنفاذ القانون (استثناءات ضيقة فقط).",
  "Not a law-enforcement operator; no public-space biometric identification.": "ليست جهة إنفاذ قانون؛ لا تعرّف حيوي في الأماكن العامة.",
  "In scope — stop": "في النطاق — إيقاف",
  "Clear to attest — no prohibited use": "خالٍ للإقرار — لا استخدام محظور",
  "The attestation is the single evidence artifact that closes crosswalk capability C08 across all four instruments. It cannot be signed while any practice is under review.": "الإقرار هو أثر الأدلة الوحيد الذي يغلق قدرة الجدول C08 عبر الأدوات الأربع جميعاً. ولا يمكن توقيعه ما دامت أي ممارسة قيد المراجعة.",
  "✦ Sign attestation": "✦ توقيع الإقرار", "Open the review": "افتح المراجعة",

  /* ── 5 · GPAI Exposure ── */
  "GPAI Exposure": "التعرّض للذكاء الاصطناعي العام",
  "The accidental-provider test — EU AI Act Art. 53 & 55. Modify a general-purpose model and share it beyond the team that modified it, and you may hold provider obligations with no procurement or board decision ever taken. Two yes answers flag the system.": "اختبار المزوّد العَرَضي — قانون الذكاء الاصطناعي الأوروبي المادة 53 و55. عدّل نموذجاً عام الغرض وشاركه خارج الفريق الذي عدّله، وقد تتحمّل التزامات المزوّد دون أي قرار شراء أو مجلس. إجابتان بنعم تُعلِمان النظام.",
  "You answer": "أنت تجيب",
  "Did we modify the model?": "هل عدّلنا النموذج؟",
  "Fine-tuning, distillation or continued pre-training — anything that changes the model rather than just calling it.": "الضبط الدقيق أو التقطير أو مواصلة التدريب المسبق — أي شيء يغيّر النموذج بدل مجرد استدعائه.",
  "Did we make it available beyond the team that modified it?": "هل أتحناه خارج الفريق الذي عدّله؟",
  "Another business unit counts. A group entity counts. Your own product counts.": "وحدة أعمال أخرى تُحتسب. كيان مجموعة يُحتسب. منتجك أنت يُحتسب.",
  "The workbook derives": "دفتر العمل يشتق",
  "Your GPAI exposure": "تعرّضك للذكاء الاصطناعي العام",
  "Two yes answers and the row flags. You may hold provider obligations under Articles 53 and 55.": "إجابتان بنعم ويُعلَم الصف. قد تتحمّل التزامات المزوّد بموجب المادتين 53 و55.",
  "Modified + shared → likely provider · assess": "مُعدَّل + مُشارَك ← مزوّد محتمل · قيّم",
  "Modified only → monitor": "مُعدَّل فقط ← راقب",
  "Called, not modified → deployer only": "مُستدعى، غير مُعدَّل ← مُشغِّل فقط",
  "GenAI systems assessed": "أنظمة ذكاء اصطناعي توليدي جرى تقييمها",
  "Likely provider": "مزوّد محتمل", "Art. 53/55 obligations": "التزامات المادة 53/55",
  "Monitor": "مراقبة", "modified, not yet shared": "مُعدَّل، لم يُشارَك بعد",
  "Deployer only": "مُشغِّل فقط", "no provider duty": "لا واجب مزوّد",
  "GPAI exposure register · every GenAI system": "سجل التعرّض للذكاء الاصطناعي العام · كل نظام ذكاء اصطناعي توليدي",
  "Modified · shared beyond the team · derived exposure": "مُعدَّل · مُشارَك خارج الفريق · تعرّض مُشتق",
  "Modified?": "مُعدَّل؟", "Shared beyond team?": "مُشارَك خارج الفريق؟", "Exposure": "التعرّض", "Obligation": "الالتزام",
  "Document Summarisation AI": "ذكاء تلخيص المستندات",
  "Foundation LLM, fine-tuned on support transcripts": "نموذج لغوي أساسي، مضبوط دقيقاً على محادثات الدعم",
  "Foundation LLM, lightly fine-tuned": "نموذج لغوي أساسي، مضبوط دقيقاً بشكل خفيف",
  "Foundation LLM via API — not modified": "نموذج لغوي أساسي عبر واجهة برمجية — غير مُعدَّل",
  "Bespoke narrow model — not a GPAI": "نموذج ضيّق مُخصَّص — ليس ذكاءً اصطناعياً عاماً",
  "Process automation — not a GPAI": "أتمتة عمليات — ليست ذكاءً اصطناعياً عاماً",
  "Art. 53 · Art. 55 if systemic": "المادة 53 · المادة 55 إن كان نظامياً",
  "Art. 53 (watch)": "المادة 53 (مراقبة)",
  "Deployer (Art. 26)": "مُشغِّل (المادة 26)",
  "Out of GPAI scope": "خارج نطاق الذكاء الاصطناعي العام",
  "Likely provider · assess": "مزوّد محتمل · قيّم",
  "Run Art. 53 assessment": "أجرِ تقييم المادة 53", "Export register": "تصدير السجل",

  /* ── 6 · Gap Closure ── */
  "Gap Closure": "إغلاق الفجوات",
  "The five capabilities the convergence crosswalk last flagged as gaps, turned into owned, evidenced closures — all now operational, with their linked findings resolved (INC-1048 contained, RSK-005 treated, drift monitoring live). Status is read from the crosswalk, so this workspace and the crosswalk never disagree.": "القدرات الخمس التي أشار إليها جدول التقارب مؤخراً كفجوات، تحوّلت إلى إغلاقات مملوكة ومُثبَتة — جميعها تشغيلية الآن، مع حل نتائجها المرتبطة (احتُوي INC-1048، وعُولج RSK-005، ومراقبة الانحراف مباشرة). تُقرأ الحالة من الجدول، فلا تختلف هذه المساحة والجدول أبداً.",
  "Convergence complete": "اكتمل التقارب",
  "No unowned gaps remain across the 32 capabilities": "لا فجوات بلا مالك عبر القدرات الـ32",
  "Every capability is an owned control with a named evidence artifact, and all five closures are now operational — their linked findings resolved (INC-1048 contained, RSK-005 treated, drift monitoring live).": "كل قدرة ضابط مملوك بأثر أدلة مُسمّى، وجميع الإغلاقات الخمسة تشغيلية الآن — حُلّت نتائجها المرتبطة (احتُوي INC-1048، وعُولج RSK-005، ومراقبة الانحراف مباشرة).",
  "COVERAGE": "التغطية",
  "Unowned gaps left": "فجوات بلا مالك متبقية", "across all 32 capabilities": "عبر القدرات الـ32 جميعاً",
  "Closed outright": "مُغلقة تماماً", "artifact operational": "الأثر تشغيلي",
  "In-flight closures": "إغلاقات جارية", "pending a live finding": "بانتظار نتيجة حيّة",
  "Convergence coverage": "تغطية التقارب", "up from 55%": "ارتفاعاً من 55%",
  "The five closures · owner · evidence artifact · what it clears": "الإغلاقات الخمسة · المالك · أثر الأدلة · ما الذي تُنهيه",
  "From gap to owned control": "من فجوة إلى ضابط مملوك",
  "Clears": "يُنهي", "Target": "المستهدف",
  "General Counsel · Legal": "المستشار العام · الشؤون القانونية",
  "Publish the enterprise standard for marking machine-generated output.": "انشر معيار المؤسسة لوسم المخرجات المولّدة آلياً.",
  "Stand up the channel for affected persons to contest a decision.": "أنشئ القناة التي يطعن عبرها الأشخاص المتأثرون في قرار.",
  "Art. 44 transfer impact assessment complete for the APAC flow.": "اكتمل تقييم أثر النقل بموجب المادة 44 لتدفّق آسيا-الهادئ.",
  "SHAP reason codes + Art. 22 explanations live for adverse credit decisions.": "رموز أسباب SHAP + تفسيرات المادة 22 مباشرة لقرارات الائتمان السلبية.",
  "All production models wired to drift monitoring.": "جميع نماذج الإنتاج موصولة بمراقبة الانحراف.",
  "No Art. 50 marking standard existed": "لم يوجد معيار وسم بموجب المادة 50",
  "No standing redress channel": "لا قناة إنصاف قائمة",
  "INC-1048 contained · APAC transfer gap closed": "احتُوي INC-1048 · أُغلقت فجوة نقل آسيا-الهادئ",
  "RSK-005 treated · explainability gap on Credit Decision": "عُولج RSK-005 · فجوة القابلية للتفسير في قرار الائتمان",
  "Drift coverage complete across production models": "اكتملت تغطية الانحراف عبر نماذج الإنتاج",
  "Closed · Aug 2026": "مُغلق · أغسطس 2026",
  "Assemble closure pack": "تجميع حزمة الإغلاق", "Export closure plan": "تصدير خطة الإغلاق",
});

/* ── shared local primitives (match the platform's visual language) ── */
const tok = k => ({ crit: T.red, warn: T.amber, info: T.blue, good: T.green, ink3: T.ink3 }[k] || T.ink3);
const cardPad = { padding: 18 };
const Eyebrow = ({ children, style }) => <div style={{ fontSize: 9, letterSpacing: "0.09em", textTransform: "uppercase", color: T.ink4, fontWeight: 900, fontFamily: F.m, ...style }}>{children}</div>;
const H3 = ({ children, style }) => <h3 style={{ fontFamily: F.h, fontSize: 16, fontWeight: 900, color: T.ink, margin: "4px 0 0", ...style }}>{children}</h3>;
const Head = ({ title, sub }) => <div style={{ marginBottom: 16 }}><h2 style={{ fontFamily: F.h, fontSize: 24, fontWeight: 900, color: T.ink, margin: 0, letterSpacing: "-0.02em" }}>{title}</h2><p style={{ fontFamily: F.b, fontSize: 12.5, color: T.ink3, margin: "5px 0 0", maxWidth: 760, lineHeight: 1.6 }}>{sub}</p></div>;
const Pill = ({ c, children }) => <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 9px", borderRadius: 999, fontSize: 10, fontWeight: 800, fontFamily: F.b, color: c, background: c + "18", border: `1px solid ${c}40` }}>{children}</span>;
const Th = ({ children, style }) => <th style={{ textAlign: "left", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: T.ink4, fontWeight: 900, fontFamily: F.m, padding: "0 10px 9px", borderBottom: `1px solid ${T.border}`, ...style }}>{children}</th>;
const Td = ({ children, style }) => <td style={{ padding: "10px", borderBottom: `1px solid ${T.border}`, color: T.ink2, fontSize: 11.5, fontFamily: F.b, verticalAlign: "middle", ...style }}>{children}</td>;
const Table = ({ head, children }) => <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr>{head.map(h => <Th key={h}>{h}</Th>)}</tr></thead><tbody>{children}</tbody></table></div>;

/* ══════════════ 1 · CONVERGED GOVERNANCE FORUM ══════════════ */
export function GovernanceForum({ showToast }) {
  const lang = useLang(); const ar = lang === "ar"; const T_ = en => ts(lang, en);
  const agenda = forumAgenda();
  return <div style={{ animation: "up .3s ease" }}>
    <Head title={T_("Governance Forum")} sub={T_("One senior forum owning policy, risk tiering, exceptions and escalation across data + AI — not parallel committees running different playbooks. Every item below traces to the live registers.")} />

    <Card style={{ ...cardPad, marginBottom: 14, background: `linear-gradient(135deg,${T.s2},${T.bg})`, border: `1px solid ${AI_GOLD}38` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ maxWidth: 620 }}>
          <Eyebrow style={{ color: AI_GOLD_INK }}>{T_("Convergence charter")}</Eyebrow>
          <H3 style={{ fontSize: 18 }}>{T_("Data & AI governance, run as one agenda")}</H3>
          <p style={{ fontSize: 11.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.65, margin: "6px 0 0" }}>{ar ? <>{T_(FORUM_CADENCE)}. تُعامَل سلالة البيانات والتحكم في الوصول والاحتفاظ والجودة على أنها لا تنفصل عن أداء النماذج وسلامتها وامتثالها.</> : <>{FORUM_CADENCE}. Data lineage, access control, retention and quality are treated as inseparable from model performance, safety and compliance.</>}</p>
        </div>
        <button onClick={() => showToast && showToast(ar ? "تم تجميع حزمة المجلس — تصنيفات المخاطر والاستثناءات والتصعيدات" : "Council pack assembled — risk tiers, exceptions and escalations")} style={{ background: AI_GOLD, border: "none", borderRadius: 10, padding: "10px 15px", color: "#241703", fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer", whiteSpace: "nowrap" }}>{T_("✦ Assemble council pack")}</button>
      </div>
    </Card>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 14, marginBottom: 14 }}>
      <Card style={cardPad}>
        <Eyebrow>{T_("The council · single operating rhythm")}</Eyebrow><H3 style={{ marginBottom: 10 }}>{T_("One seat per domain — no silos")}</H3>
        <div style={{ display: "grid", gap: 7 }}>
          {FORUM_COUNCIL.map(m => <div key={m.role} style={{ display: "flex", gap: 10, alignItems: "center", background: T.s2, border: `1px solid ${T.border}`, borderRadius: 9, padding: "8px 11px" }}>
            <span style={{ minWidth: 42, fontSize: 11, fontWeight: 900, color: T.ink, fontFamily: F.m }}>{m.role}</span>
            <div style={{ minWidth: 0 }}><div style={{ fontSize: 11, fontWeight: 800, color: T.ink, fontFamily: F.b }}>{T_(m.seat)}</div><div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b }}>{T_(m.owns)}</div></div>
          </div>)}
        </div>
      </Card>
      <Card style={cardPad}>
        <Eyebrow>{T_("Single-point ownership · cross-trigger")}</Eyebrow><H3 style={{ marginBottom: 10 }}>{T_("Data policy and AI review move together")}</H3>
        <Table head={["Domain", "Lead", "Automatic cross-trigger"].map(T_)}>
          {OWNERSHIP_MATRIX.map(o => <tr key={o.domain}>
            <Td style={{ fontWeight: 800, color: T.ink }}>{T_(o.domain)}</Td>
            <Td><Pill c={T.blue}>{o.lead}</Pill></Td>
            <Td style={{ color: T.ink3 }}>{T_(o.trigger)}</Td>
          </tr>)}
        </Table>
      </Card>
    </div>

    <Card style={cardPad}>
      <Eyebrow>{T_("This month's agenda · one queue across data + AI")}</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>{T_("Risk tiering · exceptions · escalations — the forum's live decisions")}</H3>
      <Table head={["Type", "Item", "Owner", "Tier", "Ref", "Decision"].map(T_)}>
        {agenda.map(a => <tr key={a.ref}>
          <Td><Pill c={a.kind === "Escalation" ? T.red : a.kind === "Risk tiering" ? AI_GOLD : T.blue}>{T_(a.kind)}</Pill></Td>
          <Td style={{ fontWeight: 700, color: T.ink }}>{T_(a.item)}</Td>
          <Td>{a.owner}</Td>
          <Td><Pill c={a.tier === "Critical" ? T.red : a.tier === "High" ? AI_GOLD : T.blue}>{T_(a.tier)}</Pill></Td>
          <Td style={{ fontFamily: F.m, color: T.ink3 }}>{a.ref}</Td>
          <Td style={{ color: T.ink3 }}>{T_(a.decision)}</Td>
        </tr>)}
      </Table>
      <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 10, background: AI_GOLD + "12", border: `1px solid ${AI_GOLD}30`, fontSize: 11, color: T.ink2, lineHeight: 1.6, fontFamily: F.b }}>
        <b style={{ color: AI_GOLD_INK }}>{ar ? "فيرِس إنتليجنس:" : "Veris Intelligence:"}</b> {ar ? "تصنيفات المخاطر هنا هي السجلات نفسها التي يستشهد بها مركز المخاطر ومركز الذكاء الاصطناعي — مصدر واحد للحقيقة. والمصادقة على سياسة الاستخدام المقبول تُنهي المراجعة المتأخرة وتفكّ حجب مراجعتَي حالتَي استخدام للذكاء الاصطناعي معتمدتَين عليها." : "Risk tiers here are the same records the Risk Center and AI Central cite — one source of truth. Ratifying the acceptable-use policy clears the overdue review and unblocks two dependent AI use-case reviews."}
      </div>
    </Card>
  </div>;
}

/* ══════════════ 2 · CONVERGED INCIDENT PLAYBOOK ══════════════ */
export function IncidentPlaybook({ showToast }) {
  const lang = useLang(); const ar = lang === "ar"; const T_ = en => ts(lang, en);
  const s = incidentStats();
  const kpis = [
    [T_("Open incidents"), String(s.open), T.red, ar ? `من ${s.total} في السجل` : `of ${s.total} in the register`],
    [T_("On the regulatory clock"), String(s.regClock), AI_GOLD, T_("notification in progress")],
    [T_("Classes covered"), String(s.byClass.length), T.blue, T_("one register, one playbook")],
    ["MTTR", "26h", T.green, ar ? "KRI-06 · يتحسّن" : "KRI-06 · improving"],
  ];
  return <div style={{ animation: "up .3s ease" }}>
    <Head title={T_("Incident Playbook")} sub={T_("One response playbook across breaches, model failures, harmful outputs and regulatory notifications — consolidating what used to be separate AI, security and privacy incident queues.")} />

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 14 }}>
      {kpis.map(([l, v, c, sub]) => <Card key={l} style={{ padding: "13px 15px" }}>
        <Eyebrow>{l}</Eyebrow>
        <div style={{ fontSize: 26, fontWeight: 900, color: c, fontFamily: F.m, margin: "5px 0 2px" }}>{v}</div>
        <div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b }}>{sub}</div>
      </Card>)}
    </div>

    <Card style={{ ...cardPad, marginBottom: 14 }}>
      <Eyebrow>{T_("The one register · every incident class")}</Eyebrow>
      <H3 style={{ marginBottom: 6 }}>{T_("Breach · model failure · harmful output · regulatory · security")}</H3>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "8px 0 12px" }}>
        {INCIDENT_CLASSES.map(c => { const n = UNIFIED_INCIDENTS.filter(i => i.cls === c).length; return <span key={c} style={{ fontSize: 10, fontWeight: 800, fontFamily: F.b, color: n ? T.ink2 : T.ink4, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 999, padding: "4px 10px" }}>{T_(c)} · {n}</span>; })}
      </div>
      <Table head={["Ref", "Incident", "Class", "System", "Owner", "Status", "Regulatory clock"].map(T_)}>
        {UNIFIED_INCIDENTS.map(i => <tr key={i.id}>
          <Td style={{ fontFamily: F.m, fontWeight: 700, color: T.ink }}>{i.id}</Td>
          <Td style={{ fontWeight: 700, color: T.ink }}>{T_(i.title)}<div style={{ fontSize: 9.5, color: tok(i.sev), fontWeight: 700, marginTop: 2 }}>{T_(i.severity)} · {ar ? "رُصد" : "detected"} {T_(i.detected)}</div></Td>
          <Td><Pill c={i.cls === "Data breach" || i.cls === "Security" ? T.red : i.cls === "Regulatory" ? AI_GOLD : T.blue}>{T_(i.cls)}</Pill></Td>
          <Td>{T_(i.system)}</Td>
          <Td>{T_(i.owner)}</Td>
          <Td><Pill c={tok(i.st)}>{T_(i.status)}</Pill></Td>
          <Td style={{ color: T.ink3 }}>{T_(i.reg)}</Td>
        </tr>)}
      </Table>
    </Card>

    <Card style={cardPad}>
      <Eyebrow>{T_("One response playbook · same stages for every class")}</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>{[T_("Detect"), T_("Triage"), T_("Contain"), T_("Notify"), T_("Remediate"), T_("Evidence")].join(ar ? " ← " : " → ")}</H3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 10 }}>
        {INCIDENT_STAGES.map(st => <div key={st.n} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 11, padding: "12px 13px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ width: 22, height: 22, borderRadius: 7, background: AI_GOLD + "1c", border: `1px solid ${AI_GOLD}45`, color: AI_GOLD_INK, fontFamily: F.m, fontWeight: 900, fontSize: 11, display: "grid", placeItems: "center" }}>{st.n}</span>
            <span style={{ fontSize: 12.5, fontWeight: 900, color: T.ink, fontFamily: F.h }}>{T_(st.stage)}</span>
          </div>
          <div style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.55, marginBottom: 6 }}>{T_(st.crit)}</div>
          <Pill c={T.blue}>{T_(st.owner)}</Pill>
        </div>)}
      </div>
      <div style={{ display: "flex", gap: 9, marginTop: 14, flexWrap: "wrap" }}>
        <button onClick={() => showToast && showToast(ar ? "بدأت جولة الاستجابة — عُيّن مالك واحد، وتُتابَع الساعة التنظيمية" : "Response run started — single owner assigned, regulatory clock tracked")} style={{ background: AI_GOLD, border: "none", borderRadius: 10, padding: "9px 15px", color: "#241703", fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>{T_("Start a response run")}</button>
        <button onClick={() => showToast && showToast(ar ? "صُدّرت حزمة الأدلة إلى الثقة والأدلة" : "Evidence pack exported to Trust & Evidence")} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 15px", color: T.ink2, fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>{T_("Export evidence pack")}</button>
      </div>
    </Card>
  </div>;
}

/* ══════════════ 2b · BREACH-NOTIFICATION WORKFLOW ══════════════ */
export function BreachNotification({ showToast }) {
  const lang = useLang();
  const ar = lang === "ar";
  const T_ = en => ts(lang, en);
  const hrs = n => ar ? `${n}س` : `${n}h`;   // hour unit
  /* translate a dynamic clock label (numbers preserved) */
  const clockAr = label => {
    if (!ar || !label) return label;
    let m;
    if ((m = /^(\d+)h to notify$/.exec(label))) return `متبقٍ ${m[1]}س للإبلاغ`;
    if ((m = /^Notified in (\d+)h$/.exec(label))) return `أُبلغ خلال ${m[1]}س`;
    if ((m = /^Notified late \((\d+)h\)$/.exec(label))) return `أُبلغ متأخراً (${m[1]}س)`;
    if ((m = /^Overdue by (\d+)h$/.exec(label))) return `متأخر بـ ${m[1]}س`;
    return ts(lang, label);
  };
  const s = breachStats();
  const cov = breachCoverage();
  const [open, setOpen] = useState(null);
  const clockLabel = s.tightestRemainingH == null ? "—" : hrs(s.tightestRemainingH);
  const kpis = [
    [T_("Breaches assessed"), String(s.total), AI_GOLD, ar ? `${cov.pct}% من الحوادث ضمن النطاق` : `${cov.pct}% of in-scope incidents`],
    [T_("Notifiable now"), String(s.notifiable), s.notifiable ? T.red : T.green, T_("on the regulatory clock")],
    [T_("Notified on time"), `${s.onTimeRate}%`, T.green, ar ? `${s.notified} أُبلغت ضمن المهلة` : `${s.notified} filed within the window`],
    [T_("Tightest live clock"), clockLabel, s.tightestRemainingH != null && s.tightestRemainingH <= 24 ? T.red : AI_GOLD, T_("to the binding deadline")],
  ];
  const regTone = { "EU / EEA": T.blue, "EU": T.blue, "India": AI_GOLD, "Brazil": T.green };
  return <div style={{ animation: "up .3s ease" }}>
    <Head title={T_("Breach Notification")} sub={T_("The Notify stage of the incident playbook, made first-class. A confirmed personal-data breach or serious AI incident starts a regulatory clock — several regimes oblige notification to an authority, and sometimes to affected individuals, within a fixed window. This workspace runs that decision over the one incident register and keeps the evidence.")} />

    {/* charter / clock headline */}
    <Card style={{ ...cardPad, marginBottom: 14, background: `linear-gradient(135deg,${T.s2},${T.bg})`, border: `1px solid ${AI_GOLD}38` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ maxWidth: 640 }}>
          <Eyebrow style={{ color: AI_GOLD_INK }}>{T_("One clock, every regime")}</Eyebrow>
          <H3 style={{ fontSize: 18 }}>{T_("Assess once — notify every authority whose window is running")}</H3>
          <p style={{ fontSize: 11.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.65, margin: "6px 0 0" }}>{T_("A single breach can run the GDPR 72-hour clock, India's DPDP and CERT-In 6-hour clocks and the EU AI Act serious-incident clock at once. The workflow resolves them together, notifies against the tightest, and files one evidence pack — never four separate scrambles.")}</p>
        </div>
        <div style={{ textAlign: "center", background: T.s2, border: `1px solid ${AI_GOLD}45`, borderRadius: 12, padding: "12px 18px", minWidth: 130 }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: AI_GOLD_INK, fontFamily: F.m, lineHeight: 1 }}>{s.regimes}</div>
          <div style={{ fontSize: 9.5, color: T.ink3, fontWeight: 800, fontFamily: F.b, marginTop: 4, letterSpacing: "0.04em" }}>{T_("NOTIFICATION REGIMES")}</div>
        </div>
      </div>
    </Card>

    {/* KPIs */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 14 }}>
      {kpis.map(([l, v, c, sub]) => <Card key={l} style={{ padding: "13px 15px" }}>
        <Eyebrow>{l}</Eyebrow>
        <div style={{ fontSize: 26, fontWeight: 900, color: c, fontFamily: F.m, margin: "5px 0 2px" }}>{v}</div>
        <div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b }}>{sub}</div>
      </Card>)}
    </div>

    {/* the regimes and their clocks */}
    <Card style={{ ...cardPad, marginBottom: 14 }}>
      <Eyebrow>{T_("The clocks · who must be told, by when")}</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>{T_("Every notification duty the estate is exposed to")}</H3>
      <Table head={["Regime", "Basis", "Region", "Who is notified", "Window", "Trigger"].map(T_)}>
        {NOTIFICATION_REGIMES.map(r => <tr key={r.id}>
          <Td style={{ fontWeight: 800, color: T.ink }}>{T_(r.regime)}</Td>
          <Td style={{ fontFamily: F.m, fontSize: 10.5, color: T.ink3, whiteSpace: "nowrap" }}>{r.basis}</Td>
          <Td><Pill c={regTone[r.region] || T.ink3}>{T_(r.region)}</Pill></Td>
          <Td style={{ fontWeight: 700, color: T.ink2 }}>{T_(r.audience)}</Td>
          <Td style={{ color: r.deadlineH <= 24 ? T.red : T.ink2, fontWeight: 700, whiteSpace: ar ? "normal" : "nowrap" }}>{T_(r.deadline)}</Td>
          <Td style={{ color: T.ink3, maxWidth: 260 }}>{T_(r.trigger)}</Td>
        </tr>)}
      </Table>
    </Card>

    {/* the breach register with computed clock */}
    <Card style={{ ...cardPad, marginBottom: 14 }}>
      <Eyebrow>{T_("The register · every breach assessed for notifiability")}</Eyebrow>
      <H3 style={{ marginBottom: 6 }}>{T_("Assess → decide → notify → log — click any row for the decision")}</H3>
      <p style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b, margin: "0 0 12px", lineHeight: 1.5 }}>{T_("Most breaches are assessed and found not notifiable — the workflow still records that decision. The clock shows only where a duty is live.")}</p>
      <Table head={["Ref", "Breach", "System", "Personal data", "Regimes", "Clock", "Decision"].map(T_)}>
        {BREACH_REGISTER.map(b => {
          const clk = breachClock(b);
          const isOpen = open === b.id;
          const decMeta = b.decision === "notified" ? { c: T.green, l: T_("Notified") } : b.decision === "notifiable" ? { c: T.red, l: T_("Notifiable") } : { c: T.ink3, l: T_("Assessed") };
          return [
            <tr key={b.id} onClick={() => setOpen(isOpen ? null : b.id)} style={{ cursor: "pointer" }}>
              <Td style={{ fontFamily: F.m, fontWeight: 700, color: T.ink }}>{b.id}<div style={{ fontSize: 9, color: T.ink4, marginTop: 2 }}>{b.incidentId || T_("historical")}</div></Td>
              <Td style={{ fontWeight: 700, color: T.ink, minWidth: 190 }}>{T_(b.title)}</Td>
              <Td style={{ color: T.ink3 }}>{T_(b.system)}</Td>
              <Td>{b.personalData ? <Pill c={AI_GOLD}>{T_("Yes")}</Pill> : <Pill c={T.ink3}>{T_("No")}</Pill>}</Td>
              <Td style={{ minWidth: 130 }}><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{regimesFor(b).map(r => <span key={r.id} style={{ fontSize: 9, fontWeight: 800, fontFamily: F.m, color: T.ink3, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 999, padding: "2px 7px" }}>{r.basis}</span>)}</div></Td>
              <Td><Pill c={tok(clk.tone)}>{clockAr(clk.label)}</Pill></Td>
              <Td><Pill c={decMeta.c}>{decMeta.l}</Pill></Td>
            </tr>,
            isOpen && <tr key={b.id + "-d"}><td colSpan={7} style={{ padding: "0 10px 12px" }}>
              <div style={{ background: AI_GOLD + "10", border: `1px solid ${AI_GOLD}30`, borderRadius: 10, padding: "11px 13px", fontSize: 11, color: T.ink2, fontFamily: F.b, lineHeight: 1.6 }}>
                <b style={{ color: AI_GOLD_INK }}>{b.id} · {T_("notification decision:")}</b> {T_(b.rationale)}
                <div style={{ marginTop: 7, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {regimesFor(b).map(r => <span key={r.id} style={{ fontSize: 10, fontFamily: F.b, color: T.ink3, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "3px 9px" }}><b style={{ color: T.ink2 }}>{T_(r.regime)} {r.basis}</b> · {T_(r.who)} · {T_(r.deadline)}</span>)}
                  <span style={{ fontSize: 10, fontFamily: F.b, color: T.ink3 }}>{T_("Owner:")} <b style={{ color: T.ink2 }}>{T_(b.owner)}</b></span>
                </div>
              </div>
            </td></tr>,
          ];
        })}
      </Table>
    </Card>

    {/* the workflow */}
    <Card style={cardPad}>
      <Eyebrow>{T_("The decision · five stages that produce the evidence")}</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>{[T_("Assess"), T_("Scope"), T_("Decide"), T_("Notify"), T_("Log")].join(" → ")}</H3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 10 }}>
        {NOTIFICATION_WORKFLOW.map(st => <div key={st.n} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 11, padding: "12px 13px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ width: 22, height: 22, borderRadius: 7, background: AI_GOLD + "1c", border: `1px solid ${AI_GOLD}45`, color: AI_GOLD_INK, fontFamily: F.m, fontWeight: 900, fontSize: 11, display: "grid", placeItems: "center" }}>{st.n}</span>
            <span style={{ fontSize: 12.5, fontWeight: 900, color: T.ink, fontFamily: F.h }}>{T_(st.stage)}</span>
          </div>
          <div style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.55, marginBottom: 6 }}>{T_(st.crit)}</div>
          <Pill c={T.blue}>{T_(st.owner)}</Pill>
        </div>)}
      </div>
      <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 10, background: AI_GOLD + "12", border: `1px solid ${AI_GOLD}30`, fontSize: 11, color: T.ink2, lineHeight: 1.6, fontFamily: F.b }}>
        <b style={{ color: AI_GOLD_INK }}>{ar ? "فيرِس إنتليجنس:" : "Veris Intelligence:"}</b> {ar
          ? (s.notifiable ? <>{s.notifiable} خرق على الساعة — أضيق مهلة هي <b style={{ color: T.ink2 }}>{clockLabel}</b>. استُوفيت ساعة CERT-In (6 ساعات)؛ وصيغت إشعارات الجهة الرقابية والمجلس، وإشعار الأفراد قيد المراجعة مقابل مهلة الـ72 ساعة. </> : <>لا يوجد خرق واجب الإبلاغ حالياً. كل تقييم مسجَّل، فقرارات عدم الإبلاغ قابلة للدفاع عنها كالإبلاغات تماماً. </>)
          : (s.notifiable ? <>{s.notifiable} breach is on the clock — the tightest window is <b style={{ color: T.ink2 }}>{clockLabel}</b>. CERT-In's 6-hour clock is met; the DPA and DPB notices are drafted and the affected-principal notice is in review against the 72-hour window. </> : <>No breach is currently notifiable. Every assessment is recorded, so the not-notifiable decisions are as defensible as the notifications. </>)}
        {ar ? "هذا السير هو الضابط الذي يستوفي GDPR (المادة 33/34) وقانون الذكاء الاصطناعي الأوروبي (المادة 73) وقانون DPDP الهندي (المادة 8(6)) وCERT-In دفعة واحدة." : "This workflow is the control that satisfies GDPR Art. 33/34, EU AI Act Art. 73, India DPDP s. 8(6) and CERT-In at once."}
      </div>
      <div style={{ display: "flex", gap: 9, marginTop: 14, flexWrap: "wrap" }}>
        <button onClick={() => showToast && showToast(ar ? "بدأ تقييم الخرق — حُدّدت الأنظمة، والساعة الأضيق تعمل" : "Breach assessment started — regimes resolved, tightest clock running")} style={{ background: AI_GOLD, border: "none", borderRadius: 10, padding: "9px 15px", color: "#241703", fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>{T_("Start a breach assessment")}</button>
        <button onClick={() => showToast && showToast(ar ? "صُدّرت حزمة الإبلاغ — إشعارات الجهات + قيد سجل المادة 33(5)" : "Notification pack exported — authority notices + Art.33(5) register entry")} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 15px", color: T.ink2, fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>{T_("Export notification pack")}</button>
      </div>
    </Card>
  </div>;
}

/* ══════════════ 3 · CONVERGENCE CROSSWALK ══════════════ */
export function ConvergenceCrosswalk({ showToast }) {
  const lang = useLang(); const ar = lang === "ar"; const T_ = en => ts(lang, en);
  const s = crosswalkStats();
  const [statusF, setStatusF] = useState("all");
  const [domainF, setDomainF] = useState("all");
  const [open, setOpen] = useState(null);

  const rows = CROSSWALK.filter(c => (statusF === "all" || c.status === statusF) && (domainF === "all" || c.domain === domainF));
  const domainsShown = CROSSWALK_DOMAINS.filter(d => rows.some(c => c.domain === d));

  const kpis = [
    [T_("Capabilities"), String(s.total), AI_GOLD, T_("one control each"), "all"],
    [T_("Operational"), String(s.operational), T.green, T_("evidenced & fresh"), "operational"],
    [T_("In progress"), String(s.progress), T.amber, T_("artifact being closed"), "progress"],
    [T_("Gaps"), String(s.gap), T.red, T_("no artifact yet"), "gap"],
  ];
  const instTone = { crit: T.red, blue: T.blue, good: T.green, gold: AI_GOLD };

  return <div style={{ animation: "up .3s ease" }}>
    <Head title={T_("Convergence Crosswalk")} sub={T_("One control set, not four. Each capability below is a single control — evidenced by a single artifact — that satisfies the matching clause in the EU AI Act, the NIST AI RMF, ISO/IEC 42001 and Singapore's Model AI Governance Framework at once. Build once instead of four times.")} />

    {/* Charter / reduction headline */}
    <Card style={{ ...cardPad, marginBottom: 14, background: `linear-gradient(135deg,${T.s2},${T.bg})`, border: `1px solid ${AI_GOLD}38` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ maxWidth: 620 }}>
          <Eyebrow style={{ color: AI_GOLD_INK }}>{T_("The master map")}</Eyebrow>
          <H3 style={{ fontSize: 18 }}>{ar ? <>{s.obligations} التزام إطاري ← {s.total} ضابط ← {s.total} أثر أدلة</> : <>{s.obligations} framework obligations → {s.total} controls → {s.total} evidence artifacts</>}</H3>
          <p style={{ fontSize: 11.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.65, margin: "6px 0 0" }}>{ar ? <>{s.total} قدرة × {s.instruments} أدوات تنكمش إلى مجموعة ضوابط واحدة. صمّم الضوابط من هذه الورقة ويُستوفى كل إطار بالأثر نفسه — وهو سبب وجود مجموعة الأدوات.</> : <>{s.total} capabilities × {s.instruments} instruments collapse into one control set. Design controls from this sheet and every framework is satisfied by the same artifact — the reason the toolkit exists.</>}</p>
        </div>
        <div style={{ textAlign: "center", background: T.s2, border: `1px solid ${AI_GOLD}45`, borderRadius: 12, padding: "12px 18px", minWidth: 120 }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: AI_GOLD_INK, fontFamily: F.m, lineHeight: 1 }}>{s.coverage}%</div>
          <div style={{ fontSize: 9.5, color: T.ink3, fontWeight: 800, fontFamily: F.b, marginTop: 4, letterSpacing: "0.04em" }}>{T_("CONVERGENCE COVERAGE")}</div>
        </div>
      </div>
    </Card>

    {/* KPI tiles double as status filters */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 14 }}>
      {kpis.map(([l, v, c, sub, key]) => <button key={l} onClick={() => setStatusF(key)} style={{ textAlign: "left", cursor: "pointer", background: statusF === key ? c + "12" : T.card, border: `1px solid ${statusF === key ? c + "66" : T.border}`, borderRadius: 12, padding: "13px 15px" }}>
        <Eyebrow>{l}</Eyebrow>
        <div style={{ fontSize: 26, fontWeight: 900, color: c, fontFamily: F.m, margin: "5px 0 2px" }}>{v}</div>
        <div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b }}>{sub}</div>
      </button>)}
    </div>

    {/* Instrument legend */}
    <Card style={{ ...cardPad, marginBottom: 14 }}>
      <Eyebrow>{T_("The four instruments · one system")}</Eyebrow>
      <H3 style={{ marginBottom: 10 }}>{T_("Binding law, a framework, a standard and guidance — mapped together")}</H3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
        {INSTRUMENTS.map(i => <div key={i.id} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 11, padding: "11px 13px", borderLeft: `3px solid ${instTone[i.tone]}` }}>
          <div style={{ fontSize: 12.5, fontWeight: 900, color: T.ink, fontFamily: F.h }}>{T_(i.short || i.name)}</div>
          <div style={{ margin: "5px 0 3px" }}><Pill c={instTone[i.tone]}>{T_(i.kind)}</Pill></div>
          <div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b }}>{ar ? "يُنفِّذه " : "Enforced by "}{T_(i.enforcer)}</div>
        </div>)}
      </div>
    </Card>

    {/* Domain filter + table */}
    <Card style={cardPad}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
        <div><Eyebrow>{ar ? <>الجدول · {rows.length} من {s.total} قدرة</> : <>The crosswalk · {rows.length} of {s.total} capabilities</>}</Eyebrow><H3>{T_("One artifact satisfies all four — click any row")}</H3></div>
        <button onClick={() => showToast && showToast(ar ? "صُدّر جدول التقارب — 32 ضابطاً مُخطَّطة عبر أربع أدوات" : "Convergence crosswalk exported — 32 controls mapped across four instruments")} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 13px", color: T.ink2, fontSize: 11.5, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>{T_("Export crosswalk")}</button>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {["all", ...CROSSWALK_DOMAINS].map(d => <button key={d} onClick={() => setDomainF(d)} style={{ fontSize: 10.5, fontWeight: 800, fontFamily: F.b, cursor: "pointer", color: domainF === d ? "#241703" : T.ink2, background: domainF === d ? AI_GOLD : T.s2, border: `1px solid ${domainF === d ? AI_GOLD : T.border}`, borderRadius: 999, padding: "5px 12px" }}>{d === "all" ? T_("All domains") : T_(d)}</button>)}
      </div>

      {domainsShown.map(dom => <div key={dom} style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 900, color: AI_GOLD_INK, fontFamily: F.m, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>{T_(dom)}</div>
        <Table head={["Capability", "EU AI Act", "NIST AI RMF", "ISO 42001", "Singapore MGF", "Evidence artifact", "Owner", "Status"].map(T_)}>
          {rows.filter(c => c.domain === dom).map(c => {
            const meta = STATUS_META[c.status];
            const isOpen = open === c.id;
            return [
              <tr key={c.id} onClick={() => setOpen(isOpen ? null : c.id)} style={{ cursor: "pointer" }}>
                <Td style={{ fontWeight: 700, color: T.ink, minWidth: 190 }}>{T_(c.capability)}</Td>
                <Td style={{ fontFamily: F.m, fontSize: 10.5, color: T.ink3, whiteSpace: "nowrap" }}>{c.euai}</Td>
                <Td style={{ fontFamily: F.m, fontSize: 10.5, color: T.ink3, whiteSpace: "nowrap" }}>{c.nist}</Td>
                <Td style={{ fontFamily: F.m, fontSize: 10.5, color: T.ink3, whiteSpace: "nowrap" }}>{c.iso}</Td>
                <Td style={{ fontFamily: F.m, fontSize: 10.5, color: T.ink3, whiteSpace: "nowrap" }}>{T_(c.sg)}</Td>
                <Td style={{ fontWeight: 700, color: T.ink2, minWidth: 150 }}>{T_(c.artifact)}</Td>
                <Td><Pill c={T.blue}>{T_(c.owner)}</Pill></Td>
                <Td><Pill c={tok(meta.tone)}>{T_(meta.label)}</Pill></Td>
              </tr>,
              isOpen && <tr key={c.id + "-d"}><td colSpan={8} style={{ padding: "0 10px 12px" }}>
                <div style={{ background: AI_GOLD + "10", border: `1px solid ${AI_GOLD}30`, borderRadius: 10, padding: "11px 13px", fontSize: 11, color: T.ink2, fontFamily: F.b, lineHeight: 1.6 }}>
                  <b style={{ color: AI_GOLD_INK }}>{c.id} · {ar ? "ضابط واحد، أربع أدوات:" : "one control, four instruments:"}</b> {T_(c.note)} <span style={{ color: T.ink3 }}>{ar ? <>يغلق <b style={{ color: T.ink2 }}>{T_(c.artifact)}</b> الواحد قانون الذكاء الاصطناعي الأوروبي {c.euai} وNIST {c.nist} والأيزو/IEC 42001 {c.iso} وإطار سنغافورة MGF ({T_(c.sg)}) — مملوك لـ {T_(c.owner)}.</> : <>The single <b style={{ color: T.ink2 }}>{c.artifact}</b> closes EU AI Act {c.euai}, NIST {c.nist}, ISO/IEC 42001 {c.iso} and Singapore MGF ({c.sg}) — owned by {c.owner}.</>}</span>
                </div>
              </td></tr>,
            ];
          })}
        </Table>
      </div>)}

      <div style={{ marginTop: 6, padding: "11px 13px", borderRadius: 10, background: AI_GOLD + "12", border: `1px solid ${AI_GOLD}30`, fontSize: 11, color: T.ink2, lineHeight: 1.6, fontFamily: F.b }}>
        <b style={{ color: AI_GOLD_INK }}>{ar ? "فيرِس إنتليجنس:" : "Veris Intelligence:"}</b> {ar
          ? (s.gap === 0 ? <>كل قدرة مملوكة ومُثبَتة — <b style={{ color: T.ink2 }}>لا فجوات بلا مالك متبقية</b>، وجميع الفجوات الخمس السابقة الآن <b style={{ color: T.ink2 }}>تشغيلية</b> مع حل نتائجها المرتبطة (احتُوي INC-1048، وعُولج RSK-005، ومراقبة الانحراف مباشرة). وتغطية التقارب {s.coverage}%.</> : <>الفجوات الـ{s.gap} المفتوحة هي البنود نفسها التي يُعلمها مركز المخاطر وسجل الحوادث بالفعل. وإغلاق أثر واحد يُنهي الالتزام في الأدوات الأربع دفعة واحدة.</>)
          : (s.gap === 0 ? <>Every capability is owned and evidenced — <b style={{ color: T.ink2 }}>no unowned gaps remain</b>, and all five former gaps are now <b style={{ color: T.ink2 }}>operational</b> with their linked findings resolved (INC-1048 contained, RSK-005 treated, drift monitoring live). Convergence coverage is {s.coverage}%.</> : <>The {s.gap} open gaps are the same items the Risk Center and Incident register already flag. Closing one artifact clears the obligation in all four instruments at once.</>)}
      </div>
    </Card>
  </div>;
}

/* ══════════════ 4 · PROHIBITED PRACTICES (Art. 5 red lines) ══════════════ */
export function ProhibitedPractices({ showToast }) {
  const lang = useLang(); const ar = lang === "ar"; const T_ = en => ts(lang, en);
  const s = prohibitedStats();
  const everyday = PROHIBITED_PRACTICES.find(p => p.everyday);
  const kpis = [
    [T_("Practices screened"), String(s.total), AI_GOLD, T_("EU AI Act Art. 5")],
    [T_("Clear"), String(s.clear), T.green, T_("no system in scope")],
    [T_("Under review"), String(s.review), T.amber, T_("confirm before deploy")],
    [T_("Prohibited in use"), String(s.flag), T.red, T_("would require a stop")],
  ];
  return <div style={{ animation: "up .3s ease" }}>
    <Head title={T_("Prohibited Practices")} sub={T_("The eight red lines of EU AI Act Article 5. These are a stop, not a control: a system in scope is not governed, it is not deployed. Every system is screened here before any risk tiering begins.")} />

    <Card style={{ ...cardPad, marginBottom: 14, background: everyday ? `linear-gradient(135deg,${T.amber}14,${T.bg})` : T.card, border: `1px solid ${T.amber}45` }}>
      <Eyebrow style={{ color: T.amber }}>{T_("The one that catches ordinary companies")}</Eyebrow>
      <H3 style={{ fontSize: 17 }}>{T_(everyday.practice)} · {everyday.art}</H3>
      <p style={{ fontSize: 11.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.65, margin: "6px 0 0" }}>{ar ? <>{T_(everyday.catches)} <b style={{ color: T.ink2 }}>في النطاق هنا:</b> {T_(everyday.system)}. {T_(everyday.note)}</> : <>{everyday.catches} <b style={{ color: T.ink2 }}>In scope here:</b> {everyday.system}. {everyday.note}</>}</p>
    </Card>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 14 }}>
      {kpis.map(([l, v, c, sub]) => <Card key={l} style={{ padding: "13px 15px" }}>
        <Eyebrow>{l}</Eyebrow>
        <div style={{ fontSize: 26, fontWeight: 900, color: c, fontFamily: F.m, margin: "5px 0 2px" }}>{v}</div>
        <div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b }}>{sub}</div>
      </Card>)}
    </div>

    <Card style={{ ...cardPad, marginBottom: 14 }}>
      <Eyebrow>{T_("The eight red lines · screened against the estate")}</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>{T_("Where the answer is stop, not control")}</H3>
      <Table head={["Article", "Prohibited practice", "What it catches", "System in scope", "Screen"].map(T_)}>
        {PROHIBITED_PRACTICES.map(p => { const m = PP_RESULT_META[p.result]; return <tr key={p.id}>
          <Td style={{ fontFamily: F.m, color: T.ink3, whiteSpace: "nowrap" }}>{p.art}</Td>
          <Td style={{ fontWeight: 700, color: T.ink }}>{T_(p.practice)}{p.everyday && <Pill c={T.amber} >  {T_("everyday risk")}</Pill>}<div style={{ fontSize: 9.5, color: T.ink3, fontWeight: 500, marginTop: 3, maxWidth: 320, lineHeight: 1.45 }}>{T_(p.note)}</div></Td>
          <Td style={{ color: T.ink3, maxWidth: 240 }}>{T_(p.catches)}</Td>
          <Td style={{ color: p.system === "—" ? T.ink4 : T.ink2, fontWeight: p.system === "—" ? 500 : 700 }}>{T_(p.system)}</Td>
          <Td><Pill c={tok(m.tone)}>{T_(m.label)}</Pill></Td>
        </tr>; })}
      </Table>
    </Card>

    <Card style={cardPad}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div style={{ maxWidth: 620 }}>
          <Eyebrow style={{ color: s.attested ? T.green : T.amber }}>{T_("Prohibited-use attestation")}</Eyebrow>
          <H3 style={{ fontSize: 16 }}>{s.attested ? T_("Clear to attest — no prohibited use") : (ar ? `الإقرار محجوب — ${s.review} ممارسة قيد المراجعة` : `Attestation blocked — ${s.review} practice under review`)}</H3>
          <p style={{ fontSize: 11, color: T.ink3, fontFamily: F.b, lineHeight: 1.6, margin: "5px 0 0" }}>{T_("The attestation is the single evidence artifact that closes crosswalk capability C08 across all four instruments. It cannot be signed while any practice is under review.")}</p>
        </div>
        <button onClick={() => showToast && showToast(s.attested ? (ar ? "وُقّع إقرار عدم الاستخدام المحظور وأُودع" : "Prohibited-use attestation signed and filed") : (ar ? "فُتحت مراجعة التعرّف على المشاعر — أُبلغ مالك القوى العاملة والشؤون القانونية" : "Emotion-recognition review opened — Workforce owner + Legal notified"))} style={{ background: s.attested ? T.green : T.amber, border: "none", borderRadius: 10, padding: "10px 15px", color: "#241703", fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer", whiteSpace: "nowrap" }}>{s.attested ? T_("✦ Sign attestation") : T_("Open the review")}</button>
      </div>
    </Card>
  </div>;
}

/* ══════════════ 5 · GPAI EXPOSURE (accidental-provider test) ══════════════ */
export function GpaiExposure({ showToast }) {
  const lang = useLang(); const ar = lang === "ar"; const T_ = en => ts(lang, en);
  const s = gpaiStats();
  const kpis = [
    [T_("GenAI systems assessed"), String(s.assessed), AI_GOLD, ar ? `من ${s.total} في السجل` : `of ${s.total} in the register`],
    [T_("Likely provider"), String(s.provider), T.red, T_("Art. 53/55 obligations")],
    [T_("Monitor"), String(s.monitor), T.amber, T_("modified, not yet shared")],
    [T_("Deployer only"), String(s.deployer), T.green, T_("no provider duty")],
  ];
  const yn = v => <Pill c={v ? AI_GOLD : T.ink3}>{v ? T_("Yes") : T_("No")}</Pill>;
  return <div style={{ animation: "up .3s ease" }}>
    <Head title={T_("GPAI Exposure")} sub={T_("The accidental-provider test — EU AI Act Art. 53 & 55. Modify a general-purpose model and share it beyond the team that modified it, and you may hold provider obligations with no procurement or board decision ever taken. Two yes answers flag the system.")} />

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12, marginBottom: 14 }}>
      {GPAI_QUESTIONS.map((q, i) => <Card key={i} style={{ ...cardPad, borderLeft: `3px solid ${AI_GOLD}` }}>
        <Eyebrow style={{ color: AI_GOLD_INK }}>{T_("You answer")}</Eyebrow>
        <H3 style={{ fontSize: 15 }}>{T_(q.q)}</H3>
        <p style={{ fontSize: 11, color: T.ink3, fontFamily: F.b, lineHeight: 1.6, margin: "6px 0 0" }}>{T_(q.detail)}</p>
      </Card>)}
    </div>

    <Card style={{ ...cardPad, marginBottom: 14, background: `linear-gradient(135deg,${T.s2},${T.bg})`, border: `1px solid ${AI_GOLD}38` }}>
      <Eyebrow style={{ color: AI_GOLD_INK }}>{T_("The workbook derives")}</Eyebrow>
      <H3 style={{ fontSize: 16 }}>{T_("Your GPAI exposure")}</H3>
      <p style={{ fontSize: 11.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.65, margin: "6px 0 10px" }}>{T_("Two yes answers and the row flags. You may hold provider obligations under Articles 53 and 55.")}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Pill c={T.red}>{T_("Modified + shared → likely provider · assess")}</Pill>
        <Pill c={T.amber}>{T_("Modified only → monitor")}</Pill>
        <Pill c={T.green}>{T_("Called, not modified → deployer only")}</Pill>
      </div>
    </Card>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 14 }}>
      {kpis.map(([l, v, c, sub]) => <Card key={l} style={{ padding: "13px 15px" }}>
        <Eyebrow>{l}</Eyebrow>
        <div style={{ fontSize: 26, fontWeight: 900, color: c, fontFamily: F.m, margin: "5px 0 2px" }}>{v}</div>
        <div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b }}>{sub}</div>
      </Card>)}
    </div>

    <Card style={cardPad}>
      <Eyebrow>{T_("GPAI exposure register · every GenAI system")}</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>{T_("Modified · shared beyond the team · derived exposure")}</H3>
      <Table head={["System", "Basis", "Modified?", "Shared beyond team?", "Exposure", "Obligation"].map(T_)}>
        {GPAI_REGISTER.map(r => { const e = EXPOSURE_META[gpaiExposure(r)]; return <tr key={r.system}>
          <Td style={{ fontWeight: 700, color: T.ink }}>{T_(r.system)}</Td>
          <Td style={{ color: T.ink3, maxWidth: 240 }}>{T_(r.basis)}</Td>
          <Td>{r.gpai ? yn(r.modified) : <span style={{ color: T.ink4 }}>—</span>}</Td>
          <Td>{r.gpai ? yn(r.distributed) : <span style={{ color: T.ink4 }}>—</span>}</Td>
          <Td><Pill c={tok(e.tone)}>{T_(e.label)}</Pill></Td>
          <Td style={{ fontFamily: F.m, fontSize: 10.5, color: T.ink3 }}>{T_(r.arts)}</Td>
        </tr>; })}
      </Table>
      <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 10, background: AI_GOLD + "12", border: `1px solid ${AI_GOLD}30`, fontSize: 11, color: T.ink2, lineHeight: 1.6, fontFamily: F.b }}>
        <b style={{ color: AI_GOLD_INK }}>{ar ? "فيرِس إنتليجنس:" : "Veris Intelligence:"}</b> {ar ? <>{s.provider} نظام يحمل التزامات مزوّد ذكاء اصطناعي عام محتملة — فقد جرى ضبط Customer Resolution Copilot دقيقاً وطرحه على مستوى المؤسسة وداخل المنتج، وهو بالضبط مسار المزوّد العَرَضي. أجرِ تقييم المادة 53 قبل الإصدار التالي؛ هذا يغلق قدرة الجدول C24.</> : <>{s.provider} system carries likely GPAI provider obligations — the Customer Resolution Copilot was fine-tuned and rolled out enterprise-wide and into the product, which is exactly the accidental-provider path. Run the Art. 53 assessment before the next release; this closes crosswalk capability C24.</>}
      </div>
      <div style={{ display: "flex", gap: 9, marginTop: 12, flexWrap: "wrap" }}>
        <button onClick={() => showToast && showToast(ar ? "بدأ تقييم مزوّد الذكاء الاصطناعي العام (المادة 53) لـ Customer Resolution Copilot" : "Art. 53 GPAI provider assessment started for Customer Resolution Copilot")} style={{ background: AI_GOLD, border: "none", borderRadius: 10, padding: "9px 15px", color: "#241703", fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>{T_("Run Art. 53 assessment")}</button>
        <button onClick={() => showToast && showToast(ar ? "صُدّر سجل التعرّض للذكاء الاصطناعي العام إلى الثقة والأدلة" : "GPAI exposure register exported to Trust & Evidence")} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 15px", color: T.ink2, fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>{T_("Export register")}</button>
      </div>
    </Card>
  </div>;
}

/* ══════════════ 6 · GAP CLOSURE ══════════════ */
export function GapClosure({ showToast }) {
  const lang = useLang(); const ar = lang === "ar"; const T_ = en => ts(lang, en);
  const rows = gapClosureRows();
  const s = gapClosureStats();
  const kpis = [
    [T_("Unowned gaps left"), String(s.remaining), s.remaining === 0 ? T.green : T.red, T_("across all 32 capabilities")],
    [T_("Closed outright"), String(s.closed), T.green, T_("artifact operational")],
    [T_("In-flight closures"), String(s.inflight), T.amber, T_("pending a live finding")],
    [T_("Convergence coverage"), `${s.coverage}%`, AI_GOLD, T_("up from 55%")],
  ];
  return <div style={{ animation: "up .3s ease" }}>
    <Head title={T_("Gap Closure")} sub={T_("The five capabilities the convergence crosswalk last flagged as gaps, turned into owned, evidenced closures — all now operational, with their linked findings resolved (INC-1048 contained, RSK-005 treated, drift monitoring live). Status is read from the crosswalk, so this workspace and the crosswalk never disagree.")} />

    <Card style={{ ...cardPad, marginBottom: 14, background: `linear-gradient(135deg,${T.green}12,${T.bg})`, border: `1px solid ${T.green}45` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ maxWidth: 640 }}>
          <Eyebrow style={{ color: T.green }}>{T_("Convergence complete")}</Eyebrow>
          <H3 style={{ fontSize: 18 }}>{s.remaining === 0 ? T_("No unowned gaps remain across the 32 capabilities") : (ar ? `${s.remaining} فجوة بلا مالك متبقية` : `${s.remaining} unowned gaps remain`)}</H3>
          <p style={{ fontSize: 11.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.65, margin: "6px 0 0" }}>{T_("Every capability is an owned control with a named evidence artifact, and all five closures are now operational — their linked findings resolved (INC-1048 contained, RSK-005 treated, drift monitoring live).")}</p>
        </div>
        <div style={{ textAlign: "center", background: T.s2, border: `1px solid ${T.green}45`, borderRadius: 12, padding: "12px 18px", minWidth: 120 }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: T.green, fontFamily: F.m, lineHeight: 1 }}>{s.coverage}%</div>
          <div style={{ fontSize: 9.5, color: T.ink3, fontWeight: 800, fontFamily: F.b, marginTop: 4, letterSpacing: "0.04em" }}>{T_("COVERAGE")}</div>
        </div>
      </div>
    </Card>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 14 }}>
      {kpis.map(([l, v, c, sub]) => <Card key={l} style={{ padding: "13px 15px" }}>
        <Eyebrow>{l}</Eyebrow>
        <div style={{ fontSize: 26, fontWeight: 900, color: c, fontFamily: F.m, margin: "5px 0 2px" }}>{v}</div>
        <div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b }}>{sub}</div>
      </Card>)}
    </div>

    <Card style={cardPad}>
      <Eyebrow>{T_("The five closures · owner · evidence artifact · what it clears")}</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>{T_("From gap to owned control")}</H3>
      <Table head={["Ref", "Capability", "Evidence artifact", "Owner", "Clears", "Article", "Target", "Status"].map(T_)}>
        {rows.map(r => { const meta = STATUS_META[r.status]; return <tr key={r.ref}>
          <Td style={{ fontFamily: F.m, fontWeight: 700, color: T.ink }}>{r.ref}</Td>
          <Td style={{ fontWeight: 700, color: T.ink, minWidth: 160 }}>{T_(r.capability)}<div style={{ fontSize: 9.5, color: T.ink3, fontWeight: 500, marginTop: 3, maxWidth: 300, lineHeight: 1.45 }}>{T_(r.action)}</div></Td>
          <Td style={{ fontWeight: 700, color: T.ink2 }}>{T_(r.artifact)}</Td>
          <Td>{T_(r.owner)}</Td>
          <Td style={{ color: T.ink3, maxWidth: 200 }}>{T_(r.clears)}</Td>
          <Td style={{ fontFamily: F.m, fontSize: 10.5, color: T.ink3, whiteSpace: "nowrap" }}>{r.euai}</Td>
          <Td style={{ color: T.ink3, whiteSpace: "nowrap" }}>{T_(r.target)}</Td>
          <Td><Pill c={tok(meta.tone)}>{T_(meta.label)}</Pill></Td>
        </tr>; })}
      </Table>
      <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 10, background: AI_GOLD + "12", border: `1px solid ${AI_GOLD}30`, fontSize: 11, color: T.ink2, lineHeight: 1.6, fontFamily: F.b }}>
        <b style={{ color: AI_GOLD_INK }}>{ar ? "فيرِس إنتليجنس:" : "Veris Intelligence:"}</b> {ar ? <>{s.closed} فجوة مُغلقة تماماً و{s.inflight} جارية، مملوكة ومؤرَّخة. والإغلاقات الجارية الثلاثة هي البنود الحيّة نفسها التي يتتبّعها مركز المخاطر وسجل الحوادث — وإغلاق INC-1048 وRSK-005 وتوصيل الانحراف ينقلها إلى التشغيلي ويرفع تغطية التقارب فوق {s.coverage}%.</> : <>{s.closed} gaps closed outright and {s.inflight} are in-flight, owned and dated. The three in-flight closures are the same live items the Risk Center and Incident register track — closing INC-1048, RSK-005 and the drift wiring moves them to operational and lifts convergence coverage past {s.coverage}%.</>}
      </div>
      <div style={{ display: "flex", gap: 9, marginTop: 12, flexWrap: "wrap" }}>
        <button onClick={() => showToast && showToast(ar ? "جُمّعت حزمة إغلاق الفجوات — 5 آثار أدلة ومالكوها وتواريخها المستهدفة" : "Gap-closure pack assembled — 5 evidence artifacts, owners and target dates")} style={{ background: AI_GOLD, border: "none", borderRadius: 10, padding: "9px 15px", color: "#241703", fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>{T_("Assemble closure pack")}</button>
        <button onClick={() => showToast && showToast(ar ? "صُدّرت خطة الإغلاق إلى الثقة والأدلة" : "Closure plan exported to Trust & Evidence")} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 15px", color: T.ink2, fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>{T_("Export closure plan")}</button>
      </div>
    </Card>
  </div>;
}

/* ══════════════ 7 · AI IMPACT ASSESSMENT (AIA · DPIA · FRIA) ══════════════ */
export function AIAssessment({ showToast }) {
  const lang = useLang();
  const ar = lang === "ar";
  const T_ = en => ts(lang, en);
  const s = aiaStats();
  const [open, setOpen] = useState(null);
  const kpis = [
    [T_("High-risk FRIA coverage"), `${s.friaCoverage}%`, s.friaCoverage >= 100 ? T.green : T.amber, ar ? `${s.friaComplete}/${s.highRisk} نظام عالي الخطورة` : `${s.friaComplete}/${s.highRisk} high-risk systems`],
    [T_("DPIA coverage"), `${s.dpiaCoverage}%`, s.dpiaCoverage >= 100 ? T.green : T.amber, ar ? `${s.dpiaComplete}/${s.dpia} بها بيانات شخصية` : `${s.dpiaComplete}/${s.dpia} with personal data`],
    [T_("Assessments complete"), `${s.complete}/${s.assessed}`, AI_GOLD, ar ? `من ${s.governed} نظاماً مُحوكماً` : `of ${s.governed} governed systems`],
    [T_("Residual risk retired"), `−${s.residualCut}`, T.green, T_("across the assessed estate")],
  ];
  const dimStat = { Complete: T.green, "In review": T.amber, Gap: T.ink4 };
  const tierTone = t => t === "High-risk" ? T.red : t === "Limited-risk" ? T.amber : T.blue;
  return <div style={{ animation: "up .3s ease" }}>
    <Head title={T_("Impact Assessments")} sub={T_("One assessment per AI system, run once and mapped to every regime that demands one — so the same record discharges the EU AI Act fundamental-rights assessment (Art. 27) and risk file (Art. 9), the GDPR DPIA (Art. 35), ISO 42001's system impact assessment, the NIST RMF Map function, Brazil's algorithmic impact assessment and Korea's high-impact assessment at once.")} />

    {/* charter */}
    <Card style={{ ...cardPad, marginBottom: 14, background: `linear-gradient(135deg,${T.s2},${T.bg})`, border: `1px solid ${AI_GOLD}38` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ maxWidth: 640 }}>
          <Eyebrow style={{ color: AI_GOLD_INK }}>{T_("Assess once, satisfy seven")}</Eyebrow>
          <H3 style={{ fontSize: 18 }}>{T_("One impact assessment, every regime that asks for one")}</H3>
          <p style={{ fontSize: 11.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.65, margin: "6px 0 0" }}>{T_("A fundamental-rights assessment, a DPIA and an algorithmic impact assessment are the same nine questions asked by four regulators. Answer them once per system, tie the mitigations to the Risk Center, and the FRIA, DPIA, ISO, NIST, Brazil and Korea obligations close together.")}</p>
        </div>
        <div style={{ textAlign: "center", background: T.s2, border: `1px solid ${AI_GOLD}45`, borderRadius: 12, padding: "12px 18px", minWidth: 130 }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: AI_GOLD_INK, fontFamily: F.m, lineHeight: 1 }}>{s.regimes}</div>
          <div style={{ fontSize: 9.5, color: T.ink3, fontWeight: 800, fontFamily: F.b, marginTop: 4, letterSpacing: "0.04em" }}>{T_("REGIMES DISCHARGED")}</div>
        </div>
      </div>
    </Card>

    {/* KPIs */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 14 }}>
      {kpis.map(([l, v, c, sub]) => <Card key={l} style={{ padding: "13px 15px" }}>
        <Eyebrow>{l}</Eyebrow>
        <div style={{ fontSize: 26, fontWeight: 900, color: c, fontFamily: F.m, margin: "5px 0 2px" }}>{v}</div>
        <div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b }}>{sub}</div>
      </Card>)}
    </div>

    {/* the register */}
    <Card style={{ ...cardPad, marginBottom: 14 }}>
      <Eyebrow>{T_("The register · one assessment per system")}</Eyebrow>
      <H3 style={{ marginBottom: 6 }}>{T_("Screen → assess → mitigate → sign-off — click any row for the dimensions")}</H3>
      <p style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b, margin: "0 0 12px", lineHeight: 1.5 }}>{T_("High-risk systems carry a full fundamental-rights assessment; limited-risk systems a proportionate one. Completeness is scored from the nine dimensions.")}</p>
      <Table head={["Ref", "System", "Tier", "Discharges", "Completeness", "Residual", "Status"].map(T_)}>
        {AIA_REGISTER.map(a => {
          const c = aiaCompleteness(a);
          const st = aiaStatus(a);
          const isOpen = open === a.id;
          return [
            <tr key={a.id} onClick={() => setOpen(isOpen ? null : a.id)} style={{ cursor: "pointer" }}>
              <Td style={{ fontFamily: F.m, fontWeight: 700, color: T.ink }}>{a.id}</Td>
              <Td style={{ fontWeight: 700, color: T.ink, minWidth: 180 }}>{T_(a.system)}</Td>
              <Td><Pill c={tierTone(a.tier)}>{T_(a.tier)}</Pill></Td>
              <Td style={{ minWidth: 120 }}><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{aiaRegimesFor(a).slice(0, 4).map(r => <span key={r.id} style={{ fontSize: 9, fontWeight: 800, fontFamily: F.m, color: T.ink3, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 999, padding: "2px 7px" }}>{r.basis}</span>)}{a.regimes.length > 4 && <span style={{ fontSize: 9, color: T.ink4, fontFamily: F.m }}>+{a.regimes.length - 4}</span>}</div></Td>
              <Td style={{ minWidth: 120 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: T.s2, overflow: "hidden", minWidth: 60 }}><div style={{ width: `${c}%`, height: "100%", background: c >= 100 ? T.green : c >= 55 ? AI_GOLD : T.red }} /></div>
                  <span style={{ fontSize: 10.5, fontFamily: F.m, fontWeight: 700, color: T.ink2 }}>{c}%</span>
                </div>
              </Td>
              <Td style={{ fontFamily: F.m, color: T.ink3, whiteSpace: "nowrap" }}>{a.residualBefore} → <b style={{ color: T.green }}>{a.residualAfter}</b></Td>
              <Td><Pill c={tok(st.tone)}>{T_(st.label)}</Pill></Td>
            </tr>,
            isOpen && <tr key={a.id + "-d"}><td colSpan={7} style={{ padding: "0 10px 12px" }}>
              <div style={{ background: AI_GOLD + "10", border: `1px solid ${AI_GOLD}30`, borderRadius: 10, padding: "12px 13px" }}>
                <div style={{ fontSize: 11, color: T.ink2, fontFamily: F.b, lineHeight: 1.6, marginBottom: 9 }}><b style={{ color: AI_GOLD_INK }}>{a.id} · {T_("classification:")}</b> {T_(a.classification)}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 9 }}>{a.triggers.map(t => <span key={t} style={{ fontSize: 10, fontFamily: F.b, color: T.ink3, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "3px 9px" }}>{T_(t)}</span>)}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 6 }}>
                  {ASSESSMENT_DIMENSIONS.map(d => <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 8, background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 10px" }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: dimStat[a.dims[d.id]] || T.ink4, flexShrink: 0 }} />
                    <span style={{ fontSize: 10.5, color: T.ink2, fontFamily: F.b, flex: 1 }}>{T_(d.label)}</span>
                    <span style={{ fontSize: 9, fontFamily: F.m, fontWeight: 700, color: dimStat[a.dims[d.id]] || T.ink4 }}>{T_(a.dims[d.id])}</span>
                  </div>)}
                </div>
                <div style={{ marginTop: 8, fontSize: 10, color: T.ink3, fontFamily: F.b }}>{T_("Owner:")} <b style={{ color: T.ink2 }}>{T_(a.owner)}</b> · {ar ? "يستوفي" : "discharges"} {aiaRegimesFor(a).map(r => `${T_(r.regime)} ${r.basis}`).join(" · ")}</div>
              </div>
            </td></tr>,
          ];
        })}
      </Table>
    </Card>

    {/* the workflow */}
    <Card style={cardPad}>
      <Eyebrow>{T_("The lifecycle · one assessment, six stages")}</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>{[T_("Screen"), T_("Assess"), T_("Consult"), T_("Mitigate"), T_("Sign-off"), T_("Review")].join(" → ")}</H3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 10 }}>
        {ASSESSMENT_WORKFLOW.map(st => <div key={st.n} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 11, padding: "12px 13px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ width: 22, height: 22, borderRadius: 7, background: AI_GOLD + "1c", border: `1px solid ${AI_GOLD}45`, color: AI_GOLD_INK, fontFamily: F.m, fontWeight: 900, fontSize: 11, display: "grid", placeItems: "center" }}>{st.n}</span>
            <span style={{ fontSize: 12.5, fontWeight: 900, color: T.ink, fontFamily: F.h }}>{T_(st.stage)}</span>
          </div>
          <div style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.55, marginBottom: 6 }}>{T_(st.crit)}</div>
          <Pill c={T.blue}>{T_(st.owner)}</Pill>
        </div>)}
      </div>
      <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 10, background: AI_GOLD + "12", border: `1px solid ${AI_GOLD}30`, fontSize: 11, color: T.ink2, lineHeight: 1.6, fontFamily: F.b }}>
        <b style={{ color: AI_GOLD_INK }}>{ar ? "فيرِس إنتليجنس:" : "Veris Intelligence:"}</b> {ar ? "يحمل النظامان عاليا الخطورة تقييماً كاملاً للحقوق الأساسية، فتُستوفى التزامات FRIA وDPIA والأيزو 42001 ووظيفة الرسم في NIST والبرازيل وكوريا من سجل واحد لكلٍّ منها — والإجراءات التي تسمّيها هي الإجراءات نفسها التي يتتبّعها مركز المخاطر. وتبقى تقييمات محدودة الخطورة قيد المراجعة حتى يتغيّر نطاق تلك الأنظمة." : "Both high-risk systems carry a complete fundamental-rights assessment, so the FRIA, DPIA, ISO 42001, NIST RMF Map, Brazil and Korea impact-assessment obligations are met from one record each — and the mitigations they name are the same treatments the Risk Center already tracks. The limited-risk assessments stay in review until those systems change scope."}
      </div>
      <div style={{ display: "flex", gap: 9, marginTop: 14, flexWrap: "wrap" }}>
        <button onClick={() => showToast && showToast(ar ? "فُرز تقييم جديد — حُدّدت الفئة والأنظمة في النطاق" : "New assessment screened — tier set, regimes in scope resolved")} style={{ background: AI_GOLD, border: "none", borderRadius: 10, padding: "9px 15px", color: "#241703", fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>{T_("Screen a new system")}</button>
        <button onClick={() => showToast && showToast(ar ? "صُدّرت حزمة التقييم — FRIA + DPIA + AIA في سجل واحد" : "Assessment pack exported — FRIA + DPIA + AIA in one record")} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 15px", color: T.ink2, fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>{T_("Export assessment pack")}</button>
      </div>
    </Card>
  </div>;
}
