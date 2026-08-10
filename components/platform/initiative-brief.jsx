"use client";

import { useEffect } from "react";
import { facetsFor } from "@/lib/initiative-facets";
import { T, F, AI_GOLD, AI_GOLD_INK, Card, Tag } from "./core";

/* ── Initiative Brief ───────────────────────────────────────────────
   The shared, self-explanatory view of one initiative — the intent, the
   pain it solves, the value, the architecture, the cross-functional
   facets and the risks. Whoever opens it (any CXO) sees the whole story
   and never feels lost. `role` highlights that reader's own facet. */

const col = k => ({ good: T.green, warn: T.amber, crit: T.red, info: T.blue, ink3: T.ink3, ink4: T.ink4, gold: AI_GOLD }[k] || T.ink3);
const riskColor = r => r === "Critical" ? T.red : r === "High" ? T.amber : r === "Medium" ? T.blue : T.green;

const Section = ({ eye, title, children }) => <div style={{ marginBottom: 16 }}>
  <div style={{ fontSize: 9, fontWeight: 900, fontFamily: F.m, color: T.ink4, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>{eye}</div>
  {title && <div style={{ fontSize: 13, fontWeight: 800, color: T.ink, fontFamily: F.b, marginBottom: 6 }}>{title}</div>}
  {children}
</div>;
const KV = ({ l, v, c }) => <div style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 9, padding: "9px 11px" }}>
  <div style={{ fontSize: 8.5, fontWeight: 900, fontFamily: F.m, color: T.ink4, textTransform: "uppercase", letterSpacing: "0.07em" }}>{l}</div>
  <div style={{ fontSize: 12, fontWeight: 700, color: c || T.ink, fontFamily: F.b, marginTop: 3 }}>{v || "—"}</div>
</div>;
const Grid = ({ children, min = 130 }) => <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit,minmax(${min}px,1fr))`, gap: 8 }}>{children}</div>;

export function InitiativeBrief({ a, role }){
  const facets = facetsFor(a);
  return <div>
    {/* Intent + pain — the "why", first, so the reader is oriented immediately */}
    <Section eye="The intent" title={a.vision}>
      <div style={{ fontSize: 11.5, color: T.ink2, fontFamily: F.b, lineHeight: 1.65 }}><b style={{ color: T.ink3 }}>Objective — </b>{a.objective}</div>
    </Section>
    <Section eye="The pain point it solves">
      <div style={{ fontSize: 11.5, color: T.ink2, fontFamily: F.b, lineHeight: 1.65 }}>{a.description}</div>
    </Section>

    {/* Cross-functional facets — the whole executive picture on one strip */}
    <Section eye="Cross-functional status" title="Every CXO's facet of this same initiative">
      <div style={{ display: "grid", gap: 6 }}>
        {facets.map(f => { const mine = f.role === role; return <div key={f.domain} style={{ display: "grid", gridTemplateColumns: "128px 92px 1fr", gap: 10, alignItems: "center", background: mine ? AI_GOLD + "12" : T.s2, border: `1px solid ${mine ? AI_GOLD + "45" : T.border}`, borderRadius: 9, padding: "8px 11px" }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: mine ? AI_GOLD : T.ink, fontFamily: F.b }}>{f.domain}<span style={{ color: T.ink4, fontWeight: 600 }}> · {f.owner}</span></span>
          <Tag label={f.label} color={col(f.color)} bg={col(f.color) + "18"} />
          <span style={{ fontSize: 10, color: T.ink3, fontFamily: F.b, lineHeight: 1.4 }}>{f.note}</span>
        </div>; })}
      </div>
    </Section>

    {/* Value */}
    <Section eye="Business value">
      <Grid><KV l="ROI" v={a.roi} c={T.green} /><KV l="Adoption" v={a.adoption + "%"} /><KV l="Value score" v={a.value} /><KV l="Expected" v={a.expected} /><KV l="Realized" v={a.actual} /><KV l="Budget · spent" v={`${a.budget} · ${a.spent}`} /><KV l="Time-to-value" v={a.arch.ttv} /></Grid>
    </Section>

    {/* Architecture */}
    <Section eye="System architecture">
      <Grid min={190}><KV l="Type" v={a.arch.assetType} /><KV l="Model" v={a.arch.model} /><KV l="Data" v={a.arch.data} /><KV l="Integrations" v={a.arch.integrations} /><KV l="Guardrails" v={a.arch.guardrails} /><KV l="Hosting" v={a.arch.hosting} /><KV l="Data class" v={a.arch.dataClass} /><KV l="EU AI Act" v={a.arch.euAiAct} /></Grid>
    </Section>

    {/* Risks & ownership */}
    <Section eye="Risks & controls">
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {(a.risksList || []).map(r => <Tag key={r} label={r} color={T.amber} bg={T.amber + "16"} />)}
        {(a.controls || []).map(c => <Tag key={c} label={c} color={T.blue} bg={T.blue + "16"} />)}
      </div>
    </Section>
    <Section eye="Ownership">
      <Grid><KV l="Business owner" v={a.owner} /><KV l="Technical owner" v={a.technicalOwner} /><KV l="Sponsor" v={a.sponsor} /><KV l="Unit" v={a.unit} /></Grid>
    </Section>
  </div>;
}

/* Slide-in drawer wrapper — opened from any CXO dashboard or AI Central. */
export function BriefDrawer({ a, role, onClose }){
  useEffect(() => { const h = e => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [onClose]);
  if (!a) return null;
  return <div onMouseDown={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(4,7,20,.5)", backdropFilter: "blur(2px)", display: "flex", justifyContent: "flex-end" }}>
    <div onMouseDown={e => e.stopPropagation()} style={{ width: 560, maxWidth: "94vw", height: "100%", overflowY: "auto", background: T.card || T.s1, borderLeft: `1px solid ${T.border}`, boxShadow: "-24px 0 60px rgba(0,0,0,.4)", animation: "slideIn .22s ease" }}>
      <style>{`@keyframes slideIn{from{transform:translateX(30px);opacity:.4}to{transform:translateX(0);opacity:1}}`}</style>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, background: T.card || T.s1, zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 900, fontFamily: F.m, color: T.blue, textTransform: "uppercase", letterSpacing: "0.12em" }}>Initiative brief</div>
            <h3 style={{ fontFamily: F.h, fontSize: 18, fontWeight: 800, color: T.ink, margin: "5px 0 0", lineHeight: 1.25 }}>{a.name}</h3>
            <div style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b, marginTop: 3 }}>{a.unit} · {a.category} · {a.lifecycle}</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            <Tag label={a.rec.verdict} color={col(a.rec.color)} bg={col(a.rec.color) + "18"} />
            <button onClick={onClose} aria-label="Close" style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 7, width: 28, height: 28, color: T.ink3, fontSize: 14, cursor: "pointer" }}>✕</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10 }}>
          <Tag label={a.risk + " risk"} color={riskColor(a.risk)} bg={riskColor(a.risk) + "16"} />
          <span style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b }}>{a.rec.why}</span>
        </div>
      </div>
      <div style={{ padding: "18px 20px" }}><InitiativeBrief a={a} role={role} /></div>
    </div>
  </div>;
}
