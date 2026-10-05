/* Session-bound entitlement read (WS2 · #167). A surface asks "which planes does
   MY tenant own?" — e.g. is Veris Enforce entitled? The tenant is bound to the
   session (BL-01 via resolveTenant): when auth is configured a client-supplied
   ?tenant is ignored, so a caller can only ever read its own tenant's
   entitlements and can never grant one (this route has no write). Returns
   {enabled:false} with no database so a surface honestly falls back to demo.

   This is the read half of the seam; flipping a surface to live-from-Enforce is a
   later sub-task. Here we only resolve and report entitlement, truthfully. */
import { NextRequest, NextResponse } from "next/server";
import { db, dbConfigured } from "@/lib/db";
import { telemetryMode } from "@/lib/telemetry-source";
import { resolveTenant } from "@/lib/tenant-guard";
import { entitledPlanes } from "@/lib/entitlements";
import { limit, serverError } from "@/lib/api-guard";

export async function GET(req: NextRequest) {
  const limited = await limit(req, "user", "entitlements");
  if (limited) return limited;
  const prisma = db();
  if (!prisma) return NextResponse.json({ enabled: false, mode: telemetryMode(false).mode });
  try {
    const { slug } = await resolveTenant({ requestedTenant: req.nextUrl.searchParams.get("tenant") });
    const t = await prisma.tenant.findUnique({ where: { slug }, select: { id: true, plan: true } });
    if (!t) {
      return NextResponse.json({ enabled: true, mode: telemetryMode(dbConfigured()).mode, tenant: slug, plan: null, planes: [] });
    }
    const rows = await prisma.entitlement.findMany({ where: { tenantId: t.id }, select: { plane: true, status: true } });
    return NextResponse.json({
      enabled: true,
      mode: telemetryMode(dbConfigured()).mode,
      tenant: slug,
      plan: t.plan ?? null,
      planes: entitledPlanes(rows),
    });
  } catch (e) {
    return serverError(e, "entitlements.read");
  }
}
