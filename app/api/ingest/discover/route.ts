/* Discover → GenVeris ingestion endpoint (WS1 / #166). The single seam by which
   Veris Discover writes a discovered AI estate into the Evidence Fabric.

   Contract:
     • Auth — a bearer token (VE_INGEST_TOKEN / VZ_INGEST_TOKEN) authorizes the
       trusted Discover integration; without it configured the endpoint is off.
     • Enterprise-tier only, metadata-only (Secret-class rejected), known kinds —
       enforced by validateDiscoverIngest (pure, unit-tested).
     • Provenance integrity — every accepted record is stamped source="discover"
       here; a caller can never claim source="human".
     • Idempotent — fabricAppend dedupes a re-ingest of the same entity+content,
       so Discover can safely re-send.
   Best-effort per record; returns a per-record summary. Needs a database (the
   Fabric); a demo deploy without one returns 503. */
import { NextRequest, NextResponse } from "next/server";
import { limit } from "@/lib/api-guard";
import { timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { validateDiscoverIngest } from "@/lib/ingest-discover";
import { fabricAppend } from "@/lib/evidence-fabric";

const INGEST_TOKEN = process.env.VE_INGEST_TOKEN || process.env.VZ_INGEST_TOKEN || "";

function tokenOk(header: string | null): boolean {
  if (!INGEST_TOKEN) return false;
  const presented = (header || "").replace(/^Bearer\s+/i, "");
  const a = Buffer.from(presented);
  const b = Buffer.from(INGEST_TOKEN);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  // Machine endpoint (a connector pushes batches) → public-tier per-IP limit.
  const limited = await limit(req, "public", "ingest-discover");
  if (limited) return limited;
  // Auth — token must be configured AND match (constant-time).
  if (!INGEST_TOKEN) {
    return NextResponse.json({ ok: false, needsSetup: true, error: "Ingestion is not configured — set VE_INGEST_TOKEN in the deploy env." }, { status: 503 });
  }
  if (!tokenOk(req.headers.get("authorization"))) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 }); }

  const v = validateDiscoverIngest(body);
  if (!v.ok) return NextResponse.json({ ok: false, error: v.reason }, { status: v.status });

  const prisma = db();
  if (!prisma) return NextResponse.json({ ok: false, error: "database_unavailable" }, { status: 503 });

  try {
    const slug = String((body as { tenant?: unknown }).tenant || "demo");
    const t = await prisma.tenant.findUnique({ where: { slug } });
    if (!t) return NextResponse.json({ ok: false, error: "unknown_tenant" }, { status: 404 });

    let ingested = 0, deduped = 0;
    for (const rec of v.accepted) {
      // source forced to "discover" — provenance integrity; a caller cannot claim human.
      const r = await fabricAppend(prisma, t.id, {
        kind: rec.kind, entityId: rec.entityId, source: "discover", actor: "discover",
        confidence: rec.confidence, fields: rec.fields,
      });
      if (r.written) ingested++; else if (r.deduped) deduped++;
    }
    return NextResponse.json({ ok: true, tenant: slug, ingested, deduped, rejected: v.rejected });
  } catch {
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}
