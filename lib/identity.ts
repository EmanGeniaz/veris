/* ── Least-privilege identity (BL-02) ────────────────────────────────────
   Self-serve registration must never let a caller choose their own role. A
   request that sends role:"ceo" (or any privileged role) must NOT be granted
   it — otherwise anyone can register straight into an executive account. New
   self-registered accounts are always created at the least-privilege default;
   elevation to a privileged role is an administrator action, out of band.

   Kept as a tiny pure function so the invariant is explicit and unit-tested. */

/* The role every self-registered account starts at. `employee` is the
   lowest-privilege role in the RBAC model. */
export const SELF_REGISTRATION_ROLE = "employee";

/* Always returns the least-privilege default, whatever the caller requested.
   The argument exists only to make the "ignored on purpose" intent obvious at
   the call site. */
export function resolveRegistrationRole(_requested?: unknown): string {
  return SELF_REGISTRATION_ROLE;
}
