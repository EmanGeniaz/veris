"use client";

import { readBus, pushBus } from "@/lib/bus";
import { navigateTo } from "@/lib/navigation";
import { Cloud, Scale, Target, Workflow } from "lucide-react";
import { useState, useEffect } from "react";
import { AC_PHASES, AC_FRAMEWORK_POSTURE, acInitiatives, acPmo, acGuardrails, acCxoAlignment, acEvidence, acFeedback, gatewayProviders, gatewayPolicies, gatewayLog, gatewayStats, gatewayRouting, guardrailDetectors, deploymentModes, gatewayRetention, knowledgeAssets, riskRegister, POLICY_REGISTER } from "@/lib/platform-models";
import { FEEDBACK_DIMS, DEFAULT_FEEDBACK, feedbackAvg, feedbackDecision, decisionColorOf, autoEvidenceFor, T, RC, RCL, ROLES, AI_CENTRAL_NAV, acAccessFor, LIFECYCLE_BANDS, TERMINAL_LIFECYCLE, RETIREMENT_REASONS, AI_GOLD, AI_GOLD_INK, AI_GOLD_L, AI_GOLD_B, AI_ROLLOUT_PROGRAMS, HITL, MODEL_REGISTRY, MATURITY_DOMAINS, USE_CASES, academyEvidenceFor, F, vzDownload, CountUp, IconBox, Tag, PTag, STag, Bar, Ring, Card, SHead, AICentralLogo, INTEGRATIONS } from "./core";
import { providerSpend, costSummary, costHeadline, costOf, fmtUSD, fmtTokens } from "@/lib/cost-engine";
import { surfacesFor, initiativeById } from "@/lib/initiative-registry";
import { PageAgentRegistry } from "./agents";
import { PageAISpine } from "./spine";
import { InitiativeTrace } from "./trace";
import { RiskAssessmentCascade, PageRiskCenter } from "./riskcenter";
import { PageGovernanceAcademy } from "./academy";
import { PageTemplates } from "./templates";
import { acLensFor } from "@/lib/ai-central-lens";
import { acModuleLensFor } from "@/lib/ai-central-module-lens";
import { SmartSelect } from "./smartselect";
import { LineageDrawer } from "./lineage";
import { PF, OPEN_INCIDENTS } from "@/lib/portfolio";
import { sustainabilityStats } from "@/lib/sustainability";
import { useLang, ts, registerContent } from "@/lib/i18n";

/* Arabic for the AI Central hub — the default landing surface and its 17 inline
   views. Product/model/agent/person names, currency, %, dates, ref codes,
   framework acronyms (ISO 42001, NIST, GDPR, SOC 2) and the "Veris Intelligence:"
   brand label stay English by design; interpolated/data-woven sentences fall
   back to English where not registered. */
registerContent({
  // ── shared enumerations / status / pills (lib-sourced, rendered via T_) ──
  "High": "عالٍ", "Medium": "متوسط", "Low": "منخفض", "Critical": "حرِج", "Unknown": "غير معروف",
  "Yes": "نعم", "No": "لا", "Active": "نشط", "Complete": "مكتمل", "Completed": "مكتمل",
  "In Progress": "قيد التنفيذ", "In Review": "قيد المراجعة", "Awaiting Approval": "بانتظار الموافقة",
  "Pending": "معلّق", "Approved": "معتمَد", "Blocked": "محجوب", "On Track": "على المسار",
  "At Risk": "معرّض للخطر", "Ready": "جاهز", "Incomplete": "غير مكتمل", "Not Started": "لم يبدأ",
  "In review": "قيد المراجعة", "Missing": "مفقود", "Uploaded": "مرفوع", "Escalate": "تصعيد",
  "Monitor": "مراقبة", "Not Connected": "غير متصل", "Connected": "متصل", "Disconnected": "غير متصل",
  "Available": "متاح", "Streaming": "بثّ مباشر", "Scale": "توسيع", "Continue": "استمرار",
  "Improve": "تحسين", "Retire": "إيقاف", "Scaling": "قيد التوسيع", "Production": "الإنتاج",
  "Pilot": "تجريبي", "Retired": "مُوقَف", "New Ideas": "أفكار جديدة", "New Idea": "فكرة جديدة",
  "Open": "مفتوح", "Restricted": "مقيّد", "Confidential": "سرّي", "Internal": "داخلي",
  "Allowed": "مسموح", "Redacted": "منقّح", "Escalated": "مُصعَّد", "None": "لا شيء",
  "High-Risk": "عالي المخاطر", "Unclassified": "غير مصنّف", "Minimal Risk": "مخاطر ضئيلة",
  "In Production": "في الإنتاج", "Suspended": "معلّق", "Default": "افتراضي", "Fallback": "احتياطي",
  "Block": "حجب", "Redact": "تنقيح", "Mask": "إخفاء", "Route to review": "توجيه للمراجعة",
  "Require justification": "طلب تبرير", "Estimated": "مُقدَّر", "Measured": "مُقاس", "PII": "بيانات شخصية",
  "Now": "الآن", "Next": "التالي", "Later": "لاحقاً", "Met": "مُستوفى", "Gap": "فجوة",
  "Compliant": "ممتثل", "Partially compliant": "ممتثل جزئياً", "Non-compliant": "غير ممتثل", "Not assessed": "لم يُقيَّم",
  "Queued": "في الطابور", "Pilot active": "التجربة نشطة", "Waiting gate": "بانتظار البوابة",
  "Enterprise rollout": "الطرح المؤسسي", "Hold": "تعليق",
  // ── PageModelRegistry ──
  "AI Model Registry": "سجل نماذج الذكاء الاصطناعي",
  "Every model in its business context - initiative, executive owner and lifecycle. ISO 42001 C.8.4": "كل نموذج في سياقه التجاري - المبادرة، والمالك التنفيذي، ودورة الحياة. ISO 42001 C.8.4",
  "Close": "إغلاق", "+ Register model": "+ تسجيل نموذج", "Register an AI model": "تسجيل نموذج ذكاء اصطناعي",
  "Governed fields are picked from the enterprise vocabulary — add or request a value inline. New models enter unclassified and require intake to be brought under an initiative.": "تُختار الحقول المُحوكَمة من مفردات المؤسسة — أضِف أو اطلب قيمة مباشرةً. تدخل النماذج الجديدة غير مصنّفة وتتطلب استقبالاً لإدراجها ضمن مبادرة.",
  "Model name": "اسم النموذج", "AI system": "نظام الذكاء الاصطناعي", "Model type": "نوع النموذج",
  "Vendor": "المورّد", "Department": "القسم", "Model owner": "مالك النموذج",
  "EU AI Act risk class": "فئة مخاطر قانون الذكاء الاصطناعي الأوروبي", "AI system category": "فئة نظام الذكاء الاصطناعي",
  "Lifecycle status": "حالة دورة الحياة", "Risk severity": "شدّة الخطر", "Register model": "تسجيل النموذج",
  "Total Models": "إجمالي النماذج", "Ungoverned": "غير مُحوكَم", "Critical Risk": "مخاطر حرِجة",
  "No initiative - intake required": "لا مبادرة - يلزم استقبال", "EU AI Act gap": "فجوة قانون الذكاء الاصطناعي الأوروبي",
  "Require treatment": "تتطلب معالجة", "Clear filter ✕": "مسح المرشّح ✕",
  "No models in this segment.": "لا نماذج في هذه الشريحة.", "Registered this session": "مُسجَّل في هذه الجلسة",
  "Newly registered models awaiting governed intake and EU AI Act classification.": "نماذج مُسجَّلة حديثاً بانتظار الاستقبال المُحوكَم وتصنيف قانون الذكاء الاصطناعي الأوروبي.",
  "Outside governed initiatives": "خارج المبادرات المُحوكَمة",
  "These models run without initiative context, executive ownership or lifecycle gates.": "تعمل هذه النماذج دون سياق مبادرة أو ملكية تنفيذية أو بوابات دورة حياة.",
  "Start governed intake →": "ابدأ الاستقبال المُحوكَم ←", "Business context": "السياق التجاري",
  "Initiative": "المبادرة", "Business Unit": "وحدة الأعمال", "Executive Sponsor": "الراعي التنفيذي",
  "Business Owner": "المالك التجاري", "Current Phase": "المرحلة الحالية", "Business Value": "القيمة التجارية",
  "Expected ROI": "العائد المتوقّع", "Models in initiative": "النماذج في المبادرة", "Vendor(s)": "المورّدون",
  "Controls implemented": "الضوابط المُطبَّقة", "Risks": "المخاطر", "Evidence confidence": "ثقة الأدلة",
  "Approvals pending": "الموافقات المعلّقة", "Open Initiative →": "افتح المبادرة ←",
  "No governed initiative": "لا مبادرة مُحوكَمة",
  "This model runs without executive ownership, lifecycle gates or business-value tracking. Bring it under governance through opportunity intake.": "يعمل هذا النموذج دون ملكية تنفيذية أو بوابات دورة حياة أو تتبّع للقيمة التجارية. أدرِجه تحت الحوكمة عبر استقبال الفرص.",
  "Model assurance (ISO 42001)": "ضمان النموذج (ISO 42001)",
  "Model Card documented (C.8.4)": "توثيق بطاقة النموذج (C.8.4)",
  "AI Impact Assessment completed (A.5)": "اكتمل تقييم أثر الذكاء الاصطناعي (A.5)",
  "Bias & fairness testing done": "اكتمل اختبار التحيّز والإنصاف",
  "Kill switch / fallback deployed (C.8.5)": "نُشِر مفتاح الإيقاف / الاحتياطي (C.8.5)",
  "Training data provenance documented (C.7.2)": "توثيق مصدر بيانات التدريب (C.7.2)",
  "Transparency Score": "درجة الشفافية", "Action Required": "إجراء مطلوب",
  "EU AI Act risk classification must be completed before August 2026 enforcement.": "يجب إكمال تصنيف مخاطر قانون الذكاء الاصطناعي الأوروبي قبل إنفاذ أغسطس 2026.",
  "High-Risk system - full conformity assessment required per EU AI Act Art.43.": "نظام عالي المخاطر - يلزم تقييم مطابقة كامل وفق المادة 43 من قانون الذكاء الاصطناعي الأوروبي.",
  "across": "عبر", "governed initiatives": "مبادرات مُحوكَمة", "models": "نماذج", "model": "نموذج", "of": "من",
  // ── PageMaturityRadar ──
  "AI Governance Maturity": "نضج حوكمة الذكاء الاصطناعي", "CAIO Kit Part 1": "حقيبة مسؤول الذكاء الاصطناعي — الجزء 1",
  "Overall Governance Maturity Score": "درجة نضج الحوكمة الإجمالية", "Maturity Scale": "مقياس النضج",
  "Leading": "رائد", "Established": "راسخ", "Developing": "قيد التطوّر", "Initial": "مبدئي", "Unprepared": "غير مُستعِد",
  "Target:": "الهدف:", "Target met": "تحقّق الهدف",
  // ── PageUseCases ──
  "AI Use Case Pipeline": "خط حالات استخدام الذكاء الاصطناعي", "CAIO Kit Part 2": "حقيبة مسؤول الذكاء الاصطناعي — الجزء 2",
  "Validate Assumption": "التحقق من الافتراض", "Validate Value": "التحقق من القيمة", "Validate Operations": "التحقق من العمليات",
  "Score:": "الدرجة:", "Score": "الدرجة", "Impact": "الأثر", "Feasibility": "الجدوى",
  "Risk (inverted)": "الخطر (معكوس)", "Owner": "المالك", "Target ETA": "الموعد المتوقّع", "Status": "الحالة",
  // ── PageIntegrations ──
  "Integrations": "التكاملات", "ServiceNow GRC": "ServiceNow GRC",
  "CRM Platforms": "منصّات إدارة العلاقات", "Marketplace": "المتجر",
  "ServiceNow GRC/ IRM": "ServiceNow GRC/ IRM", "Connect": "اتصال",
  "Integration Capabilities": "قدرات التكامل", "Incident Creation": "إنشاء حادث", "Change Request": "طلب تغيير",
  "Risk Issue": "مسألة مخاطر", "GRC Task": "مهمة حوكمة", "Control Remediation": "معالجة ضابط",
  "Evidence Request": "طلب دليل", "Policy Exception": "استثناء سياسة", "CMDB Asset Sync": "مزامنة أصول CMDB",
  "SLA Status Sync": "مزامنة حالة اتفاقية الخدمة", "Bi-directional Updates": "تحديثات ثنائية الاتجاه",
  "Trigger Configuration": "إعداد المُشغِّلات", "Event": "الحدث", "Table": "الجدول", "Priority": "الأولوية",
  "Auto": "تلقائي", "Active": "نشط", "Recent ServiceNow Tickets": "تذاكر ServiceNow الأخيرة",
  "Open ": "فتح ", "Customer Trust Requests": "طلبات ثقة العملاء", "Active": "نشط",
  "Customer trust requests, security questionnaires, compliance evidence sharing from your CRM pipeline.": "طلبات ثقة العملاء، واستبيانات الأمن، ومشاركة أدلة الامتثال من خط إدارة العلاقات لديك.",
  "Due": "مستحق", "Respond": "استجابة", "Task Management": "إدارة المهام", "Notifications": "الإشعارات",
  "Evidence Collection": "جمع الأدلة", "Cloud Evidence": "أدلة السحابة", "Dev Security": "أمن التطوير",
  "Vulnerability": "الثغرات", "IAM Evidence": "أدلة إدارة الهوية", "Endpoint Security": "أمن نقاط النهاية",
  "SIEM Evidence": "أدلة SIEM", "Coming Q3": "قادم الربع الثالث", "Coming Q4": "قادم الربع الرابع",
  "Roadmap": "خارطة الطريق",
  // ── PageAICentral · header / lens / chrome ──
  "AI Central": "مركز الذكاء الاصطناعي", "Executive Dashboard": "لوحة القيادة التنفيذية",
  "AI Strategy": "استراتيجية الذكاء الاصطناعي", "AI Portfolio": "محفظة الذكاء الاصطناعي",
  "AI Inventory": "جرد الذكاء الاصطناعي", "AI Lifecycle": "دورة حياة الذكاء الاصطناعي",
  "AI Gateway": "بوابة الذكاء الاصطناعي", "AI Agents": "وكلاء الذكاء الاصطناعي",
  "Risk Center": "مركز المخاطر", "Trust Center": "مركز الثقة", "Evidence Fabric": "نسيج الأدلة",
  "Templates & Register": "القوالب والسجل", "Controls & Compliance": "الضوابط والامتثال",
  "Policies & Standards": "السياسات والمعايير", "Value Realization": "تحقيق القيمة",
  "Governance Academy": "أكاديمية الحوكمة", "Audit Center": "مركز التدقيق",
  "Dashboard": "لوحة القيادة", "lens": "عدسة", "Accountable owner": "المالك المسؤول",
  "The executive accountable for this module — not the current viewer": "التنفيذي المسؤول عن هذه الوحدة — وليس العارض الحالي",
  "Oversight ·": "الإشراف ·", "modules enabled": "وحدة مُفعَّلة",
  "Initiative portfolio ·": "محفظة المبادرات ·", "columns": "أعمدة",
  "Your initiatives": "مبادراتك", "All AI initiatives": "كل مبادرات الذكاء الاصطناعي",
  "the same portfolio, framed for": "المحفظة نفسها، مؤطَّرة لـ", "Full portfolio detail": "تفاصيل المحفظة الكاملة",
  // module owner / oversight (AI_CENTRAL_NAV) — role acronyms stay English
  "AI Governance Office": "مكتب حوكمة الذكاء الاصطناعي", "Board": "المجلس", "Business CXOs": "القادة التنفيذيون",
  "Internal Audit": "التدقيق الداخلي", "Legal & Compliance": "القانون والامتثال",
  // ── role lens (acLensFor) — framing questions rendered on every view ──
  "“Should I worry?” — value at stake and what’s ready to scale.": "«هل ينبغي أن أقلق؟» — القيمة على المحكّ وما هو جاهز للتوسيع.",
  "“Can we deliver and operate this?” — delivery status and adoption.": "«هل يمكننا تسليم هذا وتشغيله؟» — حالة التسليم والتبنّي.",
  "“Is this investment creating value?” — expected vs realized and health.": "«هل يخلق هذا الاستثمار قيمة؟» — المتوقّع مقابل المُحقَّق والصحة.",
  "“Is the workforce ready?” — adoption and enablement by unit.": "«هل القوى العاملة جاهزة؟» — التبنّي والتمكين حسب الوحدة.",
  "“Can I trust this AI?” — guardrail coverage, risk and evidence.": "«هل يمكنني الوثوق بهذا الذكاء الاصطناعي؟» — تغطية الحواجز والمخاطر والأدلة.",
  "“Is this AI responsible and governed?” — the full control plane.": "«هل هذا الذكاء الاصطناعي مسؤول ومُحوكَم؟» — مستوى التحكّم الكامل.",
  "“Will this integrate and scale?” — platform readiness and adoption.": "«هل سيتكامل هذا ويتوسّع؟» — جاهزية المنصة والتبنّي.",
  "“Does this protect personal information?” — data, risk and residency.": "«هل يحمي هذا المعلومات الشخصية؟» — البيانات والمخاطر والإقامة.",
  "“Can this legally operate?” — governance, risk and audit readiness.": "«هل يمكن أن يعمل هذا قانونياً؟» — الحوكمة والمخاطر وجاهزية التدقيق.",
  "“Is AI risk inside appetite?” — residual risk, controls and treatment.": "«هل مخاطر الذكاء الاصطناعي ضمن الشهية؟» — المخاطر المتبقّية والضوابط والمعالجة.",
  "“Can this legally operate?” — obligations, conformity and defensibility.": "«هل يمكن أن يعمل هذا قانونياً؟» — الالتزامات والمطابقة وقابلية الدفاع.",
  "“How are my team’s initiatives doing?” — the programs your team runs.": "«كيف حال مبادرات فريقي؟» — البرامج التي يديرها فريقك.",
  "“What am I working on, and what’s next?” — your initiatives and tasks.": "«على ماذا أعمل، وما التالي؟» — مبادراتك ومهامك.",
  // lens hero subtitles
  "Portfolio value": "قيمة المحفظة", "realized of $17.5M expected": "مُحقَّقة من 17.5 مليون دولار متوقّعة",
  "Straight-through": "المعالجة المباشرة", "across live programs": "عبر البرامج الفعلية",
  "Portfolio ROI": "عائد المحفظة", "Workforce adoption": "تبنّي القوى العاملة", "2,790 people": "2,790 شخصاً",
  "Security posture": "الوضع الأمني", "2,410 attacks blocked": "2,410 هجمة محجوبة",
  "/100 · all modules": "/100 · كل الوحدات", "Platform uptime": "زمن تشغيل المنصة", "models under gateway": "نماذج تحت البوابة",
  "DPIA coverage": "تغطية تقييم أثر الخصوصية", "2 Art.22 systems": "نظامان بموجب المادة 22",
  "Controls effective": "الضوابط الفعّالة", "21 of 24": "21 من 24",
  "Enterprise AI risk": "مخاطر الذكاء الاصطناعي المؤسسية", "within appetite · 2 open": "ضمن الشهية · 2 مفتوحة",
  "Legally defensible": "قابل للدفاع قانونياً", "1 conformity gap": "فجوة مطابقة واحدة",
  "My team’s initiatives": "مبادرات فريقي", "My active initiatives": "مبادراتي النشطة", "1 task due today": "مهمة واحدة مستحقة اليوم",
  // lens col headers
  "Stage": "المرحلة", "Guardrail": "الحاجز",
  // lens KPI labels + sublabels
  "Ready to scale": "جاهز للتوسيع", "1 needs your gate": "1 يحتاج بوابتك", "Enterprise health": "صحة المؤسسة",
  "weighted": "مرجّح", "High-risk": "عالي المخاطر", "of the portfolio": "من المحفظة",
  "Delivery on track": "التسليم على المسار", "1 at risk": "1 معرّض للخطر", "4 units": "4 وحدات",
  "evidence overdue": "الأدلة متأخرة", "Go-live this Q": "الإطلاق هذا الربع", "pending readiness": "بانتظار الجاهزية",
  "Invested": "مُستثمَر", "57%": "57%", "Value at risk": "القيمة المعرّضة للخطر", "no value yet": "لا قيمة بعد",
  "Reforecast": "إعادة التنبّؤ", "programs": "برامج", "Below threshold": "دون العتبة", "People team": "فريق الموارد البشرية",
  "Reskilling": "إعادة التأهيل", "of 750": "من 750", "Sentiment": "المشاعر", "net": "صافٍ",
  "Guardrail coverage": "تغطية الحواجز", "production models": "نماذج الإنتاج", "Guardrail gaps": "فجوات الحواجز",
  "2 models": "نموذجان", "Open incidents": "الحوادث المفتوحة", "Sec evidence": "الأدلة الأمنية", "of lifecycle": "من دورة الحياة",
  "+4 QoQ": "+4 ربعياً", "Active initiatives": "المبادرات النشطة", "2 high-risk": "2 عالية المخاطر",
  "Approvals pending": "الموافقات المعلّقة", "need decisions": "تحتاج قرارات",
  "Models in prod": "نماذج في الإنتاج", "of 21": "من 21", "p95 latency": "زمن الاستجابة p95", "SLO 600ms": "هدف الخدمة 600 مللي ثانية",
  "Cost / 1k calls": "التكلفة / 1000 استدعاء", "+14% MoM": "+14% شهرياً", "1 degraded": "1 متدهور",
  "systems": "أنظمة", "Art.22 systems": "أنظمة المادة 22", "automated decisions": "قرارات آلية",
  "Consent": "الموافقة", "documented": "مُوثَّق", "Privacy incidents": "حوادث الخصوصية", "30d": "30 يوماً",
  "Open findings": "النتائج المفتوحة", "2 high": "2 عالية", "lifecycle": "دورة الحياة", "Frameworks": "الأطر", "aligned": "متوائم",
  "21/24": "21/24", "Critical risks": "المخاطر الحرِجة", "Open treatments": "المعالجات المفتوحة", "1 overdue": "1 متأخر",
  "KRIs breached": "مؤشرات المخاطر المُتجاوَزة", "of 14": "من 14",
  "Conformity gaps": "فجوات المطابقة", "Contracts flagged": "عقود مُعلَّمة", "liability": "المسؤولية",
  "Team initiatives": "مبادرات الفريق", "in flight": "قيد التنفيذ", "On track": "على المسار", "1 blocked": "1 محجوب",
  "Team adoption": "تبنّي الفريق", "14/22 active": "14/22 نشط", "Approvals": "الموافقات", "waiting on you": "بانتظارك",
  "My initiatives": "مبادراتي", "contributing": "مساهم", "1 due today": "1 مستحق اليوم",
  "Guardrail saves": "تدخّلات الحماية", "this week": "هذا الأسبوع", "Learning": "التعلّم", "safe-use": "الاستخدام الآمن",
  // ── module lens (acModuleLensFor) — framing question · subtitle · angle per view ──
  "Are DPIAs, consent and residency documented?": "هل جرى توثيق تقييمات أثر الخصوصية والموافقة والإقامة؟",
  "Are automated decisions safeguarded?": "هل القرارات الآلية محميّة بالضمانات؟",
  "Are findings closing on time with evidence?": "هل تُغلَق النتائج في موعدها مع الأدلة؟",
  "Are initiatives moving through delivery on plan?": "هل تتحرّك المبادرات عبر التسليم وفق الخطة؟",
  "Are our controls effective and audit-ready?": "هل ضوابطنا فعّالة وجاهزة للتدقيق؟",
  "Are our public trust claims defensible?": "هل ادّعاءات الثقة العلنية قابلة للدفاع؟",
  "Are policies current, mapped and acknowledged?": "هل السياسات حديثة ومُخطَّطة ومُقَرّة؟",
  "Can I trust each model in production?": "هل يمكنني الوثوق بكل نموذج في الإنتاج؟",
  "Can we attest to privacy on demand?": "هل يمكننا المصادقة على الخصوصية عند الطلب؟",
  "Can we close findings with evidence in hand?": "هل يمكننا إغلاق النتائج والأدلة في متناول اليد؟",
  "Can we deliver and operate across units?": "هل يمكننا التسليم والتشغيل عبر الوحدات؟",
  "Can we prove AI is safe, right now?": "هل يمكننا إثبات أمان الذكاء الاصطناعي الآن؟",
  "Could we defend this to a regulator today?": "هل يمكننا الدفاع عن هذا أمام منظّم اليوم؟",
  "Do data policies hold up under scrutiny?": "هل تصمد سياسات البيانات تحت التدقيق؟",
  "Do policies satisfy every regulatory obligation?": "هل تُلبّي السياسات كل التزام تنظيمي؟",
  "Do we have proof the controls actually work?": "هل لدينا دليل على أن الضوابط تعمل فعلاً؟",
  "Does every gate have the proof it needs?": "هل لكل بوابة الدليل الذي تحتاجه؟",
  "Does the roadmap keep governance ahead of adoption?": "هل تُبقي خارطة الطريق الحوكمة متقدّمة على التبنّي؟",
  "How is AI governed, and where are the gaps?": "كيف يُحوكَم الذكاء الاصطناعي، وأين الفجوات؟",
  "How mature is governance across the estate?": "ما مدى نضج الحوكمة عبر البيئة؟",
  "How much control is enforced automatically?": "كم من السيطرة يُنفَّذ تلقائياً؟",
  "Is AI moving the numbers the board cares about?": "هل يُحرّك الذكاء الاصطناعي الأرقام التي يهتمّ بها المجلس؟",
  "Is AI risk inside appetite, and what needs treatment?": "هل مخاطر الذكاء الاصطناعي ضمن الشهية، وما الذي يحتاج معالجة؟",
  "Is every model inside a governed initiative?": "هل كل نموذج ضمن مبادرة مُحوكَمة؟",
  "Is every phase gate backed by evidence?": "هل كل بوابة مرحلة مدعومة بالأدلة؟",
  "Is everything auditable and regulator-ready?": "هل كل شيء قابل للتدقيق وجاهز للمنظّم؟",
  "Is exposure within appetite and trending down?": "هل التعرّض ضمن الشهية وفي اتجاه تنازلي؟",
  "Is risk assessed before each phase advances?": "هل تُقيَّم المخاطر قبل تقدّم كل مرحلة؟",
  "Is the AI bet paying off and worth expanding?": "هل يؤتي رهان الذكاء الاصطناعي ثماره ويستحقّ التوسيع؟",
  "Is the AI investment turning into value?": "هل يتحوّل استثمار الذكاء الاصطناعي إلى قيمة؟",
  "Is the estate known, integrated and supportable?": "هل البيئة معروفة ومتكاملة وقابلة للدعم؟",
  "Is the investment creating value by unit?": "هل يخلق الاستثمار قيمة حسب الوحدة؟",
  "Is the live security posture defensible?": "هل الوضع الأمني الفعلي قابل للدفاع؟",
  "Is the policy estate reviewed and enforced?": "هل تُراجَع بيئة السياسات وتُنفَّذ؟",
  "Is there proof, and is it audit-ready?": "هل يوجد دليل، وهل هو جاهز للتدقيق؟",
  "Is this AI responsible and governed end to end?": "هل هذا الذكاء الاصطناعي مسؤول ومُحوكَم من طرف إلى طرف؟",
  "What AI is running across the enterprise?": "أيّ ذكاء اصطناعي يعمل عبر المؤسسة؟",
  "What data does the estate hold and process?": "ما البيانات التي تحتفظ بها البيئة وتعالجها؟",
  "What models are running, and in whose initiative?": "أيّ نماذج تعمل، وضمن مبادرة مَن؟",
  "What personal data does each model touch?": "ما البيانات الشخصية التي يمسّها كل نموذج؟",
  "What return is each program delivering?": "ما العائد الذي يحقّقه كل برنامج؟",
  "What's creating value and ready to scale?": "ما الذي يخلق قيمة وجاهز للتوسيع؟",
  "Where is AI investment and value going?": "إلى أين يتّجه استثمار الذكاء الاصطناعي وقيمته؟",
  "Where is AI taking the enterprise, and is it funded?": "إلى أين يأخذ الذكاء الاصطناعي المؤسسة، وهل هو مُموَّل؟",
  "Where is each initiative on the governed journey?": "أين تقع كل مبادرة على الرحلة المُحوكَمة؟",
  "Where is guardrail coverage thin?": "أين تغطية الحواجز رفيعة؟",
  "Which risks stem from the attack surface?": "أيّ مخاطر تنبع من سطح الهجوم؟",
  "Will each model scale and perform?": "هل سيتوسّع كل نموذج ويؤدّي؟",
  // module lens subtitles
  "Appetite, residual grades, KRIs and treatment status.": "الشهية، ودرجات المخاطر المتبقّية، ومؤشرات المخاطر، وحالة المعالجة.",
  "Attacks blocked, guardrail coverage and incident status.": "الهجمات المحجوبة، وتغطية الحواجز، وحالة الحوادث.",
  "Attestations, transparency notices and disclosures.": "الشهادات، وإشعارات الشفافية، والإفصاحات.",
  "Audit packs, evidence completeness and export readiness.": "حِزَم التدقيق، واكتمال الأدلة، وجاهزية التصدير.",
  "Automated vs manual controls across the platform.": "الضوابط الآلية مقابل اليدوية عبر المنصة.",
  "Consent, residency and privacy attestations, live.": "الموافقة، والإقامة، وشهادات الخصوصية، فعليّاً.",
  "Control compliance, policy violations and open exceptions.": "امتثال الضوابط، وانتهاكات السياسات، والاستثناءات المفتوحة.",
  "Control test records and incident evidence.": "سجلات اختبار الضوابط وأدلة الحوادث.",
  "Coverage across phases and what's still pending.": "التغطية عبر المراحل وما لا يزال معلّقاً.",
  "Coverage, gaps and live enforcement across production models.": "التغطية، والفجوات، والإنفاذ الفعلي عبر نماذج الإنتاج.",
  "DPIAs, Article 22 systems and documented consent.": "تقييمات أثر الخصوصية، وأنظمة المادة 22، والموافقة المُوثَّقة.",
  "Data-handling policies, consent standards and reviews.": "سياسات معالجة البيانات، ومعايير الموافقة، والمراجعات.",
  "Datasets, classification and residency across the estate.": "مجموعات البيانات، والتصنيف، والإقامة عبر البيئة.",
  "Delivery progress, blockers and go-live readiness.": "تقدّم التسليم، والعوائق، وجاهزية الإطلاق.",
  "Effectiveness, open findings and framework alignment.": "الفعالية، والنتائج المفتوحة، وتوافق الأطر.",
  "Enterprise value realized and what's ready to scale.": "قيمة المؤسسة المُحقَّقة وما هو جاهز للتوسيع.",
  "Every model in its initiative, owner and lifecycle context.": "كل نموذج في سياق مبادرته ومالكه ودورة حياته.",
  "Every system, dataset, vendor and integration — governed or in intake.": "كل نظام ومجموعة بيانات ومورّد وتكامل — مُحوكَم أو قيد الاستقبال.",
  "Expected vs realized value and ROI across the portfolio.": "القيمة المتوقّعة مقابل المُحقَّقة والعائد عبر المحفظة.",
  "Findings closure and evidence completeness for audit.": "إغلاق النتائج واكتمال الأدلة للتدقيق.",
  "Findings, remediation status and overdue items.": "النتائج، وحالة المعالجة، والعناصر المتأخرة.",
  "Governance maturity and pipeline by business unit.": "نضج الحوكمة والخط حسب وحدة الأعمال.",
  "Governed coverage, intake gaps and classification status.": "التغطية المُحوكَمة، وفجوات الاستقبال، وحالة التصنيف.",
  "Guardrails, red-team status and unclassified risk per model.": "الحواجز، وحالة الفريق الأحمر، والمخاطر غير المصنّفة لكل نموذج.",
  "Immutable hash-chained trail, audit packs and export.": "مسار غير قابل للتغيير مُسلسَل بالبصمة، وحِزَم تدقيق، وتصدير.",
  "Investment thesis, strategic pillars and department roadmap.": "أطروحة الاستثمار، والركائز الاستراتيجية، وخارطة طريق القسم.",
  "Investment, governance maturity and use-case pipeline by unit.": "الاستثمار، ونضج الحوكمة، وخط حالات الاستخدام حسب الوحدة.",
  "Latency, unit cost and integration status per model.": "زمن الاستجابة، وتكلفة الوحدة، وحالة التكامل لكل نموذج.",
  "Live posture, incidents, attestations and trust signals.": "الوضع الفعلي، والحوادث، والشهادات، وإشارات الثقة.",
  "Phase progress, gate readiness and pending approvals.": "تقدّم المرحلة، وجاهزية البوابة، والموافقات المعلّقة.",
  "Policy library, review cadence and violation analytics.": "مكتبة السياسات، ووتيرة المراجعة، وتحليلات الانتهاكات.",
  "Privacy evidence — assessments, consent and residency proofs.": "أدلة الخصوصية — التقييمات، والموافقة، وإثباتات الإقامة.",
  "Residual risk, control effectiveness and open treatments.": "المخاطر المتبقّية، وفعالية الضوابط، والمعالجات المفتوحة.",
  "Review cadence, exceptions and violation trend.": "وتيرة المراجعة، والاستثناءات، واتجاه الانتهاكات.",
  "Risk and impact assessments at every governance gate.": "تقييمات المخاطر والأثر عند كل بوابة حوكمة.",
  "Roadmap sequencing, maturity trajectory and capability gaps.": "ترتيب خارطة الطريق، ومسار النضج، وفجوات القدرات.",
  "Searchable, versioned evidence across the lifecycle.": "أدلة قابلة للبحث ومُؤرشَفة بالإصدار عبر دورة الحياة.",
  "Security-origin risks, guardrail gaps and incidents.": "المخاطر ذات المنشأ الأمني، وفجوات الحواجز، والحوادث.",
  "Spend, realized value and ROI across business units.": "الإنفاق، والقيمة المُحقَّقة، والعائد عبر وحدات الأعمال.",
  "Spend, realized value, ROI confidence and reforecasts.": "الإنفاق، والقيمة المُحقَّقة، وثقة العائد، وإعادة التنبّؤ.",
  "Standards alignment, obligations and defensibility.": "توافق المعايير، والالتزامات، وقابلية الدفاع.",
  "Systems, integrations and vendor footprint under management.": "الأنظمة، والتكاملات، وبصمة المورّدين تحت الإدارة.",
  "The 13-phase lifecycle, gates and evidence per initiative.": "دورة الحياة ذات 13 مرحلة، والبوابات، والأدلة لكل مبادرة.",
  "The governance score and what's driving it this quarter.": "درجة الحوكمة وما يقودها هذا الربع.",
  "Throughput and adoption across business units.": "الإنتاجية والتبنّي عبر وحدات الأعمال.",
  "Training provenance, PII handling and residency per model.": "مصدر التدريب، ومعالجة البيانات الشخصية، والإقامة لكل نموذج.",
  "Value realized and scale-readiness across business units.": "القيمة المُحقَّقة وجاهزية التوسيع عبر وحدات الأعمال.",
  "Value thesis, scale-ready bets and board decisions.": "أطروحة القيمة، والرهانات الجاهزة للتوسيع، وقرارات المجلس.",
  // module lens angles (category · phrase)
  "Audit · Findings closure": "التدقيق · إغلاق النتائج", "Audit · Regulator readiness": "التدقيق · جاهزية المنظّم",
  "Audit · Trail": "التدقيق · المسار", "Evidence · Assurance": "الأدلة · الضمان",
  "Evidence · Audit trail": "الأدلة · مسار التدقيق", "Evidence · Lifecycle proof": "الأدلة · إثبات دورة الحياة",
  "Evidence · Privacy record": "الأدلة · سجل الخصوصية", "Evidence · Security assurance": "الأدلة · الضمان الأمني",
  "Governance · Control automation": "الحوكمة · أتمتة الضوابط", "Governance · Control estate": "الحوكمة · بيئة الضوابط",
  "Governance · Control plane": "الحوكمة · مستوى التحكّم", "Governance · Full control plane": "الحوكمة · مستوى التحكّم الكامل",
  "Governance · Guardrail enforcement": "الحوكمة · إنفاذ الحواجز", "Governance · Privacy safeguards": "الحوكمة · ضمانات الخصوصية",
  "Inventory · Data estate": "الجرد · بيئة البيانات", "Inventory · Platform estate": "الجرد · بيئة المنصة",
  "Inventory · The estate": "الجرد · البيئة", "Lifecycle · Delivery": "دورة الحياة · التسليم",
  "Lifecycle · Gate assurance": "دورة الحياة · ضمان البوابات", "Lifecycle · Pilot to scale": "دورة الحياة · من التجربة إلى التوسيع",
  "Lifecycle · Risk gates": "دورة الحياة · بوابات المخاطر", "Policies · Compliance cadence": "السياسات · وتيرة الامتثال",
  "Policies · Library": "السياسات · المكتبة", "Policies · Privacy standards": "السياسات · معايير الخصوصية",
  "Policies · Regulatory mapping": "السياسات · التخطيط التنظيمي", "Portfolio · By business unit": "المحفظة · حسب وحدة الأعمال",
  "Portfolio · Delivery": "المحفظة · التسليم", "Portfolio · Governance maturity": "المحفظة · نضج الحوكمة",
  "Portfolio · Investment": "المحفظة · الاستثمار", "Portfolio · Value at stake": "المحفظة · القيمة على المحكّ",
  "Registry · Attack surface": "السجل · سطح الهجوم", "Registry · Business context": "السجل · السياق التجاري",
  "Registry · Data exposure": "السجل · تعرّض البيانات", "Registry · Governance coverage": "السجل · تغطية الحوكمة",
  "Registry · Runtime footprint": "السجل · بصمة وقت التشغيل", "Risk · Enterprise exposure": "المخاطر · تعرّض المؤسسة",
  "Risk · Framework & appetite": "المخاطر · الإطار والشهية", "Risk · Security exposure": "المخاطر · التعرّض الأمني",
  "Strategy · Board thesis": "الاستراتيجية · أطروحة المجلس", "Strategy · Enterprise ambition": "الاستراتيجية · طموح المؤسسة",
  "Strategy · Governance roadmap": "الاستراتيجية · خارطة طريق الحوكمة", "Trust · Attestation": "الثقة · المصادقة",
  "Trust · Live posture": "الثقة · الوضع الفعلي", "Trust · Privacy assurance": "الثقة · ضمان الخصوصية",
  "Trust · Security posture": "الثقة · الوضع الأمني", "Value · Board outcomes": "القيمة · نتائج المجلس",
  "Value · Investment return": "القيمة · عائد الاستثمار", "Value · Realization": "القيمة · التحقيق",
  // module lens chip labels
  "Ack coverage": "تغطية الإقرار", "At risk": "معرّض للخطر", "Automated controls": "ضوابط آلية",
  "Avg maturity": "متوسط النضج", "Board decisions": "قرارات المجلس", "Business units": "وحدات الأعمال",
  "Capability gaps": "فجوات القدرات", "Closed 30d": "مُغلَق خلال 30 يوماً", "Consent records": "سجلات الموافقة",
  "Control tests": "اختبارات الضوابط", "Cost / 1k": "التكلفة / 1000", "Coverage gaps": "فجوات التغطية",
  "Critical risk": "مخاطر حرِجة", "Critical-risk": "حرِجة المخاطر", "DPIAs": "تقييمات أثر الخصوصية",
  "Data policies": "سياسات البيانات", "Disclosures": "الإفصاحات", "Enforcement uptime": "زمن تشغيل الإنفاذ",
  "Evidence coverage": "تغطية الأدلة", "Gate blocks": "عوائق البوابات", "Gated phases": "مراحل مُبوَّبة",
  "Gates pending": "بوابات معلّقة", "Lagging unit": "الوحدة المتأخرة", "Leading unit": "الوحدة الرائدة",
  "Lifecycle coverage": "تغطية دورة الحياة", "Live incidents": "حوادث فعلية", "Manual controls": "ضوابط يدوية",
  "Obligation gaps": "فجوات الالتزامات", "Open exceptions": "استثناءات مفتوحة", "Overdue": "متأخر",
  "Overdue treatments": "معالجات متأخرة", "PII datasets": "مجموعات بيانات شخصية", "PII violations": "انتهاكات البيانات الشخصية",
  "PII-handling": "معالجة البيانات الشخصية", "Phases gated": "المراحل المُبوَّبة", "Pipeline": "الخط",
  "Red-team overdue": "الفريق الأحمر متأخر", "Residency proofs": "إثباتات الإقامة", "Residency-bound": "مقيّد بالإقامة",
  "Residual risk": "المخاطر المتبقّية", "Risk-assessed": "مُقيَّم المخاطر", "Scopes": "النطاقات",
  "Security evidence": "الأدلة الأمنية", "Security risks": "المخاطر الأمنية", "Total models": "إجمالي النماذج",
  "Transparency notices": "إشعارات الشفافية", "Treatments due": "معالجات مستحقة", "Vs appetite": "مقابل الشهية",
  // module lens chip sublabels (word-based; pure figures/codes stay English)
  "1 at your gate": "واحد عند بوابتك", "1 repeated": "واحد مُتكرِّر", "2 expiring": "اثنان ينتهيان",
  "8 governed": "8 مُحوكَمة", "active": "نشط", "all in intake": "الكل قيد الاستقبال", "amber band": "النطاق البرتقالي",
  "approvals": "موافقات", "approved": "معتمَد", "auto-decide": "قرار آلي", "before scale": "قبل التوسيع",
  "bets": "رهانات", "by FY27": "بحلول السنة المالية 2027", "canonical": "معياري", "control compliance": "امتثال الضوابط",
  "data drift": "انحراف البيانات", "decisions": "قرارات", "enforced": "مُنفَّذ", "evidence": "أدلة",
  "expected": "متوقّع", "gateway": "البوابة", "governed": "مُحوكَم", "high residual": "مخاطر متبقّية عالية",
  "in scope": "ضمن النطاق", "intake clean": "استقبال نظيف", "logged": "مُسجَّل", "of gates": "من البوابات",
  "of models": "من النماذج", "of portfolio": "من المحفظة", "of register": "من السجل", "of 24": "من 24", "of 5": "من 5",
  "past due": "بعد الموعد", "portfolio": "المحفظة", "production": "الإنتاج", "project→org": "مشروع ← مؤسسة",
  "provenance": "المصدر", "published": "منشور", "ready": "جاهز", "redacted MTD": "مُنقَّح منذ بداية الشهر",
  "remediation": "المعالجة", "review load": "حمل المراجعة", "this quarter": "هذا الربع", "to close": "للإغلاق",
  "use cases": "حالات الاستخدام", "verifiable": "قابل للتحقّق", "with evidence": "مع الأدلة", "with record": "مع سجل",
  "within appetite": "ضمن الشهية", "EU only": "الاتحاد الأوروبي فقط", "EU-bound": "مقيّد بالاتحاد الأوروبي",
  // ── Dashboard ──
  "Total initiatives": "إجمالي المبادرات", "Enterprise AI portfolio": "محفظة الذكاء الاصطناعي المؤسسية",
  "Active AI projects": "مشاريع الذكاء الاصطناعي النشطة", "In lifecycle": "في دورة الحياة",
  "High-risk use cases": "حالات استخدام عالية المخاطر", "High or critical": "عالية أو حرِجة",
  "Pending approvals": "الموافقات المعلّقة", "HITL and CXO": "الإنسان في الحلقة والقيادة",
  "Open audit findings": "نتائج تدقيق مفتوحة", "2 high": "2 عالية",
  "Guardrail compliance": "امتثال الحواجز", "Mandatory controls": "ضوابط إلزامية",
  "AI adoption score": "درجة تبنّي الذكاء الاصطناعي", "Workforce readiness": "جاهزية القوى العاملة",
  "Business value score": "درجة القيمة التجارية", "ROI and outcomes": "العائد والنتائج",
  "Budget utilization": "استخدام الميزانية", "Portfolio ROI": "عائد المحفظة",
  "Weighted actual vs expected": "المرجّح الفعلي مقابل المتوقّع",
  "Initiatives needing attention": "مبادرات تحتاج انتباهاً", "Open phase": "افتح المرحلة",
  "Risk heatmap": "خريطة حرارة المخاطر", "Governance maturity": "نضج الحوكمة", "Open AI Governance": "افتح حوكمة الذكاء الاصطناعي",
  "Strategy linkage": "ربط الاستراتيجية", "Policy mapping": "تخطيط السياسات", "Human oversight": "الإشراف البشري",
  "Evidence readiness": "جاهزية الأدلة", "Value realization": "تحقيق القيمة",
  "Feedback engine outcomes": "مخرجات محرّك التغذية الراجعة", "Composite": "المركّب",
  "Business value tracking": "تتبّع القيمة التجارية", "Expected": "المتوقّع", "Actual": "الفعلي",
  "Business unit comparison": "مقارنة وحدات الأعمال", "Resistance:": "المقاومة:", "Training": "التدريب",
  "Adoption": "التبنّي", "CXO alignment": "توافق القيادة", "mapped initiatives": "مبادرات مُخطَّطة",
  // ── Initiatives · rail / create ──
  "Search portfolio...": "ابحث في المحفظة...", "All units": "كل الوحدات", "All stages": "كل المراحل",
  "Favorites": "المفضّلة", "Recently viewed": "المعروضة حديثاً",
  "No initiatives match - clear the search or filter.": "لا مبادرات مطابقة - امسح البحث أو المرشّح.",
  "+ New AI Initiative": "+ مبادرة ذكاء اصطناعي جديدة", "Create AI Initiative": "إنشاء مبادرة ذكاء اصطناعي",
  "Every initiative starts in Discover. Mandatory artifacts gate each phase; the record becomes the single source of truth.": "تبدأ كل مبادرة في مرحلة الاستكشاف. تحرس الأدلة الإلزامية كل مرحلة؛ ويصبح السجل المصدر الوحيد للحقيقة.",
  "Initiative name": "اسم المبادرة", "Expected value (USD m)": "القيمة المتوقّعة (بملايين الدولارات)",
  "Business unit": "وحدة الأعمال", "Business owner": "المالك التجاري", "Executive sponsor": "الراعي التنفيذي",
  "Lifecycle phase": "مرحلة دورة الحياة", "Data classification": "تصنيف البيانات", "Category": "الفئة",
  "Create initiative": "إنشاء المبادرة",
  // ── Overview ──
  "Problem": "المشكلة", "Vision": "الرؤية", "Business objective": "الهدف التجاري",
  "Budget": "الميزانية", "Timeline": "الجدول الزمني", "Overall completion": "الإنجاز الإجمالي",
  "AI models used": "نماذج الذكاء الاصطناعي المستخدمة", "None registered": "لا شيء مُسجَّل",
  "one object ·": "كائن واحد ·", "governed across every lens below": "مُحوكَم عبر كل عدسة أدناه",
  "portfolio record": "سجل محفظة", "Current phase": "المرحلة الحالية",
  "Blocked:": "محجوب:", "Next action:": "الإجراء التالي:", "Initiative team": "فريق المبادرة",
  "Technical owner": "المالك التقني", "AI champion": "بطل الذكاء الاصطناعي", "CXO sponsors": "رعاة القيادة",
  "Financial impact": "الأثر المالي", "Expected value": "القيمة المتوقّعة", "Realized value": "القيمة المُحقَّقة",
  "Cost savings": "توفير التكاليف", "Revenue generated": "الإيراد المُحقَّق",
  "Governance & technical details": "تفاصيل الحوكمة والتقنية", "Lifecycle": "دورة الحياة",
  "Linked policies": "السياسات المرتبطة", "Linked controls": "الضوابط المرتبطة", "Linked risks": "المخاطر المرتبطة",
  "Audits": "عمليات التدقيق", "Training status": "حالة التدريب", "None yet": "لا شيء بعد",
  "Compliance mapping": "تخطيط الامتثال", "items": "عناصر",
  // ── Implementation ──
  "Progression blocked.": "التقدّم محجوب.", "completion": "الإكمال",
  "Download package ↓": "تنزيل الحزمة ↓", "Exit criteria": "معايير الخروج",
  "Mandatory artifacts": "الأدلة الإلزامية", "Version history & approvals": "سجل الإصدارات والموافقات",
  "No versions yet - upload evidence below or complete the artifact to start the trail.": "لا إصدارات بعد - ارفع الأدلة أدناه أو أكمل الدليل لبدء المسار.",
  "Drop evidence files here": "أفلِت ملفات الأدلة هنا",
  "Uploads are stamped with owner, time and version and recorded in Trust & Evidence.": "تُختَم المرفوعات بالمالك والوقت والإصدار وتُسجَّل في الثقة والأدلة.",
  "Select files": "اختر الملفات",
  "– Cancel evidence record": "– إلغاء سجل الدليل", "+ Log an evidence record (governed owner)": "+ تسجيل سجل دليل (مالك مُحوكَم)",
  "Evidence item": "عنصر الدليل", "Control framework": "إطار الضابط", "Approval": "الموافقة", "Record evidence": "تسجيل الدليل",
  "Veris completeness review": "مراجعة اكتمال Veris", "Ownership (RACI)": "الملكية (RACI)",
  "Responsible": "المسؤول عن التنفيذ", "Accountable": "المُساءَل", "Consulted": "المُستشار", "Informed": "المُبلَّغ",
  "Reviewer comments": "تعليقات المراجعين", "Add a review note...": "أضف ملاحظة مراجعة...", "Post": "نشر",
  "No comments on this phase yet.": "لا تعليقات على هذه المرحلة بعد.", "Audit trail": "مسار التدقيق",
  "Activity on this phase will appear here with timestamps.": "سيظهر نشاط هذه المرحلة هنا مع الطوابع الزمنية.",
  "Entries are also written to the hash-chained platform audit log (ISO 42001 / EU AI Act ready).": "تُكتَب المدخلات أيضاً في سجل تدقيق المنصة المُسلسَل بالبصمة (جاهز لـ ISO 42001 / قانون الذكاء الاصطناعي الأوروبي).",
  "PHASE": "المرحلة", "artifacts": "أدلة", "appr.": "موافقة", "Open phase →": "افتح المرحلة ←",
  "No open blockers on this phase": "لا عوائق مفتوحة على هذه المرحلة", "completion": "الإكمال",
  "Open in Trust & Evidence": "افتح في الثقة والأدلة", "Missing - complete in the Journey": "مفقود - أكمِل في الرحلة",
  // ── PilotExecution ──
  "DEPARTMENT PILOT EXECUTION": "تنفيذ التجربة القِسمية",
  "Downstream execution for the pilot department. AI Central monitors tasks, deviations, adoption, guardrails, evidence and scale readiness.": "التنفيذ اللاحق للقسم التجريبي. يراقب مركز الذكاء الاصطناعي المهام والانحرافات والتبنّي والحواجز والأدلة وجاهزية التوسيع.",
  "Wave": "الموجة", "Pilot control room": "غرفة تحكّم التجربة", "Risk drift": "انحراف المخاطر",
  "Value realized": "القيمة المُحقَّقة", "Next required action": "الإجراء المطلوب التالي",
  "Open scale gate": "افتح بوابة التوسيع", "Review evidence": "راجع الأدلة",
  "Guardrail activation": "تفعيل الحواجز", "Controls and HITL checks activated for pilot workspace": "تُفعَّل الضوابط وفحوص الإنسان في الحلقة لمساحة العمل التجريبية",
  "Department enablement": "تمكين القسم", "Training, workflow comms and adoption readiness": "التدريب واتصالات سير العمل وجاهزية التبنّي",
  "Evidence collection": "جمع الأدلة", "Risk monitoring": "مراقبة المخاطر", "Risk owner": "مالك المخاطر",
  "Live risk drift against approved appetite": "انحراف المخاطر الفعلي مقابل الشهية المعتمدة",
  // ── FeedbackPanel ──
  "FEEDBACK ENGINE": "محرّك التغذية الراجعة", "Multi-stakeholder feedback": "تغذية راجعة متعددة الأطراف",
  "Every initiative collects feedback from the people who live with it. Scores roll up into a Scale / Continue / Improve / Retire recommendation that feeds the governed decision.": "تجمع كل مبادرة تغذية راجعة ممّن يتعايشون معها. تتجمّع الدرجات في توصية توسيع / استمرار / تحسين / إيقاف تُغذّي القرار المُحوكَم.",
  " (higher = safer)": " (الأعلى = الأكثر أماناً)", "Recommendation": "التوصية",
  "Strong across stakeholders - ready for a governed scale decision.": "قوي عبر الأطراف - جاهز لقرار توسيع مُحوكَم.",
  "Healthy - keep operating and monitoring.": "سليم - واصِل التشغيل والمراقبة.",
  "Mixed signal - remediate before any scale decision.": "إشارة مختلطة - عالِج قبل أي قرار توسيع.",
  "Weak or unsafe - a governed retirement decision is indicated.": "ضعيف أو غير آمن - يُوصى بقرار إيقاف مُحوكَم.",
  // ── DecisionPanel ──
  "GOVERNED DECISION": "قرار مُحوكَم",
  "AI Central plans, governs and monitors every initiative, then makes an accountable decision to scale or retire it. Retirement always records a reason - an initiative is never retired silently.": "يخطّط مركز الذكاء الاصطناعي ويحوكم ويراقب كل مبادرة، ثم يتّخذ قراراً مسؤولاً بتوسيعها أو إيقافها. يسجّل الإيقاف سبباً دائماً - لا تُوقَف مبادرة بصمت أبداً.",
  "Feedback engine recommends": "يوصي محرّك التغذية الراجعة بـ", "Review feedback": "راجع التغذية الراجعة",
  "Business value": "القيمة التجارية", "Composite readiness": "الجاهزية المركّبة", "Open blocker:": "عائق مفتوح:",
  "Resolve before scaling.": "حُلّه قبل التوسيع.", "DECISION: SCALE": "القرار: توسيع", "DECISION: RETIRE": "القرار: إيقاف",
  "Reason:": "السبب:", "Rationale:": "المبرّر:", "Decided by:": "قرّره:",
  "Recorded as a governed decision and captured in Trust & Evidence.": "مُسجَّل كقرار مُحوكَم ومُلتقَط في الثقة والأدلة.",
  "Approve to scale": "الموافقة على التوسيع", "Readiness below scale threshold": "الجاهزية دون عتبة التوسيع",
  "Readiness, evidence and value support expanding this initiative to the next wave.": "الجاهزية والأدلة والقيمة تدعم توسيع هذه المبادرة إلى الموجة التالية.",
  "Retire initiative": "إيقاف المبادرة",
  "Retirement is careful and accountable. Record why this AI initiative, agent or AIMS is being retired.": "الإيقاف حذِر ومسؤول. سجّل سبب إيقاف مبادرة الذكاء الاصطناعي هذه أو الوكيل أو نظام إدارة الذكاء الاصطناعي.",
  "Retirement reason": "سبب الإيقاف", "Rationale": "المبرّر",
  "Evidence and context for the retirement decision": "الأدلة والسياق لقرار الإيقاف",
  "Record retirement decision": "تسجيل قرار الإيقاف",
  // ── Risk summary / init tabs ──
  "Risk summary": "ملخّص المخاطر", "Open Risk Center →": "افتح مركز المخاطر ←",
  "Registered risks": "المخاطر المُسجَّلة", "Highest residual": "أعلى مخاطر متبقّية", "Trend": "الاتجاه",
  "Within appetite": "ضمن الشهية", "In treatment": "قيد المعالجة", "none": "لا شيء",
  "Most severe:": "الأشدّ:", "treatment": "المعالجة", "with": "مع",
  "Evidence for this initiative": "أدلة هذه المبادرة", "records": "سجلات",
  "No evidence yet - completed phase artifacts and decisions will appear here automatically.": "لا أدلة بعد - ستظهر أدلة المراحل المكتملة والقرارات هنا تلقائياً.",
  "Control:": "الضابط:", "Owner:": "المالك:", "Open evidence →": "افتح الأدلة ←",
  "Activated controls & policies": "الضوابط والسياسات المُفعَّلة", "Controls": "الضوابط", "Policies": "السياسات",
  "No controls activated yet - assigned in the Design phase.": "لا ضوابط مُفعَّلة بعد - تُسنَد في مرحلة التصميم.",
  "No policies mapped yet.": "لا سياسات مُخطَّطة بعد.", "Review controls →": "راجع الضوابط ←",
  "Phase approvals": "موافقات المراحل", "Accountable:": "المُساءَل:",
  "Human-in-the-loop items for this initiative appear in the Decisions queue.": "تظهر عناصر الإنسان في الحلقة لهذه المبادرة في طابور القرارات.",
  "Return on investment": "العائد على الاستثمار", "Cost savings": "توفير التكاليف",
  "Revenue impact": "أثر الإيراد", "Productivity": "الإنتاجية",
  "Business value score": "درجة القيمة التجارية", "feeds the Value Center and the scale decision.": "تُغذّي مركز القيمة وقرار التوسيع.",
  "Adoption & workforce readiness": "التبنّي وجاهزية القوى العاملة", "Training completion": "إكمال التدريب",
  "Assign learning in Governance Academy →": "أسنِد التعلّم في أكاديمية الحوكمة ←",
  "Lessons learned": "الدروس المستفادة",
  "Knowledge captured from this initiative feeds the enterprise Knowledge Engine and every future rollout. Formal knowledge capture is a mandatory artifact of the Scale or Retire phase.": "المعرفة المُلتقَطة من هذه المبادرة تُغذّي محرّك المعرفة المؤسسي وكل طرح مستقبلي. الالتقاط الرسمي للمعرفة دليل إلزامي لمرحلة التوسيع أو الإيقاف.",
  "reuses": "إعادة استخدام",
  "No knowledge captured from this initiative yet - it is generated at the Scale/Retire gate.": "لا معرفة مُلتقَطة من هذه المبادرة بعد - تُولَّد عند بوابة التوسيع/الإيقاف.",
  // ── Exec header / journey ──
  "Health": "الصحة", "Phase": "المرحلة", "Primary recommendation": "التوصية الرئيسية",
  "Continue to Scale Gate": "المتابعة إلى بوابة التوسيع", "Prepare governed retirement": "التحضير لإيقاف مُحوكَم",
  "Address gaps before advancing": "عالِج الفجوات قبل التقدّم", "Continue current phase": "استمرار المرحلة الحالية",
  "Mission timeline": "الجدول الزمني للمهمة", "Current blockers": "العوائق الحالية",
  "None - the phase gate is clear.": "لا شيء - بوابة المرحلة صافية.", "Remaining approvals": "الموافقات المتبقّية",
  "None in this phase.": "لا شيء في هذه المرحلة.", "Missing evidence": "الأدلة المفقودة",
  "Phase artifacts complete.": "أدلة المرحلة مكتملة.", "Critical risks": "المخاطر الحرِجة",
  "None above appetite.": "لا شيء فوق الشهية.",
  "Audit readiness": "جاهزية التدقيق",
  "Evidence completeness across the lifecycle - missing artifacts highlighted below": "اكتمال الأدلة عبر دورة الحياة - الأدلة المفقودة مُبرَزة أدناه",
  // ── InitInsights ──
  "Veris Intelligence · Executive Advisor": "Veris Intelligence · المستشار التنفيذي",
  "Generate Executive Briefing ↓": "أنشئ الموجز التنفيذي ↓",
  "Reason": "السبب", "Supporting evidence": "الأدلة الداعمة", "Risk impact": "أثر الخطر",
  "Expected outcome": "النتيجة المتوقّعة", "Decision required": "قرار مطلوب",
  // ── Intel rail ──
  "Financial Advisor": "المستشار المالي", "Governance Advisor": "مستشار الحوكمة",
  "Delivery Advisor": "مستشار التسليم", "Auditor": "المدقّق", "Executive Advisor": "المستشار التنفيذي",
  "Technology Advisor": "مستشار التقنية", "Security & Risk Advisor": "مستشار الأمن والمخاطر",
  "Privacy Advisor": "مستشار الخصوصية", "Legal & Compliance Advisor": "مستشار القانون والامتثال",
  "Work Advisor": "مستشار العمل", "Adoption Advisor": "مستشار التبنّي",
  "Executive brief": "الموجز التنفيذي", "Program analysis": "تحليل البرنامج",
  "Portfolio impact:": "أثر المحفظة:", "Financial impact:": "الأثر المالي:", "Blockers:": "العوائق:",
  "Delay prediction:": "توقّع التأخير:", "Predicted completion:": "الإكمال المتوقّع:",
  "confidence": "الثقة", "Reason:": "السبب:", "Business impact:": "الأثر التجاري:", "Evidence:": "الأدلة:",
  "Recommended action: review in Value →": "الإجراء المُوصى به: راجع في القيمة ←",
  "Pending approvals": "الموافقات المعلّقة", "Review approvals →": "راجع الموافقات ←",
  "Suggested next actions": "الإجراءات التالية المقترحة", "Review phase evidence": "راجع أدلة المرحلة",
  "Check execution plan in AI PMO": "افحص خطة التنفيذ في مكتب إدارة المشاريع", "Recent activity": "النشاط الأخير",
  "No recorded activity yet - completed artifacts will appear here.": "لا نشاط مُسجَّل بعد - ستظهر الأدلة المكتملة هنا.",
  // ── PMO ──
  "Execution plan not yet stood up for this initiative - the PMO workspace is created at Business Case approval.": "لم تُنشأ خطة تنفيذ لهذه المبادرة بعد - تُنشأ مساحة عمل المكتب عند اعتماد دراسة الجدوى.",
  "Sprint - ": "السباق - ", "points done": "نقاط مُنجَزة", "Budget tracking": "تتبّع الميزانية",
  "consumed ·": "مُستهلَك ·", "of lifecycle complete": "من دورة الحياة مكتمل",
  "Deliverables": "المُخرَجات", "Open the Journey →": "افتح الرحلة ←",
  "Timeline & milestones": "الجدول الزمني والمعالم", "Timeline": "الجدول الزمني", "complete": "مكتمل",
  "Tasks - current phase": "المهام - المرحلة الحالية", "RAID log": "سجل RAID",
  "Type": "النوع", "Item": "العنصر", "Risks live in the Risk Center →": "المخاطر تُدار في مركز المخاطر ←",
  "Decision log": "سجل القرارات", "Resource allocation": "توزيع الموارد", "Meetings": "الاجتماعات",
  "Change requests": "طلبات التغيير", "No open change requests.": "لا طلبات تغيير مفتوحة.",
  "Generate executive report ↓": "أنشئ التقرير التنفيذي ↓",
  // ── Perspectives ──
  "Should I worry?": "هل ينبغي أن أقلق؟", "Is this investment creating value?": "هل يخلق هذا الاستثمار قيمة؟",
  "Will this integrate and scale?": "هل سيتكامل هذا ويتوسّع؟", "Can I trust this AI?": "هل يمكنني الوثوق بهذا الذكاء الاصطناعي؟",
  "Is this AI responsible and governed?": "هل هذا الذكاء الاصطناعي مسؤول ومُحوكَم؟",
  "Does this protect personal information?": "هل يحمي هذا المعلومات الشخصية؟",
  "Can this legally operate?": "هل يمكن أن يعمل هذا قانونياً؟", "Will this deliver successfully?": "هل سيُسلَّم هذا بنجاح؟",
  "What must happen next?": "ما الذي يجب أن يحدث تالياً؟", "Is my team ready to deliver?": "هل فريقي جاهز للتسليم؟",
  "Is adoption increasing?": "هل يتزايد التبنّي؟",
  "perspective": "منظور", "Full Initiative Profile →": "الملف الكامل للمبادرة ←", "Nothing recorded yet.": "لا شيء مُسجَّل بعد.",
  "Overall health": "الصحة الإجمالية", "ROI": "العائد", "Delivery confidence": "ثقة التسليم",
  "Executive summary": "الملخّص التنفيذي", "Major blockers": "العوائق الرئيسية", "None open": "لا شيء مفتوح",
  "Top risks": "أبرز المخاطر", "Investment": "الاستثمار", "Spent": "المُنفَق",
  "Benefits realization": "تحقيق المنافع", "Realized to date": "المُحقَّق حتى الآن", "Budget variance": "تباين الميزانية",
  "headroom": "متسع", "Run rate": "معدّل التشغيل", "per phase": "لكل مرحلة", "Forecast accuracy": "دقة التنبّؤ",
  "Portfolio share": "حصة المحفظة", "of enterprise AI value": "من قيمة الذكاء الاصطناعي المؤسسية",
  "Financial risks": "المخاطر المالية", "Delivery timeline": "الجدول الزمني للتسليم", "Platform readiness": "جاهزية المنصة",
  "Operational health": "الصحة التشغيلية", "Models deployed": "النماذج المنشورة", "Technology stack": "المكدّس التقني",
  "Dependencies & infrastructure": "التبعيات والبنية التحتية", "Technical debt": "الدَّين التقني",
  "Low - reviewed at each gate": "منخفض - يُراجَع عند كل بوابة", "Availability target": "هدف التوفّر",
  "Risk score": "درجة الخطر", "Open risks": "المخاطر المفتوحة", "Security testing": "اختبار الأمن",
  "tested": "مُختبَر", "Kill switch": "مفتاح الإيقاف", "Threat exposure": "التعرّض للتهديدات",
  "Mitigations & evidence": "التخفيفات والأدلة", "Active controls": "الضوابط النشطة", "pending": "معلّق",
  "Evidence trail": "مسار الأدلة", "of lifecycle evidenced": "من دورة الحياة مُوثَّق", "Attack surface": "سطح الهجوم",
  "Gateway-mediated; no direct model exposure": "بوساطة البوابة؛ لا تعرّض مباشر للنموذج",
  "Governance score": "درجة الحوكمة", "Lifecycle phase": "مرحلة دورة الحياة", "Evidence": "الأدلة",
  "Responsible AI posture": "وضع الذكاء الاصطناعي المسؤول", "AI policies": "سياسات الذكاء الاصطناعي",
  "HITL gates on all high-impact decisions": "بوابات الإنسان في الحلقة على كل القرارات عالية الأثر",
  "Open the Risk Center for assessments and treatments": "افتح مركز المخاطر للتقييمات والمعالجات",
  "Privacy controls": "ضوابط الخصوصية", "Data provenance": "مصدر البيانات", "Privacy risks": "مخاطر الخصوصية",
  "Privacy posture": "وضع الخصوصية", "GDPR basis": "أساس GDPR",
  "Legitimate interest + consent where required": "المصلحة المشروعة + الموافقة عند اللزوم",
  "PII handling": "معالجة البيانات الشخصية", "Masked at the gateway before model calls": "مُخفاة عند البوابة قبل استدعاءات النموذج",
  "Retention": "الاحتفاظ", "7-year evidence retention; prompts 90 days": "احتفاظ بالأدلة 7 سنوات؛ المطالبات 90 يوماً",
  "Cross-border": "عبر الحدود", "EU/US processing under adequacy safeguards": "معالجة الاتحاد الأوروبي/الولايات المتحدة تحت ضمانات الكفاية",
  "Data classification": "تصنيف البيانات", "Regulatory scope": "النطاق التنظيمي", "Legal reviews": "المراجعات القانونية",
  "Open obligations": "الالتزامات المفتوحة", "Vendor contracts": "عقود المورّدين", "Regulatory obligations": "الالتزامات التنظيمية",
  "Contracts, IP & licensing": "العقود والملكية الفكرية والترخيص", "Vendors": "المورّدون",
  "Liability posture": "وضع المسؤولية", "Human accountability retained on all decisions": "المساءلة البشرية محفوظة على كل القرارات",
  "Policy compliance": "امتثال السياسات", "Completion": "الإكمال", "Sprint": "السباق",
  "Milestones at risk": "المعالم المعرّضة للخطر", "Milestones": "المعالم", "RAID highlights": "أبرز RAID",
  "My tasks": "مهامي", "Evidence required": "الأدلة المطلوبة", "Next milestone": "المعلم التالي",
  "Tasks in this phase": "مهام هذه المرحلة", "Evidence & approvals": "الأدلة والموافقات",
  "Approver": "المُعتمِد", "Applicable policies": "السياسات المنطبقة", "Deadlines": "المواعيد النهائية",
  "None outstanding": "لا شيء معلّق", "Team adoption": "تبنّي الفريق", "Resistance": "المقاومة",
  "Workforce signals": "إشارات القوى العاملة", "Adoption trend": "اتجاه التبنّي", "Growing": "متنامٍ",
  "Below target - enablement needed": "دون الهدف - يلزم تمكين", "Change resistance": "مقاومة التغيير", "Blocker": "العائق",
  "Value score": "درجة القيمة", "Users in scope": "المستخدمون ضمن النطاق", "teams": "فِرَق",
  "Usage trend": "اتجاه الاستخدام", "Growing week over week": "متنامٍ أسبوعاً بعد أسبوع",
  "Feedback": "التغذية الراجعة", "Improvement backlog": "قائمة تحسينات مؤجّلة", "None open": "لا شيء مفتوح",
  "Business KPIs": "مؤشرات الأداء التجارية", "tracked": "متتبَّع",
  // ── Initiatives SubTabs ──
  "Idea → Value": "الفكرة ← القيمة", "Overview": "نظرة عامة", "Journey": "الرحلة", "AI PMO": "مكتب إدارة مشاريع الذكاء الاصطناعي",
  "Value": "القيمة", "Governance": "الحوكمة", "Monitoring": "المراقبة",
  // ── Enterprise PMO ──
  "Initiatives in delivery": "المبادرات قيد التسليم", "Open the initiative workspaces": "افتح مساحات عمل المبادرات",
  "Open blocking issues": "المسائل الحاجبة المفتوحة", "Portfolio budget": "ميزانية المحفظة",
  "Financial reporting lives in Reports": "التقارير المالية تُدار في التقارير",
  "Open the first at-risk initiative's PMO": "افتح مكتب أول مبادرة معرّضة للخطر",
  "Open the blocked initiative's PMO": "افتح مكتب المبادرة المحجوبة",
  "Delivery health & portfolio timeline": "صحة التسليم والجدول الزمني للمحفظة", "no sprint": "لا سباق",
  "at risk": "معرّض للخطر", "Open PMO →": "افتح المكتب ←",
  "Cross-initiative dependencies": "التبعيات بين المبادرات", "Portfolio RAID": "RAID المحفظة",
  "Assumption": "افتراض", "Dependency": "تبعية", "Issue": "مسألة",
  "Capacity & resources": "السعة والموارد", "Executive reporting": "التقارير التنفيذية",
  "Portfolio packs, value reporting and audit-ready exports are generated in Reports.": "حِزَم المحفظة وتقارير القيمة والصادرات الجاهزة للتدقيق تُولَّد في التقارير.",
  "Open Reports →": "افتح التقارير ←",
  // ── Governance ──
  "Portfolio control compliance": "امتثال ضوابط المحفظة", "Policy violations": "انتهاكات السياسات",
  "1 repeated - training assigned": "1 مُتكرِّر - أُسنِد تدريب", "Active exceptions": "الاستثناءات النشطة",
  "2 expiring this month": "2 تنتهي هذا الشهر", "Controls & Guardrails": "الضوابط والحواجز",
  "Control Matrix": "مصفوفة الضوابط", "Risk Drift": "انحراف المخاطر", "Guardrails": "حواجز",
  "Linked to": "مرتبط بـ", "initiatives": "مبادرات",
  // ── Evidence module ──
  "Evidence Repository": "مستودع الأدلة", "Evidence Confidence": "ثقة الأدلة",
  "Enterprise Evidence Repository": "مستودع الأدلة المؤسسي",
  "Everything searchable. Everything versioned. Nothing duplicated.": "كل شيء قابل للبحث. كل شيء مُؤرشَف بالإصدار. لا تكرار.",
  "Search evidence, controls, owners...": "ابحث في الأدلة والضوابط والمُلّاك...",
  "All": "الكل", "Project": "المشروع", "Business Unit": "وحدة الأعمال", "Organization": "المؤسسة",
  "Risk:": "الخطر:", "No evidence matches this search.": "لا أدلة تطابق هذا البحث.",
  // ── Gateway config / administration ──
  "Provider configuration": "إعداد المورّد",
  "Vendor neutral and configuration driven - adding a provider is configuration, never a redesign.": "محايد للمورّد ومدفوع بالإعدادات - إضافة مورّد إعدادٌ لا إعادة تصميم أبداً.",
  "Provider": "المورّد", "Connection": "الاتصال", "Models": "النماذج", "Allowed units": "الوحدات المسموحة",
  "Region": "المنطقة", "Latency": "زمن الاستجابة", "Role": "الدور", "All units": "كل الوحدات",
  "Pilot units only": "الوحدات التجريبية فقط", "Routing policy": "سياسة التوجيه",
  "Every request follows configurable routing by business unit and risk class. High-risk workloads never leave the enterprise.": "يتبع كل طلب توجيهاً قابلاً للإعداد حسب وحدة الأعمال وفئة المخاطر. أعباء العمل عالية المخاطر لا تغادر المؤسسة أبداً.",
  "Guardrail detectors": "كاشفات الحواجز",
  "Every prompt is inspected before any model call. Actions are configurable per detector: allow, warn, require justification, mask, redact, block or escalate.": "يُفحَص كل مطالبة قبل أي استدعاء نموذج. الإجراءات قابلة للإعداد لكل كاشف: سماح، تحذير، طلب تبرير، إخفاء، تنقيح، حجب أو تصعيد.",
  "Triggered": "تفعّل", "MTD": "منذ بداية الشهر",
  "Retention & compliance configuration": "إعداد الاحتفاظ والامتثال",
  "Internal Knowledge Engine": "محرّك المعرفة الداخلي",
  "Enterprise knowledge searched before any prompt reaches a model. Every approved artifact can graduate into this repository.": "تُبحَث معرفة المؤسسة قبل أن يصل أي مطالبة إلى نموذج. يمكن لكل دليل معتمَد أن يترقّى إلى هذا المستودع.",
  "Added by": "أضافه", "Providers": "المورّدون", "Routing": "التوجيه",
  "Knowledge Engine": "محرّك المعرفة", "Modes & Retention": "الأوضاع والاحتفاظ",
  // ── Portfolio SubTabs ──
  "Business Units": "وحدات الأعمال", "Governance Maturity": "نضج الحوكمة", "Use Case Pipeline": "خط حالات الاستخدام",
  // ── PortfolioUnits ──
  "Organization view": "عرض المؤسسة", "AI initiatives": "مبادرات الذكاء الاصطناعي",
  "Realized value": "القيمة المُحقَّقة", "Avg adoption": "متوسط التبنّي", "Risks on register": "المخاطر في السجل",
  "initiative": "مبادرة", "risk": "خطر", "Hide": "إخفاء", "Initiatives": "المبادرات",
  "Continue initiative →": "واصِل المبادرة ←", "phase": "مرحلة",
  // ── Gateway (FinOps) ──
  "Requests MTD": "الطلبات منذ بداية الشهر", "All AI interactions governed": "كل تفاعلات الذكاء الاصطناعي مُحوكَمة",
  "Tokens MTD": "الرموز منذ بداية الشهر", "Metered across all providers": "مُقاسة عبر كل المورّدين",
  "Cost MTD": "التكلفة منذ بداية الشهر", "budget": "الميزانية", "Over budget": "فوق الميزانية",
  "All providers within cap": "كل المورّدين ضمن الحدّ", "Avg prompt risk": "متوسط خطر المطالبة",
  "0-100 risk scoring": "تسجيل مخاطر 0-100", "Runtime rules by violations - last 30 days": "قواعد وقت التشغيل حسب الانتهاكات - آخر 30 يوماً",
  "Policy register →": "سجل السياسات ←", "Live events - this session": "أحداث فعلية - هذه الجلسة",
  "AI Gateway is the enterprise control plane.": "بوابة الذكاء الاصطناعي هي مستوى تحكّم المؤسسة.",
  " Every AI interaction passes through it - prompt filtering, PII detection, policy enforcement, model routing and cost control. Employee Workspace consumes the Gateway; it never bypasses it.": " يمرّ كل تفاعل ذكاء اصطناعي عبرها - تصفية المطالبات، وكشف البيانات الشخصية، وإنفاذ السياسات، وتوجيه النماذج، والتحكّم في التكلفة. تستهلك مساحة عمل الموظف البوابة؛ ولا تتجاوزها أبداً.",
  "Model providers & spend": "مورّدو النماذج والإنفاق", "cost = tokens × price book": "التكلفة = الرموز × دفتر الأسعار",
  "Routed": "مُوجَّه", "Budget used": "الميزانية المستخدمة", "tokens": "رموز",
  "Enforcement policies": "سياسات الإنفاذ", "AI FinOps — spend vs budget": "العمليات المالية للذكاء الاصطناعي — الإنفاق مقابل الميزانية",
  "Enterprise spend MTD": "إنفاق المؤسسة منذ بداية الشهر", "of monthly budget · blended": "من الميزانية الشهرية · مخلوط",
  "Budget breaches": "تجاوزات الميزانية", "Every provider within its cap.": "كل مورّد ضمن حدّه.",
  "Escalated to the CFO's FinOps review queue — spend above cap is routed, not blocked.": "مُصعَّد إلى طابور مراجعة العمليات المالية للمدير المالي — الإنفاق فوق الحدّ يُوجَّه لا يُحجَب.",
  "Runtime guard": "حارس وقت التشغيل",
  "Live prompt log": "سجل المطالبات الفعلي", "Time": "الوقت", "User": "المستخدم",
  "Provider / model": "المورّد / النموذج", "Tokens": "الرموز", "Action": "الإجراء", "Cost": "التكلفة",
  // ── Academy ──
  "resistance": "مقاومة", "Learning completion": "إكمال التعلّم",
  // ── Repository panel ──
  "AI Repository": "مستودع الذكاء الاصطناعي",
  "Live AI agents & projects — owner and system architecture": "وكلاء ومشاريع الذكاء الاصطناعي الفعلية — المالك والبنية النظامية",
  "Open AI Repository →": "افتح مستودع الذكاء الاصطناعي ←", "System architecture": "البنية النظامية",
  "Drafts and suggests responses for support agents, grounded in CRM context and the knowledge base, to cut resolution time.": "يصوغ ويقترح ردوداً لوكلاء الدعم، مستنداً إلى سياق إدارة العلاقات وقاعدة المعرفة، لتقليل زمن الحلّ.",
  "Scores transactions in real time for fraud risk and flags anomalies to the case-management queue for review.": "يُسجّل المعاملات في الوقت الفعلي لمخاطر الاحتيال ويعلّم الشذوذ لطابور إدارة الحالات للمراجعة.",
  "Automates reconciliations and drafts close-cycle journal narratives, keeping a human approval gate before posting.": "يؤتمت التسويات ويصوغ سرديات قيود دورة الإقفال، مع الإبقاء على بوابة موافقة بشرية قبل الترحيل.",
  "Recommends credit decisions with a written rationale; every adverse outcome routes to mandatory human review.": "يوصي بقرارات الائتمان مع مبرّر مكتوب؛ وتُوجَّه كل نتيجة سلبية إلى مراجعة بشرية إلزامية.",
  "Maps employees to reskilling paths from a skills graph and role profiles, with consent and bias checks before use.": "يربط الموظفين بمسارات إعادة التأهيل من رسم بياني للمهارات وملفات الأدوار، مع فحوص الموافقة والتحيّز قبل الاستخدام.",
  "Summarises supplier filings and news into a risk brief for procurement, citing every source it draws from.": "يلخّص إيداعات المورّدين والأخبار في موجز مخاطر للمشتريات، مع الاستشهاد بكل مصدر يستند إليه.",
  "Model": "النموذج", "Data": "البيانات",
  "GenAI Agent": "وكيل ذكاء اصطناعي توليدي", "ML Model": "نموذج تعلّم آلي", "Decision Model": "نموذج قرار",
  "Remediate": "معالجة", "Assessment": "تقييم", "In progress": "قيد التنفيذ",
  // ── AI Strategy ──
  "Strategic pillars": "الركائز الاستراتيجية", "board-agreed": "مُتّفَق عليها من المجلس",
  "FY26 investment": "استثمار السنة المالية 2026", "allocated across pillars": "موزَّع عبر الركائز",
  "On roadmap": "على خارطة الطريق", "initiatives sequenced": "مبادرات مُرتَّبة",
  "Maturity target": "هدف النضج", "of 5 by FY27": "من 5 بحلول السنة المالية 2027",
  "Strategic pillars — where AI investment goes": "الركائز الاستراتيجية — إلى أين يذهب استثمار الذكاء الاصطناعي",
  "Productivity": "الإنتاجية", "Automate high-volume, low-variance work behind a human gate": "أتمتة العمل عالي الحجم منخفض التباين خلف بوابة بشرية",
  "Growth": "النمو", "AI-native products and customer experiences": "منتجات وتجارب عملاء أصيلة في الذكاء الاصطناعي",
  "Risk & Trust": "المخاطر والثقة", "Govern, secure and prove every AI system": "حوكمة وتأمين وإثبات كل نظام ذكاء اصطناعي",
  "Workforce": "القوى العاملة", "Reskill and enable the whole organisation": "إعادة تأهيل وتمكين المؤسسة بأكملها",
  "of ambition funded": "من الطموح مُموَّل",
  "Roadmap — initiatives by lifecycle horizon": "خارطة الطريق — المبادرات حسب أفق دورة الحياة",
  "Horizon": "الأفق", "Value at stake": "القيمة على المحكّ",
  // ── AI Inventory ──
  "AI systems": "أنظمة الذكاء الاصطناعي", "catalogued": "مُفهرَسة", "Datasets": "مجموعات البيانات",
  "classified": "مُصنَّفة", "Approved vendors": "المورّدون المعتمَدون", "under contract": "متعاقَد عليهم",
  "Shadow AI": "الذكاء الاصطناعي الظِّلّي", "in intake": "قيد الاستقبال",
  "Systems & models": "الأنظمة والنماذج", "System / model": "النظام / النموذج", "EU AI Act": "قانون الذكاء الاصطناعي الأوروبي",
  "Dataset": "مجموعة البيانات", "Classification": "التصنيف", "Residency": "الإقامة",
  "Customer interactions": "تفاعلات العملاء", "Credit histories": "سجلات الائتمان", "Financial ledgers": "الدفاتر المالية",
  "Employee records": "سجلات الموظفين", "Support transcripts": "نصوص الدعم", "Product telemetry": "قياسات المنتج عن بُعد",
  // ── Lifecycle ──
  "Phase Board": "لوحة المراحل", "Initiative Workspaces": "مساحات عمل المبادرات",
  "Active initiatives": "المبادرات النشطة", "on the journey": "على الرحلة", "At a gate": "عند بوابة",
  "awaiting decision": "بانتظار القرار", "Scale-ready": "جاهز للتوسيع", "evidence complete": "الأدلة مكتملة",
  "Canonical phases": "المراحل المعيارية", "opportunity → retire": "الفرصة ← الإيقاف",
  "Governed lifecycle — where each initiative sits": "دورة الحياة المُحوكَمة — أين تقع كل مبادرة",
  "Every initiative advances phase by phase; each gate needs evidence before it opens.": "تتقدّم كل مبادرة مرحلةً مرحلة؛ وكل بوابة تحتاج أدلة قبل أن تُفتَح.",
  // ── Trust Center ──
  "Trust posture": "وضع الثقة", "live composite": "مركّب فعلي", "Attacks blocked": "الهجمات المحجوبة",
  "last 30 days": "آخر 30 يوماً", "Open incidents": "الحوادث المفتوحة", "Attestations": "الشهادات", "current": "حالي",
  "Attestations & certifications": "الشهادات والاعتمادات", "as of": "اعتباراً من",
  "Live guardrail enforcement": "إنفاذ الحواجز الفعلي",
  "ISO 42001 AIMS": "نظام إدارة الذكاء الاصطناعي ISO 42001", "Certified": "معتمَد",
  "EU AI Act readiness": "جاهزية قانون الذكاء الاصطناعي الأوروبي", "SOC 2 Type II": "SOC 2 النوع الثاني",
  "Current": "حالي", "GDPR Art.22 safeguards": "ضمانات المادة 22 من GDPR", "Attested": "مُصادَق عليه",
  "NIST AI RMF": "إطار NIST لإدارة مخاطر الذكاء الاصطناعي", "Aligned": "متوائم",
  "Model transparency notices": "إشعارات شفافية النماذج", "Published": "منشور", "live": "مباشر",
  // ── Policies & Standards ──
  "Active policies": "السياسات النشطة", "in force": "سارية", "Overdue review": "مراجعة متأخرة",
  "past due date": "بعد الموعد", "Avg acknowledgement": "متوسط الإقرار", "workforce": "القوى العاملة",
  "Standards mapped": "المعايير المُخطَّطة", "frameworks": "الأطر", "Policy Library": "مكتبة السياسات",
  "Violation Analytics": "تحليلات الانتهاكات", "Policy": "السياسة", "Version": "الإصدار",
  "Next review": "المراجعة التالية", "Ack": "الإقرار",
  "Top rules by violations — last 30 days": "أبرز القواعد حسب الانتهاكات — آخر 30 يوماً",
  // ── Value Realization ──
  "portfolio target": "هدف المحفظة", "captured": "مُلتقَط", "weighted actual": "المرجّح الفعلي",
  "Value at risk": "القيمة المعرّضة للخطر", "no value yet": "لا قيمة بعد",
  "Value bridge — expected vs realized by initiative": "جسر القيمة — المتوقّع مقابل المُحقَّق حسب المبادرة",
  "Realized": "المُحقَّق", "Capture": "الالتقاط",
  "Environmental footprint": "البصمة البيئية", "Energy use": "استهلاك الطاقة", "per month · PUE 1.4": "شهرياً · PUE 1.4",
  "Carbon": "الكربون", "per year ·": "سنوياً ·", "Measured coverage": "التغطية المُقاسة",
  "metered vs estimated": "مُقاس مقابل مُقدَّر", "Efficiency index": "مؤشّر الكفاءة", "carbon per $ value": "الكربون لكل دولار قيمة",
  "Footprint by initiative": "البصمة حسب المبادرة",
  "Estimated from inference volume × model-class energy intensity × regional grid carbon × data-centre PUE. Live meters replace the estimate as gateway telemetry is wired.": "مُقدَّرة من حجم الاستدلال × كثافة طاقة فئة النموذج × كربون الشبكة الإقليمية × PUE مركز البيانات. تحلّ العدّادات الفعلية محلّ التقدير مع توصيل قياسات البوابة عن بُعد.",
  "Class": "الفئة", "Basis": "الأساس", "practice posture ·": "وضع الممارسة ·",
  // ── Audit Center ──
  "Log integrity": "سلامة السجل", "hash-chained": "مُسلسَل بالبصمة", "Open findings": "النتائج المفتوحة",
  "Audit packs": "حِزَم التدقيق", "regulator-ready": "جاهزة للمنظّم", "Events logged": "الأحداث المُسجَّلة",
  "this month": "هذا الشهر", "Export audit pack →": "تصدير حزمة التدقيق ←",
  "Immutable audit trail": "مسار تدقيق غير قابل للتغيير",
  "Scale decision recorded": "سُجِّل قرار التوسيع", "Guardrail policy v6 approved": "اعتُمِدت سياسة الحواجز الإصدار 6",
  "DPIA evidence uploaded": "رُفِعت أدلة تقييم أثر الخصوصية", "Risk treatment advanced": "تقدّمت معالجة المخاطر",
  "Control test logged": "سُجِّل اختبار الضابط", "Model approved for production": "اعتُمِد النموذج للإنتاج",
  "Decision": "قرار", "Control": "ضابط",
});

export function PageModelRegistry({setTab,openInitiative,role="caio",showToast}) {
  /* Initiative-centric registry: Model -> AI System -> Initiative ->
     Business Unit -> Executive owner. A model is never shown without its
     business context; models outside a governed initiative are flagged
     for intake. */
  const lang=useLang(); const ar=lang==="ar"; const T_=en=>ts(lang,en);
  const R=ROLES[role]||ROLES.caio;
  const [extra,setExtra]=useState([]);
  const [mHydrated,setMHydrated]=useState(false);
  const [createOpen,setCreateOpen]=useState(false);
  const [mdraft,setMdraft]=useState({bizName:"",system:"",type:"",vendor:"",dept:"",owner:"",euAiAct:"",category:"",status:"Awaiting Approval",risk:"Medium"});
  useEffect(()=>{try{const s=JSON.parse(localStorage.getItem("vz-ac-models")||"[]");if(Array.isArray(s)&&s.length)setExtra(s);}catch{/* ignore */}setMHydrated(true);},[]);
  useEffect(()=>{if(!mHydrated)return;try{localStorage.setItem("vz-ac-models",JSON.stringify(extra));}catch{/* ignore */}},[extra,mHydrated]);
  const ALL_MODELS=[...extra,...MODEL_REGISTRY];
  const [selId,setSelId]=useState(MODEL_REGISTRY[0].id);
  const [openGroups,setOpenGroups]=useState({[MODEL_REGISTRY[0].initiativeId]:true});
  /* Summary tiles double as drill-down filters: click one to list just that
     segment (ungoverned / unclassified / critical), click Total or Clear to reset. */
  const [statFilter,setStatFilter]=useState(null);
  const STAT_PRED={ungoverned:m=>!m.initiativeId,unclassified:m=>m.euAiAct==="Unclassified",critical:m=>m.risk==="Critical"};
  const sel=ALL_MODELS.find(m=>m.id===selId)||MODEL_REGISTRY[0];
  const setMK=k=>v=>setMdraft(d=>({...d,[k]:v}));
  const registerModel=()=>{
    if(!mdraft.bizName.trim()||!mdraft.system.trim()){showToast&&showToast("Model name and AI system are required","error");return;}
    const rec={id:`mx-${Date.now().toString(36)}`,initiativeId:null,system:mdraft.system.trim(),bizName:mdraft.bizName.trim(),
      name:mdraft.bizName.trim(),type:mdraft.type||"Generative AI / LLM",status:mdraft.status,risk:mdraft.risk,
      euAiAct:mdraft.euAiAct||"Unclassified",owner:mdraft.owner||"Unassigned",dept:mdraft.dept||"—",vendor:mdraft.vendor||"Internal",
      deployed:"Pending",accuracy:"Not tested",drift:"Not deployed",lastAudit:"Never",modelCard:false,aia:false,biasTest:false,
      killSwitch:false,dataProvenance:false,transparency:0,clause:"Pending classification · ISO 42001 C.8.4"};
    setExtra([rec,...extra]);setSelId(rec.id);setCreateOpen(false);
    setMdraft({bizName:"",system:"",type:"",vendor:"",dept:"",owner:"",euAiAct:"",category:"",status:"Awaiting Approval",risk:"Medium"});
    showToast&&showToast("Model registered — governed intake required to classify");
  };
  const selIni=acInitiatives.find(i=>i.id===sel.initiativeId);
  const rCol=r=>r==="Critical"?T.red:r==="High"?T.amber:r==="Medium"?T.blue:r==="Unknown"?T.ink4:T.green;
  const sCol=s=>s==="In Production"?T.green:s==="Awaiting Approval"?T.amber:s==="Suspended"?T.red:s==="Unclassified"?T.red:T.ink3;
  const lcCol=lc=>lc==="Production"||lc==="Pilot"?AI_GOLD:lc==="Scaling"?T.green:lc==="Retired"?T.red:T.blue;
  const Check=({v,label})=><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
    <div style={{width:16,height:16,borderRadius:4,background:v?T.greenL:T.redL,border:`1px solid ${v?T.green:T.red}40`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <span style={{fontSize:9,fontWeight:800,color:v?T.green:T.red}}>{v?T_("Yes"):T_("No")}</span>
    </div>
    <span style={{fontSize:10,color:v?T.ink2:T.ink4,fontFamily:F.b}}>{label}</span>
  </div>;
  const unclassified=ALL_MODELS.filter(m=>m.euAiAct==="Unclassified").length;
  const critical=ALL_MODELS.filter(m=>m.risk==="Critical").length;
  const ungoverned=MODEL_REGISTRY.filter(m=>!m.initiativeId);
  const groups=acInitiatives.map(ini=>({ini,models:MODEL_REGISTRY.filter(m=>m.initiativeId===ini.id)})).filter(g=>g.models.length);
  const evConfidence=ini=>Math.round(((ini.phaseIndex+ini.phaseArtifactsDone/(AC_PHASES[ini.phaseIndex]?.deliverables.length||1))/AC_PHASES.length)*100);
  const approvalsPending=ini=>MODEL_REGISTRY.filter(m=>m.initiativeId===ini.id&&m.status==="Awaiting Approval").length+(ini.blockedBy?1:0);
  const modelRow=m=><button key={m.id} onClick={()=>setSelId(m.id)} style={{width:"100%",display:"grid",gridTemplateColumns:"1.5fr .9fr 92px 118px 64px",gap:10,alignItems:"center",padding:"10px 12px 10px 30px",background:selId===m.id?T.s3:"transparent",border:"none",borderTop:`1px solid ${T.border}`,borderLeft:selId===m.id?`3px solid ${T.caio}`:"3px solid transparent",cursor:"pointer",textAlign:"left"}}>
    <div style={{minWidth:0}}>
      <div style={{fontSize:11,fontWeight:700,color:T.ink,fontFamily:F.b,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.bizName}</div>
      <div style={{fontSize:9,color:T.ink4,fontFamily:F.m,marginTop:2}}>{m.name} · {m.system}</div>
    </div>
    <span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{m.vendor}</span>
    <Tag label={T_(m.euAiAct)} color={m.euAiAct==="High-Risk"||m.euAiAct==="Unclassified"?T.red:m.euAiAct==="Minimal Risk"?T.green:T.amber} bg={(m.euAiAct==="High-Risk"||m.euAiAct==="Unclassified"?T.red:m.euAiAct==="Minimal Risk"?T.green:T.amber)+"16"}/>
    <Tag label={T_(m.status)} color={sCol(m.status)} bg={sCol(m.status)+"16"}/>
    <Tag label={T_(m.risk)} color={rCol(m.risk)} bg={rCol(m.risk)+"16"}/>
  </button>;
  return <div style={{animation:"up .3s ease"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
      <SHead title={T_("AI Model Registry")} sub={T_("Every model in its business context - initiative, executive owner and lifecycle. ISO 42001 C.8.4")}/>
      <button onClick={()=>setCreateOpen(o=>!o)} style={{flexShrink:0,background:createOpen?"transparent":AI_GOLD+"16",border:`1px solid ${AI_GOLD}${createOpen?"55":"45"}`,borderRadius:8,padding:"9px 15px",color:AI_GOLD_INK,fontSize:11,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>{createOpen?T_("Close"):T_("+ Register model")}</button>
    </div>
    {createOpen&&(()=>{
      const fLabel=l=><span style={{fontSize:9,fontWeight:900,fontFamily:F.m,letterSpacing:"0.1em",textTransform:"uppercase",color:T.ink4}}>{T_(l)}</span>;
      const fieldStyle={background:T.s2,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 11px",color:T.ink,fontSize:12,fontFamily:F.b,width:"100%",outline:"none"};
      return <Card style={{padding:18,marginBottom:14,border:`1px solid ${AI_GOLD}45`,animation:"up .25s ease"}}>
        <h3 style={{fontSize:14,color:T.ink,fontWeight:800,margin:"0 0 4px"}}>{T_("Register an AI model")}</h3>
        <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,margin:"0 0 12px"}}>{T_("Governed fields are picked from the enterprise vocabulary — add or request a value inline. New models enter unclassified and require intake to be brought under an initiative.")}</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10,marginBottom:12}}>
          <label style={{display:"grid",gap:5}}>{fLabel("Model name")}<input value={mdraft.bizName} onChange={e=>setMdraft({...mdraft,bizName:e.target.value})} placeholder="e.g. Contract Review Model" style={fieldStyle}/></label>
          <label style={{display:"grid",gap:5}}>{fLabel("AI system")}<input value={mdraft.system} onChange={e=>setMdraft({...mdraft,system:e.target.value})} placeholder="e.g. Legal Assistant" style={fieldStyle}/></label>
          <label style={{display:"grid",gap:5}}>{fLabel("Model type")}<SmartSelect vocab="modelType" value={mdraft.type} onChange={setMK("type")} role={role} showToast={showToast} requestedBy={R.name}/></label>
          <label style={{display:"grid",gap:5}}>{fLabel("Vendor")}<SmartSelect vocab="vendor" value={mdraft.vendor} onChange={setMK("vendor")} role={role} showToast={showToast} requestedBy={R.name}/></label>
          <label style={{display:"grid",gap:5}}>{fLabel("Department")}<SmartSelect vocab="dept" value={mdraft.dept} onChange={setMK("dept")} role={role} showToast={showToast} requestedBy={R.name}/></label>
          <label style={{display:"grid",gap:5}}>{fLabel("Model owner")}<SmartSelect vocab="person" value={mdraft.owner} onChange={setMK("owner")} role={role} showToast={showToast} requestedBy={R.name} placeholder="Choose or add an owner"/></label>
          <label style={{display:"grid",gap:5}}>{fLabel("EU AI Act risk class")}<SmartSelect vocab="risk" value={mdraft.euAiAct} onChange={setMK("euAiAct")} role={role} showToast={showToast} requestedBy={R.name}/></label>
          <label style={{display:"grid",gap:5}}>{fLabel("AI system category")}<SmartSelect vocab="category" value={mdraft.category} onChange={setMK("category")} role={role} showToast={showToast} requestedBy={R.name}/></label>
          <label style={{display:"grid",gap:5}}>{fLabel("Lifecycle status")}
            <select value={mdraft.status} onChange={e=>setMdraft({...mdraft,status:e.target.value})} style={{...fieldStyle,cursor:"pointer"}}>{["Awaiting Approval","In Production","Suspended","Unclassified"].map(s=><option key={s} value={s}>{T_(s)}</option>)}</select>
          </label>
          <label style={{display:"grid",gap:5}}>{fLabel("Risk severity")}
            <select value={mdraft.risk} onChange={e=>setMdraft({...mdraft,risk:e.target.value})} style={{...fieldStyle,cursor:"pointer"}}>{["Low","Medium","High","Critical","Unknown"].map(s=><option key={s} value={s}>{T_(s)}</option>)}</select>
          </label>
        </div>
        <button onClick={registerModel} style={{background:AI_GOLD,border:"none",borderRadius:8,padding:"10px 16px",color:"#111",fontSize:12,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>{T_("Register model")}</button>
      </Card>;
    })()}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
      {[
        {label:"Total Models",value:ALL_MODELS.length,color:T.caio,sub:ar?`عبر ${groups.length} مبادرات مُحوكَمة`:`across ${groups.length} governed initiatives`,fk:null},
        {label:"Ungoverned",value:ungoverned.length,color:T.amber,sub:"No initiative - intake required",fk:"ungoverned"},
        {label:"Unclassified",value:unclassified,color:T.red,sub:"EU AI Act gap",fk:"unclassified"},
        {label:"Critical Risk",value:critical,color:T.red,sub:"Require treatment",fk:"critical"},
      ].map(k=>{const on=k.fk!==null&&statFilter===k.fk;return <Card key={k.label} title={k.fk?`Show only ${k.label.toLowerCase()} models`:"Show all models"} onClick={()=>setStatFilter(s=>s===k.fk?null:k.fk)} style={{padding:"13px 14px",border:`1px solid ${on?k.color:T.border}`,background:on?k.color+"0e":undefined,boxShadow:on?`inset 0 0 0 1px ${k.color}`:undefined}}>
        <div style={{fontSize:9,fontWeight:700,color:on?k.color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:8}}>{T_(k.label)}</div>
        <div style={{fontSize:26,fontWeight:800,fontFamily:F.m,color:k.color,letterSpacing:"-0.02em",marginBottom:3}}>{k.value}</div>
        <div style={{fontSize:10,color:T.ink4,fontFamily:F.b}}>{T_(k.sub)}</div>
      </Card>;})}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:14,alignItems:"start"}}>
      <div>
        {statFilter&&(()=>{const matched=ALL_MODELS.filter(STAT_PRED[statFilter]);const titles=ar?{ungoverned:"نماذج غير مُحوكَمة · يلزم استقبال",unclassified:"نماذج غير مصنّفة · فجوة قانون الذكاء الاصطناعي الأوروبي",critical:"نماذج عالية المخاطر · تتطلب معالجة"}:{ungoverned:"Ungoverned models · intake required",unclassified:"Unclassified models · EU AI Act gap",critical:"Critical-risk models · require treatment"};return <div style={{border:`1px solid ${T.border}`,borderRadius:10,marginBottom:10,overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"13px 14px",background:T.s1,flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:180}}>
              <div style={{fontSize:12.5,fontWeight:800,color:T.ink,fontFamily:F.b}}>{titles[statFilter]}</div>
              <div style={{fontSize:9.5,color:T.ink3,fontFamily:F.b,marginTop:3}}>{matched.length} {T_("of")} {ALL_MODELS.length} {T_("models")}</div>
            </div>
            <button onClick={()=>setStatFilter(null)} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:7,padding:"5px 11px",fontSize:10,fontWeight:800,fontFamily:F.b,color:T.ink2,cursor:"pointer"}}>{T_("Clear filter ✕")}</button>
          </div>
          {matched.length?matched.map(modelRow):<div style={{padding:"16px 14px",fontSize:11,color:T.ink3,fontFamily:F.b}}>{T_("No models in this segment.")}</div>}
        </div>;})()}
        {!statFilter&&extra.length>0&&<div style={{border:`1px solid ${T.green}45`,borderRadius:10,marginBottom:10,overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"13px 14px",background:T.greenL||T.s1,flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:180}}>
              <div style={{fontSize:12.5,fontWeight:800,color:T.green,fontFamily:F.b}}>{T_("Registered this session")}</div>
              <div style={{fontSize:9.5,color:T.ink3,fontFamily:F.b,marginTop:3}}>{T_("Newly registered models awaiting governed intake and EU AI Act classification.")}</div>
            </div>
            <span style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:999,padding:"2px 8px",fontSize:8.5,fontWeight:900,fontFamily:F.m,color:T.ink2}}>{extra.length} {T_("model")}{extra.length>1&&!ar?"s":""}</span>
          </div>
          {extra.map(modelRow)}
        </div>}
        {!statFilter&&groups.map(({ini,models})=>{
          const open=!!openGroups[ini.id];
          const techs=[...new Set(models.map(m=>m.type.split(" / ")[0]))];
          const vendors=[...new Set(models.map(m=>m.vendor))];
          return <div key={ini.id} style={{border:`1px solid ${T.border}`,borderRadius:10,marginBottom:10,overflow:"hidden"}}>
            <button onClick={()=>setOpenGroups(g=>({...g,[ini.id]:!open}))} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"13px 14px",background:T.s1,border:"none",cursor:"pointer",textAlign:"left",flexWrap:"wrap"}}>
              <span style={{fontSize:11,color:T.ink4,fontFamily:F.m,width:12}}>{open?"▾":"▸"}</span>
              <div style={{flex:1,minWidth:180}}>
                <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                  <span style={{fontSize:12.5,fontWeight:800,color:T.ink,fontFamily:F.b}}>{ini.name}</span>
                  <Tag label={T_(ini.lifecycle)} color={lcCol(ini.lifecycle)} bg={lcCol(ini.lifecycle)+"16"}/>
                </div>
                <div style={{fontSize:9.5,color:T.ink3,fontFamily:F.b,marginTop:3}}>{ini.unit} · {ar?"الراعي":"Sponsor"} {ini.sponsor} · {ar?"المالك":"Owner"} {ini.businessOwner} · {ar?"المرحلة":"Phase"} {ini.phaseIndex+1}/{AC_PHASES.length} ({T_(AC_PHASES[ini.phaseIndex]?.name)})</div>
              </div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",justifyContent:"flex-end"}}>
                {techs.map(t=><span key={t} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:999,padding:"2px 8px",fontSize:8.5,fontWeight:800,fontFamily:F.m,color:T.ink3}}>{t}</span>)}
                {vendors.filter(v=>v!=="Internal").map(v=><span key={v} style={{background:AI_GOLD+"10",border:`1px solid ${AI_GOLD}30`,borderRadius:999,padding:"2px 8px",fontSize:8.5,fontWeight:800,fontFamily:F.m,color:AI_GOLD_INK}}>{v}</span>)}
                <span style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:999,padding:"2px 8px",fontSize:8.5,fontWeight:900,fontFamily:F.m,color:T.ink2}}>{models.length} {T_("model")}{models.length>1&&!ar?"s":""}</span>
              </div>
            </button>
            {open&&models.map(modelRow)}
          </div>;
        })}
        {ungoverned.length>0&&<div style={{border:`1px solid ${T.amber}45`,borderRadius:10,overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"13px 14px",background:T.amberL,flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:180}}>
              <div style={{fontSize:12.5,fontWeight:800,color:T.amber,fontFamily:F.b}}>{T_("Outside governed initiatives")}</div>
              <div style={{fontSize:9.5,color:T.ink3,fontFamily:F.b,marginTop:3}}>{T_("These models run without initiative context, executive ownership or lifecycle gates.")}</div>
            </div>
            <button onClick={()=>setTab&&setTab("intake")} style={{background:T.amber+"22",border:`1px solid ${T.amber}55`,borderRadius:7,padding:"7px 12px",color:T.amber,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>{T_("Start governed intake →")}</button>
          </div>
          {ungoverned.map(modelRow)}
        </div>}
      </div>
      <Card style={{overflow:"hidden",position:"sticky",top:70,height:"fit-content",animation:"fade .25s ease"}}>
        <div style={{background:`linear-gradient(135deg,${rCol(sel.risk)}14,${T.s3})`,borderBottom:`1px solid ${rCol(sel.risk)}30`,padding:"14px 16px"}}>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:9}}>
            {selIni&&<Tag label={T_(selIni.lifecycle)} color={lcCol(selIni.lifecycle)} bg={lcCol(selIni.lifecycle)+"16"}/>}
            <Tag label={T_(sel.euAiAct)} color={sel.euAiAct==="High-Risk"||sel.euAiAct==="Unclassified"?T.red:T.amber} bg={sel.euAiAct==="High-Risk"||sel.euAiAct==="Unclassified"?T.redL:T.amberL}/>
            <Tag label={T_(sel.status)} color={sCol(sel.status)} bg={sCol(sel.status)+"18"}/>
          </div>
          <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink,lineHeight:1.3,margin:0}}>{sel.bizName}</h3>
          <p style={{fontSize:10,color:T.ink3,fontFamily:F.m,marginTop:4}}>{sel.name} · {sel.system} · {sel.clause}</p>
        </div>
        <div style={{padding:15}}>
          {selIni?<>
            <div style={{fontSize:9,fontWeight:700,color:AI_GOLD_INK,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:8}}>{T_("Business context")}</div>
            {[["Initiative",selIni.name],["Business Unit",selIni.unit],["Executive Sponsor",selIni.sponsor],["Business Owner",selIni.businessOwner],
              ["Current Phase",`${T_(AC_PHASES[selIni.phaseIndex]?.name)} (${selIni.phaseIndex+1}/${AC_PHASES.length})`],
              ["Business Value",`${selIni.actual} ${T_("of")} ${selIni.expected}`],["Expected ROI",selIni.roi],
              ["Models in initiative",MODEL_REGISTRY.filter(m=>m.initiativeId===selIni.id).map(m=>m.bizName).join(", ")],
              ["Vendor(s)",[...new Set(MODEL_REGISTRY.filter(m=>m.initiativeId===selIni.id).map(m=>m.vendor))].join(", ")],
              ["Controls implemented",selIni.controls.join(", ")],["Risks",selIni.risks.join(", ")],
              ["Evidence confidence",evConfidence(selIni)+"%"],["Approvals pending",approvalsPending(selIni)]
            ].map(([l,v])=><div key={l} style={{display:"flex",justifyContent:"space-between",gap:10,padding:"6px 0",borderBottom:`1px solid ${T.border}`}}>
              <span style={{fontSize:9,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.05em",flexShrink:0}}>{T_(l)}</span>
              <span style={{fontSize:10,color:T.ink,fontFamily:F.b,fontWeight:600,textAlign:"right",lineHeight:1.45}}>{v}</span>
            </div>)}
            <button onClick={()=>openInitiative?openInitiative(selIni.id):setTab&&setTab("aicentral")} style={{width:"100%",marginTop:12,background:`linear-gradient(135deg,${AI_GOLD},#A77B2D)`,color:"#111",border:"none",borderRadius:7,padding:"9px",fontSize:11,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>{T_("Open Initiative →")}</button>
          </>:<div style={{background:T.amberL,border:`1px solid ${T.amber}40`,borderRadius:8,padding:"11px 12px"}}>
            <div style={{fontSize:10,fontWeight:800,color:T.amber,fontFamily:F.b,marginBottom:4}}>{T_("No governed initiative")}</div>
            <p style={{fontSize:10,color:T.ink3,fontFamily:F.b,lineHeight:1.6,margin:"0 0 9px"}}>{T_("This model runs without executive ownership, lifecycle gates or business-value tracking. Bring it under governance through opportunity intake.")}</p>
            <button onClick={()=>setTab&&setTab("intake")} style={{width:"100%",background:T.amber+"22",border:`1px solid ${T.amber}55`,borderRadius:7,padding:"8px",fontSize:10,fontWeight:900,fontFamily:F.b,color:T.amber,cursor:"pointer"}}>{T_("Start governed intake →")}</button>
          </div>}
          <div style={{marginTop:14}}>
            <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:10}}>{T_("Model assurance (ISO 42001)")}</div>
            <div style={{background:T.s3,borderRadius:8,padding:"11px 12px"}}>
              <Check v={sel.modelCard}      label={T_("Model Card documented (C.8.4)")}/>
              <Check v={sel.aia}            label={T_("AI Impact Assessment completed (A.5)")}/>
              <Check v={sel.biasTest}       label={T_("Bias & fairness testing done")}/>
              <Check v={sel.killSwitch}     label={T_("Kill switch / fallback deployed (C.8.5)")}/>
              <Check v={sel.dataProvenance} label={T_("Training data provenance documented (C.7.2)")}/>
            </div>
            <div style={{marginTop:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{T_("Transparency Score")}</span>
                <span style={{fontSize:11,fontWeight:700,fontFamily:F.m,color:sel.transparency>=80?T.green:sel.transparency>=50?T.amber:T.red}}>{sel.transparency}%</span>
              </div>
              <Bar value={sel.transparency} color={sel.transparency>=80?T.green:sel.transparency>=50?T.amber:T.red}/>
            </div>
          </div>
          {(sel.euAiAct==="High-Risk"||sel.euAiAct==="Unclassified")&&<div style={{background:T.redL,border:`1px solid ${T.red}30`,borderRadius:7,padding:"10px 12px",marginTop:12}}>
            <div style={{fontSize:10,fontWeight:700,color:T.red,fontFamily:F.b,marginBottom:3}}>{T_("Action Required")}</div>
            <p style={{fontSize:10,color:T.ink3,fontFamily:F.b,lineHeight:1.6,margin:0}}>{sel.euAiAct==="Unclassified"?T_("EU AI Act risk classification must be completed before August 2026 enforcement."):T_("High-Risk system - full conformity assessment required per EU AI Act Art.43.")}</p>
          </div>}
        </div>
      </Card>
    </div>
  </div>;
}

/* Section */
export function PageMaturityRadar() {
  const lang=useLang(); const ar=lang==="ar"; const T_=en=>ts(lang,en);
  const [sel,setSel]=useState(null);
  const overall=Math.round(MATURITY_DOMAINS.reduce((s,d)=>s+d.score,0)/MATURITY_DOMAINS.length);
  const matLabel=s=>s>=85?"Leading":s>=70?"Established":s>=55?"Developing":s>=40?"Initial":"Unprepared";
  const matCol=s=>s>=85?T.green:s>=70?T.blue:s>=55?T.amber:T.red;
  return <div style={{animation:"up .3s ease"}}>
    <SHead title={T_("AI Governance Maturity")} sub={T_("CAIO Kit Part 1")}/>
    {/* Overall score */}
    <Card style={{padding:"18px 20px",marginBottom:16,display:"flex",alignItems:"center",gap:20}}>
      <Ring score={overall} color={matCol(overall)} size={72}/>
      <div style={{flex:1}}>
        <div style={{fontSize:11,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:5}}>{T_("Overall Governance Maturity Score")}</div>
        <div style={{fontSize:28,fontWeight:800,fontFamily:F.m,color:matCol(overall),letterSpacing:"-0.02em"}}>{overall}<span style={{fontSize:16,fontWeight:500,color:T.ink3}}>/100</span></div>
        <Tag label={T_(matLabel(overall))} color={matCol(overall)} bg={matCol(overall)+"18"}/>
      </div>
      <div style={{borderLeft:`1px solid ${T.border}`,paddingLeft:20}}>
        <div style={{fontSize:10,color:T.ink4,fontFamily:F.b,marginBottom:8}}>{T_("Maturity Scale")}</div>
        {[["Leading","85+",T.green],["Established","70-84",T.blue],["Developing","55-69",T.amber],["Initial","40",T.red],["Unprepared","<40",T.red]].map(([l,r,c])=><div key={l} style={{display:"flex",gap:8,marginBottom:4,alignItems:"center"}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:c,flexShrink:0}}/>
          <span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{T_(l)}</span>
          <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{r}</span>
        </div>)}
      </div>
    </Card>
    {/* Domain bars */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:10}}>
      {MATURITY_DOMAINS.map((d,i)=>{
        const col=matCol(d.score);
        const gap=d.target-d.score;
        return <Card key={d.domain} style={{padding:16,cursor:"pointer",border:`1px solid ${sel?.domain===d.domain?col+"60":T.border}`,transition:"border-color .2s",animation:`up ${.3+i*.05}s ease both`}} onClick={()=>setSel(sel?.domain===d.domain?null:d)}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div style={{flex:1,paddingRight:10}}>
              <div style={{fontSize:12,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:4,lineHeight:1.3}}>{T_(d.domain)}</div>
              <Tag label={T_(matLabel(d.score))} color={col} bg={col+"18"}/>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontSize:20,fontWeight:800,fontFamily:F.m,color:col}}>{d.score}</div>
              <div style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{T_("Target:")} {d.target}</div>
            </div>
          </div>
          <div style={{marginBottom:6}}>
            <Bar value={d.score} color={col} delay={i*60}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{ar?"الفجوة إلى الهدف:":"Gap to target:"} {gap > 0 ? (ar?`+${gap} نقطة مطلوبة`:`+${gap} pts needed`) : T_("Target met")}</span>
            <span style={{fontSize:9,color:col,fontFamily:F.m,fontWeight:600}}>{d.score}%</span>
          </div>
          {sel?.domain===d.domain&&<div style={{marginTop:12,padding:"10px 12px",background:T.s3,borderRadius:7,borderLeft:`3px solid ${col}`}}>
            <p style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.7,margin:0}}>{d.desc}</p>
          </div>}
        </Card>;
      })}
    </div>
  </div>;
}

/* Section */
export function PageUseCases() {
  const lang=useLang(); const ar=lang==="ar"; const T_=en=>ts(lang,en);
  const [sel,setSel]=useState(USE_CASES[0]);
  const stageCol=s=>s==="Scale"?T.green:s==="Pilot"?T.blue:T.amber;
  const scoreCol=s=>s>=85?T.green:s>=70?T.blue:s>=55?T.amber:T.red;
  const byStage=(stage)=>USE_CASES.filter(u=>u.stage===stage);
  return <div style={{animation:"up .3s ease"}}>
    <SHead title={T_("AI Use Case Pipeline")} sub={T_("CAIO Kit Part 2")}/>
    {/* Pipeline kanban */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
      {[["POC","Validate Assumption",T.amber],["Pilot","Validate Value",T.blue],["Scale","Validate Operations",T.green]].map(([stage,sub,col])=><div key={stage}>
        <div style={{background:col+"18",border:`1px solid ${col}30`,borderRadius:"8px 8px 0 0",padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:col,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.05em"}}>{T_(stage)}</div>
            <div style={{fontSize:10,color:T.ink4,fontFamily:F.b}}>{T_(sub)}</div>
          </div>
          <div style={{width:22,height:22,borderRadius:"50%",background:col,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:11,fontWeight:800,color:"#fff",fontFamily:F.m}}>{byStage(stage).length}</span>
          </div>
        </div>
        <div style={{border:`1px solid ${col}30`,borderTop:"none",borderRadius:"0 0 8px 8px",padding:"8px 8px",background:T.s1,minHeight:120}}>
          {byStage(stage).map(uc=><div key={uc.id} onClick={()=>setSel(uc)} style={{background:sel?.id===uc.id?col+"14":T.s3,border:`1px solid ${sel?.id===uc.id?col+"50":T.border}`,borderRadius:8,padding:"10px 12px",marginBottom:8,cursor:"pointer",transition:"all .15s"}}>
            <div style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:4,lineHeight:1.3}}>{uc.name}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:9,color:T.ink4,fontFamily:F.b}}>{uc.dept}</span>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{T_("Score:")}</span>
                <span style={{fontSize:11,fontWeight:800,fontFamily:F.m,color:scoreCol(uc.score)}}>{uc.score}</span>
              </div>
            </div>
          </div>)}
        </div>
      </div>)}
    </div>
    {/* Detail */}
    {sel&&<Card style={{overflow:"hidden",animation:"fade .25s ease"}}>
      <div style={{background:`linear-gradient(135deg,${stageCol(sel.stage)}18,${T.s2})`,borderBottom:`1px solid ${stageCol(sel.stage)}30`,padding:"16px 18px",display:"flex",gap:12,alignItems:"flex-start"}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",gap:7,marginBottom:9,flexWrap:"wrap"}}>
            <Tag label={T_(sel.stage)} color={stageCol(sel.stage)} bg={stageCol(sel.stage)+"20"}/>
            <Tag label={sel.dept} color={T.ink3} bg={T.s3}/>
            <Tag label={T_(sel.status)} color={sel.status==="Complete"?T.green:T.blue} bg={sel.status==="Complete"?T.greenL:T.blueL}/>
          </div>
          <h3 style={{fontFamily:F.h,fontSize:16,fontWeight:700,color:T.ink,marginBottom:6}}>{sel.name}</h3>
          <p style={{fontSize:12,color:T.ink3,fontFamily:F.b,lineHeight:1.7,margin:0}}>{sel.desc}</p>
        </div>
        <div style={{background:T.s3,borderRadius:10,padding:"12px 16px",textAlign:"center",flexShrink:0,border:`1px solid ${scoreCol(sel.score)}40`}}>
          <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:5}}>{T_("Score")}</div>
          <div style={{fontSize:32,fontWeight:800,fontFamily:F.m,color:scoreCol(sel.score),letterSpacing:"-0.03em"}}>{sel.score}</div>
          <div style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>/100</div>
        </div>
      </div>
      <div style={{padding:"14px 18px",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        {[["Impact",sel.impact],["Feasibility",sel.feasibility],["Risk (inverted)",10-sel.risk]].map(([label,val])=>{
          const col=val>=8?T.green:val>=6?T.blue:val>=4?T.amber:T.red;
          return <div key={label} style={{background:T.s3,borderRadius:8,padding:"11px 13px",textAlign:"center"}}>
            <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:6}}>{T_(label)}</div>
            <div style={{fontSize:22,fontWeight:800,fontFamily:F.m,color:col}}>{val}<span style={{fontSize:11,color:T.ink4}}>/10</span></div>
            <Bar value={val*10} color={col}/>
          </div>;
        })}
      </div>
      <div style={{padding:"0 18px 16px",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
        {[["Owner",sel.owner],["Target ETA",sel.eta],["Status",T_(sel.status)]].map(([l,v])=><div key={l} style={{padding:"9px 10px",background:T.s3,borderRadius:7}}>
          <div style={{fontSize:9,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:3}}>{T_(l)}</div>
          <div style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b}}>{v}</div>
        </div>)}
      </div>
    </Card>}
  </div>;
}


/* Section */
export function PageIntegrations({role,showToast}){
  const lang=useLang(); const ar=lang==="ar"; const T_=en=>ts(lang,en);
  const rc=RC(role);
  const [activeTab,setActiveTab]=useState("servicenow");
  const SN=INTEGRATIONS.servicenow;
  const CRM=INTEGRATIONS.crm;
  const tabs=[{id:"servicenow",label:"ServiceNow"},{id:"crm",label:"CRM Platforms"},{id:"marketplace",label:"Marketplace"}];
  const tsc=s=>s==="In Progress"?T.blue:s==="Open"?T.amber:s==="Pending"?T.ink3:T.green;
  return <div style={{animation:"up .3s ease"}}>
    <SHead title={T_("Integrations")} sub={T_("ServiceNow GRC")}/>
    <div style={{display:"flex",gap:6,marginBottom:16}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setActiveTab(t.id)} style={{background:activeTab===t.id?rc:T.s2,color:activeTab===t.id?"#fff":T.ink3,border:`1px solid ${activeTab===t.id?rc:T.border}`,borderRadius:7,padding:"6px 16px",fontSize:10,fontWeight:600,fontFamily:F.b,transition:"all .15s"}}>{T_(t.label)}</button>)}
    </div>
    {activeTab==="servicenow"&&<div>
      <Card style={{padding:16,marginBottom:12,border:"1px solid "+T.amber+"40"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <div style={{width:36,height:36,borderRadius:9,background:"#1B3A3C",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}></div>
            <div><div style={{fontSize:13,fontWeight:700,color:T.ink,fontFamily:F.b}}>ServiceNow GRC/ IRM</div><div style={{fontSize:10,color:T.ink4,fontFamily:F.m}}>{SN.instance}</div></div>
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <Tag label={T_("Not Connected")} color={T.amber} bg={T.amberL}/>
            <button onClick={()=>showToast("OAuth connection requires production identity credentials - unavailable in this workspace","error")} style={{background:rc,color:"#fff",border:"none",borderRadius:7,padding:"7px 16px",fontSize:11,fontWeight:600,fontFamily:F.b}}>{T_("Connect")}</button>
          </div>
        </div>
        <div style={{background:T.s3,borderRadius:8,padding:"11px 14px"}}>
          <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:8}}>{T_("Integration Capabilities")}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:5}}>
            {["Incident Creation","Change Request","Risk Issue","GRC Task","Control Remediation","Evidence Request","Policy Exception","CMDB Asset Sync","SLA Status Sync","Bi-directional Updates"].map(cap=><div key={cap} style={{display:"flex",gap:6,alignItems:"center"}}><div style={{width:4,height:4,borderRadius:"50%",background:rc}}/><span style={{fontSize:10,color:T.ink2,fontFamily:F.b}}>{T_(cap)}</span></div>)}
          </div>
        </div>
      </Card>
      <Card style={{overflow:"hidden",marginBottom:12}}>
        <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3}}><h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>{T_("Trigger Configuration")}</h3></div>
        <div style={{display:"grid",gridTemplateColumns:"2fr 120px 90px 60px 60px",padding:"7px 16px",background:T.s4,borderBottom:`1px solid ${T.border}`}}>
          {["Event","Table","Priority","Auto","Active"].map(h=><span key={h} style={{fontSize:8,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.06em",fontFamily:F.m}}>{T_(h)}</span>)}
        </div>
        {SN.triggers.map((t,i)=><div key={t.id} style={{display:"grid",gridTemplateColumns:"2fr 120px 90px 60px 60px",padding:"10px 16px",alignItems:"center",borderBottom:i<SN.triggers.length-1?`1px solid ${T.border}`:"none",background:i%2===0?T.s1:T.bg}}>
          <span style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b}}>{t.event}</span>
          <Tag label={t.table} color={T.ink3} bg={T.s3}/>
          <Tag label={T_(t.priority)} color={t.priority==="Critical"?T.red:t.priority==="High"?T.amber:T.blue} bg={t.priority==="Critical"?T.redL:t.priority==="High"?T.amberL:T.blueL}/>
          <div style={{width:30,height:15,borderRadius:8,background:t.auto?rc:T.border,display:"flex",alignItems:"center",padding:"0 2px"}}><div style={{width:9,height:9,borderRadius:"50%",background:"#fff",marginLeft:t.auto?13:0,transition:"margin-left .2s"}}/></div>
          <div style={{width:30,height:15,borderRadius:8,background:t.active?T.green:T.border,display:"flex",alignItems:"center",padding:"0 2px"}}><div style={{width:9,height:9,borderRadius:"50%",background:"#fff",marginLeft:t.active?13:0,transition:"margin-left .2s"}}/></div>
        </div>)}
      </Card>
      <Card style={{overflow:"hidden"}}>
        <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3}}><h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>{T_("Recent ServiceNow Tickets")}</h3></div>
        {SN.recentTickets.map((t,i)=><div key={t.id} style={{padding:"11px 16px",borderBottom:i<SN.recentTickets.length-1?`1px solid ${T.border}`:"none",background:i%2===0?T.s1:T.bg,display:"flex",alignItems:"center",gap:12}}>
          <Tag label={t.id} color={rc} bg={RCL(role)+"80"}/>
          <div style={{flex:1}}><div style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:2}}>{t.title}</div><span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{t.type} {t.created}</span></div>
          <Tag label={T_(t.priority)} color={t.priority==="High"?T.amber:t.priority==="Critical"?T.red:T.blue} bg={t.priority==="High"?T.amberL:t.priority==="Critical"?T.redL:T.blueL}/>
          <Tag label={T_(t.status)} color={tsc(t.status)} bg={tsc(t.status)+"18"}/>
          <button onClick={()=>showToast("ServiceNow hand-off requires a connected production instance","error")} style={{background:T.s3,color:T.ink3,border:`1px solid ${T.border}`,borderRadius:5,padding:"4px 9px",fontSize:9,fontFamily:F.b}}>{T_("Open ")}</button>
        </div>)}
      </Card>
    </div>}
    {activeTab==="crm"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:14}}>
        {CRM.platforms.map((p,i)=><Card key={p.name} style={{padding:15,animation:`up ${.3+i*.07}s ease both`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
            <div style={{display:"flex",gap:9,alignItems:"center"}}>
              <IconBox name={p.name} color={p.color} size={15} style={{width:32,height:32}}/>
              <span style={{fontSize:12,fontWeight:700,color:T.ink,fontFamily:F.b}}>{p.name}</span>
            </div>
            <Tag label={T_(p.status)} color={T.amber} bg={T.amberL}/>
          </div>
          <p style={{fontSize:10,color:T.ink4,fontFamily:F.b,lineHeight:1.6,marginBottom:10}}>{T_("Customer trust requests, security questionnaires, compliance evidence sharing from your CRM pipeline.")}</p>
          <button onClick={()=>showToast("Connector authorisation requires production credentials","error")} style={{width:"100%",background:p.color,color:"#fff",border:"none",borderRadius:7,padding:"8px",fontSize:11,fontWeight:600,fontFamily:F.b}}>{T_("Connect")} {p.name}</button>
        </Card>)}
      </div>
      <Card style={{overflow:"hidden"}}>
        <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.border}`,background:T.s3,display:"flex",justifyContent:"space-between"}}>
          <h3 style={{fontFamily:F.h,fontSize:14,fontWeight:700,color:T.ink}}>{T_("Customer Trust Requests")}</h3>
          <Tag label={CRM.trustRequests.length+" "+T_("Active")} color={rc} bg={RCL(role)+"80"}/>
        </div>
        {CRM.trustRequests.map((r,i)=>{const sc=r.status==="In Progress"?T.blue:r.status==="Pending"?T.amber:T.ink3;return <div key={r.id} style={{padding:"11px 16px",borderBottom:i<CRM.trustRequests.length-1?`1px solid ${T.border}`:"none",background:i%2===0?T.s1:T.bg,display:"grid",gridTemplateColumns:"1fr 100px 80px 80px 70px",gap:8,alignItems:"center"}}>
          <div><div style={{fontSize:11,fontWeight:600,color:T.ink,fontFamily:F.b,marginBottom:2}}>{r.account}</div><span style={{fontSize:10,color:T.ink4,fontFamily:F.b}}>{r.type}</span></div>
          <Tag label={T_(r.stage)} color={rc} bg={RCL(role)+"80"}/>
          <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{T_("Due")} {r.due}</span>
          <Tag label={T_(r.status)} color={sc} bg={sc+"18"}/>
          <button onClick={()=>{vzDownload("veriszone-trust-pack.md",`# VerisZone Trust Pack (generated demo)\n\n${AC_FRAMEWORK_POSTURE.map(f=>`- ${f.name}: ${f.score}%`).join("\n")}\n`);showToast("Trust pack downloaded");}} style={{background:rc+"20",color:rc,border:"1px solid "+rc+"30",borderRadius:5,padding:"4px 8px",fontSize:9,fontWeight:600,fontFamily:F.b}}>{T_("Respond")}</button>
        </div>;})}
      </Card>
    </div>}
    {activeTab==="marketplace"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:10}}>
      {[{name:"Jira",icon:"?",cat:"Task Management",status:"Available",col:"#0052CC"},{name:"Slack",icon:"?",cat:"Notifications",status:"Available",col:"#4A154B"},{name:"Microsoft 365",icon:"?",cat:"Evidence Collection",status:"Available",col:"#0078D4"},{name:"Google Workspace",icon:"?",cat:"Evidence Collection",status:"Available",col:"#4285F4"},{name:"AWS Security",icon:"?",cat:"Cloud Evidence",status:"Coming Q3",col:"#FF9900"},{name:"Azure Defender",icon:"?",cat:"Cloud Evidence",status:"Coming Q3",col:"#0078D4"},{name:"GitHub",icon:"?",cat:"Dev Security",status:"Coming Q3",col:"#6E5494"},{name:"Qualys",icon:"?",cat:"Vulnerability",status:"Coming Q4",col:"#ED1C24"},{name:"Okta",icon:"?",cat:"IAM Evidence",status:"Coming Q4",col:"#007DC1"},{name:"Crowdstrike",icon:"?",cat:"Endpoint Security",status:"Coming Q4",col:"#E01B2D"},{name:"Tenable",icon:"?",cat:"Vulnerability",status:"Roadmap",col:"#00B4C8"},{name:"Splunk",icon:"?",cat:"SIEM Evidence",status:"Roadmap",col:"#65A637"}].map((p,i)=><Card key={p.name} style={{padding:13,animation:`up ${.3+i*.04}s ease both`}}>
        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}><IconBox name={`${p.name} ${p.cat}`} color={p.col} size={13} style={{width:28,height:28,borderRadius:7}}/><div><div style={{fontSize:11,fontWeight:700,color:T.ink,fontFamily:F.b}}>{p.name}</div><div style={{fontSize:9,color:T.ink4,fontFamily:F.b}}>{T_(p.cat)}</div></div></div>
        <Tag label={T_(p.status)} color={p.status==="Available"?T.green:p.status.includes("Q")?T.amber:T.ink3} bg={p.status==="Available"?T.greenL:p.status.includes("Q")?T.amberL:T.ink5}/>
        {p.status==="Available"&&<button onClick={()=>showToast(p.name+" connection requires production credentials","error")} style={{width:"100%",marginTop:8,background:rc,color:"#fff",border:"none",borderRadius:6,padding:"6px",fontSize:10,fontWeight:600,fontFamily:F.b}}>{T_("Connect")}</button>}
      </Card>)}
    </div>}
  </div>;
}

/* Section */
/* Organization and business-unit view of the portfolio - the same
   initiative records rolled up per unit, drilling into the lifecycle. */
function PortfolioUnits({setView}){
  const lang=useLang(); const ar=lang==="ar"; const T_=en=>ts(lang,en);
  const [openUnit,setOpenUnit]=useState(null);
  const money=v=>parseFloat(String(v).replace(/[^0-9.]/g,""))||0;
  const units=[...new Set(acInitiatives.map(i=>i.unit))].map(u=>{
    const inis=acInitiatives.filter(i=>i.unit===u);
    const risks=riskRegister.filter(r=>r.unit===u);
    const worst=risks.some(r=>r.level==="Critical")?"Critical":risks.some(r=>r.level==="High")?"High":risks.length?"Medium":"Low";
    return {u,inis,risks,worst,
      expected:inis.reduce((a,i)=>a+money(i.expected),0),
      actual:inis.reduce((a,i)=>a+money(i.actual),0),
      adoption:Math.round(inis.reduce((a,i)=>a+i.adoption,0)/inis.length),
      guardrail:Math.round(inis.reduce((a,i)=>a+i.guardrail,0)/inis.length)};
  }).sort((a,b)=>b.expected-a.expected);
  const org={n:acInitiatives.length,expected:units.reduce((a,x)=>a+x.expected,0),actual:units.reduce((a,x)=>a+x.actual,0),
    adoption:Math.round(acInitiatives.reduce((a,i)=>a+i.adoption,0)/acInitiatives.length),risks:riskRegister.length};
  const lvC=l=>l==="Critical"?T.red:l==="High"?T.amber:l==="Medium"?T.blue:T.green;
  return <div style={{animation:"up .3s ease"}}>
    <Card style={{padding:16,marginBottom:12,border:`1px solid ${AI_GOLD}30`}}>
      <div style={{fontSize:9,fontWeight:900,color:AI_GOLD_INK,textTransform:"uppercase",letterSpacing:"0.14em",fontFamily:F.m,marginBottom:10}}>{T_("Organization view")}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10}}>
        {[["AI initiatives",org.n,T.blue],["Expected value",`$${org.expected.toFixed(1)}M`,AI_GOLD],["Realized value",`$${org.actual.toFixed(1)}M`,T.green],["Avg adoption",`${org.adoption}%`,T.violet],["Risks on register",org.risks,T.red]].map(([l,v,c])=>
          <div key={l} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"11px 13px"}}>
            <div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>{T_(l)}</div>
            <div style={{fontSize:19,fontWeight:900,fontFamily:F.m,color:c}}>{v}</div>
          </div>)}
      </div>
    </Card>
    <div style={{display:"grid",gap:10}}>
      {units.map(x=><Card key={x.u} style={{padding:16}}>
        <div style={{display:"grid",gridTemplateColumns:"1.2fr repeat(4,minmax(90px,1fr)) auto",gap:12,alignItems:"center"}}>
          <div>
            <div style={{fontSize:13,fontWeight:800,color:T.ink,fontFamily:F.b}}>{x.u}</div>
            <div style={{fontSize:9.5,color:T.ink3,fontFamily:F.b,marginTop:2}}>{x.inis.length} {T_("initiative")}{x.inis.length>1&&!ar?"s":""} · {x.risks.length} {T_("risk")}{x.risks.length===1||ar?"":"s"}</div>
          </div>
          <div><div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,marginBottom:3}}>{ar?"القيمة":"VALUE"}</div><span style={{fontSize:13,fontWeight:900,fontFamily:F.m,color:AI_GOLD_INK}}>${x.actual.toFixed(1)}M / ${x.expected.toFixed(1)}M</span></div>
          <div><div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,marginBottom:3}}>{ar?"التبنّي":"ADOPTION"} {x.adoption}%</div><Bar value={x.adoption} color={x.adoption>=70?T.green:T.amber}/></div>
          <div><div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,marginBottom:3}}>{ar?"الحواجز":"GUARDRAILS"} {x.guardrail}%</div><Bar value={x.guardrail} color={x.guardrail>=80?T.green:T.amber}/></div>
          <Tag label={`${T_(x.worst)} ${T_("risk")}`} color={lvC(x.worst)} bg={lvC(x.worst)+"16"}/>
          <button onClick={()=>setOpenUnit(openUnit===x.u?null:x.u)} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:7,padding:"6px 11px",color:T.ink2,fontSize:10,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{openUnit===x.u?T_("Hide"):T_("Initiatives")} {openUnit===x.u?"▲":"▼"}</button>
        </div>
        {openUnit===x.u&&<div style={{display:"grid",gap:6,marginTop:12,paddingTop:12,borderTop:`1px solid ${T.border}`}}>
          {x.inis.map(i=><div key={i.id} style={{display:"grid",gridTemplateColumns:"1fr auto auto auto",gap:10,alignItems:"center",background:T.s2,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 12px"}}>
            <div><div style={{fontSize:11.5,fontWeight:800,color:T.ink,fontFamily:F.b}}>{i.name}</div><div style={{fontSize:9,color:T.ink3,fontFamily:F.b,marginTop:2}}>{T_(i.category)} · {T_("phase")} {i.phaseIndex+1}/{AC_PHASES.length} {T_(AC_PHASES[i.phaseIndex]?.name)}</div></div>
            <STag s={i.lifecycle}/>
            <Tag label={`${i.roi} ROI`} color={T.green} bg={T.greenL}/>
            <button onClick={()=>setView&&setView("initiatives")} style={{background:AI_GOLD+"14",border:`1px solid ${AI_GOLD}40`,borderRadius:7,padding:"5px 11px",color:AI_GOLD_INK,fontSize:9.5,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>{T_("Continue initiative →")}</button>
          </div>)}
        </div>}
      </Card>)}
    </div>
  </div>;
}

export function PageAICentral({role,setTab,showToast,view,setView,navNonce,initToOpen,onInitOpened,theme,sessionMode}) {
  const lang=useLang(); const ar=lang==="ar"; const T_=en=>ts(lang,en);
  const rc=AI_GOLD;
  const access=acAccessFor(role);
  const R=ROLES[role]||ROLES.caio;
  /* Internal drill-in views are reachable from within a module (initiative
     workspace, PMO, gateway admin) even when they aren't RBAC-gated modules. */
  const AC_INTERNAL_VIEWS=["initiatives","pmo","admin"];
  const activeModule=access.modules.includes(view)?view:AC_INTERNAL_VIEWS.includes(view)?view:"dashboard";
  const [items,setItems]=useState(acInitiatives);
  const [selectedId,setSelectedId]=useState(acInitiatives[0].id);
  const [initTab,setInitTab]=useState("list");
  const [phaseSel,setPhaseSel]=useState(null);
  /* Phase evidence workspace state, keyed by `${initiativeId}:${phaseIdx}` so
     uploads and reviewer comments follow the globally selected initiative+phase. */
  const [phaseFiles,setPhaseFiles]=useState({});
  const [phaseComments,setPhaseComments]=useState({});
  const [commentDraft,setCommentDraft]=useState("");
  const [histOpen,setHistOpen]=useState(null);
  /* A left-nav click always returns the module to its root view, even when the
     module is already active (e.g. stepping out of an initiative workspace). */
  useEffect(()=>{if(navNonce){setInitTab("overview");setPhaseSel(null);setCreateOpen(false);}},[navNonce]);
  /* One global state: initiative + phase + role. Switching role re-frames the
     same initiative into that executive's perspective (CAIO opens the full
     profile by default - it is the operating role). */
  const [profileMode,setProfileMode]=useState(role==="caio");
  useEffect(()=>{setProfileMode(role==="caio");},[role]);
  /* Deep-open from universal search: land directly on the requested initiative. */
  useEffect(()=>{if(initToOpen){const id=typeof initToOpen==="object"?initToOpen.id:initToOpen;const it=typeof initToOpen==="object"?initToOpen.initTab:"overview";openInitiative(id,it);onInitOpened&&onInitOpened();}},[initToOpen]); // eslint-disable-line react-hooks/exhaustive-deps
  const [govTab,setGovTab]=useState("controls");
  const [evTab,setEvTab]=useState("repository");
  const [gwTab,setGwTab]=useState("overview");
  const [lifecycleFilter,setLifecycleFilter]=useState("All");
  const [initQuery,setInitQuery]=useState("");
  const [unitFilter,setUnitFilter]=useState("All");
  const [recentIds,setRecentIds]=useState([]);
  const [favIds,setFavIds]=useState([]);
  const [ovDetails,setOvDetails]=useState(false);
  /* Data-lineage drawer for the org-rollup KPI strips — every number
     traces to the initiatives behind it, then drills to the workspace. */
  const [lineage,setLineage]=useState(null);
  const [createOpen,setCreateOpen]=useState(false);
  const [draft,setDraft]=useState({name:"",unit:"",category:"GenAI Copilot",businessOwner:"",sponsor:"",expected:"",phase:"",risk:"",dataClass:""});
  const [evQuery,setEvQuery]=useState("");
  const [evScope,setEvScope]=useState("All");
  const [evLog,setEvLog]=useState({open:false,item:"",owner:"",control:"",status:"In Review",approval:"Awaiting Approval"});
  const [decisions,setDecisions]=useState({});
  const [retireDraft,setRetireDraft]=useState({reason:RETIREMENT_REASONS[0],rationale:""});
  const [feedback,setFeedback]=useState(acFeedback);
  const [hydrated,setHydrated]=useState(false);
  const selected=items.find(i=>i.id===selectedId)||items[0];
  const learningEvidence=academyEvidenceFor(role,(sessionMode==="demo"||sessionMode==="aicentral"));
  const gwEvidence=(typeof window!=="undefined")?(()=>{try{return readBus("vz-gw-evidence");}catch{return [];}})():[];
  const evidenceRows=[...gwEvidence,...acEvidence,...autoEvidenceFor(items),...learningEvidence.map(e=>({...e,scope:"Organization",version:"v1"}))];
  /* Persistence: created initiatives, governed decisions and feedback survive reload. */
  useEffect(()=>{
    try{
      const savedItems=JSON.parse(localStorage.getItem("vz-ac-custom")||"[]");
      if(Array.isArray(savedItems)&&savedItems.length)setItems(prev=>[...savedItems.filter(s=>!prev.some(p=>p.id===s.id)),...prev]);
      const savedDec=JSON.parse(localStorage.getItem("vz-ac-decisions")||"null");
      if(savedDec)setDecisions(savedDec);
      const savedFb=JSON.parse(localStorage.getItem("vz-ac-feedback")||"null");
      if(savedFb)setFeedback(prev=>({...prev,...savedFb}));
    }catch{/* corrupt local data ignored */}
    setHydrated(true);
  },[]);
  useEffect(()=>{
    if(!hydrated)return;
    try{
      localStorage.setItem("vz-ac-custom",JSON.stringify(items.filter(i=>!acInitiatives.some(s=>s.id===i.id))));
      localStorage.setItem("vz-ac-decisions",JSON.stringify(decisions));
      localStorage.setItem("vz-ac-feedback",JSON.stringify(feedback));
    }catch{/* storage unavailable */}
  },[items,decisions,feedback,hydrated]);
  const total=items.length;
  const active=items.filter(i=>!["Completed","Retired"].includes(i.lifecycle)).length;
  const high=items.filter(i=>i.risk==="High"||i.risk==="Critical").length;
  const pending=items.filter(i=>i.status==="Awaiting Approval").length+2;
  const avgGuard=Math.round(items.reduce((s,i)=>s+i.guardrail,0)/total);
  const avgAdopt=Math.round(items.reduce((s,i)=>s+i.adoption,0)/total);
  const avgValue=Math.round(items.reduce((s,i)=>s+i.valueScore,0)/total);
  const openInitiative=(id,tab="overview")=>{setSelectedId(id);setInitTab(tab);setPhaseSel(null);setView("initiatives");setRecentIds(r=>[id,...r.filter(x=>x!==id)].slice(0,4));};
  /* Registry-bound navigation for every clickable object inside AI Central. */
  const nav=(objectType,ctx={})=>navigateTo(objectType,ctx,{setTab,setAiCentralView:setView,setInitToOpen:(id,it)=>openInitiative(id,it)});
  const openModule=id=>{
    if(access.modules.includes(id)){setView(id);return;}
    /* Never a silent dead click: a dashboard tile can point at a module the
       current role can't open — tell the user why instead of doing nothing. */
    const m=AI_CENTRAL_NAV.find(x=>x.id===id);
    showToast&&showToast(`${m?m.label:"That module"} isn't enabled for ${R.label} — ask an admin to grant access.`,"error");
  };

  const SubTabs=({tabs,active:a,onChange})=><div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
    {tabs.map(([id,label])=><button key={id} onClick={()=>onChange(id)} style={{background:a===id?rc+"20":T.s2,border:`1px solid ${a===id?rc+"55":T.border}`,color:a===id?rc:T.ink2,borderRadius:8,padding:"7px 11px",fontSize:11,fontWeight:700,fontFamily:F.b,cursor:"pointer",transition:"all .15s"}}>{T_(label)}</button>)}
  </div>;

  /* Every summary tile is clickable. If a tile is given an explicit onClick it
     drills into the owning surface; otherwise it opens the metric's lineage
     drawer — so no module-page stat tile is ever a silent dead click. */
  const Metric=({label,value,sub,color,score,onClick})=><Card onClick={onClick||(()=>setLineage({label,value}))} style={{padding:16,cursor:"pointer",transition:"border-color .15s"}}>
    <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center"}}>
      <div>
        <div style={{fontSize:10,color:T.ink3,fontFamily:F.m,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:8}}>{T_(label)}</div>
        <div style={{fontSize:26,fontWeight:800,color:T.ink,fontFamily:F.h}}><CountUp value={value}/></div>
        <div style={{fontSize:10,color:T.ink3,fontFamily:F.b,marginTop:4}}>{T_(sub)}</div>
      </div>
      {typeof score==="number"&&<Ring score={score} color={color||rc} size={54}/>}
    </div>
  </Card>;

  /* Plain typographic module header. Approval awareness lives in Veris
     Intelligence, and the selected initiative is the page's visual focus. */
  const lens=acLensFor(role);
  const LENSC={good:T.green,warn:T.amber,crit:T.red,info:T.blue,violet:T.violet,teal:T.teal,gold:AI_GOLD,ink3:T.ink3,ink:T.ink};
  const lensCol=k=>LENSC[k]||T.ink;
  const modMeta=AI_CENTRAL_NAV.find(m=>m.id===activeModule);
  const Header=()=><div style={{margin:"4px 0 16px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16,flexWrap:"wrap"}}>
    <div>
      <div style={{fontSize:9,fontWeight:900,fontFamily:F.m,color:T.blue,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:5}}>{T_("AI Central")} · {access.lens} {T_("lens")}</div>
      <h2 style={{fontSize:26,fontWeight:800,color:T.ink,fontFamily:F.h,letterSpacing:"-0.03em",margin:0,lineHeight:1.1}}>{T_(modMeta?.label||"Dashboard")}</h2>
      <p style={{fontSize:12,color:T.ink3,margin:"6px 0 0",fontFamily:F.b,fontStyle:"italic"}}>{T_(lens.question)}</p>
    </div>
    {/* The accountable-owner chip is governance-facing attribution (who is
        accountable for this module), not the current viewer. It confused
        scoped users ("why does it say CAIO?"), so it's shown only to the
        executive/governance roles who reason about module ownership. */}
    {modMeta?.owner&&role!=="employee"&&role!=="manager"&&<div title={T_("The executive accountable for this module — not the current viewer")} style={{textAlign:"right",background:T.s2,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 13px",minWidth:150}}>
      <div style={{fontSize:8,fontWeight:900,fontFamily:F.m,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.1em"}}>{T_("Accountable owner")}</div>
      <div style={{fontSize:13,fontWeight:800,color:AI_GOLD_INK,fontFamily:F.b,marginTop:3}}>{T_(modMeta.owner)}</div>
      <div style={{fontSize:9,color:T.ink3,fontFamily:F.b,marginTop:2}}>{T_("Oversight ·")} {T_(modMeta.oversight)}</div>
    </div>}
  </div>;

  /* ── Role lens band: the AI Central Overview, reframed for this role.
     Same initiative portfolio, role-specific hero metric, KPIs and
     columns. Rows open the initiative workspace. ── */
  const RoleLensBand=()=>{
    const rows=lens.filter?items.filter(lens.filter):items;
    const cell=v=>Array.isArray(v)?<span style={{display:"inline-flex",alignItems:"center",fontSize:9.5,fontWeight:800,fontFamily:F.m,padding:"2px 9px",borderRadius:20,background:lensCol(v[1])+"22",color:lensCol(v[1])}}>{T_(v[0])}</span>:T_(v);
    return <div style={{marginBottom:16}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,flexWrap:"wrap",marginBottom:14}}>
        <div style={{display:"flex",gap:14,alignItems:"center",background:"linear-gradient(135deg,#7a1a3c,#a5254c 60%,#7c1f42)",border:"1px solid #c25878",borderRadius:14,padding:"11px 18px",boxShadow:"0 12px 30px rgba(138,26,60,.28)"}}>
          <div style={{fontSize:30,fontWeight:800,color:"#ffe9ef",letterSpacing:"-0.03em",lineHeight:.9,fontFamily:F.m}}>{lens.hero[0]}</div>
          <div><div style={{fontSize:9.5,letterSpacing:"0.09em",textTransform:"uppercase",color:"#f3c9d4",fontWeight:900,fontFamily:F.m}}>{T_(lens.hero[1])}</div><div style={{fontSize:10,color:"#e0a9ba",marginTop:3,fontWeight:600,fontFamily:F.b}}>{T_(lens.hero[2])}</div></div>
        </div>
        <div style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:10,color:T.ink3,fontWeight:700,fontFamily:F.b,background:T.s2,border:`1px solid ${T.border}`,borderRadius:20,padding:"6px 12px",alignSelf:"center"}}>🔒 RBAC · {AI_CENTRAL_NAV.filter(m=>m.id!=="academy"&&access.modules.includes(m.id)).length} {T_("of")} {AI_CENTRAL_NAV.filter(m=>m.id!=="academy").length} {T_("modules enabled")}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:14}}>
        {lens.kpis.map((k,i)=><button key={i} onClick={()=>setLineage({label:k[0],value:k[1]})} className="vz-pn-row" style={{textAlign:"left",background:T.s2,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 14px",cursor:"pointer"}}>
          <div style={{fontSize:9,letterSpacing:"0.09em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m}}>{T_(k[0])}</div>
          <div style={{fontSize:21,fontWeight:800,marginTop:6,fontFamily:F.m,color:lensCol(k[2])}}>{k[1]}</div>
          <div style={{fontSize:9.5,color:T.ink3,marginTop:3,fontFamily:F.b}}>{T_(k[3])}</div>
        </button>)}
      </div>
      <Card style={{padding:"16px 18px"}}>
        <div style={{fontSize:9.5,letterSpacing:"0.14em",textTransform:"uppercase",color:T.ink4,fontWeight:800,fontFamily:F.m,marginBottom:4}}>{T_("Initiative portfolio ·")} {access.lens} {T_("columns")}</div>
        <div style={{fontSize:14,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:12}}>{lens.filter?T_("Your initiatives"):T_("All AI initiatives")} — {T_("the same portfolio, framed for")} {R.label}</div>
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11.5,fontFamily:F.b}}>
          <thead><tr>{lens.cols.map(c=><th key={c[0]} style={{textAlign:"left",fontSize:9,letterSpacing:"0.07em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m,padding:"0 10px 9px",borderBottom:`1px solid ${T.border}`}}>{T_(c[0])}</th>)}</tr></thead>
          <tbody>{rows.map(i=><tr key={i.id} onClick={()=>openInitiative(i.id,"overview")} style={{cursor:"pointer"}} className="vz-pn-row">
            {lens.cols.map((c,ci)=><td key={ci} style={{padding:"11px 10px",borderBottom:`1px solid ${T.border}`,color:ci===0?T.ink:T.ink2,fontWeight:ci===0?700:400}}>{cell(c[1](i))}</td>)}
          </tr>)}</tbody>
        </table></div>
      </Card>
      <div style={{display:"flex",alignItems:"center",gap:8,margin:"18px 0 4px"}}>
        <span style={{fontSize:9.5,fontWeight:900,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.12em",whiteSpace:"nowrap"}}>{T_("Full portfolio detail")}</span>
        <span style={{flex:1,height:1,background:`linear-gradient(90deg,${T.border},transparent)`}}/>
      </div>
    </div>;
  };

  /* ── Module lens band: the same role lens, carried into each module.
     A compact framing question + three role-relevant signals above the
     module's own content. Falls back to the module default for roles
     without a distinct angle. ── */
  const ModuleLensBand=({module})=>{
    const ml=acModuleLensFor(module,role);
    if(!ml)return null;
    return <div style={{marginBottom:14}}>
      <div style={{background:`linear-gradient(135deg,${T.s2},${T.s1})`,border:`1px solid ${T.border}`,borderLeft:`3px solid ${T.blue}`,borderRadius:12,padding:"13px 16px"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:14,flexWrap:"wrap"}}>
          <div style={{minWidth:220,flex:1}}>
            <div style={{fontSize:9,fontWeight:900,fontFamily:F.m,color:T.blue,textTransform:"uppercase",letterSpacing:"0.13em",marginBottom:5}}>{T_(ml.angle)} · {R.label}</div>
            <div style={{fontSize:15,fontWeight:800,color:T.ink,fontFamily:F.b,letterSpacing:"-0.01em",lineHeight:1.25}}>{T_(ml.question)}</div>
            <div style={{fontSize:11,color:T.ink3,fontFamily:F.b,marginTop:3}}>{T_(ml.sub)}</div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {ml.chips.map((c,i)=><div key={i} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 12px",minWidth:96}}>
              <div style={{fontSize:8,fontFamily:F.m,letterSpacing:"0.08em",textTransform:"uppercase",color:T.ink4,fontWeight:800}}>{T_(c[0])}</div>
              <div style={{fontSize:17,fontWeight:800,fontFamily:F.m,color:lensCol(c[2]),marginTop:4,letterSpacing:"-0.02em"}}>{c[1]}</div>
              <div style={{fontSize:8.5,color:T.ink3,fontFamily:F.b,marginTop:1}}>{T_(c[3])}</div>
            </div>)}
          </div>
        </div>
      </div>
    </div>;
  };

  /* ── Dashboard ─────────────────────────────────────────────── */
  /* Every tile opens the surface that OWNS its metric - no two tiles may
     share a destination. initiatives=workspace overview, journey=execution,
     riskcenter=risk register, decisions=approvals, evidence=audit trail,
     governance=controls, academy=readiness, value tab=value scores,
     portfolio units=investment, reports=portfolio ROI reporting. */
  const W={
    portfolio:{label:"Total initiatives",value:total,sub:"Enterprise AI portfolio",color:rc,go:()=>openModule("lifecycle")},
    active:{label:"Active AI projects",value:active,sub:"In lifecycle",color:T.blue,go:()=>openInitiative(selectedId,"journey")},
    risk:{label:"High-risk use cases",value:high,sub:"High or critical",color:T.red,go:()=>openModule("risk")},
    approvals:{label:"Pending approvals",value:pending,sub:"HITL and CXO",color:T.amber,go:()=>{setTab("decisions");}},
    findings:{label:"Open audit findings",value:"5",sub:"2 high",color:T.red,go:()=>openModule("audit")},
    guardrail:{label:"Guardrail compliance",value:avgGuard+"%",sub:"Mandatory controls",color:T.green,score:avgGuard,go:()=>openModule("controls")},
    adoption:{label:"AI adoption score",value:avgAdopt+"%",sub:"Workforce readiness",color:T.teal,score:avgAdopt,go:()=>openModule("academy")},
    value:{label:"Business value score",value:avgValue+"%",sub:"ROI and outcomes",color:AI_GOLD_INK,score:avgValue,go:()=>openModule("value")},
    budget:{label:"Budget utilization",value:`${Math.round(PF.spent/PF.budget*100)}%`,sub:`$${PF.spent.toFixed(1)}M of $${PF.budget.toFixed(1)}M FY26`,color:T.blue,score:Math.round(PF.spent/PF.budget*100),go:()=>{setPfTab("units");openModule("portfolio");}},
    roi:{label:"Portfolio ROI",value:"+22%",sub:"Weighted actual vs expected",color:T.green,go:()=>openModule("value")},
  };
  const LENS_WIDGETS={
    Executive:["portfolio","value","roi","risk","budget","approvals"],
    Operations:["active","adoption","risk","approvals","portfolio","guardrail"],
    Value:["value","roi","budget","portfolio","adoption","findings"],
    Workforce:["adoption","portfolio","active","approvals","guardrail","value"],
    Security:["risk","guardrail","findings","approvals","portfolio","active"],
    Governance:["portfolio","active","risk","approvals","findings","guardrail","adoption","value"],
    Delivery:["portfolio","active","risk","approvals","findings","guardrail","adoption","value"],
    Privacy:["risk","findings","guardrail","portfolio","approvals","adoption"],
    Compliance:["guardrail","findings","risk","approvals","portfolio","value"],
    Risk:["risk","guardrail","findings","approvals","active","portfolio"],
    Legal:["findings","guardrail","risk","approvals","portfolio","value"],
  };
  const showCxo=["Executive","Governance","Delivery"].includes(access.lens);
  const showValueSection=["Executive","Value","Workforce","Operations","Governance","Delivery"].includes(access.lens);
  const attention=items.filter(i=>i.blockedBy);

  const Dashboard=()=><div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12,marginBottom:14}}>
      {/* Budget is gated: in the common AI Central view everyone sees adoption,
         initiatives, risk and value — but financials show only to budget-owner
         roles (CEO/CFO). Others see budget only inside their own initiative. */}
      {(LENS_WIDGETS[access.lens]||LENS_WIDGETS.Governance).filter(k=>k!=="budget"||["ceo","cfo"].includes(role)).map(k=>{const w=W[k];return <Metric key={k} label={w.label} value={w.value} sub={w.sub} color={w.color} score={w.score} onClick={w.go}/>;})}
    </div>
    {attention.length>0&&<Card style={{padding:"14px 18px",marginBottom:14,border:`1px solid ${T.amber}40`}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><span style={{width:7,height:7,borderRadius:"50%",background:T.amber,animation:"pulse 2s infinite"}}/><h3 style={{fontSize:13,color:T.ink,fontWeight:800,margin:0}}>{T_("Initiatives needing attention")}</h3><Tag label={`${attention.length}`} color={T.amber} bg={T.amberL}/></div>
      <div style={{display:"grid",gap:7}}>
        {attention.map(i=><div key={i.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"9px 12px"}}>
          <div style={{minWidth:0}}><div style={{fontSize:12,color:T.ink,fontWeight:800,fontFamily:F.b}}>{i.name}</div><div style={{fontSize:10,color:T.ink3,fontFamily:F.b,marginTop:2}}>{i.blockedBy}</div></div>
          <button onClick={()=>openInitiative(i.id,"implementation")} style={{background:rc+"18",border:`1px solid ${rc}45`,borderRadius:7,padding:"6px 11px",color:rc,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer",whiteSpace:"nowrap"}}>{T_("Open phase")}</button>
        </div>)}
      </div>
    </Card>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,280px),1fr))",gap:14,marginBottom:14}}>
      <Card style={{padding:18}}>
        <h3 style={{fontSize:14,color:T.ink,fontWeight:800,margin:"0 0 14px"}}>{T_("Risk heatmap")}</h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,120px),1fr))",gap:8}}>
          {items.map(i=><button key={i.id} onClick={()=>openInitiative(i.id)} style={{background:(i.risk==="Critical"?T.red:i.risk==="High"?T.amber:T.blue)+"18",border:"1px solid "+(i.risk==="Critical"?T.red:i.risk==="High"?T.amber:T.blue)+"35",borderRadius:10,padding:12,textAlign:"left",cursor:"pointer"}}>
            <div style={{fontSize:10,color:T.ink3,fontFamily:F.m,marginBottom:6}}>{i.unit}</div>
            <div style={{fontSize:12,color:T.ink,fontWeight:700,lineHeight:1.35}}>{i.name}</div>
            <div style={{marginTop:10}}><PTag p={i.risk}/></div>
          </button>)}
        </div>
      </Card>
      <Card style={{padding:18}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <h3 style={{fontSize:14,color:T.ink,fontWeight:800,margin:0}}>{T_("Governance maturity")}</h3>
          {access.modules.includes("governance")&&<button onClick={()=>setView("governance")} style={{background:"transparent",border:"none",color:rc,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>{T_("Open AI Governance")}</button>}
        </div>
        {["Strategy linkage","Policy mapping","Human oversight","Evidence readiness","Value realization"].map((m,idx)=>{const val=[88,79,74,83,71][idx];return <div key={m} style={{marginBottom:13}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.ink2,marginBottom:6}}><span>{T_(m)}</span><span style={{fontFamily:F.m}}>{val}%</span></div>
          <Bar value={val} color={val>80?T.green:val>72?T.blue:T.amber}/>
        </div>})}
      </Card>
    </div>
    <Card style={{padding:18,marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
        <h3 style={{fontSize:14,color:T.ink,fontWeight:800,margin:0}}>{T_("Feedback engine outcomes")}</h3>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["Scale","Continue","Improve","Retire"].map(d=>{
            const n=items.filter(i=>feedbackDecision(feedback[i.id]||DEFAULT_FEEDBACK)===d).length;
            const c=decisionColorOf(d,T);
            return <span key={d} style={{display:"inline-flex",alignItems:"center",gap:5,background:c+"14",border:`1px solid ${c}35`,borderRadius:7,padding:"4px 9px",fontSize:10,fontWeight:800,fontFamily:F.b,color:c}}>{T_(d)} <span style={{fontFamily:F.m}}>{n}</span></span>;
          })}
        </div>
      </div>
      <div style={{display:"grid",gap:8}}>
        {items.map(i=>{
          const f=feedback[i.id]||DEFAULT_FEEDBACK;const avg=feedbackAvg(f);const rec=feedbackDecision(f);const c=decisionColorOf(rec,T);
          return <button key={i.id} onClick={()=>openInitiative(i.id,"feedback")} style={{display:"grid",gridTemplateColumns:"1.4fr 1fr 96px",gap:12,alignItems:"center",background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px",textAlign:"left",cursor:"pointer"}}>
            <div><div style={{fontSize:12,color:T.ink,fontWeight:800,fontFamily:F.b}}>{i.name}</div><div style={{fontSize:10,color:T.ink3,fontFamily:F.b,marginTop:2}}>{i.unit}</div></div>
            <div><Bar value={avg} color={c}/><div style={{fontSize:10,color:T.ink3,fontFamily:F.m,marginTop:4}}>{T_("Composite")} {avg}/100</div></div>
            <div style={{justifySelf:"end"}}><Tag label={T_(rec)} color={c} bg={c+"16"}/></div>
          </button>;
        })}
      </div>
    </Card>
    {showValueSection&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,280px),1fr))",gap:14,marginBottom:14}}>
      <Card style={{padding:18}}><h3 style={{fontSize:15,color:T.ink,margin:"0 0 14px"}}>{T_("Business value tracking")}</h3>{items.map(i=><button key={i.id} onClick={()=>openInitiative(i.id)} style={{display:"block",width:"100%",textAlign:"left",background:"transparent",border:"none",padding:0,marginBottom:14,cursor:"pointer"}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:T.ink2,marginBottom:6}}><span>{i.name}</span><span>{i.valueScore}%</span></div><Bar value={i.valueScore} color={i.valueScore>80?T.green:T.amber}/><div style={{fontSize:10,color:T.ink3,marginTop:5}}>{T_("Expected")} {i.expected} - {T_("Actual")} {i.actual}</div></button>)}</Card>
      <Card style={{padding:18}}><h3 style={{fontSize:15,color:T.ink,margin:"0 0 14px"}}>{T_("Business unit comparison")}</h3>{items.map(i=><div key={i.id} style={{background:T.s2,border:"1px solid "+T.border,borderRadius:9,padding:12,marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:T.ink,marginBottom:8}}><span>{i.unit}</span><Tag label={T_("Resistance:")+" "+T_(i.resistance)} color={i.resistance==="High"?T.red:i.resistance==="Medium"?T.amber:T.green}/></div><Bar value={parseInt(i.training)||0} color={(parseInt(i.training)||0)>75?T.green:T.amber}/><div style={{fontSize:10,color:T.ink3,marginTop:7}}>{T_("Training")} {i.training} - {T_("Adoption")} {i.adoption}%</div></div>)}</Card>
    </div>}
    {showCxo&&<Card style={{padding:18}}>
      <h3 style={{fontSize:14,color:T.ink,fontWeight:800,margin:"0 0 14px"}}>{T_("CXO alignment")}</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10}}>
        {acCxoAlignment.map(c=><div key={c.role} style={{background:T.s2,border:"1px solid "+T.border,borderRadius:10,padding:13}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}><div><div style={{fontSize:17,color:T.ink,fontWeight:800}}>{c.role}</div><div style={{fontSize:10,color:T.ink3}}>{c.count} {T_("mapped initiatives")}</div></div><Ring score={c.score} color={c.score>80?T.green:c.score>72?T.blue:T.amber} size={44}/></div>
          <p style={{fontSize:10,color:T.ink3,lineHeight:1.55,margin:0}}>{c.focus}</p>
        </div>)}
      </div>
    </Card>}
  </div>;

  /* ── AI Initiatives ────────────────────────────────────────── */
  const filtered=lifecycleFilter==="All"?items:items.filter(i=>i.lifecycle===lifecycleFilter);
  const catColor=cat=>cat==="Retired"?T.red:cat==="Scaling"?T.green:cat==="Completed"?T.teal:cat==="Production"||cat==="Pilot"?AI_GOLD:T.blue;
  const decide=(outcome,reason,rationale)=>{
    const rec={outcome,reason:reason||null,rationale:rationale||"",decidedBy:R.label,at:"just now"};
    setDecisions({...decisions,[selected.id]:rec});
    setItems(items.map(i=>i.id===selected.id?{...i,lifecycle:outcome==="Scale"?"Scaling":"Retired",status:outcome==="Scale"?"Scaling":"Retired",blockedBy:null}:i));
    pushBus("vz-gw-evidence",{item:`Governed decision: ${outcome} - ${selected.name}`,initiative:selected.name,scope:"Project",control:"Scale gate",risk:reason||"Executive decision",owner:R.label,status:"Complete",approval:"Recorded",version:"v1",time:"Just now"})
    showToast&&showToast(outcome==="Scale"?"Governed decision recorded: approved to scale":"Governed decision recorded: initiative retired");
    setRetireDraft({reason:RETIREMENT_REASONS[0],rationale:""});
  };
  const phaseStatus=(ini,idx)=>idx<ini.phaseIndex?"Complete":idx>ini.phaseIndex?"Not Started":ini.blockedBy?"Blocked":"Active";
  const artifactStatus=(ini,phaseIdx,artIdx)=>{
    if(phaseIdx<ini.phaseIndex)return "Complete";
    if(phaseIdx>ini.phaseIndex)return "Not Started";
    if(artIdx<ini.phaseArtifactsDone)return "Complete";
    return artIdx===ini.phaseArtifactsDone&&ini.blockedBy?"Blocked":"Missing";
  };
  const phaseProgress=ini=>Math.round(((ini.phaseIndex+(ini.phaseArtifactsDone/(AC_PHASES[ini.phaseIndex]?.deliverables.length||1)))/AC_PHASES.length)*100);
  const createInitiative=()=>{
    if(!draft.name.trim()||!draft.unit.trim()){showToast&&showToast("Name and business unit are required","error");return;}
    const rec={
      id:`ai-${String(items.length+1).padStart(3,"0")}`,name:draft.name.trim(),unit:draft.unit.trim(),category:draft.category,lifecycle:"New Ideas",
      businessOwner:draft.businessOwner.trim()||"Unassigned",technicalOwner:"Unassigned",sponsor:draft.sponsor.trim()||"Unassigned",champion:"Unassigned",cxo:"CAIO",
      status:"New Idea",priority:"Medium",risk:"Medium",expected:draft.expected.trim()||"TBD",actual:"$0",stage:"Demand Intake",
      guardrail:20,adoption:0,valueScore:0,policies:[],controls:[],audits:[],risks:[],roi:"--",savings:"$0",revenue:"$0",productivity:"--",training:"0%",resistance:"Medium",
      phaseIndex:0,phaseArtifactsDone:0,blockedBy:"Discover artifacts not started",
    };
    setItems([rec,...items]);setSelectedId(rec.id);setInitTab("implementation");setPhaseSel(0);setCreateOpen(false);
    setDraft({name:"",unit:"",category:"GenAI Copilot",businessOwner:"",sponsor:"",expected:"",phase:"",risk:"",dataClass:""});
    showToast&&showToast("Initiative created - Discover phase opened");
  };
  const fieldStyle={background:T.s2,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 11px",color:T.ink,fontSize:12,fontFamily:F.b,width:"100%",outline:"none"};

  /* ── Portfolio Navigator (LEFT pane): navigate, not create.
     Compact rows - status dot, name, phase, health, value. Creation is a
     quiet secondary action pinned at the very bottom. ── */
  const railFiltered=filtered.filter(i=>(unitFilter==="All"||i.unit===unitFilter)&&(!initQuery.trim()||`${i.name} ${i.unit} ${i.category}`.toLowerCase().includes(initQuery.trim().toLowerCase())));
  const railUnits=[...new Set(railFiltered.map(i=>i.unit))];
  const allUnits=[...new Set(items.map(i=>i.unit))];
  const railHealth=i=>Math.round((i.guardrail+i.adoption+i.valueScore)/3);
  const navRow=i=>{
    const isA=selectedId===i.id;
    const h=railHealth(i);
    return <div key={i.id} className="vz-pn-row" style={{display:"flex",alignItems:"center",gap:8,borderRadius:8,marginBottom:3,background:isA?AI_GOLD+"12":"transparent",boxShadow:isA?`inset 2px 0 0 ${AI_GOLD}`:"none"}}>
      <button onClick={()=>openInitiative(i.id)} style={{flex:1,minWidth:0,display:"flex",alignItems:"center",gap:9,background:"transparent",border:"none",padding:"11px 4px 11px 11px",cursor:"pointer",textAlign:"left"}}>
        <span style={{width:7,height:7,borderRadius:"50%",background:catColor(i.lifecycle),flexShrink:0}} title={i.lifecycle}/>
        <span style={{flex:1,minWidth:0,fontSize:11.5,fontWeight:isA?800:600,fontFamily:F.b,color:isA?AI_GOLD:T.ink2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{i.name}</span>
        <span style={{fontSize:9,fontFamily:F.m,color:T.ink4,flexShrink:0}}>{i.phaseIndex+1}/{AC_PHASES.length}</span>
        <span style={{fontSize:9,fontFamily:F.m,fontWeight:800,color:h>=75?T.green:h>=55?T.amber:T.red,flexShrink:0}}>{h}</span>
        <span style={{fontSize:9,fontFamily:F.m,color:T.ink3,flexShrink:0}}>{i.expected}</span>
      </button>
      <button aria-label={favIds.includes(i.id)?"Unfavorite":"Favorite"} onClick={()=>setFavIds(f=>f.includes(i.id)?f.filter(x=>x!==i.id):[...f,i.id])} className="vz-pn-fav" style={{background:"transparent",border:"none",padding:"0 9px 0 0",cursor:"pointer",color:favIds.includes(i.id)?AI_GOLD:T.ink4,fontSize:11,lineHeight:1,opacity:favIds.includes(i.id)?1:0}}>{favIds.includes(i.id)?"★":"☆"}</button>
    </div>;
  };
  const navGroup=(title,list)=>list.length>0&&<div key={title}>
    <div style={{fontSize:9,fontWeight:900,fontFamily:F.m,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.12em",margin:"16px 0 7px 4px"}}>{T_(title)}</div>
    {list.map(navRow)}
  </div>;
  const renderPortfolioRail=()=><div style={{display:"flex",flexDirection:"column",gap:4,alignContent:"start",minHeight:420}}>
    <style>{`.vz-pn-row:hover{background:${T.s2}} .vz-pn-row:hover .vz-pn-fav{opacity:1}`}</style>
    <input aria-label="Search initiatives" placeholder={T_("Search portfolio...")} value={initQuery} onChange={e=>setInitQuery(e.target.value)} style={{...fieldStyle,fontSize:11,marginBottom:4}}/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
      <select aria-label="Business unit filter" value={unitFilter} onChange={e=>setUnitFilter(e.target.value)} style={{...fieldStyle,fontSize:10,padding:"7px 8px",cursor:"pointer"}}>
        <option value="All">{T_("All units")}</option>
        {allUnits.map(u=><option key={u} value={u}>{u}</option>)}
      </select>
      <select aria-label="Lifecycle filter" value={lifecycleFilter} onChange={e=>setLifecycleFilter(e.target.value)} style={{...fieldStyle,fontSize:10,padding:"7px 8px",cursor:"pointer"}}>
        <option value="All">{T_("All stages")}</option>
        {LIFECYCLE_BANDS.flatMap(b=>b.cats).map(cat=><option key={cat} value={cat}>{T_(cat)}</option>)}
      </select>
    </div>
    {navGroup("Favorites",railFiltered.filter(i=>favIds.includes(i.id)))}
    {navGroup("Recently viewed",recentIds.map(id=>railFiltered.find(i=>i.id===id)).filter(Boolean).filter(i=>!favIds.includes(i.id)))}
    {railUnits.map(unit=>navGroup(unit,railFiltered.filter(i=>i.unit===unit&&!favIds.includes(i.id)&&!recentIds.includes(i.id))))}
    {railFiltered.length===0&&<div style={{fontSize:11,color:T.ink3,fontFamily:F.b,padding:"8px 4px"}}>{T_("No initiatives match - clear the search or filter.")}</div>}
    <div style={{flex:1}}/>
    <button onClick={()=>setCreateOpen(!createOpen)} style={{marginTop:12,background:"transparent",border:`1px dashed ${T.border}`,borderRadius:8,padding:"8px 12px",fontSize:10.5,fontWeight:700,fontFamily:F.b,color:T.ink3,cursor:"pointer",textAlign:"left"}}>{createOpen?T_("Close"):T_("+ New AI Initiative")}</button>
  </div>;
  const renderCreateForm=()=><Card style={{padding:18,marginBottom:14,border:`1px solid ${rc}45`,animation:"up .25s ease"}}>
    <h3 style={{fontSize:14,color:T.ink,fontWeight:800,margin:"0 0 4px"}}>{T_("Create AI Initiative")}</h3>
    <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,margin:"0 0 12px"}}>{T_("Every initiative starts in Discover. Mandatory artifacts gate each phase; the record becomes the single source of truth.")}</p>
    {(()=>{
      const fLabel=l=><span style={{fontSize:9,fontWeight:900,fontFamily:F.m,letterSpacing:"0.1em",textTransform:"uppercase",color:T.ink4}}>{T_(l)}</span>;
      const setK=k=>v=>setDraft(d=>({...d,[k]:v}));
      return <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10,marginBottom:12}}>
        {[["Initiative name","name","e.g. Resolution Copilot"],["Expected value (USD m)","expected","e.g. 3.4"]].map(([l,k,ph])=><label key={k} style={{display:"grid",gap:5}}>
          {fLabel(l)}<input value={draft[k]} onChange={e=>setDraft({...draft,[k]:e.target.value})} placeholder={ph} style={fieldStyle}/>
        </label>)}
        <label style={{display:"grid",gap:5}}>{fLabel("Business unit")}<SmartSelect vocab="unit" value={draft.unit} onChange={setK("unit")} role={role} showToast={showToast} requestedBy={R.name}/></label>
        <label style={{display:"grid",gap:5}}>{fLabel("Business owner")}<SmartSelect vocab="person" value={draft.businessOwner} onChange={setK("businessOwner")} role={role} showToast={showToast} requestedBy={R.name} placeholder="Choose or add an owner"/></label>
        <label style={{display:"grid",gap:5}}>{fLabel("Executive sponsor")}<SmartSelect vocab="person" value={draft.sponsor} onChange={setK("sponsor")} role={role} showToast={showToast} requestedBy={R.name} placeholder="Choose or add a sponsor"/></label>
        <label style={{display:"grid",gap:5}}>{fLabel("Lifecycle phase")}<SmartSelect vocab="phase" value={draft.phase} onChange={setK("phase")} role={role} showToast={showToast} requestedBy={R.name}/></label>
        <label style={{display:"grid",gap:5}}>{fLabel("EU AI Act risk class")}<SmartSelect vocab="risk" value={draft.risk} onChange={setK("risk")} role={role} showToast={showToast} requestedBy={R.name}/></label>
        <label style={{display:"grid",gap:5}}>{fLabel("Data classification")}<SmartSelect vocab="data" value={draft.dataClass} onChange={setK("dataClass")} role={role} showToast={showToast} requestedBy={R.name}/></label>
        <label style={{display:"grid",gap:5}}>{fLabel("Category")}<SmartSelect vocab="category" value={draft.category} onChange={setK("category")} role={role} showToast={showToast} requestedBy={R.name}/></label>
      </div>;
    })()}
    <button onClick={createInitiative} style={{background:rc,border:"none",borderRadius:8,padding:"10px 16px",color:"#111",fontSize:12,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>{T_("Create initiative")}</button>
  </Card>;

  /* Overview: executive-level by default. Ownership and next action up
     front as typography; governance metadata and compliance mapping stay
     collapsed until explicitly expanded (progressive disclosure). */
  /* Executive charter - the 30-second read: why, where to, what success is. */
  const iniModels=MODEL_REGISTRY.filter(m=>m.initiativeId===selected.id);
  const renderCharter=()=>(selected.problem||selected.vision)&&<div style={{display:"grid",gap:14}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:"14px 28px"}}>
      {[["Problem",selected.problem],["Vision",selected.vision],["Business objective",selected.objective]].filter(([,v])=>v).map(([l,v])=><div key={l}>
        <div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:4}}>{T_(l)}</div>
        <div style={{fontSize:11.5,color:T.ink2,fontFamily:F.b,lineHeight:1.6}}>{v}</div>
      </div>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:"12px 24px"}}>
      {[["Budget",`${selected.spent||"—"} ${T_("of")} ${selected.budget||"—"}`],["Timeline",selected.timeline||"—"],
        ["Overall completion",phaseProgress(selected)+"%"],
        ["AI models used",iniModels.length?iniModels.map(m=>m.bizName).join(", "):T_("None registered")]].map(([l,v])=><div key={l}>
        <div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:3}}>{T_(l)}</div>
        <div style={{fontSize:12,color:T.ink,fontFamily:F.b,fontWeight:700,lineHeight:1.45}}>{v}</div>
      </div>)}
    </div>
    {selected.successMetrics&&<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
      {selected.successMetrics.map(m=><span key={m} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:999,padding:"4px 11px",fontSize:9.5,fontWeight:800,fontFamily:F.m,color:T.ink2}}>{m}</span>)}
    </div>}
  </div>;
  const Overview=()=><div style={{display:"grid",gap:20}}>
    {/* ── Unified record: this initiative is ONE object; the chips are the
        other surfaces that are a lens on the same record. ── */}
    {(()=>{const lenses=surfacesFor(selected.id);const uni=initiativeById(selected.id);return <div style={{background:`linear-gradient(135deg,${AI_GOLD}14,${T.s2})`,border:`1px solid ${AI_GOLD}33`,borderRadius:11,padding:"11px 14px"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
        <span style={{fontSize:8.5,fontWeight:900,fontFamily:F.m,color:AI_GOLD_INK,textTransform:"uppercase",letterSpacing:"0.1em"}}>⛓ {ar?"سجل موحّد":"Unified record"} · {selected.id}</span>
        <span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{T_("one object ·")} {uni&&uni.depth==="governed"?T_("governed across every lens below"):T_("portfolio record")}</span>
      </div>
      <div style={{display:"flex",gap:7,flexWrap:"wrap",marginTop:9}}>
        {lenses.map(s=><button key={s.key} onClick={()=>nav(s.target,s.ctx)} title={`Open this initiative on ${s.label}`} style={{display:"flex",alignItems:"center",gap:6,background:T.card,border:`1px solid ${T.border}`,borderRadius:999,padding:"4px 11px",fontSize:10,fontWeight:800,fontFamily:F.b,color:T.ink2,cursor:"pointer"}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:s.key==="initiative"?AI_GOLD:T.blue}}/>{T_(s.label)}{s.key==="initiative"?(ar?" · هنا":" · here"):" →"}
        </button>)}
      </div>
    </div>;})()}
    {renderCharter()}
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:"14px 24px",marginBottom:4}}>
        {[["Executive sponsor",selected.sponsor],["Status",T_(selected.status)],["Current phase",`${T_(AC_PHASES[selected.phaseIndex]?.name)} (${selected.phaseIndex+1}/${AC_PHASES.length})`],["Adoption",selected.adoption+"%"]].map(([l,v])=><div key={l}>
          <div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:3}}>{T_(l)}</div>
          <div style={{fontSize:12,color:T.ink,fontFamily:F.b,fontWeight:600,lineHeight:1.4}}>{v}</div>
        </div>)}
      </div>
      {selected.blockedBy&&<div style={{background:T.redL,border:`1px solid ${T.red}35`,borderRadius:9,padding:"10px 13px",fontSize:11,color:T.ink2,fontFamily:F.b,marginTop:12}}><strong style={{color:T.red}}>{T_("Blocked:")}</strong> {selected.blockedBy}</div>}
      <button onClick={()=>{if(selected.blockedBy)setInitTab("journey");else setInitTab("journey");}} style={{marginTop:12,background:AI_GOLD+"12",border:`1px solid ${AI_GOLD}40`,borderRadius:8,padding:"9px 14px",color:AI_GOLD_INK,fontSize:11,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>{T_("Next action:")} {wsNextAction} →</button>
    </div>
    <div>
      <h3 style={{fontSize:13,color:T.ink,margin:"0 0 10px",fontFamily:F.h,fontWeight:800}}>{T_("Initiative team")}</h3>
      <div style={{display:"flex",gap:22,flexWrap:"wrap",marginBottom:4}}>
        {[["Executive sponsor",selected.sponsor],["Business owner",selected.businessOwner],["Technical owner",selected.technicalOwner],["AI champion",selected.champion],["CXO sponsors",selected.cxo]].map(([l,v])=><div key={l}>
          <div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:3}}>{T_(l)}</div>
          <div style={{fontSize:11.5,color:T.ink,fontFamily:F.b,fontWeight:600}}>{v}</div>
        </div>)}
      </div>
    </div>
    <div>
      <h3 style={{fontSize:13,color:T.ink,margin:"0 0 10px",fontFamily:F.h,fontWeight:800}}>{T_("Financial impact")}</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:"12px 24px"}}>
        {[["Expected value",selected.expected],["Realized value",selected.actual],["ROI",selected.roi],["Cost savings",selected.savings],["Revenue generated",selected.revenue]].map(([l,v])=><div key={l}>
          <div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:3}}>{T_(l)}</div>
          <div style={{fontSize:14,color:T.ink,fontFamily:F.m,fontWeight:800}}>{v}</div>
        </div>)}
      </div>
    </div>
    <div>
      <button onClick={()=>setOvDetails(!ovDetails)} style={{background:"transparent",border:"none",padding:0,color:T.ink3,fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{ovDetails?"▾":"▸"} {T_("Governance & technical details")}</button>
      {ovDetails&&<div style={{marginTop:12,animation:"up .2s ease"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"12px 24px",marginBottom:16}}>
          {[["Business owner",selected.businessOwner],["Technical owner",selected.technicalOwner],["AI champion",selected.champion],["CXO sponsors",selected.cxo],["Lifecycle",T_(selected.lifecycle)],["Linked policies",selected.policies.join(", ")||T_("None yet")],["Linked controls",selected.controls.join(", ")||T_("None yet")],["Linked risks",selected.risks.join(", ")||T_("None yet")],["Audits",selected.audits.join(", ")||T_("None yet")],["Training status",selected.training]].map(([l,v])=><div key={l}>
            <div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:3}}>{T_(l)}</div>
            <div style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.4}}>{v}</div>
          </div>)}
        </div>
        <div style={{fontSize:10,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:8}}>{T_("Compliance mapping")}</div>
        <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
          {["Compliant","Partially compliant","Non-compliant","Not assessed"].map((s,idx)=><div key={s} style={{display:"flex",gap:7,alignItems:"center"}}><Tag label={T_(s)} color={[T.green,T.amber,T.red,T.ink3][idx]}/><span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{[5,3,1,2][idx]} {T_("items")}</span></div>)}
        </div>
      </div>}
    </div>
  </div>;

  const Implementation=()=>{
    const activePhase=phaseSel==null?selected.phaseIndex:phaseSel;
    const phase=AC_PHASES[activePhase];
    const st=phaseStatus(selected,activePhase);
    const stColor=st==="Complete"?T.green:st==="Active"?rc:st==="Blocked"?T.red:T.ink3;
    const pKey=`${selected.id}:${activePhase}`;
    const files=phaseFiles[pKey]||[];
    const comments=phaseComments[pKey]||[];
    const doneCount=idx=>idx<selected.phaseIndex?AC_PHASES[idx].deliverables.length:idx===selected.phaseIndex?selected.phaseArtifactsDone:0;
    const approvalsOf=idx=>AC_PHASES[idx].deliverables.filter((d,ai)=>/approval|sign-off|decision|charter/i.test(d)&&artifactStatus(selected,idx,ai)==="Complete").length;
    const lastUpdated=idx=>idx<selected.phaseIndex?"Jul 11":idx===selected.phaseIndex?"Today":"—";
    const stamp=()=>{const d=new Date();return d.toLocaleDateString("en-GB",{day:"2-digit",month:"short"})+" "+d.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});};
    const recordEvidence=(item,control)=>pushBus("vz-gw-evidence",{item,initiative:selected.name,scope:"Phase "+phase.order+" - "+phase.name,control,risk:"Lifecycle evidence",owner:R.label,status:"Complete",approval:"Recorded",version:"v1",time:"Just now"});
    const addFiles=names=>{
      if(!names.length)return;
      const recs=names.map(n=>({name:n,owner:R.label,time:stamp(),status:"Uploaded",version:"v1"}));
      setPhaseFiles(f=>({...f,[pKey]:[...recs,...(f[pKey]||[])]}));
      names.forEach(n=>recordEvidence(`Evidence uploaded: ${n}`,"Evidence intake"));
      showToast&&showToast(`${names.length} file${names.length>1?"s":""} recorded in the ${phase.name} evidence workspace`);
    };
    const addComment=()=>{
      const t=commentDraft.trim();
      if(!t)return;
      setPhaseComments(c=>({...c,[pKey]:[{by:R.label,time:stamp(),text:t},...(c[pKey]||[])]}));
      setCommentDraft("");
      recordEvidence(`Reviewer comment on ${phase.name}`,"Review trail");
    };
    const auditTrail=[
      ...files.map(f=>({time:f.time,what:`${f.name} uploaded (${f.version})`,by:f.owner})),
      ...comments.map(c=>({time:c.time,what:"Reviewer comment recorded",by:c.by})),
      ...phase.deliverables.map((d,ai)=>artifactStatus(selected,activePhase,ai)==="Complete"?{time:lastUpdated(activePhase),what:`${d} completed and approved`,by:phase.raci.accountable}:null).filter(Boolean),
    ];
    const completeness=Math.round((doneCount(activePhase)/phase.deliverables.length)*100);
    const downloadPackage=()=>{
      const L=[`# Evidence Package - ${selected.name}`,`Phase ${phase.order}: ${phase.name} (${st})`,"",
        "## Exit criteria",...phase.deliverables.map(d=>`- [${artifactStatus(selected,activePhase,phase.deliverables.indexOf(d))==="Complete"?"x":" "}] ${d}`),
        `- [${selected.blockedBy&&activePhase===selected.phaseIndex?" ":"x"}] No open blockers`,
        `- [${approvalsOf(activePhase)>0?"x":" "}] Accountable sign-off (${phase.raci.accountable})`,"",
        "## Uploaded evidence",...(files.length?files.map(f=>`- ${f.name} · ${f.owner} · ${f.time} · ${f.version}`):["- none"]),"",
        "## Reviewer comments",...(comments.length?comments.map(c=>`- ${c.time} ${c.by}: ${c.text}`):["- none"]),"",
        "## Audit trail",...auditTrail.map(a=>`- ${a.time} · ${a.what} · ${a.by}`)];
      vzDownload(`evidence-${selected.id}-phase-${phase.order}.md`,L.join("\n"));
      recordEvidence(`Evidence package exported - ${phase.name}`,"Audit export");
      showToast&&showToast("Evidence package downloaded - export recorded in the audit trail");
    };
    return <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:6,marginBottom:14}}>
        {AC_PHASES.map((p,idx)=>{
          const s=phaseStatus(selected,idx);
          const col=s==="Complete"?T.green:s==="Active"?rc:s==="Blocked"?T.red:T.ink4;
          const isSel=idx===activePhase;
          const pc=Math.round((doneCount(idx)/p.deliverables.length)*100);
          return <button key={p.id} onClick={()=>setPhaseSel(idx)} style={{background:isSel?col+"1C":T.s2,border:`1px solid ${isSel?col+"55":T.border}`,borderRadius:10,padding:"10px 10px",textAlign:"left",cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{T_("PHASE")} {p.order}</span>
              <Tag label={T_(s)} color={col} bg={col+"16"}/>
            </div>
            <div style={{fontSize:11,color:isSel?col:T.ink2,fontWeight:800,fontFamily:F.b,lineHeight:1.25,marginBottom:6}}>{T_(p.name)}</div>
            <Bar value={pc} color={col}/>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:8.5,color:T.ink4,fontFamily:F.m}}>
              <span>{doneCount(idx)}/{p.deliverables.length} {T_("artifacts")}</span><span>{approvalsOf(idx)} {T_("appr.")}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:3,fontSize:8.5,color:T.ink4,fontFamily:F.m}}>
              <span>{p.raci.accountable}</span><span>{lastUpdated(idx)}</span>
            </div>
            <div style={{marginTop:7,fontSize:9,fontWeight:900,fontFamily:F.b,color:isSel?col:T.ink3}}>{T_("Open phase →")}</div>
          </button>;
        })}
      </div>
      {selected.blockedBy&&activePhase===selected.phaseIndex&&<div style={{background:T.redL,border:`1px solid ${T.red}40`,borderRadius:10,padding:"11px 14px",marginBottom:14,display:"flex",gap:9,alignItems:"center"}}>
        <span style={{width:7,height:7,borderRadius:"50%",background:T.red,flexShrink:0,animation:"pulse 2s infinite"}}/>
        <div style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.5}}><strong style={{color:T.red}}>{T_("Progression blocked.")}</strong> {selected.blockedBy}. {ar?"تمنع الأدلة الإلزامية المفقودة التقدّم إلى":"Missing mandatory artifacts prevent advancing to"} {T_(AC_PHASES[selected.phaseIndex+1]?.name||"completion")}.</div>
      </div>}
      <div style={{display:"grid",gridTemplateColumns:"1.15fr .85fr",gap:14}}>
        <Card style={{padding:18}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,gap:8,flexWrap:"wrap"}}>
            <h3 style={{fontSize:16,color:T.ink,fontWeight:800,margin:0}}>{T_("Phase")} {phase.order}: {T_(phase.name)}</h3>
            <div style={{display:"flex",gap:7,alignItems:"center"}}>
              <Tag label={T_(st)} color={stColor} bg={stColor+"16"}/>
              <button onClick={downloadPackage} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:7,padding:"5px 10px",color:T.ink2,fontSize:9.5,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{T_("Download package ↓")}</button>
            </div>
          </div>
          <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.6,margin:"0 0 12px"}}>{T_(phase.objective)}</p>
          <h4 style={{fontSize:12,color:T.ink,margin:"0 0 7px"}}>{T_("Exit criteria")}</h4>
          <div style={{display:"grid",gap:4,marginBottom:14}}>
            {[[ar?`اكتمال كل الأدلة الإلزامية (${phase.deliverables.length})`:`All ${phase.deliverables.length} mandatory artifacts complete`,completeness===100],
              [T_("No open blockers on this phase"),!(selected.blockedBy&&activePhase===selected.phaseIndex)],
              [ar?`تسجيل اعتماد ${phase.raci.accountable}`:`${phase.raci.accountable} sign-off recorded`,st==="Complete"]].map(([txt,ok])=><div key={txt} style={{display:"flex",gap:7,alignItems:"center"}}>
              <span style={{fontSize:10,fontWeight:900,color:ok?T.green:T.amber,fontFamily:F.m}}>{ok?"✓":"○"}</span>
              <span style={{fontSize:11,color:T.ink2,fontFamily:F.b}}>{txt}</span>
            </div>)}
          </div>
          <h4 style={{fontSize:12,color:T.ink,margin:"0 0 8px"}}>{T_("Mandatory artifacts")}</h4>
          <div style={{display:"grid",gap:7}}>
            {phase.deliverables.map((d,ai)=>{
              const as_=artifactStatus(selected,activePhase,ai);
              const ac_=as_==="Complete"?T.green:as_==="Blocked"?T.red:as_==="Missing"?T.amber:T.ink4;
              const hKey=pKey+":"+ai;
              return <div key={d} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:8}}>
                <button onClick={()=>setHistOpen(histOpen===hKey?null:hKey)} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,background:"transparent",border:"none",padding:"9px 12px",cursor:"pointer",textAlign:"left"}}>
                  <div style={{display:"flex",gap:9,alignItems:"center",minWidth:0}}><span style={{width:7,height:7,borderRadius:"50%",background:ac_,flexShrink:0}}/><span style={{fontSize:12,color:T.ink2,fontFamily:F.b,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{T_(d)}</span></div>
                  <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
                    <span style={{fontSize:8.5,color:T.ink4,fontFamily:F.m}}>{phase.raci.responsible} · {as_==="Complete"?lastUpdated(activePhase):"—"}</span>
                    <Tag label={T_(as_)} color={ac_} bg={ac_+"14"}/>
                  </div>
                </button>
                {histOpen===hKey&&<div style={{padding:"0 12px 10px 28px",animation:"up .15s ease"}}>
                  <div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5}}>{T_("Version history & approvals")}</div>
                  {as_==="Complete"?<>
                    <div style={{fontSize:10,color:T.ink3,fontFamily:F.b,lineHeight:1.7}}>v1 · {ar?"صاغه":"Drafted by"} {phase.raci.responsible} · {lastUpdated(activePhase)}</div>
                    <div style={{fontSize:10,color:T.ink3,fontFamily:F.b,lineHeight:1.7}}>v2 · {ar?"اعتمده":"Approved by"} {phase.raci.accountable} · {lastUpdated(activePhase)} · {ar?"مُسجَّل في الثقة والأدلة":"recorded to Trust & Evidence"}</div>
                  </>:<div style={{fontSize:10,color:T.ink4,fontFamily:F.b}}>{T_("No versions yet - upload evidence below or complete the artifact to start the trail.")}</div>}
                </div>}
              </div>;
            })}
          </div>
          <div onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();addFiles([...e.dataTransfer.files].map(f=>f.name));}} style={{marginTop:12,border:`1.5px dashed ${rc}50`,borderRadius:10,padding:"16px 14px",textAlign:"center"}}>
            <div style={{fontSize:11,color:T.ink2,fontFamily:F.b,fontWeight:700,marginBottom:3}}>{T_("Drop evidence files here")}</div>
            <div style={{fontSize:9.5,color:T.ink4,fontFamily:F.b,marginBottom:8}}>{T_("Uploads are stamped with owner, time and version and recorded in Trust & Evidence.")}</div>
            <label style={{background:rc+"16",border:`1px solid ${rc}45`,borderRadius:7,padding:"6px 13px",color:rc,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer",display:"inline-block"}}>
              {T_("Select files")}<input type="file" multiple style={{display:"none"}} onChange={e=>{addFiles([...e.target.files].map(f=>f.name));e.target.value="";}}/>
            </label>
          </div>
          {files.length>0&&<div style={{marginTop:10,display:"grid",gap:6}}>
            {files.map(f=><div key={f.name+f.time} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,background:T.s2,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 11px"}}>
              <span style={{fontSize:11,color:T.ink,fontFamily:F.b,fontWeight:600,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.name}</span>
              <span style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,flexShrink:0}}>{f.owner} · {f.time} · {f.version}</span>
              <Tag label={T_(f.status)} color={T.blue} bg={T.blue+"14"}/>
            </div>)}
          </div>}
          <div style={{marginTop:12,borderTop:`1px solid ${T.border}`,paddingTop:12}}>
            <button onClick={()=>setEvLog(e=>({...e,open:!e.open}))} style={{background:"transparent",border:"none",color:AI_GOLD_INK,fontSize:10.5,fontWeight:900,fontFamily:F.b,cursor:"pointer",padding:0}}>{evLog.open?T_("– Cancel evidence record"):T_("+ Log an evidence record (governed owner)")}</button>
            {evLog.open&&(()=>{
              const fLabel=l=><span style={{fontSize:8.5,fontWeight:900,fontFamily:F.m,letterSpacing:"0.1em",textTransform:"uppercase",color:T.ink4}}>{T_(l)}</span>;
              const logEvidence=()=>{
                if(!evLog.item.trim()){showToast&&showToast("Describe the evidence item","error");return;}
                pushBus("vz-gw-evidence",{item:evLog.item.trim(),initiative:selected.name,scope:"Phase "+phase.order+" - "+phase.name,control:evLog.control||"Evidence intake",risk:"Lifecycle evidence",owner:evLog.owner||R.label,status:evLog.status,approval:evLog.approval,version:"v1",time:"Just now"});
                setPhaseFiles(f=>({...f,[pKey]:[{name:evLog.item.trim(),owner:evLog.owner||R.label,time:stamp(),status:evLog.status,version:"v1"},...(f[pKey]||[])]}));
                showToast&&showToast(`Evidence "${evLog.item.trim()}" recorded — owner ${evLog.owner||R.label}`);
                setEvLog({open:false,item:"",owner:"",control:"",status:"In Review",approval:"Awaiting Approval"});
              };
              return <div style={{marginTop:10,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:9}}>
                <label style={{display:"grid",gap:4,gridColumn:"1/-1"}}>{fLabel("Evidence item")}<input value={evLog.item} onChange={e=>setEvLog({...evLog,item:e.target.value})} placeholder="e.g. Human oversight design record" style={fieldStyle}/></label>
                <label style={{display:"grid",gap:4}}>{fLabel("Owner")}<SmartSelect vocab="person" value={evLog.owner} onChange={v=>setEvLog(e=>({...e,owner:v}))} role={role} showToast={showToast} requestedBy={R.name} placeholder="Choose or add an owner"/></label>
                <label style={{display:"grid",gap:4}}>{fLabel("Control framework")}<SmartSelect vocab="framework" value={evLog.control} onChange={v=>setEvLog(e=>({...e,control:v}))} role={role} showToast={showToast} requestedBy={R.name}/></label>
                <label style={{display:"grid",gap:4}}>{fLabel("Status")}
                  <select value={evLog.status} onChange={e=>setEvLog({...evLog,status:e.target.value})} style={{...fieldStyle,cursor:"pointer"}}>{["In Review","In Progress","Complete"].map(s=><option key={s} value={s}>{T_(s)}</option>)}</select>
                </label>
                <label style={{display:"grid",gap:4}}>{fLabel("Approval")}
                  <select value={evLog.approval} onChange={e=>setEvLog({...evLog,approval:e.target.value})} style={{...fieldStyle,cursor:"pointer"}}>{["Awaiting Approval","Pending","Approved"].map(s=><option key={s} value={s}>{T_(s)}</option>)}</select>
                </label>
                <button onClick={logEvidence} style={{gridColumn:"1/-1",justifySelf:"start",background:AI_GOLD,border:"none",borderRadius:7,padding:"8px 15px",color:"#111",fontSize:11,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>{T_("Record evidence")}</button>
              </div>;
            })()}
          </div>
        </Card>
        <div style={{display:"grid",gap:12,alignContent:"start"}}>
          <Card style={{padding:16,border:`1px solid ${AI_GOLD}30`}}>
            <div style={{fontSize:9,fontWeight:900,fontFamily:F.m,color:AI_GOLD_INK,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>{T_("Veris completeness review")}</div>
            <div style={{fontSize:20,fontWeight:900,fontFamily:F.m,color:completeness===100?T.green:completeness>=50?T.amber:T.red,marginBottom:6}}>{completeness}%</div>
            <Bar value={completeness} color={completeness===100?T.green:T.amber}/>
            <p style={{fontSize:10.5,color:T.ink2,fontFamily:F.b,lineHeight:1.6,margin:"9px 0 0"}}>
              {completeness===100?`All artifacts for ${phase.name} are complete. ${st==="Complete"?"Phase is closed and archived.":"Request "+phase.raci.accountable+" sign-off to close the phase."}`
              :`${phase.deliverables.length-doneCount(activePhase)} artifact${phase.deliverables.length-doneCount(activePhase)>1?"s":""} outstanding${selected.blockedBy&&activePhase===selected.phaseIndex?"; the phase is blocked: "+selected.blockedBy:""}. ${files.length?files.length+" uploaded file"+(files.length>1?"s":"")+" await mapping to artifacts.":"Upload supporting evidence to accelerate review."}`}
            </p>
          </Card>
          <Card style={{padding:16}}>
            <h3 style={{fontSize:13,color:T.ink,fontWeight:800,margin:"0 0 10px"}}>{T_("Ownership (RACI)")}</h3>
            {[["Responsible",phase.raci.responsible,T.green],["Accountable",phase.raci.accountable,rc],["Consulted",phase.raci.consulted,T.blue],["Informed",phase.raci.informed,T.ink3]].map(([l,v,c])=><div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
              <Tag label={T_(l)} color={c} bg={c+"14"}/><span style={{fontSize:11,color:T.ink,fontWeight:700,fontFamily:F.b}}>{v}</span>
            </div>)}
          </Card>
          <Card style={{padding:16}}>
            <h3 style={{fontSize:13,color:T.ink,fontWeight:800,margin:"0 0 9px"}}>{T_("Reviewer comments")}</h3>
            <div style={{display:"flex",gap:6,marginBottom:9}}>
              <input value={commentDraft} onChange={e=>setCommentDraft(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addComment();}} placeholder={T_("Add a review note...")} style={{...fieldStyle,fontSize:10.5,padding:"7px 10px"}}/>
              <button onClick={addComment} style={{background:rc+"16",border:`1px solid ${rc}45`,borderRadius:7,padding:"0 12px",color:rc,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>{T_("Post")}</button>
            </div>
            {comments.length===0&&<div style={{fontSize:10,color:T.ink4,fontFamily:F.b}}>{T_("No comments on this phase yet.")}</div>}
            <div style={{display:"grid",gap:7}}>
              {comments.map((c,i)=><div key={i} style={{fontSize:10.5,color:T.ink2,fontFamily:F.b,lineHeight:1.5}}><strong style={{color:T.ink}}>{c.by}</strong> <span style={{color:T.ink4,fontFamily:F.m,fontSize:8.5}}>{c.time}</span><br/>{c.text}</div>)}
            </div>
          </Card>
          <Card style={{padding:16}}>
            <h3 style={{fontSize:13,color:T.ink,fontWeight:800,margin:"0 0 9px"}}>{T_("Audit trail")}</h3>
            {auditTrail.length===0&&<div style={{fontSize:10,color:T.ink4,fontFamily:F.b}}>{T_("Activity on this phase will appear here with timestamps.")}</div>}
            <div style={{display:"grid",gap:6}}>
              {auditTrail.slice(0,6).map((a,i)=><div key={i} style={{fontSize:10,color:T.ink3,fontFamily:F.b,lineHeight:1.5}}><span style={{color:T.ink4,fontFamily:F.m,fontSize:8.5}}>{a.time}</span> · {a.what} · <span style={{color:T.ink2}}>{a.by}</span></div>)}
            </div>
            <div style={{fontSize:9,color:T.ink4,fontFamily:F.b,marginTop:9,lineHeight:1.5}}>{T_("Entries are also written to the hash-chained platform audit log (ISO 42001 / EU AI Act ready).")}</div>
          </Card>
        </div>
      </div>
    </div>;
  };

  const PilotExecution=()=>{
    const program=AI_ROLLOUT_PROGRAMS.find(p=>selected.name.includes(p.name.split(" ")[0]))||AI_ROLLOUT_PROGRAMS[0];
    const tasks=[
      ["Guardrail activation","AI Spine","In Progress",selected.guardrail,"Controls and HITL checks activated for pilot workspace"],
      ["Department enablement",selected.unit,selected.adoption>=70?"On Track":"At Risk",selected.adoption,"Training, workflow comms and adoption readiness"],
      ["Evidence collection","Assurance",program.evidence>=80?"Ready":"Incomplete",program.evidence,program.blocker],
      ["Risk monitoring","Risk owner",parseInt(program.riskDrift,10)>8?"Escalate":"Monitor",Math.max(35,100-Math.abs(parseInt(program.riskDrift,10))*4),"Live risk drift against approved appetite"],
    ];
    const wave=[program.pilot,program.next,"Enterprise rollout"].map((dept,idx)=>({dept,status:idx===0?"Pilot active":idx===1?program.decision==="Scale"?"Queued":"Waiting gate":"Not started",score:idx===0?program.adoption:idx===1?program.readiness:42}));
    return <div style={{display:"grid",gridTemplateColumns:"1.15fr .85fr",gap:14}}>
      <Card style={{padding:18}}>
        <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start",marginBottom:16}}>
          <div>
            <Tag label={T_("DEPARTMENT PILOT EXECUTION")} color={AI_GOLD} bg={AI_GOLD_L}/>
            <h3 style={{fontFamily:F.h,fontSize:22,fontWeight:900,color:T.ink,margin:"10px 0 5px"}}>{selected.name}</h3>
            <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.65,margin:0}}>{T_("Downstream execution for the pilot department. AI Central monitors tasks, deviations, adoption, guardrails, evidence and scale readiness.")}</p>
          </div>
          <Tag label={T_(program.decision)} color={program.decision==="Scale"?T.green:program.decision==="Hold"?T.amber:T.red} bg={(program.decision==="Scale"?T.green:program.decision==="Hold"?T.amber:T.red)+"18"}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9,marginBottom:16}}>
          {wave.map((w,i)=><div key={w.dept} style={{background:T.s3,border:`1px solid ${i===0?AI_GOLD+"45":T.border}`,borderRadius:10,padding:12}}>
            <div style={{fontSize:9,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>{T_("Wave")} {i+1}</div>
            <div style={{fontSize:13,color:T.ink,fontWeight:900,fontFamily:F.h,marginBottom:5}}>{T_(w.dept)}</div>
            <Tag label={T_(w.status)} color={i===0?AI_GOLD:w.status==="Queued"?T.green:T.ink3} bg={(i===0?AI_GOLD:w.status==="Queued"?T.green:T.ink3)+"18"}/>
            <div style={{marginTop:10}}><Bar value={w.score} color={i===0?AI_GOLD:w.score>=70?T.green:T.amber}/></div>
          </div>)}
        </div>
        <div style={{display:"grid",gap:8}}>
          {tasks.map(([label,owner,status,score,detail])=>{
            const col=status==="At Risk"||status==="Escalate"||status==="Incomplete"?T.red:status==="Ready"||status==="On Track"?T.green:AI_GOLD;
            return <div key={label} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 12px",display:"grid",gridTemplateColumns:"1fr 100px 90px 120px",gap:10,alignItems:"center"}}>
              <div><div style={{fontSize:12,color:T.ink,fontWeight:900,fontFamily:F.b}}>{T_(label)}</div><div style={{fontSize:9,color:T.ink3,fontFamily:F.b,marginTop:2}}>{T_(detail)}</div></div>
              <span style={{fontSize:10,color:T.ink2,fontFamily:F.b}}>{T_(owner)}</span>
              <Tag label={T_(status)} color={col} bg={col+"18"}/>
              <div><Bar value={score} color={col}/><div style={{fontSize:9,color:T.ink3,fontFamily:F.m,marginTop:4}}>{score}%</div></div>
            </div>;
          })}
        </div>
      </Card>
      <div style={{display:"grid",gap:12,alignContent:"start"}}>
        <Card style={{padding:16}}>
          <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:900,color:T.ink,margin:"0 0 12px"}}>{T_("Pilot control room")}</h3>
          {[["Risk drift",program.riskDrift,parseInt(program.riskDrift,10)>0?T.red:T.green],["Evidence confidence",program.evidence+"%",program.evidence>=80?T.green:T.amber],["Adoption",program.adoption+"%",program.adoption>=70?T.green:T.amber],["Value realized",program.value,AI_GOLD]].map(([l,v,col])=><div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
            <span style={{fontSize:11,color:T.ink3,fontFamily:F.b}}>{T_(l)}</span><strong style={{fontSize:13,color:col,fontFamily:F.m}}>{v}</strong>
          </div>)}
        </Card>
        <Card style={{padding:16,border:`1px solid ${program.decision==="Scale"?T.green+"40":T.amber+"40"}`}}>
          <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:900,color:T.ink,margin:"0 0 8px"}}>{T_("Next required action")}</h3>
          <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.65,margin:"0 0 12px"}}>{T_(program.blocker)}</p>
          <button onClick={()=>{program.decision==="Scale"?setInitTab("scalegate"):access.modules.includes("evidence")?setView("evidence"):setInitTab("implementation");}} style={{width:"100%",background:AI_GOLD+"18",border:`1px solid ${AI_GOLD}45`,borderRadius:8,padding:"9px 10px",color:AI_GOLD_INK,fontFamily:F.b,fontSize:11,fontWeight:900,cursor:"pointer"}}>{program.decision==="Scale"?T_("Open scale gate"):T_("Review evidence")}</button>
        </Card>
      </div>
    </div>;
  };

  const FeedbackPanel=()=>{
    const f=feedback[selected.id]||DEFAULT_FEEDBACK;
    const avg=feedbackAvg(f);
    const rec=feedbackDecision(f);
    const recColor=decisionColorOf(rec,T);
    const setDim=(k,v)=>setFeedback({...feedback,[selected.id]:{...f,[k]:v}});
    return <div style={{display:"grid",gridTemplateColumns:"1.15fr .85fr",gap:14}}>
      <Card style={{padding:18}}>
        <Tag label={T_("FEEDBACK ENGINE")} color={AI_GOLD} bg={AI_GOLD_L}/>
        <h3 style={{fontSize:17,color:T.ink,fontWeight:800,fontFamily:F.h,margin:"10px 0 4px"}}>{T_("Multi-stakeholder feedback")}</h3>
        <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.6,margin:"0 0 14px"}}>{T_("Every initiative collects feedback from the people who live with it. Scores roll up into a Scale / Continue / Improve / Retire recommendation that feeds the governed decision.")}</p>
        <div style={{display:"grid",gap:11}}>
          {FEEDBACK_DIMS.map(([k,label])=>{
            const v=f[k]??50;
            const c=k==="risk"?(v>=60?T.green:v>=40?T.amber:T.red):(v>=70?T.green:v>=50?T.amber:T.red);
            return <div key={k}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.ink2,fontFamily:F.b,marginBottom:5}}><span>{T_(label)}{k==="risk"?T_(" (higher = safer)"):""}</span><span style={{fontFamily:F.m,fontWeight:800,color:c}}>{v}</span></div>
              <input type="range" min={0} max={100} value={v} onChange={e=>setDim(k,parseInt(e.target.value,10))} style={{width:"100%",accentColor:AI_GOLD,cursor:"pointer"}}/>
            </div>;
          })}
        </div>
      </Card>
      <div style={{display:"grid",gap:12,alignContent:"start"}}>
        <Card style={{padding:16,border:`1px solid ${recColor}45`}}>
          <div style={{fontSize:10,color:T.ink3,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:8}}>{T_("Recommendation")}</div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
            <Ring score={avg} color={recColor} size={62}/>
            <div><div style={{fontSize:22,fontWeight:900,color:recColor,fontFamily:F.h}}>{T_(rec)}</div><div style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{T_("Composite")} {avg}/100</div></div>
          </div>
          <p style={{fontSize:10,color:T.ink4,fontFamily:F.b,lineHeight:1.6,margin:0}}>{rec==="Scale"?T_("Strong across stakeholders - ready for a governed scale decision."):rec==="Continue"?T_("Healthy - keep operating and monitoring."):rec==="Improve"?T_("Mixed signal - remediate before any scale decision."):T_("Weak or unsafe - a governed retirement decision is indicated.")}</p>
        </Card>
        <Card style={{padding:16}}>
          <div style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.7}}>{ar?<>التوصية استرشادية. لا يزال التنفيذي المسؤول يسجّل القرار المُحوكَم في <button onClick={()=>setInitTab("decision")} style={{background:"transparent",border:"none",color:rc,fontWeight:900,fontFamily:F.b,fontSize:11,cursor:"pointer",padding:0}}>توسيع / إيقاف</button>.</>:<>The recommendation is advisory. The accountable executive still records the governed decision in <button onClick={()=>setInitTab("decision")} style={{background:"transparent",border:"none",color:rc,fontWeight:900,fontFamily:F.b,fontSize:11,cursor:"pointer",padding:0}}>Scale / Retire</button>.</>}</div>
        </Card>
      </div>
    </div>;
  };

  const DecisionPanel=()=>{
    const existing=decisions[selected.id];
    const fRec=feedbackDecision(feedback[selected.id]||DEFAULT_FEEDBACK);
    const isTerminal=TERMINAL_LIFECYCLE.has(selected.lifecycle)||!!existing;
    const readiness=Math.round((selected.guardrail+selected.adoption+selected.valueScore)/3);
    const canScale=readiness>=70&&!selected.blockedBy;
    const signals=[
      ["Guardrail compliance",selected.guardrail,selected.guardrail>=80?T.green:selected.guardrail>=70?T.amber:T.red],
      ["Adoption",selected.adoption,selected.adoption>=70?T.green:T.amber],
      ["Business value",selected.valueScore,selected.valueScore>=75?T.green:T.amber],
      ["Composite readiness",readiness,readiness>=70?T.green:T.amber],
    ];
    return <div style={{display:"grid",gridTemplateColumns:"1.1fr .9fr",gap:14}}>
      <Card style={{padding:18}}>
        <Tag label={T_("GOVERNED DECISION")} color={AI_GOLD} bg={AI_GOLD_L}/>
        <h3 style={{fontSize:18,color:T.ink,fontWeight:800,fontFamily:F.h,margin:"10px 0 4px"}}>{ar?`توسيع أو إيقاف ${selected.name}`:`Scale or retire ${selected.name}`}</h3>
        <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.65,margin:"0 0 12px"}}>{T_("AI Central plans, governs and monitors every initiative, then makes an accountable decision to scale or retire it. Retirement always records a reason - an initiative is never retired silently.")}</p>
        <div style={{display:"flex",alignItems:"center",gap:9,background:decisionColorOf(fRec,T)+"12",border:`1px solid ${decisionColorOf(fRec,T)}35`,borderRadius:9,padding:"9px 12px",marginBottom:12}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:decisionColorOf(fRec,T),flexShrink:0}}/>
          <div style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.5}}>{T_("Feedback engine recommends")} <strong style={{color:decisionColorOf(fRec,T)}}>{T_(fRec)}</strong>. <button onClick={()=>setInitTab("feedback")} style={{background:"transparent",border:"none",color:rc,fontWeight:900,fontFamily:F.b,fontSize:11,cursor:"pointer",padding:0}}>{T_("Review feedback")}</button></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:9,marginBottom:8}}>
          {signals.map(([l,v,c])=><div key={l} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:11}}>
            <div style={{fontSize:9,color:T.ink3,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{T_(l)}</div>
            <Bar value={v} color={c}/><div style={{fontSize:12,color:T.ink,fontFamily:F.m,fontWeight:800,marginTop:6}}>{v}%</div>
          </div>)}
        </div>
        {selected.blockedBy&&!isTerminal&&<div style={{fontSize:11,color:T.amber,fontFamily:F.b,marginTop:4}}>{T_("Open blocker:")} {selected.blockedBy}. {T_("Resolve before scaling.")}</div>}
      </Card>
      <div style={{display:"grid",gap:12,alignContent:"start"}}>
        {existing?<Card style={{padding:16,border:`1px solid ${(existing.outcome==="Scale"?T.green:T.red)}45`}}>
          <Tag label={existing.outcome==="Scale"?T_("DECISION: SCALE"):T_("DECISION: RETIRE")} color={existing.outcome==="Scale"?T.green:T.red} bg={(existing.outcome==="Scale"?T.green:T.red)+"16"}/>
          <div style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.7,marginTop:10}}>
            {existing.reason&&<div><strong style={{color:T.ink}}>{T_("Reason:")}</strong> {existing.reason}</div>}
            {existing.rationale&&<div style={{marginTop:4}}><strong style={{color:T.ink}}>{T_("Rationale:")}</strong> {existing.rationale}</div>}
            <div style={{marginTop:4}}><strong style={{color:T.ink}}>{T_("Decided by:")}</strong> {existing.decidedBy} - {existing.at}</div>
          </div>
          <div style={{fontSize:10,color:T.ink4,fontFamily:F.b,marginTop:10}}>{T_("Recorded as a governed decision and captured in Trust & Evidence.")}</div>
        </Card>:<>
          <Card style={{padding:16,border:`1px solid ${T.green}35`}}>
            <h3 style={{fontSize:14,color:T.ink,fontWeight:800,margin:"0 0 6px"}}>{T_("Approve to scale")}</h3>
            <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.6,margin:"0 0 10px"}}>{T_("Readiness, evidence and value support expanding this initiative to the next wave.")}</p>
            <button disabled={!canScale} onClick={()=>decide("Scale")} style={{width:"100%",background:canScale?T.green:T.s3,border:`1px solid ${canScale?T.green:T.border}`,borderRadius:8,padding:"10px",color:canScale?"#fff":T.ink4,fontSize:12,fontWeight:900,fontFamily:F.b,cursor:canScale?"pointer":"not-allowed"}}>{canScale?T_("Approve to scale"):T_("Readiness below scale threshold")}</button>
          </Card>
          <Card style={{padding:16,border:`1px solid ${T.red}35`}}>
            <h3 style={{fontSize:14,color:T.ink,fontWeight:800,margin:"0 0 6px"}}>{T_("Retire initiative")}</h3>
            <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.6,margin:"0 0 10px"}}>{T_("Retirement is careful and accountable. Record why this AI initiative, agent or AIMS is being retired.")}</p>
            <label style={{display:"grid",gap:5,marginBottom:9}}>
              <span style={{fontSize:9,fontWeight:900,fontFamily:F.m,letterSpacing:"0.1em",textTransform:"uppercase",color:T.ink4}}>{T_("Retirement reason")}</span>
              <select value={retireDraft.reason} onChange={e=>setRetireDraft({...retireDraft,reason:e.target.value})} style={{...fieldStyle,cursor:"pointer"}}>
                {RETIREMENT_REASONS.map(r=><option key={r} value={r}>{T_(r)}</option>)}
              </select>
            </label>
            <label style={{display:"grid",gap:5,marginBottom:10}}>
              <span style={{fontSize:9,fontWeight:900,fontFamily:F.m,letterSpacing:"0.1em",textTransform:"uppercase",color:T.ink4}}>{T_("Rationale")}</span>
              <textarea value={retireDraft.rationale} onChange={e=>setRetireDraft({...retireDraft,rationale:e.target.value})} rows={3} placeholder={T_("Evidence and context for the retirement decision")} style={{...fieldStyle,resize:"vertical",lineHeight:1.5}}/>
            </label>
            <button disabled={!retireDraft.rationale.trim()} onClick={()=>decide("Retire",retireDraft.reason,retireDraft.rationale.trim())} style={{width:"100%",background:retireDraft.rationale.trim()?T.red:T.s3,border:`1px solid ${retireDraft.rationale.trim()?T.red:T.border}`,borderRadius:8,padding:"10px",color:retireDraft.rationale.trim()?"#fff":T.ink4,fontSize:12,fontWeight:900,fontFamily:F.b,cursor:retireDraft.rationale.trim()?"pointer":"not-allowed"}}>{T_("Record retirement decision")}</button>
          </Card>
        </>}
      </div>
    </div>;
  };

  /* ── Initiative context tabs: derived views over the initiative's own
        data. Risks are owned here and aggregated by Risk Center. ── */
  /* Risk lives in the Risk Center. AI Central shows only count, highest,
     trend and status - clicking opens the register scoped to this initiative. */
  const renderRiskSummary=()=>{
    const rows=riskRegister.filter(r=>r.initiativeId===selected.id);
    const worst=[...rows].sort((a,b)=>b.residual-a.residual)[0];
    const inTreatment=rows.filter(r=>r.treatment.status!=="Complete").length;
    const lvC=l=>l==="Critical"?T.red:l==="High"?T.amber:l==="Medium"?T.blue:T.green;
    return <Card style={{padding:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h3 style={{fontSize:15,color:T.ink,fontWeight:800,margin:0}}>{T_("Risk summary")}</h3>
        <button onClick={()=>setTab&&setTab("riskcenter")} style={{background:T.red+"14",border:`1px solid ${T.red}40`,borderRadius:7,padding:"5px 11px",color:T.red,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>{T_("Open Risk Center →")}</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10}}>
        {[["Registered risks",rows.length,rows.length?T.amber:T.green],
          ["Highest residual",worst?`${worst.residual}/25`:T_("none"),worst?lvC(worst.level):T.green],
          ["Trend",selected.blockedBy?T_("Blocked"):T_("Within appetite"),selected.blockedBy?T.red:T.green],
          ["In treatment",inTreatment,inTreatment?T.blue:T.green]].map(([l,v,c])=>
          <button key={l} onClick={()=>setTab&&setTab("riskcenter")} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px",cursor:"pointer",textAlign:"left"}}>
            <div style={{fontSize:9,color:T.ink3,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5}}>{T_(l)}</div>
            <div style={{fontSize:16,fontWeight:900,fontFamily:F.m,color:c}}>{v}</div>
          </button>)}
      </div>
      {worst&&<div style={{fontSize:10,color:T.ink3,fontFamily:F.b,marginTop:10}}>{T_("Most severe:")} {worst.id} "{worst.title}" ({T_(worst.level)}) - {T_("treatment")} {worst.treatment.status.toLowerCase()} {T_("with")} {worst.treatment.owner}.</div>}
      {selected.blockedBy&&<div style={{background:T.redL,border:`1px solid ${T.red}40`,borderRadius:9,padding:"10px 13px",fontSize:11,color:T.ink2,fontFamily:F.b,marginTop:10}}><strong style={{color:T.red}}>{T_("Open blocker:")}</strong> {selected.blockedBy}</div>}
    </Card>;};
  const InitEvidence=()=>{
    const rows=evidenceRows.filter(e=>e.initiative===selected.name);
    return <Card style={{padding:0,overflow:"hidden"}}>
      <div style={{padding:"14px 18px",borderBottom:"1px solid "+T.border,display:"flex",justifyContent:"space-between",alignItems:"center"}}><h3 style={{margin:0,fontSize:14,color:T.ink}}>{T_("Evidence for this initiative")}</h3><Tag label={`${rows.length} ${T_("records")}`} color={AI_GOLD} bg={AI_GOLD+"16"}/></div>
      {rows.length===0&&<div style={{padding:"18px",fontSize:11,color:T.ink3,fontFamily:F.b}}>{T_("No evidence yet - completed phase artifacts and decisions will appear here automatically.")}</div>}
      {rows.map((e,ri)=><div key={`${e.item}-${e.time}-${ri}`} style={{display:"grid",gridTemplateColumns:"1.3fr 1fr auto",gap:12,padding:"12px 18px",borderBottom:"1px solid "+T.border,alignItems:"center"}}>
        <div><div style={{fontSize:12,color:T.ink,fontWeight:700}}>{e.item}</div><div style={{fontSize:9,color:T.ink3}}>{T_("Control:")} {e.control}</div></div>
        <span style={{fontSize:10,color:T.ink2}}>{T_("Owner:")} {e.owner}</span>
        <div style={{display:"flex",gap:6}}><STag s={e.status}/><STag s={e.approval}/></div>
      </div>)}
      <div style={{padding:"10px 18px"}}><button onClick={()=>setView("evidence")} style={{background:"transparent",border:"none",color:AI_GOLD_INK,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer",padding:0}}>{T_("Open evidence →")}</button></div>
    </Card>;
  };
  const InitControls=()=><Card style={{padding:16}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <h3 style={{fontSize:15,color:T.ink,fontWeight:800,margin:0}}>{T_("Activated controls & policies")}</h3>
      <Ring score={selected.guardrail} color={selected.guardrail>=80?T.green:T.amber} size={44}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <div>
        <div style={{fontSize:9,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>{T_("Controls")}</div>
        {selected.controls.length?selected.controls.map(c=><div key={c} style={{display:"flex",gap:8,alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}><span style={{width:7,height:7,borderRadius:"50%",background:T.green}}/><span style={{fontSize:11,color:T.ink2,fontFamily:F.m}}>{c}</span></div>):<div style={{fontSize:11,color:T.ink3,fontFamily:F.b}}>{T_("No controls activated yet - assigned in the Design phase.")}</div>}
      </div>
      <div>
        <div style={{fontSize:9,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>{T_("Policies")}</div>
        {selected.policies.length?selected.policies.map(c=><div key={c} style={{display:"flex",gap:8,alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}><span style={{width:7,height:7,borderRadius:"50%",background:T.blue}}/><span style={{fontSize:11,color:T.ink2,fontFamily:F.b}}>{c}</span></div>):<div style={{fontSize:11,color:T.ink3,fontFamily:F.b}}>{T_("No policies mapped yet.")}</div>}
      </div>
    </div>
    <button onClick={()=>setView("governance")} style={{marginTop:12,background:"transparent",border:"none",color:AI_GOLD_INK,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer",padding:0}}>{T_("Review controls →")}</button>
  </Card>;
  const InitApprovals=()=><Card style={{padding:16}}>
    <h3 style={{fontSize:15,color:T.ink,fontWeight:800,margin:"0 0 12px"}}>{T_("Phase approvals")}</h3>
    <div style={{display:"grid",gap:7}}>
      {AC_PHASES.map((ph,idx)=>{
        const st=idx<selected.phaseIndex?"Approved":idx===selected.phaseIndex?(selected.blockedBy?"Blocked":"In review"):"Pending";
        const c=st==="Approved"?T.green:st==="Blocked"?T.red:st==="In review"?T.amber:T.ink4;
        return <div key={ph.id} style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:12,alignItems:"center",background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"9px 12px"}}>
          <span style={{fontSize:11,color:T.ink,fontWeight:700,fontFamily:F.b}}>{T_("Phase")} {ph.order}: {T_(ph.name)}</span>
          <span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{T_("Accountable:")} {ph.raci.accountable}</span>
          <Tag label={T_(st)} color={c} bg={c+"16"}/>
        </div>;
      })}
    </div>
    <div style={{fontSize:10,color:T.ink4,fontFamily:F.b,marginTop:10}}>{T_("Human-in-the-loop items for this initiative appear in the Decisions queue.")}</div>
  </Card>;
  const InitROI=()=><Card style={{padding:16}}>
    <h3 style={{fontSize:15,color:T.ink,fontWeight:800,margin:"0 0 12px"}}>{T_("Return on investment")}</h3>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10,marginBottom:12}}>
      {[["Expected ROI",selected.roi,T.green],["Value realized",`${selected.actual} / ${selected.expected}`,AI_GOLD],["Cost savings",selected.savings,T.green],["Revenue impact",selected.revenue,T.teal],["Productivity",selected.productivity,T.blue]].map(([l,v,c])=><div key={l} style={{background:T.s3,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px"}}>
        <div style={{fontSize:9,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:900,fontFamily:F.m,marginBottom:6}}>{T_(l)}</div>
        <div style={{fontSize:17,fontWeight:900,fontFamily:F.m,color:c}}>{v}</div>
      </div>)}
    </div>
    <Bar value={selected.valueScore} color={selected.valueScore>80?T.green:T.amber}/>
    <div style={{fontSize:10,color:T.ink3,fontFamily:F.b,marginTop:6}}>{T_("Business value score")} {selected.valueScore}% - {T_("feeds the Value Center and the scale decision.")}</div>
  </Card>;
  const InitAdoption=()=><Card style={{padding:16}}>
    <h3 style={{fontSize:15,color:T.ink,fontWeight:800,margin:"0 0 12px"}}>{T_("Adoption & workforce readiness")}</h3>
    <div style={{display:"flex",gap:18,alignItems:"center",marginBottom:14,flexWrap:"wrap"}}>
      <Ring score={selected.adoption} color={selected.adoption>=70?T.green:T.amber} size={72}/>
      <div style={{flex:1,minWidth:220}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.ink2,fontFamily:F.b,marginBottom:5}}><span>{T_("Training completion")}</span><span style={{fontFamily:F.m}}>{selected.training}</span></div>
        <Bar value={parseInt(selected.training)||0} color={(parseInt(selected.training)||0)>75?T.green:T.amber}/>
        <div style={{marginTop:10}}><Tag label={`${T_("Resistance:")} ${T_(selected.resistance)}`} color={selected.resistance==="High"?T.red:selected.resistance==="Medium"?T.amber:T.green} bg={(selected.resistance==="High"?T.red:selected.resistance==="Medium"?T.amber:T.green)+"14"}/></div>
      </div>
    </div>
    <button onClick={()=>{setView("academy");}} style={{background:"transparent",border:"none",color:AI_GOLD_INK,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer",padding:0}}>{T_("Assign learning in Governance Academy →")}</button>
  </Card>;
  const InitLessons=()=>{
    const linked=knowledgeAssets.filter(k=>k.sourceRef.includes(selected.id)||k.title.toLowerCase().includes(selected.name.split(" ")[0].toLowerCase()));
    return <Card style={{padding:16}}>
      <h3 style={{fontSize:15,color:T.ink,fontWeight:800,margin:"0 0 6px"}}>{T_("Lessons learned")}</h3>
      <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.6,margin:"0 0 12px"}}>{T_("Knowledge captured from this initiative feeds the enterprise Knowledge Engine and every future rollout. Formal knowledge capture is a mandatory artifact of the Scale or Retire phase.")}</p>
      {linked.length?linked.map(k=><div key={k.id} style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:12,alignItems:"center",background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px",marginBottom:7}}>
        <div><div style={{fontSize:12,color:T.ink,fontWeight:700,fontFamily:F.b}}>{k.title}</div><div style={{fontSize:9,color:T.ink3}}>{k.sourceRef}</div></div>
        <Tag label={T_(k.kind)} color={T.blue} bg={T.blue+"14"}/>
        <span style={{fontSize:10,color:AI_GOLD_INK,fontFamily:F.m,fontWeight:800}}>{k.reuseCount} {T_("reuses")}</span>
      </div>):<div style={{fontSize:11,color:T.ink3,fontFamily:F.b,background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"12px"}}>{T_("No knowledge captured from this initiative yet - it is generated at the Scale/Retire gate.")}</div>}
    </Card>;
  };

  /* ── AI Initiative Workspace: Mission Control ─────────────────
     Six tabs, one business object. Everything below derives from the
     selected initiative record and its linked register, feedback,
     assessment and evidence data. */
  const wsRisks=riskRegister.filter(r=>r.initiativeId===selected.id);
  const wsFb=feedback[selected.id]||DEFAULT_FEEDBACK;
  const wsRec=feedbackDecision(wsFb);
  const wsRecC=decisionColorOf(wsRec,T);
  const wsHealth=Math.round((selected.guardrail+selected.adoption+selected.valueScore)/3);
  const wsRiskScore=wsRisks.length?Math.max(...wsRisks.map(r=>r.residual)):0;
  const wsEvidence=phaseProgress(selected);
  const money=v=>parseFloat(String(v).replace(/[^0-9.]/g,""))||0;
  const wsRoiPct=Math.min(100,Math.round((money(selected.actual)/(money(selected.expected)||1))*100));
  const wsPhase=AC_PHASES[selected.phaseIndex];
  const wsMissing=wsPhase?wsPhase.deliverables.slice(selected.phaseArtifactsDone):[];
  const wsApprovalsLeft=wsMissing.filter(d=>/approval|decision|sign-off/i.test(d));
  const wsCrit=wsRisks.filter(r=>r.level==="Critical"||r.level==="High");
  const wsRemainingPhases=AC_PHASES.length-selected.phaseIndex;
  const wsNextAction=selected.blockedBy?`Resolve the blocker: ${selected.blockedBy}`:wsMissing.length?`Complete "${wsMissing[0]}" in ${wsPhase.name}`:`Advance to ${AC_PHASES[selected.phaseIndex+1]?.name||"the scale gate"}`;
  const wsConfidence=Math.min(98,Math.round((wsEvidence+selected.guardrail)/2));
  const wsBriefing=()=>{
    const L=["# Executive Briefing - "+selected.name,"",`${selected.unit} · ${selected.category} · Sponsor ${selected.sponsor}`,"",
      "## Where it stands",`- Phase: ${selected.phaseIndex+1}/${AC_PHASES.length} (${wsPhase?.name}) - ${wsEvidence}% evidence complete`,
      `- Overall health ${wsHealth}/100 · governance ${selected.guardrail}% · adoption ${selected.adoption}% · business value ${selected.valueScore}%`,
      `- Risk: ${selected.risk} inherent; worst residual ${wsRiskScore}/25 across ${wsRisks.length} registered risks`,
      `- Value: ${selected.actual} realized of ${selected.expected} expected (${wsRoiPct}%) · ROI ${selected.roi}`,"",
      "## Blockers & approvals",selected.blockedBy?`- BLOCKED: ${selected.blockedBy}`:"- No open blockers",
      ...wsApprovalsLeft.map(a=>`- Approval outstanding: ${a}`),"",
      "## Top risks",...wsRisks.slice(0,4).map(r=>`- ${r.id} ${r.title} (${r.level}) - treatment ${r.treatment.status}`),"",
      "## Recommendation",`- Veris Intelligence recommends: **${wsRec}** (confidence ${wsConfidence}%)`,
      `- Next action: ${wsNextAction}`,
      `- Estimated completion: ~${wsRemainingPhases*3} weeks at current cadence (${wsRemainingPhases} phases remaining)`];
    vzDownload(`briefing-${selected.id}.md`,L.join("\n"));
    showToast&&showToast("Executive briefing generated from live initiative data");
  };
  /* One Executive Summary Header: four hero metrics as typography, one
     primary recommendation. Everything else lives inside the tabs. */
  const renderExecHeader=(compact)=>{
    const heroes=[
      ["Health",String(wsHealth),wsHealth>=80?T.green:wsHealth>=60?T.amber:T.red,"overview",`(governance ${selected.guardrail} + adoption ${selected.adoption} + value ${selected.valueScore}) / 3`],
      ["Business value",selected.expected,AI_GOLD,"value","Expected value from the approved business case"],
      ["Risk",wsRiskScore?`${wsRiskScore}/25`:T_(selected.risk),wsRiskScore>=10?T.red:wsRiskScore>=6?T.amber:T.green,"governance","Worst residual risk: likelihood x impact out of 25"],
      ["Phase",`${selected.phaseIndex+1} ${T_("of")} ${AC_PHASES.length}`,T.blue,"journey","Position in the 13-phase governed lifecycle"],
    ];
    return <div style={{margin:"2px 0 18px"}}>
      <div style={{display:"flex",gap:10,alignItems:"baseline",flexWrap:"wrap"}}>
        <h2 style={{fontFamily:F.h,fontSize:24,fontWeight:800,color:T.ink,margin:0,letterSpacing:"-0.02em"}}>{selected.name}</h2>
        <Tag label={T_(selected.lifecycle)} color={catColor(selected.lifecycle)} bg={catColor(selected.lifecycle)+"14"}/>
      </div>
      <div style={{fontSize:11,color:T.ink3,fontFamily:F.b,marginTop:4}}>{selected.unit} · {T_(selected.category)} · {ar?"الراعي":"Sponsor"} {selected.sponsor}</div>
      {!compact&&<div style={{display:"flex",gap:28,flexWrap:"wrap",margin:"16px 0 0"}}>
        {heroes.map(([l,v,c,tabTo,how])=><button key={l} onClick={()=>setInitTab(tabTo)} title={how} style={{background:"transparent",border:"none",padding:0,cursor:"pointer",textAlign:"left"}}>
          <div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:3}}>{T_(l)}</div>
          <div style={{fontSize:22,fontWeight:900,fontFamily:F.m,color:c,lineHeight:1}}>{v}</div>
        </button>)}
        <button onClick={()=>setInitTab("value")} style={{marginLeft:"auto",alignSelf:"center",background:wsRecC+"10",border:`1px solid ${wsRecC}35`,borderRadius:9,padding:"9px 14px",cursor:"pointer",textAlign:"left"}}>
          <div style={{fontSize:8.5,color:wsRecC,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:2}}>{T_("Primary recommendation")}</div>
          <div style={{fontSize:13,fontWeight:900,fontFamily:F.b,color:wsRecC}}>{wsRec==="Scale"?T_("Continue to Scale Gate"):wsRec==="Retire"?T_("Prepare governed retirement"):wsRec==="Improve"?T_("Address gaps before advancing"):T_("Continue current phase")} · {wsConfidence}%</div>
        </button>
      
      </div>}
    </div>;
  };
  const InitJourney=()=><div>
    <Card style={{padding:16,marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
        <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:800,color:T.ink,margin:0}}>{T_("Mission timeline")}</h3>
        <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{ar?`~${wsRemainingPhases*3} أسبوعاً للإكمال بالوتيرة الحالية · ${wsRemainingPhases} مراحل متبقّية`:`~${wsRemainingPhases*3} weeks to completion at current cadence · ${wsRemainingPhases} phases remaining`}</span>
      </div>
      <div style={{display:"flex",gap:0,alignItems:"flex-start",flexWrap:"wrap",marginBottom:14}}>
        {AC_PHASES.map((ph,idx)=>{
          const state=idx<selected.phaseIndex?"done":idx===selected.phaseIndex?"active":"next";
          const c=state==="done"?T.green:state==="active"?AI_GOLD:T.ink4;
          return <div key={ph.id} style={{display:"flex",alignItems:"center"}}>
            <div style={{textAlign:"center",width:74}}>
              <div style={{width:state==="active"?26:18,height:state==="active"?26:18,borderRadius:"50%",margin:"0 auto",background:state==="done"?T.green:state==="active"?AI_GOLD+"22":"transparent",border:`2px solid ${c}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:state==="active"?10:8,fontWeight:900,color:state==="done"?"#fff":c,boxShadow:state==="active"?`0 0 16px ${AI_GOLD}55`:"none"}}>{state==="done"?"✓":idx+1}</div>
              <div style={{fontSize:8,color:state==="active"?AI_GOLD:T.ink4,fontFamily:F.m,fontWeight:state==="active"?900:600,marginTop:4}}>{T_(ph.name)}</div>
            </div>
            {idx<AC_PHASES.length-1&&<div style={{width:10,height:2,background:idx<selected.phaseIndex?T.green:T.border,marginTop:-12}}/>}
          </div>;
        })}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:10}}>
        <div style={{background:selected.blockedBy?T.redL:T.s2,border:`1px solid ${selected.blockedBy?T.red+"40":T.border}`,borderRadius:9,padding:"11px 13px"}}>
          <div style={{fontSize:8.5,fontWeight:900,color:selected.blockedBy?T.red:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>{T_("Current blockers")}</div>
          <div style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.55}}>{selected.blockedBy||T_("None - the phase gate is clear.")}</div>
        </div>
        <div style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"11px 13px"}}>
          <div style={{fontSize:8.5,fontWeight:900,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>{T_("Remaining approvals")}</div>
          <div style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.55}}>{wsApprovalsLeft.length?wsApprovalsLeft.join(" · "):T_("None in this phase.")}</div>
        </div>
        <div style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"11px 13px"}}>
          <div style={{fontSize:8.5,fontWeight:900,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>{T_("Missing evidence")} ({wsMissing.length})</div>
          <div style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.55}}>{wsMissing.length?wsMissing.join(" · "):T_("Phase artifacts complete.")}</div>
        </div>
        <div style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"11px 13px"}}>
          <div style={{fontSize:8.5,fontWeight:900,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>{T_("Critical risks")}</div>
          <div style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.55}}>{wsCrit.length?wsCrit.map(r=>r.id).join(", ")+(ar?" - افتح تبويب المخاطر":" - open the Risk tab"):T_("None above appetite.")}</div>
        </div>
      </div>
      <button onClick={()=>{if(selected.blockedBy)setInitTab("risk");else setInitTab("evidence");}} style={{marginTop:12,background:AI_GOLD+"16",border:`1px solid ${AI_GOLD}45`,borderRadius:8,padding:"10px 14px",color:AI_GOLD_INK,fontSize:11,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>{T_("Next action:")} {wsNextAction} →</button>
    </Card>
    <Implementation/>
  </div>;
  const InitEvidenceTimeline=()=><div>
    <Card style={{padding:"13px 16px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap"}}>
      <div>
        <div style={{fontSize:9,fontWeight:900,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>{T_("Audit readiness")}</div>
        <div style={{fontSize:22,fontWeight:900,fontFamily:F.m,color:wsEvidence>=70?T.green:T.amber}}>{wsEvidence}%</div>
      </div>
      <div style={{flex:"1 1 260px"}}><Bar value={wsEvidence} color={wsEvidence>=70?T.green:T.amber}/></div>
      <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{T_("Evidence completeness across the lifecycle - missing artifacts highlighted below")}</span>
    </Card>
    <div style={{display:"grid",gap:8,marginBottom:12}}>
      {AC_PHASES.map((ph,idx)=>{
        const state=idx<selected.phaseIndex?"done":idx===selected.phaseIndex?"active":"next";
        if(state==="next"&&idx>selected.phaseIndex+1)return null;
        const doneCount=state==="done"?ph.deliverables.length:state==="active"?selected.phaseArtifactsDone:0;
        const c=state==="done"?T.green:state==="active"?AI_GOLD:T.ink4;
        return <Card key={ph.id} style={{padding:"12px 15px",borderLeft:`3px solid ${c}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,gap:8,flexWrap:"wrap"}}>
            <span style={{fontSize:12,fontWeight:800,color:T.ink,fontFamily:F.b}}>{idx+1}. {T_(ph.name)}</span>
            <span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{doneCount}/{ph.deliverables.length} {T_("artifacts")} · {ar?"المالك":"owner"} {ph.raci.responsible}</span>
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {ph.deliverables.map((d,di)=>{
              const has=di<doneCount;
              return <button key={d} onClick={()=>{if(has){setView("evidence");}else{setInitTab("journey");}}} title={has?T_("Open in Trust & Evidence"):T_("Missing - complete in the Journey")} style={{background:has?T.green+"12":T.red+"0d",border:`1px solid ${has?T.green+"40":T.red+"35"}`,borderRadius:6,padding:"3px 9px",color:has?T.green:T.red,fontSize:9.5,fontWeight:800,fontFamily:F.m,cursor:"pointer"}}>{has?"✓":"!"} {T_(d)}</button>;
            })}
          </div>
        </Card>;
      })}
    </div>
    <InitEvidence/>
  </div>;
  const InitInsights=()=><div>
    <Card style={{padding:16,marginBottom:12,border:`1px solid ${wsRecC}40`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:AI_GOLD,boxShadow:`0 0 12px ${AI_GOLD}`,animation:"pulse 2.4s infinite"}}/>
          <span style={{fontSize:9,fontWeight:900,color:AI_GOLD_INK,textTransform:"uppercase",letterSpacing:"0.14em",fontFamily:F.m}}>{T_("Veris Intelligence · Executive Advisor")}</span>
        </div>
        <button onClick={wsBriefing} style={{background:AI_GOLD,border:"none",borderRadius:8,padding:"9px 14px",color:"#111",fontSize:11,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>{T_("Generate Executive Briefing ↓")}</button>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,flexWrap:"wrap"}}>
        <Tag label={`${ar?"التوصية":"Recommend"}: ${T_(wsRec)}`} color={wsRecC} bg={wsRecC+"16"}/>
        <Tag label={`${T_("confidence")} ${wsConfidence}%`} color={T.blue} bg={T.blue+"14"}/>
        <span style={{fontSize:9,color:T.green,fontFamily:F.m,fontWeight:900}}>{ar?"المصدر: داخلي - سجل المبادرة، السجل، محرّك التغذية الراجعة، أدلة المرحلة":"SOURCE: INTERNAL - initiative record, register, feedback engine, phase evidence"}</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:10}}>
        {[["Reason",`Stakeholder feedback averages ${Math.round(Object.values(wsFb).reduce((a,b)=>a+b,0)/7)}/100 with risk scored ${wsFb.risk}/100; governance ${selected.guardrail}% and adoption ${selected.adoption}% ${wsRec==="Scale"?"clear":"do not yet clear"} the gate thresholds.`],
          ["Supporting evidence",`${wsEvidence}% lifecycle evidence complete through ${wsPhase?.name}; controls ${selected.controls.join(", ")}; policies ${selected.policies.join(", ")}.`],
          ["Business value",`${selected.actual} realized of ${selected.expected} expected (${wsRoiPct}%). ROI ${selected.roi}, productivity ${selected.productivity}.`],
          ["Risk impact",wsRisks.length?`${wsRisks.length} registered risks; worst residual ${wsRiskScore}/25 (${wsRisks[0].id}). ${wsCrit.length?wsCrit.length+" above appetite.":"All within appetite."}`:"No registered risks."],
          ["Expected outcome",wsRec==="Scale"?`Expansion unlocks the remaining ${(money(selected.expected)-money(selected.actual)).toFixed(1)}M of expected value.`:wsRec==="Retire"?"Retirement frees budget and removes unrewarded risk exposure.":`Continuing the current phase protects ${selected.expected} of expected value while gaps close.`],
          ["Decision required",wsRec==="Scale"||wsRec==="Retire"?`Record the ${wsRec} decision below - it will mint an audit-grade decision record.`:"No gate decision required yet - clear the next action in the Journey."],
        ].map(([l,v])=><div key={l} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px"}}>
          <div style={{fontSize:8.5,fontWeight:900,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>{T_(l)}</div>
          <div style={{fontSize:10.5,color:T.ink2,fontFamily:F.b,lineHeight:1.6}}>{v}</div>
        </div>)}
      </div>
    </Card>
    <PageAISpine mode="scalegate" setTab={setTab} focus={selected}/>
    <div style={{marginTop:12}}><DecisionPanel/></div>
    <div style={{marginTop:12}}><FeedbackPanel/></div>
    <div style={{marginTop:12}}><InitLessons/></div>
  </div>;
  const WS_LEGACY={list:"overview",implementation:"journey",risks:"governance",risk:"governance",controls:"governance",approvals:"governance",pilot:"monitoring",evidence:"monitoring",roi:"value",adoption:"value",feedback:"value",lessons:"value",insights:"value",decision:"value",scalegate:"value"};
  const wsTab=WS_LEGACY[initTab]||initTab;
  /* ── Veris Intelligence rail (RIGHT pane): context for the selected initiative ── */
  const renderIntelRail=()=>{
    const f=acFeedback[selected.id]||DEFAULT_FEEDBACK;
    const recD=feedbackDecision(f);
    const conf=feedbackAvg(f);
    const recC=decisionColorOf(recD,T);
    const activity=evidenceRows.filter(e=>e.initiative===selected.name).slice(0,3);
    const secHead=t=><div style={{fontSize:9,fontWeight:900,fontFamily:F.m,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:7}}>{T_(t)}</div>;
    const divider=<div style={{height:1,background:`linear-gradient(90deg,${AI_GOLD}30,transparent)`,margin:"15px 0"}}/>;
    /* The Executive Advisor is visually distinct from the rest of the
       interface: gold spine, soft gradient, typographic sections. */
    return <div style={{alignSelf:"start",background:`linear-gradient(165deg,${AI_GOLD}0a,${T.s1}99 40%)`,borderLeft:`2px solid ${AI_GOLD}55`,borderRadius:"4px 12px 12px 4px",padding:"16px 15px"}}>
      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:13}}>
        <span style={{width:8,height:8,borderRadius:"50%",background:AI_GOLD,animation:"pulse 2s infinite"}}/>
        <span style={{fontSize:11.5,fontWeight:900,fontFamily:F.h,color:T.ink}}>Veris Intelligence</span>
        <span style={{fontSize:8.5,fontWeight:900,fontFamily:F.m,color:AI_GOLD_INK,textTransform:"uppercase",letterSpacing:"0.1em",marginLeft:"auto"}}>{T_(
          /* The advisor's persona follows the context being viewed. */
          (!profileMode&&buildPerspective())?buildPerspective().persona
          :wsTab==="value"?"Financial Advisor"
          :wsTab==="governance"?"Governance Advisor"
          :wsTab==="journey"||wsTab==="pmo"?"Delivery Advisor"
          :wsTab==="monitoring"?"Auditor"
          :"Executive Advisor")}</span>
      </div>
      {secHead("Executive brief")}
      <p style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.65,margin:0}}>{selected.name} is in {AC_PHASES[selected.phaseIndex]?.name} (phase {selected.phaseIndex+1}/{AC_PHASES.length}) delivering {selected.actual} of {selected.expected} expected.{phaseSel!=null&&phaseSel!==selected.phaseIndex?` You are reviewing ${AC_PHASES[phaseSel]?.name} (${phaseSel<selected.phaseIndex?"complete":"not started"}).`:""} {selected.blockedBy?`Progress is blocked: ${selected.blockedBy}.`:`No open blockers; adoption is at ${selected.adoption}%.`}</p>
      {divider}
      {secHead("Program analysis")}
      {(()=>{
        const money=v=>parseFloat(String(v).replace(/[^0-9.]/g,""))||0;
        const totalExp=acInitiatives.reduce((a,i)=>a+money(i.expected),0);
        const share=Math.round((money(selected.expected)/totalExp)*100);
        const remaining=AC_PHASES.length-selected.phaseIndex;
        const weeks=remaining*3+(selected.blockedBy?2:0);
        const eta=new Date();eta.setDate(eta.getDate()+weeks*7);
        const etaLabel=eta.toLocaleDateString("en-GB",{month:"short",year:"numeric"});
        return <div style={{display:"grid",gap:6,fontSize:10,color:T.ink2,fontFamily:F.b,lineHeight:1.55}}>
          <div><strong style={{color:T.ink}}>{T_("Portfolio impact:")}</strong> {share}% {T_("of enterprise AI value")} ({selected.expected} {T_("of")} ${totalExp.toFixed(1)}M).</div>
          <div><strong style={{color:T.ink}}>{T_("Financial impact:")}</strong> ${(money(selected.expected)-money(selected.actual)).toFixed(1)}M {ar?"غير مُحقَّقة؛":"unrealized;"} {selected.spent||"—"} {T_("of")} {selected.budget||"—"} {ar?"من الميزانية مُستهلَك":"budget consumed"}.</div>
          <div><strong style={{color:T.ink}}>{T_("Blockers:")}</strong> {selected.blockedBy||(ar?"لا شيء مفتوح":"none open")}.</div>
          <div><strong style={{color:T.ink}}>{T_("Delay prediction:")}</strong> {selected.blockedBy?(ar?"~أسبوعان انزلاق إذا استمر العائق بعد هذا السباق":"~2 weeks slip if the blocker holds past this sprint"):(ar?"في الموعد بالوتيرة الحالية":"on schedule at current cadence")}.</div>
          <div><strong style={{color:T.ink}}>{T_("Predicted completion:")}</strong> ~{etaLabel} ({remaining} {ar?"مراحل متبقّية":"phases remaining"}).</div>
        </div>;
      })()}
      {divider}
      {secHead("Recommendation")}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <Tag label={T_(recD)} color={recC} bg={recC+"16"}/>
        <span style={{fontSize:10,fontFamily:F.m,fontWeight:900,color:T.ink3}}>{T_("confidence")} {wsConfidence}%</span>
      </div>
      <div style={{display:"grid",gap:6,fontSize:10,color:T.ink2,fontFamily:F.b,lineHeight:1.55}}>
        <div><strong style={{color:T.ink}}>{T_("Reason:")}</strong> {ar?"الحوكمة":"governance"} {selected.guardrail}%, {ar?"التبنّي":"adoption"} {selected.adoption}%, {ar?"درجة القيمة":"value score"} {selected.valueScore}%.</div>
        <div><strong style={{color:T.ink}}>{T_("Business impact:")}</strong> {selected.expected} {ar?"قيمة متوقّعة؛":"expected value;"} {selected.actual} {ar?"مُحقَّقة حتى الآن":"realized to date"}.</div>
        <div><strong style={{color:T.ink}}>{T_("Evidence:")}</strong> {ar?"أدلة المرحلة حتى":"phase artifacts through"} {T_(AC_PHASES[selected.phaseIndex]?.name)}; {ar?"الضوابط":"controls"} {selected.controls.join(", ")||T_("pending")}.</div>
      </div>
      <button onClick={()=>setInitTab("value")} style={{marginTop:11,width:"100%",background:recC+"12",border:`1px solid ${recC}40`,borderRadius:7,padding:"7px 10px",color:recC,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>{T_("Recommended action: review in Value →")}</button>
      {(pending>0||recD==="Scale"||recD==="Retire")&&<>
        {divider}
        {secHead("Pending approvals")}
        <div style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.55,marginBottom:8}}>{ar?<>{pending} موافقة بانتظار مراجعة تنفيذية{(recD==="Scale"||recD==="Retire")?` - بما في ذلك قرار ${T_(recD)} مُحوكَم على هذه المبادرة`:""}.</>:<>{pending} approval{pending===1?"":"s"} await{pending===1?"s":""} executive review{(recD==="Scale"||recD==="Retire")?` - including a governed ${recD} decision on this initiative`:""}.</>}</div>
        <button onClick={()=>setTab&&setTab("decisions")} style={{width:"100%",background:AI_GOLD+"12",border:`1px solid ${AI_GOLD}40`,borderRadius:7,padding:"7px 10px",color:AI_GOLD_INK,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>{T_("Review approvals →")}</button>
      </>}
      {divider}
      {secHead("Suggested next actions")}
      <div style={{display:"grid",gap:6,marginBottom:2}}>
        {[[wsNextAction.length>46?wsNextAction.slice(0,46)+"…":wsNextAction,()=>setInitTab("journey")],
          ["Review phase evidence",()=>setInitTab("journey")],
          ["Check execution plan in AI PMO",()=>setInitTab("pmo")]].map(([l,go])=><button key={l} onClick={go} style={{textAlign:"left",background:T.s2,border:`1px solid ${T.border}`,borderRadius:7,padding:"7px 10px",color:T.ink2,fontSize:10,fontWeight:700,fontFamily:F.b,cursor:"pointer"}}>{T_(l)} →</button>)}
      </div>
      {divider}
      {secHead("Recent activity")}
      {activity.length===0&&<div style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{T_("No recorded activity yet - completed artifacts will appear here.")}</div>}
      <div style={{display:"grid",gap:7}}>
        {activity.map((e,ai)=><div key={`${e.item}-${e.time}-${ai}`} style={{fontSize:10,color:T.ink2,fontFamily:F.b,lineHeight:1.5}}><span style={{color:T.ink4,fontFamily:F.m}}>{e.time}</span> · {e.item}</div>)}
      </div>
      {activity.length>0&&<button onClick={()=>setView("evidence")} style={{marginTop:9,background:"transparent",border:"none",color:AI_GOLD_INK,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer",padding:0}}>{T_("Open evidence →")}</button>}
    </div>;
  };
  /* AI PMO - execution management. Journey owns the lifecycle method;
     the PMO owns delivery: schedule, scope, resources, money, decisions. */
  const renderPmo=()=>{
    const pmo=acPmo[selected.id];
    const money=v=>parseFloat(String(v).replace(/[^0-9.]/g,""))||0;
    if(!pmo)return <Card style={{padding:18}}><div style={{fontSize:11,color:T.ink3,fontFamily:F.b}}>{T_("Execution plan not yet stood up for this initiative - the PMO workspace is created at Business Case approval.")}</div></Card>;
    const secH=t=><h3 style={{fontSize:13,color:T.ink,fontWeight:800,margin:"0 0 10px",fontFamily:F.h}}>{T_(t)}</h3>;
    const msCol=st=>st==="Complete"?T.green:st==="On Track"?T.blue:st==="At Risk"?T.red:T.ink4;
    const budgetPct=Math.min(100,Math.round((money(selected.spent)/(money(selected.budget)||1))*100));
    const govDecisions=readBus("vz-gw-evidence").filter(e=>e.initiative===selected.name&&/decision/i.test(e.item)).slice(0,3);
    const allDeliverables=AC_PHASES.reduce((a,p)=>a+p.deliverables.length,0);
    const doneDeliverables=AC_PHASES.reduce((a,p,idx)=>a+(idx<selected.phaseIndex?p.deliverables.length:idx===selected.phaseIndex?selected.phaseArtifactsDone:0),0);
    return <div style={{display:"grid",gap:12}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:12}}>
        <Card style={{padding:16}}>
          {secH(ar?"السباق - "+pmo.sprint.name:"Sprint - "+pmo.sprint.name)}
          <div style={{fontSize:10,color:T.ink3,fontFamily:F.b,marginBottom:7}}>{pmo.sprint.dates} · {pmo.sprint.goal}</div>
          <Bar value={Math.round((pmo.sprint.done/pmo.sprint.committed)*100)} color={AI_GOLD}/>
          <div style={{fontSize:10,color:T.ink3,fontFamily:F.m,marginTop:6}}>{pmo.sprint.done} {T_("of")} {pmo.sprint.committed} {T_("points done")}</div>
        </Card>
        <Card style={{padding:16}}>
          {secH("Budget tracking")}
          <div style={{fontSize:18,fontWeight:900,fontFamily:F.m,color:budgetPct>85?T.red:budgetPct>65?T.amber:T.green,marginBottom:6}}>{selected.spent} <span style={{fontSize:11,color:T.ink3,fontWeight:700}}>{T_("of")} {selected.budget}</span></div>
          <Bar value={budgetPct} color={budgetPct>85?T.red:AI_GOLD}/>
          <div style={{fontSize:10,color:T.ink3,fontFamily:F.b,marginTop:6}}>{budgetPct}% {T_("consumed ·")} {phaseProgress(selected)}% {T_("of lifecycle complete")}</div>
        </Card>
        <Card style={{padding:16}}>
          {secH("Deliverables")}
          <div style={{fontSize:18,fontWeight:900,fontFamily:F.m,color:T.blue,marginBottom:6}}>{doneDeliverables} <span style={{fontSize:11,color:T.ink3,fontWeight:700}}>{T_("of")} {allDeliverables} {T_("artifacts")}</span></div>
          <Bar value={Math.round((doneDeliverables/allDeliverables)*100)} color={T.blue}/>
          <button onClick={()=>setInitTab("journey")} style={{marginTop:8,background:"transparent",border:"none",color:AI_GOLD_INK,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer",padding:0}}>{T_("Open the Journey →")}</button>
        </Card>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))",gap:12}}>
        <Card style={{padding:16}}>
          {secH("Timeline & milestones")}
          <div style={{display:"grid",gap:8}}>
            {pmo.milestones.map(m=><div key={m.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
              <div style={{display:"flex",gap:8,alignItems:"center",minWidth:0}}><span style={{width:7,height:7,borderRadius:"50%",background:msCol(m.status),flexShrink:0}}/><span style={{fontSize:11,color:T.ink2,fontFamily:F.b}}>{m.name}</span></div>
              <div style={{display:"flex",gap:7,alignItems:"center",flexShrink:0}}><span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{m.due}</span><Tag label={T_(m.status)} color={msCol(m.status)} bg={msCol(m.status)+"14"}/></div>
            </div>)}
          </div>
          <div style={{fontSize:9.5,color:T.ink4,fontFamily:F.b,marginTop:10}}>{T_("Timeline")} {selected.timeline} · {T_("phase")} {selected.phaseIndex+1}/{AC_PHASES.length} · {phaseProgress(selected)}% {T_("complete")}</div>
        </Card>
        <Card style={{padding:16}}>
          {secH("Tasks - current phase")}
          <div style={{display:"grid",gap:7}}>
            {AC_PHASES[selected.phaseIndex]?.deliverables.map((d,ai)=>{
              const st=artifactStatus(selected,selected.phaseIndex,ai);
              const c=st==="Complete"?T.green:st==="Blocked"?T.red:T.amber;
              return <div key={d} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                <span style={{fontSize:11,color:T.ink2,fontFamily:F.b}}>{T_(d)}</span>
                <div style={{display:"flex",gap:7,alignItems:"center"}}><span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{AC_PHASES[selected.phaseIndex].raci.responsible}</span><Tag label={T_(st)} color={c} bg={c+"14"}/></div>
              </div>;
            })}
          </div>
        </Card>
      </div>
      <Card style={{padding:16}}>
        {secH("RAID log")}
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
          <thead><tr>{["Type","Item","Owner","Status"].map(h=><th key={h} style={{textAlign:"left",padding:"7px 10px",color:T.ink4,fontSize:8.5,fontFamily:F.m,letterSpacing:"0.1em",textTransform:"uppercase",borderBottom:`1px solid ${T.border}`}}>{T_(h)}</th>)}</tr></thead>
          <tbody>{pmo.raid.map((r,i)=>{
            const c=r.kind==="Risk"?T.red:r.kind==="Issue"?T.amber:r.kind==="Dependency"?T.blue:T.teal;
            return <tr key={i} style={{borderBottom:`1px solid ${T.border}`}}>
              <td style={{padding:"8px 10px"}}><Tag label={T_(r.kind)} color={c} bg={c+"14"}/></td>
              <td style={{padding:"8px 10px",color:T.ink2,fontFamily:F.b}}>{r.item}</td>
              <td style={{padding:"8px 10px",color:T.ink3,fontFamily:F.b}}>{r.owner}</td>
              <td style={{padding:"8px 10px",color:/block|open/i.test(r.status)?T.red:T.ink3,fontFamily:F.b}}>{T_(r.status)}</td>
            </tr>;})}
          </tbody>
        </table></div>
        <button onClick={()=>setTab&&setTab("riskcenter")} style={{marginTop:8,background:"transparent",border:"none",color:AI_GOLD_INK,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer",padding:0}}>{T_("Risks live in the Risk Center →")}</button>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:12}}>
        <Card style={{padding:16}}>
          {secH("Decision log")}
          <div style={{display:"grid",gap:9}}>
            {pmo.decisions.map((d,i)=><div key={i} style={{fontSize:10.5,color:T.ink2,fontFamily:F.b,lineHeight:1.55}}>
              <strong style={{color:T.ink}}>{d.decision}</strong><br/>
              <span style={{color:T.ink4,fontFamily:F.m,fontSize:8.5}}>{d.by} · {d.date}</span> · {d.rationale}
            </div>)}
            {govDecisions.map((d,i)=><div key={"g"+i} style={{fontSize:10.5,color:T.ink2,fontFamily:F.b,lineHeight:1.55}}>
              <strong style={{color:T.ink}}>{d.item}</strong><br/>
              <span style={{color:T.ink4,fontFamily:F.m,fontSize:8.5}}>{d.owner} · {d.time}</span>
            </div>)}
          </div>
        </Card>
        <Card style={{padding:16}}>
          {secH("Resource allocation")}
          {pmo.resources.map(r=><div key={r.role} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${T.border}`}}>
            <div><div style={{fontSize:11,color:T.ink,fontFamily:F.b,fontWeight:700}}>{r.name}</div><div style={{fontSize:9,color:T.ink4,fontFamily:F.b}}>{r.role}</div></div>
            <span style={{fontSize:11,fontWeight:900,fontFamily:F.m,color:AI_GOLD_INK}}>{r.allocation}</span>
          </div>)}
        </Card>
        <Card style={{padding:16}}>
          {secH("Meetings")}
          {pmo.meetings.map(m=><div key={m.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${T.border}`}}>
            <div><div style={{fontSize:11,color:T.ink,fontFamily:F.b,fontWeight:700}}>{m.name}</div><div style={{fontSize:9,color:T.ink4,fontFamily:F.b}}>{m.cadence}</div></div>
            <span style={{fontSize:10,fontFamily:F.m,color:T.ink2}}>{m.next}</span>
          </div>)}
        </Card>
        <Card style={{padding:16}}>
          {secH("Change requests")}
          {pmo.changeRequests.length===0&&<div style={{fontSize:10,color:T.ink4,fontFamily:F.b}}>{T_("No open change requests.")}</div>}
          {pmo.changeRequests.map(cr=><div key={cr.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,padding:"7px 0",borderBottom:`1px solid ${T.border}`}}>
            <div style={{minWidth:0}}><div style={{fontSize:11,color:T.ink,fontFamily:F.b,fontWeight:700}}>{cr.id} · {cr.title}</div><div style={{fontSize:9,color:T.ink4,fontFamily:F.b}}>{cr.impact}</div></div>
            <Tag label={T_(cr.status)} color={/approved/i.test(cr.status)?T.green:T.amber} bg={(/approved/i.test(cr.status)?T.green:T.amber)+"14"}/>
          </div>)}
          <button onClick={wsBriefing} style={{marginTop:10,width:"100%",background:AI_GOLD+"12",border:`1px solid ${AI_GOLD}40`,borderRadius:7,padding:"8px 10px",color:AI_GOLD_INK,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>{T_("Generate executive report ↓")}</button>
        </Card>
      </div>
    </div>;
  };

  /* ── Role perspectives: the same initiative, a different executive lens.
     Each perspective answers ONE question from live initiative data.
     "Full Initiative Profile" expands the complete digital twin. ── */
  const buildPerspective=()=>{
    const money=v=>parseFloat(String(v).replace(/[^0-9.]/g,""))||0;
    const iniRisks=[...riskRegister.filter(r=>r.initiativeId===selected.id)].sort((a,b)=>b.residual-a.residual);
    const pmo=acPmo[selected.id];
    const models=MODEL_REGISTRY.filter(m=>m.initiativeId===selected.id);
    const totalExp=acInitiatives.reduce((a,i)=>a+money(i.expected),0);
    const budgetPct=Math.min(100,Math.round((money(selected.spent)/(money(selected.budget)||1))*100));
    const benefits=Math.round((money(selected.actual)/(money(selected.expected)||1))*100);
    const P={
      ceo:{question:"Should I worry?",persona:"Executive Advisor",
        tiles:[["Overall health",wsHealth,wsHealth>=75?T.green:T.amber],["Business value",selected.expected,AI_GOLD],["ROI",selected.roi,T.green],["Budget",`${budgetPct}% used`,budgetPct>85?T.red:T.blue],["Delivery confidence",wsConfidence+"%",wsConfidence>=70?T.green:T.amber]],
        sections:[
          {title:"Executive summary",text:`${selected.objective||selected.name} ${selected.blockedBy?"Currently blocked: "+selected.blockedBy+".":"No blockers open."} Expected impact ${selected.expected}; ${selected.actual} realized.`},
          {title:"Major blockers",rows:selected.blockedBy?[[selected.blockedBy,"Open"]]:[["None open","✓"]]},
          {title:"Top risks",rows:iniRisks.slice(0,5).map(r=>[r.title,`${r.level} · ${r.residual}/25`])},
        ]},
      cfo:{question:"Is this investment creating value?",persona:"Financial Advisor",
        tiles:[["Investment",selected.budget||"—",T.blue],["Spent",selected.spent||"—",budgetPct>85?T.red:T.blue],["ROI",selected.roi,T.green],["Cost savings",selected.savings,T.green],["Revenue impact",selected.revenue,AI_GOLD]],
        sections:[
          {title:"Benefits realization",rows:[["Expected value",selected.expected],["Realized to date",`${selected.actual} (${benefits}%)`],["Budget variance",`${100-budgetPct}% headroom`],["Run rate",`~$${(money(selected.spent)/Math.max(1,selected.phaseIndex)).toFixed(2)}M per phase`],["Forecast accuracy",wsConfidence+"% confidence"],["Portfolio share",Math.round((money(selected.expected)/totalExp)*100)+"% of enterprise AI value"]]},
          {title:"Financial risks",rows:iniRisks.slice(0,3).map(r=>[r.title,r.level])},
        ]},
      cio:{question:"Will this integrate and scale?",persona:"Technology Advisor",
        tiles:[["Delivery timeline",selected.timeline||"—",T.blue],["Platform readiness",selected.guardrail+"%",selected.guardrail>=80?T.green:T.amber],["Operational health",wsHealth,wsHealth>=75?T.green:T.amber],["Models deployed",models.filter(m=>m.status==="In Production").length+"/"+models.length,T.teal]],
        sections:[
          {title:"Technology stack",rows:models.map(m=>[m.system,`${m.type} · ${m.vendor}`])},
          {title:"Dependencies & infrastructure",rows:(pmo?pmo.raid.filter(r=>r.kind==="Dependency"):[]).map(d=>[d.item,d.status]).concat([["Technical debt","Low - reviewed at each gate"],["Availability target","99.9% (gateway-fronted)"]])},
        ]},
      ciso:{question:"Can I trust this AI?",persona:"Security & Risk Advisor",
        tiles:[["Risk score",wsRiskScore?wsRiskScore+"/25":"none",wsRiskScore>=10?T.red:wsRiskScore>=6?T.amber:T.green],["Open risks",iniRisks.length,iniRisks.length?T.amber:T.green],["Controls",selected.controls.length,T.blue],["Security testing",models.filter(m=>m.biasTest).length+"/"+models.length+" tested",T.teal],["Kill switch",models.filter(m=>m.killSwitch).length+"/"+models.length,models.every(m=>m.killSwitch)?T.green:T.amber]],
        sections:[
          {title:"Threat exposure",rows:iniRisks.map(r=>[r.title,`${r.level} · residual ${r.residual}/25 · ${r.treatment.status}`])},
          {title:"Mitigations & evidence",rows:[["Active controls",selected.controls.join(", ")||"pending"],["Evidence trail",wsEvidence+"% of lifecycle evidenced"],["Attack surface","Gateway-mediated; no direct model exposure"]]},
        ]},
      caio:{question:"Is this AI responsible and governed?",persona:"Governance Advisor",
        tiles:[["Governance score",selected.guardrail+"%",selected.guardrail>=80?T.green:T.amber],["Lifecycle phase",`${selected.phaseIndex+1}/${AC_PHASES.length}`,T.blue],["Approvals pending",(pmo?1:0)+(selected.blockedBy?1:0),T.amber],["Evidence",wsEvidence+"%",wsEvidence>=70?T.green:T.amber]],
        sections:[
          {title:"Responsible AI posture",rows:[["AI policies",selected.policies.join(", ")],["Human oversight","HITL gates on all high-impact decisions"],["AIRA / AIRT","Open the Risk Center for assessments and treatments"]]},
          {title:"Decision log",rows:(pmo?pmo.decisions:[]).map(d=>[d.decision,`${d.by} · ${d.date}`])},
        ]},
      cdpo:{question:"Does this protect personal information?",persona:"Privacy Advisor",
        tiles:[["DPIA",models.every(m=>m.aia)?"Complete":"In progress",models.every(m=>m.aia)?T.green:T.amber],["Privacy controls",selected.policies.length,T.blue],["Data provenance",models.filter(m=>m.dataProvenance).length+"/"+models.length,T.teal],["Privacy risks",iniRisks.filter(r=>/leak|profil|privacy|data/i.test(r.title)).length,T.amber]],
        sections:[
          {title:"Privacy posture",rows:[["GDPR basis","Legitimate interest + consent where required"],["PII handling","Masked at the gateway before model calls"],["Retention","7-year evidence retention; prompts 90 days"],["Cross-border","EU/US processing under adequacy safeguards"],["Data classification",selected.policies.join(", ")]]},
          {title:"Privacy risks",rows:iniRisks.filter(r=>/leak|profil|privacy|data|bias/i.test(r.title)).map(r=>[r.title,r.level])},
        ]},
      cgo:{question:"Can this legally operate?",persona:"Legal & Compliance Advisor",
        tiles:[["Regulatory scope",models[0]?.clause?.split("/")[0]||"EU AI Act",T.blue],["Legal reviews",selected.audits.length,T.teal],["Open obligations",(selected.blockedBy?1:0),(selected.blockedBy?T.amber:T.green)],["Vendor contracts",[...new Set(models.map(m=>m.vendor))].filter(v=>v!=="Internal").length,T.ink3]],
        sections:[
          {title:"Regulatory obligations",rows:models.map(m=>[m.bizName,m.clause])},
          {title:"Contracts, IP & licensing",rows:[["Vendors",[...new Set(models.map(m=>m.vendor))].join(", ")],["Liability posture","Human accountability retained on all decisions"],["Policy compliance",selected.policies.join(", ")],["Open obligations",selected.blockedBy||"None"]]},
        ]},
      coo:{question:"Will this deliver successfully?",persona:"Delivery Advisor",
        tiles:[["Phase",`${selected.phaseIndex+1}/${AC_PHASES.length}`,T.blue],["Completion",phaseProgress(selected)+"%",T.teal],["Sprint",pmo?`${pmo.sprint.done}/${pmo.sprint.committed} pts`:"—",AI_GOLD],["Milestones at risk",pmo?pmo.milestones.filter(m=>m.status==="At Risk").length:0,T.amber]],
        sections:[
          {title:"Milestones",rows:(pmo?pmo.milestones:[]).map(m=>[m.name,`${m.due} · ${m.status}`])},
          {title:"RAID highlights",rows:(pmo?pmo.raid.slice(0,4):[]).map(r=>[`${r.kind}: ${r.item}`,r.status])},
        ]},
      employee:{question:"What must happen next?",persona:"Work Advisor",
        tiles:[["Current phase",`${selected.phaseIndex+1}/${AC_PHASES.length}`,T.blue],["My tasks",AC_PHASES[selected.phaseIndex]?.deliverables.length-selected.phaseArtifactsDone,T.amber],["Evidence required",selected.blockedBy?1:0,selected.blockedBy?T.red:T.green],["Next milestone",(pmo?.milestones||[]).find(m=>m.status!=="Complete")?.due||"—",T.teal]],
        sections:[
          {title:"Tasks in this phase",rows:AC_PHASES[selected.phaseIndex]?.deliverables.map((d,ai)=>[d,ai<selected.phaseArtifactsDone?"Complete":"Open · "+AC_PHASES[selected.phaseIndex].raci.responsible])||[]},
          {title:"Evidence & approvals",rows:[["Evidence required",selected.blockedBy||"None outstanding"],["Approver",AC_PHASES[selected.phaseIndex]?.raci.accountable||"—"],["Applicable policies",selected.policies.join(", ")]]},
          {title:"Deadlines",rows:(pmo?.milestones||[]).map(m=>[m.name,`${m.due} · ${m.status}`])},
        ]},
      manager:{question:"Is my team ready to deliver?",persona:"Adoption Advisor",
        tiles:[["Team adoption",selected.adoption+"%",selected.adoption>=60?T.green:T.amber],["Training",selected.training,T.blue],["Resistance",selected.resistance,selected.resistance==="High"?T.red:T.amber],["Phase",`${selected.phaseIndex+1}/${AC_PHASES.length}`,T.teal]],
        sections:[
          {title:"Milestones",rows:(pmo?.milestones||[]).map(m=>[m.name,`${m.due} · ${m.status}`])},
          {title:"Workforce signals",rows:[["Adoption trend",selected.adoption>=60?"Growing":"Below target - enablement needed"],["Training completion",selected.training],["Change resistance",selected.resistance],["Blocker",selected.blockedBy||"None"]]},
        ]},
      chro:{question:"Is adoption increasing?",persona:"Adoption Advisor",
        tiles:[["Adoption",selected.adoption+"%",selected.adoption>=70?T.green:T.amber],["Training",selected.training,T.blue],["Resistance",selected.resistance,selected.resistance==="High"?T.red:selected.resistance==="Medium"?T.amber:T.green],["Value score",selected.valueScore+"%",AI_GOLD]],
        sections:[
          {title:"Workforce signals",rows:[["Users in scope",selected.unit+" teams"],["Usage trend",selected.adoption>=60?"Growing week over week":"Below target - enablement needed"],["Feedback",`Stakeholder composite ${feedbackAvg(acFeedback[selected.id]||DEFAULT_FEEDBACK)}/100`],["Improvement backlog",pmo&&pmo.changeRequests.length?pmo.changeRequests.map(c=>c.title).join("; "):"None open"]]},
          {title:"Business KPIs",rows:(selected.successMetrics||[]).map(m=>[m,"tracked"])},
        ]},
    };
    return P[role];
  };
  const renderPerspective=()=>{
    const p=buildPerspective();
    if(!p)return null;
    return <div style={{animation:"up .25s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,margin:"2px 0 14px",flexWrap:"wrap"}}>
        <div>
          <div style={{fontSize:9,fontWeight:900,fontFamily:F.m,color:RC(role),textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:3}}>{(ROLES[role]||ROLES.caio).label} {T_("perspective")}</div>
          <div style={{fontSize:16,fontWeight:800,fontFamily:F.h,color:T.ink}}>{T_(p.question)}</div>
        </div>
        <button onClick={()=>setProfileMode(true)} style={{background:AI_GOLD+"12",border:`1px solid ${AI_GOLD}40`,borderRadius:8,padding:"8px 14px",color:AI_GOLD_INK,fontSize:10.5,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>{T_("Full Initiative Profile →")}</button>
      </div>
      <div style={{display:"flex",gap:24,flexWrap:"wrap",marginBottom:18}}>
        {p.tiles.map(([l,v,c])=><div key={l}>
          <div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:3}}>{T_(l)}</div>
          <div style={{fontSize:19,fontWeight:900,fontFamily:F.m,color:c,lineHeight:1.1}}>{T_(v)}</div>
        </div>)}
      </div>
      <div style={{display:"grid",gap:18}}>
        {p.sections.map(sec=>{
          const secGo=/risk|threat/i.test(sec.title)?()=>nav("risk")
            :/benefit|financ|value|kpi/i.test(sec.title)?()=>nav("value",{id:selected.id})
            :/milestone|raid|task|stack|dependen|infra|technology/i.test(sec.title)?()=>nav("pmo",{id:selected.id})
            :/decision/i.test(sec.title)?()=>nav("decision")
            :/evidence|posture/i.test(sec.title)?()=>nav("monitoring",{id:selected.id})
            :/mitigation|regulat|contract|privacy|responsible|workforce|blocker|summary/i.test(sec.title)?()=>nav("governance",{id:selected.id})
            :null;
          return <div key={sec.title}>
          <h3 style={{fontSize:13,color:T.ink,margin:"0 0 8px",fontFamily:F.h,fontWeight:800}}>{T_(sec.title)}</h3>
          {sec.text&&<p style={{fontSize:11.5,color:T.ink2,fontFamily:F.b,lineHeight:1.65,margin:0}}>{T_(sec.text)}</p>}
          {sec.rows&&<div style={{display:"grid",gap:2}}>
            {sec.rows.length===0&&<div style={{fontSize:10.5,color:T.ink4,fontFamily:F.b}}>{T_("Nothing recorded yet.")}</div>}
            {sec.rows.map(([a,b],i)=><button key={i} onClick={secGo||undefined} disabled={!secGo} style={{display:"flex",justifyContent:"space-between",gap:12,borderBottom:`1px solid ${T.border}`,padding:"7px 2px",background:"transparent",border:"none",cursor:secGo?"pointer":"default",textAlign:"left",width:"100%"}}>
              <span style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.5}}>{T_(a)}</span>
              <span style={{fontSize:10.5,color:T.ink,fontFamily:F.b,fontWeight:700,textAlign:"right",flexShrink:0}}>{T_(b)}{secGo?<span style={{color:T.ink4}}> →</span>:null}</span>
            </button>)}
          </div>}
        </div>;})}
      </div>
    </div>;
  };

  /* ── Enterprise AI PMO: the Portfolio Delivery Office. Enterprise-wide
     delivery visibility only - execution stays inside each initiative. ── */
  const renderEnterprisePmo=()=>{
    const money=v=>parseFloat(String(v).replace(/[^0-9.]/g,""))||0;
    const totBudget=acInitiatives.reduce((a,i)=>a+money(i.budget),0);
    const totSpent=acInitiatives.reduce((a,i)=>a+money(i.spent),0);
    const allRaid=acInitiatives.flatMap(i=>(acPmo[i.id]?.raid||[]).map(r=>({...r,ini:i})));
    const deps=allRaid.filter(r=>r.kind==="Dependency");
    const openIssues=allRaid.filter(r=>r.kind==="Issue"&&/open/i.test(r.status));
    const atRisk=acInitiatives.filter(i=>(acPmo[i.id]?.milestones||[]).some(m=>m.status==="At Risk"));
    const resources=acInitiatives.flatMap(i=>(acPmo[i.id]?.resources||[]).map(r=>({...r,ini:i.name})));
    const secH=t=><h3 style={{fontSize:13,color:T.ink,fontWeight:800,margin:"0 0 10px",fontFamily:F.h}}>{T_(t)}</h3>;
    return <div style={{display:"grid",gap:12}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:10}}>
        {[["Initiatives in delivery",acInitiatives.length,T.blue,()=>openModule("initiatives"),"Open the initiative workspaces"],
          ["Milestones at risk",atRisk.length,atRisk.length?T.red:T.green,()=>atRisk[0]?openInitiative(atRisk[0].id,"pmo"):openModule("initiatives"),"Open the first at-risk initiative's PMO"],
          ["Open blocking issues",openIssues.length,openIssues.length?T.amber:T.green,()=>openIssues[0]?openInitiative(openIssues[0].ini.id,"pmo"):openModule("initiatives"),"Open the blocked initiative's PMO"],
          ["Portfolio budget",`$${totSpent.toFixed(1)}M / $${totBudget.toFixed(1)}M`,AI_GOLD,()=>setTab&&setTab("reports"),"Financial reporting lives in Reports"]].map(([l,v,c,go,hint])=><Card key={l} onClick={go} title={T_(hint)} style={{padding:"13px 14px",cursor:"pointer"}}>
          <div style={{fontSize:9,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F.m,marginBottom:8}}>{T_(l)}</div>
          <div style={{fontSize:20,fontWeight:800,fontFamily:F.m,color:c}}>{v}</div>
        </Card>)}
      </div>
      <Card style={{padding:16}}>
        {secH("Delivery health & portfolio timeline")}
        <div style={{display:"grid",gap:9}}>
          {acInitiatives.map(i=>{
            const pmo=acPmo[i.id];
            const riskMs=(pmo?.milestones||[]).filter(m=>m.status==="At Risk").length;
            return <button key={i.id} onClick={()=>openInitiative(i.id,"pmo")} style={{display:"grid",gridTemplateColumns:"1.3fr 2fr auto auto",gap:12,alignItems:"center",background:T.s2,border:`1px solid ${riskMs?T.amber+"45":T.border}`,borderRadius:9,padding:"10px 13px",cursor:"pointer",textAlign:"left"}}>
              <div style={{minWidth:0}}>
                <div style={{fontSize:12,fontWeight:800,color:T.ink,fontFamily:F.b,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{i.name}</div>
                <div style={{fontSize:9,color:T.ink3,fontFamily:F.m,marginTop:2}}>{i.timeline} · {pmo?pmo.sprint.name:T_("no sprint")}</div>
              </div>
              <div><Bar value={phaseProgress(i)} color={i.blockedBy?T.amber:T.green}/><div style={{fontSize:9,color:T.ink4,fontFamily:F.m,marginTop:4}}>{T_("Phase")} {i.phaseIndex+1}/{AC_PHASES.length} · {phaseProgress(i)}% · {money(i.spent).toFixed(1)} {T_("of")} {money(i.budget).toFixed(1)}M</div></div>
              {riskMs?<Tag label={`${riskMs} ${T_("at risk")}`} color={T.amber} bg={T.amberL}/>:<Tag label={T_("On track")} color={T.green} bg={T.greenL}/>}
              <span style={{fontSize:10,fontWeight:900,color:AI_GOLD_INK,fontFamily:F.b}}>{T_("Open PMO →")}</span>
            </button>;
          })}
        </div>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:12}}>
        <Card style={{padding:16}}>
          {secH("Cross-initiative dependencies")}
          <div style={{display:"grid",gap:8}}>
            {deps.map((d,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center"}}>
              <div style={{minWidth:0}}><div style={{fontSize:11,color:T.ink2,fontFamily:F.b}}>{d.item}</div><div style={{fontSize:9,color:T.ink4,fontFamily:F.m,marginTop:2}}>{d.ini.name} · {d.owner}</div></div>
              <span style={{fontSize:9.5,color:/due|pending/i.test(d.status)?T.amber:T.green,fontFamily:F.b,fontWeight:800,flexShrink:0}}>{d.status}</span>
            </div>)}
          </div>
        </Card>
        <Card style={{padding:16}}>
          {secH("Portfolio RAID")}
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
            {["Risk","Assumption","Issue","Dependency"].map(k=>{
              const n=allRaid.filter(r=>r.kind===k).length;
              const c=k==="Risk"?T.red:k==="Issue"?T.amber:k==="Dependency"?T.blue:T.teal;
              return <span key={k} style={{background:c+"14",border:`1px solid ${c}35`,borderRadius:7,padding:"4px 10px",fontSize:10,fontWeight:800,fontFamily:F.b,color:c}}>{T_(k)} {n}</span>;
            })}
          </div>
          {openIssues.map((r,i)=><div key={i} style={{fontSize:10.5,color:T.ink2,fontFamily:F.b,lineHeight:1.5,marginBottom:5}}><strong style={{color:T.amber}}>{r.ini.name}:</strong> {r.item}</div>)}
          <button onClick={()=>setTab&&setTab("riskcenter")} style={{marginTop:6,background:"transparent",border:"none",color:AI_GOLD_INK,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer",padding:0}}>Risks live in the Risk Center →</button>
        </Card>
        <Card style={{padding:16}}>
          {secH("Capacity & resources")}
          {resources.slice(0,7).map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${T.border}`}}>
            <div><div style={{fontSize:11,color:T.ink,fontFamily:F.b,fontWeight:700}}>{r.name}</div><div style={{fontSize:9,color:T.ink4,fontFamily:F.b}}>{r.role} · {r.ini}</div></div>
            <span style={{fontSize:11,fontWeight:900,fontFamily:F.m,color:AI_GOLD_INK}}>{r.allocation}</span>
          </div>)}
        </Card>
        <Card style={{padding:16}}>
          {secH("Executive reporting")}
          <p style={{fontSize:11,color:T.ink3,fontFamily:F.b,lineHeight:1.6,margin:"0 0 10px"}}>{T_("Portfolio packs, value reporting and audit-ready exports are generated in Reports.")}</p>
          <button onClick={()=>setTab&&setTab("reports")} style={{width:"100%",background:AI_GOLD+"12",border:`1px solid ${AI_GOLD}40`,borderRadius:7,padding:"8px 10px",color:AI_GOLD_INK,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>{T_("Open Reports →")}</button>
        </Card>
      </div>
    </div>;
  };

  /* ── AI Portfolio Command Center: portfolio rail | selected initiative | intelligence rail ── */
  const Initiatives=()=><div>
    <div style={{display:"grid",gridTemplateColumns:"minmax(220px,1fr) minmax(0,2.1fr) minmax(220px,1fr)",gap:14,alignItems:"start"}}>
      {renderPortfolioRail()}
      <div style={{minWidth:0}}>
        {createOpen&&renderCreateForm()}
        {renderExecHeader(!profileMode&&!!buildPerspective())}
        {!profileMode&&buildPerspective()?renderPerspective():<>
          {buildPerspective()&&<button onClick={()=>setProfileMode(false)} style={{background:"transparent",border:"none",padding:0,marginBottom:8,color:T.ink3,fontSize:10,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{ar?"→":"←"} {(ROLES[role]||ROLES.caio).label} {T_("perspective")}</button>}
          <SubTabs tabs={[["trace","Idea → Value"],["overview","Overview"],["journey","Journey"],["pmo","AI PMO"],["value","Value"],["governance","Governance"],["monitoring","Monitoring"]]} active={wsTab} onChange={setInitTab}/>
          {wsTab==="trace"&&<InitiativeTrace initiative={selected}/>}
          {wsTab==="overview"&&<Overview/>}
          {wsTab==="journey"&&<InitJourney/>}
          {wsTab==="pmo"&&renderPmo()}
          {wsTab==="value"&&<InitInsights/>}
          {wsTab==="governance"&&<div>{renderRiskSummary()}<div style={{marginTop:12}}><RiskAssessmentCascade setTab={setTab} fixed={selected.id}/></div><div style={{marginTop:12}}><InitControls/></div><div style={{marginTop:12}}><InitApprovals/></div></div>}
          {wsTab==="monitoring"&&<div><InitEvidenceTimeline/><div style={{marginTop:12}}><PilotExecution/></div></div>}
        </>}
      </div>
      {renderIntelRail()}
    </div>
  </div>;

  /* ── AI Governance ─────────────────────────────────────────── */
  const Governance=()=><div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12,marginBottom:14}}>
      <Metric label="Governance score" value={avgGuard+"%"} sub="Portfolio control compliance" color={rc} score={avgGuard}/>
      {AC_FRAMEWORK_POSTURE.filter(f=>["iso42001","nist","euai"].includes(f.id)).map(f=><Metric key={f.id} label={f.name} value={f.score+"%"} sub={f.sub} color={f.score>=75?T.blue:f.score>=70?T.teal:T.amber} score={f.score} onClick={()=>setGovTab("controls")}/>)}
      <Metric label="Policy violations" value="3" sub="1 repeated - training assigned" color={T.red} onClick={()=>openModule("academy")}/>
      <Metric label="Active exceptions" value="4" sub="2 expiring this month" color={T.amber} onClick={()=>{setTab("decisions");}}/>
    </div>
    <SubTabs tabs={[["controls","Controls & Guardrails"],["matrix","Control Matrix"],["drift","Risk Drift"]]} active={govTab} onChange={setGovTab}/>
    {govTab==="controls"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12}}>
      {acGuardrails.map((g,idx)=><Card key={g.cat} style={{padding:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><h3 style={{fontSize:14,color:T.ink,margin:0}}>{T_(g.cat)} {T_("Guardrails")}</h3><Ring score={[92,84,78,74,81,69,88][idx]} color={[T.green,T.blue,T.amber,T.amber,T.teal,T.red,T.green][idx]} size={46}/></div>
        {g.items.map((it,j)=><div key={it} style={{display:"flex",gap:8,alignItems:"center",padding:"7px 0",borderTop:j?"1px solid "+T.border:"none"}}><span style={{width:7,height:7,borderRadius:"50%",background:j<3?T.green:T.amber}}/><span style={{fontSize:11,color:T.ink2}}>{T_(it)}</span></div>)}
        <button onClick={()=>{setLifecycleFilter("All");openInitiative(items[idx%items.length].id);}} style={{marginTop:12,background:"transparent",border:"none",color:rc,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer",padding:0}}>{T_("Linked to")} {items.length} {T_("initiatives")} &#8594;</button>
      </Card>)}
    </div>}
    {govTab==="matrix"&&<PageAISpine mode="controlmatrix" setTab={setTab}/>}
    {govTab==="drift"&&<PageAISpine mode="riskdrift" setTab={setTab}/>}
  </div>;

  /* ── Trust & Evidence ──────────────────────────────────────── */
  const q=evQuery.trim().toLowerCase();
  const evFiltered=evidenceRows.filter(e=>
    (evScope==="All"||e.scope===evScope)&&
    (!q||[e.item,e.initiative,e.control,e.owner,e.risk].join(" ").toLowerCase().includes(q))
  );
  const EvidenceModule=()=><div>
    <SubTabs tabs={[["repository","Evidence Repository"],["confidence","Evidence Confidence"]]} active={evTab} onChange={setEvTab}/>
    {evTab==="repository"&&<Card style={{padding:0,overflow:"hidden"}}>
      <div style={{padding:"14px 18px",borderBottom:"1px solid "+T.border,display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        <div><h3 style={{margin:0,fontSize:15,color:T.ink}}>{T_("Enterprise Evidence Repository")}</h3><p style={{margin:"3px 0 0",fontSize:10,color:T.ink3,fontFamily:F.b}}>{T_("Everything searchable. Everything versioned. Nothing duplicated.")}</p></div>
        <input value={evQuery} onChange={e=>setEvQuery(e.target.value)} placeholder={T_("Search evidence, controls, owners...")} style={{...fieldStyle,maxWidth:280,marginLeft:"auto"}}/>
        <div style={{display:"flex",gap:5}}>
          {["All","Project","Business Unit","Organization"].map(s=><button key={s} onClick={()=>setEvScope(s)} style={{background:evScope===s?rc+"20":T.s2,border:`1px solid ${evScope===s?rc+"55":T.border}`,color:evScope===s?rc:T.ink3,borderRadius:7,padding:"6px 9px",fontSize:10,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{T_(s)}</button>)}
        </div>
        <Tag label={`${evFiltered.length} ${T_("items")}`} color={AI_GOLD} bg={AI_GOLD+"18"}/>
      </div>
      {evFiltered.map((e,ei)=><div key={`${e.item}-${e.time}-${ei}`} style={{display:"grid",gridTemplateColumns:"1.3fr 1fr 1fr 1fr",gap:12,padding:"14px 18px",borderBottom:"1px solid "+T.border,alignItems:"center"}}>
        <div><div style={{fontSize:13,color:T.ink,fontWeight:700}}>{e.item} <span style={{fontSize:9,color:rc,fontFamily:F.m,border:`1px solid ${rc}40`,borderRadius:5,padding:"1px 5px",marginLeft:4}}>{e.version||"v1"}</span></div><div style={{fontSize:10,color:T.ink3}}>{e.initiative} - {T_(e.scope||"Project")}</div></div>
        <div style={{fontSize:11,color:T.ink2}}>{T_("Control:")} {e.control}<br/>{T_("Risk:")} {e.risk}</div>
        <div style={{fontSize:11,color:T.ink2}}>{T_("Owner:")} {e.owner}</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"flex-end"}}><STag s={e.status}/><STag s={e.approval}/><Tag label={e.time} color={T.ink3}/></div>
      </div>)}
      {evFiltered.length===0&&<div style={{padding:"28px 18px",textAlign:"center",fontSize:12,color:T.ink3,fontFamily:F.b}}>{T_("No evidence matches this search.")}</div>}
    </Card>}
    {evTab==="confidence"&&<PageAISpine mode="evidenceconfidence" setTab={setTab}/>}
  </div>;

  /* ── AI Gateway ────────────────────────────────────────────── */
  const gwActionColor=a=>a==="Allowed"?T.green:a==="Redacted"?T.amber:a==="Escalated"?T.blue:T.red;
  const GatewayConfig=()=><div>
    {adminTab==="providers"&&<Card style={{padding:0,overflow:"hidden"}}>
      <div style={{padding:"14px 18px",borderBottom:"1px solid "+T.border}}><h3 style={{margin:0,fontSize:14,color:T.ink}}>{T_("Provider configuration")}</h3><p style={{margin:"3px 0 0",fontSize:10,color:T.ink3,fontFamily:F.b}}>{T_("Vendor neutral and configuration driven - adding a provider is configuration, never a redesign.")}</p></div>
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
        <thead><tr>{["Provider","Connection","Models","Allowed units","Region","Latency","Role"].map(h=><th key={h} style={{textAlign:"left",padding:"9px 12px",color:T.ink3,fontSize:9,fontFamily:F.m,letterSpacing:"0.12em",textTransform:"uppercase",borderBottom:"1px solid "+T.border}}>{T_(h)}</th>)}</tr></thead>
        <tbody>{gatewayProviders.map((pv,idx)=><tr key={pv.id} style={{borderBottom:"1px solid "+T.border}}>
          <td style={{padding:"11px 12px",color:T.ink,fontWeight:700}}>{pv.name}<div style={{fontSize:9,color:T.ink4,fontWeight:400}}>{pv.kind}</div></td>
          <td style={{padding:"11px 12px"}}><Tag label={pv.status==="Blocked"?T_("Disconnected"):T_("Connected")} color={pv.status==="Blocked"?T.red:T.green} bg={(pv.status==="Blocked"?T.red:T.green)+"14"}/></td>
          <td style={{padding:"11px 12px",color:T.ink2,fontSize:11}}>{pv.models.join(", ")}</td>
          <td style={{padding:"11px 12px",color:T.ink2,fontSize:10}}>{pv.status==="Approved"?T_("All units"):T_("Pilot units only")}</td>
          <td style={{padding:"11px 12px",color:T.ink2,fontSize:10}}>{idx%2===0?"EU / US":"US"}</td>
          <td style={{padding:"11px 12px",color:T.ink3,fontFamily:F.m,fontSize:10}}>{180+idx*45}ms</td>
          <td style={{padding:"11px 12px"}}>{idx===1?<Tag label={T_("Default")} color={AI_GOLD} bg={AI_GOLD+"16"}/>:idx===6?<Tag label={T_("Fallback")} color={T.blue} bg={T.blue+"16"}/>:<span style={{fontSize:10,color:T.ink4}}>-</span>}</td>
        </tr>)}</tbody>
      </table></div>
    </Card>}
    {adminTab==="routing"&&<Card style={{padding:16}}>
      <h3 style={{fontSize:14,color:T.ink,margin:"0 0 4px"}}>{T_("Routing policy")}</h3>
      <p style={{fontSize:10,color:T.ink3,fontFamily:F.b,margin:"0 0 12px"}}>{T_("Every request follows configurable routing by business unit and risk class. High-risk workloads never leave the enterprise.")}</p>
      <div style={{display:"grid",gap:8}}>
        {gatewayRouting.map(r=>{const pv=gatewayProviders.find(x=>x.id===r.providerId);return <div key={r.id} style={{display:"grid",gridTemplateColumns:"160px auto 1fr",gap:12,alignItems:"center",background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 13px"}}>
          <span style={{fontSize:12,color:T.ink,fontWeight:800,fontFamily:F.b}}>{T_(r.scope)}</span>
          <Tag label={pv?.name||r.providerId} color={r.scope==="High Risk"?T.red:AI_GOLD} bg={(r.scope==="High Risk"?T.red:AI_GOLD)+"14"}/>
          <span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{T_(r.reason)}</span>
        </div>;})}
      </div>
    </Card>}
    {adminTab==="guardrails"&&<Card style={{padding:16}}>
      <h3 style={{fontSize:14,color:T.ink,margin:"0 0 4px"}}>{T_("Guardrail detectors")}</h3>
      <p style={{fontSize:10,color:T.ink3,fontFamily:F.b,margin:"0 0 12px"}}>{T_("Every prompt is inspected before any model call. Actions are configurable per detector: allow, warn, require justification, mask, redact, block or escalate.")}</p>
      <div style={{display:"grid",gap:8}}>
        {guardrailDetectors.map(d=>{const c=d.action==="Block"?T.red:d.action==="Escalate"?T.violet:d.action==="Mask"||d.action==="Redact"?T.amber:d.action==="Require justification"?T.blue:T.green;return <div key={d.id} style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:12,alignItems:"center",background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 13px"}}>
          <div><div style={{fontSize:12,color:T.ink,fontWeight:800,fontFamily:F.b}}>{T_(d.name)}</div><div style={{fontSize:9,color:T.ink3,fontFamily:F.b,marginTop:2}}>{T_("Triggered")} {d.triggeredMtd.toLocaleString()}x {T_("MTD")}</div></div>
          <Tag label={T_(d.action)} color={c} bg={c+"16"}/>
        </div>;})}
      </div>
    </Card>}
    {adminTab==="modes"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:10,marginBottom:14}}>
        {deploymentModes.map(m=><Card key={m.id} style={{padding:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div style={{fontSize:12,fontWeight:800,color:T.ink,fontFamily:F.b}}>{T_(m.name)}</div><Tag label={T_(m.status)} color={m.status==="Active"?T.green:m.status==="Available"?T.blue:T.ink3} bg={(m.status==="Active"?T.green:m.status==="Available"?T.blue:T.ink3)+"14"}/></div>
          <p style={{fontSize:10,color:T.ink3,fontFamily:F.b,lineHeight:1.6,margin:0}}>{T_(m.desc)}</p>
        </Card>)}
      </div>
      <Card style={{padding:16}}>
        <h3 style={{fontSize:14,color:T.ink,margin:"0 0 10px"}}>{T_("Retention & compliance configuration")}</h3>
        {gatewayRetention.map(r=><div key={r.setting} style={{display:"grid",gridTemplateColumns:"200px auto 1fr",gap:12,alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
          <span style={{fontSize:11,color:T.ink2,fontFamily:F.b,fontWeight:700}}>{T_(r.setting)}</span>
          <Tag label={T_(r.value)} color={AI_GOLD} bg={AI_GOLD+"14"}/>
          <span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{T_(r.note)}</span>
        </div>)}
      </Card>
    </div>}
    {adminTab==="knowledge"&&<Card style={{padding:0,overflow:"hidden"}}>
      <div style={{padding:"14px 18px",borderBottom:"1px solid "+T.border}}><h3 style={{margin:0,fontSize:14,color:T.ink}}>{T_("Internal Knowledge Engine")}</h3><p style={{margin:"3px 0 0",fontSize:10,color:T.ink3,fontFamily:F.b}}>{T_("Enterprise knowledge searched before any prompt reaches a model. Every approved artifact can graduate into this repository.")}</p></div>
      {knowledgeAssets.map(k=><div key={k.id} style={{display:"grid",gridTemplateColumns:"1.3fr auto 1fr auto",gap:12,padding:"11px 18px",borderBottom:"1px solid "+T.border,alignItems:"center"}}>
        <div style={{fontSize:12,color:T.ink,fontWeight:700}}>{k.title}<div style={{fontSize:9,color:T.ink4,fontWeight:400}}>{k.sourceRef}</div></div>
        <Tag label={T_(k.kind)} color={T.blue} bg={T.blue+"14"}/>
        <span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{T_("Added by")} {k.addedBy}</span>
        <span style={{fontSize:10,color:AI_GOLD_INK,fontFamily:F.m,fontWeight:800}}>{k.reuseCount} {T_("reuses")}</span>
      </div>)}
    </Card>}
  </div>;

  const ADMIN_TABS=[["providers","Providers"],["routing","Routing"],["guardrails","Guardrails"],["knowledge","Knowledge Engine"],["modes","Modes & Retention"]];
  const adminTab=ADMIN_TABS.some(([id])=>id===gwTab)?gwTab:"providers";
  const Administration=()=><div>
    <SubTabs tabs={ADMIN_TABS} active={adminTab} onChange={setGwTab}/>
    <GatewayConfig/>
  </div>;
  const [pfTab,setPfTab]=useState("units");
  const Portfolio=()=><div>
    <SubTabs tabs={[["units","Business Units"],["maturity","Governance Maturity"],["usecases","Use Case Pipeline"]]} active={pfTab} onChange={setPfTab}/>
    {pfTab==="units"&&<PortfolioUnits setView={setView}/>}
    {pfTab==="maturity"&&<PageMaturityRadar/>}
    {pfTab==="usecases"&&<PageUseCases/>}
  </div>;
  const Gateway=()=>{
    /* FinOps rollup — every cost figure is computed from the price book
       (tokens × blended rate) and measured against the budget, not stored. */
    const cost=costSummary(), head=costHeadline(), spend=providerSpend();
    return <div>
    {<div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:12,marginBottom:14}}>
      <Metric label="Requests MTD" value={gatewayStats.requestsMtd} sub="All AI interactions governed" color={rc}/>
      <Metric label="Tokens MTD" value={head.tokensMtd} sub="Metered across all providers" color={T.blue}/>
      <Metric label="Cost MTD" value={head.costMtd} sub={`${head.utilization}% of ${head.budgetMtd} budget`} color={cost.utilization>100?T.red:cost.utilization>90?T.amber:T.green} score={Math.min(100,cost.utilization)}/>
      <Metric label="Over budget" value={cost.overBudget.length} sub={cost.overBudget.length?`${cost.overBudget.map(p=>p.name).join(", ")}`:"All providers within cap"} color={cost.overBudget.length?T.red:T.green}/>
      <Metric label="Avg prompt risk" value={gatewayStats.avgRiskScore} sub="0-100 risk scoring" color={T.teal} score={gatewayStats.avgRiskScore}/>
    </div>
    {(()=>{
      /* Runtime rules ranked by violations - each rule traces to its policy;
         live guardrail events from the workbench appear at the top. */
      const live=readBus("vz-violations").slice(0,5);
      const ranked=POLICY_REGISTER.flatMap(p=>p.rules.map(r=>({...r,policy:p})))
        .sort((a,b)=>b.violationsMtd-a.violationsMtd).slice(0,7);
      return <Card style={{padding:0,overflow:"hidden",marginBottom:14}}>
        <div style={{padding:"12px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <h3 style={{margin:0,fontSize:14,color:T.ink,fontWeight:800,fontFamily:F.h}}>{T_("Runtime rules by violations - last 30 days")}</h3>
          <button onClick={()=>setTab&&setTab("policies")} style={{background:"transparent",border:"none",color:AI_GOLD_INK,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>{T_("Policy register →")}</button>
        </div>
        {ranked.map((r,i)=><div key={r.id+r.policy.id} style={{display:"grid",gridTemplateColumns:"22px minmax(0,1.5fr) 1fr 96px 80px",gap:10,alignItems:"center",padding:"10px 16px",borderBottom:`1px solid ${T.border}`}}>
          <span style={{fontSize:11,fontFamily:F.m,fontWeight:900,color:T.ink4}}>{i+1}</span>
          <span style={{minWidth:0}}>
            <span style={{display:"block",fontSize:11.5,fontWeight:700,color:T.ink,fontFamily:F.b}}>{r.name}</span>
            <button onClick={()=>setTab&&setTab("policies")} style={{background:"transparent",border:"none",padding:0,fontSize:8.5,color:AI_GOLD_INK,fontFamily:F.m,cursor:"pointer"}}>{r.policy.key} {r.policy.name} · {r.clauseRef}</button>
          </span>
          <Tag label={T_(r.action)} color={r.action==="Block"?T.red:r.action==="Redact"||r.action==="Mask"?T.amber:T.blue} bg={(r.action==="Block"?T.red:r.action==="Redact"||r.action==="Mask"?T.amber:T.blue)+"14"}/>
          <span style={{fontSize:13,fontFamily:F.m,fontWeight:900,color:T.ink,textAlign:"right"}}>{r.violationsMtd}</span>
          <span style={{fontSize:10,fontFamily:F.m,fontWeight:800,color:r.trend.startsWith("+")?T.amber:T.green,textAlign:"right"}}>{r.trend}</span>
        </div>)}
        {live.length>0&&<div style={{padding:"10px 16px",background:T.s1}}>
          <div style={{fontSize:8.5,fontWeight:900,fontFamily:F.m,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{T_("Live events - this session")}</div>
          {live.map((v,i)=><div key={i} style={{fontSize:10,color:T.ink3,fontFamily:F.b,lineHeight:1.6}}>
            <span style={{color:v.action==="Blocked"?T.red:T.amber,fontWeight:800}}>{T_(v.action)}</span> · {v.rule} · {v.policy} · {v.model||"gateway"} · {v.time}
          </div>)}
        </div>}
      </Card>;
    })()}
    <div style={{background:AI_GOLD_L,border:`1px solid ${AI_GOLD}35`,borderRadius:10,padding:"11px 14px",marginBottom:14,fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.6}}>
      <strong style={{color:AI_GOLD_INK}}>{T_("AI Gateway is the enterprise control plane.")}</strong>{T_(" Every AI interaction passes through it - prompt filtering, PII detection, policy enforcement, model routing and cost control. Employee Workspace consumes the Gateway; it never bypasses it.")}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1.1fr .9fr",gap:14,marginBottom:14}}>
      <Card style={{padding:0,overflow:"hidden"}}>
        <div style={{padding:"14px 18px",borderBottom:"1px solid "+T.border,display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}><h3 style={{margin:0,fontSize:14,color:T.ink}}>{T_("Model providers & spend")}</h3><span style={{fontSize:9,color:T.ink4,fontFamily:F.m}}>{T_("cost = tokens × price book")}</span></div>
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr>{["Provider","Status","Routed","Cost MTD","Budget used"].map(h=><th key={h} style={{textAlign:"left",padding:"9px 12px",color:T.ink3,fontSize:9,fontFamily:F.m,letterSpacing:"0.12em",textTransform:"uppercase",borderBottom:"1px solid "+T.border}}>{T_(h)}</th>)}</tr></thead>
          <tbody>{spend.map(p=><tr key={p.id} style={{borderBottom:"1px solid "+T.border}}>
            <td style={{padding:"11px 12px",color:T.ink,fontWeight:700}}>{p.name}<div style={{fontSize:9,color:T.ink4,fontWeight:400}}>{p.kind} · {fmtTokens(p.tokens)} {T_("tokens")}</div></td>
            <td style={{padding:"11px 12px"}}><Tag label={T_(p.status)} color={p.status==="Approved"?T.green:p.status==="Restricted"?T.amber:T.red} bg={(p.status==="Approved"?T.green:p.status==="Restricted"?T.amber:T.red)+"16"}/></td>
            <td style={{padding:"11px 12px",minWidth:78}}><Bar value={p.routedShare} color={rc}/><div style={{fontSize:9,color:T.ink3,marginTop:4}}>{p.routedShare}%</div></td>
            <td style={{padding:"11px 12px",color:T.ink,fontFamily:F.m,fontWeight:800}}>{fmtUSD(p.cost)}</td>
            <td style={{padding:"11px 12px",minWidth:96}}><Bar value={Math.min(100,p.utilization)} color={p.overBudget?T.red:p.utilization>90?T.amber:T.green}/><div style={{fontSize:9,color:p.overBudget?T.red:T.ink3,marginTop:4,fontFamily:F.m,fontWeight:p.overBudget?800:400}}>{p.utilization}% of {fmtUSD(p.budget)}{p.overBudget?" · over":""}</div></td>
          </tr>)}</tbody>
        </table></div>
      </Card>
      <Card style={{padding:16}}>
        <h3 style={{fontSize:14,color:T.ink,margin:"0 0 12px"}}>{T_("Enforcement policies")}</h3>
        <div style={{display:"grid",gap:8}}>
          {gatewayPolicies.map(p=><div key={p.id} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px",display:"flex",justifyContent:"space-between",gap:10,alignItems:"center"}}>
            <div style={{minWidth:0}}><div style={{fontSize:12,color:T.ink,fontWeight:800,fontFamily:F.b}}>{T_(p.name)}</div><div style={{fontSize:9,color:T.ink3,fontFamily:F.b,marginTop:2}}>{T_(p.category)} - {T_("Triggered")} {p.triggeredMtd.toLocaleString()}x {T_("MTD")}</div></div>
            <Tag label={T_(p.enforcement)} color={p.enforcement==="Block"?T.red:p.enforcement==="Redact"?T.amber:p.enforcement==="Route to review"?T.blue:T.ink3} bg={(p.enforcement==="Block"?T.red:p.enforcement==="Redact"?T.amber:p.enforcement==="Route to review"?T.blue:T.ink3)+"16"}/>
          </div>)}
        </div>
      </Card>
    </div>
    {/* ── FinOps: enterprise AI spend vs budget, computed from the price
        book, with the runtime Cost & Token Guard that enforces it. ── */}
    <Card style={{padding:0,overflow:"hidden",marginBottom:14}}>
      <div style={{padding:"14px 18px",borderBottom:"1px solid "+T.border,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <h3 style={{margin:0,fontSize:14,color:T.ink}}>{T_("AI FinOps — spend vs budget")}</h3>
        <button onClick={()=>setTab&&setTab("policies")} style={{background:"transparent",border:"none",color:AI_GOLD_INK,fontSize:10,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>POL-FIN-005 · {ar?"حارس التكلفة والرموز":"Cost & Token Guard"} →</button>
      </div>
      <div style={{padding:"16px 18px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:16,alignItems:"start"}}>
        <div>
          <div style={{fontSize:9,fontWeight:900,fontFamily:F.m,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{T_("Enterprise spend MTD")}</div>
          <div style={{fontSize:24,fontWeight:900,fontFamily:F.m,color:cost.utilization>100?T.red:cost.utilization>90?T.amber:T.green}}>{fmtUSD(cost.costMtd)} <span style={{fontSize:11,color:T.ink3,fontWeight:700}}>{T_("of")} {fmtUSD(cost.budgetMtd)}</span></div>
          <div style={{marginTop:7}}><Bar value={Math.min(100,cost.utilization)} color={cost.utilization>100?T.red:cost.utilization>90?T.amber:AI_GOLD}/></div>
          <div style={{fontSize:10,color:T.ink3,fontFamily:F.b,marginTop:6}}>{cost.utilization}% {T_("of monthly budget · blended")} {`$${cost.blendedPer1M.toFixed(2)}`}/1M {T_("tokens")}</div>
        </div>
        <div>
          <div style={{fontSize:9,fontWeight:900,fontFamily:F.m,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{T_("Budget breaches")}</div>
          {cost.overBudget.length?cost.overBudget.map(p=><div key={p.id} style={{display:"flex",justifyContent:"space-between",gap:8,fontSize:11,fontFamily:F.b,color:T.ink2,padding:"3px 0"}}><span style={{color:T.red,fontWeight:800}}>{p.name}</span><span style={{fontFamily:F.m,fontWeight:800,color:T.red}}>{p.utilization}%</span></div>):<div style={{fontSize:11,color:T.green,fontFamily:F.b}}>{T_("Every provider within its cap.")}</div>}
          {cost.overBudget.length>0&&<div style={{fontSize:9.5,color:T.ink4,fontFamily:F.b,marginTop:6,lineHeight:1.5}}>{T_("Escalated to the CFO's FinOps review queue — spend above cap is routed, not blocked.")}</div>}
        </div>
        <div>
          <div style={{fontSize:9,fontWeight:900,fontFamily:F.m,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{T_("Runtime guard")}</div>
          <div style={{fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.55}}>{ar?<>يُقاس كل مطالبة عند البوابة. أي طلب واحد يتجاوز <strong style={{color:T.ink}}>6,000 رمز</strong> يُفعّل حارس التكلفة والرموز ويُوجَّه للمراجعة — سياسة العمليات المالية المُنفَّذة مباشرةً، لا بعد الفاتورة.</>:<>Every prompt is metered at the gateway. A single request over <strong style={{color:T.ink}}>6,000 tokens</strong> trips the Cost &amp; Token Guard and is routed to review — the FinOps policy enforced in-line, not after the invoice.</>}</div>
        </div>
      </div>
    </Card>
    <Card style={{padding:0,overflow:"hidden"}}>
      <div style={{padding:"14px 18px",borderBottom:"1px solid "+T.border,display:"flex",justifyContent:"space-between",alignItems:"center"}}><h3 style={{margin:0,fontSize:14,color:T.ink}}>{T_("Live prompt log")}</h3><Tag label={T_("Streaming")} color={T.green} bg={T.greenL}/></div>
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
        <thead><tr>{["Time","User","Business unit","Provider / model","Risk","Action","Tokens","Cost"].map(h=><th key={h} style={{textAlign:"left",padding:"9px 12px",color:T.ink3,fontSize:9,fontFamily:F.m,letterSpacing:"0.12em",textTransform:"uppercase",borderBottom:"1px solid "+T.border}}>{T_(h)}</th>)}</tr></thead>
        <tbody>{gatewayLog.map(l=>{const pid=(gatewayProviders.find(x=>x.name===l.provider)||{}).id;const c=l.tokens?costOf(l.tokens,pid):0;return <tr key={l.id} style={{borderBottom:"1px solid "+T.border}}>
          <td style={{padding:"10px 12px",color:T.ink3,fontFamily:F.m}}>{l.time}</td>
          <td style={{padding:"10px 12px",color:T.ink2}}>{l.user}</td>
          <td style={{padding:"10px 12px",color:T.ink2}}>{l.unit}</td>
          <td style={{padding:"10px 12px",color:T.ink2}}>{l.provider}<div style={{fontSize:9,color:T.ink4}}>{l.model}</div></td>
          <td style={{padding:"10px 12px"}}><span style={{color:l.riskScore>=60?T.red:l.riskScore>=30?T.amber:T.green,fontFamily:F.m,fontWeight:800}}>{l.riskScore}</span></td>
          <td style={{padding:"10px 12px"}}><Tag label={T_(l.action)} color={gwActionColor(l.action)} bg={gwActionColor(l.action)+"16"}/></td>
          <td style={{padding:"10px 12px",color:T.ink3,fontFamily:F.m}}>{l.tokens.toLocaleString()}</td>
          <td style={{padding:"10px 12px",color:T.ink2,fontFamily:F.m}}>{l.tokens?fmtUSD(c):"—"}</td>
        </tr>;})}</tbody>
      </table></div>
    </Card>
    </div>}
  </div>;};

  /* ── Governance Academy ────────────────────────────────────── */
  const Academy=()=><div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10,marginBottom:14}}>
      {items.map(i=><Card key={i.id} style={{padding:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div style={{fontSize:12,color:T.ink,fontWeight:800,fontFamily:F.b}}>{i.unit}</div><Tag label={T_(i.resistance)+" "+T_("resistance")} color={i.resistance==="High"?T.red:i.resistance==="Medium"?T.amber:T.green} bg={(i.resistance==="High"?T.red:i.resistance==="Medium"?T.amber:T.green)+"14"}/></div>
        <Bar value={parseInt(i.training)||0} color={(parseInt(i.training)||0)>75?T.green:T.amber}/>
        <div style={{fontSize:10,color:T.ink3,fontFamily:F.b,marginTop:7}}>{T_("Learning completion")} {i.training}</div>
      </Card>)}
    </div>
    <div style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 14px",marginBottom:14,display:"flex",gap:16,flexWrap:"wrap",fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.6}}>
      <span><strong style={{color:rc}}>{ar?"توصية تلقائية:":"Auto-recommend:"}</strong> {ar?"انخفاض درجة الحوكمة يُفعّل تعلّماً مُوصى به.":"a falling governance score triggers recommended learning."}</span>
      <span><strong style={{color:T.red}}>{ar?"إسناد تلقائي:":"Auto-assign:"}</strong> {ar?"الانتهاكات المتكرّرة للسياسات تُسنِد تدريباً إلزامياً.":"repeated policy violations assign mandatory training."}</span>
    </div>
    <PageGovernanceAcademy role={role} sessionMode={sessionMode} showToast={showToast} setTab={setTab}/>
  </div>;

  /* ── AI Repository: the enterprise inventory of live AI agents and
     projects — each with its accountable owner and a system-architecture
     summary (model, data, integrations, guardrails). Replaces the abstract
     operating-model map on the Executive Dashboard with something concrete:
     what AI actually exists, who owns it, and how it's built. ── */
  const AI_REPOSITORY=[
    {name:"Customer Resolution Copilot",type:"GenAI Agent",owner:"Aisha Patel",unit:"Customer Operations",status:["Pilot","info"],
      desc:"Drafts and suggests responses for support agents, grounded in CRM context and the knowledge base, to cut resolution time.",
      arch:{Model:"Claude Sonnet · via AI Gateway",Data:"CRM tickets · KB articles",Integrations:"ServiceNow · Zendesk",Guardrails:"PII redaction · prompt-shield"}},
    {name:"Fraud Detection Model",type:"ML Model",owner:"D. Osei",unit:"Retail Banking",status:["Production","good"],
      desc:"Scores transactions in real time for fraud risk and flags anomalies to the case-management queue for review.",
      arch:{Model:"Gradient-boosted ensemble v3",Data:"Transaction stream · device signals",Integrations:"Core banking · case mgmt",Guardrails:"Drift monitor · human review"}},
    {name:"Finance Close Automation",type:"GenAI Agent",owner:"Elena Rossi · Finance",unit:"Finance",status:["Scaling","good"],
      desc:"Automates reconciliations and drafts close-cycle journal narratives, keeping a human approval gate before posting.",
      arch:{Model:"GPT-4o · via AI Gateway",Data:"Ledger · reconciliations",Integrations:"ERP · close workflow",Guardrails:"Approval gate · evidence log"}},
    {name:"Credit Decision Assurance",type:"Decision Model",owner:"Omar Khan · Retail Banking",unit:"Retail Banking",status:["Remediate","warn"],
      desc:"Recommends credit decisions with a written rationale; every adverse outcome routes to mandatory human review.",
      arch:{Model:"Scorecard + LLM rationale",Data:"Applications · bureau data",Integrations:"Loan origination",Guardrails:"Art.22 human review · DPIA"}},
    {name:"Workforce Skills Navigator",type:"GenAI Agent",owner:"CHRO office",unit:"People",status:["Assessment","info"],
      desc:"Maps employees to reskilling paths from a skills graph and role profiles, with consent and bias checks before use.",
      arch:{Model:"Gradient-boosted ranker",Data:"Skills graph · role profiles",Integrations:"HRIS · LMS",Guardrails:"Consent · bias eval"}},
    {name:"Supplier Risk Screener",type:"GenAI Agent",owner:"Procurement",unit:"Operations",status:["Pilot","info"],
      desc:"Summarises supplier filings and news into a risk brief for procurement, citing every source it draws from.",
      arch:{Model:"Claude Haiku · via AI Gateway",Data:"Vendor filings · news",Integrations:"Procurement suite",Guardrails:"Source citation · rate-limit"}},
  ];
  const RepositoryPanel=()=><Card style={{padding:"16px 18px",marginTop:14}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:12,flexWrap:"wrap",marginBottom:13}}>
      <div>
        <div style={{fontSize:9.5,letterSpacing:"0.14em",textTransform:"uppercase",color:T.ink4,fontWeight:800,fontFamily:F.m,marginBottom:3}}>{T_("AI Repository")}</div>
        <div style={{fontSize:14,fontWeight:800,color:T.ink,fontFamily:F.b}}>{T_("Live AI agents & projects — owner and system architecture")}</div>
      </div>
      {access.modules.includes("repository")&&<button onClick={()=>openModule("repository")} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:8,padding:"7px 13px",color:AI_GOLD_INK,fontSize:10.5,fontWeight:900,fontFamily:F.b,cursor:"pointer",whiteSpace:"nowrap"}}>{T_("Open AI Repository →")}</button>}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:10}}>
      {AI_REPOSITORY.map(a=><div key={a.name} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:11,padding:"12px 14px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:9}}>
          <div style={{minWidth:0}}>
            <div style={{fontSize:12.5,fontWeight:800,color:T.ink,fontFamily:F.b}}>{a.name}</div>
            <div style={{fontSize:9.5,color:T.ink3,fontFamily:F.b,marginTop:2}}>{T_(a.type)} · {a.unit}</div>
          </div>
          <Tag label={T_(a.status[0])} color={lensCol(a.status[1])} bg={lensCol(a.status[1])+"18"}/>
        </div>
        <p style={{fontSize:10.5,color:T.ink3,fontFamily:F.b,lineHeight:1.55,margin:"0 0 10px"}}>{T_(a.desc)}</p>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10,paddingBottom:10,borderBottom:`1px solid ${T.border}`}}>
          <span style={{fontSize:8.5,fontFamily:F.m,fontWeight:900,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em"}}>{T_("Owner")}</span>
          <span style={{fontSize:10.5,fontWeight:800,color:AI_GOLD_INK,fontFamily:F.b}}>{a.owner}</span>
        </div>
        <div style={{fontSize:8.5,fontFamily:F.m,fontWeight:900,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>{T_("System architecture")}</div>
        <div style={{display:"grid",gap:5}}>
          {Object.entries(a.arch).map(([k,v])=><div key={k} style={{display:"grid",gridTemplateColumns:"84px 1fr",gap:8,alignItems:"baseline"}}>
            <span style={{fontSize:9.5,color:T.ink3,fontFamily:F.m,fontWeight:700}}>{T_(k)}</span>
            <span style={{fontSize:10,color:T.ink2,fontFamily:F.b,lineHeight:1.4}}>{v}</span>
          </div>)}
        </div>
      </div>)}
    </div>
  </Card>;

  /* ── AI Strategy ── ambition · investment · roadmap ── */
  const STRAT_PILLARS=[["Productivity","Automate high-volume, low-variance work behind a human gate","$5.4M",78,"gold"],["Growth","AI-native products and customer experiences","$4.2M",54,"good"],["Risk & Trust","Govern, secure and prove every AI system","$2.1M",71,"blue"],["Workforce","Reskill and enable the whole organisation","$1.7M",61,"teal"]];
  const AIStrategy=()=><div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12,marginBottom:14}}>
      <Metric label="Strategic pillars" value="4" sub="board-agreed" color={rc}/>
      <Metric label="FY26 investment" value={`$${PF.budget.toFixed(1)}M`} sub="allocated across pillars" color={AI_GOLD}/>
      <Metric label="On roadmap" value="12" sub="initiatives sequenced" color={T.blue}/>
      <Metric label="Maturity target" value="3.8" sub="of 5 by FY27" color={T.teal} score={76}/>
    </div>
    <Card style={{padding:"16px 18px",marginBottom:14}}>
      <div style={{fontSize:14,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:12}}>{T_("Strategic pillars — where AI investment goes")}</div>
      <div style={{display:"grid",gap:11}}>{STRAT_PILLARS.map(p=><div key={p[0]} style={{display:"grid",gridTemplateColumns:"minmax(0,1.4fr) 90px minmax(120px,1fr)",gap:12,alignItems:"center"}}>
        <div style={{minWidth:0}}><div style={{fontSize:12.5,fontWeight:800,color:T.ink,fontFamily:F.b}}>{T_(p[0])}</div><div style={{fontSize:10,color:T.ink3,fontFamily:F.b,marginTop:1}}>{T_(p[1])}</div></div>
        <div style={{fontSize:14,fontWeight:800,fontFamily:F.m,color:lensCol(p[4])}}>{p[2]}</div>
        <div><Bar value={p[3]} color={lensCol(p[4])}/><div style={{fontSize:9,color:T.ink3,marginTop:3,fontFamily:F.b}}>{p[3]}% {T_("of ambition funded")}</div></div>
      </div>)}</div>
    </Card>
    <Card style={{padding:"16px 18px"}}>
      <div style={{fontSize:14,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:12}}>{T_("Roadmap — initiatives by lifecycle horizon")}</div>
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11.5,fontFamily:F.b}}>
        <thead><tr>{["Initiative","Business unit","Horizon","Value at stake"].map(h=><th key={h} style={{textAlign:"left",fontSize:9,letterSpacing:"0.06em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m,padding:"0 10px 9px",borderBottom:`1px solid ${T.border}`}}>{T_(h)}</th>)}</tr></thead>
        <tbody>{items.map(i=><tr key={i.id} onClick={()=>openInitiative(i.id,"overview")} style={{cursor:"pointer"}} className="vz-pn-row">
          <td style={{padding:"11px 10px",borderBottom:`1px solid ${T.border}`,color:T.ink,fontWeight:700}}>{i.name}</td>
          <td style={{padding:"11px 10px",borderBottom:`1px solid ${T.border}`,color:T.ink2}}>{i.unit}</td>
          <td style={{padding:"11px 10px",borderBottom:`1px solid ${T.border}`}}><Tag label={["Scaling","Production"].includes(i.lifecycle)?T_("Now"):["Pilot"].includes(i.lifecycle)?T_("Next"):T_("Later")} color={["Scaling","Production"].includes(i.lifecycle)?T.green:["Pilot"].includes(i.lifecycle)?T.blue:T.ink3} bg={(["Scaling","Production"].includes(i.lifecycle)?T.green:["Pilot"].includes(i.lifecycle)?T.blue:T.ink3)+"18"}/></td>
          <td style={{padding:"11px 10px",borderBottom:`1px solid ${T.border}`,color:T.ink2,fontFamily:F.m}}>{i.expected}</td>
        </tr>)}</tbody>
      </table></div>
    </Card>
  </div>;

  /* ── AI Inventory ── systems · datasets · vendors ── */
  const [invTab,setInvTab]=useState("systems");
  const INV_DATASETS=[["Customer interactions","Confidential","EU",true],["Credit histories","Restricted","EU",true],["Financial ledgers","Confidential","US",false],["Employee records","Restricted","EU",true],["Support transcripts","Internal","US",false],["Product telemetry","Internal","Global",false]];
  const AIInventory=()=><div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:14}}>
      <Metric label="AI systems" value={MODEL_REGISTRY.length} sub="catalogued" color={rc}/>
      <Metric label="Datasets" value={INV_DATASETS.length+"·38"} sub="classified" color={T.teal}/>
      <Metric label="Approved vendors" value={gatewayProviders.length} sub="under contract" color={AI_GOLD}/>
      <Metric label="Shadow AI" value="2" sub="in intake" color={T.amber}/>
    </div>
    <SubTabs tabs={[["systems","Systems & models"],["datasets","Datasets"],["vendors","Vendors"]]} active={invTab} onChange={setInvTab}/>
    {invTab==="systems"&&<Card style={{padding:0,overflow:"hidden"}}>
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11.5,fontFamily:F.b}}>
        <thead><tr>{["System / model","Vendor","EU AI Act","Status"].map(h=><th key={h} style={{textAlign:"left",fontSize:9,letterSpacing:"0.06em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m,padding:"12px 14px 9px",borderBottom:`1px solid ${T.border}`}}>{T_(h)}</th>)}</tr></thead>
        <tbody>{MODEL_REGISTRY.map(m=><tr key={m.id} style={{borderBottom:`1px solid ${T.border}`}}>
          <td style={{padding:"11px 14px",color:T.ink,fontWeight:700}}>{m.bizName}<div style={{fontSize:9,color:T.ink4,fontFamily:F.m,fontWeight:400}}>{m.name}</div></td>
          <td style={{padding:"11px 14px",color:T.ink2}}>{m.vendor}</td>
          <td style={{padding:"11px 14px"}}><Tag label={T_(m.euAiAct)} color={m.euAiAct==="High-Risk"||m.euAiAct==="Unclassified"?T.red:m.euAiAct==="Minimal Risk"?T.green:T.amber} bg={(m.euAiAct==="High-Risk"||m.euAiAct==="Unclassified"?T.red:m.euAiAct==="Minimal Risk"?T.green:T.amber)+"16"}/></td>
          <td style={{padding:"11px 14px"}}><Tag label={T_(m.status)} color={m.status==="In Production"?T.green:m.status==="Awaiting Approval"?T.amber:T.ink3} bg={(m.status==="In Production"?T.green:m.status==="Awaiting Approval"?T.amber:T.ink3)+"16"}/></td>
        </tr>)}</tbody>
      </table></div>
    </Card>}
    {invTab==="datasets"&&<Card style={{padding:0,overflow:"hidden"}}>
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11.5,fontFamily:F.b}}>
        <thead><tr>{["Dataset","Classification","Residency","PII"].map(h=><th key={h} style={{textAlign:"left",fontSize:9,letterSpacing:"0.06em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m,padding:"12px 14px 9px",borderBottom:`1px solid ${T.border}`}}>{T_(h)}</th>)}</tr></thead>
        <tbody>{INV_DATASETS.map((d,i)=><tr key={i} style={{borderBottom:`1px solid ${T.border}`}}>
          <td style={{padding:"11px 14px",color:T.ink,fontWeight:700}}>{T_(d[0])}</td>
          <td style={{padding:"11px 14px"}}><Tag label={T_(d[1])} color={d[1]==="Restricted"?T.red:d[1]==="Confidential"?T.amber:T.blue} bg={(d[1]==="Restricted"?T.red:d[1]==="Confidential"?T.amber:T.blue)+"16"}/></td>
          <td style={{padding:"11px 14px",color:T.ink2,fontFamily:F.m}}>{d[2]}</td>
          <td style={{padding:"11px 14px"}}><Tag label={d[3]?T_("PII"):T_("None")} color={d[3]?T.amber:T.green} bg={(d[3]?T.amber:T.green)+"16"}/></td>
        </tr>)}</tbody>
      </table></div>
    </Card>}
    {invTab==="vendors"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:12}}>
      {gatewayProviders.map(p=><Card key={p.id} style={{padding:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div style={{fontSize:13,fontWeight:800,color:T.ink,fontFamily:F.b}}>{p.name}</div><Tag label={T_(p.status)} color={p.status==="Approved"?T.green:p.status==="Restricted"?T.amber:T.red} bg={(p.status==="Approved"?T.green:p.status==="Restricted"?T.amber:T.red)+"16"}/></div>
        <div style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{p.kind}</div>
        <div style={{fontSize:10.5,color:T.ink2,fontFamily:F.b,marginTop:8}}>{p.models.join(", ")}</div>
      </Card>)}
    </div>}
  </div>;

  /* ── AI Lifecycle ── the 13-phase governed journey + workspace + PMO ── */
  const [lcTab,setLcTab]=useState("board");
  const lcCol=lc=>["Scaling"].includes(lc)?T.green:["Production","Pilot"].includes(lc)?AI_GOLD:["Retired"].includes(lc)?T.red:T.blue;
  const AILifecycle=()=><div>
    <SubTabs tabs={[["board","Phase Board"],["initiatives","Initiative Workspaces"],["pmo","AI PMO"]]} active={lcTab} onChange={setLcTab}/>
    {lcTab==="board"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:14}}>
        <Metric label="Active initiatives" value={items.length} sub="on the journey" color={rc}/>
        <Metric label="At a gate" value="2" sub="awaiting decision" color={T.amber}/>
        <Metric label="Scale-ready" value="2" sub="evidence complete" color={T.green}/>
        <Metric label="Canonical phases" value={AC_PHASES.length} sub="opportunity → retire" color={T.blue}/>
      </div>
      <Card style={{padding:"16px 18px"}}>
        <div style={{fontSize:14,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:4}}>{T_("Governed lifecycle — where each initiative sits")}</div>
        <div style={{fontSize:10.5,color:T.ink3,fontFamily:F.b,marginBottom:14}}>{T_("Every initiative advances phase by phase; each gate needs evidence before it opens.")}</div>
        <div style={{display:"grid",gap:12}}>{items.map(i=>{const pi=i.phaseIndex||0;const ph=AC_PHASES[pi];return <div key={i.id} onClick={()=>openInitiative(i.id,"journey")} style={{cursor:"pointer",background:T.s2,border:`1px solid ${T.border}`,borderRadius:10,padding:"12px 14px"}} className="vz-pn-row">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:9}}>
            <div style={{fontSize:12.5,fontWeight:800,color:T.ink,fontFamily:F.b}}>{i.name} <span style={{fontSize:9.5,color:T.ink3,fontWeight:600}}>· {i.unit}</span></div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}><Tag label={T_(i.lifecycle)} color={lcCol(i.lifecycle)} bg={lcCol(i.lifecycle)+"16"}/><span style={{fontSize:9.5,color:T.ink3,fontFamily:F.m,fontWeight:700}}>{T_("Phase")} {pi+1}/{AC_PHASES.length} · {T_(ph?.name)}</span></div>
          </div>
          <div style={{display:"flex",gap:3}}>{AC_PHASES.map((p,idx)=><div key={p.id} title={T_(p.name)} style={{flex:1,height:6,borderRadius:3,background:idx<pi?T.green:idx===pi?AI_GOLD:T.s3}}/>)}</div>
        </div>;})}</div>
      </Card>
    </div>}
    {lcTab==="initiatives"&&<Initiatives/>}
    {lcTab==="pmo"&&renderEnterprisePmo()}
  </div>;

  /* ── Trust Center ── live posture and attestations ── */
  const TRUST_ATTEST=[["ISO 42001 AIMS","Certified","Feb 2026","good"],["EU AI Act readiness","In progress","Aug 2026","warn"],["SOC 2 Type II","Current","Jan 2026","good"],["GDPR Art.22 safeguards","Attested","Mar 2026","good"],["NIST AI RMF","Aligned","Apr 2026","good"],["Model transparency notices","Published","live","good"]];
  const TrustCenter=()=><div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:14}}>
      <Metric label="Trust posture" value="82" sub="live composite" color={T.green} score={82}/>
      <Metric label="Attacks blocked" value="2,410" sub="last 30 days" color={T.blue}/>
      <Metric label="Open incidents" value={String(OPEN_INCIDENTS)} sub="1 P1 · prompt-injection" color={T.red}/>
      <Metric label="Attestations" value="6" sub="current" color={AI_GOLD}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1.1fr .9fr",gap:14}}>
      <Card style={{padding:"16px 18px"}}>
        <div style={{fontSize:14,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:12}}>{T_("Attestations & certifications")}</div>
        <div style={{display:"grid",gap:8}}>{TRUST_ATTEST.map(a=><div key={a[0]} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 13px"}}>
          <div><div style={{fontSize:12,fontWeight:700,color:T.ink,fontFamily:F.b}}>{T_(a[0])}</div><div style={{fontSize:9.5,color:T.ink3,fontFamily:F.b,marginTop:1}}>{T_("as of")} {a[2]}</div></div>
          <Tag label={T_(a[1])} color={lensCol(a[3]==="good"?"good":"warn")} bg={lensCol(a[3]==="good"?"good":"warn")+"16"}/>
        </div>)}</div>
      </Card>
      <Card style={{padding:"16px 18px"}}>
        <div style={{fontSize:14,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:12}}>{T_("Live guardrail enforcement")}</div>
        <div style={{display:"grid",gap:8}}>{guardrailDetectors.slice(0,6).map(d=><div key={d.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
          <div style={{minWidth:0}}><div style={{fontSize:11.5,fontWeight:700,color:T.ink,fontFamily:F.b}}>{T_(d.name)}</div><div style={{fontSize:9,color:T.ink3,fontFamily:F.b}}>{d.triggeredMtd.toLocaleString()}× {T_("MTD")}</div></div>
          <Tag label={T_(d.action)} color={d.action==="Block"?T.red:d.action==="Escalate"?T.violet:d.action==="Mask"||d.action==="Redact"?T.amber:T.green} bg={(d.action==="Block"?T.red:d.action==="Escalate"?T.violet:d.action==="Mask"||d.action==="Redact"?T.amber:T.green)+"16"}/>
        </div>)}</div>
      </Card>
    </div>
  </div>;

  /* ── Policies & Standards ── policy library + violations ── */
  const [polTab,setPolTab]=useState("library");
  const PoliciesStandards=()=><div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:14}}>
      <Metric label="Active policies" value={POLICY_REGISTER.length} sub="in force" color={rc}/>
      <Metric label="Overdue review" value={POLICY_REGISTER.filter(p=>p.overdueDays>0).length} sub="past due date" color={T.amber}/>
      <Metric label="Avg acknowledgement" value={Math.round(POLICY_REGISTER.reduce((s,p)=>s+p.ackCoverage,0)/POLICY_REGISTER.length)+"%"} sub="workforce" color={T.green}/>
      <Metric label="Standards mapped" value="5" sub="frameworks" color={T.blue}/>
    </div>
    <SubTabs tabs={[["library","Policy Library"],["violations","Violation Analytics"]]} active={polTab} onChange={setPolTab}/>
    {polTab==="library"&&<Card style={{padding:0,overflow:"hidden"}}>
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11.5,fontFamily:F.b}}>
        <thead><tr>{["Policy","Owner","Version","Next review","Ack"].map(h=><th key={h} style={{textAlign:"left",fontSize:9,letterSpacing:"0.06em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m,padding:"12px 14px 9px",borderBottom:`1px solid ${T.border}`}}>{T_(h)}</th>)}</tr></thead>
        <tbody>{POLICY_REGISTER.map(p=><tr key={p.id} style={{borderBottom:`1px solid ${T.border}`}}>
          <td style={{padding:"11px 14px",color:T.ink,fontWeight:700}}>{p.name}<div style={{fontSize:9,color:T.ink4,fontFamily:F.m,fontWeight:400}}>{p.key} · {T_(p.category)}</div></td>
          <td style={{padding:"11px 14px",color:T.ink2}}>{p.owner}</td>
          <td style={{padding:"11px 14px",color:T.ink3,fontFamily:F.m}}>{p.version}</td>
          <td style={{padding:"11px 14px"}}><Tag label={p.nextReview} color={p.overdueDays>0?T.red:T.ink3} bg={p.overdueDays>0?T.red+"16":"transparent"}/></td>
          <td style={{padding:"11px 14px",color:p.ackCoverage>=85?T.green:T.amber,fontFamily:F.m,fontWeight:800}}>{p.ackCoverage}%</td>
        </tr>)}</tbody>
      </table></div>
    </Card>}
    {polTab==="violations"&&<Card style={{padding:"16px 18px"}}>
      <div style={{fontSize:14,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:12}}>{T_("Top rules by violations — last 30 days")}</div>
      <div style={{display:"grid",gap:7}}>{POLICY_REGISTER.flatMap(p=>p.rules.map(r=>({...r,pol:p.name}))).sort((a,b)=>b.violationsMtd-a.violationsMtd).slice(0,8).map((r,i)=><div key={r.id} style={{display:"grid",gridTemplateColumns:"20px 1fr 100px 70px",gap:10,alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
        <span style={{fontSize:11,fontFamily:F.m,fontWeight:900,color:T.ink4}}>{i+1}</span>
        <div style={{minWidth:0}}><div style={{fontSize:11.5,fontWeight:700,color:T.ink,fontFamily:F.b}}>{r.name}</div><div style={{fontSize:9,color:T.ink3,fontFamily:F.b}}>{r.pol}</div></div>
        <Tag label={T_(r.action)} color={r.action==="Block"?T.red:r.action==="Redact"||r.action==="Mask"?T.amber:T.blue} bg={(r.action==="Block"?T.red:r.action==="Redact"||r.action==="Mask"?T.amber:T.blue)+"14"}/>
        <span style={{fontSize:13,fontFamily:F.m,fontWeight:900,color:T.ink,textAlign:"right"}}>{r.violationsMtd.toLocaleString()}</span>
      </div>)}</div>
    </Card>}
  </div>;

  /* ── Value Realization ── expected vs realized ROI ── */
  const totExp=items.reduce((s,i)=>s+money(i.expected),0),totAct=items.reduce((s,i)=>s+money(i.actual),0);
  const ValueRealization=()=>{const S=sustainabilityStats();return <div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:14}}>
      <Metric label="Expected value" value={"$"+totExp.toFixed(1)+"M"} sub="portfolio target" color={AI_GOLD}/>
      <Metric label="Realized value" value={"$"+totAct.toFixed(1)+"M"} sub={Math.round(totAct/totExp*100)+"% captured"} color={T.green} score={Math.round(totAct/totExp*100)}/>
      <Metric label="Portfolio ROI" value="+22%" sub="weighted actual" color={T.green}/>
      <Metric label="Value at risk" value="$2.1M" sub="no value yet" color={T.amber}/>
    </div>
    <Card style={{padding:"16px 18px"}}>
      <div style={{fontSize:14,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:12}}>{T_("Value bridge — expected vs realized by initiative")}</div>
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11.5,fontFamily:F.b}}>
        <thead><tr>{["Initiative","Expected","Realized","Capture","Health"].map(h=><th key={h} style={{textAlign:"left",fontSize:9,letterSpacing:"0.06em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m,padding:"0 10px 9px",borderBottom:`1px solid ${T.border}`}}>{T_(h)}</th>)}</tr></thead>
        <tbody>{items.map(i=>{const cap=Math.round(money(i.actual)/money(i.expected)*100)||0;return <tr key={i.id} onClick={()=>openInitiative(i.id,"value")} style={{cursor:"pointer"}} className="vz-pn-row">
          <td style={{padding:"11px 10px",borderBottom:`1px solid ${T.border}`,color:T.ink,fontWeight:700}}>{i.name}</td>
          <td style={{padding:"11px 10px",borderBottom:`1px solid ${T.border}`,color:T.ink2,fontFamily:F.m}}>{i.expected}</td>
          <td style={{padding:"11px 10px",borderBottom:`1px solid ${T.border}`,color:T.ink2,fontFamily:F.m}}>{i.actual}</td>
          <td style={{padding:"11px 10px",borderBottom:`1px solid ${T.border}`,minWidth:110}}><Bar value={cap} color={cap>=50?T.green:cap>=25?T.amber:T.red}/><div style={{fontSize:9,color:T.ink3,marginTop:3}}>{cap}%</div></td>
          <td style={{padding:"11px 10px",borderBottom:`1px solid ${T.border}`,color:T.ink,fontFamily:F.m,fontWeight:700}}>{i.valueScore}</td>
        </tr>;})}</tbody>
      </table></div>
    </Card>

    {/* ── Environmental footprint · the "Measure" plane (ISO/IEC TR 20226) ── */}
    <div style={{marginTop:18,display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
      <span style={{fontSize:9.5,fontWeight:900,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.12em",whiteSpace:"nowrap"}}>{T_("Environmental footprint")}</span>
      <Tag label="ISO/IEC TR 20226" color={T.green} bg={T.green+"16"}/>
      <span style={{flex:1,height:1,background:`linear-gradient(90deg,${T.border},transparent)`}}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:14}}>
      <Metric label="Energy use" value={`${S.mwhMo} MWh`} sub="per month · PUE 1.4" color={T.blue}/>
      <Metric label="Carbon" value={`${S.tCo2eYr} tCO₂e`} sub={`per year · ${S.trendPct}% MoM`} color={S.trendPct<0?T.green:T.amber}/>
      <Metric label="Measured coverage" value={`${S.measuredPct}%`} sub="metered vs estimated" color={S.measuredPct>=60?T.green:T.amber} score={S.measuredPct}/>
      <Metric label="Efficiency index" value={String(S.efficiency)} sub="carbon per $ value" color={S.efficiency>=70?T.green:T.amber} score={S.efficiency}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1.4fr .82fr",gap:14,alignItems:"start"}}>
      <Card style={{padding:"16px 18px"}}>
        <div style={{fontSize:14,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:4}}>{T_("Footprint by initiative")}</div>
        <div style={{fontSize:10.5,color:T.ink3,fontFamily:F.b,marginBottom:10,lineHeight:1.5}}>{T_("Estimated from inference volume × model-class energy intensity × regional grid carbon × data-centre PUE. Live meters replace the estimate as gateway telemetry is wired.")}</div>
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11.5,fontFamily:F.b}}>
          <thead><tr>{["Initiative","Class","Region","kWh/mo","kgCO₂e/mo","Basis"].map(h=><th key={h} style={{textAlign:h==="kWh/mo"||h==="kgCO₂e/mo"?"right":"left",fontSize:9,letterSpacing:"0.06em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m,padding:"0 10px 9px",borderBottom:`1px solid ${T.border}`}}>{T_(h)}</th>)}</tr></thead>
          <tbody>{S.rows.map(r=><tr key={r.id} onClick={()=>openInitiative(r.id,"value")} style={{cursor:"pointer"}} className="vz-pn-row">
            <td style={{padding:"10px",borderBottom:`1px solid ${T.border}`,color:T.ink,fontWeight:700}}>{r.name}</td>
            <td style={{padding:"10px",borderBottom:`1px solid ${T.border}`,color:T.ink2}}>{T_(r.cls)}</td>
            <td style={{padding:"10px",borderBottom:`1px solid ${T.border}`,color:T.ink2}}>{r.region}</td>
            <td style={{padding:"10px",borderBottom:`1px solid ${T.border}`,color:T.ink2,fontFamily:F.m,textAlign:"right"}}>{r.kwhMo.toLocaleString()}</td>
            <td style={{padding:"10px",borderBottom:`1px solid ${T.border}`,color:T.ink,fontFamily:F.m,fontWeight:700,textAlign:"right"}}>{r.carbonKgMo.toLocaleString()}</td>
            <td style={{padding:"10px",borderBottom:`1px solid ${T.border}`}}><Tag label={r.measured?T_("Measured"):T_("Estimated")} color={r.measured?T.green:T.amber} bg={(r.measured?T.green:T.amber)+"16"}/></td>
          </tr>)}</tbody>
        </table></div>
      </Card>
      <div>
        <Card style={{padding:"16px 18px",marginBottom:12}}>
          <div style={{fontSize:12.5,fontWeight:800,color:T.ink,fontFamily:F.b,marginBottom:10}}>TR 20226 {T_("practice posture ·")} {S.postureScore}%</div>
          {S.posture.map((pp,i)=><div key={i} style={{marginBottom:9}}>
            <div style={{display:"flex",justifyContent:"space-between",gap:8,fontSize:10.5,marginBottom:3}}><span style={{color:T.ink2,fontFamily:F.b}}>{T_(pp.practice)}</span><span style={{color:T.ink3,fontFamily:F.m,fontWeight:800,whiteSpace:"nowrap"}}>{T_(pp.status)}</span></div>
            <Bar value={pp.pct} color={pp.pct>=70?T.green:pp.pct>=40?T.amber:T.red}/>
          </div>)}
        </Card>
        <div style={{padding:"11px 13px",borderRadius:10,background:AI_GOLD+"12",border:`1px solid ${AI_GOLD}30`,fontSize:11,color:T.ink2,lineHeight:1.6,fontFamily:F.b}}>
          <b style={{color:AI_GOLD_INK}}>Veris Intelligence:</b> {S.recs[0]?.label} — est. −{S.recs[0]?.saveTyr} tCO₂e/yr. Reduction opportunities identified across the portfolio total <b>{S.reductionTyr} tCO₂e/yr</b> ({Math.round(S.reductionTyr/Math.max(1,S.tCo2eYr)*100)}% of current footprint).
        </div>
      </div>
    </div>
  </div>;};

  /* ── Audit Center ── immutable trail + findings + packs ── */
  const AUDIT_TRAIL=[["Scale decision recorded","Resolution Copilot","A. Patel","09:42","Decision"],["Guardrail policy v6 approved","Responsible GenAI Use","A. Patel","08:15","Policy"],["DPIA evidence uploaded","Credit Decision","N. Lynch","Jul 24","Evidence"],["Risk treatment advanced","Servicing drift","D. Nair","Jul 23","Risk"],["Control test logged","CTRL-AI-014","R. Torres","Jul 22","Control"],["Model approved for production","Finance Close","M. Reid","Jul 21","Approval"]];
  const AuditCenter=()=><div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:14}}>
      <Metric label="Log integrity" value="100%" sub="hash-chained" color={T.green} score={100}/>
      <Metric label="Open findings" value="5" sub="2 high" color={T.amber}/>
      <Metric label="Audit packs" value="4" sub="regulator-ready" color={T.blue}/>
      <Metric label="Events logged" value="48.2K" sub="this month" color={rc}/>
    </div>
    <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
      <button onClick={()=>{vzDownload("audit-pack.txt",AUDIT_TRAIL.map(a=>a.join(" · ")).join("\n"));showToast&&showToast("Audit pack exported");}} style={{background:AI_GOLD+"18",border:`1px solid ${AI_GOLD}45`,borderRadius:8,padding:"8px 14px",color:AI_GOLD_INK,fontSize:11,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>{T_("Export audit pack →")}</button>
    </div>
    <Card style={{padding:0,overflow:"hidden"}}>
      <div style={{padding:"13px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:8}}><h3 style={{margin:0,fontSize:14,color:T.ink,fontFamily:F.b}}>{T_("Immutable audit trail")}</h3><Tag label={T_("hash-chained")} color={T.green} bg={T.green+"16"}/></div>
      {AUDIT_TRAIL.map((a,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"1.4fr 1fr 100px 80px 90px",gap:10,padding:"12px 16px",borderBottom:`1px solid ${T.border}`,alignItems:"center"}}>
        <span style={{fontSize:12,color:T.ink,fontWeight:700,fontFamily:F.b}}>{T_(a[0])}</span>
        <span style={{fontSize:10.5,color:T.ink3,fontFamily:F.b}}>{a[1]}</span>
        <span style={{fontSize:10.5,color:T.ink2,fontFamily:F.b}}>{a[2]}</span>
        <span style={{fontSize:10,color:T.ink4,fontFamily:F.m}}>{a[3]}</span>
        <Tag label={T_(a[4])} color={T.blue} bg={T.blue+"14"}/>
      </div>)}
    </Card>
  </div>;

  return <div style={{animation:"up .3s ease"}}>
    <Header/>
    {activeModule==="dashboard"&&<><RoleLensBand/><Dashboard/><RepositoryPanel/></>}
    {activeModule==="strategy"&&<><ModuleLensBand module="strategy"/><AIStrategy/></>}
    {activeModule==="portfolio"&&<><ModuleLensBand module="portfolio"/><Portfolio/></>}
    {activeModule==="repository"&&<><ModuleLensBand module="repository"/><PageModelRegistry setTab={setTab} openInitiative={openInitiative} role={role} showToast={showToast}/></>}
    {activeModule==="inventory"&&<><ModuleLensBand module="inventory"/><AIInventory/></>}
    {activeModule==="lifecycle"&&<><ModuleLensBand module="lifecycle"/><AILifecycle/></>}
    {activeModule==="gateway"&&<Gateway/>}
    {activeModule==="agents"&&<><ModuleLensBand module="agents"/><PageAgentRegistry role={role} showToast={showToast}/></>}
    {activeModule==="risk"&&<><ModuleLensBand module="risk"/><PageRiskCenter role={role} tab="riskcenter" setTab={setTab} setAiCentralView={setView} showToast={showToast}/></>}
    {activeModule==="trust"&&<><ModuleLensBand module="trust"/><TrustCenter/></>}
    {activeModule==="evidence"&&<><ModuleLensBand module="evidence"/><EvidenceModule/></>}
    {activeModule==="templates"&&<PageTemplates role={role} showToast={showToast}/>}
    {activeModule==="controls"&&<><ModuleLensBand module="controls"/><Governance/></>}
    {activeModule==="policies"&&<><ModuleLensBand module="policies"/><PoliciesStandards/></>}
    {activeModule==="value"&&<><ModuleLensBand module="value"/><ValueRealization/></>}
    {activeModule==="academy"&&<Academy/>}
    {activeModule==="audit"&&<><ModuleLensBand module="audit"/><AuditCenter/></>}
    {activeModule==="initiatives"&&<Initiatives/>}
    {activeModule==="pmo"&&renderEnterprisePmo()}
    {activeModule==="admin"&&<Administration/>}
    {lineage&&<LineageDrawer node={lineage} onAsset={id=>{openInitiative(id,"overview");setLineage(null);}} onClose={()=>setLineage(null)}/>}
  </div>;
}

