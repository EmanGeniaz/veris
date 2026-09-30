/* ── AIMS-assigned task inbox (#168 / WS3) ────────────────────────────────────
   "Tasks assigned from the AIMS": registered AI systems route real governance
   work into the employee's cockpit. This module DERIVES those tasks from genuine
   AIMS state — never fabricates them — so the inbox reflects real governance gaps
   and signals, tenant-scoped and chain-verified:

     1. Fabric AISystem records of high/critical tier with NO assessment/evidence
        on record  →  "complete assessment" task (raised by discover/human).
     2. Fabric Finding records                          →  "resolve finding" task
        (raised by enforce).
     3. Audit-chain `inference:escalate` (HITL) rows    →  "review flagged output"
        task (raised by enforce).

   Pure over already-fetched rows: reuses the Evidence Fabric resolution
   (currentByEntity / human-wins) and the audit-chain verification
   (auditChainIntact). Each task carries the AIMS `source` that raised it — the
   honest provenance of who assigned the work. Metadata only, never raw content. */
import { auditChainIntact, type AuditRow } from "./enforce-live";
import { mapFabricRow, currentByEntity, type FabricRow } from "./evidence-fabric";

export type TaskKind = "assessment" | "review" | "finding";
export type TaskSeverity = "high" | "medium" | "low";
export type WorkspaceTask = {
  id: string; kind: TaskKind; title: string; why: string;
  source: string; severity: TaskSeverity; entityId: string; surface: string;
};

/* Which cockpit surface a task links through to when actioned. */
const SURFACE: Record<TaskKind, string> = { assessment: "emp_projects", finding: "emp_risk", review: "emp_tasks" };

const SEV_RANK: Record<TaskSeverity, number> = { high: 0, medium: 1, low: 2 };

export function deriveWorkspaceTasks(opts: { fabricRows?: FabricRow[]; auditRows?: AuditRow[] }): { tasks: WorkspaceTask[]; intact: boolean } {
  const fabricRows = opts.fabricRows ?? [];
  const auditRows = opts.auditRows ?? [];
  const intact = auditChainIntact(auditRows);
  const current = currentByEntity(fabricRows.map(mapFabricRow));
  const tasks: WorkspaceTask[] = [];

  // Entities that already carry an assessment or evidence reference.
  const assessed = new Set(
    current
      .filter((r) => r.kind === "Assessment" || r.kind === "EvidenceRef")
      .map((r) => String(r.fields.of ?? ""))
      .filter(Boolean),
  );

  // 1) High/critical AISystems lacking an assessment → complete assessment.
  for (const r of current) {
    if (r.kind !== "AISystem") continue;
    const tier = String(r.fields.tier ?? "").toLowerCase();
    if (tier !== "high" && tier !== "critical") continue;
    if (assessed.has(r.entityId)) continue;
    tasks.push({
      id: "task-asm-" + r.entityId, kind: "assessment",
      title: `Complete assessment — ${r.fields.name ?? r.entityId}`,
      why: `${tier === "critical" ? "Critical" : "High"}-tier AI system has no governance assessment on record.`,
      source: r.provenance.source || "discover", severity: "high", entityId: r.entityId, surface: SURFACE.assessment,
    });
  }

  // 2) Findings → resolve finding.
  for (const r of current) {
    if (r.kind !== "Finding") continue;
    const sev = String(r.fields.severity ?? "medium").toLowerCase();
    const severity: TaskSeverity = sev === "high" || sev === "critical" ? "high" : sev === "low" ? "low" : "medium";
    tasks.push({
      id: "task-fnd-" + r.entityId, kind: "finding",
      title: `Resolve finding — ${r.fields.reason ?? r.entityId}`,
      why: `A finding on ${r.fields.of ?? r.entityId} needs review and remediation.`,
      source: r.provenance.source || "enforce", severity, entityId: r.entityId, surface: SURFACE.finding,
    });
  }

  // 3) HITL escalations on the audit chain → review flagged output.
  for (const a of auditRows) {
    if (typeof a.action !== "string" || a.action !== "inference:escalate") continue;
    let d: { agent?: string; tool?: string } = {};
    try { d = JSON.parse(a.detail || "{}"); } catch { /* leave empty */ }
    tasks.push({
      id: "task-esc-" + (a.id ? String(a.id).slice(-8) : (a.hash || "").slice(0, 8)),
      kind: "review",
      title: `Review flagged AI output${d.agent ? ` — ${d.agent}` : ""}`,
      why: `The gateway escalated a ${d.tool ? `"${d.tool}" ` : ""}action for human review (HITL).`,
      source: "enforce", severity: "medium", entityId: a.entity || "gateway", surface: SURFACE.review,
    });
  }

  tasks.sort((x, y) => SEV_RANK[x.severity] - SEV_RANK[y.severity]);
  return { tasks, intact };
}

/* KPI rollup for the inbox header. */
export function taskStats(tasks: WorkspaceTask[]) {
  return {
    total: tasks.length,
    high: tasks.filter((t) => t.severity === "high").length,
    assessment: tasks.filter((t) => t.kind === "assessment").length,
    findings: tasks.filter((t) => t.kind === "finding").length,
    reviews: tasks.filter((t) => t.kind === "review").length,
    sources: [...new Set(tasks.map((t) => t.source))],
  };
}
