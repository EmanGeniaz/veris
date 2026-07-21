# Fix Execution Rules

## General Rules

Fix in phases only.

Do not fix everything at once.

Do not redesign the whole product unless explicitly requested.

Preserve current product direction.

Every fix must include:

- Issue being fixed
- Files changed
- Reason for change
- Checks run
- Result
- Remaining risks

## Scope Control

Before editing, list:

| Approved Issue ID | Files Expected | Risk |
| --- | --- | --- |

Fix only approved issues for the current phase.

## During Critical Fix Phase

Fix only Critical issues.

Do not touch High, Medium, or Low issues unless required to complete a Critical fix.

## During High Fix Phase

Fix only High issues.

Do not touch Medium or Low issues unless required to complete a High fix.

## During Medium Fix Phase

Fix only Medium issues.

Avoid broad refactoring.

## During Design/Glyph Polish Phase

Only fix:

- Icons
- Glyphs
- Spacing
- Alignment
- Typography
- Button hierarchy
- Card consistency
- Dashboard density
- Enterprise polish

Do not change business logic during design/glyph polish unless required to fix a verified bug.

## Editing Rules

- Prefer minimal, targeted edits.
- Preserve current product direction and branding.
- Do not refactor unrelated systems.
- Do not revert user changes.
- Do not modify generated artifacts unless required.
- Do not change application code during inspection or audit phases.

## Testing After Fixes

Run available:

- Build
- Lint
- Unit tests
- E2E tests if available

If a command is unavailable, mark it `Unknown` and explain how to verify.

After edits:

1. Run lint.
2. Run build.
3. Run browser smoke checks when applicable.
4. Update the phase output file.
5. Stop on failure.
