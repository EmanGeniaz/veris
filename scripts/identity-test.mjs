/* GenVeris · Least-privilege identity tests (BL-02)
   Locks two invariants that stop privilege escalation via the identity layer:
   (1) self-registration never honours a caller-supplied role; (2) the seed
   ships no privileged accounts into a clean tenant and no hardcoded credential.
   The role resolver is pure (unit-tested); the seed guarantees are asserted as
   source contracts (no DB needed). Run: node scripts/identity-test.mjs */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { resolveRegistrationRole, SELF_REGISTRATION_ROLE } from "../lib/identity.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(resolve(ROOT, p), "utf8");
const R = [];
const check = (name, cond) => { R.push([cond ? "PASS" : "FAIL", name]); };

/* ── resolveRegistrationRole: never trusts the caller ── */
check("default self-registration role is least-privilege (employee)", SELF_REGISTRATION_ROLE === "employee");
for (const attempt of ["ceo", "caio", "ciso", "cfo", "admin", "manager", "cro", "legal", undefined, null, "", 42, { role: "ceo" }, ["ceo"]]) {
  check(`registration role ignores requested ${JSON.stringify(attempt)}`, resolveRegistrationRole(attempt) === "employee");
}

/* ── register route source contract ── */
{
  const src = read("app/api/register/route.ts");
  check("register route uses resolveRegistrationRole", /resolveRegistrationRole\s*\(/.test(src));
  check("register route no longer trusts body.role via a ROLES allowlist", !/ROLES\.has\([^)]*body\.role/.test(src));
  check("register route does not assign body.role directly to a user", !/role:\s*String\(body\.role\)/.test(src));
}

/* ── seed-core source contract: no shipped credential, demo-gated accounts ── */
{
  const seed = read("lib/seed-core.ts");
  check("seed carries no hardcoded shipped password", !/genveris-demo/.test(seed) && !/vzdemo/.test(seed));
  check("seed derives the demo password from DEMO_SEED_PASSWORD", /DEMO_SEED_PASSWORD/.test(seed));
  check("seed uses a random secret fallback", /randomBytes\(/.test(seed));
  // the role-user block must sit inside a `mode === "demo"` guard
  const m = seed.match(/if \(mode === "demo"\) \{[\s\S]*?genveris\.demo[\s\S]*?\n  \}/);
  check("seed role users are gated to demo mode (not clean tenants)", !!m);
}

const failed = R.filter(([s]) => s === "FAIL");
for (const [s, n] of R) console.log(`${s}  ${n}`);
console.log(`\n${R.length - failed.length}/${R.length} passed`);
process.exit(failed.length ? 1 : 0);
