/* ── Veris Enforce · Durable memory store (server-only) ──────────────────
   The Memory Guardrail engine (lib/memory.js) governs every write and recall —
   Restricted content refused, PII masked, class-based retention/expiry stamped.
   That engine is pure and client-safe, so it can't touch Prisma. This module is
   the server-only durable path: it runs the same governance, then PERSISTS the
   governed item to Postgres (AgentMemory) so retention + expiry survive a
   restart and hold across serverless instances — closing the gap where memory
   lived only in a per-instance in-process buffer.

   Durability model:
     • Write   — governance runs first; a written item is inserted into
                 AgentMemory (partitioned by tenant+agent+session).
     • Recall  — read back with a query-time expiry filter (expiresAt > now) and
                 the caller's class ceiling, so an expired item is NEVER returned
                 even before a sweep runs.
     • Sweep   — deleteMany past the window, for durable retention hygiene.

   When no database is configured the engine transparently falls back to the
   in-process buffer (lib/memory.js), so the demo and local dev keep working. */

import { db } from "@/lib/db";
import {
  memoryWrite,
  recallLive,
  commitLive,
  MEMORY_CLASS_RANK,
} from "@/lib/memory";

type MemScope = { tenant?: string; agent?: string; session?: string; maxClass?: string };
type MemEntry = { tenant?: string; agent?: string; session?: string; kind?: string; text: string };
type MemItem = {
  id: string; tenant: string; agent: string; session: string; kind: string;
  class: string; categories: string[]; text: string; masked: boolean;
  createdAt: number; expiresAt: number; retentionLabel?: string;
};

/* Governed durable write. Returns the same decision shape as memoryWrite, plus
   `durable` telling the caller whether it hit the database or the buffer. */
export async function rememberDurable(entry: MemEntry, nowMs: number = Date.now()) {
  const r = memoryWrite(entry, nowMs);
  if (!r.written) return { ...r, durable: false };
  const prisma = db();
  if (!prisma) { commitLive(r.item); return { ...r, durable: false }; }
  try {
    const it = r.item as MemItem;
    await prisma.agentMemory.create({
      data: {
        id: it.id, tenant: it.tenant, agent: it.agent, session: it.session, kind: it.kind,
        class: it.class, categories: it.categories, text: it.text, masked: it.masked,
        createdAt: new Date(it.createdAt), expiresAt: new Date(it.expiresAt),
      },
    });
    return { ...r, durable: true };
  } catch {
    // Never let persistence break the response — fall back to the buffer.
    commitLive(r.item);
    return { ...r, durable: false };
  }
}

/* Governed durable recall. Query-time expiry filter + session partition + a
   class-clearance re-check, so recall can never return an expired or
   above-clearance item. Falls back to the in-process buffer with no DB. */
export async function recallDurable(scope: MemScope, nowMs: number = Date.now(), limit = 3): Promise<MemItem[]> {
  const prisma = db();
  if (!prisma) return recallLive(scope, nowMs, limit) as MemItem[];
  const tenant = String(scope?.tenant || "demo");
  const agent = String(scope?.agent || "anon");
  const session = String(scope?.session || `${tenant}:${agent}`);
  const ceiling = scope?.maxClass != null ? (MEMORY_CLASS_RANK[scope.maxClass as keyof typeof MEMORY_CLASS_RANK] ?? 3) : 3;
  try {
    const rows = await prisma.agentMemory.findMany({
      where: { tenant, agent, session, expiresAt: { gt: new Date(nowMs) } },
      orderBy: { createdAt: "asc" },
      take: 200,
    });
    const items: MemItem[] = rows
      .filter((m) => (MEMORY_CLASS_RANK[m.class as keyof typeof MEMORY_CLASS_RANK] ?? 0) <= ceiling)
      .map((m) => ({
        id: m.id, tenant: m.tenant, agent: m.agent, session: m.session, kind: m.kind,
        class: m.class, categories: (m.categories as string[]) || [], text: m.text, masked: m.masked,
        createdAt: m.createdAt.getTime(), expiresAt: m.expiresAt.getTime(),
      }));
    return limit != null ? items.slice(-limit) : items;
  } catch {
    return recallLive(scope, nowMs, limit) as MemItem[];
  }
}

/* Durable retention sweep — deletes every item past its window. Safe to call on
   a schedule (cron) or opportunistically; a no-op with no DB. Returns the count
   removed. */
export async function sweepDurable(nowMs: number = Date.now()): Promise<number> {
  const prisma = db();
  if (!prisma) return 0;
  try {
    const res = await prisma.agentMemory.deleteMany({ where: { expiresAt: { lte: new Date(nowMs) } } });
    return res.count;
  } catch {
    return 0;
  }
}
