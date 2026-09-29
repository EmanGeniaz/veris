/* GenVeris · Live Circuit Breaker tests (BL-04 / #144)
   Locks the audit-chain -> breaker-surface mapping: per-request breaker-signal:*
   rows are grouped by session, de-duplicated, and the risk score / breaker state
   are computed by the SHARED computeBreakerSession() (single source of the
   decision), the SHA-256 chain is re-verified, and the route/surface + writer
   wiring is asserted. Pure over crafted audit rows; runs in CI.
   Run: npx tsx scripts/breaker-live-test.mjs */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { liveBreakerFromAudit, liveBreakerStats } from "../lib/breaker-live.ts";
import { auditChainIntact } from "../lib/enforce-live.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(resolve(ROOT, p), "utf8");
const R = [];
const check = (name, cond) => { R.push([cond ? "PASS" : "FAIL", name]); };

function chain(specs) {
  let prev = "genesis";
  return specs.map((s, i) => {
    const hash = createHash("sha256").update(prev + "|" + s.action + "|" + s.entity + "|" + s.detail + "|" + s.actor).digest("hex");
    const row = { id: "row" + i + "abcdef", createdAt: new Date(1790000000000 + i * 1000), prevHash: prev, hash, ...s };
    prev = hash;
    return row;
  });
}
const bd = (agent, session, signal) => JSON.stringify({ agent, session, signal });
const sig = (agent, session, signal) => ({ action: `breaker-signal:${signal}`, entity: agent, detail: bd(agent, session, signal), actor: agent });

const rowsIn = chain([
  { action: "inference:allow", entity: "claude-sonnet-5", detail: JSON.stringify({ agent: "agent-crc", tool: "read_kb" }), actor: "agent-crc" }, // non-breaker row
  // Session A (agent-doc): injection(35) + egress(30) = 65 -> Suspended (routed to human)
  sig("agent-doc", "SES-A", "injection"),
  sig("agent-doc", "SES-A", "egress"),
  sig("agent-doc", "SES-A", "injection"),  // duplicate — must collapse to one signal
  // Session B (agent-crc): guardrail(18) + rate(10) = 28 -> Normal (no action)
  sig("agent-crc", "SES-B", "guardrail"),
  sig("agent-crc", "SES-B", "rate"),
  // Session C (agent-fraud): injection+egress+guardrail+rate = 93 -> Halted
  sig("agent-fraud", "SES-C", "injection"),
  sig("agent-fraud", "SES-C", "egress"),
  sig("agent-fraud", "SES-C", "guardrail"),
  sig("agent-fraud", "SES-C", "rate"),
]);

/* ── mapping / grouping / decision ── */
{
  const { rows, intact } = liveBreakerFromAudit(rowsIn);
  check("valid chain verifies intact", intact === true);
  check("breaker-signal:* rows group into per-session rows (3 sessions, inference excluded)", rows.length === 3);
  const A = rows.find(r => r.id === "SES-A");
  check("session A signals de-duplicated", !!A && A.signals.length === 2 && A.signals.includes("injection") && A.signals.includes("egress"));
  check("session A score + state computed (65 -> suspend, routed to human)", !!A && A.score === 65 && A.state === "suspend" && A.humanGate === true && A.acted === true);
  const B = rows.find(r => r.id === "SES-B");
  check("session B stays Normal below threshold (28)", !!B && B.score === 28 && B.state === "normal" && B.acted === false);
  const C = rows.find(r => r.id === "SES-C");
  check("session C escalates to Halted (93)", !!C && C.score === 93 && C.state === "halt" && C.humanGate === true);
  check("an acted session carries an Art.12 ledger ref; a normal one does not", !!A.ledgerRef && B.ledgerRef === null);
}

/* ── unknown signals contribute nothing ── */
{
  const withNoise = chain([sig("agent-x", "S", "injection"), sig("agent-x", "S", "totally-unknown")]);
  const { rows } = liveBreakerFromAudit(withNoise);
  check("unknown signal names are ignored (score from injection only)", rows.length === 1 && rows[0].score === 35 && rows[0].signals.length === 1);
}

/* ── tamper detection ── */
{
  const tampered = rowsIn.map((r, i) => i === 2 ? { ...r, detail: bd("agent-doc", "SES-A", "guardrail") } : r);
  check("altering a row breaks the chain", auditChainIntact(tampered) === false);
  check("liveBreakerFromAudit reports the broken chain", liveBreakerFromAudit(tampered).intact === false);
}

/* ── stats ── */
{
  const { rows, intact } = liveBreakerFromAudit(rowsIn);
  const s = liveBreakerStats(rows, intact);
  check("stats: sessions watched", s.watched === 3);
  check("stats: acted = suspended + halted", s.acted === 2 && s.suspended === 1 && s.halted === 1);
  check("stats: routed to human counts suspend + halt", s.routedToHuman === 2);
  check("stats: ttlSeconds surfaced", s.ttlSeconds === 90);
  check("stats: intact propagates", s.intact === true);
  check("empty breaker is a truthful empty (not seeded)", (() => { const e = liveBreakerStats([], true); return e.watched === 0 && e.acted === 0 && e.intact === true; })());
}

/* ── faithful-telemetry contract at the writer ── */
{
  const gw = read("app/api/gateway/chat/route.ts");
  check("gateway emits breaker signals on the chain", /logBreakerSignal\(/.test(gw));
  check("gateway logs the signal type (breaker-signal:<signal>)", /breaker-signal:\$\{ev\.signal\}/.test(gw));
  check("gateway emits injection / egress / guardrail / rate signals", /signal:\s*"injection"/.test(gw) && /signal:\s*"egress"/.test(gw) && /signal:\s*"guardrail"/.test(gw) && /signal:\s*"rate"/.test(gw));
}

/* ── wiring contract (route + surface) + single-source decision ── */
{
  const route = read("app/api/enforce/breaker/route.ts");
  check("route binds tenant to the session (BL-01 guard)", /resolveTenant\(/.test(route));
  check("route builds rows from the audit chain", /liveBreakerFromAudit\(/.test(route));
  check("route is honest demo without a DB", /enabled:\s*false/.test(route));
  const live = read("lib/breaker-live.ts");
  check("live view reuses the shared breaker decision (computeBreakerSession)", /computeBreakerSession\(/.test(live));
  const surface = read("components/platform/enforce.jsx");
  check("surface fetches the live breaker record", /\/api\/enforce\/breaker/.test(surface));
  check("surface falls back to the seeded window", /usingLive\s*\?\s*live\.rows\s*:\s*breakerSessions\(\)/.test(surface));
  check("surface badges live-vs-demo provenance", /<TelemetryBadge\/>/.test(surface));
}

const failed = R.filter(([s]) => s === "FAIL");
for (const [s, n] of R) console.log(`${s}  ${n}`);
console.log(`\n${R.length - failed.length}/${R.length} passed`);
process.exit(failed.length ? 1 : 0);
