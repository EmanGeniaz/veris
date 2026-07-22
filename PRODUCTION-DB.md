# VerisZone - Activating Real Persistence (Phase 2a)

The platform runs fully without a database: evidence, decisions and
ideas persist in the browser (localStorage). When `DATABASE_URL` points
at a real Postgres instance, the same records mirror to the database and
hydrate back on entry - no code changes needed.

## Setup (Vercel Postgres)

1. Vercel dashboard → your `veris` project → **Storage** → Create → **Postgres**.
2. Connect it to the project. Vercel injects `DATABASE_URL` automatically
   (use the `POSTGRES_PRISMA_URL` value as `DATABASE_URL` if prompted).
3. Set `VZ_SETUP_TOKEN` in Vercel env vars (any random string) and redeploy.
4. Visit `https://<your-domain>/api/admin/setup?token=<that string>` once.
   It creates the tables and seeds the demo tenant - no local CLI needed.
   (Alternative for CLI users: `npx prisma db push` + `npm run db:seed`.)
5. Remove or rotate `VZ_SETUP_TOKEN` afterwards. The `/api/bus/*` routes
   detect the database and switch on automatically.

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

## Phase 2b - Authentication

Auth activates when both a database and `AUTH_SECRET` are configured;
until then the demo entry flow is unchanged.

1. Set `AUTH_SECRET` in Vercel (generate with `npx auth secret`).
2. Optional SSO: set `AUTH_MICROSOFT_ENTRA_ID_ID/_SECRET/_ISSUER` or
   `AUTH_GOOGLE_ID/_SECRET`. Providers appear automatically.
3. Credentials sign-in works against seeded users:
   `<role>@veriszone.demo` / `veriszone-demo` (rotate in production).
4. When signed in, evidence, decisions and ideas are stamped with the
   user's identity and scoped to the user's tenant.

## Phase 3 - Live AI Gateway

Set `ANTHROPIC_API_KEY` in Vercel (optionally `VZ_GATEWAY_MODEL`,
default claude-sonnet-5). The Workbench then routes prompts through
`/api/gateway/chat`: credential prompts are blocked and PII masked
server-side before any model call, internal enterprise knowledge is
retrieved first, and every answer declares its source (Hybrid when
grounded internally, External otherwise). Without the key, the
simulated demo path continues unchanged.
