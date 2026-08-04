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

/* Metered token volume for the month — the one measured actual we build
   on. Everything else (per-provider tokens, cost) is DERIVED from it.
   Enterprise-scale: ~19.6B tokens/mo is what governing all employee AI
   traffic looks like (412K requests is only the sampled control-plane
   tail shown in the live log). */
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
