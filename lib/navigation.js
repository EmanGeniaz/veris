/* ── VerisZone Central Navigation Registry ─────────────────────────
   One source of truth for "where does a business object go". VerisZone
   is a global-state SPA (tab / aiCentralView / selected initiative), so a
   canonical destination is a state descriptor, not a URL string - but the
   principle is the same: no component decides an object's destination on
   its own, every clickable object resolves through this registry.

   resolveDestination(objectType, ctx) -> descriptor  (pure, inspectable)
   navigateTo(objectType, ctx, actions)               (applies descriptor)

   A descriptor is { tab, view?, initiativeId?, initTab?, label, owner }.
   `owner` names the surface that owns the object (for audits + breadcrumbs).
   Context (role, selected initiative, filters, phase) lives in the shell's
   global state and is never reset by navigation - switching tabs preserves
   it by construction. */

/* Business object -> canonical destination. `resolve` returns the state
   descriptor; ctx carries the object id and any routing context. */
export const NavigationRegistry = {
  /* Enterprise objects that own a top-level surface */
  initiative:   { owner: "aicentral", resolve: c => ({ tab: "aicentral", view: "initiatives", initiativeId: c.id, initTab: c.initTab || "overview", label: "AI Initiative Workspace" }) },
  phase:        { owner: "aicentral", resolve: c => ({ tab: "aicentral", view: "initiatives", initiativeId: c.id, initTab: "journey", label: "Phase Workspace" }) },
  model:        { owner: "aicentral", resolve: () => ({ tab: "aicentral", view: "models", label: "AI Model Registry" }) },
  evidence:     { owner: "aicentral", resolve: () => ({ tab: "aicentral", view: "evidence", label: "Trust & Evidence" }) },
  pmo:          { owner: "aicentral", resolve: c => (c.id ? { tab: "aicentral", view: "initiatives", initiativeId: c.id, initTab: "pmo", label: "AI PMO" } : { tab: "aicentral", view: "pmo", label: "Portfolio Delivery Office" }) },
  governance:   { owner: "aicentral", resolve: c => (c.id ? { tab: "aicentral", view: "initiatives", initiativeId: c.id, initTab: "governance", label: "Governance" } : { tab: "aicentral", view: "governance", label: "AI Governance" }) },
  value:        { owner: "aicentral", resolve: c => (c.id ? { tab: "aicentral", view: "initiatives", initiativeId: c.id, initTab: "value", label: "Business Value" } : { tab: "reports", label: "Value Analytics" }) },
  monitoring:   { owner: "aicentral", resolve: c => ({ tab: "aicentral", view: "initiatives", initiativeId: c.id, initTab: "monitoring", label: "Monitoring" }) },
  portfolio:    { owner: "aicentral", resolve: () => ({ tab: "aicentral", view: "portfolio", label: "Portfolio" }) },
  enterpriseHealth: { owner: "aicentral", resolve: () => ({ tab: "aicentral", view: "portfolio", label: "Portfolio Health" }) },

  risk:         { owner: "riskcenter", resolve: () => ({ tab: "riskcenter", label: "Risk Center" }) },
  treatment:    { owner: "riskcenter", resolve: () => ({ tab: "riskcenter", label: "Treatment Plan" }) },

  policy:       { owner: "compliance", resolve: () => ({ tab: "policies", label: "Policy register" }) },
  control:      { owner: "compliance", resolve: () => ({ tab: "controls", label: "Control Library" }) },
  compliance:   { owner: "compliance", resolve: () => ({ tab: "compliance", label: "Compliance & Standards" }) },
  standard:     { owner: "compliance", resolve: () => ({ tab: "compliance", label: "Frameworks" }) },

  decision:     { owner: "decisions", resolve: () => ({ tab: "decisions", label: "Decision Workspace" }) },
  approval:     { owner: "decisions", resolve: () => ({ tab: "decisions", label: "Decision Workspace" }) },

  report:       { owner: "reports", resolve: () => ({ tab: "reports", label: "Reports" }) },
  portfolioValue: { owner: "reports", resolve: () => ({ tab: "reports", label: "Value Analytics" }) },

  learning:     { owner: "academy", resolve: () => ({ tab: "academy", label: "Governance Academy" }) },
  course:       { owner: "academy", resolve: () => ({ tab: "academy", label: "Governance Academy" }) },
  certification:{ owner: "academy", resolve: () => ({ tab: "academy", label: "Governance Academy" }) },
  training:     { owner: "academy", resolve: () => ({ tab: "academy", label: "Governance Academy" }) },
  maturity:     { owner: "academy", resolve: () => ({ tab: "academy", label: "Maturity Assessment" }) },

  knowledge:    { owner: "compliance", resolve: () => ({ tab: "knowledge", label: "Knowledge" }) },
  template:     { owner: "playbook", resolve: () => ({ tab: "templates", label: "Templates" }) },
  runbook:      { owner: "playbook", resolve: () => ({ tab: "playbook", label: "Playbook" }) },

  /* A person resolves to the initiative they own - their business context */
  person:       { owner: "aicentral", resolve: c => ({ tab: "aicentral", view: "initiatives", initiativeId: c.initiativeId, initTab: "overview", label: "Team Profile" }) },

  /* Dashboard KPI tiles - each owns a canonical destination */
  kpiValue:     { owner: "reports", resolve: () => ({ tab: "reports", label: "Value Analytics" }) },
  kpiHealth:    { owner: "aicentral", resolve: () => ({ tab: "aicentral", view: "portfolio", label: "Portfolio Health" }) },
  kpiMaturity:  { owner: "academy", resolve: () => ({ tab: "academy", label: "AI Maturity" }) },
  kpiCompliance:{ owner: "compliance", resolve: () => ({ tab: "compliance", label: "Compliance" }) },
  kpiRisks:     { owner: "riskcenter", resolve: () => ({ tab: "riskcenter", label: "Risk Center" }) },
  kpiDecisions: { owner: "decisions", resolve: () => ({ tab: "decisions", label: "Decision Workspace" }) },
};

/* Pure resolver - returns the canonical destination descriptor. Throws for
   an unregistered object type so misuse surfaces in development. */
export function resolveDestination(objectType, ctx = {}) {
  const entry = NavigationRegistry[objectType];
  if (!entry) throw new Error(`NavigationRegistry: no destination for "${objectType}"`);
  return entry.resolve(ctx);
}

/* Applies a descriptor through the shell's state actions. Components call
   navigateTo(objectType, ctx, actions) instead of hand-writing setTab/
   setView combinations, so an object's destination can never diverge
   between two call sites. */
export function navigateTo(objectType, ctx, actions) {
  const d = resolveDestination(objectType, ctx);
  if (d.initiativeId && actions.setInitToOpen) actions.setInitToOpen(d.initiativeId, d.initTab);
  if (d.view && actions.setAiCentralView) actions.setAiCentralView(d.view);
  if (actions.setTab) actions.setTab(d.tab);
  return d;
}

/* Every registered object type - used by the click-integrity audit. */
export const NAV_OBJECT_TYPES = Object.keys(NavigationRegistry);

/* ── Breadcrumb engine ─────────────────────────────────────────────
   Breadcrumbs are generated from the current location, never hardcoded.
   buildBreadcrumbs(location) -> [{label, target?}] where target is a
   registry object type for one-click return. */
const SURFACE_LABEL = {
  home: "Dashboard", aicentral: "AI Central", playbook: "Playbook",
  compliance: "Compliance & Standards", policies: "Compliance & Standards",
  controls: "Compliance & Standards", riskcenter: "Risk Center",
  reports: "Reports", academy: "Governance Academy", decisions: "Decision Workspace",
  knowledge: "Compliance & Standards", templates: "Playbook",
  myworkspace: "My Workspace", workbench: "AI Assistant", teamspace: "Team Workspace",
};
const AC_VIEW_LABEL = {
  dashboard: "Portfolio Overview", initiatives: "AI Initiatives", pmo: "AI PMO",
  models: "AI Models", governance: "AI Governance", evidence: "Trust & Evidence",
  portfolio: "Portfolio", gateway: "AI Gateway", admin: "Administration", academy: "Governance Academy",
};
export function buildBreadcrumbs({ tab, view, initiativeName, initiativeUnit, initTab, initTabLabel }) {
  const crumbs = [{ label: "Dashboard", type: "kpiHealth" }];
  if (tab !== "home") crumbs.push({ label: SURFACE_LABEL[tab] || tab });
  if (tab === "aicentral") {
    if (view && view !== "dashboard") crumbs.push({ label: AC_VIEW_LABEL[view] || view });
    if (view === "initiatives" && initiativeName) {
      if (initiativeUnit) crumbs.push({ label: initiativeUnit });
      crumbs.push({ label: initiativeName, type: "initiative" });
      if (initTab && initTab !== "overview") crumbs.push({ label: initTabLabel || initTab });
    }
  }
  return crumbs;
}
