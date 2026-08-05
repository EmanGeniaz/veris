"use client";

import { T, F, AI_GOLD, Card } from "./core";
import {
  FORUM_COUNCIL, FORUM_CADENCE, OWNERSHIP_MATRIX, forumAgenda,
  UNIFIED_INCIDENTS, INCIDENT_STAGES, INCIDENT_CLASSES, incidentStats,
} from "@/lib/convergence";

/* ── shared local primitives (match the platform's visual language) ── */
const tok = k => ({ crit: T.red, warn: T.amber, info: T.blue, good: T.green, ink3: T.ink3 }[k] || T.ink3);
const cardPad = { padding: 18 };
const Eyebrow = ({ children, style }) => <div style={{ fontSize: 9, letterSpacing: "0.09em", textTransform: "uppercase", color: T.ink4, fontWeight: 900, fontFamily: F.m, ...style }}>{children}</div>;
const H3 = ({ children, style }) => <h3 style={{ fontFamily: F.h, fontSize: 16, fontWeight: 900, color: T.ink, margin: "4px 0 0", ...style }}>{children}</h3>;
const Head = ({ title, sub }) => <div style={{ marginBottom: 16 }}><h2 style={{ fontFamily: F.h, fontSize: 24, fontWeight: 900, color: T.ink, margin: 0, letterSpacing: "-0.02em" }}>{title}</h2><p style={{ fontFamily: F.b, fontSize: 12.5, color: T.ink3, margin: "5px 0 0", maxWidth: 760, lineHeight: 1.6 }}>{sub}</p></div>;
const Pill = ({ c, children }) => <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 9px", borderRadius: 999, fontSize: 10, fontWeight: 800, fontFamily: F.b, color: c, background: c + "18", border: `1px solid ${c}40` }}>{children}</span>;
const Th = ({ children, style }) => <th style={{ textAlign: "left", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: T.ink4, fontWeight: 900, fontFamily: F.m, padding: "0 10px 9px", borderBottom: `1px solid ${T.border}`, ...style }}>{children}</th>;
const Td = ({ children, style }) => <td style={{ padding: "10px", borderBottom: `1px solid ${T.border}`, color: T.ink2, fontSize: 11.5, fontFamily: F.b, verticalAlign: "middle", ...style }}>{children}</td>;
const Table = ({ head, children }) => <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr>{head.map(h => <Th key={h}>{h}</Th>)}</tr></thead><tbody>{children}</tbody></table></div>;

/* ══════════════ 1 · CONVERGED GOVERNANCE FORUM ══════════════ */
export function GovernanceForum({ showToast }) {
  const agenda = forumAgenda();
  return <div style={{ animation: "up .3s ease" }}>
    <Head title="Governance Forum" sub="One senior forum owning policy, risk tiering, exceptions and escalation across data + AI — not parallel committees running different playbooks. Every item below traces to the live registers." />

    <Card style={{ ...cardPad, marginBottom: 14, background: `linear-gradient(135deg,${T.s2},${T.bg})`, border: `1px solid ${AI_GOLD}38` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ maxWidth: 620 }}>
          <Eyebrow style={{ color: AI_GOLD }}>Convergence charter</Eyebrow>
          <H3 style={{ fontSize: 18 }}>Data & AI governance, run as one agenda</H3>
          <p style={{ fontSize: 11.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.65, margin: "6px 0 0" }}>{FORUM_CADENCE}. Data lineage, access control, retention and quality are treated as inseparable from model performance, safety and compliance.</p>
        </div>
        <button onClick={() => showToast && showToast("Council pack assembled — risk tiers, exceptions and escalations")} style={{ background: AI_GOLD, border: "none", borderRadius: 10, padding: "10px 15px", color: "#241703", fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer", whiteSpace: "nowrap" }}>✦ Assemble council pack</button>
      </div>
    </Card>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 14, marginBottom: 14 }}>
      <Card style={cardPad}>
        <Eyebrow>The council · single operating rhythm</Eyebrow><H3 style={{ marginBottom: 10 }}>One seat per domain — no silos</H3>
        <div style={{ display: "grid", gap: 7 }}>
          {FORUM_COUNCIL.map(m => <div key={m.role} style={{ display: "flex", gap: 10, alignItems: "center", background: T.s2, border: `1px solid ${T.border}`, borderRadius: 9, padding: "8px 11px" }}>
            <span style={{ minWidth: 42, fontSize: 11, fontWeight: 900, color: T.ink, fontFamily: F.m }}>{m.role}</span>
            <div style={{ minWidth: 0 }}><div style={{ fontSize: 11, fontWeight: 800, color: T.ink, fontFamily: F.b }}>{m.seat}</div><div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b }}>{m.owns}</div></div>
          </div>)}
        </div>
      </Card>
      <Card style={cardPad}>
        <Eyebrow>Single-point ownership · cross-trigger</Eyebrow><H3 style={{ marginBottom: 10 }}>Data policy and AI review move together</H3>
        <Table head={["Domain", "Lead", "Automatic cross-trigger"]}>
          {OWNERSHIP_MATRIX.map(o => <tr key={o.domain}>
            <Td style={{ fontWeight: 800, color: T.ink }}>{o.domain}</Td>
            <Td><Pill c={T.blue}>{o.lead}</Pill></Td>
            <Td style={{ color: T.ink3 }}>{o.trigger}</Td>
          </tr>)}
        </Table>
      </Card>
    </div>

    <Card style={cardPad}>
      <Eyebrow>This month's agenda · one queue across data + AI</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>Risk tiering · exceptions · escalations — the forum's live decisions</H3>
      <Table head={["Type", "Item", "Owner", "Tier", "Ref", "Decision"]}>
        {agenda.map(a => <tr key={a.ref}>
          <Td><Pill c={a.kind === "Escalation" ? T.red : a.kind === "Risk tiering" ? AI_GOLD : T.blue}>{a.kind}</Pill></Td>
          <Td style={{ fontWeight: 700, color: T.ink }}>{a.item}</Td>
          <Td>{a.owner}</Td>
          <Td><Pill c={a.tier === "Critical" ? T.red : a.tier === "High" ? AI_GOLD : T.blue}>{a.tier}</Pill></Td>
          <Td style={{ fontFamily: F.m, color: T.ink3 }}>{a.ref}</Td>
          <Td style={{ color: T.ink3 }}>{a.decision}</Td>
        </tr>)}
      </Table>
      <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 10, background: AI_GOLD + "12", border: `1px solid ${AI_GOLD}30`, fontSize: 11, color: T.ink2, lineHeight: 1.6, fontFamily: F.b }}>
        <b style={{ color: AI_GOLD }}>Veris Intelligence:</b> Risk tiers here are the same records the Risk Center and AI Central cite — one source of truth. Ratifying the acceptable-use policy clears the overdue review and unblocks two dependent AI use-case reviews.
      </div>
    </Card>
  </div>;
}

/* ══════════════ 2 · CONVERGED INCIDENT PLAYBOOK ══════════════ */
export function IncidentPlaybook({ showToast }) {
  const s = incidentStats();
  const kpis = [
    ["Open incidents", String(s.open), T.red, `of ${s.total} in the register`],
    ["On the regulatory clock", String(s.regClock), AI_GOLD, "notification in progress"],
    ["Classes covered", String(s.byClass.length), T.blue, "one register, one playbook"],
    ["MTTR", "26h", T.green, "KRI-06 · improving"],
  ];
  return <div style={{ animation: "up .3s ease" }}>
    <Head title="Incident Playbook" sub="One response playbook across breaches, model failures, harmful outputs and regulatory notifications — consolidating what used to be separate AI, security and privacy incident queues." />

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 14 }}>
      {kpis.map(([l, v, c, sub]) => <Card key={l} style={{ padding: "13px 15px" }}>
        <Eyebrow>{l}</Eyebrow>
        <div style={{ fontSize: 26, fontWeight: 900, color: c, fontFamily: F.m, margin: "5px 0 2px" }}>{v}</div>
        <div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b }}>{sub}</div>
      </Card>)}
    </div>

    <Card style={{ ...cardPad, marginBottom: 14 }}>
      <Eyebrow>The one register · every incident class</Eyebrow>
      <H3 style={{ marginBottom: 6 }}>Breach · model failure · harmful output · regulatory · security</H3>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "8px 0 12px" }}>
        {INCIDENT_CLASSES.map(c => { const n = UNIFIED_INCIDENTS.filter(i => i.cls === c).length; return <span key={c} style={{ fontSize: 10, fontWeight: 800, fontFamily: F.b, color: n ? T.ink2 : T.ink4, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 999, padding: "4px 10px" }}>{c} · {n}</span>; })}
      </div>
      <Table head={["Ref", "Incident", "Class", "System", "Owner", "Status", "Regulatory clock"]}>
        {UNIFIED_INCIDENTS.map(i => <tr key={i.id}>
          <Td style={{ fontFamily: F.m, fontWeight: 700, color: T.ink }}>{i.id}</Td>
          <Td style={{ fontWeight: 700, color: T.ink }}>{i.title}<div style={{ fontSize: 9.5, color: tok(i.sev), fontWeight: 700, marginTop: 2 }}>{i.severity} · detected {i.detected}</div></Td>
          <Td><Pill c={i.cls === "Data breach" || i.cls === "Security" ? T.red : i.cls === "Regulatory" ? AI_GOLD : T.blue}>{i.cls}</Pill></Td>
          <Td>{i.system}</Td>
          <Td>{i.owner}</Td>
          <Td><Pill c={tok(i.st)}>{i.status}</Pill></Td>
          <Td style={{ color: T.ink3 }}>{i.reg}</Td>
        </tr>)}
      </Table>
    </Card>

    <Card style={cardPad}>
      <Eyebrow>One response playbook · same stages for every class</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>Detect → Triage → Contain → Notify → Remediate → Evidence</H3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 10 }}>
        {INCIDENT_STAGES.map(st => <div key={st.n} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 11, padding: "12px 13px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ width: 22, height: 22, borderRadius: 7, background: AI_GOLD + "1c", border: `1px solid ${AI_GOLD}45`, color: AI_GOLD, fontFamily: F.m, fontWeight: 900, fontSize: 11, display: "grid", placeItems: "center" }}>{st.n}</span>
            <span style={{ fontSize: 12.5, fontWeight: 900, color: T.ink, fontFamily: F.h }}>{st.stage}</span>
          </div>
          <div style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.55, marginBottom: 6 }}>{st.crit}</div>
          <Pill c={T.blue}>{st.owner}</Pill>
        </div>)}
      </div>
      <div style={{ display: "flex", gap: 9, marginTop: 14, flexWrap: "wrap" }}>
        <button onClick={() => showToast && showToast("Response run started — single owner assigned, regulatory clock tracked")} style={{ background: AI_GOLD, border: "none", borderRadius: 10, padding: "9px 15px", color: "#241703", fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>Start a response run</button>
        <button onClick={() => showToast && showToast("Evidence pack exported to Trust & Evidence")} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 15px", color: T.ink2, fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>Export evidence pack</button>
      </div>
    </Card>
  </div>;
}
