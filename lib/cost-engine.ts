/* ── Canonical AI cost-governance engine ─────────────────────────────
   One source of truth for AI spend: a real price book (blended $/1M
   tokens per provider), cost computed as tokens × rate, rolled up per
   provider and enterprise-wide, and measured against a monthly budget.
   The gateway's "Cost & Token Guard" (POL-FIN-005 §3.2 Spend limits)
   enforces a per-request token ceiling from here — so the FinOps policy
   is a runtime rule, not a static counter.

   Pure module (arithmetic only, no server/browser deps) so the same math
   runs in the Node gateway route and in the client console. Replaces the
   hardcoded costMtd strings that used to live on each provider. */
import { gatewayProviders, gatewayStats } from "./platform-models";

/* DEMO SEED ONLY — the illustrative month-to-date token volume the seeded
   FinOps window renders when NO database is configured. It is NOT a measured
   actual and must never be presented as live: the live path (lib/cost-live.ts,
   #181) derives real spend from the tamper-evident audit chain (the gateway
   appends real per-inference `tokens`), and the surface flips to it live-first,
   labelling this seed "Demo data". Kept only so the demo view has a plausible
   enterprise-scale shape (~19.6B tokens/mo ≈ governing all employee AI traffic). */
export const TOKENS_MTD = 19_600_000_000;

/* Price book: blended $ per 1M tokens (input+output) by provider id, plus
   the monthly spend budget the CFO's AI FinOps Policy allocates to each.
   Rates are representative list prices; budgets are the enforced caps.
   Two providers are deliberately over cap so the guard has something to
   escalate — including a Restricted one (spend on a pilot-only vendor). */
export type ProviderCost = { blendedPer1M: number; budgetMtd: number };
export const PRICE_BOOK: Record<string, ProviderCost> = {
  "gw-copilot":  { blendedPer1M: 3.5,  budgetMtd: 26_000 },
  "gw-azure":    { blendedPer1M: 5.6,  budgetMtd: 22_000 },
  "gw-bedrock":  { blendedPer1M: 3.0,  budgetMtd: 10_000 },
  "gw-openai":   { blendedPer1M: 6.3,  budgetMtd:  6_000 },
  "gw-claude":   { blendedPer1M: 9.0,  budgetMtd: 32_000 },
  "gw-gemini":   { blendedPer1M: 3.5,  budgetMtd:  3_000 },
  "gw-internal": { blendedPer1M: 0.35, budgetMtd:  1_000 },
};
const DEFAULT_RATE = 5.0;

/* Map an audit row's model (the inference row's `entity`) to a price-book
   provider id, so live spend can be priced and attributed per provider. The
   gateway routes live traffic to Claude today; other ids price correctly if a
   future provider ever appears on the chain. Unknown/empty → the live provider. */
export function providerForModel(model?: string): string {
  const m = String(model || "").toLowerCase();
  if (!m) return "gw-claude";
  if (m.includes("claude")) return "gw-claude";
  // Vendor-hosted providers are matched BEFORE the generic gpt/openai check, so
  // "azure-gpt-4" prices as Azure and Copilot as Copilot, not as raw OpenAI.
  if (m.includes("azure")) return "gw-azure";
  if (m.includes("copilot")) return "gw-copilot";
  if (m.includes("bedrock") || m.includes("titan") || m.includes("nova")) return "gw-bedrock";
  if (m.includes("gemini") || m.includes("vertex")) return "gw-gemini";
  if (m.includes("llama") || m.includes("mistral") || m.includes("phi") || m.includes("internal")) return "gw-internal";
  if (m.includes("gpt") || m.includes("openai") || /\bo[13]\b/.test(m)) return "gw-openai";
  return "gw-claude";
}

/* Display metadata (name/kind/status) for a provider id, reused from the seed
   provider list so a live provider row renders in the same table as the demo. */
export function providerMeta(id: string): { name: string; kind: string; status: string } {
  const p = gatewayProviders.find((x) => x.id === id);
  return p ? { name: p.name, kind: p.kind, status: p.status } : { name: id, kind: "LLM", status: "Approved" };
}

/* Per-request enforcement: a single prompt over this many estimated
   tokens is "expensive" and the Cost & Token Guard routes it to review. */
export const REQUEST_TOKEN_CEILING = 6000;

/* ~4 chars per token — the standard rough estimator, good enough for a
   spend guard and a live per-message cost estimate. */
export function estimateTokens(text: string): number {
  return Math.ceil(String(text || "").length / 4);
}

/* Dollars for a token volume on a given provider (defaults if unpriced). */
export function costOf(tokens: number, providerId?: string): number {
  const rate = (providerId && PRICE_BOOK[providerId]?.blendedPer1M) || DEFAULT_RATE;
  return (tokens / 1_000_000) * rate;
}

export function fmtUSD(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  if (n > 0) return `$${n.toFixed(3)}`;
  return "$0";
}

/* Compact token count — B for billions, M for millions. */
export function fmtTokens(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export type ProviderSpend = {
  id: string; name: string; kind: string; status: string;
  routedShare: number; tokens: number; cost: number;
  budget: number; utilization: number; overBudget: boolean;
};

/* Roll every provider's spend up from the price book: its share of the
   metered token volume × its blended rate, against its budget. */
export function providerSpend(): ProviderSpend[] {
  return gatewayProviders.map((p) => {
    const pb = PRICE_BOOK[p.id] || { blendedPer1M: DEFAULT_RATE, budgetMtd: 0 };
    const tokens = Math.round(TOKENS_MTD * (p.routedShare / 100));
    const cost = costOf(tokens, p.id);
    const utilization = pb.budgetMtd ? Math.round((cost / pb.budgetMtd) * 100) : 0;
    return {
      id: p.id, name: p.name, kind: p.kind, status: p.status,
      routedShare: p.routedShare, tokens, cost,
      budget: pb.budgetMtd, utilization, overBudget: pb.budgetMtd > 0 && cost > pb.budgetMtd,
    };
  });
}

export type CostSummary = {
  costMtd: number; budgetMtd: number; utilization: number;
  tokensMtd: number; overBudget: ProviderSpend[]; blendedPer1M: number;
};

/* Enterprise rollup: total computed spend vs total allocated budget, and
   which providers have breached their cap (what the guard escalates). */
export function costSummary(): CostSummary {
  const rows = providerSpend();
  const costMtd = rows.reduce((a, r) => a + r.cost, 0);
  const budgetMtd = rows.reduce((a, r) => a + r.budget, 0);
  return {
    costMtd, budgetMtd,
    utilization: budgetMtd ? Math.round((costMtd / budgetMtd) * 100) : 0,
    tokensMtd: TOKENS_MTD,
    overBudget: rows.filter((r) => r.overBudget),
    blendedPer1M: costMtd / (TOKENS_MTD / 1_000_000),
  };
}

/* Formatted totals for headline tiles — computed, never a stored string.
   (gatewayStats keeps requests/blocked/risk; cost & tokens come here.) */
export function costHeadline() {
  const s = costSummary();
  return {
    costMtd: fmtUSD(s.costMtd),
    tokensMtd: fmtTokens(s.tokensMtd),
    utilization: s.utilization,
    budgetMtd: fmtUSD(s.budgetMtd),
    requestsMtd: gatewayStats.requestsMtd,
  };
}
