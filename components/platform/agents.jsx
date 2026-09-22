"use client";

import { useState } from "react";
import { readBus, pushBus } from "@/lib/bus";
import { AI_AGENTS, agentStats, capabilityCheck, agentControls, agentPosture, isOverPrivileged } from "@/lib/agent-registry";
import { T, F, AI_GOLD, AI_GOLD_INK, Tag, Bar, Card, SHead } from "./core";
import { useLang, ts, registerContent } from "@/lib/i18n";

/* Arabic for the AI Agents least-privilege surface. Lib-sourced tool actions,
   data scopes, control names and enumeration labels are rendered via T_ at
   render time; interpolated reasons/details fall back to English by design;
   agent/model/initiative names, tool identifiers, control codes and figures
   stay English. */
registerContent({
  // ── header ──
  "AI Agents · Least-Privilege": "وكلاء الذكاء الاصطناعي · أقل صلاحية",
  "Every autonomous agent is a governed object with declared capabilities. Over-privilege is flagged, high-stakes actions are gated behind approval, and the boundary is enforced at call time — denied by default.": "كل وكيل مستقل كائن مُحوكَم بقدرات مُعلَنة. يُوسَم الإفراط في الصلاحية، وتُقيَّد الإجراءات عالية المخاطر خلف موافقة، ويُنفَّذ الحدّ وقت الاستدعاء — بالمنع افتراضياً.",
  // ── KPIs ──
  "Agents governed": "وكلاء مُحوكَمون", "registered, owned objects": "كائنات مُسجَّلة ومملوكة",
  "Least-privilege index": "مؤشّر أقل صلاحية", "granted vs exercised, gated": "الممنوح مقابل المُمارَس، مُقيَّد",
  "Over-privileged": "مفرطو الصلاحية", "standing grants unused": "منح دائمة غير مُستخدَمة",
  "none — least privilege holds": "لا شيء — أقل صلاحية قائمة",
  "High-risk gated": "عالية المخاطر مُقيَّدة", "actions behind human approval": "إجراءات خلف موافقة بشرية",
  // ── agent list ──
  "Governed agents": "الوكلاء المُحوكَمون",
  // ── business units (agent data) ──
  "Customer Operations": "عمليات العملاء", "Retail Banking": "الخدمات المصرفية للأفراد",
  "Finance": "المالية", "People": "الموارد البشرية",
  // ── agent detail header ──
  "owner": "المالك", "human oversight on": "الإشراف البشري مُفعَّل", "no human oversight": "لا إشراف بشري",
  "Least privilege holds": "أقل صلاحية قائمة",
  // ── data scopes ──
  "CRM tickets": "تذاكر إدارة علاقات العملاء", "KB articles": "مقالات قاعدة المعرفة",
  "Applications": "الطلبات", "Bureau data": "بيانات المكتب", "Ledger": "الأستاذ العام",
  "Reconciliations": "التسويات", "Skills graph": "رسم المهارات", "Role profiles": "ملفات الأدوار",
  "Uploaded documents": "المستندات المرفوعة", "Transaction stream": "دفق المعاملات",
  // ── capabilities section ──
  "Capabilities — click Attempt to test the runtime boundary": "القدرات — انقر محاولة لاختبار حدّ وقت التشغيل",
  // ── tool actions (lib-sourced) ──
  "Read knowledge-base articles": "قراءة مقالات قاعدة المعرفة", "Read the customer's ticket": "قراءة تذكرة العميل",
  "Draft a reply for agent review": "صياغة ردّ لمراجعة الوكيل", "Send email directly to a customer": "إرسال بريد مباشرةً إلى العميل",
  "Read credit-bureau data": "قراءة بيانات مكتب الائتمان", "Compute a risk score": "حساب درجة خطر",
  "Issue an adverse credit decision": "إصدار قرار ائتمان ضار", "Write to the core banking ledger": "الكتابة إلى الأستاذ المصرفي الأساسي",
  "Read ledger balances": "قراءة أرصدة الأستاذ", "Reconcile accounts": "تسوية الحسابات",
  "Draft a journal entry": "صياغة قيد يومية", "Post a journal entry to the GL": "ترحيل قيد يومية إلى الأستاذ العام",
  "Read the skills graph": "قراءة رسم المهارات", "Recommend an internal role": "التوصية بدور داخلي",
  "Read the full HRIS record": "قراءة سجل نظام الموارد البشرية الكامل", "Notify an employee of a match": "إشعار موظف بتطابق",
  "Read uploaded documents": "قراءة المستندات المرفوعة", "Summarise a document": "تلخيص مستند",
  "Fetch content from the open web": "جلب محتوى من الويب المفتوح", "Read the transaction stream": "قراءة دفق المعاملات",
  "Flag a suspicious transaction": "وسم معاملة مشبوهة", "Freeze a customer account": "تجميد حساب عميل",
  // ── control labels (translatable ones; pure CTRL-* codes fall back) ──
  "EU AI Act Art.14 · HITL": "المادة 14 · الإنسان في الحلقة", "EU AI Act Art.22 · HITL": "المادة 22 · الإنسان في الحلقة",
  "SOX dual approval · CTRL-AUD-019": "موافقة SOX المزدوجة · CTRL-AUD-019", "HITL · CTRL-GRC-044": "الإنسان في الحلقة · CTRL-GRC-044",
  // ── risk pills ──
  "High": "عالٍ", "Medium": "متوسط", "Low": "منخفض",
  // ── capability status labels ──
  "Approval-gated": "مُقيَّد بموافقة", "Denied": "مرفوض", "Granted · in use": "ممنوح · قيد الاستخدام", "Granted": "ممنوح",
  // ── attempt button + verdict ──
  "Attempt": "محاولة", "✓ Allowed": "✓ مسموح", "⚠ Escalate to approval": "⚠ تصعيد إلى الموافقة", "✕ Denied": "✕ مرفوض",
  // ── decision reasons (static; interpolated ones fall back) ──
  "Tool is not in the agent's capability set — denied by default (least privilege).": "الأداة خارج مجموعة قدرات الوكيل — تُرفض افتراضياً (أقل صلاحية).",
  "Unknown agent — denied by default.": "وكيل مجهول — يُرفض افتراضياً.",
  // ── NIST ↔ ISO control map ──
  "NIST autonomous-agent controls ↔ ISO 42001": "ضوابط الوكلاء المستقلين NIST ↔ ISO 42001",
  "Agent inventory": "جرد الوكلاء", "Capability-based access control": "التحكّم في الوصول القائم على القدرات",
  "Human oversight on high-stakes actions": "الإشراف البشري على الإجراءات عالية المخاطر",
  "Immutable audit trail": "أثر تدقيق غير قابل للتغيير", "Objective / scope boundary": "حدّ الهدف / النطاق",
  "Grants and denials recorded to the evidence hash chain": "المنح والرفض مُسجَّلة في سلسلة بصمات الأدلة",
  "Enforced at the gateway by capabilityCheck deny-by-default": "مُنفَّذ عند البوابة بواسطة capabilityCheck بالمنع افتراضياً",
  "Met": "مُستوفى", "Partial": "جزئي", "Gap": "فجوة",
  // ── capability decision log ──
  "Capability decision log": "سجل قرارات القدرة", "Recorded to evidence": "مُسجَّل في الأدلة",
  "allow": "سماح", "escalate": "تصعيد", "deny": "منع",
  // ── toast fragments ──
  "allowed": "مسموح", "escalated to approval": "مُصعَّد إلى الموافقة", "denied by least-privilege": "مرفوض بأقل صلاحية",
});

/* ── AI Agents · least-privilege capability control ─────────────────
   Every agent is a governed object with declared capabilities. The
   registry surfaces over-privilege (the standing-grant failure mode),
   gates high-stakes actions behind human approval, and enforces the
   boundary at call time via capabilityCheck — deny by default. */
export function PageAgentRegistry({ role, showToast }) {
  const lang = useLang(); const ar = lang === "ar"; const T_ = en => ts(lang, en);
  const posture = agentPosture();
  const [selId, setSelId] = useState(AI_AGENTS[0].id);
  const sel = AI_AGENTS.find((a) => a.id === selId) || AI_AGENTS[0];
  const stats = agentStats(sel);
  const controls = agentControls();
  const [result, setResult] = useState(null);
  const [log, setLog] = useState(() => readBus("vz-agent-log").slice(0, 8));

  const riskColor = (r) => (r === "High" ? T.red : r === "Medium" ? AI_GOLD : T.green);
  const statusOf = (t) => isOverPrivileged(t) ? { label: "Over-privileged", color: T.red }
    : !t.granted ? { label: t.requiresApproval ? "Approval-gated" : "Denied", color: t.requiresApproval ? T.blue : T.ink3 }
    : t.exercised ? { label: "Granted · in use", color: T.green } : { label: "Granted", color: T.green };

  const attempt = (t) => {
    const r = capabilityCheck(sel.id, t.name);
    setResult({ tool: t.name, ...r });
    const entry = { time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }), agent: sel.name, tool: t.name, decision: r.decision, reason: r.reason };
    pushBus("vz-agent-log", entry);
    setLog((l) => [entry, ...l].slice(0, 8));
    /* Every capability decision is evidence — record denials/escalations
       to the same trail the gateway writes to. */
    if (r.decision !== "allow") pushBus("vz-gw-evidence", { item: `Agent capability ${r.decision}: ${sel.name} → ${t.name}`, initiative: sel.initiative, scope: "Agent", control: r.control || "Least-privilege boundary", risk: "Capability governance", owner: sel.owner, status: "Complete", approval: "Auto-captured", version: "v1", time: "Just now" });
    showToast && showToast(`${t.name}: ${r.decision === "allow" ? T_("allowed") : r.decision === "escalate" ? T_("escalated to approval") : T_("denied by least-privilege")}`, r.decision === "allow" ? undefined : "error");
  };

  const kpis = [
    ["Agents governed", posture.agents, T.blue, "registered, owned objects"],
    ["Least-privilege index", posture.index + "%", posture.index >= 80 ? T.green : posture.index >= 60 ? AI_GOLD : T.red, "granted vs exercised, gated"],
    ["Over-privileged", posture.overPrivileged.length, posture.overPrivileged.length ? T.red : T.green, posture.overPrivileged.length ? "standing grants unused" : "none — least privilege holds"],
    ["High-risk gated", `${posture.gatedHigh}/${posture.totalHigh}`, posture.gatedHigh === posture.totalHigh ? T.green : AI_GOLD, "actions behind human approval"],
  ];

  return <div style={{ animation: "up .3s ease" }}>
    <SHead title={T_("AI Agents · Least-Privilege")} sub={T_("Every autonomous agent is a governed object with declared capabilities. Over-privilege is flagged, high-stakes actions are gated behind approval, and the boundary is enforced at call time — denied by default.")} />

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10, marginBottom: 14 }}>
      {kpis.map(([l, v, c, sub]) => <Card key={l} style={{ padding: "12px 14px" }}>
        <div style={{ fontSize: 9, fontWeight: 800, fontFamily: F.m, color: T.ink4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{T_(l)}</div>
        <div style={{ fontSize: 24, fontWeight: 900, fontFamily: F.m, color: c, margin: "3px 0 2px" }}>{v}</div>
        <div style={{ fontSize: 9.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.4 }}>{T_(sub)}</div>
      </Card>)}
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 14 }}>
      {/* Agent list */}
      <Card style={{ padding: 0, overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "11px 14px", borderBottom: `1px solid ${T.border}`, fontSize: 12, fontWeight: 800, color: T.ink, fontFamily: F.h }}>{T_("Governed agents")}</div>
        {AI_AGENTS.map((a, i) => { const s = agentStats(a); const over = s.overPriv.length > 0; return <button key={a.id} onClick={() => { setSelId(a.id); setResult(null); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", border: "none", borderBottom: i < AI_AGENTS.length - 1 ? `1px solid ${T.border}` : "none", background: sel.id === a.id ? T.s3 : "transparent", borderLeft: `3px solid ${sel.id === a.id ? AI_GOLD : "transparent"}`, cursor: "pointer" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: T.ink, fontFamily: F.b }}>{a.name}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {over && <span title={T_("Over-privileged")} style={{ width: 7, height: 7, borderRadius: "50%", background: T.red }} />}
              <span style={{ fontSize: 11, fontWeight: 900, fontFamily: F.m, color: s.score >= 80 ? T.green : s.score >= 60 ? AI_GOLD : T.red }}>{s.score}%</span>
            </span>
          </div>
          <div style={{ fontSize: 9, color: T.ink4, fontFamily: F.m, marginTop: 2 }}>{a.initiative} · {T_(a.unit)}</div>
        </button>; })}
      </Card>

      {/* Agent detail: capability matrix + enforcement */}
      <div style={{ display: "grid", gap: 14 }}>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "13px 16px", borderBottom: `1px solid ${T.border}`, background: `linear-gradient(135deg,${AI_GOLD}12,${T.s2})` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: T.ink, fontFamily: F.h }}>{sel.name}</h3>
                <div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b, marginTop: 3 }}>{sel.model} · {T_("owner")} {sel.owner} · {sel.oversight ? T_("human oversight on") : T_("no human oversight")}</div>
              </div>
              <span style={{ fontSize: 9.5, fontWeight: 900, fontFamily: F.m, color: stats.leastPrivilegeOk ? T.green : T.red, background: (stats.leastPrivilegeOk ? T.green : T.red) + "1a", border: `1px solid ${(stats.leastPrivilegeOk ? T.green : T.red)}55`, borderRadius: 999, padding: "3px 10px" }}>{stats.leastPrivilegeOk ? T_("Least privilege holds") : (ar ? `${stats.overPriv.length} مفرط الصلاحية` : `${stats.overPriv.length} over-privileged`)}</span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 9 }}>
              {sel.dataScopes.map((d) => <Tag key={d} label={T_(d)} color={T.blue} bg={T.blue + "14"} />)}
            </div>
          </div>
          <div style={{ padding: "12px 16px" }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: T.ink4, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: F.m, marginBottom: 8 }}>{T_("Capabilities — click Attempt to test the runtime boundary")}</div>
            <div style={{ display: "grid", gap: 7 }}>
              {sel.tools.map((t) => { const st = statusOf(t); return <div key={t.name} style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 10, alignItems: "center", background: T.s2, border: `1px solid ${isOverPrivileged(t) ? T.red + "45" : T.border}`, borderRadius: 9, padding: "9px 11px" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: T.ink, fontFamily: F.m }}>{t.name}</div>
                  <div style={{ fontSize: 9.5, color: T.ink3, fontFamily: F.b, marginTop: 1 }}>{T_(t.action)} · {T_(t.control)}</div>
                </div>
                <Tag label={T_(t.risk)} color={riskColor(t.risk)} bg={riskColor(t.risk) + "16"} />
                <span style={{ fontSize: 9, fontWeight: 900, fontFamily: F.m, color: st.color, whiteSpace: "nowrap" }}>{T_(st.label)}</span>
                <button onClick={() => attempt(t)} style={{ background: T.s3, border: `1px solid ${T.border}`, borderRadius: 7, padding: "5px 10px", color: T.ink2, fontSize: 9.5, fontWeight: 800, fontFamily: F.b, cursor: "pointer" }}>{T_("Attempt")} {ar ? "←" : "→"}</button>
              </div>; })}
            </div>
            {result && <div style={{ marginTop: 11, background: (result.allowed ? T.green : result.decision === "escalate" ? T.blue : T.red) + "12", border: `1px solid ${(result.allowed ? T.green : result.decision === "escalate" ? T.blue : T.red)}40`, borderRadius: 9, padding: "10px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 900, fontFamily: F.m, color: result.allowed ? T.green : result.decision === "escalate" ? T.blue : T.red, textTransform: "uppercase", letterSpacing: "0.05em" }}>{result.decision === "allow" ? T_("✓ Allowed") : result.decision === "escalate" ? T_("⚠ Escalate to approval") : T_("✕ Denied")}</span>
                <span style={{ fontSize: 10, color: T.ink3, fontFamily: F.m }}>{sel.id} · {result.tool}</span>
              </div>
              <div style={{ fontSize: 10.5, color: T.ink2, fontFamily: F.b, lineHeight: 1.5, marginTop: 5 }}>{T_(result.reason)}</div>
            </div>}
          </div>
        </Card>

        {/* NIST agent ↔ ISO 42001 control map */}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}><h3 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: T.ink, fontFamily: F.h }}>{T_("NIST autonomous-agent controls ↔ ISO 42001")}</h3></div>
          <div style={{ padding: "10px 16px", display: "grid", gap: 8 }}>
            {controls.map((c) => { const col = c.status === "Met" ? T.green : c.status === "Partial" ? AI_GOLD : T.red; return <div key={c.id} style={{ display: "grid", gridTemplateColumns: "1.3fr auto", gap: 10, alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: T.ink, fontFamily: F.b }}>{T_(c.control)}</div>
                <div style={{ fontSize: 9, color: T.ink4, fontFamily: F.m, marginTop: 1 }}>{c.nist} · {c.iso}</div>
                <div style={{ fontSize: 9.5, color: T.ink3, fontFamily: F.b, marginTop: 2 }}>{T_(c.detail)}</div>
              </div>
              <Tag label={T_(c.status)} color={col} bg={col + "18"} />
            </div>; })}
          </div>
        </Card>

        {/* Immutable capability decision log */}
        {log.length > 0 && <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}><h3 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: T.ink, fontFamily: F.h }}>{T_("Capability decision log")}</h3><Tag label={T_("Recorded to evidence")} color={AI_GOLD} bg={AI_GOLD + "18"} /></div>
          <div style={{ padding: "8px 16px" }}>
            {log.map((e, i) => <div key={i} style={{ fontSize: 10, color: T.ink3, fontFamily: F.b, lineHeight: 1.7, borderBottom: i < log.length - 1 ? `1px solid ${T.border}` : "none", padding: "3px 0" }}>
              <span style={{ color: e.decision === "allow" ? T.green : e.decision === "escalate" ? T.blue : T.red, fontWeight: 800 }}>{T_(e.decision)}</span> · {e.agent} {ar ? "←" : "→"} {e.tool} · {e.time}
            </div>)}
          </div>
        </Card>}
      </div>
    </div>
  </div>;
}
