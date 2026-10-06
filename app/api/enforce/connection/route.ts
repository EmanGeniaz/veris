/* Session-bound Enforce connection state (WS2 · #167 sub-task 2). A surface asks
   "is my tenant's Veris Enforce engine live, and if not, why?" The answer
   composes the plane entitlement (sub-task 1) with the per-tenant connection
   (this sub-task) into one honest state + badge. Tenant is bound to the session
   (BL-01 via resolveTenant); a client ?tenant is honoured only in no-auth demo
   mode, so a caller can only read its own tenant. This route performs NO write
   and never returns the credential — only the masked connection. Honest
   {enabled:false} without a database.

   It never returns a "live" state: the live-from-Enforce read is sub-task 3, so
   the furthest an entitled+configured tenant reaches here is awaiting-connection,
   badged Demo. */
import { NextRequest, NextResponse } from "next/server";
import { db, dbConfigured } from "@/lib/db";
import { telemetryMode } from "@/lib/telemetry-source";
import { resolveTenant } from "@/lib/tenant-guard";
import { entitledTo } from "@/lib/entitlements";
import { connectionState, maskConnection } from "@/lib/enforce-connection";
import { secretsConfigured } from "@/lib/secrets";
import { limit, serverError } from "@/lib/api-guard";

export async function GET(req: NextRequest) {
  const limited = await limit(req, "user", "enforce-connection");
  if (limited) return limited;
  const prisma = db();
  if (!prisma) return NextResponse.json({ enabled: false, mode: telemetryMode(false).mode });
  try {
    const { slug } = await resolveTenant({ requestedTenant: req.nextUrl.searchParams.get("tenant") });
    const t = await prisma.tenant.findUnique({ where: { slug }, select: { id: true } });
    if (!t) {
      const view = connectionState({ entitled: false, hasConnection: false });
      return NextResponse.json({ enabled: true, mode: telemetryMode(dbConfigured()).mode, tenant: slug, entitled: false, state: view.state, badge: view.badge, label: view.label, live: view.live, connection: maskConnection(null) });
    }
    const [ent, row] = await Promise.all([
      prisma.entitlement.findMany({ where: { tenantId: t.id }, select: { plane: true, status: true } }),
      prisma.enforceConnection.findUnique({ where: { tenantId: t.id } }),
    ]);
    const entitled = entitledTo(ent, "enforce");
    const view = connectionState({ entitled, hasConnection: !!row?.gatewayUrl, secretsReady: !row?.sealedToken || secretsConfigured() });
    return NextResponse.json({
      enabled: true,
      mode: telemetryMode(dbConfigured()).mode,
      tenant: slug,
      entitled,
      state: view.state,
      badge: view.badge,
      label: view.label,
      live: view.live,
      connection: maskConnection(row),
    });
  } catch (e) {
    return serverError(e, "enforce.connection.read");
  }
}
