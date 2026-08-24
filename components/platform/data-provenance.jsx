"use client";

import { useState } from "react";
import { T, F, AI_GOLD, AI_GOLD_INK, Card } from "./core";
import {
  DATA_DIMENSIONS, dataRecords, PROVENANCE_WORKFLOW, provenanceStats,
} from "@/lib/data-provenance";

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
  const s = provenanceStats();
  const rows = [...dataRecords()].sort((a, b) => b.completeness - a.completeness);
  const [open, setOpen] = useState(null);
  const kpis = [
    ["Systems governed", `${s.governed}/${s.total}`, s.governed === s.total ? T.green : AI_GOLD, "have a governed data record"],
    ["Avg completeness", `${s.avgCompleteness}%`, T.blue, `across ${s.dimensions} data dimensions`],
    ["IP / licence clean", `${s.ipCleanPct}%`, s.ipCleanPct >= 75 ? T.green : AI_GOLD, "training data cleared for use"],
    ["Poisoning defence", `${s.validatedPct}%`, s.validatedPct >= 75 ? T.green : AI_GOLD, "sources signed / pinned & validated"],
  ];
  const piiTone = p => p === "High" ? T.red : p === "Medium" ? T.amber : T.ink3;
  const stTone = st => st === "Governed" ? T.green : st === "In review" ? T.amber : T.red;
  return <div style={{ animation: "up .3s ease" }}>
    <Head title="Data Provenance" sub="Where every system's training and grounding data came from, and whether it is governed. One record per AI system across eight dimensions — source lineage, lawful basis, IP clearance, PII classification, quality, integrity, retention and an immutable provenance hash. This is the single control the data-governance obligations of EU AI Act Art. 10, ISO 42001 A.7, the NIST data-poisoning defence, OWASP LLM03 and China's IP-clean-data duty all point at." />

    {/* charter */}
    <Card style={{ ...cardPad, marginBottom: 14, background: `linear-gradient(135deg,${T.s2},${T.bg})`, border: `1px solid ${AI_GOLD}38` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ maxWidth: 640 }}>
          <Eyebrow style={{ color: AI_GOLD_INK }}>One record per system · every source accounted for</Eyebrow>
          <H3 style={{ fontSize: 18 }}>Govern the data, not just the model</H3>
          <p style={{ fontSize: 11.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.65, margin: "6px 0 0" }}>A model is only as governed as the data behind it. Each record catalogues the sources, documents a lawful basis, clears IP, classifies personal data, validates quality and integrity, and closes with a hashed provenance record — the same artifact that answers five frameworks at once.</p>
        </div>
        <div style={{ textAlign: "center", background: T.s2, border: `1px solid ${AI_GOLD}45`, borderRadius: 12, padding: "12px 18px", minWidth: 130 }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: AI_GOLD_INK, fontFamily: F.m, lineHeight: 1 }}>{s.cataloguedSources}</div>
          <div style={{ fontSize: 9.5, color: T.ink3, fontWeight: 800, fontFamily: F.b, marginTop: 4, letterSpacing: "0.04em" }}>SOURCES CATALOGUED</div>
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
      <Eyebrow>The register · one data-governance record per system</Eyebrow>
      <H3 style={{ marginBottom: 6 }}>Catalogue → classify → clear → validate → record — click any row for the dimensions</H3>
      <p style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b, margin: "0 0 12px", lineHeight: 1.5 }}>Completeness is scored from the eight dimensions (Met = 100, Partial = 60). Earlier-stage systems carry open dimensions honestly.</p>
      <Table head={["System", "Unit", "PII", "Lawful basis", "IP", "Completeness", "Status"]}>
        {rows.map(r => {
          const isOpen = open === r.id;
          return [
            <tr key={r.id} onClick={() => setOpen(isOpen ? null : r.id)} style={{ cursor: "pointer" }}>
              <Td style={{ fontWeight: 700, color: T.ink, minWidth: 175 }}>{r.name}</Td>
              <Td style={{ color: T.ink3 }}>{r.unit}</Td>
              <Td><Pill c={piiTone(r.pii)}>{r.pii}</Pill></Td>
              <Td style={{ color: T.ink3, fontSize: 10.5, maxWidth: 180 }}>{r.lawfulBasis}</Td>
              <Td>{r.ipCleared ? <Pill c={T.green}>Clear</Pill> : <Pill c={T.amber}>Open</Pill>}</Td>
              <Td style={{ minWidth: 120 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, height: 6, background: T.s2, borderRadius: 4, overflow: "hidden", minWidth: 54 }}><div style={{ width: `${r.completeness}%`, height: "100%", background: r.completeness >= 85 ? T.green : r.completeness >= 60 ? AI_GOLD : T.red }} /></div>
                  <span style={{ fontFamily: F.m, fontSize: 11, fontWeight: 800, color: T.ink }}>{r.completeness}%</span>
                </div>
              </Td>
              <Td><Pill c={stTone(r.status)}>{r.status}</Pill></Td>
            </tr>,
            isOpen && <tr key={r.id + "-d"}><td colSpan={7} style={{ padding: "0 10px 12px" }}>
              <div style={{ background: AI_GOLD + "10", border: `1px solid ${AI_GOLD}30`, borderRadius: 10, padding: "11px 13px" }}>
                <div style={{ fontSize: 10.5, color: T.ink2, fontFamily: F.b, marginBottom: 9 }}><b style={{ color: AI_GOLD_INK }}>Sources:</b> {r.sources.join(" · ")} <span style={{ color: T.ink4, marginLeft: 8 }}>provenance #{r.provenanceHash}</span></div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 7 }}>
                  {r.checks.map(c => <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "7px 10px" }}>
                    <span style={{ width: 7, height: 7, borderRadius: 999, background: dimTone(c.status), flexShrink: 0 }} />
                    <span style={{ fontSize: 10.5, color: T.ink2, fontFamily: F.b, fontWeight: 600, flex: 1 }}>{c.name}</span>
                    <span style={{ fontSize: 9.5, fontWeight: 800, fontFamily: F.b, color: dimTone(c.status) }}>{c.status}</span>
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
      <Eyebrow>The workflow · six stages that produce a governed record</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>Catalogue → Classify → Clear → Validate → Record → Review</H3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(205px,1fr))", gap: 10 }}>
        {PROVENANCE_WORKFLOW.map(st => <div key={st.n} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 11, padding: "12px 13px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ width: 22, height: 22, borderRadius: 7, background: AI_GOLD + "1c", border: `1px solid ${AI_GOLD}45`, color: AI_GOLD_INK, fontFamily: F.m, fontWeight: 900, fontSize: 11, display: "grid", placeItems: "center" }}>{st.n}</span>
            <span style={{ fontSize: 12.5, fontWeight: 900, color: T.ink, fontFamily: F.h }}>{st.stage}</span>
          </div>
          <div style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.55, marginBottom: 6 }}>{st.crit}</div>
          <Pill c={T.blue}>{st.owner}</Pill>
        </div>)}
      </div>
      <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 10, background: AI_GOLD + "12", border: `1px solid ${AI_GOLD}30`, fontSize: 11, color: T.ink2, lineHeight: 1.6, fontFamily: F.b }}>
        <b style={{ color: AI_GOLD_INK }}>Veris Intelligence:</b> {s.governed} of {s.total} systems carry a governed data record; the {s.highPii} high-PII systems all document a lawful basis and IP clearance. One record answers EU AI Act Art. 10, ISO 42001 A.7, the NIST data-poisoning defence, OWASP LLM03 and China's IP-clean-data duty at once — the same build, five obligations closed.
      </div>
      <div style={{ display: "flex", gap: 9, marginTop: 14, flexWrap: "wrap" }}>
        <button onClick={() => showToast && showToast("Data-governance record opened — sources catalogued, lawful basis and IP in review")} style={{ background: AI_GOLD, border: "none", borderRadius: 10, padding: "9px 15px", color: "#241703", fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>Open a data record</button>
        <button onClick={() => showToast && showToast("Provenance pack exported — source catalogue, lawful basis and content hashes")} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 15px", color: T.ink2, fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>Export provenance pack</button>
      </div>
    </Card>
  </div>;
}
