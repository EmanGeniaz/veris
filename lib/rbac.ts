/* Canonical RBAC model — the single source of truth for role × module
   capability, shared by the Admin Portal UI and server-side enforcement.
   Pure (no database, no node APIs) so it is safe to import on the client.

   Effective capability = per-tenant override (if any) laid over the default
   grant for the role. The server persists overrides per tenant (RbacGrant);
   defaults below apply when no override exists. */

export const MODULES: [string, string][] = [
  ["ac", "AI Central"], ["risk", "Risk Center"], ["comp", "Compliance & Policies"],
  ["rep", "Reports & Value"], ["acad", "Academy"], ["dec", "Decisions & Approvals"], ["admin", "Administration"],
];
export const CAPS = ["none", "view", "contribute", "approve", "admin"] as const;
export type Cap = (typeof CAPS)[number];
export const RBAC_ROLES = ["caio", "cgo", "ciso", "cdpo", "cro", "cio", "ceo", "coo", "cfo", "chro", "legal", "manager", "employee"];

export type AccessMatrix = Record<string, Record<string, Cap>>;

export const DEFAULT_ACCESS: AccessMatrix = {
  caio:     { ac: "admin",      risk: "approve", comp: "approve", rep: "view",    acad: "view",       dec: "approve",    admin: "admin" },
  cgo:      { ac: "view",       risk: "approve", comp: "admin",   rep: "view",    acad: "view",       dec: "approve",    admin: "contribute" },
  ciso:     { ac: "view",       risk: "admin",   comp: "approve", rep: "view",    acad: "view",       dec: "contribute", admin: "contribute" },
  cdpo:     { ac: "view",       risk: "approve", comp: "approve", rep: "view",    acad: "view",       dec: "contribute", admin: "none" },
  cro:      { ac: "view",       risk: "approve", comp: "approve", rep: "view",    acad: "view",       dec: "approve",    admin: "none" },
  cio:      { ac: "admin",      risk: "view",    comp: "view",    rep: "view",    acad: "view",       dec: "contribute", admin: "admin" },
  ceo:      { ac: "view",       risk: "view",    comp: "view",    rep: "approve", acad: "view",       dec: "approve",    admin: "view" },
  coo:      { ac: "contribute", risk: "view",    comp: "view",    rep: "view",    acad: "view",       dec: "contribute", admin: "none" },
  cfo:      { ac: "view",       risk: "view",    comp: "view",    rep: "approve", acad: "view",       dec: "contribute", admin: "none" },
  chro:     { ac: "view",       risk: "view",    comp: "view",    rep: "view",    acad: "admin",      dec: "contribute", admin: "none" },
  legal:    { ac: "view",       risk: "view",    comp: "approve", rep: "view",    acad: "view",       dec: "contribute", admin: "none" },
  manager:  { ac: "view",       risk: "none",    comp: "view",    rep: "view",    acad: "contribute", dec: "contribute", admin: "none" },
  employee: { ac: "none",       risk: "none",    comp: "view",    rep: "none",    acad: "contribute", dec: "none",       admin: "none" },
};

export const capRank = (c: Cap): number => Math.max(0, CAPS.indexOf(c));
export const isCap = (v: unknown): v is Cap => typeof v === "string" && (CAPS as readonly string[]).includes(v);

/** Effective capability for a role on a module, with per-tenant overrides applied. */
export function capabilityFor(role: string, module: string, overrides: AccessMatrix = {}): Cap {
  const o = overrides[role]?.[module];
  if (o && isCap(o)) return o;
  return DEFAULT_ACCESS[role]?.[module] ?? "none";
}

/** True when `role` holds at least `minCap` on `module` (defaults + overrides). */
export function can(role: string | undefined | null, module: string, minCap: Cap, overrides: AccessMatrix = {}): boolean {
  if (!role) return false;
  return capRank(capabilityFor(role, module, overrides)) >= capRank(minCap);
}

/** Minimum capability a write to each persistence store requires. */
export const STORE_REQUIREMENT: Record<string, { module: string; minCap: Cap }> = {
  decisions: { module: "dec", minCap: "approve" },
  adminAudit: { module: "admin", minCap: "contribute" },
  rbacPolicy: { module: "admin", minCap: "admin" },
};
