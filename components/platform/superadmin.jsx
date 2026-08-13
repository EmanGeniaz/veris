"use client";

import { useState } from "react";
import { T, F, AI_GOLD, AI_GOLD_INK, Card } from "./core";
import {
  SA_MODULE_GROUPS, SA_ALL_MODULE_IDS, SA_MODULE_COUNT, SA_AREAS, SA_CAPS, SA_CAP_META, SA_ROLES,
  SA_ORGS, SA_USERS, SA_POLICIES, SA_REGIONS, SA_PLANS, SA_CLEAN_BASELINE, slugify,
} from "@/lib/superadmin";

/* ── shared bits ── */
const Pill = ({ c, children }) => <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 9px", borderRadius: 999, fontSize: 10, fontWeight: 800, fontFamily: F.b, color: c, background: c + "18", border: `1px solid ${c}40` }}>{children}</span>;
const Eyebrow = ({ children, style }) => <div style={{ fontSize: 9, letterSpacing: "0.11em", textTransform: "uppercase", color: T.ink4, fontWeight: 900, fontFamily: F.m, ...style }}>{children}</div>;
const btn = (primary) => ({ background: primary ? AI_GOLD : T.s2, border: primary ? "none" : `1px solid ${T.border}`, borderRadius: 9, padding: "9px 15px", color: primary ? "#241703" : T.ink2, fontSize: 11.5, fontWeight: 900, fontFamily: F.b, cursor: "pointer" });
const field = { background: "#fff", border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 11px", color: T.ink, fontSize: 12, fontFamily: F.b, width: "100%", outline: "none" };
const Toggle = ({ on, onClick, disabled }) => <button onClick={disabled ? undefined : onClick} style={{ width: 38, height: 22, borderRadius: 999, border: "none", background: on ? T.green : T.ink4 + "66", position: "relative", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, transition: "background .15s", flexShrink: 0 }}><span style={{ position: "absolute", top: 2, left: on ? 18 : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .15s", boxShadow: "0 1px 3px rgba(0,0,0,.3)" }} /></button>;

export function PageSuperAdmin({ onSignOut, showToast }) {
  const [tab, setTab] = useState("orgs");
  const [orgs, setOrgs] = useState(SA_ORGS);
  const [sel, setSel] = useState(SA_ORGS[0].id);
  const [enabled, setEnabled] = useState(() => {
    const m = {}; SA_ORGS.forEach(o => { m[o.id] = new Set(SA_ALL_MODULE_IDS); }); return m;
  });
  const [locked, setLocked] = useState({});
  const [exp, setExp] = useState(new Set(["aicentral"]));
  const [users, setUsers] = useState(() => { const m = {}; SA_ORGS.forEach(o => { m[o.id] = (SA_USERS[o.id] || []).slice(); }); return m; });
  const [pol, setPol] = useState(() => { const m = {}; SA_ORGS.forEach(o => { m[o.id] = new Set(o.seeded ? SA_POLICIES.map(p => p.id) : []); }); return m; });
  const toast = msg => showToast && showToast(msg);

  const org = orgs.find(o => o.id === sel) || orgs[0];
  const enSet = enabled[org.id] || new Set();
  const lkSet = locked[org.id] || new Set();

  /* ── Organizations ── */
  const [nf, setNf] = useState({ name: "", region: "EU", plan: "Enterprise" });
  const createOrg = () => {
    const name = nf.name.trim(); if (!name) { toast("Enter an organization name"); return; }
    const slug = slugify(name); if (orgs.some(o => o.slug === slug)) { toast("An organization with that name already exists"); return; }
    const id = slug;
    const o = { id, name, slug, plan: nf.plan, region: nf.region, status: "Provisioning", seeded: false, users: 0, created: "just now" };
    setOrgs(v => [...v, o]);
    setEnabled(v => ({ ...v, [id]: new Set(SA_CLEAN_BASELINE) }));
    setLocked(v => ({ ...v, [id]: new Set() }));
    setUsers(v => ({ ...v, [id]: [] }));
    setPol(v => ({ ...v, [id]: new Set() }));
    setNf({ name: "", region: "EU", plan: "Enterprise" });
    setSel(id); setTab("modules");
    toast(`Organization “${name}” provisioned — clean tenant, no demo data. Enable its modules next.`);
  };

  /* ── Module access ── */
  const toggleMod = id => { if (lkSet.has(id)) return; setEnabled(v => { const s = new Set(v[org.id]); s.has(id) ? s.delete(id) : s.add(id); return { ...v, [org.id]: s }; }); };
  const toggleLock = id => setLocked(v => { const s = new Set(v[org.id] || []); s.has(id) ? s.delete(id) : s.add(id); return { ...v, [org.id]: s }; });
  const setGroup = (mods, on) => setEnabled(v => { const s = new Set(v[org.id]); mods.forEach(m => { if (!lkSet.has(m.id)) { on ? s.add(m.id) : s.delete(m.id); } }); return { ...v, [org.id]: s }; });

  /* ── Users ── */
  const [uf, setUf] = useState({ name: "", email: "", role: "employee", access: "view" });
  const addUser = () => {
    const name = uf.name.trim(), email = uf.email.trim(); if (!name || !email) { toast("Name and email required"); return; }
    const u = { id: `u-${org.id}-${Date.now()}`, name, email, role: uf.role, access: uf.access };
    setUsers(v => ({ ...v, [org.id]: [...(v[org.id] || []), u] }));
    setUf({ name: "", email: "", role: "employee", access: "view" });
    toast(`${name} added to ${org.name} as ${uf.role.toUpperCase()} · ${uf.access}`);
  };
  const setUser = (uid, patch) => setUsers(v => ({ ...v, [org.id]: v[org.id].map(u => u.id === uid ? { ...u, ...patch } : u) }));

  /* ── Policies ── */
  const togglePol = id => setPol(v => { const s = new Set(v[org.id]); const adding = !s.has(id); s.has(id) ? s.delete(id) : s.add(id); const p = SA_POLICIES.find(x => x.id === id); if (adding) toast(`${p.name} enabled — cascading to ${p.cascade.join(" · ")}`); return { ...v, [org.id]: s }; });

  const TABS = [["orgs", "Organizations"], ["modules", "Module Access"], ["users", "Users & RBAC"], ["policies", "Policies"]];
  const stat = (l, v, c) => <div><div style={{ fontSize: 22, fontWeight: 900, fontFamily: F.m, color: c }}>{v}</div><div style={{ fontSize: 9.5, color: T.ink3, fontFamily: F.b, textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</div></div>;

  return <div style={{ minHeight: "100vh", background: T.bg, color: T.ink, fontFamily: F.b }}>
    {/* top bar */}
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 24px", borderBottom: `1px solid ${T.border}`, background: "#0B0E1A", color: "#fff", position: "sticky", top: 0, zIndex: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontFamily: F.h, fontWeight: 900, fontSize: 16, letterSpacing: "-0.01em" }}>Veris<span style={{ color: AI_GOLD }}>Zone</span></span>
        <span style={{ fontSize: 9.5, fontWeight: 900, fontFamily: F.m, color: AI_GOLD, background: AI_GOLD + "1f", border: `1px solid ${AI_GOLD}55`, borderRadius: 999, padding: "3px 10px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Super Admin</span>
      </div>
      <div style={{ flex: 1 }} />
      <span style={{ fontSize: 11, color: "#AEB6C6", fontFamily: F.b }}>Platform operator · root@veriszone.ai</span>
      <button onClick={onSignOut} style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.18)", borderRadius: 8, padding: "7px 13px", color: "#fff", fontSize: 11, fontWeight: 800, fontFamily: F.b, cursor: "pointer" }}>Sign out</button>
    </div>

    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "22px 24px 60px" }}>
      {/* header + operator scope banner */}
      <div style={{ marginBottom: 6, fontFamily: F.h, fontSize: 25, fontWeight: 900, color: T.ink, letterSpacing: "-0.02em" }}>Platform Administration</div>
      <div style={{ marginBottom: 16, padding: "10px 13px", borderRadius: 10, background: AI_GOLD + "10", border: `1px solid ${AI_GOLD}30`, fontSize: 11.5, color: T.ink2, lineHeight: 1.55 }}>
        <b style={{ color: AI_GOLD_INK }}>Operator scope:</b> provision organizations, enable modules, define users &amp; RBAC, and set org-wide policies that cascade to every level. <b>You enable &amp; override — you do not author</b> initiatives, ideas, risks or content.
      </div>

      {/* tab nav */}
      <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
        {TABS.map(([id, label]) => <button key={id} onClick={() => setTab(id)} style={{ padding: "9px 16px", borderRadius: 9, fontSize: 12, fontWeight: 800, fontFamily: F.b, cursor: "pointer", border: `1px solid ${tab === id ? AI_GOLD : T.border}`, background: tab === id ? AI_GOLD + "18" : T.s2, color: tab === id ? AI_GOLD_INK : T.ink3 }}>{label}</button>)}
      </div>

      {/* org context selector (all tabs except orgs list operate on a selected org) */}
      {tab !== "orgs" && <Card style={{ padding: "12px 15px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Eyebrow>Organization</Eyebrow>
        <select value={sel} onChange={e => setSel(e.target.value)} style={{ ...field, width: "auto", minWidth: 240, cursor: "pointer" }}>{orgs.map(o => <option key={o.id} value={o.id}>{o.name} · {o.region}</option>)}</select>
        <Pill c={org.status === "Active" ? T.green : T.amber}>{org.status}</Pill>
        <Pill c={org.seeded ? T.blue : T.ink3}>{org.seeded ? "Seeded" : "Clean · no demo data"}</Pill>
        <span style={{ fontSize: 11, color: T.ink3, fontFamily: F.m }}>{org.plan} · {(enabled[org.id] || new Set()).size}/{SA_MODULE_COUNT} modules · {(users[org.id] || []).length} users</span>
      </Card>}

      {/* ══ ORGANIZATIONS ══ */}
      {tab === "orgs" && <div>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, alignItems: "start" }}>
          <Card style={{ padding: "16px 18px" }}>
            <Eyebrow style={{ marginBottom: 10 }}>Organizations · {orgs.length}</Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              {orgs.map(o => <div key={o.id} onClick={() => { setSel(o.id); setTab("modules"); }} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", borderRadius: 10, background: T.s2, border: `1px solid ${sel === o.id ? AI_GOLD + "55" : T.border}` }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: AI_GOLD + "1a", color: AI_GOLD_INK, display: "grid", placeItems: "center", fontWeight: 900, fontFamily: F.h, fontSize: 14 }}>{o.name[0]}</div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: T.ink }}>{o.name}</div>
                  <div style={{ fontSize: 10, color: T.ink3, fontFamily: F.m }}>{o.slug}.veriszone.ai · {o.region} · {o.plan}</div>
                </div>
                <Pill c={o.seeded ? T.blue : T.ink3}>{o.seeded ? "Seeded" : "Clean"}</Pill>
                <Pill c={o.status === "Active" ? T.green : T.amber}>{o.status}</Pill>
                <span style={{ fontSize: 11, color: T.ink3, fontFamily: F.m, minWidth: 74, textAlign: "right" }}>{o.users.toLocaleString()} users</span>
              </div>)}
            </div>
          </Card>
          <Card style={{ padding: "16px 18px", border: `1px solid ${AI_GOLD}40` }}>
            <Eyebrow style={{ color: AI_GOLD_INK, marginBottom: 3 }}>Create organization</Eyebrow>
            <div style={{ fontSize: 11, color: T.ink3, lineHeight: 1.5, marginBottom: 12 }}>Provisions a <b style={{ color: T.ink2 }}>clean tenant with no demo data</b>. You then enable its modules, add users and set policies.</div>
            <div style={{ display: "grid", gap: 10 }}>
              <label style={{ display: "grid", gap: 4 }}><Eyebrow>Organization name</Eyebrow><input value={nf.name} onChange={e => setNf({ ...nf, name: e.target.value })} placeholder="e.g. Contoso Insurance" style={field} /></label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <label style={{ display: "grid", gap: 4 }}><Eyebrow>Region</Eyebrow><select value={nf.region} onChange={e => setNf({ ...nf, region: e.target.value })} style={{ ...field, cursor: "pointer" }}>{SA_REGIONS.map(r => <option key={r}>{r}</option>)}</select></label>
                <label style={{ display: "grid", gap: 4 }}><Eyebrow>Plan</Eyebrow><select value={nf.plan} onChange={e => setNf({ ...nf, plan: e.target.value })} style={{ ...field, cursor: "pointer" }}>{SA_PLANS.map(p => <option key={p}>{p}</option>)}</select></label>
              </div>
              {nf.name.trim() && <div style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.m }}>Tenant: <b style={{ color: T.ink2 }}>{slugify(nf.name)}.veriszone.ai</b></div>}
              <button onClick={createOrg} style={btn(true)}>+ Provision clean organization</button>
            </div>
          </Card>
        </div>
      </div>}

      {/* ══ MODULE ACCESS ══ */}
      {tab === "modules" && <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: 12, color: T.ink3, lineHeight: 1.5, maxWidth: 640 }}>Enable which surfaces <b style={{ color: T.ink2 }}>{org.name}</b> can see — every AI Central module, every CXO workspace surface, the employee & manager workspaces and the governance platform ({SA_MODULE_COUNT} surfaces). Lock a surface to <b style={{ color: T.ink2 }}>override</b> and prevent org-level changes.</div>
          <div style={{ display: "flex", gap: 7 }}>
            <button onClick={() => setExp(new Set(SA_MODULE_GROUPS.map(g => g.id)))} style={btn(false)}>Expand all</button>
            <button onClick={() => setExp(new Set())} style={btn(false)}>Collapse all</button>
            <button onClick={() => setEnabled(v => ({ ...v, [org.id]: new Set(SA_ALL_MODULE_IDS.filter(id => !lkSet.has(id) || enSet.has(id))) }))} style={btn(false)}>Enable all</button>
            <button onClick={() => setEnabled(v => ({ ...v, [org.id]: new Set(SA_ALL_MODULE_IDS.filter(id => lkSet.has(id) && enSet.has(id))) }))} style={btn(false)}>Disable all</button>
          </div>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {SA_AREAS.map(area => { const groups = SA_MODULE_GROUPS.filter(g => g.area === area); if (!groups.length) return null;
            const aOn = groups.reduce((n, g) => n + g.modules.filter(m => enSet.has(m.id)).length, 0);
            const aTot = groups.reduce((n, g) => n + g.modules.length, 0);
            return <div key={area}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "6px 2px 8px" }}>
                <span style={{ fontSize: 9.5, fontWeight: 900, color: T.ink4, fontFamily: F.m, textTransform: "uppercase", letterSpacing: "0.12em" }}>{area}</span>
                <span style={{ flex: 1, height: 1, background: T.border }} />
                <span style={{ fontSize: 10, fontWeight: 800, color: aOn ? T.green : T.ink4, fontFamily: F.m }}>{aOn}/{aTot}</span>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {groups.map(g => { const on = g.modules.filter(m => enSet.has(m.id)).length; const isEx = exp.has(g.id); return <Card key={g.id} style={{ padding: "0" }}>
                  <div onClick={() => setExp(v => { const s = new Set(v); s.has(g.id) ? s.delete(g.id) : s.add(g.id); return s; })} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 15px", cursor: "pointer" }}>
                    <span style={{ fontSize: 11, color: T.ink4, width: 14, transition: "transform .15s", transform: isEx ? "rotate(90deg)" : "none" }}>▶</span>
                    <div><div style={{ fontSize: 13, fontWeight: 800, color: T.ink }}>{g.label}</div><div style={{ fontSize: 10, color: T.ink4, fontFamily: F.b }}>{g.note}</div></div>
                    <span style={{ flex: 1 }} />
                    <span style={{ fontSize: 10.5, fontWeight: 800, color: on ? T.green : T.ink4, fontFamily: F.m }}>{on}/{g.modules.length}</span>
                    <button onClick={e => { e.stopPropagation(); setGroup(g.modules, true); }} style={{ ...btn(false), padding: "5px 10px", fontSize: 10 }}>All</button>
                    <button onClick={e => { e.stopPropagation(); setGroup(g.modules, false); }} style={{ ...btn(false), padding: "5px 10px", fontSize: 10 }}>None</button>
                  </div>
                  {isEx && <div style={{ padding: "0 15px 14px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 8 }}>
                    {g.modules.map(m => { const isOn = enSet.has(m.id); const isLk = lkSet.has(m.id); return <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 11px", borderRadius: 9, background: T.s2, border: `1px solid ${isLk ? AI_GOLD + "55" : T.border}` }}>
                      <Toggle on={isOn} onClick={() => toggleMod(m.id)} disabled={isLk} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.label}</div>
                        <div style={{ fontSize: 9, color: T.ink4, fontFamily: F.m }}>{isLk ? "Locked · operator override" : isOn ? "Enabled" : "Disabled"}</div>
                      </div>
                      <button title="Lock / override" onClick={() => toggleLock(m.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: isLk ? AI_GOLD_INK : T.ink4, padding: 0 }}>{isLk ? "🔒" : "🔓"}</button>
                    </div>; })}
                  </div>}
                </Card>; })}
              </div>
            </div>; })}
        </div>
      </div>}

      {/* ══ USERS & RBAC ══ */}
      {tab === "users" && <div>
        <Card style={{ padding: "16px 18px", marginBottom: 14, border: `1px solid ${AI_GOLD}40` }}>
          <Eyebrow style={{ color: AI_GOLD_INK, marginBottom: 10 }}>Define a user</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.4fr .9fr .9fr auto", gap: 10, alignItems: "end" }}>
            <label style={{ display: "grid", gap: 4 }}><Eyebrow>Name</Eyebrow><input value={uf.name} onChange={e => setUf({ ...uf, name: e.target.value })} placeholder="Full name" style={field} /></label>
            <label style={{ display: "grid", gap: 4 }}><Eyebrow>Email</Eyebrow><input value={uf.email} onChange={e => setUf({ ...uf, email: e.target.value })} placeholder="name@org.com" style={field} /></label>
            <label style={{ display: "grid", gap: 4 }}><Eyebrow>Role</Eyebrow><select value={uf.role} onChange={e => setUf({ ...uf, role: e.target.value })} style={{ ...field, cursor: "pointer" }}>{SA_ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}</select></label>
            <label style={{ display: "grid", gap: 4 }}><Eyebrow>RBAC access</Eyebrow><select value={uf.access} onChange={e => setUf({ ...uf, access: e.target.value })} style={{ ...field, cursor: "pointer" }}>{SA_CAPS.map(c => <option key={c} value={c}>{SA_CAP_META[c].label}</option>)}</select></label>
            <button onClick={addUser} style={btn(true)}>+ Add user</button>
          </div>
        </Card>
        <Card style={{ padding: "16px 18px" }}>
          <Eyebrow style={{ marginBottom: 10 }}>{org.name} · users ({(users[org.id] || []).length})</Eyebrow>
          <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: F.b }}>
            <thead><tr>{["User", "Email", "Role", "RBAC access"].map(h => <th key={h} style={{ textAlign: "left", fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", color: T.ink4, fontWeight: 900, fontFamily: F.m, padding: "0 10px 9px", borderBottom: `1px solid ${T.border}` }}>{h}</th>)}</tr></thead>
            <tbody>{(users[org.id] || []).map(u => <tr key={u.id}>
              <td style={{ padding: "10px", borderBottom: `1px solid ${T.border}`, color: T.ink, fontWeight: 700 }}>{u.name}</td>
              <td style={{ padding: "10px", borderBottom: `1px solid ${T.border}`, color: T.ink3, fontFamily: F.m, fontSize: 11 }}>{u.email}</td>
              <td style={{ padding: "10px", borderBottom: `1px solid ${T.border}` }}><select value={u.role} onChange={e => setUser(u.id, { role: e.target.value })} style={{ ...field, width: "auto", padding: "5px 8px", fontSize: 11, cursor: "pointer" }}>{SA_ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}</select></td>
              <td style={{ padding: "10px", borderBottom: `1px solid ${T.border}` }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><Pill c={SA_CAP_META[u.access].color}>{SA_CAP_META[u.access].label}</Pill><select value={u.access} onChange={e => setUser(u.id, { access: e.target.value })} style={{ ...field, width: "auto", padding: "5px 8px", fontSize: 11, cursor: "pointer" }}>{SA_CAPS.map(c => <option key={c} value={c}>{SA_CAP_META[c].label}</option>)}</select></div></td>
            </tr>)}{!(users[org.id] || []).length && <tr><td colSpan={4} style={{ padding: "16px 10px", color: T.ink4, fontSize: 12 }}>No users yet — define one above.</td></tr>}</tbody>
          </table></div>
        </Card>
      </div>}

      {/* ══ POLICIES ══ */}
      {tab === "policies" && <div>
        <div style={{ fontSize: 12, color: T.ink3, lineHeight: 1.5, maxWidth: 700, marginBottom: 12 }}>Enable org-wide policies for <b style={{ color: T.ink2 }}>{org.name}</b>. An enabled policy <b style={{ color: T.ink2 }}>auto-implements down every level</b> — executive, manager and employee — and is enforced at the gateway.</div>
        <div style={{ display: "grid", gap: 10 }}>
          {SA_POLICIES.map(p => { const on = (pol[org.id] || new Set()).has(p.id); return <Card key={p.id} style={{ padding: "13px 15px", border: `1px solid ${on ? T.green + "44" : T.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <Toggle on={on} onClick={() => togglePol(p.id)} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.ink }}>{p.name} <span style={{ fontSize: 9.5, color: T.ink4, fontFamily: F.m, fontWeight: 700 }}>· {p.id}</span></div>
                <div style={{ fontSize: 10.5, color: T.ink3, fontFamily: F.b, marginTop: 1 }}>{p.category} · {p.scope}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {on ? <>
                  <span style={{ fontSize: 9.5, color: T.ink4, fontFamily: F.m, fontWeight: 800 }}>Cascades to</span>
                  {p.cascade.map(l => <Pill key={l} c={T.green}>{l}</Pill>)}
                </> : <Pill c={T.ink4}>Not enabled</Pill>}
              </div>
            </div>
          </Card>; })}
        </div>
      </div>}
    </div>
  </div>;
}
