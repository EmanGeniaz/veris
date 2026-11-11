/* ── Estate map — what depends on what, from keys the registers already share ──
   The Command Deck's Estate view answers "if this changes, what is affected?"
   without inventing relationships. Every edge here comes from a field an
   existing record already carries:

     agent  → AI system   agent.initiativeId           (the system runs the agent)
     agent  → model       agent.model                  (the agent uses the model)
     agent  → data        agent.dataScopes[]           (the agent reads the data)
     risk   → AI system   risk.initiativeId, else exact risk.system name
     KRI    → AI system   kri.initiativeId
     incident → AI system incident.initiativeId, else exact incident.system name
     control → AI system  initiative.controls[]
     control → agent      agent.tools[].control (granted tools only)
     policy → AI system   initiative.policies[]

   Names are matched exactly; nothing is fuzzy-joined. Typed relationships in
   the Evidence Fabric are a proposed capability (#166) — until then this is a
   derived view, and the UI says so.

   Dependency edges point from the dependant to what it depends on, so impact
   ("what breaks if X changes") is a reverse traversal. Governance edges
   (risk, KRI, incident, control, policy) attach to what they govern and are
   reported alongside the impact, never traversed through. */

const norm = s => String(s ?? "").trim();
const slug = s => norm(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const LAYERS = ["model", "data", "agent", "system"];
export const GOVERNANCE = ["risk", "kri", "incident", "control", "policy"];

export function buildEstate({ initiatives = [], agents = [], risks = [], kris = [], incidents = [] } = {}) {
  const nodes = new Map();
  const edges = [];
  const seenEdge = new Set();
  const add = (id, type, label, record = null) => {
    if (!nodes.has(id)) nodes.set(id, { id, type, label: norm(label) || id, record });
    return id;
  };
  const link = (from, to, rel, kind) => {
    const k = `${from}|${to}|${rel}`;
    if (from === to || seenEdge.has(k)) return;
    seenEdge.add(k); edges.push({ from, to, rel, kind });
  };

  const sysById = new Map();
  const sysByName = new Map();
  for (const i of initiatives) {
    if (!i || !norm(i.id)) continue;
    const id = add(`system:${norm(i.id)}`, "system", i.name, i);
    sysById.set(norm(i.id), id);
    if (norm(i.name)) sysByName.set(norm(i.name), id);
  }
  // A record names its system by initiative id, or else by exact name. A name
  // with no initiative becomes a system node of its own (it is still a real,
  // recorded AI system — it just has no lifecycle record yet).
  const systemFor = (initiativeId, name) => {
    if (norm(initiativeId) && sysById.has(norm(initiativeId))) return sysById.get(norm(initiativeId));
    const n = norm(name);
    if (!n) return null;
    if (!sysByName.has(n)) sysByName.set(n, add(`system:name:${slug(n)}`, "system", n, null));
    return sysByName.get(n);
  };

  for (const a of agents) {
    if (!a || !norm(a.id)) continue;
    const ag = add(`agent:${norm(a.id)}`, "agent", a.name, a);
    const sys = systemFor(a.initiativeId, a.initiative);
    if (sys) link(sys, ag, "runs", "dep");
    if (norm(a.model)) link(ag, add(`model:${slug(a.model)}`, "model", a.model), "uses", "dep");
    for (const d of a.dataScopes || []) if (norm(d)) link(ag, add(`data:${slug(d)}`, "data", d), "reads", "dep");
    for (const t of a.tools || []) {
      if (t && t.granted && norm(t.control)) link(add(`control:${norm(t.control)}`, "control", t.control), ag, `governs ${norm(t.name)}`, "gov");
    }
  }
  for (const i of initiatives) {
    const sys = sysById.get(norm(i?.id));
    if (!sys) continue;
    for (const c of i.controls || []) if (norm(c)) link(add(`control:${norm(c)}`, "control", c), sys, "applies to", "gov");
    for (const p of i.policies || []) if (norm(p)) link(add(`policy:${slug(p)}`, "policy", p), sys, "governs", "gov");
  }
  for (const r of risks) {
    if (!r || !norm(r.id)) continue;
    const sys = systemFor(r.initiativeId, r.system);
    if (sys) link(add(`risk:${norm(r.id)}`, "risk", `${norm(r.id)} ${norm(r.title)}`, r), sys, "on", "gov");
  }
  for (const k of kris) {
    if (!k || !norm(k.id)) continue;
    const sys = systemFor(k.initiativeId, null);
    if (sys) link(add(`kri:${norm(k.id)}`, "kri", `${norm(k.id)} ${norm(k.name)}`, k), sys, "measures", "gov");
  }
  for (const x of incidents) {
    if (!x || !norm(x.id)) continue;
    const sys = systemFor(x.initiativeId, x.system);
    if (sys) link(add(`incident:${norm(x.id)}`, "incident", `${norm(x.id)} ${norm(x.title)}`, x), sys, "on", "gov");
  }
  return { nodes: [...nodes.values()], edges };
}

/* Impact of changing one node. Returns the affected nodes (dependants, plus
   the data an affected agent reads), the governance attached to them, and for
   each affected node the dependency path back to the changed one. Selecting a
   governance node (e.g. a control) starts from what it governs. */
export function impactOf(estate, id) {
  const empty = { affected: [], governance: [], paths: {} };
  if (!estate || !Array.isArray(estate.nodes)) return empty;
  const byId = new Map(estate.nodes.map(n => [n.id, n]));
  const start = byId.get(id);
  if (!start) return empty;
  const dep = estate.edges.filter(e => e.kind === "dep");
  const gov = estate.edges.filter(e => e.kind === "gov");

  const paths = { [id]: [] };
  const hit = new Set([id]);
  let frontier = [id];
  if (GOVERNANCE.includes(start.type)) {
    frontier = gov.filter(e => e.from === id).map(e => e.to);
    frontier.forEach(t => { hit.add(t); paths[t] = [{ from: id, rel: "governs", to: t }]; });
  }
  while (frontier.length) {
    const next = [];
    for (const f of frontier) {
      for (const e of dep) {
        if (e.to === f && !hit.has(e.from)) { hit.add(e.from); paths[e.from] = [...paths[f], e]; next.push(e.from); }
      }
    }
    frontier = next;
  }
  // An affected agent's other dependencies are exposed too (e.g. the data it reads).
  for (const e of dep) {
    if (hit.has(e.from) && byId.get(e.from)?.type === "agent" && byId.get(e.to)?.type === "data" && !hit.has(e.to)) {
      hit.add(e.to); paths[e.to] = [...(paths[e.from] || []), { from: e.from, rel: e.rel, to: e.to, exposed: true }];
    }
  }
  const governance = [...new Set(gov.filter(e => hit.has(e.to) && e.from !== id).map(e => e.from))];
  hit.delete(id);
  const order = t => [...LAYERS, ...GOVERNANCE].indexOf(t);
  const sortIds = ids => ids.map(x => byId.get(x)).filter(Boolean)
    .sort((a, b) => order(a.type) - order(b.type) || a.label.localeCompare(b.label)).map(n => n.id);
  return { affected: sortIds([...hit]), governance: sortIds(governance), paths };
}

/* Governance attached directly to one node, grouped by type. */
export function governanceOf(estate, id) {
  const out = {};
  if (!estate) return out;
  const byId = new Map(estate.nodes.map(n => [n.id, n]));
  for (const e of estate.edges) {
    if (e.kind === "gov" && e.to === id) {
      const n = byId.get(e.from);
      if (n) (out[n.type] = out[n.type] || []).push(n);
    }
  }
  return out;
}
