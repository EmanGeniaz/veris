/* AIMS-assigned task inbox (#168 / WS3). Reads the tenant's Evidence Fabric +
   tamper-evident audit chain and returns the governance tasks derived from real
   AIMS state — high/critical AI systems lacking an assessment, unresolved
   findings, and HITL escalations — each stamped with the AIMS source that raised
   it. Tenant is bound to the session (BL-01); a client ?tenant cannot read
   another tenant's tasks. Returns {enabled:false} with no database, so the
   surface honestly falls back to its seeded inbox. Read-only (GET); actioning a
   task is handled by the linked surface. */
import { NextRequest, NextResponse } from "next/server";
import { db, dbConfigured } from "@/lib/db";
import { telemetryMode } from "@/lib/telemetry-source";
import { resolveTenant } from "@/lib/tenant-guard";
import { deriveWorkspaceTasks, taskStats, resolvedTaskIds } from "@/lib/workspace-tasks";
import { auditAppend } from "@/lib/audit";
import { logError, limit, parseJson, serverError } from "@/lib/api-guard";
import { taskActionSchema } from "@/lib/api-schemas";

export async function GET(req: NextRequest) {
  const prisma = db();
  if (!prisma) return NextResponse.json({ enabled: false, mode: telemetryMode(false).mode });
  try {
    const { slug } = await resolveTenant({ requestedTenant: req.nextUrl.searchParams.get("tenant") });
    const t = await prisma.tenant.findUnique({ where: { slug } });
    if (!t) {
      const empty = deriveWorkspaceTasks({});
      return NextResponse.json({ enabled: true, mode: telemetryMode(dbConfigured()).mode, tasks: empty.tasks, stats: taskStats(empty.tasks), intact: empty.intact });
    }
    const [fabricRows, auditRows] = await Promise.all([
      prisma.fabricRecord.findMany({ where: { tenantId: t.id }, orderBy: { createdAt: "asc" } }),
      prisma.auditLog.findMany({ where: { tenantId: t.id }, orderBy: { createdAt: "asc" } }),
    ]);
    const { tasks, intact } = deriveWorkspaceTasks({ fabricRows, auditRows });
    return NextResponse.json({ enabled: true, mode: telemetryMode(dbConfigured()).mode, tasks, stats: taskStats(tasks), intact });
  } catch (e) {
    // Honest fallback to the seeded inbox; the detail stays in the server log.
    logError(e, "workspace.tasks");
    return NextResponse.json({ enabled: false, mode: telemetryMode(false).mode });
  }
}

/* Write-back: acknowledge or flag a task → a `task:<decision>` row on the
   tenant's tamper-evident audit chain. The task then leaves the inbox (the
   derivation excludes actioned tasks). Session/tenant-bound (BL-01), rate-limited
   (user tier), strict-validated body, idempotent per task. */
export async function POST(req: NextRequest) {
  const limited = await limit(req, "user", "workspace-tasks");
  if (limited) return limited;
  const parsed = await parseJson(req, taskActionSchema);
  if (!parsed.ok) return parsed.res;
  const { tenant, taskId, entityId, kind, decision, note } = parsed.data;
  const prisma = db();
  if (!prisma) return NextResponse.json({ ok: false, enabled: false, mode: telemetryMode(false).mode });
  try {
    // A signed-in user can only action tasks in their own tenant (BL-01).
    const { slug } = await resolveTenant({ requestedTenant: tenant });
    const t = await prisma.tenant.findUnique({ where: { slug } });
    if (!t) return NextResponse.json({ ok: false, enabled: true, error: "Unknown tenant." }, { status: 404 });
    const existing = await prisma.auditLog.findMany({ where: { tenantId: t.id }, orderBy: { createdAt: "asc" } });
    // Idempotent: a task already actioned is a no-op (no duplicate chain rows).
    if (resolvedTaskIds(existing).has(taskId)) return NextResponse.json({ ok: true, deduped: true, decision, taskId });
    const detail = JSON.stringify({ taskId, kind, ...(note ? { note } : {}) });
    await auditAppend(prisma, t.id, `task:${decision}`, entityId, detail, "workspace");
    return NextResponse.json({ ok: true, deduped: false, decision, taskId });
  } catch (e) {
    return serverError(e, "workspace.tasks.action");
  }
}
