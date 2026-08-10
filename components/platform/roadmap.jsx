"use client";

import { useState, useEffect } from "react";
import { T, F, AI_GOLD, AI_GOLD_INK, Card } from "./core";
import { driftRows, driftStats, DRIFT_META } from "@/lib/drift";
import { workflowRows, workflowStats, WF_DECISION_META } from "@/lib/agent-workflows";
import { orchestrationRows, workflowCompositionRows, compositionStats, DELEG_DECISION_META, toolMeta } from "@/lib/agent-composition";
import { INFERENCE_EVENTS, INF_DECISION_META, inferenceStats, INFERENCE_FIELDS, eventTokens } from "@/lib/inference-log";

/* ── shared local primitives ── */
const tok = k => ({ crit: T.red, warn: T.amber, info: T.blue, good: T.green, ink3: T.ink3 }[k] || T.ink3);
const cardPad = { padding: 18 };
const Eyebrow = ({ children, style }) => <div style={{ fontSize: 9, letterSpacing: "0.09em", textTransform: "uppercase", color: T.ink4, fontWeight: 900, fontFamily: F.m, ...style }}>{children}</div>;
const H3 = ({ children, style }) => <h3 style={{ fontFamily: F.h, fontSize: 16, fontWeight: 900, color: T.ink, margin: "4px 0 0", ...style }}>{children}</h3>;
const Head = ({ title, sub }) => <div style={{ marginBottom: 16 }}><h2 style={{ fontFamily: F.h, fontSize: 24, fontWeight: 900, color: T.ink, margin: 0, letterSpacing: "-0.02em" }}>{title}</h2><p style={{ fontFamily: F.b, fontSize: 12.5, color: T.ink3, margin: "5px 0 0", maxWidth: 780, lineHeight: 1.6 }}>{sub}</p></div>;
const Pill = ({ c, children }) => <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 9px", borderRadius: 999, fontSize: 10, fontWeight: 800, fontFamily: F.b, color: c, background: c + "18", border: `1px solid ${c}40` }}>{children}</span>;
const Th = ({ children, style }) => <th style={{ textAlign: "left", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: T.ink4, fontWeight: 900, fontFamily: F.m, padding: "0 10px 9px", borderBottom: `1px solid ${T.border}`, ...style }}>{children}</th>;
const Td = ({ children, style }) => <td style={{ padding: "10px", borderBottom: `1px solid ${T.border}`, color: T.ink2, fontSize: 11.5, fontFamily: F.b, verticalAlign: "middle", ...style }}>{children}</td>;
const Table = ({ head, children }) => <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr>{head.map(h => <Th key={h}>{h}</Th>)}</tr></thead><tbody>{children}</tbody></table></div>;
const Kpi = ({ l, v, c, sub }) => <Card style={{ padding: "13px 15px" }}><Eyebrow>{l}</Eyebrow><div style={{ fontSize: 26, fontWeight: 900, color: c, fontFamily: F.m, margin: "5px 0 2px" }}>{v}</div><div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b }}>{sub}</div></Card>;
const kpiGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 14 };
const advisor = children => <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 10, background: AI_GOLD + "12", border: `1px solid ${AI_GOLD}30`, fontSize: 11, color: T.ink2, lineHeight: 1.6, fontFamily: F.b }}><b style={{ color: AI_GOLD_INK }}>Veris Intelligence:</b> {children}</div>;

/* ══════════════ DRIFT MONITOR ══════════════ */
export function DriftMonitor({ showToast }) {
  const rows = driftRows();
  const s = driftStats();
  return <div style={{ animation: "up .3s ease" }}>
    <Head title="Drift Monitor" sub="Automated behavioural-shift detection. A Population Stability Index (PSI) is computed per production model from a baseline vs current feature distribution — the standard signal for drift when the data or the underlying model changes. Bands: < 0.10 stable · 0.10–0.25 warning · > 0.25 drift. Maps to EU AI Act Art.72 post-market monitoring." />
    <div style={kpiGrid}>
      <Kpi l="Models monitored" v={String(s.total)} c={AI_GOLD} sub={`${s.coverage}% of production`} />
      <Kpi l="Stable" v={String(s.stable)} c={T.green} sub="within envelope" />
      <Kpi l="Warning" v={String(s.warning)} c={T.amber} sub="watch — re-validate soon" />
      <Kpi l="Drift" v={String(s.drift)} c={T.red} sub="breached — action now" />
    </div>
    <Card style={cardPad}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <div><Eyebrow>Per-model drift · computed PSI</Eyebrow><H3>Baseline vs current distribution</H3></div>
        <button onClick={() => showToast && showToast(`${s.drift} model in drift routed to Model Risk — re-validation opened`)} style={{ background: s.drift ? T.red : T.s2, border: `1px solid ${s.drift ? T.red : T.border}`, borderRadius: 10, padding: "8px 13px", color: s.drift ? "#fff" : T.ink2, fontSize: 11.5, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>{s.drift ? `Route ${s.drift} to Model Risk` : "All within envelope"}</button>
      </div>
      <Table head={["Model", "Monitored feature", "PSI", "Status", "Owner", "Action"]}>
        {rows.map(r => { const m = DRIFT_META[r.band]; return <tr key={r.id}>
          <Td style={{ fontWeight: 700, color: T.ink }}>{r.model}</Td>
          <Td style={{ fontFamily: F.m, color: T.ink3 }}>{r.feature}</Td>
          <Td style={{ fontFamily: F.m, fontWeight: 800, color: tok(m.tone) }}>{r.psi.toFixed(3)}</Td>
          <Td><Pill c={tok(m.tone)}>{m.label}</Pill></Td>
          <Td>{r.owner}</Td>
          <Td style={{ color: T.ink3 }}>{r.band === "drift" ? "Re-validate + re-tier risk" : r.band === "warning" ? "Monitor next window" : "No action"}</Td>
        </tr>; })}
      </Table>
      {advisor(<>PSI is computed live from each model’s distribution, not asserted — feed real telemetry and it recomputes. The Fraud Detection Model breached the envelope (PSI {rows.find(r => r.band === "drift")?.psi.toFixed(2)}), which is the same signal behind incident INC-1039; drift routes to Model Risk for re-validation under Art.72.</>)}
    </Card>
  </div>;
}

/* ══════════════ WORKFLOW PERMISSIONS ══════════════ */
const SectionLabel = ({ eye, title, sub }) => <div style={{ margin: "22px 0 12px" }}>
  <Eyebrow style={{ color: AI_GOLD_INK }}>{eye}</Eyebrow>
  <h3 style={{ fontFamily: F.h, fontSize: 18, fontWeight: 900, color: T.ink, margin: "3px 0 0", letterSpacing: "-0.01em" }}>{title}</h3>
  <p style={{ fontFamily: F.b, fontSize: 11.5, color: T.ink3, margin: "4px 0 0", maxWidth: 820, lineHeight: 1.6 }}>{sub}</p>
</div>;

export function WorkflowPermissions({ showToast }) {
  const rows = workflowRows();
  const s = workflowStats();
  const orc = orchestrationRows();
  const wfComp = workflowCompositionRows();
  const cs = compositionStats();
  return <div style={{ animation: "up .3s ease" }}>
    <Head title="Agent Chain Permissions" sub="Least privilege across multi-agent chains — at three altitudes. (1) Per step: every step is re-checked against that agent’s own capabilities (deny-by-default), so an agent can’t gain a capability by being placed in a chain. (2) Per delegation: a sub-agent runs with the intersection of its grants and the orchestrator’s mandate — min(orchestrator, sub-agent) — so an orchestrator can borrow a capability but never widen its own data reach. (3) Per composition: taint analysis across the whole chain catches emergent data paths where individually-allowed steps compose into an exfiltration route." />
    <div style={kpiGrid}>
      <Kpi l="Chains analysed" v={String(cs.chainsAnalysed)} c={AI_GOLD} sub="workflows + orchestrations" />
      <Kpi l="Escalation blocked" v={String(s.blocked)} c={T.red} sub="per-step privilege escalation" />
      <Kpi l="Scope-widening blocked" v={String(cs.widened)} c={T.red} sub="delegation boundary" />
      <Kpi l="Emergent paths caught" v={String(cs.emergentPaths)} c={T.amber} sub="compositional exfil routes" />
    </div>

    <SectionLabel eye="Altitude 1 · per step" title="Workflow permissions" sub="Authored chains. Each step is re-checked against the agent’s own grant; a step invoking a tool the agent doesn’t hold is blocked as privilege escalation, and high-stakes steps escalate to a human." />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 14, alignItems: "start" }}>
      {rows.map(w => <Card key={w.id} style={cardPad}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
          <div><Eyebrow>{w.owner} · trigger: {w.trigger}</Eyebrow><H3>{w.name}</H3></div>
          <Pill c={w.safe ? T.green : T.red}>{w.safe ? "Least-privilege holds" : `${w.blocked} escalation blocked`}</Pill>
        </div>
        <div style={{ display: "grid", gap: 7 }}>
          {w.steps.map((st, i) => { const m = WF_DECISION_META[st.decision]; return <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", background: T.s2, border: `1px solid ${st.decision === "deny" ? T.red + "55" : T.border}`, borderRadius: 9, padding: "8px 11px" }}>
            <span style={{ minWidth: 18, fontSize: 10, fontWeight: 900, color: T.ink4, fontFamily: F.m }}>{i + 1}</span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.ink, fontFamily: F.b }}>{st.agent} <span style={{ color: T.ink4 }}>·</span> <span style={{ fontFamily: F.m }}>{st.tool}</span>{st.handoff && <span style={{ marginLeft: 6, fontSize: 9, color: AI_GOLD_INK, fontWeight: 800 }}>⇥ handoff</span>}</div>
              <div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b }}>{st.note}</div>
            </div>
            <Pill c={tok(m.tone)}>{m.label}</Pill>
          </div>; })}
        </div>
      </Card>)}
    </div>

    <SectionLabel eye="Altitude 2 · per delegation" title="Orchestrator delegation" sub="An orchestrator delegates to sub-agents at runtime. Deny-by-default applies to the delegation, not just the agent: a sub-agent runs with min(orchestrator mandate, sub-agent grant). A delegation whose data scope lies outside the orchestrator’s mandate is scope-widening — blocked even though the sub-agent legitimately holds the tool." />
    <div style={{ display: "grid", gap: 14 }}>
      {orc.map(o => <Card key={o.id} style={cardPad}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 4 }}>
          <div><Eyebrow>{o.owner} · trigger: {o.trigger}</Eyebrow><H3>{o.name}</H3></div>
          <Pill c={o.safe ? T.green : T.red}>{o.widened ? `${o.widened} scope-widening blocked` : o.risks.length ? `${o.risks.length} emergent path` : "Delegation holds"}</Pill>
        </div>
        <div style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b, marginBottom: 10 }}>Orchestrator <b style={{ color: T.ink2 }}>{o.orchestratorName}</b> · mandate: <span style={{ fontFamily: F.m }}>{o.mandate.join(" · ")}</span></div>
        <div style={{ display: "grid", gap: 7 }}>
          {o.delegations.map((d, i) => { const m = DELEG_DECISION_META[d.decision]; const bad = d.decision === "widen" || d.decision === "deny"; return <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", background: T.s2, border: `1px solid ${bad ? T.red + "55" : T.border}`, borderRadius: 9, padding: "8px 11px" }}>
            <span style={{ minWidth: 18, fontSize: 10, fontWeight: 900, color: T.ink4, fontFamily: F.m }}>{i + 1}</span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.ink, fontFamily: F.b }}>⇒ {d.to} <span style={{ color: T.ink4 }}>·</span> <span style={{ fontFamily: F.m }}>{d.tool}</span>{d.handoff && <span style={{ marginLeft: 6, fontSize: 9, color: AI_GOLD_INK, fontWeight: 800 }}>⇥ delegated</span>}</div>
              <div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b }}>{d.note} <span style={{ color: T.ink4 }}>· scope {d.scope} → effective {d.effective}</span></div>
            </div>
            <Pill c={tok(m.tone)}>{m.label}</Pill>
          </div>; })}
        </div>
        {o.widened ? <div style={{ marginTop: 9, fontSize: 10.5, color: T.ink2, fontFamily: F.b, lineHeight: 1.55, background: T.red + "12", border: `1px solid ${T.red}33`, borderRadius: 9, padding: "9px 11px" }}>{o.delegations.find(d => d.decision === "widen")?.reason}</div> : null}
      </Card>)}
    </div>

    <SectionLabel eye="Altitude 3 · per composition" title="Compositional risk" sub="Taint analysis across the whole chain. A step that reads sensitive data taints the chain; a mask or human gate clears it; an egress sink reached while tainted — with every step individually allowed — is an emergent exfiltration path per-step least privilege can’t see." />
    <Card style={cardPad}>
      {(() => {
        const paths = [
          ...orc.flatMap(o => o.risks.map(r => ({ chain: o.name, kind: "Orchestration", ...r }))),
          ...wfComp.flatMap(w => w.risks.map(r => ({ chain: w.name, kind: "Workflow", ...r }))),
        ];
        if (!paths.length) return <div style={{ fontSize: 12, color: T.ink3, fontFamily: F.b }}>No emergent paths across the analysed chains.</div>;
        return <div style={{ display: "grid", gap: 10 }}>
          {paths.map((p, i) => <div key={i} style={{ background: T.s2, border: `1px solid ${T.amber}55`, borderRadius: 10, padding: "11px 13px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 5 }}>
              <div style={{ fontSize: 11.5, fontWeight: 900, color: T.ink, fontFamily: F.m }}>{p.path}</div>
              <Pill c={T.amber}>Emergent exfil path · {p.chain}</Pill>
            </div>
            <div style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.55 }}>{p.detail}</div>
            <div style={{ fontSize: 10, color: T.ink4, fontFamily: F.b, marginTop: 5 }}>Remediation: insert a mask on the source or a human gate before the sink — then the path is contained without removing either capability.</div>
          </div>)}
        </div>;
      })()}
    </Card>

    <Card style={{ ...cardPad, marginTop: 14 }}>
      {advisor(<>Three altitudes, one guarantee. Per step, the Credit workflow’s attempt to route <span style={{ fontFamily: F.m }}>issue_decision</span> through an agent that doesn’t hold it is <b style={{ color: T.red }}>blocked</b>. Per delegation, the Adjudication orchestrator’s attempt to pull <span style={{ fontFamily: F.m }}>read_hris_full</span> — a capability the sub-agent holds but whose <b>HRIS</b> scope is outside the orchestrator’s mandate — is <b style={{ color: T.red }}>blocked as scope-widening</b>. Per composition, the Resolution orchestrator’s doc-summariser can read sensitive documents and reach the open web in one context — an <b style={{ color: T.amber }}>emergent exfil path</b> every step passes individually — flagged for a mask or gate. {cs.emergentPaths} emergent path{cs.emergentPaths === 1 ? "" : "s"} and {cs.widened} scope-widening delegation{cs.widened === 1 ? "" : "s"} caught across {cs.chainsAnalysed} chains.</>)}
      <div style={{ marginTop: 12 }}><button onClick={() => showToast && showToast("Agent-chain permission report exported to Trust & Evidence (per-step, delegation & compositional)")} style={{ background: AI_GOLD, border: "none", borderRadius: 10, padding: "9px 15px", color: "#241703", fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>Export permission report</button></div>
    </Card>
  </div>;
}

/* ══════════════ ARTICLE 12 — INFERENCE LOG ══════════════ */
export function Article12Log({ showToast }) {
  const [live, setLive] = useState(null);
  useEffect(() => {
    let on = true;
    fetch("/api/inference-log?tenant=demo").then(r => r.json()).then(d => { if (on && d.enabled && Array.isArray(d.events) && d.events.length) setLive({ events: d.events, intact: d.chainIntact }); }).catch(() => {});
    return () => { on = false; };
  }, []);
  const isLive = !!live;
  const events = isLive ? live.events : INFERENCE_EVENTS;
  const s = inferenceStats(events, isLive ? live.intact : undefined);
  const shortTime = ts => (String(ts).split(" ")[1] || String(ts)).replace("Z", "");
  return <div style={{ animation: "up .3s ease" }}>
    <Head title="Article 12 Log" sub="EU AI Act Art.12 automatic record-keeping. Every gateway inference emits a structured, machine-readable event appended to the tamper-evident audit hash chain (SHA-256): what ran, when, the policy decision, data class, tokens and a hash that cannot change without breaking every later row. This is the record a regulator reads — not a dashboard screenshot." />
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
      <Pill c={isLive ? T.green : T.ink3}>{isLive ? "● Live · read from your audit chain" : "Sample · connect a database for live rows"}</Pill>
    </div>
    <div style={kpiGrid}>
      <Kpi l="Events logged" v={String(s.total)} c={AI_GOLD} sub={isLive ? "from your database" : "sample window"} />
      <Kpi l="Blocked" v={String(s.blocked)} c={T.red} sub="policy / least-privilege" />
      <Kpi l="Masked" v={String(s.masked)} c={T.blue} sub="PII redacted at ingress" />
      <Kpi l="Hash chain" v={s.intact ? "Intact" : "Broken"} c={s.intact ? T.green : T.red} sub={isLive ? "verified over full chain" : "tamper-evident"} />
    </div>
    <Card style={cardPad}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <div><Eyebrow>Per-inference record · one row per call</Eyebrow><H3>Structured, machine-readable, hash-chained</H3></div>
        <button onClick={() => showToast && showToast("Art.12 inference log exported (JSON + hash chain) for the audit file")} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 13px", color: T.ink2, fontSize: 11.5, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>Export log</button>
      </div>
      <Table head={["Time (UTC)", "Model", "Agent · tool", "Decision", "Data class", "Tokens", "prev → hash"]}>
        {events.map(e => { const m = INF_DECISION_META[e.decision] || { label: e.decision, tone: "ink3" }; return <tr key={e.id}>
          <Td style={{ fontFamily: F.m, color: T.ink3, whiteSpace: "nowrap" }}>{shortTime(e.ts)}</Td>
          <Td style={{ fontFamily: F.m, color: T.ink3 }}>{e.model}</Td>
          <Td style={{ fontWeight: 700, color: T.ink }}>{e.agent}<div style={{ fontSize: 9.5, color: T.ink4, fontFamily: F.m }}>{e.tool}</div></Td>
          <Td><Pill c={tok(m.tone)}>{m.label}</Pill>{e.detail ? <div style={{ fontSize: 9, color: T.ink4, fontFamily: F.b, marginTop: 2, maxWidth: 200 }}>{e.detail}</div> : null}</Td>
          <Td>{e.dataClass}</Td>
          <Td style={{ fontFamily: F.m, color: T.ink3 }}>{eventTokens(e)}</Td>
          <Td style={{ fontFamily: F.m, color: T.ink4, whiteSpace: "nowrap" }}>{String(e.prevHash).slice(0, 6)} → <span style={{ color: T.ink2 }}>{String(e.hash).slice(0, 6)}</span></Td>
        </tr>; })}
      </Table>
      {advisor(<>Fields per event: {INFERENCE_FIELDS.join(", ")}. The chain is {s.intact ? <b style={{ color: T.green }}>intact</b> : <b style={{ color: T.red }}>broken</b>} — {isLive ? <>re-verified over your full audit chain by recomputing every SHA-256 hash. These are the real events the gateway wrote for your inferences.</> : <>each row’s prev-hash matches the previous row’s hash, so altering any historical event breaks every hash after it. Connect a database and live events append here through the gateway.</>}</>)}
    </Card>
  </div>;
}
