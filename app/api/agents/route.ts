/* Governed agent catalogue (#182 §08). Session-bound read of the monitoring /
   governance agent registry with each agent's governed status for the caller's
   tenant: whether it is available, whether the tenant is entitled to run it, its
   action class + capability scope, and its last run. Tenant is bound to the
   session (BL-01); honest {enabled:false} without a database. Read-only — this
   route never runs an agent. */
import { NextRequest, NextResponse } from "next/server";
import { db, dbConfigured } from "@/lib/db";
import { telemetryMode } from "@/lib/telemetry-source";
import { resolveTenant } from "@/lib/tenant-guard";
import { entitledPlanes } from "@/lib/entitlements";
import { AGENT_REGISTRY } from "@/lib/agent-runtime";
import { nextRunAt } from "@/lib/agent-schedule";
import { limit, serverError } from "@/lib/api-guard";

export async function GET(req: NextRequest) {
  const limited = await limit(req, "user", "agents");
  if (limited) return limited;
  const prisma = db();
  const mode = telemetryMode(dbConfigured()).mode;
  const base = AGENT_REGISTRY.map((a) => ({
    id: a.id, name: a.name, purpose: a.purpose, actionClass: a.actionClass,
    capabilities: a.capabilities, requiresEntitlement: a.requiresEntitlement ?? null,
    cadence: a.cadence, status: a.status,
  }));
  if (!prisma) return NextResponse.json({ enabled: false, mode, agents: base });
  try {
    const { slug } = await resolveTenant({ requestedTenant: req.nextUrl.searchParams.get("tenant") });
    const t = await prisma.tenant.findUnique({ where: { slug }, select: { id: true } });
    if (!t) return NextResponse.json({ enabled: true, mode, tenant: slug, planes: [], agents: base });
    const [ent, runs] = await Promise.all([
      prisma.entitlement.findMany({ where: { tenantId: t.id }, select: { plane: true, status: true } }),
      prisma.agentRun.findMany({ where: { tenantId: t.id }, orderBy: { startedAt: "desc" }, take: 200, select: { agentId: true, status: true, mode: true, findings: true, startedAt: true } }),
    ]);
    const planes = entitledPlanes(ent);
    const lastByAgent = new Map<string, typeof runs[number]>();
    for (const r of runs) if (!lastByAgent.has(r.agentId)) lastByAgent.set(r.agentId, r);
    const agents = AGENT_REGISTRY.map((a) => {
      const last = lastByAgent.get(a.id) ?? null;
      const entitled = !a.requiresEntitlement || planes.includes(a.requiresEntitlement);
      return {
        id: a.id, name: a.name, purpose: a.purpose, actionClass: a.actionClass,
        capabilities: a.capabilities, requiresEntitlement: a.requiresEntitlement ?? null,
        cadence: a.cadence, status: a.status, entitled,
        lastRun: last ? { status: last.status, mode: last.mode, findings: last.findings, at: last.startedAt } : null,
        nextRunAt: nextRunAt(a, last ? new Date(last.startedAt) : null),
      };
    });
    return NextResponse.json({ enabled: true, mode, tenant: slug, planes, agents });
  } catch (e) {
    return serverError(e, "agents.list");
  }
}
