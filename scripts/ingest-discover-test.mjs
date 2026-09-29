/* GenVeris · Discover ingestion contract tests (WS1 / #166)
   Locks the pure validation of the Discover -> Evidence Fabric ingest: the
   Enterprise-tier gate, the metadata-only (Secret-class rejected) rule, known
   kinds, partial success, confidence clamping — plus the route's auth /
   provenance / persistence wiring contract. Pure over crafted bodies; runs in CI.
   Run: npx tsx scripts/ingest-discover-test.mjs */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { validateDiscoverIngest } from "../lib/ingest-discover.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(resolve(ROOT, p), "utf8");
const R = [];
const check = (name, cond) => { R.push([cond ? "PASS" : "FAIL", name]); };

const rec = (o) => ({ kind: "AISystem", entityId: "AIS-1", fields: { name: "X" }, ...o });

/* ── tier + request-shape gates ── */
{
  check("non-object body → 400 bad_request", (() => { const v = validateDiscoverIngest("nope"); return !v.ok && v.status === 400 && v.reason === "bad_request"; })());
  check("missing/lower tier → 403 enterprise_tier_required", (() => { const v = validateDiscoverIngest({ records: [rec()] }); return !v.ok && v.status === 403 && v.reason === "enterprise_tier_required"; })());
  check("tier=pro → 403 (Enterprise-only ingestion)", (() => { const v = validateDiscoverIngest({ tier: "pro", records: [rec()] }); return !v.ok && v.status === 403; })());
  check("tier=Enterprise (case-insensitive) is accepted", (() => { const v = validateDiscoverIngest({ tier: "Enterprise", records: [rec()] }); return v.ok === true; })());
  check("no records → 400 no_records", (() => { const v = validateDiscoverIngest({ tier: "enterprise", records: [] }); return !v.ok && v.reason === "no_records"; })());
  check("too many records → 413 too_many_records", (() => { const many = Array.from({ length: 501 }, (_, i) => rec({ entityId: "E" + i })); const v = validateDiscoverIngest({ tier: "enterprise", records: many }); return !v.ok && v.status === 413; })());
}

/* ── per-record validation ── */
{
  const v = validateDiscoverIngest({ tier: "enterprise", records: [
    rec({ kind: "AISystem",   entityId: "AIS-1", fields: { name: "Resolution Copilot", tier: "high" } }),
    rec({ kind: "Assessment", entityId: "ASM-1", confidence: 0.83, fields: { of: "AIS-1", kind: "compliance-rating", score: 72 } }),
    rec({ kind: "Bogus",      entityId: "BAD-1", fields: { x: 1 } }),                       // unknown kind
    rec({ kind: "AISystem",   entityId: "",      fields: { name: "no id" } }),              // missing entityId
    rec({ kind: "Finding",    entityId: "FND-1", fields: "notanobject" }),                  // bad fields
    rec({ kind: "EvidenceRef",entityId: "SEC-1", fields: { note: "apiKey sk-live-9f8a7b6c5d4e3f2a" } }), // secret-class
  ] });
  check("valid request returns ok:200", v.ok === true && v.status === 200);
  check("accepts the two well-formed records", v.ok && v.accepted.length === 2 && v.accepted[0].entityId === "AIS-1" && v.accepted[1].entityId === "ASM-1");
  check("rejects unknown kind", v.ok && v.rejected.some(r => r.entityId === "BAD-1" && /unknown kind/.test(r.reason)));
  check("rejects missing entityId", v.ok && v.rejected.some(r => /missing entityId/.test(r.reason)));
  check("rejects non-object fields", v.ok && v.rejected.some(r => r.entityId === "FND-1" && /fields must be an object/.test(r.reason)));
  check("rejects a Secret-class payload (metadata-only)", v.ok && v.rejected.some(r => r.entityId === "SEC-1" && /secret-class/i.test(r.reason)));
  check("partial success: 2 accepted, 4 rejected", v.ok && v.accepted.length === 2 && v.rejected.length === 4);
  check("confidence is clamped to [0,1]", (() => {
    const c = validateDiscoverIngest({ tier: "enterprise", records: [rec({ entityId: "C1", confidence: 5 }), rec({ entityId: "C2", confidence: -3 }), rec({ entityId: "C3" })] });
    return c.ok && c.accepted[0].confidence === 1 && c.accepted[1].confidence === 0 && c.accepted[2].confidence === 1;
  })());
  check("accepted records carry no source (route stamps it)", v.ok && v.accepted.every(a => !("source" in a)));
  check("PII (Confidential) metadata like an owner email is allowed, only Secret-class is blocked", (() => {
    const c = validateDiscoverIngest({ tier: "enterprise", records: [rec({ kind: "Owner", entityId: "OWN-1", fields: { role: "CISO", contact: "ciso@bank.example" } })] });
    return c.ok && c.accepted.length === 1;
  })());
}

/* ── route wiring contract (auth / provenance / persistence) ── */
{
  const route = read("app/api/ingest/discover/route.ts");
  check("route is token-guarded (VE_INGEST_TOKEN / VZ_INGEST_TOKEN)", /VE_INGEST_TOKEN|VZ_INGEST_TOKEN/.test(route));
  check("route compares the token in constant time", /timingSafeEqual/.test(route));
  check("route returns needsSetup when the token is unconfigured", /needsSetup/.test(route));
  check("route validates via the pure contract", /validateDiscoverIngest\(/.test(route));
  check("route FORCES source=\"discover\" (provenance integrity)", /source:\s*"discover"/.test(route));
  check("route persists via fabricAppend", /fabricAppend\(/.test(route));
  check("route needs the Fabric DB (honest 503 without one)", /database_unavailable/.test(route));
}

const failed = R.filter(([s]) => s === "FAIL");
for (const [s, n] of R) console.log(`${s}  ${n}`);
console.log(`\n${R.length - failed.length}/${R.length} passed`);
process.exit(failed.length ? 1 : 0);
