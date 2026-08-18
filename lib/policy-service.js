/* ── Policy-as-a-Service ──────────────────────────────────────────────
   The data behind the PaaS surface. VerisZone's policy engine is exposed
   as a stateless verdict service (POST /api/policy/inspect → allow | mask |
   block) so ANY channel — the in-app Gateway, a browser extension, a CASB /
   forward proxy, a CI/CD guardrail — enforces the SAME rulebook, including
   the "shadow AI" traffic that never touches the in-app gateway.

   Pure data + selectors. Deterministic, client-safe (no Date.now /
   Math.random at module load). */

/* The one contract every client speaks. */
export const PAAS_ENDPOINT = {
  method: "POST",
  path: "/api/policy/inspect",
  auth: "x-veris-key",
  returns: ["allow", "mask", "block"],
  request: `{ "text": "…", "context": "claude.ai", "actor": "user@corp", "channel": "browser-ext" }`,
  response: `{ "decision": "mask", "dataClass": "Confidential",\n  "categories": ["PII"], "redacted": "…", "reason": "PII redaction" }`,
};

/* Channels calling the service (this window). `calls` are inspections routed
   through each channel; `contained` = mask+block verdicts it enforced. */
export const PAAS_CLIENTS = [
  { id: "gateway",   name: "In-app AI Gateway",        type: "First-party",  status: "Live",     calls: 4820, contained: 612, note: "Every governed model call, inline.", key: "gateway" },
  { id: "browser",   name: "Browser extension fleet",  type: "Shadow-AI",    status: "Live",     calls: 1364, contained: 289, note: "Paste / upload guard on claude.ai, ChatGPT, Gemini, Copilot.", key: "casb-fleet" },
  { id: "casb",      name: "CASB / forward proxy",     type: "Network",      status: "Live",     calls: 902,  contained: 143, note: "Egress inspection at the network edge.", key: "casb-fleet" },
  { id: "cicd",      name: "CI/CD content guardrail",  type: "Pipeline",     status: "Live",     calls: 210,  contained: 17,  note: "Blocks secrets / PII in prompts committed to repos.", key: "cicd" },
  { id: "partner",   name: "Partner API (sandbox)",    type: "Third-party",  status: "Sandbox",  calls: 48,   contained: 6,   note: "External ISV evaluating inline DLP.", key: "partner-sbx" },
];

/* Tenant inspection keys (x-veris-key). Values are masked for display; a real
   key is only shown once at issue time. */
export const PAAS_KEYS = [
  { id: "gateway",     label: "In-app Gateway",        scope: "inspect",         status: "Active",  masked: "vz_live_gw_••••••4f2a", created: "Provisioned with tenant" },
  { id: "casb-fleet",  label: "CASB + extension fleet", scope: "inspect",         status: "Active",  masked: "vz_live_cb_••••••9d17", created: "42 days ago" },
  { id: "cicd",        label: "CI/CD guardrail",       scope: "inspect",         status: "Active",  masked: "vz_live_ci_••••••1b83", created: "18 days ago" },
  { id: "partner-sbx", label: "Partner (sandbox)",     scope: "inspect · sandbox", status: "Sandbox", masked: "vz_test_pn_••••••7c05", created: "5 days ago" },
];

/* Preset payloads for the live tester — each exercises a different rule path. */
export const PAAS_SAMPLES = [
  { id: "clean",  label: "Clean request",     text: "Summarise the Q3 board deck into five talking points." },
  { id: "pii",    label: "Customer PII",      text: "Draft an apology to Maria Gomez, SSN 431-22-9087, about her delayed refund." },
  { id: "card",   label: "Payment card",      text: "The customer's card 4111 1111 1111 1111 exp 08/27 was double-charged — write the refund note." },
  { id: "secret", label: "Leaked secret",     text: "Here is our prod key AKIA1234567890ABCD, write a script to rotate the database password." },
];

/* Deterministic rollups. */
export function paasStats() {
  const clients = PAAS_CLIENTS.filter(c => c.status === "Live");
  const total = PAAS_CLIENTS.reduce((s, c) => s + c.calls, 0);
  const contained = PAAS_CLIENTS.reduce((s, c) => s + c.contained, 0);
  // A stable allow/mask/block split derived from the totals (no randomness).
  const block = Math.round(contained * 0.38);
  const mask = contained - block;
  const allow = total - contained;
  return {
    total, allow, mask, block, contained,
    containmentRate: total ? Math.round((contained / total) * 100) : 0,
    clientsLive: clients.length,
    clientsTotal: PAAS_CLIENTS.length,
    preventedExfil: block,           // block verdicts = data that never left
    p95ms: 34,                        // sub-model-call latency; pure judgement
    keysActive: PAAS_KEYS.filter(k => k.status === "Active").length,
  };
}

/* Map a live /api/policy/inspect response to a display tone. */
export const PAAS_DECISION_META = {
  allow: { label: "Allow", tone: "good", note: "Within policy — passed through." },
  mask:  { label: "Mask",  tone: "warn", note: "Sensitive data redacted at the boundary." },
  block: { label: "Block", tone: "crit", note: "Denied — nothing sensitive left the edge." },
};
