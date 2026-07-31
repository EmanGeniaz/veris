"use client";

import { useEffect } from "react";
import { lineageFor } from "@/lib/lineage";
import { T, F, AI_GOLD, Tag } from "./core";

/* ── Lineage drawer ─────────────────────────────────────────────────
   Opens on any metric: shows its value, how it was computed, and the
   source records that roll into it — each a click away from the full
   initiative. The reusable "drill to the last part" surface. */
export function LineageDrawer({ node, onAsset, onClose }){
  useEffect(() => { const h = e => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [onClose]);
  if (!node) return null;
  const lin = lineageFor(node.label, node.value);
  return <div onMouseDown={onClose} style={{ position: "fixed", inset: 0, zIndex: 1001, background: "rgba(4,7,20,.5)", backdropFilter: "blur(2px)", display: "flex", justifyContent: "flex-end" }}>
    <div onMouseDown={e => e.stopPropagation()} style={{ width: 460, maxWidth: "92vw", height: "100%", overflowY: "auto", background: T.card || T.s1, borderLeft: `1px solid ${T.border}`, boxShadow: "-24px 0 60px rgba(0,0,0,.4)", animation: "slideIn .22s ease" }}>
      <style>{`@keyframes slideIn{from{transform:translateX(30px);opacity:.4}to{transform:translateX(0);opacity:1}}`}</style>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, background: T.card || T.s1, zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 900, fontFamily: F.m, color: T.blue, textTransform: "uppercase", letterSpacing: "0.12em" }}>Data lineage</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.ink, fontFamily: F.b, marginTop: 5 }}>{lin.label}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 7, width: 28, height: 28, color: T.ink3, fontSize: 14, cursor: "pointer", flexShrink: 0 }}>✕</button>
        </div>
        {lin.value && <div style={{ fontSize: 28, fontWeight: 800, color: AI_GOLD, fontFamily: F.m, marginTop: 8 }}>{lin.value}</div>}
      </div>
      <div style={{ padding: "18px 20px" }}>
        <div style={{ fontSize: 9, fontWeight: 900, fontFamily: F.m, color: T.ink4, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>How it's computed</div>
        <div style={{ fontFamily: F.m, fontSize: 12, color: T.ink2, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 9, padding: "10px 12px" }}>{lin.formula}</div>
        <div style={{ fontSize: 11, color: T.ink3, fontFamily: F.b, lineHeight: 1.6, margin: "8px 0 18px" }}>{lin.note}</div>

        <div style={{ fontSize: 9, fontWeight: 900, fontFamily: F.m, color: T.ink4, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Source records — click to drill in</div>
        <div style={{ display: "grid", gap: 6 }}>
          {lin.rows.map((r, i) => <button key={r.id + i} onClick={() => onAsset && onAsset(r.id)} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 10, alignItems: "center", textAlign: "left", background: T.s2, border: `1px solid ${T.border}`, borderRadius: 9, padding: "9px 11px", cursor: "pointer" }}>
            <div style={{ minWidth: 0 }}><div style={{ fontSize: 11.5, fontWeight: 800, color: T.ink, fontFamily: F.b }}>{r.name}</div><div style={{ fontSize: 9.5, color: T.ink4, fontFamily: F.b, marginTop: 1 }}>{r.unit}</div></div>
            <Tag label={String(r.v)} color={T.blue} bg={T.blue + "16"} />
            <span style={{ color: AI_GOLD, fontWeight: 900, fontFamily: F.b, fontSize: 11 }}>→</span>
          </button>)}
        </div>
        <div style={{ marginTop: 16, fontSize: 10, color: T.ink4, fontFamily: F.b, lineHeight: 1.6, display: "flex", gap: 8 }}><span>⛓</span><span>Every value traces to its source records and their evidence — the audit trail behind the number.</span></div>
      </div>
    </div>
  </div>;
}
