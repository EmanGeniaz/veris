"use client";

import { useState } from "react";
import { T, F, AI_GOLD, AI_GOLD_INK, Card } from "./core";
import {
  DATA_DIMENSIONS, dataRecords, PROVENANCE_WORKFLOW, provenanceStats,
} from "@/lib/data-provenance";
import { useLang, ts, registerContent } from "@/lib/i18n";

/* Arabic content for the Data Provenance surface (content cycle 1c). */
registerContent({
  "Data Provenance": "مصدر البيانات وحوكمتها",
  "Where every system's training and grounding data came from, and whether it is governed. One record per AI system across eight dimensions — source lineage, lawful basis, IP clearance, PII classification, quality, integrity, retention and an immutable provenance hash. This is the single control the data-governance obligations of EU AI Act Art. 10, ISO 42001 A.7, the NIST data-poisoning defence, OWASP LLM03 and China's IP-clean-data duty all point at.": "من أين جاءت بيانات تدريب وإسناد كل نظام، وهل هي مُحوكَمة. سجل واحد لكل نظام ذكاء اصطناعي عبر ثمانية أبعاد — تتبّع المصدر، والأساس القانوني، وإخلاء الملكية الفكرية، وتصنيف البيانات الشخصية، والجودة، والسلامة، والاحتفاظ، وبصمة مصدر غير قابلة للعبث. وهذا هو الضابط الواحد الذي تشير إليه التزامات حوكمة البيانات في المادة 10 من القانون الأوروبي، والأيزو 42001 (أ.7)، ودفاع NIST ضد تسميم البيانات، وOWASP LLM03، وواجب الصين ببيانات نظيفة الملكية.",
  "One record per system · every source accounted for": "سجل واحد لكل نظام · كل مصدر مُحتسَب",
  "Govern the data, not just the model": "احكم البيانات، لا النموذج وحده",
  "A model is only as governed as the data behind it. Each record catalogues the sources, documents a lawful basis, clears IP, classifies personal data, validates quality and integrity, and closes with a hashed provenance record — the same artifact that answers five frameworks at once.": "النموذج مُحوكَم بقدر حوكمة بياناته. يفهرس كل سجل المصادر، ويوثّق أساساً قانونياً، ويُخلي الملكية الفكرية، ويصنّف البيانات الشخصية، ويتحقّق من الجودة والسلامة، ويُختَم بسجل مصدر مُجزّأ — القطعة نفسها التي تستوفي خمسة أطر دفعة واحدة.",
  "SOURCES CATALOGUED": "المصادر المُفهرَسة",
  // KPIs
  "Systems governed": "أنظمة مُحوكَمة", "have a governed data record": "لها سجل بيانات مُحوكَم",
  "Avg completeness": "متوسط الاكتمال", "IP / licence clean": "نظافة الملكية / الترخيص",
  "training data cleared for use": "بيانات تدريب مُخلاة للاستخدام", "Poisoning defence": "الدفاع ضد التسميم",
  "sources signed / pinned & validated": "مصادر موقّعة / مُثبّتة ومُتحقَّقة",
  // register
  "The register · one data-governance record per system": "السجل · سجل حوكمة بيانات واحد لكل نظام",
  "Catalogue → classify → clear → validate → record — click any row for the dimensions": "فهرسة ← تصنيف ← إخلاء ← تحقّق ← تسجيل — انقر أي صف لعرض الأبعاد",
  "Completeness is scored from the eight dimensions (Met = 100, Partial = 60). Earlier-stage systems carry open dimensions honestly.": "تُحتسب نسبة الاكتمال من الأبعاد الثمانية (مستوفى = 100، جزئي = 60). وتحمل الأنظمة في مراحلها المبكرة أبعاداً مفتوحة بصدق.",
  "System": "النظام", "Unit": "الوحدة", "PII": "بيانات شخصية", "Lawful basis": "الأساس القانوني", "IP": "الملكية الفكرية", "Completeness": "الاكتمال", "Status": "الحالة",
  "Sources:": "المصادر:", "provenance #": "مصدر #",
  // statuses / pills / pii
  "Governed": "مُحوكَم", "In review": "قيد المراجعة", "Gaps": "فجوات",
  "High": "مرتفعة", "Medium": "متوسطة", "Low": "منخفضة",
  "Clear": "نظيف", "Open": "مفتوح", "Met": "مستوفى", "Partial": "جزئي",
  // lawful bases
  "Legal obligation + legitimate interest": "التزام قانوني + مصلحة مشروعة", "Contract + consent": "عقد + موافقة", "Legitimate interest": "مصلحة مشروعة",
  // units
  "Customer Operations": "عمليات العملاء", "Retail Banking": "الخدمات المصرفية للأفراد", "Finance": "المالية", "People": "الموارد البشرية",
  // systems (also registered by AIA, kept here for module safety)
  "Customer Resolution Copilot": "مساعد حل مشكلات العملاء", "Credit Decision Assurance": "ضمان قرارات الائتمان",
  "Finance Close Automation": "أتمتة إقفال الحسابات", "Workforce Skills Navigator": "مُوجّه مهارات القوى العاملة",
  "Skills Navigator (vendor LLM)": "مُوجّه المهارات (نموذج مورّد)", "Analytics data pipeline": "خط بيانات التحليلات", "Predictive Maintenance": "الصيانة التنبّؤية",
  // dimensions (checks)
  "Source catalogue & lineage": "فهرس المصادر وتتبّعها", "IP & licence clearance": "إخلاء الملكية الفكرية والترخيص",
  "PII classification & minimisation": "تصنيف البيانات الشخصية وتقليلها", "Quality & representativeness": "الجودة والتمثيلية",
  "Integrity & poisoning defence": "السلامة والدفاع ضد التسميم", "Retention & purge": "الاحتفاظ والحذف", "Provenance record": "سجل المصدر",
  // sources
  "Support ticket history": "سجل تذاكر الدعم", "Product knowledge base": "قاعدة معرفة المنتج", "Foundation model (vendor, licensed)": "نموذج أساس (مورّد، مُرخّص)",
  "Bureau credit data": "بيانات الائتمان من المكتب", "Internal application records": "سجلات الطلبات الداخلية", "Adverse-action outcomes": "نتائج الإجراءات السلبية",
  "ERP ledger extracts": "مستخرجات دفتر ERP", "Reconciliation rules": "قواعد التسوية",
  "HRIS skills profiles": "ملفات مهارات HRIS", "Learning catalogue": "كتالوج التعلّم", "Role taxonomy": "تصنيف الأدوار",
  "Enterprise data warehouse": "مستودع بيانات المؤسسة", "Third-party enrichment (licensed)": "إثراء من طرف ثالث (مُرخّص)",
  // workflow
  "The workflow · six stages that produce a governed record": "سير العمل · ست مراحل تُنتج سجلاً مُحوكَماً",
  "Catalogue": "الفهرسة", "Classify": "التصنيف", "Clear": "الإخلاء", "Validate": "التحقّق", "Record": "التسجيل", "Review": "المراجعة",
  "List every training and grounding source with its origin and lineage.": "اسرد كل مصدر تدريب وإسناد مع منشئه وتتبّعه.",
  "Classify personal data, tag sensitivity, and minimise to the purpose.": "صنّف البيانات الشخصية، وحدّد الحساسية، وقلّلها إلى الغرض.",
  "Confirm a lawful basis per source and clear IP / licence for the use.": "أكّد أساساً قانونياً لكل مصدر وأخلِ الملكية الفكرية / الترخيص للاستخدام.",
  "Check quality and representativeness; sign / pin sources against poisoning.": "افحص الجودة والتمثيلية؛ ووقّع / ثبّت المصادر ضد التسميم.",
  "Write the immutable data-governance record with a content hash.": "اكتب سجل حوكمة البيانات غير القابل للعبث ببصمة محتوى.",
  "Re-verify on material data change or on cadence; keep the record fresh.": "أعد التحقّق عند تغيّر جوهري في البيانات أو دورياً؛ وأبقِ السجل حديثاً.",
  "Data owner + CDPO": "مالك البيانات + حماية البيانات", "CDPO": "حماية البيانات", "Legal + Data owner": "الشؤون القانونية + مالك البيانات",
  "ML engineering": "هندسة التعلّم الآلي", "Governance Office": "مكتب الحوكمة",
  // buttons
  "Open a data record": "افتح سجل بيانات", "Export provenance pack": "تصدير حزمة المصدر",
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
const Table = ({ head, children }) => <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr>{head.map((h, i) => <Th key={i}>{h}</Th>)}</tr></thead><tbody>{children}</tbody></table></div>;
const dimTone = s => s === "Met" ? T.green : s === "Partial" ? T.amber : T.red;

export function DataProvenance({ showToast }) {
  const lang = useLang();
  const ar = lang === "ar";
  const T_ = en => ts(lang, en);
  const s = provenanceStats();
  const rows = [...dataRecords()].sort((a, b) => b.completeness - a.completeness);
  const [open, setOpen] = useState(null);
  const kpis = [
    [T_("Systems governed"), `${s.governed}/${s.total}`, s.governed === s.total ? T.green : AI_GOLD, T_("have a governed data record")],
    [T_("Avg completeness"), `${s.avgCompleteness}%`, T.blue, ar ? `عبر ${s.dimensions} أبعاد للبيانات` : `across ${s.dimensions} data dimensions`],
    [T_("IP / licence clean"), `${s.ipCleanPct}%`, s.ipCleanPct >= 75 ? T.green : AI_GOLD, T_("training data cleared for use")],
    [T_("Poisoning defence"), `${s.validatedPct}%`, s.validatedPct >= 75 ? T.green : AI_GOLD, T_("sources signed / pinned & validated")],
  ];
  const piiTone = p => p === "High" ? T.red : p === "Medium" ? T.amber : T.ink3;
  const stTone = st => st === "Governed" ? T.green : st === "In review" ? T.amber : T.red;
  return <div style={{ animation: "up .3s ease" }}>
    <Head title={T_("Data Provenance")} sub={T_("Where every system's training and grounding data came from, and whether it is governed. One record per AI system across eight dimensions — source lineage, lawful basis, IP clearance, PII classification, quality, integrity, retention and an immutable provenance hash. This is the single control the data-governance obligations of EU AI Act Art. 10, ISO 42001 A.7, the NIST data-poisoning defence, OWASP LLM03 and China's IP-clean-data duty all point at.")} />

    {/* charter */}
    <Card style={{ ...cardPad, marginBottom: 14, background: `linear-gradient(135deg,${T.s2},${T.bg})`, border: `1px solid ${AI_GOLD}38` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ maxWidth: 640 }}>
          <Eyebrow style={{ color: AI_GOLD_INK }}>{T_("One record per system · every source accounted for")}</Eyebrow>
          <H3 style={{ fontSize: 18 }}>{T_("Govern the data, not just the model")}</H3>
          <p style={{ fontSize: 11.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.65, margin: "6px 0 0" }}>{T_("A model is only as governed as the data behind it. Each record catalogues the sources, documents a lawful basis, clears IP, classifies personal data, validates quality and integrity, and closes with a hashed provenance record — the same artifact that answers five frameworks at once.")}</p>
        </div>
        <div style={{ textAlign: "center", background: T.s2, border: `1px solid ${AI_GOLD}45`, borderRadius: 12, padding: "12px 18px", minWidth: 130 }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: AI_GOLD_INK, fontFamily: F.m, lineHeight: 1 }}>{s.cataloguedSources}</div>
          <div style={{ fontSize: 9.5, color: T.ink3, fontWeight: 800, fontFamily: F.b, marginTop: 4, letterSpacing: "0.04em" }}>{T_("SOURCES CATALOGUED")}</div>
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
      <Eyebrow>{T_("The register · one data-governance record per system")}</Eyebrow>
      <H3 style={{ marginBottom: 6 }}>{T_("Catalogue → classify → clear → validate → record — click any row for the dimensions")}</H3>
      <p style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b, margin: "0 0 12px", lineHeight: 1.5 }}>{T_("Completeness is scored from the eight dimensions (Met = 100, Partial = 60). Earlier-stage systems carry open dimensions honestly.")}</p>
      <Table head={["System", "Unit", "PII", "Lawful basis", "IP", "Completeness", "Status"].map(T_)}>
        {rows.map(r => {
          const isOpen = open === r.id;
          return [
            <tr key={r.id} onClick={() => setOpen(isOpen ? null : r.id)} style={{ cursor: "pointer" }}>
              <Td style={{ fontWeight: 700, color: T.ink, minWidth: 175 }}>{T_(r.name)}</Td>
              <Td style={{ color: T.ink3 }}>{T_(r.unit)}</Td>
              <Td><Pill c={piiTone(r.pii)}>{T_(r.pii)}</Pill></Td>
              <Td style={{ color: T.ink3, fontSize: 10.5, maxWidth: 180 }}>{T_(r.lawfulBasis)}</Td>
              <Td>{r.ipCleared ? <Pill c={T.green}>{T_("Clear")}</Pill> : <Pill c={T.amber}>{T_("Open")}</Pill>}</Td>
              <Td style={{ minWidth: 120 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, height: 6, background: T.s2, borderRadius: 4, overflow: "hidden", minWidth: 54 }}><div style={{ width: `${r.completeness}%`, height: "100%", background: r.completeness >= 85 ? T.green : r.completeness >= 60 ? AI_GOLD : T.red }} /></div>
                  <span style={{ fontFamily: F.m, fontSize: 11, fontWeight: 800, color: T.ink }}>{r.completeness}%</span>
                </div>
              </Td>
              <Td><Pill c={stTone(r.status)}>{T_(r.status)}</Pill></Td>
            </tr>,
            isOpen && <tr key={r.id + "-d"}><td colSpan={7} style={{ padding: "0 10px 12px" }}>
              <div style={{ background: AI_GOLD + "10", border: `1px solid ${AI_GOLD}30`, borderRadius: 10, padding: "11px 13px" }}>
                <div style={{ fontSize: 10.5, color: T.ink2, fontFamily: F.b, marginBottom: 9 }}><b style={{ color: AI_GOLD_INK }}>{T_("Sources:")}</b> {r.sources.map(T_).join(" · ")} <span style={{ color: T.ink4, marginInlineStart: 8 }}>{T_("provenance #")}{r.provenanceHash}</span></div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 7 }}>
                  {r.checks.map(c => <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "7px 10px" }}>
                    <span style={{ width: 7, height: 7, borderRadius: 999, background: dimTone(c.status), flexShrink: 0 }} />
                    <span style={{ fontSize: 10.5, color: T.ink2, fontFamily: F.b, fontWeight: 600, flex: 1 }}>{T_(c.name)}</span>
                    <span style={{ fontSize: 9.5, fontWeight: 800, fontFamily: F.b, color: dimTone(c.status) }}>{T_(c.status)}</span>
                  </div>)}
                </div>
              </div>
            </td></tr>,
          ];
        })}
      </Table>
    </Card>

    {/* the workflow */}
    <Card style={cardPad}>
      <Eyebrow>{T_("The workflow · six stages that produce a governed record")}</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>{[T_("Catalogue"), T_("Classify"), T_("Clear"), T_("Validate"), T_("Record"), T_("Review")].join(" → ")}</H3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(205px,1fr))", gap: 10 }}>
        {PROVENANCE_WORKFLOW.map(st => <div key={st.n} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 11, padding: "12px 13px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ width: 22, height: 22, borderRadius: 7, background: AI_GOLD + "1c", border: `1px solid ${AI_GOLD}45`, color: AI_GOLD_INK, fontFamily: F.m, fontWeight: 900, fontSize: 11, display: "grid", placeItems: "center" }}>{st.n}</span>
            <span style={{ fontSize: 12.5, fontWeight: 900, color: T.ink, fontFamily: F.h }}>{T_(st.stage)}</span>
          </div>
          <div style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.55, marginBottom: 6 }}>{T_(st.crit)}</div>
          <Pill c={T.blue}>{T_(st.owner)}</Pill>
        </div>)}
      </div>
      <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 10, background: AI_GOLD + "12", border: `1px solid ${AI_GOLD}30`, fontSize: 11, color: T.ink2, lineHeight: 1.6, fontFamily: F.b }}>
        <b style={{ color: AI_GOLD_INK }}>{ar ? "فيرِس إنتليجنس:" : "Veris Intelligence:"}</b> {ar ? `${s.governed} من ${s.total} أنظمة تحمل سجل بيانات مُحوكَماً؛ والأنظمة ذات البيانات الشخصية المرتفعة البالغة ${s.highPii} توثّق جميعها أساساً قانونياً وإخلاءً للملكية الفكرية. سجل واحد يستوفي المادة 10 من القانون الأوروبي، والأيزو 42001 (أ.7)، ودفاع NIST ضد التسميم، وOWASP LLM03، وواجب الصين ببيانات نظيفة الملكية دفعة واحدة — البناء نفسه، وخمسة التزامات مُغلَقة.` : `${s.governed} of ${s.total} systems carry a governed data record; the ${s.highPii} high-PII systems all document a lawful basis and IP clearance. One record answers EU AI Act Art. 10, ISO 42001 A.7, the NIST data-poisoning defence, OWASP LLM03 and China's IP-clean-data duty at once — the same build, five obligations closed.`}
      </div>
      <div style={{ display: "flex", gap: 9, marginTop: 14, flexWrap: "wrap" }}>
        <button onClick={() => showToast && showToast(ar ? "فُتح سجل حوكمة البيانات — فُهرست المصادر، والأساس القانوني والملكية الفكرية قيد المراجعة" : "Data-governance record opened — sources catalogued, lawful basis and IP in review")} style={{ background: AI_GOLD, border: "none", borderRadius: 10, padding: "9px 15px", color: "#241703", fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>{T_("Open a data record")}</button>
        <button onClick={() => showToast && showToast(ar ? "صُدّرت حزمة المصدر — فهرس المصادر والأساس القانوني وبصمات المحتوى" : "Provenance pack exported — source catalogue, lawful basis and content hashes")} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 15px", color: T.ink2, fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>{T_("Export provenance pack")}</button>
      </div>
    </Card>
  </div>;
}
