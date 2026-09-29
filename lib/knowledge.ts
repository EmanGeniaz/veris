/* ── Knowledge repository + retrieval (server-side) ─────────────────
   The backend for RAG: documents are ingested per tenant, stored, and
   retrieved at query time so the gateway can ground Veris's answers and
   recommendations on the org's own documents — with citations. Persisted
   in Postgres when DATABASE_URL is configured; otherwise a per-instance
   in-memory store keeps it working (still server-side, never the client).
   All retrieval/scoring runs here — nothing lives in the frontend. */

import { db, dbConfigured } from "./db";
import { guardPassages, retrievalDecision, SOURCE_TRUST_TIERS } from "@/lib/retrieval-guard";

type Doc = { id: string; tenant: string; title: string; source: string; content: string; createdAt: number };

/* In-memory fallback, on globalThis so it survives module reloads within
   a running server instance. */
const mem: Record<string, Doc[]> = ((globalThis as unknown as { __vzKnowledge?: Record<string, Doc[]> }).__vzKnowledge ||= {});

const clip = (s: unknown, n = 200_000) => String(s ?? "").slice(0, n);

/* Split a document into scoreable passages: by paragraph, long paragraphs
   further chunked, tiny fragments dropped. */
function chunk(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .flatMap(p => (p.length > 800 ? (p.match(/[\s\S]{1,650}(?:\s|$)/g) || [p]) : [p]))
    .map(s => s.trim())
    .filter(s => s.length > 40);
}
const terms = (q: string) => [...new Set(q.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 3))];

export async function ingestDoc(tenant: string, d: { title?: string; source?: string; content: string; addedBy?: string }) {
  const rec = { title: (d.title || "Untitled document").slice(0, 200), source: (d.source || "upload").slice(0, 120), content: clip(d.content), addedBy: (d.addedBy || "").slice(0, 120) };
  if (!rec.content.trim()) throw new Error("empty document");
  if (dbConfigured()) {
    try {
      const p = db()!;
      const row = await p.knowledgeDoc.create({ data: { tenant, ...rec } });
      return { id: row.id, title: rec.title, source: rec.source, chars: rec.content.length };
    } catch { /* fall through to memory */ }
  }
  const id = "kd-" + Math.random().toString(36).slice(2, 10);
  (mem[tenant] ||= []).unshift({ id, tenant, ...rec, createdAt: Date.now() });
  return { id, title: rec.title, source: rec.source, chars: rec.content.length };
}

async function getDocs(tenant: string): Promise<Doc[]> {
  if (dbConfigured()) {
    try {
      const p = db()!;
      const rows = await p.knowledgeDoc.findMany({ where: { tenant }, orderBy: { createdAt: "desc" }, take: 200 });
      return rows.map(r => ({ id: r.id, tenant, title: r.title, source: r.source, content: r.content, createdAt: r.createdAt.getTime() }));
    } catch { /* fall through */ }
  }
  return mem[tenant] || [];
}

export async function listDocs(tenant: string) {
  return (await getDocs(tenant)).map(d => ({ id: d.id, title: d.title, source: d.source, chars: d.content.length, createdAt: d.createdAt }));
}

/* Retrieve the top-k passages most relevant to a query, each with the
   document it came from so the answer can cite it. Keyword/overlap scoring
   — runs fully in-tenant, no external embedding calls. */
export type RetrievedPassage = { docId: string; title: string; source: string; snippet: string; score: number; createdAt?: number; trust?: string; trustScore?: number; ageDays?: number; stale?: boolean; masked?: boolean };

export async function retrieve(tenant: string, query: string, k = 4): Promise<RetrievedPassage[]> {
  const t = terms(query);
  if (!t.length) return [];
  const docs = await getDocs(tenant);
  const scored: RetrievedPassage[] = [];
  for (const d of docs) {
    for (const c of chunk(d.content)) {
      const cl = c.toLowerCase();
      const score = t.reduce((n, term) => n + (cl.includes(term) ? 1 : 0), 0);
      if (score > 0) scored.push({ docId: d.id, title: d.title, source: d.source, snippet: c.slice(0, 340), score, createdAt: d.createdAt });
    }
  }
  /* Retrieval guardrails — before a passage may ground the answer: drop
     untrusted/blocked sources, reject junk chunks and DLP-mask/-block sensitive
     ones, and re-rank by relevance × source trust × recency. */
  const guarded = guardPassages(scored, { nowMs: Date.now() }) as { passages: RetrievedPassage[] };
  return guarded.passages.slice(0, k);
}

/* The governance decision on one retrieval candidate, for the audit chain and
   the live Retrieval Guardrails surface. Governance metadata only — the
   document identifier and the guard's verdict, NEVER the passage text (a
   snippet can carry the very PII/secret the DLP step blocked). */
export type RetrievalDecisionMeta = {
  title: string; source: string; tier: string; trustScore: number;
  ageDays: number | null; stale: boolean; guardedScore: number;
  decision: string; reason: string | null; masked: boolean;
};

/* Reasons that make a dropped candidate worth recording: a real trust / DLP /
   freshness decision, not low-signal junk (too short / low signal), which is
   retrieval noise rather than a governance event. */
const SECURITY_DROP = new Set(["untrusted source", "sensitive content blocked", "expired"]);
const tierScore = (tier?: string) => (tier && SOURCE_TRUST_TIERS[tier as keyof typeof SOURCE_TRUST_TIERS]?.score) ?? 0;

/* Retrieve exactly as retrieve() does, and additionally return the guard's
   decision on each governance-relevant candidate: the admitted top-k passages
   that actually grounded the answer, plus any candidate DROPPED for a trust /
   DLP / freshness reason (the notable exfil / poison / staleness attempts kept
   out). The decisions never include passage text. */
export async function retrieveGoverned(tenant: string, query: string, k = 4): Promise<{ passages: RetrievedPassage[]; decisions: RetrievalDecisionMeta[] }> {
  const t = terms(query);
  if (!t.length) return { passages: [], decisions: [] };
  const docs = await getDocs(tenant);
  const scored: RetrievedPassage[] = [];
  for (const d of docs) {
    for (const c of chunk(d.content)) {
      const cl = c.toLowerCase();
      const score = t.reduce((n, term) => n + (cl.includes(term) ? 1 : 0), 0);
      if (score > 0) scored.push({ docId: d.id, title: d.title, source: d.source, snippet: c.slice(0, 340), score, createdAt: d.createdAt });
    }
  }
  const guarded = guardPassages(scored, { nowMs: Date.now() }) as {
    passages: Array<RetrievedPassage & { guardedScore?: number; trust?: string; trustScore?: number; ageDays?: number; stale?: boolean; masked?: boolean }>;
    dropped: Array<RetrievedPassage & { trust?: string; reason?: string }>;
  };
  const passages = guarded.passages.slice(0, k);
  const decisions: RetrievalDecisionMeta[] = [
    // What grounded the answer (the admitted top-k): admitted / masked / down-weighted.
    ...passages.map((p) => {
      const { decision } = retrievalDecision({ blocked: false, chunkOk: true, masked: !!p.masked, stale: !!p.stale });
      return {
        title: p.title, source: p.source, tier: p.trust || "unverified", trustScore: p.trustScore ?? tierScore(p.trust),
        ageDays: p.ageDays ?? null, stale: !!p.stale,
        guardedScore: p.guardedScore != null ? +Number(p.guardedScore).toFixed(2) : 0,
        decision, reason: null, masked: !!p.masked,
      };
    }),
    // What was kept out for a security / trust / freshness reason (the notable drops).
    ...guarded.dropped.filter((p) => SECURITY_DROP.has(String(p.reason))).map((p) => ({
      title: p.title, source: p.source, tier: p.trust || "unverified", trustScore: tierScore(p.trust),
      ageDays: null, stale: false, guardedScore: 0, decision: "dropped", reason: p.reason ?? null, masked: false,
    })),
  ];
  return { passages, decisions };
}
