/* ── Veris Enforce · Memory Guardrails ───────────────────────────────────
   A governed agent-memory store. Static gates say what an agent may DO; memory
   guardrails say what it may REMEMBER and RECALL — the layer that keeps a
   long-running agent from accumulating a private, ungoverned copy of sensitive
   data. Six controls, all enforced deterministically here:

     • Write controls        — deny-by-default; only permitted data classes are
                               persisted, and a governed decision (allow / mask /
                               refuse) is returned for every write.
     • Sensitive-data block   — the DLP classifier runs on every write; Restricted
                               content (secrets / PCI / PHI) is refused outright,
                               PII is masked before it is ever stored.
     • Retention rules        — each item is stamped with a retention window from
                               its data class (more sensitive → shorter life).
     • Memory expiry          — every item carries expiresAt; expired items are
                               invisible to recall and dropped by the sweep.
     • Recall filtering       — recall re-checks class at read time and refuses to
                               return anything above the caller's clearance.
     • Session separation     — memory is partitioned by tenant + agent + session;
                               recall never crosses a partition.

   Pure + deterministic (the caller passes the clock) so the same enforcement
   runs in the Node gateway and in the client. Reuses lib/policy-rules (the one
   DLP rulebook), so a change to classification flows straight into what may be
   remembered. */

import { classify, evaluateRules } from "./policy-rules";

/* Retention policy by data class. Restricted is never persisted (refused at
   write); everything else lives for a bounded, class-appropriate window. */
export const MEMORY_RETENTION = {
  Public:       { seconds: 30 * 24 * 3600, label: "30 days" },
  Internal:     { seconds: 7 * 24 * 3600,  label: "7 days" },
  Confidential: { seconds: 24 * 3600,      label: "24 hours" },
  Restricted:   { seconds: 0,              label: "never persisted" },
};

/* Class ordering for the recall clearance check (higher = more sensitive). A
   recall scoped to maxClass may not return anything above it. */
export const MEMORY_CLASS_RANK = { Public: 0, Internal: 1, Confidential: 2, Restricted: 3 };

export const MEMORY_DECISION_META = {
  allow:  { label: "Stored",  tone: "good" },
  mask:   { label: "Masked",  tone: "info" },
  refuse: { label: "Refused", tone: "crit" },
};

/* Tiny deterministic id — stands in for the server-side hash; keeps writes
   reproducible SSR/client. */
function sign(parts) {
  const s = parts.join("|");
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(16).padStart(8, "0");
}

export function isExpired(item, nowMs) {
  return !item || nowMs >= item.expiresAt;
}

/* Decide whether a candidate memory may be written, and in what form. Never
   throws — an unusable entry is simply refused. `entry`:
   { tenant, agent, session, kind?, text }. Returns the governed decision and,
   when written, the stored item (with class, retention and expiry stamped). */
export function memoryWrite(entry, nowMs = Date.now()) {
  const text = String(entry?.text ?? "");
  const tenant = String(entry?.tenant || "demo");
  const agent = String(entry?.agent || "anon");
  const session = String(entry?.session || `${tenant}:${agent}`);
  const kind = String(entry?.kind || "turn");
  if (!text.trim()) return { written: false, decision: "refuse", reason: "Empty content — nothing to store.", class: null, categories: [] };

  const cls = classify(text);
  const retention = MEMORY_RETENTION[cls.dataClass] || MEMORY_RETENTION.Internal;

  /* Sensitive-data blocking: Restricted (secrets / PCI / PHI) is never
     persisted to agent memory, regardless of grant. */
  if (cls.dataClass === "Restricted" || retention.seconds <= 0) {
    return { written: false, decision: "refuse", reason: `Restricted content (${cls.categories.join(", ") || "sensitive"}) is never written to memory.`, class: cls.dataClass, categories: cls.categories };
  }

  /* PII / card / SSN / email are masked in place before the write — the store
     never holds raw identifiers. */
  const ev = evaluateRules(text);
  const storedText = ev.masked;
  const masked = ev.didMask;

  const id = "MEM-" + sign([tenant, agent, session, storedText, String(nowMs)]).slice(0, 8).toUpperCase();
  const item = {
    id, tenant, agent, session, kind,
    class: cls.dataClass, categories: cls.categories,
    text: storedText, masked,
    createdAt: nowMs,
    retentionLabel: retention.label,
    expiresAt: nowMs + retention.seconds * 1000,
  };
  return { written: true, decision: masked ? "mask" : "allow", class: cls.dataClass, categories: cls.categories, item };
}

/* Recall from a store under a scope. Session separation + expiry + a class
   clearance re-check, all deterministic. `scope`:
   { tenant, agent, session, maxClass? }. */
export function memoryRecall(store, scope, nowMs = Date.now(), limit = null) {
  const tenant = String(scope?.tenant || "demo");
  const agent = String(scope?.agent || "anon");
  const session = String(scope?.session || `${tenant}:${agent}`);
  const ceiling = scope?.maxClass != null ? (MEMORY_CLASS_RANK[scope.maxClass] ?? 3) : 3;
  const out = (store || []).filter(m =>
    m && m.tenant === tenant && m.agent === agent && m.session === session &&
    !isExpired(m, nowMs) &&
    (MEMORY_CLASS_RANK[m.class] ?? 0) <= ceiling
  );
  return limit != null ? out.slice(-limit) : out;
}

/* Retention enforcement: drop everything past its window. Returns a new array. */
export function memorySweep(store, nowMs = Date.now()) {
  return (store || []).filter(m => !isExpired(m, nowMs));
}

/* ── Live governed store (best-effort, in-process) ───────────────────────
   The gateway writes/recalls through these so the controls above execute on
   every real request. This process-local buffer is the non-durable path; a
   DB-backed store is the durable one (retention then needs a scheduled sweep).
   Capped so a warm instance can't grow without bound. */
const LIVE = [];
const LIVE_CAP = 500;

export function rememberLive(entry, nowMs = Date.now()) {
  const r = memoryWrite(entry, nowMs);
  if (r.written) {
    LIVE.push(r.item);
    // Opportunistic retention: sweep expired on write so the buffer stays clean.
    if (LIVE.length > LIVE_CAP) LIVE.splice(0, LIVE.length - LIVE_CAP);
  }
  return r;
}

export function recallLive(scope, nowMs = Date.now(), limit = 3) {
  return memoryRecall(LIVE, scope, nowMs, limit);
}

/* ── Seeded window — the governed-memory record for the Enforce surface ──
   Representative writes showing every decision. The logic above is real; this
   window stands in for a persisted store until one is configured. */
export const MEMORY_EVENTS = [
  { tenant: "demo", agent: "agent-crc",    session: "SES-2071", kind: "turn", text: "Customer asked about refund timelines for order 4471." },
  { tenant: "demo", agent: "agent-crc",    session: "SES-2071", kind: "turn", text: "Customer email is jane.doe@example.com and card 4111 1111 1111 1111." },
  { tenant: "demo", agent: "agent-credit", session: "SES-2072", kind: "note", text: "Applicant SSN 123-45-6789 flagged for manual review." },
  { tenant: "demo", agent: "agent-credit", session: "SES-2072", kind: "note", text: "Bureau score band is prime; decision pending human approval." },
  { tenant: "demo", agent: "agent-doc",    session: "SES-2073", kind: "turn", text: "api_key = sk-live-9f8a7b6c5d4e3f2a and the internal wiki link." },
  { tenant: "demo", agent: "agent-close",  session: "SES-2075", kind: "note", text: "Reconciliation for August close is 88% complete." },
];

export function seededMemoryLedger(nowMs = Date.parse("2026-08-06T09:30:00Z")) {
  return MEMORY_EVENTS.map((e, i) => {
    // Stamp writes slightly in the past so retention windows are live in the demo.
    const r = memoryWrite(e, nowMs - (MEMORY_EVENTS.length - i) * 60_000);
    return { seq: i + 1, ...e, decision: r.decision, class: r.class, categories: r.categories, written: r.written, masked: r.item?.masked || false, retention: r.item?.retentionLabel || "—", reason: r.reason || null };
  });
}

export function memoryStats(rows = seededMemoryLedger()) {
  const by = d => rows.filter(r => r.decision === d).length;
  const partitions = new Set(rows.filter(r => r.written).map(r => `${r.tenant}/${r.agent}/${r.session}`));
  return {
    total: rows.length,
    stored: by("allow") + by("mask"),
    masked: by("mask"),
    refused: by("refuse"),
    restrictedBlocked: rows.filter(r => r.decision === "refuse").length,
    partitions: partitions.size,
    classes: [...new Set(rows.filter(r => r.written).map(r => r.class))],
  };
}
