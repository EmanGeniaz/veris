/* ── Workspace identity resolution (#168 / WS3) ───────────────────────────────
   The employee/manager cockpit has always greeted the user and rendered "your"
   data from a role-keyed persona SEED (USER_PROFILES[role]) — even after a real
   sign-in, so a signed-in employee saw a demo persona's name with no signal that
   it wasn't them. This is the honesty gap behind "live per-user data": before any
   surface can show a user's real data, the workspace has to know, and say, WHOSE
   data it is.

   This pure resolver returns the identity the cockpit should show, and whether it
   is the real signed-in user (live) or an illustrative persona (demo). Same
   live-vs-demo discipline as the TelemetryBadge and the assistant provenance.
   The authenticated user comes from the Auth.js session (name/email/role); the
   seed is the role persona used in demo mode. Never presents a persona as the
   signed-in user, and never invents an email for one. */

export type AuthUser = { name?: string; email?: string; role?: string } | null | undefined;
export type WorkspaceIdentity = { name: string; email: string; role: string; live: boolean; label: string };

export function resolveWorkspaceIdentity(opts: {
  authUser?: AuthUser;
  role: string;
  profiles?: Record<string, { name?: string; email?: string }>;
}): WorkspaceIdentity {
  const { authUser, role, profiles } = opts;
  // Live identity: a real signed-in user (has an email from the session).
  if (authUser && typeof authUser.email === "string" && authUser.email.length > 0) {
    return {
      name: authUser.name || authUser.email,
      email: authUser.email,
      role: authUser.role || role,
      live: true,
      label: "Signed in",
    };
  }
  // Demo identity: the role persona seed — clearly illustrative, never presented
  // as the signed-in user.
  const seed = (profiles && profiles[role]) || {};
  return {
    name: seed.name || role,
    email: seed.email || "",
    role,
    live: false,
    label: "Demo persona",
  };
}
