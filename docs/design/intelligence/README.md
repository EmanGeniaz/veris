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

## Command Deck (`02`, `03`, `05`)

- **Governance Core:** a canvas particle sphere with the emblem's four-pointed star at its heart, and the AI Governance Score in the centre.
- **Six planes** orbit the core: Portfolio, Risk, Compliance, Runtime, Agents and Evidence. Clicking one opens a drill panel with its numbers, a note, **Open in classic workspace** and **Ask Veris**.
- **KPI strip:** initiatives in flight, open high-or-critical risks, your decisions, available agents, and issues burning now.
- **Left:** the burning queue (all ranked issues) and a live inference feed (allow / mask / block / escalate).
- **Right:** AI spend this month on a gauge, control coverage (EU AI Act, ISO/IEC 42001, NIST AI RMF, plus Govern/Map/Measure/Manage), and the governed agents with their action class.
- **Centre, lower:** the ask dock, the 13-phase initiative lifecycle (occupied and blocked phases highlighted) and the evidence chain of custody (hash-linked blocks, with "Chain verified" from the real chain check).

## Design decisions

- **Dark for these two screens only.** The immersive screens use a dark theme derived from the brand (the blue and silver ribbon and the four-pointed star). The classic workspace stays **light**, as `design_Philosophy.md` requires.
  - Ground `#030914`, brand blue `#2F7BFF`, signal cyan `#5FE1FF`, silver `#B9C6DB`, gold `#E3B862` (AI and human-decision accents).
  - Severity colours: critical `#FF5470`, high `#FF9F43`, medium `#F2D35B`, ok `#36E2A4`.
- **Type:** DM Serif Display for the greeting and section titles, Manrope for UI text, the system monospace for data and hashes. All fonts are self-hosted.
- **Accessibility and layout:** visible focus, `prefers-reduced-motion` (the core renders one static frame), reflow down to 390 px with no horizontal scroll, RTL mirroring.
- **Honesty:**
  - Seeded showcase data carries a **Demo data** chip.
  - Coverage panels say "Coverage of controls — not a compliance claim".
  - "Live" appears only when the inference feed comes from the database.

## Code

- `components/platform/intelligence.jsx`: the experience (Home, Deck, Governance Core canvas, panels).
- `lib/burning-issues.js`: pure ranking, role filters, greeting and intent routing.
- `scripts/burning-issues-test.mjs`: 46 checks (`npm run test:burning`, in CI).
- `components/GenVerisPlatform.jsx`: experience state, entry from sign-in, the ◆ Intelligence pill and the skip preference.
