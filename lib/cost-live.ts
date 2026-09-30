/* ── Live AI spend from the audit chain (#181) ───────────────────────────────
   The AI FinOps surface has always rendered spend DERIVED from a hardcoded
   month-to-date token constant in lib/cost-engine.ts × seeded provider shares —
   a plausible demo, but not a measured actual. The gateway,
   however, already appends every governed inference to the tenant's
   tamper-evident audit chain as an `inference:<decision>` row whose detail
   carries the REAL token count and the acting agent
   (app/api/gateway/chat/route.ts → logInference). This module turns those live
   rows into real enterprise spend — priced from the same price book, rolled up
   per provider AND per agent (the attribution the seeded view could never give),
   and re-verifies the SHA-256 chain — so the surface reflects actual usage
   instead of a constant, falling back to the seed only when no DB is configured.

   Pure + deterministic: the caller passes already-fetched audit rows (write
   order); this maps + prices + verifies. Same chain recomputation as lib/audit.ts
   (via lib/enforce-live.ts), so a tampered row is detected. Metadata only — the
   detail carries token counts and the agent, never raw prompt content. */
import { auditChainIntact, type AuditRow } from "./enforce-live";
import { costOf, PRICE_BOOK, providerForModel, providerMeta } from "./cost-engine";

export type LiveProviderSpend = {
  id: string; name: string; kind: string; status: string;
  routedShare: number; tokens: number; cost: number;
  budget: number; utilization: number; overBudget: boolean; requests: number;
};
export type LiveAgentSpend = { agent: string; tokens: number; cost: number; requests: number };
export type LiveCost = {
  totalTokens: number; totalCost: number; totalBudget: number;
  utilization: number; blendedPer1M: number; requests: number;
  providers: LiveProviderSpend[]; agents: LiveAgentSpend[];
  overBudget: LiveProviderSpend[]; intact: boolean;
};

/* Derive real spend from the `inference:*` subset of the audit chain. Non-inference
   rows still count toward chain verification but contribute no spend. */
export function liveCostFromAudit(all: AuditRow[]): LiveCost {
  const intact = auditChainIntact(all);
  const inf = all.filter((r) => typeof r.action === "string" && r.action.startsWith("inference:"));

  const prov = new Map<string, { tokens: number; cost: number; requests: number }>();
  const ag = new Map<string, { tokens: number; cost: number; requests: number }>();
  let totalTokens = 0, totalCost = 0;

  for (const r of inf) {
    let d: { agent?: string; tokens?: number } = {};
    try { d = JSON.parse(r.detail || "{}"); } catch { /* leave empty */ }
    const tokens = typeof d.tokens === "number" && isFinite(d.tokens) && d.tokens > 0 ? d.tokens : 0;
    const pid = providerForModel(r.entity);
    const cost = costOf(tokens, pid);
    const agent = d.agent || r.actor || "gateway";

    totalTokens += tokens; totalCost += cost;
    const p = prov.get(pid) ?? { tokens: 0, cost: 0, requests: 0 };
    p.tokens += tokens; p.cost += cost; p.requests += 1; prov.set(pid, p);
    const a = ag.get(agent) ?? { tokens: 0, cost: 0, requests: 0 };
    a.tokens += tokens; a.cost += cost; a.requests += 1; ag.set(agent, a);
  }

  const providers: LiveProviderSpend[] = [...prov.entries()].map(([id, v]) => {
    const meta = providerMeta(id);
    const budget = PRICE_BOOK[id]?.budgetMtd ?? 0;
    return {
      id, name: meta.name, kind: meta.kind, status: meta.status,
      routedShare: totalTokens ? Math.round((v.tokens / totalTokens) * 100) : 0,
      tokens: v.tokens, cost: v.cost, budget,
      utilization: budget ? Math.round((v.cost / budget) * 100) : 0,
      overBudget: budget > 0 && v.cost > budget, requests: v.requests,
    };
  }).sort((a, b) => b.cost - a.cost);

  const agents: LiveAgentSpend[] = [...ag.entries()]
    .map(([agent, v]) => ({ agent, tokens: v.tokens, cost: v.cost, requests: v.requests }))
    .sort((a, b) => b.cost - a.cost);

  // Budget denominator is the allocation for the providers actually in use, so
  // utilization is spend vs the budget of what's being spent on (not diluted by
  // caps for providers with no live traffic).
  const totalBudget = providers.reduce((s, p) => s + p.budget, 0);

  return {
    totalTokens, totalCost, totalBudget,
    utilization: totalBudget ? Math.round((totalCost / totalBudget) * 100) : 0,
    blendedPer1M: totalTokens ? totalCost / (totalTokens / 1_000_000) : 0,
    requests: inf.length,
    providers, agents,
    overBudget: providers.filter((p) => p.overBudget), intact,
  };
}
