/* GenVeris · Live AI FinOps tests (#181)
   Locks the live spend path: real month-to-date spend derived from the audit
   chain's `inference:*` rows (actual token counts, priced from the price book),
   rolled up per provider AND per agent, chain-verified, with the honest
   demo fallback and route/surface wiring. Pure over crafted rows; runs in CI.
   Run: npx tsx scripts/cost-live-test.mjs */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { liveCostFromAudit } from "../lib/cost-live.ts";
import { providerForModel, costOf, PRICE_BOOK } from "../lib/cost-engine.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(resolve(ROOT, p), "utf8");
const sha = (s) => createHash("sha256").update(s).digest("hex");
const R = [];
const check = (name, cond) => { R.push([cond ? "PASS" : "FAIL", name]); };
const approx = (a, b, eps = 1e-6) => Math.abs(a - b) < eps;
const md = (o) => JSON.stringify(o);

/* A valid audit chain exactly as lib/audit.ts writes it. */
function auditChain(specs) {
  let prev = "genesis";
  return specs.map((s, i) => {
    const hash = sha(prev + "|" + s.action + "|" + s.entity + "|" + s.detail + "|" + s.actor);
    const row = { id: "aud" + i, createdAt: new Date(1790000000000 + i * 1000), prevHash: prev, hash, ...s };
    prev = hash;
    return row;
  });
}

const chain = auditChain([
  { action: "inference:allow", entity: "claude-sonnet-5", detail: md({ agent: "agent-crc", tool: "kb", dataClass: "Internal", tokens: 4_000_000_000 }), actor: "agent-crc" },
  { action: "inference:mask",  entity: "claude-sonnet-5", detail: md({ agent: "agent-doc", tool: "wire", dataClass: "Confidential", tokens: 1_000_000_000 }), actor: "agent-doc" },
  { action: "breaker-signal:prompt-injection", entity: "breaker", detail: md({ session: "s1", agent: "agent-crc" }), actor: "agent-crc" }, // non-inference: no spend
  { action: "inference:block", entity: "gpt-4o", detail: md({ agent: "agent-crc", tool: "web", dataClass: "Restricted", tokens: 500_000_000 }), actor: "agent-crc" },
]);

/* ── spend derivation ── */
{
  const c = liveCostFromAudit(chain);
  const claudeCost = costOf(5_000_000_000, "gw-claude"); // 4B+1B @ $9/1M = $45,000
  const openaiCost = costOf(500_000_000, "gw-openai");   // 0.5B @ $6.3/1M = $3,150
  check("total tokens sum only inference rows' real tokens", c.totalTokens === 5_500_000_000);
  check("total cost is priced from the price book per provider", approx(c.totalCost, claudeCost + openaiCost));
  check("requests count inference rows only (non-inference excluded)", c.requests === 3);
  check("blended $/1M is total cost over total Mtokens", approx(c.blendedPer1M, c.totalCost / (c.totalTokens / 1_000_000)));
}

/* ── per-provider rollup ── */
{
  const c = liveCostFromAudit(chain);
  check("providers rolled up and sorted by cost (claude first)", c.providers.length === 2 && c.providers[0].id === "gw-claude");
  const claude = c.providers.find((p) => p.id === "gw-claude");
  const openai = c.providers.find((p) => p.id === "gw-openai");
  check("claude provider: real tokens + requests + priced cost", claude.tokens === 5_000_000_000 && claude.requests === 2 && approx(claude.cost, costOf(5_000_000_000, "gw-claude")));
  check("provider carries its price-book budget", claude.budget === PRICE_BOOK["gw-claude"].budgetMtd);
  check("over-budget provider is flagged (claude $45K > $32K cap)", claude.overBudget === true && c.overBudget.some((p) => p.id === "gw-claude"));
  check("within-cap provider is not flagged (openai $3.15K < $6K)", openai.overBudget === false);
  check("routedShare is the live token share", claude.routedShare === Math.round((5_000_000_000 / 5_500_000_000) * 100));
  check("provider carries display meta (name/kind/status)", typeof claude.name === "string" && claude.name.length > 0 && typeof claude.status === "string");
}

/* ── per-agent attribution (the seeded rollup could never give this) ── */
{
  const c = liveCostFromAudit(chain);
  check("agents rolled up and sorted by cost", c.agents.length === 2 && c.agents[0].agent === "agent-crc");
  const crc = c.agents.find((a) => a.agent === "agent-crc");
  const doc = c.agents.find((a) => a.agent === "agent-doc");
  check("agent-crc aggregates across providers (4B claude + 0.5B openai)", crc.tokens === 4_500_000_000 && crc.requests === 2 && approx(crc.cost, costOf(4_000_000_000, "gw-claude") + costOf(500_000_000, "gw-openai")));
  check("agent-doc is its own attributed line", doc.tokens === 1_000_000_000 && doc.requests === 1);
  check("total budget is the allocation for providers in use", c.totalBudget === PRICE_BOOK["gw-claude"].budgetMtd + PRICE_BOOK["gw-openai"].budgetMtd);
  check("utilization is total spend vs total in-use budget", c.utilization === Math.round((c.totalCost / c.totalBudget) * 100));
}

/* ── chain verification / tamper ── */
{
  check("valid chain verifies intact", liveCostFromAudit(chain).intact === true);
  const tampered = chain.map((r, i) => i === 0 ? { ...r, detail: md({ agent: "agent-crc", tokens: 9_999_999_999 }) } : r);
  check("altering an inference row breaks the chain", liveCostFromAudit(tampered).intact === false);
}

/* ── robustness: missing/invalid tokens contribute zero, never NaN ── */
{
  const c = liveCostFromAudit(auditChain([
    { action: "inference:allow", entity: "claude", detail: md({ agent: "a" }), actor: "a" },                 // no tokens
    { action: "inference:allow", entity: "claude", detail: md({ agent: "a", tokens: -5 }), actor: "a" },      // negative
    { action: "inference:allow", entity: "claude", detail: "not json", actor: "a" },                          // bad detail
    { action: "inference:allow", entity: "claude", detail: md({ agent: "a", tokens: 1_000_000 }), actor: "a" }, // the one real row
  ]));
  check("invalid/missing token rows contribute 0 (no NaN)", c.totalTokens === 1_000_000 && Number.isFinite(c.totalCost) && approx(c.totalCost, costOf(1_000_000, "gw-claude")));
  check("requests still count every inference row", c.requests === 4);
}

/* ── honest empty (no seeding a live-with-no-traffic view) ── */
{
  const e = liveCostFromAudit([]);
  check("empty chain is a truthful empty, not seeded", e.totalTokens === 0 && e.totalCost === 0 && e.providers.length === 0 && e.agents.length === 0);
  check("empty chain: no divide-by-zero (utilization/blended = 0)", e.utilization === 0 && e.blendedPer1M === 0 && e.intact === true);
}

/* ── model → provider mapping ── */
{
  check("claude models price on the live provider", providerForModel("claude-sonnet-5") === "gw-claude");
  check("openai models map to gw-openai", providerForModel("gpt-4o") === "gw-openai");
  check("gemini/azure/bedrock map to their providers", providerForModel("gemini-2") === "gw-gemini" && providerForModel("azure-gpt") === "gw-azure" && providerForModel("bedrock-nova") === "gw-bedrock");
  check("unknown/empty model defaults to the live provider (never unpriced)", providerForModel("") === "gw-claude" && providerForModel("mystery") === "gw-claude");
}

/* ── the fabricated constant is retired from the live path ── */
{
  const eng = read("lib/cost-engine.ts");
  check("TOKENS_MTD is relabelled DEMO-only (not a live actual)", /DEMO SEED ONLY/.test(eng));
  const live = read("lib/cost-live.ts");
  check("live path does NOT read TOKENS_MTD", !/TOKENS_MTD/.test(live));
}

/* ── route + surface wiring contract ── */
{
  const route = read("app/api/enforce/cost/route.ts");
  check("route binds tenant to the session (BL-01 guard)", /resolveTenant\(/.test(route));
  check("route derives spend from the audit chain", /liveCostFromAudit\(/.test(route) && /auditLog\.findMany/.test(route));
  check("route is honest demo without a DB", /enabled:\s*false/.test(route));
  const ac = read("components/platform/aicentral.jsx");
  check("FinOps surface fetches the live cost record", /\/api\/enforce\/cost/.test(ac));
  check("FinOps surface falls back to the seeded window", /usingLive\s*\?\s*live\.providers\s*:\s*providerSpend\(\)/.test(ac));
  check("FinOps surface badges live-vs-demo provenance", /<TelemetryBadge\/>/.test(ac));
  check("FinOps surface shows per-agent attribution", /Spend by agent/.test(ac) && /live\.agents/.test(ac));
  const ci = read(".github/workflows/ci.yml");
  check("CI runs the live FinOps tests", /test:costlive/.test(ci));
  const pkg = read("package.json");
  check("package.json wires test:costlive into test:unit", /"test:costlive"/.test(pkg) && /test:costlive/.test(pkg.split('"test:unit"')[1] || ""));
}

const failed = R.filter(([s]) => s === "FAIL");
for (const [s, n] of R) console.log(`${s}  ${n}`);
console.log(`\n${R.length - failed.length}/${R.length} passed`);
process.exit(failed.length ? 1 : 0);
