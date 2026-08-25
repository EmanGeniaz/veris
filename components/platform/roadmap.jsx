"use client";

import { useState, useEffect } from "react";
import { T, F, AI_GOLD, AI_GOLD_INK, Card } from "./core";
import { driftRows, driftStats, DRIFT_META } from "@/lib/drift";
import { workflowRows, workflowStats, WF_DECISION_META } from "@/lib/agent-workflows";
import { orchestrationRows, workflowCompositionRows, compositionStats, DELEG_DECISION_META, toolMeta } from "@/lib/agent-composition";
import { INFERENCE_EVENTS, INF_DECISION_META, inferenceStats, INFERENCE_FIELDS, eventTokens } from "@/lib/inference-log";
import { useLang, ts, registerContent } from "@/lib/i18n";

/* Arabic content for the Drift Monitor, Agent Chain Permissions & Article 12 surfaces. */
registerContent({
  // ── Drift Monitor ──
  "Drift Monitor": "مراقبة الانحراف",
  "Automated behavioural-shift detection. A Population Stability Index (PSI) is computed per production model from a baseline vs current feature distribution — the standard signal for drift when the data or the underlying model changes. Bands: < 0.10 stable · 0.10–0.25 warning · > 0.25 drift. Maps to EU AI Act Art.72 post-market monitoring.": "كشف تلقائي لتحوّل السلوك. يُحسب مؤشّر استقرار السكان (PSI) لكل نموذج إنتاجي من توزيع خصائص أساسي مقابل حالي — الإشارة المعيارية للانحراف عندما تتغيّر البيانات أو النموذج الأساسي. النطاقات: < 0.10 مستقر · 0.10–0.25 تحذير · > 0.25 انحراف. يرتبط بمراقبة ما بعد السوق في المادة 72 من قانون الذكاء الاصطناعي الأوروبي.",
  "Models monitored": "النماذج المراقَبة",
  "Stable": "مستقر",
  "Warning": "تحذير",
  "Drift": "انحراف",
  "within envelope": "ضمن الحدود",
  "watch — re-validate soon": "راقب — أعد التحقّق قريباً",
  "breached — action now": "تجاوز — تصرّف الآن",
  "Per-model drift · computed PSI": "انحراف لكل نموذج · PSI محسوب",
  "Baseline vs current distribution": "التوزيع الأساسي مقابل الحالي",
  "All within envelope": "الجميع ضمن الحدود",
  "Model": "النموذج",
  "Monitored feature": "الخاصية المراقَبة",
  "Status": "الحالة",
  "Owner": "المالك",
  "Action": "الإجراء",
  "Re-validate + re-tier risk": "أعد التحقّق + أعد تصنيف الخطر",
  "Monitor next window": "راقب النافذة التالية",
  "No action": "لا إجراء",
  // owners / teams
  "Platform AI": "منصة الذكاء الاصطناعي",
  "Risk Engineering": "هندسة المخاطر",
  "Model Risk": "مخاطر النماذج",
  "Enterprise Apps": "تطبيقات المؤسسة",
  "Data Science": "علم البيانات",
  "Ops": "العمليات",
  // ── Agent Chain Permissions ──
  "Agent Chain Permissions": "أذونات سلاسل الوكلاء",
  "Least privilege across multi-agent chains — at three altitudes. (1) Per step: every step is re-checked against that agent’s own capabilities (deny-by-default), so an agent can’t gain a capability by being placed in a chain. (2) Per delegation: a sub-agent runs with the intersection of its grants and the orchestrator’s mandate — min(orchestrator, sub-agent) — so an orchestrator can borrow a capability but never widen its own data reach. (3) Per composition: taint analysis across the whole chain catches emergent data paths where individually-allowed steps compose into an exfiltration route.": "أقل صلاحية عبر سلاسل الوكلاء المتعدّدة — على ثلاثة مستويات. (1) لكل خطوة: يُعاد فحص كل خطوة مقابل قدرات الوكيل نفسه (المنع افتراضياً)، فلا يكتسب وكيل قدرة لمجرّد وضعه في سلسلة. (2) لكل تفويض: يعمل الوكيل الفرعي بتقاطع منحه ومهمة المنسّق — min(orchestrator, sub-agent) — فيستطيع المنسّق استعارة قدرة لكن دون توسيع مدى وصوله إلى البيانات أبداً. (3) لكل تركيب: يلتقط تحليل التلوّث عبر السلسلة كاملةً مسارات البيانات الناشئة حيث تتركّب خطوات مسموح بها فرديّاً في مسار تسريب.",
  "Chains analysed": "السلاسل المُحلَّلة",
  "workflows + orchestrations": "مسارات العمل + التنسيقات",
  "Escalation blocked": "التصعيد المحظور",
  "per-step privilege escalation": "تصعيد صلاحية لكل خطوة",
  "Scope-widening blocked": "توسيع النطاق المحظور",
  "delegation boundary": "حدود التفويض",
  "Emergent paths caught": "المسارات الناشئة المُلتقَطة",
  "compositional exfil routes": "مسارات تسريب تركيبية",
  "Altitude 1 · per step": "المستوى 1 · لكل خطوة",
  "Workflow permissions": "أذونات سير العمل",
  "Authored chains. Each step is re-checked against the agent’s own grant; a step invoking a tool the agent doesn’t hold is blocked as privilege escalation, and high-stakes steps escalate to a human.": "سلاسل مُؤلَّفة. يُعاد فحص كل خطوة مقابل منح الوكيل نفسه؛ وتُحظَر أي خطوة تستدعي أداة لا يملكها الوكيل بوصفها تصعيد صلاحية، وتُصعَّد الخطوات عالية المخاطر إلى إنسان.",
  "trigger": "المُشغّل",
  "handoff": "تسليم",
  "Least-privilege holds": "أقل صلاحية سارية",
  // units / triggers
  "Customer Operations": "عمليات العملاء",
  "Retail Banking": "الخدمات المصرفية للأفراد",
  "Finance": "المالية",
  "Inbound support ticket": "تذكرة دعم واردة",
  "Loan application": "طلب قرض",
  "Period-end close": "إقفال نهاية الفترة",
  "Anomalous transaction": "معاملة شاذّة",
  "Inbound ticket with attachment": "تذكرة واردة بمرفق",
  // workflow names
  "Customer resolution": "حل مشكلات العملاء",
  "Credit adjudication": "الفصل في الائتمان",
  "Finance close": "إقفال الحسابات",
  "Fraud triage": "فرز الاحتيال",
  // step notes
  "Read the customer's ticket": "اقرأ تذكرة العميل",
  "Retrieve relevant KB articles": "استرجع مقالات قاعدة المعرفة ذات الصلة",
  "Draft a reply for review": "صُغ رداً للمراجعة",
  "Send to customer": "أرسل إلى العميل",
  "Read credit-bureau data": "اقرأ بيانات مكتب الائتمان",
  "Compute the risk score": "احسب درجة الخطر",
  "Copilot attempts to issue the decision": "يحاول المساعد إصدار القرار",
  "Accountable agent issues under human oversight": "الوكيل المسؤول يُصدر تحت الإشراف البشري",
  "Read ledger balances": "اقرأ أرصدة دفتر الأستاذ",
  "Reconcile accounts": "سوِّ الحسابات",
  "Draft the journal entry": "صُغ قيد اليومية",
  "Post to the GL": "رحّل إلى دفتر الأستاذ العام",
  "Read the transaction stream": "اقرأ تدفّق المعاملات",
  "Flag the suspicious transaction": "علّم المعاملة المشبوهة",
  "Freeze the account": "جمّد الحساب",
  // decision labels (workflow + delegation + inference share keys)
  "Allowed": "مسموح",
  "HITL gate": "بوابة الإنسان في الحلقة",
  "Blocked": "محظور",
  "Scope-widening": "توسيع النطاق",
  // altitude 2
  "Altitude 2 · per delegation": "المستوى 2 · لكل تفويض",
  "Orchestrator delegation": "تفويض المنسّق",
  "An orchestrator delegates to sub-agents at runtime. Deny-by-default applies to the delegation, not just the agent: a sub-agent runs with min(orchestrator mandate, sub-agent grant). A delegation whose data scope lies outside the orchestrator’s mandate is scope-widening — blocked even though the sub-agent legitimately holds the tool.": "يفوّض المنسّق وكلاء فرعيين أثناء التشغيل. ينطبق المنع افتراضياً على التفويض، لا على الوكيل وحده: يعمل الوكيل الفرعي بـ min(orchestrator mandate, sub-agent grant). وأي تفويض يقع نطاق بياناته خارج مهمة المنسّق هو توسيع نطاق — محظور رغم أن الوكيل الفرعي يملك الأداة بشكل مشروع.",
  "Resolution orchestrator": "منسّق الحل",
  "Adjudication orchestrator": "منسّق الفصل",
  "Close orchestrator": "منسّق الإقفال",
  "Delegation holds": "التفويض ساري",
  "Orchestrator": "المنسّق",
  "mandate": "المهمة",
  // data scopes
  "CRM tickets": "تذاكر CRM",
  "KB articles": "مقالات قاعدة المعرفة",
  "Uploaded documents": "المستندات المرفوعة",
  "Applications": "الطلبات",
  "Bureau data": "بيانات المكتب",
  "Ledger": "دفتر الأستاذ",
  "Reconciliations": "التسويات",
  "Open web": "الويب المفتوح",
  "delegated": "مُفوَّض",
  // delegation notes
  "Sub-agent reads the attached document": "يقرأ الوكيل الفرعي المستند المرفق",
  "Sub-agent summarises it for the reply": "يُلخّصه الوكيل الفرعي للرد",
  "Sub-agent enriches the answer from the open web": "يُثري الوكيل الفرعي الإجابة من الويب المفتوح",
  "Read bureau data — within mandate": "اقرأ بيانات المكتب — ضمن المهمة",
  "Delegate pulling the full HRIS employment record": "فوّض سحب سجل التوظيف الكامل من HRIS",
  "Score the application under mandate": "قيّم الطلب ضمن المهمة",
  "Read ledger balances — within mandate": "اقرأ أرصدة دفتر الأستاذ — ضمن المهمة",
  "Reconcile accounts — within mandate": "سوِّ الحسابات — ضمن المهمة",
  "Delegate posting the entry to the GL": "فوّض ترحيل القيد إلى دفتر الأستاذ العام",
  "scope": "النطاق",
  "effective": "الفعلي",
  "denied at the agent boundary": "مرفوض عند حدود الوكيل",
  // altitude 3
  "Altitude 3 · per composition": "المستوى 3 · لكل تركيب",
  "Compositional risk": "المخاطر التركيبية",
  "Taint analysis across the whole chain. A step that reads sensitive data taints the chain; a mask or human gate clears it; an egress sink reached while tainted — with every step individually allowed — is an emergent exfiltration path per-step least privilege can’t see.": "تحليل التلوّث عبر السلسلة كاملةً. الخطوة التي تقرأ بيانات حساسة تلوّث السلسلة؛ ويُزيل ذلك قناعٌ أو بوابة بشرية؛ أما منفذ خروج يُبلَغ أثناء التلوّث — مع السماح بكل خطوة على حدة — فهو مسار تسريب ناشئ لا تراه أقل صلاحية على مستوى الخطوة.",
  "No emergent paths across the analysed chains.": "لا مسارات ناشئة عبر السلاسل المُحلَّلة.",
  "Emergent exfil path": "مسار تسريب ناشئ",
  "Remediation: insert a mask on the source or a human gate before the sink — then the path is contained without removing either capability.": "المعالجة: أدرج قناعاً على المصدر أو بوابة بشرية قبل المنفذ — عندئذ يُحتوى المسار دون إزالة أي من القدرتين.",
  "Export permission report": "تصدير تقرير الأذونات",
  // ── Article 12 Log ──
  "Article 12 Log": "سجل المادة 12",
  "EU AI Act Art.12 automatic record-keeping. Every gateway inference emits a structured, machine-readable event appended to the tamper-evident audit hash chain (SHA-256): what ran, when, the policy decision, data class, tokens and a hash that cannot change without breaking every later row. This is the record a regulator reads — not a dashboard screenshot.": "حفظ سجلات تلقائي بموجب المادة 12 من قانون الذكاء الاصطناعي الأوروبي. تُصدر كل عملية استدلال عبر البوابة حدثاً منظّماً قابلاً للقراءة آلياً يُلحَق بسلسلة بصمات التدقيق المقاومة للعبث (SHA-256): ماذا جرى، ومتى، وقرار السياسة، وفئة البيانات، والرموز، وبصمة لا يمكن تغييرها دون كسر كل صف لاحق. هذا هو السجل الذي يقرؤه المنظّم — لا لقطة شاشة للوحة.",
  "● Live · read from your audit chain": "● مباشر · مقروء من سلسلة تدقيقك",
  "Sample · connect a database for live rows": "عيّنة · اربط قاعدة بيانات لصفوف مباشرة",
  "Events logged": "الأحداث المسجّلة",
  "from your database": "من قاعدة بياناتك",
  "sample window": "نافذة عيّنة",
  "policy / least-privilege": "سياسة / أقل صلاحية",
  "Masked": "مُقنّع",
  "PII redacted at ingress": "حجب البيانات الشخصية عند الإدخال",
  "Hash chain": "سلسلة البصمات",
  "Intact": "سليمة",
  "Broken": "مكسورة",
  "verified over full chain": "مُتحقَّق منها عبر السلسلة كاملةً",
  "tamper-evident": "مقاوم للعبث",
  "Per-inference record · one row per call": "سجل لكل استدلال · صف واحد لكل استدعاء",
  "Structured, machine-readable, hash-chained": "منظّم، قابل للقراءة آلياً، مُسلسَل بالبصمة",
  "Export log": "تصدير السجل",
  "Time (UTC)": "الوقت (UTC)",
  "Agent · tool": "الوكيل · الأداة",
  "Decision": "القرار",
  "Data class": "فئة البيانات",
  "Tokens": "الرموز",
  "prev → hash": "السابقة ← البصمة",
  "Escalated": "مُصعّد",
  // inference details
  "Granted capability · CTRL-AI-014": "قدرة ممنوحة · CTRL-AI-014",
  "PII masked at ingress before the model call": "حُجبت البيانات الشخصية عند الإدخال قبل استدعاء النموذج",
  "Prompt-injection detector — request refused": "كاشف حقن الأوامر — رُفض الطلب",
  "Granted capability · CTRL-AI-001": "قدرة ممنوحة · CTRL-AI-001",
  "High-stakes — routed to human approval (Art.22)": "عالية المخاطر — مُوجّهة لموافقة بشرية (المادة 22)",
  "Granted capability · CTRL-AUD-019": "قدرة ممنوحة · CTRL-AUD-019",
  "Egress control — untrusted external fetch denied": "ضابط الخروج — رُفض جلب خارجي غير موثوق",
  "Granted capability · CTRL-GRC-044": "قدرة ممنوحة · CTRL-GRC-044",
  // data classes
  "Internal": "داخلي",
  "Confidential": "سرّي",
  "Restricted": "مقيّد",
});

/* ── shared local primitives ── */
const tok = k => ({ crit: T.red, warn: T.amber, info: T.blue, good: T.green, ink3: T.ink3 }[k] || T.ink3);
const cardPad = { padding: 18 };
const Eyebrow = ({ children, style }) => <div style={{ fontSize: 9, letterSpacing: "0.09em", textTransform: "uppercase", color: T.ink4, fontWeight: 900, fontFamily: F.m, ...style }}>{children}</div>;
const H3 = ({ children, style }) => <h3 style={{ fontFamily: F.h, fontSize: 16, fontWeight: 900, color: T.ink, margin: "4px 0 0", ...style }}>{children}</h3>;
const Head = ({ title, sub }) => <div style={{ marginBottom: 16 }}><h2 style={{ fontFamily: F.h, fontSize: 24, fontWeight: 900, color: T.ink, margin: 0, letterSpacing: "-0.02em" }}>{title}</h2><p style={{ fontFamily: F.b, fontSize: 12.5, color: T.ink3, margin: "5px 0 0", maxWidth: 780, lineHeight: 1.6 }}>{sub}</p></div>;
const Pill = ({ c, children }) => <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 9px", borderRadius: 999, fontSize: 10, fontWeight: 800, fontFamily: F.b, color: c, background: c + "18", border: `1px solid ${c}40` }}>{children}</span>;
const Th = ({ children, style }) => <th style={{ textAlign: "left", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: T.ink4, fontWeight: 900, fontFamily: F.m, padding: "0 10px 9px", borderBottom: `1px solid ${T.border}`, ...style }}>{children}</th>;
const Td = ({ children, style }) => <td style={{ padding: "10px", borderBottom: `1px solid ${T.border}`, color: T.ink2, fontSize: 11.5, fontFamily: F.b, verticalAlign: "middle", ...style }}>{children}</td>;
const Table = ({ head, children }) => <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr>{head.map(h => <Th key={h}>{h}</Th>)}</tr></thead><tbody>{children}</tbody></table></div>;
const Kpi = ({ l, v, c, sub }) => <Card style={{ padding: "13px 15px" }}><Eyebrow>{l}</Eyebrow><div style={{ fontSize: 26, fontWeight: 900, color: c, fontFamily: F.m, margin: "5px 0 2px" }}>{v}</div><div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b }}>{sub}</div></Card>;
const kpiGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 14 };
const advisor = children => <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 10, background: AI_GOLD + "12", border: `1px solid ${AI_GOLD}30`, fontSize: 11, color: T.ink2, lineHeight: 1.6, fontFamily: F.b }}><b style={{ color: AI_GOLD_INK }}>Veris Intelligence:</b> {children}</div>;

/* ══════════════ DRIFT MONITOR ══════════════ */
export function DriftMonitor({ showToast }) {
  const lang = useLang(); const ar = lang === "ar"; const T_ = en => ts(lang, en);
  const rows = driftRows();
  const s = driftStats();
  return <div style={{ animation: "up .3s ease" }}>
    <Head title={T_("Drift Monitor")} sub={T_("Automated behavioural-shift detection. A Population Stability Index (PSI) is computed per production model from a baseline vs current feature distribution — the standard signal for drift when the data or the underlying model changes. Bands: < 0.10 stable · 0.10–0.25 warning · > 0.25 drift. Maps to EU AI Act Art.72 post-market monitoring.")} />
    <div style={kpiGrid}>
      <Kpi l={T_("Models monitored")} v={String(s.total)} c={AI_GOLD} sub={ar ? `${s.coverage}% من الإنتاج` : `${s.coverage}% of production`} />
      <Kpi l={T_("Stable")} v={String(s.stable)} c={T.green} sub={T_("within envelope")} />
      <Kpi l={T_("Warning")} v={String(s.warning)} c={T.amber} sub={T_("watch — re-validate soon")} />
      <Kpi l={T_("Drift")} v={String(s.drift)} c={T.red} sub={T_("breached — action now")} />
    </div>
    <Card style={cardPad}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <div><Eyebrow>{T_("Per-model drift · computed PSI")}</Eyebrow><H3>{T_("Baseline vs current distribution")}</H3></div>
        <button onClick={() => showToast && showToast(ar ? `${s.drift} نموذج في حالة انحراف مُوجّه إلى مخاطر النماذج — فُتحت إعادة التحقّق` : `${s.drift} model in drift routed to Model Risk — re-validation opened`)} style={{ background: s.drift ? T.red : T.s2, border: `1px solid ${s.drift ? T.red : T.border}`, borderRadius: 10, padding: "8px 13px", color: s.drift ? "#fff" : T.ink2, fontSize: 11.5, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>{s.drift ? (ar ? `وجّه ${s.drift} إلى مخاطر النماذج` : `Route ${s.drift} to Model Risk`) : T_("All within envelope")}</button>
      </div>
      <Table head={["Model", "Monitored feature", "PSI", "Status", "Owner", "Action"].map(T_)}>
        {rows.map(r => { const m = DRIFT_META[r.band]; return <tr key={r.id}>
          <Td style={{ fontWeight: 700, color: T.ink }}>{r.model}</Td>
          <Td style={{ fontFamily: F.m, color: T.ink3 }}>{r.feature}</Td>
          <Td style={{ fontFamily: F.m, fontWeight: 800, color: tok(m.tone) }}>{r.psi.toFixed(3)}</Td>
          <Td><Pill c={tok(m.tone)}>{T_(m.label)}</Pill></Td>
          <Td>{T_(r.owner)}</Td>
          <Td style={{ color: T.ink3 }}>{r.band === "drift" ? T_("Re-validate + re-tier risk") : r.band === "warning" ? T_("Monitor next window") : T_("No action")}</Td>
        </tr>; })}
      </Table>
      {advisor(ar
        ? <>يُحسب PSI حياً من توزيع كل نموذج، وليس مُدّعى — غذِّه ببيانات قياس حقيقية فيُعاد حسابه. تجاوز نموذج Fraud Detection الحدود (PSI {rows.find(r => r.band === "drift")?.psi.toFixed(2)})، وهي الإشارة نفسها وراء الحادث INC-1039؛ يُوجَّه الانحراف إلى مخاطر النماذج لإعادة التحقّق بموجب المادة 72.</>
        : <>PSI is computed live from each model’s distribution, not asserted — feed real telemetry and it recomputes. The Fraud Detection Model breached the envelope (PSI {rows.find(r => r.band === "drift")?.psi.toFixed(2)}), which is the same signal behind incident INC-1039; drift routes to Model Risk for re-validation under Art.72.</>)}
    </Card>
  </div>;
}

/* ══════════════ WORKFLOW PERMISSIONS ══════════════ */
const SectionLabel = ({ eye, title, sub }) => <div style={{ margin: "22px 0 12px" }}>
  <Eyebrow style={{ color: AI_GOLD_INK }}>{eye}</Eyebrow>
  <h3 style={{ fontFamily: F.h, fontSize: 18, fontWeight: 900, color: T.ink, margin: "3px 0 0", letterSpacing: "-0.01em" }}>{title}</h3>
  <p style={{ fontFamily: F.b, fontSize: 11.5, color: T.ink3, margin: "4px 0 0", maxWidth: 820, lineHeight: 1.6 }}>{sub}</p>
</div>;

export function WorkflowPermissions({ showToast }) {
  const lang = useLang(); const ar = lang === "ar"; const T_ = en => ts(lang, en);
  const rows = workflowRows();
  const s = workflowStats();
  const orc = orchestrationRows();
  const wfComp = workflowCompositionRows();
  const cs = compositionStats();
  return <div style={{ animation: "up .3s ease" }}>
    <Head title={T_("Agent Chain Permissions")} sub={T_("Least privilege across multi-agent chains — at three altitudes. (1) Per step: every step is re-checked against that agent’s own capabilities (deny-by-default), so an agent can’t gain a capability by being placed in a chain. (2) Per delegation: a sub-agent runs with the intersection of its grants and the orchestrator’s mandate — min(orchestrator, sub-agent) — so an orchestrator can borrow a capability but never widen its own data reach. (3) Per composition: taint analysis across the whole chain catches emergent data paths where individually-allowed steps compose into an exfiltration route.")} />
    <div style={kpiGrid}>
      <Kpi l={T_("Chains analysed")} v={String(cs.chainsAnalysed)} c={AI_GOLD} sub={T_("workflows + orchestrations")} />
      <Kpi l={T_("Escalation blocked")} v={String(s.blocked)} c={T.red} sub={T_("per-step privilege escalation")} />
      <Kpi l={T_("Scope-widening blocked")} v={String(cs.widened)} c={T.red} sub={T_("delegation boundary")} />
      <Kpi l={T_("Emergent paths caught")} v={String(cs.emergentPaths)} c={T.amber} sub={T_("compositional exfil routes")} />
    </div>

    <SectionLabel eye={T_("Altitude 1 · per step")} title={T_("Workflow permissions")} sub={T_("Authored chains. Each step is re-checked against the agent’s own grant; a step invoking a tool the agent doesn’t hold is blocked as privilege escalation, and high-stakes steps escalate to a human.")} />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 14, alignItems: "start" }}>
      {rows.map(w => <Card key={w.id} style={cardPad}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
          <div><Eyebrow>{T_(w.owner)} · {T_("trigger")}: {T_(w.trigger)}</Eyebrow><H3>{T_(w.name)}</H3></div>
          <Pill c={w.safe ? T.green : T.red}>{w.safe ? T_("Least-privilege holds") : (ar ? `${w.blocked} تصعيد محظور` : `${w.blocked} escalation blocked`)}</Pill>
        </div>
        <div style={{ display: "grid", gap: 7 }}>
          {w.steps.map((st, i) => { const m = WF_DECISION_META[st.decision]; return <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", background: T.s2, border: `1px solid ${st.decision === "deny" ? T.red + "55" : T.border}`, borderRadius: 9, padding: "8px 11px" }}>
            <span style={{ minWidth: 18, fontSize: 10, fontWeight: 900, color: T.ink4, fontFamily: F.m }}>{i + 1}</span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.ink, fontFamily: F.b }}>{st.agent} <span style={{ color: T.ink4 }}>·</span> <span style={{ fontFamily: F.m }}>{st.tool}</span>{st.handoff && <span style={{ marginLeft: 6, fontSize: 9, color: AI_GOLD_INK, fontWeight: 800 }}>⇥ {T_("handoff")}</span>}</div>
              <div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b }}>{T_(st.note)}</div>
            </div>
            <Pill c={tok(m.tone)}>{T_(m.label)}</Pill>
          </div>; })}
        </div>
      </Card>)}
    </div>

    <SectionLabel eye={T_("Altitude 2 · per delegation")} title={T_("Orchestrator delegation")} sub={T_("An orchestrator delegates to sub-agents at runtime. Deny-by-default applies to the delegation, not just the agent: a sub-agent runs with min(orchestrator mandate, sub-agent grant). A delegation whose data scope lies outside the orchestrator’s mandate is scope-widening — blocked even though the sub-agent legitimately holds the tool.")} />
    <div style={{ display: "grid", gap: 14 }}>
      {orc.map(o => <Card key={o.id} style={cardPad}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 4 }}>
          <div><Eyebrow>{T_(o.owner)} · {T_("trigger")}: {T_(o.trigger)}</Eyebrow><H3>{T_(o.name)}</H3></div>
          <Pill c={o.safe ? T.green : T.red}>{o.widened ? (ar ? `${o.widened} توسيع نطاق محظور` : `${o.widened} scope-widening blocked`) : o.risks.length ? (ar ? `${o.risks.length} مسار ناشئ` : `${o.risks.length} emergent path`) : T_("Delegation holds")}</Pill>
        </div>
        <div style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b, marginBottom: 10 }}>{T_("Orchestrator")} <b style={{ color: T.ink2 }}>{o.orchestratorName}</b> · {T_("mandate")}: <span style={{ fontFamily: F.m }}>{o.mandate.map(T_).join(" · ")}</span></div>
        <div style={{ display: "grid", gap: 7 }}>
          {o.delegations.map((d, i) => { const m = DELEG_DECISION_META[d.decision]; const bad = d.decision === "widen" || d.decision === "deny"; return <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", background: T.s2, border: `1px solid ${bad ? T.red + "55" : T.border}`, borderRadius: 9, padding: "8px 11px" }}>
            <span style={{ minWidth: 18, fontSize: 10, fontWeight: 900, color: T.ink4, fontFamily: F.m }}>{i + 1}</span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.ink, fontFamily: F.b }}>⇒ {d.to} <span style={{ color: T.ink4 }}>·</span> <span style={{ fontFamily: F.m }}>{d.tool}</span>{d.handoff && <span style={{ marginLeft: 6, fontSize: 9, color: AI_GOLD_INK, fontWeight: 800 }}>⇥ {T_("delegated")}</span>}</div>
              <div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b }}>{T_(d.note)} <span style={{ color: T.ink4 }}>· {T_("scope")} {T_(d.scope)} {ar ? "←" : "→"} {T_("effective")} {T_(d.effective)}</span></div>
            </div>
            <Pill c={tok(m.tone)}>{T_(m.label)}</Pill>
          </div>; })}
        </div>
        {o.widened ? <div style={{ marginTop: 9, fontSize: 10.5, color: T.ink2, fontFamily: F.b, lineHeight: 1.55, background: T.red + "12", border: `1px solid ${T.red}33`, borderRadius: 9, padding: "9px 11px" }}>{o.delegations.find(d => d.decision === "widen")?.reason}</div> : null}
      </Card>)}
    </div>

    <SectionLabel eye={T_("Altitude 3 · per composition")} title={T_("Compositional risk")} sub={T_("Taint analysis across the whole chain. A step that reads sensitive data taints the chain; a mask or human gate clears it; an egress sink reached while tainted — with every step individually allowed — is an emergent exfiltration path per-step least privilege can’t see.")} />
    <Card style={cardPad}>
      {(() => {
        const paths = [
          ...orc.flatMap(o => o.risks.map(r => ({ chain: o.name, kind: "Orchestration", ...r }))),
          ...wfComp.flatMap(w => w.risks.map(r => ({ chain: w.name, kind: "Workflow", ...r }))),
        ];
        if (!paths.length) return <div style={{ fontSize: 12, color: T.ink3, fontFamily: F.b }}>{T_("No emergent paths across the analysed chains.")}</div>;
        return <div style={{ display: "grid", gap: 10 }}>
          {paths.map((p, i) => <div key={i} style={{ background: T.s2, border: `1px solid ${T.amber}55`, borderRadius: 10, padding: "11px 13px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 5 }}>
              <div style={{ fontSize: 11.5, fontWeight: 900, color: T.ink, fontFamily: F.m }}>{p.path}</div>
              <Pill c={T.amber}>{T_("Emergent exfil path")} · {T_(p.chain)}</Pill>
            </div>
            <div style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.55 }}>{p.detail}</div>
            <div style={{ fontSize: 10, color: T.ink4, fontFamily: F.b, marginTop: 5 }}>{T_("Remediation: insert a mask on the source or a human gate before the sink — then the path is contained without removing either capability.")}</div>
          </div>)}
        </div>;
      })()}
    </Card>

    <Card style={{ ...cardPad, marginTop: 14 }}>
      {advisor(ar
        ? <>ثلاثة مستويات، ضمانة واحدة. لكل خطوة، محاولة سير عمل الائتمان توجيه <span style={{ fontFamily: F.m }}>issue_decision</span> عبر وكيل لا يملكها <b style={{ color: T.red }}>محظورة</b>. لكل تفويض، محاولة منسّق الفصل سحب <span style={{ fontFamily: F.m }}>read_hris_full</span> — قدرة يملكها الوكيل الفرعي لكن نطاق <b>HRIS</b> الخاص بها خارج مهمة المنسّق — <b style={{ color: T.red }}>محظورة بوصفها توسيع نطاق</b>. لكل تركيب، يستطيع مُلخِّص مستندات منسّق الحل قراءة مستندات حساسة والوصول إلى الويب المفتوح في سياق واحد — <b style={{ color: T.amber }}>مسار تسريب ناشئ</b> تجتازه كل خطوة على حدة — مُعلَّم لقناع أو بوابة. {cs.emergentPaths} مسار ناشئ و{cs.widened} تفويض توسيع نطاق مُلتقَط عبر {cs.chainsAnalysed} سلسلة.</>
        : <>Three altitudes, one guarantee. Per step, the Credit workflow’s attempt to route <span style={{ fontFamily: F.m }}>issue_decision</span> through an agent that doesn’t hold it is <b style={{ color: T.red }}>blocked</b>. Per delegation, the Adjudication orchestrator’s attempt to pull <span style={{ fontFamily: F.m }}>read_hris_full</span> — a capability the sub-agent holds but whose <b>HRIS</b> scope is outside the orchestrator’s mandate — is <b style={{ color: T.red }}>blocked as scope-widening</b>. Per composition, the Resolution orchestrator’s doc-summariser can read sensitive documents and reach the open web in one context — an <b style={{ color: T.amber }}>emergent exfil path</b> every step passes individually — flagged for a mask or gate. {cs.emergentPaths} emergent path{cs.emergentPaths === 1 ? "" : "s"} and {cs.widened} scope-widening delegation{cs.widened === 1 ? "" : "s"} caught across {cs.chainsAnalysed} chains.</>)}
      <div style={{ marginTop: 12 }}><button onClick={() => showToast && showToast(ar ? "صُدّر تقرير أذونات سلسلة الوكلاء إلى الثقة والأدلة (لكل خطوة، وتفويض، وتركيبي)" : "Agent-chain permission report exported to Trust & Evidence (per-step, delegation & compositional)")} style={{ background: AI_GOLD, border: "none", borderRadius: 10, padding: "9px 15px", color: "#241703", fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>{T_("Export permission report")}</button></div>
    </Card>
  </div>;
}

/* ══════════════ ARTICLE 12 — INFERENCE LOG ══════════════ */
export function Article12Log({ showToast }) {
  const lang = useLang(); const ar = lang === "ar"; const T_ = en => ts(lang, en);
  const [live, setLive] = useState(null);
  useEffect(() => {
    let on = true;
    fetch("/api/inference-log?tenant=demo").then(r => r.json()).then(d => { if (on && d.enabled && Array.isArray(d.events) && d.events.length) setLive({ events: d.events, intact: d.chainIntact }); }).catch(() => {});
    return () => { on = false; };
  }, []);
  const isLive = !!live;
  const events = isLive ? live.events : INFERENCE_EVENTS;
  const s = inferenceStats(events, isLive ? live.intact : undefined);
  const shortTime = ts => (String(ts).split(" ")[1] || String(ts)).replace("Z", "");
  return <div style={{ animation: "up .3s ease" }}>
    <Head title={T_("Article 12 Log")} sub={T_("EU AI Act Art.12 automatic record-keeping. Every gateway inference emits a structured, machine-readable event appended to the tamper-evident audit hash chain (SHA-256): what ran, when, the policy decision, data class, tokens and a hash that cannot change without breaking every later row. This is the record a regulator reads — not a dashboard screenshot.")} />
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
      <Pill c={isLive ? T.green : T.ink3}>{isLive ? T_("● Live · read from your audit chain") : T_("Sample · connect a database for live rows")}</Pill>
    </div>
    <div style={kpiGrid}>
      <Kpi l={T_("Events logged")} v={String(s.total)} c={AI_GOLD} sub={isLive ? T_("from your database") : T_("sample window")} />
      <Kpi l={T_("Blocked")} v={String(s.blocked)} c={T.red} sub={T_("policy / least-privilege")} />
      <Kpi l={T_("Masked")} v={String(s.masked)} c={T.blue} sub={T_("PII redacted at ingress")} />
      <Kpi l={T_("Hash chain")} v={s.intact ? T_("Intact") : T_("Broken")} c={s.intact ? T.green : T.red} sub={isLive ? T_("verified over full chain") : T_("tamper-evident")} />
    </div>
    <Card style={cardPad}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <div><Eyebrow>{T_("Per-inference record · one row per call")}</Eyebrow><H3>{T_("Structured, machine-readable, hash-chained")}</H3></div>
        <button onClick={() => showToast && showToast(ar ? "صُدّر سجل استدلالات المادة 12 (JSON + سلسلة بصمات) لملف التدقيق" : "Art.12 inference log exported (JSON + hash chain) for the audit file")} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 13px", color: T.ink2, fontSize: 11.5, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>{T_("Export log")}</button>
      </div>
      <Table head={["Time (UTC)", "Model", "Agent · tool", "Decision", "Data class", "Tokens", "prev → hash"].map(T_)}>
        {events.map(e => { const m = INF_DECISION_META[e.decision] || { label: e.decision, tone: "ink3" }; return <tr key={e.id}>
          <Td style={{ fontFamily: F.m, color: T.ink3, whiteSpace: "nowrap" }}>{shortTime(e.ts)}</Td>
          <Td style={{ fontFamily: F.m, color: T.ink3 }}>{e.model}</Td>
          <Td style={{ fontWeight: 700, color: T.ink }}>{e.agent}<div style={{ fontSize: 9.5, color: T.ink4, fontFamily: F.m }}>{e.tool}</div></Td>
          <Td><Pill c={tok(m.tone)}>{T_(m.label)}</Pill>{e.detail ? <div style={{ fontSize: 9, color: T.ink4, fontFamily: F.b, marginTop: 2, maxWidth: 200 }}>{T_(e.detail)}</div> : null}</Td>
          <Td>{T_(e.dataClass)}</Td>
          <Td style={{ fontFamily: F.m, color: T.ink3 }}>{eventTokens(e)}</Td>
          <Td style={{ fontFamily: F.m, color: T.ink4, whiteSpace: "nowrap" }}>{String(e.prevHash).slice(0, 6)} {ar ? "←" : "→"} <span style={{ color: T.ink2 }}>{String(e.hash).slice(0, 6)}</span></Td>
        </tr>; })}
      </Table>
      {advisor(ar
        ? <>الحقول لكل حدث: {INFERENCE_FIELDS.join(", ")}. السلسلة {s.intact ? <b style={{ color: T.green }}>سليمة</b> : <b style={{ color: T.red }}>مكسورة</b>} — {isLive ? <>أُعيد التحقّق منها عبر سلسلة تدقيقك كاملةً بإعادة حساب كل بصمة SHA-256. هذه هي الأحداث الحقيقية التي كتبتها البوابة لاستدلالاتك.</> : <>تطابق البصمة السابقة لكل صف بصمة الصف السابق، لذا فإن تغيير أي حدث تاريخي يكسر كل بصمة بعده. اربط قاعدة بيانات وتُلحَق الأحداث المباشرة هنا عبر البوابة.</>}</>
        : <>Fields per event: {INFERENCE_FIELDS.join(", ")}. The chain is {s.intact ? <b style={{ color: T.green }}>intact</b> : <b style={{ color: T.red }}>broken</b>} — {isLive ? <>re-verified over your full audit chain by recomputing every SHA-256 hash. These are the real events the gateway wrote for your inferences.</> : <>each row’s prev-hash matches the previous row’s hash, so altering any historical event breaks every hash after it. Connect a database and live events append here through the gateway.</>}</>)}
    </Card>
  </div>;
}
