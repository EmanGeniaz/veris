/* EU AI Act Article 12 — automatic per-inference logging. Every gateway call
   emits a structured, machine-readable event appended to the tamper-evident
   audit hash chain (lib/audit.ts, SHA-256): what ran, when, the policy
   decision, data class, tokens, and a hash that cannot change without breaking
   every later row. This is the record an Art.12 audit reads. The rows below are
   a representative sample; live events append through the gateway when a
   database is configured (see app/api/gateway/chat/route.ts). Pure + client-
   safe — no database imports (the server append lives in the gateway). */

export const INFERENCE_FIELDS = ["ts", "model", "agent", "tool", "decision", "dataClass", "tokens", "cost", "hash"];

export const INFERENCE_EVENTS = [
  { seq: 1, id: "IL-0001", ts: "2026-08-05 09:14:08Z", model: "claude-sonnet-5", agent: "agent-crc",    tool: "read_kb",             decision: "allow",    dataClass: "Internal",     tokensIn: 120, tokensOut: 0,   cost: "$0.001", masked: false, detail: "Granted capability · CTRL-AI-014",             prevHash: "genesis", hash: "a19f3c" },
  { seq: 2, id: "IL-0002", ts: "2026-08-05 09:14:09Z", model: "claude-sonnet-5", agent: "agent-crc",    tool: "draft_response",      decision: "mask",     dataClass: "Confidential", tokensIn: 412, tokensOut: 188, cost: "$0.004", masked: true,  detail: "PII masked at ingress before the model call",  prevHash: "a19f3c",  hash: "7c2e10" },
  { seq: 3, id: "IL-0003", ts: "2026-08-05 09:15:41Z", model: "claude-sonnet-5", agent: "agent-crc",    tool: "draft_response",      decision: "block",    dataClass: "Restricted",   tokensIn: 96,  tokensOut: 0,   cost: "$0.000", masked: false, detail: "Prompt-injection detector — request refused",  prevHash: "7c2e10",  hash: "b33d92" },
  { seq: 4, id: "IL-0004", ts: "2026-08-05 09:22:03Z", model: "claude-sonnet-5", agent: "agent-credit", tool: "score_application",   decision: "allow",    dataClass: "Confidential", tokensIn: 640, tokensOut: 210, cost: "$0.007", masked: false, detail: "Granted capability · CTRL-AI-001",             prevHash: "b33d92",  hash: "0f81aa" },
  { seq: 5, id: "IL-0005", ts: "2026-08-05 09:22:04Z", model: "claude-sonnet-5", agent: "agent-credit", tool: "issue_decision",      decision: "escalate", dataClass: "Confidential", tokensIn: 0,   tokensOut: 0,   cost: "$0.000", masked: false, detail: "High-stakes — routed to human approval (Art.22)", prevHash: "0f81aa", hash: "c47e55" },
  { seq: 6, id: "IL-0006", ts: "2026-08-05 09:31:17Z", model: "claude-sonnet-5", agent: "agent-close",  tool: "draft_journal",       decision: "allow",    dataClass: "Internal",     tokensIn: 305, tokensOut: 142, cost: "$0.003", masked: false, detail: "Granted capability · CTRL-AUD-019",             prevHash: "c47e55",  hash: "9a2b7f" },
  { seq: 7, id: "IL-0007", ts: "2026-08-05 09:40:52Z", model: "claude-sonnet-5", agent: "agent-doc",    tool: "external_web_fetch",  decision: "block",    dataClass: "Internal",     tokensIn: 58,  tokensOut: 0,   cost: "$0.000", masked: false, detail: "Egress control — untrusted external fetch denied", prevHash: "9a2b7f", hash: "e61c04" },
  { seq: 8, id: "IL-0008", ts: "2026-08-05 09:48:29Z", model: "claude-sonnet-5", agent: "agent-fraud",  tool: "flag_transaction",    decision: "allow",    dataClass: "Confidential", tokensIn: 210, tokensOut: 74,  cost: "$0.002", masked: false, detail: "Granted capability · CTRL-GRC-044",             prevHash: "e61c04",  hash: "5d90b8" },
];

export const INF_DECISION_META = {
  allow:    { label: "Allowed",   tone: "good" },
  mask:     { label: "Masked",    tone: "info" },
  escalate: { label: "Escalated", tone: "warn" },
  block:    { label: "Blocked",   tone: "crit" },
};

/* The chain is intact iff every row's prevHash equals the previous row's hash. */
export function chainIntact(events = INFERENCE_EVENTS) {
  for (let i = 0; i < events.length; i++) {
    const expected = i === 0 ? "genesis" : events[i - 1].hash;
    if (events[i].prevHash !== expected) return false;
  }
  return true;
}

/* Tokens per event — seeded rows carry tokensIn/tokensOut; live rows carry a
   single tokens total. */
export const eventTokens = e => (e.tokens != null ? e.tokens : (e.tokensIn || 0) + (e.tokensOut || 0));

/* Works on the seeded sample or a live event set; `intact` overrides the
   self-contained chain check (live rows are verified against the full chain
   server-side). */
export function inferenceStats(events = INFERENCE_EVENTS, intact) {
  const by = d => events.filter(x => x.decision === d).length;
  return {
    total: events.length,
    allow: by("allow"),
    masked: by("mask"),
    escalated: by("escalate"),
    blocked: by("block"),
    tokens: events.reduce((n, x) => n + eventTokens(x), 0),
    intact: intact != null ? intact : chainIntact(events),
  };
}
