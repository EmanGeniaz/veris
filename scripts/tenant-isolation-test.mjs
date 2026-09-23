/* GenVeris · Tenant isolation tests (BL-01)
   The central tenant authority decides which tenant a data route may touch.
   These assertions lock the security invariant so the cross-tenant IDOR
   (a signed-in user reading another tenant by naming it in ?tenant / body)
   cannot regress. Pure + deterministic; runs in CI. Run: npx tsx scripts/tenant-isolation-test.mjs

   .ts module under tsx exports normally. */
import { authoritativeTenant, sanitizeSlug } from "../lib/bus-tenant.ts";

const R = [];
const check = (name, cond) => { R.push([cond ? "PASS" : "FAIL", name]); };
const slug = (i) => authoritativeTenant(i).slug;
const src = (i) => authoritativeTenant(i).source;

/* ── the exploit vector: session wins, client-supplied tenant is ignored ── */
{
  // Signed-in Globex user asks for Acme's data by naming it — must get their OWN tenant.
  const attack = { authConfigured: true, sessionEmail: "eve@globex.com", userTenantSlug: "globex", requestedTenant: "acme" };
  check("signed-in user cannot read another tenant via requestedTenant", slug(attack) === "globex");
  check("...and the source is the session, not the request", src(attack) === "session");

  // Host header cannot override a session either.
  check("host header cannot override a session", slug({ authConfigured: true, sessionEmail: "eve@globex.com", userTenantSlug: "globex", requestedTenant: "acme", host: "acme.genveris.com" }) === "globex");

  // A different signed-in user gets their own tenant.
  check("signed-in Acme user gets acme", slug({ authConfigured: true, sessionEmail: "a@acme.com", userTenantSlug: "acme", requestedTenant: "globex" }) === "acme");

  // Requesting your own tenant is a no-op (still your tenant).
  check("requesting own tenant is a no-op", slug({ authConfigured: true, sessionEmail: "a@acme.com", userTenantSlug: "acme", requestedTenant: "acme" }) === "acme");
}

/* ── anonymous with auth configured → demo only ── */
{
  check("anon + auth-configured is confined to demo", slug({ authConfigured: true, sessionEmail: null, userTenantSlug: null, requestedTenant: "acme" }) === "demo");
  check("anon + auth-configured source is demo", src({ authConfigured: true, requestedTenant: "acme", host: "acme.genveris.com" }) === "demo");
}

/* ── degrade-safe: identity resolved but tenant slug unknown → demo, never the requested tenant ── */
{
  check("session without a resolved tenant slug degrades to demo (not requested)", slug({ authConfigured: true, sessionEmail: "x@y.com", userTenantSlug: null, requestedTenant: "acme" }) === "demo");
}

/* ── no-auth demo mode → requested slug honoured, then host, then demo ── */
{
  check("no-auth honours the requested slug", slug({ authConfigured: false, requestedTenant: "acmeqa" }) === "acmeqa");
  check("no-auth requested source", src({ authConfigured: false, requestedTenant: "acmeqa" }) === "requested");
  check("no-auth falls back to host label", slug({ authConfigured: false, requestedTenant: null, host: "acme.genveris.com" }) === "acme");
  check("no-auth host source", src({ authConfigured: false, requestedTenant: null, host: "acme.genveris.com" }) === "host");
  check("no-auth with nothing → demo", slug({ authConfigured: false }) === "demo");
  check("no-auth reserved host label is not a tenant", slug({ authConfigured: false, requestedTenant: null, host: "console.genveris.com" }) === "demo");
}

/* ── sanitizeSlug ── */
{
  check("sanitizeSlug strips unsafe chars + lowercases", sanitizeSlug("Acme QA!") === "acmeqa");
  check("sanitizeSlug rejects empty", sanitizeSlug("") === null && sanitizeSlug(null) === null);
  check("sanitizeSlug rejects reserved labels", sanitizeSlug("genveris") === null && sanitizeSlug("console") === null);
  check("sanitizeSlug caps length at 40", (sanitizeSlug("a".repeat(60)) || "").length === 40);
}

const failed = R.filter(([s]) => s === "FAIL");
for (const [s, n] of R) console.log(`${s}  ${n}`);
console.log(`\n${R.length - failed.length}/${R.length} passed`);
process.exit(failed.length ? 1 : 0);
