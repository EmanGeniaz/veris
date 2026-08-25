"use client";

import { useState, useEffect } from "react";
import { pushBus } from "@/lib/bus";
import { ROLE_CENTERS } from "@/lib/role-centers";
import { T, F, AI_GOLD, AI_GOLD_INK, ROLES, Card } from "./core";
import { initiativesForRole, ROLE_FACET } from "@/lib/initiative-facets";
import { assetById } from "@/lib/ai-assets";
import { BriefDrawer } from "./initiative-brief";
import { LineageDrawer } from "./lineage";
import { useLang, ts, registerContent } from "@/lib/i18n";

/* Arabic for the command-center chrome + the employee Overview's top-level text
   (bounded slice). Deep drill-down rows and activity-table data stay English via
   fallback; other roles' config localises in later cycles. */
registerContent({
  // generic chrome
  "Your workspace": "مساحة عملك",
  "Individual contributor": "مساهم فردي",
  // employee hero + narrative
  "You saved 6.2 hours this week": "وفّرت 6.2 ساعة هذا الأسبوع",
  "3 tasks due, 2 sessions in progress and 1 prompt pending approval — your AI productivity score is up 8 points.": "3 مهام مستحقة، وجلستان قيد التنفيذ، ومطالبة واحدة بانتظار الموافقة — ارتفعت درجة إنتاجيتك في الذكاء الاصطناعي 8 نقاط.",
  "Your cockpit: what AI you can use, how you use it, the value you create, the risk you avoid, and how to improve.": "مقصورتك: أيّ ذكاء اصطناعي يمكنك استخدامه، وكيف تستخدمه، والقيمة التي تصنعها، والمخاطر التي تتجنّبها، وكيف تتحسّن.",
  "AI productivity": "إنتاجية الذكاء الاصطناعي",
  "6.2h saved this week · +8": "6.2 ساعة مُوفَّرة هذا الأسبوع · +8",
  // attention cards
  "2 tasks due today": "مهمتان مستحقتان اليوم",
  "Validate an AI output and acknowledge the updated Data Handling policy.": "تحقّق من مُخرَج ذكاء اصطناعي وأقِرّ بسياسة معالجة البيانات المُحدَّثة.",
  "Open tasks": "افتح المهام",
  "1 prompt pending approval": "مطالبة واحدة بانتظار الموافقة",
  "Your 'Customer email draft' prompt needs manager sign-off before reuse.": "تحتاج مطالبتك «مسودة بريد العميل» موافقة المدير قبل إعادة الاستخدام.",
  "Review": "راجع",
  "Training due Friday": "تدريب مستحق يوم الجمعة",
  "Secure AI Use refresher — 12 min — keeps your tool access active.": "دورة تنشيطية للاستخدام الآمن للذكاء الاصطناعي — 12 دقيقة — تُبقي وصولك للأدوات فعّالاً.",
  "Start": "ابدأ",
  "A guardrail saved you": "حاجز حماية أنقذك",
  "PII auto-redacted from a support draft this week — nothing left your workspace.": "جرى تنقيح البيانات الشخصية تلقائياً من مسودة دعم هذا الأسبوع — لم يغادر شيء مساحة عملك.",
  "See event": "اعرض الحدث",
  // KPI labels
  "Hours saved": "ساعات مُوفَّرة", "Approved tools": "أدوات معتمدة", "Sessions": "جلسات",
  "Guardrail saves": "تدخّلات الحماية", "Compliance": "الامتثال",
  // KPI subs / values
  "+8 this month": "+8 هذا الشهر", "this week": "هذا الأسبوع", "available to you": "متاحة لك",
  "this month": "هذا الشهر", "1 action open": "إجراء واحد مفتوح", "On track": "على المسار",
  // employee surface labels (jump chips + PageHead)
  "AI Hub": "مركز الذكاء الاصطناعي", "My Initiatives": "مبادراتي", "My Tasks": "مهامي",
  "How I'm doing": "كيف أدائي", "Risk & Compliance": "المخاطر والامتثال", "My Requests": "طلباتي",
  // facet domains (FacetBand)
  "Security": "الأمن", "Risk": "المخاطر", "Infrastructure": "البنية التحتية",
  "Data & Privacy": "البيانات والخصوصية", "Finance": "المالية", "Readiness": "الجاهزية",
  "Legal": "القانون", "Governance": "الحوكمة",
  // shared RAG values
  "Strong": "قوي", "Moderate": "متوسط", "Amber": "متوسط",
  // ── CGO ──
  "The CGO's lens: is the enterprise governed, defensible to regulators, and ready for the board.": "عدسة مسؤول الحوكمة: هل المؤسسة مُحوكَمة، ومدافَع عنها أمام المنظّمين، وجاهزة للمجلس.",
  "Board-ready, two gaps to close": "جاهزة للمجلس، فجوتان للإغلاق",
  "Governance maturity 74/100, 24 policies in force, but 3 controls are ineffective and the Q3 board pack is due in 6 days.": "نضج الحوكمة 74/100، و24 سياسة سارية، لكن 3 ضوابط غير فعّالة وحزمة مجلس الربع الثالث مستحقة خلال 6 أيام.",
  "Governance maturity": "نضج الحوكمة", "/100 · board-ready 82%": "/100 · جاهزية المجلس 82%",
  "Board pack due — 6 days": "حزمة المجلس مستحقة — 6 أيام",
  "Q3 governance report consolidating risk, compliance & value.": "تقرير حوكمة الربع الثالث يوحّد المخاطر والامتثال والقيمة.",
  "Assemble pack": "جمّع الحزمة",
  "Control gap — 3 ineffective": "فجوة ضوابط — 3 غير فعّالة",
  "Model-validation + access-review controls failing test.": "ضوابط التحقق من النماذج ومراجعة الوصول تُخفق في الاختبار.",
  "Remediate": "عالِج",
  "Policy review overdue": "مراجعة سياسة متأخرة",
  "Acceptable-use policy past its review cycle by 12 days.": "سياسة الاستخدام المقبول تجاوزت دورة مراجعتها بـ 12 يوماً.",
  "Review & ratify": "راجع وصادِق",
  "Policies in force": "السياسات السارية", "Control effectiveness": "فعالية الضوابط",
  "Open audit findings": "نتائج تدقيق مفتوحة", "Regulatory posture": "الوضع التنظيمي", "Enterprise risk": "مخاطر المؤسسة",
  "/100 · +5 YoY": "/100 · +5 سنوياً", "3 overdue review": "3 متأخرة عن المراجعة",
  "21 of 24 effective": "21 من 24 فعّالة", "2 high · closing": "2 عالية · قيد الإغلاق",
  "5 frameworks": "5 أطر", "score 12/25": "الدرجة 12/25",
  // ── CISO ──
  "The CISO's lens: the AI attack surface — what's being thrown at it, what got through, what's exposed.": "عدسة مسؤول أمن المعلومات: سطح هجوم الذكاء الاصطناعي — ما يُلقى عليه، وما نفذ منه، وما هو مكشوف.",
  "Posture is holding, one active P1": "الوضع صامد، وحادثة P1 واحدة نشطة",
  "Security posture 79/100, 2,410 attacks blocked this quarter, but a prompt-injection P1 is open and 2 models have guardrail gaps.": "الوضع الأمني 79/100، و2,410 هجمة محجوبة هذا الربع، لكن حادثة حقن إدخالات P1 مفتوحة ونموذجان بهما فجوات في الحواجز.",
  "AI security posture": "الوضع الأمني للذكاء الاصطناعي", "/100 · 2,410 attacks blocked": "/100 · 2,410 هجمة محجوبة",
  "P1 — prompt-injection in progress": "P1 — حقن إدخالات قيد الحدوث",
  "Injection attempt on Resolution Copilot blocked at gateway; forensics open.": "محاولة حقن على مساعد الحلول حُجبت عند البوابة؛ التحليل الجنائي مفتوح.",
  "Open incident": "افتح الحادثة",
  "Critical vuln — model endpoint": "ثغرة حرجة — نقطة نهاية نموذج",
  "Unauthenticated inference path on a staging model. Patch pending.": "مسار استدلال غير موثّق على نموذج تجريبي. الترقيع معلّق.",
  "Assign fix": "أسنِد الإصلاح",
  "Guardrail gap — 2 models": "فجوة حواجز — نموذجان",
  "Output filtering not enforced on Skills Navigator + Supplier Screener.": "تصفية المخرجات غير مُفعّلة على مُوجّه المهارات وفارز الموردين.",
  "Enforce": "فعّل الإنفاذ",
  "Security posture": "الوضع الأمني", "Threats blocked": "التهديدات المحجوبة",
  "Open vulnerabilities": "الثغرات المفتوحة", "Data-leak events": "أحداث تسريب البيانات",
  "Guardrail coverage": "تغطية الحواجز", "MTTR": "متوسط زمن الاستجابة",
  "/100 · +3 QoQ": "/100 · +3 ربعياً", "prompt-inj · jailbreak": "حقن الإدخالات · كسر القيود",
  "1 critical · 1 high": "1 حرجة · 1 عالية", "30d · monitors green": "30 يوماً · المراقبات خضراء",
  "of production models": "من نماذج الإنتاج", "P1 mean-time-to-respond": "متوسط زمن الاستجابة لـ P1",
  // ── CRO ──
  "The CRO's lens: is AI risk inside appetite, are controls effective, and what needs treatment now.": "عدسة مسؤول المخاطر: هل مخاطر الذكاء الاصطناعي ضمن الحد المقبول، وهل الضوابط فعّالة، وما الذي يحتاج معالجة الآن.",
  "AI risk is inside appetite — two exposures need treatment": "مخاطر الذكاء الاصطناعي ضمن الحد المقبول — تعرّضان يحتاجان معالجة",
  "Residual risk trending down, 88% of controls effective, but one critical model risk and an overdue treatment need decisions this week.": "الخطر المتبقي في تراجع، و88% من الضوابط فعّالة، لكن خطر نموذج حرج واحد ومعالجة متأخرة يحتاجان قرارات هذا الأسبوع.",
  "Enterprise AI risk": "مخاطر الذكاء الاصطناعي المؤسسية", "within appetite · 2 exposures open": "ضمن الحد المقبول · تعرّضان مفتوحان",
  "Critical model risk — Credit Decision": "خطر نموذج حرج — قرار الائتمان",
  "Residual High after treatment; Art.22 exposure needs board note.": "الخطر المتبقي عالٍ بعد المعالجة؛ تعرّض المادة 22 يحتاج مذكرة للمجلس.",
  "Open risk": "افتح الخطر",
  "Overdue treatment — data drift": "معالجة متأخرة — انحراف البيانات",
  "Servicing model drift mitigation 6 days past due.": "تخفيف انحراف نموذج الخدمة متأخر 6 أيام.",
  "Escalate": "صعّد",
  "Control gap — guardrail coverage": "فجوة ضوابط — تغطية الحواجز",
  "Two production models below guardrail threshold.": "نموذجا إنتاج دون عتبة الحواجز.",
  "Assign": "أسنِد",
  "Residual risk": "الخطر المتبقي", "Controls effective": "الضوابط الفعّالة", "Critical risks": "المخاطر الحرجة",
  "Open treatments": "المعالجات المفتوحة", "KRIs breached": "مؤشرات مخاطر متجاوَزة", "Audit findings": "نتائج التدقيق",
  "within appetite": "ضمن الحد المقبول", "21 of 24": "21 من 24", "1 overdue": "1 متأخرة",
  "of 14 tracked": "من 14 مُتابَعاً", "2 high": "2 عالية",
});

/* ── Role Command Center engine ─────────────────────────────────────
   Renders any role's command center from its config in lib/role-centers.
   Overview is the `home` tab (hero + attention + KPIs + signature
   panels); each sidebar surface is a composition of generic blocks
   (kpis · attn · bars · table · scores · report · actions · text).
   Same design language and tokens as the CEO/CAIO command centers. */

/* Built per-call (not a frozen module const) so status colors track the
   active theme — a literal map would capture dark-theme accents at import
   time and render with dark colors in light mode. */
const col = k => ({ good:T.green, warn:T.amber, crit:T.red, info:T.blue, violet:T.violet, teal:T.teal, gold:AI_GOLD_INK, ink3:T.ink3, ink:T.ink }[k] || T.ink);

const cardPad = { padding:"16px 18px" };
const Eyebrow = ({children}) => <div style={{fontSize:9.5,letterSpacing:"0.14em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m,marginBottom:6}}>{children}</div>;
const H3 = ({children,style}) => <div style={{fontSize:14,fontWeight:800,color:T.ink,fontFamily:F.b,margin:"0 0 12px",...style}}>{children}</div>;
const Pill = ({children,c=T.ink3}) => <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:9.5,fontWeight:800,fontFamily:F.m,padding:"2px 9px",borderRadius:20,whiteSpace:"nowrap",background:c+"1f",color:c}}>{children}</span>;

/* Arabic for the COO / CFO / CHRO command-center Overviews (dictionary-only;
   the generic chrome is wired). Deep KPI drill-downs + panels stay English. */
registerContent({
  // shared RAG values
  "Watch": "مراقبة", "At risk": "معرّض للخطر",
  "4 business units": "4 وحدات أعمال",
  // ── COO ──
  "The COO's lens: how much of the value chain runs itself, and where throughput breaks.": "عدسة مسؤول العمليات: كم من سلسلة القيمة يُدير نفسه، وأين ينكسر الإنتاج.",
  "Operations are running hot": "العمليات تعمل بضغط عالٍ",
  "18% efficiency lift YTD — 1 automation blocked, one SLA at risk, capacity tight in Retail Ops.": "ارتفاع الكفاءة 18% منذ بداية العام — أتمتة واحدة محجوبة، واتفاقية مستوى خدمة معرّضة للخطر، والسعة ضيّقة في عمليات التجزئة.",
  "Value chain automated": "سلسلة القيمة المؤتمتة", "straight-through +12pts YTD": "المعالجة المباشرة +12 نقطة منذ بداية العام",
  "Onboarding automation blocked": "أتمتة الإعداد محجوبة",
  "KYC model awaiting bias sign-off — 3-day slip to go-live.": "نموذج اعرف عميلك بانتظار اعتماد التحيّز — انزلاق 3 أيام للإطلاق.",
  "SLA at risk — Claims": "اتفاقية الخدمة معرّضة للخطر — المطالبات",
  "Cycle-time drifting to 34h vs 24h target as volume spikes.": "زمن الدورة ينحرف إلى 34 ساعة مقابل هدف 24 ساعة مع تصاعد الحجم.",
  "Rebalance capacity": "أعِد موازنة السعة",
  "Capacity — Retail Ops": "السعة — عمليات التجزئة",
  "Agent augmentation at 92% utilisation; hiring or automation needed.": "تعزيز الوكلاء عند استغلال 92%؛ يلزم توظيف أو أتمتة.",
  "Open plan": "افتح الخطة",
  "Automation coverage": "تغطية الأتمتة", "Straight-through": "المعالجة المباشرة", "Cost-to-serve": "تكلفة الخدمة",
  "Avg cycle-time": "متوسط زمن الدورة", "Ops adoption": "تبنّي العمليات", "Operational incidents": "الحوادث التشغيلية",
  "of eligible processes": "من العمليات المؤهّلة", "+12pts YTD": "+12 نقطة منذ بداية العام",
  "vs FY25 baseline": "مقابل خط أساس 2025", "across 9 flows": "عبر 9 مسارات", "this month · 0 breach": "هذا الشهر · 0 خرق",
  // ── CFO ──
  "The CFO's lens: every dollar in, the value out, and where money leaks before it returns.": "عدسة المدير المالي: كل دولار داخل، والقيمة الخارجة، وأين يتسرّب المال قبل أن يعود.",
  "The AI book is net-positive": "دفتر الذكاء الاصطناعي إيجابي صافٍ",
  "$4.6M realized of $8.0M invested — ROI +22%, but $2.1M is consumed ahead of value and 2 programs need a reforecast.": "تحقّق 4.6 مليون دولار من 8.0 مليون مستثمرة — العائد +22%، لكن 2.1 مليون استُهلكت قبل القيمة وبرنامجان يحتاجان إعادة توقّع.",
  "Portfolio ROI": "عائد المحفظة", "$4.6M realized · payback 14mo": "4.6 مليون مُحقّقة · الاسترداد 14 شهراً",
  "Budget overrun — Resolution Copilot": "تجاوز ميزانية — مساعد الحلول",
  "Consumed 83% of budget at 17% of value. Reforecast proposed.": "استُهلك 83% من الميزانية عند 17% من القيمة. اقتُرحت إعادة التوقّع.",
  "Open reforecast": "افتح إعادة التوقّع",
  "Value-at-risk — Q3": "القيمة المعرّضة للخطر — الربع الثالث",
  "$1.9M allocated ahead of realized value across 2 programs.": "1.9 مليون دولار مخصّصة قبل القيمة المُحقّقة في برنامجين.",
  "Reallocate": "أعِد التخصيص",
  "Run-rate rising": "معدّل التشغيل يرتفع",
  "Inference + licensing run-rate up 14% MoM as usage scales.": "معدّل الاستدلال والترخيص يرتفع 14% شهرياً مع توسّع الاستخدام.",
  "Review cost": "راجع التكلفة",
  "AI investment": "استثمار الذكاء الاصطناعي", "Value realized": "القيمة المُحقّقة", "Value leaked": "القيمة المتسرّبة",
  "ROI": "العائد", "Run-rate cost": "تكلفة معدّل التشغيل", "Payback": "الاسترداد",
  "FY26 allocated": "مخصّصة 2026", "57% to value": "57% نحو القيمة", "consumed, no value": "مُستهلَك دون قيمة",
  "portfolio blended": "مزيج المحفظة", "compute+licences+people": "حوسبة+تراخيص+أشخاص", "avg · fastest 6mo": "متوسط · الأسرع 6 أشهر",
  // ── CHRO ──
  "The CHRO's lens: is AI augmenting people and lifting skills, or leaving teams behind.": "عدسة مسؤول الموارد البشرية: هل يعزّز الذكاء الاصطناعي الناس ويرفع المهارات، أم يترك الفرق خلفه.",
  "The workforce is adopting — unevenly": "القوى العاملة تتبنّى — بتفاوت",
  "61% adoption across 2,790 people, sentiment +64 net, but the People team is below threshold and 340 roles need reskilling plans.": "تبنٍّ 61% عبر 2,790 شخصاً، والمشاعر +64 صافٍ، لكن فريق الموارد البشرية دون العتبة و340 دوراً تحتاج خطط إعادة تأهيل.",
  "Workforce AI adoption": "تبنّي القوى العاملة للذكاء الاصطناعي", "2,790 people · sentiment +64": "2,790 شخصاً · المشاعر +64",
  "Reskilling gap — 340 roles": "فجوة إعادة تأهيل — 340 دوراً",
  "Roles with >40% task automation lack an active reskilling path.": "أدوار بأتمتة مهام >40% تفتقر لمسار إعادة تأهيل نشط.",
  "Open pipeline": "افتح خط الإعداد",
  "Adoption below threshold — People": "التبنّي دون العتبة — الموارد البشرية",
  "31% adoption; enablement program needed this quarter.": "تبنٍّ 31%؛ يلزم برنامج تمكين هذا الربع.",
  "Launch enablement": "أطلِق التمكين",
  "Role-impact assessment due": "تقييم أثر الأدوار مستحق",
  "Skills Navigator expansion needs a workforce-impact review.": "توسّع مُوجّه المهارات يحتاج مراجعة أثر على القوى العاملة.",
  "Start review": "ابدأ المراجعة",
  "Adoption": "التبنّي", "Reskilled (YTD)": "مُعاد تأهيلهم (منذ بداية العام)", "Roles augmented": "الأدوار المُعزَّزة",
  "Training completion": "إكمال التدريب", "Sentiment": "المشاعر", "People-risk": "مخاطر الأفراد",
  "of 750 target": "من هدف 750", "vs 60 displaced": "مقابل 60 مُستغنى عنهم", "safe-use": "الاستخدام الآمن",
  "net · 1,140 responses": "صافٍ · 1,140 استجابة", "ethics + displacement": "الأخلاقيات + الإحلال",
});

/* Arabic for the CIO / CDPO / Legal command-center Overviews (dictionary-only).
   Completes the executive set. Panels + deep drill-downs stay English. */
registerContent({
  // ── CIO ──
  "The CIO's lens: is the AI platform reliable, fast, affordable and well-integrated.": "عدسة مدير المعلومات: هل منصة الذكاء الاصطناعي موثوقة وسريعة وميسورة ومتكاملة جيداً.",
  "The platform is stable": "المنصة مستقرّة",
  "AI services 99.94% uptime, 14 models in production, but inference cost per call is up 14% and one integration is degraded.": "خدمات الذكاء الاصطناعي بجاهزية 99.94%، و14 نموذجاً في الإنتاج، لكن تكلفة الاستدلال لكل استدعاء ارتفعت 14% وتكامل واحد متدهور.",
  "AI service uptime": "جاهزية خدمة الذكاء الاصطناعي", "30d · SLO 99.9%": "30 يوماً · هدف الخدمة 99.9%",
  "Integration degraded — core banking": "تكامل متدهور — الأنظمة المصرفية الأساسية",
  "Latency on the payments connector up 3×; retries climbing.": "زمن الاستجابة على موصل المدفوعات ارتفع 3 أضعاف؛ وإعادات المحاولة تتصاعد.",
  "Investigate": "حقّق",
  "Inference cost spike": "قفزة في تكلفة الاستدلال",
  "Cost/call +14% MoM as Copilot traffic grows — routing review.": "التكلفة/الاستدعاء +14% شهرياً مع نمو حركة المساعد — مراجعة التوجيه.",
  "Optimise routing": "حسّن التوجيه",
  "Model deprecation — 30d": "إيقاف نموذج — 30 يوماً",
  "Two models on an end-of-life provider version; migration due.": "نموذجان على إصدار مزوّد منتهي العمر؛ الترحيل مستحق.",
  "Plan migration": "خطّط للترحيل",
  "Service uptime": "جاهزية الخدمة", "Inference latency": "زمن الاستدلال", "Cost / 1k calls": "التكلفة / 1000 استدعاء",
  "Models in prod": "نماذج في الإنتاج", "Integrations": "التكاملات", "Platform incidents": "حوادث المنصة",
  "30d rolling": "30 يوماً متجدّدة", "p95 · SLO 600ms": "p95 · هدف الخدمة 600 مللي ثانية",
  "of 21 registered": "من 21 مُسجّلاً", "1 degraded · 22 healthy": "1 متدهور · 22 سليم", "30d · 0 SEV1": "30 يوماً · 0 خطورة1",
  // ── CDPO ──
  "The CDPO's lens: where personal data flows through AI, and whether every use is lawful, consented and contained.": "عدسة مسؤول حماية البيانات: أين تتدفّق البيانات الشخصية عبر الذكاء الاصطناعي، وهل كل استخدام قانوني وبموافقة ومُحتوى.",
  "Privacy is compliant, watch two items": "الخصوصية ممتثلة، راقِب بندين",
  "92% privacy compliance across 11 personal-data systems, but a DPIA is overdue and 3 subject-rights requests approach SLA.": "امتثال خصوصية 92% عبر 11 نظام بيانات شخصية، لكن تقييم أثر متأخر و3 طلبات حقوق أصحاب بيانات تقترب من اتفاقية الخدمة.",
  "Privacy compliance": "امتثال الخصوصية", "DPIA coverage 9/11 systems": "تغطية تقييم الأثر 9/11 أنظمة",
  "DPIA overdue — Skills Navigator": "تقييم الأثر متأخر — مُوجّه المهارات",
  "Processes employee data with profiling; DPIA past due.": "يعالج بيانات الموظفين بالتنميط؛ تقييم الأثر تجاوز موعده.",
  "Complete DPIA": "أكمل تقييم الأثر",
  "Subject-rights SLA — 3 requests": "اتفاقية حقوق الأصحاب — 3 طلبات",
  "Two erasure + one access request near the 30-day limit.": "طلبا محو + طلب وصول قرب حدّ 30 يوماً.",
  "Action requests": "نفّذ الطلبات",
  "Data residency — APAC": "إقامة البيانات — آسيا والمحيط الهادئ",
  "Predictive Maintenance logs routed outside region; review.": "سجلّات الصيانة التنبؤية موجَّهة خارج المنطقة؛ راجِع.",
  "Review transfer": "راجِع النقل",
  "DPIA coverage": "تغطية تقييم الأثر", "Art.22 systems": "أنظمة المادة 22", "Consent / lawful basis": "الموافقة / الأساس القانوني",
  "Subject-rights (open)": "حقوق الأصحاب (مفتوحة)", "Privacy incidents": "حوادث الخصوصية",
  "GDPR + local": "GDPR + محلي", "systems assessed": "أنظمة مُقيَّمة", "automated decisions": "قرارات آلية",
  "documented": "موثّقة", "SLA 30d · 0 breached": "اتفاقية 30 يوماً · 0 مُخترقة", "30d · 1 near-miss": "30 يوماً · 1 وشيك",
  // ── Legal ──
  "The General Counsel's lens: can each AI system legally operate, and is the evidence defensible.": "عدسة المستشار العام: هل يمكن لكل نظام ذكاء اصطناعي العمل قانونياً، وهل الأدلة قابلة للدفاع.",
  "Regulatory posture is solid — one conformity gap open": "الوضع التنظيمي متين — فجوة مطابقة واحدة مفتوحة",
  "88% of controls effective and consent documented, but an EU AI Act conformity assessment and two contract clauses need attention before scale.": "88% من الضوابط فعّالة والموافقة موثّقة، لكن تقييم مطابقة القانون الأوروبي وبندين تعاقديين يحتاجان انتباهاً قبل التوسّع.",
  "Legally defensible": "قابل للدفاع قانونياً", "controls effective · 1 gap open": "ضوابط فعّالة · فجوة واحدة مفتوحة",
  "EU AI Act conformity gap": "فجوة مطابقة القانون الأوروبي",
  "Credit Decision needs Art.43 conformity assessment before scale.": "قرار الائتمان يحتاج تقييم مطابقة المادة 43 قبل التوسّع.",
  "Contract clause — vendor liability": "بند تعاقدي — مسؤولية المورّد",
  "Two AI vendor contracts lack model-liability terms.": "عقدا مورّدي ذكاء اصطناعي يفتقران لبنود مسؤولية النماذج.",
  "IP provenance — training data": "مصدر الملكية الفكرية — بيانات التدريب",
  "One model's training-data provenance is unclassified.": "مصدر بيانات تدريب أحد النماذج غير مصنّف.",
  "Conformity gaps": "فجوات المطابقة", "Consent documented": "الموافقة الموثّقة", "Contracts flagged": "العقود المُعلَّمة",
  "Frameworks aligned": "الأطر المتوائمة", "Regulatory changes": "التغييرات التنظيمية",
  "of scope": "من النطاق", "liability terms": "بنود المسؤولية", "regulatory": "تنظيمي", "tracked this Q": "مُتابَعة هذا الربع",
});

/* ── block renderers ── */
function Kpis({items,ctx}){
  const lang=useLang(); const T_=en=>ts(lang,en);
  const clickable=ctx&&ctx.onLineage;
  return <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:18}}>
    {items.map((k,i)=><div key={i} onClick={()=>clickable&&ctx.onLineage(k[4]?{label:k[0],value:k[1],...k[4]}:k[0],k[4]?undefined:k[1])} className={clickable?"vz-lin":""} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:12,padding:"13px 14px",cursor:clickable?"pointer":"default",transition:"border-color .15s"}}>
      <div style={{fontSize:9,letterSpacing:"0.09em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m}}>{T_(k[0])}</div>
      <div style={{fontSize:22,fontWeight:800,marginTop:7,letterSpacing:"-0.02em",fontFamily:F.m,color:col(k[2])}}>{T_(k[1])}</div>
      <div style={{fontSize:9.5,color:T.ink3,marginTop:3,fontFamily:F.b}}>{T_(k[3])}</div>
    </div>)}
    {clickable&&<style>{`.vz-lin:hover{border-color:${AI_GOLD}66}`}</style>}
  </div>;
}
function Attn({items,ctx}){
  const lang=useLang(); const ar=lang==="ar"; const T_=en=>ts(lang,en);
  const go=a=>a[4]&&ctx&&ctx.setTab&&ctx.setTab(a[4]);
  return <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:12,marginBottom:18}}>
    {items.map((a,i)=>{const live=!!(a[4]&&ctx&&ctx.setTab);return <Card key={i} onClick={()=>go(a)} className={live?"vz-attn":""} style={{padding:"13px 15px",borderInlineStart:`3px solid ${col(a[3])}`,cursor:live?"pointer":"default"}}>
      <div style={{fontSize:12.5,fontWeight:800,color:T.ink,fontFamily:F.b}}>{T_(a[0])}</div>
      <div style={{fontSize:10.5,color:T.ink3,marginTop:3,lineHeight:1.5,fontFamily:F.b}}>{T_(a[1])}</div>
      <div style={{fontSize:10,color:AI_GOLD_INK,fontWeight:800,marginTop:8,fontFamily:F.b}}>{T_(a[2])} {ar?"←":"→"}</div>
    </Card>;})}
    <style>{`.vz-attn{transition:background .15s}.vz-attn:hover{background:${T.s2}}`}</style>
  </div>;
}
function Bars({eye,h3,rows,legend,raw}){
  const max = raw ? Math.max(...rows.map(r=>r[2])) : 100;
  return <Card style={cardPad}><Eyebrow>{eye}</Eyebrow><H3>{h3}</H3>
    {rows.map((r,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"150px 1fr auto",alignItems:"center",gap:12,padding:"8px 0",borderBottom:i<rows.length-1?`1px solid ${T.border}`:"none"}}>
      <span style={{fontSize:11,fontWeight:600,color:T.ink2,fontFamily:F.b}}>{r[0]}{r[1]?<span style={{color:T.ink4}}> · {r[1]}</span>:null}</span>
      <div style={{height:8,borderRadius:6,background:T.s3||T.border,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.round(r[2]/max*100)}%`,background:col(r[3])}}/></div>
      <span style={{fontSize:11,fontWeight:800,textAlign:"right",minWidth:44,color:col(r[3]),fontFamily:F.m}}>{raw?r[2].toLocaleString():r[2]+"%"}</span>
    </div>)}
    {legend&&<div style={{display:"flex",gap:14,flexWrap:"wrap",marginTop:11}}>{legend.map((l,i)=><span key={i} style={{display:"flex",alignItems:"center",gap:6,fontSize:10,color:T.ink3,fontWeight:600,fontFamily:F.b}}><span style={{width:9,height:9,borderRadius:3,background:col(l[1])}}/>{l[0]}</span>)}</div>}
  </Card>;
}
const cell = c => Array.isArray(c) ? <Pill c={col(c[1])}>{c[0]}</Pill> : c;
/* A governed-tool catalogue row → a tool-detail node (its own status, data
   class, risk, owner + what to do to get access), NOT the initiative
   lineage — a tool isn't an initiative. */
const cellText=c=>Array.isArray(c)?c[0]:c;
function toolNode(head,r){
  const status=String(cellText(r[1])||"");
  const blocked=/blocked/i.test(status), restricted=/restricted/i.test(status);
  const note=blocked?"Blocked by policy — not permitted for any data class. Use an approved alternative from your AI Hub; requesting access won't override the block."
    :restricted?"Restricted — needs the owner's approval before use. Raise a request under My Requests and it routes to the owner for sign-off."
    :"Approved for you — governed through the AI Gateway with policy enforcement, PII redaction and automatic evidence.";
  return { label:r[0], value:status,
    formula:`Governed AI tool · owner ${cellText(r[r.length-1])} · access by policy`,
    rows: head.slice(1).map((h,k)=>({ name:h, v:String(cellText(r[k+1])), unit:"" })),
    note };
}
function Tbl({eye,h3,head,rows,ctx,linkKind}){
  const clickable=ctx&&ctx.onLineage;
  const val=r=>{const c=r.find((x,j)=>j>0&&(typeof x==="string"||typeof x==="number"));return Array.isArray(c)?c[0]:c;};
  /* A glance row → its own detail node (each column becomes a fact), so a
     click answers "what is this row" instead of a generic portfolio rollup. */
  const detailNote={ session:"Every session runs through the Gateway with policy, redaction and evidence — this is the governed record behind it.", member:"Team aggregates for this person — adoption and compliance only, never prompt content, by policy." };
  const detailNode=(kind,r)=>({ label:r[0], value:String(cellText(r[r.length-1])),
    formula: kind==="session"?`Governed AI session · ${cellText(r[1])} · routed through the Gateway`:kind==="member"?`Team member · ${r[0]} · governed AI standing`:`${eye||h3} · ${r[0]}`,
    rows: head.slice(1).map((h,k)=>({ name:h, v:String(cellText(r[k+1])), unit:"" })),
    note: detailNote[kind]||"The detail behind this row, traced to its governed record." });
  const nodeFor=r=>linkKind==="tool"?toolNode(head,r):detailNode(linkKind,r);
  const onRow=r=>{ if(!clickable)return; const node=linkKind?nodeFor(r):r[0]; ctx.onLineage(node, linkKind?undefined:val(r)); };
  return <Card style={cardPad}><Eyebrow>{eye}</Eyebrow><H3>{h3}</H3>
    <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11.5,fontFamily:F.b}}>
      <thead><tr>{head.map(h=><th key={h} style={{textAlign:"left",fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m,padding:"0 10px 9px",borderBottom:`1px solid ${T.border}`}}>{h}</th>)}</tr></thead>
      <tbody>{rows.map((r,i)=><tr key={i} onClick={()=>onRow(r)} className={clickable?"vz-lrow":""} style={{cursor:clickable?"pointer":"default"}}>{r.map((c,j)=><td key={j} style={{padding:"11px 10px",borderBottom:i<rows.length-1?`1px solid ${T.border}`:"none",color:j===0?T.ink:T.ink2,fontWeight:j===0?700:400}}>{cell(c)}</td>)}</tr>)}</tbody>
    </table></div>
    {clickable&&<style>{`.vz-lrow:hover td{background:${T.s2}}`}</style>}
  </Card>;
}
/* ── Register + drill-in drawer ─────────────────────────────────────
   A register is the deep counterpart to a glance table: every row is an
   object (incident, vulnerability, risk) that opens a detail drawer with
   its owning project, owner, timeline and an action / treatment plan —
   and jumps to that project or the Risk Center. In `compact` mode (used
   on the overview lenses) it previews the top rows with a link to the
   full register; the sidebar surface renders it in full. */
function Drawer({rec,onClose,ctx}){
  const [done,setDone]=useState({});
  useEffect(()=>{const h=e=>{if(e.key==="Escape")onClose();};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[onClose]);
  const record=(idx,step)=>{
    setDone(d=>({...d,[idx]:true}));
    pushBus("vz-gw-evidence",{item:`${rec.ref} — ${step}`,initiative:rec.project||"Enterprise",scope:"Security",control:`${rec.kindLabel||"Item"} treatment`,risk:rec.title,owner:rec.owner||"Security",status:"In Progress",approval:"Action recorded",version:"v1",time:"Just now"});
    ctx.showToast&&ctx.showToast(`Action recorded on ${rec.ref} — evidence minted`);
  };
  const openProject=()=>{ onClose(); if(rec.projectId&&ctx.navigate)ctx.navigate("initiative",{id:rec.projectId}); else if(ctx.setTab)ctx.setTab("riskcenter"); };
  const openRisk=()=>{ onClose(); ctx.setTab&&ctx.setTab("riskcenter"); };
  const meta=[["Project",rec.project||"—"],["Owner",rec.owner||"—"],["Detected",rec.detected||"—"],["SLA / due",rec.due||"—"]];
  return <div onMouseDown={onClose} style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(4,7,20,.5)",backdropFilter:"blur(2px)",display:"flex",justifyContent:"flex-end"}}>
    <div onMouseDown={e=>e.stopPropagation()} style={{width:460,maxWidth:"92vw",height:"100%",overflowY:"auto",background:T.card||T.s1,borderLeft:`1px solid ${T.border}`,boxShadow:"-24px 0 60px rgba(0,0,0,.4)",animation:"slideIn .22s ease"}}>
      <style>{`@keyframes slideIn{from{transform:translateX(30px);opacity:.4}to{transform:translateX(0);opacity:1}}`}</style>
      <div style={{padding:"16px 18px",borderBottom:`1px solid ${T.border}`,position:"sticky",top:0,background:T.card||T.s1,zIndex:1}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
          <div style={{display:"flex",gap:7,flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontSize:10,fontFamily:F.m,fontWeight:900,color:T.ink4}}>{rec.ref}</span>
            {rec.severity&&<Pill c={col(rec.severity[1])}>{rec.severity[0]}</Pill>}
            {rec.status&&<Pill c={col(rec.status[1])}>{rec.status[0]}</Pill>}
          </div>
          <button onClick={onClose} aria-label="Close" style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:7,width:26,height:26,color:T.ink3,fontSize:13,cursor:"pointer",flexShrink:0}}>✕</button>
        </div>
        <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:800,color:T.ink,margin:"9px 0 0",lineHeight:1.3}}>{rec.title}</h3>
      </div>
      <div style={{padding:18}}>
        {rec.summary&&<p style={{fontSize:11.5,color:T.ink2,lineHeight:1.65,fontFamily:F.b,margin:"0 0 14px"}}>{rec.summary}</p>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 14px",marginBottom:16}}>
          {meta.map(([l,v])=><div key={l}><div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>{l}</div>
            {l==="Project"&&rec.project?<button onClick={openProject} style={{background:"none",border:"none",padding:0,fontSize:11.5,fontWeight:800,color:AI_GOLD_INK,fontFamily:F.b,cursor:"pointer",textAlign:"left"}}>{v} →</button>
              :<div style={{fontSize:11.5,color:T.ink,fontWeight:600,fontFamily:F.b}}>{v}</div>}
          </div>)}
        </div>
        {rec.plan&&rec.plan.length>0&&<div style={{marginBottom:16}}>
          <div style={{fontSize:9,color:T.ink4,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>{rec.planLabel||"Action / treatment plan"}</div>
          <div style={{display:"grid",gap:7}}>
            {rec.plan.map((s,i)=>{const label=Array.isArray(s)?s[0]:s;const st=Array.isArray(s)?s[1]:"ink3";const isDone=done[i]||st==="good";return <div key={i} style={{display:"flex",gap:9,alignItems:"center",background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"9px 11px"}}>
              <span style={{width:16,height:16,borderRadius:5,flexShrink:0,display:"grid",placeItems:"center",fontSize:10,fontWeight:900,background:isDone?T.green+"22":col(st)+"18",color:isDone?T.green:col(st)}}>{isDone?"✓":i+1}</span>
              <span style={{flex:1,fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.4,textDecoration:isDone?"line-through":"none",opacity:isDone?.7:1}}>{label}</span>
              {!isDone&&<button onClick={()=>record(i,label)} style={{background:AI_GOLD+"16",border:`1px solid ${AI_GOLD}40`,borderRadius:6,padding:"3px 9px",color:AI_GOLD_INK,fontSize:9.5,fontWeight:800,fontFamily:F.b,cursor:"pointer",flexShrink:0}}>Record</button>}
            </div>;})}
          </div>
        </div>}
        {rec.timeline&&rec.timeline.length>0&&<div style={{marginBottom:16}}>
          <div style={{fontSize:9,color:T.ink4,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Timeline</div>
          <div style={{display:"grid",gap:0}}>
            {rec.timeline.map((t,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"78px 1fr",gap:10,padding:"6px 0",borderBottom:i<rec.timeline.length-1?`1px solid ${T.border}`:"none"}}>
              <span style={{fontSize:9.5,color:T.ink4,fontFamily:F.m,fontWeight:700}}>{t[0]}</span><span style={{fontSize:10.5,color:T.ink2,fontFamily:F.b,lineHeight:1.5}}>{t[1]}</span>
            </div>)}
          </div>
        </div>}
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button onClick={openProject} style={{background:AI_GOLD,border:"none",borderRadius:8,padding:"9px 14px",color:"#0b0e24",fontSize:11,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>{rec.projectId?"Open project workspace →":"Open in Risk Center →"}</button>
          <button onClick={openRisk} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 14px",color:T.ink2,fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>View in Risk Center →</button>
        </div>
      </div>
    </div>
  </div>;
}
function Register({eye,h3,kind,kindLabel,items,ctx}){
  const [sel,setSel]=useState(null);
  const compact=ctx&&ctx.deep===false;
  const shown=compact?items.slice(0,3):items;
  const open=r=>setSel({...r,kind,kindLabel});
  return <><Card style={cardPad}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div>{eye&&<Eyebrow>{eye}</Eyebrow>}{h3&&<H3 style={{margin:0}}>{h3}</H3>}</div>
      {compact&&ctx.goSurface&&<button onClick={()=>ctx.goSurface()} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:8,padding:"6px 12px",color:T.ink2,fontSize:10.5,fontWeight:800,fontFamily:F.b,cursor:"pointer",flexShrink:0}}>Open full register →</button>}
    </div>
    <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11.5,fontFamily:F.b}}>
      <thead><tr>{["Ref","Item","Project","Severity","Status",""].map((hh,i)=><th key={i} style={{textAlign:"left",fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m,padding:"0 10px 9px",borderBottom:`1px solid ${T.border}`}}>{hh}</th>)}</tr></thead>
      <tbody>{shown.map((r,i)=><tr key={i} onClick={()=>open(r)} className="vz-reg-row" style={{cursor:"pointer"}}>
        <td style={{padding:"11px 10px",borderBottom:i<shown.length-1?`1px solid ${T.border}`:"none",color:T.ink,fontWeight:700}}>{r.ref}</td>
        <td style={{padding:"11px 10px",borderBottom:i<shown.length-1?`1px solid ${T.border}`:"none",color:T.ink2}}>{r.title}</td>
        <td style={{padding:"11px 10px",borderBottom:i<shown.length-1?`1px solid ${T.border}`:"none",color:AI_GOLD_INK,fontWeight:700}}>{r.project||"—"}</td>
        <td style={{padding:"11px 10px",borderBottom:i<shown.length-1?`1px solid ${T.border}`:"none"}}>{r.severity?<Pill c={col(r.severity[1])}>{r.severity[0]}</Pill>:"—"}</td>
        <td style={{padding:"11px 10px",borderBottom:i<shown.length-1?`1px solid ${T.border}`:"none"}}>{r.status?<Pill c={col(r.status[1])}>{r.status[0]}</Pill>:"—"}</td>
        <td style={{padding:"11px 10px",borderBottom:i<shown.length-1?`1px solid ${T.border}`:"none",color:T.ink4,textAlign:"right",fontWeight:800}}>→</td>
      </tr>)}</tbody>
    </table></div>
    <style>{`.vz-reg-row:hover td{background:${T.s2}}`}</style>
  </Card>
  {sel&&<Drawer rec={sel} onClose={()=>setSel(null)} ctx={ctx}/>}</>;
}
function Scores({eye,h3,ring,rows}){
  return <Card style={cardPad}><Eyebrow>{eye}</Eyebrow><H3>{h3}</H3>
    <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
      <div style={{width:96,height:96,borderRadius:"50%",background:`conic-gradient(${T.green} ${ring}%, ${T.s3||T.panel} 0)`,display:"grid",placeItems:"center",flex:"none"}}>
        <div style={{width:72,height:72,borderRadius:"50%",background:T.s1,display:"grid",placeItems:"center"}}><div style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:800,color:T.ink,lineHeight:1,fontFamily:F.m}}>{ring}</div><div style={{fontSize:7.5,letterSpacing:"0.1em",textTransform:"uppercase",color:T.ink4,fontWeight:800,marginTop:2}}>Maturity</div></div></div>
      </div>
      <div style={{flex:1,minWidth:200}}>{rows.map((r,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"150px 1fr 34px",alignItems:"center",gap:12,padding:"7px 0",borderBottom:i<rows.length-1?`1px solid ${T.border}`:"none"}}>
        <span style={{fontSize:11,fontWeight:700,color:T.ink2,fontFamily:F.b}}>{r[0]}</span>
        <div style={{height:8,borderRadius:6,background:T.s3||T.border,overflow:"hidden"}}><div style={{height:"100%",width:`${r[1]}%`,background:col(r[2])}}/></div>
        <span style={{fontSize:11,fontWeight:800,textAlign:"right",color:col(r[2]),fontFamily:F.m}}>{r[1]}</span>
      </div>)}</div>
    </div>
  </Card>;
}
function TextBlock({eye,h3,body}){
  return <Card style={cardPad}><Eyebrow>{eye}</Eyebrow><H3 style={{marginBottom:8}}>{h3}</H3><div style={{fontSize:11.5,color:T.ink3,lineHeight:1.7,fontFamily:F.b}}>{body}</div></Card>;
}
function Library({items}){
  return <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16}}>
    {items.map((l,i)=><Card key={i} style={{padding:"14px 15px",cursor:"pointer"}}><div style={{fontSize:12.5,fontWeight:800,color:T.ink,fontFamily:F.b}}>{l[0]}</div><div style={{fontSize:10.5,color:T.ink3,marginTop:5,lineHeight:1.5,fontFamily:F.b}}>{l[1]}</div><div style={{marginTop:9}}><Pill c={col(l[3])}>{l[2]}</Pill></div></Card>)}
  </div>;
}
function Report({eye,h3,dims,completed,showToast}){
  const [sel,setSel]=useState(new Set(dims.slice(0,3)));
  const [gen,setGen]=useState(false);
  const toggle=d=>setSel(s=>{const n=new Set(s);n.has(d)?n.delete(d):n.add(d);return n;});
  return <><Card style={cardPad}><Eyebrow>{eye}</Eyebrow><H3>{h3}</H3>
    <div style={{fontSize:10.5,color:T.ink3,fontFamily:F.b,margin:"2px 0 11px"}}>Pick the dimensions to include, then export as <b style={{color:T.ink2}}>PDF</b> (board-ready) or <b style={{color:T.ink2}}>Excel</b> (evidence workbook).</div>
    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{dims.map(d=><button key={d} onClick={()=>toggle(d)} style={{padding:"7px 14px",borderRadius:20,fontSize:11.5,fontWeight:800,cursor:"pointer",fontFamily:F.b,border:`1px solid ${sel.has(d)?AI_GOLD:T.border}`,background:sel.has(d)?AI_GOLD:T.s2,color:sel.has(d)?"#0b0e24":T.ink3}}>{d}</button>)}</div>
    <div style={{display:"flex",gap:9,marginTop:14}}><button onClick={()=>{setGen(true);showToast&&showToast("Report generated");}} style={{background:AI_GOLD,border:"none",borderRadius:11,padding:"10px 17px",color:"#0b0e24",fontSize:12,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>✦ Generate report</button><button onClick={()=>showToast&&showToast("Delivery scheduled — added to the reporting calendar")} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:11,padding:"10px 17px",color:T.ink2,fontSize:12,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Schedule</button></div>
  </Card>
  {completed&&completed.length>0&&<Card style={{...cardPad,marginTop:14}}><Eyebrow>Training completed — on your record</Eyebrow><H3 style={{marginBottom:10}}>Auto-included as governance evidence</H3>
    <div style={{display:"grid",gap:7}}>{completed.map(([name,when])=><div key={name} style={{display:"flex",alignItems:"center",gap:10,background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"9px 12px"}}>
      <span style={{color:T.green,fontWeight:900,fontFamily:F.m,fontSize:12}}>✓</span>
      <span style={{fontSize:11.5,fontWeight:700,color:T.ink,fontFamily:F.b,flex:1}}>{name}</span>
      <span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{when}</span>
    </div>)}</div>
  </Card>}
  {gen&&<Card style={{...cardPad,marginTop:14,border:`1px solid ${AI_GOLD}44`,animation:"up .2s ease"}}><Eyebrow>Generated draft · {[...sel].length} dimensions</Eyebrow><H3 style={{marginBottom:10}}>Report — Q3 FY26</H3>
    <div style={{fontSize:11,color:T.ink2,lineHeight:1.7,fontFamily:F.b}}>{[...sel].map(d=><div key={d}>• <b style={{color:T.ink}}>{d}</b> — consolidated for the period.</div>)}</div>
    <div style={{display:"flex",gap:9,marginTop:14}}><button style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"8px 15px",color:T.ink2,fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Export XLSX</button><button style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"8px 15px",color:T.ink2,fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Export PDF</button></div>
  </Card>}</>;
}
function Actions({eye,h3,items,role,showToast}){
  const [done,setDone]=useState({});
  const act=(n,label,title)=>{
    setDone(d=>({...d,[n]:label}));
    pushBus("vz-gw-evidence",{item:`${label} — ${title}`,initiative:title,scope:"Workspace",control:"Approval record",risk:"Decision",owner:(ROLES[role]||ROLES.caio).name,status:"Complete",approval:label,version:"v1",time:"Just now"});
    showToast&&showToast(`${label} recorded — evidence minted`);
  };
  /* Governance context strip — every task/request answers what it's for,
     who raised it, why it matters, what's next and where it's stuck. In a
     governance product an item with no provenance is worse than useless. */
  const MetaRow=({label,value,c})=><div style={{display:"grid",gridTemplateColumns:"92px 1fr",gap:8,alignItems:"baseline"}}>
    <span style={{fontSize:8.5,fontWeight:900,fontFamily:F.m,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</span>
    <span style={{fontSize:10.5,color:c||T.ink2,fontFamily:F.b,lineHeight:1.5}}>{value}</span>
  </div>;
  return <div>{eye&&<Eyebrow>{eye}</Eyebrow>}{h3&&<H3>{h3}</H3>}
    {items.map(a=>{const m=a[6];return <Card key={a[0]} style={{...cardPad,marginBottom:11,display:"flex",gap:13,alignItems:"flex-start"}}>
      <div style={{width:30,height:30,borderRadius:9,display:"grid",placeItems:"center",fontWeight:800,fontSize:12,flexShrink:0,color:"#0b0e24",background:col(a[1]),fontFamily:F.m}}>{a[0]}</div>
      <div style={{flex:1,minWidth:0}}><H3 style={{marginBottom:0}}>{a[2]}</H3><div style={{fontSize:11,color:T.ink3,marginTop:4,lineHeight:1.55,fontFamily:F.b}}>{a[3]}</div>
        {m&&<div style={{display:"grid",gap:5,marginTop:10,padding:"10px 12px",background:T.s2,border:`1px solid ${T.border}`,borderRadius:9}}>
          {m.by&&<MetaRow label="Raised by" value={m.by}/>}
          {m.why&&<MetaRow label="Why it matters" value={m.why}/>}
          {m.next&&<MetaRow label="Next step" value={m.next}/>}
          {m.wait&&<MetaRow label="Waiting on" value={m.wait} c={T.amber}/>}
          {m.ref&&<MetaRow label="Linked" value={m.ref} c={T.blue}/>}
        </div>}
        {done[a[0]]?<div style={{fontSize:11,fontWeight:800,color:T.green,fontFamily:F.b,marginTop:11}}>✓ {done[a[0]]} recorded — evidence minted</div>
        :<div style={{display:"flex",gap:9,marginTop:11,flexWrap:"wrap"}}>
          <button onClick={()=>act(a[0],a[4],a[2])} style={{background:AI_GOLD,border:"none",borderRadius:9,padding:"8px 15px",color:"#0b0e24",fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{a[4]}</button>
          <button onClick={()=>act(a[0],a[5],a[2])} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"8px 15px",color:T.ink2,fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{a[5]}</button>
        </div>}
      </div>
    </Card>;})}
  </div>;
}

/* Employee "propose a new project" — a governed create gated by manager
   approval. Submitting does not start a project; it files an approval
   request to the manager's queue (evidence-minted on the bus) and shows
   the pending state, so the governance gate is explicit in-product. */
function NewProject({eye,h3,body,role,showToast}){
  const [open,setOpen]=useState(false);
  const [sent,setSent]=useState(false);
  const [f,setF]=useState({name:"",purpose:"",value:""});
  const set=k=>e=>setF(s=>({...s,[k]:e.target.value}));
  const field={background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"9px 11px",color:T.ink,fontSize:11.5,fontFamily:F.b,width:"100%",outline:"none"};
  const submit=()=>{
    const name=f.name.trim()||"Untitled AI project";
    pushBus("vz-gw-evidence",{item:`New project request — ${name}`,initiative:name,scope:"Workspace",control:"New project approval",risk:f.purpose||"Employee-proposed initiative",owner:(ROLES[role]||ROLES.employee).name,status:"Pending",approval:"Awaiting manager approval",version:"v1",time:"Just now"});
    setSent(true);setOpen(false);
    showToast&&showToast(`"${name}" sent to your manager for approval`);
  };
  return <Card style={{...cardPad,border:`1px solid ${AI_GOLD}40`,background:`linear-gradient(135deg,${T.s2},${T.s1})`}}>
    <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start",flexWrap:"wrap"}}>
      <div style={{flex:1,minWidth:220}}>
        {eye&&<Eyebrow>{eye}</Eyebrow>}
        <H3 style={{marginBottom:8}}>{h3}</H3>
        <div style={{fontSize:11.5,color:T.ink3,lineHeight:1.65,fontFamily:F.b,maxWidth:640}}>{body}</div>
      </div>
      {!sent&&!open&&<button onClick={()=>setOpen(true)} style={{background:AI_GOLD,border:"none",borderRadius:10,padding:"10px 16px",color:"#0b0e24",fontSize:12,fontWeight:900,fontFamily:F.b,cursor:"pointer",flexShrink:0,whiteSpace:"nowrap"}}>+ Start a new project</button>}
    </div>
    {sent&&<div style={{marginTop:13,display:"flex",gap:9,alignItems:"center",background:T.green+"14",border:`1px solid ${T.green}40`,borderRadius:10,padding:"11px 13px"}}>
      <span style={{fontSize:13,fontWeight:900,color:T.green,fontFamily:F.m}}>✓</span>
      <span style={{fontSize:11.5,color:T.ink2,fontFamily:F.b,lineHeight:1.5}}>Request submitted — it's now in your manager's approval queue. You'll be able to start once it's approved. Track it under <b style={{color:T.ink}}>My Requests</b>.</span>
    </div>}
    {open&&<div style={{marginTop:14,display:"grid",gap:10,animation:"up .2s ease"}}>
      <label style={{display:"grid",gap:5}}><span style={{fontSize:9,fontWeight:900,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.08em"}}>Project name</span><input value={f.name} onChange={set("name")} placeholder="e.g. Support Insights Copilot" style={field}/></label>
      <label style={{display:"grid",gap:5}}><span style={{fontSize:9,fontWeight:900,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.08em"}}>What will it do?</span><input value={f.purpose} onChange={set("purpose")} placeholder="The problem it solves and how AI helps" style={field}/></label>
      <label style={{display:"grid",gap:5}}><span style={{fontSize:9,fontWeight:900,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.08em"}}>Expected value</span><input value={f.value} onChange={set("value")} placeholder="e.g. saves the team ~5h/week" style={field}/></label>
      <div style={{display:"flex",gap:9,marginTop:2,flexWrap:"wrap"}}>
        <button onClick={submit} style={{background:AI_GOLD,border:"none",borderRadius:9,padding:"9px 15px",color:"#0b0e24",fontSize:11,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>Send for manager approval</button>
        <button onClick={()=>setOpen(false)} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"9px 15px",color:T.ink2,fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>Cancel</button>
      </div>
    </div>}
  </Card>;
}

function renderBlock(b, i, ctx){
  switch(b.t){
    case "kpis":    return <Kpis key={i} items={b.items} ctx={ctx}/>;
    case "newproject": return <NewProject key={i} {...b} role={ctx.role} showToast={ctx.showToast}/>;
    case "attn":    return <Attn key={i} items={b.items}/>;
    case "bars":    return <Bars key={i} {...b}/>;
    case "table":   return <Tbl key={i} {...b} ctx={ctx}/>;
    case "scores":  return <Scores key={i} {...b}/>;
    case "text":    return <TextBlock key={i} {...b}/>;
    case "library": return <Library key={i} items={b.items}/>;
    case "report":  return <Report key={i} {...b} showToast={ctx.showToast}/>;
    case "actions": return <Actions key={i} {...b} role={ctx.role} showToast={ctx.showToast}/>;
    case "register":return <Register key={i} {...b} ctx={ctx}/>;
    default:        return null;
  }
}
/* Card-type blocks flow into a responsive 2-col grid; full-width blocks
   (kpis, attn, actions, report, library) render on their own row. */
const FULL = new Set(["kpis","attn","actions","report","library","register","newproject"]);
function Blocks({blocks, ctx}){
  const out=[]; let bucket=[];
  const flush=()=>{ if(bucket.length){ out.push(<div key={"g"+out.length} style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))",gap:16,marginBottom:16}}>{bucket}</div>); bucket=[]; } };
  blocks.forEach((b,i)=>{ if(FULL.has(b.t)){ flush(); out.push(<div key={"f"+i} style={{marginBottom:0}}>{renderBlock(b,i,ctx)}</div>); } else { bucket.push(renderBlock(b,i,ctx)); } });
  flush();
  return <>{out}</>;
}

function PageHead({title,sub}){
  const lang=useLang(); const T_=en=>ts(lang,en);
  return <div style={{marginBottom:16}}>
    <div style={{fontFamily:F.e,fontWeight:400,fontSize:26,lineHeight:1.1,color:T.ink,margin:"0 0 4px"}}>{T_(title)}</div>
    <div style={{color:T.ink3,fontSize:12,fontFamily:F.b}}>{T_(sub)}</div>
  </div>;
}

/* Overview dashboard lenses — derived from the role's surfaces (excluding
   playbook, reports and assistant, which are pages rather than lenses).
   Mirrors the CEO/CAIO in-surface tabs so every role is consistent. */
function Overview({role,cfg,ctx,userName}){
  const lang=useLang(); const ar=lang==="ar"; const T_=en=>ts(lang,en);
  const name=(userName||(ROLES[role]||ROLES.caio).name).split(" ")[0];
  const hour=typeof window!=="undefined"?new Date().getHours():9;
  const greet=hour<12?"Good morning":hour<17?"Good afternoon":"Good evening";
  const [brief,setBrief]=useState(null);
  const [lineage,setLineage]=useState(null);
  /* Cross-functional binding: every CXO sees the initiatives that need
     THEIR facet of the shared initiative — one object, many owners. */
  const facetDomain=ROLE_FACET[role];
  const queue=facetDomain?initiativesForRole(role):[];
  const FacetBand=()=>!facetDomain?null:<Card style={{padding:"14px 16px",marginBottom:16,border:`1px solid ${AI_GOLD}35`}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:10,marginBottom:queue.length?10:0}}>
      <div><Eyebrow>{ar?"متعدد الوظائف · بوابتك":"Cross-functional · your gate"}</Eyebrow><H3 style={{margin:0}}>{ar?`مبادرات تحتاج مراجعتك (${T_(facetDomain)})`:`Initiatives needing your ${facetDomain} review`}</H3></div>
      <span style={{fontSize:11,fontWeight:900,fontFamily:F.m,color:queue.length?AI_GOLD:T.green}}>{queue.length||"0"}</span>
    </div>
    {queue.length?<div style={{display:"grid",gap:7}}>
      {queue.map(({a,facet})=><button key={a.id} onClick={()=>setBrief(a)} className="vz-reg-row" style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:10,alignItems:"center",textAlign:ar?"right":"left",background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px",cursor:"pointer"}}>
        <div style={{minWidth:0}}><div style={{fontSize:12,fontWeight:800,color:T.ink,fontFamily:F.b}}>{a.name}</div><div style={{fontSize:9.5,color:T.ink3,fontFamily:F.b,marginTop:2}}>{a.unit} · {a.lifecycle} · {facet.note}</div></div>
        <Pill c={col(facet.color)}>{facet.label}</Pill>
        <span style={{color:AI_GOLD_INK,fontWeight:900,fontFamily:F.b,fontSize:12}}>{ar?"افتح الملخص ←":"Open brief →"}</span>
      </button>)}
    </div>:<div style={{fontSize:11,color:T.ink3,fontFamily:F.b,marginTop:6}}>{ar?`لا شيء يحتاج مراجعتك (${T_(facetDomain)}) الآن — كل جوانب المبادرات مُخلاة.`:`Nothing needs your ${facetDomain} review right now — every initiative's ${facetDomain} facet is cleared.`}</div>}
  </Card>;
  const lctx={...ctx,onLineage:(l,v)=>setLineage(l&&typeof l==="object"?l:{label:l,value:v})};
  return <div style={{animation:"up .3s ease"}}>
    {brief&&<BriefDrawer a={brief} role={role} onClose={()=>setBrief(null)}/>}
    {lineage&&<LineageDrawer node={lineage} onAsset={id=>{setBrief(assetById(id));setLineage(null);}} onClose={()=>setLineage(null)}/>}
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:18,flexWrap:"wrap"}}>
      <div>
        {(ROLES[role]||{}).persona&&<span style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:9,fontWeight:900,fontFamily:F.m,letterSpacing:"0.09em",textTransform:"uppercase",color:AI_GOLD_INK,background:AI_GOLD+"14",border:`1px solid ${AI_GOLD}38`,borderRadius:999,padding:"3px 10px",marginBottom:8}}>{T_(ROLES[role].persona)}{role==="manager"&&<span style={{color:T.ink4,fontWeight:700,textTransform:"none",letterSpacing:0}}>{ar?"· عملك + فريقك":"· your work + your team"}</span>}</span>}
        <h1 style={{fontFamily:F.e,fontSize:29,fontWeight:400,color:T.ink,margin:"2px 0 4px"}}>{T_(greet)}{ar?"، ":", "}<span style={{color:AI_GOLD_INK}}>{name}.</span></h1>
        <div style={{color:T.ink3,fontSize:12.5,fontFamily:F.b,maxWidth:680}}>{T_(cfg.greet)} — {T_(cfg.sub)}</div>
        <div style={{fontSize:10.5,color:T.ink4,fontWeight:700,marginTop:6,fontStyle:"italic",fontFamily:F.b}}>{T_(cfg.thesis)}</div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:15,background:`linear-gradient(135deg,#E7BE63,${AI_GOLD} 55%,#B3852F)`,border:"1px solid #F0CE7E",borderRadius:15,padding:"12px 20px",boxShadow:`0 12px 30px ${AI_GOLD}4d,0 0 0 4px ${AI_GOLD}1f`}}>
        <div style={{fontSize:36,fontWeight:800,color:"#221703",letterSpacing:"-0.03em",lineHeight:.9,fontFamily:F.m}}>{T_(cfg.hero[0])}</div>
        <div style={{textAlign:ar?"right":"left"}}><div style={{fontSize:10,letterSpacing:"0.09em",textTransform:"uppercase",color:"#2a1c02",fontWeight:900,fontFamily:F.m}}>{T_(cfg.hero[1])}</div><div style={{fontSize:10.5,color:"#4b3608",marginTop:3,fontWeight:600,fontFamily:F.b}}>{T_(cfg.hero[2])}</div></div>
      </div>
    </div>
    {/* The employee and manager rails are deliberately minimal, so the cockpit
       is the one place their other personal surfaces are reachable. A manager
       is an employee too, so this navigator is the same for both; the Team View
       is a rail item, not part of it. */}
    {(role==="employee"||role==="manager")&&(()=>{
      const jump=(cfg.surfaces||[]).filter(s=>!["emp_assistant","emp_learning","mgr_team"].includes(s.id));
      return jump.length?<div style={{marginTop:16,display:"flex",flexWrap:"wrap",gap:8,alignItems:"center"}}>
        <span style={{fontSize:9.5,fontWeight:900,letterSpacing:"0.1em",textTransform:"uppercase",color:T.ink4,fontFamily:F.m}}>{T_("Your workspace")}</span>
        {jump.map(s=><button key={s.id} onClick={()=>ctx.setTab&&ctx.setTab(s.id)} style={{display:"inline-flex",alignItems:"center",gap:6,background:T.s2,border:`1px solid ${T.border}`,borderRadius:999,padding:"6px 13px",fontSize:11,fontWeight:700,fontFamily:F.b,color:T.ink2,cursor:"pointer",transition:"border-color .15s"}}>{T_(s.label)}{s.badge?<span style={{fontSize:9,fontWeight:900,fontFamily:F.m,color:"#fff",background:AI_GOLD_INK,borderRadius:999,padding:"0 6px",lineHeight:"15px"}}>{s.badge}</span>:null}</button>)}
      </div>:null;
    })()}
    <div style={{marginTop:18,animation:"up .2s ease"}}><FacetBand/><Attn items={cfg.attn} ctx={ctx}/><Kpis items={cfg.kpis} ctx={lctx}/><Blocks blocks={cfg.panels} ctx={{...lctx,deep:false}}/></div>
  </div>;
}

export function RoleCommandCenter({tab="home",role="coo",setTab,setAiCentralView,navigate,showToast,userName}){
  const [lineage,setLineage]=useState(null);
  const [brief,setBrief]=useState(null);
  const cfg=ROLE_CENTERS[role]; if(!cfg) return null;
  const ctx={role,setTab,setAiCentralView,navigate,showToast,onLineage:(l,v)=>setLineage(l&&typeof l==="object"?l:{label:l,value:v})};
  if(tab==="home") return <Overview role={role} cfg={cfg} ctx={ctx} userName={userName}/>;
  const s=cfg.surfaces.find(x=>x.id===tab);
  if(!s) return <Overview role={role} cfg={cfg} ctx={ctx} userName={userName}/>;
  /* Sidebar surface = the deep workspace: registers render in full with
     drill-in drawers, and every metric drills to its lineage. */
  return <div style={{animation:"up .3s ease"}}>
    {lineage&&<LineageDrawer node={lineage} onAsset={id=>{setBrief(assetById(id));setLineage(null);}} onClose={()=>setLineage(null)}/>}
    {brief&&<BriefDrawer a={brief} role={role} onClose={()=>setBrief(null)}/>}
    <PageHead title={s.label} sub={s.sub}/>
    <Blocks blocks={s.blocks} ctx={{...ctx,deep:true}}/>
  </div>;
}
