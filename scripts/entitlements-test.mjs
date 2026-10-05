/* GenVeris · Plane entitlement tests (WS2 / #167 — sub-task 1)
   Locks the entitlement seam's authorization half: the pure, server-authoritative
   resolver (default-empty, suspended-excludes, plane isolation), the strict grant
   schema, and the route contracts — the operator grant path is token-guarded
   (client-cannot-self-grant) and the session-bound read never writes and never
   trusts a client flag. Pure over crafted rows + static/behavioural contract over
   the routes. Runs in CI (no DB needed).
   Run: npx tsx scripts/entitlements-test.mjs */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { NextRequest } from "next/server";
import { PLANES, isPlane, isActive, entitledTo, entitledPlanes } from "../lib/entitlements.ts";
import { validate } from "../lib/api-guard.ts";
import { entitlementGrantSchema } from "../lib/api-schemas.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(resolve(ROOT, p), "utf8");
const R = [];
const check = (name, cond) => { R.push([cond ? "PASS" : "FAIL", name]); };

/* ── 1 · the plane vocabulary ── */
{
  check("PLANES is the canonical set (enforce + discover)", PLANES.includes("enforce") && PLANES.includes("discover") && PLANES.length === 2);
  check("isPlane accepts a known plane", isPlane("enforce") === true);
  check("isPlane rejects an unknown plane", isPlane("genveris") === false && isPlane("") === false && isPlane(null) === false);
  check("isActive: default/empty status counts as active", isActive(undefined) === true && isActive(null) === true && isActive("active") === true);
  check("isActive: suspended does NOT count as active", isActive("suspended") === false);
}

/* ── 2 · the resolver — default-empty is the invariant ── */
{
  check("no rows → not entitled (default-empty)", entitledTo([], "enforce") === false && entitledTo(null, "enforce") === false && entitledTo(undefined, "enforce") === false);
  check("an active row → entitled", entitledTo([{ plane: "enforce", status: "active" }], "enforce") === true);
  check("a row with no status → entitled (legacy-safe active)", entitledTo([{ plane: "enforce" }], "enforce") === true);
  check("a suspended row → NOT entitled", entitledTo([{ plane: "enforce", status: "suspended" }], "enforce") === false);
  // plane isolation: owning one plane never implies another
  const rows = [{ plane: "discover", status: "active" }];
  check("owning discover does NOT entitle enforce (plane isolation)", entitledTo(rows, "discover") === true && entitledTo(rows, "enforce") === false);
  // a suspended enforce alongside an active discover
  const mixed = [{ plane: "enforce", status: "suspended" }, { plane: "discover", status: "active" }];
  check("mixed rows resolve per-plane", entitledTo(mixed, "enforce") === false && entitledTo(mixed, "discover") === true);
}

/* ── 3 · entitledPlanes ── */
{
  check("entitledPlanes: empty → []", entitledPlanes([]).length === 0 && entitledPlanes(null).length === 0);
  check("entitledPlanes lists only active planes", JSON.stringify(entitledPlanes([{ plane: "enforce", status: "active" }, { plane: "discover", status: "suspended" }])) === JSON.stringify(["enforce"]));
  check("entitledPlanes is ordered by PLANES, de-duplicated", JSON.stringify(entitledPlanes([{ plane: "discover" }, { plane: "enforce" }, { plane: "discover" }])) === JSON.stringify(["enforce", "discover"]));
  check("entitledPlanes ignores unknown plane strings", entitledPlanes([{ plane: "mystery", status: "active" }]).length === 0);
}

/* ── 4 · the grant schema is strict + server-authoritative shaped ── */
{
  check("schema accepts a plane grant", validate(entitlementGrantSchema, { tenant: "acme", plane: "enforce", action: "grant" }).ok);
  check("schema defaults action to grant", (() => { const v = validate(entitlementGrantSchema, { tenant: "acme", plane: "enforce" }); return v.ok && v.data.action === "grant"; })());
  check("schema lowercases the tenant slug", (() => { const v = validate(entitlementGrantSchema, { tenant: "ACME", plane: "enforce" }); return v.ok && v.data.tenant === "acme"; })());
  check("schema requires a tenant", !validate(entitlementGrantSchema, { plane: "enforce" }).ok);
  check("schema requires at least a plane or a plan (refine)", !validate(entitlementGrantSchema, { tenant: "acme" }).ok);
  check("schema accepts a plan-only update", validate(entitlementGrantSchema, { tenant: "acme", plan: "enterprise" }).ok);
  check("schema accepts plan:null to clear", validate(entitlementGrantSchema, { tenant: "acme", plan: null }).ok);
  check("schema rejects an unknown plane", !validate(entitlementGrantSchema, { tenant: "acme", plane: "genveris" }).ok);
  check("schema rejects an unknown action", !validate(entitlementGrantSchema, { tenant: "acme", plane: "enforce", action: "elevate" }).ok);
  check("schema rejects unknown keys (strict)", !validate(entitlementGrantSchema, { tenant: "acme", plane: "enforce", entitled: true }).ok);
  // the schema has no "status"/"entitled"/"grant:true" client flag that could self-grant
  check("schema has no client-trusted entitlement flag", (() => { const v = validate(entitlementGrantSchema, { tenant: "acme", entitled: true, planes: ["enforce"] }); return !v.ok; })());
}

/* ── 5 · schema + model wiring ── */
{
  const schema = read("prisma/schema.prisma");
  check("Prisma defines the Entitlement model", /model Entitlement \{/.test(schema));
  check("Entitlement is unique per tenant + plane", /@@unique\(\[tenantId,\s*plane\]\)/.test(schema));
  check("Entitlement carries who/when (grantedBy/grantedAt)", /grantedBy\s+String/.test(schema) && /grantedAt\s+DateTime/.test(schema));
  check("Entitlement defaults status to active", /status\s+String\s+@default\("active"\)/.test(schema));
  check("Tenant relates to entitlements", /entitlements\s+Entitlement\[\]/.test(schema));
  check("Tenant carries a small plan reference (nullable)", /\n\s*plan\s+String\?/.test(schema));
  const lib = read("lib/entitlements.ts");
  check("resolver is pure (no db / prisma / next imports)", !/@\/lib\/db|PrismaClient|next\/server/.test(lib));
}

/* ── 6 · the operator grant route — token-guarded (client-cannot-self-grant) ── */
{
  const admin = read("app/api/admin/entitlements/route.ts");
  check("grant route guards on VZ_ONBOARD_TOKEN", /process\.env\.VZ_ONBOARD_TOKEN/.test(admin));
  check("grant route compares the token with safeEqual (no plain ==)", /safeEqual\(/.test(admin));
  check("grant route checks authorization before any db write", /if \(!authorized\(req\)\)/.test(admin) && admin.indexOf("authorized(req)") < admin.indexOf("prisma.entitlement.upsert"));
  check("grant route rate-limits on the auth tier", /limit\(req,\s*"auth"/.test(admin));
  check("grant route validates a strict body (parseJson + schema)", /parseJson\(req,\s*entitlementGrantSchema/.test(admin));
  check("grant route reports failures via serverError (no leakage)", /serverError\(e,/.test(admin) && !/\be\.message\b/.test(admin));
  check("grant route upserts (grant/suspend) and deletes (revoke)", /prisma\.entitlement\.upsert/.test(admin) && /prisma\.entitlement\.deleteMany/.test(admin));
  check("grant route is a no-op without a database", /database not configured/.test(admin));
}

/* ── 7 · the session-bound read route — BL-01, never writes ── */
{
  const r = read("app/api/entitlements/route.ts");
  check("read route binds the tenant to the session (resolveTenant)", /resolveTenant\(/.test(r));
  check("read route resolves planes through the pure resolver", /entitledPlanes\(/.test(r));
  check("read route rate-limits on the user tier", /limit\(req,\s*"user"/.test(r));
  check("read route is honest demo without a DB", /enabled:\s*false/.test(r));
  check("read route reports failures via serverError", /serverError\(e,/.test(r) && !/\be\.message\b/.test(r));
  // client-cannot-self-grant: the readable, session-bound route performs NO write
  check("read route performs no entitlement write (cannot self-grant)", !/entitlement\.(create|upsert|update|delete|deleteMany)/.test(r));
  check("read route has no POST/PUT/PATCH/DELETE handler", !/export async function (POST|PUT|PATCH|DELETE)/.test(r));
}

/* ── 8 · behavioural: no token → 403; no DB → honest, never fabricated ── */
{
  const prev = process.env.VZ_ONBOARD_TOKEN;
  // operator grant with NO token configured server-side → forbidden (never grants)
  delete process.env.VZ_ONBOARD_TOKEN;
  const admin = await import("../app/api/admin/entitlements/route.ts");
  const noToken = await admin.POST(new NextRequest("http://localhost/api/admin/entitlements", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ tenant: "acme", plane: "enforce", action: "grant" }),
  }));
  check("operator grant with no server token → 403 (client cannot self-grant)", noToken.status === 403);

  // operator grant with a WRONG token → forbidden
  process.env.VZ_ONBOARD_TOKEN = "correct-horse-battery-staple";
  const wrong = await admin.POST(new NextRequest("http://localhost/api/admin/entitlements", {
    method: "POST", headers: { "content-type": "application/json", "x-onboard-token": "nope" },
    body: JSON.stringify({ tenant: "acme", plane: "enforce" }),
  }));
  check("operator grant with a wrong token → 403", wrong.status === 403);

  // correct token but no database → 400 (never silently succeeds)
  const authedNoDb = await admin.POST(new NextRequest("http://localhost/api/admin/entitlements", {
    method: "POST", headers: { "content-type": "application/json", "x-onboard-token": "correct-horse-battery-staple" },
    body: JSON.stringify({ tenant: "acme", plane: "enforce" }),
  }));
  check("operator grant with a correct token but no DB → 400 (no silent success)", authedNoDb.status === 400);

  // the session-bound read with no database → honest demo fallback (not fabricated)
  const reader = await import("../app/api/entitlements/route.ts");
  const readNoDb = await reader.GET(new NextRequest("http://localhost/api/entitlements"));
  const body = await readNoDb.json();
  check("session read with no DB → enabled:false (honest, not fabricated)", readNoDb.status === 200 && body.enabled === false);

  if (prev === undefined) delete process.env.VZ_ONBOARD_TOKEN; else process.env.VZ_ONBOARD_TOKEN = prev;
}

/* ── 9 · wired into CI ── */
{
  const pkg = JSON.parse(read("package.json"));
  check("test:entitlements script exists", !!pkg.scripts["test:entitlements"]);
  check("test:entitlements is in test:unit", /test:entitlements/.test(pkg.scripts["test:unit"]));
  const ci = read(".github/workflows/ci.yml");
  check("CI runs the entitlement tests", /npm run test:entitlements/.test(ci));
}

const failed = R.filter(([s]) => s === "FAIL");
for (const [s, n] of R) console.log(`${s}  ${n}`);
console.log(`\n${R.length - failed.length}/${R.length} passed`);
process.exit(failed.length ? 1 : 0);
