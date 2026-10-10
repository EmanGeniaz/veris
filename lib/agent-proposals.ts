/* ── Propose-agent proposals (#182 §08 step 3) ───────────────────────────
   A PROPOSE agent never applies a change; it drafts a proposal for a human to
   approve. This maps the open findings that need remediation (the "finding"-kind
   governance tasks) into remediation proposal specs. Pure, metadata-only.

   Complement to step 2: the monitor turns gaps into Findings (observations,
   autonomous, read-only to the outside); the propose agent drafts a remediation
   ACTION for each open Finding and parks it behind human approval — nothing is
   applied until a person says so. Stable entityId (`remediation:<findingId>`)
   makes proposing idempotent, so re-running never duplicates a pending draft. */
import type { WorkspaceTask } from "./workspace-tasks";

export interface ProposalSpec {
  entityId: string;                 // stable, idempotent: remediation:<finding entityId>
  kind: string;                     // "remediation"
  title: string;
  fields: Record<string, unknown>;  // governance metadata only
}

export function proposalSpecsFromTasks(tasks: WorkspaceTask[], agentId: string): ProposalSpec[] {
  // Only open findings need a remediation proposal. (Assessment/review gaps are
  // handled by the monitor + the task inbox; this agent proposes the fix action.)
  return tasks.filter((t) => t.kind === "finding").map((t) => ({
    entityId: `remediation:${t.entityId}`,
    kind: "remediation",
    title: `Remediate — ${t.title.replace(/^Resolve finding — /, "")}`,
    fields: {
      severity: t.severity,
      findingRef: t.entityId,   // reference to the Finding this remediates — not content
      proposedBy: agentId,
    },
  }));
}
