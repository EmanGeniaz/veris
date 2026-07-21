# Issue Priority Rules

## Critical

Use Critical when the issue:

- Breaks build
- Causes runtime crash
- Blocks login or main navigation
- Blocks a core workflow
- Creates major security exposure
- Breaks data integrity
- Prevents AI Central from functioning
- Prevents audit or approval workflow from functioning
- Makes the product impossible to demo

## High

Use High when the issue:

- Seriously weakens an important module
- Makes a workflow incomplete
- Creates misleading dashboard data
- Creates weak governance traceability
- Creates poor enterprise credibility
- Breaks important forms, tables, or filters
- Shows major glyph/design inconsistency in important screens

## Medium

Use Medium when the issue:

- Reduces usability
- Creates visual inconsistency
- Weakens enterprise polish
- Makes workflows less clear
- Has missing empty/error/loading states
- Needs better microcopy
- Needs better alignment, spacing, or icon treatment

## Low

Use Low when the issue:

- Is cosmetic
- Is minor polish
- Does not affect workflow
- Can be fixed after demo readiness

## Ranking Formula

Use:

`impact + frequency + user visibility + regression risk + enterprise trust impact`

Keep only the top 10 findings per phase unless the user requests more.

## Finding Format

| ID | Status | Priority | Area | Finding | Evidence | Recommended Action |
| --- | --- | --- | --- | --- | --- | --- |

`Status` must be `Verified`, `Inferred`, or `Unknown`.
