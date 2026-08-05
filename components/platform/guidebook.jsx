"use client";

import { useState } from "react";
import { T, F, AI_GOLD, Card } from "./core";
import { REGIMES, REGIME_STATUS_META, jurisdictionStats, OPERATING_REGIONS } from "@/lib/jurisdictions";
import { SOA_CONTROLS, SOA_STATUS_META, CERT_CLAUSES, soaStats } from "@/lib/soa";
import { EVIDENCE_ARTIFACTS, FRESHNESS_META, freshnessStats } from "@/lib/evidence-freshness";
import { GLOSSARY, GLOSSARY_CATEGORIES } from "@/lib/glossary";

/* ── shared local primitives (match the platform's visual language) ── */
const tok = k => ({ crit: T.red, warn: T.amber, info: T.blue, good: T.green, ink3: T.ink3 }[k] || T.ink3);
const cardPad = { padding: 18 };
const Eyebrow = ({ children, style }) => <div style={{ fontSize: 9, letterSpacing: "0.09em", textTransform: "uppercase", color: T.ink4, fontWeight: 900, fontFamily: F.m, ...style }}>{children}</div>;
const H3 = ({ children, style }) => <h3 style={{ fontFamily: F.h, fontSize: 16, fontWeight: 900, color: T.ink, margin: "4px 0 0", ...style }}>{children}</h3>;
const Head = ({ title, sub }) => <div style={{ marginBottom: 16 }}><h2 style={{ fontFamily: F.h, fontSize: 24, fontWeight: 900, color: T.ink, margin: 0, letterSpacing: "-0.02em" }}>{title}</h2><p style={{ fontFamily: F.b, fontSize: 12.5, color: T.ink3, margin: "5px 0 0", maxWidth: 760, lineHeight: 1.6 }}>{sub}</p></div>;
const Pill = ({ c, children }) => <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 9px", borderRadius: 999, fontSize: 10, fontWeight: 800, fontFamily: F.b, color: c, background: c + "18", border: `1px solid ${c}40` }}>{children}</span>;
const Th = ({ children, style }) => <th style={{ textAlign: "left", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: T.ink4, fontWeight: 900, fontFamily: F.m, padding: "0 10px 9px", borderBottom: `1px solid ${T.border}`, ...style }}>{children}</th>;
const Td = ({ children, style }) => <td style={{ padding: "10px", borderBottom: `1px solid ${T.border}`, color: T.ink2, fontSize: 11.5, fontFamily: F.b, verticalAlign: "middle", ...style }}>{children}</td>;
const Table = ({ head, children }) => <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr>{head.map(h => <Th key={h}>{h}</Th>)}</tr></thead><tbody>{children}</tbody></table></div>;
const Kpi = ({ l, v, c, sub }) => <Card style={{ padding: "13px 15px" }}><Eyebrow>{l}</Eyebrow><div style={{ fontSize: 26, fontWeight: 900, color: c, fontFamily: F.m, margin: "5px 0 2px" }}>{v}</div><div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b }}>{sub}</div></Card>;
const kpiGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 14 };

/* ══════════════ JURISDICTION ATLAS ══════════════ */
export function JurisdictionAtlas({ showToast }) {
  const s = jurisdictionStats();
  const [f, setF] = useState("all");
  const rows = REGIMES.filter(r => f === "all" || r.status === f);
  const chips = [["all", "All"], ["applies", "Applies"], ["monitor", "Monitor"], ["out", "Out of scope"]];
  return <div style={{ animation: "up .3s ease" }}>
    <Head title="Jurisdiction Atlas" sub={`Which regimes bind the enterprise, and where each stands. Each regime self-flags Applies / Monitor / Out of scope from the markets the estate actually operates in — ${OPERATING_REGIONS.join(", ")}. Many regimes, one control set: obligations collapse into the convergence crosswalk.`} />
    <div style={kpiGrid}>
      <Kpi l="Regimes tracked" v={String(s.total)} c={AI_GOLD} sub={`across ${s.regions} operating regions`} />
      <Kpi l="Applies now" v={String(s.applies)} c={T.red} sub="binding obligations" />
      <Kpi l="Monitor" v={String(s.monitor)} c={T.amber} sub="emerging / pending" />
      <Kpi l="Out of scope" v={String(s.out)} c={T.ink3} sub="tracked, not binding" />
    </div>
    <Card style={cardPad}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <div><Eyebrow>The regime register · {rows.length} of {s.total}</Eyebrow><H3>Applies · effective date · penalty exposure</H3></div>
        <button onClick={() => showToast && showToast("Jurisdiction Atlas exported — regimes, status, effective dates and penalties")} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 13px", color: T.ink2, fontSize: 11.5, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>Export Atlas</button>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {chips.map(([k, l]) => <button key={k} onClick={() => setF(k)} style={{ fontSize: 10.5, fontWeight: 800, fontFamily: F.b, cursor: "pointer", color: f === k ? "#241703" : T.ink2, background: f === k ? AI_GOLD : T.s2, border: `1px solid ${f === k ? AI_GOLD : T.border}`, borderRadius: 999, padding: "5px 12px" }}>{l}</button>)}
      </div>
      <Table head={["Regime", "Jurisdiction", "Type", "Status", "Effective", "Penalty exposure"]}>
        {rows.map(r => { const m = REGIME_STATUS_META[r.status]; return <tr key={r.id}>
          <Td style={{ fontWeight: 700, color: T.ink, minWidth: 160 }}>{r.regime}<div style={{ fontSize: 9.5, color: T.ink3, fontWeight: 500, marginTop: 3, maxWidth: 300, lineHeight: 1.45 }}>{r.note}</div></Td>
          <Td>{r.geo}</Td>
          <Td style={{ color: T.ink3 }}>{r.instrument}</Td>
          <Td><Pill c={tok(m.tone)}>{m.label}</Pill></Td>
          <Td style={{ color: T.ink3, whiteSpace: "nowrap" }}>{r.effective}</Td>
          <Td style={{ color: T.ink3, maxWidth: 200 }}>{r.penalty}</Td>
        </tr>; })}
      </Table>
      <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 10, background: AI_GOLD + "12", border: `1px solid ${AI_GOLD}30`, fontSize: 11, color: T.ink2, lineHeight: 1.6, fontFamily: F.b }}>
        <b style={{ color: AI_GOLD }}>Veris Intelligence:</b> {s.applies} regimes bind the estate today across {s.regions} regions. Rather than run one programme per regime, each maps to the shared 32-capability control set — one artifact satisfies the matching clause in every regime that cites it.
      </div>
    </Card>
  </div>;
}

/* ══════════════ STATEMENT OF APPLICABILITY + CERT-READINESS ══════════════ */
export function StatementOfApplicability({ showToast }) {
  const s = soaStats();
  return <div style={{ animation: "up .3s ease" }}>
    <Head title="ISO 42001 Readiness" sub="The Statement of Applicability an auditor reads first — every Annex A control, whether it applies, and the evidence that proves it — plus certification readiness by management-system clause, built around what an auditor actually asks for." />
    <Card style={{ ...cardPad, marginBottom: 14, background: `linear-gradient(135deg,${T.s2},${T.bg})`, border: `1px solid ${AI_GOLD}38` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ maxWidth: 620 }}>
          <Eyebrow style={{ color: AI_GOLD }}>Certification readiness</Eyebrow>
          <H3 style={{ fontSize: 18 }}>{s.readiness}% ready for a Stage-2 ISO/IEC 42001 audit</H3>
          <p style={{ fontSize: 11.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.65, margin: "6px 0 0" }}>{s.applicable} of {s.total} Annex A controls applicable · {s.implemented} implemented · {s.partial} partial. Weakest clause: Performance evaluation (internal audit + management review).</p>
        </div>
        <div style={{ textAlign: "center", background: T.s2, border: `1px solid ${AI_GOLD}45`, borderRadius: 12, padding: "12px 18px", minWidth: 120 }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: AI_GOLD, fontFamily: F.m, lineHeight: 1 }}>{s.readiness}%</div>
          <div style={{ fontSize: 9.5, color: T.ink3, fontWeight: 800, fontFamily: F.b, marginTop: 4, letterSpacing: "0.04em" }}>READY</div>
        </div>
      </div>
    </Card>
    <div style={kpiGrid}>
      <Kpi l="Annex A controls" v={String(s.total)} c={AI_GOLD} sub={`${s.applicable} applicable · ${s.notApplicable} N/A`} />
      <Kpi l="Implemented" v={String(s.implemented)} c={T.green} sub={`${s.implementedPct}% of applicable`} />
      <Kpi l="Partial" v={String(s.partial)} c={T.amber} sub="evidence in progress" />
      <Kpi l="Audit readiness" v={`${s.readiness}%`} c={AI_GOLD} sub="clauses 4–10" />
    </div>
    <Card style={{ ...cardPad, marginBottom: 14 }}>
      <Eyebrow>Statement of Applicability · Annex A</Eyebrow><H3 style={{ marginBottom: 12 }}>Control · applicable? · justification · evidence</H3>
      <Table head={["Annex A", "Control", "Applicable", "Status", "Evidence artifact", "Xwalk"]}>
        {SOA_CONTROLS.map(c => { const m = SOA_STATUS_META[c.status]; return <tr key={c.id}>
          <Td style={{ fontFamily: F.m, color: T.ink3, whiteSpace: "nowrap" }}>{c.id}</Td>
          <Td style={{ fontWeight: 700, color: T.ink, minWidth: 170 }}>{c.control}<div style={{ fontSize: 9.5, color: T.ink4, fontWeight: 500, marginTop: 2 }}>{c.theme}</div></Td>
          <Td>{c.applicable ? <Pill c={T.green}>Yes</Pill> : <Pill c={T.ink3}>N/A</Pill>}</Td>
          <Td><Pill c={tok(m.tone)}>{m.label}</Pill></Td>
          <Td style={{ color: T.ink2 }}>{c.evidence}</Td>
          <Td style={{ fontFamily: F.m, color: T.ink3 }}>{c.ref}</Td>
        </tr>; })}
      </Table>
    </Card>
    <Card style={cardPad}>
      <Eyebrow>Certification readiness · what the auditor asks</Eyebrow><H3 style={{ marginBottom: 12 }}>By management-system clause (4–10)</H3>
      <div style={{ display: "grid", gap: 9 }}>
        {CERT_CLAUSES.map(c => { const col = c.score >= 85 ? T.green : c.score >= 70 ? AI_GOLD : T.red; return <div key={c.clause}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
            <span style={{ fontSize: 11.5, fontWeight: 800, color: T.ink, fontFamily: F.b }}><span style={{ fontFamily: F.m, color: T.ink4 }}>Cl. {c.clause}</span> · {c.name}</span>
            <span style={{ fontSize: 11, fontWeight: 900, color: col, fontFamily: F.m }}>{c.score}%</span>
          </div>
          <div style={{ height: 6, background: T.s2, borderRadius: 4, overflow: "hidden" }}><div style={{ width: `${c.score}%`, height: "100%", background: col }} /></div>
          <div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b, marginTop: 3 }}>{c.ask}</div>
        </div>; })}
      </div>
      <div style={{ display: "flex", gap: 9, marginTop: 14, flexWrap: "wrap" }}>
        <button onClick={() => showToast && showToast("SoA + readiness pack assembled for the certification body")} style={{ background: AI_GOLD, border: "none", borderRadius: 10, padding: "9px 15px", color: "#241703", fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>Assemble audit pack</button>
      </div>
    </Card>
  </div>;
}

/* ══════════════ EVIDENCE FRESHNESS ══════════════ */
export function EvidenceFreshness({ showToast }) {
  const s = freshnessStats();
  return <div style={{ animation: "up .3s ease" }}>
    <Head title="Evidence Freshness" sub="Governance that was true last year is not evidence today. Every evidence artifact carries a review cadence; anything past its review date is flagged Stale so it surfaces without being hunted for — the freshness index an auditor trusts." />
    <div style={kpiGrid}>
      <Kpi l="Artifacts tracked" v={String(s.total)} c={AI_GOLD} sub="with a review cadence" />
      <Kpi l="Fresh" v={String(s.fresh)} c={T.green} sub={`${s.freshPct}% within cadence`} />
      <Kpi l="Due soon" v={String(s.due)} c={T.amber} sub="review approaching" />
      <Kpi l="Stale" v={String(s.stale)} c={T.red} sub="past review — act now" />
    </div>
    <Card style={cardPad}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <div><Eyebrow>Evidence register · freshness</Eyebrow><H3>Artifact · owner · cadence · last reviewed · state</H3></div>
        <button onClick={() => showToast && showToast(`${s.stale} stale artifacts routed to their owners for refresh`)} style={{ background: s.stale ? T.red : T.s2, border: `1px solid ${s.stale ? T.red : T.border}`, borderRadius: 10, padding: "8px 13px", color: s.stale ? "#fff" : T.ink2, fontSize: 11.5, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>{s.stale ? `Refresh ${s.stale} stale` : "All fresh"}</button>
      </div>
      <Table head={["ID", "Evidence artifact", "Owner", "Cadence", "Last reviewed", "Next / due", "State"]}>
        {EVIDENCE_ARTIFACTS.map(e => { const m = FRESHNESS_META[e.freshness]; return <tr key={e.id}>
          <Td style={{ fontFamily: F.m, color: T.ink3 }}>{e.id}</Td>
          <Td style={{ fontWeight: 700, color: T.ink }}>{e.artifact}</Td>
          <Td>{e.owner}</Td>
          <Td style={{ color: T.ink3 }}>{e.cadence}</Td>
          <Td style={{ color: T.ink3, whiteSpace: "nowrap" }}>{e.lastReviewed}</Td>
          <Td style={{ color: e.freshness === "stale" ? T.red : T.ink3, whiteSpace: "nowrap" }}>{e.due}</Td>
          <Td><Pill c={tok(m.tone)}>{m.label}</Pill></Td>
        </tr>; })}
      </Table>
      <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 10, background: AI_GOLD + "12", border: `1px solid ${AI_GOLD}30`, fontSize: 11, color: T.ink2, lineHeight: 1.6, fontFamily: F.b }}>
        <b style={{ color: AI_GOLD }}>Veris Intelligence:</b> {s.stale} artifacts are stale — the APAC transfer assessment (INC-1048) and the acceptable-use policy are overdue and block their crosswalk capabilities. Fresh evidence is the difference between a governance file and a defensible audit.
      </div>
    </Card>
  </div>;
}

/* ══════════════ GLOSSARY ══════════════ */
export function Glossary() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const ql = q.trim().toLowerCase();
  const rows = GLOSSARY.filter(g => (cat === "all" || g.cat === cat) && (!ql || g.term.toLowerCase().includes(ql) || g.def.toLowerCase().includes(ql)));
  const cats = ["all", ...GLOSSARY_CATEGORIES].filter(c => c === "all" || rows.some(r => r.cat === c) || cat !== "all");
  const shown = GLOSSARY_CATEGORIES.filter(c => rows.some(r => r.cat === c));
  return <div style={{ animation: "up .3s ease" }}>
    <Head title="Governance Glossary" sub={`${GLOSSARY.length} terms of art — every acronym and concept an executive, auditor or engineer will hit on a governance surface, in plain language. So the platform stands alone.`} />
    <Card style={{ ...cardPad, marginBottom: 14 }}>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search terms and definitions…" style={{ width: "100%", boxSizing: "border-box", padding: "10px 13px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.s2, color: T.ink, fontSize: 12.5, fontFamily: F.b, outline: "none", marginBottom: 12 }} />
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {cats.map(c => <button key={c} onClick={() => setCat(c)} style={{ fontSize: 10.5, fontWeight: 800, fontFamily: F.b, cursor: "pointer", color: cat === c ? "#241703" : T.ink2, background: cat === c ? AI_GOLD : T.s2, border: `1px solid ${cat === c ? AI_GOLD : T.border}`, borderRadius: 999, padding: "5px 12px" }}>{c === "all" ? "All" : c}</button>)}
      </div>
    </Card>
    {rows.length === 0 ? <Card style={cardPad}><div style={{ fontSize: 12, color: T.ink3, fontFamily: F.b }}>No terms match “{q}”.</div></Card> :
      shown.map(c => <Card key={c} style={{ ...cardPad, marginBottom: 12 }}>
        <Eyebrow style={{ color: AI_GOLD, marginBottom: 10 }}>{c}</Eyebrow>
        <div style={{ display: "grid", gap: 10 }}>
          {rows.filter(r => r.cat === c).map(r => <div key={r.term} style={{ borderLeft: `2px solid ${T.border}`, paddingLeft: 12 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: T.ink, fontFamily: F.b }}>{r.term}</div>
            <div style={{ fontSize: 11, color: T.ink3, fontFamily: F.b, lineHeight: 1.55, marginTop: 2 }}>{r.def}</div>
          </div>)}
        </div>
      </Card>)}
  </div>;
}
