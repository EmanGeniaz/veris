"use client";
/* ── GenVeris Intelligence experience ──────────────────────────────────────
   The first thing a signed-in leader sees is not a wall of tiles. It is a
   question — "How may I help you?" — and the handful of issues that are
   burning across their AI estate right now, ranked through their role's lens.
   From there they can step into the Command Deck (an interactive, holographic
   map of the whole governance system) or drop straight to the classic
   dashboard at any time.

   Honesty is preserved end to end:
   - every number comes from the same governed sources the classic dashboard
     uses (risk register, KRIs, approvals, incidents, breach clocks, evidence
     freshness, cost engine, computed framework posture, agent registry,
     Article-12 inference chain);
   - seeded showcase data is badged "Demo data"; a customer workspace with no
     records shows honest empty states, never fabricated activity;
   - the assistant answers through the governed gateway and labels a local
     fallback as simulated.

   Visual language: a dark "bridge" that the classic light workspace opens
   into. Brand-derived — the blue/silver ribbon and the four-pointed star of
   the GenVeris emblem become the living Governance Core. */
import { useEffect, useMemo, useRef, useState, useCallback, useReducer } from "react";
import {
  ShieldAlert, Activity, Gavel, Siren, Timer, FileWarning, Wallet, Scale, Mic, MicOff,
  ArrowUp, LayoutGrid, Sparkles, X, ChevronRight, LogOut, Languages, Orbit, Bot, Link2,
  CircleCheck, Layers, Radar, Workflow, Boxes, ArrowLeft, ShieldCheck, Command,
  Pause, Play, Power, Crosshair, Zap, FlaskConical, ChevronDown, Network, FileSearch, ListChecks,
} from "lucide-react";
import { HITL, ROLES } from "./core";
import { deriveBurningIssues, issueSummary, greetingFor, routeIntent, briefFor } from "../../lib/burning-issues";
import { buildEstate, impactOf, governanceOf, LAYERS } from "../../lib/estate-map";
import { riskRegister, kriRegister, acInitiatives, AC_PHASES } from "../../lib/platform-models";
import { UNIFIED_INCIDENTS } from "../../lib/convergence";
import { BREACH_REGISTER, breachClock } from "../../lib/breach-notification";
import { EVIDENCE_ARTIFACTS } from "../../lib/evidence-freshness";
import { providerSpend, costSummary, fmtUSD, fmtTokens } from "../../lib/cost-engine";
import { euAiActStats, iso42001Stats, nistRmfStats, NISTRMF_REQS } from "../../lib/computed-frameworks";
import { GOVERNANCE_SCORE, GOVERNANCE_INPUTS } from "../../lib/governance";
import { AGENT_REGISTRY } from "../../lib/agent-runtime";
import { INFERENCE_EVENTS, chainIntact } from "../../lib/inference-log";
import { askGateway } from "../../lib/gateway-client";
import { honestSimulatedReply } from "../../lib/assistant-honesty";
import { evaluateAction, ROUTINE, ATTACKS, STAGES, initialFleet, applyEvent, agentStatus, breakerFor, pauseAgent, resumeAgent } from "../../lib/live-showcase";
import { AI_AGENTS } from "../../lib/agent-registry";

/* ── tokens ─────────────────────────────────────────────────────────────── */
const XC = {
  void: "#0A0E16", surface: "#111724", raised: "#172033", sunk: "#0D121D",
  ink: "#E7ECF5", silver: "#A6B1C6", mute: "#7C89A1",
  blue: "#5B93FF", electric: "#7FA7FF", cyan: "#4FD1E8", gold: "#E2B862",
  crit: "#FF6B80", high: "#FFA45A", med: "#EFD06A", ok: "#62D48E",
  line: "#243049", lineHi: "#33405C",
  // provenance grammar: observed, calculated, AI interpretation, recommendation, human decision, verified enforcement
  pO: "#5CC8A8", pC: "#7FA7FF", pI: "#BE9CFF", pR: "#E2B862", pD: "#EEF1F7", pE: "#4FD1E8",
};
const SEV = { critical: XC.crit, high: XC.high, medium: XC.med };
const KIND_ICON = { approval: Gavel, risk: ShieldAlert, kri: Activity, incident: Siren, breach: Timer, evidence: FileWarning, budget: Wallet, posture: Scale };
const GREET_AR = { "Good morning": "صباح الخير", "Good afternoon": "مساء الخير", "Good evening": "مساء الخير", "Working late": "تعمل لوقت متأخر", "Hello": "مرحباً" };
const SUGGEST_AR = ["ما أكبر المخاطر التي تحتاج قراري؟", "لخّص استثناءات الحوكمة هذا الأسبوع", "افتح سجل المخاطر"];
const SERIF = "'DM Serif Display', Georgia, serif";
const SANS = "Manrope, Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

/* ── copy (EN / AR) ─────────────────────────────────────────────────────── */
const COPY = {
  en: {
    eyebrow: "Veris Intelligence", help: "How may I help you?",
    burningLead: (total, shown) => total === 0 ? "Nothing is burning across your AI estate right now." : total > shown ? `${total} issues need your attention across your AI estate — here are the ${shown} that matter most.` : `${total} ${total === 1 ? "issue needs" : "issues need"} your attention across your AI estate.`,
    askPh: "Ask anything about your AI estate, or say “open the risk register”…",
    burning: "Burning issues", allClear: "All clear", allClearSub: "No burning issues in this workspace. New risks, approvals and breaches will surface here the moment they are recorded.",
    enterDeck: "Enter Command Deck", classic: "Classic dashboard", skip: "Open the classic dashboard after sign-in",
    askAbout: "Ask about this", thinking: "Thinking through your governed data…",
    live: "Live", demo: "Demo data", simulated: "Simulated · no model", blocked: "Blocked by policy", liveAnswer: "Live · via governed gateway",
    disclosure: "AI-assisted · via the governed Gateway · logged to Article 12",
    deck: "Command Deck", home: "Intelligence", core: "Governance Core", score: "AI Governance Score",
    planes: "Planes", queue: "Burning queue", feed: "Live inference feed", chain: "Evidence chain of custody", verified: "Chain verified", broken: "Chain integrity broken",
    spend: "AI spend · month to date", assurance: "Control coverage", agents: "Governed agents", lifecycle: "Initiative lifecycle",
    notClaim: "Coverage of controls — not a compliance claim", awaiting: "Awaiting data", openClassic: "Open in classic workspace", askVeris: "Ask Veris",
    signOut: "Sign out", close: "Close", of: "of budget", hitl: "Propose and act agents always wait for a human decision.",
    inFlight: "Initiatives in flight", openRisks: "High+ risks open", approvals: "Your decisions", agentsOn: "Agents available", burningN: "Burning now",
    mic: "Speak your question", micStop: "Stop listening", send: "Ask", suggestions: "Try",
    sevChip: (cr, hi) => `${cr} critical · ${hi} high`, workspace: r => `${r} workspace`,
    tabOverview: "Overview", tabLive: "Live Security",
    liveTag: "Live", liveNote: "Live simulation — synthetic agent traffic. Every verdict is computed in real time by GenVeris' policy, authority, egress, runtime, output and circuit-breaker engines.",
    pause: "Pause stream", play: "Resume stream", processed: "Actions governed", allowedN: "Allowed", maskedN: "Masked", escalatedN: "Sent to a human", blockedN: "Threats blocked", suspendedN: "Agents suspended",
    pipeline: "Security pipeline · in action", fleet: "Agent fleet · live monitor", lab: "Attack lab", labNote: "Fire an attack — the real engines decide what happens.",
    own: "Test your own prompt", ownPh: "Type a prompt an agent might send…", runIt: "Run through the pipeline", stream: "Enforcement stream",
    killSwitch: "Pause agent", resume: "Resume · human decision", decidedBy: "Decided at", reasonL: "Why", waiting: "Waiting for the first action…",
    status: { idle: "Idle", running: "Running", downscoped: "Downscoped", suspended: "Suspended by breaker", paused: "Paused by human" },
    watchLive: "Watch security live", ribbon: (a, b, e) => `${a} agents monitored · ${b} threats blocked · ${e} sent to humans`, lastL: "Latest",
    tabBriefs: "Briefs", tabDecisions: "Decisions", tabEstate: "Estate", tabInstruments: "Instruments",
    pv: { O: "Observed", C: "Calculated", I: "AI interpretation", R: "Recommendation", D: "Human decision", E: "Verified enforcement" },
    eNote: "Verified enforcement appears only when Veris Enforce confirms a control took effect. Not connected in this workspace.",
    q: { changed: "What changed", matters: "Why it matters", evidence: "Evidence", unc: "Uncertainty", who: "Who should act", action: "Available action" },
    unc: { low: "Low", medium: "Medium", high: "High" },
    briefsLead: (n, cr, hi) => n ? `${n} material ${n === 1 ? "brief" : "briefs"} for your lens · ${cr} critical · ${hi} high` : "Nothing material for your lens right now.",
    quiet: "Briefs appear only above your role's materiality line. Everything below it stays in the registers, under Instruments.",
    watch: "Watch", lens: "Evidence lens", lensSource: "Source", lensRecord: "Record", lensNote: "You are seeing this record because your role's lens includes it. Values are shown as recorded.",
    openSource: "Open source record",
    decisionsLead: n => n ? `${n} ${n === 1 ? "decision is" : "decisions are"} waiting in your approval queue.` : "No decisions are waiting in your approval queue.",
    statement: "Decision", recommendation: "Recommendation · prepared, not decided", reasoning: "Prepared reasoning", confidence: "Stated confidence",
    policyClause: "Policy clause", tier: "Risk tier", timing: "Timing", authority: "Decision authority",
    authorityText: r => `This decision is in the ${r} approval queue, so it is within your delegated authority. Approving or rejecting is recorded under your identity on the audit chain.`,
    safeguard: "The recommendation is not an approval. Nothing is applied until a named person decides.",
    notEnforced: "A decision is not proof of enforcement. Veris Enforce is not connected, so GenVeris cannot verify that a control took effect.",
    decideIn: "Decide in the approvals workspace", awaitingYou: "Awaiting your decision", safeguards: "Safeguards",
    estateLead: "What depends on what, drawn only from keys the registers already share. Select anything to see what a change would affect.",
    estateNote: "Derived view. Typed relationships in the Evidence Fabric are a proposed capability (#166). Names are matched exactly, so a system recorded under two spellings appears twice.",
    impact: "If this changes", affected: "Affected", govAttached: "Governance on what is affected", dependsOn: "Depends on", usedBy: "Used by", attached: "Governance attached",
    noImpact: "Nothing in the estate depends on this.", pickHint: "Select a model, data source, agent or AI system.", clear: "Clear",
    layer: { model: "Models", data: "Data", agent: "Agents", system: "AI systems" },
    gtype: { risk: "Risks", kri: "KRIs", incident: "Incidents", control: "Controls", policy: "Policies" },
    instrumentsLead: "The classic instruments, kept for analysis and audit. Open any plane to trace a number to its source.",
    scoreL: "AI Governance Score", sev: { critical: "Critical", high: "High", medium: "Medium" },
  },
  ar: {
    eyebrow: "ذكاء فيرِس", help: "كيف يمكنني مساعدتك؟",
    burningLead: (total, shown) => total === 0 ? "لا توجد قضايا ملحّة في منظومة الذكاء الاصطناعي الآن." : total > shown ? `${total} قضية تحتاج انتباهك — إليك أهم ${shown} منها.` : `${total} قضايا تحتاج انتباهك في منظومة الذكاء الاصطناعي.`,
    askPh: "اسأل أي شيء عن منظومة الذكاء الاصطناعي، أو قل «افتح سجل المخاطر»…",
    burning: "قضايا ملحّة", allClear: "كل شيء على ما يرام", allClearSub: "لا توجد قضايا ملحّة في مساحة العمل هذه. ستظهر المخاطر والموافقات والحوادث هنا فور تسجيلها.",
    enterDeck: "ادخل منصة القيادة", classic: "اللوحة الكلاسيكية", skip: "افتح اللوحة الكلاسيكية بعد تسجيل الدخول",
    askAbout: "اسأل عن هذا", thinking: "جارٍ التحليل عبر بياناتك المحوكَمة…",
    live: "مباشر", demo: "بيانات تجريبية", simulated: "محاكاة · بلا نموذج", blocked: "محظور بموجب السياسة", liveAnswer: "مباشر · عبر البوابة المحوكَمة",
    disclosure: "بمساعدة الذكاء الاصطناعي · عبر البوابة المحوكَمة · مسجَّل وفق المادة 12",
    deck: "منصة القيادة", home: "الذكاء", core: "نواة الحوكمة", score: "مؤشر حوكمة الذكاء الاصطناعي",
    planes: "المستويات", queue: "قائمة الأولويات", feed: "سجل الاستدلال المباشر", chain: "سلسلة حفظ الأدلة", verified: "السلسلة سليمة", broken: "سلامة السلسلة مكسورة",
    spend: "إنفاق الذكاء الاصطناعي · هذا الشهر", assurance: "تغطية الضوابط", agents: "الوكلاء المحوكَمون", lifecycle: "دورة حياة المبادرات",
    notClaim: "تغطية الضوابط — وليست ادعاء امتثال", awaiting: "بانتظار البيانات", openClassic: "افتح في مساحة العمل الكلاسيكية", askVeris: "اسأل فيرِس",
    signOut: "تسجيل الخروج", close: "إغلاق", of: "من الميزانية", hitl: "وكلاء الاقتراح والتنفيذ ينتظرون دائماً قراراً بشرياً.",
    inFlight: "مبادرات قيد التنفيذ", openRisks: "مخاطر عالية مفتوحة", approvals: "قراراتك", agentsOn: "وكلاء متاحون", burningN: "ملحّة الآن",
    mic: "تحدّث بسؤالك", micStop: "إيقاف الاستماع", send: "اسأل", suggestions: "جرّب",
    sevChip: (cr, hi) => `${cr} حرجة · ${hi} عالية`, workspace: r => `مساحة عمل ${r}`,
    tabOverview: "نظرة عامة", tabLive: "الأمن المباشر",
    liveTag: "مباشر", liveNote: "محاكاة مباشرة — حركة وكلاء اصطناعية. كل قرار يُحسب لحظياً بمحركات السياسة والصلاحيات والخروج والتشغيل والمخرجات وقاطع الدائرة في GenVeris.",
    pause: "إيقاف البث", play: "استئناف البث", processed: "إجراءات محوكَمة", allowedN: "مسموح", maskedN: "مقنَّع", escalatedN: "أُحيل إلى إنسان", blockedN: "تهديدات محظورة", suspendedN: "وكلاء موقوفون",
    pipeline: "خط الأمان · قيد التنفيذ", fleet: "أسطول الوكلاء · مراقبة مباشرة", lab: "مختبر الهجمات", labNote: "أطلق هجوماً — المحركات الحقيقية تقرر النتيجة.",
    own: "اختبر طلبك الخاص", ownPh: "اكتب طلباً قد يرسله وكيل…", runIt: "مرّره عبر خط الأمان", stream: "سجل التنفيذ",
    killSwitch: "إيقاف الوكيل", resume: "استئناف (قرار بشري)", decidedBy: "تقرر عند", reasonL: "السبب", waiting: "بانتظار أول إجراء…",
    status: { idle: "خامل", running: "يعمل", downscoped: "صلاحيات مقلَّصة", suspended: "أوقفه القاطع", paused: "أوقفه إنسان" },
    watchLive: "شاهد الأمن مباشرة", ribbon: (a, b, e) => `${a} وكلاء تحت المراقبة · ${b} تهديدات محظورة · ${e} أُحيلت إلى البشر`, lastL: "الأحدث",
    tabBriefs: "الموجزات", tabDecisions: "القرارات", tabEstate: "المنظومة", tabInstruments: "الأدوات",
    pv: { O: "مُلاحَظ", C: "محسوب", I: "تفسير بالذكاء الاصطناعي", R: "توصية", D: "قرار بشري", E: "تنفيذ مُتحقَّق منه" },
    eNote: "لا يظهر التنفيذ المُتحقَّق منه إلا عندما يؤكد Veris Enforce أن الضابط طُبِّق فعلاً. غير متصل في مساحة العمل هذه.",
    q: { changed: "ما الذي تغيّر", matters: "لماذا يهم", evidence: "الدليل", unc: "درجة عدم اليقين", who: "من يجب أن يتصرف", action: "الإجراء المتاح" },
    unc: { low: "منخفضة", medium: "متوسطة", high: "مرتفعة" },
    briefsLead: (n, cr, hi) => n ? `${n} موجزات جوهرية لدورك · ${cr} حرجة · ${hi} عالية` : "لا يوجد ما هو جوهري لدورك الآن.",
    quiet: "لا تظهر الموجزات إلا فوق حد الأهمية لدورك. كل ما دونه يبقى في السجلات ضمن الأدوات.",
    watch: "المتابعة", lens: "عدسة الأدلة", lensSource: "المصدر", lensRecord: "السجل", lensNote: "ترى هذا السجل لأن نطاق دورك يشمله. القيم معروضة كما سُجّلت.",
    openSource: "افتح السجل المصدر",
    decisionsLead: n => n ? `${n} قرارات بانتظارك في قائمة الموافقات.` : "لا توجد قرارات بانتظارك في قائمة الموافقات.",
    statement: "القرار", recommendation: "توصية · مُعدّة وليست قراراً", reasoning: "المبررات المُعدّة", confidence: "الثقة المعلنة",
    policyClause: "بند السياسة", tier: "مستوى المخاطر", timing: "التوقيت", authority: "صلاحية القرار",
    authorityText: r => `هذا القرار في قائمة موافقات ${r}، لذا فهو ضمن صلاحياتك المفوّضة. تُسجَّل الموافقة أو الرفض باسمك في سلسلة التدقيق.`,
    safeguard: "التوصية ليست موافقة. لا يُطبَّق شيء حتى يقرر شخص مُسمّى.",
    notEnforced: "القرار ليس دليلاً على التنفيذ. Veris Enforce غير متصل، لذا لا يمكن لـ GenVeris التحقق من تطبيق الضابط.",
    decideIn: "قرّر في مساحة الموافقات", awaitingYou: "بانتظار قرارك", safeguards: "الضمانات",
    estateLead: "ما الذي يعتمد على ماذا، مرسوم فقط من مفاتيح تتشاركها السجلات أصلاً. اختر أي عنصر لترى ما الذي سيتأثر بتغييره.",
    estateNote: "عرض مشتق. العلاقات المصنّفة في نسيج الأدلة قدرة مقترحة (#166). تُطابَق الأسماء حرفياً، لذا يظهر النظام المسجّل بتهجئتين مرتين.",
    impact: "إذا تغيّر هذا", affected: "المتأثر", govAttached: "الحوكمة على ما يتأثر", dependsOn: "يعتمد على", usedBy: "يستخدمه", attached: "الحوكمة المرتبطة",
    noImpact: "لا شيء في المنظومة يعتمد على هذا.", pickHint: "اختر نموذجاً أو مصدر بيانات أو وكيلاً أو نظام ذكاء اصطناعي.", clear: "مسح",
    layer: { model: "النماذج", data: "البيانات", agent: "الوكلاء", system: "أنظمة الذكاء الاصطناعي" },
    gtype: { risk: "المخاطر", kri: "مؤشرات المخاطر", incident: "الحوادث", control: "الضوابط", policy: "السياسات" },
    instrumentsLead: "الأدوات الكلاسيكية، محفوظة للتحليل والتدقيق. افتح أي مستوى لتتبّع الرقم إلى مصدره.",
    scoreL: "مؤشر حوكمة الذكاء الاصطناعي", sev: { critical: "حرجة", high: "عالية", medium: "متوسطة" },
  },
};

/* Role-shaped starter questions — the same intent vocabulary the classic
   assistant answers, phrased for each executive lens. */
const SUGGEST = {
  ceo: ["Brief me for the board on AI risk and value", "Which initiatives should we scale or retire?", "Open the portfolio"],
  caio: ["What's blocking our next scale gate?", "Summarise this week's governance exceptions", "Open the risk register"],
  ciso: ["Where are we most exposed to prompt injection?", "Status of open AI incidents", "Show me incidents"],
  cio: ["Which AI systems need architecture review?", "Where is AI spend running hot?", "Open the portfolio"],
  cdpo: ["Which breach clocks are running?", "Where is personal data at risk in our AI systems?", "Show me breaches"],
  cgo: ["Where are our biggest EU AI Act gaps?", "Which evidence is stale?", "Open compliance"],
  cro: ["Which KRIs breached this month?", "Top residual risks and their owners", "Open the risk register"],
  cfo: ["Is AI spend within budget?", "Which initiatives return the most value?", "Open reports"],
  coo: ["Which AI operations risks need action?", "Where are initiatives blocked?", "Open the portfolio"],
  chro: ["How is AI literacy training progressing?", "Workforce risks from our AI systems", "Open academy"],
  legal: ["Which regulatory obligations are at risk?", "Summarise our Article 12 logging posture", "Open compliance"],
  manager: ["What does my team need to approve?", "How is my team using AI safely?", "Open academy"],
  employee: ["What AI tools am I allowed to use?", "Help me draft a safe prompt", "Open academy"],
};

/* ── styles (scoped .gx-*) ──────────────────────────────────────────────── */
const CSS = `
.gx-root{position:fixed;inset:0;overflow-y:auto;overflow-x:hidden;color:${XC.ink};font-family:${SANS};z-index:500;
  background:radial-gradient(900px 480px at 50% -12%,rgba(91,147,255,.10),transparent 62%),${XC.void};-webkit-font-smoothing:antialiased}
.gx-wrap{position:relative;max-width:1440px;margin:0 auto;padding:0 24px 40px;overflow-x:clip}
.gx-hud{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:14px;padding:12px 24px;margin:0 -24px;
  background:rgba(10,14,22,.92);backdrop-filter:blur(10px);border-bottom:1px solid ${XC.line}}
.gx-hud img{height:36px;width:auto;display:block}
.gx-spacer{flex:1}
.gx-chip{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 11px;border-radius:999px;border:1px solid ${XC.line};
  background:${XC.surface};font-size:12px;font-weight:700;color:${XC.silver};white-space:nowrap}
.gx-dot{width:7px;height:7px;border-radius:50%;flex:none}
.gx-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:38px;padding:0 15px;border-radius:11px;cursor:pointer;
  font:700 13px ${SANS};color:${XC.ink};background:${XC.raised};border:1px solid ${XC.lineHi};transition:border-color .15s,background .15s}
.gx-btn:hover{border-color:${XC.mute}}
.gx-btn:disabled{cursor:not-allowed}
.gx-btn-primary{background:${XC.blue};border-color:${XC.blue};color:#0A0E16}
.gx-btn-primary:hover{background:#7AA8FF;border-color:#7AA8FF}
.gx-btn-gold{border-color:${XC.gold};color:${XC.gold};background:rgba(226,184,98,.08)}
.gx-btn-icon{width:38px;padding:0}
.gx-root :focus-visible{outline:2px solid ${XC.blue};outline-offset:2px}
.gx-label{font-size:11px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;color:${XC.mute}}
.gx-panel{position:relative;background:${XC.surface};border:1px solid ${XC.line};border-radius:16px;box-shadow:0 14px 40px rgba(0,0,0,.25)}
.gx-hero{display:grid;grid-template-columns:minmax(0,1fr);justify-items:center;text-align:center;padding:40px 0 8px;position:relative}
.gx-core-bg{position:absolute;top:-170px;left:50%;transform:translateX(-50%);width:min(680px,120vw);aspect-ratio:1;opacity:.32;pointer-events:none}
.gx-core-bg canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.gx-greet{font-family:${SERIF};font-weight:400;font-size:clamp(34px,5.2vw,64px);line-height:1.05;margin:14px 0 0;letter-spacing:-.01em;text-wrap:balance}
.gx-greet em{font-style:italic;color:${XC.blue}}
.gx-help{font-family:${SERIF};font-size:clamp(26px,3.6vw,44px);color:${XC.electric};margin:6px 0 0;font-style:italic}
.gx-lead{font-size:15px;color:${XC.silver};margin:14px 0 0;max-width:66ch;text-wrap:balance}
.gx-ask{position:relative;width:min(820px,100%);margin:26px auto 0;display:flex;align-items:center;gap:8px;padding:7px 7px 7px 16px;border-radius:16px;
  background:${XC.sunk};border:1px solid ${XC.lineHi};transition:border-color .15s,box-shadow .15s}
.gx-ask:focus-within{border-color:${XC.blue};box-shadow:0 0 0 4px rgba(91,147,255,.16)}
.gx-ask input{flex:1;min-width:0;height:42px;background:transparent;border:0;outline:none;color:${XC.ink};font:500 15.5px ${SANS}}
.gx-ask input::placeholder{color:${XC.mute}}
.gx-ask input:focus-visible{outline:none}
.gx-sugg{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:12px}
.gx-sugg button{height:30px;padding:0 12px;border-radius:999px;border:1px solid ${XC.line};background:transparent;color:${XC.silver};font:600 12.5px ${SANS};cursor:pointer}
.gx-sugg button:hover{border-color:${XC.lineHi};color:${XC.ink}}
.gx-answer{width:min(820px,100%);margin:14px auto 0;padding:16px 18px;text-align:start}
.gx-answer p{margin:8px 0 0;font-size:14.5px;line-height:1.6;color:${XC.ink};white-space:pre-wrap}
.gx-sec{display:flex;align-items:center;gap:12px;margin:40px 0 14px;flex-wrap:wrap}
.gx-sec h2{font-family:${SERIF};font-weight:400;font-size:26px;margin:0;white-space:nowrap}
.gx-rule{flex:1;height:1px;background:${XC.line}}
.gx-issues{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px}
.gx-issue{padding:18px 18px 16px;display:flex;flex-direction:column;gap:10px;min-height:236px;overflow:hidden}
.gx-issue .gx-sev{position:absolute;inset:0 auto 0 0;width:3px;border-radius:16px 0 0 16px}
.gx-issue h3{margin:0;font-size:15.5px;font-weight:800;line-height:1.3;text-wrap:balance}
.gx-issue .why{font-size:13px;line-height:1.5;color:${XC.silver};display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.gx-metric{display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding-top:10px;border-top:1px dashed ${XC.line};margin-top:auto}
.gx-metric b{font-family:${MONO};font-size:15px;color:${XC.ink};font-variant-numeric:tabular-nums}
.gx-acts{display:flex;gap:8px;flex-wrap:wrap}
.gx-acts .gx-btn{height:32px;font-size:12.5px;padding:0 12px;border-radius:9px}
.gx-cta{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:12px;margin:34px 0 0}
.gx-cta .gx-btn{height:46px;padding:0 22px;font-size:14px;border-radius:13px}
.gx-check{display:inline-flex;align-items:center;gap:8px;font-size:12.5px;color:${XC.mute};cursor:pointer;margin-top:14px}
.gx-check input{accent-color:${XC.blue};width:15px;height:15px}
.gx-empty{padding:28px;text-align:center;color:${XC.silver};font-size:14px}
/* deck */
.gx-deckhead{display:flex;align-items:center;gap:12px;margin-top:22px;flex-wrap:wrap}
.gx-deckhead h1{font-family:${SERIF};font-weight:400;font-size:clamp(28px,3.4vw,40px);margin:0}
.gx-tabs{display:inline-flex;gap:2px;padding:4px;border-radius:13px;border:1px solid ${XC.line};background:${XC.sunk};max-width:100%;overflow-x:auto}
.gx-tabs button{height:34px;padding:0 13px;border-radius:9px;border:1px solid transparent;background:transparent;color:${XC.silver};font:700 13px ${SANS};cursor:pointer;display:inline-flex;align-items:center;gap:7px;white-space:nowrap}
.gx-tabs button[aria-selected="true"]{background:${XC.raised};border-color:${XC.lineHi};color:${XC.ink};box-shadow:inset 0 -2px 0 ${XC.blue}}
.gx-dock{margin-top:16px}
.gx-dock .gx-ask{margin:0;width:100%}
.gx-dock .gx-answer{width:100%}
.gx-legend{display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center;font-size:12px;color:${XC.silver};margin-top:12px}
.gx-legend .gx-pv{margin:0 5px 0 0;vertical-align:middle}
.gx-pv{display:inline-grid;place-items:center;min-width:17px;height:17px;padding:0 4px;border-radius:5px;font:800 10.5px/1 ${MONO};
  vertical-align:.3em;margin-inline-start:3px;border:1px solid currentColor;background:color-mix(in srgb,currentColor 12%,transparent)}
.gx-claim{color:${XC.ink}}
.gx-two{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:16px;margin-top:16px;align-items:start}
.gx-col{display:flex;flex-direction:column;gap:14px;min-width:0}
.gx-card{padding:16px 16px 14px}
.gx-card-h{display:flex;align-items:center;gap:8px;margin-bottom:12px}
.gx-brief{overflow:hidden}
.gx-brief-h{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;align-items:center;width:100%;padding:14px 16px;background:none;border:0;color:inherit;text-align:start;cursor:pointer;font:inherit}
.gx-brief-h:hover h3{color:${XC.electric}}
.gx-brief-h h3{margin:3px 0 0;font-size:15px;font-weight:800;line-height:1.35}
.gx-brief[data-open="true"]{border-color:${XC.lineHi}}
.gx-sevbar{width:4px;align-self:stretch;border-radius:4px}
.gx-six{display:grid;gap:0;border-top:1px solid ${XC.line}}
.gx-six > div{display:grid;grid-template-columns:150px minmax(0,1fr);gap:12px;padding:10px 16px;border-top:1px solid rgba(36,48,73,.6);font-size:13.5px;color:${XC.silver}}
.gx-six > div:first-child{border-top:0}
.gx-six > div > b{font-size:10.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:${XC.mute};padding-top:3px}
.gx-why{padding:10px 16px 14px;font-size:12px;color:${XC.mute};font-style:italic;border-top:1px dashed ${XC.line}}
.gx-unc{display:inline-flex;gap:2px;vertical-align:middle;margin-inline-end:6px}
.gx-unc i{width:8px;height:8px;border-radius:2px;background:${XC.lineHi}}
.gx-linkbtn{background:none;border:0;padding:0;color:${XC.electric};font:inherit;cursor:pointer;text-decoration:underline;text-decoration-color:${XC.lineHi};text-underline-offset:3px;text-align:start}
.gx-linkbtn:hover{text-decoration-color:${XC.electric}}
.gx-lens{position:fixed;top:0;bottom:0;inset-inline-end:0;width:min(440px,100%);z-index:520;background:${XC.surface};border-inline-start:1px solid ${XC.lineHi};
  box-shadow:-24px 0 60px rgba(0,0,0,.4);display:flex;flex-direction:column}
.gx-lens header{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid ${XC.line}}
.gx-lens .body{padding:16px;overflow:auto;display:grid;gap:14px;font-size:13.5px}
.gx-scrim{position:fixed;inset:0;z-index:510;background:rgba(5,8,14,.5)}
.gx-kv{display:grid;grid-template-columns:130px minmax(0,1fr);gap:8px 12px;font-size:13px;margin:0}
.gx-kv dt{color:${XC.mute}}.gx-kv dd{margin:0;color:${XC.ink};overflow-wrap:anywhere}
.gx-note{font-size:12.5px;line-height:1.5;color:${XC.silver};border:1px solid ${XC.line};border-radius:12px;padding:10px 12px;background:${XC.sunk}}
.gx-note.warn{border-color:rgba(255,164,90,.45);background:rgba(255,164,90,.06)}
.gx-dec{display:grid;grid-template-columns:280px minmax(0,1fr);gap:16px;margin-top:16px;align-items:start}
.gx-dlist{display:grid;gap:8px}
.gx-dlist button{text-align:start;border:1px solid ${XC.line};border-radius:12px;background:${XC.surface};padding:11px 13px;cursor:pointer;color:inherit;font:inherit}
.gx-dlist button[aria-current="true"]{border-color:${XC.blue};box-shadow:inset 3px 0 0 ${XC.blue}}
.gx-ws section{padding:14px 18px;border-top:1px solid ${XC.line}}
.gx-ws section:first-child{border-top:0}
.gx-ws h3{font-family:${SERIF};font-weight:400;font-size:24px;margin:6px 0 0;line-height:1.2}
.gx-ws .gx-grid2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px}
.gx-estate{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:16px;margin-top:16px;align-items:start}
.gx-gwrap{border:1px solid ${XC.line};border-radius:16px;background:${XC.sunk};overflow-x:auto}
.gx-gwrap svg{display:block;min-width:860px;width:100%;height:auto}
.gx-gnode{cursor:pointer}
.gx-gnode rect{fill:${XC.surface};stroke:${XC.lineHi};stroke-width:1}
.gx-gnode .t{fill:${XC.ink};font:700 11.5px ${SANS}}
.gx-gnode .s{fill:${XC.mute};font:600 9.5px ${MONO}}
.gx-gnode:hover rect,.gx-gnode:focus-visible rect{stroke:${XC.electric}}
.gx-gnode:focus-visible{outline:none}
.gx-gnode.sel rect{stroke:${XC.blue};stroke-width:2}
.gx-gnode.hit rect{stroke:${XC.high};stroke-width:1.6;fill:#1d1a1c}
.gx-gnode.dim{opacity:.3}
.gx-gedge{fill:none;stroke:${XC.lineHi};stroke-width:1.1}
.gx-gedge.hit{stroke:${XC.high};stroke-width:1.8}
.gx-gedge.dim{opacity:.18}
.gx-glabel{fill:${XC.mute};font:800 10px ${SANS};letter-spacing:.14em}
.gx-ilist{display:grid;gap:6px}
.gx-ilist > div{font-size:12.5px;color:${XC.silver};padding:8px 10px;border-radius:10px;background:${XC.sunk};border:1px solid ${XC.line}}
.gx-ilist > div b{display:block;color:${XC.ink};font-size:12.5px;margin-bottom:2px}
.gx-instr{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:16px;margin-top:16px;align-items:start}
.gx-planes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.gx-planes button{display:grid;gap:3px;text-align:start;padding:11px 12px;border-radius:12px;border:1px solid ${XC.line};background:${XC.sunk};color:inherit;cursor:pointer;font:inherit}
.gx-planes button[aria-pressed="true"]{border-color:${XC.blue}}
.gx-planes .nm{font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;display:flex;align-items:center;gap:7px}
.gx-planes .mv{font:600 12.5px ${MONO};color:${XC.silver}}
.gx-kpis{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;margin-top:16px}
.gx-kpi{padding:12px 12px 10px;text-align:start;box-shadow:none}
.gx-kpi b{display:block;font-family:${MONO};font-size:22px;font-variant-numeric:tabular-nums;margin-top:4px}
.gx-row{display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid rgba(36,48,73,.7);font-size:13px}
.gx-row:first-of-type{border-top:0}
.gx-rowbtn{width:100%;background:none;border:0;color:inherit;text-align:start;cursor:pointer;font:inherit;padding:0}
.gx-rowbtn:hover .t{color:${XC.electric}}
.gx-mono{font-family:${MONO};font-variant-numeric:tabular-nums}
.gx-bar{height:6px;border-radius:999px;background:${XC.raised};overflow:hidden}
.gx-bar i{display:block;height:100%;border-radius:999px}
.gx-pipe{display:grid;grid-template-columns:repeat(13,minmax(0,1fr));align-items:center;margin:4px 0 2px;padding:0 6px}
.gx-ph{display:grid;grid-template-rows:20px 22px 20px;justify-items:center;align-items:center;position:relative;min-width:0}
.gx-ph .pt{grid-row:2;width:16px;height:16px;border-radius:50%;border:1px solid ${XC.lineHi};background:${XC.sunk};display:grid;place-items:center;
  font:800 10px ${MONO};color:${XC.void};position:relative;z-index:1}
.gx-ph .pt.on{width:22px;height:22px}
.gx-ph .pn{font-size:11px;color:${XC.mute};line-height:1;white-space:nowrap}
.gx-ph .pn.on{color:${XC.ink};font-weight:700}
.gx-ph .up{grid-row:1}.gx-ph .dn{grid-row:3}
.gx-ph::before{content:"";position:absolute;top:31px;inset-inline-start:50%;width:100%;height:1px;background:${XC.line}}
.gx-ph:last-child::before{display:none}
.gx-chainrow{display:flex;align-items:stretch;gap:6px;overflow-x:auto;padding-bottom:4px}
.gx-blk{flex:1 1 0;min-width:140px;padding:12px;border-radius:12px;border:1px solid ${XC.line};background:${XC.sunk}}
.gx-link{flex:none;display:grid;place-items:center;color:${XC.mute}}
.gx-drill{padding:16px;margin-top:12px;box-shadow:none;background:${XC.sunk}}
@keyframes gx-pulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes gx-rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.gx-pulse{animation:gx-pulse 1.8s ease-in-out infinite}
.gx-rise{animation:gx-rise .45s cubic-bezier(.2,.7,.2,1) both}
.gx-live{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:16px;margin-top:16px;align-items:start}
.gx-banner{display:flex;flex-wrap:wrap;align-items:center;gap:12px;padding:12px 16px;margin-top:16px}
.gx-counters{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;margin-top:12px}
.gx-pipeline{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:0;position:relative;margin:6px 0 4px}
.gx-stage{display:flex;flex-direction:column;align-items:center;gap:7px;text-align:center;position:relative;min-width:0}
.gx-stage::after{content:"";position:absolute;top:22px;inset-inline-start:calc(50% + 24px);width:calc(100% - 48px);height:2px;background:${XC.line}}
.gx-stage:last-child::after{display:none}
.gx-stage .node{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;border:1px solid ${XC.line};background:${XC.sunk};color:${XC.mute};
  font:800 11px ${MONO};position:relative;z-index:1;transition:none}
.gx-stage .lbl{font-size:11.5px;font-weight:700;color:${XC.silver};line-height:1.2}
.gx-stage .dec{font:700 11px ${MONO};text-transform:uppercase;letter-spacing:.06em}
.gx-light{animation:gx-light .4s ease both}
@keyframes gx-light{from{opacity:.25}to{opacity:1}}
.gx-flowbar{position:absolute;top:21px;height:3px;border-radius:3px;inset-inline-start:6%;background:${XC.blue};opacity:.6;width:10%;animation:gx-sweep 1.2s ease-out both;pointer-events:none}
@keyframes gx-sweep{from{inset-inline-start:2%;opacity:.7}to{inset-inline-start:86%;opacity:0}}
.gx-fleet{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}
.gx-agent{padding:14px;display:flex;flex-direction:column;gap:8px;box-shadow:none;background:${XC.sunk}}
.gx-ticks{display:flex;gap:2px;height:16px;align-items:flex-end}
.gx-ticks i{flex:1;border-radius:2px;min-width:3px}
.gx-attack{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
.gx-attack button{display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:10px 12px;border-radius:11px;border:1px solid rgba(255,107,128,.3);
  background:rgba(255,107,128,.05);color:${XC.ink};cursor:pointer;text-align:start;font:700 12.5px ${SANS}}
.gx-attack button:hover{border-color:${XC.crit}}
.gx-attack button span{font:500 11px ${SANS};color:${XC.mute}}
.gx-field{height:38px;border-radius:10px;border:1px solid ${XC.lineHi};background:${XC.sunk};color:${XC.ink};font:500 13px ${SANS};padding:0 10px;min-width:0}
.gx-ribbon{display:flex;flex-wrap:wrap;align-items:center;gap:14px;padding:14px 18px;margin-top:22px}
@media (max-width:1200px){.gx-two,.gx-estate,.gx-instr,.gx-live{grid-template-columns:minmax(0,1fr)}.gx-counters,.gx-kpis{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:860px){.gx-dec{grid-template-columns:minmax(0,1fr)}}
@media (max-width:768px){
  .gx-wrap{padding:0 16px 32px}.gx-hud{padding:10px 16px;margin:0 -16px;gap:8px}.gx-hud img{height:26px}
  .gx-hide-sm{display:none!important}
  .gx-kpis,.gx-counters{grid-template-columns:repeat(2,minmax(0,1fr))}.gx-planes{grid-template-columns:repeat(2,minmax(0,1fr))}
  .gx-pipe{overflow-x:auto;grid-template-columns:repeat(13,64px);padding-bottom:6px}
  .gx-pipeline{overflow-x:auto;grid-template-columns:repeat(8,84px);padding-bottom:6px}
  .gx-six > div{grid-template-columns:minmax(0,1fr);gap:3px}
  .gx-ws .gx-grid2{grid-template-columns:minmax(0,1fr)}
  .gx-kv{grid-template-columns:minmax(0,1fr);gap:2px}.gx-kv dd{margin-bottom:6px}
}
@media (prefers-reduced-motion:reduce){.gx-root *{animation:none!important;transition:none!important}}
`;

function useStyles() {
  useEffect(() => {
    if (document.getElementById("gx-css")) return;
    const s = document.createElement("style"); s.id = "gx-css"; s.textContent = CSS; document.head.appendChild(s);
  }, []);
}

function usePrefersReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const m = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!m) return;
    setR(m.matches);
    const h = e => setR(e.matches);
    m.addEventListener?.("change", h);
    return () => m.removeEventListener?.("change", h);
  }, []);
  return r;
}

/* ── Governance Core: a living particle sphere built on the emblem's
   four-pointed star. Pure canvas; one static frame under reduced motion. ── */
function CoreCanvas({ alert = 0, calm = false }) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    const N = 520, pts = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = golden * i;
      pts.push([Math.cos(th) * r, y, Math.sin(th) * r]);
    }
    let raf = 0, t0 = performance.now();
    const draw = now => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = cv.clientWidth, h = cv.clientHeight;
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.30;
      const t = (now - t0) / 1000;
      const a = t * 0.16, tilt = 0.38;
      // halo
      const halo = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.55);
      halo.addColorStop(0, "rgba(47,123,255,0.20)"); halo.addColorStop(0.55, "rgba(47,123,255,0.06)"); halo.addColorStop(1, "rgba(47,123,255,0)");
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, cy, R * 1.6, 0, Math.PI * 2); ctx.fill();
      // orbit rings
      for (let k = 0; k < 3; k++) {
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(k * 1.05 + t * 0.05 * (k % 2 ? -1 : 1)); ctx.scale(1, 0.32 + k * 0.08);
        ctx.strokeStyle = k === 1 ? "rgba(95,225,255,0.22)" : "rgba(120,170,255,0.14)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(0, 0, R * (1.22 + k * 0.16), 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      }
      // particles
      const ca = Math.cos(a), sa = Math.sin(a), ct = Math.cos(tilt), st = Math.sin(tilt);
      for (const [x, y, z] of pts) {
        const x1 = x * ca + z * sa, z1 = -x * sa + z * ca;
        const y2 = y * ct - z1 * st, z2 = y * st + z1 * ct;
        const depth = (z2 + 1) / 2;
        const px = cx + x1 * R, py = cy + y2 * R;
        const s = 0.6 + depth * 1.5;
        const blueMix = 0.55 + 0.45 * Math.abs(x1);
        ctx.fillStyle = `rgba(${Math.round(150 + 80 * (1 - blueMix))},${Math.round(190 + 30 * (1 - blueMix))},255,${0.12 + depth * 0.7})`;
        ctx.beginPath(); ctx.arc(px, py, s, 0, Math.PI * 2); ctx.fill();
      }
      // four-pointed star (the emblem's heart)
      const pulse = calm ? 1 : 1 + 0.06 * Math.sin(t * 2.2);
      const sr = R * 0.42 * pulse;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, sr);
      g.addColorStop(0, "rgba(255,255,255,0.95)"); g.addColorStop(0.18, "rgba(150,210,255,0.55)"); g.addColorStop(1, "rgba(47,123,255,0)");
      ctx.fillStyle = g; ctx.beginPath();
      const k2 = sr * 0.16;
      ctx.moveTo(cx, cy - sr); ctx.quadraticCurveTo(cx + k2, cy - k2, cx + sr, cy); ctx.quadraticCurveTo(cx + k2, cy + k2, cx, cy + sr);
      ctx.quadraticCurveTo(cx - k2, cy + k2, cx - sr, cy); ctx.quadraticCurveTo(cx - k2, cy - k2, cx, cy - sr); ctx.fill();
      // alert pulse ring
      if (alert > 0 && !calm) {
        const p = (t * 0.5) % 1;
        ctx.strokeStyle = `rgba(255,84,112,${0.35 * (1 - p)})`; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(cx, cy, R * (1.05 + p * 0.5), 0, Math.PI * 2); ctx.stroke();
      }
      if (!reduced && !calm) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    const onResize = () => { if (reduced || calm) requestAnimationFrame(draw); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, [alert, calm, reduced]);
  return <canvas ref={ref} aria-hidden="true" />;
}

/* ── data ───────────────────────────────────────────────────────────────── */
function useExperienceData({ role, seeded }) {
  const [live, setLive] = useState(null); // { events, chainIntact } from /api/inference-log when a DB is live
  useEffect(() => {
    let off = false;
    fetch("/api/inference-log?tenant=demo").then(r => r.json()).then(d => {
      if (!off && d && d.enabled && Array.isArray(d.events) && d.events.length) setLive({ events: d.events, chainIntact: !!d.chainIntact });
    }).catch(() => {});
    return () => { off = true; };
  }, []);

  return useMemo(() => {
    const approvals = seeded ? (HITL[role] || []) : [];
    const spendRows = seeded ? providerSpend() : [];
    const eu = euAiActStats(), iso = iso42001Stats(), nist = nistRmfStats();
    const sources = seeded ? {
      approvals, risks: riskRegister, kris: kriRegister, incidents: UNIFIED_INCIDENTS,
      breaches: BREACH_REGISTER, breachClock, evidence: EVIDENCE_ARTIFACTS,
      budget: spendRows,
      posture: [
        { id: "euaiact", name: "EU AI Act", score: eu.score, target: 85, gaps: eu.gap, partial: eu.partial },
        { id: "iso42001", name: "ISO/IEC 42001", score: iso.score, target: 85, gaps: iso.gap, partial: iso.partial },
        { id: "nistrmf", name: "NIST AI RMF", score: nist.score, target: 85, gaps: nist.gap, partial: nist.partial },
      ],
    } : { approvals };
    const issues = deriveBurningIssues(sources, { role, limit: 5 });
    const allIssues = deriveBurningIssues(sources, { role, limit: 12 });
    const briefs = allIssues.map(i => briefFor(i, { role }));
    const estate = seeded
      ? buildEstate({ initiatives: acInitiatives, agents: AI_AGENTS, risks: riskRegister, kris: kriRegister, incidents: UNIFIED_INCIDENTS })
      : { nodes: [], edges: [] };
    const openRisks = seeded ? riskRegister.filter(r => /critical|high/i.test(r.level) && !/complete|monitored|closed/i.test(r.status)) : [];
    const initiatives = seeded ? acInitiatives : [];
    const cost = seeded ? costSummary() : null;
    const events = live ? live.events : (seeded ? INFERENCE_EVENTS : []);
    const intact = live ? live.chainIntact : (seeded ? chainIntact(INFERENCE_EVENTS) : null);
    const agentsAvail = AGENT_REGISTRY.filter(a => a.status === "available");
    const stale = seeded ? EVIDENCE_ARTIFACTS.filter(e => e.freshness !== "fresh") : [];
    const decisions = events.reduce((m, e) => { const d = String(e.decision || e.action || "").replace(/^inference:/, ""); m[d] = (m[d] || 0) + 1; return m; }, {});
    const nistFns = ["Govern", "Map", "Measure", "Manage"].map(fn => {
      const rows = NISTRMF_REQS.filter(r => String(r.name).startsWith(fn));
      return { fn, met: rows.filter(r => r.status === "Met").length, total: rows.length };
    });
    return {
      issues, allIssues, briefs, estate, summary: issueSummary(allIssues), approvals, openRisks, initiatives, cost, spendRows,
      events, intact, liveFeed: !!live, agentsAvail, stale, decisions, nistFns,
      assurance: seeded ? [
        { id: "eu", name: "EU AI Act", ...eu }, { id: "iso", name: "ISO/IEC 42001", ...iso }, { id: "nist", name: "NIST AI RMF", ...nist },
      ] : [],
    };
  }, [role, seeded, live]);
}

/* ── shared pieces ──────────────────────────────────────────────────────── */
function ProvenanceChip({ live, seeded, c }) {
  if (live) return <span className="gx-chip"><span className="gx-dot gx-pulse" style={{ background: XC.ok }} />{c.live}</span>;
  if (seeded) return <span className="gx-chip" title="Illustrative showcase records"><span className="gx-dot" style={{ background: XC.gold }} />{c.demo}</span>;
  return null;
}

function Hud({ c, role, seeded, liveFeed, lang, setLang, mode, onHome, onDeck, onClassic, onSignOut, now }) {
  const R = ROLES[role];
  return (
    <header className="gx-hud">
      <img src="/brand/genveris-dark-transparent.png" alt="GenVeris" />
      <span className="gx-chip gx-hide-sm"><Command size={13} aria-hidden="true" />{c.workspace(R ? R.label : "")}</span>
      <ProvenanceChip live={liveFeed} seeded={seeded} c={c} />
      <span className="gx-spacer" />
      {now && <span className="gx-chip gx-hide-sm gx-mono" aria-label="Local time">{now}</span>}
      {mode === "deck"
        ? <button type="button" className="gx-btn" onClick={onHome}><Sparkles size={15} aria-hidden="true" /><span className="gx-hide-sm">{c.home}</span></button>
        : <button type="button" className="gx-btn" onClick={onDeck}><Orbit size={15} aria-hidden="true" /><span className="gx-hide-sm">{c.deck}</span></button>}
      <button type="button" className="gx-btn" onClick={onClassic}><LayoutGrid size={15} aria-hidden="true" /><span className="gx-hide-sm">{c.classic}</span></button>
      <button type="button" className="gx-btn gx-btn-icon" onClick={() => setLang(lang === "ar" ? "en" : "ar")} aria-label={lang === "ar" ? "English" : "العربية"} title={lang === "ar" ? "English" : "العربية"}><Languages size={16} aria-hidden="true" /></button>
      <button type="button" className="gx-btn gx-btn-icon" onClick={onSignOut} aria-label={c.signOut} title={c.signOut}><LogOut size={16} aria-hidden="true" /></button>
    </header>
  );
}

/* Voice is progressive enhancement: the mic only appears where the browser
   offers speech recognition. Nothing is recorded or sent anywhere but the
   same governed ask path as typed text. */
function useSpeech(lang, onText) {
  const recRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  useEffect(() => { setSupported(typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition)); }, []);
  const toggle = useCallback(() => {
    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) return;
    if (listening && recRef.current) { recRef.current.stop(); return; }
    const rec = new SR(); recRef.current = rec;
    rec.lang = lang === "ar" ? "ar-AE" : "en-US"; rec.interimResults = false; rec.maxAlternatives = 1;
    rec.onresult = e => { const t = e.results?.[0]?.[0]?.transcript; if (t) onText(t); };
    rec.onend = () => setListening(false); rec.onerror = () => setListening(false);
    setListening(true); rec.start();
  }, [lang, listening, onText]);
  return { supported, listening, toggle };
}

function AskBar({ c, lang, value, setValue, onSubmit, busy, big = true }) {
  const inputRef = useRef(null);
  const speech = useSpeech(lang, t => { setValue(t); onSubmit(t); });
  return (
    <form className="gx-ask" onSubmit={e => { e.preventDefault(); if (value.trim()) onSubmit(value); }} role="search" style={big ? null : { width: "100%" }}>
      <Sparkles size={18} color={XC.cyan} aria-hidden="true" style={{ flex: "none" }} />
      <input ref={inputRef} value={value} onChange={e => setValue(e.target.value)} placeholder={c.askPh} aria-label={c.help} maxLength={2000} autoFocus={big} />
      {speech.supported && (
        <button type="button" className="gx-btn gx-btn-icon" onClick={speech.toggle} aria-label={speech.listening ? c.micStop : c.mic} title={speech.listening ? c.micStop : c.mic}
          style={speech.listening ? { borderColor: XC.crit, color: XC.crit } : null}>
          {speech.listening ? <MicOff size={16} aria-hidden="true" /> : <Mic size={16} aria-hidden="true" />}
        </button>
      )}
      <button type="submit" className="gx-btn gx-btn-primary gx-btn-icon" aria-label={c.send} disabled={busy || !value.trim()} style={{ opacity: busy || !value.trim() ? 0.55 : 1 }}>
        <ArrowUp size={17} aria-hidden="true" />
      </button>
    </form>
  );
}

function AnswerPanel({ c, answer, onClose }) {
  const ref = useRef(null);
  useEffect(() => { if (answer) ref.current?.scrollIntoView?.({ block: "nearest", behavior: "smooth" }); }, [answer?.q, answer?.kind]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!answer) return null;
  const tone = answer.kind === "live" ? XC.ok : answer.kind === "blocked" ? XC.crit : XC.gold;
  const label = answer.kind === "live" ? c.liveAnswer : answer.kind === "blocked" ? c.blocked : answer.kind === "pending" ? c.thinking : c.simulated;
  return (
    <section ref={ref} className="gx-panel gx-answer gx-rise" aria-live="polite">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span className="gx-chip"><span className={`gx-dot ${answer.kind === "pending" ? "gx-pulse" : ""}`} style={{ background: answer.kind === "pending" ? XC.cyan : tone }} />{label}{answer.kind === "live" ? <Pv p="I" c={c} /> : null}</span>
        <span style={{ fontSize: 13, color: XC.mute, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>“{answer.q}”</span>
        <button type="button" className="gx-btn gx-btn-icon" onClick={onClose} aria-label={c.close} style={{ width: 32, height: 32 }}><X size={15} aria-hidden="true" /></button>
      </div>
      {answer.kind !== "pending" && <p>{answer.text}</p>}
      {answer.kind !== "pending" && <div style={{ marginTop: 12, fontSize: 11.5, color: XC.mute, letterSpacing: ".02em" }}>◆ {c.disclosure}</div>}
    </section>
  );
}

function IssueCard({ i, c, onOpen, onAsk, idx }) {
  const Icon = KIND_ICON[i.kind] || ShieldAlert;
  const col = SEV[i.severity] || XC.med;
  return (
    <article className="gx-panel gx-issue gx-rise" style={{ animationDelay: `${idx * 70}ms` }} aria-label={`${i.severity} — ${i.title}`}>
      <span className="gx-sev" style={{ background: col }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ display: "grid", placeItems: "center", width: 30, height: 30, borderRadius: 9, background: `${col}1f`, border: `1px solid ${col}55` }}><Icon size={15} color={col} aria-hidden="true" /></span>
        <span className="gx-label" style={{ color: col }}>{i.severity}</span>
        <span style={{ marginInlineStart: "auto", fontSize: 11.5, color: XC.mute, textTransform: "uppercase", letterSpacing: ".1em" }}>{i.kind}</span>
      </div>
      <h3>{i.title}</h3>
      <div className="why">{i.why}</div>
      <div className="gx-metric"><span style={{ fontSize: 12, color: XC.mute }}>{i.metric.label}{i.owner ? ` · ${i.owner}` : ""}</span><b>{i.metric.value}</b></div>
      <div className="gx-acts">
        <button type="button" className="gx-btn gx-btn-primary" onClick={() => onOpen(i.action)}>{i.action.label}<ChevronRight size={14} aria-hidden="true" /></button>
        <button type="button" className="gx-btn" onClick={() => onAsk(i.ask)}><Sparkles size={13} aria-hidden="true" />{c.askAbout}</button>
      </div>
    </article>
  );
}

/* ── Intelligence Home ──────────────────────────────────────────────────── */
function IntelligenceHome({ c, data, firstName, role, onOpen, onDeck, onClassic, ask, skipIntro, setSkipIntro, live, onWatchLive }) {
  const { q, setQ, answer, setAnswer, busy, submit } = ask;
  const n = data.issues.length;
  const [hour, setHour] = useState(null);
  useEffect(() => { setHour(new Date().getHours()); }, []);
  const greeting = hour == null ? "Hello" : greetingFor(hour);
  return (
    <>
      <section className="gx-hero">
        <div className="gx-core-bg"><CoreCanvas alert={data.summary.critical} /></div>
        <span className="gx-label gx-rise" style={{ position: "relative", color: XC.cyan }}>◆ {c.eyebrow}</span>
        <h1 className="gx-greet gx-rise" style={{ position: "relative", animationDelay: "80ms" }}>
          {ask.lang === "ar"
            ? <>{GREET_AR[greeting] || greeting}{firstName ? <>، <bdi><em>{firstName}</em></bdi></> : null}</>
            : <>{greeting}{firstName ? <>, <em>{firstName}.</em></> : "."}</>}
        </h1>
        <p className="gx-help gx-rise" style={{ position: "relative", animationDelay: "140ms" }}>{c.help}</p>
        <p className="gx-lead gx-rise" style={{ position: "relative", animationDelay: "200ms" }}>{c.burningLead(data.summary.total, n)}</p>
        <div className="gx-rise" style={{ position: "relative", width: "100%", animationDelay: "260ms" }}>
          <AskBar c={c} lang={ask.lang} value={q} setValue={setQ} onSubmit={submit} busy={busy} />
          <div className="gx-sugg" aria-label={c.suggestions}>
            {(ask.lang === "ar" ? SUGGEST_AR : (SUGGEST[role] || SUGGEST.caio)).map(s => <button type="button" key={s} onClick={() => submit(s)}>{s}</button>)}
          </div>
          <AnswerPanel c={c} answer={answer} onClose={() => setAnswer(null)} />
        </div>
      </section>

      <div className="gx-sec"><Radar size={18} color={XC.crit} aria-hidden="true" /><h2>{c.burning}</h2>
        {n > 0 && <span className="gx-chip gx-mono">{c.sevChip(data.summary.critical, data.summary.high)}</span>}<span className="gx-rule" /></div>
      {n > 0
        ? <div className="gx-issues">{data.issues.map((i, idx) => <IssueCard key={i.id} i={i} c={c} idx={idx} onOpen={onOpen} onAsk={submit} />)}</div>
        : <div className="gx-panel gx-empty"><CircleCheck size={26} color={XC.ok} aria-hidden="true" /><div style={{ fontFamily: SERIF, fontSize: 24, color: XC.ink, margin: "8px 0 6px" }}>{c.allClear}</div>{c.allClearSub}</div>}

      {live && <LiveRibbon c={c} live={live} onWatch={onWatchLive} />}

      <div className="gx-cta">
        <button type="button" className="gx-btn gx-btn-primary" onClick={onDeck}><Orbit size={18} aria-hidden="true" />{c.enterDeck}</button>
        <button type="button" className="gx-btn" onClick={onClassic}><LayoutGrid size={17} aria-hidden="true" />{c.classic}</button>
      </div>
      <div style={{ textAlign: "center" }}>
        <label className="gx-check"><input type="checkbox" checked={skipIntro} onChange={e => setSkipIntro(e.target.checked)} />{c.skip}</label>
      </div>
    </>
  );
}

/* ── Command Deck ───────────────────────────────────────────────────────
   One environment, five lenses on the same governed records:
   Briefs (what changed and what to do), Decisions (your approval queue as
   decision workspaces), Estate (what depends on what), Instruments (the
   classic panels, for analysis) and Live Security (the Enforce lens).
   Every claim carries a provenance mark, and every record opens its source. */
const PV_TONE = { O: XC.pO, C: XC.pC, I: XC.pI, R: XC.pR, D: XC.pD, E: XC.pE };
const UNC_TONE = { low: XC.ok, medium: XC.med, high: XC.high };

function Pv({ p, c }) {
  if (!p) return null;
  return <span className="gx-pv" style={{ color: PV_TONE[p] }} title={c.pv[p]} aria-label={c.pv[p]}>{p}</span>;
}
function Claims({ list, c }) {
  return <>{list.map(([t, p], k) => <span key={k}>{k ? " " : ""}<bdi className="gx-claim">{t}</bdi><Pv p={p} c={c} /></span>)}</>;
}
function Legend({ c }) {
  return (
    <div className="gx-legend" aria-label="Provenance">
      {["O", "C", "I", "R", "D", "E"].map(p => <span key={p} title={p === "E" ? c.eNote : undefined}><Pv p={p} c={c} />{c.pv[p]}</span>)}
    </div>
  );
}
function Unc({ level, c }) {
  const n = level === "low" ? 1 : level === "medium" ? 2 : 3;
  const col = UNC_TONE[level] || XC.mute;
  return <><span className="gx-unc" aria-hidden="true">{[0, 1, 2].map(i => <i key={i} style={i < n ? { background: col } : null} />)}</span><b style={{ color: col, fontWeight: 700 }}>{c.unc[level] || level}</b></>;
}

/* Evidence lens: the record behind a claim, as recorded, without leaving the deck. */
function EvidenceLens({ c, ev, seeded, onClose, onOpen }) {
  const closeRef = useRef(null);
  useEffect(() => {
    if (!ev) return;
    closeRef.current?.focus();
    const k = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [ev, onClose]);
  if (!ev) return null;
  return (
    <>
      <div className="gx-scrim" onClick={onClose} aria-hidden="true" />
      <aside className="gx-lens" role="dialog" aria-modal="true" aria-label={c.lens} data-testid="gx-lens">
        <header>
          <FileSearch size={16} color={XC.electric} aria-hidden="true" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="gx-label">{c.lens}</div>
            <div style={{ fontWeight: 800, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.title}</div>
          </div>
          <button ref={closeRef} type="button" className="gx-btn gx-btn-icon" onClick={onClose} aria-label={c.close} style={{ width: 32, height: 32 }}><X size={15} aria-hidden="true" /></button>
        </header>
        <div className="body">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span className="gx-chip"><Pv p="O" c={c} />{c.pv.O}</span>
            {seeded && <span className="gx-chip"><span className="gx-dot" style={{ background: XC.gold }} />{c.demo}</span>}
          </div>
          <dl className="gx-kv">
            <dt>{c.lensSource}</dt><dd>{ev.source}</dd>
            <dt>{c.lensRecord}</dt><dd className="gx-mono">{ev.ref}</dd>
            {ev.facts.map(([k, v]) => <div key={k} style={{ display: "contents" }}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
          <div className="gx-note">{c.lensNote}</div>
          {ev.action && <div className="gx-acts"><button type="button" className="gx-btn" onClick={() => { onClose(); onOpen(ev.action); }}>{c.openSource}<ChevronRight size={14} aria-hidden="true" /></button></div>}
        </div>
      </aside>
    </>
  );
}

function BriefCard({ b, c, open, onToggle, onLens, onOpen, onAsk }) {
  const col = SEV[b.severity] || XC.med;
  const Icon = KIND_ICON[b.kind] || ShieldAlert;
  return (
    <article className="gx-panel gx-brief" data-open={open} data-testid="gx-brief">
      <button type="button" className="gx-brief-h" aria-expanded={open} onClick={onToggle}>
        <span className="gx-sevbar" style={{ background: col }} aria-hidden="true" />
        <span style={{ minWidth: 0 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: XC.mute }}>
            <Icon size={13} color={col} aria-hidden="true" /><span style={{ color: col, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", fontSize: 11 }}>{c.sev[b.severity] || b.severity}</span>
            <span>· <bdi>{b.evidence.source}</bdi></span>
          </span>
          <h3 dir="auto">{b.title}</h3>
        </span>
        <ChevronDown size={18} color={XC.mute} aria-hidden="true" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
      </button>
      {open && (
        <>
          <div className="gx-six">
            <div><b>{c.q.changed}</b><span><Claims list={b.changed} c={c} /></span></div>
            <div><b>{c.q.matters}</b><span><Claims list={b.matters} c={c} /></span></div>
            <div><b>{c.q.evidence}</b><span><button type="button" className="gx-linkbtn" dir="auto" onClick={() => onLens(b)}>{b.evidence.source} · {b.evidence.ref}</button></span></div>
            <div><b>{c.q.unc}</b><span><Unc level={b.uncertainty.level} c={c} /> — <bdi>{b.uncertainty.why}</bdi></span></div>
            <div><b>{c.q.who}</b><bdi style={b.ownerMissing ? { color: XC.crit, fontWeight: 700 } : { color: XC.ink }}>{b.who}</bdi></div>
            <div><b>{c.q.action}</b><span className="gx-acts">
              <button type="button" className="gx-btn gx-btn-primary" onClick={() => onOpen(b.action)}>{b.action.label}<ChevronRight size={14} aria-hidden="true" /></button>
              {b.ask && <button type="button" className="gx-btn" onClick={() => onAsk(b.ask)}><Sparkles size={13} aria-hidden="true" />{c.askAbout}</button>}
            </span></div>
          </div>
          <div className="gx-why" dir="auto">{b.shownBecause}</div>
        </>
      )}
    </article>
  );
}

function BriefsView({ c, data, onOpen, onLens, ask, live, onWatchLive }) {
  const [open, setOpen] = useState(data.briefs[0]?.id || null);
  const s = data.summary;
  return (
    <div className="gx-two">
      <div className="gx-col">
        <div style={{ fontSize: 14, color: XC.silver }}>{c.briefsLead(data.briefs.length, s.critical, s.high)}</div>
        {data.briefs.length
          ? data.briefs.map(b => <BriefCard key={b.id} b={b} c={c} open={open === b.id} onToggle={() => setOpen(open === b.id ? null : b.id)}
              onLens={onLens} onOpen={onOpen} onAsk={ask.submit} />)
          : <div className="gx-panel gx-empty"><CircleCheck size={26} color={XC.ok} aria-hidden="true" /><div style={{ fontFamily: SERIF, fontSize: 24, color: XC.ink, margin: "8px 0 6px" }}>{c.allClear}</div>{c.allClearSub}</div>}
      </div>
      <aside className="gx-col">
        <section className="gx-panel gx-card">
          <div className="gx-card-h"><Radar size={15} color={XC.electric} aria-hidden="true" /><span className="gx-label">{c.watch}</span></div>
          {[["critical", s.critical], ["high", s.high], ["medium", s.medium]].map(([k, v]) => (
            <div key={k} className="gx-row"><span className="gx-dot" style={{ background: SEV[k] }} /><span style={{ flex: 1 }}>{c.sev[k]}</span><b className="gx-mono">{v}</b></div>
          ))}
          <p style={{ fontSize: 12.5, color: XC.mute, lineHeight: 1.5, margin: "10px 0 0" }}>{c.quiet}</p>
        </section>
        <section className="gx-panel gx-card">
          <div className="gx-card-h"><ListChecks size={15} color={XC.electric} aria-hidden="true" /><span className="gx-label">{c.tabDecisions}</span></div>
          <div style={{ fontSize: 13, color: XC.silver }}>{c.decisionsLead(data.approvals.length)}</div>
        </section>
        {live && (
          <section className="gx-panel gx-card">
            <div className="gx-card-h"><LiveBadge c={c} /></div>
            <div style={{ fontSize: 13, color: XC.silver }}>{c.ribbon(AI_AGENTS.length, live.st.counts.block, live.st.counts.escalate)}</div>
            <div className="gx-acts" style={{ marginTop: 10 }}><button type="button" className="gx-btn" onClick={onWatchLive}><ShieldCheck size={14} aria-hidden="true" />{c.watchLive}</button></div>
          </section>
        )}
      </aside>
    </div>
  );
}

/* Decision workspaces over the role's real approval queue. Deciding stays in
   the approvals workspace (recorded under the person, on the audit chain);
   this view separates what was prepared from what is yours to decide. */
function DecisionsView({ c, data, role, onOpen, ask }) {
  const list = data.approvals;
  const [sel, setSel] = useState(list[0]?.id || null);
  const d = list.find(x => x.id === sel) || list[0];
  const R = ROLES[role];
  if (!d) return <div className="gx-panel gx-empty" style={{ marginTop: 16 }}><CircleCheck size={26} color={XC.ok} aria-hidden="true" /><div style={{ marginTop: 8 }}>{c.decisionsLead(0)}</div></div>;
  const conf = typeof d.conf === "number" ? d.conf : null;
  const level = conf == null ? "medium" : conf >= 85 ? "low" : conf >= 70 ? "medium" : "high";
  return (
    <div className="gx-dec">
      <div className="gx-dlist" role="list">
        <div style={{ fontSize: 13, color: XC.silver, marginBottom: 2 }}>{c.decisionsLead(list.length)}</div>
        {list.map(x => (
          <button key={x.id} type="button" role="listitem" aria-current={x.id === d.id} onClick={() => setSel(x.id)}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 11.5, color: XC.mute }}>
              <span className="gx-dot" style={{ background: SEV[String(x.risk).toLowerCase()] || XC.med }} />{x.risk} · {x.time}
            </div>
            <div style={{ fontWeight: 700, fontSize: 13.5, marginTop: 4, lineHeight: 1.35 }}>{String(x.title).trim()}</div>
          </button>
        ))}
      </div>
      <article className="gx-panel gx-ws" data-testid="gx-decision">
        <section>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span className="gx-chip" style={{ color: XC.gold }}><span className="gx-dot" style={{ background: XC.gold }} />{c.awaitingYou}</span>
            <span className="gx-chip">{c.tier} · {d.risk}</span>
            <span className="gx-chip">{c.timing} · {d.time}</span>
          </div>
          <h3>{String(d.title).trim()}<Pv p="O" c={c} /></h3>
        </section>
        <section>
          <div className="gx-label" style={{ color: XC.gold }}>{c.recommendation}</div>
          <p style={{ margin: "8px 0 0", fontSize: 14.5, color: XC.ink, lineHeight: 1.55 }}>{d.action}<Pv p="R" c={c} /></p>
          <div className="gx-grid2" style={{ marginTop: 12 }}>
            <div><div className="gx-label">{c.reasoning}</div><p style={{ margin: "6px 0 0", fontSize: 13.5, color: XC.silver, lineHeight: 1.5 }}>{d.reasoning}<Pv p="I" c={c} /></p></div>
            <div><div className="gx-label">{c.confidence}</div><p style={{ margin: "6px 0 0", fontSize: 13.5, color: XC.silver }}><Unc level={level} c={c} />{conf != null ? <span className="gx-mono"> · {conf}%</span> : null}<Pv p="I" c={c} /></p></div>
          </div>
        </section>
        <section className="gx-grid2">
          <div><div className="gx-label">{c.policyClause}</div><p style={{ margin: "6px 0 0", fontSize: 13.5, color: XC.ink }}>{d.clause}<Pv p="O" c={c} /></p></div>
          <div><div className="gx-label">{c.authority}</div><p style={{ margin: "6px 0 0", fontSize: 13.5, color: XC.silver, lineHeight: 1.5 }}>{c.authorityText(R ? R.label : String(role).toUpperCase())}<Pv p="C" c={c} /></p></div>
        </section>
        <section>
          <div className="gx-label" style={{ marginBottom: 8 }}>{c.safeguards}</div>
          <div style={{ display: "grid", gap: 8 }}>
            <div className="gx-note">{c.safeguard}</div>
            <div className="gx-note warn"><Pv p="E" c={c} /> {c.notEnforced}</div>
          </div>
        </section>
        <section className="gx-acts">
          <button type="button" className="gx-btn gx-btn-gold" onClick={() => onOpen({ nav: { type: "approval" } })}><Gavel size={14} aria-hidden="true" />{c.decideIn}<ChevronRight size={14} aria-hidden="true" /></button>
          <button type="button" className="gx-btn" onClick={() => ask.submit(`Summarise the decision "${String(d.title).trim()}" and what I should weigh before approving.`)}><Sparkles size={13} aria-hidden="true" />{c.askAbout}</button>
        </section>
      </article>
    </div>
  );
}

/* Estate: layered dependency map with impact on selection. */
const COLS = LAYERS; // model · data · agent · system
const trunc = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
function EstateView({ c, data }) {
  const est = data.estate;
  const [sel, setSel] = useState(null);
  const byId = useMemo(() => new Map(est.nodes.map(n => [n.id, n])), [est]);
  const layout = useMemo(() => {
    const W = 1000, colW = W / COLS.length, nodeW = 196, rowH = 46, top = 56;
    const pos = {};
    let rows = 0;
    COLS.forEach((t, ci) => {
      const ns = est.nodes.filter(n => n.type === t).sort((a, b) => a.label.localeCompare(b.label));
      rows = Math.max(rows, ns.length);
      ns.forEach((n, ri) => { pos[n.id] = { x: ci * colW + (colW - nodeW) / 2, y: top + ri * rowH, w: nodeW, h: 36 }; });
    });
    return { W, H: top + rows * rowH + 16, pos, colW };
  }, [est]);
  if (!est.nodes.length) return <div className="gx-panel gx-empty" style={{ marginTop: 16 }}>{c.awaiting}</div>;
  const imp = sel ? impactOf(est, sel) : null;
  const hit = imp ? new Set([sel, ...imp.affected]) : null;
  const dep = est.edges.filter(e => e.kind === "dep" && layout.pos[e.from] && layout.pos[e.to]);
  const onPath = e => imp && hit.has(e.from) && hit.has(e.to);
  const govCount = id => { const g = governanceOf(est, id); return ["risk", "incident"].map(t => g[t]?.length ? `${g[t].length} ${t === "risk" ? "risk" : "inc"}` : "").filter(Boolean).join(" · "); };
  const node = byId.get(sel);
  const pick = t => est.nodes.find(n => n.type === t)?.id;
  return (
    <>
      <p style={{ fontSize: 14, color: XC.silver, margin: "16px 0 0", maxWidth: "80ch" }}>{c.estateLead}</p>
      <div className="gx-estate">
        <div className="gx-gwrap">
          <svg viewBox={`0 0 ${layout.W} ${layout.H}`} role="img" aria-label={c.tabEstate} data-testid="gx-estate">
            {COLS.map((t, i) => <text key={t} className="gx-glabel" x={i * layout.colW + (layout.colW - 196) / 2} y="32">{c.layer[t].toUpperCase()}</text>)}
            {dep.map(e => {
              const a = layout.pos[e.to], b = layout.pos[e.from];
              const [x1, y1, x2, y2] = a.x < b.x ? [a.x + a.w, a.y + a.h / 2, b.x, b.y + b.h / 2] : [a.x, a.y + a.h / 2, b.x + b.w, b.y + b.h / 2];
              const mx = (x1 + x2) / 2;
              const cls = imp ? (onPath(e) ? "hit" : "dim") : "";
              return <path key={`${e.from}-${e.to}`} className={`gx-gedge ${cls}`} d={`M${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}><title>{`${byId.get(e.from)?.label} ${e.rel} ${byId.get(e.to)?.label}`}</title></path>;
            })}
            {est.nodes.filter(n => layout.pos[n.id]).map(n => {
              const p = layout.pos[n.id];
              const cls = sel === n.id ? "sel" : imp ? (hit.has(n.id) ? "hit" : "dim") : "";
              const sub = n.type === "system" ? govCount(n.id) : n.type === "agent" ? (n.record?.owner || "") : "";
              return (
                <g key={n.id} className={`gx-gnode ${cls}`} tabIndex={0} role="button" aria-pressed={sel === n.id} aria-label={`${c.layer[n.type]}: ${n.label}`}
                  onClick={() => setSel(sel === n.id ? null : n.id)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSel(sel === n.id ? null : n.id); } }}>
                  <rect x={p.x} y={p.y} width={p.w} height={p.h} rx="9" />
                  <text className="t" x={p.x + 10} y={p.y + (sub ? 15 : 22)}>{trunc(n.label, 28)}</text>
                  {sub && <text className="s" x={p.x + 10} y={p.y + 28}>{trunc(sub, 32)}</text>}
                  <title>{n.label}</title>
                </g>
              );
            })}
          </svg>
        </div>
        <aside className="gx-panel gx-card" aria-live="polite">
          {!node ? (
            <>
              <div className="gx-card-h"><Network size={15} color={XC.electric} aria-hidden="true" /><span className="gx-label">{c.impact}</span></div>
              <p style={{ fontSize: 13.5, color: XC.silver, margin: 0 }}>{c.pickHint}</p>
              <div className="gx-acts" style={{ marginTop: 12 }}>
                {["model", "data", "agent"].map(t => pick(t) && <button key={t} type="button" className="gx-btn" onClick={() => setSel(pick(t))}>{trunc(byId.get(pick(t)).label, 22)}</button>)}
              </div>
              <div className="gx-note" style={{ marginTop: 14 }}>{c.estateNote}</div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="gx-label">{c.layer[node.type]}</span><span className="gx-spacer" />
                <button type="button" className="gx-btn" style={{ height: 30, fontSize: 12 }} onClick={() => setSel(null)}>{c.clear}</button>
              </div>
              <h3 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 22, margin: "6px 0 10px", lineHeight: 1.2 }}>{node.label}<Pv p="O" c={c} /></h3>
              <EstateRelations c={c} est={est} byId={byId} id={node.id} />
              <div className="gx-label" style={{ margin: "14px 0 8px" }}>{c.impact} · {c.affected} <Pv p="C" c={c} /></div>
              {imp.affected.length ? (
                <div className="gx-ilist">
                  {COLS.map(t => {
                    const ids = imp.affected.filter(x => byId.get(x)?.type === t);
                    if (!ids.length) return null;
                    return <div key={t}><b>{c.layer[t]} · {ids.length}</b>{ids.map(x => {
                      const path = imp.paths[x] || [];
                      const last = path[path.length - 1];
                      const via = last?.exposed ? `read by ${byId.get(last.from)?.label}` : path.slice(0, -1).map(e => byId.get(e.from)?.label).filter(Boolean).reverse().join(", ");
                      return <span key={x} style={{ display: "block" }}>{byId.get(x).label}{via ? <span style={{ color: XC.mute }}> · {last?.exposed ? via : `via ${via}`}</span> : null}</span>;
                    })}</div>;
                  })}
                </div>
              ) : <div style={{ fontSize: 13, color: XC.mute }}>{c.noImpact}</div>}
              {imp.governance.length > 0 && (
                <>
                  <div className="gx-label" style={{ margin: "14px 0 8px" }}>{c.govAttached}</div>
                  <div className="gx-ilist">
                    {["incident", "risk", "kri", "control", "policy"].map(t => {
                      const ids = imp.governance.filter(x => byId.get(x)?.type === t);
                      if (!ids.length) return null;
                      return <div key={t}><b>{c.gtype[t]} · {ids.length}</b>{ids.slice(0, 6).map(x => <span key={x} style={{ display: "block" }}>{byId.get(x).label}</span>)}{ids.length > 6 ? <span style={{ color: XC.mute }}>+{ids.length - 6}</span> : null}</div>;
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </aside>
      </div>
    </>
  );
}
function EstateRelations({ c, est, byId, id }) {
  const deps = est.edges.filter(e => e.kind === "dep" && e.from === id).map(e => `${e.rel} ${byId.get(e.to)?.label}`);
  const users = est.edges.filter(e => e.kind === "dep" && e.to === id).map(e => byId.get(e.from)?.label);
  const g = governanceOf(est, id);
  return (
    <div style={{ display: "grid", gap: 6, fontSize: 13, color: XC.silver }}>
      {deps.length > 0 && <div><b style={{ color: XC.ink }}>{c.dependsOn}:</b> {deps.join("; ")}</div>}
      {users.length > 0 && <div><b style={{ color: XC.ink }}>{c.usedBy}:</b> {users.join("; ")}</div>}
      {Object.keys(g).length > 0 && <div><b style={{ color: XC.ink }}>{c.attached}:</b> {Object.entries(g).map(([t, ns]) => `${ns.length} ${c.gtype[t].toLowerCase()}`).join(" · ")}</div>}
    </div>
  );
}

/* ── Instruments: the classic panels, kept for analysis ── */
function planesFor(data, c) {
  const cov = data.assurance.length ? Math.round(data.assurance.reduce((s, a) => s + a.score, 0) / data.assurance.length) : null;
  const blocks = data.decisions.block || 0, masks = data.decisions.mask || 0;
  return [
    { id: "portfolio", name: "Portfolio", icon: Layers, metric: data.initiatives.length ? `${data.initiatives.length} live` : c.awaiting, tone: XC.electric,
      dest: { nav: { type: "portfolio" } }, ask: "Give me a portfolio brief: which initiatives to scale, continue, improve or retire?",
      rows: [["Initiatives in flight", data.initiatives.length], ["Blocked at a gate", data.initiatives.filter(i => i.blockedBy).length], ["Lifecycle phases", AC_PHASES.length]],
      note: "Every AI initiative moves through one 13-phase lifecycle with evidence-gated phases." },
    { id: "risk", name: "Risk", icon: ShieldAlert, metric: data.openRisks.length ? `${data.openRisks.length} high+` : (data.initiatives.length ? "0 high+" : c.awaiting), tone: data.openRisks.length ? XC.crit : XC.ok,
      dest: { nav: { type: "risk" } }, ask: "What are my top residual AI risks and who owns each treatment?",
      rows: [["High/critical open", data.openRisks.length], ["Critical", data.openRisks.filter(r => /crit/i.test(r.level)).length], ["KRIs breached", data.allIssues.filter(i => i.kind === "kri").length]],
      note: "Residual risk moves with treatment progress — the register, not a slide, is the source." },
    { id: "compliance", name: "Compliance", icon: Scale, metric: cov != null ? `${cov}% cov.` : c.awaiting, tone: cov != null && cov < 85 ? XC.high : XC.ok,
      dest: { nav: { type: "compliance" } }, ask: "Which compliance gaps move our control coverage most for the least effort?",
      rows: data.assurance.map(a => [a.name, `${a.score}%`]), note: c.notClaim },
    { id: "runtime", name: "Runtime", icon: ShieldCheck, metric: data.events.length ? `${blocks} blocked` : c.awaiting, tone: blocks ? XC.high : XC.cyan,
      dest: { tab: "ledger" }, ask: "Summarise what the AI gateway blocked and masked recently, and why.",
      rows: [["Governed inferences", data.events.length], ["Masked at boundary", masks], ["Blocked by policy", blocks]],
      note: "Every model call is classified, masked or blocked at the boundary and logged to the Article 12 chain." },
    { id: "agents", name: "Agents", icon: Bot, metric: `${data.agentsAvail.length}/${AGENT_REGISTRY.length} on`, tone: XC.gold,
      dest: { tab: "aicentral", view: "agents" }, ask: "Which governed agents are running and what are they waiting on me for?",
      rows: [["Available", data.agentsAvail.length], ["Planned", AGENT_REGISTRY.length - data.agentsAvail.length], ["Human-in-the-loop", "Always for propose / act"]],
      note: c.hitl },
    { id: "evidence", name: "Evidence", icon: FileWarning, metric: data.stale.length ? `${data.stale.length} due` : (data.initiatives.length ? "fresh" : c.awaiting), tone: data.stale.length ? XC.med : XC.ok,
      dest: { tab: "freshness" }, ask: "Which evidence is stale or due, and what does refreshing it take?",
      rows: [["Stale", data.stale.filter(e => e.freshness === "stale").length], ["Due soon", data.stale.filter(e => e.freshness === "due").length], ["Chain", data.intact == null ? "—" : data.intact ? "verified" : "broken"]],
      note: "Governance that was true last year is not evidence today." },
  ];
}

function DrillPanel({ c, plane, onOpen, onAsk, onClose }) {
  if (!plane) return null;
  const Icon = plane.icon;
  return (
    <section className="gx-panel gx-drill" aria-label={`${plane.name} detail`}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <Icon size={17} color={plane.tone} aria-hidden="true" />
        <h3 style={{ margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: 22 }}>{plane.name}</h3>
        <span className="gx-spacer" />
        <button type="button" className="gx-btn gx-btn-icon" onClick={onClose} aria-label={c.close} style={{ width: 32, height: 32 }}><X size={15} aria-hidden="true" /></button>
      </div>
      {plane.rows.map(([k, v]) => <div key={k} className="gx-row"><span style={{ color: XC.silver, flex: 1 }}>{k}</span><b className="gx-mono">{v}</b></div>)}
      <p style={{ fontSize: 13, color: XC.mute, lineHeight: 1.5, margin: "10px 0 14px" }}>{plane.note}</p>
      <div className="gx-acts">
        <button type="button" className="gx-btn gx-btn-primary" onClick={() => onOpen(plane.dest)}>{c.openClassic}<ChevronRight size={14} aria-hidden="true" /></button>
        <button type="button" className="gx-btn" onClick={() => onAsk(plane.ask)}><Sparkles size={13} aria-hidden="true" />{c.askVeris}</button>
      </div>
    </section>
  );
}

function SpendGauge({ c, cost, rows }) {
  const util = cost ? cost.utilization : null;
  const pct = util == null ? 0 : Math.min(util, 140) / 140;
  const col = util == null ? XC.mute : util >= 100 ? XC.crit : util >= 85 ? XC.high : XC.ok;
  const A0 = 200, SWEEP = 140;
  const arc = (r, a0, a1) => {
    const p = a => [50 + r * Math.cos(a * Math.PI / 180), 55 + r * Math.sin(a * Math.PI / 180)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    return `M${x0} ${y0} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
  };
  return (
    <section className="gx-panel gx-card">
      <div className="gx-card-h"><Wallet size={15} color={XC.electric} aria-hidden="true" /><span className="gx-label">{c.spend}</span><span className="gx-spacer" /><Pv p="C" c={c} /></div>
      {cost ? <>
        <svg viewBox="0 0 100 62" role="img" aria-label={`${util}% of budget used`} style={{ width: "100%", display: "block" }}>
          <path d={arc(40, A0, A0 + SWEEP)} stroke={XC.raised} strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d={arc(40, A0, A0 + Math.max(2, SWEEP * pct))} stroke={col} strokeWidth="7" fill="none" strokeLinecap="round" />
          <text x="50" y="46" textAnchor="middle" fill={XC.ink} style={{ font: `400 15px ${SERIF}` }}>{fmtUSD(cost.costMtd)}</text>
          <text x="50" y="56" textAnchor="middle" fill={XC.silver} style={{ font: `700 4.6px ${SANS}`, letterSpacing: ".1em" }}>{util}% {c.of.toUpperCase()}</text>
        </svg>
        <div className="gx-row"><span style={{ color: XC.silver, flex: 1 }}>Tokens</span><b className="gx-mono">{fmtTokens(cost.tokensMtd)}</b></div>
        {rows.filter(r => r.overBudget).slice(0, 2).map(r => (
          <div key={r.id} className="gx-row"><span className="gx-dot" style={{ background: XC.crit }} /><span style={{ flex: 1 }}>{r.name}</span><b className="gx-mono" style={{ color: XC.crit }}>{r.utilization}%</b></div>
        ))}
      </> : <div className="gx-empty" style={{ padding: 12 }}>{c.awaiting}</div>}
    </section>
  );
}

function AssurancePanel({ c, data }) {
  return (
    <section className="gx-panel gx-card">
      <div className="gx-card-h"><ShieldCheck size={15} color={XC.electric} aria-hidden="true" /><span className="gx-label">{c.assurance}</span><span className="gx-spacer" /><Pv p="C" c={c} /></div>
      {data.assurance.length ? <>
        {data.assurance.map(a => {
          const col = a.score >= 85 ? XC.ok : a.score >= 70 ? XC.med : XC.high;
          return (
            <div key={a.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}><span>{a.name}</span><b className="gx-mono" style={{ color: col }}>{a.score}%</b></div>
              <div className="gx-bar"><i style={{ width: `${a.score}%`, background: col }} /></div>
              <div style={{ fontSize: 11.5, color: XC.mute, marginTop: 5 }}>{a.met} met · {a.partial} partial · {a.gap} gap</div>
            </div>
          );
        })}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 6, marginTop: 4 }}>
          {data.nistFns.map(f => {
            const full = f.met === f.total;
            return <div key={f.fn} style={{ textAlign: "center", padding: "8px 4px", borderRadius: 10, border: `1px solid ${XC.line}`, background: XC.sunk }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: XC.silver }}>{f.fn}</div>
              <div className="gx-mono" style={{ fontSize: 12.5, color: full ? XC.ok : XC.med, marginTop: 3 }}>{f.met}/{f.total}</div>
            </div>;
          })}
        </div>
        <div style={{ fontSize: 11.5, color: XC.mute, marginTop: 10 }}>{c.notClaim}</div>
      </> : <div className="gx-empty" style={{ padding: 12 }}>{c.awaiting}</div>}
    </section>
  );
}

function AgentConstellation({ c }) {
  return (
    <section className="gx-panel gx-card">
      <div className="gx-card-h"><Bot size={15} color={XC.electric} aria-hidden="true" /><span className="gx-label">{c.agents}</span></div>
      {AGENT_REGISTRY.map(a => {
        const on = a.status === "available";
        return (
          <div key={a.id} className="gx-row">
            <span className="gx-dot" style={{ background: on ? XC.ok : XC.lineHi }} />
            <span style={{ flex: 1, minWidth: 0, color: on ? XC.ink : XC.mute, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</span>
            <span className="gx-chip" style={{ height: 22, fontSize: 11, padding: "0 8px", color: a.actionClass === "monitor" ? XC.silver : XC.gold }}>{a.actionClass}</span>
          </div>
        );
      })}
      <div style={{ fontSize: 11.5, color: XC.mute, marginTop: 8 }}>{c.hitl}</div>
    </section>
  );
}

const DECISION_TONE = { allow: XC.ok, mask: XC.med, block: XC.crit, escalate: XC.high };
function LiveFeed({ c, events, live }) {
  const rows = events.slice(-8).reverse();
  return (
    <section className="gx-panel gx-card">
      <div className="gx-card-h"><Activity size={15} color={XC.electric} aria-hidden="true" /><span className="gx-label">{c.feed}</span><span className="gx-spacer" /><Pv p="O" c={c} />{live && <span className="gx-dot gx-pulse" style={{ background: XC.ok }} />}</div>
      {rows.length ? rows.map((e, k) => {
        const d = String(e.decision || e.action || "").replace(/^inference:/, "");
        return (
          <div key={e.id || k} className="gx-row" style={{ alignItems: "flex-start" }}>
            <span className="gx-mono" style={{ fontSize: 11.5, color: XC.mute, flex: "none", width: 44 }}>{String(e.ts || e.createdAt || "").slice(11, 16) || "—"}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.tool || e.entity || "inference"}{e.agent ? <span style={{ color: XC.mute }}> · {e.agent}</span> : null}</span>
              <span style={{ display: "block", fontSize: 12, color: XC.mute, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.detail || e.dataClass || ""}</span>
            </span>
            <span className="gx-chip" style={{ height: 22, fontSize: 11, padding: "0 8px", color: DECISION_TONE[d] || XC.silver }}>{d || "—"}</span>
          </div>
        );
      }) : <div className="gx-empty" style={{ padding: 12 }}>{c.awaiting}</div>}
    </section>
  );
}

function ChainStrip({ c, events, intact }) {
  const blocks = events.slice(-4);
  return (
    <section className="gx-panel gx-card">
      <div className="gx-card-h"><Link2 size={15} color={XC.electric} aria-hidden="true" /><span className="gx-label">{c.chain}</span><span className="gx-spacer" />
        {intact != null && <span className="gx-chip" style={{ color: intact ? XC.ok : XC.crit }}>{intact ? <CircleCheck size={13} aria-hidden="true" /> : <ShieldAlert size={13} aria-hidden="true" />}{intact ? c.verified : c.broken}</span>}</div>
      {blocks.length ? (
        <div className="gx-chainrow">
          {blocks.map((e, k) => (
            <div key={e.id || k} style={{ display: "contents" }}>
              {k > 0 && <span className="gx-link" aria-hidden="true"><Link2 size={16} /></span>}
              <div className="gx-blk">
                <div className="gx-mono" style={{ fontSize: 11.5, color: XC.mute }}>#{e.seq ?? k + 1} · {String(e.ts || e.createdAt || "").slice(11, 19)}</div>
                <div style={{ fontSize: 13, fontWeight: 700, margin: "6px 0 4px" }}>{(e.decision || e.action || "event").toString()} · {e.tool || e.entity || "inference"}</div>
                <div style={{ fontSize: 12, color: XC.silver }}>{e.dataClass || ""}{e.model ? ` · ${e.model}` : ""}</div>
                <div className="gx-mono" style={{ fontSize: 11.5, color: XC.electric, marginTop: 8 }}>hash {String(e.hash || "").slice(0, 10) || "—"}…</div>
              </div>
            </div>
          ))}
        </div>
      ) : <div className="gx-empty" style={{ padding: 12 }}>{c.awaiting}</div>}
    </section>
  );
}

function Lifecycle({ c, initiatives }) {
  return (
    <section className="gx-panel gx-card">
      <div className="gx-card-h"><Workflow size={15} color={XC.electric} aria-hidden="true" /><span className="gx-label">{c.lifecycle}</span></div>
      <div className="gx-pipe">
        {AC_PHASES.map((ph, idx) => {
          const here = initiatives.filter(i => i.phaseIndex === idx);
          const blocked = here.some(i => i.blockedBy);
          const col = here.length ? (blocked ? XC.high : XC.blue) : null;
          const tip = here.length ? here.map(i => `${i.name}${i.blockedBy ? ` — blocked: ${i.blockedBy}` : ""}`).join("\n") : ph.objective;
          return (
            <div key={ph.id} className="gx-ph" title={tip} aria-label={`${ph.name}: ${here.length} initiative(s)${blocked ? ", blocked at gate" : ""}`}>
              <span className={`pn ${idx % 2 ? "up" : "dn"} ${here.length ? "on" : ""}`}>{ph.name}</span>
              <span className={`pt ${here.length ? "on" : ""}`} style={col ? { background: col, borderColor: col } : null}>{here.length || ""}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Instruments({ c, data, onOpen, ask }) {
  const [selected, setSelected] = useState(null);
  const planes = planesFor(data, c);
  const plane = selected ? planes.find(p => p.id === selected) : null;
  const kpis = [
    [c.scoreL, data.initiatives.length ? GOVERNANCE_SCORE : "—", XC.ink, "C"],
    [c.inFlight, data.initiatives.length, XC.electric, "O"], [c.openRisks, data.openRisks.length, data.openRisks.length ? XC.crit : XC.ok, "O"],
    [c.approvals, data.approvals.length, data.approvals.length ? XC.gold : XC.ok, "O"], [c.agentsOn, data.agentsAvail.length, XC.cyan, "O"],
    [c.burningN, data.summary.total, data.summary.critical ? XC.crit : XC.ok, "C"],
  ];
  return (
    <>
      <p style={{ fontSize: 14, color: XC.silver, margin: "16px 0 0" }}>{c.instrumentsLead}</p>
      <div className="gx-kpis">
        {kpis.map(([k, v, col, p]) => <div key={k} className="gx-panel gx-kpi"><span style={{ fontSize: 11.5, color: XC.mute }}>{k}<Pv p={p} c={c} /></span><b style={{ color: col }}>{v}</b></div>)}
      </div>
      <div className="gx-instr">
        <div className="gx-col">
          <section className="gx-panel gx-card">
            <div className="gx-card-h"><Boxes size={15} color={XC.electric} aria-hidden="true" /><span className="gx-label">{c.planes}</span></div>
            <div className="gx-planes">
              {planes.map(p => { const Icon = p.icon; return (
                <button key={p.id} type="button" aria-pressed={selected === p.id} onClick={() => setSelected(selected === p.id ? null : p.id)}>
                  <span className="nm"><Icon size={14} color={p.tone} aria-hidden="true" />{p.name}</span><span className="mv">{p.metric}</span>
                </button>); })}
            </div>
            <DrillPanel c={c} plane={plane} onOpen={onOpen} onAsk={ask.submit} onClose={() => setSelected(null)} />
          </section>
          <Lifecycle c={c} initiatives={data.initiatives} />
          <ChainStrip c={c} events={data.events} intact={data.intact} />
          <LiveFeed c={c} events={data.events} live={data.liveFeed} />
        </div>
        <div className="gx-col">
          <SpendGauge c={c} cost={data.cost} rows={data.spendRows} />
          <AssurancePanel c={c} data={data} />
          <AgentConstellation c={c} />
        </div>
      </div>
      <div style={{ marginTop: 18, fontSize: 12, color: XC.mute, textAlign: "center" }}>
        {GOVERNANCE_INPUTS.length} weighted inputs compose the AI Governance Score · open any plane to trace a number to its source.
      </div>
    </>
  );
}

/* ── Live security showcase ─────────────────────────────────────────────── */
const OUTCOME_TONE = { allow: XC.ok, mask: XC.med, flag: XC.med, escalate: XC.gold, block: XC.crit, logged: XC.cyan, skipped: "rgba(131,146,174,.45)" };
const STATUS_TONE = { idle: XC.mute, running: XC.ok, downscoped: XC.high, suspended: XC.crit, paused: XC.gold };
const ATTACK_KEYS = Object.keys(ATTACKS);

function emitOne(st, action, now, source) {
  const ag = st.fleet[action.agent];
  const ev = evaluateAction(action, { history: ag?.history || [], signals: ag?.signals || [], paused: !!ag?.paused });
  const e = { ...ev, seq: st.seq + 1, ts: now, source, label: action.label || null };
  const k = st.counts;
  const counts = { ...k, total: k.total + 1, [e.outcome]: (k[e.outcome] || 0) + 1, byStage: { ...k.byStage, [e.decidedAt]: (k.byStage[e.decidedAt] || 0) + (e.outcome === "block" || e.outcome === "escalate" ? 1 : 0) } };
  // A result the user fired stays on the pipeline for a few ticks; background
  // traffic keeps flowing into the counters and the stream meanwhile.
  const keep = source === "auto" && st.hold > 0 && st.current;
  return { ...st, seq: e.seq, fleet: applyEvent(st.fleet, e), events: [...st.events, e].slice(-60), counts, current: keep ? st.current : e };
}
function emitBurst(st, action, now, source) {
  let s2 = st;
  for (let i = 0; i < (action.burst || 1); i++) s2 = emitOne(s2, action, now, source);
  return s2;
}
function liveReducer(st, act) {
  switch (act.type) {
    case "tick": {
      const t = st.tick + 1;
      st = { ...st, hold: Math.max(0, (st.hold || 0) - 1) };
      if (t % 4 === 2) {
        // Rotate attacks, skipping agents that are already stopped (their
        // routine traffic still shows the breaker holding them).
        for (let i = 0; i < ATTACK_KEYS.length; i++) {
          const key = ATTACK_KEYS[(st.attackIdx + i) % ATTACK_KEYS.length];
          const a = ATTACKS[key];
          const status = agentStatus(st.fleet[a.agent]);
          if (status !== "suspended" && status !== "paused") return { ...emitBurst(st, a, act.now, "auto"), tick: t, attackIdx: st.attackIdx + i + 1 };
        }
      }
      return { ...emitOne(st, ROUTINE[st.routineIdx % ROUTINE.length], act.now, "auto"), tick: t, routineIdx: st.routineIdx + 1 };
    }
    case "emit": return { ...emitBurst({ ...st, hold: 0 }, act.action, act.now, act.source || "you"), hold: 3 };
    case "pause": return { ...st, fleet: pauseAgent(st.fleet, act.id) };
    case "resume": return { ...st, fleet: resumeAgent(st.fleet, act.id) };
    case "running": return { ...st, running: act.value };
    default: return st;
  }
}
function useLiveShowcase() {
  const [st, dispatch] = useReducer(liveReducer, null, () => ({
    fleet: initialFleet(), events: [], seq: 0, tick: 0, routineIdx: 0, attackIdx: 0, running: true, current: null, hold: 0,
    counts: { total: 0, allow: 0, mask: 0, flag: 0, escalate: 0, block: 0, byStage: {} },
  }));
  useEffect(() => {
    if (!st.running) return;
    const fire = () => { if (typeof document === "undefined" || !document.hidden) dispatch({ type: "tick", now: new Date().toISOString() }); };
    const first = setTimeout(fire, 400);
    const id = setInterval(fire, 1700);
    return () => { clearTimeout(first); clearInterval(id); };
  }, [st.running]);
  const emit = useCallback((action, source) => dispatch({ type: "emit", action, source, now: new Date().toISOString() }), []);
  const suspended = Object.values(st.fleet).filter(a => { const s = agentStatus(a); return s === "suspended" || s === "paused"; }).length;
  return { st, dispatch, emit, suspended };
}

function LiveBadge({ c }) {
  return <span className="gx-chip" style={{ color: XC.crit, borderColor: "rgba(255,107,128,.45)" }}><span className="gx-dot gx-pulse" style={{ background: XC.crit }} />{c.liveTag}</span>;
}

function Pipeline({ c, ev, counts }) {
  return (
    <section className="gx-panel gx-card">
      <div className="gx-card-h"><ShieldCheck size={15} color={XC.cyan} aria-hidden="true" /><span className="gx-label">{c.pipeline}</span><span className="gx-spacer" />
        {ev && <span className="gx-mono" style={{ fontSize: 12, color: XC.mute }}>#{ev.seq}</span>}</div>
      <div className="gx-pipeline" role="list" aria-label={c.pipeline}>
        {ev && <span key={`sweep-${ev.seq}`} className="gx-flowbar" aria-hidden="true" />}
        {STAGES.map((stg, i) => {
          const s = ev ? ev.stages.find(x => x.id === stg.id) : null;
          const d = s ? s.decision : null;
          const col = d ? OUTCOME_TONE[d] : XC.mute;
          const decisive = ev && ev.decidedAt === stg.id && (d === "block" || d === "escalate" || d === "mask");
          return (
            <div key={stg.id} className="gx-stage" role="listitem" title={s ? `${stg.label}: ${s.reason}` : stg.label}>
              <span key={`${ev ? ev.seq : 0}-${stg.id}`} className={`node ${ev ? "gx-light" : ""}`}
                style={{ animationDelay: `${i * 110}ms`, borderColor: d && d !== "skipped" ? col : undefined, color: col,
                  boxShadow: decisive ? `0 0 0 2px ${col}` : "none", background: decisive ? `${col}22` : undefined }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="lbl">{stg.short}</span>
              <span className="dec" style={{ color: col }}>{d ? (d === "skipped" ? "—" : d) : "·"}</span>
              {counts.byStage[stg.id] ? <span className="gx-mono" style={{ fontSize: 11, color: XC.mute }}>{counts.byStage[stg.id]} stopped</span> : <span style={{ height: 14 }} />}
            </div>
          );
        })}
      </div>
      {ev ? (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 14, alignItems: "start", marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${XC.line}` }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, color: XC.silver }}><b style={{ color: XC.ink }}>{ev.agentName}</b> → <span className="gx-mono">{ev.tool}</span>{ev.dest ? <> → <span className="gx-mono">{ev.dest}</span></> : null}
              {ev.source === "you" ? <span className="gx-chip" style={{ height: 22, fontSize: 11, marginInlineStart: 8, color: XC.cyan }}>you</span> : null}</div>
            <div className="gx-mono" style={{ fontSize: 12.5, color: XC.ink, marginTop: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>“{ev.outcome === "block" && ev.decidedAt === "dlp" ? "[withheld at the boundary]" : ev.masked}”</div>
            <div style={{ fontSize: 13, color: XC.silver, marginTop: 8 }}><span style={{ color: XC.mute }}>{c.reasonL}: </span>{ev.reason}{ev.clause ? <span style={{ color: XC.mute }}> · {ev.clause}</span> : null}</div>
          </div>
          <div style={{ textAlign: "end" }}>
            <span className="gx-chip" style={{ color: OUTCOME_TONE[ev.outcome], borderColor: `${OUTCOME_TONE[ev.outcome]}88`, fontSize: 13, height: 32 }}>{ev.outcome.toUpperCase()}</span>
            <div style={{ fontSize: 11.5, color: XC.mute, marginTop: 6 }}>{c.decidedBy} {STAGES.find(s => s.id === ev.decidedAt)?.label}</div>
            <div className="gx-mono" style={{ fontSize: 11.5, color: XC.mute, marginTop: 2 }}>{ev.dataClass}</div>
          </div>
        </div>
      ) : <div className="gx-empty" style={{ padding: 12 }}>{c.waiting}</div>}
    </section>
  );
}

function FleetMonitor({ c, fleet, dispatch }) {
  return (
    <section className="gx-panel gx-card">
      <div className="gx-card-h"><Bot size={15} color={XC.cyan} aria-hidden="true" /><span className="gx-label">{c.fleet}</span></div>
      <div className="gx-fleet">
        {AI_AGENTS.map(a => {
          const s = fleet[a.id]; const status = agentStatus(s); const b = breakerFor(s);
          const tone = STATUS_TONE[status];
          const stopped = status === "suspended" || status === "paused";
          return (
            <article key={a.id} className="gx-panel gx-agent" style={stopped ? { borderColor: tone, boxShadow: `inset 3px 0 0 ${tone}` } : null}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className={`gx-dot ${status === "running" ? "gx-pulse" : ""}`} style={{ background: tone }} />
                <b style={{ fontSize: 13.5, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</b>
              </div>
              <div style={{ fontSize: 12, color: tone, fontWeight: 700 }}>{c.status[status]}</div>
              <div style={{ fontSize: 12, color: XC.mute, minHeight: 16 }}>{s.last ? <><span className="gx-mono" style={{ color: XC.silver }}>{s.last.tool}</span> · <span style={{ color: OUTCOME_TONE[s.last.outcome] }}>{s.last.outcome}</span></> : a.owner}</div>
              <div className="gx-ticks" aria-label="Recent decisions">{Array.from({ length: 24 }).map((_, i) => {
                const o = s.recent[s.recent.length - 24 + i];
                return <i key={i} style={{ height: o ? (o === "block" ? "100%" : o === "escalate" ? "80%" : o === "mask" ? "60%" : "40%") : "15%", background: o ? OUTCOME_TONE[o] : XC.raised }} />;
              })}</div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: XC.mute, marginBottom: 4 }}><span>Breaker · {b.stateLabel}</span><span className="gx-mono">{b.score}</span></div>
                <div className="gx-bar"><i style={{ width: `${b.score}%`, background: b.score >= 65 ? XC.crit : b.score >= 40 ? XC.high : XC.ok }} /></div>
              </div>
              <div style={{ fontSize: 11.5, color: XC.mute, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}><span className="gx-mono" style={{ color: XC.silver }}>{s.calls}</span> calls · <span className="gx-mono" style={{ color: s.blocked ? XC.crit : XC.silver }}>{s.blocked}</span> blocked · <span className="gx-mono" style={{ color: s.escalated ? XC.gold : XC.silver }}>{s.escalated}</span> escalated</div>
              {stopped
                ? <button type="button" className="gx-btn gx-btn-primary" style={{ height: 32, fontSize: 12 }} onClick={() => dispatch({ type: "resume", id: a.id })} title={c.resume}><Play size={13} aria-hidden="true" /><span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.resume}</span></button>
                : <button type="button" className="gx-btn" style={{ height: 32, fontSize: 12 }} onClick={() => dispatch({ type: "pause", id: a.id })}><Power size={13} aria-hidden="true" />{c.killSwitch}</button>}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function AttackLab({ c, emit }) {
  const [agentId, setAgentId] = useState("agent-crc");
  const agent = AI_AGENTS.find(a => a.id === agentId) || AI_AGENTS[0];
  const [tool, setTool] = useState("draft_response");
  const [text, setText] = useState("");
  useEffect(() => { if (!agent.tools.some(t => t.name === tool)) setTool(agent.tools[0]?.name || ""); }, [agentId]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <section className="gx-panel gx-card">
      <div className="gx-card-h"><Crosshair size={15} color={XC.crit} aria-hidden="true" /><span className="gx-label">{c.lab}</span></div>
      <div style={{ fontSize: 12.5, color: XC.mute, marginBottom: 10 }}>{c.labNote}</div>
      <div className="gx-attack">
        {ATTACK_KEYS.map(k => <button key={k} type="button" onClick={() => emit(ATTACKS[k], "you")}><span style={{ color: XC.crit, font: `800 11px ${MONO}`, letterSpacing: ".08em", textTransform: "uppercase" }}><Zap size={11} aria-hidden="true" /> fire</span>{ATTACKS[k].label}<span>{AI_AGENTS.find(a => a.id === ATTACKS[k].agent)?.name}</span></button>)}
      </div>
      <form onSubmit={e => { e.preventDefault(); if (text.trim()) { emit({ agent: agentId, tool, prompt: text.slice(0, 2000) }, "you"); } }} style={{ marginTop: 14, display: "grid", gap: 8 }}>
        <div className="gx-label" style={{ display: "flex", alignItems: "center", gap: 6 }}><FlaskConical size={13} aria-hidden="true" />{c.own}</div>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 8 }}>
          <select className="gx-field" value={agentId} onChange={e => setAgentId(e.target.value)} aria-label="Agent">{AI_AGENTS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
          <select className="gx-field" value={tool} onChange={e => setTool(e.target.value)} aria-label="Tool">{agent.tools.map(t => <option key={t.name} value={t.name}>{t.name}{t.granted ? "" : " (not granted)"}</option>)}</select>
        </div>
        <input className="gx-field" value={text} onChange={e => setText(e.target.value)} placeholder={c.ownPh} maxLength={2000} aria-label={c.own} />
        <button type="submit" className="gx-btn gx-btn-primary" disabled={!text.trim()} style={{ opacity: text.trim() ? 1 : .55 }}>{c.runIt}<ChevronRight size={14} aria-hidden="true" /></button>
      </form>
    </section>
  );
}

function EnforcementStream({ c, events }) {
  const rows = events.slice(-12).reverse();
  return (
    <section className="gx-panel gx-card">
      <div className="gx-card-h"><Activity size={15} color={XC.cyan} aria-hidden="true" /><span className="gx-label">{c.stream}</span></div>
      {rows.length ? rows.map(e => (
        <div key={e.seq} className="gx-row" style={{ alignItems: "flex-start" }}>
          <span className="gx-mono" style={{ fontSize: 11.5, color: XC.mute, width: 58, flex: "none" }}>{new Date(e.ts).toLocaleTimeString("en-GB")}</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.label || e.tool} <span style={{ color: XC.mute }}>· {e.agentName}</span></span>
            <span style={{ display: "block", fontSize: 12, color: XC.mute, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{STAGES.find(s => s.id === e.decidedAt)?.short} — {e.reason}</span>
          </span>
          <span className="gx-chip" style={{ height: 22, fontSize: 11, padding: "0 8px", color: OUTCOME_TONE[e.outcome] }}>{e.outcome}</span>
        </div>
      )) : <div className="gx-empty" style={{ padding: 12 }}>{c.waiting}</div>}
    </section>
  );
}

function LiveSecurity({ c, live }) {
  const { st, dispatch, emit, suspended } = live;
  const k = st.counts;
  const tiles = [
    [c.processed, k.total, XC.electric], [c.allowedN, k.allow, XC.ok], [c.maskedN, k.mask + k.flag, XC.med],
    [c.escalatedN, k.escalate, XC.gold], [c.blockedN, k.block, XC.crit], [c.suspendedN, suspended, suspended ? XC.crit : XC.ok],
  ];
  return (
    <>
      <section className="gx-panel gx-banner" aria-live="off">
        <LiveBadge c={c} />
        <span style={{ fontSize: 13, color: XC.silver, flex: 1, minWidth: 240 }}>{c.liveNote}</span>
        <button type="button" className="gx-btn" onClick={() => dispatch({ type: "running", value: !st.running })}>
          {st.running ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}{st.running ? c.pause : c.play}
        </button>
      </section>
      <div className="gx-counters">
        {tiles.map(([label, v, col]) => <div key={label} className="gx-panel gx-kpi"><span style={{ fontSize: 11.5, color: XC.mute }}>{label}</span><b style={{ color: col }}>{v}</b></div>)}
      </div>
      <div className="gx-live">
        <div className="gx-col">
          <Pipeline c={c} ev={st.current} counts={k} />
          <FleetMonitor c={c} fleet={st.fleet} dispatch={dispatch} />
        </div>
        <div className="gx-col">
          <AttackLab c={c} emit={emit} />
          <EnforcementStream c={c} events={st.events} />
        </div>
      </div>
    </>
  );
}

function LiveRibbon({ c, live, onWatch }) {
  const { st, suspended } = live;
  const last = [...st.events].reverse().find(e => e.outcome === "block" || e.outcome === "escalate");
  return (
    <section className="gx-panel gx-ribbon">
      <LiveBadge c={c} />
      <span style={{ fontSize: 14, fontWeight: 700 }}>{c.ribbon(AI_AGENTS.length, st.counts.block, st.counts.escalate)}</span>
      {suspended > 0 && <span className="gx-chip" style={{ color: XC.crit }}>{suspended} {c.suspendedN.toLowerCase()}</span>}
      {last && <span style={{ fontSize: 12.5, color: XC.mute, flex: 1, minWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.lastL}: <span style={{ color: OUTCOME_TONE[last.outcome] }}>{last.outcome}</span> · {last.label || last.tool} · {last.agentName}</span>}
      <span className="gx-spacer" />
      <button type="button" className="gx-btn gx-btn-primary" onClick={onWatch}><ShieldCheck size={15} aria-hidden="true" />{c.watchLive}<ChevronRight size={14} aria-hidden="true" /></button>
    </section>
  );
}

/* ── shell ──────────────────────────────────────────────────────────────── */
export function IntelligenceExperience({
  mode = "home", role = "caio", userName = "", seeded = true, lang = "en", setLang = () => {},
  onMode = () => {}, onClassic = () => {}, onOpen = () => {}, onSignOut = () => {}, skipIntro = false, setSkipIntro = () => {},
}) {
  useStyles();
  const c = COPY[lang] || COPY.en;
  const data = useExperienceData({ role, seeded });
  const live = useLiveShowcase();
  const [deckView, setDeckView] = useState("briefs");
  const [lensEv, setLensEv] = useState(null);
  const openLens = useCallback(b => setLensEv({ title: b.title, source: b.evidence.source, ref: b.evidence.ref, facts: b.evidence.facts, action: b.action }), []);
  const closeLens = useCallback(() => setLensEv(null), []);
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState(null);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState("");
  const rootRef = useRef(null);
  useEffect(() => {
    const tick = () => setNow(new Date().toLocaleTimeString(lang === "ar" ? "ar-AE" : "en-GB", { hour: "2-digit", minute: "2-digit" }));
    tick(); const id = setInterval(tick, 30000); return () => clearInterval(id);
  }, [lang]);
  useEffect(() => { rootRef.current?.scrollTo?.({ top: 0 }); }, [mode]);

  const submit = useCallback(async text => {
    const t = String(text || "").trim(); if (!t || busy) return;
    const intent = routeIntent(t);
    if (intent) { onOpen({ nav: intent.nav, tab: intent.tab }); return; }
    setQ(t); setBusy(true); setAnswer({ q: t, kind: "pending", text: "" });
    const r = await askGateway(t, "demo");
    setBusy(false);
    if (!r.enabled) setAnswer({ q: t, kind: "simulated", text: honestSimulatedReply({ ar: lang === "ar" }) });
    else if (r.blocked) setAnswer({ q: t, kind: "blocked", text: r.text });
    else setAnswer({ q: t, kind: "live", text: r.text });
  }, [busy, lang, onOpen]);

  const ask = { q, setQ, answer, setAnswer, busy, submit, lang };
  const firstName = String(userName || "").trim().split(/\s+/)[0] || "";
  return (
    <div ref={rootRef} className="gx-root" dir={lang === "ar" ? "rtl" : "ltr"} lang={lang} data-testid={`gx-${mode}`} data-deck-view={deckView}>
      <div className="gx-wrap">
        <Hud c={c} role={role} seeded={seeded} liveFeed={data.liveFeed} lang={lang} setLang={setLang} mode={mode}
          onHome={() => onMode("home")} onDeck={() => onMode("deck")} onClassic={onClassic} onSignOut={onSignOut} now={now} />
        {mode === "deck"
          ? <>
              <div className="gx-deckhead">
                <button type="button" className="gx-btn gx-btn-icon" onClick={() => onMode("home")} aria-label={c.home}><ArrowLeft size={16} aria-hidden="true" /></button>
                <h1>{c.deck}</h1>
                <span className="gx-rule gx-hide-sm" />
                <div className="gx-tabs" role="tablist" aria-label={c.deck}>
                  {[["briefs", Radar, c.tabBriefs], ["decisions", Gavel, c.tabDecisions], ["estate", Network, c.tabEstate], ["instruments", LayoutGrid, c.tabInstruments]].map(([k, Icon, label]) => (
                    <button key={k} type="button" role="tab" aria-selected={deckView === k} onClick={() => setDeckView(k)}><Icon size={14} aria-hidden="true" />{label}
                      {k === "decisions" && data.approvals.length ? <span className="gx-mono" style={{ fontSize: 11, color: XC.gold }}>{data.approvals.length}</span> : null}</button>
                  ))}
                  <button type="button" role="tab" aria-selected={deckView === "live"} onClick={() => setDeckView("live")}><span className="gx-dot gx-pulse" style={{ background: XC.crit }} />{c.tabLive}</button>
                </div>
              </div>
              {deckView !== "live" && (
                <div className="gx-dock">
                  <AskBar c={c} lang={lang} value={q} setValue={setQ} onSubmit={submit} busy={busy} big={false} />
                  <AnswerPanel c={c} answer={answer} onClose={() => setAnswer(null)} />
                  <Legend c={c} />
                </div>
              )}
              {deckView === "live" ? <LiveSecurity c={c} live={live} />
                : deckView === "decisions" ? <DecisionsView c={c} data={data} role={role} onOpen={onOpen} ask={ask} />
                : deckView === "estate" ? <EstateView c={c} data={data} />
                : deckView === "instruments" ? <Instruments c={c} data={data} onOpen={onOpen} ask={ask} />
                : <BriefsView c={c} data={data} onOpen={onOpen} onLens={openLens} ask={ask} live={live} onWatchLive={() => setDeckView("live")} />}
              <EvidenceLens c={c} ev={lensEv} seeded={seeded} onClose={closeLens} onOpen={onOpen} />
            </>
          : <IntelligenceHome c={c} data={data} firstName={firstName} role={role} onOpen={onOpen} onDeck={() => onMode("deck")} onClassic={onClassic}
              ask={ask} skipIntro={skipIntro} setSkipIntro={setSkipIntro} live={live} onWatchLive={() => { setDeckView("live"); onMode("deck"); }} />}
      </div>
    </div>
  );
}
