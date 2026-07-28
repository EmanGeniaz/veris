/* Unit test for the canonical RBAC model that drives server-side enforcement. */
import { can, capabilityFor, STORE_REQUIREMENT, type AccessMatrix } from "../lib/rbac";

let pass = 0, fail = 0;
const ok = (name: string, cond: boolean) => { if (cond) { pass++; console.log("PASS -", name); } else { fail++; console.log("FAIL -", name); } };

// default grants
ok("employee blocked from decisions (needs approve on dec)", !can("employee", "dec", "approve"));
ok("caio can write decisions", can("caio", "dec", "approve"));
ok("manager blocked from admin audit", !can("manager", "admin", "contribute"));
ok("cio can write admin audit", can("cio", "admin", "contribute"));
ok("only full admin edits RBAC policy (caio yes)", can("caio", "admin", "admin"));
ok("cgo cannot edit RBAC policy (contribute < admin)", !can("cgo", "admin", "admin"));
ok("unknown/empty role denied", !can(null, "dec", "view"));

// per-tenant overrides lay over defaults
const ov: AccessMatrix = { employee: { dec: "approve" } };
ok("override grants employee decisions", can("employee", "dec", "approve", ov));
ok("override is per-role (manager unaffected)", !can("manager", "dec", "approve", ov));
ok("override does not leak across modules", !can("employee", "admin", "approve", ov));
ok("capabilityFor returns override value", capabilityFor("employee", "dec", ov) === "approve");
ok("capabilityFor falls back to default", capabilityFor("caio", "risk") === "approve");

// store requirements map is wired
ok("decisions requires approve", STORE_REQUIREMENT.decisions?.minCap === "approve");
ok("rbacPolicy requires admin", STORE_REQUIREMENT.rbacPolicy?.minCap === "admin");

console.log(`\nRBAC model: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
