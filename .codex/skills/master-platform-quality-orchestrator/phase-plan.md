# Phase Plan

## Phase 0: Project Inspection

Purpose:
Understand the real project before making judgments.

Allowed:

- Read files
- Identify framework
- Identify package manager
- Identify build/test/lint commands
- Identify routes
- Identify modules
- Identify UI/icon libraries
- Identify data/API layer
- Identify existing tests

Not allowed:

- Code changes
- Feature claims without evidence

Output:
`testing-agent/outputs/00-project-inspection.md`

## Phase 1: Master Audit

Purpose:
Find verified, inferred, and unknown issues.

Review:

- Functional QA
- SaaS architecture
- UI/UX polish
- Glyph/icon quality
- AI architecture
- Governance/security
- Enterprise readiness

Not allowed:

- Code changes
- Fixes
- Unverified claims

Output:
`testing-agent/outputs/01-master-audit-report.md`

## Phase 2: Priority Backlog

Purpose:
Create Critical, High, Medium, and Low backlog.

Output:
`testing-agent/outputs/02-priority-backlog.md`

## Phase 3: Critical Fixes

Purpose:
Fix only blockers.

Critical examples:

- Build failure
- Runtime crash
- Broken main route
- Broken navigation
- Broken core workflow
- Major security exposure
- Data integrity issue
- AI Central unusable
- Audit/approval workflow unusable
- Product impossible to demo

Output:
`testing-agent/outputs/03-phase-1-critical-fixes.md`

## Phase 4: Critical Regression

Purpose:
Verify Critical fixes did not break the platform.

Output:
`testing-agent/outputs/04-phase-1-regression.md`

## Phase 5: High Fixes

Purpose:
Fix important but non-blocking issues.

High examples:

- Important module partial
- Approval workflow incomplete
- Major dashboard issue
- Important AI governance gap
- Missing audit trail in key workflow
- Major glyph/design inconsistency on important screen

Output:
`testing-agent/outputs/05-phase-2-high-fixes.md`

## Phase 6: High Regression

Purpose:
Verify High fixes.

Output:
`testing-agent/outputs/06-phase-2-regression.md`

## Phase 7: Medium Fixes

Purpose:
Improve workflow clarity, usability, architecture maturity, and enterprise readiness.

Medium examples:

- Weak empty states
- Table usability issue
- Missing filter
- Weak microcopy
- Minor workflow friction
- Design inconsistency

Output:
`testing-agent/outputs/07-phase-3-medium-fixes.md`

## Phase 8: Medium Regression

Purpose:
Verify Medium fixes.

Output:
`testing-agent/outputs/08-phase-3-regression.md`

## Phase 9: Design and Glyph Polish

Purpose:
Improve visual credibility and enterprise SaaS quality.

Focus:

- Icon consistency
- Glyph alignment
- Typography
- Spacing
- Button hierarchy
- Dashboard density
- Card consistency
- Enterprise polish

Output:
`testing-agent/outputs/09-design-glyph-polish.md`

## Phase 10: Final Enterprise Readiness

Purpose:
Classify product readiness.

Classify as:

- Prototype only
- Demo ready
- Pilot ready
- Enterprise sales ready
- Production ready

Output:
`testing-agent/outputs/10-final-enterprise-readiness.md`

## Stop Conditions

Stop immediately if:

- `npm run lint` fails
- `npm run build` fails
- browser smoke test cannot load critical routes
- console shows blocking runtime errors
- a requested fix requires changing unapproved scope
- required evidence is missing for a claimed issue
- the requested phase cannot be completed safely
