/* ── Evidence Fabric — the canonical governance core (WS1 / #166) ─────────────
   One tenant-scoped, provenance-stamped, tamper-evident record of the AI estate
   and everything governance needs to prove about it. This is the spine every
   surface reads and every plane writes:

     • Veris Discover writes discovered systems + assessments (ingest contract).
     • Veris Enforce writes runtime findings + decisions (telemetry contract).
     • GenVeris workflows write intake, phase-gate and assessment decisions.
     • Dashboards, the employee workspace, Veris Intelligence and compliance read
       the canonical record back.

   Design (all deterministic, all testable):
     • Provenance envelope on every record — which plane, when, how confident.
     • Idempotent writes — a re-ingest of the same entity+content is a no-op.
     • Tamper-evident — records are hash-chained per tenant, verified exactly as
       lib/audit.ts / lib/enforce-live.ts do (a tampered row is detected).
     • Human-decision-wins — a later automated write never overrides a human
       governance decision; the current value per entity resolves to the human
       record when one exists.
     • Metadata, not content — the payload carries governance metadata and
       references, NEVER raw sensitive content (same privacy contract as Memory
       #159 / Retrieval #162).

   This module is pure over already-fetched rows (map/verify/resolve) plus a
   single best-effort writer (fabricAppend) that persists a hash-chained record.
   Existing Evidence/Decision/AuditLog rows are presented as canonical entities
   by read adapters — no migration; the Fabric is additive. */
import { createHash } from "node:crypto";
import { auditChainIntact, type AuditRow } from "./enforce-live";

/* The canonical entity kinds (reconciled with the Discover ingestion contract). */
export const FABRIC_KINDS = [
  "AISystem", "Assessment", "EvidenceRef", "Finding", "Owner", "FrameworkMapping", "ShadowAIItem",
] as const;
export type FabricKind = (typeof FABRIC_KINDS)[number];

/* The provenance envelope stamped on every record. */
export type Provenance = { source: string; confidence: number; actor: string; at: string; recordId?: string };

/* A canonical record as the surfaces read it. `fields` is the entity body
   (governance metadata only). */
export type CanonicalRecord = {
  kind: string; entityId: string; provenance: Provenance;
  supersedes: string | null; fields: Record<string, unknown>;
  prevHash: string; hash: string;
};

/* A raw FabricRecord row (as Prisma returns it), in write order. */
export type FabricRow = {
  id?: string; kind: string; entityId: string; source: string; confidence?: number;
  actor: string; supersedes?: string | null; idem?: string; payload: string;
  prevHash: string; hash: string; createdAt?: Date | string | number;
};

/* Sources that count as a human governance decision (human-wins). */
const HUMAN_SOURCES = new Set(["human", "genveris:human", "reviewer"]);

/* The idempotency signature — a re-ingest of the same entity+content+source is a
   no-op. Distinct from the chain hash (which also binds prevHash + actor). */
export function fabricIdem(kind: string, entityId: string, source: string, payload: string): string {
  return createHash("sha256").update(kind + "|" + entityId + "|" + source + "|" + payload).digest("hex");
}

/* The chain hash for a record — same construction as lib/audit.ts, over the
   Fabric's own fields so any tampered row is detected. */
export function fabricHash(prev: string, r: { kind: string; entityId: string; source: string; payload: string; actor: string }): string {
  return createHash("sha256").update(prev + "|" + r.kind + "|" + r.entityId + "|" + r.source + "|" + r.payload + "|" + r.actor).digest("hex");
}

/* Verify the whole Fabric chain (intact iff every row re-derives from genesis). */
export function fabricChainIntact(all: FabricRow[]): boolean {
  let prev = "genesis";
  for (const r of all) {
    const expected = fabricHash(prev, r);
    if (r.hash !== expected || r.prevHash !== prev) return false;
    prev = r.hash;
  }
  return true;
}

/* Map a stored row to the canonical shape the surfaces read. */
export function mapFabricRow(r: FabricRow): CanonicalRecord {
  let fields: Record<string, unknown> = {};
  try { fields = JSON.parse(r.payload || "{}"); } catch { /* leave empty */ }
  return {
    kind: FABRIC_KINDS.includes(r.kind as FabricKind) ? r.kind : "Finding",
    entityId: r.entityId,
    provenance: {
      source: r.source, confidence: typeof r.confidence === "number" ? r.confidence : 1,
      actor: r.actor, at: r.createdAt ? new Date(r.createdAt).toISOString() : "", recordId: r.id,
    },
    supersedes: r.supersedes ?? null,
    fields,
    prevHash: r.prevHash, hash: r.hash,
  };
}

/* Resolve the CURRENT value per entity from the full history, applying the
   human-decision-wins rule: if any human record exists for an entity, the
   current value is the latest HUMAN record; otherwise the latest record.
   Rows are assumed in write (ascending) order. */
export function currentByEntity(records: CanonicalRecord[]): CanonicalRecord[] {
  const latest = new Map<string, CanonicalRecord>();
  const latestHuman = new Map<string, CanonicalRecord>();
  for (const rec of records) {
    latest.set(rec.entityId, rec);
    if (HUMAN_SOURCES.has(rec.provenance.source)) latestHuman.set(rec.entityId, rec);
  }
  const out: CanonicalRecord[] = [];
  for (const [entityId, rec] of latest) out.push(latestHuman.get(entityId) ?? rec);
  return out;
}

/* Whether an incoming automated write would be OVERRIDDEN by an existing human
   decision (so the caller can record it as provenance without clobbering). */
export function humanDecisionWins(history: CanonicalRecord[], entityId: string, incomingSource: string): boolean {
  if (HUMAN_SOURCES.has(incomingSource)) return false;
  return history.some((r) => r.entityId === entityId && HUMAN_SOURCES.has(r.provenance.source));
}

/* ── Read adapters — present existing rows as canonical entities (no migration) ── */

/* Existing Evidence rows → canonical EvidenceRef entities. Metadata only. */
export function evidenceToCanonical(rows: Array<{ id: string; item: string; initiative: string; scope: string; control: string; risk: string; owner: string; status: string; approval: string; version: string; createdAt?: Date | string | number }>): CanonicalRecord[] {
  return rows.map((e) => ({
    kind: "EvidenceRef", entityId: "EVID-" + e.id,
    provenance: { source: "genveris", confidence: 1, actor: e.owner || "governance", at: e.createdAt ? new Date(e.createdAt).toISOString() : "", recordId: e.id },
    supersedes: null,
    fields: { item: e.item, initiative: e.initiative, scope: e.scope, control: e.control, risk: e.risk, owner: e.owner, status: e.status, approval: e.approval, version: e.version },
    prevHash: "", hash: "",
  }));
}

/* Governed decisions on the audit chain → canonical Decision entities. Carries
   the decision + its metadata detail, never raw content. */
export function auditToCanonical(rows: AuditRow[]): CanonicalRecord[] {
  return rows
    .filter((r) => typeof r.action === "string" && (r.action.startsWith("inference:") || r.action.startsWith("breaker-signal:") || r.action.includes(":")))
    .map((r) => {
      let detail: Record<string, unknown> = {};
      try { detail = JSON.parse(r.detail || "{}"); } catch { /* leave empty */ }
      return {
        kind: "Finding", entityId: "DEC-" + (r.id ? String(r.id).slice(-8) : r.hash.slice(0, 8)),
        provenance: { source: "enforce", confidence: 1, actor: r.actor || "gateway", at: r.createdAt ? new Date(r.createdAt).toISOString() : "", recordId: r.id },
        supersedes: null,
        fields: { action: r.action, entity: r.entity, ...detail },
        prevHash: r.prevHash, hash: r.hash,
      };
    });
}

/* Stats over the resolved canonical view for a surface's KPI row. */
export function fabricStats(current: CanonicalRecord[], fabricIntact: boolean, auditIntact: boolean) {
  const by = (k: string) => current.filter((r) => r.kind === k).length;
  const sources = new Set(current.map((r) => r.provenance.source));
  return {
    total: current.length,
    systems: by("AISystem"),
    assessments: by("Assessment"),
    evidence: by("EvidenceRef"),
    findings: by("Finding"),
    shadow: by("ShadowAIItem"),
    sources: [...sources],
    intact: fabricIntact && auditIntact,
  };
}

/* ── Writer — the one seam that persists a canonical record ───────────────────
   Best-effort, tenant-scoped, idempotent, hash-chained. Records the human-wins
   provenance without clobbering (a superseding automated write is still stored,
   but currentByEntity resolves to the human record). No-ops without a DB. */
type PrismaLike = {
  fabricRecord: {
    findFirst: (a: unknown) => Promise<FabricRow | null>;
    findMany: (a: unknown) => Promise<FabricRow[]>;
    create: (a: unknown) => Promise<FabricRow>;
  };
};

export async function fabricAppend(
  prisma: PrismaLike,
  tenantId: string,
  rec: { kind: FabricKind; entityId: string; source: string; actor: string; confidence?: number; fields: Record<string, unknown>; supersedes?: string | null },
): Promise<{ written: boolean; deduped: boolean; row?: FabricRow }> {
  const payload = JSON.stringify(rec.fields ?? {});
  const idem = fabricIdem(rec.kind, rec.entityId, rec.source, payload);
  // Idempotency: if the latest record for this entity already has this idem, no-op.
  const latestForEntity = await prisma.fabricRecord.findFirst({ where: { tenantId, entityId: rec.entityId }, orderBy: { createdAt: "desc" } });
  if (latestForEntity && latestForEntity.idem === idem) return { written: false, deduped: true, row: latestForEntity };
  const prevRow = await prisma.fabricRecord.findFirst({ where: { tenantId }, orderBy: { createdAt: "desc" } });
  const prevHash = prevRow?.hash ?? "genesis";
  const hash = fabricHash(prevHash, { kind: rec.kind, entityId: rec.entityId, source: rec.source, payload, actor: rec.actor });
  const row = await prisma.fabricRecord.create({
    data: {
      tenantId, kind: rec.kind, entityId: rec.entityId, source: rec.source,
      confidence: rec.confidence ?? 1, actor: rec.actor, supersedes: rec.supersedes ?? null,
      idem, payload, prevHash, hash,
    },
  });
  return { written: true, deduped: false, row };
}

/* Convenience: the full canonical view a route returns — Fabric records
   (resolved human-wins) + adapted existing evidence + governed decisions, with
   both chains verified. */
export function fabricView(opts: { fabricRows: FabricRow[]; evidenceRows?: Parameters<typeof evidenceToCanonical>[0]; auditRows?: AuditRow[] }) {
  const fabricIntact = fabricChainIntact(opts.fabricRows);
  const auditRows = opts.auditRows ?? [];
  const auditIntact = auditChainIntact(auditRows);
  const fabricCanonical = currentByEntity(opts.fabricRows.map(mapFabricRow));
  const adapted = [
    ...(opts.evidenceRows ? evidenceToCanonical(opts.evidenceRows) : []),
    ...auditToCanonical(auditRows),
  ];
  const current = [...fabricCanonical, ...adapted];
  return { records: current, stats: fabricStats(current, fabricIntact, auditIntact), fabricIntact, auditIntact };
}
