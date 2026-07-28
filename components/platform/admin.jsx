"use client";

/* ── Admin Portal ───────────────────────────────────────────────────
   Veris is a governance platform, so administration is governance-grade,
   not a plain user table: identities, roles and a full RBAC matrix, plus
   the controls that make access defensible — segregation of duties,
   least-privilege flags, access recertification, and an admin audit trail.
   Everything an admin does mints an audit record. */

import { useState, useEffect } from "react";
import { pushBus, readBus, writeBus } from "@/lib/bus";
import { T, F, AI_GOLD, RC, ROLES, USER_PROFILES, Card, SHead, Tag, CountUp } from "./core";

/* ── RBAC model ── */
const MODULES = [
  ["ac", "AI Central"], ["risk", "Risk Center"], ["comp", "Compliance & Policies"],
  ["rep", "Reports & Value"], ["acad", "Academy"], ["dec", "Decisions & Approvals"], ["admin", "Administration"],
];
const CAPS = ["none", "view", "contribute", "approve", "admin"];
const capMeta = {
  none:       { label: "—",          c: () => T.ink4 },
  view:       { label: "View",       c: () => T.blue },
  contribute: { label: "Contribute", c: () => T.teal },
  approve:    { label: "Approve",    c: () => AI_GOLD },
  admin:      { label: "Admin",      c: () => T.violet },
};
const RBAC_ROLES = ["caio", "cgo", "ciso", "cdpo", "cro", "cio", "ceo", "coo", "cfo", "chro", "legal", "manager", "employee"];
const DEFAULT_ACCESS = {
  caio:    { ac: "admin",      risk: "approve", comp: "approve", rep: "view",    acad: "view",       dec: "approve",    admin: "admin" },
  cgo:     { ac: "view",       risk: "approve", comp: "admin",   rep: "view",    acad: "view",       dec: "approve",    admin: "contribute" },
  ciso:    { ac: "view",       risk: "admin",   comp: "approve", rep: "view",    acad: "view",       dec: "contribute", admin: "contribute" },
  cdpo:    { ac: "view",       risk: "approve", comp: "approve", rep: "view",    acad: "view",       dec: "contribute", admin: "none" },
  cro:     { ac: "view",       risk: "approve", comp: "approve", rep: "view",    acad: "view",       dec: "approve",    admin: "none" },
  cio:     { ac: "admin",      risk: "view",    comp: "view",    rep: "view",    acad: "view",       dec: "contribute", admin: "admin" },
  ceo:     { ac: "view",       risk: "view",    comp: "view",    rep: "approve", acad: "view",       dec: "approve",    admin: "view" },
  coo:     { ac: "contribute", risk: "view",    comp: "view",    rep: "view",    acad: "view",       dec: "contribute", admin: "none" },
  cfo:     { ac: "view",       risk: "view",    comp: "view",    rep: "approve", acad: "view",       dec: "contribute", admin: "none" },
  chro:    { ac: "view",       risk: "view",    comp: "view",    rep: "view",    acad: "admin",      dec: "contribute", admin: "none" },
  legal:   { ac: "view",       risk: "view",    comp: "approve", rep: "view",    acad: "view",       dec: "contribute", admin: "none" },
  manager: { ac: "view",       risk: "none",    comp: "view",    rep: "view",    acad: "contribute", dec: "contribute", admin: "none" },
  employee:{ ac: "none",       risk: "none",    comp: "view",    rep: "none",    acad: "contribute", dec: "none",       admin: "none" },
};

/* ── Seed directory (derived from the identity profiles) ── */
const seedUsers = () => {
  const base = RBAC_ROLES.map(r => {
    const p = USER_PROFILES[r] || {};
    return { id: r, name: p.name || (ROLES[r] || {}).name || r, email: p.email || `${r}@veriszone.ai`, roleId: r,
      unit: p.department || "—", status: "Active", mfa: true, last: "Today" };
  });
  const extra = [
    { id: "u-leila", name: "Leila Haddad", email: "leila.haddad@veriszone.ai", roleId: "manager", unit: "Customer Operations", status: "Active", mfa: false, last: "2h ago" },
    { id: "u-omar", name: "Omar Khan", email: "omar.khan@veriszone.ai", roleId: "employee", unit: "Risk & Compliance", status: "Active", mfa: true, last: "Yesterday" },
    { id: "u-sam", name: "Sam Doe", email: "sam.doe@veriszone.ai", roleId: "employee", unit: "Engineering", status: "Invited", mfa: false, last: "—" },
    { id: "u-dana", name: "Dana Ford", email: "dana.ford@veriszone.ai", roleId: "employee", unit: "Finance", status: "Suspended", mfa: true, last: "31d ago" },
  ];
  return [...base, ...extra];
};

const SEED_REQUESTS = [
  { id: "req-1", who: "Leila Haddad", roleFrom: "Manager", roleTo: "Contributor · Risk Center", by: "Deepa Nair (CRO)", reason: "Owns 2 risk treatments; needs edit on the register.", risk: "warn" },
  { id: "req-2", who: "Omar Khan", roleFrom: "Employee", roleTo: "Approver · Compliance", by: "Aisha Patel (CAIO)", reason: "Policy review delegation for Q3 cycle.", risk: "crit" },
  { id: "req-3", who: "Sam Doe", roleFrom: "—", roleTo: "Employee · standard workspace", by: "Riley Chen (Manager)", reason: "New hire onboarding.", risk: "info" },
];
const SEED_RECERT = [
  { id: "rc-1", who: "Marcus Reid (CIO)", scope: "Administration · Admin", note: "Privileged access — last certified 190 days ago.", due: "Overdue 12d", risk: "crit" },
  { id: "rc-2", who: "Aisha Patel (CAIO)", scope: "AI Central · Admin", note: "Standing quarterly review.", due: "Due in 6d", risk: "warn" },
  { id: "rc-3", who: "Jordan Sinclair (CISO)", scope: "Risk Center · Admin", note: "Standing quarterly review.", due: "Due in 9d", risk: "warn" },
];
const SEED_SOD = [
  { id: "sod-1", title: "Author & approver on AI risks", who: "Aisha Patel (CAIO)", detail: "Can both raise a risk and approve its treatment — a segregation-of-duties conflict under ISO 42001 C.8.3.", sev: "crit" },
  { id: "sod-2", title: "Platform admin + change approver", who: "Marcus Reid (CIO)", detail: "Holds Administration:Admin and Decisions:Contribute — self-approval path for access changes.", sev: "warn" },
];
const SEED_AUDIT = [
  { at: "09:42", actor: "System", action: "Access review cycle opened", target: "Q3 recertification" },
  { at: "08:15", actor: "Aisha Patel", action: "Granted Approve", target: "CRO · Decisions" },
  { at: "Yesterday", actor: "Marcus Reid", action: "Invited user", target: "sam.doe@veriszone.ai" },
];
const SEED_ORG = {
  name: "VerisZone Enterprise", domains: "veriszone.ai, veriszone.com", sso: "Okta (SAML 2.0)", scim: true, mfa: true,
  session: "30", region: "EU / US", evidence: "7 years", logRetention: "400", approvalDual: true, ipAllowlist: false, dpo: "Niamh Lynch",
};
/* Admin state persists to the bus (localStorage now; mirrors to the API when a
   database is configured). The audit trail additionally hash-chains server-side. */
const K = { users: "vz-admin-users", access: "vz-admin-access", requests: "vz-admin-requests", recert: "vz-admin-recert", sod: "vz-admin-sod", org: "vz-admin-org", audit: "vz-admin-audit" };

export function PageAdmin({ role = "caio", showToast, setTab }) {
  const [view, setView] = useState("overview");
  const [users, setUsers] = useState(() => readBus(K.users, seedUsers()));
  const [access, setAccess] = useState(() => readBus(K.access, DEFAULT_ACCESS));
  const [requests, setRequests] = useState(() => readBus(K.requests, SEED_REQUESTS));
  const [recert, setRecert] = useState(() => readBus(K.recert, SEED_RECERT));
  const [sod, setSod] = useState(() => readBus(K.sod, SEED_SOD));
  const [audit, setAudit] = useState(() => readBus(K.audit, SEED_AUDIT));
  /* mirror each slice to the bus on change so admin state survives reload */
  useEffect(() => writeBus(K.users, users), [users]);
  useEffect(() => writeBus(K.access, access), [access]);
  useEffect(() => writeBus(K.requests, requests), [requests]);
  useEffect(() => writeBus(K.recert, recert), [recert]);
  useEffect(() => writeBus(K.sod, sod), [sod]);
  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState("All");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invite, setInvite] = useState({ name: "", email: "", roleId: "employee", unit: "" });
  const [org, setOrg] = useState(() => readBus(K.org, SEED_ORG));
  useEffect(() => writeBus(K.org, org), [org]);

  const R = ROLES[role] || ROLES.caio;
  const myAdmin = (DEFAULT_ACCESS[role] || {}).admin || "none";
  const log = (action, target) => { const rec = { at: "Just now", actor: R.name, action, target }; setAudit(a => [rec, ...a].slice(0, 40)); pushBus(K.audit, rec); };
  const evidence = (item, detail) => pushBus("vz-gw-evidence", { item, initiative: "Administration", scope: "Organization", control: "RBAC / IAM", risk: "Access governance", owner: R.name, status: "Complete", approval: "Recorded", version: "v1", time: "Just now" });
  const act = (action, target, toast) => { log(action, target); evidence(`Admin: ${action} — ${target}`); showToast && showToast(toast || `${action} — recorded`); };

  const roleLabel = id => (ROLES[id] || {}).label || id;
  const initials = n => n.split(" ").map(x => x[0]).join("").slice(0, 2).toUpperCase();
  const statusColor = s => s === "Active" ? T.green : s === "Invited" ? T.blue : s === "Suspended" ? T.red : T.ink3;

  /* derived */
  const activeUsers = users.filter(u => u.status === "Active").length;
  const mfaCov = Math.round(users.filter(u => u.mfa).length / users.length * 100);
  const filtered = users.filter(u => (statusF === "All" || u.status === statusF) && (!q.trim() || `${u.name} ${u.email} ${roleLabel(u.roleId)} ${u.unit}`.toLowerCase().includes(q.trim().toLowerCase())));

  const TABS = [["overview", "Overview"], ["users", "Users"], ["roles", "Roles & Access"], ["requests", "Requests & Reviews"], ["org", "Organization"]];

  /* ── shared bits ── */
  const Kpi = ({ l, v, c, s }) => <Card style={{ padding: 14 }}>
    <div style={{ fontSize: 9, color: T.ink4, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 900, fontFamily: F.m, marginBottom: 8 }}>{l}</div>
    <div style={{ fontSize: 22, fontWeight: 900, fontFamily: F.m, color: c || T.ink }}>{typeof v === "number" ? <CountUp value={v} /> : v}</div>
    {s && <div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b, marginTop: 3 }}>{s}</div>}
  </Card>;
  const Field = ({ label, children }) => <label style={{ display: "grid", gap: 5 }}>
    <span style={{ fontSize: 9, fontWeight: 900, fontFamily: F.m, letterSpacing: "0.1em", textTransform: "uppercase", color: T.ink4 }}>{label}</span>{children}
  </label>;
  const fieldStyle = { background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 11px", color: T.ink, fontSize: 12, fontFamily: F.b, width: "100%", outline: "none" };
  const Toggle = ({ on, onClick }) => <button onClick={onClick} style={{ width: 40, height: 23, borderRadius: 20, border: "none", cursor: "pointer", background: on ? T.green : T.border, position: "relative", transition: "background .18s", flexShrink: 0 }}>
    <span style={{ position: "absolute", top: 2.5, left: on ? 19 : 2.5, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .18s", boxShadow: "0 1px 3px rgba(0,0,0,.3)" }} />
  </button>;

  return <div style={{ animation: "up .3s ease" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
      <SHead title="Admin Portal" sub="Governance-grade administration — identities, roles and RBAC, with segregation of duties, least-privilege and access recertification. Every action is audited." />
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 9, padding: "8px 12px" }}>
        <span style={{ fontSize: 9, color: T.ink4, fontFamily: F.m, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>Your admin level</span>
        <Tag label={capMeta[myAdmin].label} color={capMeta[myAdmin].c()} bg={capMeta[myAdmin].c() + "18"} />
      </div>
    </div>

    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "14px 0" }}>
      {TABS.map(([id, l]) => <button key={id} onClick={() => setView(id)} style={{ padding: "7px 15px", borderRadius: 20, fontSize: 11.5, fontWeight: 800, fontFamily: F.b, cursor: "pointer", border: `1px solid ${view === id ? AI_GOLD : T.border}`, background: view === id ? AI_GOLD : T.s2, color: view === id ? "#0b0e24" : T.ink3 }}>{l}</button>)}
    </div>

    {/* ══ OVERVIEW ══ */}
    {view === "overview" && <div style={{ animation: "up .2s ease" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 14 }}>
        <Kpi l="Users" v={users.length} c={T.blue} s={`${activeUsers} active`} />
        <Kpi l="Roles" v={RBAC_ROLES.length} c={T.violet} s="RBAC-governed" />
        <Kpi l="Access requests" v={requests.length} c={AI_GOLD} s="awaiting approval" />
        <Kpi l="Reviews due" v={recert.length} c={T.amber} s="recertification" />
        <Kpi l="SoD conflicts" v={sod.length} c={sod.length ? T.red : T.green} s="segregation of duties" />
        <Kpi l="MFA coverage" v={`${mfaCov}%`} c={mfaCov >= 90 ? T.green : T.amber} s="of all users" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 12, marginBottom: 12 }}>
        <Card style={{ padding: 16 }}>
          <h3 style={{ fontFamily: F.h, fontSize: 14, fontWeight: 800, color: T.ink, margin: "0 0 10px" }}>Needs attention</h3>
          <div style={{ display: "grid", gap: 8 }}>
            {[["Privileged access overdue for recertification", "Marcus Reid (CIO) · Administration:Admin", T.red, () => setView("requests")],
              ["Segregation-of-duties conflict open", `${sod.length} unresolved`, T.amber, () => setView("roles")],
              [`${users.filter(u => !u.mfa).length} users without MFA`, "Enforce in Organization → Security", T.amber, () => setView("org")]].map(([t, d, c, go]) =>
              <button key={t} onClick={go} style={{ textAlign: "left", background: T.s2, border: `1px solid ${T.border}`, borderLeft: `3px solid ${c}`, borderRadius: 9, padding: "10px 12px", cursor: "pointer" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: T.ink, fontFamily: F.b }}>{t}</div>
                <div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b, marginTop: 2 }}>{d} →</div>
              </button>)}
          </div>
        </Card>
        <Card style={{ padding: 16 }}>
          <h3 style={{ fontFamily: F.h, fontSize: 14, fontWeight: 800, color: T.ink, margin: "0 0 10px" }}>Admin audit trail</h3>
          <div style={{ display: "grid", gap: 0 }}>
            {audit.slice(0, 8).map((a, i) => <div key={i} style={{ display: "grid", gridTemplateColumns: "72px 1fr", gap: 10, padding: "7px 0", borderBottom: i < 7 ? `1px solid ${T.border}` : "none" }}>
              <span style={{ fontSize: 9.5, color: T.ink4, fontFamily: F.m, fontWeight: 700 }}>{a.at}</span>
              <span style={{ fontSize: 10.5, color: T.ink2, fontFamily: F.b, lineHeight: 1.5 }}><b style={{ color: T.ink }}>{a.actor}</b> · {a.action} · <span style={{ color: T.ink3 }}>{a.target}</span></span>
            </div>)}
          </div>
        </Card>
      </div>
    </div>}

    {/* ══ USERS ══ */}
    {view === "users" && <div style={{ animation: "up .2s ease" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search users..." style={{ ...fieldStyle, width: 220 }} />
        {["All", "Active", "Invited", "Suspended"].map(s => <button key={s} onClick={() => setStatusF(s)} style={{ background: statusF === s ? T.blue + "18" : T.s2, border: `1px solid ${statusF === s ? T.blue + "45" : T.border}`, borderRadius: 999, padding: "6px 12px", color: statusF === s ? T.blue : T.ink3, fontSize: 10.5, fontWeight: 800, fontFamily: F.b, cursor: "pointer" }}>{s}</button>)}
        <button onClick={() => setInviteOpen(o => !o)} style={{ marginLeft: "auto", background: inviteOpen ? "transparent" : AI_GOLD, border: `1px solid ${AI_GOLD}${inviteOpen ? "" : "00"}`, borderRadius: 8, padding: "8px 15px", color: inviteOpen ? AI_GOLD : "#0b0e24", fontSize: 11, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>{inviteOpen ? "Close" : "+ Invite user"}</button>
      </div>
      {inviteOpen && <Card style={{ padding: 16, marginBottom: 12, border: `1px solid ${AI_GOLD}45`, animation: "up .2s ease" }}>
        <h3 style={{ fontSize: 13, color: T.ink, fontWeight: 800, margin: "0 0 10px" }}>Invite a user</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 10, marginBottom: 12 }}>
          <Field label="Full name"><input value={invite.name} onChange={e => setInvite({ ...invite, name: e.target.value })} placeholder="e.g. Alex Rivera" style={fieldStyle} /></Field>
          <Field label="Work email"><input value={invite.email} onChange={e => setInvite({ ...invite, email: e.target.value })} placeholder="alex@veriszone.ai" style={fieldStyle} /></Field>
          <Field label="Role"><select value={invite.roleId} onChange={e => setInvite({ ...invite, roleId: e.target.value })} style={{ ...fieldStyle, cursor: "pointer" }}>{RBAC_ROLES.map(r => <option key={r} value={r}>{roleLabel(r)}</option>)}</select></Field>
          <Field label="Business unit"><input value={invite.unit} onChange={e => setInvite({ ...invite, unit: e.target.value })} placeholder="e.g. Finance" style={fieldStyle} /></Field>
        </div>
        <button onClick={() => {
          if (!invite.name.trim() || !invite.email.trim()) { showToast && showToast("Name and email are required", "error"); return; }
          const u = { id: `u-${Date.now().toString(36)}`, name: invite.name.trim(), email: invite.email.trim(), roleId: invite.roleId, unit: invite.unit || "—", status: "Invited", mfa: false, last: "—" };
          setUsers(us => [u, ...us]); setInviteOpen(false); act("Invited user", u.email, `Invitation sent to ${u.email}`);
          setInvite({ name: "", email: "", roleId: "employee", unit: "" });
        }} style={{ background: AI_GOLD, border: "none", borderRadius: 8, padding: "9px 15px", color: "#0b0e24", fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>Send invitation</button>
      </Card>}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5, fontFamily: F.b }}>
          <thead><tr>{["User", "Role", "Business unit", "MFA", "Status", "Last active", ""].map(h => <th key={h} style={{ textAlign: "left", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: T.ink4, fontWeight: 900, fontFamily: F.m, padding: "11px 12px", borderBottom: `1px solid ${T.border}` }}>{h}</th>)}</tr></thead>
          <tbody>{filtered.map((u, i) => <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none" }}>
            <td style={{ padding: "10px 12px" }}><div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${RC(u.roleId) || T.blue},${AI_GOLD})`, display: "grid", placeItems: "center", fontSize: 9.5, fontWeight: 900, color: "#fff", fontFamily: F.m, flexShrink: 0 }}>{initials(u.name)}</span>
              <span><span style={{ display: "block", fontWeight: 700, color: T.ink }}>{u.name}</span><span style={{ display: "block", fontSize: 9.5, color: T.ink4, fontFamily: F.m }}>{u.email}</span></span>
            </div></td>
            <td style={{ padding: "10px 12px" }}><select value={u.roleId} onChange={e => { const nr = e.target.value; setUsers(us => us.map(x => x.id === u.id ? { ...x, roleId: nr } : x)); act("Changed role", `${u.name} → ${roleLabel(nr)}`); }} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 7, padding: "5px 8px", color: T.ink2, fontSize: 11, fontFamily: F.b, cursor: "pointer" }}>{RBAC_ROLES.map(r => <option key={r} value={r}>{roleLabel(r)}</option>)}</select></td>
            <td style={{ padding: "10px 12px", color: T.ink3 }}>{u.unit}</td>
            <td style={{ padding: "10px 12px" }}>{u.mfa ? <Tag label="On" color={T.green} bg={T.green + "16"} /> : <Tag label="Off" color={T.red} bg={T.red + "16"} />}</td>
            <td style={{ padding: "10px 12px" }}><Tag label={u.status} color={statusColor(u.status)} bg={statusColor(u.status) + "16"} /></td>
            <td style={{ padding: "10px 12px", color: T.ink4, fontFamily: F.m, fontSize: 10 }}>{u.last}</td>
            <td style={{ padding: "10px 12px", textAlign: "right" }}><button onClick={() => { const ns = u.status === "Suspended" ? "Active" : "Suspended"; setUsers(us => us.map(x => x.id === u.id ? { ...x, status: ns } : x)); act(ns === "Suspended" ? "Suspended user" : "Reactivated user", u.name); }} style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: 7, padding: "5px 10px", color: u.status === "Suspended" ? T.green : T.red, fontSize: 10, fontWeight: 800, fontFamily: F.b, cursor: "pointer" }}>{u.status === "Suspended" ? "Reactivate" : "Suspend"}</button></td>
          </tr>)}</tbody>
        </table></div>
      </Card>
    </div>}

    {/* ══ ROLES & ACCESS (RBAC matrix + SoD) ══ */}
    {view === "roles" && <div style={{ animation: "up .2s ease" }}>
      <Card style={{ padding: 16, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
          <div><h3 style={{ fontFamily: F.h, fontSize: 14, fontWeight: 800, color: T.ink, margin: 0 }}>RBAC matrix — role × module capability</h3>
            <span style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b }}>Click a cell to change the capability. Least privilege by default; every change is logged.</span></div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{CAPS.map(c => <span key={c} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9.5, color: T.ink3, fontFamily: F.b, fontWeight: 700 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: capMeta[c].c() }} />{capMeta[c].label}</span>)}</div>
        </div>
        <div style={{ overflowX: "auto", marginTop: 8 }}><table style={{ borderCollapse: "collapse", fontSize: 11, fontFamily: F.b, minWidth: 720 }}>
          <thead><tr><th style={{ textAlign: "left", padding: "6px 10px", fontSize: 9, color: T.ink4, fontFamily: F.m, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em" }}>Role</th>
            {MODULES.map(([k, l]) => <th key={k} style={{ padding: "6px 8px", fontSize: 8.5, color: T.ink4, fontFamily: F.m, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center", minWidth: 88 }}>{l}</th>)}</tr></thead>
          <tbody>{RBAC_ROLES.map(r => <tr key={r}>
            <td style={{ padding: "6px 10px", fontWeight: 800, color: T.ink, whiteSpace: "nowrap" }}>{roleLabel(r)}</td>
            {MODULES.map(([k]) => { const cap = (access[r] || {})[k] || "none"; const col = capMeta[cap].c(); return <td key={k} style={{ padding: "4px 6px", textAlign: "center" }}>
              <button onClick={() => { const nx = CAPS[(CAPS.indexOf(cap) + 1) % CAPS.length]; setAccess(a => ({ ...a, [r]: { ...a[r], [k]: nx } })); act("Set capability", `${roleLabel(r)} · ${k} → ${capMeta[nx].label}`); }}
                title="Click to change" style={{ width: "100%", background: cap === "none" ? "transparent" : col + "18", border: `1px solid ${cap === "none" ? T.border : col + "50"}`, borderRadius: 7, padding: "5px 6px", color: cap === "none" ? T.ink4 : col, fontSize: 10, fontWeight: 800, fontFamily: F.b, cursor: "pointer" }}>{capMeta[cap].label}</button>
            </td>; })}
          </tr>)}</tbody>
        </table></div>
      </Card>
      <Card style={{ padding: 16 }}>
        <h3 style={{ fontFamily: F.h, fontSize: 14, fontWeight: 800, color: T.ink, margin: "0 0 4px" }}>Segregation of duties</h3>
        <span style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b }}>Toxic capability combinations that let one identity both act and self-approve.</span>
        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          {sod.length === 0 && <div style={{ fontSize: 11.5, color: T.green, fontFamily: F.b, padding: "8px 2px" }}>✓ No open segregation-of-duties conflicts.</div>}
          {sod.map(s => <div key={s.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center", background: T.s2, border: `1px solid ${(s.sev === "crit" ? T.red : T.amber) + "40"}`, borderLeft: `3px solid ${s.sev === "crit" ? T.red : T.amber}`, borderRadius: 9, padding: "11px 13px" }}>
            <div><div style={{ fontSize: 12, fontWeight: 800, color: T.ink, fontFamily: F.b }}>{s.title} <span style={{ color: T.ink3, fontWeight: 600 }}>· {s.who}</span></div>
              <div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b, marginTop: 2, lineHeight: 1.5 }}>{s.detail}</div></div>
            <button onClick={() => { setSod(x => x.filter(y => y.id !== s.id)); act("Resolved SoD conflict", s.who); }} style={{ background: T.violet + "16", border: `1px solid ${T.violet}45`, borderRadius: 7, padding: "7px 12px", color: T.violet, fontSize: 10.5, fontWeight: 800, fontFamily: F.b, cursor: "pointer", flexShrink: 0 }}>Resolve</button>
          </div>)}
        </div>
      </Card>
    </div>}

    {/* ══ REQUESTS & REVIEWS ══ */}
    {view === "requests" && <div style={{ animation: "up .2s ease" }}>
      <Card style={{ padding: 16, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontFamily: F.h, fontSize: 14, fontWeight: 800, color: T.ink, margin: 0 }}>Access requests</h3>
          <Tag label={`${requests.length} pending`} color={requests.length ? AI_GOLD : T.ink3} bg={(requests.length ? AI_GOLD : T.ink3) + "16"} />
        </div>
        {requests.length === 0 && <div style={{ fontSize: 11.5, color: T.ink3, fontFamily: F.b, padding: "8px 2px" }}>No access requests are waiting.</div>}
        <div style={{ display: "grid", gap: 8 }}>
          {requests.map(r => <div key={r.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 10, alignItems: "center", background: T.s2, border: `1px solid ${T.border}`, borderLeft: `3px solid ${r.risk === "crit" ? T.red : r.risk === "warn" ? T.amber : T.blue}`, borderRadius: 9, padding: "11px 13px" }}>
            <div><div style={{ fontSize: 12, fontWeight: 800, color: T.ink, fontFamily: F.b }}>{r.who} · <span style={{ color: AI_GOLD }}>{r.roleTo}</span></div>
              <div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b, marginTop: 2 }}>{r.roleFrom !== "—" ? `from ${r.roleFrom} · ` : ""}requested by {r.by} · {r.reason}</div></div>
            <button onClick={() => { setRequests(x => x.filter(y => y.id !== r.id)); act("Approved access request", `${r.who} → ${r.roleTo}`, `Approved · ${r.who}`); }} style={{ background: T.green + "18", border: `1px solid ${T.green}45`, borderRadius: 7, padding: "7px 13px", color: T.green, fontSize: 10.5, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>Approve</button>
            <button onClick={() => { setRequests(x => x.filter(y => y.id !== r.id)); act("Denied access request", `${r.who} → ${r.roleTo}`, `Denied · ${r.who}`); }} style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: 7, padding: "7px 13px", color: T.ink3, fontSize: 10.5, fontWeight: 800, fontFamily: F.b, cursor: "pointer" }}>Deny</button>
          </div>)}
        </div>
      </Card>
      <Card style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <h3 style={{ fontFamily: F.h, fontSize: 14, fontWeight: 800, color: T.ink, margin: 0 }}>Access recertification</h3>
          <Tag label={`${recert.length} due`} color={recert.length ? T.amber : T.green} bg={(recert.length ? T.amber : T.green) + "16"} />
        </div>
        <span style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b }}>Periodic review of privileged access — certify to keep, revoke to remove.</span>
        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          {recert.length === 0 && <div style={{ fontSize: 11.5, color: T.green, fontFamily: F.b }}>✓ All access reviews are current.</div>}
          {recert.map(rc => <div key={rc.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 10, alignItems: "center", background: T.s2, border: `1px solid ${T.border}`, borderRadius: 9, padding: "11px 13px" }}>
            <div><div style={{ fontSize: 12, fontWeight: 800, color: T.ink, fontFamily: F.b }}>{rc.who}</div>
              <div style={{ fontSize: 10, color: T.ink3, fontFamily: F.b, marginTop: 2 }}>{rc.scope} · {rc.note}</div></div>
            <Tag label={rc.due} color={rc.risk === "crit" ? T.red : T.amber} bg={(rc.risk === "crit" ? T.red : T.amber) + "16"} />
            <button onClick={() => { setRecert(x => x.filter(y => y.id !== rc.id)); act("Certified access", rc.who, `Access certified · ${rc.who}`); }} style={{ background: T.green + "18", border: `1px solid ${T.green}45`, borderRadius: 7, padding: "7px 12px", color: T.green, fontSize: 10.5, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>Certify</button>
            <button onClick={() => { setRecert(x => x.filter(y => y.id !== rc.id)); act("Revoked access", rc.who, `Access revoked · ${rc.who}`); }} style={{ background: "transparent", border: `1px solid ${T.red}45`, borderRadius: 7, padding: "7px 12px", color: T.red, fontSize: 10.5, fontWeight: 800, fontFamily: F.b, cursor: "pointer" }}>Revoke</button>
          </div>)}
        </div>
      </Card>
    </div>}

    {/* ══ ORGANIZATION ══ */}
    {view === "org" && <div style={{ animation: "up .2s ease", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 12 }}>
      <Card style={{ padding: 16 }}>
        <h3 style={{ fontFamily: F.h, fontSize: 14, fontWeight: 800, color: T.ink, margin: "0 0 12px" }}>Identity & SSO</h3>
        <div style={{ display: "grid", gap: 11 }}>
          <Field label="Identity provider"><input value={org.sso} onChange={e => setOrg({ ...org, sso: e.target.value })} style={fieldStyle} /></Field>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 11.5, color: T.ink2, fontFamily: F.b, fontWeight: 600 }}>Require MFA for all users</span><Toggle on={org.mfa} onClick={() => { setOrg(o => ({ ...o, mfa: !o.mfa })); act("Changed setting", `Require MFA → ${!org.mfa ? "on" : "off"}`); }} /></div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 11.5, color: T.ink2, fontFamily: F.b, fontWeight: 600 }}>SCIM auto-provisioning</span><Toggle on={org.scim} onClick={() => { setOrg(o => ({ ...o, scim: !o.scim })); act("Changed setting", `SCIM → ${!org.scim ? "on" : "off"}`); }} /></div>
          <Field label="Session timeout (minutes)"><select value={org.session} onChange={e => { setOrg({ ...org, session: e.target.value }); act("Changed setting", `Session timeout → ${e.target.value}m`); }} style={{ ...fieldStyle, cursor: "pointer" }}>{["15", "30", "60", "120"].map(s => <option key={s} value={s}>{s}</option>)}</select></Field>
        </div>
      </Card>
      <Card style={{ padding: 16 }}>
        <h3 style={{ fontFamily: F.h, fontSize: 14, fontWeight: 800, color: T.ink, margin: "0 0 12px" }}>Security & change control</h3>
        <div style={{ display: "grid", gap: 11 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 11.5, color: T.ink2, fontFamily: F.b, fontWeight: 600 }}>Dual approval for role changes</span><Toggle on={org.approvalDual} onClick={() => { setOrg(o => ({ ...o, approvalDual: !o.approvalDual })); act("Changed setting", `Dual approval → ${!org.approvalDual ? "on" : "off"}`); }} /></div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 11.5, color: T.ink2, fontFamily: F.b, fontWeight: 600 }}>IP allow-list for admin</span><Toggle on={org.ipAllowlist} onClick={() => { setOrg(o => ({ ...o, ipAllowlist: !o.ipAllowlist })); act("Changed setting", `IP allow-list → ${!org.ipAllowlist ? "on" : "off"}`); }} /></div>
          <Field label="Log retention (days)"><input value={org.logRetention} onChange={e => setOrg({ ...org, logRetention: e.target.value })} style={fieldStyle} /></Field>
          <div style={{ fontSize: 10, color: T.ink4, fontFamily: F.b, lineHeight: 1.5 }}>Admin actions are hash-chained into the tamper-evident audit log.</div>
        </div>
      </Card>
      <Card style={{ padding: 16 }}>
        <h3 style={{ fontFamily: F.h, fontSize: 14, fontWeight: 800, color: T.ink, margin: "0 0 12px" }}>Organization & data</h3>
        <div style={{ display: "grid", gap: 11 }}>
          <Field label="Organization name"><input value={org.name} onChange={e => setOrg({ ...org, name: e.target.value })} style={fieldStyle} /></Field>
          <Field label="Verified domains"><input value={org.domains} onChange={e => setOrg({ ...org, domains: e.target.value })} style={fieldStyle} /></Field>
          <Field label="Data residency"><select value={org.region} onChange={e => { setOrg({ ...org, region: e.target.value }); act("Changed setting", `Data residency → ${e.target.value}`); }} style={{ ...fieldStyle, cursor: "pointer" }}>{["EU / US", "EU only", "US only", "APAC", "Global"].map(s => <option key={s} value={s}>{s}</option>)}</select></Field>
          <Field label="Evidence retention"><select value={org.evidence} onChange={e => { setOrg({ ...org, evidence: e.target.value }); act("Changed setting", `Evidence retention → ${e.target.value}`); }} style={{ ...fieldStyle, cursor: "pointer" }}>{["90 days", "1 year", "3 years", "7 years", "10 years"].map(s => <option key={s} value={s}>{s}</option>)}</select></Field>
          <Field label="Data Protection Officer"><input value={org.dpo} onChange={e => setOrg({ ...org, dpo: e.target.value })} style={fieldStyle} /></Field>
        </div>
      </Card>
      <Card style={{ padding: 16 }}>
        <h3 style={{ fontFamily: F.h, fontSize: 14, fontWeight: 800, color: T.ink, margin: "0 0 6px" }}>Compliance posture</h3>
        <span style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b }}>Frameworks this organization is governed against.</span>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "12px 0" }}>{["ISO 42001", "ISO 27001", "EU AI Act", "GDPR", "SOC 2", "NIST AI RMF"].map(f => <Tag key={f} label={f} color={T.blue} bg={T.blue + "14"} />)}</div>
        <button onClick={() => { act("Saved organization settings", org.name, "Organization settings saved"); if (setTab) setTab("admin"); }} style={{ marginTop: 6, background: AI_GOLD, border: "none", borderRadius: 8, padding: "10px 16px", color: "#0b0e24", fontSize: 12, fontWeight: 900, fontFamily: F.b, cursor: "pointer" }}>Save organization settings</button>
      </Card>
    </div>}
  </div>;
}
