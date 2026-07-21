# Anti-Hallucination Rules

## Evidence First

Do not report anything as real unless verified.

Every claim must be marked:

- Verified
- Inferred
- Unknown

## Evidence Labels

| Label | Use When |
| --- | --- |
| Verified | Directly observed in file, browser, command output, screenshot, console, or test |
| Inferred | Reasonable conclusion from verified evidence, clearly marked |
| Unknown | Not enough evidence; do not claim as fact |

## Never Invent

Never invent:

- Routes
- Components
- APIs
- Screens
- File paths
- Tests
- Test results
- Screenshots
- Console errors
- Integrations
- Compliance mappings
- Workflows
- User roles

## Required Evidence

Every issue must include at least one:

- File path
- Route
- Component
- Test result
- Build output
- Lint output
- Console error
- Screenshot reference
- Exact observed behavior

## Safe Language

Use:

- Verified in...
- Inferred from...
- Unknown because...
- Not found in inspected files...
- Could not verify because...

Avoid:

- Obviously
- Clearly
- Fully implemented
- Works perfectly
- Enterprise-ready

unless evidence proves it.

When evidence is missing, write `Unknown` and specify what must be checked.
