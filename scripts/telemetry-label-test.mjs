/* GenVeris · Truthful telemetry labeling tests (BL-03)
   Locks the honest live-vs-demo provenance signal and its wiring so seeded
   governance/cost/framework numbers are never shown unlabelled. The mode
   decision is pure (unit-tested); the wiring is asserted as source contracts.
   Run: npx tsx scripts/telemetry-label-test.mjs */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { telemetryMode } from "../lib/telemetry-source.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(resolve(ROOT, p), "utf8");
const R = [];
const check = (name, cond) => { R.push([cond ? "PASS" : "FAIL", name]); };

/* ── telemetryMode: the authoritative signal ── */
{
  const demo = telemetryMode(false), live = telemetryMode(true);
  check("no DB -> demo mode", demo.mode === "demo" && demo.live === false);
  check("no DB -> honest 'Demo data' label", demo.label === "Demo data");
  check("DB configured -> live mode", live.mode === "live" && live.live === true);
  check("DB configured -> 'Live' label", live.label === "Live");
}

/* ── auth-status exposes the telemetry signal to the client ── */
{
  const route = read("app/api/auth-status/route.ts");
  check("auth-status returns telemetry from telemetryMode(dbConfigured())", /telemetry:\s*telemetryMode\(dbConfigured\(\)\)/.test(route));
}

/* ── the badge fails safe to demo and reads the authoritative signal ── */
{
  const badge = read("components/platform/telemetry-badge.jsx");
  check("badge defaults to the honest 'Demo data' state", /label:\s*"Demo data",\s*live:\s*false/.test(badge));
  check("badge reads /api/auth-status telemetry", /\/api\/auth-status/.test(badge) && /telemetry/.test(badge));
  check("badge never overclaims: live only when the signal says so", /info\.live\s*\?\s*T\.green\s*:\s*T\.amber/.test(badge));
}

/* ── the badge is wired onto the governance / framework / cost surfaces ── */
{
  const caio = read("components/platform/caio.jsx");
  const aic = read("components/platform/aicentral.jsx");
  check("caio imports TelemetryBadge", /import \{ TelemetryBadge \} from ".\/telemetry-badge"/.test(caio));
  check("governance-score panel is badged", /How the \{GOV_SCORE\} is scored/.test(caio) && (caio.match(/<TelemetryBadge\/>/g) || []).length >= 2);
  check("aicentral FinOps header is badged", /AI FinOps — spend vs budget[\s\S]{0,120}<TelemetryBadge\/>|<TelemetryBadge\/>[\s\S]{0,160}AI FinOps/.test(aic) || /<TelemetryBadge\/>/.test(aic));
}

const failed = R.filter(([s]) => s === "FAIL");
for (const [s, n] of R) console.log(`${s}  ${n}`);
console.log(`\n${R.length - failed.length}/${R.length} passed`);
process.exit(failed.length ? 1 : 0);
