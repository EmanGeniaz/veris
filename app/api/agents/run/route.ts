/* Governed agent run (#182 §08). Triggers a monitoring/governance agent under
   the runtime's governance envelope: the server PLANS the run (entitlement /
   circuit-breaker / HITL / least-privilege via planAgentRun), records it to the
   AgentRun ledger, and appends an Article-12 audit row under the agent's own
   identity — so every agent run is attributable and tamper-evident.

   Honesty + safety:
   - The run is bound to the session tenant (BL-01); a client cannot widen an
     agent's capability scope — it is always exactly the agent's declared set.
   - A read-only MONITOR agent derives findings from governed data it is allowed
     to read (fabric + audit) and records a count — it changes nothing.
   - A PROPOSE or ACT agent is never executed autonomously: the run is recorded
     as `proposed` with requiresApproval=true and takes no outward action.
   - No database → honest {enabled:false}; nothing is fabricated. */
import { NextRequest, NextResponse } from "next/server";
import { db, dbConfigured } from "@/lib/db";
import { telemetryMode } from "@/lib/telemetry-source";
import { resolveTenant } from "@/lib/tenant-guard";
import { entitledPlanes } from "@/lib/entitlements";
import { agentById, planAgentRun } from "@/lib/agent-runtime";
import { deriveWorkspaceTasks } from "@/lib/workspace-tasks";
import { auditAppend } from "@/lib/audit";
import { limit, parseJson, serverError } from "@/lib/api-guard";
import { agentRunSchema } from "@/lib/api-schemas";

export async function POST(req: NextRequest) {
  const limited = await limit(req, "user", "agents-run");
  if (limited) return limited;
  const parsed = await parseJson(req, agentRunSchema);
  if (!parsed.ok) return parsed.res;
  const { tenant, agentId, trigger } = parsed.data;
  const prisma = db();
  if (!prisma) return NextResponse.json({ ok: false, enabled: false, mode: telemetryMode(false).mode });
  try {
    const agent = agentById(agentId);
    if (!agent) return NextResponse.json({ ok: false, enabled: true, error: "unknown agent" }, { status: 404 });
    const { slug } = await resolveTenant({ requestedTenant: tenant });
    const t = await prisma.tenant.findUnique({ where: { slug }, select: { id: true } });
    if (!t) return NextResponse.json({ ok: false, enabled: true, error: "unknown tenant" }, { status: 404 });

    const planes = entitledPlanes(await prisma.entitlement.findMany({ where: { tenantId: t.id }, select: { plane: true, status: true } }));
    // breakerOpen is a declared gate; live breaker-signal wiring is a follow-up.
    const plan = planAgentRun({ agent, entitledPlanes: planes, dbConfigured: dbConfigured() });

    let findings = 0;
    let detail = plan.reason;
    let status = plan.state;

    if (plan.allow && agent.actionClass === "monitor" && agent.status === "available") {
      // Read-only work, limited to the agent's declared capabilities (fabric/audit read).
      const [fabricRows, auditRows] = await Promise.all([
        prisma.fabricRecord.findMany({ where: { tenantId: t.id }, orderBy: { createdAt: "asc" } }),
        prisma.auditLog.findMany({ where: { tenantId: t.id }, orderBy: { createdAt: "asc" } }),
      ]);
      const derived = deriveWorkspaceTasks({ fabricRows, auditRows });
      findings = derived.tasks.length;
      status = "completed";
      detail = `${agent.name}: ${findings} open governance finding(s) (${plan.mode})`;
    }

    const actor = `agent:${agent.id}`;
    const run = await prisma.agentRun.create({
      data: {
        tenantId: t.id, agentId: agent.id, trigger, status, mode: plan.mode,
        requiresApproval: plan.requiresApproval, findings, detail,
        finishedAt: status === "proposed" ? null : new Date(),
      },
    });
    // Article-12: every governed run is recorded under the agent's own identity.
    await auditAppend(prisma, t.id, `agent:run:${status}`, agent.id, detail, actor);

    return NextResponse.json({
      ok: true, enabled: true, mode: plan.mode, agentId: agent.id,
      allowed: plan.allow, status, requiresApproval: plan.requiresApproval,
      capabilityScope: plan.capabilityScope, findings, reason: plan.reason, runId: run.id,
    });
  } catch (e) {
    return serverError(e, "agents.run");
  }
}
