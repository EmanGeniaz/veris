/* GenVeris · Engine regression tests (BL-11)
   Deterministic assertions for the pure governance/risk/cost/enforcement
   engines that compute the product's headline numbers and security decisions
   but previously had no automated coverage. Same pattern as
   guardrail-selfcheck / rbac-test: pure, no network/DB, exits non-zero on any
   failure so CI can gate it. Run: npx tsx scripts/engines-test.mjs

   Import interop note: under tsx, .js modules expose their exports via the
   default (namespace) binding; .ts modules export normally. */
import riskEngine from "../lib/risk-engine.js";
import egress from "../lib/egress.js";
import hitl from "../lib/hitl.js";
import inferenceLog from "../lib/inference-log.js";
import enforce from "../lib/enforce.js";
import governance from "../lib/governance.js";
import { estimateTokens, costOf, fmtUSD, fmtTokens, REQUEST_TOKEN_CEILING } from "../lib/cost-engine.ts";
import { classify, evaluateRules, validateResponse } from "../lib/policy-rules.ts";

const { inherentOf, liveResidual, bandLevel, levelFor, riskRollup } = riskEngine;
const { egressDecision } = egress;
const { requiresApproval } = hitl;
const { chainIntact, INFERENCE_EVENTS } = inferenceLog;
const { ledgerIntact, issueToken } = enforce;
const { GOVERNANCE_SCORE, GOVERNANCE_INPUTS, GOVERNANCE_DELTA } = governance;

const R = [];
const check = (name, cond) => { R.push([cond ? "PASS" : "FAIL", name]); };

/* ── risk-engine ── */
{
  const r = { likelihood: 4, impact: 4, residual: 9, level: "High", treatment: { status: "In Progress" }, controls: ["c1"] };
  check("risk inherent = likelihood×impact", inherentOf(r) === 16);
  check("risk baseline preserved at assessed status", liveResidual(r, "In Progress") === 9 && levelFor(r, "In Progress") === "High");
  check("risk residual drops as treatment completes", liveResidual(r, "Complete") < 9);
  check("risk level re-bands once moved", levelFor(r, "Complete") === bandLevel(liveResidual(r, "Complete")));
  check("risk residual floored above zero", liveResidual({ likelihood: 5, impact: 5, residual: 25, treatment: { status: "Open" } }, "Complete") >= 3);
  check("bandLevel thresholds", bandLevel(12) === "Critical" && bandLevel(7) === "High" && bandLevel(3) === "Medium" && bandLevel(2) === "Low");
  const rollup = riskRollup([r, { likelihood: 5, impact: 5, residual: 20, level: "Critical", status: "Open", treatment: { status: "Open" } }]);
  check("riskRollup counts open critical/high", rollup.criticalHigh >= 1 && rollup.critical >= 1);
}

/* ── cost-engine ── */
{
  check("estimateTokens ~4 chars/token", estimateTokens("abcd") === 1 && estimateTokens("") === 0);
  check("costOf uses provider rate", Math.abs(costOf(1_000_000, "gw-claude") - 9.0) < 1e-9);
  check("costOf falls back to default rate", Math.abs(costOf(1_000_000, "nonexistent") - 5.0) < 1e-9);
  check("REQUEST_TOKEN_CEILING is a positive number", typeof REQUEST_TOKEN_CEILING === "number" && REQUEST_TOKEN_CEILING > 0);
  check("fmtUSD scales K/M", fmtUSD(1500) === "$1.5K" && fmtUSD(2_000_000) === "$2.00M");
  check("fmtTokens scales B", fmtTokens(19_600_000_000) === "19.6B");
}

/* ── governance composite invariant ── */
{
  const weights = GOVERNANCE_INPUTS.reduce((s, i) => s + i.w, 0);
  const recomputed = Math.round(GOVERNANCE_INPUTS.reduce((s, i) => s + i.v * i.w, 0));
  check("governance weights sum to 1.00", Math.abs(weights - 1) < 1e-9);
  check("GOVERNANCE_SCORE equals its own weighted mean", GOVERNANCE_SCORE === recomputed);
  check("GOVERNANCE_DELTA is a number", typeof GOVERNANCE_DELTA === "number");
}

/* ── egress policy ── */
{
  check("egress allow-lists the model gateway", egressDecision("api.anthropic.com").decision === "allow");
  check("egress denies a known exfil sink", egressDecision("pastebin.com").decision === "deny");
  check("egress flags SSRF metadata IP", egressDecision("169.254.169.254").decision === "ssrf");
  check("egress denies internal wildcard for ext agents", egressDecision("db.internal.veris").decision === "deny");
  check("egress denies unknown host by default", egressDecision("attacker.example").decision === "deny");
}

/* ── HITL thresholds ── */
{
  check("HITL null-threshold action always gates", requiresApproval("issue_decision").gated === true);
  check("HITL numeric threshold gates at/above", requiresApproval("post_journal", 50000).gated === true);
  check("HITL numeric threshold below runs autonomously", requiresApproval("post_journal", 49999).gated === false);
  check("HITL unknown action does not gate", requiresApproval("some_routine_action").gated === false);
}

/* ── inference-log chain integrity ── */
{
  check("inference chain intact on seed", chainIntact(INFERENCE_EVENTS) === true);
  const tampered = INFERENCE_EVENTS.map((e, i) => (i === 3 ? { ...e, prevHash: "forged" } : e));
  check("inference chain detects tampering", chainIntact(tampered) === false);
}

/* ── enforce ledger + capability tokens ── */
{
  check("tool-call ledger is tamper-evident (intact)", ledgerIntact() === true);
  const granted = issueToken("agent-crc", "read_kb");
  check("issueToken grants for a held tool", granted.issued === true && granted.decision === "allow" && !!granted.token);
  const denied = issueToken("agent-crc", "write_ledger");
  check("issueToken refuses an ungranted tool (no token)", denied.issued === false && denied.token === null && denied.decision !== "allow");
}

/* ── policy-rules DLP ── */
{
  check("classify marks card data Restricted/PCI", (() => { const c = classify("card 4111 1111 1111 1111"); return c.dataClass === "Restricted" && c.categories.includes("PCI"); })());
  check("evaluateRules blocks card data", evaluateRules("card 4111 1111 1111 1111").blocked === true);
  check("evaluateRules masks email (no block)", (() => { const e = evaluateRules("email me at jane@example.com please"); return !e.blocked && e.didMask === true; })());
  check("validateResponse redacts a contiguous sk- secret", (() => { const v = validateResponse("token sk-9f8a7b6c5d4e3f2a1b"); return !v.ok && /REDACTED-SECRET/.test(v.redacted); })());
  check("validateResponse redacts a card in output", (() => { const v = validateResponse("card 4111 1111 1111 1111"); return !v.ok && /REDACTED-CARD/.test(v.redacted); })());
  // Hyphenated/underscored provider keys (sk-ant-…, sk-proj-…, sk_live_…) are now
  // detected + redacted (BL-12, resolved in PR #149). Full positive/negative
  // coverage lives in guardrail-selfcheck; this locks the cross-engine path.
  check("validateResponse redacts a hyphenated provider key (BL-12)", (() => { const v = validateResponse("here is a key " + "sk-ant-" + "api03-" + "9f8a7b6c5d4e3f2a1bXYZ0"); return !v.ok && /REDACTED-SECRET/.test(v.redacted); })());
}

const failed = R.filter(([s]) => s === "FAIL");
for (const [s, n] of R) console.log(`${s}  ${n}`);
console.log(`\n${R.length - failed.length}/${R.length} passed`);
process.exit(failed.length ? 1 : 0);
