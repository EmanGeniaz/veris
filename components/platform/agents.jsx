"use client";

import { useState } from "react";
import { readBus, pushBus } from "@/lib/bus";
import { AI_AGENTS, agentStats, capabilityCheck, agentControls, agentPosture, isOverPrivileged } from "@/lib/agent-registry";
import { T, F, AI_GOLD, Tag, Bar, Card, SHead } from "./core";

/* ── AI Agents · least-privilege capability control ─────────────────
   Every agent is a governed object with declared capabilities. The
   registry surfaces over-privilege (the standing-grant failure mode),
   gates high-stakes actions behind human approval, and enforces the
   boundary at call time via capabilityCheck — deny by default. */
export function PageAgentRegistry({ role, showToast }) {
  const posture = agentPosture();
  const [selId, setSelId] = useState(AI_AGENTS[0].id);
  const sel = AI_AGENTS.find((a) => a.id === selId) || AI_AGENTS[0];
  const stats = agentStats(sel);
  const controls = agentControls();
  const [result, setResult] = useState(null);
  const [log, setLog] = useState(() => readBus("vz-agent-log").slice(0, 8));

  const riskColor = (r) => (r === "High" ? T.red : r === "Medium" ? AI_GOLD : T.green);
  const statusOf = (t) => isOverPrivileged(t) ? { label: "Over-privileged", color: T.red }
    : !t.granted ? { label: t.requiresApproval ? "Approval-gated" : "Denied", color: t.requiresApproval ? T.blue : T.ink3 }
    : t.exercised ? { label: "Granted · in use", color: T.green } : { label: "Granted", color: T.green };

  const attempt = (t) => {
    const r = capabilityCheck(sel.id, t.name);
    setResult({ tool: t.name, ...r });
    const entry = { time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }), agent: sel.name, tool: t.name, decision: r.decision, reason: r.reason };
    pushBus("vz-agent-log", entry);
    setLog((l) => [entry, ...l].slice(0, 8));
    /* Every capability decision is evidence — record denials/escalations
       to the same trail the gateway writes to. */
    if (r.decision !== "allow") pushBus("vz-gw-evidence", { item: `Agent capability ${r.decision}: ${sel.name} → ${t.name}`, initiative: sel.initiative, scope: "Agent", control: r.control || "Least-privilege boundary", risk: "Capability governance", owner: sel.owner, status: "Complete", approval: "Auto-captured", version: "v1", time: "Just now" });
    showToast && showToast(`${t.name}: ${r.decision === "allow" ? "allowed" : r.decision === "escalate" ? "escalated to approval" : "denied by least-privilege"}`, r.decision === "allow" ? undefined : "error");
  };

  const kpis = [
    ["Agents governed", posture.agents, T.blue, "registered, owned objects"],
    ["Least-privilege index", posture.index + "%", posture.index >= 80 ? T.green : posture.index >= 60 ? AI_GOLD : T.red, "granted vs exercised, gated"],
    ["Over-privileged", posture.overPrivileged.length, posture.overPrivileged.length ? T.red : T.green, posture.overPrivileged.length ? "standing grants unused" : "none — least privilege holds"],
    ["High-risk gated", `${posture.gatedHigh}/${posture.totalHigh}`, posture.gatedHigh === posture.totalHigh ? T.green : AI_GOLD, "actions behind human approval"],
  ];

  return <div style={{ animation: "up .3s ease" }}>
    <SHead title="AI Agents · Least-Privilege" sub="Every autonomous agent is a governed object with declared capabilities. Over-privilege is flagged, high-stakes actions are gated behind approval, and the boundary is enforced at call time — denied by default." />

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10, marginBottom: 14 }}>
      {kpis.map(([l, v, c, sub]) => <Card key={l} style={{ padding: "12px 14px" }}>
        <div style={{ fontSize: 9, fontWeight: 800, fontFamily: F.m, color: T.ink4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{l}</div>
        <div style={{ fontSize: 24, fontWeight: 900, fontFamily: F.m, color: c, margin: "3px 0 2px" }}>{v}</div>
        <div style={{ fontSize: 9.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.4 }}>{sub}</div>
      </Card>)}
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 14 }}>
      {/* Agent list */}
      <Card style={{ padding: 0, overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "11px 14px", borderBottom: `1px solid ${T.border}`, fontSize: 12, fontWeight: 800, color: T.ink, fontFamily: F.h }}>Governed agents</div>
        {AI_AGENTS.map((a, i) => { const s = agentStats(a); const over = s.overPriv.length > 0; return <button key={a.id} onClick={() => { setSelId(a.id); setResult(null); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", border: "none", borderBottom: i < AI_AGENTS.length - 1 ? `1px solid ${T.border}` : "none", background: sel.id === a.id ? T.s3 : "transparent", borderLeft: `3px solid ${sel.id === a.id ? AI_GOLD : "transparent"}`, cursor: "pointer" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: T.ink, fontFamily: F.b }}>{a.name}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {over && <span title="Over-privileged" style={{ width: 7, height: 7, borderRadius: "50%", background: T.red }} />}
              <span style={{ fontSize: 11, fontWeight: 900, fontFamily: F.m, color: s.score >= 80 ? T.green : s.score >= 60 ? AI_GOLD : T.red }}>{s.score}%</span>
            </span>
          </div>
          <div style={{ fontSize: 9, color: T.ink4, fontFamily: F.m, marginTop: 2 }}>{a.initiative} · {a.unit}</div>
        </button>; })}
      </Card>

      {/* Agent detail: capability matrix + enforcement */}
      <div style={{ display: "grid", gap: 14 }}>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "13px 16px", borderBottom: `1px solid ${T.border}`, background: `linear-gradient(135deg,${AI_GOLD}12,${T.s2})` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: T.ink, fontFamily: F.h }}>{sel.name}</h3>
                <div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b, marginTop: 3 }}>{sel.model} · owner {sel.owner} · {sel.oversight ? "human oversight on" : "no human oversight"}</div>
              </div>
              <span style={{ fontSize: 9.5, fontWeight: 900, fontFamily: F.m, color: stats.leastPrivilegeOk ? T.green : T.red, background: (stats.leastPrivilegeOk ? T.green : T.red) + "1a", border: `1px solid ${(stats.leastPrivilegeOk ? T.green : T.red)}55`, borderRadius: 999, padding: "3px 10px" }}>{stats.leastPrivilegeOk ? "Least privilege holds" : `${stats.overPriv.length} over-privileged`}</span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 9 }}>
              {sel.dataScopes.map((d) => <Tag key={d} label={d} color={T.blue} bg={T.blue + "14"} />)}
            </div>
          </div>
          <div style={{ padding: "12px 16px" }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: T.ink4, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: F.m, marginBottom: 8 }}>Capabilities — click Attempt to test the runtime boundary</div>
            <div style={{ display: "grid", gap: 7 }}>
              {sel.tools.map((t) => { const st = statusOf(t); return <div key={t.name} style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 10, alignItems: "center", background: T.s2, border: `1px solid ${isOverPrivileged(t) ? T.red + "45" : T.border}`, borderRadius: 9, padding: "9px 11px" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: T.ink, fontFamily: F.m }}>{t.name}</div>
                  <div style={{ fontSize: 9.5, color: T.ink3, fontFamily: F.b, marginTop: 1 }}>{t.action} · {t.control}</div>
                </div>
                <Tag label={t.risk} color={riskColor(t.risk)} bg={riskColor(t.risk) + "16"} />
                <span style={{ fontSize: 9, fontWeight: 900, fontFamily: F.m, color: st.color, whiteSpace: "nowrap" }}>{st.label}</span>
                <button onClick={() => attempt(t)} style={{ background: T.s3, border: `1px solid ${T.border}`, borderRadius: 7, padding: "5px 10px", color: T.ink2, fontSize: 9.5, fontWeight: 800, fontFamily: F.b, cursor: "pointer" }}>Attempt →</button>
              </div>; })}
            </div>
            {result && <div style={{ marginTop: 11, background: (result.allowed ? T.green : result.decision === "escalate" ? T.blue : T.red) + "12", border: `1px solid ${(result.allowed ? T.green : result.decision === "escalate" ? T.blue : T.red)}40`, borderRadius: 9, padding: "10px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 900, fontFamily: F.m, color: result.allowed ? T.green : result.decision === "escalate" ? T.blue : T.red, textTransform: "uppercase", letterSpacing: "0.05em" }}>{result.decision === "allow" ? "✓ Allowed" : result.decision === "escalate" ? "⚠ Escalate to approval" : "✕ Denied"}</span>
                <span style={{ fontSize: 10, color: T.ink3, fontFamily: F.m }}>{sel.id} · {result.tool}</span>
              </div>
              <div style={{ fontSize: 10.5, color: T.ink2, fontFamily: F.b, lineHeight: 1.5, marginTop: 5 }}>{result.reason}</div>
            </div>}
          </div>
        </Card>

        {/* NIST agent ↔ ISO 42001 control map */}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}><h3 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: T.ink, fontFamily: F.h }}>NIST autonomous-agent controls ↔ ISO 42001</h3></div>
          <div style={{ padding: "10px 16px", display: "grid", gap: 8 }}>
            {controls.map((c) => { const col = c.status === "Met" ? T.green : c.status === "Partial" ? AI_GOLD : T.red; return <div key={c.id} style={{ display: "grid", gridTemplateColumns: "1.3fr auto", gap: 10, alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: T.ink, fontFamily: F.b }}>{c.control}</div>
                <div style={{ fontSize: 9, color: T.ink4, fontFamily: F.m, marginTop: 1 }}>{c.nist} · {c.iso}</div>
                <div style={{ fontSize: 9.5, color: T.ink3, fontFamily: F.b, marginTop: 2 }}>{c.detail}</div>
              </div>
              <Tag label={c.status} color={col} bg={col + "18"} />
            </div>; })}
          </div>
        </Card>

        {/* Immutable capability decision log */}
        {log.length > 0 && <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}><h3 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: T.ink, fontFamily: F.h }}>Capability decision log</h3><Tag label="Recorded to evidence" color={AI_GOLD} bg={AI_GOLD + "18"} /></div>
          <div style={{ padding: "8px 16px" }}>
            {log.map((e, i) => <div key={i} style={{ fontSize: 10, color: T.ink3, fontFamily: F.b, lineHeight: 1.7, borderBottom: i < log.length - 1 ? `1px solid ${T.border}` : "none", padding: "3px 0" }}>
              <span style={{ color: e.decision === "allow" ? T.green : e.decision === "escalate" ? T.blue : T.red, fontWeight: 800 }}>{e.decision}</span> · {e.agent} → {e.tool} · {e.time}
            </div>)}
          </div>
        </Card>}
      </div>
    </div>
  </div>;
}
