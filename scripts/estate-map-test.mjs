/* GenVeris · Estate map tests (Command Deck → Estate)
   Locks the rule that the estate map only draws relationships a record
   already carries (initiative ids, agent model / data scopes / tool controls,
   initiative controls and policies, exact system names), never fuzzy joins,
   and that impact is a correct reverse traversal with governance reported
   alongside — not traversed through.
   Run: npx tsx scripts/estate-map-test.mjs */
const { buildEstate, impactOf, governanceOf, LAYERS, GOVERNANCE } = await import("../lib/estate-map.js");

const R = [];
const check = (name, cond) => { R.push([cond ? "PASS" : "FAIL", name]); };

const initiatives = [
  { id: "ai-1", name: "Copilot", controls: ["CTRL-A"], policies: ["Responsible Use"] },
  { id: "ai-2", name: "Credit", controls: [], policies: [] },
];
const agents = [
  { id: "ag-1", name: "Copilot Agent", initiativeId: "ai-1", model: "Model X", dataScopes: ["CRM tickets", "KB"],
    tools: [{ name: "read_kb", granted: true, control: "CTRL-T" }, { name: "send_email", granted: false, control: "CTRL-U" }] },
  { id: "ag-2", name: "Credit Agent", initiativeId: "ai-2", model: "Model X", dataScopes: ["Bureau"], tools: [] },
  { id: "ag-3", name: "Orphan Agent", model: "Model Y", dataScopes: [], tools: [] },
];
const risks = [
  { id: "R1", title: "Injection", initiativeId: "ai-1", system: "Copilot" },
  { id: "R2", title: "Named only", system: "Fraud Model" },
  { id: "R3", title: "Near miss", system: "Copilot " /* trailing space trims to an exact match */ },
  { id: "R4", title: "Different spelling", system: "Co-pilot" },
];
const kris = [{ id: "K1", name: "Violation rate", initiativeId: "ai-1" }, { id: "K2", name: "Dangling", initiativeId: "nope" }];
const incidents = [{ id: "I1", title: "Attack", system: "Credit" }];

const est = buildEstate({ initiatives, agents, risks, kris, incidents });
const ids = new Set(est.nodes.map(n => n.id));
const has = (from, to, rel) => est.edges.some(e => e.from === from && e.to === to && (!rel || e.rel === rel));

{ // honest construction
  check("empty input → empty estate", buildEstate({}).nodes.length === 0 && buildEstate({}).edges.length === 0);
  check("no arguments → empty estate", buildEstate().nodes.length === 0);
  check("malformed rows are skipped", buildEstate({ agents: [null, {}, { name: "no id" }], risks: [{}], initiatives: [null] }).nodes.length === 0);
  check("every node type is a known layer or governance type", est.nodes.every(n => LAYERS.includes(n.type) || GOVERNANCE.includes(n.type)));
  check("every edge joins two existing nodes", est.edges.every(e => ids.has(e.from) && ids.has(e.to)));
  check("no duplicate edges", new Set(est.edges.map(e => `${e.from}|${e.to}|${e.rel}`)).size === est.edges.length);
}
{ // relationships come only from recorded fields
  check("system runs its agent (initiativeId)", has("system:ai-1", "agent:ag-1", "runs"));
  check("agent uses its model", has("agent:ag-1", "model:model-x", "uses"));
  check("shared model is one node", est.nodes.filter(n => n.type === "model" && n.label === "Model X").length === 1);
  check("agent reads its data scopes", has("agent:ag-1", "data:crm-tickets", "reads") && has("agent:ag-1", "data:kb", "reads"));
  check("granted tool control governs the agent", has("control:CTRL-T", "agent:ag-1"));
  check("ungranted tool control is not drawn", !ids.has("control:CTRL-U"));
  check("initiative control applies to the system", has("control:CTRL-A", "system:ai-1", "applies to"));
  check("initiative policy governs the system", has("policy:responsible-use", "system:ai-1", "governs"));
  check("risk attaches by initiativeId", has("risk:R1", "system:ai-1"));
  check("risk with only a name becomes its own system", has("risk:R2", "system:name:fraud-model"));
  check("exact name (after trimming) joins the initiative", has("risk:R3", "system:ai-1"));
  check("a different spelling is NOT fuzzy-joined", has("risk:R4", "system:name:co-pilot") && !has("risk:R4", "system:ai-1"));
  check("incident attaches by exact system name", has("incident:I1", "system:ai-2"));
  check("KRI with unknown initiative is dropped, not guessed", !ids.has("kri:K2") && ids.has("kri:K1"));
  check("agent with no system has no 'runs' edge", !est.edges.some(e => e.to === "agent:ag-3" && e.rel === "runs"));
}
{ // impact
  const m = impactOf(est, "model:model-x");
  check("model impact reaches both agents", m.affected.includes("agent:ag-1") && m.affected.includes("agent:ag-2"));
  check("model impact reaches both systems", m.affected.includes("system:ai-1") && m.affected.includes("system:ai-2"));
  check("model impact exposes data the affected agents read", m.affected.includes("data:crm-tickets") && m.affected.includes("data:bureau"));
  check("impact excludes the changed node itself", !m.affected.includes("model:model-x"));
  check("impact does not reach an unrelated model's agent", !m.affected.includes("agent:ag-3"));
  check("governance on affected nodes is reported", m.governance.includes("risk:R1") && m.governance.includes("incident:I1") && m.governance.includes("control:CTRL-T"));
  check("path traces back to the changed node", (m.paths["system:ai-1"] || []).length === 2 && m.paths["system:ai-1"][0].to === "model:model-x");
  check("affected list is ordered by layer", m.affected.indexOf("data:crm-tickets") < m.affected.indexOf("agent:ag-1") && m.affected.indexOf("agent:ag-1") < m.affected.indexOf("system:ai-1"));

  const d = impactOf(est, "data:kb");
  check("data impact reaches the reading agent and its system only", d.affected.includes("agent:ag-1") && d.affected.includes("system:ai-1") && !d.affected.includes("system:ai-2"));

  const s = impactOf(est, "system:ai-1");
  check("a system has no dependants → nothing affected", s.affected.length === 0);

  const c = impactOf(est, "control:CTRL-A");
  check("selecting a control starts from what it governs", c.affected.includes("system:ai-1"));
  check("the control itself is not listed as its own governance", !c.governance.includes("control:CTRL-A"));

  check("unknown node → empty impact", impactOf(est, "model:nope").affected.length === 0);
  check("missing estate → empty impact", impactOf(null, "x").affected.length === 0);
}
{ // governanceOf
  const g = governanceOf(est, "system:ai-1");
  check("governanceOf groups by type", (g.risk || []).length === 2 && (g.kri || []).length === 1 && (g.control || []).length === 1 && (g.policy || []).length === 1);
  check("governanceOf on a node with none → empty", Object.keys(governanceOf(est, "model:model-y")).length === 0);
}
{ // determinism
  const again = buildEstate({ initiatives, agents, risks, kris, incidents });
  check("deterministic: same input → same estate", JSON.stringify(again) === JSON.stringify(est));
}

let fail = 0;
for (const [s, n] of R) { if (s === "FAIL") fail++; console.log(`${s}  ${n}`); }
console.log(`\n${R.length - fail}/${R.length} passed`);
if (fail) process.exit(1);
