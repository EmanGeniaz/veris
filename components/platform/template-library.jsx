"use client";

import { useState } from "react";
import { T, F, AI_GOLD, AI_GOLD_INK, Card, vzDownload } from "./core";
import { pushBus } from "@/lib/bus";
import { TEMPLATE_PACKS, templateLibraryStats, packPosture, _templateFoot } from "@/lib/template-library";
import { useLang, ts, registerContent } from "@/lib/i18n";

/* Arabic content for the Template Library surface. */
registerContent({
  // header
  "Template Library": "مكتبة القوالب",
  "A repository of governance template packs — ISO/IEC 42001, ISO/IEC 27001, NIST AI RMF and the EU AI Act. Each pack ships ready-to-fill artifacts (policy, Statement of Applicability, control checklist, impact assessment, RACI) that generate pre-filled from your live control set — never blank. Every generated document downloads as a real file and mints an evidence event.": "مستودع لحزم قوالب الحوكمة — ISO/IEC 42001 وISO/IEC 27001 وNIST AI RMF وقانون الذكاء الاصطناعي الأوروبي. تشحن كل حزمة آثاراً جاهزة للملء (سياسة، وبيان قابلية التطبيق، وقائمة مراجعة الضوابط، وتقييم الأثر، وRACI) تُولَّد مملوءة مسبقاً من مجموعة ضوابطك الفعلية — لا فارغة أبداً. ويُنزَّل كل مستند مُولَّد كملف حقيقي ويسكّ حدث دليل.",
  // KPIs
  "Framework packs": "حزم الأطر",
  "ISO 42001 · 27001 · NIST · EU AI Act": "ISO 42001 · 27001 · NIST · قانون الذكاء الاصطناعي الأوروبي",
  "Templates": "القوالب",
  "policies · SoA · checklists · assessments": "السياسات · بيان قابلية التطبيق · قوائم مراجعة · تقييمات",
  "Artifact types": "أنواع الآثار",
  "Policy · SoA · Checklist · Assessment · RACI · Register · Profile · Record": "سياسة · بيان قابلية التطبيق · قائمة مراجعة · تقييم · RACI · سجل · ملف · سجل",
  "Output": "المخرجات",
  "real file · evidence on generate": "ملف حقيقي · دليل عند الإنشاء",
  // pack chooser
  "templates": "قوالب",
  "what's inside": "ماذا بالداخل",
  "✦ Generate full pack": "✦ أنشئ الحزمة الكاملة",
  "Generate ↓": "أنشئ ↓",
  // pack posture status
  "Operational": "قيد التشغيل",
  "Mapped": "مُخطَّط",
  "Library": "المكتبة",
  // framework names (data)
  "EU AI Act": "قانون الذكاء الاصطناعي الأوروبي",
  "China AI Regulations": "لوائح الذكاء الاصطناعي الصينية",
  // pack names (data)
  "AI Management System (AIMS)": "نظام إدارة الذكاء الاصطناعي (AIMS)",
  "Information Security (ISMS)": "أمن المعلومات (ISMS)",
  "AI Risk Management Profile": "ملف إدارة مخاطر الذكاء الاصطناعي",
  "EU AI Act Compliance": "الامتثال لقانون الذكاء الاصطناعي الأوروبي",
  "China (PRC) AI Compliance": "الامتثال للذكاء الاصطناعي في الصين",
  // pack blurbs (data)
  "Everything to stand up and certify an ISO/IEC 42001 AI management system — policy, Statement of Applicability, clause checklist, impact assessment and roles.": "كل ما يلزم لإقامة نظام إدارة ذكاء اصطناعي وفق ISO/IEC 42001 واعتماده — سياسة، وبيان قابلية التطبيق، وقائمة مراجعة البنود، وتقييم الأثر، والأدوار.",
  "The security backbone under the AI program — information security policy, ISMS control checklist and a risk treatment register.": "العمود الأمني تحت برنامج الذكاء الاصطناعي — سياسة أمن المعلومات، وقائمة مراجعة ضوابط نظام إدارة أمن المعلومات، وسجل معالجة المخاطر.",
  "Design an AI risk program on the NIST AI RMF — a Govern/Map/Measure/Manage profile and a risk register.": "صمّم برنامج مخاطر ذكاء اصطناعي على إطار NIST AI RMF — ملف الحوكمة/التخطيط/القياس/الإدارة وسجل مخاطر.",
  "The binding EU obligations — risk classification, high-risk technical documentation, a fundamental-rights impact assessment and GPAI transparency.": "الالتزامات الأوروبية المُلزِمة — تصنيف المخاطر، والتوثيق التقني عالي المخاطر، وتقييم الأثر على الحقوق الأساسية، وشفافية الذكاء الاصطناعي عام الغرض (GPAI).",
  "The PRC stack — CAC algorithm filing, GenAI security self-assessment, the 2025 content-labelling regime (GB 45438), a cross-instrument obligation checklist, and a PIPL cross-border data record.": "الحزمة الصينية — تسجيل الخوارزمية لدى CAC، والتقييم الذاتي الأمني للذكاء الاصطناعي التوليدي، ونظام وسم المحتوى لعام 2025 (GB 45438)، وقائمة مراجعة الالتزامات عبر الأدوات، وسجل بيانات PIPL العابرة للحدود.",
  // artifact names (data)
  "AI Management Policy": "سياسة إدارة الذكاء الاصطناعي",
  "Statement of Applicability (Annex A)": "بيان قابلية التطبيق (الملحق أ)",
  "AIMS Clause Checklist (4–10)": "قائمة مراجعة بنود AIMS (4–10)",
  "AI System Impact Assessment": "تقييم أثر نظام الذكاء الاصطناعي",
  "Roles & Responsibilities (RACI)": "الأدوار والمسؤوليات (RACI)",
  "Information Security Policy": "سياسة أمن المعلومات",
  "ISO 27001 Control Checklist": "قائمة مراجعة ضوابط ISO 27001",
  "Risk Treatment Register": "سجل معالجة المخاطر",
  "AI RMF Profile (Govern·Map·Measure·Manage)": "ملف إطار إدارة المخاطر (الحوكمة·التخطيط·القياس·الإدارة)",
  "AI Risk Register": "سجل مخاطر الذكاء الاصطناعي",
  "Responsible AI Policy": "سياسة الذكاء الاصطناعي المسؤول",
  "AI Risk Classification Record": "سجل تصنيف مخاطر الذكاء الاصطناعي",
  "High-Risk Technical Documentation (Annex IV)": "التوثيق التقني عالي المخاطر (الملحق الرابع)",
  "Fundamental Rights Impact Assessment (FRIA)": "تقييم الأثر على الحقوق الأساسية (FRIA)",
  "GPAI Transparency Statement": "بيان شفافية الذكاء الاصطناعي عام الغرض (GPAI)",
  "Algorithm Filing Dossier (备案)": "ملف تسجيل الخوارزمية (备案)",
  "Security Self-Assessment (public-opinion services)": "التقييم الذاتي الأمني (خدمات الرأي العام)",
  "AI-Generated Content Labelling Plan (GB 45438)": "خطة وسم المحتوى المُولَّد بالذكاء الاصطناعي (GB 45438)",
  "Cross-Instrument Obligation Checklist": "قائمة مراجعة الالتزامات عبر الأدوات",
  "PIPL & Cross-Border Data Record": "سجل PIPL والبيانات العابرة للحدود",
  // artifact kinds (data)
  "Policy": "سياسة",
  "SoA": "بيان قابلية التطبيق",
  "Checklist": "قائمة مراجعة",
  "Assessment": "تقييم",
  "Register": "سجل",
  "Profile": "ملف",
  "Record": "سجل",
});

/* ── shared primitives (match enforce/convergence house style) ── */
const tok = k => ({ crit: T.red, warn: T.amber, info: T.blue, good: T.green, gold: AI_GOLD, blue: T.blue, violet: T.violet, green: T.green }[k] || T.ink3);
const cardPad = { padding: 18 };
const Eyebrow = ({ children, style }) => <div style={{ fontSize: 9, letterSpacing: "0.09em", textTransform: "uppercase", color: T.ink4, fontWeight: 900, fontFamily: F.m, ...style }}>{children}</div>;
const H3 = ({ children, style }) => <h3 style={{ fontFamily: F.h, fontSize: 16, fontWeight: 900, color: T.ink, margin: "4px 0 0", ...style }}>{children}</h3>;
const Head = ({ title, sub }) => <div style={{ marginBottom: 16 }}><h2 style={{ fontFamily: F.h, fontSize: 24, fontWeight: 900, color: T.ink, margin: 0, letterSpacing: "-0.02em" }}>{title}</h2><p style={{ fontFamily: F.b, fontSize: 12.5, color: T.ink3, margin: "5px 0 0", maxWidth: 820, lineHeight: 1.6 }}>{sub}</p></div>;
const Pill = ({ c, children }) => <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 9px", borderRadius: 999, fontSize: 10, fontWeight: 800, fontFamily: F.b, color: c, background: c + "18", border: `1px solid ${c}40` }}>{children}</span>;
const Kpi = ({ l, v, c, sub }) => <Card style={{ padding: "13px 15px" }}><Eyebrow>{l}</Eyebrow><div style={{ fontSize: 26, fontWeight: 900, color: c, fontFamily: F.m, margin: "5px 0 2px" }}>{v}</div><div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b }}>{sub}</div></Card>;
const kpiGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 14 };
const advisor = children => <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 10, background: AI_GOLD + "12", border: `1px solid ${AI_GOLD}30`, fontSize: 11, color: T.ink2, lineHeight: 1.6, fontFamily: F.b }}><b style={{ color: AI_GOLD_INK }}>Veris Intelligence:</b> {children}</div>;
const statusTone = s => s === "Operational" ? T.green : s === "Mapped" ? T.blue : T.amber;
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function TemplateLibrary({ showToast }) {
  const lang = useLang(); const ar = lang === "ar"; const T_ = en => ts(lang, en);
  const stats = templateLibraryStats();
  const [openId, setOpenId] = useState(TEMPLATE_PACKS[0].id);
  const pack = TEMPLATE_PACKS.find(p => p.id === openId) || TEMPLATE_PACKS[0];
  const post = packPosture(pack.id);

  const evidence = (name, framework) => pushBus("vz-gw-evidence", {
    item: `Template generated: ${name}`, initiative: "Governance program", scope: "Template Library",
    control: `${framework} artifact`, risk: "Governance artifact", owner: "Governance office",
    status: "Complete", approval: "Generated", version: "v1", time: "Just now",
  });

  const gen = (pk, art) => {
    const md = art.build() + _templateFoot(pk.framework);
    vzDownload(`${slug(pk.framework)}-${slug(art.name)}.md`, md);
    evidence(art.name, pk.framework);
    showToast && showToast(`${art.name} generated — downloaded & evidence recorded`);
  };
  const genPack = (pk) => {
    const md = pk.artifacts.map(a => a.build()).join("\n\n---\n\n") + _templateFoot(pk.framework);
    vzDownload(`${slug(pk.framework)}-template-pack.md`, md);
    pk.artifacts.forEach(a => evidence(a.name, pk.framework));
    showToast && showToast(`${pk.framework} pack generated — ${pk.artifacts.length} artifacts downloaded & evidenced`);
  };

  return <div style={{ animation: "up .3s ease" }}>
    <Head title={T_("Template Library")} sub={T_("A repository of governance template packs — ISO/IEC 42001, ISO/IEC 27001, NIST AI RMF and the EU AI Act. Each pack ships ready-to-fill artifacts (policy, Statement of Applicability, control checklist, impact assessment, RACI) that generate pre-filled from your live control set — never blank. Every generated document downloads as a real file and mints an evidence event.")} />
    <div style={kpiGrid}>
      <Kpi l={T_("Framework packs")} v={String(stats.packs)} c={AI_GOLD} sub={T_("ISO 42001 · 27001 · NIST · EU AI Act")} />
      <Kpi l={T_("Templates")} v={String(stats.artifacts)} c={T.blue} sub={T_("policies · SoA · checklists · assessments")} />
      <Kpi l={T_("Artifact types")} v={String(stats.kinds.length)} c={T.violet} sub={T_(stats.kinds.join(" · "))} />
      <Kpi l={T_("Output")} v="Markdown" c={T.green} sub={T_("real file · evidence on generate")} />
    </div>

    {/* pack chooser */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,250px),1fr))", gap: 12, marginBottom: 14 }}>
      {TEMPLATE_PACKS.map(p => {
        const pp = packPosture(p.id); const active = p.id === openId; const c = tok(p.accent);
        return <button key={p.id} onClick={() => setOpenId(p.id)} style={{ textAlign: "left", cursor: "pointer", background: active ? c + "0e" : T.card, border: `1px solid ${active ? c + "66" : T.border}`, borderRadius: 12, padding: 15 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 9.5, fontWeight: 900, fontFamily: F.m, color: c, textTransform: "uppercase", letterSpacing: "0.06em" }}>{T_(p.framework)}</span>
            <Pill c={statusTone(pp.status)}>{T_(pp.status)}{pp.score ? ` · ${pp.score}` : ""}</Pill>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: T.ink, fontFamily: F.h, marginBottom: 5 }}>{T_(p.name)}</div>
          <p style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.5, margin: 0 }}>{T_(p.blurb)}</p>
          <div style={{ marginTop: 9, fontSize: 10, color: T.ink4, fontFamily: F.m, fontWeight: 700 }}>{p.artifacts.length} {T_("templates")}</div>
        </button>;
      })}
    </div>

    {/* selected pack contents */}
    <Card style={cardPad}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <div><Eyebrow>{T_(pack.framework)} · {T_("what's inside")}</Eyebrow><H3 style={{ marginBottom: 0 }}>{T_(pack.name)}</H3></div>
        <button onClick={() => genPack(pack)} style={{ background: AI_GOLD, border: "none", borderRadius: 10, padding: "10px 16px", color: "#0b0e24", fontSize: 12, fontWeight: 800, fontFamily: F.b, cursor: "pointer" }}>{T_("✦ Generate full pack")}</button>
      </div>
      <div style={{ display: "grid", gap: 9 }}>
        {pack.artifacts.map(a => <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, background: T.s2, border: `1px solid ${T.border}` }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: T.ink, fontFamily: F.b }}>{T_(a.name)}</div>
            <div style={{ fontSize: 10, color: T.ink4, fontFamily: F.m, marginTop: 2 }}>{T_(a.kind)}</div>
          </div>
          <Pill c={tok(pack.accent)}>{T_(a.kind)}</Pill>
          <button onClick={() => gen(pack, a)} style={{ flexShrink: 0, background: T.card, border: `1px solid ${T.borderB}`, borderRadius: 8, padding: "7px 13px", color: T.ink2, fontSize: 11, fontWeight: 800, fontFamily: F.b, cursor: "pointer" }}>{T_("Generate ↓")}</button>
        </div>)}
      </div>
      {advisor(ar
        ? <>يُولَّد كل قالب <b>مملوءاً مسبقاً من مجموعة ضوابطك الفعلية</b> — إذ يسحب بيان قابلية التطبيق للأيزو 42001 {pack.framework === "ISO/IEC 42001" ? "ضوابط الملحق أ الفعلية وحالتها" : "مكتبة الضوابط المعيارية"}، فيعكس المستند الجاهزية الحقيقية لا نصاً مؤقتاً. ويُسجّل إنشاء أحدها أدلة الحوكمة تلقائياً، فبناء الأثر وإثباته بالأدلة فعلٌ واحد.</>
        : <>Each template generates <b>pre-filled from your live control set</b> — the ISO 42001 Statement of Applicability pulls the {pack.framework === "ISO/IEC 42001" ? "actual Annex A controls and their status" : "canonical control library"}, so the document reflects real posture, not placeholder text. Generating one records governance evidence automatically, so building the artifact and evidencing it are the same action.</>)}
    </Card>
  </div>;
}
