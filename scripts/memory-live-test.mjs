/* GenVeris · Live Memory Guardrails tests (BL-04 / #144)
   Locks the audit-chain -> memory-surface mapping and chain verification that let
   the Memory Guardrails surface show live per-request governed-write decisions
   instead of a seeded window, plus the privacy contract (the audit row records
   governance metadata only, never memory content) and the route/surface wiring
   contract. Pure over crafted audit rows; runs in CI.
   Run: npx tsx scripts/memory-live-test.mjs */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { liveMemoryFromAudit, liveMemoryStats } from "../lib/memory-live.ts";
import { auditChainIntact } from "../lib/enforce-live.ts";

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

const md = (o) => JSON.stringify(o);

const rowsIn = chain([
  // a non-memory row — counts toward the chain, stays out of the memory view
  { action: "inference:allow", entity: "claude-sonnet-5", detail: md({ agent: "agent-crc", tool: "read_kb" }), actor: "agent-crc" },
  // governed memory writes
  { action: "memory:allow",  entity: "Internal",     detail: md({ agent: "agent-crc",    session: "demo:agent-crc:S1",    kind: "turn", class: "Internal",     masked: false, written: true }),  actor: "agent-crc" },
  { action: "memory:mask",   entity: "Confidential", detail: md({ agent: "agent-crc",    session: "demo:agent-crc:S1",    kind: "turn", class: "Confidential", masked: true,  written: true }),  actor: "agent-crc" },
  { action: "memory:refuse", entity: "Restricted",   detail: md({ agent: "agent-doc",    session: "demo:agent-doc:S2",    kind: "turn", class: "Restricted",   masked: false, written: false }), actor: "agent-doc" },
]);

/* ── mapping ── */
{
  const { rows, intact } = liveMemoryFromAudit(rowsIn);
  check("valid chain verifies intact", intact === true);
  check("only memory:* rows become memory rows (inference excluded)", rows.length === 3);
  check("decision + agent + session + class mapped", rows[0].decision === "allow" && rows[0].agent === "agent-crc" && rows[0].session === "demo:agent-crc:S1" && rows[0].class === "Internal");
  check("a masked write is stored + masked", rows[1].decision === "mask" && rows[1].written === true && rows[1].masked === true);
  check("a refused write is not written and carries a generic reason", rows[2].decision === "refuse" && rows[2].written === false && !!rows[2].reason);
  check("a stored row gets its class retention window", rows[0].retention === "7 days" && rows[1].retention === "24 hours");
  check("a refused row has no retention", rows[2].retention === "—");
  check("memory row keeps the real audit hash", rows[0].hash === rowsIn[1].hash);
}

/* ── privacy contract: the surface never exposes raw memory content ── */
{
  const { rows } = liveMemoryFromAudit(rowsIn);
  const blob = JSON.stringify(rows);
  check("live rows carry no raw memory text (governance metadata only)", !/sk-live|4111|123-45-6789|@example\.com/.test(blob));
  check("a stored row's content cell is a governed placeholder, not content", /governed memory store/i.test(rows[0].text || ""));
}

/* ── tamper detection ── */
{
  const tampered = rowsIn.map((r, i) => i === 3 ? { ...r, detail: md({ agent: "attacker", class: "Public", written: true }) } : r);
  check("altering a row breaks the chain", auditChainIntact(tampered) === false);
  check("liveMemoryFromAudit reports the broken chain", liveMemoryFromAudit(tampered).intact === false);
}

/* ── stats ── */
{
  const { rows, intact } = liveMemoryFromAudit(rowsIn);
  const s = liveMemoryStats(rows, intact);
  check("stats: total counts governed writes", s.total === 3);
  check("stats: stored / masked / refused", s.stored === 2 && s.masked === 1 && s.refused === 1);
  check("stats: refused == restrictedBlocked", s.restrictedBlocked === 1);
  check("stats: partitions counts distinct agent/session of written rows", s.partitions === 1);
  check("stats: classes lists only stored classes (no Restricted)", s.classes.includes("Internal") && s.classes.includes("Confidential") && !s.classes.includes("Restricted"));
  check("stats: intact propagates", s.intact === true);
  check("empty memory is a truthful empty (not seeded)", (() => { const e = liveMemoryStats([], true); return e.total === 0 && e.stored === 0 && e.intact === true; })());
}

/* ── faithful-telemetry + privacy contract at the writer ── */
{
  const gw = read("app/api/gateway/chat/route.ts");
  check("gateway records the governed memory write on the chain", /logMemory\(/.test(gw));
  check("gateway logs the memory decision (memory:<decision>)", /memory:\$\{ev\.decision\}/.test(gw));
  const memDetail = gw.match(/memory:\$\{ev\.decision\}[\s\S]{0,160}?JSON\.stringify\((\{[^}]*\})\)/);
  check("gateway memory row logs governance metadata, not raw content (no text field)", !!memDetail && /written/.test(memDetail[1]) && /class/.test(memDetail[1]) && !/\btext\b/.test(memDetail[1]));
}

/* ── wiring contract (route + surface) ── */
{
  const route = read("app/api/enforce/memory/route.ts");
  check("route binds tenant to the session (BL-01 guard)", /resolveTenant\(/.test(route));
  check("route builds rows from the audit chain", /liveMemoryFromAudit\(/.test(route));
  check("route is honest demo without a DB", /enabled:\s*false/.test(route));
  const surface = read("components/platform/enforce.jsx");
  check("surface fetches the live memory record", /\/api\/enforce\/memory/.test(surface));
  check("surface falls back to the seeded window", /usingLive\s*\?\s*live\.rows\s*:\s*seededMemoryLedger\(\)/.test(surface));
  check("surface badges live-vs-demo provenance", /<TelemetryBadge\/>/.test(surface));
}

const failed = R.filter(([s]) => s === "FAIL");
for (const [s, n] of R) console.log(`${s}  ${n}`);
console.log(`\n${R.length - failed.length}/${R.length} passed`);
process.exit(failed.length ? 1 : 0);
