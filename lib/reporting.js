/* ── Executive Reporting catalog ─────────────────────────────────────────
   A CEO doesn't file one report — they answer to a board, a regulator, an
   audit committee, a risk committee, the CFO, and ESG, each on its own cadence
   and format. This is the catalog of pre-built report packs VerisZone ships,
   plus the scheduled-delivery model, so the Reporting surface is a library of
   audience-shaped packs rather than a single dimension picker.

   Pure data + selectors. Deterministic (no Date.now) — the "next run" strings
   are fixed seeds; wire a scheduler and they resolve to real dates. */

export const CADENCES = ["Weekly", "Monthly", "Quarterly", "On-demand"];
export const FORMATS  = ["Board PDF", "PPTX", "XLSX", "Regulator JSON", "CSV"];

/* Pre-built report packs. Each maps to data the platform already owns, so a
   pack is an assembly of live surfaces — not a fresh authoring exercise. */
export const REPORT_TEMPLATES = [
  { id: "board", name: "Board Pack", audience: "Board of Directors", cadence: "Quarterly", tone: "gold",
    summary: "The quarterly AI portfolio story — value, risk, adoption and the scale decisions awaiting the board.",
    sections: ["Portfolio value & ROI", "Risk posture", "Adoption by unit", "Scale decisions pending", "Value realization by initiative"],
    formats: ["Board PDF", "PPTX", "XLSX"] },
  { id: "regulator", name: "EU AI Act Conformity Pack", audience: "Regulator", cadence: "On-demand", tone: "blue",
    summary: "The conformity dossier a regulator reads — classification, the Article 12 log, and human-oversight evidence.",
    sections: ["High-risk classification", "Article 12 inference log", "HITL oversight evidence (Art.14 / 22)", "Technical documentation", "Post-market monitoring (Art.72)"],
    formats: ["Regulator JSON", "Board PDF"], frameworks: ["EU AI Act"] },
  { id: "audit", name: "Audit Committee Pack", audience: "Audit Committee", cadence: "Quarterly", tone: "green",
    summary: "Controls posture, evidence coverage and open exceptions, reconciled to the tamper-evident ledger.",
    sections: ["Controls posture", "Evidence coverage", "Open findings & exceptions", "Incident summary", "Tool-Call Ledger integrity"],
    formats: ["Board PDF", "XLSX"] },
  { id: "risk", name: "Risk Committee Report", audience: "Risk Committee", cadence: "Monthly", tone: "red",
    summary: "Residual risk, top KRIs, model drift and circuit-breaker trips — the live risk picture.",
    sections: ["Risk register & residual", "Top KRIs", "Model drift (PSI)", "Incidents", "Circuit-breaker trips"],
    formats: ["Board PDF", "XLSX"] },
  { id: "framework", name: "Framework Conformity Report", audience: "CAIO / CISO", cadence: "On-demand", tone: "blue",
    summary: "Posture against the applied framework stack for the customer's jurisdiction, with gap analysis.",
    sections: ["Per-framework posture", "Jurisdiction stack", "Gap analysis", "Control mappings"],
    formats: ["Board PDF", "XLSX"], frameworks: ["All applied"] },
  { id: "value", name: "Value & ROI Report", audience: "CFO / Board", cadence: "Quarterly", tone: "gold",
    summary: "Expected vs realized value, portfolio ROI and cost governance across the initiative portfolio.",
    sections: ["Expected vs realized", "Portfolio ROI", "Cost governance", "Value at risk"],
    formats: ["XLSX", "PPTX", "Board PDF"] },
  { id: "security", name: "Security & Enforcement Report", audience: "CISO", cadence: "Monthly", tone: "red",
    summary: "Enforcement posture — decisions at runtime, breaker trips, egress denials and agent authority.",
    sections: ["Enforcement posture", "Circuit-breaker trips", "Egress denials", "Agent authority", "Threat surface"],
    formats: ["Board PDF", "XLSX"] },
  { id: "sustainability", name: "Sustainability Report", audience: "Board / ESG", cadence: "Quarterly", tone: "green",
    summary: "The environmental footprint of the AI estate and the reduction opportunities identified.",
    sections: ["Energy & carbon footprint", "ISO/IEC TR 20226 posture", "Reduction opportunities"],
    formats: ["Board PDF", "XLSX"], frameworks: ["ISO/IEC TR 20226"] },
  { id: "model", name: "Model Risk Report", audience: "Model Risk / CRO", cadence: "Monthly", tone: "blue",
    summary: "Model registry, drift, validation status and bias assessment across production models.",
    sections: ["Model registry", "Drift (PSI)", "Validation status", "Bias assessment"],
    formats: ["Board PDF", "XLSX"] },
  { id: "adoption", name: "Adoption & Workforce Report", audience: "CHRO / COO", cadence: "Monthly", tone: "gold",
    summary: "Adoption by business unit, academy readiness and usage trends with blockers surfaced.",
    sections: ["Adoption by unit", "Academy readiness", "Usage trends", "Blockers"],
    formats: ["Board PDF", "XLSX"] },
];
export const templateById = id => REPORT_TEMPLATES.find(t => t.id === id) || null;

/* Recurring deliveries already on the calendar. Deterministic seed rows. */
export const SCHEDULED_REPORTS = [
  { id: "SCH-01", template: "board",     cadence: "Quarterly", next: "1 Oct 2026 · Q4 FY26", recipients: "Board distribution list", format: "Board PDF",     owner: "CEO office" },
  { id: "SCH-02", template: "risk",      cadence: "Monthly",   next: "1 Sep 2026",           recipients: "Risk Committee",          format: "XLSX",          owner: "CRO" },
  { id: "SCH-03", template: "security",  cadence: "Monthly",   next: "1 Sep 2026",           recipients: "CISO + SecOps",           format: "Board PDF",     owner: "CISO" },
  { id: "SCH-04", template: "regulator", cadence: "On-demand", next: "On request",           recipients: "Regulator liaison",       format: "Regulator JSON", owner: "CGO" },
  { id: "SCH-05", template: "value",     cadence: "Quarterly", next: "1 Oct 2026 · Q4 FY26", recipients: "CFO + Board",             format: "PPTX",          owner: "CFO office" },
];

export function reportingStats() {
  return {
    templates: REPORT_TEMPLATES.length,
    scheduled: SCHEDULED_REPORTS.length,
    formats: FORMATS.length,
    audiences: new Set(REPORT_TEMPLATES.map(t => t.audience)).size,
    onDemand: REPORT_TEMPLATES.filter(t => t.cadence === "On-demand").length,
  };
}
