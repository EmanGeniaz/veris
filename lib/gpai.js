/* The GPAI "accidental provider" test — EU AI Act Art. 53 & 55.
   Modifying a general-purpose AI model (fine-tuning, distillation or continued
   pre-training) AND making it available beyond the team that modified it can
   make you a PROVIDER carrying Art. 53/55 obligations — with no procurement or
   board decision ever taken. Two "yes" answers flag the system.

   Assessed against the estate's GenAI systems; narrow bespoke models are out of
   GPAI scope. System names match the canonical portfolio register. */

export const GPAI_QUESTIONS = [
  { q: "Did we modify the model?", detail: "Fine-tuning, distillation or continued pre-training — anything that changes the model rather than just calling it." },
  { q: "Did we make it available beyond the team that modified it?", detail: "Another business unit counts. A group entity counts. Your own product counts." },
];

/* gpai=false → out of scope. Otherwise exposure derives from (modified, distributed):
   modified & distributed → likely provider · modified only → monitor · else deployer. */
export const GPAI_REGISTER = [
  { system: "Customer Resolution Copilot", initiativeId: "ai-001", basis: "Foundation LLM, fine-tuned on support transcripts", gpai: true,  modified: true,  distributed: true,  arts: "Art. 53 · Art. 55 if systemic" },
  { system: "Document Summarisation AI",   initiativeId: "pf-doc", basis: "Foundation LLM, lightly fine-tuned",             gpai: true,  modified: true,  distributed: false, arts: "Art. 53 (watch)" },
  { system: "Workforce Skills Navigator",  initiativeId: "ai-004", basis: "Foundation LLM via API — not modified",          gpai: true,  modified: false, distributed: true,  arts: "Deployer (Art. 26)" },
  { system: "Credit Decision Assurance",   initiativeId: "ai-002", basis: "Bespoke narrow model — not a GPAI",              gpai: false, modified: false, distributed: false, arts: "Out of GPAI scope" },
  { system: "Finance Close Automation",    initiativeId: "ai-003", basis: "Process automation — not a GPAI",                gpai: false, modified: false, distributed: false, arts: "Out of GPAI scope" },
  { system: "Fraud Detection Model",       initiativeId: "pf-fraud", basis: "Bespoke narrow model — not a GPAI",            gpai: false, modified: false, distributed: false, arts: "Out of GPAI scope" },
];

export const EXPOSURE_META = {
  provider: { label: "Likely provider · assess", tone: "crit" },
  monitor:  { label: "Monitor",                  tone: "warn" },
  deployer: { label: "Deployer only",            tone: "good" },
  out:      { label: "Out of GPAI scope",        tone: "ink3" },
};

export function gpaiExposure(r) {
  if (!r.gpai) return "out";
  if (r.modified && r.distributed) return "provider";
  if (r.modified) return "monitor";
  return "deployer";
}

export function gpaiStats() {
  const rows = GPAI_REGISTER.map(r => gpaiExposure(r));
  return {
    total: GPAI_REGISTER.length,
    assessed: GPAI_REGISTER.filter(r => r.gpai).length,
    provider: rows.filter(x => x === "provider").length,
    monitor:  rows.filter(x => x === "monitor").length,
    deployer: rows.filter(x => x === "deployer").length,
    out:      rows.filter(x => x === "out").length,
  };
}
