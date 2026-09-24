/* GenVeris · Live Runtime Guardrails tests (BL-04 / #144)
   Locks the audit-chain -> runtime-surface mapping: per-request runtime:* rows
   (allow/throttle/loop + latency) are grouped back into the per-session view the
   surface renders (action stream, in-flight, P95, worst decision), the SHA-256
   chain is re-verified, and the route/surface wiring is asserted. Pure over
   crafted audit rows; runs in CI. Run: npx tsx scripts/runtime-live-test.mjs */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { liveRuntimeFromAudit, liveRuntimeStats } from "../lib/runtime-live.ts";
import { auditChainIntact } from "../lib/enforce-live.ts";
import runtime from "../lib/runtime-guard.js";
const { RUNTIME_POLICY } = runtime;

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(resolve(ROOT, p), "utf8");
const R = [];
const check = (name, cond) => { R.push([cond ? "PASS" : "FAIL", name]); };

/* Build a valid hash chain exactly as lib/audit.ts does. */
function chain(specs) {
  let prev = "genesis";
  return specs.map((s, i) => {
    const hash = createHash("sha256").update(prev + "|" + s.action + "|" + s.entity + "|" + s.detail + "|" + s.actor).digest("hex");
    const row = { id: "row" + i + "abcdef", createdAt: new Date(1790000000000 + i * 1000), prevHash: prev, hash, ...s };
    prev = hash;
    return row;
  });
}
const rt = (o) => JSON.stringify(o);
const SLO = RUNTIME_POLICY.latencySloMs; // 8000

const rowsIn = chain([
  // a non-runtime row — counts toward the chain, stays out of the runtime view
  { action: "inference:allow", entity: "claude-sonnet-5", detail: rt({ agent: "agent-crc", tool: "read_kb" }), actor: "agent-crc" },
  // session A — two allowed calls, one over the SLA (P95 breach)
  { action: "runtime:allow",  entity: "agent-crc",   detail: rt({ agent: "agent-crc",   session: "demo:agent-crc:A",   action: "read_kb",        latencyMs: 500,  breach: false, inFlight: 1 }), actor: "agent-crc" },
  { action: "runtime:allow",  entity: "agent-crc",   detail: rt({ agent: "agent-crc",   session: "demo:agent-crc:A",   action: "draft_response", latencyMs: 9400, breach: true,  inFlight: 2 }), actor: "agent-crc" },
  // session B — a loop halt
  { action: "runtime:loop",   entity: "agent-credit",detail: rt({ agent: "agent-credit",session: "demo:agent-credit:B", action: "score_application", reason: "Loop detected (repeat: score_application ×3)", inFlight: 1 }), actor: "agent-credit" },
  // session C — a throttle
  { action: "runtime:throttle", entity: "agent-close", detail: rt({ agent: "agent-close", session: "demo:agent-close:C", action: "post_journal", reason: "Concurrency cap 4 reached (6 in flight)", inFlight: 6 }), actor: "agent-close" },
]);

/* ── mapping / grouping ── */
{
  const { rows, intact } = liveRuntimeFromAudit(rowsIn);
  check("valid chain verifies intact", intact === true);
  check("runtime:* rows group into per-session rows (3 sessions, inference excluded)", rows.length === 3);
  const A = rows.find(r => r.session === "demo:agent-crc:A");
  check("a session gathers its action stream", !!A && A.actions.length === 2 && A.actions.includes("read_kb") && A.actions.includes("draft_response"));
  check("an allowed session's P95 breach is flagged from real latencies", !!A && A.decision === "allow" && A.p95 > SLO && A.sloBreach === true);
  const B = rows.find(r => r.session === "demo:agent-credit:B");
  check("a loop-halted session keeps the recorded decision + reason", !!B && B.decision === "loop" && /repeat/.test(B.reason || ""));
  const C = rows.find(r => r.session === "demo:agent-close:C");
  check("a throttled session is mapped with its in-flight count", !!C && C.decision === "throttle" && C.inFlight === 6);
  check("session id is a stable RSES-* label", !!A && /^RSES-[0-9A-F]{1,4}$/.test(A.id));
}

/* ── worst-decision aggregation ── */
{
  // one session with allow then loop → the session's decision is the worst (loop)
  const mixed = chain([
    { action: "runtime:allow", entity: "agent-x", detail: rt({ agent: "agent-x", session: "S", action: "a", latencyMs: 100, breach: false }), actor: "agent-x" },
    { action: "runtime:loop",  entity: "agent-x", detail: rt({ agent: "agent-x", session: "S", action: "a", reason: "Loop detected (repeat: a ×3)" }), actor: "agent-x" },
  ]);
  const { rows } = liveRuntimeFromAudit(mixed);
  check("worst decision wins within a session (allow + loop → loop)", rows.length === 1 && rows[0].decision === "loop");
}

/* ── tamper detection ── */
{
  const tampered = rowsIn.map((r, i) => i === 3 ? { ...r, detail: rt({ agent: "attacker", session: "x", action: "y" }) } : r);
  check("altering a row breaks the chain", auditChainIntact(tampered) === false);
  check("liveRuntimeFromAudit reports the broken chain", liveRuntimeFromAudit(tampered).intact === false);
}

/* ── stats ── */
{
  const { rows, intact } = liveRuntimeFromAudit(rowsIn);
  const s = liveRuntimeStats(rows, intact);
  check("stats: sessions watched", s.watched === 3);
  check("stats: looped / throttled", s.looped === 1 && s.throttled === 1);
  check("stats: SLA breaches counted", s.sloBreaches === 1);
  check("stats: p95 over all latencies + sloMs surfaced", s.p95 > 0 && s.sloMs === SLO);
  check("stats: intact propagates", s.intact === true);
  check("empty runtime is a truthful empty (not seeded)", (() => { const e = liveRuntimeStats([], true); return e.watched === 0 && e.looped === 0 && e.intact === true; })());
}

/* ── faithful-telemetry contract at the writer ── */
{
  const gw = read("app/api/gateway/chat/route.ts");
  check("gateway records runtime events on the chain", /logRuntime\(/.test(gw));
  check("gateway logs the runtime decision (runtime:<decision>)", /runtime:\$\{ev\.decision\}/.test(gw));
  check("gateway logs both the denial and the completed-call latency", /logRuntime\(tenant,\s*\{\s*decision:\s*rt\.decision/.test(gw) && /logRuntime\(tenant,\s*\{\s*decision:\s*"allow"[\s\S]*latencyMs:\s*rc\.latencyMs/.test(gw));
}

/* ── wiring contract (route + surface) ── */
{
  const route = read("app/api/enforce/runtime/route.ts");
  check("route binds tenant to the session (BL-01 guard)", /resolveTenant\(/.test(route));
  check("route builds rows from the audit chain", /liveRuntimeFromAudit\(/.test(route));
  check("route is honest demo without a DB", /enabled:\s*false/.test(route));
  const surface = read("components/platform/enforce.jsx");
  check("surface fetches the live runtime record", /\/api\/enforce\/runtime/.test(surface));
  check("surface falls back to the seeded window", /usingLive\s*\?\s*live\.rows\s*:\s*seededRuntimeLedger\(\)/.test(surface));
  check("surface badges live-vs-demo provenance", /<TelemetryBadge\/>/.test(surface));
}

const failed = R.filter(([s]) => s === "FAIL");
for (const [s, n] of R) console.log(`${s}  ${n}`);
console.log(`\n${R.length - failed.length}/${R.length} passed`);
process.exit(failed.length ? 1 : 0);
