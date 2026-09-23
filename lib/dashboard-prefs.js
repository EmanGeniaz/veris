/* ── Dashboard personalization (per-viewer) ──────────────────────────────
   Lets a user choose which sections of a dashboard they see. Each dashboard
   declares its own catalog of toggleable sections (below); a preference is a
   map of section-key -> boolean, stored per viewer + dashboard + role in
   localStorage (a UI convenience, like the guided-tour flag), so it survives
   reloads without the backend. Everything here is SSR-safe and wrapped in
   try/catch — a blocked or empty store just yields the defaults (all visible).
   The merge (normalizeSections) is pure, so it is unit-tested without a
   browser. */

/* Sections of the CEO command-center overview, in display order. */
export const CEO_SECTIONS = [
  { key: "oversight", label: "Cross-functional oversight", desc: "Every initiative and where each CXO stands on it." },
  { key: "attention", label: "Needs your attention",       desc: "The items surfaced above everything else." },
  { key: "kpis",      label: "Headline metrics",           desc: "The KPI strip — value, health, risk, compliance, adoption, incidents." },
  { key: "lifecycle", label: "AI projects by lifecycle",   desc: "Programs grouped by lifecycle stage." },
  { key: "exposure",  label: "Deployment map & budget",    desc: "Where AI is live, and budget turned to value." },
  { key: "adoption",  label: "Adoption & highest risk",    desc: "Adoption by business unit and the highest open risk." },
];

/* Sections of the generic executive cockpit (the other exec roles). */
export const COCKPIT_SECTIONS = [
  { key: "kpis",      label: "Headline metrics",         desc: "The KPI tiles in the header — value, health, decisions, risk, compliance." },
  { key: "narrative", label: "Veris Intelligence brief", desc: "The AI-written summary of where the enterprise stands." },
  { key: "snapshot",  label: "Enterprise snapshot",      desc: "The six-metric grid: value, health, maturity, compliance, risk, programs." },
  { key: "attention", label: "Attention required",       desc: "Items that need you now — blocks, scale-ready and low-adoption initiatives." },
  { key: "activity",  label: "Recent activity",          desc: "The latest executive events across the platform." },
  { key: "decisions", label: "Pending decisions",        desc: "Decisions and lifecycle gates waiting on your approval." },
];

const keysOf = (sections) => sections.map((s) => s.key);

/* Pure: given whatever was stored and the section keys, return a complete
   {key: boolean} map. A key missing from `stored` defaults to visible (true);
   only a genuine `false` hides a section; unknown/garbage keys are ignored, so
   a later release adding a section shows it by default. */
export function normalizeSections(stored, keys) {
  const out = {};
  const list = Array.isArray(keys) ? keys : [];
  const s = stored && typeof stored === "object" && !Array.isArray(stored) ? stored : {};
  for (const k of list) out[k] = s[k] === false ? false : true;
  return out;
}

const storageKey = (dashboardId, role) => `genveris.dashboard.${dashboardId || "default"}.${role || "default"}`;

/* Load the effective section map for a dashboard + role. Defaults (all visible)
   on SSR, a blocked/empty store, or malformed JSON. */
export function loadDashboardPrefs(dashboardId, role, sections) {
  const keys = keysOf(sections);
  if (typeof window === "undefined") return normalizeSections(null, keys);
  try {
    const raw = window.localStorage.getItem(storageKey(dashboardId, role));
    return normalizeSections(raw ? JSON.parse(raw) : null, keys);
  } catch {
    return normalizeSections(null, keys);
  }
}

/* Persist a section map. Best-effort — never throws. */
export function saveDashboardPrefs(dashboardId, role, prefs, sections) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(dashboardId, role), JSON.stringify(normalizeSections(prefs, keysOf(sections))));
  } catch {
    /* private mode / blocked storage — preference just isn't persisted */
  }
}
