/* GenVeris · Governed agent runtime tests (#182 §08)
   Locks the "govern the governors" substrate: the governance envelope
   (planAgentRun) gates every agent run by availability, circuit breaker,
   entitlement and action class; grants exactly least-privilege capability
   scope; never lets a propose/act agent run autonomously; and is demo-honest.
   Plus the pure scheduler and the route contracts.
   Run: npx tsx scripts/agent-runtime-test.mjs */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { NextRequest } from "next/server";
import {
  AGENT_REGISTRY, AGENT_ACTION_CLASSES, AGENT_RUN_STATES, agentById, planAgentRun,
} from "../lib/agent-runtime.ts";
import { nextRunAt, isDue, dueAgents } from "../lib/agent-schedule.ts";
import { validate } from "../lib/api-guard.ts";
import { agentRunSchema } from "../lib/api-schemas.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(resolve(ROOT, p), "utf8");
const R = [];
const check = (name, cond) => { R.push([cond ? "PASS" : "FAIL", name]); };

const monitor = agentById("evidence-gaps");         // available, monitor, no entitlement
const proposeA = agentById("evidence-freshness");   // planned, propose
const actEnforce = agentById("enforce-ingest");     // planned, act, requires enforce

/* ── 1 · registry is honest ── */
{
  check("registry has agents, each with required fields", AGENT_REGISTRY.length >= 5 && AGENT_REGISTRY.every((a) => a.id && a.name && a.purpose && AGENT_ACTION_CLASSES.includes(a.actionClass) && Array.isArray(a.capabilities) && ["available","planned"].includes(a.status)));
  check("the one wired agent is a read-only monitor", monitor && monitor.status === "available" && monitor.actionClass === "monitor");
  check("every acting agent is honestly 'planned' (nothing acts autonomously yet)", AGENT_REGISTRY.filter((a) => a.actionClass === "act").every((a) => a.status === "planned"));
  check("run-state vocabulary is complete", AGENT_RUN_STATES.includes("completed") && AGENT_RUN_STATES.includes("proposed") && AGENT_RUN_STATES.includes("blocked"));
}

/* ── 2 · the governance envelope ── */
{
  // monitor, entitled-irrelevant, DB present → completes, read-only, least-privilege scope
  const p = planAgentRun({ agent: monitor, dbConfigured: true });
  check("monitor run → allowed, completed, live, no approval", p.allow && p.state === "completed" && p.mode === "live" && p.requiresApproval === false);
  check("capability scope is exactly the agent's declared set (least privilege)", JSON.stringify(p.capabilityScope) === JSON.stringify(monitor.capabilities));
  // demo honesty
  check("no DB → mode demo (honest), monitor still runs read-only", planAgentRun({ agent: monitor, dbConfigured: false }).mode === "demo");
  // circuit breaker open → blocked
  check("breaker open → blocked (safety)", planAgentRun({ agent: monitor, dbConfigured: true, breakerOpen: true }).state === "blocked");
  // planned agent → blocked
  check("planned agent → blocked (not wired to run)", planAgentRun({ agent: proposeA, dbConfigured: true }).allow === false && planAgentRun({ agent: proposeA, dbConfigured: true }).state === "blocked");
}

/* ── 3 · propose / act never run autonomously ── */
{
  // Make a copy of the planned propose agent as if available, to prove the action-class gate (not the status gate)
  const proposeAvail = { ...proposeA, status: "available" };
  const pp = planAgentRun({ agent: proposeAvail, dbConfigured: true });
  check("propose agent → requiresApproval, state proposed (never auto-applies)", pp.allow && pp.state === "proposed" && pp.requiresApproval === true);
  const actAvail = { ...actEnforce, status: "available" };
  // act requires the enforce entitlement AND human approval
  check("act agent without entitlement → blocked", planAgentRun({ agent: actAvail, dbConfigured: true, entitledPlanes: [] }).state === "blocked");
  const pa = planAgentRun({ agent: actAvail, dbConfigured: true, entitledPlanes: ["enforce"] });
  check("act agent with entitlement → proposed + requiresApproval (never autonomous)", pa.allow && pa.state === "proposed" && pa.requiresApproval === true);
  check("no plan ever returns a live outward action without approval", [pp, pa].every((x) => x.requiresApproval === true));
}

/* ── 4 · scheduler (pure) ── */
{
  const now = new Date("2026-10-08T12:00:00Z");
  check("manual agent is never auto-due", nextRunAt(actEnforce, null) === null);
  check("planned agent is never due", isDue(proposeA, null, now) === false);
  check("available auto-cadence agent with no prior run is due now", isDue(monitor, null, now) === true);
  const justRan = new Date("2026-10-08T11:30:00Z"); // 30m ago; daily cadence
  check("recently-run daily agent is not due", isDue(monitor, justRan, now) === false);
  const longAgo = new Date("2026-10-06T12:00:00Z"); // 2 days ago
  check("daily agent last run 2 days ago is due", isDue(monitor, longAgo, now) === true);
  check("dueAgents returns only the due, available ones", dueAgents(now, AGENT_REGISTRY, {}).every((a) => a.status === "available" && a.cadence !== "manual"));
}

/* ── 5 · schema ── */
{
  check("run schema accepts agentId + default trigger", (() => { const v = validate(agentRunSchema, { agentId: "evidence-gaps" }); return v.ok && v.data.trigger === "manual"; })());
  check("run schema requires agentId", !validate(agentRunSchema, { trigger: "manual" }).ok);
  check("run schema rejects unknown trigger + unknown keys", !validate(agentRunSchema, { agentId: "x", trigger: "auto" }).ok && !validate(agentRunSchema, { agentId: "x", capabilities: ["*"] }).ok);
  check("run schema has no client capability/scope field (cannot widen privilege)", !validate(agentRunSchema, { agentId: "x", capabilityScope: ["fabric:write"] }).ok);
}

/* ── 6 · route contracts ── */
{
  const list = read("app/api/agents/route.ts");
  check("catalogue route is session-bound + user-tier + honest no-DB", /resolveTenant\(/.test(list) && /limit\(req,\s*"user"/.test(list) && /enabled:\s*false/.test(list));
  check("catalogue route never runs an agent (read-only)", !/agentRun\.create|planAgentRun\(/.test(list));
  const run = read("app/api/agents/run/route.ts");
  check("run route plans via the governance envelope", /planAgentRun\(/.test(run));
  check("run route records the run + appends an audit row under the agent identity", /agentRun\.create/.test(run) && /auditAppend\(/.test(run) && /agent:\$\{agent\.id\}|`agent:/.test(run));
  check("run route is baseline-compliant (user limit, parseJson, serverError, no leak)", /limit\(req,\s*"user"/.test(run) && /parseJson\(req,\s*agentRunSchema/.test(run) && /serverError\(e,/.test(run) && !/\be\.message\b/.test(run));
  check("run route only does read-only work for monitor agents", /actionClass === "monitor"/.test(run) && /deriveWorkspaceTasks\(/.test(run));
  check("run route honest without a DB", /enabled:\s*false/.test(run));
}

/* ── 7 · behavioural — no DB → honest, not fabricated ── */
{
  const runMod = await import("../app/api/agents/run/route.ts");
  const res = await runMod.POST(new NextRequest("http://localhost/api/agents/run", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ agentId: "evidence-gaps" }) }));
  const body = await res.json();
  check("run with no DB → enabled:false (honest)", res.status === 200 && body.enabled === false);
  const listMod = await import("../app/api/agents/route.ts");
  const lres = await listMod.GET(new NextRequest("http://localhost/api/agents"));
  const lbody = await lres.json();
  check("catalogue with no DB → enabled:false + the registry still described", lbody.enabled === false && Array.isArray(lbody.agents) && lbody.agents.length >= 5);
}

/* ── 8 · schema + wiring ── */
{
  const schema = read("prisma/schema.prisma");
  check("AgentRun model exists, tenant-scoped", /model AgentRun \{/.test(schema) && /@@index\(\[tenantId, agentId, startedAt\]\)/.test(schema));
  check("Tenant relates to agentRuns", /agentRuns\s+AgentRun\[\]/.test(schema));
  const lib = read("lib/agent-runtime.ts");
  check("agent runtime is pure (no db/next imports)", !/@\/lib\/db|PrismaClient|next\/server/.test(lib));
  const pkg = JSON.parse(read("package.json"));
  check("test:agents script exists + in test:unit", !!pkg.scripts["test:agents"] && /test:agents/.test(pkg.scripts["test:unit"]));
  check("CI runs the agent runtime tests", /npm run test:agents/.test(read(".github/workflows/ci.yml")));
}

const failed = R.filter(([s]) => s === "FAIL");
for (const [s, n] of R) console.log(`${s}  ${n}`);
console.log(`\n${R.length - failed.length}/${R.length} passed`);
process.exit(failed.length ? 1 : 0);
