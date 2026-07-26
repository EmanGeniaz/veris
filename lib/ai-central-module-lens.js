/* ── AI Central — per-module role lens ───────────────────────────────
   The Overview already reframes AI Central per role (lib/ai-central-lens).
   This carries the same lens INTO each shared module: every module opens
   with a short role band — a framing question and three signals that
   matter to THIS role — then the module's existing content flows below,
   unchanged.

   Shape: AC_MODULE_LENS[module][role] = { angle, question, sub, chips }.
   Each module has a `_default` band; roles that need a distinct angle
   override it, everyone else falls back to the default (no full matrix).
   chips: [label, value, colorKey, sub]. colorKey resolves through the
   same LENSC map aicentral.jsx already uses (good/warn/crit/info/gold/
   teal/violet/ink3). Values are curated to the demo portfolio, kept
   consistent with the Overview lens and each module's own tiles. */

export const AC_MODULE_LENS = {
  /* ── AI Governance ── controls · frameworks · guardrails ── */
  governance: {
    _default: {
      angle: "Governance · Control plane",
      question: "How is AI governed, and where are the gaps?",
      sub: "Control compliance, policy violations and open exceptions.",
      chips: [["Governance score", "79%", "good", "control compliance"], ["Policy violations", "3", "crit", "1 repeated"], ["Active exceptions", "4", "warn", "2 expiring"]],
    },
    caio: {
      angle: "Governance · Full control plane",
      question: "Is this AI responsible and governed end to end?",
      sub: "The governance score and what's driving it this quarter.",
      chips: [["Governance score", "72", "good", "+4 QoQ"], ["Approvals pending", "3", "warn", "need decisions"], ["Evidence", "84%", "good", "of lifecycle"]],
    },
    cgo: {
      angle: "Governance · Control estate",
      question: "Are our controls effective and audit-ready?",
      sub: "Effectiveness, open findings and framework alignment.",
      chips: [["Controls effective", "88%", "good", "21 of 24"], ["Open findings", "5", "warn", "2 high"], ["Frameworks", "5", "info", "aligned"]],
    },
    ciso: {
      angle: "Governance · Guardrail enforcement",
      question: "Where is guardrail coverage thin?",
      sub: "Coverage, gaps and live enforcement across production models.",
      chips: [["Guardrail coverage", "86%", "info", "production"], ["Coverage gaps", "2", "warn", "2 models"], ["Open incidents", "1", "crit", "P1 injection"]],
    },
    cdpo: {
      angle: "Governance · Privacy safeguards",
      question: "Are automated decisions safeguarded?",
      sub: "DPIAs, Article 22 systems and documented consent.",
      chips: [["DPIA coverage", "9/11", "gold", "systems"], ["Art.22 systems", "2", "warn", "auto-decide"], ["Consent", "98%", "good", "documented"]],
    },
    cio: {
      angle: "Governance · Control automation",
      question: "How much control is enforced automatically?",
      sub: "Automated vs manual controls across the platform.",
      chips: [["Automated controls", "71%", "info", "of 24"], ["Manual controls", "7", "warn", "review load"], ["Enforcement uptime", "99.9%", "good", "gateway"]],
    },
  },

  /* ── AI Model Registry ── model → initiative → owner ── */
  models: {
    _default: {
      angle: "Registry · Business context",
      question: "What models are running, and in whose initiative?",
      sub: "Every model in its initiative, owner and lifecycle context.",
      chips: [["Total models", "8", "info", "governed"], ["Ungoverned", "0", "good", "all in intake"], ["Critical risk", "1", "crit", "treatment"]],
    },
    caio: {
      angle: "Registry · Governance coverage",
      question: "Is every model inside a governed initiative?",
      sub: "Governed coverage, intake gaps and classification status.",
      chips: [["Total models", "8", "info", "8 governed"], ["Ungoverned", "0", "good", "intake clean"], ["Unclassified", "1", "warn", "EU AI Act"]],
    },
    ciso: {
      angle: "Registry · Attack surface",
      question: "Can I trust each model in production?",
      sub: "Guardrails, red-team status and unclassified risk per model.",
      chips: [["Guardrail coverage", "86%", "info", "of models"], ["Critical-risk", "1", "crit", "model"], ["Red-team overdue", "2", "warn", "models"]],
    },
    cio: {
      angle: "Registry · Runtime footprint",
      question: "Will each model scale and perform?",
      sub: "Latency, unit cost and integration status per model.",
      chips: [["Models in prod", "14", "info", "of 21"], ["p95 latency", "420ms", "good", "SLO 600"], ["Cost / 1k", "$1.90", "warn", "+14% MoM"]],
    },
    cdpo: {
      angle: "Registry · Data exposure",
      question: "What personal data does each model touch?",
      sub: "Training provenance, PII handling and residency per model.",
      chips: [["PII-handling", "3", "warn", "models"], ["Residency-bound", "2", "info", "EU only"], ["Unclassified", "1", "crit", "provenance"]],
    },
  },

  /* ── Trust & Evidence ── proof for every claim ── */
  evidence: {
    _default: {
      angle: "Evidence · Assurance",
      question: "Is there proof, and is it audit-ready?",
      sub: "Searchable, versioned evidence across the lifecycle.",
      chips: [["Lifecycle coverage", "84%", "good", "of gates"], ["Overdue", "2", "crit", "items"], ["Scopes", "3", "info", "project→org"]],
    },
    caio: {
      angle: "Evidence · Lifecycle proof",
      question: "Does every gate have the proof it needs?",
      sub: "Coverage across phases and what's still pending.",
      chips: [["Evidence coverage", "84%", "good", "of lifecycle"], ["Gated phases", "13", "info", "canonical"], ["Pending", "3", "warn", "approvals"]],
    },
    cgo: {
      angle: "Evidence · Audit trail",
      question: "Can we close findings with evidence in hand?",
      sub: "Findings closure and evidence completeness for audit.",
      chips: [["Evidence coverage", "84%", "good", "lifecycle"], ["Open findings", "5", "warn", "2 high"], ["Overdue", "2", "crit", "evidence"]],
    },
    ciso: {
      angle: "Evidence · Security assurance",
      question: "Do we have proof the controls actually work?",
      sub: "Control test records and incident evidence.",
      chips: [["Security evidence", "82%", "good", "of lifecycle"], ["Control tests", "24", "info", "logged"], ["Open incidents", "1", "crit", "with record"]],
    },
    cdpo: {
      angle: "Evidence · Privacy record",
      question: "Are DPIAs, consent and residency documented?",
      sub: "Privacy evidence — assessments, consent and residency proofs.",
      chips: [["DPIAs", "9/11", "gold", "documented"], ["Consent records", "98%", "good", "captured"], ["Residency proofs", "2", "info", "EU-bound"]],
    },
  },

  /* ── Portfolio ── the AI estate by business unit ── */
  portfolio: {
    _default: {
      angle: "Portfolio · By business unit",
      question: "Where is AI investment and value going?",
      sub: "Investment, governance maturity and use-case pipeline by unit.",
      chips: [["Business units", "4", "info", "active"], ["Value at stake", "$17.5M", "gold", "expected"], ["Pipeline", "6", "teal", "use cases"]],
    },
    ceo: {
      angle: "Portfolio · Value at stake",
      question: "What's creating value and ready to scale?",
      sub: "Value realized and scale-readiness across business units.",
      chips: [["Value realized", "$4.1M", "good", "of $17.5M"], ["Ready to scale", "2", "good", "1 at your gate"], ["High-risk", "2", "crit", "of portfolio"]],
    },
    cfo: {
      angle: "Portfolio · Investment",
      question: "Is the investment creating value by unit?",
      sub: "Spend, realized value and ROI across business units.",
      chips: [["Invested", "$8.0M", "gold", "FY26"], ["Realized", "$4.6M", "good", "57%"], ["ROI", "+22%", "good", "weighted"]],
    },
    coo: {
      angle: "Portfolio · Delivery",
      question: "Can we deliver and operate across units?",
      sub: "Throughput and adoption across business units.",
      chips: [["Adoption", "61%", "warn", "4 units"], ["On track", "3/4", "good", "1 at risk"], ["Blocked", "1", "crit", "evidence"]],
    },
    caio: {
      angle: "Portfolio · Governance maturity",
      question: "How mature is governance across the estate?",
      sub: "Governance maturity and pipeline by business unit.",
      chips: [["Avg maturity", "3.4", "info", "of 5"], ["Leading unit", "Finance", "good", "4.1"], ["Lagging unit", "People", "warn", "2.6"]],
    },
  },
};

/* Returns the role's band for a module, or the module's default band. */
export const acModuleLensFor = (module, role) => {
  const m = AC_MODULE_LENS[module];
  if (!m) return null;
  return m[role] || m._default;
};
