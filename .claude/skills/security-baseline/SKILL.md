---
name: security-baseline
description: Audit or remediate GenVeris against the six-control security baseline (rate limiting, input validation, secrets, dependency vulnerabilities, error/information leakage, file upload safety). Use before opening any PR that adds or changes an API route, auth flow, request body, dependency, error path or upload, and whenever asked for a security review or hardening pass.
---

# Security baseline: audit and remediation

The six controls are defined in `CLAUDE.md` → **SECURITY BASELINE**. That
section is the source of truth. This skill is the procedure for applying it.

**Modes.** In audit mode (the default in `CLAUDE.md`), run the checklist
and report findings with `file:line`; don't edit code. In remediation mode,
fix each finding with the shared helpers below, add a regression check to
`scripts/security-baseline-test.mjs`, then run the verification steps.

## Shared helpers (use these; don't hand-roll per route)

| Need | Use |
|---|---|
| Rate limit a route | `limit(req, tier, scope)` from `lib/api-guard.ts`. The tier is `auth` for sign-in/signup/reset/token-checked admin routes, `public` for unauthenticated APIs, and `user` for authenticated actions |
| Per-account brute-force backoff | `backoffWaitMs` / `recordAuthFailure` / `clearAuthFailures` from `lib/rate-limit.ts` |
| Parse and validate a JSON body | `parseJson(req, schema, { maxBytes })` with a zod schema in `lib/api-schemas.ts` (`.strict()` unless there is a documented reason) |
| Report an unexpected error | `return serverError(e, "area.action")`, or `logError` when the route degrades silently |
| Compare a shared token | `safeEqual(a, b)` |

## Audit checklist

Run from the repo root.

1. **Rate limiting**
   - List routes: `find app/api -name route.ts`.
   - For each handler (`POST`/`PUT`/`PATCH`/`DELETE`, and any costly `GET`), confirm a `limit(` call with the right tier.
   - Auth routes need a per-IP limit and per-account backoff.
   - `middleware.ts` must still match `/api/:path*`.
   - Thresholds come from `RATE_LIMIT_*` / `AUTH_BACKOFF_*` env, never literals at the call site.
2. **Input validation**
   - `grep -rn "req.json()\|request.json()\|formData()" app/api` should return nothing outside `parseJson`. Two routes still parse directly and validate through their own validators: `gateway/chat` (`lib/gateway-validate.ts`) and `ingest/discover` (`lib/ingest-discover.ts`).
   - Query params and path params used in queries must be checked too, for example against an allowlist `Set`.
3. **Secrets**
   - `grep -rnE "(sk-ant-|sk-[A-Za-z0-9]{20}|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{36}|xox[bap]-|-----BEGIN [A-Z ]*PRIVATE KEY)" --exclude-dir=node_modules .`
   - Look for `process.env.X || "literal"` fallbacks on anything secret-like.
   - Look for `NEXT_PUBLIC_*` holding a secret.
   - Check `git ls-files | grep -E "^\.env"`: only `.env.example` is allowed.
   - If a live secret was ever committed, flag it for **rotation**. Deleting it from HEAD is not enough.
4. **Dependencies**
   - Run `npm audit --omit=dev`. Record each advisory with its severity.
   - Apply `npm audit fix` (non-breaking). For anything needing a major bump or replacement, either do it with a build and test run, or document it.
   - Never use `--force` blindly.
5. **Error leakage**
   - `grep -rnE "json\(.*(\.message|\.stack|String\((e|err|error)\))" app/api` must return nothing.
   - Also check for Prisma/provider error text, upstream status bodies, config details, or file paths in responses.
6. **Uploads**
   - Find every path that accepts file content (`formData`, `File`, base64, or text read from a file on the client).
   - Confirm: content-based type check (`looksBinary` / magic bytes), a byte cap enforced before buffering (`parseJson` `maxBytes` or a Content-Length check), storage outside `public/`, and never served inline as HTML/SVG or executed.

## Verify

```
npm run test:security    # baseline regression suite, incl. static leak and secret scans
npm run test:unit        # everything else still green
npm audit --omit=dev --audit-level=high
npx next build
```

The PR body lists each control's status (pass / fixed / deferred with a reason).
