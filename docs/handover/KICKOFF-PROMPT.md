# Kickoff prompt for the new GenVeris PROD chat

Start a new Claude Code session on the **`EmanGeniaz/GenVeris-PROD`** repository and paste everything inside the box below as the first message.

---

```
You are building GenVeris PROD: the production, Python version of the GenVeris
AI Governance platform. This repository (EmanGeniaz/GenVeris-PROD) is new and empty.

STEP 1 — Read the handover in full before doing anything else.
- Add the demo repository EmanGeniaz/veris to this session with READ access only.
- Read docs/handover/GENVERIS-PROD-HANDOVER.md from it, on the branch
  claude/new-session-45327k (or on main once merged).
- That document is the complete spec: rules, decisions already made, the feature
  parity matrix (F-01..F-89), the data model, contracts, security baseline,
  delivery plan, QA journeys and open decisions.
- The demo repo is READ-ONLY reference. Never commit, push, open PRs or change
  settings on EmanGeniaz/veris, its Vercel project, its Supabase database, or
  console.veriszone.com.

STEP 2 — Confirm back to me in a short summary:
- Your understanding of the non-negotiable rules (§1). In short:
  - zero fabricated data, clean slate;
  - REAL login only (no demo login, no personas, no shared password,
    no seeded accounts);
  - tenant isolation;
  - server-side RBAC on every route;
  - honesty;
  - the six-control security baseline;
  - human accountability for agents;
  - tamper-evident chains;
  - leave the demo alone;
  - no secrets.
- The decisions already made:
  - Python backend (FastAPI);
  - React SPA frontend;
  - AWS hosting;
  - a NEW separate Postgres;
  - full parity with the demo, every feature built real;
  - target domain platform.veriszone.com.
- The open decisions in §15 that you need from me before the phase that depends
  on each. Ask about D1 (strictly-Enforce vs build the runtime engines), D2
  (region), D3 (auth/MFA), D4 (environments), D6 (onboarding model) first.

STEP 3 — Start Phase P0 (foundations) from §10 as small draft PRs on this repo:
- Copy the handover into docs/.
- Port and adapt CLAUDE.md (§12).
- Scaffold api/ (FastAPI, Alembic), web/ (React+Vite+TS), infra/, reference/.
- CI per §13.2; .env.example per §13.3; docker-compose for local Postgres and
  Redis; the security-baseline helpers per §11; ADRs for each choice.

Working rules:
- Small PRs, CI green, and never merge until I say "merge #N".
- Ask before any production infrastructure, DNS, auth/RBAC/security
  architecture, destructive DB, governance-methodology or
  compliance-interpretation decision.
- Never invent the Veris Enforce API.
- Mark claims about the demo as Verified / Inferred / Unknown.
- No secrets in git. No model identifiers in commits or PRs.
```

---

**Before you paste:** if the demo-repo PR that adds the handover has been merged, change the branch reference to `main`. You can also upload `GENVERIS-PROD-HANDOVER.md` straight into `GenVeris-PROD/docs/`. The new session will find it there as well.
