/* Immutable audit trail: every mutation appends a hash-chained record.
   Tampering with any historical row breaks every hash after it. */
import { createHash } from "node:crypto";
import type { PrismaClient } from "@prisma/client";

export async function auditAppend(prisma: PrismaClient, tenantId: string, action: string, entity: string, detail: string, actor: string) {
  const prev = await prisma.auditLog.findFirst({ where: { tenantId }, orderBy: { createdAt: "desc" } });
  const prevHash = prev?.hash ?? "genesis";
  const hash = createHash("sha256").update(prevHash + "|" + action + "|" + entity + "|" + detail + "|" + actor).digest("hex");
  await prisma.auditLog.create({ data: { tenantId, action, entity, detail, actor, prevHash, hash } });
}
