/* Knowledge repository API — ingest and list documents for RAG. All
   storage and retrieval logic lives in lib/knowledge (server-side); this
   route is the thin, tenant-scoped entry point the client calls. */
import { NextRequest, NextResponse } from "next/server";
import { ingestDoc, listDocs } from "@/lib/knowledge";
import { resolveTenant } from "@/lib/tenant-guard";

export async function GET(req: NextRequest) {
  // Tenant is bound to the session when auth is configured — a client-supplied
  // ?tenant cannot read another tenant's documents (BL-01).
  const { slug } = await resolveTenant({ requestedTenant: req.nextUrl.searchParams.get("tenant") });
  try {
    return NextResponse.json({ ok: true, docs: await listDocs(slug) });
  } catch {
    return NextResponse.json({ ok: false, docs: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { tenant, title, source, content, addedBy } = await req.json();
    if (!content || !String(content).trim()) return NextResponse.json({ ok: false, error: "content required" }, { status: 400 });
    // A signed-in user can only ingest into their own tenant (BL-01).
    const { slug } = await resolveTenant({ requestedTenant: tenant });
    const doc = await ingestDoc(slug, { title, source, content, addedBy });
    return NextResponse.json({ ok: true, doc });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message || "ingest failed" }, { status: 500 });
  }
}
