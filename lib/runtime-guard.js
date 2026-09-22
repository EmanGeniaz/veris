/* ── Veris Enforce · Runtime Guardrails ──────────────────────────────────
   Static gates and the circuit breaker govern WHAT an agent may do; runtime
   guardrails govern HOW a session behaves as it runs — the failure modes that
   only appear in motion: an agent stuck in a tool-call loop, a burst of calls,
   too much concurrency, or a call that blows the latency budget. Enforced at
   tool-call admission time, deterministically:

     • Loop detection      — a session's recent action stream is inspected for a
                            repeated action or an A↔B cycle; a detected loop
                            halts the call before it spins.
     • Concurrency control — a per-session in-flight cap; a call over the cap is
                            throttled rather than piled on.
     • Rate limiting       — calls-per-rolling-window cap; a burst is throttled.
     • Latency tracking    — every completed call's latency is recorded; a call
                            over the SLA is flagged as a breach (a real anomaly
                            signal, not a seeded one).

   These are AGENT tool-call guardrails — admitCall() governs agent actions, not
   human chat turns, so ordinary conversation is never mistaken for a loop.
   Pure + deterministic (the caller passes the clock). In-process per-session
   state: a global cap needs shared state (Redis); this is the per-instance path. */

export const RUNTIME_POLICY = {
  latencySloMs: 8000,       // per-call latency budget
  maxConcurrent: 4,         // per-session in-flight cap
  rateWindowMs: 10_000,     // rolling rate window
  maxCallsPerWindow: 20,    // calls-per-window cap
  loopWindow: 6,            // how many recent actions to inspect
  loopRepeatThreshold: 3,   // same action ≥ this many times in the window → loop
};

export const RUNTIME_DECISION_META = {
  allow:    { label: "Allowed",     tone: "good" },
  throttle: { label: "Throttled",   tone: "warn" },
  loop:     { label: "Loop halted", tone: "crit" },
};

/* Per-session state, on globalThis so it survives module reloads within a warm
   instance. key → { inFlight, recent:[action], calls:[ts], latencies:[ms] }. */
const SESS = ((globalThis.__vzRuntime ||= {}));
function state(key) { return (SESS[key] ||= { inFlight: 0, recent: [], calls: [], latencies: [] }); }

/* Loop detection over an action stream: a repeated action past the threshold,
   or a two-step A↔B cycle. Pure — takes the actions, returns the verdict. */
export function detectLoop(actions, policy = RUNTIME_POLICY) {
  const w = (actions || []).slice(-policy.loopWindow);
  const counts = {};
  for (const a of w) counts[a] = (counts[a] || 0) + 1;
  const maxRepeat = w.length ? Math.max(...Object.values(counts)) : 0;
  if (maxRepeat >= policy.loopRepeatThreshold) {
    const action = Object.keys(counts).find(k => counts[k] === maxRepeat);
    return { loop: true, kind: "repeat", action, count: maxRepeat };
  }
  /* A↔B cycle: require three full cycles (six actions) so a legitimate
     read→draft→read→draft (two cycles) is not mistaken for a runaway loop. */
  if (w.length >= 6) {
    const t = w.slice(-6);
    const cycle = t[0] !== t[1] && t[0] === t[2] && t[2] === t[4] && t[1] === t[3] && t[3] === t[5];
    if (cycle) return { loop: true, kind: "cycle", action: `${t[0]} ↔ ${t[1]}`, count: 3 };
  }
  return { loop: false };
}

/* Admit an agent tool call: loop → concurrency → rate, in that order. On allow,
   records the call and increments in-flight (balance with completeCall). */
export function admitCall(key, action, nowMs = Date.now(), policy = RUNTIME_POLICY) {
  const s = state(key);
  s.calls = s.calls.filter(ts => nowMs - ts < policy.rateWindowMs);
  const rate = s.calls.length;
  const loop = detectLoop([...s.recent, action], policy);
  if (loop.loop) return { decision: "loop", reason: `Loop detected (${loop.kind}: ${loop.action} ×${loop.count})`, rate, inFlight: s.inFlight, loop };
  if (s.inFlight >= policy.maxConcurrent) return { decision: "throttle", reason: `Concurrency cap ${policy.maxConcurrent} reached (${s.inFlight} in flight)`, rate, inFlight: s.inFlight };
  if (rate >= policy.maxCallsPerWindow) return { decision: "throttle", reason: `Rate ${rate}/${policy.maxCallsPerWindow} in ${policy.rateWindowMs / 1000}s`, rate, inFlight: s.inFlight };
  s.inFlight++;
  s.calls.push(nowMs);
  s.recent.push(action);
  if (s.recent.length > 50) s.recent.shift();
  return { decision: "allow", reason: null, rate: rate + 1, inFlight: s.inFlight };
}

/* Complete an admitted call: decrement in-flight, record latency, flag SLA
   breach. */
export function completeCall(key, latencyMs, policy = RUNTIME_POLICY) {
  const s = state(key);
  s.inFlight = Math.max(0, s.inFlight - 1);
  s.latencies.push(latencyMs);
  if (s.latencies.length > 200) s.latencies.shift();
  return { latencyMs, breach: latencyMs > policy.latencySloMs, sloMs: policy.latencySloMs };
}

/* Latency-only record for a non-admitted request (e.g. plain chat) — tracks
   latency without touching the in-flight counter. */
export function recordLatency(key, latencyMs, policy = RUNTIME_POLICY) {
  const s = state(key);
  s.latencies.push(latencyMs);
  if (s.latencies.length > 200) s.latencies.shift();
  return { latencyMs, breach: latencyMs > policy.latencySloMs, sloMs: policy.latencySloMs };
}

export function pctl(arr, p) {
  if (!arr || !arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
}

/* ── Seeded window — the runtime-guard record for the Enforce surface ──
   Representative sessions showing every decision. The logic above is real and
   runs live at admission; this window stands in for live sessions. */
export const RUNTIME_SEED = [
  { id: "RSES-01", agent: "agent-crc",    actions: ["read_kb", "draft_response", "read_kb", "draft_response"], latenciesMs: [420, 1180, 510, 1320], inFlight: 1 },
  { id: "RSES-02", agent: "agent-credit", actions: ["score_application", "score_application", "score_application"], latenciesMs: [900, 880, 910], inFlight: 1 },
  { id: "RSES-03", agent: "agent-doc",    actions: ["external_web_fetch", "summarize", "external_web_fetch", "summarize", "external_web_fetch", "summarize"], latenciesMs: [2200, 700, 2300, 720], inFlight: 2 },
  { id: "RSES-04", agent: "agent-fraud",  actions: ["flag_transaction"], latenciesMs: [9400], inFlight: 1 },
  { id: "RSES-05", agent: "agent-close",  actions: ["reconcile", "post_journal"], latenciesMs: [640, 1500], inFlight: 6 },
];

export function seededRuntimeLedger(policy = RUNTIME_POLICY) {
  return RUNTIME_SEED.map(r => {
    const loop = detectLoop(r.actions, policy);
    const rate = r.actions.length;
    const p95 = pctl(r.latenciesMs, 95);
    const sloBreach = p95 > policy.latencySloMs;
    let decision, reason = null;
    if (loop.loop) { decision = "loop"; reason = `${loop.kind}: ${loop.action} ×${loop.count}`; }
    else if (r.inFlight > policy.maxConcurrent) { decision = "throttle"; reason = `concurrency ${r.inFlight}/${policy.maxConcurrent}`; }
    else if (rate > policy.maxCallsPerWindow) { decision = "throttle"; reason = `rate ${rate}/${policy.maxCallsPerWindow}`; }
    else { decision = "allow"; }
    return { ...r, rate, p95, sloBreach, decision, reason };
  });
}

export function runtimeGuardStats(rows = seededRuntimeLedger()) {
  const by = d => rows.filter(r => r.decision === d).length;
  return {
    watched: rows.length,
    looped: by("loop"),
    throttled: by("throttle"),
    sloBreaches: rows.filter(r => r.sloBreach).length,
    p95: pctl(rows.flatMap(r => r.latenciesMs), 95),
    sloMs: RUNTIME_POLICY.latencySloMs,
  };
}
