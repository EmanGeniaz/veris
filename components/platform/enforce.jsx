"use client";

import { useState } from "react";
import { T, F, AI_GOLD, AI_GOLD_INK, Card } from "./core";
import { AI_AGENTS, agentPosture } from "@/lib/agent-registry";
import { TOOLCALL_LEDGER, enforceStats, ENFORCE_DECISION_META, issueToken, TOKEN_TTL_SECONDS } from "@/lib/enforce";
import { EGRESS_POLICY, EGRESS_EVENTS, EGRESS_DECISION_META, egressStats } from "@/lib/egress";
import { HITL_GATES, hitlStats } from "@/lib/hitl";
import { breakerSessions, breakerStats, BREAKER_STATES, SIGNALS, stateMeta } from "@/lib/circuit-breaker";
import { PAAS_ENDPOINT, PAAS_CLIENTS, PAAS_KEYS, PAAS_SAMPLES, PAAS_DECISION_META, paasStats } from "@/lib/policy-service";
import { PLANES, estateRows, coverageStats, COVERAGE_CHANNELS } from "@/lib/enforcement-coverage";
import { GUARDRAIL_LAYERS, GUARDRAIL_STATUS, layerStats, guardrailStats } from "@/lib/guardrail-coverage";
import { useLang, ts, registerContent } from "@/lib/i18n";

/* ── shared local primitives (match roadmap/convergence) ──
   The text-bearing primitives translate their own string children/props via
   the global content dictionary (English fallback), so most call sites need
   no change; non-string (interpolated JSX) children pass through untouched. */
const tok = k => ({ crit: T.red, warn: T.amber, info: T.blue, good: T.green, ink3: T.ink3 }[k] || T.ink3);
const cardPad = { padding: 18 };
const useT = () => { const lang = useLang(); return en => (typeof en === "string" ? ts(lang, en) : en); };
const Eyebrow = ({ children, style }) => { const T_ = useT(); return <div style={{ fontSize: 9, letterSpacing: "0.09em", textTransform: "uppercase", color: T.ink4, fontWeight: 900, fontFamily: F.m, ...style }}>{T_(children)}</div>; };
const H3 = ({ children, style }) => { const T_ = useT(); return <h3 style={{ fontFamily: F.h, fontSize: 16, fontWeight: 900, color: T.ink, margin: "4px 0 0", ...style }}>{T_(children)}</h3>; };
const Head = ({ title, sub }) => { const T_ = useT(); return <div style={{ marginBottom: 16 }}><h2 style={{ fontFamily: F.h, fontSize: 24, fontWeight: 900, color: T.ink, margin: 0, letterSpacing: "-0.02em" }}>{T_(title)}</h2><p style={{ fontFamily: F.b, fontSize: 12.5, color: T.ink3, margin: "5px 0 0", maxWidth: 820, lineHeight: 1.6 }}>{T_(sub)}</p></div>; };
const Pill = ({ c, children }) => { const T_ = useT(); return <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 9px", borderRadius: 999, fontSize: 10, fontWeight: 800, fontFamily: F.b, color: c, background: c + "18", border: `1px solid ${c}40` }}>{T_(children)}</span>; };
const Th = ({ children, style }) => { const T_ = useT(); return <th style={{ textAlign: "left", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: T.ink4, fontWeight: 900, fontFamily: F.m, padding: "0 10px 9px", borderBottom: `1px solid ${T.border}`, ...style }}>{T_(children)}</th>; };
const Td = ({ children, style }) => { const T_ = useT(); return <td style={{ padding: "10px", borderBottom: `1px solid ${T.border}`, color: T.ink2, fontSize: 11.5, fontFamily: F.b, verticalAlign: "middle", ...style }}>{T_(children)}</td>; };
const Table = ({ head, children }) => <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr>{head.map(h => <Th key={h}>{h}</Th>)}</tr></thead><tbody>{children}</tbody></table></div>;
const Kpi = ({ l, v, c, sub }) => { const T_ = useT(); return <Card style={{ padding: "13px 15px" }}><Eyebrow>{l}</Eyebrow><div style={{ fontSize: 26, fontWeight: 900, color: c, fontFamily: F.m, margin: "5px 0 2px" }}>{v}</div><div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b }}>{T_(sub)}</div></Card>; };
const kpiGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 14 };
const advisor = children => <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 10, background: AI_GOLD + "12", border: `1px solid ${AI_GOLD}30`, fontSize: 11, color: T.ink2, lineHeight: 1.6, fontFamily: F.b }}><b style={{ color: AI_GOLD_INK }}>Veris Intelligence:</b> {children}</div>;
const decPill = d => { const m = ENFORCE_DECISION_META[d] || { label: d, tone: "ink3" }; return <Pill c={tok(m.tone)}>{m.label}</Pill>; };

/* Arabic for the Veris Enforce plane (8 surfaces). Interpolated analyst notes
   ("Veris Intelligence: …") and data-woven KPI sublabels fall back to English
   by design; product/model names, hosts, hashes and figures stay English. */
registerContent({
  // ── shared / enumerations (lib-sourced labels rendered via T_) ──
  "Enforced": "مُنفَّذ", "Observed": "مُراقَب", "Shadow": "ظِلّي", "Plane": "المستوى",
  "granted": "ممنوح", "not granted": "غير ممنوح", "Allow": "سماح", "Mask": "إخفاء", "Block": "حجب",
  "Allowed": "مسموح", "Denied": "مرفوض", "Active": "نشط", "Live": "مباشر", "Rotate": "تدوير",
  "Intact": "سليمة", "Broken": "مكسورة", "High": "عالٍ", "Medium": "متوسط", "Low": "منخفض",
  "Shadow tool": "أداة ظِلّية", "SaaS feature": "ميزة SaaS", "Sanctioned": "مُصرَّح بها",
  "Veris can:": "يستطيع Veris:",
  // ── EnforcementOverview ──
  "Veris Enforce": "Veris Enforce",
  "The enforcement plane. Governance says what an agent may do; Enforce decides, at call time, what it does — and records both, tamper-evidently. Controls hold around the model, not inside it: a more capable model is better at being argued out of its instructions, but no better at forging a capability token or reaching a destination the egress policy denies.": "مستوى الإنفاذ. تقول الحوكمة ما يجوز للوكيل فعله؛ ويقرّر Enforce، وقت الاستدعاء، ما يفعله — ويسجّل كليهما بشكل مقاوم للعبث. تصمد الضوابط حول النموذج، لا داخله: النموذج الأقوى أفضل في أن يُقنَع بالخروج عن تعليماته، لكنه ليس أفضل في تزوير رمز قدرة أو بلوغ وجهة تمنعها سياسة الخروج.",
  "Tool calls (window)": "استدعاءات الأدوات (النافذة)", "Contained": "محتوى", "Prevented breaches": "خروقات مُمنَعة",
  "Least-privilege index": "مؤشّر أقل صلاحية", "Ledger chain": "سلسلة السجل",
  "ungranted tool reached for — stopped": "أداة غير ممنوحة جرى بلوغها — أُوقِفت", "every call re-hashed": "كل استدعاء يُعاد بصمه",
  "The closed loop · policy → enforcement → evidence": "الحلقة المغلقة · السياسة ← الإنفاذ ← الدليل",
  "One control set, three planes": "مجموعة ضوابط واحدة، ثلاثة مستويات",
  "Policy": "السياسة", "VerisZone control plane": "مستوى تحكّم VerisZone",
  "Capabilities, oversight rules & data scopes are declared per agent.": "تُعلَن القدرات وقواعد الإشراف ونطاقات البيانات لكل وكيل.",
  "Enforcement": "الإنفاذ", "Every tool call is decided at runtime — deny-by-default, tokens, egress & HITL.": "كل استدعاء أداة يُقرَّر وقت التشغيل — المنع افتراضياً، والرموز، والخروج، والإنسان في الحلقة.",
  "Evidence": "الدليل", "Article 12 chain": "سلسلة المادة 12",
  "Each decision is signed into a tamper-evident ledger the board & auditors read.": "كل قرار يُوقَّع في سجل مقاوم للعبث يقرأه المجلس والمدقّقون.",
  "✦ Export enforcement posture": "✦ تصدير وضع الإنفاذ",
  // ── EnforcementCoverage ──
  "Enforcement Coverage": "تغطية الإنفاذ",
  "Veris Enforce decides what an agent does only where the agent's traffic runs through the plane — enforcement is a chokepoint, not action at a distance. This is the honest split of the AI estate: what is enforced inline, what is observed out-of-band, and what is still shadow. Building the AI in VerisZone is not the requirement; routing its model, tool and egress traffic through the plane is.": "يقرّر Veris Enforce ما يفعله الوكيل فقط حيث تمرّ حركته عبر المستوى — الإنفاذ نقطة اختناق، لا فعل عن بُعد. هذا هو التقسيم الصادق لبيئة الذكاء الاصطناعي: ما يُنفَّذ مباشرةً، وما يُراقَب خارج المسار، وما لا يزال ظِلّياً. بناء الذكاء الاصطناعي في VerisZone ليس المطلوب؛ بل توجيه حركة نموذجه وأدواته وخروجه عبر المستوى.",
  "Enforced inline": "مُنفَّذ مباشرةً", "Observed only": "مُراقَب فقط", "At least visible": "مرئي على الأقل",
  "The three planes · what control reaches where": "المستويات الثلاثة · أين تصل السيطرة",
  "Inline control · out-of-band observation · shadow": "سيطرة مباشرة · مراقبة خارج المسار · ظِلّي",
  "Every AI system, and the chokepoint that governs it": "كل نظام ذكاء اصطناعي، ونقطة الاختناق التي تحكمه",
  "Show all planes": "عرض كل المستويات",
  "System": "النظام", "Unit": "الوحدة", "Owner": "المالك", "Kind": "النوع", "Model": "النموذج",
  "Chokepoint / mechanism": "نقطة الاختناق / الآلية",
  "Coverage by business unit · where the blind spots are": "التغطية حسب وحدة الأعمال · أين النقاط العمياء",
  "Shadow concentrates in the unit, not the platform": "الظِّل يتركّز في الوحدة، لا في المنصة",
  "The channels · what puts a system on each plane": "القنوات · ما يضع نظاماً على كل مستوى",
  "One rulebook, every chokepoint": "كتاب قواعد واحد، كل نقطة اختناق",
  "Draft onboarding plan": "صياغة خطة الإدماج", "Export coverage report": "تصدير تقرير التغطية",
  // ── Policy-as-a-Service ──
  "Policy-as-a-Service": "السياسة كخدمة",
  "The policy engine, exposed as a callable service. The same DLP + classification rulebook the AI Gateway enforces inline is available at one endpoint, so a browser extension, a CASB, a forward proxy or a CI pipeline can enforce it on AI traffic that never touches the in-app gateway. It returns allow · mask · block with the masked text to substitute — and signs every verdict into the same evidence chain.": "محرّك السياسة، مكشوفاً كخدمة قابلة للاستدعاء. كتاب قواعد منع تسرّب البيانات والتصنيف نفسه الذي تُنفِّذه بوابة الذكاء الاصطناعي مباشرةً متاح عند نقطة نهاية واحدة، فيمكن لإضافة متصفّح أو CASB أو وكيل تمرير أو مسار CI إنفاذه على حركة ذكاء اصطناعي لا تمسّ البوابة داخل التطبيق أبداً. يُعيد سماح · إخفاء · حجب مع النص المُخفَى للاستبدال — ويُوقّع كل حُكم في سلسلة الأدلة نفسها.",
  "Inspections (window)": "الفحوص (النافذة)", "Allow / Mask / Block": "سماح / إخفاء / حجب",
  "Prevented exfiltration": "تسريب مُمنَع", "block verdicts — data that never left": "أحكام حجب — بيانات لم تغادر قط",
  "Median verdict": "الحُكم الوسيط", "no model call — pure judgement": "دون استدعاء نموذج — حُكم صِرف",
  "Active keys": "مفاتيح نشطة", "x-veris-key, per channel": "x-veris-key، لكل قناة",
  "The service · one rulebook, every channel": "الخدمة · كتاب قواعد واحد، كل قناة",
  "Policy the whole enterprise can call": "سياسة يمكن للمؤسسة كلها استدعاؤها",
  "Any client": "أي عميل", "Gateway · extension · CASB · CI/CD": "البوابة · الإضافة · CASB · CI/CD",
  "One rulebook, whatever the channel — including shadow-AI traffic that never touches the app.": "كتاب قواعد واحد، أياً كانت القناة — بما فيها حركة الذكاء الاصطناعي الظِّلّي التي لا تمسّ التطبيق قط.",
  "Inspect": "افحص", "Stateless verdict — classify, mask or block. No model is called; it only judges text.": "حُكم عديم الحالة — تصنيف أو إخفاء أو حجب. لا يُستدعى أي نموذج؛ يحكم على النص فقط.",
  "Every verdict appends a hash of the text + what fired — never the raw sensitive content.": "كل حُكم يُلحِق بصمة للنص + ما تفعّل — لا المحتوى الحسّاس الخام أبداً.",
  "Live inspection · calls the real endpoint": "فحص مباشر · يستدعي نقطة النهاية الحقيقية",
  "Send text through the service": "أرسِل نصاً عبر الخدمة", "Substitute text": "نص بديل",
  "Blocked — the client must not forward this content.": "محجوب — يجب ألا يُمرِّر العميل هذا المحتوى.",
  "Connected channels · who calls the service": "القنوات المتصلة · من يستدعي الخدمة",
  "Every channel, one policy": "كل قناة، سياسة واحدة",
  "Channel": "القناة", "Type": "النوع", "Status": "الحالة", "Inspections": "الفحوص", "Coverage": "التغطية",
  "Inspection keys · x-veris-key": "مفاتيح الفحص · x-veris-key", "One key per channel, rotatable": "مفتاح لكل قناة، قابل للتدوير",
  "+ Issue key": "+ إصدار مفتاح", "New key — shown once": "مفتاح جديد — يُعرَض مرة واحدة",
  "Key": "المفتاح", "Scope": "النطاق", "Secret": "السرّ", "Created": "أُنشئ",
  // ── Agent Authority ──
  "Agent Authority": "صلاحية الوكيل",
  "No agent holds a standing key. To call a tool it must be issued a capability token — short-lived, scoped to a data domain, and authorising exactly one tool. Issuance runs the least-privilege boundary first, so an ungranted or high-stakes call never mints a token. Over-privilege — a granted capability never exercised and not gated — is the standing attack surface this removes.": "لا يحمل أي وكيل مفتاحاً دائماً. لاستدعاء أداة يجب أن يُصدَر له رمز قدرة — قصير العمر، محدّد النطاق بمجال بيانات، ويُصرّح بأداة واحدة بالضبط. يُشغّل الإصدار حدّ أقل صلاحية أولاً، فلا يسكّ استدعاء غير ممنوح أو عالي المخاطر رمزاً أبداً. الإفراط في الصلاحية — قدرة ممنوحة لا تُمارَس قط ولا تُقيَّد ببوابة — هو سطح الهجوم الدائم الذي يزيله هذا.",
  "Agents governed": "وكلاء مُحوكَمون", "registered, owned objects": "كائنات مُسجَّلة ومملوكة",
  "grants actually exercised": "منح تُمارَس فعلاً", "Over-privileged": "مفرطو الصلاحية", "standing, un-exercised grants": "منح دائمة غير مُمارَسة",
  "High-stakes gated": "عالية المخاطر مُقيَّدة", "behind human approval": "خلف موافقة بشرية",
  "Token TTL": "عمر الرمز", "per-call, then void": "لكل استدعاء، ثم يبطل",
  "Request a capability token · the runtime boundary": "اطلب رمز قدرة · حدّ وقت التشغيل",
  "Issue a scoped, short-lived token": "أصدِر رمزاً محدّد النطاق قصير العمر",
  "Agent": "الوكيل", "Tool call": "استدعاء الأداة", "Request token": "اطلب الرمز",
  "Token issued": "صُدِر الرمز", "Gated to human approval": "مُقيَّد بموافقة بشرية", "Denied by default": "مرفوض افتراضياً",
  "Per-agent authority · least privilege": "صلاحية كل وكيل · أقل صلاحية",
  "Granted capabilities vs standing surface": "القدرات الممنوحة مقابل السطح الدائم",
  "Granted": "ممنوح", "Exercised": "مُمارَس", "Over-priv": "إفراط صلاحية", "LP score": "درجة أقل صلاحية",
  // ── Tool-Call Ledger ──
  "Tool-Call Ledger": "سجل استدعاءات الأدوات",
  "The audit artifact nobody else owns: prove what your agents were allowed to do, and prove what they actually did. Every tool call is one signed row — the authorised grant beside the actual call, the deterministic decision, its token, and a hash chained to the row before it. Change any row and every later hash breaks. This is the record EU AI Act Art.12 and ISO 42001 push toward.": "أثر التدقيق الذي لا يملكه سواك: أثبِت ما سُمِح لوكلائك بفعله، وأثبِت ما فعلوه فعلاً. كل استدعاء أداة صفٌّ مُوقَّع — المنح المُصرَّح به بجوار الاستدعاء الفعلي، والقرار الحتمي، ورمزه، وبصمة مُسلسَلة بالصف الذي قبله. غيّر أي صف فتنكسر كل بصمة لاحقة. هذا هو السجل الذي تدفع نحوه المادة 12 من قانون الذكاء الأوروبي وISO 42001.",
  "Calls recorded": "استدعاءات مُسجَّلة", "this window": "هذه النافذة", "within grant": "ضمن المنح",
  "Escalated": "مُصعَّد", "gated to a human": "مُقيَّد بإنسان", "Blocked · egress": "محجوب · خروج",
  "contained at the boundary": "محتوى عند الحدود", "Chain": "السلسلة", "every row re-hashed": "كل صف يُعاد بصمه",
  "Signed tool-call record · authorised vs actual": "سجل استدعاءات موقّع · المُصرَّح مقابل الفعلي",
  "Tamper-evident hash chain": "سلسلة بصمات مقاومة للعبث",
  "✓ Verify chain": "✓ تحقّق من السلسلة", "Chain broken": "السلسلة مكسورة",
  "Tool call ": "استدعاء الأداة", "Authorised": "المُصرَّح به", "Decision": "القرار", "Token": "الرمز", "Risk": "الخطر", "Hash": "البصمة",
  // ── Egress Policy ──
  "Egress Policy": "سياسة الخروج",
  "The containment guarantee: a successful injection cannot reach money, data, or the internet. Least privilege stops an agent calling a tool it doesn't hold; egress policy stops the tools it does hold from reaching a destination they shouldn't. Enforced on the destination — an allow-list plus named deny categories, never a text classifier — so it holds against a more capable model. Closes data-exfiltration and SSRF against the cloud metadata service.": "ضمانة الاحتواء: حقن ناجح لا يمكنه بلوغ المال أو البيانات أو الإنترنت. أقل صلاحية يمنع الوكيل من استدعاء أداة لا يملكها؛ وسياسة الخروج تمنع الأدوات التي يملكها من بلوغ وجهة لا يجب. مُنفَّذة على الوجهة — قائمة سماح إضافةً إلى فئات منع مُسمّاة، لا مصنّف نصوص أبداً — فتصمد أمام نموذج أقوى. تُغلق تسريب البيانات وهجمات SSRF على خدمة بيانات السحابة الوصفية.",
  "Egress attempts": "محاولات الخروج", "to allow-listed hosts": "إلى مضيفين في قائمة السماح",
  "SSRF blocked": "SSRF محجوب", "metadata-service theft stopped": "سرقة خدمة البيانات الوصفية أُوقِفت",
  "Allow-list": "قائمة السماح", "explicit destinations": "وجهات صريحة",
  "Egress attempts · destination decisions": "محاولات الخروج · قرارات الوجهة", "What the tools tried to reach": "ما حاولت الأدوات بلوغه",
  "Destination": "الوجهة", "Why": "السبب",
  "Egress policy · allow-list + deny categories": "سياسة الخروج · قائمة السماح + فئات المنع",
  "Deny-by-default destinations": "وجهات المنع افتراضياً", "Category": "الفئة", "Note": "ملاحظة",
  "✦ Export egress policy": "✦ تصدير سياسة الخروج",
  // ── HITL Gates ──
  "Human-in-the-Loop Gates": "بوابات الإنسان في الحلقة",
  "High-impact actions are gated behind human approval — with a threshold, so the gate fires only where it matters. An agent auto-runs the routine and routes the consequential to a person, rather than a blanket approve-everything that trains people to rubber-stamp. Maps to EU AI Act Art.14 (human oversight) and Art.22 (no solely-automated decision with legal effect).": "الإجراءات عالية الأثر محجوبة خلف موافقة بشرية — بعتبة، فلا تعمل البوابة إلا حيث يهم. يُشغّل الوكيل الروتيني تلقائياً ويُوجّه المصيري إلى شخص، بدلاً من موافقة شاملة على كل شيء تُدرّب الناس على الختم دون تدقيق. مربوطة بالمادة 14 من قانون الذكاء الأوروبي (الإشراف البشري) والمادة 22 (لا قرار آلي بحت ذو أثر قانوني).",
  "Gates": "البوابات", "high-impact actions": "إجراءات عالية الأثر", "Pending approvals": "موافقات معلّقة",
  "awaiting a human now": "بانتظار إنسان الآن", "Always-gated": "مُقيَّدة دائماً", "legal-effect actions": "إجراءات ذات أثر قانوني",
  "Threshold-gated": "مُقيَّدة بعتبة", "fire above a trip point": "تعمل فوق نقطة تعثّر", "Art.14 / 22": "المادة 14 / 22",
  "regulator-mapped gates": "بوابات مربوطة بالمنظّم",
  "Approval gates · where autonomy stops": "بوابات الموافقة · حيث يتوقّف الاستقلال",
  "Action · threshold · approver": "الإجراء · العتبة · المُعتمِد",
  "Action": "الإجراء", "Trips when": "يتعثّر متى", "Approver": "المُعتمِد", "SLA": "اتفاقية الخدمة", "Basis": "الأساس", "Pending": "معلّق",
  // ── Circuit Breaker ──
  "Circuit Breaker": "قاطع الدائرة",
  "Static gates say what an agent may never do. The circuit breaker adds the dynamic half — it watches each agent's risk signal as a session runs and revokes capability in real time the moment it crosses a threshold, before the agent reaches a human gate. Tokens are short-lived (90s) and per-call, so revocation is instant: the agent's tokens hit a revocation list and the next issuance is refused. Every trip is written to the Article 12 chain. This is the continuous, adaptive oversight EU AI Act Art.14 requires.": "تقول البوابات الثابتة ما لا يجوز للوكيل فعله أبداً. يضيف قاطع الدائرة النصف الديناميكي — يراقب إشارة خطر كل وكيل بينما تجري الجلسة ويُلغي القدرة في الوقت الحقيقي لحظة تجاوزها العتبة، قبل أن يبلغ الوكيل بوابة بشرية. الرموز قصيرة العمر (90 ثانية) ولكل استدعاء، فالإلغاء فوري: تصطدم رموز الوكيل بقائمة إلغاء ويُرفض الإصدار التالي. كل تعثّر يُكتب في سلسلة المادة 12. هذا هو الإشراف المستمر المتكيّف الذي تتطلّبه المادة 14 من قانون الذكاء الأوروبي.",
  "Sessions watched": "جلسات مُراقَبة", "live, this window": "مباشرة، هذه النافذة", "Breaker tripped": "تعثّر القاطع",
  "downscoped · suspended · halted": "مُضيَّق · مُعلَّق · مُوقَف", "Tokens revoked": "رموز مُلغاة", "Routed to human": "مُوجَّه لإنسان",
  "Art.14 escalation": "تصعيد المادة 14",
  "The escalation ladder · risk score → automatic action": "سلّم التصعيد · درجة الخطر ← إجراء آلي",
  "Graduated response, not a single kill-switch": "استجابة متدرّجة، لا مفتاح إيقاف واحد",
  "Live sessions · score & state computed from signals": "جلسات مباشرة · الدرجة والحالة محسوبتان من الإشارات",
  "What the breaker did, and why": "ما فعله القاطع، ولماذا",
  "Session": "الجلسة", "Risk signals": "إشارات الخطر", "Score": "الدرجة", "Breaker": "القاطع",
  "Capability revoked": "القدرة المُلغاة", "Art.12": "المادة 12",
  "✦ Export breaker trips": "✦ تصدير تعثّرات القاطع",
});

/* Arabic for the lib-sourced enumeration labels these surfaces render
   (planes, channels, decisions, egress categories, HITL gates, breaker
   states & signals). Rendered via the translating primitives / T_. */
registerContent({
  // planes (enforcement-coverage)
  "Inline on the plane": "مباشرةً على المستوى", "Out-of-band telemetry": "قياس خارج المسار", "Detected, ungoverned": "مكتشَف، غير مُحوكَم",
  "App": "تطبيق",
  "Block · mask · revoke · scope · deny egress — in real time": "حجب · إخفاء · إلغاء · تحديد نطاق · منع خروج — في الوقت الحقيقي",
  "Alert · mask risky paste at the edge — not the model action itself": "تنبيه · إخفاء اللصق الخطر على الحافة — لا فعل النموذج نفسه",
  "See · flag · recommend onboarding — nothing is enforced yet": "رؤية · وسم · التوصية بالإدماج — لا شيء مُنفَّذ بعد",
  "Model calls route through the Gateway; tool calls run on short-lived capability tokens behind deny-by-default egress.": "استدعاءات النموذج تُوجَّه عبر البوابة؛ واستدعاءات الأدوات تعمل برموز قدرة قصيرة العمر خلف خروج بالمنع افتراضياً.",
  "A third-party AI feature Veris is not inline on. The CASB / browser-extension fleet inspects paste & egress; the model call is not inline-controllable.": "ميزة ذكاء اصطناعي من طرف ثالث ليس Veris مباشراً عليها. يفحص أسطول CASB / إضافة المتصفح اللصق والخروج؛ واستدعاء النموذج غير قابل للتحكّم المباشر.",
  "Surfaced by egress telemetry / the browser extension. No control until it is routed onto the plane.": "يظهر عبر قياس الخروج / إضافة المتصفح. لا سيطرة حتى يُوجَّه إلى المستوى.",
  // decision metas (enforce + egress)
  "Blocked": "محجوب", "Masked": "مُخفَى", "Egress-deny": "منع خروج", "SSRF-deny": "منع SSRF",
  // egress categories + notes
  "allow": "سماح", "default": "افتراضي", "denied": "مرفوض", "internal": "داخلي", "metadata": "بيانات وصفية",
  "Approved notification webhook": "خطاف إشعار معتمد", "Cloud metadata service — SSRF target, always denied": "خدمة بيانات السحابة الوصفية — هدف SSRF، يُرفض دائماً",
  "Internal services — no agent egress to internal from external-facing agents": "خدمات داخلية — لا خروج من الوكلاء الخارجيين إلى الداخل",
  "Known exfiltration sink": "مصبّ تسريب معروف", "Model gateway — the only model egress": "بوابة النموذج — الخروج الوحيد للنموذج",
  "Unknown destination — denied by default": "وجهة مجهولة — تُرفض افتراضياً",
  // PAAS clients / samples / types / notes
  "Clean request": "طلب نظيف", "Customer PII": "بيانات عميل شخصية", "Leaked secret": "سرّ مُسرَّب", "Payment card": "بطاقة دفع",
  "First-party": "طرف أول", "Network": "شبكة", "Pipeline": "مسار", "Shadow-AI": "ذكاء ظِلّي", "Third-party": "طرف ثالث",
  "In-app AI Gateway": "بوابة الذكاء الاصطناعي داخل التطبيق", "Browser extension fleet": "أسطول إضافة المتصفح",
  "CASB / forward proxy": "CASB / وكيل تمرير", "CI/CD content guardrail": "حاجز محتوى CI/CD", "Partner API (sandbox)": "واجهة شريك (بيئة تجريبية)",
  "Every governed model call, inline.": "كل استدعاء نموذج مُحوكَم، مباشرةً.", "Paste / upload guard on claude.ai, ChatGPT, Gemini, Copilot.": "حارس اللصق / الرفع على claude.ai وChatGPT وGemini وCopilot.",
  "Egress inspection at the network edge.": "فحص الخروج على حافة الشبكة.", "Blocks secrets / PII in prompts committed to repos.": "يحجب الأسرار / البيانات الشخصية في المطالبات المُودَعة في المستودعات.",
  "External ISV evaluating inline DLP.": "مورّد برمجيات خارجي يُقيّم منع تسرّب البيانات المباشر.",
  "Within policy — passed through.": "ضمن السياسة — مُرِّر.", "Sensitive data redacted at the boundary.": "بيانات حسّاسة نُقِّحت عند الحدود.", "Denied — nothing sensitive left the edge.": "مرفوض — لم يغادر شيء حسّاس الحافة.",
  // HITL gates
  "Adverse credit decision": "قرار ائتمان ضار", "Bulk employee notification": "إشعار موظفين جماعي", "Email a customer directly": "مراسلة عميل مباشرة",
  "Freeze a customer account": "تجميد حساب عميل", "Post journal to the GL": "ترحيل قيد إلى الأستاذ العام",
  "amount ≥ $50,000": "المبلغ ≥ 50٬000 دولار", "any account freeze": "أي تجميد حساب", "any adverse decision with legal effect": "أي قرار ضار ذي أثر قانوني",
  "any outbound customer email": "أي بريد صادر لعميل", "recipients ≥ 100": "المستلمون ≥ 100",
  "Credit Officer": "مسؤول ائتمان", "Financial Controller": "المراقب المالي", "Fraud Lead": "قائد مكافحة الاحتيال", "HR Business Partner": "شريك أعمال الموارد البشرية", "Support Manager": "مدير الدعم",
  "Comms policy": "سياسة التواصل", "Customer-impact policy": "سياسة أثر العملاء", "EU AI Act Art.14 · HITL": "المادة 14 · الإنسان في الحلقة", "EU AI Act Art.22": "المادة 22", "SOX dual approval": "موافقة SOX المزدوجة",
  "1 business day": "يوم عمل واحد", "1h": "ساعة", "2h": "ساعتان", "4h": "4 ساعات",
  // breaker states + signals
  "Normal": "عادي", "Downscoped": "مُضيَّق", "Suspended": "مُعلَّق", "Halted": "مُوقَف",
  "Full grants · monitoring only": "منح كاملة · مراقبة فقط", "Non-read capabilities revoked · read-only": "إلغاء القدرات غير القرائية · قراءة فقط",
  "Autonomous action halted · routed to human": "إيقاف الفعل المستقل · تُوجَّه لإنسان", "Session terminated · all tokens revoked": "إنهاء الجلسة · إلغاء كل الرموز",
  "Behavioural drift (PSI)": "انحراف سلوكي (PSI)", "Egress to untrusted host": "خروج إلى مضيف غير موثوق", "Guardrail violation": "انتهاك حاجز",
  "Prompt-injection attempt": "محاولة حقن إدخالات", "Sensitive-data volume spike": "قفزة في حجم البيانات الحسّاسة", "Tool-call rate anomaly": "شذوذ معدّل استدعاء الأدوات",
  "→ human": "← إنسان",
  // small UI fragments introduced by T_ wrapping
  "system": "نظام", "systems": "أنظمة", "Rule fired:": "القاعدة التي تفعّلت:",
  "agent": "الوكيل", "tool": "الأداة", "scope:": "النطاق:", "ttl": "العمر",
  "No token minted · control:": "لم يُسكّ رمز · الضابط:", "No approvals pending": "لا موافقات معلّقة",
  "none · monitoring": "لا شيء · مراقبة", "Inspecting…": "قيد الفحص…",
});

/* Arabic for the deeper lib-sourced data cells (egress-event reasons, estate
   mechanisms, ledger action/scope/detail rows) rendered through Td / T_. */
registerContent({
  // egress event reasons
  "External-facing agent reaching an internal service — denied": "وكيل موجّه للخارج يبلغ خدمة داخلية — رُفض",
  "Injection tried to exfiltrate context to a known sink — denied": "حاول الحقن تسريب السياق إلى مصبّ معروف — رُفض",
  "Model gateway — allow-listed": "بوابة النموذج — في قائمة السماح",
  "SSRF against cloud metadata — credential theft attempt, denied": "SSRF على بيانات السحابة الوصفية — محاولة سرقة اعتماد، رُفض",
  // estate mechanisms
  "Browser-extension egress telemetry — detected": "قياس خروج إضافة المتصفح — مكتشَف",
  "Browser-extension paste/upload guard": "حارس اللصق/الرفع في إضافة المتصفح",
  "CASB egress + audit-log ingest": "خروج CASB + استيعاب سجل التدقيق",
  "CASB egress + browser-extension paste DLP": "خروج CASB + منع تسرّب لصق إضافة المتصفح",
  "CASB egress inspection": "فحص خروج CASB", "CASB flagged upload to unknown AI host": "وسم CASB رفعاً إلى مضيف ذكاء اصطناعي مجهول",
  "CI/CD content guardrail + endpoint telemetry": "حاجز محتوى CI/CD + قياس نقطة النهاية",
  "Capability tokens + egress + HITL gate": "رموز قدرة + خروج + بوابة الإنسان في الحلقة",
  "Capability tokens + egress + circuit breaker": "رموز قدرة + خروج + قاطع دائرة",
  "Capability tokens + egress deny-by-default": "رموز قدرة + خروج بالمنع افتراضياً",
  "Endpoint egress to consumer AI host — detected": "خروج نقطة النهاية إلى مضيف ذكاء اصطناعي استهلاكي — مكتشَف",
  "Gateway (inline) + PII masking + egress": "البوابة (مباشرةً) + إخفاء البيانات الشخصية + خروج",
  "Gateway (inline) + RAG grounding + disclosure": "البوابة (مباشرةً) + تأريض RAG + إفصاح",
  "Gateway (inline) + capability tokens + egress": "البوابة (مباشرةً) + رموز قدرة + خروج",
  // ledger action / scope / detail cells
  "Grounded answer from the knowledge base": "إجابة مؤرَّضة من قاعدة المعرفة", "Risk score computed": "حُسِبت درجة الخطر",
  "Adverse decision — routed to human approval (Art.22)": "قرار ضار — وُجِّه لموافقة بشرية (المادة 22)",
  "Fetch to an untrusted host — egress policy denied (SSRF class)": "جلب من مضيف غير موثوق — رفضته سياسة الخروج (فئة SSRF)",
  "Accounts reconciled": "سُوِّيت الحسابات", "Account freeze — high-stakes, gated to a human": "تجميد حساب — عالي المخاطر، مُقيَّد بإنسان",
  "Injection tried to exfiltrate via email — tool not in grant, blocked": "حاول الحقن التسريب عبر البريد — الأداة خارج المنح، حُجب",
  "Read bureau record under CTRL-GRC-044": "قراءة سجل المكتب بموجب CTRL-GRC-044", "Suspicious transaction flagged": "وُسِمت معاملة مشبوهة",
  "Tool not in this agent's set — denied by default (least privilege)": "الأداة خارج مجموعة هذا الوكيل — تُرفض افتراضياً (أقل صلاحية)",
  "Least-privilege boundary": "حدّ أقل صلاحية",
  "Applications": "الطلبات", "Bureau data": "بيانات المكتب", "Open web": "الويب المفتوح", "Reconciliations": "التسويات", "Transaction stream": "دفق المعاملات",
  // COVERAGE_CHANNELS role descriptions
  "Inline chokepoint — the only place the model action itself is decided": "نقطة اختناق مباشرة — المكان الوحيد الذي يُقرَّر فيه فعل النموذج نفسه",
  "Edge DLP on consumer AI — turns shadow into observed": "منع تسرّب على الحافة للذكاء الاصطناعي الاستهلاكي — يحوّل الظِّل إلى مُراقَب",
  "Network egress inspection — observes third-party AI traffic": "فحص خروج الشبكة — يراقب حركة الذكاء الاصطناعي من طرف ثالث",
  "Pipeline / partner inspection": "فحص المسار / الشريك",
  // business units (estate + by-unit tables)
  "Customer Operations": "عمليات العملاء", "Engineering": "الهندسة", "Enterprise": "المؤسسة",
  "Marketing": "التسويق", "People": "الموارد البشرية", "Sales": "المبيعات",
});

/* ══════════════ ENFORCEMENT OVERVIEW — the closed loop ══════════════ */
export function EnforcementOverview({ showToast }) {
  const T_ = useT(); const ar = useLang() === "ar";
  const s = enforceStats();
  const loop = [
    ["Policy", "VerisZone control plane", "Capabilities, oversight rules & data scopes are declared per agent.", T.blue],
    ["Enforcement", "Veris Enforce", "Every tool call is decided at runtime — deny-by-default, tokens, egress & HITL.", AI_GOLD],
    ["Evidence", "Article 12 chain", "Each decision is signed into a tamper-evident ledger the board & auditors read.", T.green],
  ];
  return <div style={{ animation: "up .3s ease" }}>
    <Head title="Veris Enforce" sub="The enforcement plane. Governance says what an agent may do; Enforce decides, at call time, what it does — and records both, tamper-evidently. Controls hold around the model, not inside it: a more capable model is better at being argued out of its instructions, but no better at forging a capability token or reaching a destination the egress policy denies." />
    <div style={kpiGrid}>
      <Kpi l="Tool calls (window)" v={String(s.total)} c={AI_GOLD} sub={`${s.agentsGoverned} agents governed`} />
      <Kpi l="Contained" v={String(s.contained)} c={T.green} sub={`${s.containmentRate}% blocked · gated · egress-denied`} />
      <Kpi l="Prevented breaches" v={String(s.preventedBreaches)} c={T.red} sub="ungranted tool reached for — stopped" />
      <Kpi l="Least-privilege index" v={`${s.leastPrivilegeIndex}%`} c={s.leastPrivilegeIndex >= 80 ? T.green : T.amber} sub={`${s.overPrivileged} agents over-privileged`} />
      <Kpi l="Ledger chain" v={s.intact ? "Intact" : "Broken"} c={s.intact ? T.green : T.red} sub="every call re-hashed" />
    </div>
    <Card style={cardPad}>
      <Eyebrow>The closed loop · policy → enforcement → evidence</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>One control set, three planes</H3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
        {loop.map(([k, who, desc, c], i) => <div key={k} style={{ position: "relative", padding: "14px 15px", borderRadius: 11, background: c + "0e", border: `1px solid ${c}33` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ width: 22, height: 22, borderRadius: 6, background: c + "22", color: c, fontFamily: F.m, fontWeight: 900, fontSize: 11, display: "grid", placeItems: "center" }}>{i + 1}</span>
            <div><div style={{ fontSize: 12.5, fontWeight: 900, color: T.ink, fontFamily: F.b }}>{T_(k)}</div><div style={{ fontSize: 9.5, color: c, fontWeight: 800, fontFamily: F.m, textTransform: "uppercase", letterSpacing: "0.06em" }}>{T_(who)}</div></div>
          </div>
          <p style={{ fontSize: 11, color: T.ink3, fontFamily: F.b, lineHeight: 1.55, margin: 0 }}>{T_(desc)}</p>
        </div>)}
      </div>
      {advisor(ar ? <>هذه هي الفجوة التي لا يُغلقها مزوّدو الحواجز ولا مزوّدو الحوكمة والمخاطر والامتثال: الإنفاذ دون حوكمة جدارُ حماية لا يستطيع أحد تفسيره لمجلس؛ والحوكمة دون إنفاذ جدول بيانات. حجب Enforce {s.preventedBreaches} استدعاء أداة غير ممنوح في هذه النافذة — كلٌّ منها حقن أو تجاوز لم يبلغ المال أو البيانات أو الإنترنت، وكلٌّ مكتوب في سلسلة الأدلة نفسها التي يقرأها سجل المادة 12.</> : <>This is the gap neither the guardrail vendors nor the GRC vendors close: enforcement without governance is a firewall nobody can explain to a board; governance without enforcement is a spreadsheet. Enforce blocked {s.preventedBreaches} ungranted tool call{s.preventedBreaches === 1 ? "" : "s"} in this window — each one an injection or over-reach that never reached money, data, or the internet, and each written to the same evidence chain the Article 12 log reads.</>)}
      <div style={{ marginTop: 12 }}>
        <button onClick={() => showToast && showToast(T_("Enforcement posture exported — decisions reconciled to the Article 12 evidence chain"))} style={{ background: AI_GOLD, border: "none", borderRadius: 11, padding: "10px 17px", color: "#0b0e24", fontSize: 12, fontWeight: 800, fontFamily: F.b, cursor: "pointer" }}>{T_("✦ Export enforcement posture")}</button>
      </div>
    </Card>
  </div>;
}

/* ══════════════ ENFORCEMENT COVERAGE — where control actually reaches ══════════════ */
export function EnforcementCoverage({ showToast }) {
  const T_ = useT(); const ar = useLang() === "ar";
  const s = coverageStats();
  const rows = estateRows();
  const [plane, setPlane] = useState("all");
  const shown = rows.filter(r => plane === "all" || r.plane === plane);
  const planeTone = p => tok(PLANES[p].tone);
  const kpis = [
    ["Enforced inline", `${s.enforcedPct}%`, planeTone("enforced"), ar ? `${s.enforced} من ${s.total} نظاماً · سيطرة فورية` : `${s.enforced} of ${s.total} systems · real-time control`, "enforced"],
    ["Observed only", `${s.observedPct}%`, planeTone("observed"), ar ? `${s.observed} أنظمة · منع تسرّب على الحافة، دون سيطرة مباشرة` : `${s.observed} systems · edge DLP, no inline control`, "observed"],
    ["Shadow", `${s.shadowPct}%`, planeTone("shadow"), ar ? `${s.shadow} أنظمة · مكتشَفة، غير مُحوكَمة` : `${s.shadow} systems · detected, ungoverned`, "shadow"],
    ["At least visible", `${s.governedPct}%`, AI_GOLD, ar ? "مُنفَّذ + مُراقَب — والباقي نقطة عمياء" : "enforced + observed — the rest is blind spot", "all"],
  ];
  return <div style={{ animation: "up .3s ease" }}>
    <Head title="Enforcement Coverage" sub="Veris Enforce decides what an agent does only where the agent's traffic runs through the plane — enforcement is a chokepoint, not action at a distance. This is the honest split of the AI estate: what is enforced inline, what is observed out-of-band, and what is still shadow. Building the AI in VerisZone is not the requirement; routing its model, tool and egress traffic through the plane is." />

    <div style={kpiGrid}>
      {kpis.map(([l, v, c, sub, key]) => <button key={l} onClick={() => setPlane(key)} style={{ textAlign: "left", cursor: "pointer", background: plane === key ? c + "12" : T.card, border: `1px solid ${plane === key ? c + "66" : T.border}`, borderRadius: 12, padding: "13px 15px" }}>
        <Eyebrow>{l}</Eyebrow>
        <div style={{ fontSize: 26, fontWeight: 900, color: c, fontFamily: F.m, margin: "5px 0 2px" }}>{v}</div>
        <div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b }}>{sub}</div>
      </button>)}
    </div>

    {/* the three planes — what Veris can actually do at each */}
    <Card style={{ ...cardPad, marginBottom: 14 }}>
      <Eyebrow>The three planes · what control reaches where</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>Inline control · out-of-band observation · shadow</H3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
        {["enforced", "observed", "shadow"].map(p => { const m = PLANES[p]; const c = tok(m.tone); const n = p === "enforced" ? s.enforced : p === "observed" ? s.observed : s.shadow; return <div key={p} style={{ padding: "14px 15px", borderRadius: 11, background: c + "0e", border: `1px solid ${c}33` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 900, color: T.ink, fontFamily: F.b }}>{T_(m.label)}</span>
            <Pill c={c}>{n} {n === 1 ? T_("system") : T_("systems")}</Pill>
          </div>
          <div style={{ fontSize: 9.5, color: c, fontWeight: 800, fontFamily: F.m, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 7 }}>{T_(m.short)}</div>
          <div style={{ fontSize: 11, color: T.ink2, fontFamily: F.b, lineHeight: 1.5, marginBottom: 6 }}><b style={{ color: T.ink }}>{T_("Veris can:")}</b> {T_(m.can)}</div>
          <div style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.5 }}>{T_(m.how)}</div>
        </div>; })}
      </div>
    </Card>

    {/* the estate, classified */}
    <Card style={{ ...cardPad, marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
        <div><Eyebrow>{ar ? `الحوزة المُتتبَّعة · ${shown.length} من ${s.total} نظاماً` : `The tracked estate · ${shown.length} of ${s.total} systems`}</Eyebrow><H3>Every AI system, and the chokepoint that governs it</H3></div>
        {plane !== "all" && <button onClick={() => setPlane("all")} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "5px 11px", color: T.ink2, fontSize: 10.5, fontWeight: 800, fontFamily: F.b, cursor: "pointer" }}>{T_("Show all planes")}</button>}
      </div>
      <Table head={["System", "Unit", "Owner", "Kind", "Model", "Chokepoint / mechanism", "Plane"]}>
        {shown.map(r => <tr key={r.id}>
          <Td style={{ fontWeight: 700, color: T.ink, minWidth: 170 }}>{r.system}</Td>
          <Td style={{ color: T.ink3 }}>{r.unit}</Td>
          <Td style={{ color: r.owner.startsWith("—") ? T.red : T.ink3 }}>{r.owner}</Td>
          <Td><Pill c={r.kind === "Shadow tool" ? T.red : r.kind === "SaaS feature" ? T.amber : T.blue}>{r.kind}</Pill></Td>
          <Td style={{ color: T.ink3, fontFamily: F.m, fontSize: 10.5 }}>{r.model}</Td>
          <Td style={{ color: T.ink3, maxWidth: 250 }}>{r.mechanism}</Td>
          <Td><Pill c={planeTone(r.plane)}>{r.planeMeta.label}</Pill></Td>
        </tr>)}
      </Table>
    </Card>

    {/* per-unit concentration + the channels providing coverage */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 14, marginBottom: 14 }}>
      <Card style={cardPad}>
        <Eyebrow>Coverage by business unit · where the blind spots are</Eyebrow>
        <H3 style={{ marginBottom: 10 }}>Shadow concentrates in the unit, not the platform</H3>
        <Table head={["Unit", "Enforced", "Observed", "Shadow"]}>
          {s.byUnit.map(u => <tr key={u.unit}>
            <Td style={{ fontWeight: 700, color: T.ink }}>{u.unit}</Td>
            <Td style={{ color: u.enforced ? T.green : T.ink4, fontWeight: 700 }}>{u.enforced || "—"}</Td>
            <Td style={{ color: u.observed ? T.amber : T.ink4, fontWeight: 700 }}>{u.observed || "—"}</Td>
            <Td style={{ color: u.shadow ? T.red : T.ink4, fontWeight: 700 }}>{u.shadow || "—"}</Td>
          </tr>)}
        </Table>
      </Card>
      <Card style={cardPad}>
        <Eyebrow>The channels · what puts a system on each plane</Eyebrow>
        <H3 style={{ marginBottom: 10 }}>One rulebook, every chokepoint</H3>
        <div style={{ display: "grid", gap: 8 }}>
          {COVERAGE_CHANNELS.map(c => <div key={c.id} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 9, padding: "9px 11px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: T.ink, fontFamily: F.b }}>{T_(c.name)}</span>
              <Pill c={planeTone(c.plane)}>{T_(PLANES[c.plane].label)}</Pill>
            </div>
            <div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b, marginTop: 3, lineHeight: 1.45 }}>{T_(c.role)}</div>
          </div>)}
        </div>
      </Card>
    </div>

    <Card style={cardPad}>
      {advisor(ar ? <>يصل الإنفاذ إلى <b style={{ color: T.ink }}>{s.enforced}</b> نظاماً على المستوى — هناك يحجب Veris ويُخفي ويُلغي ويمنع الخروج في الوقت الحقيقي. أنظمة <b style={{ color: T.ink }}>{s.observed}</b> المُراقَبة ذكاء اصطناعي من طرف ثالث ليس Veris مباشراً عليها: تحتوي الإضافة وCASB اللصق الخطر على الحافة، لكن فعل النموذج ليس من حقّ Veris أن يقرّره. أنظمة <b style={{ color: T.ink }}>{s.shadow}</b> الظِّلّية مكتشَفة فقط — لا شيء مُنفَّذ حتى تُوجَّه إلى المستوى. العنوان الصادق لعميل الحوكمة فقط ليس «نسيطر على كل شيء» — بل <b style={{ color: T.ink }}>{s.enforcedPct}% مُنفَّذ، و{s.governedPct}% مرئي على الأقل</b>، وخطة واضحة لنقل البقية إلى المستوى.</> : <>Enforcement reaches the <b style={{ color: T.ink }}>{s.enforced}</b> systems on the plane — there Veris blocks, masks, revokes and denies egress in real time. The <b style={{ color: T.ink }}>{s.observed}</b> observed systems are third-party AI Veris is not inline on: the extension and CASB contain risky paste at the edge, but the model action isn't Veris's to decide. The <b style={{ color: T.ink }}>{s.shadow}</b> shadow systems are detected only — nothing is enforced until they are routed onto the plane. The honest headline for a governance-only customer is not "we control everything" — it is <b style={{ color: T.ink }}>{s.enforcedPct}% enforced, {s.governedPct}% at least visible</b>, and a clear plan to move the rest onto the plane.</>)}
      <div style={{ display: "flex", gap: 9, marginTop: 12, flexWrap: "wrap" }}>
        <button onClick={() => showToast && showToast(T_("Onboarding plan drafted — route observed & shadow systems through the Gateway / egress plane"))} style={{ background: AI_GOLD, border: "none", borderRadius: 11, padding: "10px 17px", color: "#0b0e24", fontSize: 12, fontWeight: 800, fontFamily: F.b, cursor: "pointer" }}>{T_("Draft onboarding plan")}</button>
        <button onClick={() => showToast && showToast(T_("Coverage report exported — estate by plane, mechanism and unit"))} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 11, padding: "10px 17px", color: T.ink2, fontSize: 12, fontWeight: 800, fontFamily: F.b, cursor: "pointer" }}>{T_("Export coverage report")}</button>
      </div>
    </Card>
  </div>;
}

/* ══════════════ POLICY-AS-A-SERVICE — the engine as a callable service ══════════════ */
export function PolicyAsAService({ showToast }) {
  const T_ = useT(); const ar = useLang() === "ar";
  const s = paasStats();
  const [text, setText] = useState(PAAS_SAMPLES[1].text);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const [keys, setKeys] = useState(PAAS_KEYS);
  const [reveal, setReveal] = useState(null);

  const inspect = async () => {
    setBusy(true); setErr(""); setResult(null);
    try {
      const res = await fetch("/api/policy/inspect", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, context: "paas-console", actor: "policy.console@veriszone.ai", channel: "paas-console" }),
      });
      if (!res.ok) throw new Error("inspect " + res.status);
      const v = await res.json();
      setResult(v);
      const m = PAAS_DECISION_META[v.decision] || { label: v.decision };
      showToast && showToast(`Verdict: ${m.label}${v.reason ? " · " + v.reason : ""} — signed into the Article 12 chain`);
    } catch (e) {
      setErr("Service unreachable — " + String(e.message || e));
    } finally { setBusy(false); }
  };

  const issueKey = () => {
    const n = keys.length + 1;
    const id = "issued-" + n;
    const full = "vz_live_nk_" + id.replace(/[^a-z0-9]/g, "") + "K7q2";
    setKeys(k => [...k, { id, label: "New client " + n, scope: "inspect", status: "Active", masked: full.slice(0, 12) + "••••••" + full.slice(-4), created: "just now" }]);
    setReveal({ id, full });
    showToast && showToast("Inspection key issued — copy it now; it is shown only once");
  };
  const rotate = (id) => { setKeys(k => k.map(x => x.id === id ? { ...x, masked: x.masked.slice(0, 12) + "••••••" + "New1", created: "just now" } : x)); showToast && showToast("Key rotated — the previous secret is now void"); };

  const rc = result ? tok(PAAS_DECISION_META[result.decision]?.tone || "ink3") : T.border;
  const chan = [
    ["Any client", "Gateway · extension · CASB · CI/CD", "One rulebook, whatever the channel — including shadow-AI traffic that never touches the app.", T.blue],
    ["Inspect", "POST /api/policy/inspect", "Stateless verdict — classify, mask or block. No model is called; it only judges text.", AI_GOLD],
    ["Evidence", "Article 12 chain", "Every verdict appends a hash of the text + what fired — never the raw sensitive content.", T.green],
  ];

  return <div style={{ animation: "up .3s ease" }}>
    <Head title="Policy-as-a-Service" sub="The policy engine, exposed as a callable service. The same DLP + classification rulebook the AI Gateway enforces inline is available at one endpoint, so a browser extension, a CASB, a forward proxy or a CI pipeline can enforce it on AI traffic that never touches the in-app gateway. It returns allow · mask · block with the masked text to substitute — and signs every verdict into the same evidence chain." />
    <div style={kpiGrid}>
      <Kpi l="Inspections (window)" v={s.total.toLocaleString()} c={AI_GOLD} sub={`${s.clientsLive} of ${s.clientsTotal} channels live`} />
      <Kpi l="Allow / Mask / Block" v={`${s.allow.toLocaleString()} · ${s.mask} · ${s.block}`} c={T.blue} sub={`${s.containmentRate}% contained at the edge`} />
      <Kpi l="Prevented exfiltration" v={String(s.preventedExfil)} c={T.red} sub="block verdicts — data that never left" />
      <Kpi l="Median verdict" v={`${s.p95ms}ms`} c={T.green} sub="no model call — pure judgement" />
      <Kpi l="Active keys" v={String(s.keysActive)} c={T.blue} sub="x-veris-key, per channel" />
    </div>

    {/* One rulebook, every channel */}
    <Card style={{ ...cardPad, marginBottom: 14 }}>
      <Eyebrow>The service · one rulebook, every channel</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>Policy the whole enterprise can call</H3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
        {chan.map(([k, who, desc, c], i) => <div key={k} style={{ padding: "14px 15px", borderRadius: 11, background: c + "0e", border: `1px solid ${c}33` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ width: 22, height: 22, borderRadius: 6, background: c + "22", color: c, fontFamily: F.m, fontWeight: 900, fontSize: 11, display: "grid", placeItems: "center" }}>{i + 1}</span>
            <div><div style={{ fontSize: 12.5, fontWeight: 900, color: T.ink, fontFamily: F.b }}>{T_(k)}</div><div style={{ fontSize: 9.5, color: c, fontWeight: 800, fontFamily: F.m, textTransform: "uppercase", letterSpacing: "0.06em" }}>{T_(who)}</div></div>
          </div>
          <p style={{ fontSize: 11, color: T.ink3, fontFamily: F.b, lineHeight: 1.55, margin: 0 }}>{T_(desc)}</p>
        </div>)}
      </div>
      <div style={{ marginTop: 12, fontFamily: F.m, fontSize: 10.5, color: T.ink2, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "11px 13px", lineHeight: 1.7, overflowX: "auto" }}>
        <div style={{ color: T.ink4 }}># request</div>
        <div><b style={{ color: T.ink }}>{PAAS_ENDPOINT.method} {PAAS_ENDPOINT.path}</b> · auth: <b style={{ color: AI_GOLD_INK }}>{PAAS_ENDPOINT.auth}</b></div>
        <div style={{ whiteSpace: "pre-wrap" }}>{PAAS_ENDPOINT.request}</div>
        <div style={{ color: T.ink4, marginTop: 6 }}># response</div>
        <div style={{ whiteSpace: "pre-wrap" }}>{PAAS_ENDPOINT.response}</div>
      </div>
    </Card>

    {/* Live inspection — actually calls the endpoint */}
    <Card style={{ ...cardPad, marginBottom: 14 }}>
      <Eyebrow>Live inspection · calls the real endpoint</Eyebrow>
      <H3 style={{ marginBottom: 10 }}>Send text through the service</H3>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 9 }}>
        {PAAS_SAMPLES.map(sm => <button key={sm.id} onClick={() => { setText(sm.text); setResult(null); }} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 999, padding: "5px 12px", color: T.ink2, fontSize: 10.5, fontWeight: 700, fontFamily: F.b, cursor: "pointer" }}>{T_(sm.label)}</button>)}
      </div>
      <textarea value={text} onChange={e => { setText(e.target.value); setResult(null); }} rows={3} style={{ width: "100%", background: T.s2, border: `1px solid ${T.border}`, borderRadius: 9, padding: "11px 13px", color: T.ink, fontSize: 12.5, fontFamily: F.b, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
      <div style={{ marginTop: 10 }}>
        <button onClick={inspect} disabled={busy} style={{ background: AI_GOLD, border: "none", borderRadius: 9, padding: "10px 17px", color: "#0b0e24", fontSize: 12, fontWeight: 800, fontFamily: F.b, cursor: busy ? "wait" : "pointer", opacity: busy ? 0.7 : 1 }}>{busy ? T_("Inspecting…") : T_("✦ Inspect")}</button>
      </div>
      {err && <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 9, background: T.redL, border: `1px solid ${T.red}40`, color: T.red, fontSize: 11.5, fontFamily: F.b }}>{err}</div>}
      {result && <div style={{ marginTop: 13, padding: "13px 15px", borderRadius: 10, background: rc + "10", border: `1px solid ${rc}40` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8, flexWrap: "wrap" }}>
          <Pill c={rc}>{(PAAS_DECISION_META[result.decision] || {}).label || result.decision}</Pill>
          <span style={{ fontSize: 12, fontWeight: 800, color: T.ink, fontFamily: F.b }}>{(PAAS_DECISION_META[result.decision] || {}).note || ""}</span>
          {result.dataClass && <Pill c={T.blue}>{result.dataClass}</Pill>}
          {(result.categories || []).map(c => <Pill key={c} c={T.violet}>{c}</Pill>)}
        </div>
        {result.reason && <p style={{ fontSize: 11, color: T.ink3, fontFamily: F.b, margin: "0 0 8px" }}>{T_("Rule fired:")} <b style={{ color: T.ink2 }}>{result.reason}</b>{result.clauseRef ? ` · ${result.clauseRef}` : ""}</p>}
        {result.decision === "mask" && result.redacted && <div style={{ fontSize: 11, fontFamily: F.m, color: T.ink2, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 7, padding: "9px 11px", lineHeight: 1.6 }}><div style={{ color: T.ink4, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{T_("Substitute text")}</div>{result.redacted}</div>}
        {result.decision === "block" && <div style={{ fontSize: 11, color: T.red, fontFamily: F.b }}>{T_("Blocked — the client must not forward this content.")}</div>}
      </div>}
    </Card>

    {/* Connected channels */}
    <Card style={{ ...cardPad, marginBottom: 14 }}>
      <Eyebrow>Connected channels · who calls the service</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>Every channel, one policy</H3>
      <Table head={["Channel", "Type", "Status", "Inspections", "Contained", "Coverage"]}>
        {PAAS_CLIENTS.map(c => <tr key={c.id}>
          <Td style={{ fontWeight: 700, color: T.ink }}>{T_(c.name)}<div style={{ fontSize: 10, color: T.ink4, fontWeight: 500 }}>{T_(c.note)}</div></Td>
          <Td style={{ color: T.ink3 }}>{T_(c.type)}</Td>
          <Td><Pill c={c.status === "Live" ? T.green : T.amber}>{c.status}</Pill></Td>
          <Td>{c.calls.toLocaleString()}</Td>
          <Td>{c.contained}</Td>
          <Td><Pill c={T.blue}>{c.calls ? Math.round((c.contained / c.calls) * 100) : 0}%</Pill></Td>
        </tr>)}
      </Table>
    </Card>

    {/* Keys */}
    <Card style={cardPad}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div><Eyebrow>Inspection keys · x-veris-key</Eyebrow><H3 style={{ marginBottom: 0 }}>One key per channel, rotatable</H3></div>
        <button onClick={issueKey} style={{ background: AI_GOLD, border: "none", borderRadius: 9, padding: "9px 15px", color: "#0b0e24", fontSize: 11.5, fontWeight: 800, fontFamily: F.b, cursor: "pointer" }}>+ Issue key</button>
      </div>
      {reveal && <div style={{ margin: "12px 0", padding: "11px 13px", borderRadius: 9, background: T.greenL, border: `1px solid ${T.green}40`, fontFamily: F.m, fontSize: 11.5, color: T.ink }}><span style={{ color: T.ink4, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.07em" }}>{T_("New key — shown once")}</span><div style={{ fontWeight: 700, marginTop: 3 }}>{reveal.full}</div></div>}
      <div style={{ marginTop: 12 }}>
        <Table head={["Key", "Scope", "Secret", "Status", "Created", ""]}>
          {keys.map(k => <tr key={k.id}>
            <Td style={{ fontWeight: 700, color: T.ink }}>{k.label}</Td>
            <Td style={{ color: T.ink3 }}>{k.scope}</Td>
            <Td style={{ fontFamily: F.m, color: T.ink3 }}>{k.masked}</Td>
            <Td><Pill c={k.status === "Active" ? T.green : T.amber}>{k.status}</Pill></Td>
            <Td style={{ color: T.ink3 }}>{k.created}</Td>
            <Td><button onClick={() => rotate(k.id)} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 7, padding: "5px 11px", color: T.ink2, fontSize: 10.5, fontWeight: 700, fontFamily: F.b, cursor: "pointer" }}>{T_("Rotate")}</button></Td>
          </tr>)}
        </Table>
      </div>
      {advisor(ar ? <>هذه هي السياسة كخدمة: كتاب القواعد الذي تؤلّفه مرة واحدة يُنفَّذ في كل مكان يستطيع فيه موظف بلوغ ذكاء اصطناعي — لا داخل التطبيق فقط. احتوى أسطول المتصفح وCASB وحدهما {PAAS_CLIENTS[1].contained + PAAS_CLIENTS[2].contained} فحصاً لذكاء اصطناعي ظِلّي هذه النافذة، كلٌّ منها حُكِم عليه بالقواعد نفسها وكُتِب في سلسلة الأدلة نفسها التي يقرأها المجلس.</> : <>This is Policy-as-a-Service: the rulebook you author once is enforced everywhere an employee can reach an AI — not just inside the app. The browser fleet and CASB alone contained {PAAS_CLIENTS[1].contained + PAAS_CLIENTS[2].contained} shadow-AI inspections this window, each judged by the same rules and written to the same evidence chain the board reads.</>)}
    </Card>
  </div>;
}

/* ══════════════ AGENT AUTHORITY — least privilege + live token issuance ══════════════ */
export function AgentAuthority({ showToast }) {
  const T_ = useT(); const ar = useLang() === "ar";
  const posture = agentPosture();
  const [agentId, setAgentId] = useState(AI_AGENTS[0].id);
  const [tool, setTool] = useState(AI_AGENTS[0].tools[0].name);
  const [result, setResult] = useState(null);
  const agent = AI_AGENTS.find(a => a.id === agentId) || AI_AGENTS[0];

  const run = () => {
    const n = (result ? result._n || 0 : 0) + 1;
    const r = issueToken(agentId, tool, agent.dataScopes.join(", "), "req-" + n, TOKEN_TTL_SECONDS);
    setResult({ ...r, _n: n });
    if (showToast) showToast(r.issued ? `Capability token ${r.token.id} issued — ${TOKEN_TTL_SECONDS}s, scoped` : r.decision === "escalate" ? "High-stakes — routed to human approval, no token issued" : "Denied by default — no token issued");
  };
  const rc = result ? (result.issued ? T.green : result.decision === "escalate" ? T.amber : T.red) : T.border;

  return <div style={{ animation: "up .3s ease" }}>
    <Head title="Agent Authority" sub="No agent holds a standing key. To call a tool it must be issued a capability token — short-lived, scoped to a data domain, and authorising exactly one tool. Issuance runs the least-privilege boundary first, so an ungranted or high-stakes call never mints a token. Over-privilege — a granted capability never exercised and not gated — is the standing attack surface this removes." />
    <div style={kpiGrid}>
      <Kpi l="Agents governed" v={String(posture.agents)} c={AI_GOLD} sub="registered, owned objects" />
      <Kpi l="Least-privilege index" v={`${posture.index}%`} c={posture.index >= 80 ? T.green : T.amber} sub="grants actually exercised" />
      <Kpi l="Over-privileged" v={String(posture.overPrivileged.length)} c={posture.overPrivileged.length ? T.red : T.green} sub="standing, un-exercised grants" />
      <Kpi l="High-stakes gated" v={`${posture.gatedHigh}/${posture.totalHigh}`} c={posture.gatedHigh === posture.totalHigh ? T.green : T.amber} sub="behind human approval" />
      <Kpi l="Token TTL" v={`${TOKEN_TTL_SECONDS}s`} c={T.blue} sub="per-call, then void" />
    </div>

    {/* Live token issuance — the runtime boundary, on screen */}
    <Card style={{ ...cardPad, marginBottom: 14 }}>
      <Eyebrow>Request a capability token · the runtime boundary</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>Issue a scoped, short-lived token</H3>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
        <label style={{ display: "grid", gap: 4 }}><span style={{ fontSize: 9, fontWeight: 900, color: T.ink4, fontFamily: F.m, textTransform: "uppercase", letterSpacing: "0.07em" }}>{T_("Agent")}</span>
          <select value={agentId} onChange={e => { setAgentId(e.target.value); const a = AI_AGENTS.find(x => x.id === e.target.value); setTool(a.tools[0].name); setResult(null); }} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 11px", color: T.ink, fontSize: 12, fontFamily: F.b, minWidth: 220 }}>
            {AI_AGENTS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select></label>
        <label style={{ display: "grid", gap: 4 }}><span style={{ fontSize: 9, fontWeight: 900, color: T.ink4, fontFamily: F.m, textTransform: "uppercase", letterSpacing: "0.07em" }}>{T_("Tool call")}</span>
          <select value={tool} onChange={e => { setTool(e.target.value); setResult(null); }} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 11px", color: T.ink, fontSize: 12, fontFamily: F.b, minWidth: 240 }}>
            {agent.tools.map(t => <option key={t.name} value={t.name}>{t.name} · {t.risk}</option>)}
          </select></label>
        <button onClick={run} style={{ background: AI_GOLD, border: "none", borderRadius: 9, padding: "10px 16px", color: "#0b0e24", fontSize: 12, fontWeight: 800, fontFamily: F.b, cursor: "pointer" }}>{T_("Request token")}</button>
      </div>
      {result && <div style={{ marginTop: 13, padding: "13px 15px", borderRadius: 10, background: rc + "10", border: `1px solid ${rc}40` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>{decPill(result.decision)}<span style={{ fontSize: 12, fontWeight: 800, color: T.ink, fontFamily: F.b }}>{result.issued ? T_("Token issued") : result.decision === "escalate" ? T_("Gated to human approval") : T_("Denied by default")}</span></div>
        <p style={{ fontSize: 11, color: T.ink3, fontFamily: F.b, lineHeight: 1.55, margin: "0 0 8px" }}>{T_(result.reason)}</p>
        {result.issued
          ? <div style={{ fontSize: 10.5, fontFamily: F.m, color: T.ink2, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 7, padding: "9px 11px", lineHeight: 1.7 }}>
              <div><b style={{ color: T.ink }}>{result.token.id}</b> · sig {result.token.sig}</div>
              <div>{T_("agent")} <b>{result.token.agent}</b> → {T_("tool")} <b>{result.token.tool}</b></div>
              <div>{T_("scope:")} {result.token.scope || "—"} · {T_("ttl")} {result.token.ttl}s</div>
            </div>
          : <div style={{ fontSize: 10.5, fontFamily: F.m, color: T.ink3 }}>{T_("No token minted · control:")} {result.control}</div>}
      </div>}
    </Card>

    <Card style={cardPad}>
      <Eyebrow>Per-agent authority · least privilege</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>Granted capabilities vs standing surface</H3>
      <Table head={["Agent", "Unit", "Granted", "Exercised", "Over-priv", "High-stakes gated", "LP score"]}>
        {posture.rows.map(({ agent: a, stats }) => <tr key={a.id}>
          <Td style={{ fontWeight: 700, color: T.ink }}>{a.name}</Td>
          <Td style={{ color: T.ink3 }}>{a.unit}</Td>
          <Td>{stats.granted}</Td>
          <Td>{stats.exercised}</Td>
          <Td>{stats.overPriv.length ? <Pill c={T.red}>{stats.overPriv.length}</Pill> : <Pill c={T.green}>0</Pill>}</Td>
          <Td>{stats.highRiskGated}/{stats.highRisk}</Td>
          <Td><Pill c={stats.score >= 80 ? T.green : stats.score >= 50 ? T.amber : T.red}>{stats.score}%</Pill></Td>
        </tr>)}
      </Table>
      {advisor(ar ? <>أقل صلاحية ليست ادّعاءً — بل تُحسَب من المنح التي يمارسها كل وكيل فعلاً. {posture.overPrivileged.length ? `${posture.overPrivileged.length} وكيل يحمل قدرة دائمة لا يستخدمها قط؛ ألغِها فينكمش سطح الهجوم دون فقد أي وظيفة.` : "لم يُكتشَف إفراط صلاحية دائم عبر الأسطول."} كل أداة عالية المخاطر ({posture.gatedHigh}/{posture.totalHigh}) مُقيَّدة خلف موافقة بشرية.</> : <>Least privilege isn’t asserted — it’s computed from which grants each agent actually exercises. {posture.overPrivileged.length ? `${posture.overPrivileged.length} agent(s) hold a standing capability they never use; revoke it and the attack surface shrinks with no loss of function.` : "No standing over-privilege detected across the fleet."} Every high-stakes tool ({posture.gatedHigh}/{posture.totalHigh}) is gated behind human approval.</>)}
    </Card>
  </div>;
}

/* ══════════════ TOOL-CALL LEDGER — the tamper-evident record ══════════════ */
export function ToolCallLedger({ showToast }) {
  const T_ = useT(); const ar = useLang() === "ar";
  const rows = TOOLCALL_LEDGER;
  const s = enforceStats(rows);
  return <div style={{ animation: "up .3s ease" }}>
    <Head title="Tool-Call Ledger" sub="The audit artifact nobody else owns: prove what your agents were allowed to do, and prove what they actually did. Every tool call is one signed row — the authorised grant beside the actual call, the deterministic decision, its token, and a hash chained to the row before it. Change any row and every later hash breaks. This is the record EU AI Act Art.12 and ISO 42001 push toward." />
    <div style={kpiGrid}>
      <Kpi l="Calls recorded" v={String(s.total)} c={AI_GOLD} sub="this window" />
      <Kpi l="Allowed" v={String(s.allowed)} c={T.green} sub="within grant" />
      <Kpi l="Escalated" v={String(s.escalated)} c={T.amber} sub="gated to a human" />
      <Kpi l="Blocked · egress" v={`${s.blocked} · ${s.egressDenied}`} c={T.red} sub="contained at the boundary" />
      <Kpi l="Chain" v={s.intact ? "Intact" : "Broken"} c={s.intact ? T.green : T.red} sub="every row re-hashed" />
    </div>
    <Card style={cardPad}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <div><Eyebrow>Signed tool-call record · authorised vs actual</Eyebrow><H3>Tamper-evident hash chain</H3></div>
        <button onClick={() => showToast && showToast(s.intact ? "Chain verified — every row re-hashed, no tampering" : "Chain broken — a row was altered")} style={{ background: s.intact ? T.green : T.red, border: "none", borderRadius: 10, padding: "8px 13px", color: "#fff", fontSize: 11.5, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>{s.intact ? T_("✓ Verify chain") : T_("Chain broken")}</button>
      </div>
      <Table head={["#", "Agent", "Tool call", "Authorised", "Decision", "Scope", "Token", "Risk", "Hash"]}>
        {rows.map(r => <tr key={r.id}>
          <Td style={{ fontFamily: F.m, color: T.ink4 }}>{r.seq}</Td>
          <Td style={{ fontWeight: 700, color: T.ink }}>{r.agentName}</Td>
          <Td><span style={{ fontFamily: F.m, color: T.ink2 }}>{r.tool}</span><div style={{ fontSize: 9.5, color: T.ink4 }}>{T_(r.action)}</div></Td>
          <Td>{r.authorized ? <Pill c={T.green}>granted</Pill> : <Pill c={T.red}>not granted</Pill>}</Td>
          <Td>{decPill(r.decision)}</Td>
          <Td style={{ color: T.ink3 }}>{r.scope}</Td>
          <Td style={{ fontFamily: F.m, color: r.token ? T.ink2 : T.ink4 }}>{r.token || "—"}</Td>
          <Td><Pill c={r.risk === "High" ? T.red : r.risk === "Medium" ? T.amber : T.ink3}>{r.risk}</Pill></Td>
          <Td style={{ fontFamily: F.m, color: T.ink4, fontSize: 10 }}>{r.hash.slice(0, 8)}</Td>
        </tr>)}
      </Table>
      {advisor(ar ? <>الصفوف التي بلغ فيها الوكيل أداة لا يملكها فكان <b>محجوباً</b> أو <b>ممنوعاً من الخروج</b> هي انتصارات الاحتواء — {s.preventedBreaches} في هذه النافذة — حقن ناجح لم يبلغ المال أو البيانات أو الإنترنت. كل قرار حتمي (الهوية + القدرة + المصدر)، فيصمد أمام نموذج أقدر، وكلٌّ مُوقَّع في السلسلة نفسها التي يتحقّق منها سجل المادة 12.</> : <>Rows where the agent reached for a tool it does not hold and was <b>Blocked</b> or <b>Egress-denied</b> are the containment wins — {s.preventedBreaches} in this window — a successful injection that never reached money, data, or the internet. Each decision is deterministic (identity + capability + provenance), so it survives a more capable model, and each is signed into the same chain the Article 12 log verifies.</>)}
    </Card>
  </div>;
}

/* ══════════════ EGRESS POLICY — the containment guarantee ══════════════ */
export function EgressPolicy({ showToast }) {
  const T_ = useT(); const ar = useLang() === "ar";
  const s = egressStats();
  return <div style={{ animation: "up .3s ease" }}>
    <Head title="Egress Policy" sub="The containment guarantee: a successful injection cannot reach money, data, or the internet. Least privilege stops an agent calling a tool it doesn't hold; egress policy stops the tools it does hold from reaching a destination they shouldn't. Enforced on the destination — an allow-list plus named deny categories, never a text classifier — so it holds against a more capable model. Closes data-exfiltration and SSRF against the cloud metadata service." />
    <div style={kpiGrid}>
      <Kpi l="Egress attempts" v={String(s.total)} c={AI_GOLD} sub="this window" />
      <Kpi l="Allowed" v={String(s.allowed)} c={T.green} sub="to allow-listed hosts" />
      <Kpi l="Denied" v={String(s.denied)} c={T.red} sub={`${s.denyRate}% blocked at the boundary`} />
      <Kpi l="SSRF blocked" v={String(s.ssrf)} c={s.ssrf ? T.red : T.green} sub="metadata-service theft stopped" />
      <Kpi l="Allow-list" v={String(s.allowlisted)} c={T.blue} sub="explicit destinations" />
    </div>
    <Card style={{ ...cardPad, marginBottom: 14 }}>
      <Eyebrow>Egress attempts · destination decisions</Eyebrow><H3 style={{ marginBottom: 12 }}>What the tools tried to reach</H3>
      <Table head={["Agent", "Tool", "Destination", "Decision", "Why"]}>
        {EGRESS_EVENTS.map(e => { const m = EGRESS_DECISION_META[e.decision]; return <tr key={e.id}>
          <Td style={{ fontWeight: 700, color: T.ink }}>{e.agent}</Td>
          <Td style={{ fontFamily: F.m, color: T.ink3 }}>{e.tool}</Td>
          <Td style={{ fontFamily: F.m, color: e.decision === "allow" ? T.ink2 : T.red }}>{e.dest}</Td>
          <Td><Pill c={tok(m.tone)}>{m.label}</Pill></Td>
          <Td style={{ color: T.ink3 }}>{e.reason}</Td>
        </tr>; })}
      </Table>
      {advisor(ar ? <>انتصارا الاحتواء في هذه النافذة هما المهمّان: محاولة تسريب إلى مصبّ معروف، وهجوم SSRF على <b>169.254.169.254</b> لسرقة اعتمادات السحابة — كلاهما رُفض حتمياً قبل مغادرة الحدود. كل رفض يُكتب في سجل استدعاءات الأدوات.</> : <>The two containment wins in this window are the ones that matter: an exfiltration attempt to a known sink, and an SSRF against <b>169.254.169.254</b> to steal cloud credentials — both denied deterministically before leaving the boundary. Every deny is written to the Tool-Call Ledger.</>)}
    </Card>
    <Card style={cardPad}>
      <Eyebrow>Egress policy · allow-list + deny categories</Eyebrow><H3 style={{ marginBottom: 12 }}>Deny-by-default destinations</H3>
      <Table head={["Destination", "Category", "Note"]}>
        {EGRESS_POLICY.map(p => { const c = p.category === "allow" ? T.green : p.category === "internal" ? T.amber : T.red; return <tr key={p.host}>
          <Td style={{ fontFamily: F.m, color: T.ink }}>{p.host}</Td>
          <Td><Pill c={c}>{p.category}</Pill></Td>
          <Td style={{ color: T.ink3 }}>{p.note}</Td>
        </tr>; })}
      </Table>
      <div style={{ marginTop: 12 }}>
        <button onClick={() => showToast && showToast(T_("Egress policy exported — denies reconciled to the Tool-Call Ledger and incident register"))} style={{ background: AI_GOLD, border: "none", borderRadius: 11, padding: "10px 17px", color: "#0b0e24", fontSize: 12, fontWeight: 800, fontFamily: F.b, cursor: "pointer" }}>{T_("✦ Export egress policy")}</button>
      </div>
    </Card>
  </div>;
}

/* ══════════════ HITL GATES — human oversight thresholds ══════════════ */
export function HitlGates({ showToast }) {
  const T_ = useT(); const ar = useLang() === "ar";
  const s = hitlStats();
  return <div style={{ animation: "up .3s ease" }}>
    <Head title="Human-in-the-Loop Gates" sub="High-impact actions are gated behind human approval — with a threshold, so the gate fires only where it matters. An agent auto-runs the routine and routes the consequential to a person, rather than a blanket approve-everything that trains people to rubber-stamp. Maps to EU AI Act Art.14 (human oversight) and Art.22 (no solely-automated decision with legal effect)." />
    <div style={kpiGrid}>
      <Kpi l="Gates" v={String(s.gates)} c={AI_GOLD} sub="high-impact actions" />
      <Kpi l="Pending approvals" v={String(s.pending)} c={s.pending ? T.amber : T.green} sub="awaiting a human now" />
      <Kpi l="Always-gated" v={String(s.alwaysGated)} c={T.blue} sub="legal-effect actions" />
      <Kpi l="Threshold-gated" v={String(s.thresholdGated)} c={T.blue} sub="fire above a trip point" />
      <Kpi l="Art.14 / 22" v={String(s.art14)} c={T.green} sub="regulator-mapped gates" />
    </div>
    <Card style={cardPad}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <div><Eyebrow>Approval gates · where autonomy stops</Eyebrow><H3>Action · threshold · approver</H3></div>
        <button onClick={() => showToast && showToast(ar ? `${s.pending} إجراءات وُجِّهت إلى مُعتمِديها — ساعات اتفاقية الخدمة تعمل` : `${s.pending} actions routed to their approvers — SLA clocks running`)} style={{ background: s.pending ? AI_GOLD : T.s2, border: `1px solid ${s.pending ? AI_GOLD : T.border}`, borderRadius: 10, padding: "8px 13px", color: s.pending ? "#0b0e24" : T.ink2, fontSize: 11.5, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>{s.pending ? (ar ? `مراجعة ${s.pending} معلّقة` : `Review ${s.pending} pending`) : T_("No approvals pending")}</button>
      </div>
      <Table head={["Action", "Agent", "Trips when", "Approver", "SLA", "Basis", "Pending"]}>
        {HITL_GATES.map(g => <tr key={g.id}>
          <Td style={{ fontWeight: 700, color: T.ink }}>{g.label}</Td>
          <Td style={{ fontFamily: F.m, color: T.ink3 }}>{g.agent}</Td>
          <Td style={{ color: T.ink3 }}>{g.condition}</Td>
          <Td>{g.approver}</Td>
          <Td style={{ fontFamily: F.m, color: T.ink3 }}>{g.sla}</Td>
          <Td><Pill c={/Art\./.test(g.basis) ? T.green : T.blue}>{g.basis}</Pill></Td>
          <Td>{g.pending ? <Pill c={T.amber}>{g.pending}</Pill> : <Pill c={T.green}>0</Pill>}</Td>
        </tr>)}
      </Table>
      {advisor(ar ? <>العتبات تُبقي الإشراف ذا معنى: الإجراءات الروتينية تجري تلقائياً وتُسجَّل، بينما إجراءات الأثر القانوني الـ{s.alwaysGated} (ائتمان ضار، تجميد حساب، بريد عميل مباشر) تُوجَّه دائماً إلى مُعتمِد مُسمّى بموجب المادة 14 / المادة 22. كل قرار بوابة — مُعتمَد، أو مُعلَّق، أو مُشغَّل تلقائياً دون العتبة — يصل إلى سجل استدعاءات الأدوات.</> : <>Thresholds keep oversight meaningful: routine actions run autonomously and are logged, while the {s.alwaysGated} legal-effect actions (adverse credit, account freeze, direct customer email) always route to a named approver under Art.14 / Art.22. Every gate decision — approved, held, or auto-run below threshold — lands in the Tool-Call Ledger.</>)}
    </Card>
  </div>;
}

/* ══════════════ CIRCUIT BREAKER — real-time capability revocation ══════════════ */
export function CircuitBreaker({ showToast }) {
  const T_ = useT(); const ar = useLang() === "ar";
  const rows = breakerSessions();
  const s = breakerStats();
  return <div style={{ animation: "up .3s ease" }}>
    <Head title="Circuit Breaker" sub="Static gates say what an agent may never do. The circuit breaker adds the dynamic half — it watches each agent's risk signal as a session runs and revokes capability in real time the moment it crosses a threshold, before the agent reaches a human gate. Tokens are short-lived (90s) and per-call, so revocation is instant: the agent's tokens hit a revocation list and the next issuance is refused. Every trip is written to the Article 12 chain. This is the continuous, adaptive oversight EU AI Act Art.14 requires." />
    <div style={kpiGrid}>
      <Kpi l="Sessions watched" v={String(s.watched)} c={AI_GOLD} sub="live, this window" />
      <Kpi l="Breaker tripped" v={String(s.acted)} c={T.red} sub="downscoped · suspended · halted" />
      <Kpi l="Tokens revoked" v={String(s.tokensRevoked)} c={T.red} sub={`within the ${s.ttlSeconds}s TTL`} />
      <Kpi l="Routed to human" v={String(s.routedToHuman)} c={T.amber} sub="Art.14 escalation" />
    </div>

    <Card style={cardPad}>
      <Eyebrow>The escalation ladder · risk score → automatic action</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>Graduated response, not a single kill-switch</H3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 10 }}>
        {BREAKER_STATES.map(b => { const c = tok(b.tone); return <div key={b.id} style={{ padding: "12px 13px", borderRadius: 10, background: c + "0e", border: `1px solid ${c}33` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 5 }}>
            <span style={{ fontSize: 12.5, fontWeight: 900, color: T.ink, fontFamily: F.b }}>{T_(b.label)}</span>
            <span style={{ fontSize: 10, fontWeight: 900, color: c, fontFamily: F.m }}>{b.id === "normal" ? "0" : "≥" + b.min}</span>
          </div>
          <p style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.5, margin: 0 }}>{T_(b.action)}</p>
        </div>; })}
      </div>
    </Card>

    <Card style={{ ...cardPad, marginTop: 14 }}>
      <Eyebrow>Live sessions · score & state computed from signals</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>What the breaker did, and why</H3>
      <Table head={["Session", "Agent", "Risk signals", "Score", "Breaker", "Capability revoked", "Art.12"]}>
        {rows.map(r => { const c = tok(r.tone); return <tr key={r.id}>
          <Td style={{ fontFamily: F.m, color: T.ink3, whiteSpace: "nowrap" }}>{r.id}<div style={{ fontSize: 9, color: T.ink4 }}>{r.started}</div></Td>
          <Td style={{ color: T.ink, fontWeight: 700 }}>{r.agentName}<div style={{ fontSize: 9, color: T.ink4, fontFamily: F.b }}>owner · {r.owner}</div></Td>
          <Td><div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{r.signals.map(k => { const sg = SIGNALS[k]; return <span key={k} style={{ fontSize: 9, fontWeight: 800, fontFamily: F.m, color: tok(sg.tone), background: tok(sg.tone) + "16", border: `1px solid ${tok(sg.tone)}33`, borderRadius: 999, padding: "2px 7px" }}>{T_(sg.label)}</span>; })}</div></Td>
          <Td style={{ fontFamily: F.m, fontWeight: 900, color: c }}>{r.score}</Td>
          <Td><Pill c={c}>{r.stateLabel}</Pill>{r.humanGate && <div style={{ fontSize: 8.5, color: T.amber, fontFamily: F.m, fontWeight: 800, marginTop: 3 }}>{T_("→ human")}</div>}</Td>
          <Td style={{ color: T.ink2, fontSize: 10.5 }}>{r.acted ? (r.revoked.length ? <span style={{ fontFamily: F.m }}>{r.revoked.join(", ")}</span> : "—") : <span style={{ color: T.ink4 }}>{T_("none · monitoring")}</span>}</Td>
          <Td style={{ fontFamily: F.m, color: r.ledgerRef ? T.green : T.ink4, whiteSpace: "nowrap" }}>{r.ledgerRef || "—"}</Td>
        </tr>; })}
      </Table>
      {advisor(ar ? <>تُظهِر الجلسة <span style={{ fontFamily: F.m }}>{rows.find(r => r.state === "halt")?.id || rows.find(r => r.acted)?.id}</span> الآلية: {rows.find(r => r.state === "halt") ? "بلغت درجة وكيل إشارة الاحتيال " + rows.find(r => r.state === "halt")?.score + " (حقن + خروج + قفزة حسّاسة)، فأوقف القاطع الجلسة وألغى كل رمز" : "تجاوزت الدرجة العتبة فسُحِبت القدرة"} — قبل أن تبلغ بوابة بشرية، ثم كتب التعثّر في سلسلة المادة 12 مع المالك المُساءَل. البوابة الثابتة لكل أداة لا تستطيع هذا؛ فهي لا تعمل إلا عند الأداة التي كان مسموحاً للوكيل استدعاؤها أصلاً. أُلغِي {s.tokensRevoked} رمزاً داخل عمر {s.ttlSeconds} ثانية عبر {s.acted} جلسة متعثّرة.</> : <>Session <span style={{ fontFamily: F.m }}>{rows.find(r => r.state === "halt")?.id || rows.find(r => r.acted)?.id}</span> shows the mechanism: the {rows.find(r => r.state === "halt") ? "Fraud Signal Agent's score hit " + rows.find(r => r.state === "halt")?.score + " (injection + egress + sensitive spike), so the breaker halted the session and revoked every token" : "score crossed the threshold and capability was pulled"} — before it reached a human gate, then wrote the trip to the Art.12 chain with the accountable owner. A fixed per-tool gate can't do this; it only fires at the tool the agent was already allowed to call. {s.tokensRevoked} tokens were revoked inside the {s.ttlSeconds}s TTL across {s.acted} tripped session{s.acted === 1 ? "" : "s"}.</>)}
      <div style={{ marginTop: 12 }}>
        <button onClick={() => showToast && showToast("Circuit-breaker trips exported — reconciled to the Article 12 evidence chain")} style={{ background: AI_GOLD, border: "none", borderRadius: 11, padding: "10px 17px", color: "#0b0e24", fontSize: 12, fontWeight: 800, fontFamily: F.b, cursor: "pointer" }}>✦ Export breaker trips</button>
      </div>
    </Card>
  </div>;
}

/* ── Guardrail Coverage ───────────────────────────────────────────────────
   The 7 guardrail layers every agentic AI stack needs, scored honestly against
   what VerisZone actually enforces in code. Enforced / Partial / Gap per
   sub-control, each mapped to a real engine. Deliberately not a green wall —
   the point is that the product tells the truth about its own guardrails. */
export function GuardrailCoverage({ showToast }) {
  const T_ = useT();
  const s = guardrailStats();
  const [openId, setOpenId] = useState(GUARDRAIL_LAYERS[0].id);
  const StatusChip = ({ status }) => {
    const m = GUARDRAIL_STATUS[status]; const c = tok(m.tone);
    return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 999, fontSize: 9.5, fontWeight: 800, fontFamily: F.m, color: c, background: c + "18", border: `1px solid ${c}40`, whiteSpace: "nowrap" }}>
      <span aria-hidden="true">{m.glyph}</span>{T_(m.label)}
    </span>;
  };
  return <div style={{ animation: "up .3s ease" }}>
    <Head title="Guardrail Coverage" sub="The seven guardrail layers every agentic AI stack needs — Input, Prompt, Retrieval, Memory, Runtime, Tool and Output — scored honestly against what VerisZone enforces in code. Every control is Enforced, Partial or a Gap, mapped to the real engine behind it. This is the product telling the truth about its own guardrails, not a datasheet: some engines are strong, some run on seeded signals, and some layers are genuinely not built yet." />

    <div style={kpiGrid}>
      <Kpi l="Overall coverage" v={s.coverage + "%"} c={s.coverage >= 60 ? AI_GOLD : T.amber} sub={`weighted across ${s.controls} controls`} />
      <Kpi l="Enforced" v={String(s.have)} c={T.green} sub="real runtime enforcement" />
      <Kpi l="Partial" v={String(s.partial)} c={T.amber} sub="in part, or seeded signals" />
      <Kpi l="Gaps" v={String(s.gap)} c={T.red} sub="not built as running code" />
    </div>

    <Card style={{ ...cardPad, marginBottom: 14 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {Object.values(GUARDRAIL_STATUS).map(m => { const c = tok(m.tone); return <span key={m.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: F.b, color: T.ink2 }}>
            <span style={{ color: c, fontWeight: 900 }}>{m.glyph}</span><b style={{ color: T.ink }}>{T_(m.label)}</b>
            <span style={{ color: T.ink4 }}>{m.id === "have" ? "· named engine, runs per request" : m.id === "partial" ? "· partial, or real engine on seeded signals" : "· label / roadmap only"}</span>
          </span>; })}
        </div>
      </div>
      <div style={{ marginTop: 12, padding: "10px 13px", borderRadius: 10, background: T.green + "0d", border: `1px solid ${T.green}2e`, fontSize: 11.5, color: T.ink2, fontFamily: F.b, lineHeight: 1.6 }}>
        <b style={{ color: T.ink }}>Strongest · {T_(s.strongest.name)}</b> ({s.strongest.coverage}%) — the enforcement plane is real: deny-by-default capability tokens, transaction gates and the hash-chained ledger. <b style={{ color: T.ink }}>Weakest · {T_(s.weakest.name)}</b> ({s.weakest.coverage}%) — there is no governed agent-memory store yet, so most of that layer is a genuine gap.
      </div>
    </Card>

    <div style={{ display: "grid", gap: 12 }}>
      {GUARDRAIL_LAYERS.map(layer => {
        const ls = layerStats(layer); const c = tok(ls.tone); const open = openId === layer.id;
        return <Card key={layer.id} style={{ padding: 0, overflow: "hidden" }}>
          <button onClick={() => setOpenId(open ? null : layer.id)} style={{ width: "100%", textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: "14px 16px", display: "flex", gap: 14, alignItems: "center" }}>
            <span style={{ fontSize: 22, fontWeight: 900, fontFamily: F.m, color: AI_GOLD + "88", minWidth: 34 }}>{layer.n}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 9, alignItems: "baseline", flexWrap: "wrap" }}>
                <span style={{ fontSize: 15, fontWeight: 900, color: T.ink, fontFamily: F.h }}>{T_(layer.name)}</span>
                <span style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b, fontStyle: "italic" }}>{T_(layer.tag)}</span>
              </div>
              <div style={{ fontSize: 9.5, color: T.ink4, fontFamily: F.m, marginTop: 3 }}>{layer.engine}</div>
            </div>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {layer.controls.map((ct, i) => <span key={i} title={T_(GUARDRAIL_STATUS[ct.status].label)} style={{ width: 9, height: 9, borderRadius: 2, background: tok(GUARDRAIL_STATUS[ct.status].tone) }} />)}
            </div>
            <div style={{ textAlign: "right", minWidth: 62 }}>
              <div style={{ fontSize: 18, fontWeight: 900, fontFamily: F.m, color: c }}>{ls.coverage}%</div>
              <div style={{ fontSize: 8.5, color: T.ink4, fontFamily: F.m }}>{ls.have}·{ls.partial}·{ls.gap}</div>
            </div>
            <span style={{ fontSize: 12, color: T.ink4, transform: open ? "rotate(90deg)" : "none", transition: "transform .15s" }}>▸</span>
          </button>
          {open && <div style={{ padding: "0 16px 14px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 8 }}>
            {layer.controls.map((ct, i) => <div key={i} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 9, padding: "10px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", marginBottom: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: T.ink, fontFamily: F.b }}>{T_(ct.name)}</span>
                <StatusChip status={ct.status} />
              </div>
              <p style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.55, margin: 0 }}>{T_(ct.note)}</p>
            </div>)}
          </div>}
        </Card>;
      })}
    </div>

    <Card style={{ ...cardPad, marginTop: 14 }}>
      <Eyebrow>The honest caveat</Eyebrow>
      <H3 style={{ marginBottom: 8 }}>What is real vs. what is seeded</H3>
      <p style={{ fontSize: 11.5, color: T.ink2, fontFamily: F.b, lineHeight: 1.65, margin: 0 }}>
        Every "Enforced" control above is backed by a real, deterministic engine that runs on each gateway request — the injection / PII detectors, the deny-by-default capability check, the egress allow-list, the HITL thresholds, the output validator. Several runtime signals (the circuit-breaker's per-session risk, the tool-call ledger window, the egress event log) run on <b style={{ color: T.ink }}>seeded demo data</b>: the logic is real and deterministic, but it is not yet wired to live per-request telemetry. The Gaps are exactly that — not yet built.
      </p>
      {advisor(<>The clear build order to raise coverage: a governed agent-memory store (closes the weakest layer), a real per-caller rate limiter, retrieval trust / freshness scoring, and an output toxicity + hallucination verifier. Each is a self-contained addition to the gateway pipeline — none requires re-architecting the enforcement plane.</>)}
      <div style={{ marginTop: 12 }}>
        <button onClick={() => showToast && showToast("Guardrail coverage exported — 7 layers, " + s.controls + " controls, " + s.coverage + "% weighted")} style={{ background: AI_GOLD, border: "none", borderRadius: 11, padding: "10px 17px", color: "#0b0e24", fontSize: 12, fontWeight: 800, fontFamily: F.b, cursor: "pointer" }}>✦ Export guardrail coverage</button>
      </div>
    </Card>
  </div>;
}
