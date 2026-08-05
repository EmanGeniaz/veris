# VerisZone — Setup (Supabase + Vercel)

VerisZone runs fully in **demo mode** with no configuration (localStorage + a
grounded AI simulation). Three independent env vars turn on real capabilities:

| Capability | Turned on by | Notes |
| --- | --- | --- |
| Live AI (real inference, advisor, guardrails, cost) | `ANTHROPIC_API_KEY` | Independent of the database |
| Durable data (Postgres instead of localStorage) | `DATABASE_URL` (a real URL) | Uses Supabase |
| Auth + server-side RBAC (403 on unauthorized writes) | `AUTH_SECRET` (+ a database) | Optional |

---

## 1. Live AI (fastest — no database needed)
Set one variable and redeploy:
- **Vercel:** Project → Settings → Environment Variables → add `ANTHROPIC_API_KEY`.
- **Local:** add `ANTHROPIC_API_KEY=...` to `.env`, restart `npm run dev`.

Optional: `VZ_GATEWAY_MODEL` (defaults to `claude-sonnet-5`).

---

## 2. Database (Supabase)

### 2a. Get the two connection strings
In Supabase: **Connect** (top bar) → **ORMs → Prisma**. You need both poolers:
- **Transaction pooler**, port **6543** → the running app (`DATABASE_URL`)
- **Session pooler**, port **5432** → migrations (`DIRECT_URL`)

Use the `...pooler.supabase.com` hostnames, not `db.[ref].supabase.co` (that
direct host is IPv6 and often unreachable from Vercel).

### 2b. Set env vars (Vercel → Settings → Environment Variables, and local `.env`)
```
DATABASE_URL="postgresql://postgres.[ref]:[PWD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.[ref]:[PWD]@aws-0-[region].pooler.supabase.com:5432/postgres"
AUTH_SECRET="<openssl rand -base64 32>"
ANTHROPIC_API_KEY="..."
```
`?pgbouncer=true&connection_limit=1` on `DATABASE_URL` keeps serverless from
exhausting pooled connections. `directUrl` in `prisma/schema.prisma` makes
`db push` use the 5432 URL automatically.

### 2c. Create tables + seed the demo tenant (run once, locally)
With `.env` filled in:
```bash
npm run db:push    # builds all tables from prisma/schema.prisma
npm run db:seed    # loads the demo tenant
```

### 2d. Redeploy
Trigger a Vercel redeploy so it picks up the env vars. Data now persists in
Supabase; with `AUTH_SECRET` set, auth + server-side RBAC are live too.

---

## Verify
- App builds: `npm run build`
- DB reachable: `npm run db:push` succeeds
- AI live: the Veris Intelligence advisor returns real answers (not the
  "simulation" fallback) once `ANTHROPIC_API_KEY` is set.
- **End-to-end check:** with the dev server running, `node scripts/verify-backend.mjs`
  exercises live inference, agent least-privilege enforcement, the PII policy
  guardrail, and confirms Article 12 inference events landed in your audit chain.
