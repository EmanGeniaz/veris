# Regression Rules

After every fix phase, verify:

## Required Checks

Run after every fixing phase:

| Check | Command / Method | Required Result |
| --- | --- | --- |
| Lint | `npm run lint` | Pass |
| Build | `npm run build` | Pass |
| App load | Browser open local app | Page loads |
| Console | Browser console | No blocking runtime errors |
| Login | Login page interaction | Clickable and route transition works |
| Role scope | Login as role | Only expected role content appears |
| Theme | Toggle light/dark | Branding and layout remain usable |
| AI Central | Enter and exit AI Central | Navigation back to CXO works |

## Build

- App builds successfully
- No blocking TypeScript errors
- No blocking dependency errors

## Routing

- Main routes load
- Invalid route is handled
- Navigation works

## UI

- Dashboards render
- Tables render
- Forms render
- Modals/drawers work where present
- Responsive layout is not broken

## AI Governance

- AI Central loads
- Guardrail workflows load
- Approval workflows load
- Audit logs load
- Evidence vault loads where present

## Design

- No obvious layout breaks
- No severe icon misalignment
- No typography regression
- No dashboard card collapse

## Stop Rule

If any required check fails, stop, document failure evidence, and do not proceed.

## Output

Regression report must include:

- Passed checks
- Failed checks
- Unknown checks
- Evidence
- Stop/go recommendation

Use this compact table:

| Check | Status | Evidence | Notes |
| --- | --- | --- | --- |
