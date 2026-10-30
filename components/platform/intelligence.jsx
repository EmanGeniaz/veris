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
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  ShieldAlert, Activity, Gavel, Siren, Timer, FileWarning, Wallet, Scale, Mic, MicOff,
  ArrowUp, LayoutGrid, Sparkles, X, ChevronRight, LogOut, Languages, Orbit, Bot, Link2,
  CircleCheck, Layers, Radar, Workflow, Boxes, ArrowLeft, ShieldCheck, Command,
} from "lucide-react";
import { HITL, ROLES } from "./core";
import { deriveBurningIssues, issueSummary, greetingFor, routeIntent } from "../../lib/burning-issues";
import { riskRegister, kriRegister, acInitiatives, AC_PHASES } from "../../lib/platform-models";
import { UNIFIED_INCIDENTS } from "../../lib/convergence";
import { BREACH_REGISTER, breachClock } from "../../lib/breach-notification";
import { EVIDENCE_ARTIFACTS } from "../../lib/evidence-freshness";
import { providerSpend, costSummary, fmtUSD, fmtTokens } from "../../lib/cost-engine";
import { euAiActStats, iso42001Stats, nistRmfStats, NISTRMF_REQS } from "../../lib/computed-frameworks";
import { GOVERNANCE_SCORE, GOVERNANCE_DELTA, GOVERNANCE_INPUTS } from "../../lib/governance";
import { AGENT_REGISTRY } from "../../lib/agent-runtime";
import { INFERENCE_EVENTS, chainIntact } from "../../lib/inference-log";
import { askGateway } from "../../lib/gateway-client";
import { honestSimulatedReply } from "../../lib/assistant-honesty";

/* ── tokens ─────────────────────────────────────────────────────────────── */
const XC = {
  void: "#030914", ink: "#EAF1FF", silver: "#B9C6DB", mute: "#8392AE",
  blue: "#2F7BFF", electric: "#4FA3FF", cyan: "#5FE1FF", gold: "#E3B862",
  crit: "#FF5470", high: "#FF9F43", med: "#F2D35B", ok: "#36E2A4",
  line: "rgba(110,160,255,.16)", lineHi: "rgba(120,180,255,.42)",
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
  background:radial-gradient(1100px 620px at 50% -12%,rgba(47,123,255,.24),transparent 62%),
  radial-gradient(760px 520px at 92% 108%,rgba(95,225,255,.10),transparent 62%),
  radial-gradient(640px 420px at 4% 96%,rgba(227,184,98,.07),transparent 60%),${XC.void};-webkit-font-smoothing:antialiased}
.gx-root::before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.32;
  background-image:linear-gradient(rgba(110,160,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(110,160,255,.07) 1px,transparent 1px);
  background-size:56px 56px;-webkit-mask-image:radial-gradient(ellipse 80% 70% at 50% 40%,#000 30%,transparent 80%);mask-image:radial-gradient(ellipse 80% 70% at 50% 40%,#000 30%,transparent 80%)}
.gx-wrap{position:relative;max-width:1440px;margin:0 auto;padding:0 24px 40px;overflow-x:clip}
.gx-hud{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:14px;padding:14px 24px;margin:0 -24px;
  background:linear-gradient(180deg,rgba(3,9,20,.92),rgba(3,9,20,.55));backdrop-filter:blur(12px);border-bottom:1px solid ${XC.line}}
.gx-hud img{height:40px;width:auto;display:block}
.gx-spacer{flex:1}
.gx-chip{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 11px;border-radius:999px;border:1px solid ${XC.line};
  background:rgba(12,26,50,.6);font-size:12px;font-weight:700;color:${XC.silver};white-space:nowrap}
.gx-dot{width:7px;height:7px;border-radius:50%;flex:none}
.gx-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:38px;padding:0 16px;border-radius:12px;cursor:pointer;
  font:700 13px ${SANS};color:${XC.ink};background:rgba(14,30,58,.7);border:1px solid ${XC.line};transition:border-color .2s,background .2s,transform .2s}
.gx-btn:hover{border-color:${XC.lineHi};background:rgba(22,44,84,.8)}
.gx-btn-primary{background:linear-gradient(135deg,#2F7BFF,#1F55D8);border-color:rgba(140,190,255,.55);box-shadow:0 0 0 1px rgba(95,225,255,.12),0 10px 30px rgba(47,123,255,.35)}
.gx-btn-primary:hover{background:linear-gradient(135deg,#4189FF,#2763E6)}
.gx-btn-icon{width:38px;padding:0}
.gx-root :focus-visible{outline:2px solid ${XC.cyan};outline-offset:2px}
.gx-label{font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:${XC.silver}}
.gx-panel{position:relative;background:linear-gradient(180deg,rgba(13,28,54,.66),rgba(7,17,34,.66));border:1px solid ${XC.line};border-radius:18px;
  backdrop-filter:blur(14px);box-shadow:inset 0 1px 0 rgba(255,255,255,.04),0 24px 60px rgba(0,0,0,.35)}
.gx-panel::before,.gx-panel::after{content:"";position:absolute;width:14px;height:14px;pointer-events:none;border-color:${XC.cyan};opacity:.55}
.gx-panel::before{top:-1px;left:-1px;border-top:2px solid;border-left:2px solid;border-top-left-radius:18px}
.gx-panel::after{bottom:-1px;right:-1px;border-bottom:2px solid;border-right:2px solid;border-bottom-right-radius:18px}
.gx-hero{display:grid;grid-template-columns:minmax(0,1fr);justify-items:center;text-align:center;padding:40px 0 8px;position:relative}
.gx-core-bg{position:absolute;top:-170px;left:50%;transform:translateX(-50%);width:min(680px,120vw);aspect-ratio:1;opacity:.5;pointer-events:none}
.gx-core-bg canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.gx-greet{font-family:${SERIF};font-weight:400;font-size:clamp(34px,5.2vw,64px);line-height:1.05;margin:14px 0 0;letter-spacing:-.01em;text-wrap:balance}
.gx-greet em{font-style:italic;background:linear-gradient(90deg,${XC.ink},#9CC6FF);-webkit-background-clip:text;background-clip:text;color:transparent}
.gx-help{font-family:${SERIF};font-size:clamp(26px,3.6vw,44px);color:#9CC6FF;margin:6px 0 0;font-style:italic}
.gx-lead{font-size:15px;color:${XC.silver};margin:14px 0 0;max-width:66ch;text-wrap:balance}
.gx-ask{position:relative;width:min(820px,100%);margin:26px auto 0;display:flex;align-items:center;gap:8px;padding:8px 8px 8px 18px;border-radius:20px;
  background:rgba(8,20,42,.78);border:1px solid rgba(120,180,255,.30);box-shadow:0 0 0 6px rgba(47,123,255,.06),0 20px 60px rgba(3,9,20,.6);transition:border-color .2s,box-shadow .2s}
.gx-ask:focus-within{border-color:${XC.cyan};box-shadow:0 0 0 6px rgba(95,225,255,.10),0 0 40px rgba(95,225,255,.18)}
.gx-ask input{flex:1;min-width:0;height:44px;background:transparent;border:0;outline:none;color:${XC.ink};font:500 16px ${SANS}}
.gx-ask input::placeholder{color:${XC.mute}}
.gx-ask input:focus-visible{outline:none}
.gx-sugg{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:14px}
.gx-sugg button{height:32px;padding:0 13px;border-radius:999px;border:1px solid ${XC.line};background:rgba(12,26,50,.55);color:${XC.silver};font:600 12.5px ${SANS};cursor:pointer}
.gx-sugg button:hover{border-color:${XC.lineHi};color:${XC.ink}}
.gx-answer{width:min(820px,100%);margin:16px auto 0;padding:18px 20px;text-align:start}
.gx-answer p{margin:8px 0 0;font-size:14.5px;line-height:1.6;color:${XC.ink};white-space:pre-wrap}
.gx-sec{display:flex;align-items:center;gap:12px;margin:40px 0 14px}
.gx-sec{flex-wrap:wrap}
.gx-sec h2{font-family:${SERIF};font-weight:400;font-size:26px;margin:0;white-space:nowrap}
.gx-rule{flex:1;height:1px;background:linear-gradient(90deg,${XC.line},transparent)}
.gx-issues{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px}
.gx-issue{padding:18px 18px 16px;display:flex;flex-direction:column;gap:10px;min-height:236px;overflow:hidden}
.gx-issue .gx-sev{position:absolute;inset:0 auto 0 0;width:3px;border-radius:18px 0 0 18px}
.gx-issue h3{margin:0;font-size:15.5px;font-weight:800;line-height:1.3;text-wrap:balance}
.gx-issue .why{font-size:13px;line-height:1.5;color:${XC.silver};display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.gx-metric{display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding-top:10px;border-top:1px dashed ${XC.line};margin-top:auto}
.gx-metric b{font-family:${MONO};font-size:15px;color:${XC.ink};font-variant-numeric:tabular-nums}
.gx-acts{display:flex;gap:8px;flex-wrap:wrap}
.gx-acts .gx-btn{height:32px;font-size:12.5px;padding:0 12px;border-radius:10px}
.gx-cta{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:12px;margin:34px 0 0}
.gx-cta .gx-btn{height:46px;padding:0 22px;font-size:14px;border-radius:14px}
.gx-check{display:inline-flex;align-items:center;gap:8px;font-size:12.5px;color:${XC.mute};cursor:pointer;margin-top:14px}
.gx-check input{accent-color:${XC.blue};width:15px;height:15px}
.gx-empty{padding:28px;text-align:center;color:${XC.silver};font-size:14px}
/* deck */
.gx-deck{display:grid;grid-template-columns:320px minmax(0,1fr) 340px;gap:16px;margin-top:18px;align-items:start}
.gx-col{display:flex;flex-direction:column;gap:16px;min-width:0}
.gx-card{padding:16px 16px 14px}
.gx-card-h{display:flex;align-items:center;gap:8px;margin-bottom:12px}
.gx-orbit{position:relative;width:min(640px,100%);aspect-ratio:1;margin:0 auto}
.gx-orbit>canvas{position:absolute;inset:0;width:100%;height:100%}
.gx-orbit>svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}
.gx-center{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none}
.gx-center .n{font-family:${SERIF};font-size:clamp(46px,7vw,76px);line-height:1;text-shadow:0 0 30px rgba(95,225,255,.45)}
.gx-node{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:6px;background:none;border:0;color:${XC.ink};cursor:pointer;padding:0;font-family:${SANS}}
.gx-node .orb{width:58px;height:58px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 30%,rgba(120,180,255,.35),rgba(10,24,48,.92) 70%);
  border:1px solid ${XC.lineHi};box-shadow:0 0 22px rgba(47,123,255,.35);transition:transform .25s,box-shadow .25s}
.gx-node:hover .orb,.gx-node[aria-pressed="true"] .orb{transform:scale(1.08);box-shadow:0 0 0 2px ${XC.cyan},0 0 34px rgba(95,225,255,.55)}
.gx-node .nm{font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase}
.gx-node .mv{font:600 12px ${MONO};color:${XC.silver}}
.gx-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin-top:8px}
.gx-kpi{padding:12px 12px 10px;text-align:start}
.gx-kpi b{display:block;font-family:${MONO};font-size:22px;font-variant-numeric:tabular-nums;margin-top:4px}
.gx-row{display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid rgba(110,160,255,.08);font-size:13px}
.gx-row:first-of-type{border-top:0}
.gx-rowbtn{width:100%;background:none;border:0;color:inherit;text-align:start;cursor:pointer;font:inherit;padding:0}
.gx-rowbtn:hover .t{color:${XC.cyan}}
.gx-mono{font-family:${MONO};font-variant-numeric:tabular-nums}
.gx-bar{height:6px;border-radius:999px;background:rgba(110,160,255,.12);overflow:hidden}
.gx-bar i{display:block;height:100%;border-radius:999px}
.gx-pipe{display:grid;grid-template-columns:repeat(13,minmax(0,1fr));align-items:center;margin:4px 0 2px;padding:0 6px}
.gx-ph{display:grid;grid-template-rows:20px 22px 20px;justify-items:center;align-items:center;position:relative;min-width:0}
.gx-ph .pt{grid-row:2;width:16px;height:16px;border-radius:50%;border:1px solid ${XC.lineHi};background:rgba(10,24,48,.9);display:grid;place-items:center;
  font:800 10px ${MONO};color:${XC.void};position:relative;z-index:1}
.gx-ph .pt.on{width:22px;height:22px}
.gx-ph .pn{font-size:11px;color:${XC.mute};line-height:1;white-space:nowrap}
.gx-ph .pn.on{color:${XC.ink};font-weight:700}
.gx-ph .up{grid-row:1}.gx-ph .dn{grid-row:3}
.gx-ph::before{content:"";position:absolute;top:31px;inset-inline-start:50%;width:100%;height:1px;background:${XC.line}}
.gx-ph:last-child::before{display:none}
.gx-chainrow{display:flex;align-items:stretch;gap:6px;overflow-x:auto;padding-bottom:4px}
.gx-blk{flex:1 1 0;min-width:140px;padding:12px;border-radius:14px;border:1px solid ${XC.line};background:rgba(9,22,44,.7)}
.gx-link{flex:none;display:grid;place-items:center;color:${XC.cyan};opacity:.8}
.gx-drill{padding:18px}
.gx-dock{position:relative}
.gx-dock .gx-ask{margin-top:0}
.gx-flow{stroke-dasharray:4 8;animation:gx-flow 2.4s linear infinite}
@keyframes gx-flow{to{stroke-dashoffset:-48}}
@keyframes gx-pulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes gx-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.gx-pulse{animation:gx-pulse 1.8s ease-in-out infinite}
.gx-rise{animation:gx-rise .6s cubic-bezier(.2,.7,.2,1) both}
@media (max-width:1200px){.gx-deck{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.gx-deck .gx-mid{grid-column:1/-1;order:-1}}
@media (max-width:768px){
  .gx-wrap{padding:0 16px 32px}.gx-hud{padding:12px 16px;margin:0 -16px;gap:8px}.gx-hud img{height:26px}
  .gx-hide-sm{display:none!important}.gx-deck{grid-template-columns:minmax(0,1fr)}
  .gx-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.gx-pipe{overflow-x:auto;grid-template-columns:repeat(13,64px);padding-bottom:6px}
  .gx-node .orb{width:44px;height:44px}.gx-node .mv{display:none}.gx-node .nm{font-size:11px}
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
      issues, allIssues, summary: issueSummary(allIssues), approvals, openRisks, initiatives, cost, spendRows,
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
  if (!answer) return null;
  const tone = answer.kind === "live" ? XC.ok : answer.kind === "blocked" ? XC.crit : XC.gold;
  const label = answer.kind === "live" ? c.liveAnswer : answer.kind === "blocked" ? c.blocked : answer.kind === "pending" ? c.thinking : c.simulated;
  return (
    <section className="gx-panel gx-answer gx-rise" aria-live="polite">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span className="gx-chip"><span className={`gx-dot ${answer.kind === "pending" ? "gx-pulse" : ""}`} style={{ background: answer.kind === "pending" ? XC.cyan : tone }} />{label}</span>
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
      <span className="gx-sev" style={{ background: col, boxShadow: `0 0 18px ${col}` }} />
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
function IntelligenceHome({ c, data, firstName, role, onOpen, onDeck, onClassic, ask, skipIntro, setSkipIntro }) {
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

/* ── Command Deck ───────────────────────────────────────────────────────── */
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

function PlaneOrbit({ c, data, selected, setSelected }) {
  const planes = planesFor(data, c);
  const pos = planes.map((p, i) => {
    const ang = (-90 + i * (360 / planes.length)) * Math.PI / 180;
    return { ...p, x: 50 + 41 * Math.cos(ang), y: 50 + 41 * Math.sin(ang) };
  });
  return (
    <div className="gx-orbit">
      <CoreCanvas alert={data.summary.critical} />
      <svg viewBox="0 0 100 100" aria-hidden="true" className="gx-lines">
        {pos.map(p => (
          <line key={p.id} x1="50" y1="50" x2={p.x} y2={p.y} className="gx-flow" stroke={selected === p.id ? XC.cyan : "rgba(120,180,255,.35)"} strokeWidth={selected === p.id ? 0.45 : 0.25} />
        ))}
      </svg>
      <div className="gx-center">
        <div className="gx-label" style={{ color: XC.cyan }}>{c.core}</div>
        <div className="n">{data.initiatives.length ? GOVERNANCE_SCORE : "—"}</div>
        <div style={{ fontSize: 12, color: XC.silver, marginTop: 4 }}>{c.score}{data.initiatives.length ? <span className="gx-mono" style={{ color: XC.ok }}> · +{GOVERNANCE_DELTA}</span> : null}</div>
      </div>
      {pos.map(p => {
        const Icon = p.icon;
        return (
          <button key={p.id} type="button" className="gx-node" style={{ left: `${p.x}%`, top: `${p.y}%` }} aria-pressed={selected === p.id}
            onClick={() => setSelected(selected === p.id ? null : p.id)} aria-label={`${p.name}: ${p.metric}`}>
            <span className="orb"><Icon size={20} color={p.tone} aria-hidden="true" /></span>
            <span className="nm">{p.name}</span>
            <span className="mv">{p.metric}</span>
          </button>
        );
      })}
    </div>
  );
}

function DrillPanel({ c, plane, onOpen, onAsk, onClose }) {
  if (!plane) return null;
  const Icon = plane.icon;
  return (
    <section className="gx-panel gx-drill gx-rise" aria-label={`${plane.name} detail`}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <Icon size={18} color={plane.tone} aria-hidden="true" />
        <h3 style={{ margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: 24 }}>{plane.name}</h3>
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
  const A0 = 200, SWEEP = 140; // arc from 200° through 340°
  const arc = (r, a0, a1) => {
    const p = a => [50 + r * Math.cos(a * Math.PI / 180), 55 + r * Math.sin(a * Math.PI / 180)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    return `M${x0} ${y0} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
  };
  return (
    <section className="gx-panel gx-card">
      <div className="gx-card-h"><Wallet size={15} color={XC.cyan} aria-hidden="true" /><span className="gx-label">{c.spend}</span></div>
      {cost ? <>
        <svg viewBox="0 0 100 62" role="img" aria-label={`${util}% of budget used`} style={{ width: "100%", display: "block" }}>
          <path d={arc(40, A0, A0 + SWEEP)} stroke="rgba(110,160,255,.14)" strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d={arc(40, A0, A0 + Math.max(2, SWEEP * pct))} stroke={col} strokeWidth="7" fill="none" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${col})` }} />
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
      <div className="gx-card-h"><ShieldCheck size={15} color={XC.cyan} aria-hidden="true" /><span className="gx-label">{c.assurance}</span></div>
      {data.assurance.length ? <>
        {data.assurance.map(a => {
          const col = a.score >= 85 ? XC.ok : a.score >= 70 ? XC.med : XC.high;
          return (
            <div key={a.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}><span>{a.name}</span><b className="gx-mono" style={{ color: col }}>{a.score}%</b></div>
              <div className="gx-bar"><i style={{ width: `${a.score}%`, background: `linear-gradient(90deg,${XC.blue},${col})` }} /></div>
              <div style={{ fontSize: 11.5, color: XC.mute, marginTop: 5 }}>{a.met} met · {a.partial} partial · {a.gap} gap</div>
            </div>
          );
        })}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 6, marginTop: 4 }}>
          {data.nistFns.map(f => {
            const full = f.met === f.total;
            return <div key={f.fn} style={{ textAlign: "center", padding: "8px 4px", borderRadius: 10, border: `1px solid ${XC.line}`, background: "rgba(9,22,44,.6)" }}>
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
      <div className="gx-card-h"><Bot size={15} color={XC.cyan} aria-hidden="true" /><span className="gx-label">{c.agents}</span></div>
      {AGENT_REGISTRY.map(a => {
        const on = a.status === "available";
        return (
          <div key={a.id} className="gx-row">
            <span className={`gx-dot ${on ? "gx-pulse" : ""}`} style={{ background: on ? XC.cyan : "rgba(131,146,174,.45)" }} />
            <span style={{ flex: 1, minWidth: 0, color: on ? XC.ink : XC.mute, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</span>
            <span className="gx-chip" style={{ height: 22, fontSize: 11, padding: "0 8px", color: a.actionClass === "monitor" ? XC.silver : XC.gold }}>{a.actionClass}</span>
          </div>
        );
      })}
      <div style={{ fontSize: 11.5, color: XC.mute, marginTop: 8 }}>{c.hitl}</div>
    </section>
  );
}

function IssueQueue({ c, issues, onOpen }) {
  return (
    <section className="gx-panel gx-card">
      <div className="gx-card-h"><Radar size={15} color={XC.crit} aria-hidden="true" /><span className="gx-label">{c.queue}</span><span className="gx-spacer" /><span className="gx-mono" style={{ fontSize: 12, color: XC.mute }}>{issues.length}</span></div>
      {issues.length ? issues.map(i => {
        const Icon = KIND_ICON[i.kind] || ShieldAlert, col = SEV[i.severity];
        return (
          <div key={i.id} className="gx-row">
            <button type="button" className="gx-rowbtn" onClick={() => onOpen(i.action)} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <Icon size={15} color={col} aria-hidden="true" style={{ flex: "none", marginTop: 2 }} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="t" style={{ display: "block", fontWeight: 700, lineHeight: 1.35 }}>{i.title}</span>
                <span style={{ display: "block", fontSize: 12, color: XC.mute, marginTop: 2 }}>{i.metric.label}: <span className="gx-mono">{i.metric.value}</span></span>
              </span>
            </button>
          </div>
        );
      }) : <div className="gx-empty" style={{ padding: 12 }}><CircleCheck size={18} color={XC.ok} aria-hidden="true" /> {c.allClear}</div>}
    </section>
  );
}

const DECISION_TONE = { allow: XC.ok, mask: XC.med, block: XC.crit, escalate: XC.high };
function LiveFeed({ c, events, live }) {
  const rows = events.slice(-8).reverse();
  return (
    <section className="gx-panel gx-card">
      <div className="gx-card-h"><Activity size={15} color={XC.cyan} aria-hidden="true" /><span className="gx-label">{c.feed}</span><span className="gx-spacer" />{live && <span className="gx-dot gx-pulse" style={{ background: XC.ok }} />}</div>
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
      <div className="gx-card-h"><Link2 size={15} color={XC.cyan} aria-hidden="true" /><span className="gx-label">{c.chain}</span><span className="gx-spacer" />
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
                <div className="gx-mono" style={{ fontSize: 11.5, color: XC.cyan, marginTop: 8 }}>hash {String(e.hash || "").slice(0, 10) || "—"}…</div>
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
      <div className="gx-card-h"><Workflow size={15} color={XC.cyan} aria-hidden="true" /><span className="gx-label">{c.lifecycle}</span></div>
      <div className="gx-pipe">
        {AC_PHASES.map((ph, idx) => {
          const here = initiatives.filter(i => i.phaseIndex === idx);
          const blocked = here.some(i => i.blockedBy);
          const col = here.length ? (blocked ? XC.high : XC.cyan) : null;
          const tip = here.length ? here.map(i => `${i.name}${i.blockedBy ? ` — blocked: ${i.blockedBy}` : ""}`).join("\n") : ph.objective;
          return (
            <div key={ph.id} className="gx-ph" title={tip} aria-label={`${ph.name}: ${here.length} initiative(s)${blocked ? ", blocked at gate" : ""}`}>
              <span className={`pn ${idx % 2 ? "up" : "dn"} ${here.length ? "on" : ""}`}>{ph.name}</span>
              <span className={`pt ${here.length ? "on" : ""}`} style={col ? { background: col, borderColor: col, boxShadow: `0 0 14px ${col}` } : null}>{here.length || ""}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CommandDeck({ c, data, onOpen, ask }) {
  const [selected, setSelected] = useState(null);
  const plane = selected ? planesFor(data, c).find(p => p.id === selected) : null;
  const kpis = [
    [c.inFlight, data.initiatives.length, XC.electric], [c.openRisks, data.openRisks.length, data.openRisks.length ? XC.crit : XC.ok],
    [c.approvals, data.approvals.length, data.approvals.length ? XC.gold : XC.ok], [c.agentsOn, data.agentsAvail.length, XC.cyan],
    [c.burningN, data.summary.total, data.summary.critical ? XC.crit : XC.ok],
  ];
  return (
    <>
      <div className="gx-deck">
        <div className="gx-col">
          <IssueQueue c={c} issues={data.allIssues} onOpen={onOpen} />
          <LiveFeed c={c} events={data.events} live={data.liveFeed} />
        </div>
        <div className="gx-col gx-mid">
          <section className="gx-panel gx-card" style={{ padding: "18px 18px 16px" }}>
            <div className="gx-card-h"><Boxes size={15} color={XC.cyan} aria-hidden="true" /><span className="gx-label">{c.planes}</span></div>
            <PlaneOrbit c={c} data={data} selected={selected} setSelected={setSelected} />
            <div className="gx-kpis">
              {kpis.map(([k, v, col]) => <div key={k} className="gx-panel gx-kpi"><span style={{ fontSize: 11.5, color: XC.mute }}>{k}</span><b style={{ color: col }}>{v}</b></div>)}
            </div>
          </section>
          <DrillPanel c={c} plane={plane} onOpen={onOpen} onAsk={ask.submit} onClose={() => setSelected(null)} />
          <div className="gx-dock">
            <AskBar c={c} lang={ask.lang} value={ask.q} setValue={ask.setQ} onSubmit={ask.submit} busy={ask.busy} big={false} />
            <AnswerPanel c={c} answer={ask.answer} onClose={() => ask.setAnswer(null)} />
          </div>
          <Lifecycle c={c} initiatives={data.initiatives} />
          <ChainStrip c={c} events={data.events} intact={data.intact} />
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

/* ── shell ──────────────────────────────────────────────────────────────── */
export function IntelligenceExperience({
  mode = "home", role = "caio", userName = "", seeded = true, lang = "en", setLang = () => {},
  onMode = () => {}, onClassic = () => {}, onOpen = () => {}, onSignOut = () => {}, skipIntro = false, setSkipIntro = () => {},
}) {
  useStyles();
  const c = COPY[lang] || COPY.en;
  const data = useExperienceData({ role, seeded });
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
    <div ref={rootRef} className="gx-root" dir={lang === "ar" ? "rtl" : "ltr"} lang={lang} data-testid={`gx-${mode}`}>
      <div className="gx-wrap">
        <Hud c={c} role={role} seeded={seeded} liveFeed={data.liveFeed} lang={lang} setLang={setLang} mode={mode}
          onHome={() => onMode("home")} onDeck={() => onMode("deck")} onClassic={onClassic} onSignOut={onSignOut} now={now} />
        {mode === "deck"
          ? <>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 22 }}>
                <button type="button" className="gx-btn gx-btn-icon" onClick={() => onMode("home")} aria-label={c.home}><ArrowLeft size={16} aria-hidden="true" /></button>
                <h1 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: "clamp(28px,3.4vw,40px)", margin: 0 }}>{c.deck}</h1>
                <span className="gx-rule" />
              </div>
              <CommandDeck c={c} data={data} onOpen={onOpen} ask={ask} />
            </>
          : <IntelligenceHome c={c} data={data} firstName={firstName} role={role} onOpen={onOpen} onDeck={() => onMode("deck")} onClassic={onClassic}
              ask={ask} skipIntro={skipIntro} setSkipIntro={setSkipIntro} />}
      </div>
    </div>
  );
}
