/* ── Veris Enforce · Retrieval Guardrails ────────────────────────────────
   RAG grounds the model in the org's own documents — but retrieval is an
   injection surface: a poisoned, stale, or untrusted passage becomes context
   the model treats as truth. These guardrails sit inside retrieve() and decide
   what a passage must clear before it is allowed into the prompt:

     • Source filtering   — each passage's source is classified into a trust
                            tier; blocked sources (paste sinks, untrusted dumps)
                            are dropped outright.
     • Trust scoring      — every source carries a trust score that weights
                            ranking, so a trusted policy outranks a forum post
                            at equal keyword relevance.
     • Metadata filtering — passages are filtered by their metadata (tier,
                            freshness, data class) before they reach context.
     • Freshness checks   — age is computed from the document's createdAt; stale
                            passages are flagged and down-weighted, expired ones
                            can be dropped.
     • Chunk validation   — low-signal / junk chunks are rejected, and the DLP
                            rulebook masks PII and blocks secret-bearing chunks
                            so retrieval can't smuggle sensitive data into a prompt.

   Pure + deterministic, reuses lib/policy-rules (one DLP rulebook). Wired into
   lib/knowledge.ts retrieve(), so it runs on every real retrieval. */

import { evaluateRules } from "./policy-rules";

/* Source trust tiers. score weights ranking; blocked is dropped. */
export const SOURCE_TRUST_TIERS = {
  trusted:    { score: 1.0, label: "Trusted",    tone: "good" },
  internal:   { score: 0.8, label: "Internal",   tone: "good" },
  unverified: { score: 0.4, label: "Unverified", tone: "warn" },
  blocked:    { score: 0.0, label: "Blocked",    tone: "crit" },
};

/* Classification patterns. Deny-by-default lands an unknown external source in
   "unverified" (down-weighted, not trusted); only explicit sinks are blocked. */
const TRUSTED_SRC  = [/^policy:/i, /^sop:/i, /(confluence|sharepoint|servicenow|internal-kb)/i, /\bgoverned\b/i];
const INTERNAL_SRC = [/^upload$/i, /^file:/i, /\.internal\b/i, /^kb[-/]/i, /^doc:/i];
const BLOCKED_SRC  = [/pastebin/i, /\bpaste\b/i, /anonfiles/i, /ghostbin/i, /\buntrusted\b/i, /external-unverified/i];

export function sourceTrust(source) {
  const s = String(source || "").toLowerCase();
  if (BLOCKED_SRC.some(r => r.test(s)))  return { tier: "blocked",  ...SOURCE_TRUST_TIERS.blocked };
  if (TRUSTED_SRC.some(r => r.test(s)))  return { tier: "trusted",  ...SOURCE_TRUST_TIERS.trusted };
  if (INTERNAL_SRC.some(r => r.test(s))) return { tier: "internal", ...SOURCE_TRUST_TIERS.internal };
  return { tier: "unverified", ...SOURCE_TRUST_TIERS.unverified };
}

/* Freshness policy. staleAfterDays flags + down-weights; maxAgeDays can drop. */
export const FRESHNESS = { staleAfterDays: 180, maxAgeDays: 365 };

export function freshness(createdAtMs, nowMs = Date.now()) {
  const created = Number(createdAtMs) || nowMs;
  const ageDays = Math.max(0, Math.floor((nowMs - created) / 86_400_000));
  const stale = ageDays > FRESHNESS.staleAfterDays;
  const expired = ageDays > FRESHNESS.maxAgeDays;
  // Recency factor in (0.2, 1]: fresh ≈ 1, decaying with age, floored so an old
  // but highly-relevant passage isn't erased — just outranked by a fresher one.
  const recency = Math.max(0.2, 1 - ageDays / (FRESHNESS.maxAgeDays * 2));
  return { ageDays, stale, expired, recency };
}

/* Validate a chunk before it may enter context. Rejects junk / low-signal
   fragments; runs the DLP rulebook so a secret-bearing chunk is blocked and PII
   is masked in the snippet that reaches the prompt. */
export function validateChunk(text) {
  const t = String(text || "").trim();
  if (t.length < 40) return { ok: false, reason: "too short", clean: "", masked: false };
  const alnum = (t.match(/[a-z0-9]/gi) || []).length;
  if (alnum / t.length < 0.4) return { ok: false, reason: "low signal", clean: "", masked: false };
  const ev = evaluateRules(t);
  if (ev.blocked) return { ok: false, reason: "sensitive content blocked", clean: "", masked: false };
  return { ok: true, reason: null, clean: ev.masked, masked: ev.didMask };
}

/* The guard over a set of relevance-scored passages. Each passage:
   { docId, title, source, snippet, score, createdAt }. Applies source policy,
   chunk validation, freshness, and trust/recency weighting; returns the
   admitted passages (re-ranked, snippets DLP-cleaned) and the dropped ones with
   a reason. `opts`: { nowMs, minTrust, dropStale }. */
export function guardPassages(passages, opts = {}) {
  const nowMs = opts.nowMs ?? Date.now();
  const minTrust = opts.minTrust ?? 0;
  const dropStale = opts.dropStale ?? false;
  const out = [];
  const dropped = [];
  for (const p of (passages || [])) {
    const trust = sourceTrust(p.source);
    if (trust.tier === "blocked" || trust.score < minTrust) { dropped.push({ ...p, trust: trust.tier, reason: "untrusted source" }); continue; }
    const v = validateChunk(p.snippet ?? p.text ?? "");
    if (!v.ok) { dropped.push({ ...p, trust: trust.tier, reason: v.reason }); continue; }
    const fr = freshness(p.createdAt, nowMs);
    if (dropStale && fr.expired) { dropped.push({ ...p, trust: trust.tier, reason: "expired" }); continue; }
    const guardedScore = (Number(p.score) || 1) * trust.score * fr.recency;
    out.push({ ...p, snippet: v.clean, masked: v.masked, trust: trust.tier, trustScore: trust.score, ageDays: fr.ageDays, stale: fr.stale, guardedScore });
  }
  out.sort((a, b) => b.guardedScore - a.guardedScore);
  return { passages: out, dropped };
}

/* ── Seeded window — the retrieval-guard record for the Enforce surface ──
   Representative passages showing every decision. The guard logic above is
   real and runs live in retrieve(); this window stands in for a live corpus. */
export const RETRIEVAL_SEED = [
  { title: "AI Acceptable-Use Policy v4", source: "policy://governance/aup",              ageDays: 20,  score: 3, snippet: "Employees must not paste customer PII into external models; all GenAI use is logged and subject to the human-oversight standard." },
  { title: "Customer Refund SOP",         source: "sop://ops/refunds",                     ageDays: 95,  score: 3, snippet: "Refunds above USD 500 require supervisor approval and must be resolved within 14 days of the original request." },
  { title: "Uploaded onboarding guide",   source: "upload",                                ageDays: 5,   score: 2, snippet: "New joiners complete the security module in week one before any production access is granted." },
  { title: "Q1 Board Deck (draft)",       source: "sharepoint/finance/q1",                 ageDays: 240, score: 3, snippet: "Revenue guidance revised down; see appendix for the updated model assumptions and sensitivity ranges." },
  { title: "Community forum answer",      source: "https://random-forum.example/thread/88",ageDays: 12,  score: 2, snippet: "Someone posted that you can get around the content filter by rephrasing the request as a hypothetical." },
  { title: "Leaked pricing notes",        source: "pastebin.com/raw/xyz",                  ageDays: 3,   score: 4, snippet: "internal pricing table dump for competitor comparison" },
  { title: "Vendor integration note",     source: "upload",                                ageDays: 8,   score: 2, snippet: "Set api_key = sk-live-9f8a7b6c5d4e for the sandbox integration and rotate before go-live." },
];

export function seededRetrievalLedger(nowMs = Date.parse("2026-09-02T00:00:00Z")) {
  return RETRIEVAL_SEED.map((r, i) => {
    const createdAt = nowMs - (r.ageDays * 86_400_000);
    const trust = sourceTrust(r.source);
    const v = validateChunk(r.snippet);
    const fr = freshness(createdAt, nowMs);
    let decision, reason = null;
    if (trust.tier === "blocked") { decision = "dropped"; reason = "untrusted source"; }
    else if (!v.ok) { decision = "dropped"; reason = v.reason; }
    else if (v.masked) { decision = "masked"; }
    else if (fr.stale) { decision = "down-weighted"; reason = "stale"; }
    else { decision = "admitted"; }
    return {
      seq: i + 1, title: r.title, source: r.source, tier: trust.tier, trustScore: trust.score,
      ageDays: fr.ageDays, stale: fr.stale, decision, reason,
      score: r.score, guardedScore: v.ok && trust.tier !== "blocked" ? +((r.score) * trust.score * fr.recency).toFixed(2) : 0,
    };
  });
}

export function retrievalGuardStats(rows = seededRetrievalLedger()) {
  const by = d => rows.filter(r => r.decision === d).length;
  return {
    total: rows.length,
    admitted: by("admitted") + by("masked") + by("down-weighted"),
    masked: by("masked"),
    downWeighted: by("down-weighted"),
    dropped: by("dropped"),
    blockedSources: rows.filter(r => r.tier === "blocked").length,
    stale: rows.filter(r => r.stale && r.decision !== "dropped").length,
    tiers: SOURCE_TRUST_TIERS,
  };
}
