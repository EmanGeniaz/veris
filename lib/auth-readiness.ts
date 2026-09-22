/* ── Auth / backend provisioning readiness (pure, secrets-safe) ──────────
   Auth and self-serve registration only work once AUTH_SECRET + DATABASE_URL
   (+ DIRECT_URL for migrations) are set in the deploy env and the schema is
   applied. When they aren't, the app runs demo-only with a placeholder secret.
   Operators need to CONFIRM provisioning without SSHing in — but the secrets
   must never leave the server.

   This helper reports which prerequisites are satisfied as BOOLEANS ONLY. It
   never returns, logs, or echoes a secret value, so it is safe to surface over
   an API. Pure (env in, verdict out) and mirrors lib/db.ts dbConfigured() and
   auth.ts's placeholder so the readiness view matches actual behaviour. */

const PLACEHOLDER_SECRET = "auth-disabled-placeholder";

export type AuthReadinessChecks = {
  authSecret: boolean;    // a real AUTH_SECRET (not the disabled placeholder)
  databaseUrl: boolean;   // a real Postgres URL (not the localhost placeholder)
  directUrl: boolean;     // DIRECT_URL set (recommended for schema push/migrations)
};

export type AuthReadiness = {
  ready: boolean;                 // auth can actually run (secret + database)
  checks: AuthReadinessChecks;
  missing: string[];              // NAMES of missing prerequisites, never values
  usingPlaceholderSecret: boolean;
  recommendDirectUrl: boolean;    // set DIRECT_URL so `prisma db push` won't be rejected by a pooler
};

/* True when DATABASE_URL points at a real Postgres (not the localhost
   user:password placeholder) — identical rule to lib/db.ts dbConfigured(). */
function realDatabaseUrl(url: string): boolean {
  return url.startsWith("postgres") && !url.includes("user:password@localhost");
}

export function authReadiness(env: NodeJS.ProcessEnv = process.env): AuthReadiness {
  const secret = env.AUTH_SECRET || "";
  const usingPlaceholderSecret = !secret || secret === PLACEHOLDER_SECRET;
  const checks: AuthReadinessChecks = {
    authSecret: !usingPlaceholderSecret,
    databaseUrl: realDatabaseUrl(env.DATABASE_URL || ""),
    directUrl: !!env.DIRECT_URL,
  };
  const missing: string[] = [];
  if (!checks.authSecret) missing.push("AUTH_SECRET");
  if (!checks.databaseUrl) missing.push("DATABASE_URL");
  if (!checks.directUrl) missing.push("DIRECT_URL");
  return {
    ready: checks.authSecret && checks.databaseUrl,
    checks,
    missing,
    usingPlaceholderSecret,
    recommendDirectUrl: checks.databaseUrl && !checks.directUrl,
  };
}
