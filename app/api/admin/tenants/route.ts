/* Tenant provisioning. Guarded by VZ_ONBOARD_TOKEN. POST creates a
   workspace with the seed-or-clean choice; GET lists workspaces. */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { seedDemo } from "@/lib/seed-core";

const authorized = (req: NextRequest) => {
  const t = process.env.VZ_ONBOARD_TOKEN;
  return !!t && (req.headers.get("x-onboard-token") === t || req.nextUrl.searchParams.get("token") === t);
};

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ ok: false, error: "onboarding token missing or wrong" }, { status: 403 });
  const prisma = db();
  if (!prisma) return NextResponse.json({ ok: false, error: "database not configured" }, { status: 400 });
  const tenants = await prisma.tenant.findMany({ select: { slug: true, name: true, mode: true, createdAt: true } });
  return NextResponse.json({ ok: true, tenants });
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ ok: false, error: "onboarding token missing or wrong" }, { status: 403 });
  const prisma = db();
  if (!prisma) return NextResponse.json({ ok: false, error: "database not configured" }, { status: 400 });
  const b = await req.json();
  const slug = String(b.slug || "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40);
  const name = String(b.name || "").slice(0, 80);
  const mode = b.mode === "demo" ? "demo" as const : "clean" as const;
  if (!slug || !name) return NextResponse.json({ ok: false, error: "slug and name required" }, { status: 400 });
  if (await prisma.tenant.findUnique({ where: { slug } })) return NextResponse.json({ ok: false, error: "slug already exists" }, { status: 409 });
  const id = await seedDemo(prisma, { slug, name, mode });
  return NextResponse.json({ ok: true, tenantId: id, slug, mode, signIn: `role@${slug}.veriszone.demo (rotate the seeded password)` });
}
