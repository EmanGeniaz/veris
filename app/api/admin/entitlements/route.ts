/* Operator entitlement grants (WS2 · #167). The platform-operator path that
   records which planes a tenant owns and its small plan reference. Guarded by
   VZ_ONBOARD_TOKEN — the same server-authoritative admin boundary as tenant
   provisioning (app/api/admin/tenants) — so a tenant can NEVER grant itself a
   plane. Operates on an explicitly named tenant (not session-bound).

   GET  ?tenant=<slug>  → that tenant's entitlements + plan.
   POST { tenant, plane?, action?, plan? } → grant/revoke/suspend a plane and/or
   set the plan label. Baseline-compliant: auth-tier rate limit, strict zod body,
   generic errors via serverError. No-op without a database. */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { limit, parseJson, safeEqual, serverError } from "@/lib/api-guard";
import { entitlementGrantSchema } from "@/lib/api-schemas";

const authorized = (req: NextRequest) => {
  const t = process.env.VZ_ONBOARD_TOKEN;
  if (!t) return false;
  const h = req.headers.get("x-onboard-token"), q = req.nextUrl.searchParams.get("token");
  return (h !== null && safeEqual(h, t)) || (q !== null && safeEqual(q, t));
};

export async function GET(req: NextRequest) {
  const limited = await limit(req, "auth", "admin-entitlements");
  if (limited) return limited;
  if (!authorized(req)) return NextResponse.json({ ok: false, error: "onboarding token missing or wrong" }, { status: 403 });
  const prisma = db();
  if (!prisma) return NextResponse.json({ ok: false, error: "database not configured" }, { status: 400 });
  const slug = (req.nextUrl.searchParams.get("tenant") || "").trim().toLowerCase();
  if (!slug) return NextResponse.json({ ok: false, error: "tenant is required" }, { status: 400 });
  try {
    const t = await prisma.tenant.findUnique({ where: { slug }, select: { id: true, plan: true } });
    if (!t) return NextResponse.json({ ok: false, error: "unknown tenant" }, { status: 404 });
    const rows = await prisma.entitlement.findMany({
      where: { tenantId: t.id },
      select: { plane: true, status: true, grantedBy: true, grantedAt: true },
      orderBy: { plane: "asc" },
    });
    return NextResponse.json({ ok: true, tenant: slug, plan: t.plan ?? null, entitlements: rows });
  } catch (e) {
    return serverError(e, "admin.entitlements.list");
  }
}

export async function POST(req: NextRequest) {
  const limited = await limit(req, "auth", "admin-entitlements");
  if (limited) return limited;
  if (!authorized(req)) return NextResponse.json({ ok: false, error: "onboarding token missing or wrong" }, { status: 403 });
  const prisma = db();
  if (!prisma) return NextResponse.json({ ok: false, error: "database not configured" }, { status: 400 });
  const parsed = await parseJson(req, entitlementGrantSchema, { maxBytes: 4096 });
  if (!parsed.ok) return parsed.res;
  const { tenant: slug, plane, action, plan, actor } = parsed.data;
  try {
    const t = await prisma.tenant.findUnique({ where: { slug }, select: { id: true } });
    if (!t) return NextResponse.json({ ok: false, error: "unknown tenant" }, { status: 404 });

    // Plan label (optional): a non-authoritative commercial reference. null clears it.
    if (plan !== undefined) {
      await prisma.tenant.update({ where: { id: t.id }, data: { plan: plan ?? null } });
    }

    // Plane entitlement (optional): grant = active, suspend = kept but inactive,
    // revoke = removed entirely (back to default-empty / not entitled).
    if (plane) {
      const by = actor || "operator";
      if (action === "revoke") {
        await prisma.entitlement.deleteMany({ where: { tenantId: t.id, plane } });
      } else {
        const status = action === "suspend" ? "suspended" : "active";
        await prisma.entitlement.upsert({
          where: { tenantId_plane: { tenantId: t.id, plane } },
          update: { status, grantedBy: by },
          create: { tenantId: t.id, plane, status, grantedBy: by },
        });
      }
    }

    const rows = await prisma.entitlement.findMany({
      where: { tenantId: t.id },
      select: { plane: true, status: true },
      orderBy: { plane: "asc" },
    });
    const current = await prisma.tenant.findUnique({ where: { id: t.id }, select: { plan: true } });
    return NextResponse.json({ ok: true, tenant: slug, plan: current?.plan ?? null, entitlements: rows });
  } catch (e) {
    return serverError(e, "admin.entitlements.grant");
  }
}
