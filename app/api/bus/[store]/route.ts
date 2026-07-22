/* Persistence bus: evidence, decisions and ideas flow here when the
   database is configured; the client falls back to localStorage when
   it is not. One demo tenant for now - auth and multi-tenant arrive in
   Phase 2b. */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth, authConfigured } from "@/auth";
import { auditAppend } from "@/lib/audit";

const STORES = new Set(["evidence", "decisions", "ideas"]);

async function sessionCtx(prisma: NonNullable<ReturnType<typeof db>>) {
  let identity: { name: string; email: string } | null = null;
  let tenantId: string | null = null;
  if (authConfigured()) {
    const session = await auth();
    if (session?.user?.email) {
      identity = { name: session.user.name || session.user.email, email: session.user.email };
      const u = await prisma.user.findUnique({ where: { email: session.user.email } });
      if (u) tenantId = u.tenantId;
    }
  }
  if (!tenantId) {
    const t = await prisma.tenant.upsert({
      where: { slug: "demo" },
      update: {},
      create: { slug: "demo", name: "VerisZone Demo Center", mode: "demo" },
    });
    tenantId = t.id;
  }
  return { tenantId, identity };
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ store: string }> }) {
  const { store } = await ctx.params;
  if (!STORES.has(store)) return NextResponse.json({ enabled: false }, { status: 404 });
  const prisma = db();
  if (!prisma) return NextResponse.json({ enabled: false });
  try {
    const { tenantId: tid } = await sessionCtx(prisma);
    const rows =
      store === "evidence" ? await prisma.evidence.findMany({ where: { tenantId: tid }, orderBy: { createdAt: "desc" }, take: 100 })
      : store === "decisions" ? await prisma.decision.findMany({ where: { tenantId: tid }, orderBy: { createdAt: "desc" }, take: 100 })
      : await prisma.idea.findMany({ where: { tenantId: tid }, orderBy: { createdAt: "desc" }, take: 100 });
    return NextResponse.json({ enabled: true, rows });
  } catch {
    return NextResponse.json({ enabled: false });
  }
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ store: string }> }) {
  const { store } = await ctx.params;
  if (!STORES.has(store)) return NextResponse.json({ enabled: false }, { status: 404 });
  const prisma = db();
  if (!prisma) return NextResponse.json({ enabled: false });
  try {
    const { tenantId: tid, identity } = await sessionCtx(prisma);
    if (store === "decisions" && authConfigured()) {
      const session = await auth();
      const role = (session?.user as { role?: string } | undefined)?.role;
      if (!role || ["employee", "manager"].includes(role)) {
        return NextResponse.json({ enabled: true, ok: false, error: "decision writes require an executive role" }, { status: 403 });
      }
    }
    const b = await req.json();
    if (identity) {
      b.owner = identity.name; b.decidedBy = identity.name; b.submitter = identity.name;
    }
    if (store === "evidence") {
      await prisma.evidence.create({ data: {
        tenantId: tid, item: String(b.item ?? ""), initiative: String(b.initiative ?? ""),
        scope: String(b.scope ?? ""), control: String(b.control ?? ""), risk: String(b.risk ?? ""),
        owner: String(b.owner ?? ""), status: String(b.status ?? ""), approval: String(b.approval ?? ""),
        version: String(b.version ?? "v1"),
      }});
    } else if (store === "decisions") {
      await prisma.decision.create({ data: {
        tenantId: tid, initiativeId: String(b.initiativeId ?? ""), decision: String(b.decision ?? ""),
        rationale: String(b.rationale ?? ""), decidedBy: String(b.decidedBy ?? ""),
      }});
    } else {
      await prisma.idea.create({ data: {
        tenantId: tid, title: String(b.title ?? ""), problem: String(b.problem ?? ""),
        unit: String(b.unit ?? ""), submitter: String(b.submitter ?? ""), stage: String(b.stage ?? "Submitted"),
      }});
    }
    await auditAppend(prisma, tid, "create", store, String(b.item ?? b.title ?? b.decision ?? "").slice(0, 300), identity?.email ?? "demo-anonymous").catch(() => {});
    return NextResponse.json({ enabled: true, ok: true });
  } catch {
    return NextResponse.json({ enabled: false });
  }
}
