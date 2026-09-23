/* GenVeris · Live Egress attempts tests (BL-04 / #144)
   Locks the audit-chain -> egress-surface mapping and chain verification that let
   the Egress surface show live per-request destination decisions instead of a
   seeded window, plus the faithful-telemetry contract (gateway + policy-inspect
   tag egress rows kind:"egress" and persist the true allow/deny/ssrf verdict) and
   the wiring contract (session-bound route + live-first surface). Pure over
   crafted audit rows; runs in CI. Run: npx tsx scripts/egress-live-test.mjs */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { liveEgressFromAudit, liveEgressStats } from "../lib/egress-live.ts";
import { auditChainIntact } from "../lib/enforce-live.ts";
import egress from "../lib/egress.js";
const { EGRESS_POLICY } = egress;

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

const egDetail = (o) => JSON.stringify({ kind: "egress", ...o });

const rowsIn = chain([
  // a non-egress inference row — counts toward the chain, stays out of the egress view
  { action: "inference:allow", entity: "claude-sonnet-5", detail: JSON.stringify({ agent: "agent-crc", tool: "read_kb" }), actor: "agent-crc" },
  // real egress destination decisions (kind:"egress")
  { action: "egress-inspect:allow", entity: "Internal",   detail: egDetail({ agent: "agent-crc",   tool: "draft_response",     destination: "api.anthropic.com", category: "allow",    reason: "Model gateway — the only model egress" }), actor: "agent-crc" },
  { action: "egress-inspect:deny",  entity: "Restricted", detail: egDetail({ agent: "agent-doc",   tool: "external_web_fetch", destination: "pastebin.com",      category: "denied",   reason: "Known exfiltration sink" }), actor: "agent-doc" },
  { action: "egress-inspect:ssrf",  entity: "Restricted", detail: egDetail({ agent: "agent-doc",   tool: "external_web_fetch", destination: "169.254.169.254",   category: "metadata", reason: "Cloud metadata service — SSRF target, always denied" }), actor: "agent-doc" },
  // a content-DLP verdict rides the same action but has NO kind:"egress" — excluded
  { action: "egress-inspect:mask",  entity: "Confidential", detail: JSON.stringify({ channel: "casb", actor: "casb", destination: "chatgpt.com", categories: ["PII"], rules: ["pii-email"], sha: "abc" }), actor: "casb" },
]);

/* ── mapping ── */
{
  const { rows, intact } = liveEgressFromAudit(rowsIn);
  check("valid chain verifies intact", intact === true);
  check("only kind:egress rows become egress rows (content-DLP + inference excluded)", rows.length === 3);
  check("decision + agent + tool + dest mapped from audit detail", rows[0].decision === "allow" && rows[0].agent === "agent-crc" && rows[0].tool === "draft_response" && rows[0].dest === "api.anthropic.com");
  check("a denied attempt carries its reason", rows[1].decision === "deny" && /exfiltration/i.test(rows[1].reason));
  check("an SSRF attempt is mapped as ssrf", rows[2].decision === "ssrf" && rows[2].dest === "169.254.169.254");
  check("egress row keeps the real audit hash", rows[0].hash === rowsIn[1].hash);
  check("a content-DLP egress-inspect row is not an egress attempt", !rows.some(r => r.dest === "chatgpt.com"));
}

/* ── tamper detection ── */
{
  const tampered = rowsIn.map((r, i) => i === 2 ? { ...r, detail: egDetail({ destination: "attacker.example", category: "allow" }) } : r);
  check("altering a row breaks the chain", auditChainIntact(tampered) === false);
  check("liveEgressFromAudit reports the broken chain", liveEgressFromAudit(tampered).intact === false);
}

/* ── stats ── */
{
  const { rows, intact } = liveEgressFromAudit(rowsIn);
  const s = liveEgressStats(rows, intact);
  check("stats: total counts egress attempts", s.total === 3);
  check("stats: allowed / denied / ssrf", s.allowed === 1 && s.denied === 2 && s.ssrf === 1);
  check("stats: exfil blocked = deny + ssrf", s.exfilBlocked === 2);
  check("stats: deny rate is a percentage", s.denyRate === Math.round((2 / 3) * 100));
  check("stats: allow-list count comes from the policy", s.allowlisted === EGRESS_POLICY.filter(p => p.category === "allow").length);
  check("stats: intact propagates", s.intact === true);
  check("empty egress is a truthful empty (not seeded)", (() => { const e = liveEgressStats([], true); return e.total === 0 && e.denied === 0 && e.intact === true; })());
}

/* ── faithful-telemetry contract (the sources that write egress rows) ── */
{
  const gw = read("app/api/gateway/chat/route.ts");
  check("gateway records the egress attempt (allow + deny) on the chain", /logEgress\(/.test(gw));
  check("gateway egress rows are tagged kind:\"egress\"", /kind:\s*"egress"/.test(gw));
  const inspect = read("app/api/policy/inspect/route.ts");
  check("policy-inspect persists the true egress decision, not a collapsed block", /decision:\s*eg\.decision/.test(inspect));
  check("policy-inspect tags the egress decision kind:\"egress\"", /kind:\s*"egress"/.test(inspect));
}

/* ── wiring contract (route + surface) ── */
{
  const route = read("app/api/enforce/egress/route.ts");
  check("route binds tenant to the session (BL-01 guard)", /resolveTenant\(/.test(route));
  check("route builds rows from the audit chain", /liveEgressFromAudit\(/.test(route));
  check("route is honest demo without a DB", /enabled:\s*false/.test(route));
  const surface = read("components/platform/enforce.jsx");
  check("surface fetches the live egress record", /\/api\/enforce\/egress/.test(surface));
  check("surface falls back to the seeded window", /usingLive\s*\?\s*live\.rows\s*:\s*EGRESS_EVENTS/.test(surface));
  check("surface badges live-vs-demo provenance", /<TelemetryBadge\/>/.test(surface));
}

const failed = R.filter(([s]) => s === "FAIL");
for (const [s, n] of R) console.log(`${s}  ${n}`);
console.log(`\n${R.length - failed.length}/${R.length} passed`);
process.exit(failed.length ? 1 : 0);
