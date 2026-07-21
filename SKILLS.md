# VerisZone Skills Reference

This file explains which local Codex skills and operating modes should be used for this project.

## 1. Default Project Skill

Use the local master orchestrator when asked to inspect, audit, prioritize, fix by phase, run regression, or assess enterprise readiness:

`C:\Users\User\Documents\Codex\2026-05-19\build-a-production-quality-mvp-for\.codex\skills\master-platform-quality-orchestrator\SKILL.md`

Primary behavior:

- Evidence-first.
- No hallucination.
- Every finding must be marked `Verified`, `Inferred`, or `Unknown`.
- Every finding must include evidence.
- Do not change code during inspection or audit phases.
- During fix phases, fix only approved priority items.
- Run regression after each fix phase.

Supporting files:

| File | Purpose |
| --- | --- |
| `.codex/skills/master-platform-quality-orchestrator/phase-plan.md` | Phase sequencing |
| `.codex/skills/master-platform-quality-orchestrator/issue-priority-rules.md` | Critical/High/Medium/Low definitions |
| `.codex/skills/master-platform-quality-orchestrator/anti-hallucination.md` | Evidence and safe-language rules |
| `.codex/skills/master-platform-quality-orchestrator/fix-execution-rules.md` | Fix-scope rules |
| `.codex/skills/master-platform-quality-orchestrator/regression-rules.md` | Regression expectations |
| `.codex/skills/master-platform-quality-orchestrator/master-report-template.md` | Report format |

## 2. Supporting Auditor Skill

Use the SaaS auditor skill for product QA, architecture, UI, glyph, AI governance, and security review:

`C:\Users\User\Documents\Codex\2026-05-19\build-a-production-quality-mvp-for\.codex\skills\saas-platform-auditor\SKILL.md`

Supporting checklists:

| File | Purpose |
| --- | --- |
| `.codex/skills/saas-platform-auditor/qa-checklist.md` | Functional QA |
| `.codex/skills/saas-platform-auditor/design-checklist.md` | UI/UX polish |
| `.codex/skills/saas-platform-auditor/glyph-icon-checklist.md` | Glyph and icon quality |
| `.codex/skills/saas-platform-auditor/saas-architecture-checklist.md` | SaaS architecture |
| `.codex/skills/saas-platform-auditor/ai-architecture-checklist.md` | AI architecture |
| `.codex/skills/saas-platform-auditor/governance-security-checklist.md` | Governance/security |

## 3. When To Use Which Skill

| User Request | Skill To Use | Code Changes? |
| --- | --- | --- |
| "Audit the platform" | `master-platform-quality-orchestrator` + `saas-platform-auditor` | No |
| "Run Phase 0 to Phase 2" | `master-platform-quality-orchestrator` | No |
| "Fix Critical issues" | `master-platform-quality-orchestrator` | Yes, Critical only |
| "Fix High issues" | `master-platform-quality-orchestrator` | Yes, High only |
| "Run design/glyph polish" | `master-platform-quality-orchestrator` | Yes, UI polish only |
| "Enterprise readiness review" | `master-platform-quality-orchestrator` + `saas-platform-auditor` | No |
| "Build a document/deck/spreadsheet" | Use relevant document/presentation/spreadsheet skill if available | As requested |

## 4. Project-Specific Product Rules

- Product name is `VerisZone`.
- Tagline is `Govern with certainty.`
- Demo Center is the seeded sales showcase.
- CXO workspaces should be clean by default.
- AI Central should be available as a separate login profile.
- AI Central should not appear as a normal CXO tab.
- AI Spine belongs inside AI Central unless the user changes the architecture.
- Profile menu must include Sign out.
- Avoid noisy cyber/gaming styling.
- Preserve premium enterprise SaaS styling.

## 5. Evidence Requirements

Every audit finding or claimed implementation state must cite at least one of:

- File path
- Route
- Component name
- Build output
- Lint output
- Test output
- Console error
- Screenshot reference
- Exact observed UI behavior

Use:

- `Verified in...`
- `Inferred from...`
- `Unknown because...`
- `Not found in inspected files...`
- `Could not verify because...`

Avoid unsupported claims such as:

- "Fully implemented"
- "Production ready"
- "Works perfectly"
- "Enterprise ready"

unless checks and evidence prove it.

## 6. Standard Verification Commands

Run from project root:

```powershell
cmd /c npm run lint
cmd /c npm run build
```

Start or restart local server:

```powershell
$project='C:\Users\User\Documents\Codex\2026-05-19\build-a-production-quality-mvp-for'
Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like "*$project*" -and ($_.Name -eq 'node.exe' -or $_.Name -eq 'cmd.exe') } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
Start-Process -FilePath 'C:\Program Files\nodejs\npm.cmd' -ArgumentList 'run','start' -WorkingDirectory $project -WindowStyle Hidden
Start-Sleep -Seconds 10
curl.exe -I http://localhost:3000/
```

## 7. Recommended Continuation Workflow

1. Read `HANDOVER.md`.
2. Inspect `components/VerisZonePlatform.jsx` around the target module.
3. Make scoped changes only.
4. Run lint and build.
5. Restart `localhost:3000`.
6. Report files changed, checks run, result, and remaining risk.

