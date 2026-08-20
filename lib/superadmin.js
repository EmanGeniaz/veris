/* ── Super Admin (platform operator) engine ──────────────────────────────
   The platform-operator tier. A super admin does NOT author governance — no
   initiatives, ideas, risks or content. They provision organizations, enable
   which modules each org and role can see, define users and their RBAC access,
   and set org-wide policies that cascade to every level. Enable & override,
   not create.

   Pure data + helpers, deterministic and client-safe. State mutation happens in
   the console via React state seeded from here. */

/* Every grantable surface, mapped granularly. ids mirror the app's real module
   / surface ids (AI_CENTRAL_NAV + each role-center's surfaces), so a toggle maps
   to a real, enable-able surface — not a coarse workspace switch. Grouped by
   area and role; the console renders each group collapsible. */
export const SA_MODULE_GROUPS = [
  { id: "aicentral", area: "AI Central", label: "AI Central", note: "The AI transformation control plane", modules: [
    { id: "dashboard", label: "Executive Dashboard" }, { id: "strategy", label: "AI Strategy" }, { id: "portfolio", label: "AI Portfolio" },
    { id: "repository", label: "AI Repository" }, { id: "inventory", label: "AI Inventory" }, { id: "lifecycle", label: "AI Lifecycle" },
    { id: "gateway", label: "AI Gateway" }, { id: "agents", label: "Agent Control" }, { id: "risk", label: "Risk & Assurance" },
    { id: "trust", label: "Trust Center" }, { id: "evidence", label: "Evidence Fabric" }, { id: "templates", label: "Templates & Register" },
    { id: "controls", label: "Controls & Compliance" }, { id: "policies", label: "Policies & Standards" }, { id: "value", label: "Value Realization" },
    { id: "academy", label: "Governance Academy" }, { id: "audit", label: "Audit Center" },
  ] },
  { id: "ceo", area: "Executive", label: "CEO Cockpit", note: "Chief Executive Officer", modules: [
    { id: "ceo_home", label: "Overview" }, { id: "ceoplaybook", label: "AI Playbook" }, { id: "ceoportfolio", label: "Portfolio" },
    { id: "ceobudget", label: "Budget" }, { id: "ceorisk", label: "Risk Center" }, { id: "ceoactions", label: "My Action Items" }, { id: "ceoreporting", label: "Reporting" },
  ] },
  { id: "caio", area: "Executive", label: "CAIO Governance", note: "Chief AI Officer", modules: [
    { id: "caio_home", label: "Overview" }, { id: "caioplaybook", label: "AI Playbook" }, { id: "caiogov", label: "Governance" },
    { id: "caioaia", label: "Impact Assessment" }, { id: "caiorisk", label: "Risk" }, { id: "caioincidents", label: "Incidents" },
    { id: "caiolibrary", label: "Library" }, { id: "caioreports", label: "Reports" },
  ] },
  { id: "coo", area: "Executive", label: "COO Operating Model", note: "Chief Operating Officer", modules: [
    { id: "coo_playbook", label: "Operations Playbook" }, { id: "coo_automation", label: "Process Automation" }, { id: "coo_sla", label: "Performance & SLAs" },
    { id: "coo_capacity", label: "Workforce Capacity" }, { id: "coo_risk", label: "Operational Risk" }, { id: "coo_reports", label: "Reports" },
  ] },
  { id: "cfo", area: "Executive", label: "CFO Value Office", note: "Chief Financial Officer", modules: [
    { id: "cfo_portfolio", label: "Investment Portfolio" }, { id: "cfo_value", label: "Value & ROI" }, { id: "cfo_cost", label: "Cost & Run-rate" },
    { id: "cfo_budget", label: "Budget & Forecast" }, { id: "cfo_risk", label: "Financial Risk" }, { id: "cfo_reports", label: "Reports" },
  ] },
  { id: "chro", area: "Executive", label: "CHRO Workforce", note: "Chief Human Resources Officer", modules: [
    { id: "chro_playbook", label: "Workforce Playbook" }, { id: "chro_adoption", label: "Adoption & Enablement" }, { id: "chro_skills", label: "Skills & Reskilling" },
    { id: "chro_impact", label: "Role Impact" }, { id: "chro_sentiment", label: "Sentiment & Feedback" }, { id: "chro_reports", label: "Reports" },
  ] },
  { id: "ciso", area: "Executive", label: "CISO Security", note: "Chief Information Security Officer", modules: [
    { id: "ciso_enforce", label: "Veris Enforce" }, { id: "ciso_authority", label: "Agent Authority" }, { id: "ciso_ledger", label: "Tool-Call Ledger" },
    { id: "ciso_mcp", label: "MCP Registry" }, { id: "ciso_egress", label: "Egress Policy" }, { id: "ciso_hitl", label: "HITL Gates" },
    { id: "ciso_breaker", label: "Circuit Breaker" }, { id: "ciso_threat", label: "Threat Center" }, { id: "ciso_workflows", label: "Agent Chain Permissions" },
    { id: "ciso_incidents", label: "AI Incidents" }, { id: "ciso_vuln", label: "Vulnerabilities" }, { id: "ciso_guardrails", label: "Guardrails & Controls" },
    { id: "ciso_redteam", label: "Red-Team" }, { id: "ciso_reports", label: "Reports" },
  ] },
  { id: "cio", area: "Executive", label: "CIO Portfolio", note: "Chief Information Officer", modules: [
    { id: "cio_health", label: "Platform Health" }, { id: "cio_registry", label: "Model Registry" }, { id: "cio_gateway", label: "Gateway & Routing" },
    { id: "cio_integrations", label: "Integrations" }, { id: "cio_cost", label: "Cost & Performance" }, { id: "cio_reports", label: "Reports" },
  ] },
  { id: "cdpo", area: "Executive", label: "CDPO Privacy", note: "Chief Data Privacy Officer", modules: [
    { id: "cdpo_playbook", label: "Privacy Playbook" }, { id: "cdpo_dpia", label: "DPIA & Assessments" }, { id: "cdpo_datamap", label: "Data Map & Residency" },
    { id: "cdpo_consent", label: "Consent & Rights" }, { id: "cdpo_incidents", label: "Privacy Incidents" }, { id: "cdpo_reports", label: "Reports" },
  ] },
  { id: "cgo", area: "Executive", label: "CGO Compliance", note: "Chief Compliance & Governance Officer", modules: [
    { id: "cgo_forum", label: "Governance Forum" }, { id: "cgo_incidents", label: "Incident Playbook" }, { id: "cgo_breach", label: "Breach Notification" }, { id: "cgo_aia", label: "Impact Assessments" }, { id: "cgo_crosswalk", label: "Convergence Crosswalk" },
    { id: "cgo_redlines", label: "Prohibited Practices" }, { id: "cgo_gpai", label: "GPAI Exposure" }, { id: "cgo_gapclosure", label: "Gap Closure" },
    { id: "cgo_jurisdictions", label: "Jurisdiction Atlas" }, { id: "cgo_soa", label: "ISO 42001 Readiness" }, { id: "cgo_freshness", label: "Evidence Freshness" },
    { id: "cgo_glossary", label: "Governance Glossary" }, { id: "cgo_drift", label: "Drift Monitor" }, { id: "cgo_workflows", label: "Agent Chain Permissions" },
    { id: "cgo_art12", label: "Article 12 Log" }, { id: "cgo_enforce", label: "Veris Enforce" }, { id: "cgo_ledger", label: "Tool-Call Ledger" },
    { id: "cgo_mcp", label: "MCP Registry" }, { id: "cgo_hitl", label: "HITL Gates" }, { id: "cgo_breaker", label: "Circuit Breaker" },
    { id: "cgo_playbook", label: "Governance Playbook" }, { id: "cgo_policies", label: "Policies & Controls" }, { id: "cgo_regulatory", label: "Regulatory Posture" },
    { id: "cgo_board", label: "Board & Audit" }, { id: "cgo_risk", label: "Enterprise Risk" }, { id: "cgo_reports", label: "Reports" },
  ] },
  { id: "cro", area: "Executive", label: "CRO Risk", note: "Chief Risk Officer", modules: [
    { id: "cro_appetite", label: "Risk Appetite" }, { id: "cro_register", label: "Risk Register" }, { id: "cro_controls", label: "Controls & KRIs" },
    { id: "cro_audit", label: "Audit Readiness" }, { id: "cro_reports", label: "Reports" },
  ] },
  { id: "legal", area: "Executive", label: "Legal & Counsel", note: "General Counsel & Compliance", modules: [
    { id: "legal_regulatory", label: "Regulatory Map" }, { id: "legal_crosswalk", label: "Convergence Crosswalk" }, { id: "legal_jurisdictions", label: "Jurisdiction Atlas" },
    { id: "legal_contracts", label: "Contracts & IP" }, { id: "legal_conformity", label: "Conformity" }, { id: "legal_art12", label: "Article 12 Log" },
    { id: "legal_evidence", label: "Legal Evidence" }, { id: "legal_reports", label: "Reports" },
  ] },
  { id: "employee", area: "Workforce", label: "Employee Workspace", note: "Individual contributor", modules: [
    { id: "emp_assistant", label: "My AI Assistant" }, { id: "emp_hub", label: "AI Hub" }, { id: "emp_projects", label: "My Initiatives" },
    { id: "emp_tasks", label: "My Tasks" }, { id: "emp_usage", label: "How I'm doing" }, { id: "emp_risk", label: "Risk & Compliance" },
    { id: "emp_learning", label: "Governance Academy" }, { id: "emp_requests", label: "My Requests" }, { id: "emp_reports", label: "My Reports" }, { id: "emp_help", label: "Help" },
  ] },
  { id: "manager", area: "Workforce", label: "Manager Workspace", note: "People / team manager", modules: [
    { id: "mgr_assistant", label: "My AI Assistant" }, { id: "mgr_hub", label: "Team AI Hub" }, { id: "mgr_projects", label: "Team Projects" },
    { id: "mgr_tasks", label: "Team Tasks" }, { id: "mgr_usage", label: "Team Usage" }, { id: "mgr_risk", label: "Team Risk & Compliance" },
    { id: "mgr_learning", label: "Team Academy" }, { id: "mgr_approvals", label: "Approvals" }, { id: "mgr_reports", label: "Team Reports" }, { id: "mgr_help", label: "Help" },
  ] },
  { id: "platform", area: "Platform", label: "Governance platform", note: "Cross-cutting surfaces", modules: [
    { id: "compliance", label: "Compliance & Standards" }, { id: "riskcenter", label: "Risk Center" }, { id: "reports", label: "Reports" },
    { id: "academy2", label: "Governance Academy" }, { id: "admin", label: "Admin Portal" },
  ] },
];
/* Ordered list of area labels for the group headers. */
export const SA_AREAS = ["AI Central", "Executive", "Workforce", "Platform"];
export const SA_ALL_MODULE_IDS = SA_MODULE_GROUPS.flatMap(g => g.modules.map(m => m.id));
export const SA_MODULE_COUNT = SA_ALL_MODULE_IDS.length;

/* RBAC capability ladder (mirrors lib/rbac CAPS). */
export const SA_CAPS = ["none", "view", "contribute", "approve", "admin"];
export const SA_CAP_META = {
  none: { label: "No access", color: "#8A94A6" }, view: { label: "View", color: "#3B82F6" },
  contribute: { label: "Contribute", color: "#22C55E" }, approve: { label: "Approve", color: "#D6A84F" },
  admin: { label: "Admin", color: "#EF4444" },
};

/* Roles a super admin can assign to a user (the app's real roles). */
export const SA_ROLES = [
  { id: "ceo", label: "CEO" }, { id: "coo", label: "COO" }, { id: "cfo", label: "CFO" }, { id: "chro", label: "CHRO" },
  { id: "caio", label: "CAIO" }, { id: "cio", label: "CIO" }, { id: "ciso", label: "CISO" }, { id: "cdpo", label: "CDPO" },
  { id: "cgo", label: "CGO" }, { id: "cro", label: "CRO" }, { id: "legal", label: "Legal" },
  { id: "manager", label: "Manager" }, { id: "employee", label: "Employee" },
];

/* Seeded organizations (tenants). A super admin can add a new one — clean, no
   demo data. The seeded orgs stand in for existing customers. */
export const SA_ORGS = [
  { id: "acme", name: "Acme Financial Group", slug: "acme", plan: "Enterprise", region: "EU", status: "Active", seeded: true, users: 1240, created: "2026-02-11" },
  { id: "northwind", name: "Northwind Bank", slug: "northwind", plan: "Enterprise", region: "US", status: "Active", seeded: true, users: 860, created: "2026-03-04" },
  { id: "meridian", name: "Meridian Health", slug: "meridian", plan: "Growth", region: "APAC", status: "Active", seeded: true, users: 410, created: "2026-05-20" },
];

/* Default module enablement per org: seeded customers have the full suite;
   the operator narrows or overrides from there. */
export function defaultEnabled() { return new Set(SA_ALL_MODULE_IDS); }
/* A brand-new (clean) org gets a conservative baseline — AI Central core + the
   platform surfaces — and the operator enables the rest deliberately. */
export const SA_CLEAN_BASELINE = ["dashboard", "strategy", "portfolio", "repository", "policies", "controls", "audit", "caio_home", "caiogov", "compliance", "riskcenter", "reports", "admin"];

/* Seeded users per org (the operator can add more). */
export const SA_USERS = {
  acme: [
    { id: "u-acme-1", name: "Maya Chen", email: "maya.chen@acme.com", role: "ceo", access: "admin" },
    { id: "u-acme-2", name: "Aisha Patel", email: "aisha.patel@acme.com", role: "caio", access: "admin" },
    { id: "u-acme-3", name: "Jordan Sinclair", email: "jordan.sinclair@acme.com", role: "ciso", access: "approve" },
    { id: "u-acme-4", name: "Jamie Park", email: "jamie.park@acme.com", role: "employee", access: "view" },
  ],
  northwind: [
    { id: "u-nw-1", name: "Elena Rossi", email: "elena.rossi@northwind.com", role: "cfo", access: "approve" },
    { id: "u-nw-2", name: "Rafael Torres", email: "rafael.torres@northwind.com", role: "cgo", access: "admin" },
  ],
  meridian: [
    { id: "u-mer-1", name: "Deepa Nair", email: "deepa.nair@meridian.com", role: "cro", access: "approve" },
  ],
};

/* Org-wide policies the operator can enable; enabling cascades to every level
   (CXO → manager → employee). Ids/keys mirror the platform policy register. */
export const SA_POLICIES = [
  { id: "POL-RAI-001", name: "Responsible AI Use", category: "Responsible AI", scope: "All AI systems & users", cascade: ["Executive", "Manager", "Employee"] },
  { id: "POL-DH-002", name: "Data Handling & Classification", category: "Data", scope: "All data touching AI", cascade: ["Executive", "Manager", "Employee"] },
  { id: "POL-HO-003", name: "Human Oversight on High-Stakes Actions", category: "Oversight", scope: "High-risk AI decisions", cascade: ["Executive", "Manager"] },
  { id: "POL-VEN-004", name: "Vendor & Model Approval", category: "Supply chain", scope: "Third-party models & tools", cascade: ["Executive", "Manager"] },
  { id: "POL-EGR-005", name: "Egress & Data Loss Prevention", category: "Security", scope: "All gateway traffic", cascade: ["Executive", "Manager", "Employee"] },
  { id: "POL-RET-006", name: "Model & Data Retention", category: "Lifecycle", scope: "All AI assets", cascade: ["Executive", "Manager"] },
];

/* Platform operators — the super-admin tier itself. An operator can appoint
   another operator (platform-wide, not org-scoped). */
export const SA_OPERATORS = [
  { id: "op-root", name: "Platform Operator", email: "root@veriszone.ai", scope: "All organizations", status: "Owner" },
  { id: "op-2", name: "Sam Rivera", email: "sam.rivera@veriszone.ai", scope: "All organizations", status: "Operator" },
];

/* Region options for a new org. */
export const SA_REGIONS = ["EU", "US", "UK", "APAC", "Canada", "Australia", "Global"];
export const SA_PLANS = ["Enterprise", "Growth", "Pilot"];

export function slugify(name) { return String(name).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40); }
