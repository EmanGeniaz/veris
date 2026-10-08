/* ── Monitor agent → canonical Findings (#182 §08 step 2) ────────────────
   Maps a monitor agent's derived governance tasks into canonical Evidence-Fabric
   Finding write specs. Pure (no db) and metadata-only: a Finding carries a
   title, a severity, and references (the task id, the AI system it concerns) —
   never raw content. The entityId is stable (`finding:<taskId>`), so re-running
   the monitor is idempotent at the Fabric layer (fabricAppend dedupes the
   unchanged latest-for-entity record) and a human decision on the same entity
   still wins in the canonical view. */
import type { WorkspaceTask } from "./workspace-tasks";

export interface FindingSpec {
  entityId: string;                     // stable, idempotent across runs
  fields: Record<string, unknown>;      // governance metadata only
}

export function findingSpecsFromTasks(tasks: WorkspaceTask[], agentId: string): FindingSpec[] {
  // Only raise Findings for genuine gaps. A "finding"-kind task is itself derived
  // from an existing Finding record, so re-raising it would create a growth loop
  // (the monitor re-finding its own Findings on every run) — skip those.
  return tasks.filter((t) => t.kind !== "finding").map((t) => ({
    entityId: `finding:${t.id}`,
    fields: {
      title: t.title,
      severity: t.severity,
      taskKind: t.kind,
      systemRef: t.entityId,   // the AI system the finding concerns — a reference, not content
      surface: t.surface,
      raisedBy: agentId,
    },
  }));
}
