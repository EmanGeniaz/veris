/* GenVeris · Security baseline tests (the six controls in CLAUDE.md)
   Deterministic: no network, no DB. Unit-tests the shared primitives and
   drives the real route handlers / middleware with synthetic Requests.
   Run: npx tsx scripts/security-baseline-test.mjs */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { NextRequest } from "next/server";
import {
  MemoryStore, rateLimit, limitFor, backoffDelayMs, backoffPolicy, backoffWaitMs,
  recordAuthFailure, clearAuthFailures, clientIp, setRateLimitStore,
} from "../lib/rate-limit.ts";
import { validate, serverError, safeEqual } from "../lib/api-guard.ts";
import { busSchemas, inspectSchema, knowledgeSchema, looksBinary, registerSchema } from "../lib/api-schemas.ts";

const R = [];
const check = (name, cond) => { R.push([cond ? "PASS" : "FAIL", name]); };
const fresh = () => setRateLimitStore(new MemoryStore());
const post = (url, body, headers = {}) => new Request(url, {
  method: "POST",
  headers: { "content-type": "application/json", "x-real-ip": "203.0.113.7", ...headers },
  body: typeof body === "string" ? body : JSON.stringify(body),
});

/* ── 1 · Rate limiting ── */
{
  const store = new MemoryStore();
  const lim = { max: 3, windowMs: 60_000 };
  const t0 = 1_000_000;
  const hits = [];
  for (let i = 0; i < 4; i++) hits.push(await rateLimit("k", lim, t0 + i, store));
  check("limiter allows up to max", hits.slice(0, 3).every((h) => h.ok));
  check("limiter blocks max+1", hits[3].ok === false);
  check("blocked result carries Retry-After seconds", hits[3].retryAfterSec > 0 && hits[3].retryAfterSec <= 60);
  check("limiter window resets", (await rateLimit("k", lim, t0 + 60_001, store)).ok === true);
  check("keys are independent", (await rateLimit("other", lim, t0 + 5, store)).ok === true);

  check("auth tier defaults to 20 / 15 min", JSON.stringify(limitFor("auth", {})) === JSON.stringify({ max: 20, windowMs: 900_000 }));
  const o = limitFor("public", { RATE_LIMIT_PUBLIC_MAX: "5", RATE_LIMIT_PUBLIC_WINDOW_SEC: "10" });
  check("thresholds are env-configurable", o.max === 5 && o.windowMs === 10_000);
  check("bad env values fall back to defaults", limitFor("user", { RATE_LIMIT_USER_MAX: "nope" }).max === 120);

  const p = backoffPolicy({ AUTH_BACKOFF_FREE_ATTEMPTS: "3", AUTH_BACKOFF_BASE_MS: "1000", AUTH_BACKOFF_MAX_MS: "5000" });
  check("backoff: free attempts have no delay", [0, 1, 2].every((n) => backoffDelayMs(n, p) === 0));
  check("backoff: exponential after free attempts", backoffDelayMs(3, p) === 1000 && backoffDelayMs(4, p) === 2000 && backoffDelayMs(5, p) === 4000);
  check("backoff: capped (no hard lockout)", backoffDelayMs(50, p) === 5000);
  const bs = new MemoryStore();
  for (let i = 0; i < 4; i++) await recordAuthFailure("acct", 10_000, p, bs);
  check("backoff: wait applies after repeated failures", (await backoffWaitMs("acct", 10_500, p, bs)) === 1500);
  check("backoff: wait expires", (await backoffWaitMs("acct", 12_001, p, bs)) === 0);
  await clearAuthFailures("acct", bs);
  check("backoff: success clears the counter", (await backoffWaitMs("acct", 10_001, p, bs)) === 0);

  const h = (o) => new Headers(o);
  check("clientIp prefers x-vercel-forwarded-for", clientIp(h({ "x-vercel-forwarded-for": "1.1.1.1", "x-forwarded-for": "9.9.9.9" })) === "1.1.1.1");
  check("clientIp takes first x-forwarded-for hop", clientIp(h({ "x-forwarded-for": "2.2.2.2, 10.0.0.1" })) === "2.2.2.2");

  const small = new MemoryStore(100);
  for (let i = 0; i < 1000; i++) await small.incr("rot" + i, 60_000, 0);
  check("memory store is bounded under key rotation", small["map"].size <= 100);
}

/* ── 1 · Route-level: auth endpoints answer 429 + Retry-After ── */
{
  fresh();
  process.env.DEMO_PASSWORD = "correct-horse-battery";
  process.env.AUTH_BACKOFF_FREE_ATTEMPTS = "3";
  const { POST } = await import("../app/api/demo-login/route.ts");
  const url = "http://localhost/api/demo-login";
  const good = await POST(post(url, { password: "correct-horse-battery" }));
  check("demo-login: correct password accepted", (await good.json()).ok === true);
  const statuses = [];
  for (let i = 0; i < 4; i++) statuses.push((await POST(post(url, { password: "wrong" + i }))).status);
  const blocked = await POST(post(url, { password: "correct-horse-battery" }));
  check("demo-login: wrong passwords rejected", statuses.slice(0, 3).every((s) => s === 200));
  check("demo-login: backoff → 429 after repeated failures", blocked.status === 429 && Number(blocked.headers.get("Retry-After")) >= 1);
  const other = await POST(post(url, { password: "correct-horse-battery" }, { "x-real-ip": "198.51.100.9" }));
  check("demo-login: backoff is per client, not global", (await other.json()).ok === true);

  fresh();
  delete process.env.DEMO_PASSWORD;
  const noEnv = await POST(post(url, { password: "govern-with-certainty" }, { "x-real-ip": "192.0.2.50" }));
  check("demo-login: no shipped default password", (await noEnv.json()).ok === false);

  fresh();
  process.env.RATE_LIMIT_AUTH_MAX = "3";
  const reg = await import("../app/api/register/route.ts");
  const rs = [];
  for (let i = 0; i < 4; i++) rs.push((await reg.POST(post("http://localhost/api/register", {}))).status);
  check("register: per-IP auth limit → 429", rs[3] === 429);
  delete process.env.RATE_LIMIT_AUTH_MAX;
}

/* ── 1 · Middleware backstop on every /api/* path ── */
{
  fresh();
  process.env.RATE_LIMIT_GLOBAL_MAX = "2";
  const { middleware } = await import("../middleware.ts");
  const mk = () => new NextRequest("http://localhost/api/enforce/ledger", { headers: { "x-real-ip": "203.0.113.99" } });
  const a = await middleware(mk()), b = await middleware(mk()), c = await middleware(mk());
  check("middleware: /api/* under the limit passes", a.status === 200 && b.status === 200);
  check("middleware: /api/* over the limit → 429 + Retry-After", c.status === 429 && !!c.headers.get("Retry-After"));
  delete process.env.RATE_LIMIT_GLOBAL_MAX;
}

/* ── 2 · Input validation ── */
{
  check("register: invalid email rejected", !validate(registerSchema, { name: "A", email: "nope", password: "12345678" }).ok);
  check("register: unknown field rejected", !validate(registerSchema, { name: "A", email: "a@b.co", password: "12345678", isAdmin: true }).ok);
  check("register: overlong password rejected", !validate(registerSchema, { name: "A", email: "a@b.co", password: "x".repeat(300) }).ok);
  check("register: valid body accepted + normalised", (() => { const r = validate(registerSchema, { name: " A ", email: " A@B.CO ", password: "12345678" }); return r.ok && r.data.email === "a@b.co" && r.data.name === "A"; })());
  check("inspect: unknown field rejected", !validate(inspectSchema, { text: "hi", evil: 1 }).ok);
  check("inspect: non-string text rejected", !validate(inspectSchema, { text: { $gt: "" } }).ok);
  check("bus rbacPolicy: role outside the RBAC model rejected", !validate(busSchemas.rbacPolicy, { role: "superuser", module: "admin", capability: "admin" }).ok);
  check("bus rbacPolicy: capability outside CAPS rejected", !validate(busSchemas.rbacPolicy, { role: "caio", module: "admin", capability: "root" }).ok);
  check("bus evidence: object field rejected", !validate(busSchemas.evidence, { item: { toString: 1 } }).ok);
  check("bus evidence: overlong field rejected", !validate(busSchemas.evidence, { item: "x".repeat(501) }).ok);
  const ev = validate(busSchemas.evidence, { item: "ok", time: "Just now" });
  check("bus evidence: display-only field dropped, never persisted", ev.ok && !("time" in ev.data));
  check("bus policies: NaN reviewCycleDays rejected", !validate(busSchemas.policies, { reviewCycleDays: "soon" }).ok);

  fresh();
  const { POST } = await import("../app/api/knowledge/route.ts");
  const bad = await POST(new NextRequest("http://localhost/api/knowledge", { method: "POST", headers: { "content-type": "application/json" }, body: "{not json" }));
  const badBody = await bad.json();
  check("knowledge: malformed JSON → 400", bad.status === 400 && badBody.code === "invalid_request");
  const wrongType = await POST(new NextRequest("http://localhost/api/knowledge", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ content: 42 }) }));
  check("knowledge: wrong type → 400", wrongType.status === 400);
}

/* ── 5 · Error handling & information leakage ── */
{
  const logs = [];
  const orig = console.error;
  console.error = (m) => logs.push(String(m));
  const secret = "PrismaClientKnownRequestError at /var/task/node_modules/.prisma/client/index.js:42 password=hunter2";
  const res = serverError(new Error(secret), "test.where");
  console.error = orig;
  const body = await res.json();
  const text = JSON.stringify(body);
  check("serverError: generic 500", res.status === 500 && body.code === "internal_error");
  check("serverError: no message, path or stack in the response", !text.includes("Prisma") && !text.includes("/var/task") && !text.includes("hunter2") && !text.includes("at "));
  check("serverError: request id returned for support", typeof body.requestId === "string" && body.requestId.length >= 32);
  check("serverError: full detail logged server-side under the same id", logs.some((l) => l.includes(body.requestId) && l.includes("hunter2") && l.includes("stack")));

  // Static guard: no route handler may put an exception's text into a response.
  const routes = [];
  const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (f === "route.ts") routes.push(p); } };
  walk("app/api");
  const leaks = [];
  for (const f of routes) {
    readFileSync(f, "utf8").split("\n").forEach((line, i) => {
      if (/json\(/.test(line) && /(\berr?\b|\be\b|\berror\b)(\s+as\s+Error\))?\.(message|stack)|String\((e|err|error)\)/.test(line)) leaks.push(`${f}:${i + 1}`);
    });
  }
  check(`no route returns e.message / String(e) (${routes.length} routes scanned)${leaks.length ? " → " + leaks.join(", ") : ""}`, routes.length > 10 && leaks.length === 0);
}

/* ── 3 · Secrets ── */
{
  const files = [];
  const walk = (d) => { for (const f of readdirSync(d)) { if (f === "node_modules" || f.startsWith(".")) continue; const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (/\.(ts|tsx|js|jsx|mjs)$/.test(f)) files.push(p); } };
  ["app", "lib", "components"].forEach(walk);
  files.push("auth.ts", "middleware.ts");
  const hits = [];
  for (const f of files) {
    readFileSync(f, "utf8").split("\n").forEach((line, i) => {
      // process.env.<SECRET-ish> || "literal" — a hardcoded fallback credential.
      if (/process\.env\.[A-Z0-9_]*(PASSWORD|SECRET|TOKEN|API_KEY|_KEY)\b[^\n]*\|\|\s*["'`][^"'`]+["'`]/.test(line)) hits.push(`${f}:${i + 1}`);
      if (/NEXT_PUBLIC_[A-Z0-9_]*(SECRET|TOKEN|PASSWORD|API_KEY)/.test(line)) hits.push(`${f}:${i + 1} (NEXT_PUBLIC secret)`);
    });
  }
  check(`no hardcoded fallback secrets or NEXT_PUBLIC secrets${hits.length ? " → " + hits.join(", ") : ""}`, hits.length === 0);
}

/* ── 4 · Dependency vulnerabilities ── */
{
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  check("xlsx (unfixed prototype-pollution/ReDoS advisories) is not a dependency", !pkg.dependencies.xlsx && !pkg.devDependencies?.xlsx);
}

/* ── 6 · File upload safety (knowledge vault text ingest) ── */
{
  check("upload: plain text accepted", !looksBinary("# Policy\nAll AI use must be logged.\n"));
  check("upload: PDF signature refused", looksBinary("%PDF-1.7\n1 0 obj"));
  check("upload: zip/docx signature refused", looksBinary("PK\u0003\u0004\u0014\u0000"));
  check("upload: NUL bytes refused", looksBinary("MZ\u0000\u0000\u0003"));
  check("upload: mostly-undecodable bytes refused", looksBinary("�".repeat(50) + "abc"));
  check("upload: text that merely starts with MZ is fine", !looksBinary("MZ Holdings annual AI policy"));

  fresh();
  const { POST } = await import("../app/api/knowledge/route.ts");
  // A PDF renamed to .txt: the extension says text, the content says otherwise.
  const spoof = await POST(new NextRequest("http://localhost/api/knowledge", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "board-minutes.txt", content: "%PDF-1.7\n%âãÏÓ\n1 0 obj << /Type /Catalog >>" }) }));
  check("upload: spoofed .txt carrying a PDF → 400", spoof.status === 400);
  const big = "x".repeat(900_001);
  const tooBig = await POST(new NextRequest("http://localhost/api/knowledge", { method: "POST", headers: { "content-type": "application/json", "content-length": String(big.length) }, body: big }));
  check("upload: oversized body refused before parsing → 413", tooBig.status === 413);
  check("upload: content over the char cap rejected", !validate(knowledgeSchema, { content: "a".repeat(200_001) }).ok);
  const ok = await POST(new NextRequest("http://localhost/api/knowledge", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "policy.md", content: "Responsible AI policy: every model is registered before use." }) }));
  const okBody = await ok.json();
  check("upload: valid text document ingested", ok.status === 200 && okBody.ok === true);
}

check("safeEqual: equal strings", safeEqual("abc", "abc"));
check("safeEqual: different lengths", !safeEqual("abc", "abcd") && !safeEqual("", "a"));

const failed = R.filter(([s]) => s === "FAIL");
for (const [s, n] of R) console.log(`${s}  ${n}`);
console.log(`\n${R.length - failed.length}/${R.length} passed`);
process.exit(failed.length ? 1 : 0);
