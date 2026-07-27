"use client";

/* ── Command Palette (⌘K / Ctrl-K) ───────────────────────────────
   One cognitive entry point to the whole platform: every enterprise
   object and every surface, reachable by keyboard from anywhere. Unlike
   the header search (objects only), the palette also understands
   *intent* — it surfaces commands ("Register a model", "Go to Risk
   Center", "Toggle theme"), ranks by relevance, remembers recents, and
   is fully keyboard-driven. It resolves object destinations through the
   same Navigation Registry the rest of the app uses, so nothing here
   invents a route. */

import { useState, useEffect, useRef, useMemo } from "react";
import { T, F, AI_GOLD, MODEL_REGISTRY, TEMPLATES, ROLES } from "./core";
import { acInitiatives, riskRegister, knowledgeAssets } from "@/lib/platform-models";

const RECENT_KEY = "vz-palette-recent";

/* Navigation commands — canonical surfaces, resolved via the shell's
   setTab/setAiCentralView so the palette never hard-codes a route twice. */
const surfaceCommands = a => [
  ["Overview", "Your command center home", () => a.setTab("home")],
  ["AI Central", "Portfolio command center", () => { a.setAiCentralView("dashboard"); a.setTab("aicentral"); }],
  ["AI Model Registry", "Every model in business context", () => { a.setAiCentralView("repository"); a.setTab("aicentral"); }],
  ["Trust & Evidence", "Evidence repository & packages", () => { a.setAiCentralView("evidence"); a.setTab("aicentral"); }],
  ["AI Governance", "Controls, policies & posture", () => { a.setAiCentralView("governance"); a.setTab("aicentral"); }],
  ["Risk Center", "The AI risk register", () => a.setTab("riskcenter")],
  ["Policies", "Policy register & reviews", () => a.setTab("policies")],
  ["Compliance & Standards", "Frameworks & control library", () => a.setTab("compliance")],
  ["Reports", "Value analytics & board packs", () => a.setTab("reports")],
  ["Governance Academy", "Learning & maturity", () => a.setTab("academy")],
  ["Decisions & Approvals", "Everything awaiting you", () => a.setTab("decisions")],
  ["Knowledge", "The intelligent repository", () => a.setTab("knowledge")],
];

export function CommandPalette({ open, onClose, actions, role = "caio", theme = "dark" }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState([]);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const R = ROLES[role] || ROLES.caio;

  useEffect(() => {
    if (!open) return;
    setQ(""); setActive(0);
    try { setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) || "[]")); } catch { setRecent([]); }
    const t = setTimeout(() => inputRef.current && inputRef.current.focus(), 20);
    return () => clearTimeout(t);
  }, [open]);

  /* The full command + object index, built once from the enterprise data. */
  const index = useMemo(() => {
    const a = actions;
    const cmds = [
      { group: "Command", type: "Action", label: "Register an AI model", sub: "Open the model registry to add one", kw: "new create add model register",
        go: () => { a.setAiCentralView("repository"); a.setTab("aicentral"); } },
      { group: "Command", type: "Action", label: "New AI Initiative", sub: "Start a governed initiative", kw: "new create initiative project",
        go: () => { a.setInitToOpen && a.setInitToOpen(null); a.setAiCentralView("initiatives"); a.setTab("aicentral"); } },
      { group: "Command", type: "Action", label: "Register a risk", sub: "Add to the risk register", kw: "new create risk register",
        go: () => a.setTab("riskcenter") },
      { group: "Command", type: "Action", label: "New policy", sub: "Draft a governance policy", kw: "new create policy draft",
        go: () => a.setTab("policies") },
      { group: "Command", type: "Action", label: `Switch to ${theme === "dark" ? "light" : "dark"} theme`, sub: "Toggle appearance", kw: "theme dark light appearance toggle",
        go: () => a.setTheme && a.setTheme(theme === "dark" ? "light" : "dark") },
      { group: "Command", type: "Action", label: "Open Approvals inbox", sub: "Decisions & taxonomy requests", kw: "approvals inbox decisions requests taxonomy",
        go: () => a.setTab("decisions") },
    ];
    const nav = surfaceCommands(a).map(([label, sub, go]) => ({ group: "Go to", type: "Surface", label, sub, kw: label + " " + sub, go }));
    const objs = [
      ...acInitiatives.map(i => ({ group: "Initiatives", type: "Initiative", label: i.name, sub: `${i.unit} · ${i.lifecycle}`, kw: `${i.name} ${i.unit} ${i.sponsor} ${i.businessOwner}`, go: () => a.navigate("initiative", { id: i.id }) })),
      ...MODEL_REGISTRY.map(m => ({ group: "AI Models", type: "AI Model", label: m.bizName, sub: `${m.name} · ${m.vendor}`, kw: `${m.bizName} ${m.name} ${m.vendor} ${m.type}`, go: () => a.navigate("model", { id: m.id }) })),
      ...riskRegister.map(r => ({ group: "Risks", type: "Risk", label: `${r.id} ${r.title}`, sub: `${r.level} · ${r.system}`, kw: `${r.id} ${r.title} ${r.category} ${r.execOwner}`, go: () => a.navigate("risk", { id: r.id }) })),
      ...[...new Set(acInitiatives.flatMap(i => i.policies || []))].map(p => ({ group: "Policies", type: "Policy", label: p, sub: "Policy register", kw: p, go: () => a.navigate("policy", { id: p }) })),
      ...[...new Set(acInitiatives.flatMap(i => i.controls || []))].map(c => ({ group: "Controls", type: "Control", label: c, sub: "Control library", kw: c, go: () => a.navigate("control", { id: c }) })),
      ...[...new Map(acInitiatives.flatMap(i => [["Executive sponsor", i.sponsor, i], ["Business owner", i.businessOwner, i], ["AI champion", i.champion, i]]).filter(([, n]) => n).map(([role2, n, i]) => [n, { group: "People", type: "Person", label: n, sub: `${role2} · ${i.name}`, kw: n, go: () => a.navigate("person", { initiativeId: i.id }) }])).values()],
      ...knowledgeAssets.map(k => ({ group: "Knowledge", type: "Knowledge", label: k.title, sub: k.kind, kw: `${k.title} ${k.kind}`, go: () => a.navigate("knowledge", { id: k.id }) })),
      ...TEMPLATES.map(t => ({ group: "Templates", type: "Template", label: t.name, sub: t.cat, kw: `${t.name} ${t.cat}`, go: () => a.navigate("template", { id: t.id }) })),
    ];
    return [...cmds, ...nav, ...objs];
  }, [actions, theme]);

  const query = q.trim().toLowerCase();
  const results = useMemo(() => {
    if (!query) {
      /* Empty state: recents first, then commands and top surfaces. */
      const rec = recent.map(lbl => index.find(e => e.label === lbl)).filter(Boolean).map(e => ({ ...e, group: "Recent" }));
      const base = index.filter(e => e.group === "Command" || e.group === "Go to");
      return [...rec, ...base].slice(0, 24);
    }
    const scored = index.map(e => {
      const hay = `${e.label} ${e.sub} ${e.kw}`.toLowerCase();
      if (!hay.includes(query)) return null;
      let s = 0;
      if (e.label.toLowerCase().startsWith(query)) s += 100;
      else if (e.label.toLowerCase().includes(query)) s += 60;
      if (e.group === "Command") s += 25; if (e.group === "Go to") s += 12;
      return { e, s };
    }).filter(Boolean).sort((a, b) => b.s - a.s).slice(0, 40).map(x => x.e);
    return scored;
  }, [query, index, recent]);

  useEffect(() => { setActive(0); }, [query]);
  useEffect(() => {
    const el = listRef.current && listRef.current.querySelector(`[data-idx="${active}"]`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [active]);

  const run = e => {
    if (!e) return;
    try { const next = [e.label, ...recent.filter(l => l !== e.label)].slice(0, 6); localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    onClose(); e.go();
  };

  if (!open) return null;

  /* Group the flat result list for display while keeping a global index
     for keyboard navigation. */
  const groups = [];
  results.forEach((e, i) => {
    let g = groups.find(x => x.name === e.group);
    if (!g) { g = { name: e.group, items: [] }; groups.push(g); }
    g.items.push({ ...e, idx: i });
  });

  const chip = { fontSize: 8, fontWeight: 900, fontFamily: F.m, color: AI_GOLD, textTransform: "uppercase", letterSpacing: "0.08em", width: 66, flexShrink: 0 };

  return (
    <div onMouseDown={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(4,7,20,.55)", backdropFilter: "blur(3px)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "12vh 16px 16px" }}>
      <div onMouseDown={e => e.stopPropagation()} onKeyDown={e => {
        if (e.key === "Escape") { e.preventDefault(); onClose(); }
        else if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)); }
        else if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
        else if (e.key === "Enter") { e.preventDefault(); run(results[active]); }
      }} style={{ width: "100%", maxWidth: 620, background: T.card || T.s1, border: `1px solid ${AI_GOLD}35`, borderRadius: 14, boxShadow: "0 32px 80px rgba(0,0,0,.6)", overflow: "hidden", animation: "up .18s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", borderBottom: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 13, color: AI_GOLD, fontWeight: 900 }}>⌘K</span>
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Search initiatives, models, risks, policies, people — or type a command…"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: T.ink, fontSize: 14, fontFamily: F.b, fontWeight: 600 }} />
          <span style={{ fontSize: 9, color: T.ink4, fontFamily: F.m, border: `1px solid ${T.border}`, borderRadius: 5, padding: "2px 6px" }}>esc</span>
        </div>
        <div ref={listRef} style={{ maxHeight: "52vh", overflowY: "auto", padding: 6 }}>
          {results.length === 0 && <div style={{ padding: "22px 16px", fontSize: 12, color: T.ink3, fontFamily: F.b, textAlign: "center" }}>No matches for “{q}”. Try an initiative, a model, a person, or a command like “risk”.</div>}
          {groups.map(g => (
            <div key={g.name} style={{ marginBottom: 4 }}>
              <div style={{ fontSize: 8.5, fontWeight: 900, fontFamily: F.m, color: T.ink4, textTransform: "uppercase", letterSpacing: "0.1em", padding: "8px 10px 4px" }}>{g.name}</div>
              {g.items.map(e => {
                const on = e.idx === active;
                return <button key={e.idx} data-idx={e.idx} onMouseEnter={() => setActive(e.idx)} onClick={() => run(e)}
                  style={{ width: "100%", display: "flex", gap: 10, alignItems: "center", background: on ? AI_GOLD + "16" : "transparent", border: on ? `1px solid ${AI_GOLD}40` : "1px solid transparent", borderRadius: 9, padding: "8px 10px", cursor: "pointer", textAlign: "left" }}>
                  <span style={chip}>{e.type}</span>
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: T.ink, fontFamily: F.b, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.label}</span>
                    <span style={{ display: "block", fontSize: 9.5, color: T.ink4, fontFamily: F.b, marginTop: 1 }}>{e.sub}</span>
                  </span>
                  {on && <span style={{ fontSize: 9, color: AI_GOLD, fontFamily: F.m, fontWeight: 800, flexShrink: 0 }}>↵</span>}
                </button>;
              })}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center", padding: "9px 16px", borderTop: `1px solid ${T.border}`, background: theme === "light" ? T.s2 : T.bg }}>
          {[["↑↓", "navigate"], ["↵", "open"], ["esc", "close"]].map(([k, l]) => <span key={l} style={{ fontSize: 9.5, color: T.ink4, fontFamily: F.b, display: "flex", gap: 5, alignItems: "center" }}>
            <span style={{ fontFamily: F.m, fontWeight: 800, color: T.ink3, border: `1px solid ${T.border}`, borderRadius: 4, padding: "1px 5px" }}>{k}</span>{l}
          </span>)}
          <span style={{ marginLeft: "auto", fontSize: 9.5, color: T.ink4, fontFamily: F.b }}>{results.length} result{results.length === 1 ? "" : "s"} · {R.label} view</span>
        </div>
      </div>
    </div>
  );
}
