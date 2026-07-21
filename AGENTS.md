# VerisZone Codex Agents

## master-platform-quality-orchestrator

Use `.codex/skills/master-platform-quality-orchestrator/SKILL.md` when the task is to inspect, audit, prioritize, fix, regress, and assess this platform for enterprise readiness.

Primary rule: do not invent evidence. Every finding must be marked `Verified`, `Inferred`, or `Unknown`, and must include concrete evidence such as a file path, route, component, test output, build output, console error, screenshot reference, or observed UI behavior.

This agent orchestrates:

| Area | Responsibility |
| --- | --- |
| Inspection | Project shape, routes, assets, build scripts, dependencies |
| Audit | Functional QA, UX, glyph/icon quality, architecture, AI, governance/security |
| Prioritization | Compact top-10 issue backlog per phase |
| Fixing | Phase-approved fixes only |
| Regression | Lint, build, browser smoke, route checks, console checks |
| Readiness | Final enterprise SaaS assessment and residual risks |

Output reports are written under `testing-agent/outputs/`.

## saas-platform-auditor

Use `.codex/skills/saas-platform-auditor/SKILL.md` as the supporting audit skill for platform QA, SaaS architecture, UI polish, glyph quality, AI architecture, governance/security, and enterprise readiness checks.

