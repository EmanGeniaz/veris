# VerisZone E2E test suite (Playwright)

A durable, re-runnable end-to-end suite for the VerisZone console. Unlike a
one-off manual pass, this runs on every change and catches regressions before
customers do.

## What it covers today (runs against the public demo — no credentials needed)

- `01-landing` — sign-in page loads, key elements visible, no console/network errors.
- `02-demo-workspace` — entering the demo loads the dashboard; all `/api/bus/*` calls succeed.
- `03-rbac-roles` — role switching changes persona + content; every one of the 13 role tabs renders.
- `04-navigation` — sidebar sub-page navigation works and routes correctly.
- `05-search` — universal search returns live results.
- `06-accessibility` — automated axe scan. **Expected to fail** until the known
  nav-label defect is fixed (see the QA report) — it's an intentional tripwire.

## What's stubbed (needs YOUR staging environment)

- `07-auth-staging` — login + write actions (approvals, workspace creation).
  **Skipped** until you supply staging credentials. These must run against a
  **staging** environment with a **throwaway** account — never production, never
  real customer/admin logins.

## Setup

Requires Node.js 18+ (you have it). In this folder:

```
npm install
npx playwright install chromium
```

## Run

Against the public demo (safe, read-only flows):

```
npm test
```

Watch it run in a real browser window:

```
npm run test:headed
```

Open the HTML report after a run:

```
npm run report
```

## Enabling the authenticated tests (staging)

1. `copy .env.example .env`  (Windows)  /  `cp .env.example .env`  (mac/Linux)
2. In `.env`, set `BASE_URL` to your **staging** URL and fill `TEST_EMAIL` /
   `TEST_PASSWORD` with a **throwaway** account.
3. In `tests/07-auth-staging.spec.js`, finish the `TODO`s (the real submit
   button's label and a post-login landmark differ per environment).
4. `npm test`

## The one rule that matters most

A test suite is only as good as its assertions. These tests check that flows
*work and stay working*; they do not by themselves define "correct" for your
business logic. Strengthen the assertions as you learn what must be true — that
human judgment, not the tool, is where real confidence comes from.
