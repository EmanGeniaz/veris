/* ── Veris Enforce · Concurrency store (pluggable) ───────────────────────
   The runtime guardrail's concurrency + rate + action-stream state used to live
   in a process-local map, so the in-flight cap was enforced PER serverless
   instance, not globally per session. This module puts that state behind a tiny
   store interface so the exact same admission logic can run against:

     • the process-global store   — the per-instance default (a warm instance
                                    reuses it across module reloads),
     • an injected shared backing  — one Map that several workers/threads share,
                                    which makes the cap GLOBAL across them, and
     • a networked adapter         — Redis / Postgres implementing the same
                                    Map-like get/set/delete, for a true global
                                    cap across serverless instances.

   The store is deliberately a Map-like of session-key → mutable state record
   ({ inFlight, calls[], recent[], latencies[] }). "Shared store" therefore just
   means "a backing that two admitters both see" — the property the global cap
   depends on, and exactly what the recurrence test exercises. Pure + client-safe
   (no server deps): the networked adapter is injected by the caller. */

/* A fresh state record for a session key. */
function freshState() {
  return { inFlight: 0, calls: [], recent: [], latencies: [] };
}

/* Wrap any Map-like backing (has get/set) as a concurrency store. Defaults to a
   private Map, so createConcurrencyStore() alone gives an isolated store. */
export function createConcurrencyStore(backing = new Map()) {
  return {
    kind: "map",
    backing,
    get(key) {
      let s = backing.get(key);
      if (!s) { s = freshState(); backing.set(key, s); }
      return s;
    },
    /* Persist a mutated record back to the backing. A local Map mutates in
       place (no-op), but a networked adapter needs the write-back, so callers
       always commit after mutating. */
    commit(key, s) { backing.set(key, s); return s; },
    delete(key) { backing.delete(key); },
    keys() { return [...backing.keys()]; },
  };
}

/* Process-global default store — on globalThis so it survives module reloads
   within a warm instance. This is the per-instance path; inject a shared or
   networked backing to make the cap global. */
const GLOBAL_BACKING = ((globalThis.__vzConcurrencyBacking ||= new Map()));
export const defaultConcurrencyStore = createConcurrencyStore(GLOBAL_BACKING);
