/* Apply the Prisma schema at build time when a real database is configured.
 *
 * Why: the User/Tenant tables must exist before self-serve registration and
 * username/password sign-in can work. `npm run db:push` does that, but it is a
 * manual step that never runs on a Vercel deploy — so a freshly configured
 * project would set AUTH_SECRET + DATABASE_URL and still hit "Could not create
 * the account" because the tables were never created. This runs the push
 * automatically on every build THAT HAS A REAL DATABASE, and is a clean no-op
 * for demo-only deploys, so the public showcase is unaffected.
 *
 * Mirrors lib/db.ts `dbConfigured()`: a localhost user:password placeholder is
 * treated as "not configured". */
import { execSync } from "node:child_process";

/* This step is BEST-EFFORT and must never fail the build: it is a deploy-time
 * convenience (creating the User/Tenant tables), not a build requirement. If the
 * database is missing, unreachable, or rejects the push, we log and exit 0 so the
 * site still deploys — the operator then fixes DATABASE_URL / DIRECT_URL and the
 * next build applies the schema. So this can never take down a previously-green
 * deploy. */
try {
  const url = process.env.DATABASE_URL || "";
  const real = url.startsWith("postgres") && !url.includes("user:password@localhost");

  if (!real) {
    console.log("[vercel-db] No production DATABASE_URL — skipping schema push (demo-only build).");
    process.exit(0);
  }
  if (!process.env.DIRECT_URL) {
    console.log(
      "[vercel-db] Note: DIRECT_URL is not set. Prisma uses the pooled DATABASE_URL for DDL, " +
      "which some connection poolers reject. If the push is skipped below, set DIRECT_URL to the " +
      "direct/session connection (Supabase: port 5432).",
    );
  }
  console.log("[vercel-db] Applying Prisma schema to the database (prisma db push)…");
  execSync("npx prisma db push --skip-generate", { stdio: "inherit" });
  console.log("[vercel-db] Schema applied — user accounts can now be created.");
} catch (err) {
  // Best-effort: warn, but let the build continue so the deploy still ships.
  console.warn("[vercel-db] Schema push skipped (non-fatal). Registration needs the tables — verify DATABASE_URL / DIRECT_URL are reachable and re-deploy.");
  console.warn("[vercel-db]", err?.message || String(err));
}
process.exit(0);
