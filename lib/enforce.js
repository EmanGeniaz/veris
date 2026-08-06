/* ── Veris Enforce — the enforcement plane ──────────────────────────────
   Governance says what an agent MAY do; enforcement decides, at call time,
   what it DOES — and records both, tamper-evidently. Two primitives:

   1. Capability tokens — short-lived, per-tool-call, scoped grants. An agent
      never holds a standing key; to call a tool it must be ISSUED a token,
      and issuance runs the least-privilege boundary (capabilityCheck) first.
      A token is signed (hashed over its fields), carries a TTL and a data
      scope, and authorises exactly one tool for one agent. This is the control
      that holds as models get more capable: a smarter model is better at being
      talked out of its instructions, but no better at forging a capability
      token or reaching a destination the egress policy denies.

   2. The Tool-Call Ledger — a hash-chained record of every tool call an agent
      attempted: what it was AUTHORISED to do (the grant) versus what it
      actually DID (the call), the deterministic decision, the token, and a
      hash that cannot change without breaking every later row. This is the
      audit artifact EU AI Act Art.12 / ISO 42001 push toward and that neither
      the guardrail vendors nor the GRC vendors own: prove what your agents
      were allowed to do, and prove what they actually did.

   Pure + client-safe — reuses lib/agent-registry (the capability model). The
   seeded rows below are a representative window; live calls append through the
   gateway to the same hash chain when a database is configured. */

import { AI_AGENTS, agentById, capabilityCheck, agentPosture } from "./agent-registry";

/* Default per-tool-call token lifetime. Short-lived on purpose — a leaked
   token is worthless in seconds, and nothing is a standing grant. */
export const TOKEN_TTL_SECONDS = 90;

/* A tiny deterministic signature over the token/row fields. Not cryptographic
   strength — it stands in for the SHA-256 the gateway computes server-side, and
   keeps the chain verifiable in the pure client engine. */
function sign(parts) {
  const s = parts.join("|");
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(16).padStart(8, "0");
}

/* Decision taxonomy — the enforcement outcomes. */
export const ENFORCE_DECISION_META = {
  allow:    { label: "Allowed",     tone: "good", contained: false },
  escalate: { label: "Escalated",   tone: "warn", contained: true  }, // routed to a human — not autonomously run
  block:    { label: "Blocked",     tone: "crit", contained: true  }, // out-of-scope / ungranted — least-privilege boundary
  egress:   { label: "Egress-deny", tone: "crit", contained: true  }, // destination the egress policy refuses
  mask:     { label: "Masked",      tone: "info", contained: false }, // ran, but sensitive data redacted at the boundary
};

/* Issue a capability token for one agent + tool. Runs the least-privilege
   boundary first; a denied call yields a refusal, never a token. Deterministic
   (caller passes the clock) so the same issuance is reproducible SSR/client. */
export function issueToken(agentId, toolName, scope, nowIso = "now", ttl = TOKEN_TTL_SECONDS) {
  const chk = capabilityCheck(agentId, toolName);
  const a = agentById(agentId);
  const base = { agent: agentId, agentName: a ? a.name : agentId, tool: toolName, scope: scope || (a ? a.dataScopes.join(", ") : ""), decision: chk.decision, control: chk.control || "Least-privilege boundary", reason: chk.reason };
  if (!chk.allowed) {
    // No token minted — the call is refused (blocked) or gated to a human (escalate).
    return { ...base, issued: false, decision: chk.decision === "escalate" ? "escalate" : "block", token: null };
  }
  const id = "CT-" + sign([agentId, toolName, nowIso]).slice(0, 6).toUpperCase();
  const sig = sign([id, agentId, toolName, base.scope, nowIso, String(ttl)]);
  return { ...base, issued: true, decision: "allow", token: { id, agent: agentId, tool: toolName, scope: base.scope, issuedAt: nowIso, ttl, sig } };
}

/* ── The Tool-Call Ledger — seeded, hash-chained window ──
   Each row is one attempted tool call. `authorized` is what the agent's grant
   permitted (from capabilityCheck); `decision` is what enforcement did. A row
   where an agent reached for a tool it does not hold, and was Blocked, is the
   containment win — a successful prompt-injection could not reach money, data,
   or the internet. */
const RAW = [
  { ts: "2026-08-06 09:02:11Z", agent: "agent-crc",    tool: "read_kb",            decision: "allow",    scope: "KB articles",        note: "Grounded answer from the knowledge base" },
  { ts: "2026-08-06 09:02:12Z", agent: "agent-crc",    tool: "draft_response",     decision: "mask",     scope: "CRM tickets",        note: "PII masked at the boundary before the model saw it" },
  { ts: "2026-08-06 09:04:48Z", agent: "agent-crc",    tool: "send_customer_email",decision: "block",    scope: "—",                  note: "Injection tried to exfiltrate via email — tool not in grant, blocked" },
  { ts: "2026-08-06 09:07:31Z", agent: "agent-credit", tool: "read_bureau",        decision: "allow",    scope: "Bureau data",        note: "Read bureau record under CTRL-GRC-044" },
  { ts: "2026-08-06 09:07:33Z", agent: "agent-credit", tool: "score_application",  decision: "allow",    scope: "Applications",       note: "Risk score computed" },
  { ts: "2026-08-06 09:07:34Z", agent: "agent-credit", tool: "issue_decision",     decision: "escalate", scope: "Applications",       note: "Adverse decision — routed to human approval (Art.22)" },
  { ts: "2026-08-06 09:11:02Z", agent: "agent-doc",    tool: "external_web_fetch", decision: "egress",   scope: "Open web",           note: "Fetch to an untrusted host — egress policy denied (SSRF class)" },
  { ts: "2026-08-06 09:15:20Z", agent: "agent-close",  tool: "reconcile",          decision: "allow",    scope: "Reconciliations",    note: "Accounts reconciled" },
  { ts: "2026-08-06 09:15:59Z", agent: "agent-close",  tool: "post_journal",       decision: "escalate", scope: "Ledger",             note: "GL post — SOX dual approval, gated to a human" },
  { ts: "2026-08-06 09:19:44Z", agent: "agent-fraud",  tool: "flag_transaction",   decision: "allow",    scope: "Transaction stream", note: "Suspicious transaction flagged" },
  { ts: "2026-08-06 09:20:03Z", agent: "agent-fraud",  tool: "block_account",      decision: "escalate", scope: "Transaction stream", note: "Account freeze — high-stakes, gated to a human" },
  { ts: "2026-08-06 09:24:17Z", agent: "agent-crc",    tool: "write_ledger",       decision: "block",    scope: "—",                  note: "Tool not in this agent's set — denied by default (least privilege)" },
];

/* Build the chain: each row carries the authorised-vs-actual reconciliation,
   a per-call token id, and prevHash/hash so tampering with any row breaks all
   later rows. */
export const TOOLCALL_LEDGER = (() => {
  let prev = "genesis";
  return RAW.map((r, i) => {
    const chk = capabilityCheck(r.agent, r.tool);
    const a = agentById(r.agent);
    const tokenId = r.decision === "allow" || r.decision === "mask" ? "CT-" + sign([r.agent, r.tool, r.ts]).slice(0, 6).toUpperCase() : null;
    const hash = sign([prev, r.agent, r.tool, r.decision, r.ts]);
    const row = {
      seq: i + 1,
      id: "TC-" + String(1041 + i),
      ts: r.ts,
      agent: r.agent,
      agentName: a ? a.name : r.agent,
      tool: r.tool,
      action: a ? (a.tools.find(t => t.name === r.tool)?.action || r.tool) : r.tool,
      decision: r.decision,
      authorized: chk.allowed,              // what the grant permitted
      scope: r.scope,
      token: tokenId,
      control: chk.control || "Least-privilege boundary",
      risk: a ? (a.tools.find(t => t.name === r.tool)?.risk || "—") : "—",
      note: r.note,
      prevHash: prev,
      hash,
    };
    prev = hash;
    return row;
  });
})();

/* The chain is intact iff every row's prevHash equals the previous row's hash
   and each hash recomputes. Genuine tamper-evidence, checked in the client. */
export function ledgerIntact(rows = TOOLCALL_LEDGER) {
  let prev = "genesis";
  for (const r of rows) {
    const expected = sign([prev, r.agent, r.tool, r.decision, r.ts]);
    if (r.prevHash !== prev || r.hash !== expected) return false;
    prev = r.hash;
  }
  return true;
}

export function enforceStats(rows = TOOLCALL_LEDGER) {
  const by = d => rows.filter(r => r.decision === d).length;
  const contained = rows.filter(r => ENFORCE_DECISION_META[r.decision]?.contained).length;
  const total = rows.length;
  // A blocked/egress call against an ungranted tool is a prevented breach.
  const preventedBreaches = rows.filter(r => (r.decision === "block" || r.decision === "egress") && !r.authorized).length;
  const posture = agentPosture();
  return {
    total,
    allowed: by("allow") + by("mask"),
    escalated: by("escalate"),
    blocked: by("block"),
    egressDenied: by("egress"),
    contained,
    containmentRate: total ? Math.round((contained / total) * 100) : 0,
    preventedBreaches,
    intact: ledgerIntact(rows),
    agentsGoverned: posture.agents,
    leastPrivilegeIndex: posture.index,
    overPrivileged: posture.overPrivileged.length,
  };
}
