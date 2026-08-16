"use client";

import { useState } from "react";
import { T, F, AI_GOLD, AI_GOLD_INK, Card } from "./core";
import { AI_AGENTS, agentPosture } from "@/lib/agent-registry";
import { TOOLCALL_LEDGER, enforceStats, ENFORCE_DECISION_META, issueToken, TOKEN_TTL_SECONDS } from "@/lib/enforce";
import { EGRESS_POLICY, EGRESS_EVENTS, EGRESS_DECISION_META, egressStats } from "@/lib/egress";
import { HITL_GATES, hitlStats } from "@/lib/hitl";
import { breakerSessions, breakerStats, BREAKER_STATES, SIGNALS, stateMeta } from "@/lib/circuit-breaker";
import { PAAS_ENDPOINT, PAAS_CLIENTS, PAAS_KEYS, PAAS_SAMPLES, PAAS_DECISION_META, paasStats } from "@/lib/policy-service";

/* ── shared local primitives (match roadmap/convergence) ── */
const tok = k => ({ crit: T.red, warn: T.amber, info: T.blue, good: T.green, ink3: T.ink3 }[k] || T.ink3);
const cardPad = { padding: 18 };
const Eyebrow = ({ children, style }) => <div style={{ fontSize: 9, letterSpacing: "0.09em", textTransform: "uppercase", color: T.ink4, fontWeight: 900, fontFamily: F.m, ...style }}>{children}</div>;
const H3 = ({ children, style }) => <h3 style={{ fontFamily: F.h, fontSize: 16, fontWeight: 900, color: T.ink, margin: "4px 0 0", ...style }}>{children}</h3>;
const Head = ({ title, sub }) => <div style={{ marginBottom: 16 }}><h2 style={{ fontFamily: F.h, fontSize: 24, fontWeight: 900, color: T.ink, margin: 0, letterSpacing: "-0.02em" }}>{title}</h2><p style={{ fontFamily: F.b, fontSize: 12.5, color: T.ink3, margin: "5px 0 0", maxWidth: 820, lineHeight: 1.6 }}>{sub}</p></div>;
const Pill = ({ c, children }) => <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 9px", borderRadius: 999, fontSize: 10, fontWeight: 800, fontFamily: F.b, color: c, background: c + "18", border: `1px solid ${c}40` }}>{children}</span>;
const Th = ({ children, style }) => <th style={{ textAlign: "left", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: T.ink4, fontWeight: 900, fontFamily: F.m, padding: "0 10px 9px", borderBottom: `1px solid ${T.border}`, ...style }}>{children}</th>;
const Td = ({ children, style }) => <td style={{ padding: "10px", borderBottom: `1px solid ${T.border}`, color: T.ink2, fontSize: 11.5, fontFamily: F.b, verticalAlign: "middle", ...style }}>{children}</td>;
const Table = ({ head, children }) => <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr>{head.map(h => <Th key={h}>{h}</Th>)}</tr></thead><tbody>{children}</tbody></table></div>;
const Kpi = ({ l, v, c, sub }) => <Card style={{ padding: "13px 15px" }}><Eyebrow>{l}</Eyebrow><div style={{ fontSize: 26, fontWeight: 900, color: c, fontFamily: F.m, margin: "5px 0 2px" }}>{v}</div><div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b }}>{sub}</div></Card>;
const kpiGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 14 };
const advisor = children => <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 10, background: AI_GOLD + "12", border: `1px solid ${AI_GOLD}30`, fontSize: 11, color: T.ink2, lineHeight: 1.6, fontFamily: F.b }}><b style={{ color: AI_GOLD_INK }}>Veris Intelligence:</b> {children}</div>;
const decPill = d => { const m = ENFORCE_DECISION_META[d] || { label: d, tone: "ink3" }; return <Pill c={tok(m.tone)}>{m.label}</Pill>; };

/* ══════════════ ENFORCEMENT OVERVIEW — the closed loop ══════════════ */
export function EnforcementOverview({ showToast }) {
  const s = enforceStats();
  const loop = [
    ["Policy", "VerisZone control plane", "Capabilities, oversight rules & data scopes are declared per agent.", T.blue],
    ["Enforcement", "Veris Enforce", "Every tool call is decided at runtime — deny-by-default, tokens, egress & HITL.", AI_GOLD],
    ["Evidence", "Article 12 chain", "Each decision is signed into a tamper-evident ledger the board & auditors read.", T.green],
  ];
  return <div style={{ animation: "up .3s ease" }}>
    <Head title="Veris Enforce" sub="The enforcement plane. Governance says what an agent may do; Enforce decides, at call time, what it does — and records both, tamper-evidently. Controls hold around the model, not inside it: a more capable model is better at being argued out of its instructions, but no better at forging a capability token or reaching a destination the egress policy denies." />
    <div style={kpiGrid}>
      <Kpi l="Tool calls (window)" v={String(s.total)} c={AI_GOLD} sub={`${s.agentsGoverned} agents governed`} />
      <Kpi l="Contained" v={String(s.contained)} c={T.green} sub={`${s.containmentRate}% blocked · gated · egress-denied`} />
      <Kpi l="Prevented breaches" v={String(s.preventedBreaches)} c={T.red} sub="ungranted tool reached for — stopped" />
      <Kpi l="Least-privilege index" v={`${s.leastPrivilegeIndex}%`} c={s.leastPrivilegeIndex >= 80 ? T.green : T.amber} sub={`${s.overPrivileged} agents over-privileged`} />
      <Kpi l="Ledger chain" v={s.intact ? "Intact" : "Broken"} c={s.intact ? T.green : T.red} sub="every call re-hashed" />
    </div>
    <Card style={cardPad}>
      <Eyebrow>The closed loop · policy → enforcement → evidence</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>One control set, three planes</H3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
        {loop.map(([k, who, desc, c], i) => <div key={k} style={{ position: "relative", padding: "14px 15px", borderRadius: 11, background: c + "0e", border: `1px solid ${c}33` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ width: 22, height: 22, borderRadius: 6, background: c + "22", color: c, fontFamily: F.m, fontWeight: 900, fontSize: 11, display: "grid", placeItems: "center" }}>{i + 1}</span>
            <div><div style={{ fontSize: 12.5, fontWeight: 900, color: T.ink, fontFamily: F.b }}>{k}</div><div style={{ fontSize: 9.5, color: c, fontWeight: 800, fontFamily: F.m, textTransform: "uppercase", letterSpacing: "0.06em" }}>{who}</div></div>
          </div>
          <p style={{ fontSize: 11, color: T.ink3, fontFamily: F.b, lineHeight: 1.55, margin: 0 }}>{desc}</p>
        </div>)}
      </div>
      {advisor(<>This is the gap neither the guardrail vendors nor the GRC vendors close: enforcement without governance is a firewall nobody can explain to a board; governance without enforcement is a spreadsheet. Enforce blocked {s.preventedBreaches} ungranted tool call{s.preventedBreaches === 1 ? "" : "s"} in this window — each one an injection or over-reach that never reached money, data, or the internet, and each written to the same evidence chain the Article 12 log reads.</>)}
      <div style={{ marginTop: 12 }}>
        <button onClick={() => showToast && showToast("Enforcement posture exported — decisions reconciled to the Article 12 evidence chain")} style={{ background: AI_GOLD, border: "none", borderRadius: 11, padding: "10px 17px", color: "#0b0e24", fontSize: 12, fontWeight: 800, fontFamily: F.b, cursor: "pointer" }}>✦ Export enforcement posture</button>
      </div>
    </Card>
  </div>;
}

/* ══════════════ POLICY-AS-A-SERVICE — the engine as a callable service ══════════════ */
export function PolicyAsAService({ showToast }) {
  const s = paasStats();
  const [text, setText] = useState(PAAS_SAMPLES[1].text);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const [keys, setKeys] = useState(PAAS_KEYS);
  const [reveal, setReveal] = useState(null);

  const inspect = async () => {
    setBusy(true); setErr(""); setResult(null);
    try {
      const res = await fetch("/api/policy/inspect", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, context: "paas-console", actor: "policy.console@veriszone.ai", channel: "paas-console" }),
      });
      if (!res.ok) throw new Error("inspect " + res.status);
      const v = await res.json();
      setResult(v);
      const m = PAAS_DECISION_META[v.decision] || { label: v.decision };
      showToast && showToast(`Verdict: ${m.label}${v.reason ? " · " + v.reason : ""} — signed into the Article 12 chain`);
    } catch (e) {
      setErr("Service unreachable — " + String(e.message || e));
    } finally { setBusy(false); }
  };

  const issueKey = () => {
    const n = keys.length + 1;
    const id = "issued-" + n;
    const full = "vz_live_nk_" + id.replace(/[^a-z0-9]/g, "") + "K7q2";
    setKeys(k => [...k, { id, label: "New client " + n, scope: "inspect", status: "Active", masked: full.slice(0, 12) + "••••••" + full.slice(-4), created: "just now" }]);
    setReveal({ id, full });
    showToast && showToast("Inspection key issued — copy it now; it is shown only once");
  };
  const rotate = (id) => { setKeys(k => k.map(x => x.id === id ? { ...x, masked: x.masked.slice(0, 12) + "••••••" + "New1", created: "just now" } : x)); showToast && showToast("Key rotated — the previous secret is now void"); };

  const rc = result ? tok(PAAS_DECISION_META[result.decision]?.tone || "ink3") : T.border;
  const chan = [
    ["Any client", "Gateway · extension · CASB · CI/CD", "One rulebook, whatever the channel — including shadow-AI traffic that never touches the app.", T.blue],
    ["Inspect", "POST /api/policy/inspect", "Stateless verdict — classify, mask or block. No model is called; it only judges text.", AI_GOLD],
    ["Evidence", "Article 12 chain", "Every verdict appends a hash of the text + what fired — never the raw sensitive content.", T.green],
  ];

  return <div style={{ animation: "up .3s ease" }}>
    <Head title="Policy-as-a-Service" sub="The policy engine, exposed as a callable service. The same DLP + classification rulebook the AI Gateway enforces inline is available at one endpoint, so a browser extension, a CASB, a forward proxy or a CI pipeline can enforce it on AI traffic that never touches the in-app gateway. It returns allow · mask · block with the masked text to substitute — and signs every verdict into the same evidence chain." />
    <div style={kpiGrid}>
      <Kpi l="Inspections (window)" v={s.total.toLocaleString()} c={AI_GOLD} sub={`${s.clientsLive} of ${s.clientsTotal} channels live`} />
      <Kpi l="Allow / Mask / Block" v={`${s.allow.toLocaleString()} · ${s.mask} · ${s.block}`} c={T.blue} sub={`${s.containmentRate}% contained at the edge`} />
      <Kpi l="Prevented exfiltration" v={String(s.preventedExfil)} c={T.red} sub="block verdicts — data that never left" />
      <Kpi l="Median verdict" v={`${s.p95ms}ms`} c={T.green} sub="no model call — pure judgement" />
      <Kpi l="Active keys" v={String(s.keysActive)} c={T.blue} sub="x-veris-key, per channel" />
    </div>

    {/* One rulebook, every channel */}
    <Card style={{ ...cardPad, marginBottom: 14 }}>
      <Eyebrow>The service · one rulebook, every channel</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>Policy the whole enterprise can call</H3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
        {chan.map(([k, who, desc, c], i) => <div key={k} style={{ padding: "14px 15px", borderRadius: 11, background: c + "0e", border: `1px solid ${c}33` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ width: 22, height: 22, borderRadius: 6, background: c + "22", color: c, fontFamily: F.m, fontWeight: 900, fontSize: 11, display: "grid", placeItems: "center" }}>{i + 1}</span>
            <div><div style={{ fontSize: 12.5, fontWeight: 900, color: T.ink, fontFamily: F.b }}>{k}</div><div style={{ fontSize: 9.5, color: c, fontWeight: 800, fontFamily: F.m, textTransform: "uppercase", letterSpacing: "0.06em" }}>{who}</div></div>
          </div>
          <p style={{ fontSize: 11, color: T.ink3, fontFamily: F.b, lineHeight: 1.55, margin: 0 }}>{desc}</p>
        </div>)}
      </div>
      <div style={{ marginTop: 12, fontFamily: F.m, fontSize: 10.5, color: T.ink2, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "11px 13px", lineHeight: 1.7, overflowX: "auto" }}>
        <div style={{ color: T.ink4 }}># request</div>
        <div><b style={{ color: T.ink }}>{PAAS_ENDPOINT.method} {PAAS_ENDPOINT.path}</b> · auth: <b style={{ color: AI_GOLD_INK }}>{PAAS_ENDPOINT.auth}</b></div>
        <div style={{ whiteSpace: "pre-wrap" }}>{PAAS_ENDPOINT.request}</div>
        <div style={{ color: T.ink4, marginTop: 6 }}># response</div>
        <div style={{ whiteSpace: "pre-wrap" }}>{PAAS_ENDPOINT.response}</div>
      </div>
    </Card>

    {/* Live inspection — actually calls the endpoint */}
    <Card style={{ ...cardPad, marginBottom: 14 }}>
      <Eyebrow>Live inspection · calls the real endpoint</Eyebrow>
      <H3 style={{ marginBottom: 10 }}>Send text through the service</H3>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 9 }}>
        {PAAS_SAMPLES.map(sm => <button key={sm.id} onClick={() => { setText(sm.text); setResult(null); }} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 999, padding: "5px 12px", color: T.ink2, fontSize: 10.5, fontWeight: 700, fontFamily: F.b, cursor: "pointer" }}>{sm.label}</button>)}
      </div>
      <textarea value={text} onChange={e => { setText(e.target.value); setResult(null); }} rows={3} style={{ width: "100%", background: T.s2, border: `1px solid ${T.border}`, borderRadius: 9, padding: "11px 13px", color: T.ink, fontSize: 12.5, fontFamily: F.b, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
      <div style={{ marginTop: 10 }}>
        <button onClick={inspect} disabled={busy} style={{ background: AI_GOLD, border: "none", borderRadius: 9, padding: "10px 17px", color: "#0b0e24", fontSize: 12, fontWeight: 800, fontFamily: F.b, cursor: busy ? "wait" : "pointer", opacity: busy ? 0.7 : 1 }}>{busy ? "Inspecting…" : "✦ Inspect"}</button>
      </div>
      {err && <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 9, background: T.redL, border: `1px solid ${T.red}40`, color: T.red, fontSize: 11.5, fontFamily: F.b }}>{err}</div>}
      {result && <div style={{ marginTop: 13, padding: "13px 15px", borderRadius: 10, background: rc + "10", border: `1px solid ${rc}40` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8, flexWrap: "wrap" }}>
          <Pill c={rc}>{(PAAS_DECISION_META[result.decision] || {}).label || result.decision}</Pill>
          <span style={{ fontSize: 12, fontWeight: 800, color: T.ink, fontFamily: F.b }}>{(PAAS_DECISION_META[result.decision] || {}).note || ""}</span>
          {result.dataClass && <Pill c={T.blue}>{result.dataClass}</Pill>}
          {(result.categories || []).map(c => <Pill key={c} c={T.violet}>{c}</Pill>)}
        </div>
        {result.reason && <p style={{ fontSize: 11, color: T.ink3, fontFamily: F.b, margin: "0 0 8px" }}>Rule fired: <b style={{ color: T.ink2 }}>{result.reason}</b>{result.clauseRef ? ` · ${result.clauseRef}` : ""}</p>}
        {result.decision === "mask" && result.redacted && <div style={{ fontSize: 11, fontFamily: F.m, color: T.ink2, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 7, padding: "9px 11px", lineHeight: 1.6 }}><div style={{ color: T.ink4, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Substitute text</div>{result.redacted}</div>}
        {result.decision === "block" && <div style={{ fontSize: 11, color: T.red, fontFamily: F.b }}>Blocked — the client must not forward this content.</div>}
      </div>}
    </Card>

    {/* Connected channels */}
    <Card style={{ ...cardPad, marginBottom: 14 }}>
      <Eyebrow>Connected channels · who calls the service</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>Every channel, one policy</H3>
      <Table head={["Channel", "Type", "Status", "Inspections", "Contained", "Coverage"]}>
        {PAAS_CLIENTS.map(c => <tr key={c.id}>
          <Td style={{ fontWeight: 700, color: T.ink }}>{c.name}<div style={{ fontSize: 10, color: T.ink4, fontWeight: 500 }}>{c.note}</div></Td>
          <Td style={{ color: T.ink3 }}>{c.type}</Td>
          <Td><Pill c={c.status === "Live" ? T.green : T.amber}>{c.status}</Pill></Td>
          <Td>{c.calls.toLocaleString()}</Td>
          <Td>{c.contained}</Td>
          <Td><Pill c={T.blue}>{c.calls ? Math.round((c.contained / c.calls) * 100) : 0}%</Pill></Td>
        </tr>)}
      </Table>
    </Card>

    {/* Keys */}
    <Card style={cardPad}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div><Eyebrow>Inspection keys · x-veris-key</Eyebrow><H3 style={{ marginBottom: 0 }}>One key per channel, rotatable</H3></div>
        <button onClick={issueKey} style={{ background: AI_GOLD, border: "none", borderRadius: 9, padding: "9px 15px", color: "#0b0e24", fontSize: 11.5, fontWeight: 800, fontFamily: F.b, cursor: "pointer" }}>+ Issue key</button>
      </div>
      {reveal && <div style={{ margin: "12px 0", padding: "11px 13px", borderRadius: 9, background: T.greenL, border: `1px solid ${T.green}40`, fontFamily: F.m, fontSize: 11.5, color: T.ink }}><span style={{ color: T.ink4, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.07em" }}>New key — shown once</span><div style={{ fontWeight: 700, marginTop: 3 }}>{reveal.full}</div></div>}
      <div style={{ marginTop: 12 }}>
        <Table head={["Key", "Scope", "Secret", "Status", "Created", ""]}>
          {keys.map(k => <tr key={k.id}>
            <Td style={{ fontWeight: 700, color: T.ink }}>{k.label}</Td>
            <Td style={{ color: T.ink3 }}>{k.scope}</Td>
            <Td style={{ fontFamily: F.m, color: T.ink3 }}>{k.masked}</Td>
            <Td><Pill c={k.status === "Active" ? T.green : T.amber}>{k.status}</Pill></Td>
            <Td style={{ color: T.ink3 }}>{k.created}</Td>
            <Td><button onClick={() => rotate(k.id)} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 7, padding: "5px 11px", color: T.ink2, fontSize: 10.5, fontWeight: 700, fontFamily: F.b, cursor: "pointer" }}>Rotate</button></Td>
          </tr>)}
        </Table>
      </div>
      {advisor(<>This is Policy-as-a-Service: the rulebook you author once is enforced everywhere an employee can reach an AI — not just inside the app. The browser fleet and CASB alone contained {PAAS_CLIENTS[1].contained + PAAS_CLIENTS[2].contained} shadow-AI inspections this window, each judged by the same rules and written to the same evidence chain the board reads.</>)}
    </Card>
  </div>;
}

/* ══════════════ AGENT AUTHORITY — least privilege + live token issuance ══════════════ */
export function AgentAuthority({ showToast }) {
  const posture = agentPosture();
  const [agentId, setAgentId] = useState(AI_AGENTS[0].id);
  const [tool, setTool] = useState(AI_AGENTS[0].tools[0].name);
  const [result, setResult] = useState(null);
  const agent = AI_AGENTS.find(a => a.id === agentId) || AI_AGENTS[0];

  const run = () => {
    const n = (result ? result._n || 0 : 0) + 1;
    const r = issueToken(agentId, tool, agent.dataScopes.join(", "), "req-" + n, TOKEN_TTL_SECONDS);
    setResult({ ...r, _n: n });
    if (showToast) showToast(r.issued ? `Capability token ${r.token.id} issued — ${TOKEN_TTL_SECONDS}s, scoped` : r.decision === "escalate" ? "High-stakes — routed to human approval, no token issued" : "Denied by default — no token issued");
  };
  const rc = result ? (result.issued ? T.green : result.decision === "escalate" ? T.amber : T.red) : T.border;

  return <div style={{ animation: "up .3s ease" }}>
    <Head title="Agent Authority" sub="No agent holds a standing key. To call a tool it must be issued a capability token — short-lived, scoped to a data domain, and authorising exactly one tool. Issuance runs the least-privilege boundary first, so an ungranted or high-stakes call never mints a token. Over-privilege — a granted capability never exercised and not gated — is the standing attack surface this removes." />
    <div style={kpiGrid}>
      <Kpi l="Agents governed" v={String(posture.agents)} c={AI_GOLD} sub="registered, owned objects" />
      <Kpi l="Least-privilege index" v={`${posture.index}%`} c={posture.index >= 80 ? T.green : T.amber} sub="grants actually exercised" />
      <Kpi l="Over-privileged" v={String(posture.overPrivileged.length)} c={posture.overPrivileged.length ? T.red : T.green} sub="standing, un-exercised grants" />
      <Kpi l="High-stakes gated" v={`${posture.gatedHigh}/${posture.totalHigh}`} c={posture.gatedHigh === posture.totalHigh ? T.green : T.amber} sub="behind human approval" />
      <Kpi l="Token TTL" v={`${TOKEN_TTL_SECONDS}s`} c={T.blue} sub="per-call, then void" />
    </div>

    {/* Live token issuance — the runtime boundary, on screen */}
    <Card style={{ ...cardPad, marginBottom: 14 }}>
      <Eyebrow>Request a capability token · the runtime boundary</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>Issue a scoped, short-lived token</H3>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
        <label style={{ display: "grid", gap: 4 }}><span style={{ fontSize: 9, fontWeight: 900, color: T.ink4, fontFamily: F.m, textTransform: "uppercase", letterSpacing: "0.07em" }}>Agent</span>
          <select value={agentId} onChange={e => { setAgentId(e.target.value); const a = AI_AGENTS.find(x => x.id === e.target.value); setTool(a.tools[0].name); setResult(null); }} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 11px", color: T.ink, fontSize: 12, fontFamily: F.b, minWidth: 220 }}>
            {AI_AGENTS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select></label>
        <label style={{ display: "grid", gap: 4 }}><span style={{ fontSize: 9, fontWeight: 900, color: T.ink4, fontFamily: F.m, textTransform: "uppercase", letterSpacing: "0.07em" }}>Tool call</span>
          <select value={tool} onChange={e => { setTool(e.target.value); setResult(null); }} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 11px", color: T.ink, fontSize: 12, fontFamily: F.b, minWidth: 240 }}>
            {agent.tools.map(t => <option key={t.name} value={t.name}>{t.name} · {t.risk}</option>)}
          </select></label>
        <button onClick={run} style={{ background: AI_GOLD, border: "none", borderRadius: 9, padding: "10px 16px", color: "#0b0e24", fontSize: 12, fontWeight: 800, fontFamily: F.b, cursor: "pointer" }}>Request token</button>
      </div>
      {result && <div style={{ marginTop: 13, padding: "13px 15px", borderRadius: 10, background: rc + "10", border: `1px solid ${rc}40` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>{decPill(result.decision)}<span style={{ fontSize: 12, fontWeight: 800, color: T.ink, fontFamily: F.b }}>{result.issued ? "Token issued" : result.decision === "escalate" ? "Gated to human approval" : "Denied by default"}</span></div>
        <p style={{ fontSize: 11, color: T.ink3, fontFamily: F.b, lineHeight: 1.55, margin: "0 0 8px" }}>{result.reason}</p>
        {result.issued
          ? <div style={{ fontSize: 10.5, fontFamily: F.m, color: T.ink2, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 7, padding: "9px 11px", lineHeight: 1.7 }}>
              <div><b style={{ color: T.ink }}>{result.token.id}</b> · sig {result.token.sig}</div>
              <div>agent <b>{result.token.agent}</b> → tool <b>{result.token.tool}</b></div>
              <div>scope: {result.token.scope || "—"} · ttl {result.token.ttl}s</div>
            </div>
          : <div style={{ fontSize: 10.5, fontFamily: F.m, color: T.ink3 }}>No token minted · control: {result.control}</div>}
      </div>}
    </Card>

    <Card style={cardPad}>
      <Eyebrow>Per-agent authority · least privilege</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>Granted capabilities vs standing surface</H3>
      <Table head={["Agent", "Unit", "Granted", "Exercised", "Over-priv", "High-stakes gated", "LP score"]}>
        {posture.rows.map(({ agent: a, stats }) => <tr key={a.id}>
          <Td style={{ fontWeight: 700, color: T.ink }}>{a.name}</Td>
          <Td style={{ color: T.ink3 }}>{a.unit}</Td>
          <Td>{stats.granted}</Td>
          <Td>{stats.exercised}</Td>
          <Td>{stats.overPriv.length ? <Pill c={T.red}>{stats.overPriv.length}</Pill> : <Pill c={T.green}>0</Pill>}</Td>
          <Td>{stats.highRiskGated}/{stats.highRisk}</Td>
          <Td><Pill c={stats.score >= 80 ? T.green : stats.score >= 50 ? T.amber : T.red}>{stats.score}%</Pill></Td>
        </tr>)}
      </Table>
      {advisor(<>Least privilege isn’t asserted — it’s computed from which grants each agent actually exercises. {posture.overPrivileged.length ? `${posture.overPrivileged.length} agent(s) hold a standing capability they never use; revoke it and the attack surface shrinks with no loss of function.` : "No standing over-privilege detected across the fleet."} Every high-stakes tool ({posture.gatedHigh}/{posture.totalHigh}) is gated behind human approval.</>)}
    </Card>
  </div>;
}

/* ══════════════ TOOL-CALL LEDGER — the tamper-evident record ══════════════ */
export function ToolCallLedger({ showToast }) {
  const rows = TOOLCALL_LEDGER;
  const s = enforceStats(rows);
  return <div style={{ animation: "up .3s ease" }}>
    <Head title="Tool-Call Ledger" sub="The audit artifact nobody else owns: prove what your agents were allowed to do, and prove what they actually did. Every tool call is one signed row — the authorised grant beside the actual call, the deterministic decision, its token, and a hash chained to the row before it. Change any row and every later hash breaks. This is the record EU AI Act Art.12 and ISO 42001 push toward." />
    <div style={kpiGrid}>
      <Kpi l="Calls recorded" v={String(s.total)} c={AI_GOLD} sub="this window" />
      <Kpi l="Allowed" v={String(s.allowed)} c={T.green} sub="within grant" />
      <Kpi l="Escalated" v={String(s.escalated)} c={T.amber} sub="gated to a human" />
      <Kpi l="Blocked · egress" v={`${s.blocked} · ${s.egressDenied}`} c={T.red} sub="contained at the boundary" />
      <Kpi l="Chain" v={s.intact ? "Intact" : "Broken"} c={s.intact ? T.green : T.red} sub="every row re-hashed" />
    </div>
    <Card style={cardPad}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <div><Eyebrow>Signed tool-call record · authorised vs actual</Eyebrow><H3>Tamper-evident hash chain</H3></div>
        <button onClick={() => showToast && showToast(s.intact ? "Chain verified — every row re-hashed, no tampering" : "Chain broken — a row was altered")} style={{ background: s.intact ? T.green : T.red, border: "none", borderRadius: 10, padding: "8px 13px", color: "#fff", fontSize: 11.5, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>{s.intact ? "✓ Verify chain" : "Chain broken"}</button>
      </div>
      <Table head={["#", "Agent", "Tool call", "Authorised", "Decision", "Scope", "Token", "Risk", "Hash"]}>
        {rows.map(r => <tr key={r.id}>
          <Td style={{ fontFamily: F.m, color: T.ink4 }}>{r.seq}</Td>
          <Td style={{ fontWeight: 700, color: T.ink }}>{r.agentName}</Td>
          <Td><span style={{ fontFamily: F.m, color: T.ink2 }}>{r.tool}</span><div style={{ fontSize: 9.5, color: T.ink4 }}>{r.action}</div></Td>
          <Td>{r.authorized ? <Pill c={T.green}>granted</Pill> : <Pill c={T.red}>not granted</Pill>}</Td>
          <Td>{decPill(r.decision)}</Td>
          <Td style={{ color: T.ink3 }}>{r.scope}</Td>
          <Td style={{ fontFamily: F.m, color: r.token ? T.ink2 : T.ink4 }}>{r.token || "—"}</Td>
          <Td><Pill c={r.risk === "High" ? T.red : r.risk === "Medium" ? T.amber : T.ink3}>{r.risk}</Pill></Td>
          <Td style={{ fontFamily: F.m, color: T.ink4, fontSize: 10 }}>{r.hash.slice(0, 8)}</Td>
        </tr>)}
      </Table>
      {advisor(<>Rows where the agent reached for a tool it does not hold and was <b>Blocked</b> or <b>Egress-denied</b> are the containment wins — {s.preventedBreaches} in this window — a successful injection that never reached money, data, or the internet. Each decision is deterministic (identity + capability + provenance), so it survives a more capable model, and each is signed into the same chain the Article 12 log verifies.</>)}
    </Card>
  </div>;
}

/* ══════════════ EGRESS POLICY — the containment guarantee ══════════════ */
export function EgressPolicy({ showToast }) {
  const s = egressStats();
  return <div style={{ animation: "up .3s ease" }}>
    <Head title="Egress Policy" sub="The containment guarantee: a successful injection cannot reach money, data, or the internet. Least privilege stops an agent calling a tool it doesn't hold; egress policy stops the tools it does hold from reaching a destination they shouldn't. Enforced on the destination — an allow-list plus named deny categories, never a text classifier — so it holds against a more capable model. Closes data-exfiltration and SSRF against the cloud metadata service." />
    <div style={kpiGrid}>
      <Kpi l="Egress attempts" v={String(s.total)} c={AI_GOLD} sub="this window" />
      <Kpi l="Allowed" v={String(s.allowed)} c={T.green} sub="to allow-listed hosts" />
      <Kpi l="Denied" v={String(s.denied)} c={T.red} sub={`${s.denyRate}% blocked at the boundary`} />
      <Kpi l="SSRF blocked" v={String(s.ssrf)} c={s.ssrf ? T.red : T.green} sub="metadata-service theft stopped" />
      <Kpi l="Allow-list" v={String(s.allowlisted)} c={T.blue} sub="explicit destinations" />
    </div>
    <Card style={{ ...cardPad, marginBottom: 14 }}>
      <Eyebrow>Egress attempts · destination decisions</Eyebrow><H3 style={{ marginBottom: 12 }}>What the tools tried to reach</H3>
      <Table head={["Agent", "Tool", "Destination", "Decision", "Why"]}>
        {EGRESS_EVENTS.map(e => { const m = EGRESS_DECISION_META[e.decision]; return <tr key={e.id}>
          <Td style={{ fontWeight: 700, color: T.ink }}>{e.agent}</Td>
          <Td style={{ fontFamily: F.m, color: T.ink3 }}>{e.tool}</Td>
          <Td style={{ fontFamily: F.m, color: e.decision === "allow" ? T.ink2 : T.red }}>{e.dest}</Td>
          <Td><Pill c={tok(m.tone)}>{m.label}</Pill></Td>
          <Td style={{ color: T.ink3 }}>{e.reason}</Td>
        </tr>; })}
      </Table>
      {advisor(<>The two containment wins in this window are the ones that matter: an exfiltration attempt to a known sink, and an SSRF against <b>169.254.169.254</b> to steal cloud credentials — both denied deterministically before leaving the boundary. Every deny is written to the Tool-Call Ledger.</>)}
    </Card>
    <Card style={cardPad}>
      <Eyebrow>Egress policy · allow-list + deny categories</Eyebrow><H3 style={{ marginBottom: 12 }}>Deny-by-default destinations</H3>
      <Table head={["Destination", "Category", "Note"]}>
        {EGRESS_POLICY.map(p => { const c = p.category === "allow" ? T.green : p.category === "internal" ? T.amber : T.red; return <tr key={p.host}>
          <Td style={{ fontFamily: F.m, color: T.ink }}>{p.host}</Td>
          <Td><Pill c={c}>{p.category}</Pill></Td>
          <Td style={{ color: T.ink3 }}>{p.note}</Td>
        </tr>; })}
      </Table>
      <div style={{ marginTop: 12 }}>
        <button onClick={() => showToast && showToast("Egress policy exported — denies reconciled to the Tool-Call Ledger and incident register")} style={{ background: AI_GOLD, border: "none", borderRadius: 11, padding: "10px 17px", color: "#0b0e24", fontSize: 12, fontWeight: 800, fontFamily: F.b, cursor: "pointer" }}>✦ Export egress policy</button>
      </div>
    </Card>
  </div>;
}

/* ══════════════ HITL GATES — human oversight thresholds ══════════════ */
export function HitlGates({ showToast }) {
  const s = hitlStats();
  return <div style={{ animation: "up .3s ease" }}>
    <Head title="Human-in-the-Loop Gates" sub="High-impact actions are gated behind human approval — with a threshold, so the gate fires only where it matters. An agent auto-runs the routine and routes the consequential to a person, rather than a blanket approve-everything that trains people to rubber-stamp. Maps to EU AI Act Art.14 (human oversight) and Art.22 (no solely-automated decision with legal effect)." />
    <div style={kpiGrid}>
      <Kpi l="Gates" v={String(s.gates)} c={AI_GOLD} sub="high-impact actions" />
      <Kpi l="Pending approvals" v={String(s.pending)} c={s.pending ? T.amber : T.green} sub="awaiting a human now" />
      <Kpi l="Always-gated" v={String(s.alwaysGated)} c={T.blue} sub="legal-effect actions" />
      <Kpi l="Threshold-gated" v={String(s.thresholdGated)} c={T.blue} sub="fire above a trip point" />
      <Kpi l="Art.14 / 22" v={String(s.art14)} c={T.green} sub="regulator-mapped gates" />
    </div>
    <Card style={cardPad}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <div><Eyebrow>Approval gates · where autonomy stops</Eyebrow><H3>Action · threshold · approver</H3></div>
        <button onClick={() => showToast && showToast(`${s.pending} actions routed to their approvers — SLA clocks running`)} style={{ background: s.pending ? AI_GOLD : T.s2, border: `1px solid ${s.pending ? AI_GOLD : T.border}`, borderRadius: 10, padding: "8px 13px", color: s.pending ? "#0b0e24" : T.ink2, fontSize: 11.5, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>{s.pending ? `Review ${s.pending} pending` : "No approvals pending"}</button>
      </div>
      <Table head={["Action", "Agent", "Trips when", "Approver", "SLA", "Basis", "Pending"]}>
        {HITL_GATES.map(g => <tr key={g.id}>
          <Td style={{ fontWeight: 700, color: T.ink }}>{g.label}</Td>
          <Td style={{ fontFamily: F.m, color: T.ink3 }}>{g.agent}</Td>
          <Td style={{ color: T.ink3 }}>{g.condition}</Td>
          <Td>{g.approver}</Td>
          <Td style={{ fontFamily: F.m, color: T.ink3 }}>{g.sla}</Td>
          <Td><Pill c={/Art\./.test(g.basis) ? T.green : T.blue}>{g.basis}</Pill></Td>
          <Td>{g.pending ? <Pill c={T.amber}>{g.pending}</Pill> : <Pill c={T.green}>0</Pill>}</Td>
        </tr>)}
      </Table>
      {advisor(<>Thresholds keep oversight meaningful: routine actions run autonomously and are logged, while the {s.alwaysGated} legal-effect actions (adverse credit, account freeze, direct customer email) always route to a named approver under Art.14 / Art.22. Every gate decision — approved, held, or auto-run below threshold — lands in the Tool-Call Ledger.</>)}
    </Card>
  </div>;
}

/* ══════════════ CIRCUIT BREAKER — real-time capability revocation ══════════════ */
export function CircuitBreaker({ showToast }) {
  const rows = breakerSessions();
  const s = breakerStats();
  return <div style={{ animation: "up .3s ease" }}>
    <Head title="Circuit Breaker" sub="Static gates say what an agent may never do. The circuit breaker adds the dynamic half — it watches each agent's risk signal as a session runs and revokes capability in real time the moment it crosses a threshold, before the agent reaches a human gate. Tokens are short-lived (90s) and per-call, so revocation is instant: the agent's tokens hit a revocation list and the next issuance is refused. Every trip is written to the Article 12 chain. This is the continuous, adaptive oversight EU AI Act Art.14 requires." />
    <div style={kpiGrid}>
      <Kpi l="Sessions watched" v={String(s.watched)} c={AI_GOLD} sub="live, this window" />
      <Kpi l="Breaker tripped" v={String(s.acted)} c={T.red} sub="downscoped · suspended · halted" />
      <Kpi l="Tokens revoked" v={String(s.tokensRevoked)} c={T.red} sub={`within the ${s.ttlSeconds}s TTL`} />
      <Kpi l="Routed to human" v={String(s.routedToHuman)} c={T.amber} sub="Art.14 escalation" />
    </div>

    <Card style={cardPad}>
      <Eyebrow>The escalation ladder · risk score → automatic action</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>Graduated response, not a single kill-switch</H3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 10 }}>
        {BREAKER_STATES.map(b => { const c = tok(b.tone); return <div key={b.id} style={{ padding: "12px 13px", borderRadius: 10, background: c + "0e", border: `1px solid ${c}33` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 5 }}>
            <span style={{ fontSize: 12.5, fontWeight: 900, color: T.ink, fontFamily: F.b }}>{b.label}</span>
            <span style={{ fontSize: 10, fontWeight: 900, color: c, fontFamily: F.m }}>{b.id === "normal" ? "0" : "≥" + b.min}</span>
          </div>
          <p style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.5, margin: 0 }}>{b.action}</p>
        </div>; })}
      </div>
    </Card>

    <Card style={{ ...cardPad, marginTop: 14 }}>
      <Eyebrow>Live sessions · score & state computed from signals</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>What the breaker did, and why</H3>
      <Table head={["Session", "Agent", "Risk signals", "Score", "Breaker", "Capability revoked", "Art.12"]}>
        {rows.map(r => { const c = tok(r.tone); return <tr key={r.id}>
          <Td style={{ fontFamily: F.m, color: T.ink3, whiteSpace: "nowrap" }}>{r.id}<div style={{ fontSize: 9, color: T.ink4 }}>{r.started}</div></Td>
          <Td style={{ color: T.ink, fontWeight: 700 }}>{r.agentName}<div style={{ fontSize: 9, color: T.ink4, fontFamily: F.b }}>owner · {r.owner}</div></Td>
          <Td><div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{r.signals.map(k => { const sg = SIGNALS[k]; return <span key={k} style={{ fontSize: 9, fontWeight: 800, fontFamily: F.m, color: tok(sg.tone), background: tok(sg.tone) + "16", border: `1px solid ${tok(sg.tone)}33`, borderRadius: 999, padding: "2px 7px" }}>{sg.label}</span>; })}</div></Td>
          <Td style={{ fontFamily: F.m, fontWeight: 900, color: c }}>{r.score}</Td>
          <Td><Pill c={c}>{r.stateLabel}</Pill>{r.humanGate && <div style={{ fontSize: 8.5, color: T.amber, fontFamily: F.m, fontWeight: 800, marginTop: 3 }}>→ human</div>}</Td>
          <Td style={{ color: T.ink2, fontSize: 10.5 }}>{r.acted ? (r.revoked.length ? <span style={{ fontFamily: F.m }}>{r.revoked.join(", ")}</span> : "—") : <span style={{ color: T.ink4 }}>none · monitoring</span>}</Td>
          <Td style={{ fontFamily: F.m, color: r.ledgerRef ? T.green : T.ink4, whiteSpace: "nowrap" }}>{r.ledgerRef || "—"}</Td>
        </tr>; })}
      </Table>
      {advisor(<>Session <span style={{ fontFamily: F.m }}>{rows.find(r => r.state === "halt")?.id || rows.find(r => r.acted)?.id}</span> shows the mechanism: the {rows.find(r => r.state === "halt") ? "Fraud Signal Agent's score hit " + rows.find(r => r.state === "halt")?.score + " (injection + egress + sensitive spike), so the breaker halted the session and revoked every token" : "score crossed the threshold and capability was pulled"} — before it reached a human gate, then wrote the trip to the Art.12 chain with the accountable owner. A fixed per-tool gate can't do this; it only fires at the tool the agent was already allowed to call. {s.tokensRevoked} tokens were revoked inside the {s.ttlSeconds}s TTL across {s.acted} tripped session{s.acted === 1 ? "" : "s"}.</>)}
      <div style={{ marginTop: 12 }}>
        <button onClick={() => showToast && showToast("Circuit-breaker trips exported — reconciled to the Article 12 evidence chain")} style={{ background: AI_GOLD, border: "none", borderRadius: 11, padding: "10px 17px", color: "#0b0e24", fontSize: 12, fontWeight: 800, fontFamily: F.b, cursor: "pointer" }}>✦ Export breaker trips</button>
      </div>
    </Card>
  </div>;
}
