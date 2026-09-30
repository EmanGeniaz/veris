/* Knowledge repository API — ingest and list documents for RAG. All
   storage and retrieval logic lives in lib/knowledge (server-side); this
   route is the thin, tenant-scoped entry point the client calls. */
import { NextRequest, NextResponse } from "next/server";
import { ingestDoc, listDocs } from "@/lib/knowledge";
import { resolveTenant } from "@/lib/tenant-guard";
import { limit, parseJson, serverError } from "@/lib/api-guard";
import { KNOWLEDGE_MAX_CHARS, knowledgeSchema } from "@/lib/api-schemas";

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
  const limited = await limit(req, "user", "knowledge");
  if (limited) return limited;
  /* A text "upload": size-capped before it is buffered (UTF-8 worst case is
     4 bytes/char, plus JSON overhead), plain-text only, strict schema. */
  const parsed = await parseJson(req, knowledgeSchema, { maxBytes: KNOWLEDGE_MAX_CHARS * 4 + 8192 });
  if (!parsed.ok) return parsed.res;
  const { tenant, title, source, content, addedBy } = parsed.data;
  try {
    // A signed-in user can only ingest into their own tenant (BL-01).
    const { slug } = await resolveTenant({ requestedTenant: tenant });
    const doc = await ingestDoc(slug, { title, source, content, addedBy });
    return NextResponse.json({ ok: true, doc });
  } catch (e) {
    return serverError(e, "knowledge.ingest");
  }
}
