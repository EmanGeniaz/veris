/* ── Veris Enforce · Circuit Breaker ─────────────────────────────────────
   Static gates say what an agent may never do. The circuit breaker adds the
   dynamic half: it watches each agent's risk signal AS a session runs and, the
   moment the signal crosses a threshold, revokes capability in real time —
   before the agent reaches a human gate. This is the continuous, adaptive
   oversight EU AI Act Art.14 asks for and that a fixed per-tool gate can't give.

   Capability tokens are short-lived (90s) and per-call, so revocation is cheap:
   the breaker adds the agent's tokens to a revocation list and the next issuance
   is refused instantly — no waiting for TTL. Every trip is written to the same
   Art.12 hash chain, with the triggering signal and the accountable owner.

   Graduated response, not a single kill-switch:
     Normal    → full grants
     Downscope → revoke non-read capabilities; agent continues read-only
     Suspend   → halt autonomous action; route the session to a human
     Halt      → terminate the session; revoke every token

   Pure + client-safe + deterministic. Reuses lib/agent-registry. */

import { AI_AGENTS, agentById } from "./agent-registry";

/* Live risk signals the gateway emits per session, each with a weight (its
   contribution to the 0–100 session risk score). */
export const SIGNALS = {
  injection: { label: "Prompt-injection attempt", weight: 35, tone: "crit" },
  egress:    { label: "Egress to untrusted host", weight: 30, tone: "crit" },
  guardrail: { label: "Guardrail violation",       weight: 18, tone: "warn" },
  sensitive: { label: "Sensitive-data volume spike", weight: 15, tone: "warn" },
  drift:     { label: "Behavioural drift (PSI)",   weight: 12, tone: "warn" },
  rate:      { label: "Tool-call rate anomaly",    weight: 10, tone: "info" },
};

/* The escalation ladder — score bands → action. Deterministic thresholds so
   the same signals always trip the same response, SSR and client. */
export const BREAKER_STATES = [
  { id: "normal",    label: "Normal",     min: 0,  tone: "good", action: "Full grants · monitoring only" },
  { id: "downscope", label: "Downscoped", min: 40, tone: "warn", action: "Non-read capabilities revoked · read-only" },
  { id: "suspend",   label: "Suspended",  min: 65, tone: "crit", action: "Autonomous action halted · routed to human" },
  { id: "halt",      label: "Halted",     min: 85, tone: "crit", action: "Session terminated · all tokens revoked" },
];
export const stateMeta = id => BREAKER_STATES.find(s => s.id === id) || BREAKER_STATES[0];
export function stateForScore(score) {
  let s = BREAKER_STATES[0];
  for (const b of BREAKER_STATES) if (score >= b.min) s = b;
  return s;
}

/* Which capabilities the breaker pulls at a given state. Downscope keeps reads,
   revokes everything else; suspend/halt revoke every granted capability. */
function revokedCaps(agent, stateId) {
  const granted = (agent?.tools || []).filter(t => t.granted);
  if (stateId === "normal") return [];
  if (stateId === "downscope") return granted.filter(t => !/^read/i.test(t.name)).map(t => t.name);
  return granted.map(t => t.name);
}

/* Tiny deterministic hash so each trip carries a ledger reference on the same
   chain the Article 12 log reads. */
function sign(parts) { let h = 5381; const s = parts.join("|"); for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h.toString(16).padStart(8, "0"); }

/* Live sessions the breaker is watching. `signals` are the risk events seen so
   far this session; the score, state and action are all COMPUTED from them. */
const RAW_SESSIONS = [
  { id: "SES-2071", agent: "agent-doc",    started: "09:41:12Z", signals: ["injection", "egress"] },
  { id: "SES-2072", agent: "agent-credit", started: "09:44:03Z", signals: ["sensitive", "drift", "guardrail"] },
  { id: "SES-2073", agent: "agent-fraud",  started: "09:46:55Z", signals: ["injection", "egress", "sensitive", "guardrail"] },
  { id: "SES-2074", agent: "agent-crc",    started: "09:48:20Z", signals: ["guardrail", "rate"] },
  { id: "SES-2075", agent: "agent-close",  started: "09:50:31Z", signals: ["drift"] },
];

export function breakerSessions() {
  return RAW_SESSIONS.map(r => {
    const agent = agentById(r.agent);
    const score = Math.min(100, r.signals.reduce((s, k) => s + (SIGNALS[k]?.weight || 0), 0));
    const state = stateForScore(score);
    const revoked = revokedCaps(agent, state.id);
    // The signal that pushed it over the line = highest-weight signal present.
    const trigger = [...r.signals].sort((a, b) => (SIGNALS[b]?.weight || 0) - (SIGNALS[a]?.weight || 0))[0];
    const acted = state.id !== "normal";
    return {
      ...r,
      agentName: agent ? agent.name : r.agent,
      owner: agent ? agent.owner : "—",
      score, state: state.id, stateLabel: state.label, tone: state.tone, action: state.action,
      trigger, triggerLabel: SIGNALS[trigger]?.label || trigger,
      revoked, tokensRevoked: revoked.length,
      // Suspend/halt route to a human; downscope keeps running, narrowed.
      humanGate: state.id === "suspend" || state.id === "halt",
      ledgerRef: acted ? "TC-" + sign([r.id, r.agent, state.id, r.started]).slice(0, 6).toUpperCase() : null,
      acted,
    };
  });
}

export function breakerStats() {
  const rows = breakerSessions();
  const by = id => rows.filter(r => r.state === id).length;
  return {
    watched: rows.length,
    normal: by("normal"),
    downscoped: by("downscope"),
    suspended: by("suspend"),
    halted: by("halt"),
    acted: rows.filter(r => r.acted).length,
    tokensRevoked: rows.reduce((n, r) => n + r.tokensRevoked, 0),
    routedToHuman: rows.filter(r => r.humanGate).length,
    // All trips resolve inside the short token TTL — revocation beats the gate.
    ttlSeconds: 90,
  };
}
