/* Converged governance + incident model — the single operating layer the
   "data + AI governance as one agenda" thesis calls for:

     1. ONE forum owning policy, risk tiering, exceptions and escalation across
        data + AI (no parallel committees with different playbooks).
     2. ONE incident playbook spanning breaches, model failures, harmful
        outputs and regulatory notifications (previously split across the
        CISO / CAIO / CDPO surfaces — INC-1042 and INC-1039 even existed twice).

   Everything here derives from, or cross-references, the canonical registers so
   the forum works the live estate rather than a separate copy. */

import { riskRegister } from "./platform-models";

const sevRank = { Critical: 4, High: 3, Medium: 2, Low: 1 };

/* ── The converged governance council (single operating rhythm) ── */
export const FORUM_COUNCIL = [
  { role: "CGO",  seat: "Chair · Enterprise Governance", owns: "Policy, risk tiering, exceptions, escalation" },
  { role: "CAIO", seat: "AI Governance Office",          owns: "AI systems, lifecycle, model governance" },
  { role: "CISO", seat: "Security",                      owns: "Access, threat, model misuse, breach response" },
  { role: "CDPO", seat: "Data Protection & Privacy",     owns: "Data lineage, DPIA, retention, residency" },
  { role: "CRO",  seat: "Enterprise Risk",               owns: "Risk appetite, KRIs, treatment sign-off" },
  { role: "CIO",  seat: "AI Platform",                   owns: "Data platform, gateway, integrations" },
];

export const FORUM_CADENCE = "Monthly council · weekly triage · quarterly board oversight";

/* Single-point ownership across the converged domains (the People axis) —
   plus the automatic cross-trigger that keeps data and AI in one rhythm. */
export const OWNERSHIP_MATRIX = [
  { domain: "Data governance", lead: "CDPO", rhythm: "Weekly data-council",  trigger: "Data-policy change → AI use-case review" },
  { domain: "AI governance",   lead: "CAIO", rhythm: "Weekly AI-council",    trigger: "New / changed model → DPIA + risk re-tier" },
  { domain: "Privacy",         lead: "CDPO", rhythm: "In data-council",      trigger: "New personal-data flow → residency + retention check" },
  { domain: "Security",        lead: "CISO", rhythm: "Daily SecOps standup", trigger: "Access / exposure change → control re-test" },
  { domain: "Enterprise risk", lead: "CRO",  rhythm: "Monthly council",      trigger: "Material risk change → board escalation" },
];

/* The one agenda — top open risks come straight from the canonical register;
   exceptions / escalations / policy reviews are the forum's live decisions. */
export function forumAgenda() {
  const topRisks = [...riskRegister]
    .sort((a, b) => (sevRank[b.level] - sevRank[a.level]) || (b.residual - a.residual))
    .slice(0, 4)
    .map(r => ({ kind: "Risk tiering", item: `${r.title} · ${r.system}`, owner: r.execOwner || r.riskOwner || "—", tier: r.level, ref: r.id, decision: "Confirm tier & treatment" }));
  const decisions = [
    { kind: "Policy exception", item: "Data-retention exception — Customer Ops pilot (30-day window)", owner: "CDPO", tier: "Medium", ref: "EXC-014", decision: "Grant / deny with conditions" },
    { kind: "Escalation",       item: "Model-validation control ineffective across 3 systems",         owner: "CRO",  tier: "High",   ref: "ESC-003", decision: "Escalate to board · set remediation deadline" },
    { kind: "Policy review",    item: "Acceptable-use policy overdue 12 days",                          owner: "CGO",  tier: "Medium", ref: "POL-AUP", decision: "Ratify updated policy" },
  ];
  return [...topRisks, ...decisions];
}

/* ── The one incident register (every class, one schema, one owner each) ── */
export const INCIDENT_CLASSES = ["Data breach", "Model failure", "Harmful output", "Regulatory", "Security"];

export const UNIFIED_INCIDENTS = [
  { id: "INC-1042", title: "Prompt-injection attempt on Resolution Copilot", cls: "Security",       severity: "P1 · Critical", sev: "crit", system: "Customer Resolution Copilot", initiativeId: "ai-001", owner: "Omar Khan · CISO",   detected: "Today 09:14",   status: "Investigating", st: "info", reg: "GDPR Art.33 assessed — attack blocked, no data left the boundary" },
  { id: "INC-1051", title: "Biased / harmful response in eligibility scoring", cls: "Harmful output", severity: "P2 · High",     sev: "warn", system: "Workforce Skills Navigator",   initiativeId: "ai-004", owner: "Leila Haddad · CAIO", detected: "Today 11:02",   status: "Triage",        st: "ink3", reg: "EU AI Act Art.14 human-oversight review triggered" },
  { id: "INC-1048", title: "Cross-border data flow without transfer mapping (APAC)", cls: "Regulatory", severity: "P2 · High",   sev: "warn", system: "Predictive Maintenance",       initiativeId: "pf-maint", owner: "Priya Mehta · CDPO", detected: "3d ago",       status: "Notifying",     st: "info", reg: "GDPR Art.44 transfer gap — DPA notification in progress" },
  { id: "INC-1039", title: "Model drift breached the validated envelope — fraud signals", cls: "Model failure", severity: "P2 · High", sev: "warn", system: "Fraud Detection Model",  initiativeId: "ai-002", owner: "D. Osei · Model Risk", detected: "Yesterday 14:30", status: "Mitigating",  st: "warn", reg: "Internal — no external notification required" },
  { id: "INC-1035", title: "PII near-miss in prompt logs", cls: "Data breach", severity: "P3 · Medium", sev: "info", system: "Customer Resolution Copilot", initiativeId: "ai-001", owner: "Priya Mehta · CDPO", detected: "2d ago", status: "Contained", st: "good", reg: "GDPR Art.33 assessed — near-miss, no notification (logged)" },
];

/* One response playbook — the SAME stages regardless of incident class. */
export const INCIDENT_STAGES = [
  { n: 1, stage: "Detect",    owner: "Automated / any lead",  crit: "One intake for every signal — gateway, drift monitor, DLP, SIEM or user report." },
  { n: 2, stage: "Triage",    owner: "On-call + domain lead", crit: "Classify (breach / model / harmful / regulatory), set severity, assign a single owner." },
  { n: 3, stage: "Contain",   owner: "Domain lead",           crit: "Stop the harm: block, throttle, roll back, revoke access or mask." },
  { n: 4, stage: "Notify",    owner: "CDPO + Legal + CGO",    crit: "One notification decision against the regulatory clock — GDPR Art.33 (72h), EU AI Act, sector rules." },
  { n: 5, stage: "Remediate", owner: "CAIO / CISO / CIO",     crit: "Fix root cause: retrain, patch, re-tier risk, update controls & policy." },
  { n: 6, stage: "Evidence",  owner: "Governance Office",     crit: "Close with an evidence pack in the Evidence Fabric; feed lessons back to the forum." },
];

export function incidentStats() {
  const open = UNIFIED_INCIDENTS.filter(i => !["Closed", "Contained"].includes(i.status)).length;
  const byClass = INCIDENT_CLASSES.map(c => ({ cls: c, n: UNIFIED_INCIDENTS.filter(i => i.cls === c).length })).filter(x => x.n > 0);
  const regClock = UNIFIED_INCIDENTS.filter(i => i.status === "Notifying").length;
  return { total: UNIFIED_INCIDENTS.length, open, byClass, regClock };
}
