/* GenVeris · Connector honesty tests (#182)
   Locks the connector honesty vocabulary: one truthful state set, `live` true
   ONLY for a real integration, an honest default that never overclaims — and a
   source contract that no connector card implies "Connected" without a real
   integration and no fabricated provider spend remains.
   Run: npx tsx scripts/connector-honesty-test.mjs */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  CONNECTOR_STATES, CONNECTOR_STATE_META, connectorStateMeta, connectorIsLive, isConnectorState,
} from "../lib/connector-status.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(resolve(ROOT, p), "utf8");
const R = [];
const check = (name, cond) => { R.push([cond ? "PASS" : "FAIL", name]); };

/* ── 1 · the vocabulary ── */
{
  check("five canonical states", CONNECTOR_STATES.length === 5 && ["connected","live-when-configured","enterprise","roadmap","disconnected"].every((s) => CONNECTOR_STATES.includes(s)));
  check("every state has complete meta", CONNECTOR_STATES.every((s) => {
    const m = CONNECTOR_STATE_META[s];
    return m && typeof m.label === "string" && m.label && ["good","info","warn","muted"].includes(m.tone) && typeof m.live === "boolean" && typeof m.title === "string" && m.title;
  }));
  check("labels are the agreed vocabulary", CONNECTOR_STATE_META.connected.label === "Connected" && CONNECTOR_STATE_META["live-when-configured"].label === "Live when configured" && CONNECTOR_STATE_META.enterprise.label === "Requires Enterprise" && CONNECTOR_STATE_META.roadmap.label === "Roadmap" && CONNECTOR_STATE_META.disconnected.label === "Not connected");
}

/* ── 2 · the honesty invariant — live ONLY for a real integration ── */
{
  check("connected + live-when-configured are live", CONNECTOR_STATE_META.connected.live === true && CONNECTOR_STATE_META["live-when-configured"].live === true);
  check("enterprise / roadmap / disconnected are NOT live", CONNECTOR_STATE_META.enterprise.live === false && CONNECTOR_STATE_META.roadmap.live === false && CONNECTOR_STATE_META.disconnected.live === false);
  check("exactly two live states (no accidental live-by-default)", CONNECTOR_STATES.filter((s) => CONNECTOR_STATE_META[s].live).length === 2);
  check("connectorIsLive matches the meta", connectorIsLive("connected") === true && connectorIsLive("roadmap") === false);
}

/* ── 3 · honest default never overclaims ── */
{
  check("unknown state → disconnected (not live)", connectorStateMeta("bogus").label === "Not connected" && connectorStateMeta(undefined).live === false && connectorStateMeta(null).live === false);
  check("isConnectorState rejects junk", isConnectorState("connected") === true && isConnectorState("Available") === false && isConnectorState("") === false && isConnectorState(42) === false);
}

/* ── 4 · shared badge wiring (core.jsx) ── */
{
  const core = read("components/platform/core.jsx");
  check("core imports the pure vocabulary", /from "@\/lib\/connector-status"/.test(core));
  check("core exports a ConnectorTag badge", /export const ConnectorTag/.test(core));
  check("ConnectorTag renders the resolved label (honest, translated)", /connectorStateMeta\(state\)/.test(core) && /ts\(lang,\s*m\.label\)/.test(core));
}

/* ── 5 · source contract — no card implies Connected without a real integration ── */
{
  const ac = read("components/platform/aicentral.jsx");
  check("aicentral imports ConnectorTag", /ConnectorTag\s*}\s*from\s*"\.\/core"|,\s*ConnectorTag\b/.test(ac));
  // the gateway provider "Connection" column no longer blanket-labels every non-blocked provider "Connected"
  check("provider table drops the blanket Connected/Disconnected label", !/pv\.status==="Blocked"\?T_\("Disconnected"\):T_\("Connected"\)/.test(ac));
  check("provider table uses ConnectorTag, only Claude is live-when-configured", /ConnectorTag state=\{pv\.id==="gw-claude"\?"live-when-configured":"disconnected"\}/.test(ac));
  // marketplace no longer shows a green "Available" nor a dead Connect button
  check("marketplace drops the green \"Available\" badge", !/p\.status==="Available"\?T\.green/.test(ac));
  check("marketplace has no Connect button that only errors", !/p\.name\+" connection requires production credentials"/.test(ac));
  check("marketplace cards badge Roadmap via the vocabulary", /ConnectorTag state="roadmap"/.test(ac));
  // ServiceNow + CRM route through the honest vocabulary
  check("ServiceNow + CRM use ConnectorTag (not a bare Not Connected Tag)", (ac.match(/ConnectorTag state="disconnected"/g) || []).length >= 2 && !/Tag label=\{T_\("Not Connected"\)\}/.test(ac));
}

/* ── 6 · no fabricated provider spend remains ── */
{
  const models = read("lib/platform-models.ts");
  check("no per-provider costMtd dollar strings", !/costMtd:\s*"\$/.test(models));
  check("gatewayProviders carry no costMtd field", !/gw-azure"[^}]*costMtd/.test(models));
  const types = read("lib/types.ts");
  check("GatewayProvider type has no costMtd", !/costMtd/.test(types.slice(types.indexOf("type GatewayProvider"), types.indexOf("type GatewayProvider") + 220)));
}

/* ── 7 · wired into CI ── */
{
  const pkg = JSON.parse(read("package.json"));
  check("test:connector script exists + in test:unit", !!pkg.scripts["test:connector"] && /test:connector/.test(pkg.scripts["test:unit"]));
  check("CI runs the connector honesty tests", /npm run test:connector/.test(read(".github/workflows/ci.yml")));
}

const failed = R.filter(([s]) => s === "FAIL");
for (const [s, n] of R) console.log(`${s}  ${n}`);
console.log(`\n${R.length - failed.length}/${R.length} passed`);
process.exit(failed.length ? 1 : 0);
