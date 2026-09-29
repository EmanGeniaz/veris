# Runbook — BL-00: Provision production secrets (auth · database · live telemetry)

**Owner:** Platform / Ops · **Audience:** whoever holds the deploy-environment and
database credentials · **Risk:** low (additive; reversible by unsetting variables)
· **Est. time:** 20–30 min

> This is the operational runbook. For the one-paragraph happy path see
> [`docs/AUTH-SETUP.md`](../AUTH-SETUP.md); for the exact connection-string
> formats see [`.env.example`](../../.env.example). This runbook adds the parts
> those don't: verification, the first-admin promotion step, RBAC checks,
> rollback, secret rotation and troubleshooting.

---

## 1 · Why this exists

GenVeris ships **safe-by-default in demo mode**: with no secrets set it runs on
`localStorage` + simulated AI, and every governance/cost/framework figure is
**seeded demonstration data that the UI badges honestly** (see the `Demo`
telemetry badge). It cannot persist data, authenticate users, or enforce RBAC in
that state.

BL-00 is the one-time task of setting the three production secrets so the app
becomes a real, secured, persistent instance:

| Capability | Turns on when |
| --- | --- |
| Durable data (Postgres instead of `localStorage`) | `DATABASE_URL` is a real Postgres URL |
| Auth + self-serve registration + server-side RBAC (403s on unauthorized writes) | `AUTH_SECRET` **and** a real `DATABASE_URL` |
| **Live** Enforce telemetry (audit chain, ledger, egress, memory, runtime, breaker, retrieval) instead of seeded windows | `DATABASE_URL` is a real Postgres URL |

Until BL-00 is done, none of the above is active — the platform is a showcase,
not a control plane.

---

## 2 · The variables

These are **secrets**. Set them in the deploy platform's environment
(Vercel → Project → Settings → Environment Variables), **never** commit them,
and never paste their values into logs, tickets, PRs or chat.

| Variable | Required | What it is |
| --- | --- | --- |
| `AUTH_SECRET` | ✅ | 32-byte random secret that signs the Auth.js JWT sessions. Generate: `openssl rand -base64 32` (or `npx auth secret`). |
| `DATABASE_URL` | ✅ | App-runtime Postgres connection. Supabase **Transaction pooler**, port `6543`, with `?pgbouncer=true&connection_limit=1` (so serverless doesn't exhaust connections). |
| `DIRECT_URL` | ✅ (for schema push) | Migration/DDL connection. Supabase **Session pooler / direct**, port `5432`. For a single-database setup, set it equal to `DATABASE_URL`. Poolers reject some DDL, so `prisma db push` needs this. |
| `ANTHROPIC_API_KEY` | optional | Enables real inference through the gateway (advisor, guardrails, live cost). Without it, AI paths fall back to a grounded simulation. |
| `VZ_GATEWAY_MODEL` | optional | Gateway model id (default `claude-sonnet-5`). |
| `AUTH_MICROSOFT_ENTRA_ID_ID` / `_SECRET` / `_ISSUER` | optional | Turns on Microsoft Entra SSO (set the whole pair/triple). |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | optional | Turns on Google SSO. |
| `VZ_SETUP_TOKEN` | optional | Enables the zero-CLI schema activation route (§5, option C). Unset it after use. |
| `VZ_ONBOARD_TOKEN` | optional | Guards the tenant-provisioning admin API (`POST /api/admin/tenants`). |
| `DEMO_SEED_PASSWORD` | **demo only** | Password for the seeded role users of a **demo** tenant. **Do not set on a production/clean tenant** — a clean tenant seeds no credential users by design. |

### How the app decides demo vs live (so you can predict behaviour)
- `dbConfigured()` is **true** only when `DATABASE_URL` starts with `postgres` **and**
  is not the `user:password@localhost` placeholder. A placeholder = "not configured".
- `authConfigured()` is **true** only when `AUTH_SECRET` is set (not the internal
  `auth-disabled-placeholder`) **and** `dbConfigured()` is true.
- Live telemetry follows `dbConfigured()`. An empty live audit chain is still
  "live" (a truthful empty state) — it is **not** a reason to show seeded data.

---

## 3 · Prerequisites

1. A Postgres database. **Supabase is recommended** (the Prisma schema and the
   pooled/direct URL split are written for it); Neon or Vercel Postgres also work.
2. Access to the deploy platform's environment-variable settings.
3. Ability to run one of: a Vercel deploy, a local shell with the repo, or an
   authenticated HTTP GET against the deployed app (for the three schema-apply
   options in §5).

---

## 4 · Procedure

### Step 1 — Provision Postgres and collect two URLs
From the Supabase project's connection settings, copy:
- **Transaction pooler** (port `6543`) → this becomes `DATABASE_URL`. Append
  `?pgbouncer=true&connection_limit=1`.
- **Session pooler / direct** (port `5432`) → this becomes `DIRECT_URL`.

### Step 2 — Generate the auth secret
```bash
openssl rand -base64 32
```
Keep it in your secret manager; you will paste it into the deploy env, not the repo.

### Step 3 — Set the environment variables
In Vercel → Project → Settings → Environment Variables, add `AUTH_SECRET`,
`DATABASE_URL`, `DIRECT_URL` (and any optional vars from §2). Scope them to the
environments you're activating (Production and/or Preview).

### Step 4 — Apply the database schema
Pick **one**:

- **A · Automatic on deploy (default).** `scripts/vercel-db.mjs` runs
  `prisma db push --skip-generate` on any build that has a real `DATABASE_URL`
  (and is a clean no-op otherwise). So the first deploy after Step 3 creates the
  `User`/`Tenant` and all other tables. This step is **best-effort — it never
  fails the build**; if the DB is unreachable it logs and ships, and the next
  deploy retries.
- **B · Local CLI.**
  ```bash
  # with DATABASE_URL and DIRECT_URL exported in your shell
  npm run db:push        # prisma db push  (uses DIRECT_URL for DDL)
  ```
- **C · Zero-CLI HTTP route.** Set `VZ_SETUP_TOKEN`, then
  `GET /api/admin/setup?token=<VZ_SETUP_TOKEN>` against the deployed app. It
  creates the tables and seeds the **demo** tenant. Idempotent and token-guarded.
  **Unset `VZ_SETUP_TOKEN` afterwards.**

### Step 5 — Verify provisioning (secrets-safe)
```bash
curl -s https://<your-host>/api/auth-status
```
This endpoint returns **booleans only, never secret values**. Expect:
```json
{
  "enabled": true,
  "readiness": {
    "ready": true,
    "checks": { "authSecret": true, "databaseUrl": true, "directUrl": true },
    "missing": [],
    "usingPlaceholderSecret": false,
    "recommendDirectUrl": false
  },
  "telemetry": { "mode": "live", "live": true }
}
```
- `readiness.missing` names any variable still absent.
- `recommendDirectUrl: true` means the DB is set but `DIRECT_URL` is not — set it
  or `prisma db push` may be rejected by the pooler.
- `telemetry.mode: "live"` confirms the Enforce surfaces will read live data.

### Step 6 — Bootstrap the first administrator
Self-serve registration is **least-privilege by design (BL-02)**: every
self-registered account is created as `employee`, and the requested role in the
sign-up body is ignored — so nobody can register straight into a privileged role.
The first admin must therefore be promoted **out of band**:

1. Register the founding account through the app: entry screen → **"New here?
   Create an account →"** → name / email / password. This creates a real,
   scrypt-hashed account in a **clean** tenant (its slug is the org or email
   domain).
2. Promote it directly in the database (one-off), e.g.:
   ```sql
   UPDATE "User" SET role = 'caio' WHERE email = 'founder@yourco.com';
   ```
   Valid roles: `ceo, cfo, cio, coo, caio, ciso, chro, cdpo, cgo, manager, employee`.
   The new role takes effect on next sign-in (role is stamped into the JWT).
3. Thereafter, further role grants are administrator actions — never
   self-service.

> Do **not** run the demo seed (`npm run db:seed` / the `/api/admin/setup` seed)
> against a real customer tenant: it creates `role@<slug>.genveris.demo`
> credential users for the showcase. A clean tenant intentionally has none.

### Step 7 — Optional capabilities
- **Live AI:** set `ANTHROPIC_API_KEY` (+ optional `VZ_GATEWAY_MODEL`).
- **SSO:** set the Entra and/or Google provider variables (§2); they appear on
  the sign-in screen automatically.
- **Programmatic tenant provisioning:** set `VZ_ONBOARD_TOKEN` and use
  `POST /api/admin/tenants`.

---

## 5 · Acceptance checklist

- [ ] `GET /api/auth-status` → `readiness.ready: true`, `missing: []`, `telemetry.mode: "live"`.
- [ ] A user can register and then sign in with email + password.
- [ ] An **unauthorized write** returns **403** (RBAC enforced server-side), not a silent success.
- [ ] The founding account has been promoted and can reach admin surfaces; a fresh self-registration is `employee`.
- [ ] Enforce surfaces (Ledger, Egress, Memory, Runtime, Circuit-breaker, Retrieval) show the **Live** badge, not **Demo**.
- [ ] The Article 12 audit chain verifies **intact** (tamper-evident hash chain) once traffic flows.
- [ ] SSO sign-in works for each provider whose variables were set (if any).

---

## 6 · Rollback & safety

- **Instant revert to demo:** remove `DATABASE_URL` (or point it back at the
  localhost placeholder). The app returns to demo mode — safe, no data written —
  and every surface re-badges as `Demo`. Removing `AUTH_SECRET` alone disables
  auth while leaving persistence on.
- **Secret rotation:** rotating `AUTH_SECRET` invalidates all existing JWT
  sessions (everyone is signed out) — expected; communicate before rotating.
  Rotate DB credentials in Supabase, then update `DATABASE_URL`/`DIRECT_URL`.
- **No destructive DDL here:** `prisma db push` is additive schema sync. This
  runbook creates tables; it does not drop or migrate data. Treat any
  destructive schema change as a separate, approval-gated task.
- **Least privilege stays intact:** never widen `resolveRegistrationRole`;
  promotions are out-of-band DB actions or admin-only.

---

## 7 · Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| "Could not create the account" / registration 503 | Tables not created, or auth not configured | Confirm `/api/auth-status` `ready: true`; if `directUrl:false`, set `DIRECT_URL` and re-run schema apply (§Step 4). |
| `prisma db push` hangs or is rejected | Running DDL through the transaction pooler (6543) | Point `DIRECT_URL` at the session/direct connection (5432); push uses it. |
| `telemetry.mode: "demo"` after setting the DB | `DATABASE_URL` not recognised as real | Must start with `postgres` and not be the `user:password@localhost` placeholder. |
| `usingPlaceholderSecret: true` | `AUTH_SECRET` unset | Set a real 32-byte secret and redeploy. |
| `UntrustedHost` / sign-in 500 on a custom domain | — | Already handled: `auth.ts` sets `trustHost: true`. If overridden, ensure `AUTH_TRUST_HOST`/host config is correct. |
| Enforce surfaces empty but badged Live | No live traffic yet | Expected — an empty live chain is truthful; data appears as the gateway runs. |

---

## 8 · Related backlog

- **BL-07 — real clock/scheduler** for memory/retention **expiry enforcement** is
  a separate task. Retention windows are stamped at write time, but active
  expiry/reaping needs a scheduler; provisioning the secrets here does **not**
  complete BL-07.
