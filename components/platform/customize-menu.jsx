"use client";

import { useState } from "react";
import { T, F, AI_GOLD, AI_GOLD_INK } from "./core";

/* Shared "Customize" control — a gear button that opens a popover of one toggle
   per dashboard section, letting the user choose what they see. Presentation
   only: the parent owns the `prefs` map and persists changes (lib/dashboard-prefs).
   `sections` is [{ key, label, desc }]. */
export function CustomizeMenu({ sections, prefs, onToggle, onReset }) {
  const [open, setOpen] = useState(false);
  const shown = sections.filter((s) => prefs[s.key] !== false).length;
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen((o) => !o)} aria-haspopup="true" aria-expanded={open} aria-label="Customize dashboard"
        style={{ display: "flex", alignItems: "center", gap: 6, background: T.s2, border: `1px solid ${open ? AI_GOLD + "66" : T.border}`, borderRadius: 9, padding: "7px 12px", color: T.ink2, fontSize: 10.5, fontWeight: 800, fontFamily: F.b, cursor: "pointer", whiteSpace: "nowrap" }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
        Customize
      </button>
      {open && <>
        <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
        <div role="menu" style={{ position: "absolute", insetInlineEnd: 0, top: "calc(100% + 8px)", zIndex: 41, width: 296, background: T.s1, border: `1px solid ${T.borderB}`, borderRadius: 12, boxShadow: "0 20px 50px rgba(0,0,0,.45)", padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 9.5, fontWeight: 900, color: T.ink4, fontFamily: F.m, textTransform: "uppercase", letterSpacing: "0.1em" }}>Show on my dashboard</span>
            <button onClick={onReset} style={{ background: "transparent", border: "none", color: AI_GOLD_INK, fontSize: 10, fontWeight: 800, fontFamily: F.b, cursor: "pointer", padding: 0 }}>Reset</button>
          </div>
          <div style={{ display: "grid", gap: 4 }}>
            {sections.map((s) => {
              const on = prefs[s.key] !== false;
              return (
                <button key={s.key} role="menuitemcheckbox" aria-checked={on} onClick={() => onToggle(s.key)}
                  style={{ display: "flex", alignItems: "flex-start", gap: 10, background: on ? AI_GOLD + "10" : "transparent", border: `1px solid ${on ? AI_GOLD + "30" : T.border}`, borderRadius: 9, padding: "8px 10px", cursor: "pointer", textAlign: "start", transition: "all .15s" }}>
                  <span style={{ width: 15, height: 15, borderRadius: 4, flexShrink: 0, marginTop: 1, border: `2px solid ${on ? AI_GOLD : T.borderB}`, background: on ? AI_GOLD : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {on && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={AI_GOLD_INK} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: "block", fontSize: 11.5, fontWeight: 800, color: T.ink, fontFamily: F.b }}>{s.label}</span>
                    <span style={{ display: "block", fontSize: 9.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.4, marginTop: 1 }}>{s.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: 9, color: T.ink4, fontFamily: F.m, marginTop: 9, textAlign: "center" }}>{shown} of {sections.length} sections shown · saved to this browser</div>
        </div>
      </>}
    </div>
  );
}
