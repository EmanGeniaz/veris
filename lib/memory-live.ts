/* ── Live Memory Guardrails from the audit chain (BL-04 / #144) ───────────
   The Memory Guardrails surface has always rendered a seeded window. But every
   governed memory write is a real per-request decision (allow / mask / refuse):
   the gateway runs the DLP rulebook on each write and appends the governed
   verdict to the tenant's tamper-evident audit chain as a `memory:<decision>`
   row. This module turns those live rows into the surface's row shape and
   re-verifies the SHA-256 chain, so the surface reflects what agents ACTUALLY
   tried to remember instead of a demo window — falling back to the seed only
   when no database is configured.

   Privacy by construction: the audit row records the governance metadata
   (agent, session, kind, data class, masked, written) — NEVER the raw content.
   Restricted content is refused at write and is never persisted anywhere, and
   the audit log itself holds no memory text, so this surface cannot leak what a
   memory contained. Pure + deterministic; chain verification is shared with the
   Tool-Call Ledger (lib/enforce-live.ts). */
import { auditChainIntact, type AuditRow } from "./enforce-live";
import { MEMORY_RETENTION } from "@/lib/memory";

export type LiveMemoryRow = {
  seq: number; id: string; ts: string;
  agent: string; session: string; kind: string; class: string;
  decision: string; written: boolean; masked: boolean;
  retention: string; reason: string | null; text: string | null;
  prevHash: string; hash: string;
};

/* The governed write verdicts the surface renders. An unknown suffix is treated
   as a refusal (deny-by-default — never silently "stored"). */
const MEM_DECISIONS = new Set(["allow", "mask", "refuse"]);

/* Map the `memory:*` subset of the audit chain to surface rows, and report
   whether the (full) chain verifies. Non-memory rows still count toward chain
   verification but stay out of the memory view. */
export function liveMemoryFromAudit(all: AuditRow[]): { rows: LiveMemoryRow[]; intact: boolean } {
  const intact = auditChainIntact(all);
  const mem = all.filter((r) => typeof r.action === "string" && r.action.startsWith("memory:"));
  const rows = mem.map((r, i) => {
    let d: { agent?: string; session?: string; kind?: string; class?: string; masked?: boolean; written?: boolean } = {};
    try { d = JSON.parse(r.detail || "{}"); } catch { /* leave empty */ }
    const raw = r.action.replace("memory:", "");
    const decision = MEM_DECISIONS.has(raw) ? raw : "refuse";
    const written = decision !== "refuse" && d.written !== false;
    const cls = d.class || "—";
    const retention = (MEMORY_RETENTION as Record<string, { label: string }>)[cls]?.label || "—";
    return {
      seq: i + 1,
      id: "MEM-" + (r.id ? String(r.id).slice(-6).toUpperCase() : String(2070 + i)),
      ts: r.createdAt ? new Date(r.createdAt).toISOString().replace("T", " ").replace(/\.\d+Z$/, "Z") : "",
      agent: d.agent || r.actor || "agent",
      session: d.session || "—",
      kind: d.kind || "turn",
      class: cls,
      decision,
      written,
      masked: !!d.masked,
      retention: written ? retention : "—",
      // Refusals carry a generic, class-based reason (never the raw content).
      reason: written ? null : "Refused at write — Restricted content is never persisted to memory.",
      // The audit chain records the decision, not the memory text; the content
      // lives (masked) only in the governed memory store.
      text: written ? "Stored in the governed memory store — content is not recorded in the audit log." : null,
      prevHash: r.prevHash,
      hash: r.hash,
    };
  });
  return { rows, intact };
}

/* Stats over live memory rows, matching the fields the surface's KPI row reads
   from the seeded memoryStats (total / stored / masked / refused /
   restrictedBlocked / partitions / classes), plus the chain verdict. */
export function liveMemoryStats(rows: LiveMemoryRow[], intact: boolean) {
  const by = (d: string) => rows.filter((r) => r.decision === d).length;
  const partitions = new Set(rows.filter((r) => r.written).map((r) => `${r.agent}/${r.session}`));
  return {
    total: rows.length,
    stored: by("allow") + by("mask"),
    masked: by("mask"),
    refused: by("refuse"),
    restrictedBlocked: by("refuse"),
    partitions: partitions.size,
    classes: [...new Set(rows.filter((r) => r.written).map((r) => r.class))],
    intact,
  };
}
