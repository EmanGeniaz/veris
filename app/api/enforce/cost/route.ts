/* Live AI FinOps (#181). Reads the tenant's tamper-evident audit chain and
   returns real month-to-date spend — total, per provider AND per agent —
   derived from the `inference:*` rows' actual token counts (priced from the
   shared price book), re-verifying the SHA-256 chain. This is the real spend
   record, replacing the hardcoded TOKENS_MTD-derived demo. Tenant is bound to
   the session (BL-01); a client ?tenant cannot read another tenant's spend.
   Returns {enabled:false} with no database, so the surface honestly falls back
   to its seeded FinOps window. */
import { NextRequest, NextResponse } from "next/server";
import { db, dbConfigured } from "@/lib/db";
import { telemetryMode } from "@/lib/telemetry-source";
import { resolveTenant } from "@/lib/tenant-guard";
import { liveCostFromAudit } from "@/lib/cost-live";

export async function GET(req: NextRequest) {
  const prisma = db();
  if (!prisma) return NextResponse.json({ enabled: false, mode: telemetryMode(false).mode });
  try {
    const { slug } = await resolveTenant({ requestedTenant: req.nextUrl.searchParams.get("tenant") });
    const t = await prisma.tenant.findUnique({ where: { slug } });
    if (!t) return NextResponse.json({ enabled: true, mode: telemetryMode(dbConfigured()).mode, ...liveCostFromAudit([]) });
    const all = await prisma.auditLog.findMany({ where: { tenantId: t.id }, orderBy: { createdAt: "asc" } });
    return NextResponse.json({ enabled: true, mode: telemetryMode(dbConfigured()).mode, ...liveCostFromAudit(all) });
  } catch {
    return NextResponse.json({ enabled: false, mode: telemetryMode(false).mode });
  }
}
