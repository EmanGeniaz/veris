# Enabling user accounts (registration + username/password sign-in)

By default the app runs in **demo mode** — the Demo Center is open and needs no
account. Self-serve **registration** and **username/password sign-in** turn on
when three environment variables are set and the database schema is applied.

## 1 · Provision a Postgres database
**Supabase** is recommended (the Prisma schema is written for it). Neon or
Vercel Postgres also work.

## 2 · Set environment variables (Vercel → Project → Settings → Environment Variables)

| Variable       | What it is                                                                 |
| -------------- | -------------------------------------------------------------------------- |
| `AUTH_SECRET`  | A 32-byte random secret. Generate: `openssl rand -base64 32`               |
| `DATABASE_URL` | App runtime connection — Supabase **Transaction pooler**, port `6543`, with `?pgbouncer=true&connection_limit=1` |
| `DIRECT_URL`   | Migration/DDL connection — Supabase **Session pooler / direct**, port `5432` |

See `.env.example` for the exact connection-string formats. `AUTH_SECRET` and
the database URLs are **secrets** — set them in Vercel, never commit them.

## 3 · Apply the schema
The build applies it **automatically**: `scripts/vercel-db.mjs` runs
`prisma db push` on any build that has a real `DATABASE_URL` (and is a clean
no-op for demo-only builds). So the first deploy after you set the variables
creates the `User` / `Tenant` tables. To do it by hand instead: `npm run db:push`.

## Result
Entry screen → **"New here? Create an account →"** → name / email / password →
the account is created (scrypt-hashed password) and signed in via Auth.js
Credentials. Returning users sign in with **email + password**. The Demo Center
stays open with no account.

## Optional · SSO
Microsoft Entra ID and Google switch on by setting their provider env pairs
(see the commented block in `.env.example`).
