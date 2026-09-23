/* ── Live Tool-Call Ledger from the audit chain (BL-04 / #144) ────────────
   The Tool-Call Ledger surface has always rendered a seeded window. The gateway,
   however, already appends every per-request enforcement decision to the tenant's
   tamper-evident audit chain (`inference:<decision>` rows carrying the agent, the
   tool and the data class). This module turns those live audit rows into the
   ledger's row shape and re-verifies the SHA-256 chain, so a surface can show
   what agents ACTUALLY did — the real Article-12 record — instead of a demo
   window, falling back to the seed only when no database is configured.

   Pure + deterministic: the caller passes the already-fetched audit rows (in
   write order); this maps + verifies. Same hash recomputation as lib/audit.ts,
   so a tampered row is detected exactly as the immutable trail intends. */
import { createHash } from "node:crypto";

export type AuditRow = {
  id?: string;
  action: string;
  entity: string;
  detail: string;
  actor: string;
  prevHash: string;
  hash: string;
  createdAt?: Date | string | number;
};

export type LiveLedgerRow = {
  seq: number; id: string; ts: string;
  agent: string; agentName: string; tool: string; action: string;
  decision: string; authorized: boolean; scope: string;
  token: string | null; risk: string; note: string;
  prevHash: string; hash: string;
};

const KNOWN_DECISIONS = new Set(["allow", "mask", "block", "escalate", "egress"]);

/* Recompute the whole chain exactly as lib/audit.ts wrote it. Intact iff every
   row's prevHash equals the running hash and each hash re-derives. */
export function auditChainIntact(all: AuditRow[]): boolean {
  let prev = "genesis";
  for (const r of all) {
    const expected = createHash("sha256").update(prev + "|" + r.action + "|" + r.entity + "|" + r.detail + "|" + r.actor).digest("hex");
    if (r.hash !== expected || r.prevHash !== prev) return false;
    prev = r.hash;
  }
  return true;
}

/* Map the `inference:*` subset of the audit chain to ledger rows, and report
   whether the (full) chain verifies. Non-inference rows (e.g. create/admin)
   stay out of the ledger view but still count toward chain verification. */
export function liveLedgerFromAudit(all: AuditRow[]): { rows: LiveLedgerRow[]; intact: boolean } {
  const intact = auditChainIntact(all);
  const inf = all.filter((r) => typeof r.action === "string" && r.action.startsWith("inference:"));
  const rows = inf.map((r, i) => {
    let d: { agent?: string; tool?: string; dataClass?: string } = {};
    try { d = JSON.parse(r.detail || "{}"); } catch { /* leave empty */ }
    const raw = r.action.replace("inference:", "");
    const decision = KNOWN_DECISIONS.has(raw) ? raw : "allow";
    const agent = d.agent || r.actor || "gateway";
    return {
      seq: i + 1,
      id: "TC-" + (r.id ? String(r.id).slice(-6) : String(1000 + i)),
      ts: r.createdAt ? new Date(r.createdAt).toISOString().replace("T", " ").replace(/\.\d+Z$/, "Z") : "",
      agent,
      agentName: agent,
      tool: d.tool || "—",
      action: d.tool || "—",
      decision,
      authorized: decision !== "block",           // a blocked call reached for a tool it did not hold
      scope: d.dataClass || "—",
      token: decision === "allow" || decision === "mask" ? "CT-" + String(r.hash || "").slice(0, 6).toUpperCase() : null,
      risk: "—",
      note: "",
      prevHash: r.prevHash,
      hash: r.hash,
    };
  });
  return { rows, intact };
}

/* Stats over live ledger rows, matching the fields the surface's KPI row reads
   from the seeded enforceStats (total / allowed / escalated / blocked /
   egressDenied / contained / preventedBreaches / intact). */
export function liveLedgerStats(rows: LiveLedgerRow[], intact: boolean) {
  const by = (d: string) => rows.filter((r) => r.decision === d).length;
  const total = rows.length;
  const contained = rows.filter((r) => ["block", "egress", "escalate"].includes(r.decision)).length;
  return {
    total,
    allowed: by("allow") + by("mask"),
    escalated: by("escalate"),
    blocked: by("block"),
    egressDenied: by("egress"),
    contained,
    containmentRate: total ? Math.round((contained / total) * 100) : 0,
    preventedBreaches: rows.filter((r) => (r.decision === "block" || r.decision === "egress") && !r.authorized).length,
    intact,
  };
}
