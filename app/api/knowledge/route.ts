/* Knowledge repository API — ingest and list documents for RAG. All
   storage and retrieval logic lives in lib/knowledge (server-side); this
   route is the thin, tenant-scoped entry point the client calls. */
import { NextRequest, NextResponse } from "next/server";
import { ingestDoc, listDocs } from "@/lib/knowledge";

export async function GET(req: NextRequest) {
  const tenant = req.nextUrl.searchParams.get("tenant") || "demo";
  try {
    return NextResponse.json({ ok: true, docs: await listDocs(tenant) });
  } catch {
    return NextResponse.json({ ok: false, docs: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { tenant = "demo", title, source, content, addedBy } = await req.json();
    if (!content || !String(content).trim()) return NextResponse.json({ ok: false, error: "content required" }, { status: 400 });
    const doc = await ingestDoc(String(tenant), { title, source, content, addedBy });
    return NextResponse.json({ ok: true, doc });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message || "ingest failed" }, { status: 500 });
  }
}
