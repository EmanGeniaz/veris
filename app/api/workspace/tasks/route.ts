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
import { deriveWorkspaceTasks, taskStats } from "@/lib/workspace-tasks";
import { logError } from "@/lib/api-guard";

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
