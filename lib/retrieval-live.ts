/* ── Live Retrieval Guardrails from the audit chain (BL-04 / #144) ────────────
   The Retrieval Guardrails surface has always rendered a seeded window. But
   every RAG grounding is a real per-request decision: before a candidate passage
   may ground an answer the gateway's retrieval guard classifies its source into a
   trust tier, DLP-validates the chunk, and freshness-checks it, then admits /
   masks / down-weights / drops it and appends the governed verdict to the
   tenant's tamper-evident audit chain as a `retrieval:<decision>` row. This
   module turns those live rows into the surface's row shape and re-verifies the
   SHA-256 chain, so the surface reflects what actually grounded (and what was
   kept out) instead of a demo window — falling back to the seed only when no
   database is configured.

   Privacy by construction: the audit row records the governance metadata
   (document identifier, source trust tier, freshness, guarded score, decision)
   — NEVER the passage text. A secret-bearing chunk is blocked at the guard and
   its content is never persisted anywhere, and the audit log itself holds no
   passage text, so this surface cannot leak what a passage contained. Pure +
   deterministic; chain verification is shared with the Tool-Call Ledger
   (lib/enforce-live.ts). */
import { auditChainIntact, type AuditRow } from "./enforce-live";
import { SOURCE_TRUST_TIERS } from "@/lib/retrieval-guard";

export type LiveRetrievalRow = {
  seq: number; id: string; ts: string;
  title: string; source: string; tier: string; trustScore: number;
  ageDays: number | null; stale: boolean;
  decision: string; reason: string | null; guardedScore: number;
  agent: string; session: string;
  prevHash: string; hash: string;
};

/* The guard verdicts the surface renders. An unknown suffix is treated as a
   drop (deny-by-default — a passage is never silently "admitted"). */
const RETR_DECISIONS = new Set(["admitted", "masked", "down-weighted", "dropped"]);

/* Map the `retrieval:*` subset of the audit chain to surface rows, and report
   whether the (full) chain verifies. Non-retrieval rows still count toward chain
   verification but stay out of the retrieval view. */
export function liveRetrievalFromAudit(all: AuditRow[]): { rows: LiveRetrievalRow[]; intact: boolean } {
  const intact = auditChainIntact(all);
  const rec = all.filter((r) => typeof r.action === "string" && r.action.startsWith("retrieval:"));
  const rows = rec.map((r, i) => {
    let d: { title?: string; source?: string; tier?: string; trustScore?: number; ageDays?: number | null; stale?: boolean; guardedScore?: number; reason?: string | null; agent?: string; session?: string } = {};
    try { d = JSON.parse(r.detail || "{}"); } catch { /* leave empty */ }
    const raw = r.action.replace("retrieval:", "");
    const decision = RETR_DECISIONS.has(raw) ? raw : "dropped";
    const tier = d.tier || r.entity || "unverified";
    const trustScore = typeof d.trustScore === "number"
      ? d.trustScore
      : ((SOURCE_TRUST_TIERS as Record<string, { score: number }>)[tier]?.score ?? 0);
    return {
      seq: i + 1,
      id: "RET-" + (r.id ? String(r.id).slice(-6).toUpperCase() : String(3080 + i)),
      ts: r.createdAt ? new Date(r.createdAt).toISOString().replace("T", " ").replace(/\.\d+Z$/, "Z") : "",
      title: d.title || "(document)",
      source: d.source || "—",
      tier,
      trustScore,
      ageDays: d.ageDays ?? null,
      stale: !!d.stale,
      decision,
      // Drops and down-weights carry a generic, metadata-based reason (never the
      // passage content); admits/masks need none.
      reason: decision === "dropped" ? (d.reason || "kept out of retrieval")
        : decision === "down-weighted" ? (d.reason || "stale")
        : null,
      guardedScore: typeof d.guardedScore === "number" ? d.guardedScore : 0,
      agent: d.agent || r.actor || "agent",
      session: d.session || "—",
      prevHash: r.prevHash,
      hash: r.hash,
    };
  });
  return { rows, intact };
}

/* Stats over live retrieval rows, matching the fields the surface's KPI row
   reads from the seeded retrievalGuardStats (total / admitted / masked /
   downWeighted / dropped / blockedSources / stale), plus the chain verdict. */
export function liveRetrievalStats(rows: LiveRetrievalRow[], intact: boolean) {
  const by = (d: string) => rows.filter((r) => r.decision === d).length;
  return {
    total: rows.length,
    // "admitted" on the KPI means "reached the prompt" — admitted + masked + down-weighted.
    admitted: by("admitted") + by("masked") + by("down-weighted"),
    masked: by("masked"),
    downWeighted: by("down-weighted"),
    dropped: by("dropped"),
    blockedSources: rows.filter((r) => r.tier === "blocked").length,
    stale: rows.filter((r) => r.stale && r.decision !== "dropped").length,
    tiers: SOURCE_TRUST_TIERS,
    intact,
  };
}
