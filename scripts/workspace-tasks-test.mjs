/* GenVeris · AIMS task inbox tests (#168 / WS3)
   Locks the derivation of governance tasks from real AIMS state: high/critical
   AI systems lacking an assessment, unresolved findings, and HITL escalations —
   each stamped with the AIMS source that raised it, chain-verified, never
   fabricated. Pure over crafted Fabric + audit rows + a surface/route contract.
   Run: npx tsx scripts/workspace-tasks-test.mjs */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { deriveWorkspaceTasks, taskStats } from "../lib/workspace-tasks.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(resolve(ROOT, p), "utf8");
const sha = (s) => createHash("sha256").update(s).digest("hex");
const R = [];
const check = (name, cond) => { R.push([cond ? "PASS" : "FAIL", name]); };
const md = (o) => JSON.stringify(o);

let fi = 0;
const fab = (kind, entityId, source, fields) => ({ id: "f" + (fi++), kind, entityId, source, actor: source, confidence: 1, supersedes: null, idem: "", payload: md(fields), prevHash: "", hash: "", createdAt: new Date(1790000000000 + fi * 1000) });
function auditChain(specs) {
  let prev = "genesis";
  return specs.map((s, i) => { const hash = sha(prev + "|" + s.action + "|" + s.entity + "|" + s.detail + "|" + s.actor); const row = { id: "a" + i, createdAt: new Date(1790000500000 + i * 1000), prevHash: prev, hash, ...s }; prev = hash; return row; });
}

const fabricRows = [
  fab("AISystem", "AIS-1", "discover", { name: "Recruitment Assistant", tier: "critical" }),   // unassessed critical → task
  fab("AISystem", "AIS-2", "discover", { name: "Marketing Gen", tier: "high" }),                // has assessment → no task
  fab("Assessment", "ASM-2", "human", { of: "AIS-2", kind: "compliance-rating", score: 88 }),
  fab("AISystem", "AIS-3", "discover", { name: "Code Assistant", tier: "minimal" }),            // low tier → no task
  fab("Finding", "FND-1", "enforce", { of: "AIS-1", severity: "high", reason: "egress to untrusted host" }),
];
const auditRows = auditChain([
  { action: "inference:allow", entity: "claude-sonnet-5", detail: md({ agent: "agent-crc", tool: "kb" }), actor: "agent-crc" },      // no task
  { action: "inference:escalate", entity: "claude-sonnet-5", detail: md({ agent: "agent-doc", tool: "wire" }), actor: "agent-doc" }, // review task
]);

/* ── derivation ── */
{
  const { tasks } = deriveWorkspaceTasks({ fabricRows, auditRows });
  const asm = tasks.filter((t) => t.kind === "assessment");
  check("a high/critical AI system with no assessment raises an assessment task", asm.length === 1 && asm[0].entityId === "AIS-1");
  check("assessment task carries the AIMS source that raised it", asm[0].source === "discover" && asm[0].severity === "high");
  check("an assessed system raises NO assessment task", !tasks.some((t) => t.entityId === "AIS-2"));
  check("a low-tier system raises no task", !tasks.some((t) => t.entityId === "AIS-3"));
  const fnd = tasks.filter((t) => t.kind === "finding");
  check("a finding raises a resolve-finding task from enforce", fnd.length === 1 && fnd[0].source === "enforce" && fnd[0].severity === "high");
  const rev = tasks.filter((t) => t.kind === "review");
  check("a HITL escalation raises a review task; a plain allow does not", rev.length === 1 && /agent-doc/.test(rev[0].title));
  check("every task links to a handling surface", tasks.every((t) => typeof t.surface === "string" && t.surface.length > 0));
  check("tasks are sorted with high severity first", tasks[0].severity === "high");
}

/* ── stats ── */
{
  const { tasks, intact } = deriveWorkspaceTasks({ fabricRows, auditRows });
  const s = taskStats(tasks);
  check("stats count kinds + severity + sources", s.total === 3 && s.assessment === 1 && s.findings === 1 && s.reviews === 1 && s.high === 2);
  check("stats list the AIMS sources", s.sources.includes("discover") && s.sources.includes("enforce"));
  check("a valid audit chain verifies intact", intact === true);
}

/* ── tamper + honest empty ── */
{
  const bad = auditRows.map((r, i) => i === 1 ? { ...r, detail: md({ agent: "attacker" }) } : r);
  check("a tampered audit row breaks chain verification", deriveWorkspaceTasks({ fabricRows, auditRows: bad }).intact === false);
  const empty = deriveWorkspaceTasks({});
  check("no AIMS state is a truthful empty inbox (not seeded)", empty.tasks.length === 0 && empty.intact === true);
  check("never fabricates: tasks come only from real Fabric/audit rows", deriveWorkspaceTasks({ fabricRows: [], auditRows: [] }).tasks.length === 0);
}

/* ── route + surface wiring contract ── */
{
  const route = read("app/api/workspace/tasks/route.ts");
  check("route binds tenant to the session (BL-01 guard)", /resolveTenant\(/.test(route));
  check("route derives tasks from Fabric + audit chain", /deriveWorkspaceTasks\(/.test(route) && /fabricRecord\.findMany/.test(route) && /auditLog\.findMany/.test(route));
  check("route is honest demo without a DB", /enabled:\s*false/.test(route));
  const rc = read("components/platform/rolecenters.jsx");
  check("inbox fetches the live task record", /\/api\/workspace\/tasks/.test(rc));
  check("inbox falls back to a demo view", /usingLive\?live\.tasks:WS_TASKS_DEMO/.test(rc));
  check("inbox badges live-vs-demo provenance", /<TelemetryBadge\/>/.test(rc));
  check("inbox stamps each task with its AIMS source", /srcColor\(t\.source\)/.test(rc));
  check("inbox renders on Home for employee/manager, gated + toggleable", /isEmp&&show\("tasks"\)&&<WorkspaceTaskInbox/.test(rc));
  const prefs = read("lib/dashboard-prefs.js");
  check("the AIMS task inbox cockpit section is registered", /key:\s*"tasks"/.test(prefs));
  const pkg = read("package.json");
  check("package.json wires test:wstasks into test:unit", /"test:wstasks"/.test(pkg) && /test:wstasks/.test(pkg.split('"test:unit"')[1] || ""));
  const ci = read(".github/workflows/ci.yml");
  check("CI runs the AIMS task inbox tests", /test:wstasks/.test(ci));
}

const failed = R.filter(([s]) => s === "FAIL");
for (const [s, n] of R) console.log(`${s}  ${n}`);
console.log(`\n${R.length - failed.length}/${R.length} passed`);
process.exit(failed.length ? 1 : 0);
