"use client";

/* ── SmartSelect ─────────────────────────────────────────────────
   A governed, permission-aware combobox for every create/edit form.
   Pick from the enterprise vocabulary; if your value isn't there,
   there's always a way in — but who can add is governed:
     • editor (has taxonomy rights) → ＋ Add directly (logged)
     • contributor                  → Request → routed to the owner
     • locked vocabulary            → 🔒 canonical, nobody edits
   Backed by lib/taxonomy. Session adds/requests persist in-memory. */

import { useState, useRef, useEffect } from "react";
import { T, F, AI_GOLD } from "./core";
import { TAXONOMY, canEditTaxonomy, optionsFor, addSessionValue, addPendingValue } from "@/lib/taxonomy";

const CMAP = { green: T.green, blue: T.blue, amber: T.amber, red: T.red, teal: T.teal, violet: T.violet };
const initials = n => n.split(" ").map(x => x[0]).join("").slice(0, 2).toUpperCase();

export function SmartSelect({ vocab, value, onChange, role = "employee", showToast, placeholder }) {
  const cfg = TAXONOMY[vocab] || {};
  const noun = cfg.noun || "value";
  const owner = cfg.owner || "the owner";
  const locked = cfg.mode === "locked";
  const canEdit = canEditTaxonomy(vocab, role);

  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [, force] = useState(0);
  const [sent, setSent] = useState(null); // request confirmation text
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) close(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const options = optionsFor(vocab);
  const q = filter.trim().toLowerCase();
  const typed = filter.trim();
  const matched = options.filter(o => o[0].toLowerCase().includes(q));
  const exact = options.some(o => o[0].toLowerCase() === q);
  const colorOf = v => { const m = options.find(o => o[0] === v); return m && cfg.colored ? CMAP[m[1]] : null; };

  function openMenu() { setSent(null); setOpen(true); setFilter(""); setTimeout(() => inputRef.current && inputRef.current.focus(), 0); }
  function close() { setOpen(false); setFilter(""); }
  function choose(v) { onChange && onChange(v); close(); }
  function doAdd() {
    const nv = typed; if (!nv) { inputRef.current && inputRef.current.focus(); return; }
    addSessionValue(vocab, nv); force(x => x + 1); onChange && onChange(nv);
    showToast && showToast(`Added “${nv}” to ${noun} — logged`); close();
  }
  function doRequest() {
    const nv = typed; if (!nv) { inputRef.current && inputRef.current.focus(); return; }
    addPendingValue(vocab, nv, owner);
    showToast && showToast(`Request sent to ${owner} — “${nv}” pending approval`);
    setSent(`Request sent to ${owner} — “${nv}” is pending approval.`);
    setTimeout(close, 1900);
  }

  const border = open ? AI_GOLD : T.border;
  const ctrl = {
    display: "flex", alignItems: "center", gap: 8, minHeight: 40,
    background: T.s2, border: `1px solid ${border}`, borderRadius: 8, padding: "9px 11px",
    cursor: "pointer", boxShadow: open ? `0 0 0 3px ${AI_GOLD}22` : "none", transition: "border-color .15s",
  };
  const menuStyle = {
    position: "absolute", top: "calc(100% + 5px)", left: 0, right: 0, zIndex: 40,
    background: T.s1, border: `1px solid ${T.border}`, borderRadius: 10, boxShadow: "0 18px 44px -18px #05081c",
    maxHeight: 258, overflowY: "auto",
  };
  const optStyle = { display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", fontSize: 12.5, color: T.ink2, cursor: "pointer" };
  const createStyle = key => ({ ...optStyle, position: "sticky", bottom: 0, background: T.s1, borderTop: `1px solid ${T.border}`, color: key, fontWeight: 700 });
  const plus = bg => ({ width: 18, height: 18, borderRadius: 5, background: bg, display: "grid", placeItems: "center", fontSize: 12, flex: "none" });

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div role="combobox" aria-expanded={open} tabIndex={0} style={ctrl}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={e => { if ((e.key === "Enter" || e.key === " ") && !open) { e.preventDefault(); openMenu(); } if (e.key === "Escape") close(); }}>
        {open ? (
          <input ref={inputRef} value={filter} onChange={e => setFilter(e.target.value)}
            onClick={e => e.stopPropagation()}
            onKeyDown={e => {
              if (e.key === "Escape") close();
              if (e.key === "Enter") {
                e.preventDefault();
                const m = options.find(o => o[0].toLowerCase() === q);
                if (m) choose(m[0]);
                else if (locked) { /* no create */ }
                else if (canEdit) doAdd(); else doRequest();
              }
            }}
            placeholder={locked ? "Filter…" : `Type to filter or ${canEdit ? "add" : "request"}…`}
            style={{ flex: 1, border: "none", background: "transparent", outline: "none", color: T.ink, fontSize: 12.5, fontFamily: F.b, fontWeight: 600, padding: 0 }} />
        ) : (
          <span style={{ flex: 1, fontSize: 13, fontWeight: value ? 600 : 500, color: value ? T.ink : T.ink3, display: "flex", alignItems: "center", gap: 8 }}>
            {value && cfg.colored && colorOf(value) && <span style={{ width: 9, height: 9, borderRadius: 3, background: colorOf(value), flex: "none" }} />}
            {value || placeholder || (locked ? `Choose a ${noun}` : `Choose or ${canEdit ? "add a" : "request a"} ${noun}`)}
          </span>
        )}
        <span style={{ color: T.ink3, fontSize: 10, transform: open ? "rotate(180deg)" : "none", transition: "transform .18s" }}>▾</span>
      </div>

      {open && (
        <div style={menuStyle} onMouseDown={e => e.preventDefault()}>
          {sent ? (
            <div style={{ padding: "13px 14px", fontSize: 12, color: T.ink2, lineHeight: 1.55, display: "flex", gap: 9, alignItems: "flex-start" }}>
              <span style={{ color: T.green, fontWeight: 800 }}>✓</span><span>{sent}</span>
            </div>
          ) : (
            <>
              {matched.map((o, i) => (
                <div key={o[0] + i} style={optStyle} onMouseEnter={e => e.currentTarget.style.background = T.s2} onMouseLeave={e => e.currentTarget.style.background = "transparent"} onClick={() => choose(o[0])}>
                  {cfg.colored ? <span style={{ width: 9, height: 9, borderRadius: 3, background: CMAP[o[1]] || T.ink3, flex: "none" }} />
                    : cfg.person ? <span style={{ width: 22, height: 22, borderRadius: 6, background: T.s3 || T.s2, border: `1px solid ${T.border}`, display: "grid", placeItems: "center", fontSize: 9, fontWeight: 800, fontFamily: F.m, color: T.ink2, flex: "none" }}>{initials(o[0])}</span>
                      : null}
                  <span style={{ color: T.ink }}>{o[0]}</span>
                  {o[1] && !cfg.colored && o[1] !== "new" && <span style={{ marginLeft: "auto", fontSize: 9.5, fontFamily: F.m, color: T.ink4 }}>{o[1]}</span>}
                  {o[1] === "new" && <span style={{ marginLeft: "auto", fontSize: 8.5, fontFamily: F.m, color: T.green, border: `1px solid ${T.green}55`, borderRadius: 20, padding: "1px 7px" }}>added</span>}
                </div>
              ))}
              {typed && !matched.length && <div style={{ padding: "11px 12px", fontSize: 11.5, color: T.ink3 }}>No {noun} matches “{typed}”.{locked ? " These values are fixed." : ""}</div>}

              {locked ? (
                <div style={{ ...createStyle(T.ink3), fontWeight: 600, cursor: "default", background: T.s2 }}>
                  <span style={{ ...plus("transparent"), opacity: .75 }}>🔒</span>
                  <span>Canonical — {cfg.authority}</span>
                  <span style={{ marginLeft: "auto", fontSize: 9.5, fontFamily: F.m, color: T.ink4 }}>not editable</span>
                </div>
              ) : !exact ? (
                canEdit ? (
                  <div style={createStyle(AI_GOLD)} onClick={doAdd}>
                    <span style={plus(AI_GOLD + "22")}>＋</span>
                    <span>{typed ? `Create “${typed}”` : `Add a new ${noun}`}</span>
                    <span style={{ marginLeft: "auto", fontSize: 9.5, fontFamily: F.m, color: T.ink4 }}>adds to taxonomy · logged</span>
                  </div>
                ) : (
                  <div style={createStyle(T.blue)} onClick={doRequest}>
                    <span style={plus(T.blue + "22")}>＋</span>
                    <span>{typed ? `Request “${typed}”` : `Request a new ${noun}`}</span>
                    <span style={{ marginLeft: "auto", fontSize: 9.5, fontFamily: F.m, color: T.ink4 }}>sent to {owner}</span>
                  </div>
                )
              ) : null}
            </>
          )}
        </div>
      )}
    </div>
  );
}
