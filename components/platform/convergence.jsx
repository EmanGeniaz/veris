"use client";

import { useState } from "react";
import { T, F, AI_GOLD, AI_GOLD_INK, Card } from "./core";
import {
  FORUM_COUNCIL, FORUM_CADENCE, OWNERSHIP_MATRIX, forumAgenda,
  UNIFIED_INCIDENTS, INCIDENT_STAGES, INCIDENT_CLASSES, incidentStats,
} from "@/lib/convergence";
import {
  NOTIFICATION_REGIMES, BREACH_REGISTER, NOTIFICATION_WORKFLOW,
  breachClock, regimesFor, tightestDeadlineH, breachStats, breachCoverage,
} from "@/lib/breach-notification";
import {
  INSTRUMENTS, CROSSWALK, CROSSWALK_DOMAINS, STATUS_META, crosswalkStats,
} from "@/lib/crosswalk";
import { PROHIBITED_PRACTICES, PP_RESULT_META, prohibitedStats } from "@/lib/prohibited";
import { GPAI_QUESTIONS, GPAI_REGISTER, EXPOSURE_META, gpaiExposure, gpaiStats } from "@/lib/gpai";
import { gapClosureRows, gapClosureStats } from "@/lib/gap-closure";
import {
  ASSESSMENT_DIMENSIONS, AIA_REGIMES, AIA_REGISTER, ASSESSMENT_WORKFLOW,
  aiaCompleteness, aiaStatus, aiaRegimesFor, aiaStats,
} from "@/lib/impact-assessment";

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
          <Eyebrow style={{ color: AI_GOLD_INK }}>Convergence charter</Eyebrow>
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
        <b style={{ color: AI_GOLD_INK }}>Veris Intelligence:</b> Risk tiers here are the same records the Risk Center and AI Central cite — one source of truth. Ratifying the acceptable-use policy clears the overdue review and unblocks two dependent AI use-case reviews.
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
            <span style={{ width: 22, height: 22, borderRadius: 7, background: AI_GOLD + "1c", border: `1px solid ${AI_GOLD}45`, color: AI_GOLD_INK, fontFamily: F.m, fontWeight: 900, fontSize: 11, display: "grid", placeItems: "center" }}>{st.n}</span>
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

/* ══════════════ 2b · BREACH-NOTIFICATION WORKFLOW ══════════════ */
export function BreachNotification({ showToast }) {
  const s = breachStats();
  const cov = breachCoverage();
  const [open, setOpen] = useState(null);
  const clockLabel = s.tightestRemainingH == null ? "—" : `${s.tightestRemainingH}h`;
  const kpis = [
    ["Breaches assessed", String(s.total), AI_GOLD, `${cov.pct}% of in-scope incidents`],
    ["Notifiable now", String(s.notifiable), s.notifiable ? T.red : T.green, "on the regulatory clock"],
    ["Notified on time", `${s.onTimeRate}%`, T.green, `${s.notified} filed within the window`],
    ["Tightest live clock", clockLabel, s.tightestRemainingH != null && s.tightestRemainingH <= 24 ? T.red : AI_GOLD, "to the binding deadline"],
  ];
  const regTone = { "EU / EEA": T.blue, "EU": T.blue, "India": AI_GOLD, "Brazil": T.green };
  return <div style={{ animation: "up .3s ease" }}>
    <Head title="Breach Notification" sub="The Notify stage of the incident playbook, made first-class. A confirmed personal-data breach or serious AI incident starts a regulatory clock — several regimes oblige notification to an authority, and sometimes to affected individuals, within a fixed window. This workspace runs that decision over the one incident register and keeps the evidence." />

    {/* charter / clock headline */}
    <Card style={{ ...cardPad, marginBottom: 14, background: `linear-gradient(135deg,${T.s2},${T.bg})`, border: `1px solid ${AI_GOLD}38` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ maxWidth: 640 }}>
          <Eyebrow style={{ color: AI_GOLD_INK }}>One clock, every regime</Eyebrow>
          <H3 style={{ fontSize: 18 }}>Assess once — notify every authority whose window is running</H3>
          <p style={{ fontSize: 11.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.65, margin: "6px 0 0" }}>A single breach can run the GDPR 72-hour clock, India's DPDP and CERT-In 6-hour clocks and the EU AI Act serious-incident clock at once. The workflow resolves them together, notifies against the tightest, and files one evidence pack — never four separate scrambles.</p>
        </div>
        <div style={{ textAlign: "center", background: T.s2, border: `1px solid ${AI_GOLD}45`, borderRadius: 12, padding: "12px 18px", minWidth: 130 }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: AI_GOLD_INK, fontFamily: F.m, lineHeight: 1 }}>{s.regimes}</div>
          <div style={{ fontSize: 9.5, color: T.ink3, fontWeight: 800, fontFamily: F.b, marginTop: 4, letterSpacing: "0.04em" }}>NOTIFICATION REGIMES</div>
        </div>
      </div>
    </Card>

    {/* KPIs */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 14 }}>
      {kpis.map(([l, v, c, sub]) => <Card key={l} style={{ padding: "13px 15px" }}>
        <Eyebrow>{l}</Eyebrow>
        <div style={{ fontSize: 26, fontWeight: 900, color: c, fontFamily: F.m, margin: "5px 0 2px" }}>{v}</div>
        <div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b }}>{sub}</div>
      </Card>)}
    </div>

    {/* the regimes and their clocks */}
    <Card style={{ ...cardPad, marginBottom: 14 }}>
      <Eyebrow>The clocks · who must be told, by when</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>Every notification duty the estate is exposed to</H3>
      <Table head={["Regime", "Basis", "Region", "Who is notified", "Window", "Trigger"]}>
        {NOTIFICATION_REGIMES.map(r => <tr key={r.id}>
          <Td style={{ fontWeight: 800, color: T.ink }}>{r.regime}</Td>
          <Td style={{ fontFamily: F.m, fontSize: 10.5, color: T.ink3, whiteSpace: "nowrap" }}>{r.basis}</Td>
          <Td><Pill c={regTone[r.region] || T.ink3}>{r.region}</Pill></Td>
          <Td style={{ fontWeight: 700, color: T.ink2 }}>{r.audience}</Td>
          <Td style={{ color: r.deadlineH <= 24 ? T.red : T.ink2, fontWeight: 700, whiteSpace: "nowrap" }}>{r.deadline}</Td>
          <Td style={{ color: T.ink3, maxWidth: 260 }}>{r.trigger}</Td>
        </tr>)}
      </Table>
    </Card>

    {/* the breach register with computed clock */}
    <Card style={{ ...cardPad, marginBottom: 14 }}>
      <Eyebrow>The register · every breach assessed for notifiability</Eyebrow>
      <H3 style={{ marginBottom: 6 }}>Assess → decide → notify → log — click any row for the decision</H3>
      <p style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b, margin: "0 0 12px", lineHeight: 1.5 }}>Most breaches are assessed and found not notifiable — the workflow still records that decision. The clock shows only where a duty is live.</p>
      <Table head={["Ref", "Breach", "System", "Personal data", "Regimes", "Clock", "Decision"]}>
        {BREACH_REGISTER.map(b => {
          const clk = breachClock(b);
          const isOpen = open === b.id;
          const decMeta = b.decision === "notified" ? { c: T.green, l: "Notified" } : b.decision === "notifiable" ? { c: T.red, l: "Notifiable" } : { c: T.ink3, l: "Assessed" };
          return [
            <tr key={b.id} onClick={() => setOpen(isOpen ? null : b.id)} style={{ cursor: "pointer" }}>
              <Td style={{ fontFamily: F.m, fontWeight: 700, color: T.ink }}>{b.id}<div style={{ fontSize: 9, color: T.ink4, marginTop: 2 }}>{b.incidentId || "historical"}</div></Td>
              <Td style={{ fontWeight: 700, color: T.ink, minWidth: 190 }}>{b.title}</Td>
              <Td style={{ color: T.ink3 }}>{b.system}</Td>
              <Td>{b.personalData ? <Pill c={AI_GOLD}>Yes</Pill> : <Pill c={T.ink3}>No</Pill>}</Td>
              <Td style={{ minWidth: 130 }}><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{regimesFor(b).map(r => <span key={r.id} style={{ fontSize: 9, fontWeight: 800, fontFamily: F.m, color: T.ink3, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 999, padding: "2px 7px" }}>{r.basis}</span>)}</div></Td>
              <Td><Pill c={tok(clk.tone)}>{clk.label}</Pill></Td>
              <Td><Pill c={decMeta.c}>{decMeta.l}</Pill></Td>
            </tr>,
            isOpen && <tr key={b.id + "-d"}><td colSpan={7} style={{ padding: "0 10px 12px" }}>
              <div style={{ background: AI_GOLD + "10", border: `1px solid ${AI_GOLD}30`, borderRadius: 10, padding: "11px 13px", fontSize: 11, color: T.ink2, fontFamily: F.b, lineHeight: 1.6 }}>
                <b style={{ color: AI_GOLD_INK }}>{b.id} · notification decision:</b> {b.rationale}
                <div style={{ marginTop: 7, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {regimesFor(b).map(r => <span key={r.id} style={{ fontSize: 10, fontFamily: F.b, color: T.ink3, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "3px 9px" }}><b style={{ color: T.ink2 }}>{r.regime} {r.basis}</b> · {r.who} · {r.deadline}</span>)}
                  <span style={{ fontSize: 10, fontFamily: F.b, color: T.ink3 }}>Owner: <b style={{ color: T.ink2 }}>{b.owner}</b></span>
                </div>
              </div>
            </td></tr>,
          ];
        })}
      </Table>
    </Card>

    {/* the workflow */}
    <Card style={cardPad}>
      <Eyebrow>The decision · five stages that produce the evidence</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>Assess → Scope → Decide → Notify → Log</H3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 10 }}>
        {NOTIFICATION_WORKFLOW.map(st => <div key={st.n} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 11, padding: "12px 13px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ width: 22, height: 22, borderRadius: 7, background: AI_GOLD + "1c", border: `1px solid ${AI_GOLD}45`, color: AI_GOLD_INK, fontFamily: F.m, fontWeight: 900, fontSize: 11, display: "grid", placeItems: "center" }}>{st.n}</span>
            <span style={{ fontSize: 12.5, fontWeight: 900, color: T.ink, fontFamily: F.h }}>{st.stage}</span>
          </div>
          <div style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.55, marginBottom: 6 }}>{st.crit}</div>
          <Pill c={T.blue}>{st.owner}</Pill>
        </div>)}
      </div>
      <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 10, background: AI_GOLD + "12", border: `1px solid ${AI_GOLD}30`, fontSize: 11, color: T.ink2, lineHeight: 1.6, fontFamily: F.b }}>
        <b style={{ color: AI_GOLD_INK }}>Veris Intelligence:</b> {s.notifiable ? <>{s.notifiable} breach is on the clock — the tightest window is <b style={{ color: T.ink2 }}>{clockLabel}</b>. CERT-In's 6-hour clock is met; the DPA and DPB notices are drafted and the affected-principal notice is in review against the 72-hour window.</> : <>No breach is currently notifiable. Every assessment is recorded, so the not-notifiable decisions are as defensible as the notifications.</>} This workflow is the control that satisfies GDPR Art. 33/34, EU AI Act Art. 73, India DPDP s. 8(6) and CERT-In at once.
      </div>
      <div style={{ display: "flex", gap: 9, marginTop: 14, flexWrap: "wrap" }}>
        <button onClick={() => showToast && showToast("Breach assessment started — regimes resolved, tightest clock running")} style={{ background: AI_GOLD, border: "none", borderRadius: 10, padding: "9px 15px", color: "#241703", fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>Start a breach assessment</button>
        <button onClick={() => showToast && showToast("Notification pack exported — authority notices + Art.33(5) register entry")} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 15px", color: T.ink2, fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>Export notification pack</button>
      </div>
    </Card>
  </div>;
}

/* ══════════════ 3 · CONVERGENCE CROSSWALK ══════════════ */
export function ConvergenceCrosswalk({ showToast }) {
  const s = crosswalkStats();
  const [statusF, setStatusF] = useState("all");
  const [domainF, setDomainF] = useState("all");
  const [open, setOpen] = useState(null);

  const rows = CROSSWALK.filter(c => (statusF === "all" || c.status === statusF) && (domainF === "all" || c.domain === domainF));
  const domainsShown = CROSSWALK_DOMAINS.filter(d => rows.some(c => c.domain === d));

  const kpis = [
    ["Capabilities", String(s.total), AI_GOLD, "one control each", "all"],
    ["Operational", String(s.operational), T.green, "evidenced & fresh", "operational"],
    ["In progress", String(s.progress), T.amber, "artifact being closed", "progress"],
    ["Gaps", String(s.gap), T.red, "no artifact yet", "gap"],
  ];
  const instTone = { crit: T.red, blue: T.blue, good: T.green, gold: AI_GOLD };

  return <div style={{ animation: "up .3s ease" }}>
    <Head title="Convergence Crosswalk" sub="One control set, not four. Each capability below is a single control — evidenced by a single artifact — that satisfies the matching clause in the EU AI Act, the NIST AI RMF, ISO/IEC 42001 and Singapore's Model AI Governance Framework at once. Build once instead of four times." />

    {/* Charter / reduction headline */}
    <Card style={{ ...cardPad, marginBottom: 14, background: `linear-gradient(135deg,${T.s2},${T.bg})`, border: `1px solid ${AI_GOLD}38` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ maxWidth: 620 }}>
          <Eyebrow style={{ color: AI_GOLD_INK }}>The master map</Eyebrow>
          <H3 style={{ fontSize: 18 }}>{s.obligations} framework obligations → {s.total} controls → {s.total} evidence artifacts</H3>
          <p style={{ fontSize: 11.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.65, margin: "6px 0 0" }}>{s.total} capabilities × {s.instruments} instruments collapse into one control set. Design controls from this sheet and every framework is satisfied by the same artifact — the reason the toolkit exists.</p>
        </div>
        <div style={{ textAlign: "center", background: T.s2, border: `1px solid ${AI_GOLD}45`, borderRadius: 12, padding: "12px 18px", minWidth: 120 }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: AI_GOLD_INK, fontFamily: F.m, lineHeight: 1 }}>{s.coverage}%</div>
          <div style={{ fontSize: 9.5, color: T.ink3, fontWeight: 800, fontFamily: F.b, marginTop: 4, letterSpacing: "0.04em" }}>CONVERGENCE COVERAGE</div>
        </div>
      </div>
    </Card>

    {/* KPI tiles double as status filters */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 14 }}>
      {kpis.map(([l, v, c, sub, key]) => <button key={l} onClick={() => setStatusF(key)} style={{ textAlign: "left", cursor: "pointer", background: statusF === key ? c + "12" : T.card, border: `1px solid ${statusF === key ? c + "66" : T.border}`, borderRadius: 12, padding: "13px 15px" }}>
        <Eyebrow>{l}</Eyebrow>
        <div style={{ fontSize: 26, fontWeight: 900, color: c, fontFamily: F.m, margin: "5px 0 2px" }}>{v}</div>
        <div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b }}>{sub}</div>
      </button>)}
    </div>

    {/* Instrument legend */}
    <Card style={{ ...cardPad, marginBottom: 14 }}>
      <Eyebrow>The four instruments · one system</Eyebrow>
      <H3 style={{ marginBottom: 10 }}>Binding law, a framework, a standard and guidance — mapped together</H3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
        {INSTRUMENTS.map(i => <div key={i.id} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 11, padding: "11px 13px", borderLeft: `3px solid ${instTone[i.tone]}` }}>
          <div style={{ fontSize: 12.5, fontWeight: 900, color: T.ink, fontFamily: F.h }}>{i.short || i.name}</div>
          <div style={{ margin: "5px 0 3px" }}><Pill c={instTone[i.tone]}>{i.kind}</Pill></div>
          <div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b }}>Enforced by {i.enforcer}</div>
        </div>)}
      </div>
    </Card>

    {/* Domain filter + table */}
    <Card style={cardPad}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
        <div><Eyebrow>The crosswalk · {rows.length} of {s.total} capabilities</Eyebrow><H3>One artifact satisfies all four — click any row</H3></div>
        <button onClick={() => showToast && showToast("Convergence crosswalk exported — 32 controls mapped across four instruments")} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 13px", color: T.ink2, fontSize: 11.5, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>Export crosswalk</button>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {["all", ...CROSSWALK_DOMAINS].map(d => <button key={d} onClick={() => setDomainF(d)} style={{ fontSize: 10.5, fontWeight: 800, fontFamily: F.b, cursor: "pointer", color: domainF === d ? "#241703" : T.ink2, background: domainF === d ? AI_GOLD : T.s2, border: `1px solid ${domainF === d ? AI_GOLD : T.border}`, borderRadius: 999, padding: "5px 12px" }}>{d === "all" ? "All domains" : d}</button>)}
      </div>

      {domainsShown.map(dom => <div key={dom} style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 900, color: AI_GOLD_INK, fontFamily: F.m, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>{dom}</div>
        <Table head={["Capability", "EU AI Act", "NIST AI RMF", "ISO 42001", "Singapore MGF", "Evidence artifact", "Owner", "Status"]}>
          {rows.filter(c => c.domain === dom).map(c => {
            const meta = STATUS_META[c.status];
            const isOpen = open === c.id;
            return [
              <tr key={c.id} onClick={() => setOpen(isOpen ? null : c.id)} style={{ cursor: "pointer" }}>
                <Td style={{ fontWeight: 700, color: T.ink, minWidth: 190 }}>{c.capability}</Td>
                <Td style={{ fontFamily: F.m, fontSize: 10.5, color: T.ink3, whiteSpace: "nowrap" }}>{c.euai}</Td>
                <Td style={{ fontFamily: F.m, fontSize: 10.5, color: T.ink3, whiteSpace: "nowrap" }}>{c.nist}</Td>
                <Td style={{ fontFamily: F.m, fontSize: 10.5, color: T.ink3, whiteSpace: "nowrap" }}>{c.iso}</Td>
                <Td style={{ fontFamily: F.m, fontSize: 10.5, color: T.ink3, whiteSpace: "nowrap" }}>{c.sg}</Td>
                <Td style={{ fontWeight: 700, color: T.ink2, minWidth: 150 }}>{c.artifact}</Td>
                <Td><Pill c={T.blue}>{c.owner}</Pill></Td>
                <Td><Pill c={tok(meta.tone)}>{meta.label}</Pill></Td>
              </tr>,
              isOpen && <tr key={c.id + "-d"}><td colSpan={8} style={{ padding: "0 10px 12px" }}>
                <div style={{ background: AI_GOLD + "10", border: `1px solid ${AI_GOLD}30`, borderRadius: 10, padding: "11px 13px", fontSize: 11, color: T.ink2, fontFamily: F.b, lineHeight: 1.6 }}>
                  <b style={{ color: AI_GOLD_INK }}>{c.id} · one control, four instruments:</b> {c.note} <span style={{ color: T.ink3 }}>The single <b style={{ color: T.ink2 }}>{c.artifact}</b> closes EU AI Act {c.euai}, NIST {c.nist}, ISO/IEC 42001 {c.iso} and Singapore MGF ({c.sg}) — owned by {c.owner}.</span>
                </div>
              </td></tr>,
            ];
          })}
        </Table>
      </div>)}

      <div style={{ marginTop: 6, padding: "11px 13px", borderRadius: 10, background: AI_GOLD + "12", border: `1px solid ${AI_GOLD}30`, fontSize: 11, color: T.ink2, lineHeight: 1.6, fontFamily: F.b }}>
        <b style={{ color: AI_GOLD_INK }}>Veris Intelligence:</b> {s.gap === 0 ? <>Every capability is owned and evidenced — <b style={{ color: T.ink2 }}>no unowned gaps remain</b>, and all five former gaps are now <b style={{ color: T.ink2 }}>operational</b> with their linked findings resolved (INC-1048 contained, RSK-005 treated, drift monitoring live). Convergence coverage is {s.coverage}%.</> : <>The {s.gap} open gaps are the same items the Risk Center and Incident register already flag. Closing one artifact clears the obligation in all four instruments at once.</>}
      </div>
    </Card>
  </div>;
}

/* ══════════════ 4 · PROHIBITED PRACTICES (Art. 5 red lines) ══════════════ */
export function ProhibitedPractices({ showToast }) {
  const s = prohibitedStats();
  const everyday = PROHIBITED_PRACTICES.find(p => p.everyday);
  const kpis = [
    ["Practices screened", String(s.total), AI_GOLD, "EU AI Act Art. 5"],
    ["Clear", String(s.clear), T.green, "no system in scope"],
    ["Under review", String(s.review), T.amber, "confirm before deploy"],
    ["Prohibited in use", String(s.flag), T.red, "would require a stop"],
  ];
  return <div style={{ animation: "up .3s ease" }}>
    <Head title="Prohibited Practices" sub="The eight red lines of EU AI Act Article 5. These are a stop, not a control: a system in scope is not governed, it is not deployed. Every system is screened here before any risk tiering begins." />

    <Card style={{ ...cardPad, marginBottom: 14, background: everyday ? `linear-gradient(135deg,${T.amber}14,${T.bg})` : T.card, border: `1px solid ${T.amber}45` }}>
      <Eyebrow style={{ color: T.amber }}>The one that catches ordinary companies</Eyebrow>
      <H3 style={{ fontSize: 17 }}>{everyday.practice} · {everyday.art}</H3>
      <p style={{ fontSize: 11.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.65, margin: "6px 0 0" }}>{everyday.catches} <b style={{ color: T.ink2 }}>In scope here:</b> {everyday.system}. {everyday.note}</p>
    </Card>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 14 }}>
      {kpis.map(([l, v, c, sub]) => <Card key={l} style={{ padding: "13px 15px" }}>
        <Eyebrow>{l}</Eyebrow>
        <div style={{ fontSize: 26, fontWeight: 900, color: c, fontFamily: F.m, margin: "5px 0 2px" }}>{v}</div>
        <div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b }}>{sub}</div>
      </Card>)}
    </div>

    <Card style={{ ...cardPad, marginBottom: 14 }}>
      <Eyebrow>The eight red lines · screened against the estate</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>Where the answer is stop, not control</H3>
      <Table head={["Article", "Prohibited practice", "What it catches", "System in scope", "Screen"]}>
        {PROHIBITED_PRACTICES.map(p => { const m = PP_RESULT_META[p.result]; return <tr key={p.id}>
          <Td style={{ fontFamily: F.m, color: T.ink3, whiteSpace: "nowrap" }}>{p.art}</Td>
          <Td style={{ fontWeight: 700, color: T.ink }}>{p.practice}{p.everyday && <Pill c={T.amber} >  everyday risk</Pill>}<div style={{ fontSize: 9.5, color: T.ink3, fontWeight: 500, marginTop: 3, maxWidth: 320, lineHeight: 1.45 }}>{p.note}</div></Td>
          <Td style={{ color: T.ink3, maxWidth: 240 }}>{p.catches}</Td>
          <Td style={{ color: p.system === "—" ? T.ink4 : T.ink2, fontWeight: p.system === "—" ? 500 : 700 }}>{p.system}</Td>
          <Td><Pill c={tok(m.tone)}>{m.label}</Pill></Td>
        </tr>; })}
      </Table>
    </Card>

    <Card style={cardPad}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div style={{ maxWidth: 620 }}>
          <Eyebrow style={{ color: s.attested ? T.green : T.amber }}>Prohibited-use attestation</Eyebrow>
          <H3 style={{ fontSize: 16 }}>{s.attested ? "Clear to attest — no prohibited use" : `Attestation blocked — ${s.review} practice under review`}</H3>
          <p style={{ fontSize: 11, color: T.ink3, fontFamily: F.b, lineHeight: 1.6, margin: "5px 0 0" }}>The attestation is the single evidence artifact that closes crosswalk capability C08 across all four instruments. It cannot be signed while any practice is under review.</p>
        </div>
        <button onClick={() => showToast && showToast(s.attested ? "Prohibited-use attestation signed and filed" : "Emotion-recognition review opened — Workforce owner + Legal notified")} style={{ background: s.attested ? T.green : T.amber, border: "none", borderRadius: 10, padding: "10px 15px", color: "#241703", fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer", whiteSpace: "nowrap" }}>{s.attested ? "✦ Sign attestation" : "Open the review"}</button>
      </div>
    </Card>
  </div>;
}

/* ══════════════ 5 · GPAI EXPOSURE (accidental-provider test) ══════════════ */
export function GpaiExposure({ showToast }) {
  const s = gpaiStats();
  const kpis = [
    ["GenAI systems assessed", String(s.assessed), AI_GOLD, `of ${s.total} in the register`],
    ["Likely provider", String(s.provider), T.red, "Art. 53/55 obligations"],
    ["Monitor", String(s.monitor), T.amber, "modified, not yet shared"],
    ["Deployer only", String(s.deployer), T.green, "no provider duty"],
  ];
  const yn = v => <Pill c={v ? AI_GOLD : T.ink3}>{v ? "Yes" : "No"}</Pill>;
  return <div style={{ animation: "up .3s ease" }}>
    <Head title="GPAI Exposure" sub="The accidental-provider test — EU AI Act Art. 53 & 55. Modify a general-purpose model and share it beyond the team that modified it, and you may hold provider obligations with no procurement or board decision ever taken. Two yes answers flag the system." />

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12, marginBottom: 14 }}>
      {GPAI_QUESTIONS.map((q, i) => <Card key={i} style={{ ...cardPad, borderLeft: `3px solid ${AI_GOLD}` }}>
        <Eyebrow style={{ color: AI_GOLD_INK }}>You answer</Eyebrow>
        <H3 style={{ fontSize: 15 }}>{q.q}</H3>
        <p style={{ fontSize: 11, color: T.ink3, fontFamily: F.b, lineHeight: 1.6, margin: "6px 0 0" }}>{q.detail}</p>
      </Card>)}
    </div>

    <Card style={{ ...cardPad, marginBottom: 14, background: `linear-gradient(135deg,${T.s2},${T.bg})`, border: `1px solid ${AI_GOLD}38` }}>
      <Eyebrow style={{ color: AI_GOLD_INK }}>The workbook derives</Eyebrow>
      <H3 style={{ fontSize: 16 }}>Your GPAI exposure</H3>
      <p style={{ fontSize: 11.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.65, margin: "6px 0 10px" }}>Two yes answers and the row flags. You may hold provider obligations under Articles 53 and 55.</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Pill c={T.red}>Modified + shared → likely provider · assess</Pill>
        <Pill c={T.amber}>Modified only → monitor</Pill>
        <Pill c={T.green}>Called, not modified → deployer only</Pill>
      </div>
    </Card>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 14 }}>
      {kpis.map(([l, v, c, sub]) => <Card key={l} style={{ padding: "13px 15px" }}>
        <Eyebrow>{l}</Eyebrow>
        <div style={{ fontSize: 26, fontWeight: 900, color: c, fontFamily: F.m, margin: "5px 0 2px" }}>{v}</div>
        <div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b }}>{sub}</div>
      </Card>)}
    </div>

    <Card style={cardPad}>
      <Eyebrow>GPAI exposure register · every GenAI system</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>Modified · shared beyond the team · derived exposure</H3>
      <Table head={["System", "Basis", "Modified?", "Shared beyond team?", "Exposure", "Obligation"]}>
        {GPAI_REGISTER.map(r => { const e = EXPOSURE_META[gpaiExposure(r)]; return <tr key={r.system}>
          <Td style={{ fontWeight: 700, color: T.ink }}>{r.system}</Td>
          <Td style={{ color: T.ink3, maxWidth: 240 }}>{r.basis}</Td>
          <Td>{r.gpai ? yn(r.modified) : <span style={{ color: T.ink4 }}>—</span>}</Td>
          <Td>{r.gpai ? yn(r.distributed) : <span style={{ color: T.ink4 }}>—</span>}</Td>
          <Td><Pill c={tok(e.tone)}>{e.label}</Pill></Td>
          <Td style={{ fontFamily: F.m, fontSize: 10.5, color: T.ink3 }}>{r.arts}</Td>
        </tr>; })}
      </Table>
      <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 10, background: AI_GOLD + "12", border: `1px solid ${AI_GOLD}30`, fontSize: 11, color: T.ink2, lineHeight: 1.6, fontFamily: F.b }}>
        <b style={{ color: AI_GOLD_INK }}>Veris Intelligence:</b> {s.provider} system carries likely GPAI provider obligations — the Customer Resolution Copilot was fine-tuned and rolled out enterprise-wide and into the product, which is exactly the accidental-provider path. Run the Art. 53 assessment before the next release; this closes crosswalk capability C24.
      </div>
      <div style={{ display: "flex", gap: 9, marginTop: 12, flexWrap: "wrap" }}>
        <button onClick={() => showToast && showToast("Art. 53 GPAI provider assessment started for Customer Resolution Copilot")} style={{ background: AI_GOLD, border: "none", borderRadius: 10, padding: "9px 15px", color: "#241703", fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>Run Art. 53 assessment</button>
        <button onClick={() => showToast && showToast("GPAI exposure register exported to Trust & Evidence")} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 15px", color: T.ink2, fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>Export register</button>
      </div>
    </Card>
  </div>;
}

/* ══════════════ 6 · GAP CLOSURE ══════════════ */
export function GapClosure({ showToast }) {
  const rows = gapClosureRows();
  const s = gapClosureStats();
  const kpis = [
    ["Unowned gaps left", String(s.remaining), s.remaining === 0 ? T.green : T.red, "across all 32 capabilities"],
    ["Closed outright", String(s.closed), T.green, "artifact operational"],
    ["In-flight closures", String(s.inflight), T.amber, "pending a live finding"],
    ["Convergence coverage", `${s.coverage}%`, AI_GOLD, "up from 55%"],
  ];
  return <div style={{ animation: "up .3s ease" }}>
    <Head title="Gap Closure" sub="The five capabilities the convergence crosswalk last flagged as gaps, turned into owned, evidenced closures — all now operational, with their linked findings resolved (INC-1048 contained, RSK-005 treated, drift monitoring live). Status is read from the crosswalk, so this workspace and the crosswalk never disagree." />

    <Card style={{ ...cardPad, marginBottom: 14, background: `linear-gradient(135deg,${T.green}12,${T.bg})`, border: `1px solid ${T.green}45` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ maxWidth: 640 }}>
          <Eyebrow style={{ color: T.green }}>Convergence complete</Eyebrow>
          <H3 style={{ fontSize: 18 }}>{s.remaining === 0 ? "No unowned gaps remain across the 32 capabilities" : `${s.remaining} unowned gaps remain`}</H3>
          <p style={{ fontSize: 11.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.65, margin: "6px 0 0" }}>Every capability is an owned control with a named evidence artifact, and all five closures are now operational — their linked findings resolved (INC-1048 contained, RSK-005 treated, drift monitoring live).</p>
        </div>
        <div style={{ textAlign: "center", background: T.s2, border: `1px solid ${T.green}45`, borderRadius: 12, padding: "12px 18px", minWidth: 120 }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: T.green, fontFamily: F.m, lineHeight: 1 }}>{s.coverage}%</div>
          <div style={{ fontSize: 9.5, color: T.ink3, fontWeight: 800, fontFamily: F.b, marginTop: 4, letterSpacing: "0.04em" }}>COVERAGE</div>
        </div>
      </div>
    </Card>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 14 }}>
      {kpis.map(([l, v, c, sub]) => <Card key={l} style={{ padding: "13px 15px" }}>
        <Eyebrow>{l}</Eyebrow>
        <div style={{ fontSize: 26, fontWeight: 900, color: c, fontFamily: F.m, margin: "5px 0 2px" }}>{v}</div>
        <div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b }}>{sub}</div>
      </Card>)}
    </div>

    <Card style={cardPad}>
      <Eyebrow>The five closures · owner · evidence artifact · what it clears</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>From gap to owned control</H3>
      <Table head={["Ref", "Capability", "Evidence artifact", "Owner", "Clears", "Article", "Target", "Status"]}>
        {rows.map(r => { const meta = STATUS_META[r.status]; return <tr key={r.ref}>
          <Td style={{ fontFamily: F.m, fontWeight: 700, color: T.ink }}>{r.ref}</Td>
          <Td style={{ fontWeight: 700, color: T.ink, minWidth: 160 }}>{r.capability}<div style={{ fontSize: 9.5, color: T.ink3, fontWeight: 500, marginTop: 3, maxWidth: 300, lineHeight: 1.45 }}>{r.action}</div></Td>
          <Td style={{ fontWeight: 700, color: T.ink2 }}>{r.artifact}</Td>
          <Td>{r.owner}</Td>
          <Td style={{ color: T.ink3, maxWidth: 200 }}>{r.clears}</Td>
          <Td style={{ fontFamily: F.m, fontSize: 10.5, color: T.ink3, whiteSpace: "nowrap" }}>{r.euai}</Td>
          <Td style={{ color: T.ink3, whiteSpace: "nowrap" }}>{r.target}</Td>
          <Td><Pill c={tok(meta.tone)}>{meta.label}</Pill></Td>
        </tr>; })}
      </Table>
      <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 10, background: AI_GOLD + "12", border: `1px solid ${AI_GOLD}30`, fontSize: 11, color: T.ink2, lineHeight: 1.6, fontFamily: F.b }}>
        <b style={{ color: AI_GOLD_INK }}>Veris Intelligence:</b> {s.closed} gaps closed outright and {s.inflight} are in-flight, owned and dated. The three in-flight closures are the same live items the Risk Center and Incident register track — closing INC-1048, RSK-005 and the drift wiring moves them to operational and lifts convergence coverage past {s.coverage}%.
      </div>
      <div style={{ display: "flex", gap: 9, marginTop: 12, flexWrap: "wrap" }}>
        <button onClick={() => showToast && showToast("Gap-closure pack assembled — 5 evidence artifacts, owners and target dates")} style={{ background: AI_GOLD, border: "none", borderRadius: 10, padding: "9px 15px", color: "#241703", fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>Assemble closure pack</button>
        <button onClick={() => showToast && showToast("Closure plan exported to Trust & Evidence")} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 15px", color: T.ink2, fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>Export closure plan</button>
      </div>
    </Card>
  </div>;
}

/* ══════════════ 7 · AI IMPACT ASSESSMENT (AIA · DPIA · FRIA) ══════════════ */
export function AIAssessment({ showToast }) {
  const s = aiaStats();
  const [open, setOpen] = useState(null);
  const kpis = [
    ["High-risk FRIA coverage", `${s.friaCoverage}%`, s.friaCoverage >= 100 ? T.green : T.amber, `${s.friaComplete}/${s.highRisk} high-risk systems`],
    ["DPIA coverage", `${s.dpiaCoverage}%`, s.dpiaCoverage >= 100 ? T.green : T.amber, `${s.dpiaComplete}/${s.dpia} with personal data`],
    ["Assessments complete", `${s.complete}/${s.assessed}`, AI_GOLD, `of ${s.governed} governed systems`],
    ["Residual risk retired", `−${s.residualCut}`, T.green, "across the assessed estate"],
  ];
  const dimStat = { Complete: T.green, "In review": T.amber, Gap: T.ink4 };
  const tierTone = t => t === "High-risk" ? T.red : t === "Limited-risk" ? T.amber : T.blue;
  return <div style={{ animation: "up .3s ease" }}>
    <Head title="Impact Assessments" sub="One assessment per AI system, run once and mapped to every regime that demands one — so the same record discharges the EU AI Act fundamental-rights assessment (Art. 27) and risk file (Art. 9), the GDPR DPIA (Art. 35), ISO 42001's system impact assessment, the NIST RMF Map function, Brazil's algorithmic impact assessment and Korea's high-impact assessment at once." />

    {/* charter */}
    <Card style={{ ...cardPad, marginBottom: 14, background: `linear-gradient(135deg,${T.s2},${T.bg})`, border: `1px solid ${AI_GOLD}38` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ maxWidth: 640 }}>
          <Eyebrow style={{ color: AI_GOLD_INK }}>Assess once, satisfy seven</Eyebrow>
          <H3 style={{ fontSize: 18 }}>One impact assessment, every regime that asks for one</H3>
          <p style={{ fontSize: 11.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.65, margin: "6px 0 0" }}>A fundamental-rights assessment, a DPIA and an algorithmic impact assessment are the same nine questions asked by four regulators. Answer them once per system, tie the mitigations to the Risk Center, and the FRIA, DPIA, ISO, NIST, Brazil and Korea obligations close together.</p>
        </div>
        <div style={{ textAlign: "center", background: T.s2, border: `1px solid ${AI_GOLD}45`, borderRadius: 12, padding: "12px 18px", minWidth: 130 }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: AI_GOLD_INK, fontFamily: F.m, lineHeight: 1 }}>{s.regimes}</div>
          <div style={{ fontSize: 9.5, color: T.ink3, fontWeight: 800, fontFamily: F.b, marginTop: 4, letterSpacing: "0.04em" }}>REGIMES DISCHARGED</div>
        </div>
      </div>
    </Card>

    {/* KPIs */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 14 }}>
      {kpis.map(([l, v, c, sub]) => <Card key={l} style={{ padding: "13px 15px" }}>
        <Eyebrow>{l}</Eyebrow>
        <div style={{ fontSize: 26, fontWeight: 900, color: c, fontFamily: F.m, margin: "5px 0 2px" }}>{v}</div>
        <div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b }}>{sub}</div>
      </Card>)}
    </div>

    {/* the register */}
    <Card style={{ ...cardPad, marginBottom: 14 }}>
      <Eyebrow>The register · one assessment per system</Eyebrow>
      <H3 style={{ marginBottom: 6 }}>Screen → assess → mitigate → sign-off — click any row for the dimensions</H3>
      <p style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b, margin: "0 0 12px", lineHeight: 1.5 }}>High-risk systems carry a full fundamental-rights assessment; limited-risk systems a proportionate one. Completeness is scored from the nine dimensions.</p>
      <Table head={["Ref", "System", "Tier", "Discharges", "Completeness", "Residual", "Status"]}>
        {AIA_REGISTER.map(a => {
          const c = aiaCompleteness(a);
          const st = aiaStatus(a);
          const isOpen = open === a.id;
          return [
            <tr key={a.id} onClick={() => setOpen(isOpen ? null : a.id)} style={{ cursor: "pointer" }}>
              <Td style={{ fontFamily: F.m, fontWeight: 700, color: T.ink }}>{a.id}</Td>
              <Td style={{ fontWeight: 700, color: T.ink, minWidth: 180 }}>{a.system}</Td>
              <Td><Pill c={tierTone(a.tier)}>{a.tier}</Pill></Td>
              <Td style={{ minWidth: 120 }}><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{aiaRegimesFor(a).slice(0, 4).map(r => <span key={r.id} style={{ fontSize: 9, fontWeight: 800, fontFamily: F.m, color: T.ink3, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 999, padding: "2px 7px" }}>{r.basis}</span>)}{a.regimes.length > 4 && <span style={{ fontSize: 9, color: T.ink4, fontFamily: F.m }}>+{a.regimes.length - 4}</span>}</div></Td>
              <Td style={{ minWidth: 120 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: T.s2, overflow: "hidden", minWidth: 60 }}><div style={{ width: `${c}%`, height: "100%", background: c >= 100 ? T.green : c >= 55 ? AI_GOLD : T.red }} /></div>
                  <span style={{ fontSize: 10.5, fontFamily: F.m, fontWeight: 700, color: T.ink2 }}>{c}%</span>
                </div>
              </Td>
              <Td style={{ fontFamily: F.m, color: T.ink3, whiteSpace: "nowrap" }}>{a.residualBefore} → <b style={{ color: T.green }}>{a.residualAfter}</b></Td>
              <Td><Pill c={tok(st.tone)}>{st.label}</Pill></Td>
            </tr>,
            isOpen && <tr key={a.id + "-d"}><td colSpan={7} style={{ padding: "0 10px 12px" }}>
              <div style={{ background: AI_GOLD + "10", border: `1px solid ${AI_GOLD}30`, borderRadius: 10, padding: "12px 13px" }}>
                <div style={{ fontSize: 11, color: T.ink2, fontFamily: F.b, lineHeight: 1.6, marginBottom: 9 }}><b style={{ color: AI_GOLD_INK }}>{a.id} · classification:</b> {a.classification}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 9 }}>{a.triggers.map(t => <span key={t} style={{ fontSize: 10, fontFamily: F.b, color: T.ink3, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "3px 9px" }}>{t}</span>)}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 6 }}>
                  {ASSESSMENT_DIMENSIONS.map(d => <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 8, background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 10px" }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: dimStat[a.dims[d.id]] || T.ink4, flexShrink: 0 }} />
                    <span style={{ fontSize: 10.5, color: T.ink2, fontFamily: F.b, flex: 1 }}>{d.label}</span>
                    <span style={{ fontSize: 9, fontFamily: F.m, fontWeight: 700, color: dimStat[a.dims[d.id]] || T.ink4 }}>{a.dims[d.id]}</span>
                  </div>)}
                </div>
                <div style={{ marginTop: 8, fontSize: 10, color: T.ink3, fontFamily: F.b }}>Owner: <b style={{ color: T.ink2 }}>{a.owner}</b> · discharges {aiaRegimesFor(a).map(r => `${r.regime} ${r.basis}`).join(" · ")}</div>
              </div>
            </td></tr>,
          ];
        })}
      </Table>
    </Card>

    {/* the workflow */}
    <Card style={cardPad}>
      <Eyebrow>The lifecycle · one assessment, six stages</Eyebrow>
      <H3 style={{ marginBottom: 12 }}>Screen → Assess → Consult → Mitigate → Sign-off → Review</H3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 10 }}>
        {ASSESSMENT_WORKFLOW.map(st => <div key={st.n} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 11, padding: "12px 13px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ width: 22, height: 22, borderRadius: 7, background: AI_GOLD + "1c", border: `1px solid ${AI_GOLD}45`, color: AI_GOLD_INK, fontFamily: F.m, fontWeight: 900, fontSize: 11, display: "grid", placeItems: "center" }}>{st.n}</span>
            <span style={{ fontSize: 12.5, fontWeight: 900, color: T.ink, fontFamily: F.h }}>{st.stage}</span>
          </div>
          <div style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b, lineHeight: 1.55, marginBottom: 6 }}>{st.crit}</div>
          <Pill c={T.blue}>{st.owner}</Pill>
        </div>)}
      </div>
      <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 10, background: AI_GOLD + "12", border: `1px solid ${AI_GOLD}30`, fontSize: 11, color: T.ink2, lineHeight: 1.6, fontFamily: F.b }}>
        <b style={{ color: AI_GOLD_INK }}>Veris Intelligence:</b> Both high-risk systems carry a complete fundamental-rights assessment, so the FRIA, DPIA, ISO 42001, NIST RMF Map, Brazil and Korea impact-assessment obligations are met from one record each — and the mitigations they name are the same treatments the Risk Center already tracks. The limited-risk assessments stay in review until those systems change scope.
      </div>
      <div style={{ display: "flex", gap: 9, marginTop: 14, flexWrap: "wrap" }}>
        <button onClick={() => showToast && showToast("New assessment screened — tier set, regimes in scope resolved")} style={{ background: AI_GOLD, border: "none", borderRadius: 10, padding: "9px 15px", color: "#241703", fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>Screen a new system</button>
        <button onClick={() => showToast && showToast("Assessment pack exported — FRIA + DPIA + AIA in one record")} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 15px", color: T.ink2, fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>Export assessment pack</button>
      </div>
    </Card>
  </div>;
}
