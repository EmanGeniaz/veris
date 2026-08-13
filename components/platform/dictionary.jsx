"use client";

import { useState, useMemo } from "react";
import { T, F, AI_GOLD, AI_GOLD_INK, Card, SHead } from "./core";
import { PLATFORM_DICTIONARY, DICT_CATEGORIES } from "@/lib/platform-dictionary";

/* ── Glossary & Learning — the in-product mirror of the VerisZone Dictionary.
   Reads the same lib/platform-dictionary.js as the shareable artifact, so the
   two stay in sync. Search + category filter + expandable entries; each entry
   carries Meaning, Usage, Example and a What/Why/How/Where quick-learning grid.
   (The shareable Dictionary artifact additionally embeds a screenshot per
   surface — here you're already inside the product, one click away.) ── */

const CAT_DOT = {
  "Core concept": "#C79A45", "Role & workspace": "#5B8AC9", "AI Central": "#2F9E9E",
  "Security & enforcement": "#D06A54", "Compliance & governance": "#7C7ED6", "Risk & assurance": "#D69A3C",
  "Framework & regulation": "#5BA772", "Executive domain": "#B978A0", "Workforce": "#5FA3C9",
  "Platform & admin": "#8A93A5", "Metric & score": "#C7A84E",
};

const Eyebrow = ({ children, style }) => <div style={{ fontSize: 8.5, letterSpacing: "0.09em", textTransform: "uppercase", color: AI_GOLD_INK, fontWeight: 800, fontFamily: F.m, ...style }}>{children}</div>;

function Entry({ e, open, onToggle }) {
  const dot = CAT_DOT[e.cat] || T.ink4;
  return <Card style={{ padding: 0, overflow: "hidden", border: `1px solid ${open ? AI_GOLD + "55" : T.border}` }}>
    <button onClick={onToggle} aria-expanded={open} style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: 11, padding: "13px 15px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
      <span style={{ width: 9, height: 9, borderRadius: "50%", background: dot, flexShrink: 0, marginTop: 5, boxShadow: `0 0 0 3px ${dot}33` }} />
      <span style={{ minWidth: 0, flex: 1 }}>
        <span style={{ display: "flex", alignItems: "baseline", gap: 9, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14.5, fontWeight: 800, color: T.ink, fontFamily: F.h }}>{e.term}</span>
          <span style={{ fontSize: 8.5, letterSpacing: "0.07em", textTransform: "uppercase", color: T.ink4, fontFamily: F.m, fontWeight: 700 }}>{e.cat}</span>
        </span>
        <span style={{ display: "block", fontSize: 12.5, color: T.ink2, fontFamily: F.b, lineHeight: 1.5, marginTop: 3 }}>{e.meaning}</span>
      </span>
      <span style={{ flexShrink: 0, color: T.ink4, fontSize: 15, fontWeight: 700, transform: open ? "rotate(90deg)" : "none", transition: "transform .15s", marginTop: 2 }}>›</span>
    </button>
    {open && <div style={{ padding: "0 15px 15px 35px", display: "grid", gap: 11 }}>
      <div style={{ display: "grid", gap: 9 }}>
        <div><Eyebrow>Usage · where</Eyebrow><div style={{ fontSize: 12.5, color: T.ink2, fontFamily: F.b, lineHeight: 1.5, marginTop: 2 }}>{e.usage}</div></div>
        <div><Eyebrow>Example · how it works</Eyebrow><div style={{ fontSize: 12.5, color: T.ink2, fontFamily: F.b, lineHeight: 1.5, marginTop: 2 }}>{e.example}</div></div>
      </div>
      <div style={{ borderTop: `1px dashed ${T.border}`, paddingTop: 10 }}>
        <Eyebrow style={{ color: T.ink4, marginBottom: 8 }}>Quick learning</Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[["What", e.ql.what], ["Why", e.ql.why], ["How", e.ql.how], ["Where", e.ql.where]].map(([k, v]) =>
            <div key={k} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "7px 10px" }}>
              <div style={{ fontSize: 8.5, letterSpacing: "0.07em", textTransform: "uppercase", color: AI_GOLD_INK, fontWeight: 800, fontFamily: F.m }}>{k}</div>
              <div style={{ fontSize: 11.5, color: T.ink2, fontFamily: F.b, lineHeight: 1.4, marginTop: 1 }}>{v}</div>
            </div>)}
        </div>
      </div>
    </div>}
  </Card>;
}

export function GlossaryLearning() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [open, setOpen] = useState(null);
  const ql = q.trim().toLowerCase();

  const rows = useMemo(() => PLATFORM_DICTIONARY.filter(e => {
    if (cat !== "all" && e.cat !== cat) return false;
    if (!ql) return true;
    return `${e.term} ${e.cat} ${e.meaning} ${e.usage} ${e.example} ${e.ql.what} ${e.ql.why} ${e.ql.how} ${e.ql.where}`.toLowerCase().includes(ql);
  }), [ql, cat]);

  const field = { background: "#fff", border: `1px solid ${T.border}`, borderRadius: 9, padding: "9px 13px", color: T.ink, fontSize: 13, fontWeight: 600, fontFamily: F.b, outline: "none" };

  return <div style={{ animation: "up .3s ease" }}>
    <SHead title="Glossary & Learning" sub={`Every name in VerisZone, explained — ${PLATFORM_DICTIONARY.length} terms across roles, surfaces, engines, frameworks, concepts and metrics. Search or filter, then open a term for its meaning, usage, an example and a quick What / Why / How / Where.`} />

    <Card style={{ padding: 14, marginBottom: 12 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search any term, meaning or usage…" aria-label="Search the dictionary" style={{ ...field, flex: 1, minWidth: 220 }} />
        <span style={{ fontSize: 11, color: T.ink3, fontFamily: F.m, fontWeight: 700, whiteSpace: "nowrap" }}>{rows.length} / {PLATFORM_DICTIONARY.length} terms</span>
      </div>
      <div style={{ display: "flex", gap: 7, overflowX: "auto", marginTop: 11, paddingBottom: 2 }}>
        {["all", ...DICT_CATEGORIES].map(c => {
          const on = cat === c;
          const n = c === "all" ? PLATFORM_DICTIONARY.length : PLATFORM_DICTIONARY.filter(e => e.cat === c).length;
          return <button key={c} onClick={() => setCat(c)} style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6, background: on ? AI_GOLD : T.s2, border: `1px solid ${on ? AI_GOLD : T.border}`, borderRadius: 999, padding: "5px 11px", color: on ? "#241703" : T.ink2, fontSize: 11.5, fontWeight: 800, fontFamily: F.b, cursor: "pointer", whiteSpace: "nowrap" }}>
            {c === "all" ? "All" : c}
            <span style={{ fontSize: 9.5, fontFamily: F.m, opacity: 0.7 }}>{n}</span>
          </button>;
        })}
      </div>
    </Card>

    <div style={{ display: "grid", gap: 9 }}>
      {rows.map(e => <Entry key={e.term} e={e} open={open === e.term} onToggle={() => setOpen(open === e.term ? null : e.term)} />)}
      {!rows.length && <Card style={{ padding: "26px 16px", textAlign: "center" }}><span style={{ fontSize: 13, color: T.ink3, fontFamily: F.b }}>No term matches “{q}”.</span></Card>}
    </div>
  </div>;
}
