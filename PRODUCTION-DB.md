# VerisZone - Activating Real Persistence (Phase 2a)

The platform runs fully without a database: evidence, decisions and
ideas persist in the browser (localStorage). When `DATABASE_URL` points
at a real Postgres instance, the same records mirror to the database and
hydrate back on entry - no code changes needed.

## Setup (Vercel Postgres)

1. Vercel dashboard → your `veris` project → **Storage** → Create → **Postgres**.
2. Connect it to the project. Vercel injects `DATABASE_URL` automatically
   (use the `POSTGRES_PRISMA_URL` value as `DATABASE_URL` if prompted).
3. Push the schema and seed the demo tenant (from a machine with the repo):
   ```bash
   DATABASE_URL="<your-connection-string>" npx prisma db push
   DATABASE_URL="<your-connection-string>" npm run db:seed
   ```
   (`prisma/init.sql` contains the equivalent raw SQL if you prefer to run it directly.)
4. Redeploy. The `/api/bus/*` routes detect the database and switch on.

## What persists today
- Evidence records (`/api/bus/evidence`) - treatment updates, runbook executions, phase artifacts
- Executive decisions (`/api/bus/decisions`)
- Employee AI ideas (`/api/bus/ideas`)
- Seeded reference data: initiatives, risk register, KRIs, knowledge assets (demo tenant)

## What stays local for now
- Workbench conversations (privacy: content never leaves the browser until Phase 3's gateway handles it)
- Feedback scores and custom initiatives (Phase 2b, with auth)

## Next (Phase 2b)
Auth.js sign-in with SSO, per-user identity on every record, and
multi-tenant separation beyond the demo tenant.
