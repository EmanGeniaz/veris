# Intelligence Home & Command Deck

Owner request (2026-10-30): no regular dashboard as the first screen. After sign-in the user lands on **"How may I help you?"** with a few **burning issues**. From there they enter an **interactive Command Deck**, and they can **skip to the regular (classic) dashboard** at any time.

## Flow

```
Sign in ──► Intelligence Home ──► Command Deck
                 │      ▲              │
                 │      └──────────────┤  (◆ Intelligence pill in the classic top bar)
                 ▼                     ▼
          Classic dashboard ◄── any "Open in classic workspace" / issue action
```

- **Who sees it:** the Intelligence Home opens after a sign-in from the entry screen. It doesn't open for the standalone AI Central demo or for the Super Admin console.
- **Skipping it:**
  - A "Open the classic dashboard after sign-in" checkbox skips it. The choice is stored per browser (`localStorage genveris.experience`).
  - Deep links (`/workspace/<role>/<tab>`) always restore straight to the classic page they name.
- **Leaving it:** every action that leaves the experience goes through the same Navigation Registry as a sidebar click, so it opens the same page.

## Intelligence Home (`01`, `04`, `06`)

- **Greeting:** time of day plus the user's first name. In Arabic the greeting is localised and the name is isolated (`<bdi>`), so it isn't mis-ordered in right-to-left text.
- **Ask bar.**
  - Explicit navigation ("open the risk register", "افتح سجل المخاطر") opens that place directly (`routeIntent`).
  - Everything else goes through the governed gateway (`/api/gateway/chat`).
  - With no model connected, the answer is labelled **"Simulated · no model"**. It is never presented as a real AI answer.
  - Voice input appears only where the browser supports speech recognition. It uses the same ask path as typing.
- **Burning issues:** the top 5, ranked by `lib/burning-issues.js`.
  - Sources: approvals, risks, KRI breaches, incidents, breach-notification clocks, stale evidence, budget overruns and framework coverage gaps.
  - Each role sees issues through its own filter (for example, the CFO sees budget, the CDPO sees breach clocks).
  - Each card shows why it matters, the metric behind it, the owner, one primary action and "Ask about this".
- **Empty state:** a workspace with no records shows "All clear". Nothing is invented.

## Command Deck (`02`, `03`, `05`, `08`, `10`, `11`)

The deck follows the Operating Environment concept: calm, evidence-cited, and authority-aware. It is no longer a holographic dashboard. It is one environment with five lenses on the same governed records, plus a shared ask line.

### Provenance grammar

Every claim carries a mark, and a legend sits under the ask line:

| Mark | Class | Used for |
|---|---|---|
| **O** | Observed | A recorded value: a register row, an audit event, a policy clause |
| **C** | Calculated | Deterministic over records: residual score, breach clock, coverage, impact |
| **I** | AI interpretation | Gateway answers, and the prepared reasoning and confidence on an approval |
| **R** | Recommendation | The prepared action on an approval |
| **D** | Human decision | Recorded in the approvals workspace, under the person |
| **E** | Verified enforcement | Never shown as achieved. Veris Enforce is not connected, and the deck says so |

### Lenses

- **Briefs** (default, `02`):
  - Every ranked burning issue is answered as six questions: **what changed, why it matters, evidence, uncertainty, who should act, available action**.
  - Each brief also says **why it was shown** (severity, role lens, overdue or worsening, priority score).
  - Briefs come from `briefFor()` in `lib/burning-issues.js`. They are register-derived, so they carry only O and C marks and low uncertainty. Only approvals carry I and R.
  - A missing owner is shown as a gap in red ("No owner recorded"), never filled in.
- **Evidence lens** (`10`):
  - Clicking a brief's evidence opens a drawer with the source register, record id and the recorded fields.
  - It is marked Observed, and carries the Demo data chip when seeded.
  - "Open source record" goes to the classic page. Escape closes it.
- **Decisions** (`08`): the role's real approval queue, shown as decision workspaces. Each one separates:
  - the statement (O);
  - the **recommendation · prepared, not decided** (R);
  - the prepared reasoning and stated confidence (I, with uncertainty);
  - the policy clause (O);
  - decision authority (C).

  Two safeguards are always shown:
  - "The recommendation is not an approval."
  - "A decision is not proof of enforcement — Veris Enforce is not connected" (E).

  Deciding stays in the approvals workspace, where it is recorded under the person on the audit chain. The deck adds no new decision API.
- **Estate** (`03`):
  - A layered map (Models → Data → Agents → AI systems) built by `lib/estate-map.js`, **only from keys the registers already share**: `initiativeId`, agent `model` / `dataScopes` / granted tool `control`, initiative `controls` / `policies`, and exact system names.
  - Selecting a node shows what it depends on, what uses it, the governance attached, and the **impact if it changes**. Impact is a reverse traversal (C), with the path for each affected item, the data an affected agent reads, and the risks, KRIs, incidents, controls and policies on everything affected.
  - It is labelled as a derived view: typed relationships in the Evidence Fabric are proposed (#166).
- **Instruments** (`11`):
  - The previous deck panels are kept for analysis: KPI strip (with marks), the six planes as a grid with drill-down and "Open in classic workspace", the 13-phase lifecycle, evidence chain of custody, live inference feed, AI spend, control coverage and governed agents.
  - The particle-orbit Governance Core was removed from the deck. It remains only as the quiet background on the Home screen.
- **Live Security** (`07`, `09`): unchanged in behaviour (below), restyled to the calm palette.

### Known data discrepancy surfaced by the Estate view

The seeded registers name two systems inconsistently:
- "Doc Summarisation AI" (agent registry) vs "Document Summarisation AI" (risk register);
- "Predictive Maintenance" (incidents) vs "Predictive Maintenance AI" (risks).

Names are matched exactly, so each appears twice. That is deliberate: guessing would hide a real data-quality gap. The fix belongs in the source registers.

## Live Security (`07`, `09`): Command Deck → Live Security tab
This tab answers the request for **live monitoring of the agents** and **security being applied live**.

- **Live banner and counters:** actions governed, allowed, masked, sent to a human, threats blocked and agents suspended. A Pause/Resume control stops and restarts the stream.
- **Security pipeline in action:** each action lights up the 8 enforcement stages in the order the gateway applies them:
  Circuit breaker → Input sanitiser → Classify & DLP → Authority & HITL → Egress → Runtime → Output guard → Article 12 log.
  - The stage that decided glows.
  - Stages after it are marked *not reached*.
  - The card shows the agent, the tool, the (masked) prompt, the reason and the **policy clause** that applied.
- **Agent fleet, live monitor:** one card per agent showing:
  - status (Running / Downscoped / **Suspended by breaker** / **Paused by human**);
  - its last action and outcome, and a strip of its last 24 decisions;
  - its circuit-breaker score and state;
  - its counters;
  - a **Pause agent** kill switch, and **Resume · human decision** when the agent is stopped.
- **Attack lab:** buttons fire a prompt injection, credential leak, card data, exfiltration, SSRF, tool overreach, high-stakes decision, runaway loop or PII in model output. **Test your own prompt** runs any text as any agent and tool through the same pipeline. A result you fire stays on the pipeline for about 5 seconds.
- **Enforcement stream:** every governed action, with the deciding stage and the reason.
- **Home ribbon:** a live line ("6 agents monitored · N threats blocked · M sent to humans", plus the latest stop) and **Watch security live**.

**What is live and what is synthetic, stated on screen:**
- The *traffic* is synthetic, because a demo has no production agents.
- *Every verdict* is computed in real time by the platform's real engines, run in order by `lib/live-showcase.js`:

| Stage | Engine |
|---|---|
| DLP | `evaluateRules` / `classify` |
| Input sanitiser | `sanitizeInput` |
| Authority & HITL | `capabilityCheck` + `requiresApproval` |
| Egress | `egressDecision` |
| Runtime | `detectLoop` |
| Output guard | `validateResponse` + `moderateOutput` |
| Circuit breaker | `computeBreakerSession` |

- Changing a rule or a grant changes what the showcase shows.
- The circuit breaker really suspends an agent: injection plus exfiltration takes the score past 65. That agent can't act again until a human resumes it.
- Risk signals age out after sustained clean behaviour.
- Tests: `scripts/live-showcase-test.mjs` (29 checks, `npm run test:liveshow`, in CI).

## Design decisions

- **Dark for these screens only, calm rather than holographic.** The immersive screens use a dark theme. The classic workspace stays **light**, as `design_Philosophy.md` requires.
  - Ground `#0A0E16`, surface `#111724`, brand blue `#5B93FF`, gold `#E2B862` (recommendations and human-decision moments only).
  - Severity colours: critical `#FF6B80`, high `#FFA45A`, medium `#EFD06A`, ok `#62D48E`.
  - Provenance colours: O `#5CC8A8`, C `#7FA7FF`, I `#BE9CFF`, R `#E2B862`, D `#EEF1F7`, E `#4FD1E8`.
  - No grid backdrop, glows, corner brackets or gradient buttons. Motion only shows causality: a brief expanding, the impact path lighting, a pipeline stage deciding.
- **Type:** DM Serif Display for the greeting, titles and decision statements, Manrope for UI text, the system monospace for identifiers, figures and hashes. All fonts are self-hosted.
- **Accessibility and layout:** visible focus, `prefers-reduced-motion` (the core renders one static frame), reflow down to 390 px with no horizontal scroll, RTL mirroring.
- **Honesty:**
  - Seeded showcase data carries a **Demo data** chip.
  - Coverage panels say "Coverage of controls — not a compliance claim".
  - "Live" appears only when the inference feed comes from the database.

## Code

- `components/platform/intelligence.jsx`: the experience (Home, and the Deck's Briefs, Decisions, Estate, Instruments and Live Security lenses, plus the evidence lens).
- `lib/burning-issues.js`: pure ranking, role filters, `briefFor()` (six questions with provenance), greeting and intent routing.
- `scripts/burning-issues-test.mjs`: 64 checks (`npm run test:burning`, in CI).
- `lib/estate-map.js` + `scripts/estate-map-test.mjs`: the estate map and impact traversal, built only from recorded keys (38 checks, `npm run test:estate`, in CI).
- `lib/live-showcase.js` + `scripts/live-showcase-test.mjs`: the live enforcement pipeline and fleet reducer (29 checks).
- `components/GenVerisPlatform.jsx`: experience state, entry from sign-in, the ◆ Intelligence pill and the skip preference.
