/* GenVeris · Workspace identity tests (#168 / WS3)
   Locks "live per-user data" step 1 — the workspace knows and says WHOSE data it
   shows: a real signed-in user (live) vs an illustrative persona (demo). The
   resolver never presents a persona as the signed-in user and never invents an
   email. Pure over the resolver + a source contract over the cockpit wiring.
   Run: npx tsx scripts/workspace-identity-test.mjs */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { resolveWorkspaceIdentity } from "../lib/workspace-identity.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(resolve(ROOT, p), "utf8");
const R = [];
const check = (name, cond) => { R.push([cond ? "PASS" : "FAIL", name]); };

const SEED = { employee: { name: "Sam Rivera", email: "sam@demo.example" }, manager: { name: "Riley Chen" } };

/* ── live identity (real signed-in user) ── */
{
  const id = resolveWorkspaceIdentity({ authUser: { name: "Sikander Ahmed", email: "sikander@geniaz.com", role: "employee" }, role: "employee", profiles: SEED });
  check("a signed-in user resolves live", id.live === true && id.label === "Signed in");
  check("live identity carries the session name + email + role", id.name === "Sikander Ahmed" && id.email === "sikander@geniaz.com" && id.role === "employee");
  const noName = resolveWorkspaceIdentity({ authUser: { email: "x@geniaz.com" }, role: "employee", profiles: SEED });
  check("live identity with no name falls back to the email", noName.live === true && noName.name === "x@geniaz.com");
  const roleFromSession = resolveWorkspaceIdentity({ authUser: { email: "m@geniaz.com", role: "manager" }, role: "employee", profiles: SEED });
  check("the session role wins over the passed role", roleFromSession.role === "manager");
}

/* ── demo identity (persona seed) — never overclaims live ── */
{
  const demo = resolveWorkspaceIdentity({ authUser: null, role: "employee", profiles: SEED });
  check("no signed-in user resolves to the demo persona", demo.live === false && demo.label === "Demo persona");
  check("demo identity uses the role persona seed name", demo.name === "Sam Rivera");
  const noEmail = resolveWorkspaceIdentity({ authUser: { name: "Ghost" }, role: "employee", profiles: SEED });
  check("an authUser without an email is NOT treated as live (never overclaims)", noEmail.live === false);
  check("demo identity never invents an email when the seed has none", resolveWorkspaceIdentity({ authUser: null, role: "manager", profiles: SEED }).email === "");
  check("demo identity falls back to the role when no seed exists", resolveWorkspaceIdentity({ authUser: null, role: "auditor", profiles: {} }).name === "auditor");
}

/* ── source contract: the platform captures the real identity and threads it ── */
{
  const gp = read("components/GenVerisPlatform.jsx");
  check("platform imports the identity resolver", /from "@\/lib\/workspace-identity"/.test(gp));
  check("platform holds the real signed-in user in state", /const \[authUser,setAuthUser\]=useState\(null\)/.test(gp));
  check("platform captures identity only for a real (non-demo) session with an email", /profile\.mode!=="demo"&&profile\.email/.test(gp));
  check("platform clears the identity on sign-out", /setAuthUser\(null\)/.test(gp));
  check("platform passes a resolved identity to the cockpit", /identity=\{resolveWorkspaceIdentity\(\{authUser,role,profiles:userProfiles\}\)\}/.test(gp));
}

/* ── source contract: the cockpit shows the identity honestly ── */
{
  const rc = read("components/platform/rolecenters.jsx");
  check("cockpit greeting uses the resolved identity name", /\(identity&&identity\.name\)\|\|userName/.test(rc));
  check("cockpit badges signed-in vs demo persona", /Signed in as \$\{identity\.email\}/.test(rc) && /Demo persona/.test(rc));
  check("the identity badge is coloured live-green vs demo-gold", /identity\.live\?T\.green:AI_GOLD/.test(rc));
  const pkg = read("package.json");
  check("package.json wires test:wsidentity into test:unit", /"test:wsidentity"/.test(pkg) && /test:wsidentity/.test(pkg.split('"test:unit"')[1] || ""));
  const ci = read(".github/workflows/ci.yml");
  check("CI runs the workspace-identity tests", /test:wsidentity/.test(ci));
}

const failed = R.filter(([s]) => s === "FAIL");
for (const [s, n] of R) console.log(`${s}  ${n}`);
console.log(`\n${R.length - failed.length}/${R.length} passed`);
process.exit(failed.length ? 1 : 0);
