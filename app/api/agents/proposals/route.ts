/* Propose-agent review queue (#182 §08 step 3). Session-bound list of the
   tenant's agent proposals for a human to review and approve/reject. Read-only;
   tenant bound to the session (BL-01); honest {enabled:false} without a DB.
   `?status=pending` (default) filters to what still needs a decision. */
import { NextRequest, NextResponse } from "next/server";
import { db, dbConfigured } from "@/lib/db";
import { telemetryMode } from "@/lib/telemetry-source";
import { resolveTenant } from "@/lib/tenant-guard";
import { limit, serverError } from "@/lib/api-guard";

export async function GET(req: NextRequest) {
  const limited = await limit(req, "user", "agent-proposals");
  if (limited) return limited;
  const prisma = db();
  const mode = telemetryMode(dbConfigured()).mode;
  if (!prisma) return NextResponse.json({ enabled: false, mode, proposals: [] });
  try {
    const { slug } = await resolveTenant({ requestedTenant: req.nextUrl.searchParams.get("tenant") });
    const t = await prisma.tenant.findUnique({ where: { slug }, select: { id: true } });
    if (!t) return NextResponse.json({ enabled: true, mode, tenant: slug, proposals: [] });
    const statusParam = (req.nextUrl.searchParams.get("status") || "pending").toLowerCase();
    const where: { tenantId: string; status?: string } = { tenantId: t.id };
    if (statusParam !== "all") where.status = statusParam;
    const rows = await prisma.agentProposal.findMany({
      where, orderBy: { createdAt: "desc" }, take: 200,
      select: { id: true, agentId: true, kind: true, entityId: true, title: true, status: true, decidedBy: true, decidedAt: true, createdAt: true },
    });
    return NextResponse.json({ enabled: true, mode, tenant: slug, proposals: rows });
  } catch (e) {
    return serverError(e, "agents.proposals.list");
  }
}
