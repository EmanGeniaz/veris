/* GenVeris · Evidence Fabric tests (WS1 / #166)
   Locks the canonical core: hash-chain build + verification + tamper detection,
   record mapping, the human-decision-wins resolution, idempotency signature, the
   read adapters that present existing Evidence/audit rows as canonical entities
   (no migration), the privacy contract (metadata only, never raw content), stats,
   and the route/schema/wiring contract. Pure over crafted rows; runs in CI.
   Run: npx tsx scripts/fabric-test.mjs */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  fabricChainIntact, fabricHash, fabricIdem, mapFabricRow, currentByEntity,
  humanDecisionWins, evidenceToCanonical, auditToCanonical, fabricStats, fabricView, FABRIC_KINDS,
} from "../lib/evidence-fabric.ts";
import { auditChainIntact } from "../lib/enforce-live.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(resolve(ROOT, p), "utf8");
const sha = (s) => createHash("sha256").update(s).digest("hex");
const R = [];
const check = (name, cond) => { R.push([cond ? "PASS" : "FAIL", name]); };

/* Build a valid Fabric hash chain exactly as lib/evidence-fabric.ts writes it. */
function fabChain(specs) {
  let prev = "genesis";
  return specs.map((s, i) => {
    const payload = JSON.stringify(s.fields);
    const hash = fabricHash(prev, { kind: s.kind, entityId: s.entityId, source: s.source, payload, actor: s.actor });
    const row = {
      id: "fab" + i, createdAt: new Date(1790000000000 + i * 1000),
      kind: s.kind, entityId: s.entityId, source: s.source, confidence: s.confidence ?? 1,
      actor: s.actor, supersedes: s.supersedes ?? null,
      idem: fabricIdem(s.kind, s.entityId, s.source, payload), payload, prevHash: prev, hash,
    };
    prev = hash;
    return row;
  });
}
/* A valid audit chain (as lib/audit.ts writes it) for the adapter + fabricView tests. */
function auditChain(specs) {
  let prev = "genesis";
  return specs.map((s, i) => {
    const hash = sha(prev + "|" + s.action + "|" + s.entity + "|" + s.detail + "|" + s.actor);
    const row = { id: "aud" + i, createdAt: new Date(1790000500000 + i * 1000), prevHash: prev, hash, ...s };
    prev = hash;
    return row;
  });
}
const md = (o) => JSON.stringify(o);

const fabRows = fabChain([
  { kind: "AISystem",    entityId: "AIS-001", source: "discover", actor: "discover", fields: { name: "Resolution Copilot", tier: "high", sector: "banking", region: "UAE" } },
  { kind: "Assessment",  entityId: "ASM-001", source: "discover", actor: "discover", fields: { of: "AIS-001", kind: "compliance-rating", score: 72 } },
  { kind: "Finding",     entityId: "FND-001", source: "enforce",  actor: "gateway",  fields: { of: "AIS-001", severity: "high", reason: "egress to untrusted host" } },
  // human decision on AIS-001, then a later automated update — human must win
  { kind: "AISystem",    entityId: "AIS-001", source: "human",    actor: "ciso",     fields: { name: "Resolution Copilot", tier: "high", decision: "approved-with-conditions" } },
  { kind: "AISystem",    entityId: "AIS-001", source: "discover", actor: "discover", fields: { name: "Resolution Copilot", tier: "critical", note: "auto re-rated" } },
]);

/* ── chain verify + tamper ── */
{
  check("valid Fabric chain verifies intact", fabricChainIntact(fabRows) === true);
  const tampered = fabRows.map((r, i) => i === 1 ? { ...r, payload: md({ of: "AIS-001", kind: "compliance-rating", score: 99 }) } : r);
  check("altering a record breaks the chain", fabricChainIntact(tampered) === false);
}

/* ── mapping ── */
{
  const m = mapFabricRow(fabRows[0]);
  check("maps kind + entityId + provenance + fields", m.kind === "AISystem" && m.entityId === "AIS-001" && m.provenance.source === "discover" && m.fields.name === "Resolution Copilot");
  check("provenance carries confidence + actor + recordId", m.provenance.confidence === 1 && m.provenance.actor === "discover" && !!m.provenance.recordId);
  const unknown = mapFabricRow({ ...fabRows[0], kind: "Bogus" });
  check("unknown kind falls back to Finding (never invented)", unknown.kind === "Finding");
  check("FABRIC_KINDS is the canonical set", FABRIC_KINDS.includes("AISystem") && FABRIC_KINDS.includes("ShadowAIItem") && FABRIC_KINDS.length === 7);
}

/* ── human-decision-wins ── */
{
  const current = currentByEntity(fabRows.map(mapFabricRow));
  const ais = current.find((r) => r.entityId === "AIS-001");
  check("current value per entity resolves human-wins (not the later automated write)", ais.provenance.source === "human" && ais.fields.decision === "approved-with-conditions");
  check("current view has one record per entity", current.filter((r) => r.entityId === "AIS-001").length === 1);
  check("humanDecisionWins: automated write is overridden by an existing human decision", humanDecisionWins(fabRows.map(mapFabricRow), "AIS-001", "discover") === true);
  check("humanDecisionWins: a human write is never overridden", humanDecisionWins(fabRows.map(mapFabricRow), "AIS-001", "human") === false);
  check("humanDecisionWins: no human history → automated write stands", humanDecisionWins(fabRows.map(mapFabricRow), "FND-001", "enforce") === false);
}

/* ── idempotency signature ── */
{
  const p = md({ a: 1 });
  check("fabricIdem is stable for identical entity+content+source", fabricIdem("AISystem", "X", "discover", p) === fabricIdem("AISystem", "X", "discover", p));
  check("fabricIdem changes when the payload changes", fabricIdem("AISystem", "X", "discover", p) !== fabricIdem("AISystem", "X", "discover", md({ a: 2 })));
  check("fabricIdem changes when the source changes", fabricIdem("AISystem", "X", "discover", p) !== fabricIdem("AISystem", "X", "enforce", p));
}

/* ── read adapters (no migration) ── */
{
  const ev = evidenceToCanonical([{ id: "e1", item: "DPIA — Resolution Copilot", initiative: "CX", scope: "privacy", control: "A.5", risk: "med", owner: "cdpo", status: "approved", approval: "signed", version: "v2", createdAt: new Date(1790000000000) }]);
  check("Evidence rows become canonical EvidenceRef entities", ev.length === 1 && ev[0].kind === "EvidenceRef" && ev[0].fields.item === "DPIA — Resolution Copilot" && ev[0].provenance.source === "genveris");
  const aud = auditChain([
    { action: "inference:allow", entity: "claude-sonnet-5", detail: md({ agent: "agent-crc", tool: "read_kb", dataClass: "Internal" }), actor: "agent-crc" },
    { action: "inference:block", entity: "claude-sonnet-5", detail: md({ agent: "agent-doc", tool: "wire", dataClass: "Restricted" }), actor: "agent-doc" },
  ]);
  const dec = auditToCanonical(aud);
  check("audit-chain decisions become canonical entities carrying the decision", dec.length === 2 && dec[0].fields.action === "inference:allow" && dec[0].provenance.source === "enforce");
  check("audit adapter keeps the real chain hash", dec[0].hash === aud[0].hash);
}

/* ── privacy: canonical view carries metadata only, never raw content ── */
{
  const view = fabricView({ fabricRows: fabRows, evidenceRows: [], auditRows: [] });
  const blob = JSON.stringify(view.records);
  check("no raw secret/PII patterns in the canonical view", !/sk-live|4111\s?1111|123-45-6789|@example\.com/.test(blob));
}

/* ── stats + integrated view ── */
{
  const aud = auditChain([{ action: "inference:allow", entity: "m", detail: md({ agent: "a" }), actor: "a" }]);
  const view = fabricView({ fabricRows: fabRows, evidenceRows: [{ id: "e1", item: "DPIA", initiative: "CX", scope: "privacy", control: "A.5", risk: "med", owner: "cdpo", status: "approved", approval: "signed", version: "v2" }], auditRows: aud });
  check("fabricView integrates Fabric + evidence + audit", view.records.some((r) => r.kind === "AISystem") && view.records.some((r) => r.kind === "EvidenceRef") && view.records.some((r) => r.fields.action === "inference:allow"));
  check("both chains verified in the view", view.fabricIntact === true && view.auditIntact === true);
  check("stats count kinds + sources + intact", view.stats.systems === 1 && view.stats.evidence === 1 && view.stats.sources.includes("discover") && view.stats.intact === true);
  check("empty Fabric is a truthful empty (not seeded)", (() => { const e = fabricView({ fabricRows: [] }); return e.stats.total === 0 && e.stats.intact === true; })());
  check("a broken audit chain propagates to stats.intact=false", (() => {
    const bad = auditChain([{ action: "inference:allow", entity: "m", detail: md({ agent: "a" }), actor: "a" }]).map((r) => ({ ...r, detail: md({ agent: "attacker" }) }));
    return fabricView({ fabricRows: fabRows, auditRows: bad }).stats.intact === false;
  })());
}

/* ── wiring contract (schema + route + writer) ── */
{
  const schema = read("prisma/schema.prisma");
  check("schema defines the FabricRecord model", /model FabricRecord \{/.test(schema) && /idem\s+String/.test(schema) && /prevHash\s+String/.test(schema));
  check("Tenant relates to fabricRecords", /fabricRecords\s+FabricRecord\[\]/.test(schema));
  const route = read("app/api/fabric/route.ts");
  check("route binds tenant to the session (BL-01 guard)", /resolveTenant\(/.test(route));
  check("route builds the canonical view", /fabricView\(/.test(route));
  check("route is honest demo without a DB", /enabled:\s*false/.test(route));
  const lib = read("lib/evidence-fabric.ts");
  check("writer is idempotent + hash-chained (fabricAppend)", /export async function fabricAppend/.test(lib) && /deduped/.test(lib) && /fabricHash\(/.test(lib));
}

const failed = R.filter(([s]) => s === "FAIL");
for (const [s, n] of R) console.log(`${s}  ${n}`);
console.log(`\n${R.length - failed.length}/${R.length} passed`);
process.exit(failed.length ? 1 : 0);
