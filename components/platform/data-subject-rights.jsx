"use client";

import { useState } from "react";
import { T, F, AI_GOLD, AI_GOLD_INK, Card } from "./core";
import {
  DSR_RIGHTS, dsrRecords, dsrRequests, DSR_WORKFLOW, dsrStats,
} from "@/lib/data-subject-rights";
import { useLang, ts, registerContent } from "@/lib/i18n";

/* Arabic content for the Data Subject Rights surface (M2). */
registerContent({
  "Data Subject Rights": "حقوق أصحاب البيانات",
  "The people behind the data: for every AI system that processes personal data, can the enterprise honour a subject's rights — see, correct, delete, port their data, and prove consent was given and can be withdrawn — within the statutory clock? One operating record per system across four rights, plus a live request queue running against the tightest regime window. This is the single control the data-subject-rights duties of GDPR Ch. III, the UAE PDPL, DIFC DP Law, India's DPDP Act and Brazil's LGPD all point at.": "الناس خلف البيانات: لكل نظام ذكاء اصطناعي يعالج بيانات شخصية، هل تستطيع المؤسسة احترام حقوق صاحب البيانات — أن يرى ويصحّح ويحذف وينقل بياناته، وأن تُثبَت الموافقة وإمكانية سحبها — ضمن المهلة القانونية؟ سجل تشغيلي واحد لكل نظام عبر أربعة حقوق، مع طابور طلبات حيّ يعمل مقابل أضيق نافذة تنظيمية. وهذا هو الضابط الواحد الذي تشير إليه واجبات حقوق أصحاب البيانات في الفصل الثالث من القانون الأوروبي، وقانون الإمارات لحماية البيانات، وقانون DIFC، وقانون DPDP الهندي، وقانون LGPD البرازيلي دفعة واحدة.",
  "The people behind the data · rights honoured on the clock": "الناس خلف البيانات · حقوق تُحترَم ضمن المهلة",
  "Honour the right, prove it, on the clock": "احترم الحق، وأثبِته، ضمن المهلة",
  "A model is only as governed as the rights it honours for the people in its data. Each record shows how a system answers access, rectification, erasure and consent — with a documented lawful basis and retention schedule — and every open request runs against the tightest statutory window that applies.": "النظام مُحوكَم بقدر الحقوق التي يحترمها للأشخاص في بياناته. يُظهر كل سجل كيف يستجيب النظام لحقوق الوصول والتصحيح والحذف والموافقة — مع أساس قانوني موثّق وجدول احتفاظ — ويعمل كل طلب مفتوح مقابل أضيق نافذة قانونية سارية.",
  "OPEN RIGHTS REQUESTS": "طلبات حقوق مفتوحة",
  // KPIs
  "Rights operational": "حقوق تشغيلية", "systems honour rights end-to-end": "أنظمة تحترم الحقوق من طرف إلى طرف",
  "Requests on time": "طلبات في الموعد", "answered within the statutory clock": "مُجابة ضمن المهلة القانونية",
  "Consent provable": "موافقة قابلة للإثبات", "recorded and withdrawable": "مُسجّلة وقابلة للسحب",
  "Erasure ready": "جاهزية الحذف", "delete on request or on schedule": "حذف عند الطلب أو وفق الجدول",
  // register
  "The register · one rights record per system": "السجل · سجل حقوق واحد لكل نظام",
  "Access → rectify → erase → consent — click any row for the rights detail": "وصول ← تصحيح ← حذف ← موافقة — انقر أي صف لعرض تفاصيل الحقوق",
  "Coverage is scored from the four rights (Met = 100, Partial = 60). Earlier-stage systems carry open rights honestly.": "تُحتسب التغطية من الحقوق الأربعة (مستوفى = 100، جزئي = 60). وتحمل الأنظمة في مراحلها المبكرة حقوقاً مفتوحة بصدق.",
  "System": "النظام", "Unit": "الوحدة", "PII": "بيانات شخصية", "Consent basis": "أساس الموافقة", "Retention": "الاحتفاظ", "Coverage": "التغطية", "Status": "الحالة",
  "Consent basis:": "أساس الموافقة:", "Retention:": "الاحتفاظ:",
  // statuses / pii
  "Operational": "تشغيلي", "In review": "قيد المراجعة", "Gaps": "فجوات",
  "High": "مرتفعة", "Medium": "متوسطة", "Low": "منخفضة",
  "Met": "مستوفى", "Partial": "جزئي", "Open": "مفتوح",
  // rights names
  "Access & portability": "الوصول والنقل", "Rectification": "التصحيح",
  "Erasure & retention": "الحذف والاحتفاظ", "Consent capture / withdraw": "التقاط / سحب الموافقة",
  // consent bases
  "Legal obligation + legitimate interest": "التزام قانوني + مصلحة مشروعة", "Contract + consent": "عقد + موافقة", "Legitimate interest": "مصلحة مشروعة",
  // retention schedules
  "Conversations purged at 90 days · no training reuse": "حذف المحادثات عند 90 يوماً · دون إعادة استخدام للتدريب",
  "Decision records 7 years (reg.) · features 24 months": "سجلات القرار 7 سنوات (تنظيمي) · السمات 24 شهراً",
  "Ledger evidence 7 years · intermediates 30 days": "أدلة الدفتر 7 سنوات · الوسيطة 30 يوماً",
  "Profiles refreshed 12 months · purge on exit": "تحديث الملفات كل 12 شهراً · حذف عند المغادرة",
  "Purpose-bound · reviewed annually": "مقيّدة بالغرض · تُراجَع سنوياً",
  // systems + units (module-safe; also registered by provenance)
  "Customer Resolution Copilot": "مساعد حل مشكلات العملاء", "Credit Decision Assurance": "ضمان قرارات الائتمان",
  "Finance Close Automation": "أتمتة إقفال الحسابات", "Workforce Skills Navigator": "مُوجّه مهارات القوى العاملة",
  "Customer Operations": "عمليات العملاء", "Retail Banking": "الخدمات المصرفية للأفراد", "Finance": "المالية", "People": "الموارد البشرية",
  // request queue
  "The clock · live data-subject requests": "المهلة · طلبات أصحاب البيانات الحيّة",
  "Every request runs against the tightest regime window — GDPR's one month, the UAE PDPL, DIFC, India's DPDP and Brazil's LGPD.": "يعمل كل طلب مقابل أضيق نافذة تنظيمية — شهر القانون الأوروبي الواحد، وقانون الإمارات، وDIFC، وDPDP الهندي، وLGPD البرازيلي.",
  "Request": "الطلب", "Subject": "صاحب البيانات", "Type": "النوع", "Regime": "النظام التنظيمي", "Lodged": "قُدّم", "Time left": "الوقت المتبقّي", "Stage": "المرحلة",
  "Access": "وصول", "Portability": "نقل", "Erasure": "حذف",
  "Verifying": "التحقّق", "Locating": "التحديد", "Actioning": "التنفيذ", "Escalated": "مُصعَّد",
  "on track": "مسار سليم", "due": "مستحق", "overdue": "متأخر",
  // workflow
  "The workflow · six stages that answer a request within the clock": "سير العمل · ست مراحل تُجيب طلباً ضمن المهلة",
  "Receive": "الاستلام", "Verify": "التحقّق", "Locate": "التحديد", "Action": "التنفيذ", "Respond": "الردّ", "Log": "التسجيل",
  "Intake the request through any channel and log it against the clock.": "استلم الطلب عبر أي قناة وسجّله مقابل المهلة.",
  "Verify the requester's identity without collecting excess data.": "تحقّق من هوية مقدّم الطلب دون جمع بيانات زائدة.",
  "Find every system and copy holding the subject's personal data.": "اعثر على كل نظام ونسخة تحمل بيانات صاحب البيانات الشخصية.",
  "Access, correct, erase or export per the right invoked — and its exemptions.": "وصول أو تصحيح أو حذف أو تصدير وفق الحق المُطالَب به — واستثناءاته.",
  "Respond within the statutory window, in the subject's language.": "ردّ ضمن النافذة القانونية، وبلغة صاحب البيانات.",
  "Record the request, action taken and proof for audit and reporting.": "سجّل الطلب والإجراء المتّخذ والدليل للتدقيق والتقارير.",
  "Privacy Ops": "عمليات الخصوصية", "Data owners": "مالكو البيانات", "Data owner + CDPO": "مالك البيانات + حماية البيانات", "CDPO": "حماية البيانات", "Governance Office": "مكتب الحوكمة",
  // buttons
  "Open a rights request": "افتح طلب حقوق", "Export rights pack": "تصدير حزمة الحقوق",
});

/* shared primitives — match the platform's visual language (as in provenance) */
const tok = k => ({ crit: T.red, warn: T.amber, info: T.blue, good: T.green, ink3: T.ink3, gold: AI_GOLD }[k] || T.ink3);
const cardPad = { padding: 18 };
const Eyebrow = ({ children, style }) => <div style={{ fontSize: 9, letterSpacing: "0.09em", textTransform: "uppercase", color: T.ink4, fontWeight: 900, fontFamily: F.m, ...style }}>{children}</div>;
const H3 = ({ children, style }) => <h3 style={{ fontFamily: F.h, fontSize: 16, fontWeight: 900, color: T.ink, margin: "4px 0 0", ...style }}>{children}</h3>;
const Head = ({ title, sub }) => <div style={{ marginBottom: 16 }}><h2 style={{ fontFamily: F.h, fontSize: 24, fontWeight: 900, color: T.ink, margin: 0, letterSpacing: "-0.02em" }}>{title}</h2><p style={{ fontFamily: F.b, fontSize: 12.5, color: T.ink3, margin: "5px 0 0", maxWidth: 780, lineHeight: 1.6 }}>{sub}</p></div>;
const Pill = ({ c, children }) => <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 9px", borderRadius: 999, fontSize: 10, fontWeight: 800, fontFamily: F.b, color: c, background: c + "18", border: `1px solid ${c}40` }}>{children}</span>;
const Th = ({ children, style }) => <th style={{ textAlign: "left", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: T.ink4, fontWeight: 900, fontFamily: F.m, padding: "0 10px 9px", borderBottom: `1px solid ${T.border}`, ...style }}>{children}</th>;
const Td = ({ children, style }) => <td style={{ padding: "10px", borderBottom: `1px solid ${T.border}`, color: T.ink2, fontSize: 11.5, fontFamily: F.b, verticalAlign: "middle", ...style }}>{children}</td>;
const Table = ({ head, children }) => <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr>{head.map((h, i) => <Th key={i}>{h}</Th>)}</tr></thead><tbody>{children}</tbody></table></div>;
const rightTone = s => s === "Met" ? T.green : s === "Partial" ? T.amber : T.red;
const clockTone = st => st === "overdue" ? T.red : st === "due" ? T.amber : T.green;

export function DataSubjectRights({ showToast }) {
  const lang = useLang();
  const ar = lang === "ar";
  const T_ = en => ts(lang, en);
  const s = dsrStats();
  const rows = [...dsrRecords()].sort((a, b) => b.coverage - a.coverage);
  const reqs = [...dsrRequests()].sort((a, b) => a.daysLeft - b.daysLeft);
  const [open, setOpen] = useState(null);
  const kpis = [
    [T_("Rights operational"), `${s.operational}/${s.total}`, s.operational === s.total ? T.green : AI_GOLD, T_("systems honour rights end-to-end")],
    [T_("Requests on time"), `${s.onTimePct}%`, s.onTimePct >= 90 ? T.green : s.onTimePct >= 75 ? AI_GOLD : T.red, T_("answered within the statutory clock")],
    [T_("Consent provable"), `${s.consentHeldPct}%`, s.consentHeldPct >= 75 ? T.green : AI_GOLD, T_("recorded and withdrawable")],
    [T_("Erasure ready"), `${s.eraseReadyPct}%`, s.eraseReadyPct >= 75 ? T.green : AI_GOLD, T_("delete on request or on schedule")],
  ];
  const piiTone = p => p === "High" ? T.red : p === "Medium" ? T.amber : T.ink3;
  const stTone = st => st === "Operational" ? T.green : st === "In review" ? T.amber : T.red;
  const timeLeft = r => r.daysLeft >= 0
    ? (ar ? `${r.daysLeft} يوماً متبقياً` : `${r.daysLeft} days left`)
    : (ar ? `${-r.daysLeft} يوماً تجاوزاً` : `${-r.daysLeft} days over`);
  const lodged = r => ar ? `قبل ${r.elapsedD} يوماً` : `${r.elapsedD}d ago`;
  return <div style={{ animation: "up .3s ease" }}>
    <Head title={T_("Data Subject Rights")} sub={T_("The people behind the data: for every AI system that processes personal data, can the enterprise honour a subject's rights — see, correct, delete, port their data, and prove consent was given and can be withdrawn — within the statutory clock? One operating record per system across four rights, plus a live request queue running against the tightest regime window. This is the single control the data-subject-rights duties of GDPR Ch. III, the UAE PDPL, DIFC DP Law, India's DPDP Act and Brazil's LGPD all point at.")} />

    {/* charter */}
    <Card style={{ ...cardPad, marginBottom: 14, background: `linear-gradient(135deg,${T.s2},${T.bg})`, border: `1px solid ${AI_GOLD}38` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ maxWidth: 640 }}>
          <Eyebrow style={{ color: AI_GOLD_INK }}>{T_("The people behind the data · rights honoured on the clock")}</Eyebrow>
          <H3 style={{ fontSize: 18 }}>{T_("Honour the right, prove it, on the clock")}</H3>
          <p style={{ fontSize: 11.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.65, margin: "6px 0 0" }}>{T_("A model is only as governed as the rights it honours for the people in its data. Each record shows how a system answers access, rectification, erasure and consent — with a documented lawful basis and retention schedule — and every open request runs against the tightest statutory window that applies.")}</p>
        </div>
        <div style={{ textAlign: "center", background: T.s2, border: `1px solid ${AI_GOLD}45`, borderRadius: 12, padding: "12px 18px", minWidth: 130 }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: s.overdue ? T.red : AI_GOLD_INK, fontFamily: F.m, lineHeight: 1 }}>{s.open}</div>
          <div style={{ fontSize: 9.5, color: T.ink3, fontWeight: 800, fontFamily: F.b, marginTop: 4, letterSpacing: "0.04em" }}>{T_("OPEN RIGHTS REQUESTS")}</div>
        </div>
      </div>
    </Card>

    {/* KPIs */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 14 }}>
      {kpis.map(([l, v, c, sub]) => <Card key={l} style={{ padding: "13px 15px" }}>
        <Eyebrow>{l}</Eyebrow>
        <div style={{ fontSize: 24, fontWeight: 900, color: c, fontFamily: F.m, margin: "5px 0 2px" }}>{v}</div>
        <div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b }}>{sub}</div>
      </Card>)}
    </div>

    {/* the register */}
    <Card style={{ ...cardPad, marginBottom: 14 }}>
      <Eyebrow>{T_("The register · one rights record per system")}</Eyebrow>
      <H3 style={{ marginBottom: 6 }}>{T_("Access → rectify → erase → consent — click any row for the rights detail")}</H3>
      <p style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b, margin: "0 0 12px", lineHeight: 1.5 }}>{T_("Coverage is scored from the four rights (Met = 100, Partial = 60). Earlier-stage systems carry open rights honestly.")}</p>
      <Table head={["System", "Unit", "PII", "Consent basis", "Retention", "Coverage", "Status"].map(T_)}>
        {rows.map(r => {
          const isOpen = open === r.id;
          return [
            <tr key={r.id} onClick={() => setOpen(isOpen ? null : r.id)} style={{ cursor: "pointer" }}>
              <Td style={{ fontWeight: 700, color: T.ink, minWidth: 175 }}>{T_(r.name)}</Td>
              <Td style={{ color: T.ink3 }}>{T_(r.unit)}</Td>
              <Td><Pill c={piiTone(r.pii)}>{T_(r.pii)}</Pill></Td>
              <Td style={{ color: T.ink3, fontSize: 10.5, maxWidth: 175 }}>{T_(r.consentModel)}</Td>
              <Td style={{ color: T.ink3, fontSize: 10.5, maxWidth: 200 }}>{T_(r.retention)}</Td>
              <Td style={{ minWidth: 120 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, height: 6, background: T.s2, borderRadius: 4, overflow: "hidden", minWidth: 54 }}><div style={{ width: `${r.coverage}%`, height: "100%", background: r.coverage >= 85 ? T.green : r.coverage >= 60 ? AI_GOLD : T.red }} /></div>
                  <span style={{ fontFamily: F.m, fontSize: 11, fontWeight: 800, color: T.ink }}>{r.coverage}%</span>
                </div>
              </Td>
              <Td><Pill c={stTone(r.status)}>{T_(r.status)}</Pill></Td>
            </tr>,
            isOpen && <tr key={r.id + "-d"}><td colSpan={7} style={{ padding: "0 10px 12px" }}>
              <div style={{ background: AI_GOLD + "10", border: `1px solid ${AI_GOLD}30`, borderRadius: 10, padding: "11px 13px" }}>
                <div style={{ fontSize: 10.5, color: T.ink2, fontFamily: F.b, marginBottom: 9 }}><b style={{ color: AI_GOLD_INK }}>{T_("Consent basis:")}</b> {T_(r.consentModel)} <span style={{ color: T.ink4, marginInlineStart: 8 }}><b style={{ color: AI_GOLD_INK }}>{T_("Retention:")}</b> {T_(r.retention)}</span></div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(215px,1fr))", gap: 7 }}>
                  {r.rights.map(rt => <div key={rt.id} style={{ display: "flex", alignItems: "center", gap: 8, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "7px 10px" }}>
                    <span style={{ width: 7, height: 7, borderRadius: 999, background: rightTone(rt.status), flexShrink: 0 }} />
                    <span style={{ fontSize: 10.5, color: T.ink2, fontFamily: F.b, fontWeight: 600, flex: 1 }}>{T_(rt.name)}</span>
                    <span style={{ fontSize: 9.5, fontWeight: 800, fontFamily: F.b, color: rightTone(rt.status) }}>{T_(rt.status)}</span>
                  </div>)}
                </div>
              </div>
            </td></tr>,
          ];
        })}
      </Table>
    </Card>

    {/* the request queue — the clock */}
    <Card style={{ ...cardPad, marginBottom: 14 }}>
      <Eyebrow>{T_("The clock · live data-subject requests")}</Eyebrow>
      <H3 style={{ marginBottom: 6 }}>{`${s.open - s.overdue}/${s.open} ${ar ? "ضمن المهلة" : "within the clock"}`}</H3>
      <p style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b, margin: "0 0 12px", lineHeight: 1.5 }}>{T_("Every request runs against the tightest regime window — GDPR's one month, the UAE PDPL, DIFC, India's DPDP and Brazil's LGPD.")}</p>
      <Table head={["Request", "Subject", "Type", "System", "Regime", "Lodged", "Time left", "Stage"].map(T_)}>
        {reqs.map(r => <tr key={r.id}>
          <Td style={{ fontFamily: F.m, fontWeight: 700, color: T.ink }}>{r.id}</Td>
          <Td style={{ fontFamily: F.m, color: T.ink3 }}>{r.subject}</Td>
          <Td><Pill c={T.blue}>{T_(r.typeLabel)}</Pill></Td>
          <Td style={{ color: T.ink2, minWidth: 150 }}>{T_(r.system)}</Td>
          <Td style={{ color: T.ink3, fontSize: 10.5 }}>{r.regimeName} · {r.basis}</Td>
          <Td style={{ color: T.ink3, fontSize: 10.5 }}>{lodged(r)}</Td>
          <Td style={{ minWidth: 110 }}><Pill c={clockTone(r.state)}>{timeLeft(r)}</Pill></Td>
          <Td><span style={{ fontSize: 10.5, fontWeight: 800, fontFamily: F.b, color: clockTone(r.state) }}>{T_(r.stage)}</span></Td>
        </tr>)}
      </Table>
    </Card>

    {/* the workflow */}
    <Card style={cardPad}>
      <Eyebrow>{T_("The workflow · six stages that answer a request within the clock")}</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>{[T_("Receive"), T_("Verify"), T_("Locate"), T_("Action"), T_("Respond"), T_("Log")].join(" → ")}</H3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(205px,1fr))", gap: 10 }}>
        {DSR_WORKFLOW.map(st => <div key={st.n} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 11, padding: "12px 13px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ width: 22, height: 22, borderRadius: 7, background: AI_GOLD + "1c", border: `1px solid ${AI_GOLD}45`, color: AI_GOLD_INK, fontFamily: F.m, fontWeight: 900, fontSize: 11, display: "grid", placeItems: "center" }}>{st.n}</span>
            <span style={{ fontSize: 12.5, fontWeight: 900, color: T.ink, fontFamily: F.h }}>{T_(st.stage)}</span>
          </div>
          <div style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.55, marginBottom: 6 }}>{T_(st.crit)}</div>
          <Pill c={T.blue}>{T_(st.owner)}</Pill>
        </div>)}
      </div>
      <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 10, background: AI_GOLD + "12", border: `1px solid ${AI_GOLD}30`, fontSize: 11, color: T.ink2, lineHeight: 1.6, fontFamily: F.b }}>
        <b style={{ color: AI_GOLD_INK }}>{ar ? "فيرِس إنتليجنس:" : "Veris Intelligence:"}</b> {ar ? `${s.operational} من ${s.total} أنظمة تحترم الحقوق من طرف إلى طرف؛ و${s.onTimePct}% من الطلبات المفتوحة تُجاب ضمن المهلة القانونية${s.overdue ? `، مع ${s.overdue} طلب متأخر يستوجب التصعيد` : ""}. سجل واحد يستوفي الفصل الثالث من القانون الأوروبي، وقانون الإمارات، وقانون DIFC، وDPDP الهندي، وLGPD البرازيلي دفعة واحدة — البناء نفسه، وحقوق أصحاب البيانات مُغلَقة.` : `${s.operational} of ${s.total} systems honour rights end-to-end; ${s.onTimePct}% of open requests are answered within the statutory clock${s.overdue ? `, with ${s.overdue} overdue and escalated` : ""}. One record answers GDPR Ch. III, the UAE PDPL, DIFC DP Law, India's DPDP Act and Brazil's LGPD at once — the same build, data-subject rights closed.`}
      </div>
      <div style={{ display: "flex", gap: 9, marginTop: 14, flexWrap: "wrap" }}>
        <button onClick={() => showToast && showToast(ar ? "فُتح طلب حقوق — بدأت المهلة القانونية، والتحقّق من الهوية قيد التنفيذ" : "Rights request opened — statutory clock started, identity verification in progress")} style={{ background: AI_GOLD, border: "none", borderRadius: 10, padding: "9px 15px", color: "#241703", fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>{T_("Open a rights request")}</button>
        <button onClick={() => showToast && showToast(ar ? "صُدّرت حزمة الحقوق — الطلبات والإجراءات والأدلة عبر كل نظام تنظيمي" : "Rights pack exported — requests, actions and proof across every regime")} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 15px", color: T.ink2, fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>{T_("Export rights pack")}</button>
      </div>
    </Card>
  </div>;
}
