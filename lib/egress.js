/* ── Veris Enforce — egress policy ──────────────────────────────────────
   The containment guarantee: a successful prompt injection cannot reach
   money, data, or the internet. Least privilege stops an agent calling a tool
   it doesn't hold; egress policy stops the tools it DOES hold from reaching a
   destination they shouldn't. Enforced on the tool call's target, deterministic
   (an allow-list + deny categories, never a text classifier), so it holds
   against a more capable model.

   Two failure modes it closes, both in the handbook: data exfiltration to an
   attacker-controlled host, and SSRF against the cloud metadata service
   (169.254.169.254) to steal instance credentials. Pure + client-safe. */

/* The destination policy. `allow` is the explicit allow-list; everything else
   is denied by default, with named deny categories for the dangerous cases. */
export const EGRESS_POLICY = [
  { host: "api.anthropic.com",        category: "allow",    note: "Model gateway — the only model egress" },
  { host: "hooks.slack.com",          category: "allow",    note: "Approved notification webhook" },
  { host: "*.internal.veris",         category: "internal", note: "Internal services — no agent egress to internal from external-facing agents" },
  { host: "169.254.169.254",          category: "metadata", note: "Cloud metadata service — SSRF target, always denied" },
  { host: "pastebin.com",             category: "denied",   note: "Known exfiltration sink" },
  { host: "*",                        category: "default",  note: "Unknown destination — denied by default" },
];

export const EGRESS_DECISION_META = {
  allow:  { label: "Allowed",   tone: "good" },
  deny:   { label: "Denied",    tone: "crit" },
  ssrf:   { label: "SSRF-deny", tone: "crit" },
};

/* Seeded egress attempts — the containment record. Each is a tool call that
   tried to reach a destination; policy decided. */
export const EGRESS_EVENTS = [
  { id: "EG-2201", ts: "2026-08-06 09:03:10Z", agent: "agent-crc",   tool: "draft_response",     dest: "api.anthropic.com", decision: "allow", reason: "Model gateway — allow-listed" },
  { id: "EG-2202", ts: "2026-08-06 09:11:02Z", agent: "agent-doc",   tool: "external_web_fetch", dest: "pastebin.com",      decision: "deny",  reason: "Injection tried to exfiltrate context to a known sink — denied" },
  { id: "EG-2203", ts: "2026-08-06 09:12:44Z", agent: "agent-doc",   tool: "external_web_fetch", dest: "169.254.169.254",   decision: "ssrf",  reason: "SSRF against cloud metadata — credential theft attempt, denied" },
  { id: "EG-2204", ts: "2026-08-06 09:18:20Z", agent: "agent-fraud", tool: "flag_transaction",   dest: "hooks.slack.com",   decision: "allow", reason: "Approved notification webhook" },
  { id: "EG-2205", ts: "2026-08-06 09:22:31Z", agent: "agent-crc",   tool: "draft_response",     dest: "attacker.example", decision: "deny",  reason: "Unknown destination — denied by default" },
  { id: "EG-2206", ts: "2026-08-06 09:29:57Z", agent: "agent-skills",tool: "recommend_role",     dest: "db.internal.veris", decision: "deny",  reason: "External-facing agent reaching an internal service — denied" },
];

/* Match a destination host against the policy (longest / most-specific wins),
   then map the policy category to a decision. Deny-by-default. */
export function egressDecision(host) {
  const exact = EGRESS_POLICY.find(p => p.host === host);
  const wild = EGRESS_POLICY.find(p => p.host.startsWith("*.") && host.endsWith(p.host.slice(1)));
  const p = exact || wild || EGRESS_POLICY.find(p => p.host === "*");
  const decision = p.category === "allow" ? "allow" : p.category === "metadata" ? "ssrf" : "deny";
  return { decision, category: p.category, note: p.note };
}

export function egressStats(events = EGRESS_EVENTS) {
  const by = d => events.filter(e => e.decision === d).length;
  const denied = by("deny") + by("ssrf");
  return {
    total: events.length,
    allowed: by("allow"),
    denied,
    ssrf: by("ssrf"),
    exfilBlocked: events.filter(e => e.decision === "deny" || e.decision === "ssrf").length,
    allowlisted: EGRESS_POLICY.filter(p => p.category === "allow").length,
    denyRate: events.length ? Math.round((denied / events.length) * 100) : 0,
  };
}
