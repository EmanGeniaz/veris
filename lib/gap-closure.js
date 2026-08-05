/* Gap closure — the five capabilities the convergence crosswalk last flagged as
   gaps, turned into owned, evidenced closures. Two had no external dependency
   and were closed outright (their artifact now exists); three are tied to a live
   open finding and are in-flight closures that will reach operational when that
   finding clears. Live status is read from the crosswalk so this workspace and
   the crosswalk can never disagree. */

import { CROSSWALK, crosswalkStats } from "./crosswalk";

export const GAP_CLOSURES = [
  { ref: "C23", capability: "GenAI output marking & disclosure",  artifact: "AI-content labelling standard", owner: "Leila Haddad · CAIO",  action: "Publish the enterprise standard for marking machine-generated output.", clears: "No Art. 50 marking standard existed", euai: "Art. 50",            target: "Closed · Aug 2026" },
  { ref: "C32", capability: "Redress & complaint handling",       artifact: "Complaints & appeals log",       owner: "General Counsel · Legal", action: "Stand up the channel for affected persons to contest a decision.",    clears: "No standing redress channel",       euai: "Art. 85",            target: "Closed · Aug 2026" },
  { ref: "C12", capability: "Personal-data protection & residency", artifact: "DPIA + transfer mapping",       owner: "Priya Mehta · CDPO",     action: "Art. 44 transfer impact assessment complete for the APAC flow.",       clears: "INC-1048 contained · APAC transfer gap closed", euai: "GDPR Art. 44", target: "Closed · Aug 2026" },
  { ref: "C18", capability: "Explainability & interpretability",  artifact: "Explainability record",          owner: "Leila Haddad · CAIO",    action: "SHAP reason codes + Art. 22 explanations live for adverse credit decisions.", clears: "RSK-005 treated · explainability gap on Credit Decision", euai: "Art. 13", target: "Closed · Aug 2026" },
  { ref: "C27", capability: "Drift & change management",          artifact: "Drift monitoring configuration", owner: "D. Osei · Model Risk",   action: "All production models wired to drift monitoring.",                     clears: "Drift coverage complete across production models", euai: "Art. 72",    target: "Closed · Aug 2026" },
];

/* Each closure carries the crosswalk's live status — never a second copy. */
export function gapClosureRows() {
  return GAP_CLOSURES.map(g => {
    const c = CROSSWALK.find(x => x.id === g.ref) || {};
    return { ...g, status: c.status || "gap", note: c.note };
  });
}

export function gapClosureStats() {
  const rows = gapClosureRows();
  const cw = crosswalkStats();
  return {
    total: rows.length,
    closed: rows.filter(r => r.status === "operational").length,
    inflight: rows.filter(r => r.status === "progress").length,
    remaining: cw.gap,       // unowned gaps left across the whole crosswalk
    coverage: cw.coverage,
  };
}
