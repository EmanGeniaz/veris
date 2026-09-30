/* Evidence Fabric — canonical governance record (WS1 / #166). Returns the
   tenant's canonical view: Fabric records (resolved human-decision-wins) plus
   existing Evidence and governed audit-chain decisions presented as canonical
   entities by read adapters, with both hash chains re-verified. Tenant is bound
   to the session (BL-01 guard); a client ?tenant cannot read another tenant's
   record. Returns {enabled:false} with no database, so a surface honestly falls
   back to its demo view. The records carry governance metadata only, never raw
   content. */
import { NextRequest, NextResponse } from "next/server";
import { db, dbConfigured } from "@/lib/db";
import { telemetryMode } from "@/lib/telemetry-source";
import { resolveTenant } from "@/lib/tenant-guard";
import { fabricView, fabricAppend, type FabricKind } from "@/lib/evidence-fabric";
import { classify } from "@/lib/policy-rules";
import { limit, parseJson, serverError } from "@/lib/api-guard";
import { fabricWriteSchema } from "@/lib/api-schemas";

export async function GET(req: NextRequest) {
  const prisma = db();
  if (!prisma) return NextResponse.json({ enabled: false, mode: telemetryMode(false).mode });
  try {
    const { slug } = await resolveTenant({ requestedTenant: req.nextUrl.searchParams.get("tenant") });
    const t = await prisma.tenant.findUnique({ where: { slug } });
    if (!t) {
      const empty = fabricView({ fabricRows: [] });
      return NextResponse.json({ enabled: true, mode: telemetryMode(dbConfigured()).mode, records: [], stats: empty.stats, intact: true });
    }
    const [fabricRows, evidenceRows, auditRows] = await Promise.all([
      prisma.fabricRecord.findMany({ where: { tenantId: t.id }, orderBy: { createdAt: "asc" } }),
      prisma.evidence.findMany({ where: { tenantId: t.id }, orderBy: { createdAt: "asc" }, take: 200 }),
      prisma.auditLog.findMany({ where: { tenantId: t.id }, orderBy: { createdAt: "asc" } }),
    ]);
    const view = fabricView({ fabricRows, evidenceRows, auditRows });
    // newest-first, capped — the surface shows a window
    const shown = view.records.slice(-100).reverse();
    return NextResponse.json({ enabled: true, mode: telemetryMode(dbConfigured()).mode, records: shown, stats: view.stats, intact: view.stats.intact });
  } catch {
    return NextResponse.json({ enabled: false, mode: telemetryMode(false).mode });
  }
}

/* GenVeris workflow → canonical write (#166). A session-bound governance action
   appends a canonical FabricRecord (idempotent, hash-chained). Rate-limited (user
   tier), strict-validated body, tenant bound to the session (BL-01). `source` is
   constrained to GenVeris-origin values by the schema, so a client can never claim
   Discover/Enforce provenance; a Secret-class payload is refused (metadata only).
   No-op without a DB. */
export async function POST(req: NextRequest) {
  const limited = await limit(req, "user", "fabric");
  if (limited) return limited;
  const parsed = await parseJson(req, fabricWriteSchema);
  if (!parsed.ok) return parsed.res;
  const { tenant, kind, entityId, source, actor, confidence, fields, supersedes } = parsed.data;
  const prisma = db();
  if (!prisma) return NextResponse.json({ ok: false, enabled: false, mode: telemetryMode(false).mode });
  try {
    const { slug } = await resolveTenant({ requestedTenant: tenant });
    const t = await prisma.tenant.findUnique({ where: { slug } });
    if (!t) return NextResponse.json({ ok: false, enabled: true, error: "Unknown tenant." }, { status: 404 });
    // Metadata-only: reject a Secret-class payload (same contract as Discover ingest).
    if (classify(JSON.stringify(fields)).dataClass === "Restricted") {
      return NextResponse.json({ ok: false, code: "restricted_payload", error: "Send governance metadata and references, not raw sensitive content." }, { status: 422 });
    }
    const r = await fabricAppend(prisma, t.id, { kind: kind as FabricKind, entityId, source, actor: actor || source, confidence, fields, supersedes: supersedes ?? null });
    return NextResponse.json({ ok: true, written: r.written, deduped: r.deduped, kind, entityId });
  } catch (e) {
    return serverError(e, "fabric.write");
  }
}
