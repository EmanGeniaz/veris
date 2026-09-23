/* Live Tool-Call Ledger (BL-04 / #144). Reads the tenant's tamper-evident audit
   chain and returns the `inference:*` decisions as ledger rows, re-verifying the
   SHA-256 chain — the real record of what agents were allowed to do vs what they
   did. Tenant is bound to the session (BL-01); a client ?tenant cannot read
   another tenant's ledger. Returns {enabled:false} with no database, so the
   surface honestly falls back to its seeded window. */
import { NextRequest, NextResponse } from "next/server";
import { db, dbConfigured } from "@/lib/db";
import { telemetryMode } from "@/lib/telemetry-source";
import { resolveTenant } from "@/lib/tenant-guard";
import { liveLedgerFromAudit, liveLedgerStats } from "@/lib/enforce-live";

export async function GET(req: NextRequest) {
  const prisma = db();
  if (!prisma) return NextResponse.json({ enabled: false, mode: telemetryMode(false).mode });
  try {
    const { slug } = await resolveTenant({ requestedTenant: req.nextUrl.searchParams.get("tenant") });
    const t = await prisma.tenant.findUnique({ where: { slug } });
    if (!t) return NextResponse.json({ enabled: true, mode: telemetryMode(dbConfigured()).mode, rows: [], stats: liveLedgerStats([], true), intact: true });
    const all = await prisma.auditLog.findMany({ where: { tenantId: t.id }, orderBy: { createdAt: "asc" } });
    const { rows, intact } = liveLedgerFromAudit(all);
    // newest first, capped — the surface shows a window
    const shown = rows.slice(-50).reverse();
    return NextResponse.json({ enabled: true, mode: telemetryMode(dbConfigured()).mode, rows: shown, stats: liveLedgerStats(rows, intact), intact });
  } catch {
    return NextResponse.json({ enabled: false, mode: telemetryMode(false).mode });
  }
}
