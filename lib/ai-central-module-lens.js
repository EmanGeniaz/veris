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
  /* ── Controls & Compliance ── controls · frameworks · guardrails ── */
  controls: {
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

  /* ── AI Repository ── model → initiative → owner ── */
  repository: {
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

  /* ── AI Strategy ── ambition · investment · roadmap ── */
  strategy: {
    _default: {
      angle: "Strategy · Enterprise ambition",
      question: "Where is AI taking the enterprise, and is it funded?",
      sub: "Investment thesis, strategic pillars and department roadmap.",
      chips: [["Strategic pillars", "4", "info", "board-agreed"], ["Investment", "$13.4M", "gold", "FY26"], ["On roadmap", "12", "teal", "initiatives"]],
    },
    ceo: {
      angle: "Strategy · Board thesis",
      question: "Is the AI bet paying off and worth expanding?",
      sub: "Value thesis, scale-ready bets and board decisions.",
      chips: [["Value realized", "$4.1M", "good", "of $17.5M"], ["Scale-ready", "2", "good", "bets"], ["Board decisions", "1", "warn", "this quarter"]],
    },
    caio: {
      angle: "Strategy · Governance roadmap",
      question: "Does the roadmap keep governance ahead of adoption?",
      sub: "Roadmap sequencing, maturity trajectory and capability gaps.",
      chips: [["Governance score", "72", "good", "+4 QoQ"], ["Capability gaps", "3", "warn", "to close"], ["Maturity target", "3.8", "info", "by FY27"]],
    },
  },

  /* ── AI Inventory ── systems · datasets · vendors ── */
  inventory: {
    _default: {
      angle: "Inventory · The estate",
      question: "What AI is running across the enterprise?",
      sub: "Every system, dataset, vendor and integration — governed or in intake.",
      chips: [["AI systems", "21", "info", "catalogued"], ["Datasets", "38", "teal", "classified"], ["Vendors", "7", "gold", "approved"]],
    },
    cio: {
      angle: "Inventory · Platform estate",
      question: "Is the estate known, integrated and supportable?",
      sub: "Systems, integrations and vendor footprint under management.",
      chips: [["AI systems", "21", "info", "14 in prod"], ["Integrations", "23", "gold", "1 degraded"], ["Shadow AI", "2", "warn", "in intake"]],
    },
    cdpo: {
      angle: "Inventory · Data estate",
      question: "What data does the estate hold and process?",
      sub: "Datasets, classification and residency across the estate.",
      chips: [["Datasets", "38", "info", "classified"], ["PII datasets", "12", "warn", "in scope"], ["Residency-bound", "6", "teal", "EU only"]],
    },
  },

  /* ── AI Lifecycle ── governed pilot-to-scale journey ── */
  lifecycle: {
    _default: {
      angle: "Lifecycle · Pilot to scale",
      question: "Where is each initiative on the governed journey?",
      sub: "The 13-phase lifecycle, gates and evidence per initiative.",
      chips: [["Active initiatives", "4", "info", "in flight"], ["At a gate", "2", "warn", "awaiting decision"], ["Scale-ready", "2", "good", "evidence complete"]],
    },
    caio: {
      angle: "Lifecycle · Gate assurance",
      question: "Is every phase gate backed by evidence?",
      sub: "Phase progress, gate readiness and pending approvals.",
      chips: [["Phases gated", "13", "info", "canonical"], ["Gates pending", "2", "warn", "decisions"], ["Evidence", "84%", "good", "of gates"]],
    },
    coo: {
      angle: "Lifecycle · Delivery",
      question: "Are initiatives moving through delivery on plan?",
      sub: "Delivery progress, blockers and go-live readiness.",
      chips: [["On track", "3/4", "good", "1 at risk"], ["Blocked", "1", "crit", "evidence overdue"], ["Go-live this Q", "2", "info", "pending"]],
    },
    cro: {
      angle: "Lifecycle · Risk gates",
      question: "Is risk assessed before each phase advances?",
      sub: "Risk and impact assessments at every governance gate.",
      chips: [["Risk-assessed", "4/4", "good", "initiatives"], ["Gate blocks", "1", "crit", "high residual"], ["Treatments due", "3", "warn", "before scale"]],
    },
  },

  /* ── Risk Center ── AI risk framework and treatment ── */
  risk: {
    _default: {
      angle: "Risk · Enterprise exposure",
      question: "Is AI risk inside appetite, and what needs treatment?",
      sub: "Residual risk, control effectiveness and open treatments.",
      chips: [["Residual risk", "Amber", "warn", "within appetite"], ["Critical risks", "1", "crit", "Credit Decision"], ["Open treatments", "3", "warn", "1 overdue"]],
    },
    cro: {
      angle: "Risk · Framework & appetite",
      question: "Is exposure within appetite and trending down?",
      sub: "Appetite, residual grades, KRIs and treatment status.",
      chips: [["Vs appetite", "Within", "good", "amber band"], ["KRIs breached", "2", "warn", "of 14"], ["Overdue treatments", "1", "crit", "data drift"]],
    },
    ciso: {
      angle: "Risk · Security exposure",
      question: "Which risks stem from the attack surface?",
      sub: "Security-origin risks, guardrail gaps and incidents.",
      chips: [["Security risks", "2", "warn", "of register"], ["Guardrail gaps", "2", "warn", "models"], ["Open incidents", "1", "crit", "P1 injection"]],
    },
  },

  /* ── Trust Center ── live posture and attestations ── */
  trust: {
    _default: {
      angle: "Trust · Live posture",
      question: "Can we prove AI is safe, right now?",
      sub: "Live posture, incidents, attestations and trust signals.",
      chips: [["Trust posture", "82", "good", "/100"], ["Live incidents", "1", "crit", "P1"], ["Attestations", "6", "info", "current"]],
    },
    cdpo: {
      angle: "Trust · Privacy assurance",
      question: "Can we attest to privacy on demand?",
      sub: "Consent, residency and privacy attestations, live.",
      chips: [["Consent", "98%", "good", "documented"], ["Residency", "100%", "good", "enforced"], ["Privacy incidents", "0", "good", "30d"]],
    },
    ciso: {
      angle: "Trust · Security posture",
      question: "Is the live security posture defensible?",
      sub: "Attacks blocked, guardrail coverage and incident status.",
      chips: [["Attacks blocked", "2,410", "good", "30d"], ["Guardrail coverage", "86%", "info", "production"], ["Open incidents", "1", "crit", "P1"]],
    },
    legal: {
      angle: "Trust · Attestation",
      question: "Are our public trust claims defensible?",
      sub: "Attestations, transparency notices and disclosures.",
      chips: [["Attestations", "6", "info", "current"], ["Transparency notices", "Met", "good", "EU AI Act"], ["Disclosures", "4", "teal", "published"]],
    },
  },

  /* ── Policies & Standards ── policy library and standards ── */
  policies: {
    _default: {
      angle: "Policies · Library",
      question: "Are policies current, mapped and acknowledged?",
      sub: "Policy library, review cadence and violation analytics.",
      chips: [["Active policies", "8", "info", "in force"], ["Overdue review", "2", "warn", "past due"], ["Ack coverage", "84%", "good", "workforce"]],
    },
    legal: {
      angle: "Policies · Regulatory mapping",
      question: "Do policies satisfy every regulatory obligation?",
      sub: "Standards alignment, obligations and defensibility.",
      chips: [["Standards mapped", "5", "info", "frameworks"], ["Obligation gaps", "1", "crit", "Art.43"], ["Ack coverage", "84%", "good", "workforce"]],
    },
    cdpo: {
      angle: "Policies · Privacy standards",
      question: "Do data policies hold up under scrutiny?",
      sub: "Data-handling policies, consent standards and reviews.",
      chips: [["Data policies", "3", "info", "active"], ["Overdue review", "1", "warn", "Data Handling"], ["PII violations", "1,284", "warn", "redacted MTD"]],
    },
    cgo: {
      angle: "Policies · Compliance cadence",
      question: "Is the policy estate reviewed and enforced?",
      sub: "Review cadence, exceptions and violation trend.",
      chips: [["Active policies", "8", "info", "in force"], ["Overdue review", "2", "warn", "past due"], ["Open exceptions", "4", "warn", "2 expiring"]],
    },
  },

  /* ── Value Realization ── expected vs realized ROI ── */
  value: {
    _default: {
      angle: "Value · Realization",
      question: "Is the AI investment turning into value?",
      sub: "Expected vs realized value and ROI across the portfolio.",
      chips: [["Realized", "$4.6M", "good", "of $8.0M"], ["ROI", "+22%", "good", "weighted"], ["At risk", "$2.1M", "warn", "no value yet"]],
    },
    cfo: {
      angle: "Value · Investment return",
      question: "What return is each program delivering?",
      sub: "Spend, realized value, ROI confidence and reforecasts.",
      chips: [["Invested", "$8.0M", "gold", "FY26"], ["Realized", "$4.6M", "good", "57%"], ["Reforecast", "2", "crit", "programs"]],
    },
    ceo: {
      angle: "Value · Board outcomes",
      question: "Is AI moving the numbers the board cares about?",
      sub: "Enterprise value realized and what's ready to scale.",
      chips: [["Value realized", "$4.1M", "good", "portfolio"], ["Ready to scale", "2", "good", "bets"], ["Enterprise health", "78", "good", "weighted"]],
    },
  },

  /* ── Audit Center ── immutable audit trail ── */
  audit: {
    _default: {
      angle: "Audit · Trail",
      question: "Is everything auditable and regulator-ready?",
      sub: "Immutable hash-chained trail, audit packs and export.",
      chips: [["Log integrity", "100%", "good", "hash-chained"], ["Open findings", "5", "warn", "2 high"], ["Audit packs", "4", "info", "ready"]],
    },
    cro: {
      angle: "Audit · Findings closure",
      question: "Are findings closing on time with evidence?",
      sub: "Findings, remediation status and overdue items.",
      chips: [["Open findings", "5", "warn", "2 high"], ["Overdue", "2", "crit", "remediation"], ["Closed 30d", "8", "good", "with evidence"]],
    },
    legal: {
      angle: "Audit · Regulator readiness",
      question: "Could we defend this to a regulator today?",
      sub: "Audit packs, evidence completeness and export readiness.",
      chips: [["Audit packs", "4", "info", "regulator-ready"], ["Evidence", "84%", "good", "of lifecycle"], ["Log integrity", "100%", "good", "verifiable"]],
    },
  },
};

/* Returns the role's band for a module, or the module's default band. */
export const acModuleLensFor = (module, role) => {
  const m = AC_MODULE_LENS[module];
  if (!m) return null;
  return m[role] || m._default;
};
