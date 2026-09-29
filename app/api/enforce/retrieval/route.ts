/* Live Retrieval Guardrails (BL-04 / #144). Reads the tenant's tamper-evident
   audit chain and returns the `retrieval:*` guard decisions as surface rows,
   re-verifying the SHA-256 chain — the real record of what grounded an answer and
   what was kept out (untrusted source / secret-bearing chunk / stale). The audit
   rows carry governance metadata only (document identifier, trust tier,
   freshness, guarded score), never the passage text. Tenant is bound to the
   session (BL-01); a client ?tenant cannot read another tenant's retrieval
   record. Returns {enabled:false} with no database, so the surface honestly
   falls back to its seeded window. */
import { NextRequest, NextResponse } from "next/server";
import { db, dbConfigured } from "@/lib/db";
import { telemetryMode } from "@/lib/telemetry-source";
import { resolveTenant } from "@/lib/tenant-guard";
import { liveRetrievalFromAudit, liveRetrievalStats } from "@/lib/retrieval-live";

export async function GET(req: NextRequest) {
  const prisma = db();
  if (!prisma) return NextResponse.json({ enabled: false, mode: telemetryMode(false).mode });
  try {
    const { slug } = await resolveTenant({ requestedTenant: req.nextUrl.searchParams.get("tenant") });
    const t = await prisma.tenant.findUnique({ where: { slug } });
    if (!t) return NextResponse.json({ enabled: true, mode: telemetryMode(dbConfigured()).mode, rows: [], stats: liveRetrievalStats([], true), intact: true });
    const all = await prisma.auditLog.findMany({ where: { tenantId: t.id }, orderBy: { createdAt: "asc" } });
    const { rows, intact } = liveRetrievalFromAudit(all);
    // newest first, capped — the surface shows a window
    const shown = rows.slice(-50).reverse();
    return NextResponse.json({ enabled: true, mode: telemetryMode(dbConfigured()).mode, rows: shown, stats: liveRetrievalStats(rows, intact), intact });
  } catch {
    return NextResponse.json({ enabled: false, mode: telemetryMode(false).mode });
  }
}
