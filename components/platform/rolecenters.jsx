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
  "Open register": "افتح السجل",
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

/* ── Deep drill-down localisation (the Block-renderer pass) ──────────
   The generic block renderers (bars · table · scores · text · report ·
   actions · register · library) now run every config string through the
   dictionary. These calls translate the skeleton every surface shares —
   table column headers, status pills, section headers, drawer chrome and
   the report builder — plus the panel/text narrative per role. Product
   and model names, currency figures and dated events fall back to English
   by design. */

/* Chrome: table column headers · status & pill values · block controls. */
registerContent({
  // ── table column headers ──
  "Function": "الوظيفة", "Throughput": "الإنتاجية", "Trend": "الاتجاه", "Process": "العملية",
  "Human gate": "بوابة بشرية", "Change": "التغيير", "Wave": "الموجة", "Program": "البرنامج",
  "Budget": "الميزانية", "Realized": "المُحقَّق", "Payback": "الاسترداد", "Consumed": "المُستهلَك",
  "State": "الحالة", "Actual": "الفعلي", "Variance": "الانحراف", "Target": "الهدف",
  "Domain": "المجال", "Grade": "الدرجة", "Treatment": "المعالجة", "Initiative": "المبادرة",
  "Residual": "المتبقّي", "Model": "النموذج", "Use": "الاستخدام", "Version": "الإصدار",
  "System": "النظام", "Data": "البيانات", "Decision effect": "أثر القرار", "Safeguard": "الضمانة",
  "Personal data": "بيانات شخصية", "Profiling": "التنميط", "DPIA": "تقييم الأثر",
  "Event": "الحدث", "Framework": "الإطار", "Type": "النوع", "Item": "البند",
  "Obligation": "الالتزام", "Due": "الاستحقاق", "Vendor": "المورّد", "IP clause": "بند الملكية الفكرية",
  "KRI": "مؤشّر مخاطر", "Threshold": "العتبة", "Skill track": "مسار المهارة", "Enrolled": "المُسجَّلون",
  "Complete": "مكتمل", "Track": "المسار", "Role family": "عائلة الأدوار", "Tasks automated": "المهام المؤتمتة",
  "Impact": "الأثر", "Plan": "الخطة", "Session": "الجلسة", "Outcome": "النتيجة",
  "Role": "الدور", "Data allowed": "البيانات المسموحة", "Date": "التاريخ", "Risk detected": "الخطر المكتشَف",
  "Progress": "التقدّم", "Coverage": "التغطية", "Owner": "المالك", "Status": "الحالة",
  "Flow": "التدفّق", "Mechanism": "الآلية", "Policies": "السياسات", "Actions": "الإجراءات",
  "Action": "الإجراء", "Where": "الموقع", "Member": "العضو", "Training": "التدريب",
  "Your deliverable": "مُخرَجك", "Open risk": "خطر مفتوح", "Where · when": "المكان · الوقت",
  "Why & what to do": "السبب وما يجب فعله", "Owner / scope": "المالك / النطاق",
  "Data · when": "البيانات · الوقت", "Liability terms": "بنود المسؤولية",
  // ── status / pill values (shared across registers & tables) ──
  "Healthy": "سليم", "Blocked": "محجوب", "Pilot": "تجريبي", "Ready": "جاهز", "Required": "مطلوب",
  "Sampled": "بالعيّنة", "Degraded": "متدهور", "Overdue": "متأخر", "Met": "مُستوفى", "Gap": "فجوة",
  "Partial": "جزئي", "Monitor": "مراقبة", "Accept": "قبول", "Close gap": "أغلِق الفجوة",
  "OK": "سليم", "Breach": "خرق", "Breach risk": "خطر خرق", "Returning": "يُحقّق عائداً",
  "Pre-value": "قبل القيمة", "Ineffective": "غير فعّال", "In force": "ساري", "Review overdue": "مراجعة متأخرة",
  "Effective": "فعّال", "Not yet effective": "غير فعّال بعد", "Investigating": "قيد التحقيق",
  "Mitigating": "قيد التخفيف", "Triage": "فرز", "Patching": "قيد الترقيع", "Fix ready": "الإصلاح جاهز",
  "Planned": "مُخطَّط", "Present": "موجود", "Missing": "مفقود", "Clear": "سليم",
  "Provenance gap": "فجوة مصدر", "Deprecating": "قيد الإيقاف", "High change": "تغيير كبير",
  "Augmented": "مُعزَّز", "Uplift": "ترقية", "Reskill": "إعادة تأهيل", "Transition": "انتقال",
  "Ramping": "في تصاعد", "Behind": "متأخّر", "Priority": "أولوية", "Coaching booked": "حُجزت جلسة توجيه",
  "Resolved": "مُعالَج", "Escalated to CISO": "صُعِّد لمسؤول الأمن", "Valid": "صالح", "Closed": "مغلق",
  "Remediating": "قيد المعالجة", "Near-miss": "وشيك", "Low": "منخفض", "High": "عالٍ",
  "Medium": "متوسط", "Med": "متوسط", "Critical": "حرج", "Legal effect": "أثر قانوني",
  "Significant": "جوهري", "Limited": "محدود", "Logged + review": "مُسجَّل + مراجعة",
  "Human review": "مراجعة بشرية", "DPIA due": "تقييم الأثر مستحق", "Complete DPIA": "أكمل تقييم الأثر",
  "Open": "مفتوح", "Yes": "نعم", "No": "لا", "None": "لا شيء", "N/A": "لا ينطبق",
  "Enforced": "مُنفَّذ", "Ready for review": "جاهز للمراجعة", "Stretched": "مُجهَد", "At limit": "عند الحد",
  "On target": "على الهدف", "Below target": "دون الهدف", "Enablement needed": "يلزم تمكين",
  "Below threshold": "دون العتبة", "Needs work": "يحتاج عملاً", "Gaps": "فجوات",
  "Defensible": "قابل للدفاع", "Optimise": "تحسين", "Efficient": "كفؤ", "Compliant": "ممتثل",
  "Acknowledged": "مُقَرّ", "Outstanding": "معلّق", "In progress": "قيد التنفيذ", "In Progress": "قيد التنفيذ",
  "Submitted": "مُقدَّم", "Saved 40m": "وفّر 40 دقيقة", "Saved 25m": "وفّر 25 دقيقة", "Saved 55m": "وفّر 55 دقيقة",
  "Redacted PII": "نُقِّحت البيانات الشخصية", "Piloting": "قيد التجريب", "Scaling": "قيد التوسّع",
  "Warning": "تحذير", "Approval": "موافقة", "Approved": "معتمد", "Restricted": "مقيّد",
  // ── block chrome (drawer · report · new project · actions labels) ──
  "Maturity": "النضج", "Timeline": "الجدول الزمني", "Record": "سجّل",
  "Action / treatment plan": "خطة الإجراء / المعالجة", "Open full register": "افتح السجل الكامل",
  "Open project workspace": "افتح مساحة عمل المشروع", "Open in Risk Center": "افتح في مركز المخاطر",
  "View in Risk Center": "اعرض في مركز المخاطر", "Project": "المشروع", "Detected": "اكتُشِف",
  "SLA / due": "اتفاقية الخدمة / الاستحقاق",
  "Generate report": "أنشئ التقرير", "Schedule": "جدولة", "Export XLSX": "تصدير XLSX", "Export PDF": "تصدير PDF",
  "Training completed — on your record": "تدريب مكتمل — في سجلّك",
  "Auto-included as governance evidence": "مُضمَّن تلقائياً كدليل حوكمة",
  "Start a new project": "ابدأ مشروعاً جديداً", "Project name": "اسم المشروع",
  "What will it do?": "ماذا سيفعل؟", "Expected value": "القيمة المتوقّعة",
  "Send for manager approval": "أرسِل لموافقة المدير", "Cancel": "إلغاء",
  // MetaRow labels (actions context strip)
  "Raised by": "أثاره", "Why it matters": "لماذا يهم", "Next step": "الخطوة التالية",
  "Waiting on": "بانتظار", "Linked": "مرتبط",
  // action buttons
  "Approve": "اعتمد", "Decline": "ارفض", "Defer": "أجّل", "Hold": "علّق", "Grant": "امنح",
  "Withdraw": "اسحب", "Nudge approver": "ذكّر المُعتمِد", "View request": "اعرض الطلب",
  "Snooze": "غفوة", "Mark validated": "حدّد كمُتحقَّق", "Flag issue": "أبلِغ عن مشكلة",
  "Acknowledge": "أقِرّ", "Read policy": "اقرأ السياسة", "Open Team View": "افتح عرض الفريق",
});

/* COO — panels, surfaces, bars/scores labels, report dims. */
registerContent({
  // panel + bars headers
  "AI across the value chain": "الذكاء الاصطناعي عبر سلسلة القيمة",
  "Automation coverage by process": "تغطية الأتمتة حسب العملية",
  "Throughput & SLA by function": "الإنتاجية واتفاقية الخدمة حسب الوظيفة",
  "Where flow is healthy vs breaking": "أين يكون التدفّق سليماً مقابل المتعثّر",
  "By process": "حسب العملية", "Automation register": "سجل الأتمتة",
  "Coverage · human gate · owner": "التغطية · بوابة بشرية · المالك",
  "Capacity & augmentation": "السعة والتعزيز", "Utilisation by team": "الاستغلال حسب الفريق",
  "Operational risk register": "سجل المخاطر التشغيلية", "Highest exposure first": "الأعلى تعرّضاً أولاً",
  "SLA by function": "اتفاقية الخدمة حسب الوظيفة", "Adherence & trend": "الالتزام والاتجاه",
  // bars/scores row labels (generic function names)
  "Customer onboarding": "إعداد العملاء", "Claims processing": "معالجة المطالبات",
  "Payments ops": "عمليات المدفوعات", "Servicing & support": "الخدمة والدعم",
  "Back-office recon": "التسويات الخلفية", "Retail Ops": "عمليات التجزئة",
  "Claims": "المطالبات", "Payments": "المدفوعات", "Servicing": "الخدمة", "Onboarding": "الإعداد",
  "Onboarding KYC": "إعداد اعرف عميلك", "Recon": "التسوية",
  // surface labels + subs (PageHead)
  "Operations Playbook": "دليل العمليات",
  "Operating strategy, change plans and the runbooks that keep AI operations governed.": "استراتيجية التشغيل وخطط التغيير وأدلة التشغيل التي تُبقي عمليات الذكاء الاصطناعي مُحوكَمة.",
  "Process Automation": "أتمتة العمليات",
  "Every automation, its coverage, and the human gate that governs it.": "كل أتمتة وتغطيتها والبوابة البشرية التي تحوكمها.",
  "Performance & SLAs": "الأداء واتفاقيات الخدمة",
  "Throughput, cycle-time and SLA adherence across operations.": "الإنتاجية وزمن الدورة والتزام اتفاقية الخدمة عبر العمليات.",
  "Workforce Capacity": "سعة القوى العاملة",
  "Human-in-the-loop capacity and where AI augmentation relieves load.": "سعة الإنسان في الحلقة وأين يخفّف تعزيز الذكاء الاصطناعي العبء.",
  "Operational Risk": "المخاطر التشغيلية",
  "Operational and process risk introduced by AI in the value chain.": "المخاطر التشغيلية والعملياتية التي يُدخلها الذكاء الاصطناعي في سلسلة القيمة.",
  // text body
  "Operating strategy": "استراتيجية التشغيل",
  "AI in operations — the plan": "الذكاء الاصطناعي في العمليات — الخطة",
  "Automate the highest-volume, lowest-variance flows first; keep a human gate on customer-impacting decisions; scale automation only past an SLA-stability bar.": "أتمتة المسارات الأعلى حجماً والأقل تبايناً أولاً؛ إبقاء بوابة بشرية على القرارات المؤثّرة في العملاء؛ توسيع الأتمتة فقط بعد تجاوز عتبة استقرار اتفاقية الخدمة.",
  // surface kpis
  "SLA adherence": "التزام اتفاقية الخدمة", "rolling 30d": "30 يوماً متجدّدة", "vs baseline": "مقابل خط الأساس",
  "Throughput": "الإنتاجية", "across flows": "عبر المسارات", "Rework rate": "معدّل إعادة العمل", "target <3%": "الهدف <3%",
  // report dims
  "By function": "حسب الوظيفة", "SLA & throughput": "اتفاقية الخدمة والإنتاجية", "Capacity": "السعة",
  "By time": "حسب الوقت",
});

/* CFO — panels, surfaces, report dims. */
registerContent({
  "ROI by program": "العائد حسب البرنامج", "Investment · realized · ROI · payback": "الاستثمار · المُحقَّق · العائد · الاسترداد",
  "Return & payback": "العائد والاسترداد",
  "Where the money goes": "أين يذهب المال", "Run-rate cost breakdown": "تفصيل تكلفة معدّل التشغيل",
  "Run-rate breakdown": "تفصيل معدّل التشغيل", "Monthly $310K": "شهرياً 310 آلاف دولار",
  "Investment portfolio": "محفظة الاستثمار", "Budget · consumed · realized": "الميزانية · المُستهلَك · المُحقَّق",
  "Budget vs actual": "الميزانية مقابل الفعلي", "Financial risk register": "سجل المخاطر المالية",
  "Exposure & mitigation": "التعرّض والتخفيف",
  // surface labels + subs
  "Investment Portfolio": "محفظة الاستثمار",
  "Every AI investment, its stage and its financial return.": "كل استثمار في الذكاء الاصطناعي ومرحلته وعائده المالي.",
  "Value & ROI": "القيمة والعائد",
  "Realized value, ROI and time-to-value across the book.": "القيمة المُحقَّقة والعائد وزمن الوصول للقيمة عبر الدفتر.",
  "Cost & Run-rate": "التكلفة ومعدّل التشغيل",
  "The monthly cost of running AI — compute, licensing, people.": "التكلفة الشهرية لتشغيل الذكاء الاصطناعي — الحوسبة والترخيص والأشخاص.",
  "Budget & Forecast": "الميزانية والتوقّع",
  "Budget vs actual and the rolling reforecast.": "الميزانية مقابل الفعلي وإعادة التوقّع المتجدّدة.",
  "Financial Risk": "المخاطر المالية",
  "Value-at-risk and the financial exposure of the AI book.": "القيمة المعرّضة للخطر والتعرّض المالي لدفتر الذكاء الاصطناعي.",
  // surface kpis
  "Realized / invested": "المُحقَّق / المُستثمَر", "per $ spent": "لكل دولار مُنفَق",
  "Consumed, no value": "مُستهلَك دون قيمة", "pre-payload programs": "برامج قبل العائد",
  "Avg TTV": "متوسط زمن الوصول للقيمة", "fastest 4.2 · slowest 9.8": "الأسرع 4.2 · الأبطأ 9.8",
  "Run-rate": "معدّل التشغيل", "+14% MoM": "+14% شهرياً", "up on volume": "مرتفع مع الحجم",
  "Committed spend": "الإنفاق المُلتزَم", "remaining FY": "المتبقّي من السنة المالية",
  // financial-risk + budget table cells
  "Value never realized": "قيمة لا تتحقّق أبداً", "Cost overrun": "تجاوز التكلفة", "Vendor lock-in": "الاحتجاز لدى المورّد",
  "Reforecast": "إعادة التوقّع", "Routing optim": "تحسين التوجيه", "Second-source": "مصدر بديل",
  "On plan": "وفق الخطة", "83% used · under review": "استُخدِم 83% · قيد المراجعة",
  // report dims
  "Cost & run-rate": "التكلفة ومعدّل التشغيل", "By program": "حسب البرنامج",
});

/* CHRO — panels, surfaces, report dims. */
registerContent({
  "Adoption & augmentation by function": "التبنّي والتعزيز حسب الوظيفة",
  "With headcount in each unit": "مع عدد الموظفين في كل وحدة", "With headcount": "مع عدد الموظفين",
  "Skills & reskilling pipeline": "خط المهارات وإعادة التأهيل",
  "Building capability where AI changes the work": "بناء القدرات حيث يغيّر الذكاء الاصطناعي العمل",
  "Adoption by function": "التبنّي حسب الوظيفة", "Reskilling pipeline": "خط إعادة التأهيل",
  "Tracks & progress": "المسارات والتقدّم", "Role-impact register": "سجل أثر الأدوار",
  "Task automation & transition": "أتمتة المهام والانتقال",
  // surface labels + subs
  "Workforce Playbook": "دليل القوى العاملة",
  "Workforce AI strategy — augmentation-first, reskilling, responsible use.": "استراتيجية الذكاء الاصطناعي للقوى العاملة — التعزيز أولاً، وإعادة التأهيل، والاستخدام المسؤول.",
  "Adoption & Enablement": "التبنّي والتمكين",
  "Who's adopting AI, with headcount, and where enablement is needed.": "من يتبنّى الذكاء الاصطناعي، مع عدد الموظفين، وأين يلزم التمكين.",
  "Skills & Reskilling": "المهارات وإعادة التأهيل",
  "The reskilling pipeline for roles AI is changing.": "خط إعادة التأهيل للأدوار التي يغيّرها الذكاء الاصطناعي.",
  "Role Impact": "أثر الأدوار",
  "How AI changes each role — augmented vs displaced.": "كيف يغيّر الذكاء الاصطناعي كل دور — مُعزَّز مقابل مُستبدَل.",
  "Sentiment & Feedback": "المشاعر والتغذية الراجعة",
  "How people feel about AI at work.": "كيف يشعر الناس تجاه الذكاء الاصطناعي في العمل.",
  // text body
  "Workforce strategy": "استراتيجية القوى العاملة", "Augment, don't replace": "عزِّز، لا تستبدِل",
  "Every automated task pairs with a reskilling path; no role is displaced without a transition plan; adoption is enabled, not mandated.": "كل مهمة مؤتمتة تقترن بمسار إعادة تأهيل؛ لا يُستبدَل أي دور دون خطة انتقال؛ التبنّي مُيسَّر، لا مفروض.",
  // bars/scores + tracks
  "AI governance & safe-use": "حوكمة الذكاء الاصطناعي والاستخدام الآمن",
  "Prompt & tooling fluency": "إتقان المطالبات والأدوات", "Data literacy": "الثقافة البيانية",
  "Reskill — augmented roles": "إعادة تأهيل — الأدوار المُعزَّزة",
  "Governance & safe-use": "الحوكمة والاستخدام الآمن", "Prompt fluency": "إتقان المطالبات",
  "Augmented-role reskill": "إعادة تأهيل الأدوار المُعزَّزة",
  "Customer service": "خدمة العملاء", "Back-office": "المكتب الخلفي", "Analysis": "التحليل",
  // surface kpis
  "Net sentiment": "صافي المشاعر", "Trust in AI tools": "الثقة بأدوات الذكاء الاصطناعي", "+8pts": "+8 نقاط",
  "Concern — job security": "قلق — الأمن الوظيفي", "monitored": "مُراقَب",
  "Enablement ask": "طلب التمكين", "core-system integration": "تكامل الأنظمة الأساسية",
  // report dims
  "Adoption": "التبنّي", "Reskilling": "إعادة التأهيل", "Role impact": "أثر الأدوار", "Sentiment": "المشاعر",
  "Responsible use": "الاستخدام المسؤول",
});

/* CISO — threat panels, enforcement text surfaces, registers, report dims. */
registerContent({
  // panel + register headers
  "AI threat surface": "سطح تهديد الذكاء الاصطناعي",
  "Attempts blocked by vector (30d)": "المحاولات المحجوبة حسب المتجّه (30 يوماً)",
  "Incident & vulnerability queue": "قائمة الحوادث والثغرات",
  "Ranked by severity — click any row to drill in": "مرتّبة حسب الخطورة — انقر أي صف للتفصيل",
  "Attempts blocked by vector": "المحاولات المحجوبة حسب المتجّه", "Last 30 days": "آخر 30 يوماً",
  "Guardrail coverage by model": "تغطية الحواجز حسب النموذج",
  "Input/output filtering, rate-limits, logging": "تصفية المدخلات/المخرجات، وحدود المعدّل، والتسجيل",
  "Open incident queue": "قائمة الحوادث المفتوحة",
  "Every incident traces to its AI system, owner and response plan": "كل حادثة تُنسَب إلى نظام الذكاء الاصطناعي ومالكها وخطة الاستجابة",
  "Vulnerability register": "سجل الثغرات",
  "Every finding traces to its asset, owner and remediation plan": "كل نتيجة تُنسَب إلى أصلها ومالكها وخطة المعالجة",
  // threat vectors (bars)
  "Prompt injection": "حقن الإدخالات", "Jailbreak / policy evasion": "كسر القيود / التحايل على السياسة",
  "Sensitive-data exfiltration": "تسريب البيانات الحسّاسة", "Model DoS / abuse": "حرمان الخدمة / إساءة استخدام النموذج",
  "Jailbreak": "كسر القيود", "Data exfiltration": "تسريب البيانات", "Model DoS": "حرمان خدمة النموذج",
  // surface labels + subs
  "Veris Enforce": "Veris Enforce",
  "The enforcement plane — every agent tool call decided at runtime, deny-by-default.": "مستوى الإنفاذ — كل استدعاء أداة من وكيل يُقرَّر وقت التشغيل، والمنع افتراضي.",
  "Enforcement Coverage": "تغطية الإنفاذ",
  "Where control actually reaches — enforced inline vs observed vs shadow.": "أين تصل السيطرة فعلاً — مُنفَّذ مباشرةً مقابل مُراقَب مقابل ظِلّي.",
  "Policy-as-a-Service": "السياسة كخدمة",
  "The policy engine as a callable service — one rulebook, every channel.": "محرّك السياسة كخدمة قابلة للاستدعاء — كتاب قواعد واحد، كل قناة.",
  "Agent Authority": "صلاحية الوكيل",
  "Short-lived, scoped capability tokens — no agent holds a standing key.": "رموز قدرة قصيرة العمر ومحدّدة النطاق — لا وكيل يحمل مفتاحاً دائماً.",
  "Tool-Call Ledger": "سجل استدعاءات الأدوات",
  "Prove what agents were allowed to do — and what they actually did.": "أثبِت ما سُمِح للوكلاء بفعله — وما فعلوه فعلاً.",
  "MCP Registry": "سجل MCP",
  "Supply-chain control — pin tool manifests by hash, catch rug-pulls.": "ضبط سلسلة التوريد — تثبيت بيانات الأدوات بالبصمة، والتقاط تغييرات الخداع.",
  "Egress Policy": "سياسة الخروج",
  "The containment guarantee — a successful injection can't reach the internet.": "ضمانة الاحتواء — حقن ناجح لا يمكنه بلوغ الإنترنت.",
  "HITL Gates": "بوابات الإنسان في الحلقة",
  "Human oversight thresholds on high-impact actions (Art.14 / 22).": "عتبات الإشراف البشري على الإجراءات عالية الأثر (المادة 14 / 22).",
  "Circuit Breaker": "قاطع الدائرة",
  "Real-time capability revocation — downscope, suspend or halt an agent mid-session.": "إلغاء القدرة في الوقت الحقيقي — تضييق أو تعليق أو إيقاف وكيل أثناء الجلسة.",
  "Threat Center": "مركز التهديدات", "The live AI attack surface by vector.": "سطح هجوم الذكاء الاصطناعي الحيّ حسب المتجّه.",
  "Agent Chain Permissions": "أذونات سلسلة الوكلاء",
  "Least privilege across agent chains — per step, per delegation, per composition.": "أقل صلاحية عبر سلاسل الوكلاء — لكل خطوة، ولكل تفويض، ولكل تركيب.",
  "AI Incidents": "حوادث الذكاء الاصطناعي",
  "Security incidents from ServiceNow / SIEM — each linked to its AI system, with a response plan.": "حوادث أمنية من ServiceNow / SIEM — كل منها مرتبط بنظام الذكاء الاصطناعي، مع خطة استجابة.",
  "Vulnerabilities": "الثغرات",
  "Open vulnerabilities across models, endpoints and pipelines — with the asset and remediation plan.": "ثغرات مفتوحة عبر النماذج ونقاط النهاية والمسارات — مع الأصل وخطة المعالجة.",
  "Guardrails & Controls": "الحواجز والضوابط",
  "Guardrail and control coverage by production model.": "تغطية الحواجز والضوابط حسب نموذج الإنتاج.",
  "Red-Team": "الفريق الأحمر", "Adversarial testing results and coverage.": "نتائج الاختبار العدائي وتغطيته.",
  // text bodies (shared with CGO where identical)
  "Enforcement": "الإنفاذ", "Governance that actually enforces": "حوكمة تُنفِّذ فعلاً",
  "Policy → enforcement → evidence in one control set. Every agent tool call is decided at call time — capability tokens, egress and human-in-the-loop — and signed into a tamper-evident ledger.": "السياسة ← الإنفاذ ← الدليل في مجموعة ضوابط واحدة. كل استدعاء أداة من وكيل يُقرَّر وقت الاستدعاء — رموز القدرة، والخروج، والإنسان في الحلقة — ويُوقَّع في سجل مقاوم للعبث.",
  "Honest scope": "نطاق صادق",
  "Enforcement is a chokepoint, not action at a distance": "الإنفاذ نقطة اختناق، لا فعل عن بُعد",
  "Veris decides what an agent does only where its traffic runs through the plane. This splits the estate into enforced (inline — block, mask, revoke), observed (out-of-band edge DLP) and shadow (detected, ungoverned), and computes real coverage — never a claim of control it does not have.": "يقرّر Veris ما يفعله الوكيل فقط حيث تمرّ حركته عبر المستوى. هذا يقسّم البيئة إلى مُنفَّذ (مباشرةً — حجب، إخفاء، إلغاء)، ومُراقَب (منع تسرّب بيانات على الحافة خارج المسار)، وظِلّي (مكتشَف، غير مُحوكَم)، ويحسب التغطية الحقيقية — دون أي ادّعاء بسيطرة لا يملكها.",
  "Policy the whole enterprise can call": "سياسة يمكن للمؤسسة كلها استدعاؤها",
  "The same DLP + classification rulebook the Gateway enforces inline, exposed at one endpoint so a browser extension, CASB or CI pipeline enforces it on shadow-AI traffic too — allow · mask · block, every verdict signed into the evidence chain.": "كتاب قواعد منع تسرّب البيانات والتصنيف نفسه الذي تُنفِّذه البوابة مباشرةً، مكشوفاً عند نقطة نهاية واحدة كي تُنفِّذه إضافة متصفّح أو CASB أو مسار CI على حركة الذكاء الاصطناعي الظِّلّي أيضاً — سماح · إخفاء · حجب، وكل حُكم مُوقَّع في سلسلة الأدلة.",
  "Least privilege": "أقل صلاحية", "Tokens, not standing keys": "رموز، لا مفاتيح دائمة",
  "To call a tool an agent must be issued a scoped, short-lived capability token; issuance runs the least-privilege boundary first, so ungranted or high-stakes calls never mint a token.": "لاستدعاء أداة يجب أن يُصدَر للوكيل رمز قدرة محدّد النطاق قصير العمر؛ يُشغّل الإصدار حدّ أقل صلاحية أولاً، فلا تسكّ الاستدعاءات غير الممنوحة أو عالية المخاطر رمزاً أبداً.",
  "Evidence": "الدليل", "Tamper-evident tool-call record": "سجل استدعاءات أدوات مقاوم للعبث",
  "Every tool call is a signed row — the authorised grant beside the actual call — hash-chained so altering any row breaks every later one. The Art.12 / ISO 42001 audit artifact.": "كل استدعاء أداة صفٌّ مُوقَّع — المنح المُصرَّح به بجوار الاستدعاء الفعلي — مُسلسَل بالبصمة بحيث يكسر تعديلُ أي صف كلَّ صفّ لاحق. أثر تدقيق المادة 12 / ISO 42001.",
  "Supply chain": "سلسلة التوريد", "Catch the rug-pull before an agent binds": "التقِط الخداع قبل أن يرتبط وكيل",
  "MCP servers are third-party code that can change under you. Manifests are pinned by hash at approval and signed; any server whose current manifest hash no longer matches the pinned one is quarantined before an agent can be issued a token against its tools.": "خوادم MCP شيفرة طرف ثالث قد تتغيّر دون علمك. تُثبَّت بياناتها بالبصمة عند الاعتماد وتُوقَّع؛ وأيّ خادم لم تعد بصمة بياناته الحالية تطابق المُثبَّتة يُعزَل قبل أن يُصدَر لوكيل رمز مقابل أدواته.",
  "Containment": "الاحتواء", "Deny-by-default on the destination": "المنع افتراضياً على الوجهة",
  "Least privilege stops an agent calling a tool it doesn't hold; egress policy stops the tools it does hold reaching a destination they shouldn't — an allow-list plus deny categories that close data exfiltration and SSRF against the cloud metadata service.": "أقل صلاحية يمنع الوكيل من استدعاء أداة لا يملكها؛ وسياسة الخروج تمنع الأدوات التي يملكها من بلوغ وجهة لا يجب — قائمة سماح إضافةً إلى فئات منع تُغلق تسريب البيانات وهجمات SSRF على خدمة بيانات السحابة الوصفية.",
  "Oversight": "الإشراف", "Where autonomy stops and a human decides": "حيث يتوقّف الاستقلال ويقرّر إنسان",
  "High-impact actions are gated behind human approval with a threshold, so routine runs autonomously and the consequential routes to a named approver — mapped to EU AI Act Art.14 human oversight and Art.22 no-solely-automated-decision.": "الإجراءات عالية الأثر محجوبة خلف موافقة بشرية بعتبة، فيجري الروتيني تلقائياً ويُوجَّه المصيري إلى مُعتمِد مُسمّى — مربوطاً بالإشراف البشري في المادة 14 من قانون الذكاء الأوروبي والمادة 22 «لا قرار آلي بحت».",
  "Adaptive oversight": "إشراف متكيّف", "Continuous oversight, not just a fixed gate": "إشراف مستمر، لا مجرّد بوابة ثابتة",
  "The breaker watches each agent's live risk signal during a session and revokes capability the moment it crosses a threshold — downscope to read-only, suspend to a human, or halt and revoke every token — before the agent reaches a pre-defined gate. Tokens are short-lived, so revocation is instant, and every trip is written to the Art.12 chain. The continuous, adaptive human oversight EU AI Act Art.14 requires.": "يراقب القاطع إشارة الخطر الحيّة لكل وكيل أثناء الجلسة ويُلغي القدرة لحظة تجاوزها العتبة — تضييق إلى القراءة فقط، أو تعليق إلى إنسان، أو إيقاف وإلغاء كل رمز — قبل أن يبلغ الوكيل بوابة محدّدة مسبقاً. الرموز قصيرة العمر، فالإلغاء فوري، وكل تعثّر يُكتب في سلسلة المادة 12. الإشراف البشري المستمر المتكيّف الذي تتطلّبه المادة 14.",
  "Autonomy": "الاستقلالية", "Agents can't escalate through a chain": "لا يمكن للوكلاء التصعيد عبر سلسلة",
  "Least privilege holds at three altitudes: every step is re-checked against the agent's own capabilities; a sub-agent runs with min(orchestrator mandate, sub-agent grant) so a delegation can't widen data reach; and taint analysis across the whole chain catches emergent exfiltration paths that individually-allowed steps compose into.": "أقل صلاحية يصمد على ثلاثة مستويات: كل خطوة يُعاد فحصها مقابل قدرات الوكيل نفسه؛ ويعمل الوكيل الفرعي بأدنى (تفويض المنسّق، منح الوكيل الفرعي) فلا يوسّع التفويض مدى البيانات؛ ويلتقط تحليل التلوّث عبر السلسلة كلها مسارات تسريب ناشئة تتركّب منها خطوات مسموحة فرادى.",
  // surface kpis (red-team)
  "Models red-teamed": "نماذج اختُبِرت عدائياً", "this quarter": "هذا الربع", "Findings": "النتائج",
  "3 fixed · 6 open": "3 مُصلَحة · 6 مفتوحة", "Jailbreak resistance": "مقاومة كسر القيود", "eval score": "درجة التقييم",
  "Next campaign": "الحملة القادمة", "high-risk models": "نماذج عالية الخطورة",
  // report dims
  "Threat surface": "سطح التهديد", "Incidents": "الحوادث", "Guardrail coverage": "تغطية الحواجز",
  "Red-team": "الفريق الأحمر", "By model": "حسب النموذج",
});

/* CISO — incident & vulnerability register records (titles, summaries, plans,
   timelines, severity/status, due windows). These render via the Register /
   Drawer, which now pass every field through T_. */
registerContent({
  // severity / status labels
  "P1 · Critical": "P1 · حرج", "P2 · High": "P2 · عالٍ", "P3 · Medium": "P3 · متوسط",
  // due windows + relative times
  "Contain < 4h": "احتواء < 4 ساعات", "Mitigate < 48h": "تخفيف < 48 ساعة", "Assess < 5d": "تقييم < 5 أيام",
  "Patch < 24h": "ترقيع < 24 ساعة", "Deploy this sprint": "نشر هذه الدفعة", "Next cycle": "الدورة القادمة",
  "Today 09:14": "اليوم 09:14", "Yesterday 14:30": "أمس 14:30", "2d ago": "قبل يومين", "3d ago": "قبل 3 أيام",
  "1w ago": "قبل أسبوع", "2w ago": "قبل أسبوعين", "1d ago": "قبل يوم",
  // INC-1042
  "Prompt-injection attempt blocked at gateway": "محاولة حقن إدخالات محجوبة عند البوابة",
  "A crafted prompt tried to override system instructions on the Resolution Copilot and exfiltrate customer context. The gateway prompt-shield blocked it; forensics are open to confirm no data left the boundary.": "حاولت مطالبة مُصمَّمة تجاوز تعليمات النظام على Resolution Copilot وتسريب سياق العميل. حجبها درع المطالبات في البوابة؛ والتحليل الجنائي مفتوح لتأكيد ألا بيانات غادرت الحدود.",
  "Confirm gateway block held across all sessions": "تأكيد صمود حجب البوابة عبر كل الجلسات",
  "Pull 24h prompt logs for the attacker signature": "سحب سجلّات مطالبات 24 ساعة لبصمة المهاجم",
  "Add detector rule for the observed pattern": "إضافة قاعدة كشف للنمط المُلاحَظ",
  "Brief CAIO + close with evidence pack": "إحاطة مسؤول الذكاء الاصطناعي + الإغلاق بحزمة أدلة",
  "Injection attempt detected & blocked at gateway": "اكتُشِفت محاولة الحقن وحُجبت عند البوابة",
  "P1 opened, CISO office paged": "فُتِحت P1، واستُدعي مكتب مسؤول الأمن",
  "Forensics started on prompt logs": "بدأ التحليل الجنائي على سجلّات المطالبات",
  // INC-1039
  "Model drift → integrity risk on fraud signals": "انحراف النموذج ← خطر سلامة على إشارات الاحتيال",
  "Population drift on transaction features pushed the fraud model outside its validated envelope, risking degraded detection and integrity of downstream decisions.": "دفع انحراف السكان في سمات المعاملات نموذج الاحتيال خارج نطاقه المُتحقَّق منه، مُهدِّداً بتدهور الكشف وسلامة القرارات اللاحقة.",
  "Freeze auto-actioning on low-confidence scores": "تجميد الإجراء الآلي على الدرجات منخفضة الثقة",
  "Trigger retraining on the last 30d window": "تشغيل إعادة التدريب على نافذة آخر 30 يوماً",
  "Re-run bias + performance eval before promote": "إعادة تشغيل تقييم التحيّز + الأداء قبل الترقية",
  "Drift monitor breached threshold": "تجاوز مراقب الانحراف العتبة", "P2 opened, auto-action throttled": "فُتِحت P2، وخُنِق الإجراء الآلي",
  // INC-1030
  "Anomalous inference volume from single tenant": "حجم استدلال شاذّ من مستأجر واحد",
  "A 6x spike in inference calls from one business unit — possible abuse or a runaway batch job. Under triage to classify before rate-limit changes.": "قفزة 6 أضعاف في استدعاءات الاستدلال من وحدة أعمال واحدة — إساءة محتملة أو مهمة دفعية جامحة. قيد الفرز للتصنيف قبل تغييرات حدّ المعدّل.",
  "Identify calling service & intent": "تحديد الخدمة المُستدعِية والقصد", "Apply temporary rate-limit if abuse confirmed": "تطبيق حدّ معدّل مؤقّت إن تأكّدت الإساءة",
  "Volume anomaly flagged by monitor": "وسم المراقب شذوذ الحجم",
  // VUL-318
  "Unauthenticated inference endpoint on staging model": "نقطة نهاية استدلال غير موثّقة على نموذج تجريبي",
  "A staging deployment exposed an inference path without auth, allowing unapproved queries against the model. No production data is reachable, but the path must be closed before pilot exit.": "كشف نشرٌ تجريبي مسار استدلال دون توثيق، مُتيحاً استعلامات غير معتمدة على النموذج. لا بيانات إنتاج قابلة للوصول، لكن يجب إغلاق المسار قبل الخروج من التجربة.",
  "Take the staging endpoint offline": "إيقاف نقطة النهاية التجريبية", "Add mTLS + token auth to the inference gateway": "إضافة mTLS + توثيق برمز إلى بوابة الاستدلال",
  "Scan for other unauthenticated paths": "فحص مسارات أخرى غير موثّقة", "Re-test and record evidence": "إعادة الاختبار وتسجيل الدليل",
  "Found in red-team sweep": "اكتُشِف في مسح الفريق الأحمر", "Endpoint isolated from prod network": "عُزِلت نقطة النهاية عن شبكة الإنتاج",
  // VUL-311
  "Verbose error messages leak schema hints": "رسائل أخطاء مُطوَّلة تُسرِّب تلميحات المخطّط",
  "Stack traces returned to callers exposed internal field names that could aid an attacker mapping the data model. Fix is code-reviewed and staged.": "كشفت آثار المكدّس المُعادة للمستدعين أسماء حقول داخلية قد تساعد مهاجماً في رسم نموذج البيانات. الإصلاح مُراجَع الشيفرة ومُهيّأ.",
  "Suppress stack traces in prod responses": "كبح آثار المكدّس في ردود الإنتاج", "Deploy behind this sprint's release gate": "النشر خلف بوابة إصدار هذه الدفعة",
  "Reported by pen-test": "أُبلِغ عنه باختبار الاختراق", "Fix merged, awaiting release": "دُمِج الإصلاح، بانتظار الإصدار",
  // VUL-305
  "Weak redaction on prompt-log retention": "تنقيح ضعيف على الاحتفاظ بسجلّات المطالبات",
  "Prompt logs retained PII fragments that the redaction pass missed for certain formats. Scoped for the next hardening cycle with CDPO.": "احتفظت سجلّات المطالبات بشظايا بيانات شخصية أغفلها مسار التنقيح لصيغ معيّنة. مُحدَّدة النطاق لدورة التحصين القادمة مع مسؤول حماية البيانات.",
  "Extend redaction patterns to the missed formats": "توسيع أنماط التنقيح للصيغ المُغفَلة", "Backfill-scrub existing retained logs": "تنظيف السجلّات المُحتفَظ بها القائمة بأثر رجعي",
  "Identified in DLP audit": "اكتُشِف في تدقيق منع تسرّب البيانات",
});

/* CIO — platform panels, surfaces, report dims. */
registerContent({
  "Gateway & model-ops health": "صحة البوابة وعمليات النماذج",
  "Signal health across the control plane": "صحة الإشارات عبر مستوى التحكّم",
  "Model registry & lifecycle": "سجل النماذج ودورة حياتها",
  "Production models & their state": "نماذج الإنتاج وحالتها",
  "Control-plane health": "صحة مستوى التحكّم", "Signal availability": "توفّر الإشارة",
  "Model registry": "سجل النماذج", "Production & staged models": "نماذج الإنتاج والمُهيّأة",
  "Integration map": "خريطة التكاملات", "Connectors & status": "الموصلات والحالة",
  "Cost & performance": "التكلفة والأداء", "By workload": "حسب حمل العمل",
  // bars/table labels
  "Gateway availability": "توفّر البوابة", "Model routing success": "نجاح توجيه النماذج",
  "Guardrail middleware": "وسيط الحواجز", "Eval / drift pipeline": "مسار التقييم / الانحراف",
  "Data pipelines": "مسارات البيانات", "Gateway": "البوابة", "Routing": "التوجيه",
  "Guardrails": "الحواجز", "Eval/drift": "التقييم/الانحراف", "Pipelines": "المسارات",
  "Core banking": "الأنظمة المصرفية الأساسية", "Data lake": "بحيرة البيانات",
  "Retail Banking": "المصرفية للأفراد", "Customer Ops": "عمليات العملاء", "Finance": "المالية",
  "ITSM": "إدارة خدمات تقنية المعلومات", "Customer": "العملاء", "Other": "أخرى",
  // surface labels + subs
  "Platform Health": "صحة المنصة",
  "Uptime, latency and the health of the AI control plane.": "الجاهزية وزمن الاستجابة وصحة مستوى تحكّم الذكاء الاصطناعي.",
  "Model Registry": "سجل النماذج", "Every model, its version and lifecycle state.": "كل نموذج وإصداره وحالة دورة حياته.",
  "Gateway & Routing": "البوابة والتوجيه",
  "How inference is routed, guarded and rate-limited.": "كيف يُوجَّه الاستدلال ويُحرَس ويُحدَّد معدّله.",
  "Integrations": "التكاملات", "Systems AI connects to and their health.": "الأنظمة التي يتّصل بها الذكاء الاصطناعي وصحتها.",
  "Cost & Performance": "التكلفة والأداء", "The performance and unit-cost of inference.": "أداء الاستدلال وتكلفته لكل وحدة.",
  // surface kpis
  "Uptime": "الجاهزية", "30d": "30 يوماً", "p95 latency": "زمن الاستجابة p95", "SLO 600ms": "هدف الخدمة 600 مللي ثانية",
  "Error rate": "معدّل الأخطاء", "of calls": "من الاستدعاءات", "Routing success": "نجاح التوجيه",
  "primary→fallback": "الأساسي ← الاحتياطي", "Guardrail hits": "إصابات الحواجز", "blocked upstream": "محجوب في الأعلى",
  "Rate-limit events": "أحداث حدّ المعدّل", "Providers": "المزوّدون", "multi-model": "متعدّد النماذج",
  // report dims
  "Uptime & latency": "الجاهزية وزمن الاستجابة", "Gateway & routing": "البوابة والتوجيه",
  "Cost & performance": "التكلفة والأداء",
});

/* CDPO — privacy panels, surfaces, report dims. */
registerContent({
  "Automated-decision register": "سجل القرارات الآلية", "Art.22 systems & their safeguards": "أنظمة المادة 22 وضماناتها",
  "Personal-data processing by region": "معالجة البيانات الشخصية حسب المنطقة",
  "Systems & residency compliance": "الأنظمة والامتثال للإقامة",
  "Processing by region": "المعالجة حسب المنطقة", "Residency compliance": "الامتثال للإقامة",
  "DPIA register": "سجل تقييم الأثر", "Coverage & status": "التغطية والحالة",
  "Transfers": "عمليات النقل", "Cross-border data flows": "تدفّقات البيانات عبر الحدود",
  "Privacy incident log": "سجل حوادث الخصوصية", "Severity & status": "الخطورة والحالة",
  // region labels (city lists stay Latin)
  "EMEA · London, Frankfurt": "أوروبا والشرق الأوسط وأفريقيا · لندن، فرانكفورت",
  "Americas · NYC, São Paulo": "الأمريكتان · نيويورك، ساو باولو",
  "APAC · Singapore, Sydney": "آسيا والمحيط الهادئ · سنغافورة، سيدني",
  "EMEA": "أوروبا والشرق الأوسط وأفريقيا", "Americas": "الأمريكتان", "APAC": "آسيا والمحيط الهادئ",
  "EU → US (Copilot)": "الاتحاد الأوروبي ← الولايات المتحدة (Copilot)", "APAC logs → EU": "سجلّات آسيا ← الاتحاد الأوروبي",
  "SCCs + TIA": "بنود تعاقدية معيارية + تقييم أثر النقل", "Under review": "قيد المراجعة",
  // data/effect cells
  "Financial": "مالية", "Employee": "الموظفين", "Transactional": "معاملاتية", "Contact": "تواصل",
  // surface labels + subs
  "Privacy Playbook": "دليل الخصوصية", "Privacy-by-design strategy for AI systems.": "استراتيجية الخصوصية بالتصميم لأنظمة الذكاء الاصطناعي.",
  "DPIA & Assessments": "تقييمات الأثر", "Data-protection impact assessments across AI systems.": "تقييمات أثر حماية البيانات عبر أنظمة الذكاء الاصطناعي.",
  "Data Map & Residency": "خريطة البيانات والإقامة", "Where personal data lives and flows, by region.": "أين تقيم البيانات الشخصية وتتدفّق، حسب المنطقة.",
  "Consent & Rights": "الموافقة والحقوق", "Lawful basis, consent and subject-rights requests.": "الأساس القانوني والموافقة وطلبات حقوق الأصحاب.",
  "Privacy Incidents": "حوادث الخصوصية", "Privacy incidents and near-misses.": "حوادث الخصوصية والحالات الوشيكة.",
  // text body
  "Privacy strategy": "استراتيجية الخصوصية", "Lawful, minimal, contained": "قانوني، أدنى، مُحتوى",
  "No personal data enters an AI system without a lawful basis and a completed DPIA where profiling or automated decisions apply; data stays in-region unless a transfer mechanism is documented.": "لا تدخل بيانات شخصية أيّ نظام ذكاء اصطناعي دون أساس قانوني وتقييم أثر مكتمل حيث ينطبق التنميط أو القرارات الآلية؛ وتبقى البيانات داخل المنطقة ما لم تُوثَّق آلية نقل.",
  // surface kpis
  "Lawful basis": "الأساس القانوني", "Consent coverage": "تغطية الموافقة", "where required": "حيثما لزم",
  "Open SAR/erasure": "طلبات وصول/محو مفتوحة", "SLA 30d": "اتفاقية 30 يوماً", "Avg response": "متوسط الاستجابة", "within SLA": "ضمن اتفاقية الخدمة",
  // report dims
  "DPIA coverage": "تغطية تقييم الأثر", "Data map & residency": "خريطة البيانات والإقامة",
  "Consent & rights": "الموافقة والحقوق", "Art.22 register": "سجل المادة 22",
});

/* CGO — governance/board panels, the 24 governance surfaces (labels + subs),
   data tables and report dims. Text-body narratives follow in the next call. */
registerContent({
  // panels + scores
  "Regulatory & framework posture": "الوضع التنظيمي والأطر", "Where the enterprise stands": "أين تقف المؤسسة",
  "Governance operating model": "نموذج تشغيل الحوكمة", "Health of the governance engine": "صحة محرّك الحوكمة",
  "Board & council cadence": "إيقاع المجلس واللجان", "Policy lifecycle": "دورة حياة السياسة",
  "Control library": "مكتبة الضوابط", "Risk management": "إدارة المخاطر", "Audit & assurance": "التدقيق والضمان",
  "Regulation": "لائحة", "AI mgmt": "إدارة ذكاء اصطناعي", "High-risk": "عالي الخطورة",
  "Enterprise": "مؤسسي", "All AI": "كل الذكاء الاصطناعي",
  "Framework posture": "وضع الأطر", "Policy & control health — owner & next review": "صحة السياسات والضوابط — المالك والمراجعة التالية",
  "In force · owner · effectiveness": "ساري · المالك · الفعالية",
  "Enterprise risk register": "سجل مخاطر المؤسسة", "Top exposures": "أعلى حالات التعرّض",
  // policy/control table cells
  "Acceptable-use policy": "سياسة الاستخدام المقبول", "CGO office · review overdue": "مكتب مسؤول الحوكمة · مراجعة متأخرة",
  "Human-oversight policy": "سياسة الإشراف البشري", "CAIO office": "مكتب مسؤول الذكاء الاصطناعي",
  "Model-validation control": "ضابط التحقق من النماذج", "Model Risk · D. Osei": "مخاطر النماذج · D. Osei",
  "Access-review control": "ضابط مراجعة الوصول", "CISO office": "مكتب مسؤول الأمن",
  "Vendor-risk control": "ضابط مخاطر الموردين", "Procurement · T. Brandt": "المشتريات · T. Brandt",
  "Adverse-decision harm": "ضرر القرار الضار", "AI/Credit": "الذكاء الاصطناعي/الائتمان",
  "Regulatory non-conformity": "عدم المطابقة التنظيمية", "Control failure": "فشل الضابط",
  // surface labels + subs
  "Governance Forum": "منتدى الحوكمة", "One converged data + AI governance forum.": "منتدى حوكمة موحّد للبيانات والذكاء الاصطناعي.",
  "Incident Playbook": "دليل الحوادث", "One response playbook across every incident class.": "دليل استجابة واحد عبر كل فئات الحوادث.",
  "Breach Notification": "الإخطار بالخرق", "The regulatory clock — assess, decide, notify every authority whose window runs.": "الساعة التنظيمية — قيّم، قرّر، أخطِر كل جهة يسري موعدها.",
  "Data Provenance": "مصدر البيانات",
  "One data-governance record per system — sources, lawful basis, IP, PII, integrity and a provenance hash.": "سجل حوكمة بيانات واحد لكل نظام — المصادر، والأساس القانوني، والملكية الفكرية، والبيانات الشخصية، والسلامة، وبصمة المصدر.",
  "Arabic Briefing (العربية)": "الإحاطة العربية (العربية)",
  "Pilot: an Arabic + RTL governance briefing — proving localisation before estate-wide rollout.": "تجربة: إحاطة حوكمة بالعربية ومن اليمين لليسار — لإثبات التوطين قبل الطرح على مستوى البيئة.",
  "Impact Assessments": "تقييمات الأثر", "One AIA / DPIA / FRIA per system, mapped to every regime that demands one.": "تقييم أثر ذكاء اصطناعي / حماية بيانات / حقوق أساسية واحد لكل نظام، مربوط بكل نظام يطلبه.",
  "Environmental Footprint": "البصمة البيئية",
  "Whole-life carbon per system + a GHG-Protocol-shaped disclosure (ISO/IEC TR 20226).": "كربون كامل العمر لكل نظام + إفصاح على شكل بروتوكول الغازات الدفيئة (ISO/IEC TR 20226).",
  "Convergence Crosswalk": "جدول تقاطع التقارب", "32 capabilities mapped across all four instruments.": "32 قدرة مربوطة عبر الأدوات الأربع كلها.",
  "Prohibited Practices": "الممارسات المحظورة", "The eight EU AI Act Art. 5 red lines, screened.": "الخطوط الحمراء الثمانية للمادة 5 من قانون الذكاء الأوروبي، مفحوصة.",
  "GPAI Exposure": "تعرّض الذكاء العام", "The accidental-provider test (Art. 53/55).": "اختبار المزوّد العَرَضي (المادة 53/55).",
  "Gap Closure": "إغلاق الفجوات", "The last crosswalk gaps, owned and evidenced.": "آخر فجوات جدول التقاطع، مملوكة ومُوثَّقة.",
  "Jurisdiction Atlas": "أطلس الولايات القضائية", "Which regimes bind the enterprise, and where.": "أيّ الأنظمة تُلزم المؤسسة، وأين.",
  "Template Library": "مكتبة القوالب",
  "Framework template packs — ISO 42001/27001, NIST, EU AI Act — generated pre-filled from your control set.": "حزم قوالب الأطر — ISO 42001/27001، وNIST، وقانون الذكاء الأوروبي — تُنشأ مملوءة مسبقاً من مجموعة ضوابطك.",
  "ISO 42001 Readiness": "جاهزية ISO 42001", "Statement of Applicability + certification readiness.": "بيان قابلية التطبيق + جاهزية الاعتماد.",
  "Evidence Freshness": "حداثة الأدلة", "Stale-flag every artifact past its review date.": "وسم كل أثر تجاوز موعد مراجعته بأنه قديم.",
  "Governance Glossary": "مسرد الحوكمة", "Every term of art, in plain language.": "كل مصطلح فنّي، بلغة واضحة.",
  "Drift Monitor": "مراقب الانحراف", "Automated behavioural-shift detection (PSI).": "كشف آلي للتحوّل السلوكي (مؤشّر استقرار السكان).",
  "Article 12 Log": "سجل المادة 12", "Tamper-evident per-inference record-keeping.": "حفظ سجلّات مقاوم للعبث لكل استدلال.",
  "Governance Playbook": "دليل الحوكمة", "The enterprise governance operating model.": "نموذج تشغيل حوكمة المؤسسة.",
  "Policies & Controls": "السياسات والضوابط", "Policy library health and control effectiveness.": "صحة مكتبة السياسات وفعالية الضوابط.",
  "Regulatory Posture": "الوضع التنظيمي", "Standing across every regulatory framework.": "الموقف عبر كل إطار تنظيمي.",
  "Board & Audit": "المجلس والتدقيق", "Board reporting cadence and open audit findings.": "إيقاع تقارير المجلس ونتائج التدقيق المفتوحة.",
  "Enterprise Risk": "مخاطر المؤسسة", "The enterprise AI risk heatmap.": "خريطة حرارة مخاطر الذكاء الاصطناعي للمؤسسة.",
  // CGO variant subs for shared enforcement surfaces
  "The enforcement plane that closes the loop — policy → enforcement → evidence.": "مستوى الإنفاذ الذي يُغلق الحلقة — السياسة ← الإنفاذ ← الدليل.",
  "AI supply-chain provenance — pinned, signed tool manifests.": "مصدر سلسلة توريد الذكاء الاصطناعي — بيانات أدوات مُثبَّتة ومُوقَّعة.",
  "Human-oversight thresholds — the Art.14 / 22 evidence a board reads.": "عتبات الإشراف البشري — دليل المادة 14 / 22 الذي يقرأه المجلس.",
  "Real-time capability revocation — the adaptive half of Art.14 oversight.": "إلغاء القدرة في الوقت الحقيقي — النصف المتكيّف من إشراف المادة 14.",
  // board kpis
  "Board-readiness": "جاهزية المجلس", "Q3 pack": "حزمة الربع الثالث", "Open findings": "نتائج مفتوحة",
  "2 high": "2 عالية", "Next board": "المجلس القادم", "pack due": "الحزمة مستحقة",
  "Assurance coverage": "تغطية الضمان", "controls tested": "ضوابط مُختبَرة",
  // report dims (board pack)
  "Governance maturity": "نضج الحوكمة", "Regulatory posture": "الوضع التنظيمي",
  "Policies & controls": "السياسات والضوابط", "Audit findings": "نتائج التدقيق", "By framework": "حسب الإطار",
});

/* CGO — text-surface eyebrows, headings and body narratives. */
registerContent({
  // eyebrows
  "Convergence": "التقارب", "Notify": "الإخطار", "Govern the data": "احكم البيانات",
  "Localisation · pilot": "التوطين · تجربة", "Assess once": "قيّم مرة واحدة", "Measure": "قِس",
  "Scope · stop": "النطاق · توقّف", "The edges": "الحواف", "Convergence complete": "اكتمل التقارب",
  "Scope": "النطاق", "Reference": "مرجع", "Operate": "التشغيل", "Operating model": "نموذج التشغيل",
  "Assurance": "الضمان",
  // headings
  "Unified governance forum": "منتدى حوكمة موحّد", "Converged incident response": "استجابة حوادث موحّدة",
  "One breach, every clock": "خرق واحد، كل الساعات", "A model is only as governed as its data": "النموذج لا يُحكَم إلا بقدر حوكمة بياناته",
  "Arabic + right-to-left": "العربية ومن اليمين لليسار", "One assessment, seven regimes": "تقييم واحد، سبعة أنظمة",
  "Whole-life carbon, assessed and disclosed": "كربون كامل العمر، مُقيَّم ومُفصَح عنه",
  "One control set, not four": "مجموعة ضوابط واحدة، لا أربع", "Where the answer is stop, not control": "حيث يكون الجواب توقّف، لا تحكّم",
  "Did you become a provider by accident?": "هل أصبحت مزوّداً عَرَضاً؟", "From gap to owned control": "من فجوة إلى ضابط مملوك",
  "Many regimes, one control set": "أنظمة كثيرة، مجموعة ضوابط واحدة", "Governance templates, ready to fill": "قوالب حوكمة، جاهزة للملء",
  "The SoA an auditor reads first": "بيان قابلية التطبيق الذي يقرأه المدقّق أولاً", "Fresh evidence, not last year's": "أدلة حديثة، لا أدلة العام الماضي",
  "So the platform stands alone": "كي تقف المنصة وحدها", "Detect drift before it degrades decisions": "اكتشِف الانحراف قبل أن يُدهور القرارات",
  "An agent can't escalate through a chain": "لا يمكن لوكيل التصعيد عبر سلسلة", "The record a regulator reads": "السجل الذي يقرأه المنظّم",
  "How the enterprise is governed": "كيف تُحكَم المؤسسة", "Governance you can prove was enforced": "حوكمة يمكنك إثبات إنفاذها",
  "How much of the estate is really on the plane": "كم من البيئة على المستوى فعلاً", "The audit artifact nobody else owns": "أثر التدقيق الذي لا يملكه سواك",
  "Provenance over the tool supply chain": "المصدر عبر سلسلة توريد الأدوات", "Human oversight, proven": "إشراف بشري، مُثبَت",
  "Oversight that acts mid-session": "إشراف يتصرّف أثناء الجلسة",
  // bodies
  "One senior forum owning policy, risk tiering, exceptions and escalation across data + AI.": "منتدى واحد رفيع يملك السياسة وتصنيف المخاطر والاستثناءات والتصعيد عبر البيانات والذكاء الاصطناعي.",
  "One playbook spanning breaches, model failures, harmful outputs and regulatory notifications.": "دليل واحد يشمل الخروقات وأعطال النماذج والمخرجات الضارة والإخطارات التنظيمية.",
  "A confirmed personal-data breach or serious AI incident can run the GDPR 72-hour clock, India's DPDP and CERT-In 6-hour clocks and the EU AI Act serious-incident clock at once. The workflow assesses once, notifies against the tightest, and files one evidence pack.": "خرق بيانات شخصية مؤكّد أو حادثة ذكاء اصطناعي خطيرة قد يُشغّل ساعة الـ72 لـ GDPR، وساعتَي الـ6 لـ DPDP الهندي وCERT-In، وساعة الحوادث الخطيرة لقانون الذكاء الأوروبي دفعةً واحدة. يُقيّم المسار مرة واحدة، ويُخطِر وفق الأضيق، ويودِع حزمة أدلة واحدة.",
  "Each AI system carries a data-governance record across eight dimensions — source lineage, lawful basis, IP clearance, PII classification, quality, integrity, retention and a hashed provenance record — the one artifact that answers EU AI Act Art. 10, ISO 42001 A.7, the NIST data-poisoning defence, OWASP LLM03 and China's IP-clean-data duty at once.": "يحمل كل نظام ذكاء اصطناعي سجل حوكمة بيانات عبر ثمانية أبعاد — نسب المصدر، والأساس القانوني، وتخليص الملكية الفكرية، وتصنيف البيانات الشخصية، والجودة، والسلامة، والاحتفاظ، وسجل مصدر مبصوم — الأثر الواحد الذي يُجيب المادة 10 من قانون الذكاء الأوروبي، وISO 42001 A.7، ودفاع NIST ضد تسميم البيانات، وOWASP LLM03، وواجب الصين ببيانات نظيفة الملكية دفعةً واحدة.",
  "A governance briefing that renders fully in Arabic with right-to-left layout via an on-surface language toggle — the pilot that proves the i18n pattern for the UAE customers before the rest of the platform is translated.": "إحاطة حوكمة تُعرَض بالكامل بالعربية بتخطيط من اليمين لليسار عبر مبدّل لغة على السطح — التجربة التي تُثبت نمط التوطين لعملاء الإمارات قبل ترجمة بقية المنصة.",
  "A fundamental-rights assessment, a DPIA and an algorithmic impact assessment are the same nine questions asked by four regulators. Run them once per system and the EU AI Act Art. 27/9, GDPR Art. 35, ISO 42001, NIST RMF, Brazil and Korea impact-assessment obligations close together.": "تقييم الحقوق الأساسية وتقييم أثر حماية البيانات وتقييم الأثر الخوارزمي هي الأسئلة التسعة نفسها التي يطرحها أربعة منظّمين. أجرِها مرة واحدة لكل نظام فتُغلَق معاً التزامات المادة 27/9 من قانون الذكاء الأوروبي، والمادة 35 من GDPR، وISO 42001، وNIST RMF، والبرازيل، وكوريا.",
  "Inference is only the running cost. Each system carries a full-lifecycle impact assessment — training, inference, storage and retirement — and the estate rolls up into a carbon disclosure aligned to the GHG Protocol, ISO 14064-1 and CSRD ESRS E1, with an honest assurance level.": "الاستدلال ليس إلا تكلفة التشغيل. يحمل كل نظام تقييم أثر لكامل دورة الحياة — التدريب والاستدلال والتخزين والإحالة — وتتجمّع البيئة في إفصاح كربون متوائم مع بروتوكول الغازات الدفيئة وISO 14064-1 وCSRD ESRS E1، بمستوى ضمان صادق.",
  "Each capability is one control, evidenced by one artifact, satisfying the EU AI Act, NIST AI RMF, ISO/IEC 42001 and Singapore's Model AI Governance Framework at once.": "كل قدرة ضابط واحد، يُوثَّق بأثر واحد، يُلبّي قانون الذكاء الأوروبي، وNIST AI RMF، وISO/IEC 42001، وإطار سنغافورة النموذجي لحوكمة الذكاء الاصطناعي دفعةً واحدة.",
  "Every system is screened against the eight prohibited practices before any risk tiering — including emotion recognition at work, the red line that catches ordinary enterprises.": "يُفحَص كل نظام مقابل الممارسات المحظورة الثمانية قبل أي تصنيف مخاطر — بما فيها التعرّف على المشاعر في العمل، الخط الأحمر الذي يُوقِع المؤسسات العادية.",
  "Modify a general-purpose model and share it beyond the team that modified it, and you may hold provider obligations under Articles 53 and 55 — with no procurement or board decision ever taken.": "عدّل نموذجاً عام الغرض وشاركه خارج الفريق الذي عدّله، وقد تتحمّل التزامات المزوّد بموجب المادتين 53 و55 — دون أي قرار شراء أو مجلس على الإطلاق.",
  "The five capabilities the crosswalk last flagged as gaps are now owned closures — two operational, three in-flight pending a live finding. No unowned gaps remain across the 32 capabilities.": "القدرات الخمس التي وسمها جدول التقاطع مؤخراً كفجوات صارت الآن إغلاقات مملوكة — اثنتان تشغيليتان، وثلاث قيد التنفيذ بانتظار نتيجة حيّة. لم تبقَ فجوات غير مملوكة عبر القدرات الـ32.",
  "Each regime self-flags Applies / Monitor / Out of scope from where the estate operates, with effective dates and penalty exposure — and maps to the shared 32-capability crosswalk.": "يَسِم كل نظام نفسه بـ ينطبق / مراقبة / خارج النطاق انطلاقاً من حيث تعمل البيئة، مع تواريخ السريان والتعرّض للعقوبات — ويرتبط بجدول التقاطع المشترك ذي الـ32 قدرة.",
  "A repository of framework template packs. Each ships policy, Statement of Applicability, control checklist, impact assessment and RACI templates that generate pre-filled from your live control set and mint evidence on generation — never a blank document.": "مستودع لحزم قوالب الأطر. تشحن كل حزمة سياسة، وبيان قابلية تطبيق، وقائمة فحص ضوابط، وتقييم أثر، وقوالب RACI تُنشأ مملوءة مسبقاً من مجموعة ضوابطك الحيّة وتسكّ دليلاً عند الإنشاء — لا وثيقة فارغة أبداً.",
  "Every Annex A control — applicable, justified, evidenced — plus certification readiness by management-system clause, built around what an auditor actually asks for.": "كل ضابط في الملحق أ — قابل للتطبيق، مُبرَّر، مُوثَّق — إضافةً إلى جاهزية الاعتماد حسب بند نظام الإدارة، مبنيّ حول ما يطلبه المدقّق فعلاً.",
  "Every evidence artifact carries a review cadence; anything past its review date is flagged Stale so it surfaces without being hunted for.": "يحمل كل أثر دليل إيقاع مراجعة؛ وأيّ شيء تجاوز موعد مراجعته يُوسَم بأنه قديم كي يظهر دون البحث عنه.",
  "Every acronym and concept an executive, auditor or engineer will hit on a governance surface — searchable, categorised, in plain language.": "كل اختصار ومفهوم سيصادفه تنفيذي أو مدقّق أو مهندس على سطح حوكمة — قابل للبحث، مُصنَّف، بلغة واضحة.",
  "A Population Stability Index is computed per production model from baseline vs current distributions — the standard drift signal, mapped to EU AI Act Art.72 post-market monitoring.": "يُحسَب مؤشّر استقرار السكان لكل نموذج إنتاج من التوزيعات الأساسية مقابل الحالية — إشارة الانحراف المعيارية، مربوطة بمراقبة ما بعد السوق في المادة 72 من قانون الذكاء الأوروبي.",
  "Least privilege holds at three altitudes (deny-by-default throughout): every step is re-checked against the agent's own capabilities; a sub-agent runs with min(orchestrator mandate, sub-agent grant) so a delegation can't widen data reach; and taint analysis across the whole chain catches emergent exfiltration paths that individually-allowed steps compose into.": "أقل صلاحية يصمد على ثلاثة مستويات (المنع افتراضي في كل مكان): كل خطوة يُعاد فحصها مقابل قدرات الوكيل نفسه؛ ويعمل الوكيل الفرعي بأدنى (تفويض المنسّق، منح الوكيل الفرعي) فلا يوسّع التفويض مدى البيانات؛ ويلتقط تحليل التلوّث عبر السلسلة كلها مسارات تسريب ناشئة تتركّب منها خطوات مسموحة فرادى.",
  "Every gateway inference appends a structured, hash-chained event (SHA-256) — model, agent, tool, decision, data class, tokens — the automatic logging EU AI Act Art.12 requires.": "كل استدلال عبر البوابة يُلحِق حدثاً مُهيكَلاً مُسلسَلاً بالبصمة (SHA-256) — النموذج، والوكيل، والأداة، والقرار، وفئة البيانات، والرموز — التسجيل الآلي الذي تتطلّبه المادة 12 من قانون الذكاء الأوروبي.",
  "A monthly governance council, quarterly board oversight, a living policy library and a tested control set — every AI system inherits this frame.": "مجلس حوكمة شهري، وإشراف مجلس ربعي، ومكتبة سياسات حيّة، ومجموعة ضوابط مُختبَرة — يرث كل نظام ذكاء اصطناعي هذا الإطار.",
  "Enforce decides every agent tool call at runtime (deny-by-default, capability tokens, egress, HITL) and signs each decision into the same evidence chain the board reads — enforcement without governance is a firewall nobody can explain; this is both.": "يقرّر Enforce كل استدعاء أداة من وكيل وقت التشغيل (المنع افتراضي، ورموز القدرة، والخروج، والإنسان في الحلقة) ويوقّع كل قرار في سلسلة الأدلة نفسها التي يقرأها المجلس — الإنفاذ دون حوكمة جدارُ حماية لا يستطيع أحد تفسيره؛ وهذا كلاهما.",
  "Control reaches only the traffic routed through the plane. This splits the estate into enforced, observed and shadow and computes real coverage — the honest headline for a governance-only customer, not a claim of total control.": "تصل السيطرة فقط إلى الحركة المُوجَّهة عبر المستوى. هذا يقسّم البيئة إلى مُنفَّذ ومُراقَب وظِلّي ويحسب التغطية الحقيقية — العنوان الصادق لعميل الحوكمة فقط، لا ادّعاء بسيطرة كاملة.",
  "Every agent tool call is a signed, hash-chained row — authorised grant beside actual call — the record EU AI Act Art.12 and ISO 42001 push toward, that neither guardrail nor GRC vendors hold.": "كل استدعاء أداة من وكيل صفٌّ مُوقَّع مُسلسَل بالبصمة — المنح المُصرَّح به بجوار الاستدعاء الفعلي — السجل الذي يدفع نحوه المادة 12 وISO 42001، ولا يملكه مزوّدو الحواجز ولا مزوّدو الحوكمة والمخاطر والامتثال.",
  "Every MCP server the estate depends on is signed by a trusted publisher and pinned by manifest hash; a rug-pulled server whose manifest drifts after approval is quarantined — the LLM03 supply-chain control an auditor asks for.": "كل خادم MCP تعتمد عليه البيئة مُوقَّع من ناشر موثوق ومُثبَّت ببصمة بياناته؛ وأيّ خادم مخادِع تنحرف بياناته بعد الاعتماد يُعزَل — ضابط سلسلة التوريد LLM03 الذي يطلبه المدقّق.",
  "Every high-impact AI action is gated behind a named approver with an SLA, thresholds keeping oversight meaningful rather than rubber-stamped — the EU AI Act Art.14 / Art.22 evidence a regulator and board ask for, with each decision logged.": "كل إجراء ذكاء اصطناعي عالي الأثر محجوب خلف مُعتمِد مُسمّى باتفاقية خدمة، وعتبات تُبقي الإشراف ذا معنى لا مجرّد ختم — دليل المادة 14 / المادة 22 الذي يطلبه المنظّم والمجلس، مع تسجيل كل قرار.",
  "Beyond fixed gates, the breaker watches each agent's live risk signal and revokes capability the moment it crosses a threshold — downscope, suspend to a human, or halt and revoke every token — before the agent reaches a gate. Instant because tokens are short-lived, and every trip is written to the Art.12 chain with the accountable owner.": "أبعد من البوابات الثابتة، يراقب القاطع إشارة الخطر الحيّة لكل وكيل ويُلغي القدرة لحظة تجاوزها العتبة — تضييق، أو تعليق إلى إنسان، أو إيقاف وإلغاء كل رمز — قبل أن يبلغ الوكيل بوابة. فوري لأن الرموز قصيرة العمر، وكل تعثّر يُكتب في سلسلة المادة 12 مع المالك المُساءَل.",
});

/* CRO — risk panels, surfaces, KRIs, report dims. */
registerContent({
  "Enterprise AI risk register": "سجل مخاطر الذكاء الاصطناعي المؤسسية", "Highest residual exposure first": "الأعلى تعرّضاً متبقياً أولاً",
  "Control effectiveness by domain": "فعالية الضوابط حسب المجال", "Where controls hold vs slip": "أين تصمد الضوابط مقابل أين تنزلق",
  "AI risk register": "سجل مخاطر الذكاء الاصطناعي", "Residual grade · owner · treatment": "الدرجة المتبقية · المالك · المعالجة",
  "Key risk indicators": "مؤشّرات المخاطر الرئيسية", "Threshold vs actual": "العتبة مقابل الفعلي",
  "Audit readiness by framework": "جاهزية التدقيق حسب الإطار", "Evidence completeness": "اكتمال الأدلة",
  // risk rows + domains
  "Automated adverse decision": "قرار ضار آلي", "Model drift → mis-route": "انحراف النموذج ← توجيه خاطئ",
  "Vendor concentration": "تركّز الموردين", "Model drift": "انحراف النموذج", "Portfolio": "المحفظة",
  "Security controls": "ضوابط الأمن", "Privacy controls": "ضوابط الخصوصية", "Model controls": "ضوابط النماذج",
  "Operational controls": "الضوابط التشغيلية", "Vendor controls": "ضوابط الموردين",
  "Incident rate": "معدّل الحوادث", "Overdue treatments": "معالجات متأخرة",
  // surface labels + subs
  "Risk Appetite": "الحد المقبول للمخاطر", "Enterprise AI risk appetite and where exposure sits against it.": "الحد المقبول لمخاطر الذكاء الاصطناعي المؤسسية وأين يقع التعرّض مقابله.",
  "Risk Register": "سجل المخاطر", "Every AI risk, its residual grade and treatment status.": "كل خطر ذكاء اصطناعي ودرجته المتبقية وحالة معالجته.",
  "Controls & KRIs": "الضوابط ومؤشّرات المخاطر", "Control effectiveness and key risk indicators.": "فعالية الضوابط ومؤشّرات المخاطر الرئيسية.",
  "Audit Readiness": "جاهزية التدقيق", "Findings, evidence and regulator readiness.": "النتائج والأدلة والجاهزية للمنظّم.",
  // text body
  "Risk appetite": "الحد المقبول للمخاطر", "AI risk appetite statement": "بيان الحد المقبول لمخاطر الذكاء الاصطناعي",
  "Moderate appetite for productivity and growth AI; low appetite for automated decisions affecting customers without human oversight; near-zero appetite for privacy or safety breaches.": "حد مقبول متوسط للذكاء الاصطناعي المعزّز للإنتاجية والنمو؛ وحد منخفض للقرارات الآلية المؤثّرة في العملاء دون إشراف بشري؛ وحد شبه معدوم لخروقات الخصوصية أو السلامة.",
  // surface kpis
  "Exposure vs appetite": "التعرّض مقابل الحد المقبول", "Within": "ضمن", "amber band": "النطاق المتوسط",
  "Appetite breaches": "تجاوزات الحد المقبول", "quarter to date": "منذ بداية الربع",
  "High-risk systems": "أنظمة عالية الخطورة", "Art.22 scope": "نطاق المادة 22",
  "Board escalations": "تصعيدات المجلس", "of production": "من الإنتاج",
  // report dims
  "By residual grade": "حسب الدرجة المتبقية", "Control effectiveness": "فعالية الضوابط",
  "KRIs": "مؤشّرات المخاطر", "Treatments": "المعالجات",
});

/* Legal — obligation panels, surfaces, contracts, report dims. */
registerContent({
  "Regulatory obligations": "الالتزامات التنظيمية", "By framework and status": "حسب الإطار والحالة",
  "Legal defensibility by system": "القابلية للدفاع القانوني حسب النظام", "Evidence and conformity strength": "قوة الأدلة والمطابقة",
  "Obligation tracker": "متتبّع الالتزامات", "Framework · status": "الإطار · الحالة",
  "AI vendor contracts": "عقود موردي الذكاء الاصطناعي", "Liability · IP · status": "المسؤولية · الملكية الفكرية · الحالة",
  "Conformity by system": "المطابقة حسب النظام", "Assessment completeness": "اكتمال التقييم",
  "Evidence by obligation": "الأدلة حسب الالتزام", "Completeness": "الاكتمال",
  // obligation rows
  "High-risk classification": "تصنيف عالي الخطورة", "Transparency notices": "إشعارات الشفافية",
  "Lawful basis & consent": "الأساس القانوني والموافقة", "Automated-decision safeguards": "ضمانات القرارات الآلية",
  "Art.43 conformity": "مطابقة المادة 43", "Art.22 safeguards": "ضمانات المادة 22", "Privacy": "الخصوصية",
  "Internal models": "نماذج داخلية",
  // surface labels + subs
  "Regulatory Map": "الخريطة التنظيمية", "Every applicable regulation and where obligations are met.": "كل لائحة منطبقة وأين تُستوفى الالتزامات.",
  "Contracts & IP": "العقود والملكية الفكرية", "AI vendor contracts, liability terms and IP provenance.": "عقود موردي الذكاء الاصطناعي وبنود المسؤولية ومصدر الملكية الفكرية.",
  "Conformity": "المطابقة", "Conformity assessments and legal sign-offs before scale.": "تقييمات المطابقة والاعتمادات القانونية قبل التوسّع.",
  "Legal Evidence": "الأدلة القانونية", "Defensible evidence and audit-ready records.": "أدلة قابلة للدفاع وسجلّات جاهزة للتدقيق.",
  // text bodies
  "Applicable AI regulation": "لوائح الذكاء الاصطناعي المنطبقة",
  "EU AI Act (high-risk obligations), GDPR (lawful basis, Art.22 safeguards), sectoral rules for credit and employment, and contractual duties with AI vendors — tracked with evidence per obligation.": "قانون الذكاء الأوروبي (التزامات عالية الخطورة)، وGDPR (الأساس القانوني وضمانات المادة 22)، والقواعد القطاعية للائتمان والتوظيف، والواجبات التعاقدية مع موردي الذكاء الاصطناعي — مُتابَعة بأدلة لكل التزام.",
  "One control set": "مجموعة ضوابط واحدة", "One artifact per obligation, four instruments": "أثر واحد لكل التزام، أربع أدوات",
  "Each capability maps to the exact clause it satisfies in the EU AI Act, NIST AI RMF, ISO/IEC 42001 and Singapore's Model AI Governance Framework — so counsel can trace any legal obligation to the single evidence artifact that closes it.": "ترتبط كل قدرة بالبند الدقيق الذي تُلبّيه في قانون الذكاء الأوروبي، وNIST AI RMF، وISO/IEC 42001، وإطار سنغافورة النموذجي لحوكمة الذكاء الاصطناعي — فيتتبّع المستشار أيّ التزام قانوني إلى أثر الدليل الواحد الذي يُغلقه.",
  "Which regimes bind us, and where": "أيّ الأنظمة تُلزمنا، وأين",
  "The multi-regime obligation map — Applies / Monitor / Out of scope from where the estate operates, with effective dates and penalty exposure counsel needs.": "خريطة الالتزامات متعدّدة الأنظمة — ينطبق / مراقبة / خارج النطاق انطلاقاً من حيث تعمل البيئة، مع تواريخ السريان والتعرّض للعقوبات التي يحتاجها المستشار.",
  "Every gateway inference appends a structured, hash-chained event (SHA-256) — the automatic per-inference logging EU AI Act Art.12 requires, exportable for the audit file.": "كل استدلال عبر البوابة يُلحِق حدثاً مُهيكَلاً مُسلسَلاً بالبصمة (SHA-256) — التسجيل الآلي لكل استدلال الذي تتطلّبه المادة 12 من قانون الذكاء الأوروبي، قابلاً للتصدير لملف التدقيق.",
  // surface kpis
  "Conformity done": "المطابقة المُنجزة", "Open assessments": "تقييمات مفتوحة", "Sign-offs pending": "اعتمادات معلّقة",
  "before scale": "قبل التوسّع", "Defensibility": "القابلية للدفاع", "avg": "متوسط",
});

/* Employee — panels, surfaces, hub/projects/risk tables, reports, help, text.
   A priority surface, so translated in full (proper nouns and figures aside). */
registerContent({
  // overview panels
  "Recent AI sessions": "جلسات الذكاء الاصطناعي الأخيرة", "Your last governed sessions": "آخر جلساتك المُحوكَمة",
  "Where you use AI": "أين تستخدم الذكاء الاصطناعي", "By activity this month": "حسب النشاط هذا الشهر",
  "Draft release notes": "صياغة ملاحظات الإصدار", "Summarise incident": "تلخيص حادثة",
  "Customer email draft": "مسودة بريد العميل", "Code review helper": "مساعد مراجعة الشيفرة",
  "Drafting & writing": "الصياغة والكتابة", "Code assist": "مساعدة الشيفرة",
  "Summarisation": "التلخيص", "Knowledge search": "البحث المعرفي",
  // surface subs
  "Ask anything — routed through the AI Gateway with policy, redaction and evidence.": "اسأل أي شيء — مُوجَّه عبر بوابة الذكاء الاصطناعي بالسياسة والتنقيح والأدلة.",
  "The AI you're approved to use — your governed marketplace.": "الذكاء الاصطناعي المصرّح لك باستخدامه — سوقك المُحوكَم.",
  "The enterprise AI initiatives you contribute to — and where you can propose a new one.": "مبادرات الذكاء الاصطناعي المؤسسية التي تُسهم فيها — وأين يمكنك اقتراح مبادرة جديدة.",
  "AI-assigned and governance work on your plate — each with why it matters, who raised it and what's next.": "عمل مُسنَد بالذكاء الاصطناعي وعمل حوكمة على عاتقك — لكلٍّ سبب أهميته ومن أثاره وما التالي.",
  "Where you stand — measured against your peers, your business unit and the whole org.": "أين تقف — مقيساً مقابل أقرانك ووحدة عملك والمؤسسة كلها.",
  "Your governance standing in one place — guardrail events, and your policies, training and actions.": "موقفك في الحوكمة في مكان واحد — أحداث الحواجز، وسياساتك وتدريبك وإجراءاتك.",
  "Your learning hub — courses, certifications and the training your role and activity require.": "مركز تعلّمك — الدورات والشهادات والتدريب الذي يتطلّبه دورك ونشاطك.",
  "Track the governance requests you've submitted — and where each one stands.": "تابِع طلبات الحوكمة التي قدّمتها — وأين يقف كلٌّ منها.",
  "Build an evidence-grade report on your AI activity, then export it as PDF or Excel.": "أنشئ تقريراً بدرجة دليل عن نشاطك في الذكاء الاصطناعي، ثم صدّره PDF أو Excel.",
  "Guidance, safe-use answers and how to escalate.": "إرشاد وأجوبة الاستخدام الآمن وكيفية التصعيد.",
  "My Reports": "تقاريري", "Help": "المساعدة",
  // text bodies
  "My AI Assistant": "مساعد الذكاء الاصطناعي", "One assistant, every approved model": "مساعد واحد، كل نموذج معتمد",
  "You don't pick the model — the Gateway routes your request to the right approved AI (Copilot, Claude, ChatGPT Enterprise, Gemini or an internal model), applies policy, redacts sensitive data and stores evidence. Ask, and it governs the rest.": "أنت لا تختار النموذج — تُوجّه البوابة طلبك إلى الذكاء الاصطناعي المعتمد المناسب (Copilot أو Claude أو ChatGPT Enterprise أو Gemini أو نموذج داخلي)، وتطبّق السياسة، وتُنقّح البيانات الحسّاسة، وتخزّن الأدلة. اسأل، وهي تحكم الباقي.",
  "Your standing, not a score in a vacuum": "موقفك، لا درجة في فراغ",
  "See where you stand on the things that matter — hours saved, active use, knowledge reuse and safe use — benchmarked against people who do your job, your business unit and the org, with the one move that would lift you.": "شاهِد أين تقف في الأمور المهمّة — الساعات المُوفَّرة، والاستخدام النشط، وإعادة استخدام المعرفة، والاستخدام الآمن — مقيساً مقابل من يؤدّون عملك ووحدة عملك والمؤسسة، مع الخطوة الواحدة التي سترفعك.",
  "Governance Academy": "أكاديمية الحوكمة", "Learn to use AI safely and well": "تعلّم استخدام الذكاء الاصطناعي بأمان وإتقان",
  "Your learning path adapts to how you actually work — prompt engineering, responsible AI, secure use and role-specific skills. Completing it keeps your tool access active and becomes governance evidence automatically.": "يتكيّف مسار تعلّمك مع طريقة عملك الفعلية — هندسة المطالبات، والذكاء الاصطناعي المسؤول، والاستخدام الآمن، والمهارات الخاصة بدورك. إكماله يُبقي وصولك للأدوات فعّالاً ويصبح دليل حوكمة تلقائياً.",
  "Getting help": "الحصول على المساعدة",
  "Quick answers on safe AI use, why something was blocked, and how to request access or an exception. If you're stuck, escalate to your manager or the AI Governance Office from any blocked event.": "أجوبة سريعة عن الاستخدام الآمن للذكاء الاصطناعي، ولماذا حُجب شيء، وكيفية طلب الوصول أو استثناء. إن تعثّرت، صعّد إلى مديرك أو مكتب حوكمة الذكاء الاصطناعي من أي حدث محجوب.",
  // hub kpis + table
  "Approved for you": "معتمدة لك", "tools": "أدوات", "need approval": "تحتاج موافقة", "not permitted": "غير مسموح",
  "Requests open": "طلبات مفتوحة", "pending": "معلّقة",
  "Approved AI catalogue — click a tool for its policy & how to get access": "كتالوج الذكاء الاصطناعي المعتمد — انقر أداة لسياستها وكيفية الوصول",
  "Status · data class · risk · owner": "الحالة · فئة البيانات · الخطورة · المالك",
  "Internal": "داخلي", "Confidential": "سرّي",
  // projects
  "Start something new": "ابدأ شيئاً جديداً", "Propose a new AI initiative": "اقترح مبادرة ذكاء اصطناعي جديدة",
  "Have an idea for an AI initiative? Submit it here. New initiatives need your manager's approval before they become active and governed — so it goes to their queue first.": "لديك فكرة لمبادرة ذكاء اصطناعي؟ قدّمها هنا. تحتاج المبادرات الجديدة موافقة مديرك قبل أن تصبح نشطة ومُحوكَمة — فتذهب إلى قائمته أولاً.",
  "Assigned": "مُسنَدة", "Evidence submitted": "أدلة مُقدَّمة", "prompt pack, model tests, DPIA inputs": "حزمة مطالبات، اختبارات نماذج، مدخلات تقييم أثر",
  "Open risks": "مخاطر مفتوحة", "AI contribution": "مساهمة الذكاء الاصطناعي",
  "Your initiatives": "مبادراتك", "Progress · your deliverable · evidence · open risk on your work": "التقدّم · مُخرَجك · الأدلة · الخطر المفتوح على عملك",
  "Prompt pack (12 governed prompts)": "حزمة مطالبات (12 مطالبة مُحوكَمة)", "Model test report": "تقرير اختبار النموذج",
  "1 · PII redaction": "1 · تنقيح بيانات شخصية",
  // risk & compliance
  "Blocks": "حجوبات", "unsafe prompts stopped": "مطالبات غير آمنة أُوقِفت", "Warnings": "تحذيرات", "you resolved": "عالجتها",
  "Your risk score": "درجة خطرك",
  "Guardrail events — explained": "أحداث الحواجز — مشروحة", "Risk · where it happened · why & remediation": "الخطر · أين حدث · السبب والمعالجة",
  "Customer data in prompt": "بيانات عميل في المطالبة", "PII present — remove personal data before retrying (POL-DH-002)": "بيانات شخصية موجودة — أزِل البيانات الشخصية قبل إعادة المحاولة (POL-DH-002)",
  "Source code shared": "شيفرة مصدرية مُشارَكة", "Repository is Confidential — keep it in-tenant": "المستودع سرّي — أبقِه داخل المستأجر",
  "Financial forecast": "توقّع مالي", "Manager approval needed before sharing": "يلزم موافقة المدير قبل المشاركة",
  "Malicious instruction — session terminated, escalated to CISO": "تعليمات خبيثة — أُنهيت الجلسة، صُعِّدت لمسؤول الأمن",
  // guardrail-event "where · when" cells (tool + date)
  "Resolution Copilot · Aug 1": "Resolution Copilot · 1 أغسطس", "Code review helper · Jul 30": "مساعد مراجعة الشيفرة · 30 يوليو",
  "Sales proposal · Jul 29": "عرض مبيعات · 29 يوليو", "Support chat · Jul 28": "دردشة الدعم · 28 يوليو",
  "Policies acknowledged": "سياسات مُقَرّة", "Data Handling v4 outstanding": "معالجة البيانات v4 معلّقة",
  "on track": "على المسار", "Open actions": "إجراءات مفتوحة", "acknowledge Data Handling v4": "أقِرّ معالجة البيانات v4",
  "Violations": "مخالفات", "90 days": "90 يوماً",
  "Compliance record — what you owe & who set it": "سجل الامتثال — ما عليك ومن حدّده", "Policy / item · who initiated it · status": "السياسة / البند · من بدأه · الحالة",
  "Responsible AI Policy v6": "سياسة الذكاء الاصطناعي المسؤول v6", "CAIO office · org-wide": "مكتب مسؤول الذكاء الاصطناعي · على مستوى المؤسسة",
  "Data Handling v4": "معالجة البيانات v4", "CDPO office · org-wide": "مكتب مسؤول حماية البيانات · على مستوى المؤسسة",
  "Secure AI Use training": "تدريب الاستخدام الآمن للذكاء الاصطناعي", "Mgr · Riley Chen · you": "المدير · Riley Chen · أنت",
  "GDPR basics": "أساسيات GDPR", "Legal · org-wide": "القانون · على مستوى المؤسسة",
  "Due now": "مستحق الآن", "Due Fri": "مستحق الجمعة",
  // reports
  "My AI report": "تقريري عن الذكاء الاصطناعي", "AI usage": "استخدام الذكاء الاصطناعي", "Hours saved & impact": "الساعات المُوفَّرة والأثر",
  "Tasks & requests": "المهام والطلبات", "Risk & compliance": "المخاطر والامتثال", "Training completed": "التدريب المكتمل", "By activity": "حسب النشاط",
  "Responsible AI Foundations": "أساسيات الذكاء الاصطناعي المسؤول", "Data Handling Level 2": "معالجة البيانات المستوى 2", "Secure Prompting Basics": "أساسيات المطالبة الآمنة",
  "Completed Jun 2026": "أُكمِل يونيو 2026", "Completed Feb 2026": "أُكمِل فبراير 2026", "Completed May 2026": "أُكمِل مايو 2026",
  // help library
  "Why was my prompt blocked?": "لماذا حُجبت مطالبتي؟", "Understand guardrail decisions and how to retry safely.": "افهم قرارات الحواجز وكيفية إعادة المحاولة بأمان.",
  "Guide": "دليل", "Request tool access": "اطلب الوصول لأداة", "How to request a restricted AI tool.": "كيفية طلب أداة ذكاء اصطناعي مقيّدة.",
  "Report an issue": "أبلِغ عن مشكلة", "Flag an incorrect AI output or a guardrail problem.": "أبلِغ عن مخرَج ذكاء اصطناعي خاطئ أو مشكلة حاجز.",
  "Contact governance": "تواصل مع الحوكمة", "Reach the AI Governance Office.": "تواصل مع مكتب حوكمة الذكاء الاصطناعي.",
});

/* Employee — task & request action items (titles, descriptions, meta strips). */
registerContent({
  "Your tasks": "مهامك", "3 tasks · 2 due today": "3 مهام · 2 مستحقة اليوم",
  "Your requests": "طلباتك", "Requests you've submitted": "الطلبات التي قدّمتها",
  // task 1
  "Validate AI output — release notes": "تحقّق من مخرَج الذكاء الاصطناعي — ملاحظات الإصدار",
  "Confirm the AI-drafted release notes are accurate before publish.": "أكّد دقة ملاحظات الإصدار المصاغة بالذكاء الاصطناعي قبل النشر.",
  "AI Gateway — auto-raised when AI drafted a customer-bound artifact": "بوابة الذكاء الاصطناعي — أُثيرت تلقائياً عندما صاغ الذكاء الاصطناعي أثراً موجّهاً للعميل",
  "Human oversight is mandatory before AI content ships externally (POL-DH-002, Art.14 human-in-the-loop). Publishing unverified is a reportable control gap.": "الإشراف البشري إلزامي قبل إرسال محتوى الذكاء الاصطناعي خارجياً (POL-DH-002، المادة 14 الإنسان في الحلقة). نشر غير مُتحقَّق فجوة ضابط يجب الإبلاغ عنها.",
  "Mark validated → notes publish and evidence is minted. Flag issue → routes to your manager, Riley Chen.": "حدّد كمُتحقَّق ← تُنشَر الملاحظات ويُسكّ الدليل. أبلِغ عن مشكلة ← يُوجَّه إلى مديرك، Riley Chen.",
  "Initiative: Q3 Release Notes · Policy POL-DH-002": "المبادرة: ملاحظات إصدار الربع الثالث · السياسة POL-DH-002",
  // task 2
  "Acknowledge policy — Data Handling v4": "أقِرّ السياسة — معالجة البيانات v4",
  "Updated redaction rules apply to your workspace.": "قواعد تنقيح محدّثة تنطبق على مساحة عملك.",
  "CDPO office (Niamh Lynch) — policy update pushed to all Confidential-data users": "مكتب مسؤول حماية البيانات (Niamh Lynch) — تحديث سياسة دُفِع لكل مستخدمي البيانات السرّية",
  "Redaction rules changed; until you acknowledge, your access to Confidential-class tools is at risk of suspension.": "تغيّرت قواعد التنقيح؛ وحتى تُقِرّ، يتعرّض وصولك لأدوات الفئة السرّية للتعليق.",
  "Acknowledge → access stays active and the ack is logged. Read policy → opens Data Handling v4 first.": "أقِرّ ← يبقى الوصول فعّالاً ويُسجَّل الإقرار. اقرأ السياسة ← يفتح معالجة البيانات v4 أولاً.",
  "Due now · access review Friday": "مستحق الآن · مراجعة الوصول الجمعة",
  "Policy: Data Handling v4 (POL-DH-004)": "السياسة: معالجة البيانات v4 (POL-DH-004)",
  // task 3
  "Complete training — Secure AI Use": "أكمِل التدريب — الاستخدام الآمن للذكاء الاصطناعي",
  "12-minute refresher, due Friday.": "دورة تنشيطية 12 دقيقة، مستحقة الجمعة.",
  "Assigned by your manager, Riley Chen (not self-initiated)": "أسنده مديرك، Riley Chen (ليس بمبادرة ذاتية)",
  "Your Secure-AI-Use certification is expiring; it's required to keep sandbox and Confidential-tool access.": "شهادة استخدامك الآمن للذكاء الاصطناعي على وشك الانتهاء؛ وهي مطلوبة للحفاظ على وصول البيئة التجريبية وأدوات الفئة السرّية.",
  "Start → 12-min refresher; completion auto-logs as governance evidence and renews the cert.": "ابدأ ← دورة تنشيطية 12 دقيقة؛ يُسجَّل الإكمال تلقائياً كدليل حوكمة ويُجدّد الشهادة.",
  "Due Friday": "مستحق الجمعة", "Course: Secure AI Use · Governance Academy": "الدورة: الاستخدام الآمن للذكاء الاصطناعي · أكاديمية الحوكمة",
  // request 1
  "New project — Support Insights Copilot": "مشروع جديد — مساعد رؤى الدعم",
  "Submitted to your manager for approval before it can start.": "مُقدَّم لمديرك للموافقة قبل أن يبدأ.",
  "You — self-initiated 2 days ago": "أنت — بمبادرة ذاتية قبل يومين",
  "New AI initiatives can't be built until a manager owns the risk; approval opens a governed workspace with AIRA + evidence.": "لا تُبنى مبادرات الذكاء الاصطناعي الجديدة حتى يملك مدير الخطر؛ الموافقة تفتح مساحة عمل مُحوكَمة مع تقييم مخاطر الذكاء الاصطناعي + الأدلة.",
  "Approved → it appears in My Initiatives and you can start. Declined → returns with a reason.": "مُعتمَد ← يظهر في مبادراتي ويمكنك البدء. مرفوض ← يعود مع سبب.",
  "Manager Riley Chen · pending 2 days": "المدير Riley Chen · معلّق منذ يومين",
  "Would become AI initiative · Customer Ops": "سيصبح مبادرة ذكاء اصطناعي · عمليات العملاء",
  // request 2
  "Prompt approval — Customer email draft": "موافقة مطالبة — مسودة بريد العميل",
  "Awaiting your manager's sign-off before it's reusable.": "بانتظار اعتماد مديرك قبل أن تصبح قابلة لإعادة الاستخدام.",
  "You — flagged by the Gateway as customer-facing": "أنت — وسمتها البوابة كموجّهة للعميل",
  "Reusable prompts touching customer communications need sign-off so an approved, PII-safe version enters the shared library.": "المطالبات القابلة لإعادة الاستخدام التي تمسّ مراسلات العملاء تحتاج اعتماداً كي تدخل نسخة معتمدة آمنة من البيانات الشخصية المكتبة المشتركة.",
  "Approved → prompt joins your Assistant's library for reuse. Declined → stays private to you.": "مُعتمَد ← تنضمّ المطالبة لمكتبة مساعدك لإعادة الاستخدام. مرفوض ← تبقى خاصة بك.",
  "Manager Riley Chen · pending 1 day": "المدير Riley Chen · معلّق منذ يوم",
  "Prompt · linked to Resolution Copilot": "مطالبة · مرتبطة بـ Resolution Copilot",
  // request 3
  "Tool access — Finance AI": "وصول لأداة — Finance AI",
  "You requested access; pending CFO office review.": "طلبت الوصول؛ بانتظار مراجعة مكتب المدير المالي.",
  "You — access request 3 days ago": "أنت — طلب وصول قبل 3 أيام",
  "Finance AI is a Restricted-class system owned by Finance; access needs the data owner's approval, not your manager's.": "Finance AI نظام من الفئة المقيّدة تملكه المالية؛ يحتاج الوصول موافقة مالك البيانات، لا مديرك.",
  "Granted → the tool appears in your AI Hub. Denied → you'll see the reason and any alternative.": "مُمنَح ← تظهر الأداة في مركز الذكاء الاصطناعي لديك. مرفوض ← سترى السبب وأي بديل.",
  "CFO office (Elena Rossi) · pending 3 days": "مكتب المدير المالي (Elena Rossi) · معلّق منذ 3 أيام",
  "Tool: Finance AI · Restricted · owner CFO": "الأداة: Finance AI · مقيّدة · المالك المدير المالي",
});

/* Manager — Team View (extends the employee workspace). */
registerContent({
  "Your own AI workspace — plus a Team View, because you also lead people.": "مساحة عملك الخاصة بالذكاء الاصطناعي — إضافةً إلى عرض الفريق، لأنك تقود أشخاصاً أيضاً.",
  "2 tasks due and 2 sessions in progress — and, as a people-leader, 5 approvals and 2 enablement nudges wait in your Team View.": "مهمتان مستحقتان وجلستان قيد التنفيذ — وبصفتك قائد أشخاص، 5 موافقات وتذكيران بالتمكين ينتظران في عرض فريقك.",
  "5 approvals from your team": "5 موافقات من فريقك",
  "Prompt sign-offs, a policy exception and access requests need your decision.": "اعتمادات مطالبات واستثناء سياسة وطلبات وصول تحتاج قرارك.",
  "2 members need enablement": "عضوان يحتاجان تمكيناً",
  "Two people are below the active-use threshold — a nudge would help.": "شخصان دون عتبة الاستخدام النشط — تذكير سيساعد.",
  "Team adoption": "تبنّي الفريق", "14/22 · Team View": "14/22 · عرض الفريق",
  "Approvals": "الموافقات", "waiting on you · Team View": "بانتظارك · عرض الفريق",
  // Team View surface
  "Team View": "عرض الفريق",
  "Your team's AI at a glance — adoption, value, risk, and what needs your sign-off. Aggregates only, never private prompts.": "ذكاء فريقك الاصطناعي بلمحة — التبنّي والقيمة والخطر وما يحتاج اعتمادك. تجميعات فقط، لا مطالبات خاصة أبداً.",
  "Time saved": "وقت مُوفَّر", "team · month": "الفريق · الشهر", "waiting on you": "بانتظارك",
  "Team compliance": "امتثال الفريق", "3 outstanding": "3 معلّقة", "Usage cost": "تكلفة الاستخدام",
  "Team roster & adoption": "قائمة الفريق والتبنّي", "Who's active, who needs a nudge": "من نشط، ومن يحتاج تذكيراً",
  "Analyst": "محلّل", "Specialist": "أخصائي", "Associate": "مساعد",
  "Team AI usage": "استخدام الفريق للذكاء الاصطناعي", "Where the team applies AI": "أين يطبّق الفريق الذكاء الاصطناعي",
  "Response drafting": "صياغة الردود", "Case summarisation": "تلخيص الحالات", "QA & review": "ضمان الجودة والمراجعة",
  "Approvals queue": "قائمة الموافقات", "5 waiting on you": "5 بانتظارك",
  "Team guardrail events": "أحداث حواجز الفريق", "Member · risk · status": "العضو · الخطر · الحالة",
  "Compliance by member": "الامتثال حسب العضو", "Policies · training · actions": "السياسات · التدريب · الإجراءات",
  "Unknown": "غير معروف",
  // approvals (5 items)
  "Prompt approval — Customer email draft (L. Haddad)": "موافقة مطالبة — مسودة بريد العميل (L. Haddad)",
  "A support-reply prompt using ticket context; PII redaction is on. Approving makes it reusable team-wide and records evidence.": "مطالبة ردّ دعم تستخدم سياق التذكرة؛ وتنقيح البيانات الشخصية مُفعَّل. الاعتماد يجعلها قابلة لإعادة الاستخدام على مستوى الفريق ويسجّل دليلاً.",
  "L. Haddad (Analyst) — submitted a shared prompt; Gateway flagged it customer-facing": "L. Haddad (محلّل) — قدّم مطالبة مشتركة؛ وسمتها البوابة كموجّهة للعميل",
  "Reusable prompts that touch customer communications need a manager's sign-off so a PII-safe, approved version enters the shared library.": "المطالبات القابلة لإعادة الاستخدام التي تمسّ مراسلات العملاء تحتاج اعتماد مدير كي تدخل نسخة معتمدة آمنة من البيانات الشخصية المكتبة المشتركة.",
  "Approve → prompt joins the team library at v1 and evidence is minted. Decline → returns to L. Haddad with your reason.": "اعتمد ← تنضمّ المطالبة لمكتبة الفريق بالإصدار v1 ويُسكّ الدليل. ارفض ← تعود إلى L. Haddad مع سببك.",
  "Pending 1 day · with you": "معلّق منذ يوم · لديك", "Prompt · linked to Resolution Copilot · redaction on": "مطالبة · مرتبطة بـ Resolution Copilot · التنقيح مُفعَّل",
  "Policy exception — extended data retention": "استثناء سياسة — احتفاظ ممتد بالبيانات",
  "A 30-day retention waiver for a summarisation flow, above the standard 90-day rule. Routes to the CDPO office if approved.": "إعفاء احتفاظ 30 يوماً لمسار تلخيص، فوق قاعدة الـ90 يوماً المعيارية. يُوجَّه لمكتب مسؤول حماية البيانات إن اعتُمِد.",
  "S. Kim (Specialist) — requested on behalf of the Resolution Copilot pilot": "S. Kim (أخصائي) — طلب نيابةً عن تجربة Resolution Copilot",
  "The flow needs 120-day retention to evaluate summary quality over a full quarter, beyond the standard 90-day rule.": "يحتاج المسار احتفاظاً 120 يوماً لتقييم جودة التلخيص عبر ربع كامل، أبعد من قاعدة الـ90 يوماً المعيارية.",
  "Approve → your sign-off routes to the CDPO office for final ratification. Defer → holds for more detail.": "اعتمد ← يُوجَّه اعتمادك لمكتب مسؤول حماية البيانات للمصادقة النهائية. أجّل ← يُبقيه لمزيد من التفصيل.",
  "Pending 2 days · then CDPO ratification": "معلّق منذ يومين · ثم مصادقة مسؤول حماية البيانات", "Initiative: Resolution Copilot · exception EXC-2026-014": "المبادرة: Resolution Copilot · الاستثناء EXC-2026-014",
  "Tool access — model sandbox (2 analysts)": "وصول لأداة — بيئة النماذج التجريبية (محلّلان)",
  "Two analysts requested sandbox access to prototype a workflow; access is time-boxed and logged.": "طلب محلّلان وصولاً للبيئة التجريبية لبناء نموذج أولي لسير عمل؛ الوصول محدّد بوقت ومُسجَّل.",
  "L. Haddad and J. Okafor (Analysts) — joint request to prototype an automation": "L. Haddad وJ. Okafor (محلّلان) — طلب مشترك لبناء نموذج أولي لأتمتة",
  "Sandbox access lets them test a workflow against real models without touching production data; it's time-boxed and fully logged.": "الوصول للبيئة التجريبية يتيح لهما اختبار سير عمل مقابل نماذج حقيقية دون مسّ بيانات الإنتاج؛ وهو محدّد بوقت ومُسجَّل بالكامل.",
  "Grant → 30-day sandbox access for both, auto-expiring with an audit trail. Decline → returns with your reason.": "امنح ← وصول 30 يوماً للبيئة التجريبية لكليهما، ينتهي تلقائياً مع أثر تدقيق. ارفض ← يعود مع سببك.",
  "Tool: Model sandbox · time-boxed 30 days · 2 members": "الأداة: بيئة النماذج التجريبية · محدّدة بـ30 يوماً · عضوان",
  "New project — Support Insights Copilot (J. Okafor)": "مشروع جديد — مساعد رؤى الدعم (J. Okafor)",
  "A proposed AI initiative from your team; approving files it into AI Central intake and creates the cross-functional facets.": "مبادرة ذكاء اصطناعي مقترحة من فريقك؛ الاعتماد يُودِعها في استقبال AI Central ويُنشئ الجوانب متعددة الوظائف.",
  "J. Okafor (Analyst) — self-initiated proposal 2 days ago": "J. Okafor (محلّل) — اقتراح بمبادرة ذاتية قبل يومين",
  "A new AI initiative can't be built until a manager owns the risk; your approval opens a governed workspace with an AI-risk assessment.": "لا تُبنى مبادرة ذكاء اصطناعي جديدة حتى يملك مدير الخطر؛ اعتمادك يفتح مساحة عمل مُحوكَمة مع تقييم مخاطر ذكاء اصطناعي.",
  "Approve → creates the initiative and its Legal/Risk/Security facets in AI Central. Decline → returns to J. Okafor with a reason.": "اعتمد ← يُنشئ المبادرة وجوانبها القانونية/المخاطر/الأمن في AI Central. ارفض ← تعود إلى J. Okafor مع سبب.",
  "Pending 2 days · with you": "معلّق منذ يومين · لديك",
  "Scale gate — Support Automation": "بوابة توسّع — أتمتة الدعم",
  "The pilot met its adoption and risk bar; approve to move it into the scaling wave with a governed decision record.": "استوفت التجربة عتبتَي التبنّي والخطر؛ اعتمد لنقلها إلى موجة التوسّع مع سجل قرار مُحوكَم.",
  "Gate engine — auto-raised when Support Automation cleared its pilot exit criteria": "محرّك البوابة — أُثيرت تلقائياً عندما اجتازت أتمتة الدعم معايير خروج التجربة",
  "The pilot hit its adoption (9/22) and residual-risk (Low) thresholds; moving to scale needs a manager's governed decision.": "بلغت التجربة عتبتَي التبنّي (9/22) والخطر المتبقي (منخفض)؛ الانتقال للتوسّع يحتاج قراراً مُحوكَماً من مدير.",
  "Approve → advances it to the scaling wave with a dated decision record and notifies AI Central. Hold → keeps it in pilot.": "اعتمد ← يُقدّمها لموجة التوسّع مع سجل قرار مؤرّخ ويُخطِر AI Central. علّق ← يُبقيها في التجربة.",
  "Awaiting your decision · lead L. Haddad": "بانتظار قرارك · القائد L. Haddad", "Initiative: Support Automation · pilot → scale gate": "المبادرة: أتمتة الدعم · التجربة ← بوابة التوسّع",
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
  const lang=useLang(); const T_=en=>ts(lang,en);
  const max = raw ? Math.max(...rows.map(r=>r[2])) : 100;
  return <Card style={cardPad}><Eyebrow>{T_(eye)}</Eyebrow><H3>{T_(h3)}</H3>
    {rows.map((r,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"150px 1fr auto",alignItems:"center",gap:12,padding:"8px 0",borderBottom:i<rows.length-1?`1px solid ${T.border}`:"none"}}>
      <span style={{fontSize:11,fontWeight:600,color:T.ink2,fontFamily:F.b}}>{T_(r[0])}{r[1]?<span style={{color:T.ink4}}> · {T_(r[1])}</span>:null}</span>
      <div style={{height:8,borderRadius:6,background:T.s3||T.border,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.round(r[2]/max*100)}%`,background:col(r[3])}}/></div>
      <span style={{fontSize:11,fontWeight:800,textAlign:"right",minWidth:44,color:col(r[3]),fontFamily:F.m}}>{raw?r[2].toLocaleString():r[2]+"%"}</span>
    </div>)}
    {legend&&<div style={{display:"flex",gap:14,flexWrap:"wrap",marginTop:11}}>{legend.map((l,i)=><span key={i} style={{display:"flex",alignItems:"center",gap:6,fontSize:10,color:T.ink3,fontWeight:600,fontFamily:F.b}}><span style={{width:9,height:9,borderRadius:3,background:col(l[1])}}/>{T_(l[0])}</span>)}</div>}
  </Card>;
}
const cell = (c,T_=x=>x) => Array.isArray(c) ? <Pill c={col(c[1])}>{T_(c[0])}</Pill> : T_(c);
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
  const lang=useLang(); const T_=en=>ts(lang,en);
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
  return <Card style={cardPad}><Eyebrow>{T_(eye)}</Eyebrow><H3>{T_(h3)}</H3>
    <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11.5,fontFamily:F.b}}>
      <thead><tr>{head.map(h=><th key={h} style={{textAlign:"left",fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m,padding:"0 10px 9px",borderBottom:`1px solid ${T.border}`}}>{T_(h)}</th>)}</tr></thead>
      <tbody>{rows.map((r,i)=><tr key={i} onClick={()=>onRow(r)} className={clickable?"vz-lrow":""} style={{cursor:clickable?"pointer":"default"}}>{r.map((c,j)=><td key={j} style={{padding:"11px 10px",borderBottom:i<rows.length-1?`1px solid ${T.border}`:"none",color:j===0?T.ink:T.ink2,fontWeight:j===0?700:400}}>{cell(c,T_)}</td>)}</tr>)}</tbody>
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
  const lang=useLang(); const ar=lang==="ar"; const T_=en=>ts(lang,en); const arrow=ar?"←":"→";
  const [done,setDone]=useState({});
  useEffect(()=>{const h=e=>{if(e.key==="Escape")onClose();};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[onClose]);
  const record=(idx,step)=>{
    setDone(d=>({...d,[idx]:true}));
    pushBus("vz-gw-evidence",{item:`${rec.ref} — ${step}`,initiative:rec.project||"Enterprise",scope:"Security",control:`${rec.kindLabel||"Item"} treatment`,risk:rec.title,owner:rec.owner||"Security",status:"In Progress",approval:"Action recorded",version:"v1",time:"Just now"});
    ctx.showToast&&ctx.showToast(ar?`سُجِّل إجراء على ${rec.ref} — سُكّ الدليل`:`Action recorded on ${rec.ref} — evidence minted`);
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
            {rec.severity&&<Pill c={col(rec.severity[1])}>{T_(rec.severity[0])}</Pill>}
            {rec.status&&<Pill c={col(rec.status[1])}>{T_(rec.status[0])}</Pill>}
          </div>
          <button onClick={onClose} aria-label="Close" style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:7,width:26,height:26,color:T.ink3,fontSize:13,cursor:"pointer",flexShrink:0}}>✕</button>
        </div>
        <h3 style={{fontFamily:F.h,fontSize:15,fontWeight:800,color:T.ink,margin:"9px 0 0",lineHeight:1.3}}>{T_(rec.title)}</h3>
      </div>
      <div style={{padding:18}}>
        {rec.summary&&<p style={{fontSize:11.5,color:T.ink2,lineHeight:1.65,fontFamily:F.b,margin:"0 0 14px"}}>{T_(rec.summary)}</p>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 14px",marginBottom:16}}>
          {meta.map(([l,v])=><div key={l}><div style={{fontSize:8.5,color:T.ink4,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>{T_(l)}</div>
            {l==="Project"&&rec.project?<button onClick={openProject} style={{background:"none",border:"none",padding:0,fontSize:11.5,fontWeight:800,color:AI_GOLD_INK,fontFamily:F.b,cursor:"pointer",textAlign:ar?"right":"left"}}>{T_(v)} {arrow}</button>
              :<div style={{fontSize:11.5,color:T.ink,fontWeight:600,fontFamily:F.b}}>{T_(v)}</div>}
          </div>)}
        </div>
        {rec.plan&&rec.plan.length>0&&<div style={{marginBottom:16}}>
          <div style={{fontSize:9,color:T.ink4,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>{T_(rec.planLabel||"Action / treatment plan")}</div>
          <div style={{display:"grid",gap:7}}>
            {rec.plan.map((s,i)=>{const label=Array.isArray(s)?s[0]:s;const st=Array.isArray(s)?s[1]:"ink3";const isDone=done[i]||st==="good";return <div key={i} style={{display:"flex",gap:9,alignItems:"center",background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"9px 11px"}}>
              <span style={{width:16,height:16,borderRadius:5,flexShrink:0,display:"grid",placeItems:"center",fontSize:10,fontWeight:900,background:isDone?T.green+"22":col(st)+"18",color:isDone?T.green:col(st)}}>{isDone?"✓":i+1}</span>
              <span style={{flex:1,fontSize:11,color:T.ink2,fontFamily:F.b,lineHeight:1.4,textDecoration:isDone?"line-through":"none",opacity:isDone?.7:1}}>{T_(label)}</span>
              {!isDone&&<button onClick={()=>record(i,label)} style={{background:AI_GOLD+"16",border:`1px solid ${AI_GOLD}40`,borderRadius:6,padding:"3px 9px",color:AI_GOLD_INK,fontSize:9.5,fontWeight:800,fontFamily:F.b,cursor:"pointer",flexShrink:0}}>{T_("Record")}</button>}
            </div>;})}
          </div>
        </div>}
        {rec.timeline&&rec.timeline.length>0&&<div style={{marginBottom:16}}>
          <div style={{fontSize:9,color:T.ink4,fontFamily:F.m,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>{T_("Timeline")}</div>
          <div style={{display:"grid",gap:0}}>
            {rec.timeline.map((t,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"78px 1fr",gap:10,padding:"6px 0",borderBottom:i<rec.timeline.length-1?`1px solid ${T.border}`:"none"}}>
              <span style={{fontSize:9.5,color:T.ink4,fontFamily:F.m,fontWeight:700}}>{T_(t[0])}</span><span style={{fontSize:10.5,color:T.ink2,fontFamily:F.b,lineHeight:1.5}}>{T_(t[1])}</span>
            </div>)}
          </div>
        </div>}
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button onClick={openProject} style={{background:AI_GOLD,border:"none",borderRadius:8,padding:"9px 14px",color:"#0b0e24",fontSize:11,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>{(rec.projectId?T_("Open project workspace"):T_("Open in Risk Center"))+" "+arrow}</button>
          <button onClick={openRisk} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 14px",color:T.ink2,fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{T_("View in Risk Center")+" "+arrow}</button>
        </div>
      </div>
    </div>
  </div>;
}
function Register({eye,h3,kind,kindLabel,items,ctx}){
  const lang=useLang(); const ar=lang==="ar"; const T_=en=>ts(lang,en);
  const [sel,setSel]=useState(null);
  const compact=ctx&&ctx.deep===false;
  const shown=compact?items.slice(0,3):items;
  const open=r=>setSel({...r,kind,kindLabel});
  return <><Card style={cardPad}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div>{eye&&<Eyebrow>{T_(eye)}</Eyebrow>}{h3&&<H3 style={{margin:0}}>{T_(h3)}</H3>}</div>
      {compact&&ctx.goSurface&&<button onClick={()=>ctx.goSurface()} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:8,padding:"6px 12px",color:T.ink2,fontSize:10.5,fontWeight:800,fontFamily:F.b,cursor:"pointer",flexShrink:0}}>{T_("Open full register")} {ar?"←":"→"}</button>}
    </div>
    <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11.5,fontFamily:F.b}}>
      <thead><tr>{["Ref","Item","Project","Severity","Status",""].map((hh,i)=><th key={i} style={{textAlign:"left",fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase",color:T.ink4,fontWeight:900,fontFamily:F.m,padding:"0 10px 9px",borderBottom:`1px solid ${T.border}`}}>{T_(hh)}</th>)}</tr></thead>
      <tbody>{shown.map((r,i)=><tr key={i} onClick={()=>open(r)} className="vz-reg-row" style={{cursor:"pointer"}}>
        <td style={{padding:"11px 10px",borderBottom:i<shown.length-1?`1px solid ${T.border}`:"none",color:T.ink,fontWeight:700}}>{r.ref}</td>
        <td style={{padding:"11px 10px",borderBottom:i<shown.length-1?`1px solid ${T.border}`:"none",color:T.ink2}}>{T_(r.title)}</td>
        <td style={{padding:"11px 10px",borderBottom:i<shown.length-1?`1px solid ${T.border}`:"none",color:AI_GOLD_INK,fontWeight:700}}>{r.project?T_(r.project):"—"}</td>
        <td style={{padding:"11px 10px",borderBottom:i<shown.length-1?`1px solid ${T.border}`:"none"}}>{r.severity?<Pill c={col(r.severity[1])}>{T_(r.severity[0])}</Pill>:"—"}</td>
        <td style={{padding:"11px 10px",borderBottom:i<shown.length-1?`1px solid ${T.border}`:"none"}}>{r.status?<Pill c={col(r.status[1])}>{T_(r.status[0])}</Pill>:"—"}</td>
        <td style={{padding:"11px 10px",borderBottom:i<shown.length-1?`1px solid ${T.border}`:"none",color:T.ink4,textAlign:ar?"left":"right",fontWeight:800}}>{ar?"←":"→"}</td>
      </tr>)}</tbody>
    </table></div>
    <style>{`.vz-reg-row:hover td{background:${T.s2}}`}</style>
  </Card>
  {sel&&<Drawer rec={sel} onClose={()=>setSel(null)} ctx={ctx}/>}</>;
}
function Scores({eye,h3,ring,rows}){
  const lang=useLang(); const T_=en=>ts(lang,en);
  return <Card style={cardPad}><Eyebrow>{T_(eye)}</Eyebrow><H3>{T_(h3)}</H3>
    <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
      <div style={{width:96,height:96,borderRadius:"50%",background:`conic-gradient(${T.green} ${ring}%, ${T.s3||T.panel} 0)`,display:"grid",placeItems:"center",flex:"none"}}>
        <div style={{width:72,height:72,borderRadius:"50%",background:T.s1,display:"grid",placeItems:"center"}}><div style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:800,color:T.ink,lineHeight:1,fontFamily:F.m}}>{ring}</div><div style={{fontSize:7.5,letterSpacing:"0.1em",textTransform:"uppercase",color:T.ink4,fontWeight:800,marginTop:2}}>{T_("Maturity")}</div></div></div>
      </div>
      <div style={{flex:1,minWidth:200}}>{rows.map((r,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"150px 1fr 34px",alignItems:"center",gap:12,padding:"7px 0",borderBottom:i<rows.length-1?`1px solid ${T.border}`:"none"}}>
        <span style={{fontSize:11,fontWeight:700,color:T.ink2,fontFamily:F.b}}>{T_(r[0])}</span>
        <div style={{height:8,borderRadius:6,background:T.s3||T.border,overflow:"hidden"}}><div style={{height:"100%",width:`${r[1]}%`,background:col(r[2])}}/></div>
        <span style={{fontSize:11,fontWeight:800,textAlign:"right",color:col(r[2]),fontFamily:F.m}}>{r[1]}</span>
      </div>)}</div>
    </div>
  </Card>;
}
function TextBlock({eye,h3,body}){
  const lang=useLang(); const T_=en=>ts(lang,en);
  return <Card style={cardPad}><Eyebrow>{T_(eye)}</Eyebrow><H3 style={{marginBottom:8}}>{T_(h3)}</H3><div style={{fontSize:11.5,color:T.ink3,lineHeight:1.7,fontFamily:F.b}}>{T_(body)}</div></Card>;
}
function Library({items}){
  const lang=useLang(); const T_=en=>ts(lang,en);
  return <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16}}>
    {items.map((l,i)=><Card key={i} style={{padding:"14px 15px",cursor:"pointer"}}><div style={{fontSize:12.5,fontWeight:800,color:T.ink,fontFamily:F.b}}>{T_(l[0])}</div><div style={{fontSize:10.5,color:T.ink3,marginTop:5,lineHeight:1.5,fontFamily:F.b}}>{T_(l[1])}</div><div style={{marginTop:9}}><Pill c={col(l[3])}>{T_(l[2])}</Pill></div></Card>)}
  </div>;
}
function Report({eye,h3,dims,completed,showToast}){
  const lang=useLang(); const ar=lang==="ar"; const T_=en=>ts(lang,en);
  const [sel,setSel]=useState(new Set(dims.slice(0,3)));
  const [gen,setGen]=useState(false);
  const toggle=d=>setSel(s=>{const n=new Set(s);n.has(d)?n.delete(d):n.add(d);return n;});
  return <><Card style={cardPad}><Eyebrow>{T_(eye)}</Eyebrow><H3>{T_(h3)}</H3>
    <div style={{fontSize:10.5,color:T.ink3,fontFamily:F.b,margin:"2px 0 11px"}}>{ar?<>اختر الأبعاد المراد تضمينها، ثم صدّرها كـ <b style={{color:T.ink2}}>PDF</b> (جاهز للمجلس) أو <b style={{color:T.ink2}}>Excel</b> (مصنّف أدلة).</>:<>Pick the dimensions to include, then export as <b style={{color:T.ink2}}>PDF</b> (board-ready) or <b style={{color:T.ink2}}>Excel</b> (evidence workbook).</>}</div>
    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{dims.map(d=><button key={d} onClick={()=>toggle(d)} style={{padding:"7px 14px",borderRadius:20,fontSize:11.5,fontWeight:800,cursor:"pointer",fontFamily:F.b,border:`1px solid ${sel.has(d)?AI_GOLD:T.border}`,background:sel.has(d)?AI_GOLD:T.s2,color:sel.has(d)?"#0b0e24":T.ink3}}>{T_(d)}</button>)}</div>
    <div style={{display:"flex",gap:9,marginTop:14}}><button onClick={()=>{setGen(true);showToast&&showToast(ar?"تم إنشاء التقرير":"Report generated");}} style={{background:AI_GOLD,border:"none",borderRadius:11,padding:"10px 17px",color:"#0b0e24",fontSize:12,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>✦ {T_("Generate report")}</button><button onClick={()=>showToast&&showToast(ar?"تمت جدولة التسليم — أُضيف إلى تقويم التقارير":"Delivery scheduled — added to the reporting calendar")} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:11,padding:"10px 17px",color:T.ink2,fontSize:12,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{T_("Schedule")}</button></div>
  </Card>
  {completed&&completed.length>0&&<Card style={{...cardPad,marginTop:14}}><Eyebrow>{T_("Training completed — on your record")}</Eyebrow><H3 style={{marginBottom:10}}>{T_("Auto-included as governance evidence")}</H3>
    <div style={{display:"grid",gap:7}}>{completed.map(([name,when])=><div key={name} style={{display:"flex",alignItems:"center",gap:10,background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"9px 12px"}}>
      <span style={{color:T.green,fontWeight:900,fontFamily:F.m,fontSize:12}}>✓</span>
      <span style={{fontSize:11.5,fontWeight:700,color:T.ink,fontFamily:F.b,flex:1}}>{T_(name)}</span>
      <span style={{fontSize:10,color:T.ink3,fontFamily:F.b}}>{T_(when)}</span>
    </div>)}</div>
  </Card>}
  {gen&&<Card style={{...cardPad,marginTop:14,border:`1px solid ${AI_GOLD}44`,animation:"up .2s ease"}}><Eyebrow>{ar?`مسودة مُنشأة · ${[...sel].length} أبعاد`:`Generated draft · ${[...sel].length} dimensions`}</Eyebrow><H3 style={{marginBottom:10}}>{ar?"التقرير — الربع الثالث 2026":"Report — Q3 FY26"}</H3>
    <div style={{fontSize:11,color:T.ink2,lineHeight:1.7,fontFamily:F.b}}>{[...sel].map(d=><div key={d}>• <b style={{color:T.ink}}>{T_(d)}</b> — {ar?"مُوحَّد للفترة.":"consolidated for the period."}</div>)}</div>
    <div style={{display:"flex",gap:9,marginTop:14}}><button style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"8px 15px",color:T.ink2,fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{T_("Export XLSX")}</button><button style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"8px 15px",color:T.ink2,fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{T_("Export PDF")}</button></div>
  </Card>}</>;
}
function Actions({eye,h3,items,role,showToast}){
  const lang=useLang(); const ar=lang==="ar"; const T_=en=>ts(lang,en);
  const [done,setDone]=useState({});
  const act=(n,label,title)=>{
    setDone(d=>({...d,[n]:label}));
    pushBus("vz-gw-evidence",{item:`${label} — ${title}`,initiative:title,scope:"Workspace",control:"Approval record",risk:"Decision",owner:(ROLES[role]||ROLES.caio).name,status:"Complete",approval:label,version:"v1",time:"Just now"});
    showToast&&showToast(ar?`تم تسجيل «${T_(label)}» — سُكّ الدليل`:`${label} recorded — evidence minted`);
  };
  /* Governance context strip — every task/request answers what it's for,
     who raised it, why it matters, what's next and where it's stuck. In a
     governance product an item with no provenance is worse than useless. */
  const MetaRow=({label,value,c})=><div style={{display:"grid",gridTemplateColumns:"92px 1fr",gap:8,alignItems:"baseline"}}>
    <span style={{fontSize:8.5,fontWeight:900,fontFamily:F.m,color:T.ink4,textTransform:"uppercase",letterSpacing:"0.08em"}}>{T_(label)}</span>
    <span style={{fontSize:10.5,color:c||T.ink2,fontFamily:F.b,lineHeight:1.5}}>{T_(value)}</span>
  </div>;
  return <div>{eye&&<Eyebrow>{T_(eye)}</Eyebrow>}{h3&&<H3>{T_(h3)}</H3>}
    {items.map(a=>{const m=a[6];return <Card key={a[0]} style={{...cardPad,marginBottom:11,display:"flex",gap:13,alignItems:"flex-start"}}>
      <div style={{width:30,height:30,borderRadius:9,display:"grid",placeItems:"center",fontWeight:800,fontSize:12,flexShrink:0,color:"#0b0e24",background:col(a[1]),fontFamily:F.m}}>{a[0]}</div>
      <div style={{flex:1,minWidth:0}}><H3 style={{marginBottom:0}}>{T_(a[2])}</H3><div style={{fontSize:11,color:T.ink3,marginTop:4,lineHeight:1.55,fontFamily:F.b}}>{T_(a[3])}</div>
        {m&&<div style={{display:"grid",gap:5,marginTop:10,padding:"10px 12px",background:T.s2,border:`1px solid ${T.border}`,borderRadius:9}}>
          {m.by&&<MetaRow label="Raised by" value={m.by}/>}
          {m.why&&<MetaRow label="Why it matters" value={m.why}/>}
          {m.next&&<MetaRow label="Next step" value={m.next}/>}
          {m.wait&&<MetaRow label="Waiting on" value={m.wait} c={T.amber}/>}
          {m.ref&&<MetaRow label="Linked" value={m.ref} c={T.blue}/>}
        </div>}
        {done[a[0]]?<div style={{fontSize:11,fontWeight:800,color:T.green,fontFamily:F.b,marginTop:11}}>✓ {ar?`تم تسجيل «${T_(done[a[0]])}» — سُكّ الدليل`:`${done[a[0]]} recorded — evidence minted`}</div>
        :<div style={{display:"flex",gap:9,marginTop:11,flexWrap:"wrap"}}>
          <button onClick={()=>act(a[0],a[4],a[2])} style={{background:AI_GOLD,border:"none",borderRadius:9,padding:"8px 15px",color:"#0b0e24",fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{T_(a[4])}</button>
          <button onClick={()=>act(a[0],a[5],a[2])} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"8px 15px",color:T.ink2,fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{T_(a[5])}</button>
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
  const lang=useLang(); const ar=lang==="ar"; const T_=en=>ts(lang,en);
  const [open,setOpen]=useState(false);
  const [sent,setSent]=useState(false);
  const [f,setF]=useState({name:"",purpose:"",value:""});
  const set=k=>e=>setF(s=>({...s,[k]:e.target.value}));
  const field={background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"9px 11px",color:T.ink,fontSize:11.5,fontFamily:F.b,width:"100%",outline:"none"};
  const submit=()=>{
    const name=f.name.trim()||"Untitled AI project";
    pushBus("vz-gw-evidence",{item:`New project request — ${name}`,initiative:name,scope:"Workspace",control:"New project approval",risk:f.purpose||"Employee-proposed initiative",owner:(ROLES[role]||ROLES.employee).name,status:"Pending",approval:"Awaiting manager approval",version:"v1",time:"Just now"});
    setSent(true);setOpen(false);
    showToast&&showToast(ar?`أُرسِل «${name}» إلى مديرك للموافقة`:`"${name}" sent to your manager for approval`);
  };
  return <Card style={{...cardPad,border:`1px solid ${AI_GOLD}40`,background:`linear-gradient(135deg,${T.s2},${T.s1})`}}>
    <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start",flexWrap:"wrap"}}>
      <div style={{flex:1,minWidth:220}}>
        {eye&&<Eyebrow>{T_(eye)}</Eyebrow>}
        <H3 style={{marginBottom:8}}>{T_(h3)}</H3>
        <div style={{fontSize:11.5,color:T.ink3,lineHeight:1.65,fontFamily:F.b,maxWidth:640}}>{T_(body)}</div>
      </div>
      {!sent&&!open&&<button onClick={()=>setOpen(true)} style={{background:AI_GOLD,border:"none",borderRadius:10,padding:"10px 16px",color:"#0b0e24",fontSize:12,fontWeight:900,fontFamily:F.b,cursor:"pointer",flexShrink:0,whiteSpace:"nowrap"}}>+ {T_("Start a new project")}</button>}
    </div>
    {sent&&<div style={{marginTop:13,display:"flex",gap:9,alignItems:"center",background:T.green+"14",border:`1px solid ${T.green}40`,borderRadius:10,padding:"11px 13px"}}>
      <span style={{fontSize:13,fontWeight:900,color:T.green,fontFamily:F.m}}>✓</span>
      <span style={{fontSize:11.5,color:T.ink2,fontFamily:F.b,lineHeight:1.5}}>{ar?<>تم إرسال الطلب — وهو الآن في قائمة موافقات مديرك. ستتمكّن من البدء بمجرد اعتماده. تابِعه ضمن <b style={{color:T.ink}}>طلباتي</b>.</>:<>Request submitted — it's now in your manager's approval queue. You'll be able to start once it's approved. Track it under <b style={{color:T.ink}}>My Requests</b>.</>}</span>
    </div>}
    {open&&<div style={{marginTop:14,display:"grid",gap:10,animation:"up .2s ease"}}>
      <label style={{display:"grid",gap:5}}><span style={{fontSize:9,fontWeight:900,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.08em"}}>{T_("Project name")}</span><input value={f.name} onChange={set("name")} placeholder={ar?"مثال: مساعد رؤى الدعم":"e.g. Support Insights Copilot"} style={field}/></label>
      <label style={{display:"grid",gap:5}}><span style={{fontSize:9,fontWeight:900,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.08em"}}>{T_("What will it do?")}</span><input value={f.purpose} onChange={set("purpose")} placeholder={ar?"المشكلة التي يحلّها وكيف يساعد الذكاء الاصطناعي":"The problem it solves and how AI helps"} style={field}/></label>
      <label style={{display:"grid",gap:5}}><span style={{fontSize:9,fontWeight:900,color:T.ink4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.08em"}}>{T_("Expected value")}</span><input value={f.value} onChange={set("value")} placeholder={ar?"مثال: يوفّر على الفريق ~5 ساعات أسبوعياً":"e.g. saves the team ~5h/week"} style={field}/></label>
      <div style={{display:"flex",gap:9,marginTop:2,flexWrap:"wrap"}}>
        <button onClick={submit} style={{background:AI_GOLD,border:"none",borderRadius:9,padding:"9px 15px",color:"#0b0e24",fontSize:11,fontWeight:900,fontFamily:F.b,cursor:"pointer"}}>{T_("Send for manager approval")}</button>
        <button onClick={()=>setOpen(false)} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:9,padding:"9px 15px",color:T.ink2,fontSize:11,fontWeight:800,fontFamily:F.b,cursor:"pointer"}}>{T_("Cancel")}</button>
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
