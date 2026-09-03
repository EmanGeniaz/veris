"use client";

import { useState } from "react";
import { T, F, AI_GOLD, AI_GOLD_INK, Card } from "./core";
import {
  sustainabilityStats, lifecycleAssessments, carbonDisclosure,
} from "@/lib/sustainability";
import { useLang, ts, registerContent } from "@/lib/i18n";

registerContent({
  // header
  "Environmental Footprint": "البصمة البيئية",
  "Govern AI, and measure what running it costs the planet. Each system carries a whole-life carbon assessment — training, inference, storage and retirement — and the estate rolls up into a GHG-Protocol-shaped disclosure. Estimated from activity data × model-class energy × regional grid carbon × data-centre PUE; metered where gateway telemetry is wired, and clearly labelled either way.": "احكم الذكاء الاصطناعي، وقِس ما يكلّفه تشغيله على الكوكب. يحمل كل نظام تقييماً كربونياً لكامل دورة الحياة — التدريب والاستدلال والتخزين والتقاعد — ويتجمّع مجمل الأنظمة في إفصاح على هيئة بروتوكول الغازات الدفيئة (GHG). مُقدَّر من بيانات النشاط × طاقة فئة النموذج × كربون الشبكة الإقليمية × كفاءة استخدام الطاقة (PUE) لمركز البيانات؛ ومُقاس حيث تُربط قياسات البوابة، وموسوم بوضوح في الحالتين.",
  // KPIs
  "Whole-life carbon": "كربون دورة الحياة الكاملة",
  "per year · full lifecycle": "سنوياً · كامل دورة الحياة",
  "Net after offsets": "الصافي بعد التعويضات",
  "renewable / offset": "متجدّد / معوَّض",
  "Carbon intensity": "كثافة الكربون",
  "tCO₂e per $M value": "tCO₂e لكل مليون دولار من القيمة",
  "Trend": "الاتجاه",
  "MoM · routing + caching": "شهرياً · التوجيه + التخزين المؤقت",
  // charter
  "ISO/IEC TR 20226 · the Measure plane": "ISO/IEC TR 20226 · مستوى القياس",
  "Whole-life carbon, assessed and disclosed": "كربون كامل دورة الحياة، مُقيَّم ومُفصَح عنه",
  "Inference is only the running cost. This closes the two gaps TR 20226 named — a full-lifecycle impact assessment per system, and a carbon disclosure aligned to the GHG Protocol, ISO 14064-1 and CSRD ESRS E1 — with an honest assurance level, not a green tile.": "الاستدلال ليس سوى تكلفة التشغيل. هذا يسدّ الفجوتين اللتين حدّدهما TR 20226 — تقييم أثر لكامل دورة الحياة لكل نظام، وإفصاح كربوني متوائم مع بروتوكول الغازات الدفيئة وISO 14064-1 وCSRD ESRS E1 — بمستوى ضمان صادق، لا مجرد بطاقة خضراء.",
  "METERED VS ESTIMATED": "مُقاس مقابل مُقدَّر",
  // lifecycle register
  "Lifecycle impact assessment · one per system": "تقييم أثر دورة الحياة · واحد لكل نظام",
  "Training → inference → storage → retirement — click any row for the stages": "التدريب ← الاستدلال ← التخزين ← التقاعد — انقر أي صف لعرض المراحل",
  "Training and retirement are one-time footprints amortised over a 2-year service life. Each stage is labelled Metered or Estimated.": "التدريب والتقاعد بصمتان لمرة واحدة تُوزَّعان على عمر خدمة مدته سنتان. كل مرحلة موسومة بـ مُقاس أو مُقدَّر.",
  "System": "النظام",
  "Class": "الفئة",
  "Region": "المنطقة",
  "Lifecycle tCO₂e/yr": "دورة الحياة tCO₂e/سنة",
  "Basis": "الأساس",
  "Status": "الحالة",
  // model classes (pill values)
  "Generative": "توليدي",
  "Vision": "رؤية حاسوبية",
  "Automation": "أتمتة",
  "Predictive": "تنبّؤي",
  "Other": "أخرى",
  // regions
  "EU West": "غرب أوروبا",
  "US East": "شرق الولايات المتحدة",
  "APAC": "آسيا والمحيط الهادئ",
  "Australia": "أستراليا",
  // basis / status
  "Metered": "مُقاس",
  "Estimated": "مُقدَّر",
  "Assessed": "مُقيَّم",
  // lifecycle stages
  "Training": "التدريب",
  "Inference": "الاستدلال",
  "Data & storage": "البيانات والتخزين",
  "Retirement": "التقاعد",
  // carbon disclosure
  "Carbon disclosure": "الإفصاح الكربوني",
  "FY 2026 · rolling 12 months": "السنة المالية 2026 · آخر 12 شهراً",
  "GHG-Protocol-shaped emissions disclosure": "إفصاح انبعاثات على هيئة بروتوكول الغازات الدفيئة",
  "Export disclosure": "تصدير الإفصاح",
  "Carbon disclosure exported — Scope 2 & 3, methodology and assurance statement": "تم تصدير الإفصاح الكربوني — النطاق 2 و3، والمنهجية وبيان الضمان",
  "Scope 2": "النطاق 2",
  "Scope 3": "النطاق 3",
  "Purchased electricity — training + inference": "الكهرباء المشتراة — التدريب + الاستدلال",
  "Embodied hardware, cloud overhead, storage & retirement": "الأجهزة المتجسّدة، وأعباء السحابة، والتخزين والتقاعد",
  "Location-based, grid-intensity weighted": "قائم على الموقع، مُرجَّح بكثافة الشبكة",
  "Estimated (spend/usage proxy)": "مُقدَّر (بديل الإنفاق/الاستخدام)",
  "Total (gross)": "الإجمالي (الخام)",
  "Net after offsets:": "الصافي بعد التعويضات:",
  "kgCO₂e per 1M inferences": "kgCO₂e لكل مليون استدلال",
  "Standard": "المعيار",
  "Scope": "النطاق",
  "Coverage": "التغطية",
  "Corporate Standard · Scope 2 & 3": "المعيار المؤسسي · النطاق 2 و3",
  "Org GHG quantification & reporting": "قياس غازات الدفيئة المؤسسية وإعداد التقارير",
  "Climate change disclosure": "الإفصاح عن تغيّر المناخ",
  "Methodology:": "المنهجية:",
  "Activity data × model-class energy intensity × regional grid carbon (location-based) × data-centre PUE; training amortised over a 2-year service life. Metered where gateway telemetry is wired, estimated otherwise.": "بيانات النشاط × كثافة طاقة فئة النموذج × كربون الشبكة الإقليمية (قائم على الموقع) × كفاءة استخدام الطاقة (PUE) لمركز البيانات؛ ويُوزَّع التدريب على عمر خدمة مدته سنتان. مُقاس حيث تُربط قياسات البوابة، ومُقدَّر فيما عدا ذلك.",
  "Assurance:": "الضمان:",
  "Limited · internal (estimate-based) — third-party assurance not yet obtained": "محدود · داخلي (قائم على التقدير) — لم يُحصَل بعد على ضمان طرف ثالث",
  // reductions
  "Reduction opportunities · tied to the biggest emitters": "فرص التخفيض · مرتبطة بأكبر مصادر الانبعاث",
  "Where routing, region and caching cut the most": "حيث يحقّق التوجيه والمنطقة والتخزين المؤقت أكبر خفض",
  "Assemble reduction plan": "تجميع خطة التخفيض",
  "Reduction plan assembled — routing, region and caching changes queued": "تم تجميع خطة التخفيض — أُدرجت تغييرات التوجيه والمنطقة والتخزين المؤقت في قائمة الانتظار",
  "Export assessment pack": "تصدير حزمة التقييم",
  "Lifecycle assessment pack exported to Trust & Evidence": "تم تصدير حزمة تقييم دورة الحياة إلى Trust & Evidence",
});

/* shared primitives — match the platform's visual language */
const tok = k => ({ crit: T.red, warn: T.amber, info: T.blue, good: T.green, ink3: T.ink3, gold: AI_GOLD }[k] || T.ink3);
const cardPad = { padding: 18 };
const Eyebrow = ({ children, style }) => <div style={{ fontSize: 9, letterSpacing: "0.09em", textTransform: "uppercase", color: T.ink4, fontWeight: 900, fontFamily: F.m, ...style }}>{children}</div>;
const H3 = ({ children, style }) => <h3 style={{ fontFamily: F.h, fontSize: 16, fontWeight: 900, color: T.ink, margin: "4px 0 0", ...style }}>{children}</h3>;
const Head = ({ title, sub }) => <div style={{ marginBottom: 16 }}><h2 style={{ fontFamily: F.h, fontSize: 24, fontWeight: 900, color: T.ink, margin: 0, letterSpacing: "-0.02em" }}>{title}</h2><p style={{ fontFamily: F.b, fontSize: 12.5, color: T.ink3, margin: "5px 0 0", maxWidth: 780, lineHeight: 1.6 }}>{sub}</p></div>;
const Pill = ({ c, children }) => <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 9px", borderRadius: 999, fontSize: 10, fontWeight: 800, fontFamily: F.b, color: c, background: c + "18", border: `1px solid ${c}40` }}>{children}</span>;
const Th = ({ children, style }) => <th style={{ textAlign: "left", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: T.ink4, fontWeight: 900, fontFamily: F.m, padding: "0 10px 9px", borderBottom: `1px solid ${T.border}`, ...style }}>{children}</th>;
const Td = ({ children, style }) => <td style={{ padding: "10px", borderBottom: `1px solid ${T.border}`, color: T.ink2, fontSize: 11.5, fontFamily: F.b, verticalAlign: "middle", ...style }}>{children}</td>;
const Table = ({ head, children }) => <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr>{head.map((h, i) => <Th key={i} style={i ? { textAlign: "right" } : null}>{h}</Th>)}</tr></thead><tbody>{children}</tbody></table></div>;
const basisTone = b => b === "Metered" ? T.green : T.ink3;

export function EnvironmentalFootprint({ showToast }) {
  const lang = useLang(); const ar = lang === "ar"; const T_ = en => ts(lang, en);
  const S = sustainabilityStats();
  const la = lifecycleAssessments();
  const D = carbonDisclosure();
  const [open, setOpen] = useState(null);
  const totalLifecycle = +la.reduce((s, a) => s + a.lifecycleTyr, 0).toFixed(1);
  const kpis = [
    ["Whole-life carbon", `${totalLifecycle} tCO₂e`, AI_GOLD, T_("per year · full lifecycle")],
    ["Net after offsets", `${D.netTyr} tCO₂e`, T.green, `${D.offsetPct}% ${T_("renewable / offset")}`],
    ["Carbon intensity", `${D.intensityPerValue}`, T.blue, T_("tCO₂e per $M value")],
    ["Trend", `${D.trendPct}%`, D.trendPct < 0 ? T.green : T.amber, T_("MoM · routing + caching")],
  ];
  const sorted = [...la].sort((a, b) => b.lifecycleTyr - a.lifecycleTyr);
  return <div style={{ animation: "up .3s ease" }}>
    <Head title={T_("Environmental Footprint")} sub={T_("Govern AI, and measure what running it costs the planet. Each system carries a whole-life carbon assessment — training, inference, storage and retirement — and the estate rolls up into a GHG-Protocol-shaped disclosure. Estimated from activity data × model-class energy × regional grid carbon × data-centre PUE; metered where gateway telemetry is wired, and clearly labelled either way.")} />

    {/* charter */}
    <Card style={{ ...cardPad, marginBottom: 14, background: `linear-gradient(135deg,${T.s2},${T.bg})`, border: `1px solid ${AI_GOLD}38` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ maxWidth: 640 }}>
          <Eyebrow style={{ color: AI_GOLD_INK }}>{T_("ISO/IEC TR 20226 · the Measure plane")}</Eyebrow>
          <H3 style={{ fontSize: 18 }}>{T_("Whole-life carbon, assessed and disclosed")}</H3>
          <p style={{ fontSize: 11.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.65, margin: "6px 0 0" }}>{T_("Inference is only the running cost. This closes the two gaps TR 20226 named — a full-lifecycle impact assessment per system, and a carbon disclosure aligned to the GHG Protocol, ISO 14064-1 and CSRD ESRS E1 — with an honest assurance level, not a green tile.")}</p>
        </div>
        <div style={{ textAlign: "center", background: T.s2, border: `1px solid ${AI_GOLD}45`, borderRadius: 12, padding: "12px 18px", minWidth: 130 }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: AI_GOLD_INK, fontFamily: F.m, lineHeight: 1 }}>{D.measuredPct}%</div>
          <div style={{ fontSize: 9.5, color: T.ink3, fontWeight: 800, fontFamily: F.b, marginTop: 4, letterSpacing: "0.04em" }}>{T_("METERED VS ESTIMATED")}</div>
        </div>
      </div>
    </Card>

    {/* KPIs */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 14 }}>
      {kpis.map(([l, v, c, sub]) => <Card key={l} style={{ padding: "13px 15px" }}>
        <Eyebrow>{T_(l)}</Eyebrow>
        <div style={{ fontSize: 24, fontWeight: 900, color: c, fontFamily: F.m, margin: "5px 0 2px" }}>{v}</div>
        <div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b }}>{sub}</div>
      </Card>)}
    </div>

    {/* lifecycle assessment register */}
    <Card style={{ ...cardPad, marginBottom: 14 }}>
      <Eyebrow>{T_("Lifecycle impact assessment · one per system")}</Eyebrow>
      <H3 style={{ marginBottom: 6 }}>{T_("Training → inference → storage → retirement — click any row for the stages")}</H3>
      <p style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b, margin: "0 0 12px", lineHeight: 1.5 }}>{T_("Training and retirement are one-time footprints amortised over a 2-year service life. Each stage is labelled Metered or Estimated.")}</p>
      <Table head={[T_("System"), T_("Class"), T_("Region"), T_("Lifecycle tCO₂e/yr"), T_("Basis"), T_("Status")]}>
        {sorted.map(a => {
          const isOpen = open === a.id;
          const stMeta = a.status === "Assessed" ? { c: T.green } : { c: T.amber };
          return [
            <tr key={a.id} onClick={() => setOpen(isOpen ? null : a.id)} style={{ cursor: "pointer" }}>
              <Td style={{ fontWeight: 700, color: T.ink, minWidth: 180, textAlign: "left" }}>{a.name}</Td>
              <Td style={{ textAlign: "left" }}><Pill c={T.blue}>{T_(a.cls)}</Pill></Td>
              <Td style={{ color: T.ink3, textAlign: "left" }}>{T_(a.region)}</Td>
              <Td style={{ fontFamily: F.m, fontWeight: 800, color: T.ink, textAlign: "right" }}>{a.lifecycleTyr}</Td>
              <Td style={{ textAlign: "right" }}><span style={{ fontSize: 10, fontWeight: 800, fontFamily: F.b, color: a.measured ? T.green : T.ink3 }}>{a.measured ? T_("Metered") : T_("Estimated")}</span></Td>
              <Td style={{ textAlign: "right" }}><Pill c={stMeta.c}>{T_(a.status)}</Pill></Td>
            </tr>,
            isOpen && <tr key={a.id + "-d"}><td colSpan={6} style={{ padding: "0 10px 12px" }}>
              <div style={{ background: AI_GOLD + "10", border: `1px solid ${AI_GOLD}30`, borderRadius: 10, padding: "11px 13px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 8 }}>
                  {a.stages.map(st => <div key={st.stage} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 9, padding: "9px 11px" }}>
                    <div style={{ fontSize: 10, fontWeight: 900, color: T.ink, fontFamily: F.b }}>{T_(st.stage)}</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: AI_GOLD_INK, fontFamily: F.m, margin: "2px 0" }}>{st.tyr}<span style={{ fontSize: 9, color: T.ink3, marginLeft: 3 }}>tCO₂e/yr</span></div>
                    <span style={{ fontSize: 9, fontWeight: 800, fontFamily: F.b, color: basisTone(st.basis) }}>{T_(st.basis)}</span>
                  </div>)}
                </div>
              </div>
            </td></tr>,
          ];
        })}
      </Table>
    </Card>

    {/* carbon disclosure */}
    <Card style={{ ...cardPad, marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <div><Eyebrow>{T_("Carbon disclosure")} · {T_(D.period)}</Eyebrow><H3 style={{ marginBottom: 0 }}>{T_("GHG-Protocol-shaped emissions disclosure")}</H3></div>
        <button onClick={() => showToast && showToast(T_("Carbon disclosure exported — Scope 2 & 3, methodology and assurance statement"))} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 13px", color: T.ink2, fontSize: 11.5, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>{T_("Export disclosure")}</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10, marginBottom: 12 }}>
        {D.byScope.map(s => <div key={s.scope} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 11, padding: "12px 13px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><span style={{ fontSize: 11, fontWeight: 900, color: T.ink, fontFamily: F.h }}>{T_(s.scope)}</span><span style={{ fontSize: 18, fontWeight: 900, color: AI_GOLD_INK, fontFamily: F.m }}>{s.tyr}<span style={{ fontSize: 9, color: T.ink3, marginLeft: 3 }}>tCO₂e/yr</span></span></div>
          <div style={{ fontSize: 10.5, color: T.ink2, fontFamily: F.b, margin: "4px 0 3px", lineHeight: 1.4 }}>{T_(s.label)}</div>
          <div style={{ fontSize: 9.5, color: T.ink3, fontFamily: F.b }}>{T_(s.basis)}</div>
        </div>)}
        <div style={{ background: `linear-gradient(135deg,${AI_GOLD}14,${T.s2})`, border: `1px solid ${AI_GOLD}40`, borderRadius: 11, padding: "12px 13px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><span style={{ fontSize: 11, fontWeight: 900, color: T.ink, fontFamily: F.h }}>{T_("Total (gross)")}</span><span style={{ fontSize: 18, fontWeight: 900, color: AI_GOLD_INK, fontFamily: F.m }}>{D.totalTyr}<span style={{ fontSize: 9, color: T.ink3, marginLeft: 3 }}>tCO₂e/yr</span></span></div>
          <div style={{ fontSize: 10.5, color: T.ink2, fontFamily: F.b, margin: "4px 0 3px" }}>{T_("Net after offsets:")} <b style={{ color: T.green }}>{D.netTyr} tCO₂e/yr</b></div>
          <div style={{ fontSize: 9.5, color: T.ink3, fontFamily: F.b }}>{D.intensityPerMInf} {T_("kgCO₂e per 1M inferences")}</div>
        </div>
      </div>
      <Table head={[T_("Standard"), T_("Scope"), T_("Coverage")]}>
        {D.standards.map(st => <tr key={st.name}>
          <Td style={{ fontWeight: 800, color: T.ink, textAlign: "left" }}>{T_(st.name)}</Td>
          <Td style={{ color: T.ink3, textAlign: "left" }}>{T_(st.scope)}</Td>
          <Td style={{ textAlign: "right" }}><Pill c={st.coverage >= 80 ? T.green : st.coverage >= 60 ? AI_GOLD : T.amber}>{st.coverage}%</Pill></Td>
        </tr>)}
      </Table>
      <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 10, background: T.s2, border: `1px solid ${T.border}`, fontSize: 10.5, color: T.ink3, lineHeight: 1.6, fontFamily: F.b }}>
        <b style={{ color: T.ink2 }}>{T_("Methodology:")}</b> {T_(D.methodology)}<br />
        <b style={{ color: T.ink2 }}>{T_("Assurance:")}</b> {T_(D.assurance)}
      </div>
    </Card>

    {/* reductions */}
    <Card style={cardPad}>
      <Eyebrow>{T_("Reduction opportunities · tied to the biggest emitters")}</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>{T_("Where routing, region and caching cut the most")}</H3>
      <div style={{ display: "grid", gap: 8 }}>
        {S.recs.map((r, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 13px" }}>
          <span style={{ fontSize: 11.5, color: T.ink2, fontFamily: F.b, fontWeight: 600 }}>{T_(r.label)}</span>
          <span style={{ fontSize: 12, fontWeight: 900, color: T.green, fontFamily: F.m, whiteSpace: "nowrap" }}>−{r.saveTyr} tCO₂e/yr</span>
        </div>)}
      </div>
      <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 10, background: AI_GOLD + "12", border: `1px solid ${AI_GOLD}30`, fontSize: 11, color: T.ink2, lineHeight: 1.6, fontFamily: F.b }}>
        <b style={{ color: AI_GOLD_INK }}>Veris Intelligence:</b> {ar
          ? <>الانخفاضات المحددة يبلغ إجماليها <b>{S.reductionTyr} tCO₂e/yr</b> — أي {Math.round(S.reductionTyr / Math.max(1, totalLifecycle) * 100)}% من بصمة كامل دورة الحياة — وكلٌّ منها (توجيه النماذج، تغيير المنطقة، التخزين المؤقت) تغييرٌ يمكن للبوابة إجراؤه دون المساس بحالة الاستخدام. القياس عند {D.measuredPct}%؛ وربط الأنظمة المتبقية عبر البوابة ينقل التقدير إلى قياس فعلي.</>
          : <>The identified reductions total <b>{S.reductionTyr} tCO₂e/yr</b> — {Math.round(S.reductionTyr / Math.max(1, totalLifecycle) * 100)}% of the whole-life footprint — and every one of them (model routing, region shift, caching) is a change the Gateway can make without touching the use case. Metering is at {D.measuredPct}%; wiring the remaining systems through the gateway moves the estimate to measured.</>}
      </div>
      <div style={{ display: "flex", gap: 9, marginTop: 14, flexWrap: "wrap" }}>
        <button onClick={() => showToast && showToast(T_("Reduction plan assembled — routing, region and caching changes queued"))} style={{ background: AI_GOLD, border: "none", borderRadius: 10, padding: "9px 15px", color: "#241703", fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>{T_("Assemble reduction plan")}</button>
        <button onClick={() => showToast && showToast(T_("Lifecycle assessment pack exported to Trust & Evidence"))} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 15px", color: T.ink2, fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>{T_("Export assessment pack")}</button>
      </div>
    </Card>
  </div>;
}
