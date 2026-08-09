"use client";

import { useState } from "react";
import { T, F, AI_GOLD, AI_GOLD_INK, Card } from "./core";
import { mcpRows, mcpStats, MCP_STATUS_META } from "@/lib/mcp-registry";

/* ── shared local primitives (match enforce/roadmap) ── */
const tok = k => ({ crit: T.red, warn: T.amber, info: T.blue, good: T.green, ink3: T.ink3 }[k] || T.ink3);
const cardPad = { padding: 18 };
const Eyebrow = ({ children, style }) => <div style={{ fontSize: 9, letterSpacing: "0.09em", textTransform: "uppercase", color: T.ink4, fontWeight: 900, fontFamily: F.m, ...style }}>{children}</div>;
const H3 = ({ children, style }) => <h3 style={{ fontFamily: F.h, fontSize: 16, fontWeight: 900, color: T.ink, margin: "4px 0 0", ...style }}>{children}</h3>;
const Head = ({ title, sub }) => <div style={{ marginBottom: 16 }}><h2 style={{ fontFamily: F.h, fontSize: 24, fontWeight: 900, color: T.ink, margin: 0, letterSpacing: "-0.02em" }}>{title}</h2><p style={{ fontFamily: F.b, fontSize: 12.5, color: T.ink3, margin: "5px 0 0", maxWidth: 820, lineHeight: 1.6 }}>{sub}</p></div>;
const Pill = ({ c, children }) => <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 9px", borderRadius: 999, fontSize: 10, fontWeight: 800, fontFamily: F.b, color: c, background: c + "18", border: `1px solid ${c}40` }}>{children}</span>;
const Th = ({ children, style }) => <th style={{ textAlign: "left", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: T.ink4, fontWeight: 900, fontFamily: F.m, padding: "0 10px 9px", borderBottom: `1px solid ${T.border}`, ...style }}>{children}</th>;
const Td = ({ children, style }) => <td style={{ padding: "10px", borderBottom: `1px solid ${T.border}`, color: T.ink2, fontSize: 11.5, fontFamily: F.b, verticalAlign: "middle", ...style }}>{children}</td>;
const Kpi = ({ l, v, c, sub }) => <Card style={{ padding: "13px 15px" }}><Eyebrow>{l}</Eyebrow><div style={{ fontSize: 26, fontWeight: 900, color: c, fontFamily: F.m, margin: "5px 0 2px" }}>{v}</div><div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b }}>{sub}</div></Card>;
const kpiGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 14 };
const advisor = children => <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 10, background: AI_GOLD + "12", border: `1px solid ${AI_GOLD}30`, fontSize: 11, color: T.ink2, lineHeight: 1.6, fontFamily: F.b }}><b style={{ color: AI_GOLD_INK }}>Veris Intelligence:</b> {children}</div>;

/* ══════════════ MCP REGISTRY — supply-chain control ══════════════ */
export function McpRegistry({ showToast }) {
  const rows = mcpRows();
  const s = mcpStats();
  const [open, setOpen] = useState(rows.find(r => r.status === "rugpull")?.server.id || null);

  return <div style={{ animation: "up .3s ease" }}>
    <Head title="MCP Registry" sub="Agents reach tools through MCP servers — third-party code that can change under you. The rug-pull: a server you approved silently broadens its manifest after you trusted it, and every agent inherits the new capability without re-approval. The control is provenance, not detection — pin the manifest by hash at approval, require a trusted signature, and refuse any server whose current manifest hash no longer matches the pinned one." />
    <div style={kpiGrid}>
      <Kpi l="MCP servers" v={String(s.total)} c={AI_GOLD} sub="in the estate" />
      <Kpi l="Verified" v={String(s.verified)} c={T.green} sub="signed · pinned · match" />
      <Kpi l="Manifest drift" v={String(s.rugpull)} c={s.rugpull ? T.red : T.green} sub="rug-pull — quarantined" />
      <Kpi l="Unsigned" v={String(s.unsigned)} c={s.unsigned ? T.red : T.green} sub="no trusted signature" />
      <Kpi l="Bindable" v={`${s.bindable}/${s.total}`} c={T.blue} sub={`${s.blocked} blocked from agents`} />
    </div>
    <Card style={cardPad}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <div><Eyebrow>MCP server registry · manifest pinning</Eyebrow><H3>Pinned hash vs current hash</H3></div>
        <button onClick={() => showToast && showToast(s.rugpull ? `${s.rugpull} drifted server quarantined — agents blocked from binding until re-approved` : "All manifests match their pinned hash")} style={{ background: s.rugpull ? T.red : T.s2, border: `1px solid ${s.rugpull ? T.red : T.border}`, borderRadius: 10, padding: "8px 13px", color: s.rugpull ? "#fff" : T.ink2, fontSize: 11.5, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>{s.rugpull ? `Quarantine ${s.rugpull} drifted` : "All manifests verified"}</button>
      </div>
      <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr>{["Server", "Publisher", "Signed", "Pinned hash", "Current hash", "Tools", "Status", ""].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
        <tbody>
          {rows.map(r => { const m = MCP_STATUS_META[r.status]; const isOpen = open === r.server.id; const drift = r.status === "rugpull"; return <>
            <tr key={r.server.id} style={{ cursor: "pointer", background: isOpen ? T.s2 : "transparent" }} onClick={() => setOpen(isOpen ? null : r.server.id)}>
              <Td style={{ fontWeight: 700, color: T.ink }}>{r.server.name}<div style={{ fontSize: 9.5, color: T.ink4, fontFamily: F.m }}>{r.server.transport} · {r.server.endpoint}</div></Td>
              <Td style={{ color: T.ink3 }}>{r.server.publisher}<div style={{ fontSize: 9.5, color: T.ink4 }}>{r.server.trust}</div></Td>
              <Td>{r.server.signed ? <Pill c={T.green}>signed</Pill> : <Pill c={T.red}>unsigned</Pill>}</Td>
              <Td style={{ fontFamily: F.m, color: T.ink4, fontSize: 10 }}>{r.server.pinned ? r.pinnedHash.slice(0, 13) : "—"}</Td>
              <Td style={{ fontFamily: F.m, color: drift ? T.red : T.ink4, fontSize: 10, fontWeight: drift ? 800 : 400 }}>{r.currentHash.slice(0, 13)}</Td>
              <Td>{r.server.currentTools.length}</Td>
              <Td><Pill c={tok(m.tone)}>{m.label}</Pill></Td>
              <Td style={{ color: T.ink4, textAlign: "center" }}>{isOpen ? "▾" : "▸"}</Td>
            </tr>
            {isOpen && <tr key={r.server.id + "-d"}><td colSpan={8} style={{ padding: "0 10px 14px", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ background: T.s2, border: `1px solid ${drift ? T.red + "40" : T.border}`, borderRadius: 10, padding: "13px 15px" }}>
                <div style={{ fontSize: 11, color: T.ink3, fontFamily: F.b, lineHeight: 1.6, marginBottom: 10 }}>{m.desc}</div>
                {(r.added.length || r.removed.length || r.widened.length) ? <div style={{ display: "grid", gap: 6 }}>
                  <Eyebrow>Manifest diff vs pinned</Eyebrow>
                  {r.added.map(n => <div key={"a" + n} style={{ fontSize: 11, fontFamily: F.m, color: T.red }}>+ tool <b>{n}</b> added after approval {n === "post_webhook" || n === "fetch_remote" ? "· egress-capable" : ""}</div>)}
                  {r.widened.map(n => <div key={"w" + n} style={{ fontSize: 11, fontFamily: F.m, color: T.amber }}>~ tool <b>{n}</b> scope widened</div>)}
                  {r.removed.map(n => <div key={"r" + n} style={{ fontSize: 11, fontFamily: F.m, color: T.ink3 }}>− tool <b>{n}</b> removed</div>)}
                </div> : <div style={{ fontSize: 11, fontFamily: F.m, color: T.green }}>✓ Current manifest matches the pinned hash — no drift.</div>}
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  {drift && <button onClick={e => { e.stopPropagation(); showToast && showToast(`${r.server.name} quarantined — agents blocked until the new manifest is reviewed and re-pinned`); }} style={{ background: T.red, border: "none", borderRadius: 9, padding: "7px 13px", color: "#fff", fontSize: 11, fontWeight: 800, fontFamily: F.b, cursor: "pointer" }}>Quarantine server</button>}
                  <button onClick={e => { e.stopPropagation(); showToast && showToast(`Current manifest reviewed and re-pinned for ${r.server.name} — new hash is now the baseline`); }} style={{ background: T.s3, border: `1px solid ${T.border}`, borderRadius: 9, padding: "7px 13px", color: T.ink2, fontSize: 11, fontWeight: 800, fontFamily: F.b, cursor: "pointer" }}>Review &amp; re-pin</button>
                  {!r.server.signed && <button onClick={e => { e.stopPropagation(); showToast && showToast(`${r.server.name} left unsigned — cannot be pinned until a trusted publisher signature is attached`); }} style={{ background: T.s3, border: `1px solid ${T.border}`, borderRadius: 9, padding: "7px 13px", color: T.ink2, fontSize: 11, fontWeight: 800, fontFamily: F.b, cursor: "pointer" }}>Require signature</button>}
                </div>
              </div>
            </td></tr>}
          </>; })}
        </tbody>
      </table></div>
      {advisor(<>Detection is deterministic — a hash comparison, not a classifier — so it survives a more capable model and can’t be talked around. {s.rugpull ? <>Web-Search MCP drifted after approval: a <b>post_webhook</b> (egress) tool appeared and <b>get_page</b> widened to internal scope — the classic rug-pull. It’s quarantined, so no agent can be issued a capability token against those tools, and the event writes to the Tool-Call Ledger.</> : "Every server’s current manifest matches its pinned hash."} Unsigned or unvetted servers ({s.unsigned + s.unvetted}) can’t be pinned until a trusted signature is attached.</>)}
    </Card>
  </div>;
}
