/* ── Mission Control — the deck's control-room lens ──────────────────────────
   Pure helpers behind the Mission Control tab. Each one reads records the
   platform already has (portfolio, risk register, approvals, evidence, the
   estate map, the live enforcement stream, provider spend) and never invents
   a value: no record in, no figure out. In particular there are no
   "vs yesterday" trends, because the workspace keeps no daily history for
   those figures; the only time series is the live enforcement stream. */

const norm = s => String(s ?? "").trim();

/* AI systems in production (incl. scaling) vs the whole portfolio. */
export function systemsInProduction(portfolio = []) {
  const rows = portfolio.filter(Boolean);
  return {
    total: rows.length,
    inProduction: rows.filter(p => /production|scaling/i.test(norm(p.stage))).length,
    inBuild: rows.filter(p => /progress|build|pilot/i.test(norm(p.stage))).length,
  };
}

const CLOSED = /complete|monitored|closed/i;
/* Risk register by level, plus how many high/critical are still open. */
export function riskBreakdown(risks = []) {
  const out = { Critical: 0, High: 0, Medium: 0, Low: 0, total: 0, openCritical: 0, openHigh: 0 };
  for (const r of risks) {
    if (!r) continue;
    const lvl = /^crit/i.test(norm(r.level)) ? "Critical" : /^high/i.test(norm(r.level)) ? "High" : /^med/i.test(norm(r.level)) ? "Medium" : "Low";
    out[lvl] += 1; out.total += 1;
    if (!CLOSED.test(norm(r.status))) { if (lvl === "Critical") out.openCritical += 1; if (lvl === "High") out.openHigh += 1; }
  }
  return out;
}

const RISK_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
/* Today's governance queue: decisions waiting on this person first (most
   severe first), then overdue evidence, then evidence coming due. */
export function governanceQueue({ approvals = [], evidence = [] } = {}, { limit = 5 } = {}) {
  const ap = approvals.filter(Boolean).map(a => ({
    id: `approval:${norm(a.id)}`, kind: "approval", tone: norm(a.risk).toLowerCase() || "medium",
    when: norm(a.time) || "Pending", title: norm(a.title) || "Decision awaiting you", who: [norm(a.risk), norm(a.clause)].filter(Boolean).join(" · "),
  })).sort((x, y) => (RISK_ORDER[x.tone] ?? 9) - (RISK_ORDER[y.tone] ?? 9));
  const ev = evidence.filter(e => e && (e.freshness === "stale" || e.freshness === "due")).map(e => ({
    id: `evidence:${norm(e.id)}`, kind: "evidence", tone: e.freshness === "stale" ? "overdue" : "due",
    when: e.freshness === "stale" ? `Overdue · ${norm(e.due)}` : `Due ${norm(e.due)}`, title: norm(e.artifact), who: `Evidence · owner ${norm(e.owner) || "unassigned"}`,
  })).sort((x, y) => (x.tone === "overdue" ? 0 : 1) - (y.tone === "overdue" ? 0 : 1));
  return [...ap, ...ev].slice(0, Math.max(0, limit));
}

/* Cumulative allowed vs stopped over the live enforcement stream. "Stopped"
   is a block; a hand-off to a human is counted separately, never as allowed. */
export function liveSeries(events = [], { window = 30 } = {}) {
  let a = 0, s = 0, h = 0;
  const pts = [];
  for (const e of events) {
    if (!e) continue;
    if (e.outcome === "allow") a += 1; else if (e.outcome === "block") s += 1; else if (e.outcome === "escalate") h += 1;
    pts.push({ allowed: a, stopped: s, held: h, total: a + s + h });
  }
  return pts.slice(-Math.max(1, window));
}

/* Lane layout for the estate floor: four lanes (models, data, agents, AI
   systems), nodes spread along each lane, plus the governance load (risks +
   incidents) on each AI system. Positions are unitless 0..1. */
export const LANES = ["model", "data", "agent", "system"];
const LANE_U = { model: 0.07, data: 0.29, agent: 0.52, system: 0.74 };
export function estateLayout(estate) {
  const nodes = (estate?.nodes || []).filter(n => LANES.includes(n.type)).map(n => ({ id: n.id, type: n.type, label: n.label }));
  const byId = new Map(nodes.map(n => [n.id, n]));
  for (const t of LANES) {
    const lane = nodes.filter(n => n.type === t).sort((a, b) => a.label.localeCompare(b.label));
    lane.forEach((n, i) => { n.u = LANE_U[t]; n.v = 0.1 + (lane.length === 1 ? 0.4 : (i / (lane.length - 1)) * 0.8); });
  }
  const edges = (estate?.edges || []).filter(e => e.kind === "dep" && byId.has(e.from) && byId.has(e.to));
  const load = {};
  const types = new Map((estate?.nodes || []).map(n => [n.id, n.type]));
  for (const e of estate?.edges || []) {
    if (e.kind !== "gov" || !byId.has(e.to)) continue;
    const t = types.get(e.from);
    if (t === "risk" || t === "incident") (load[e.to] = load[e.to] || { risk: 0, incident: 0 })[t] += 1;
  }
  return { nodes, edges, load };
}

/* Provider spend as shares of the month, largest first. */
export function spendShare(rows = [], { limit = 4 } = {}) {
  const list = rows.filter(r => r && Number.isFinite(r.cost) && r.cost >= 0);
  const total = list.reduce((s, r) => s + r.cost, 0);
  return list.sort((a, b) => b.cost - a.cost).slice(0, Math.max(0, limit)).map(r => ({
    id: r.id, name: r.name, cost: r.cost, overBudget: !!r.overBudget, utilization: r.utilization ?? null,
    share: total ? Math.round((r.cost / total) * 100) : 0,
  }));
}
