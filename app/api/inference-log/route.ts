/* Live Article 12 inference log. Reads the real inference events the gateway
   appended to the audit hash chain, and re-verifies the WHOLE chain (all audit
   rows, not just inference) by recomputing each SHA-256 hash — genuine tamper-
   evidence on the tenant's own data. Returns {enabled:false} with no database,
   so the surface falls back to its seeded sample. */
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const prisma = db();
  if (!prisma) return NextResponse.json({ enabled: false });
  try {
    const tenantSlug = req.nextUrl.searchParams.get("tenant") || "demo";
    const t = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!t) return NextResponse.json({ enabled: true, events: [], chainIntact: true, total: 0 });

    // Full chain in write order — recompute and verify every hash.
    const all = await prisma.auditLog.findMany({ where: { tenantId: t.id }, orderBy: { createdAt: "asc" } });
    let prev = "genesis", chainIntact = true;
    for (const r of all) {
      const expected = createHash("sha256").update(prev + "|" + r.action + "|" + r.entity + "|" + r.detail + "|" + r.actor).digest("hex");
      if (r.hash !== expected || r.prevHash !== prev) { chainIntact = false; break; }
      prev = r.hash;
    }

    // The inference subset, newest first, mapped to the display shape.
    const inf = all.filter(r => r.action.startsWith("inference:")).slice(-50).reverse();
    const events = inf.map((r, i) => {
      let d: { agent?: string; tool?: string; dataClass?: string; tokens?: number } = {};
      try { d = JSON.parse(r.detail || "{}"); } catch { /* leave empty */ }
      return {
        seq: i + 1,
        id: r.id.slice(-6),
        ts: new Date(r.createdAt).toISOString().replace("T", " ").replace(/\.\d+Z$/, "Z"),
        model: r.entity,
        agent: d.agent || r.actor || "gateway",
        tool: d.tool || "—",
        decision: r.action.replace("inference:", ""),
        dataClass: d.dataClass || "—",
        tokens: d.tokens || 0,
        detail: "",
        prevHash: r.prevHash,
        hash: r.hash,
      };
    });

    return NextResponse.json({ enabled: true, events, chainIntact, total: inf.length });
  } catch {
    return NextResponse.json({ enabled: false });
  }
}
