/* Live Runtime Guardrails (BL-04 / #144). Reads the tenant's tamper-evident
   audit chain and returns the `runtime:*` per-request admission/latency events
   grouped into the per-session view (action stream, in-flight, P95, worst
   decision), re-verifying the SHA-256 chain — the real record of how agent
   sessions behaved in motion. Tenant is bound to the session (BL-01); a client
   ?tenant cannot read another tenant's runtime record. Returns {enabled:false}
   with no database, so the surface honestly falls back to its seeded window. */
import { NextRequest, NextResponse } from "next/server";
import { db, dbConfigured } from "@/lib/db";
import { telemetryMode } from "@/lib/telemetry-source";
import { resolveTenant } from "@/lib/tenant-guard";
import { liveRuntimeFromAudit, liveRuntimeStats } from "@/lib/runtime-live";

export async function GET(req: NextRequest) {
  const prisma = db();
  if (!prisma) return NextResponse.json({ enabled: false, mode: telemetryMode(false).mode });
  try {
    const { slug } = await resolveTenant({ requestedTenant: req.nextUrl.searchParams.get("tenant") });
    const t = await prisma.tenant.findUnique({ where: { slug } });
    if (!t) return NextResponse.json({ enabled: true, mode: telemetryMode(dbConfigured()).mode, rows: [], stats: liveRuntimeStats([], true), intact: true });
    const all = await prisma.auditLog.findMany({ where: { tenantId: t.id }, orderBy: { createdAt: "asc" } });
    const { rows, intact } = liveRuntimeFromAudit(all);
    // already newest-first (by last activity); cap to the window the surface shows
    const shown = rows.slice(0, 50);
    return NextResponse.json({ enabled: true, mode: telemetryMode(dbConfigured()).mode, rows: shown, stats: liveRuntimeStats(rows, intact), intact });
  } catch {
    return NextResponse.json({ enabled: false, mode: telemetryMode(false).mode });
  }
}
