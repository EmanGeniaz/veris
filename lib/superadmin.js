/* ── Super Admin (platform operator) engine ──────────────────────────────
   The platform-operator tier. A super admin does NOT author governance — no
   initiatives, ideas, risks or content. They provision organizations, enable
   which modules each org and role can see, define users and their RBAC access,
   and set org-wide policies that cascade to every level. Enable & override,
   not create.

   Pure data + helpers, deterministic and client-safe. State mutation happens in
   the console via React state seeded from here. */

/* Every grantable surface, grouped by area. ids mirror the app's real module
   / role / workspace ids so an enablement toggle maps to a real surface. */
export const SA_MODULE_GROUPS = [
  { id: "aicentral", label: "AI Central", note: "The AI transformation control plane (17 modules)", modules: [
    { id: "dashboard", label: "Executive Dashboard" }, { id: "strategy", label: "AI Strategy" }, { id: "portfolio", label: "AI Portfolio" },
    { id: "repository", label: "AI Repository" }, { id: "inventory", label: "AI Inventory" }, { id: "lifecycle", label: "AI Lifecycle" },
    { id: "gateway", label: "AI Gateway" }, { id: "agents", label: "Agent Control" }, { id: "risk", label: "Risk & Assurance" },
    { id: "trust", label: "Trust Center" }, { id: "evidence", label: "Evidence Fabric" }, { id: "templates", label: "Templates & Register" },
    { id: "controls", label: "Controls & Compliance" }, { id: "policies", label: "Policies & Standards" }, { id: "value", label: "Value Realization" },
    { id: "academy", label: "Governance Academy" }, { id: "audit", label: "Audit Center" },
  ] },
  { id: "exec", label: "Executive workspaces", note: "CXO command centers", modules: [
    { id: "ceo", label: "CEO Cockpit" }, { id: "coo", label: "COO Operating Model" }, { id: "cfo", label: "CFO Value Office" },
    { id: "chro", label: "CHRO Workforce" }, { id: "caio", label: "CAIO Governance" }, { id: "cio", label: "CIO Portfolio" },
    { id: "ciso", label: "CISO Security" }, { id: "cdpo", label: "CDPO Privacy" }, { id: "cgo", label: "CGO Compliance" },
    { id: "cro", label: "CRO Risk" }, { id: "legal", label: "Legal & Counsel" },
  ] },
  { id: "workforce", label: "Workforce", note: "Employee & manager workspaces", modules: [
    { id: "employee", label: "Employee Workspace" }, { id: "manager", label: "Team / Manager Workspace" },
  ] },
  { id: "platform", label: "Governance platform", note: "Cross-cutting surfaces", modules: [
    { id: "compliance", label: "Compliance & Standards" }, { id: "riskcenter", label: "Risk Center" }, { id: "reports", label: "Reports" },
    { id: "academy2", label: "Governance Academy" }, { id: "admin", label: "Admin Portal" },
  ] },
];
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
export const SA_CLEAN_BASELINE = ["dashboard", "strategy", "portfolio", "repository", "policies", "controls", "audit", "caio", "compliance", "riskcenter", "reports", "admin"];

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

/* Region options for a new org. */
export const SA_REGIONS = ["EU", "US", "UK", "APAC", "Canada", "Australia", "Global"];
export const SA_PLANS = ["Enterprise", "Growth", "Pilot"];

export function slugify(name) { return String(name).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40); }
