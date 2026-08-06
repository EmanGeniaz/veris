/* ── Veris Enforce — human-in-the-loop threshold gates ──────────────────
   High-impact actions are gated behind human approval, with a THRESHOLD so the
   gate fires only where it matters — an agent auto-runs the routine and routes
   the consequential to a person, rather than a blanket "approve everything"
   that trains people to rubber-stamp. Maps to EU AI Act Art.14 (human
   oversight) and Art.22 (no solely-automated decision with legal effect).

   Each gate declares the action, the condition/threshold that trips it, the
   approver, and an SLA. requiresApproval() evaluates a proposed action against
   its gate. Pure + client-safe. */

/* The gate catalog — where autonomy stops and a human decides. `threshold` is
   the numeric trip point (null = the action type always gates). */
export const HITL_GATES = [
  { id: "HG-1", action: "issue_decision",   label: "Adverse credit decision",   agent: "agent-credit", condition: "any adverse decision with legal effect", threshold: null,   approver: "Credit Officer",     sla: "4h", basis: "EU AI Act Art.22", pending: 2 },
  { id: "HG-2", action: "post_journal",     label: "Post journal to the GL",     agent: "agent-close",  condition: "amount ≥ $50,000",                       threshold: 50000,  approver: "Financial Controller", sla: "1 business day", basis: "SOX dual approval", pending: 1 },
  { id: "HG-3", action: "block_account",    label: "Freeze a customer account",  agent: "agent-fraud",  condition: "any account freeze",                     threshold: null,   approver: "Fraud Lead",         sla: "1h", basis: "Customer-impact policy", pending: 0 },
  { id: "HG-4", action: "send_customer_email", label: "Email a customer directly", agent: "agent-crc",  condition: "any outbound customer email",            threshold: null,   approver: "Support Manager",    sla: "2h", basis: "EU AI Act Art.14 · HITL", pending: 3 },
  { id: "HG-5", action: "bulk_notify",      label: "Bulk employee notification", agent: "agent-skills", condition: "recipients ≥ 100",                       threshold: 100,    approver: "HR Business Partner", sla: "1 business day", basis: "Comms policy", pending: 0 },
];

/* Does a proposed action need a human? A gate with a null threshold always
   gates its action; a numeric threshold gates only at or above the trip point.
   Below threshold, the agent proceeds autonomously (and it's still logged). */
export function requiresApproval(action, value = null) {
  const g = HITL_GATES.find(x => x.action === action);
  if (!g) return { gated: false, reason: "No gate on this action — routine, runs autonomously." };
  if (g.threshold == null) return { gated: true, gate: g, reason: `${g.label} always requires ${g.approver} approval (${g.basis}).` };
  if (value != null && value >= g.threshold) return { gated: true, gate: g, reason: `${g.label} at ${value.toLocaleString()} ≥ threshold ${g.threshold.toLocaleString()} — ${g.approver} approval required (${g.basis}).` };
  return { gated: false, gate: g, reason: `Below the ${g.threshold.toLocaleString()} threshold — runs autonomously, logged for review.` };
}

export function hitlStats(gates = HITL_GATES) {
  return {
    gates: gates.length,
    pending: gates.reduce((n, g) => n + g.pending, 0),
    alwaysGated: gates.filter(g => g.threshold == null).length,
    thresholdGated: gates.filter(g => g.threshold != null).length,
    art14: gates.filter(g => /Art\.14|Art\.22/.test(g.basis)).length,
  };
}
