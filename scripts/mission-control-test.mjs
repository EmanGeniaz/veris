/* GenVeris · Mission Control tests (Command Deck → Mission Control)
   Locks the control-room figures to the records they come from: nothing is
   invented from empty input, closed risks are not counted as open, the queue
   puts the most severe decision first, the live series counts a hand-off to a
   human separately from "allowed", and the map layout draws only recorded
   dependency links. Run: npx tsx scripts/mission-control-test.mjs */
const M = await import("../lib/mission-control.js");
const { buildEstate } = await import("../lib/estate-map.js");

const R = [];
const check = (name, cond) => { R.push([cond ? "PASS" : "FAIL", name]); };

{ // nothing invented
  check("empty portfolio → zeros", JSON.stringify(M.systemsInProduction()) === JSON.stringify({ total: 0, inProduction: 0, inBuild: 0 }));
  check("empty risks → zeros", M.riskBreakdown().total === 0 && M.riskBreakdown([]).openCritical === 0);
  check("empty queue → no items", M.governanceQueue().length === 0);
  check("empty stream → no points", M.liveSeries().length === 0);
  check("missing estate → empty layout", M.estateLayout(null).nodes.length === 0 && M.estateLayout(undefined).edges.length === 0);
  check("no spend rows → no bars", M.spendShare().length === 0);
}
{ // systems in production
  const s = M.systemsInProduction([{ stage: "In Production" }, { stage: "Scaling" }, { stage: "In Progress" }, { stage: "Retired" }, null]);
  check("production + scaling counted as in production", s.inProduction === 2);
  check("in-progress counted as in build", s.inBuild === 1);
  check("total counts every real row", s.total === 4);
}
{ // risks
  const b = M.riskBreakdown([
    { level: "Critical", status: "Open" }, { level: "Critical", status: "Complete" },
    { level: "High", status: "Treating" }, { level: "High", status: "Monitored" }, { level: "Medium", status: "Open" }, { level: "", status: "Open" },
  ]);
  check("levels counted", b.Critical === 2 && b.High === 2 && b.Medium === 1 && b.Low === 1 && b.total === 6);
  check("closed/monitored are not open", b.openCritical === 1 && b.openHigh === 1);
}
{ // queue
  const q = M.governanceQueue({
    approvals: [{ id: "a1", title: "Report", risk: "High", time: "Pending 1 day" }, { id: "a2", title: "LLM v2", risk: "Critical", time: "Go-live in 6 days", clause: "Art.6" }],
    evidence: [{ id: "e1", artifact: "SoA", freshness: "due", due: "Sep", owner: "CGO" }, { id: "e2", artifact: "AUP", freshness: "stale", due: "overdue 12 days", owner: "CGO" }, { id: "e3", artifact: "Card", freshness: "fresh" }],
  });
  check("most severe decision first", q[0].id === "approval:a2" && q[1].id === "approval:a1");
  check("overdue evidence before due evidence", q[2].id === "evidence:e2" && q[3].id === "evidence:e1");
  check("fresh evidence is not queued", !q.some(i => i.id === "evidence:e3"));
  check("queue respects the limit", M.governanceQueue({ approvals: [{ id: 1 }, { id: 2 }, { id: 3 }] }, { limit: 2 }).length === 2);
  check("missing evidence owner is shown as unassigned", M.governanceQueue({ evidence: [{ id: "x", artifact: "A", freshness: "due", due: "Jan" }] })[0].who.includes("unassigned"));
}
{ // live series
  const s = M.liveSeries([{ outcome: "allow" }, { outcome: "block" }, { outcome: "escalate" }, { outcome: "mask" }, { outcome: "allow" }]);
  const end = s[s.length - 1];
  check("cumulative allowed and stopped", end.allowed === 2 && end.stopped === 1);
  check("a hand-off to a human is not counted as allowed", end.held === 1);
  check("masked actions are neither allowed nor stopped", end.total === 4);
  check("window keeps the most recent points", M.liveSeries(Array.from({ length: 50 }, () => ({ outcome: "allow" })), { window: 10 }).length === 10);
}
{ // estate layout
  const est = buildEstate({
    initiatives: [{ id: "ai-1", name: "Copilot", controls: ["C1"] }],
    agents: [{ id: "g1", name: "Copilot Agent", initiativeId: "ai-1", model: "M", dataScopes: ["CRM"], tools: [] }],
    risks: [{ id: "R1", title: "Inj", initiativeId: "ai-1" }, { id: "R2", title: "Bias", initiativeId: "ai-1" }],
    incidents: [{ id: "I1", title: "Att", system: "Copilot" }],
  });
  const L = M.estateLayout(est);
  check("only estate lanes are laid out", L.nodes.every(n => M.LANES.includes(n.type)) && L.nodes.length === 4);
  check("every node has a position in 0..1", L.nodes.every(n => n.u > 0 && n.u < 1 && n.v > 0 && n.v < 1));
  check("only recorded dependency links are drawn", L.edges.length === 3 && L.edges.every(e => e.kind === "dep"));
  check("governance load counts risks and incidents on the system", L.load["system:ai-1"]?.risk === 2 && L.load["system:ai-1"]?.incident === 1);
}
{ // spend
  const s = M.spendShare([{ id: "a", name: "A", cost: 50 }, { id: "b", name: "B", cost: 30, overBudget: true, utilization: 110 }, { id: "c", name: "C", cost: 20 }, { id: "x", name: "X", cost: NaN }], { limit: 2 });
  check("largest first, limited", s.length === 2 && s[0].id === "a" && s[1].id === "b");
  check("shares are of the whole month", s[0].share === 50 && s[1].share === 30);
  check("over-budget flag carried", s[1].overBudget && s[1].utilization === 110);
}
{ // seeded workspace sanity
  const { PORTFOLIO } = await import("../lib/portfolio.js");
  const { riskRegister } = await import("../lib/platform-models.ts");
  const p = M.systemsInProduction(PORTFOLIO), r = M.riskBreakdown(riskRegister);
  check("seeded: production count is within the portfolio", p.inProduction > 0 && p.inProduction <= p.total);
  check("seeded: open high/critical never exceeds the register", r.openCritical + r.openHigh <= r.Critical + r.High);
}

let fail = 0;
for (const [s, n] of R) { if (s === "FAIL") fail++; console.log(`${s}  ${n}`); }
console.log(`\n${R.length - fail}/${R.length} passed`);
if (fail) process.exit(1);
