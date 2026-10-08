/* HITL approval of a propose-agent proposal (#182 §08 step 3). The human gate:
   a propose agent only drafts; nothing it proposed takes effect until a person
   approves it here. The decision is recorded on the Article-12 chain under the
   HUMAN's identity (never the agent's) — that is what makes the approval, not the
   agent, accountable for the outcome. Rejecting closes the proposal with no
   effect. Session-bound (BL-01), baseline-compliant, honest without a DB. */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { telemetryMode } from "@/lib/telemetry-source";
import { resolveTenant } from "@/lib/tenant-guard";
import { auditAppend } from "@/lib/audit";
import { limit, parseJson, serverError } from "@/lib/api-guard";
import { agentApproveSchema } from "@/lib/api-schemas";

export async function POST(req: NextRequest) {
  const limited = await limit(req, "user", "agent-approve");
  if (limited) return limited;
  const parsed = await parseJson(req, agentApproveSchema);
  if (!parsed.ok) return parsed.res;
  const { tenant, proposalId, decision, note } = parsed.data;
  const prisma = db();
  if (!prisma) return NextResponse.json({ ok: false, enabled: false, mode: telemetryMode(false).mode });
  try {
    const { slug, identity } = await resolveTenant({ requestedTenant: tenant });
    const t = await prisma.tenant.findUnique({ where: { slug }, select: { id: true } });
    if (!t) return NextResponse.json({ ok: false, enabled: true, error: "unknown tenant" }, { status: 404 });

    const proposal = await prisma.agentProposal.findFirst({ where: { id: proposalId, tenantId: t.id } });
    if (!proposal) return NextResponse.json({ ok: false, enabled: true, error: "unknown proposal" }, { status: 404 });
    if (proposal.status !== "pending") {
      return NextResponse.json({ ok: false, enabled: true, error: `proposal already ${proposal.status}` }, { status: 409 });
    }

    // The decision is the human's — never the agent's.
    const human = identity?.email || identity?.name || "reviewer";
    const status = decision === "approve" ? "approved" : "rejected";
    await prisma.agentProposal.update({ where: { id: proposal.id }, data: { status, decidedBy: human, decidedAt: new Date() } });

    const detail = JSON.stringify({ proposalId: proposal.id, agentId: proposal.agentId, kind: proposal.kind, decision, note: note ?? "" });
    await auditAppend(prisma, t.id, `proposal:${status}`, proposal.entityId, detail, human);

    return NextResponse.json({ ok: true, enabled: true, proposalId: proposal.id, status, decidedBy: human });
  } catch (e) {
    return serverError(e, "agents.approve");
  }
}
