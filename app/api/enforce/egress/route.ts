/* Live Egress attempts (BL-04 / #144). Reads the tenant's tamper-evident audit
   chain and returns the `egress-inspect:*` destination decisions (kind:"egress")
   as surface rows, re-verifying the SHA-256 chain — the real record of what
   destinations agents' tools tried to reach and how the deny-by-default policy
   decided. Tenant is bound to the session (BL-01); a client ?tenant cannot read
   another tenant's egress record. Returns {enabled:false} with no database, so
   the surface honestly falls back to its seeded window. */
import { NextRequest, NextResponse } from "next/server";
import { db, dbConfigured } from "@/lib/db";
import { telemetryMode } from "@/lib/telemetry-source";
import { resolveTenant } from "@/lib/tenant-guard";
import { liveEgressFromAudit, liveEgressStats } from "@/lib/egress-live";

export async function GET(req: NextRequest) {
  const prisma = db();
  if (!prisma) return NextResponse.json({ enabled: false, mode: telemetryMode(false).mode });
  try {
    const { slug } = await resolveTenant({ requestedTenant: req.nextUrl.searchParams.get("tenant") });
    const t = await prisma.tenant.findUnique({ where: { slug } });
    if (!t) return NextResponse.json({ enabled: true, mode: telemetryMode(dbConfigured()).mode, rows: [], stats: liveEgressStats([], true), intact: true });
    const all = await prisma.auditLog.findMany({ where: { tenantId: t.id }, orderBy: { createdAt: "asc" } });
    const { rows, intact } = liveEgressFromAudit(all);
    // newest first, capped — the surface shows a window
    const shown = rows.slice(-50).reverse();
    return NextResponse.json({ enabled: true, mode: telemetryMode(dbConfigured()).mode, rows: shown, stats: liveEgressStats(rows, intact), intact });
  } catch {
    return NextResponse.json({ enabled: false, mode: telemetryMode(false).mode });
  }
}
