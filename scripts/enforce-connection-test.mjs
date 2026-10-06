/* GenVeris · Enforce connection tests (WS2 / #167 — sub-task 2)
   Locks the connection half of the Enforce seam: the centralized secret store
   (seal/open round-trip, off without a key, never raw), the SSRF gateway-URL
   guard, the honest state resolver (never "live" in this sub-task), the display
   mask (no secret leaks), the strict schema, and the route contracts (operator
   token-guarded, credential never returned, session read never writes).
   Run: npx tsx scripts/enforce-connection-test.mjs */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { randomBytes } from "node:crypto";
import { NextRequest } from "next/server";
import { validate } from "../lib/api-guard.ts";
import { enforceConnectionSchema } from "../lib/api-schemas.ts";
import { isSafeEnforceUrl, connectionState, maskConnection } from "../lib/enforce-connection.ts";
import { sealSecret, openSecret, secretsConfigured, secretFingerprint } from "../lib/secrets.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(resolve(ROOT, p), "utf8");
const R = [];
const check = (name, cond) => { R.push([cond ? "PASS" : "FAIL", name]); };

/* ── 1 · the secret store (keyed) · masterKey() reads env per call ── */
{
  const prev = process.env.VZ_SECRETS_KEY;
  process.env.VZ_SECRETS_KEY = randomBytes(32).toString("base64");
  check("secretsConfigured true with a 32-byte key", secretsConfigured() === true);
  const sealed = sealSecret("enforce-gateway-token-abc123");
  check("sealSecret returns a v1 envelope", typeof sealed === "string" && sealed.startsWith("v1:") && sealed.split(":").length === 4);
  check("sealed value is not the plaintext", !sealed.includes("enforce-gateway-token-abc123"));
  check("openSecret round-trips the plaintext", openSecret(sealed) === "enforce-gateway-token-abc123");
  check("sealing is non-deterministic (random IV)", sealSecret("x") !== sealSecret("x"));
  check("openSecret returns null on a tampered envelope", openSecret(sealed.slice(0, -4) + "AAAA") === null);
  check("openSecret returns null on garbage", openSecret("not-an-envelope") === null && openSecret(null) === null);
  check("fingerprint is stable, short, and not the plaintext", (() => {
    const fp = secretFingerprint("enforce-gateway-token-abc123");
    return fp === secretFingerprint("enforce-gateway-token-abc123") && fp.length === 12 && !"enforce-gateway-token-abc123".includes(fp);
  })());
  if (prev === undefined) delete process.env.VZ_SECRETS_KEY; else process.env.VZ_SECRETS_KEY = prev;
}

/* ── 2 · the secret store (OFF without a key) ── */
{
  const prev = process.env.VZ_SECRETS_KEY;
  delete process.env.VZ_SECRETS_KEY;
  check("secretsConfigured false without a key", secretsConfigured() === false);
  check("sealSecret refuses without a key (returns null — never clear-text)", sealSecret("tok") === null);
  check("openSecret returns null without a key", openSecret("v1:a:b:c") === null);
  // an invalid (wrong-length) key is also treated as unconfigured
  process.env.VZ_SECRETS_KEY = Buffer.from("short").toString("base64");
  check("an invalid-length key is treated as unconfigured", secretsConfigured() === false && sealSecret("t") === null);
  if (prev === undefined) delete process.env.VZ_SECRETS_KEY; else process.env.VZ_SECRETS_KEY = prev;
}

/* ── 3 · SSRF gateway-URL guard ── */
{
  check("accepts an https public FQDN", isSafeEnforceUrl("https://enforce.acme.com/admin/api").ok === true);
  check("rejects http (must be TLS)", isSafeEnforceUrl("http://enforce.acme.com").ok === false);
  check("rejects localhost", isSafeEnforceUrl("https://localhost/x").ok === false);
  check("rejects 127.0.0.1 loopback", isSafeEnforceUrl("https://127.0.0.1").ok === false);
  check("rejects the cloud metadata address (169.254.169.254)", isSafeEnforceUrl("https://169.254.169.254/latest/meta-data").ok === false);
  check("rejects RFC1918 10.x", isSafeEnforceUrl("https://10.1.2.3").ok === false);
  check("rejects RFC1918 192.168.x", isSafeEnforceUrl("https://192.168.0.5").ok === false);
  check("rejects RFC1918 172.16-31", isSafeEnforceUrl("https://172.20.10.10").ok === false);
  check("rejects IPv6 loopback ::1", isSafeEnforceUrl("https://[::1]/x").ok === false);
  check("rejects a bare single-label host", isSafeEnforceUrl("https://enforce/x").ok === false);
  check("rejects a non-URL", isSafeEnforceUrl("not a url").ok === false);
}

/* ── 4 · honest state resolver — never "live" in sub-task 2 ── */
{
  const notEnt = connectionState({ entitled: false, hasConnection: false });
  check("not entitled → not-entitled / Demo", notEnt.state === "not-entitled" && notEnt.badge === "Demo" && notEnt.live === false);
  const awaitCfg = connectionState({ entitled: true, hasConnection: false });
  check("entitled, no connection → awaiting-config / Demo", awaitCfg.state === "awaiting-config" && awaitCfg.live === false);
  const awaitConn = connectionState({ entitled: true, hasConnection: true, secretsReady: true });
  check("entitled + configured → awaiting-connection / Demo (never live here)", awaitConn.state === "awaiting-connection" && awaitConn.badge === "Demo" && awaitConn.live === false);
  const noSecret = connectionState({ entitled: true, hasConnection: true, secretsReady: false });
  check("configured but secret store unavailable → labelled honestly, still Demo", noSecret.state === "awaiting-connection" && /secret store/.test(noSecret.label) && noSecret.live === false);
  check("no state resolves to live / Live in sub-task 2", ![notEnt, awaitCfg, awaitConn, noSecret].some((v) => v.live === true || v.badge === "Live"));
}

/* ── 5 · display mask never leaks the secret ── */
{
  const m = maskConnection({ gatewayUrl: "https://enforce.acme.com", sealedToken: "v1:iv:tag:ct", credentialFp: "abcdef012345" });
  check("mask reports configured + credentialSet + fingerprint", m.configured === true && m.credentialSet === true && m.credentialFingerprint === "abcdef012345");
  check("mask never includes the sealed token or any token field", !("sealedToken" in m) && !("token" in m) && !JSON.stringify(m).includes("v1:iv:tag:ct"));
  const empty = maskConnection(null);
  check("mask of no row is honest-empty", empty.configured === false && empty.credentialSet === false && empty.gatewayUrl === null);
}

/* ── 6 · strict schema ── */
{
  check("set with a gatewayUrl validates", validate(enforceConnectionSchema, { tenant: "acme", action: "set", gatewayUrl: "https://e.acme.com", token: "t" }).ok);
  check("set defaults action and requires gatewayUrl", (() => {
    const d = validate(enforceConnectionSchema, { tenant: "acme", gatewayUrl: "https://e.acme.com" });
    return d.ok && d.data.action === "set";
  })());
  check("set without a gatewayUrl is rejected (refine)", !validate(enforceConnectionSchema, { tenant: "acme", action: "set" }).ok);
  check("clear needs no gatewayUrl", validate(enforceConnectionSchema, { tenant: "acme", action: "clear" }).ok);
  check("tenant is required", !validate(enforceConnectionSchema, { action: "clear" }).ok);
  check("unknown keys rejected (strict)", !validate(enforceConnectionSchema, { tenant: "acme", action: "clear", sealedToken: "x" }).ok);
  check("no client-trusted sealed/live field", !validate(enforceConnectionSchema, { tenant: "acme", gatewayUrl: "https://e.acme.com", live: true }).ok);
}

/* ── 7 · operator route contract — token-guarded, secret never returned ── */
{
  const admin = read("app/api/admin/enforce-connection/route.ts");
  check("operator route guards on VZ_ONBOARD_TOKEN via safeEqual", /process\.env\.VZ_ONBOARD_TOKEN/.test(admin) && /safeEqual\(/.test(admin));
  check("operator route checks auth before any db write", admin.indexOf("authorized(req)") < admin.indexOf("prisma.enforceConnection.upsert"));
  check("operator route SSRF-validates the gateway URL", /isSafeEnforceUrl\(/.test(admin));
  check("operator route seals the credential (never stores raw)", /sealSecret\(/.test(admin) && !/data:\s*\{\s*[^}]*token\s*:/.test(admin));
  check("operator route refuses a credential with no secret store", /secrets_unconfigured/.test(admin));
  check("operator route returns only the masked connection (no sealedToken)", /maskConnection\(/.test(admin) && !/sealedToken:\s*row|json\([^)]*sealedToken/.test(admin));
  check("operator route rate-limits (auth) + parseJson + serverError", /limit\(req,\s*"auth"/.test(admin) && /parseJson\(req,\s*enforceConnectionSchema/.test(admin) && /serverError\(e,/.test(admin) && !/\be\.message\b/.test(admin));
}

/* ── 8 · session route contract — BL-01, read-only, no secret ── */
{
  const r = read("app/api/enforce/connection/route.ts");
  check("session route binds tenant to the session (resolveTenant)", /resolveTenant\(/.test(r));
  check("session route composes entitlement + connection state", /entitledTo\(/.test(r) && /connectionState\(/.test(r));
  check("session route performs no write", !/enforceConnection\.(create|upsert|update|delete|deleteMany)/.test(r));
  // reading row?.sealedToken to compute secretsReady is fine; it must never be EMITTED
  check("session route returns only the masked connection (never emits sealedToken)", /maskConnection\(/.test(r) && !/sealedToken:/.test(r) && !/json\([^)]*sealedToken/.test(r));
  check("session route is honest-demo without a DB", /enabled:\s*false/.test(r));
  check("session route rate-limits (user) + serverError, no leak", /limit\(req,\s*"user"/.test(r) && /serverError\(e,/.test(r) && !/\be\.message\b/.test(r));
}

/* ── 9 · behavioural — no token → 403; no DB → honest ── */
{
  const prev = process.env.VZ_ONBOARD_TOKEN;
  delete process.env.VZ_ONBOARD_TOKEN;
  const admin = await import("../app/api/admin/enforce-connection/route.ts");
  const noToken = await admin.POST(new NextRequest("http://localhost/api/admin/enforce-connection", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ tenant: "acme", action: "set", gatewayUrl: "https://e.acme.com", token: "t" }),
  }));
  check("operator set with no server token → 403", noToken.status === 403);

  const reader = await import("../app/api/enforce/connection/route.ts");
  const noDb = await reader.GET(new NextRequest("http://localhost/api/enforce/connection"));
  const body = await noDb.json();
  check("session read with no DB → enabled:false (honest, not fabricated)", noDb.status === 200 && body.enabled === false);
  if (prev === undefined) delete process.env.VZ_ONBOARD_TOKEN; else process.env.VZ_ONBOARD_TOKEN = prev;
}

/* ── 10 · schema + wiring ── */
{
  const schema = read("prisma/schema.prisma");
  check("Prisma defines EnforceConnection, one per tenant", /model EnforceConnection \{/.test(schema) && /tenantId\s+String\s+@unique/.test(schema));
  check("EnforceConnection stores a sealed token (never raw) + fingerprint", /sealedToken\s+String\?/.test(schema) && /credentialFp\s+String\?/.test(schema));
  check("Tenant relates to the connection", /enforceConnection\s+EnforceConnection\?/.test(schema));
  const pkg = JSON.parse(read("package.json"));
  check("test:enforceconn script exists + in test:unit", !!pkg.scripts["test:enforceconn"] && /test:enforceconn/.test(pkg.scripts["test:unit"]));
  check("CI runs the enforce-connection tests", /npm run test:enforceconn/.test(read(".github/workflows/ci.yml")));
}

const failed = R.filter(([s]) => s === "FAIL");
for (const [s, n] of R) console.log(`${s}  ${n}`);
console.log(`\n${R.length - failed.length}/${R.length} passed`);
process.exit(failed.length ? 1 : 0);
