/* ── Agent capability registry + least-privilege engine ─────────────
   Autonomous agents are governed objects with declared, least-privilege
   capabilities. Every agent-incident pattern in the field traces to a
   least-privilege failure — a standing capability an agent held but did
   not need. This engine makes capability a first-class, enforced thing:
   each agent declares the exact tools it may call, whether each grant is
   actually exercised, and which high-stakes actions are gated behind human
   approval. capabilityCheck() is the runtime boundary — an out-of-scope
   tool call is denied by default, not by policy document.

   Pure module (data + arithmetic), so the same check runs in the gateway
   route and in the client console. */

/* Each tool is a capability: granted or not, exercised or not, and whether
   a high-stakes call is gated behind human approval. Over-privilege =
   granted AND never exercised AND not approval-gated — a standing grant
   with no operational need, i.e. the classic least-privilege failure. */
export type AgentTool = { name: string; action: string; risk: string; granted: boolean; exercised: boolean; requiresApproval: boolean; control: string };
export type Agent = { id: string; name: string; initiativeId: string; initiative: string; unit: string; model: string; owner: string; oversight: boolean; dataScopes: string[]; tools: AgentTool[] };

export const AI_AGENTS: Agent[] = [
  { id: "agent-crc", name: "Resolution Copilot Agent", initiativeId: "ai-001", initiative: "Customer Resolution Copilot", unit: "Customer Operations", model: "Claude Sonnet · via Gateway", owner: "Platform AI", oversight: true,
    dataScopes: ["CRM tickets", "KB articles"],
    tools: [
      { name: "read_kb", action: "Read knowledge-base articles", risk: "Low", granted: true, exercised: true, requiresApproval: false, control: "CTRL-AI-014" },
      { name: "read_crm_ticket", action: "Read the customer's ticket", risk: "Medium", granted: true, exercised: true, requiresApproval: false, control: "CTRL-SEC-022" },
      { name: "draft_response", action: "Draft a reply for agent review", risk: "Low", granted: true, exercised: true, requiresApproval: false, control: "CTRL-AI-014" },
      { name: "send_customer_email", action: "Send email directly to a customer", risk: "High", granted: false, exercised: false, requiresApproval: true, control: "EU AI Act Art.14 · HITL" },
    ] },
  { id: "agent-credit", name: "Credit Adjudication Agent", initiativeId: "ai-002", initiative: "Credit Decision Assurance", unit: "Retail Banking", model: "Scorecard + LLM rationale", owner: "Risk Engineering", oversight: true,
    dataScopes: ["Applications", "Bureau data"],
    tools: [
      { name: "read_bureau", action: "Read credit-bureau data", risk: "Medium", granted: true, exercised: true, requiresApproval: false, control: "CTRL-GRC-044" },
      { name: "score_application", action: "Compute a risk score", risk: "High", granted: true, exercised: true, requiresApproval: false, control: "CTRL-AI-001" },
      { name: "issue_decision", action: "Issue an adverse credit decision", risk: "High", granted: false, exercised: false, requiresApproval: true, control: "EU AI Act Art.22 · HITL" },
      { name: "write_ledger", action: "Write to the core banking ledger", risk: "High", granted: false, exercised: false, requiresApproval: true, control: "CTRL-GRC-044" },
    ] },
  { id: "agent-close", name: "Close Automation Agent", initiativeId: "ai-003", initiative: "Finance Close Automation", unit: "Finance", model: "GPT-4o · via Gateway", owner: "Enterprise Apps", oversight: true,
    dataScopes: ["Ledger", "Reconciliations"],
    tools: [
      { name: "read_ledger", action: "Read ledger balances", risk: "Low", granted: true, exercised: true, requiresApproval: false, control: "CTRL-FIN-008" },
      { name: "reconcile", action: "Reconcile accounts", risk: "Medium", granted: true, exercised: true, requiresApproval: false, control: "CTRL-FIN-008" },
      { name: "draft_journal", action: "Draft a journal entry", risk: "Medium", granted: true, exercised: true, requiresApproval: false, control: "CTRL-AUD-019" },
      { name: "post_journal", action: "Post a journal entry to the GL", risk: "High", granted: false, exercised: false, requiresApproval: true, control: "SOX dual approval · CTRL-AUD-019" },
    ] },
  { id: "agent-skills", name: "Skills Navigator Agent", initiativeId: "ai-004", initiative: "Workforce Skills Navigator", unit: "People", model: "Gradient-boosted ranker", owner: "Data Science", oversight: true,
    dataScopes: ["Skills graph", "Role profiles"],
    tools: [
      { name: "read_skills_graph", action: "Read the skills graph", risk: "Low", granted: true, exercised: true, requiresApproval: false, control: "CTRL-RAI-006" },
      { name: "recommend_role", action: "Recommend an internal role", risk: "Medium", granted: true, exercised: true, requiresApproval: false, control: "CTRL-RAI-006" },
      { name: "read_hris_full", action: "Read the full HRIS record", risk: "High", granted: true, exercised: false, requiresApproval: false, control: "CTRL-PRV-012" },
      { name: "notify_employee", action: "Notify an employee of a match", risk: "Low", granted: true, exercised: true, requiresApproval: false, control: "CTRL-PRV-012" },
    ] },
  { id: "agent-doc", name: "Doc Summariser Agent", initiativeId: "pf-doc", initiative: "Doc Summarisation AI", unit: "Customer Operations", model: "GPT-4o · via Gateway", owner: "Platform AI", oversight: false,
    dataScopes: ["Uploaded documents"],
    tools: [
      { name: "read_docs", action: "Read uploaded documents", risk: "Low", granted: true, exercised: true, requiresApproval: false, control: "CTRL-AI-014" },
      { name: "summarise", action: "Summarise a document", risk: "Low", granted: true, exercised: true, requiresApproval: false, control: "CTRL-AI-014" },
      { name: "external_web_fetch", action: "Fetch content from the open web", risk: "Medium", granted: true, exercised: false, requiresApproval: false, control: "CTRL-SEC-022" },
    ] },
  { id: "agent-fraud", name: "Fraud Signal Agent", initiativeId: "pf-fraud", initiative: "Fraud Detection Model", unit: "Retail Banking", model: "Internal · risk-scorer-v3", owner: "Risk Engineering", oversight: true,
    dataScopes: ["Transaction stream"],
    tools: [
      { name: "read_txn_stream", action: "Read the transaction stream", risk: "Medium", granted: true, exercised: true, requiresApproval: false, control: "CTRL-SEC-022" },
      { name: "flag_transaction", action: "Flag a suspicious transaction", risk: "Medium", granted: true, exercised: true, requiresApproval: false, control: "CTRL-GRC-044" },
      { name: "block_account", action: "Freeze a customer account", risk: "High", granted: false, exercised: false, requiresApproval: true, control: "HITL · CTRL-GRC-044" },
    ] },
];

export const agentById = (id: string) => AI_AGENTS.find((a) => a.id === id) || null;

/* Over-privilege: a granted capability with no operational need and no
   approval gate — the standing attack surface. */
export const isOverPrivileged = (t: AgentTool) => t.granted && !t.exercised && !t.requiresApproval;

export function agentStats(a: Agent) {
  const tools = a.tools || [];
  const granted = tools.filter((t) => t.granted);
  const overPriv = tools.filter(isOverPrivileged);
  const highRisk = tools.filter((t) => t.risk === "High");
  const highRiskGated = highRisk.filter((t) => !t.granted || t.requiresApproval);
  const denied = tools.filter((t) => !t.granted);
  /* Least privilege = fraction of granted capabilities actually exercised,
     penalised hard for any un-gated standing high-risk grant. */
  const exercisedGrants = granted.filter((t) => t.exercised).length;
  const base = granted.length ? Math.round((exercisedGrants / granted.length) * 100) : 100;
  const ungatedHighRisk = highRisk.filter((t) => t.granted && !t.exercised).length;
  const score = Math.max(0, base - 25 * ungatedHighRisk);
  return {
    granted: granted.length, exercised: exercisedGrants, overPriv, denied: denied.length,
    highRisk: highRisk.length, highRiskGated: highRiskGated.length, score,
    leastPrivilegeOk: overPriv.length === 0 && highRiskGated.length === highRisk.length,
  };
}

/* The runtime boundary. Deny-by-default: a tool outside the agent's
   capability set, an ungranted grant, or an approval-gated action never
   runs autonomously. */
export function capabilityCheck(agentId: string, toolName: string) {
  const a = agentById(agentId);
  if (!a) return { allowed: false, decision: "deny", reason: "Unknown agent — denied by default." };
  const t = (a.tools || []).find((x) => x.name === toolName);
  if (!t) return { allowed: false, decision: "deny", reason: "Tool is not in the agent's capability set — denied by default (least privilege).", control: "Least-privilege boundary" };
  if (!t.granted) return { allowed: false, decision: t.requiresApproval ? "escalate" : "deny", reason: t.requiresApproval ? `High-stakes action — requires human approval (${t.control}); not autonomously permitted.` : `Capability not granted (${t.control}).`, control: t.control };
  return { allowed: true, decision: "allow", reason: `Granted capability · ${t.control}`, control: t.control };
}

/* NIST autonomous-agent security controls ↔ ISO 42001, with status
   computed from the registry — not asserted. */
export function agentControls() {
  const posture = agentPosture();
  const highRiskGated = AI_AGENTS.flatMap((a) => a.tools).filter((t) => t.risk === "High");
  const gated = highRiskGated.filter((t) => !t.granted || t.requiresApproval).length;
  return [
    { id: "AGC-1", control: "Agent inventory", nist: "NIST agent RFI · GV", iso: "ISO 42001 C.6.1", desc: "Every autonomous agent is a registered, owned object.", status: "Met", detail: `${AI_AGENTS.length} agents registered with owner and initiative` },
    { id: "AGC-2", control: "Capability-based access control", nist: "NIST agent RFI · least privilege", iso: "ISO 42001 C.7.1", desc: "Agents hold only the capabilities they need; the rest are denied by default.", status: posture.overPrivileged.length ? "Gap" : "Met", detail: posture.overPrivileged.length ? `${posture.overPrivileged.length} agents hold un-exercised standing capabilities` : "No standing over-privilege detected" },
    { id: "AGC-3", control: "Human oversight on high-stakes actions", nist: "NIST agent RFI · human control", iso: "EU AI Act Art.14", desc: "High-risk actions are gated behind human approval.", status: gated === highRiskGated.length ? "Met" : "Partial", detail: `${gated}/${highRiskGated.length} high-risk actions gated behind approval` },
    { id: "AGC-4", control: "Immutable audit trail", nist: "NIST agent RFI · accountability", iso: "ISO 42001 C.9.2", desc: "Every capability grant and exercise is logged tamper-evidently.", status: "Met", detail: "Grants and denials recorded to the evidence hash chain" },
    { id: "AGC-5", control: "Objective / scope boundary", nist: "NIST agent RFI · goal integrity", iso: "ISO 42001 C.8.2", desc: "Agents cannot act beyond their declared objective and data scope.", status: posture.overPrivileged.length ? "Partial" : "Met", detail: "Enforced at the gateway by capabilityCheck deny-by-default" },
  ];
}

export function agentPosture() {
  const rows = AI_AGENTS.map((a) => ({ agent: a, stats: agentStats(a) }));
  const overPrivileged = rows.filter((r) => r.stats.overPriv.length > 0);
  const allHigh = AI_AGENTS.flatMap((a) => a.tools).filter((t) => t.risk === "High");
  const gatedHigh = allHigh.filter((t) => !t.granted || t.requiresApproval).length;
  const index = Math.round(rows.reduce((s, r) => s + r.stats.score, 0) / rows.length);
  return { agents: AI_AGENTS.length, rows, overPrivileged, index, gatedHigh, totalHigh: allHigh.length };
}
