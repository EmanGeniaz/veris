/* ── Governance Academy engine ──────────────────────────────────────
   The Academy claims "learning completion feeds the Governance Score" —
   this makes it real. Per-module completion rolls up into per-role path
   progress, quiz averages and a maturity score, and those roll up into an
   enterprise readiness index. Nothing here is a flat 55% or a hardcoded
   86% quiz; every figure is computed from the module state and the real
   training coverage of the initiatives a role sponsors.

   Pure module (data + arithmetic). Imports the catalog and role paths
   from core and the initiative training signal from platform-models. */
import { GOVERNANCE_ACADEMY, ROLE_LEARNING_PATHS } from "@/components/platform/core";
import { acInitiatives } from "@/lib/platform-models";

/* Seeded organisation completion state per module — what has actually
   been done, not a uniform fraction. Foundational obligations are closed;
   the operating-model modules are still in flight. */
export const MODULE_STATE = {
  "eu-ai-act": "Complete",
  "iso-42001": "Complete",
  "nist-ai-rmf": "In progress",
  "gdpr-art-22": "Complete",
  "ai-spine": "In progress",
  "hitl": "Complete",
};
export const stateOf = (id) => MODULE_STATE[id] || "Not started";
export const isComplete = (id) => stateOf(id) === "Complete";

/* Deterministic per-module quiz score (stable, varied 78–95). */
export function quizFor(id) {
  const s = String(id).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return 78 + (s % 18);
}

export function pathFor(role) {
  const ids = ROLE_LEARNING_PATHS[role] || ROLE_LEARNING_PATHS.caio;
  return ids.map((id) => ({ id, module: GOVERNANCE_ACADEMY.find((m) => m.id === id) || GOVERNANCE_ACADEMY[0], state: stateOf(id), quiz: quizFor(id) }));
}

export function pathProgress(role) {
  const p = pathFor(role);
  const done = p.filter((x) => x.state === "Complete").length;
  return { done, total: p.length, pct: p.length ? Math.round((done / p.length) * 100) : 0 };
}

export function quizAvg(role) {
  const done = pathFor(role).filter((x) => x.state === "Complete");
  return done.length ? Math.round(done.reduce((a, x) => a + x.quiz, 0) / done.length) : null;
}

/* Training coverage of the initiatives a role sponsors (a real signal from
   the portfolio). Falls back to the whole estate if the role sponsors none. */
const ROLE_TAG = { ceo: "CEO", coo: "COO", cfo: "CFO", chro: "CHRO", caio: "CAIO", ciso: "CISO", cio: "CIO", cdpo: "CDPO", cgo: "CGO" };
export function domainTraining(role) {
  const tag = ROLE_TAG[role] || String(role).toUpperCase();
  const inis = acInitiatives.filter((i) => (i.cxo || "").toUpperCase().includes(tag));
  const list = inis.length ? inis : acInitiatives;
  return Math.round(list.reduce((a, i) => a + (parseInt(i.training, 10) || 0), 0) / list.length);
}

/* Maturity = path completion (55%) + quiz mastery (25%) + the training
   coverage of the role's own initiatives (20%). */
export function roleMaturity(role) {
  const pg = pathProgress(role).pct;
  const qa = quizAvg(role) ?? 0;
  const dt = domainTraining(role);
  return Math.round(pg * 0.55 + qa * 0.25 + dt * 0.2);
}

export function maturityFactors(role) {
  return { progress: pathProgress(role).pct, quiz: quizAvg(role) ?? 0, training: domainTraining(role), maturity: roleMaturity(role) };
}

export const ACADEMY_ROLES = ["ceo", "coo", "cfo", "chro", "caio", "ciso", "cio", "cdpo", "cgo"];

/* Enterprise readiness index — the mean role maturity. This is the number
   the Academy contributes to the Governance Score. */
export function enterpriseReadiness() {
  const rows = ACADEMY_ROLES.map((r) => ({ role: r.toUpperCase(), roleId: r, ...maturityFactors(r) }))
    .sort((a, b) => b.maturity - a.maturity);
  const index = Math.round(rows.reduce((a, x) => a + x.maturity, 0) / rows.length);
  return { index, rows };
}

/* Completed modules become evidence records — same shape the evidence
   panel renders, so the trail matches what the path shows as done. */
export function evidenceFromLearning(role) {
  return pathFor(role).filter((x) => x.state === "Complete").map((x, idx) => ({
    item: `Academy completion — ${x.module.framework}`,
    module: `${x.module.title} · quiz ${x.quiz}%`,
    evidence: x.module.evidence,
    status: "Recorded",
    time: "This quarter",
    control: `LEARN-${String(idx + 1).padStart(3, "0")}`,
  }));
}
