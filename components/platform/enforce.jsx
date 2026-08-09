"use client";

import { useState } from "react";
import { T, F, AI_GOLD, AI_GOLD_INK, Card } from "./core";
import { AI_AGENTS, agentPosture } from "@/lib/agent-registry";
import { TOOLCALL_LEDGER, enforceStats, ENFORCE_DECISION_META, issueToken, TOKEN_TTL_SECONDS } from "@/lib/enforce";
import { EGRESS_POLICY, EGRESS_EVENTS, EGRESS_DECISION_META, egressStats } from "@/lib/egress";
import { HITL_GATES, hitlStats } from "@/lib/hitl";

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
