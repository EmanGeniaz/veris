/* GenVeris · Live Tool-Call Ledger tests (BL-04 / #144)
   Locks the audit-chain -> ledger mapping and chain verification that let the
   Tool-Call Ledger show live per-request decisions instead of a seeded window,
   plus the wiring contract (session-bound route + live-first surface). Pure over
   crafted audit rows; runs in CI. Run: npx tsx scripts/enforce-live-test.mjs */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { liveLedgerFromAudit, liveLedgerStats, auditChainIntact } from "../lib/enforce-live.ts";

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

const rowsIn = chain([
  { action: "create", entity: "evidence", detail: "x", actor: "alice" },                                             // non-inference
  { action: "inference:allow", entity: "claude-sonnet-5", detail: JSON.stringify({ agent: "agent-crc", tool: "read_kb", dataClass: "Internal" }), actor: "agent-crc" },
  { action: "inference:block", entity: "claude-sonnet-5", detail: JSON.stringify({ agent: "agent-crc", tool: "send_customer_email", dataClass: "Restricted" }), actor: "agent-crc" },
  { action: "inference:escalate", entity: "claude-sonnet-5", detail: JSON.stringify({ agent: "agent-credit", tool: "issue_decision" }), actor: "agent-credit" },
]);

/* ── mapping ── */
{
  const { rows, intact } = liveLedgerFromAudit(rowsIn);
  check("valid chain verifies intact", intact === true);
  check("only inference rows become ledger rows", rows.length === 3);
  check("decision + agent + tool mapped from audit detail", rows[0].decision === "allow" && rows[0].agent === "agent-crc" && rows[0].tool === "read_kb");
  check("a blocked call is marked not authorized", rows[1].decision === "block" && rows[1].authorized === false);
  check("an allowed call is authorized and gets a token", rows[0].authorized === true && !!rows[0].token);
  check("a blocked call gets no token", rows[1].token === null);
  check("scope carries the data class", rows[0].scope === "Internal");
  check("ledger row keeps the real audit hash", rows[0].hash === rowsIn[1].hash);
}

/* ── tamper detection ── */
{
  const tampered = rowsIn.map((r, i) => i === 2 ? { ...r, detail: JSON.stringify({ agent: "attacker", tool: "exfiltrate" }) } : r);
  check("altering a row breaks the chain", auditChainIntact(tampered) === false);
  check("liveLedgerFromAudit reports the broken chain", liveLedgerFromAudit(tampered).intact === false);
}

/* ── stats ── */
{
  const { rows, intact } = liveLedgerFromAudit(rowsIn);
  const s = liveLedgerStats(rows, intact);
  check("stats: total counts inference rows", s.total === 3);
  check("stats: allowed / blocked / escalated", s.allowed === 1 && s.blocked === 1 && s.escalated === 1);
  check("stats: a prevented breach is a blocked ungranted call", s.preventedBreaches === 1);
  check("stats: intact propagates", s.intact === true);
  check("empty ledger is a truthful empty (not seeded)", (() => { const e = liveLedgerStats([], true); return e.total === 0 && e.intact === true; })());
}

/* ── wiring contract ── */
{
  const route = read("app/api/enforce/ledger/route.ts");
  check("route binds tenant to the session (BL-01 guard)", /resolveTenant\(/.test(route));
  check("route builds rows from the audit chain", /liveLedgerFromAudit\(/.test(route));
  check("route is honest demo without a DB", /enabled:\s*false/.test(route));
  const surface = read("components/platform/enforce.jsx");
  check("surface fetches the live ledger", /\/api\/enforce\/ledger/.test(surface));
  check("surface falls back to the seeded window", /usingLive\s*\?\s*live\.rows\s*:\s*TOOLCALL_LEDGER/.test(surface));
  check("surface badges live-vs-demo provenance", /<TelemetryBadge\/>/.test(surface));
}

const failed = R.filter(([s]) => s === "FAIL");
for (const [s, n] of R) console.log(`${s}  ${n}`);
console.log(`\n${R.length - failed.length}/${R.length} passed`);
process.exit(failed.length ? 1 : 0);
