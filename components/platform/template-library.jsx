"use client";

import { useState } from "react";
import { T, F, AI_GOLD, AI_GOLD_INK, Card, vzDownload } from "./core";
import { pushBus } from "@/lib/bus";
import { TEMPLATE_PACKS, templateLibraryStats, packPosture, _templateFoot } from "@/lib/template-library";

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
    <Head title="Template Library" sub="A repository of governance template packs — ISO/IEC 42001, ISO/IEC 27001, NIST AI RMF and the EU AI Act. Each pack ships ready-to-fill artifacts (policy, Statement of Applicability, control checklist, impact assessment, RACI) that generate pre-filled from your live control set — never blank. Every generated document downloads as a real file and mints an evidence event." />
    <div style={kpiGrid}>
      <Kpi l="Framework packs" v={String(stats.packs)} c={AI_GOLD} sub="ISO 42001 · 27001 · NIST · EU AI Act" />
      <Kpi l="Templates" v={String(stats.artifacts)} c={T.blue} sub="policies · SoA · checklists · assessments" />
      <Kpi l="Artifact types" v={String(stats.kinds.length)} c={T.violet} sub={stats.kinds.join(" · ")} />
      <Kpi l="Output" v="Markdown" c={T.green} sub="real file · evidence on generate" />
    </div>

    {/* pack chooser */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,250px),1fr))", gap: 12, marginBottom: 14 }}>
      {TEMPLATE_PACKS.map(p => {
        const pp = packPosture(p.id); const active = p.id === openId; const c = tok(p.accent);
        return <button key={p.id} onClick={() => setOpenId(p.id)} style={{ textAlign: "left", cursor: "pointer", background: active ? c + "0e" : T.card, border: `1px solid ${active ? c + "66" : T.border}`, borderRadius: 12, padding: 15 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 9.5, fontWeight: 900, fontFamily: F.m, color: c, textTransform: "uppercase", letterSpacing: "0.06em" }}>{p.framework}</span>
            <Pill c={statusTone(pp.status)}>{pp.status}{pp.score ? ` · ${pp.score}` : ""}</Pill>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: T.ink, fontFamily: F.h, marginBottom: 5 }}>{p.name}</div>
          <p style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.5, margin: 0 }}>{p.blurb}</p>
          <div style={{ marginTop: 9, fontSize: 10, color: T.ink4, fontFamily: F.m, fontWeight: 700 }}>{p.artifacts.length} templates</div>
        </button>;
      })}
    </div>

    {/* selected pack contents */}
    <Card style={cardPad}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <div><Eyebrow>{pack.framework} · what's inside</Eyebrow><H3 style={{ marginBottom: 0 }}>{pack.name}</H3></div>
        <button onClick={() => genPack(pack)} style={{ background: AI_GOLD, border: "none", borderRadius: 10, padding: "10px 16px", color: "#0b0e24", fontSize: 12, fontWeight: 800, fontFamily: F.b, cursor: "pointer" }}>✦ Generate full pack</button>
      </div>
      <div style={{ display: "grid", gap: 9 }}>
        {pack.artifacts.map(a => <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, background: T.s2, border: `1px solid ${T.border}` }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: T.ink, fontFamily: F.b }}>{a.name}</div>
            <div style={{ fontSize: 10, color: T.ink4, fontFamily: F.m, marginTop: 2 }}>{a.kind}</div>
          </div>
          <Pill c={tok(pack.accent)}>{a.kind}</Pill>
          <button onClick={() => gen(pack, a)} style={{ flexShrink: 0, background: T.card, border: `1px solid ${T.borderB}`, borderRadius: 8, padding: "7px 13px", color: T.ink2, fontSize: 11, fontWeight: 800, fontFamily: F.b, cursor: "pointer" }}>Generate ↓</button>
        </div>)}
      </div>
      {advisor(<>Each template generates <b>pre-filled from your live control set</b> — the ISO 42001 Statement of Applicability pulls the {pack.framework === "ISO/IEC 42001" ? "actual Annex A controls and their status" : "canonical control library"}, so the document reflects real posture, not placeholder text. Generating one records governance evidence automatically, so building the artifact and evidencing it are the same action.</>)}
    </Card>
  </div>;
}
