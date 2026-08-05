/* Multi-agent workflow permissions. A workflow is a chain of steps, each an
   agent invoking a tool — sometimes handing off to another agent. Least
   privilege must hold TRANSITIVELY: an agent cannot gain a capability just by
   being placed in a workflow. Every step is re-checked against the agent's own
   capability set via capabilityCheck (deny-by-default), and high-stakes steps
   escalate to human approval. A step where an agent invokes a tool it does not
   hold is a privilege-escalation-via-delegation attempt — and is blocked. */

import { capabilityCheck } from "./agent-registry";

export const WORKFLOWS = [
  { id: "wf-resolve", name: "Customer resolution", trigger: "Inbound support ticket", owner: "Customer Operations",
    steps: [
      { agent: "agent-crc", tool: "read_crm_ticket",     note: "Read the customer's ticket" },
      { agent: "agent-crc", tool: "read_kb",             note: "Retrieve relevant KB articles" },
      { agent: "agent-crc", tool: "draft_response",      note: "Draft a reply for review" },
      { agent: "agent-crc", tool: "send_customer_email", note: "Send to customer", handoff: true },
    ] },
  { id: "wf-credit", name: "Credit adjudication", trigger: "Loan application", owner: "Retail Banking",
    steps: [
      { agent: "agent-credit", tool: "read_bureau",      note: "Read credit-bureau data" },
      { agent: "agent-credit", tool: "score_application", note: "Compute the risk score" },
      { agent: "agent-crc",    tool: "issue_decision",   note: "Copilot attempts to issue the decision", handoff: true },
      { agent: "agent-credit", tool: "issue_decision",   note: "Accountable agent issues under human oversight" },
    ] },
  { id: "wf-close", name: "Finance close", trigger: "Period-end close", owner: "Finance",
    steps: [
      { agent: "agent-close", tool: "read_ledger",   note: "Read ledger balances" },
      { agent: "agent-close", tool: "reconcile",     note: "Reconcile accounts" },
      { agent: "agent-close", tool: "draft_journal", note: "Draft the journal entry" },
      { agent: "agent-close", tool: "post_journal",  note: "Post to the GL", handoff: true },
    ] },
  { id: "wf-fraud", name: "Fraud triage", trigger: "Anomalous transaction", owner: "Retail Banking",
    steps: [
      { agent: "agent-fraud", tool: "read_txn_stream",  note: "Read the transaction stream" },
      { agent: "agent-fraud", tool: "flag_transaction", note: "Flag the suspicious transaction" },
      { agent: "agent-fraud", tool: "block_account",    note: "Freeze the account", handoff: true },
    ] },
];

export const WF_DECISION_META = {
  allow:    { label: "Allowed",   tone: "good" },
  escalate: { label: "HITL gate", tone: "warn" },
  deny:     { label: "Blocked",   tone: "crit" },
};

/* Re-check every step against the agent's own grants — transitively. */
export function checkWorkflow(wf) {
  const steps = wf.steps.map(s => {
    const cap = capabilityCheck(s.agent, s.tool);
    return { ...s, decision: cap.decision, allowed: cap.allowed, reason: cap.reason, control: cap.control };
  });
  return {
    ...wf,
    steps,
    ok: steps.filter(s => s.decision === "allow").length,
    gated: steps.filter(s => s.decision === "escalate").length,
    blocked: steps.filter(s => s.decision === "deny").length,
    safe: steps.every(s => s.decision !== "deny"),
  };
}

export function workflowRows() { return WORKFLOWS.map(checkWorkflow); }

export function workflowStats() {
  const rows = workflowRows();
  return {
    workflows: rows.length,
    steps: rows.reduce((n, w) => n + w.steps.length, 0),
    blocked: rows.reduce((n, w) => n + w.blocked, 0),
    gated: rows.reduce((n, w) => n + w.gated, 0),
    unsafe: rows.filter(w => !w.safe).length,
  };
}
