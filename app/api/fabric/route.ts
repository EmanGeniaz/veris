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
import { fabricView } from "@/lib/evidence-fabric";

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
