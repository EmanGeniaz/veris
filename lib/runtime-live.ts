/* ── Live Runtime Guardrails from the audit chain (BL-04 / #144) ──────────
   The Runtime Guardrails surface has always rendered a seeded window. But every
   agent tool-call admission is a real per-request decision (allow / throttle /
   loop) and every completed call carries a real latency: the gateway enforces
   these at admission and appends the outcome to the tenant's tamper-evident
   audit chain as a `runtime:<decision>` row. This module groups those live
   per-request rows back into the per-session view the surface renders — the
   action stream, in-flight count, P95 latency and the worst decision the
   session hit — and re-verifies the SHA-256 chain, so the surface reflects live
   sessions instead of a demo window. Falls back to the seed only when no
   database is configured.

   Pure + deterministic; chain verification and the latency percentile /
   thresholds are shared with the Tool-Call Ledger (lib/enforce-live.ts) and the
   runtime engine (lib/runtime-guard.js), so the live view uses the SAME limits
   the gateway enforced. The recorded decision is authoritative — loop detection
   ran live at admission and is not recomputed here. */
import { auditChainIntact, type AuditRow } from "./enforce-live";
import { pctl, RUNTIME_POLICY } from "@/lib/runtime-guard";

export type LiveRuntimeRow = {
  id: string; session: string; agent: string;
  actions: string[]; latenciesMs: number[]; inFlight: number;
  rate: number; p95: number; sloBreach: boolean;
  decision: string; reason: string | null;
};

const RUNTIME_DECISIONS = new Set(["allow", "throttle", "loop"]);

/* Tiny stable id for a session key (djb2) — a compact "RSES-XXXX" label for the
   surface's Session column, deterministic across reads. */
function shortId(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return "RSES-" + h.toString(16).slice(0, 4).toUpperCase();
}

/* Map the `runtime:*` subset of the audit chain to the per-session surface rows,
   and report whether the (full) chain verifies. Non-runtime rows still count
   toward chain verification but stay out of the runtime view. */
export function liveRuntimeFromAudit(all: AuditRow[]): { rows: LiveRuntimeRow[]; intact: boolean } {
  const intact = auditChainIntact(all);
  const rt = all.filter((r) => typeof r.action === "string" && r.action.startsWith("runtime:"));

  type Group = { session: string; agent: string; actions: string[]; latenciesMs: number[]; inFlight: number; decisions: string[]; reasons: { decision: string; reason: string }[]; lastIdx: number };
  const bySession = new Map<string, Group>();
  const order: string[] = [];

  rt.forEach((r, i) => {
    let d: { agent?: string; session?: string; action?: string; reason?: string; inFlight?: number; latencyMs?: number | null; breach?: boolean } = {};
    try { d = JSON.parse(r.detail || "{}"); } catch { /* leave empty */ }
    const session = d.session || r.actor || "session";
    if (!bySession.has(session)) {
      bySession.set(session, { session, agent: d.agent || r.actor || "agent", actions: [], latenciesMs: [], inFlight: 0, decisions: [], reasons: [], lastIdx: i });
      order.push(session);
    }
    const g = bySession.get(session)!;
    const raw = r.action.replace("runtime:", "");
    const decision = RUNTIME_DECISIONS.has(raw) ? raw : "allow";
    if (d.action) g.actions.push(String(d.action));
    if (d.latencyMs != null && !Number.isNaN(Number(d.latencyMs))) g.latenciesMs.push(Number(d.latencyMs));
    if (d.inFlight != null) g.inFlight = Math.max(g.inFlight, Number(d.inFlight) || 0);
    g.decisions.push(decision);
    if (decision !== "allow" && d.reason) g.reasons.push({ decision, reason: String(d.reason) });
    g.lastIdx = i;
  });

  const sloMs = RUNTIME_POLICY.latencySloMs;
  const rows: (LiveRuntimeRow & { lastIdx: number })[] = order.map((session) => {
    const g = bySession.get(session)!;
    // Worst decision the session hit: loop > throttle > allow (the gateway's order).
    const decision = g.decisions.includes("loop") ? "loop" : g.decisions.includes("throttle") ? "throttle" : "allow";
    const rsn = g.reasons.find((x) => x.decision === decision);
    const p95 = pctl(g.latenciesMs, 95);
    return {
      id: shortId(session),
      session,
      agent: g.agent,
      actions: g.actions,
      latenciesMs: g.latenciesMs,
      inFlight: g.inFlight,
      rate: g.actions.length,
      p95,
      sloBreach: p95 > sloMs,
      decision,
      reason: rsn ? rsn.reason : null,
      lastIdx: g.lastIdx,
    };
  });
  // newest-first by last activity in the chain
  rows.sort((a, b) => b.lastIdx - a.lastIdx);
  return { rows: rows.map(({ lastIdx: _lastIdx, ...r }) => r), intact };
}

/* Stats over live runtime rows, matching the fields the surface's KPI row reads
   from the seeded runtimeGuardStats (watched / looped / throttled / sloBreaches
   / p95 / sloMs), plus the chain verdict. */
export function liveRuntimeStats(rows: LiveRuntimeRow[], intact: boolean) {
  const by = (d: string) => rows.filter((r) => r.decision === d).length;
  return {
    watched: rows.length,
    looped: by("loop"),
    throttled: by("throttle"),
    sloBreaches: rows.filter((r) => r.sloBreach).length,
    p95: pctl(rows.flatMap((r) => r.latenciesMs), 95),
    sloMs: RUNTIME_POLICY.latencySloMs,
    intact,
  };
}
