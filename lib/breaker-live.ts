/* ── Live Circuit Breaker from the audit chain (BL-04 / #144) ─────────────
   The Circuit Breaker surface has always rendered a seeded window. But every
   session risk signal is real: as the gateway enforces its guardrails it emits
   the signal that fired (prompt-injection, untrusted egress, guardrail
   violation, tool-call rate anomaly) to the tenant's tamper-evident audit chain
   as a `breaker-signal:<signal>` row. This module groups those live rows by
   session and computes the risk score / breaker state EXACTLY as the seeded
   window does — via the shared computeBreakerSession() in lib/circuit-breaker.js,
   the single source of the breaker's decision logic — then re-verifies the
   SHA-256 chain. So the surface reflects live sessions instead of a demo window,
   falling back to the seed only when no database is configured.

   Pure + deterministic. The score→state ladder, revoked-capability computation
   and chain verification are all shared code (lib/circuit-breaker.js,
   lib/enforce-live.ts) — the live view never re-implements the decision. */
import { auditChainIntact, type AuditRow } from "./enforce-live";
import { computeBreakerSession, breakerStats, SIGNALS, type BreakerSession } from "@/lib/circuit-breaker";

export type LiveBreakerRow = BreakerSession;

/* Format an audit timestamp as the surface's HH:MM:SSZ session-start label. */
function hhmmss(ts: Date | string | number | undefined): string {
  if (!ts) return "";
  try { return new Date(ts).toISOString().slice(11, 19) + "Z"; } catch { return ""; }
}

/* Map the `breaker-signal:*` subset of the audit chain into per-session breaker
   rows, and report whether the (full) chain verifies. Non-breaker rows still
   count toward chain verification but stay out of the breaker view. Signals not
   in the known taxonomy are ignored (they contribute no score). */
export function liveBreakerFromAudit(all: AuditRow[]): { rows: LiveBreakerRow[]; intact: boolean } {
  const intact = auditChainIntact(all);
  const sig = all.filter((r) => typeof r.action === "string" && r.action.startsWith("breaker-signal:"));

  type Group = { id: string; agent: string; started: string; signals: string[]; seen: Set<string>; lastIdx: number };
  const bySession = new Map<string, Group>();
  const order: string[] = [];

  sig.forEach((r, i) => {
    let d: { agent?: string; session?: string; signal?: string } = {};
    try { d = JSON.parse(r.detail || "{}"); } catch { /* leave empty */ }
    const session = d.session || r.actor || "session";
    const signal = r.action.replace("breaker-signal:", "") || d.signal || "";
    if (!bySession.has(session)) {
      bySession.set(session, { id: session, agent: d.agent || r.actor || "agent", started: hhmmss(r.createdAt), signals: [], seen: new Set(), lastIdx: i });
      order.push(session);
    }
    const g = bySession.get(session)!;
    // Only known signals count toward the score; de-duplicate per session.
    if (signal && (SIGNALS as Record<string, unknown>)[signal] && !g.seen.has(signal)) { g.seen.add(signal); g.signals.push(signal); }
    g.lastIdx = i;
  });

  const rows = order
    .map((s) => { const g = bySession.get(s)!; return { g, lastIdx: g.lastIdx }; })
    .sort((a, b) => b.lastIdx - a.lastIdx) // newest-first by last activity
    .map(({ g }) => computeBreakerSession({ id: g.id, agent: g.agent, started: g.started, signals: g.signals }));

  return { rows, intact };
}

/* Stats over live breaker rows — the same shape the surface reads from the
   seeded breakerStats (watched / acted / tokensRevoked / routedToHuman /
   ttlSeconds / per-state counts), plus the chain verdict. */
export function liveBreakerStats(rows: LiveBreakerRow[], intact: boolean) {
  return { ...breakerStats(rows), intact };
}
