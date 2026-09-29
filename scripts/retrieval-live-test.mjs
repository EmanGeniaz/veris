/* GenVeris · Live Retrieval Guardrails tests (BL-04 / #144)
   Locks the audit-chain -> retrieval-surface mapping and chain verification that
   let the Retrieval Guardrails surface show live per-request guard decisions
   instead of a seeded window, plus the privacy contract (the audit row records
   governance metadata only, never the passage text), the shared decision helper
   (one source for seeded + live), and the route/surface wiring contract. Pure
   over crafted audit rows, with a functional retrieveGoverned() check on the
   in-memory store. Runs in CI.
   Run: npx tsx scripts/retrieval-live-test.mjs */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { liveRetrievalFromAudit, liveRetrievalStats } from "../lib/retrieval-live.ts";
import { auditChainIntact } from "../lib/enforce-live.ts";
import retrievalGuard from "../lib/retrieval-guard.js";
const { retrievalDecision, RETRIEVAL_DECISIONS, seededRetrievalLedger } = retrievalGuard;
import { ingestDoc, retrieveGoverned } from "../lib/knowledge.ts";

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
  // a non-retrieval row — counts toward the chain, stays out of the retrieval view
  { action: "inference:allow", entity: "claude-sonnet-5", detail: md({ agent: "agent-crc", tool: "read_kb" }), actor: "agent-crc" },
  // governed retrieval decisions
  { action: "retrieval:admitted",      entity: "trusted",    detail: md({ kind: "retrieval", title: "AI Acceptable-Use Policy v4", source: "policy://governance/aup", tier: "trusted",    trustScore: 1.0, ageDays: 20,  stale: false, guardedScore: 3.0, decision: "admitted",      reason: null,                        agent: "agent-crc", session: "demo:agent-crc:S1" }), actor: "agent-crc" },
  { action: "retrieval:masked",        entity: "internal",   detail: md({ kind: "retrieval", title: "Uploaded onboarding guide",  source: "upload",                 tier: "internal",   trustScore: 0.8, ageDays: 5,   stale: false, guardedScore: 1.6, decision: "masked",        reason: null,                        agent: "agent-crc", session: "demo:agent-crc:S1" }), actor: "agent-crc" },
  { action: "retrieval:down-weighted", entity: "internal",   detail: md({ kind: "retrieval", title: "Q1 Board Deck (draft)",      source: "sharepoint/finance/q1",  tier: "internal",   trustScore: 0.8, ageDays: 240, stale: true,  guardedScore: 0.9, decision: "down-weighted", reason: "stale",                     agent: "agent-crc", session: "demo:agent-crc:S1" }), actor: "agent-crc" },
  { action: "retrieval:dropped",       entity: "blocked",    detail: md({ kind: "retrieval", title: "Leaked pricing notes",       source: "pastebin.com/raw/xyz",   tier: "blocked",    trustScore: 0.0, ageDays: null, stale: false, guardedScore: 0,   decision: "dropped",       reason: "untrusted source",          agent: "agent-doc", session: "demo:agent-doc:S2" }), actor: "agent-doc" },
  { action: "retrieval:dropped",       entity: "unverified", detail: md({ kind: "retrieval", title: "Vendor integration note",   source: "upload",                 tier: "unverified", trustScore: 0.4, ageDays: null, stale: false, guardedScore: 0,   decision: "dropped",       reason: "sensitive content blocked", agent: "agent-doc", session: "demo:agent-doc:S2" }), actor: "agent-doc" },
  // an unknown suffix — must be treated as a drop (deny-by-default), never admitted
  { action: "retrieval:bogus",         entity: "unverified", detail: md({ kind: "retrieval", title: "Unknown verdict",           source: "upload",                 tier: "unverified", trustScore: 0.4, ageDays: 3,   stale: false, guardedScore: 0,   decision: "bogus",         reason: null,                        agent: "agent-doc", session: "demo:agent-doc:S2" }), actor: "agent-doc" },
]);

/* ── mapping ── */
{
  const { rows, intact } = liveRetrievalFromAudit(rowsIn);
  check("valid chain verifies intact", intact === true);
  check("only retrieval:* rows become retrieval rows (inference excluded)", rows.length === 6);
  check("decision + title + source + tier mapped (admitted)", rows[0].decision === "admitted" && rows[0].title === "AI Acceptable-Use Policy v4" && rows[0].source === "policy://governance/aup" && rows[0].tier === "trusted");
  check("a masked candidate is mapped masked", rows[1].decision === "masked");
  check("a down-weighted candidate is stale and carries a reason", rows[2].decision === "down-weighted" && rows[2].stale === true && rows[2].reason === "stale");
  check("a dropped candidate carries its reason and blocked tier", rows[3].decision === "dropped" && rows[3].reason === "untrusted source" && rows[3].tier === "blocked");
  check("an unknown decision is treated as dropped (deny-by-default)", rows[5].decision === "dropped");
  check("retrieval row keeps the real audit hash", rows[0].hash === rowsIn[1].hash);
  check("trustScore falls back to the tier score when absent", (() => {
    const one = chain([{ action: "retrieval:admitted", entity: "trusted", detail: md({ title: "T", source: "policy://governance/aup", tier: "trusted", decision: "admitted" }), actor: "a" }]);
    return liveRetrievalFromAudit(one).rows[0].trustScore === 1.0;
  })());
}

/* ── privacy contract: the surface never exposes passage text ── */
{
  const { rows } = liveRetrievalFromAudit(rowsIn);
  const blob = JSON.stringify(rows);
  check("live rows carry no passage text / secret patterns (metadata only)", !/sk-live|pricing table dump|123-45-6789|4111|@example\.com/.test(blob));
  check("a dropped row's reason is a generic governance string, not content", /untrusted source|sensitive content blocked/.test(rows[3].reason || ""));
}

/* ── tamper detection ── */
{
  const tampered = rowsIn.map((r, i) => i === 4 ? { ...r, detail: md({ title: "Leaked pricing notes", source: "pastebin.com/raw/xyz", tier: "trusted", decision: "admitted" }) } : r);
  check("altering a row breaks the chain", auditChainIntact(tampered) === false);
  check("liveRetrievalFromAudit reports the broken chain", liveRetrievalFromAudit(tampered).intact === false);
}

/* ── stats ── */
{
  const { rows, intact } = liveRetrievalFromAudit(rowsIn);
  const s = liveRetrievalStats(rows, intact);
  check("stats: total counts governed retrieval decisions", s.total === 6);
  check("stats: admitted == admitted + masked + down-weighted (reached the prompt)", s.admitted === 3);
  check("stats: masked count", s.masked === 1);
  check("stats: down-weighted count", s.downWeighted === 1);
  check("stats: dropped count (incl. the unknown verdict)", s.dropped === 3);
  check("stats: blockedSources counts blocked-tier rows", s.blockedSources === 1);
  check("stats: stale counts stale non-dropped rows", s.stale === 1);
  check("stats: intact propagates", s.intact === true);
  check("empty retrieval is a truthful empty (not seeded)", (() => { const e = liveRetrievalStats([], true); return e.total === 0 && e.admitted === 0 && e.dropped === 0 && e.intact === true; })());
}

/* ── shared decision helper: one source for seeded + live ── */
{
  check("retrievalDecision: blocked source → dropped/untrusted", (() => { const d = retrievalDecision({ blocked: true, chunkOk: true, masked: false, stale: false }); return d.decision === "dropped" && d.reason === "untrusted source"; })());
  check("retrievalDecision: invalid chunk → dropped with its reason", (() => { const d = retrievalDecision({ blocked: false, chunkOk: false, chunkReason: "low signal", masked: false, stale: false }); return d.decision === "dropped" && d.reason === "low signal"; })());
  check("retrievalDecision: masked wins over stale", retrievalDecision({ blocked: false, chunkOk: true, masked: true, stale: true }).decision === "masked");
  check("retrievalDecision: clean + fresh → admitted", retrievalDecision({ blocked: false, chunkOk: true, masked: false, stale: false }).decision === "admitted");
  check("seeded ledger decisions all belong to the shared taxonomy", seededRetrievalLedger().every(r => RETRIEVAL_DECISIONS.includes(r.decision)));
}

/* ── faithful-telemetry + privacy contract at the writer ── */
{
  const gw = read("app/api/gateway/chat/route.ts");
  check("gateway grounds via retrieveGoverned (decisions + passages)", /retrieveGoverned\(/.test(gw));
  check("gateway records the retrieval decision on the chain", /logRetrieval\(/.test(gw));
  check("gateway logs the retrieval decision (retrieval:<decision>)", /retrieval:\$\{ev\.decision\}/.test(gw));
  const retDetail = gw.match(/retrieval:\$\{ev\.decision\}[\s\S]{0,320}?JSON\.stringify\((\{[\s\S]*?\})\)/);
  check("gateway retrieval row logs governance metadata, not passage text (no snippet/text)", !!retDetail && /guardedScore/.test(retDetail[1]) && /tier/.test(retDetail[1]) && !/snippet/.test(retDetail[1]) && !/\btext\b/.test(retDetail[1]));
}

/* ── wiring contract (route + surface) ── */
{
  const route = read("app/api/enforce/retrieval/route.ts");
  check("route binds tenant to the session (BL-01 guard)", /resolveTenant\(/.test(route));
  check("route builds rows from the audit chain", /liveRetrievalFromAudit\(/.test(route));
  check("route is honest demo without a DB", /enabled:\s*false/.test(route));
  const surface = read("components/platform/enforce.jsx");
  check("surface fetches the live retrieval record", /\/api\/enforce\/retrieval/.test(surface));
  check("surface falls back to the seeded window", /usingLive\s*\?\s*live\.rows\s*:\s*seededRetrievalLedger\(\)/.test(surface));
  check("surface badges live-vs-demo provenance", /<TelemetryBadge\/>/.test(surface));
}

/* ── functional: retrieveGoverned() emits decisions without passage text ── */
await (async () => {
  const T = "rtest-" + Math.random().toString(36).slice(2, 8);
  await ingestDoc(T, { title: "AI Acceptable-Use Policy", source: "policy://governance/aup", content: "Employees must not paste customer records into external models; all GenAI usage across the organization is logged and subject to the human oversight standard before deployment." });
  await ingestDoc(T, { title: "Leaked notes", source: "pastebin.com/raw/xyz", content: "internal pricing table dump for the competitor comparison spreadsheet with many confidential rows and figures" });
  const g = await retrieveGoverned(T, "genai usage oversight pricing comparison", 4);
  check("retrieveGoverned grounds on the trusted document", g.passages.length > 0 && g.passages.some(p => p.source === "policy://governance/aup"));
  check("retrieveGoverned admits the trusted source", g.decisions.some(d => d.decision === "admitted" && d.source === "policy://governance/aup"));
  check("retrieveGoverned drops the untrusted (pastebin) source", g.decisions.some(d => d.decision === "dropped" && d.reason === "untrusted source" && /pastebin/.test(d.source)));
  const dblob = JSON.stringify(g.decisions);
  check("retrieveGoverned decisions carry no passage text (no snippet key / dropped content)", !/snippet/.test(dblob) && !/pricing table dump/.test(dblob));
})();

const failed = R.filter(([s]) => s === "FAIL");
for (const [s, n] of R) console.log(`${s}  ${n}`);
console.log(`\n${R.length - failed.length}/${R.length} passed`);
process.exit(failed.length ? 1 : 0);
