/* Tenant provisioning. Guarded by VZ_ONBOARD_TOKEN. POST creates a
   workspace with the seed-or-clean choice; GET lists workspaces. */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { seedDemo } from "@/lib/seed-core";
import { limit, parseJson, safeEqual, serverError } from "@/lib/api-guard";
import { tenantCreateSchema } from "@/lib/api-schemas";

const authorized = (req: NextRequest) => {
  const t = process.env.VZ_ONBOARD_TOKEN;
  if (!t) return false;
  const h = req.headers.get("x-onboard-token"), q = req.nextUrl.searchParams.get("token");
  return (h !== null && safeEqual(h, t)) || (q !== null && safeEqual(q, t));
};

export async function GET(req: NextRequest) {
  const limited = await limit(req, "auth", "admin-tenants");
  if (limited) return limited;
  if (!authorized(req)) return NextResponse.json({ ok: false, error: "onboarding token missing or wrong" }, { status: 403 });
  const prisma = db();
  if (!prisma) return NextResponse.json({ ok: false, error: "database not configured" }, { status: 400 });
  const tenants = await prisma.tenant.findMany({ select: { slug: true, name: true, mode: true, createdAt: true } });
  return NextResponse.json({ ok: true, tenants });
}

export async function POST(req: NextRequest) {
  const limited = await limit(req, "auth", "admin-tenants");
  if (limited) return limited;
  if (!authorized(req)) return NextResponse.json({ ok: false, error: "onboarding token missing or wrong" }, { status: 403 });
  const prisma = db();
  if (!prisma) return NextResponse.json({ ok: false, error: "database not configured" }, { status: 400 });
  const parsed = await parseJson(req, tenantCreateSchema, { maxBytes: 4096 });
  if (!parsed.ok) return parsed.res;
  const { slug, name, mode } = parsed.data;
  try {
    if (await prisma.tenant.findUnique({ where: { slug } })) return NextResponse.json({ ok: false, error: "slug already exists" }, { status: 409 });
    const id = await seedDemo(prisma, { slug, name, mode });
    /* A clean workspace ships with no accounts (least privilege — BL-02); the demo
       showcase seeds role users whose password is DEMO_SEED_PASSWORD or a random
       per-user secret, never a shipped constant. */
    const signIn = mode === "demo"
      ? `role@${slug}.genveris.demo (password: DEMO_SEED_PASSWORD, else randomised per user)`
      : "no seeded accounts — register the first user, then an admin elevates roles";
    return NextResponse.json({ ok: true, tenantId: id, slug, mode, signIn });
  } catch (e) {
    return serverError(e, "admin.tenants.create");
  }
}
