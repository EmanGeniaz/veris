# VerisZone — Design Philosophy

> **Govern with certainty.**
> The interface is not decoration on top of a governance database. It *is* the
> governance argument, made visible. Every design decision in VerisZone answers
> one question: *does this help an executive trust the number in front of them?*

This document is the reference for how VerisZone looks, feels and behaves — the
principles, the token system, the palette strategy, the accessibility floor, and
the rules that keep the product honest.

---

## 1. First principles

### 1.1 Certainty over decoration
An AI-governance control plane is bought because a board needs to trust it. Trust
comes from restraint: hairline borders, generous whitespace, calm typography, and
colour used to *mean* something — never to impress. If a visual flourish doesn't
increase a decision-maker's confidence, it doesn't ship.

### 1.2 One portfolio, many lenses — never many truths
The same initiative data is re-framed for the CEO, the CFO, the CISO, the
governance officer and the front-line employee. A lens changes *emphasis and
altitude*, never the underlying fact. A risk that is "High" in the Risk Center is
"High" on the CEO cockpit — the executive just sees fewer, larger, more
consequential cuts of it.

### 1.3 Every number carries its lineage
No metric appears without a way to ask *"where did this come from?"* Tiles, bars,
cards and table cells are clickable and trace back to their source
(`lib/lineage.js`). A dashboard that can't explain itself is worse than no
dashboard — it manufactures false confidence. This is the single most important
rule in the product.

### 1.4 Progressive disclosure
Executives get the headline; the detail is one deliberate click away. Cockpits
open calm and scannable, then reward drilling in. We never front-load a screen
with everything it *could* show.

### 1.5 Governance you author is governance that executes
The design mirrors the architecture: what you set as policy is what the AI Gateway
enforces. The UI never implies a control that the engine doesn't actually apply.

---

## 2. The token system

VerisZone has **no hard-coded colours in feature code**. Everything reads from a
shared, runtime-mutable token object. This is what makes 13 palettes, guaranteed
contrast, and a single source of visual truth possible.

### 2.1 `T` — the live theme object
`components/platform/core.jsx` exports a single mutable object `T` holding every
surface, border, ink and semantic colour. Components read `T` **at render time**,
never copy it at module load.

```
Surfaces   bg · s1 · s2 · s3 · s4 · s5 · card     (ground → elevated)
Borders    border · borderB · borderC             (hairline → strong)
Ink        ink · ink2 · ink3 · ink4 · ink5        (primary → near-invisible)
Semantic   red · amber · green · blue · violet · teal  (+ *L low-emphasis pairs)
Role       ceo · cfo · coo · ciso · caio · cro · legal … (each with an *L wash)
Shadow     shadow                                  (one calibrated elevation)
```

Two named accents sit outside `T` because they are brand-constant:

```
AI_GOLD      #D6A84F   — the VerisZone gold, for FILLS and accents
AI_GOLD_INK  #7E620F   — the text-safe gold, for gold TEXT (AA on cream)
```

> **Why two golds?** `#D6A84F` as foreground text on the cream surfaces scores
> only ~2:1 — it fails WCAG AA. So gold *fills* use `AI_GOLD`; gold *text* uses
> the darker `AI_GOLD_INK`. This split is a deliberate accessibility guard, not an
> inconsistency.

### 2.2 The getter rule (a hard-won lesson)
Because `T` starts at its dark default and is mutated to light **at runtime** by
`applyPalette()`, any style that is a **module-level object literal** bakes the
stale dark value and renders invisibly on light surfaces. Style helpers that
depend on `T` must therefore be **functions**, not constants:

```js
// WRONG — freezes dark ink at import, invisible on white inputs
const field = { color: T.ink, background: "#fff" };

// RIGHT — reads the live (light) T at render time
const field = () => ({ color: T.ink, background: "#fff" });
```

If a value ever looks "invisible" on a light surface, this is almost always why.

### 2.3 Typography

```
F.h / F.b / F.m   Manrope  — headings, body, and mono-slot (one calm sans)
F.e               DM Serif Display — the editorial accent, used sparingly
```

Manrope carries ~95% of the product: it is legible at 9px eyebrows and confident
at 25px page titles. DM Serif Display appears only where a moment of gravitas is
earned. Type weight does the hierarchy work (300–800), not a zoo of typefaces.

---

## 3. Colour strategy: light-only, 13 palettes

VerisZone **runs in light mode only.** Dark mode was deliberately removed — a
governance tool is used in boardrooms and audits under bright light, and a single
optimised light system beats two half-tuned ones.

Personalisation instead comes from **13 workspace palettes** (Workspace Settings):

```
Burgundy & Beige (default) · Slate & Ivory · Forest & Sand · Ink & Cloud
Plum & Linen · Ocean & Mist · Copper & Cream · Emerald & Pearl
Indigo & Fog · Rose & Bone · Graphite & Sand · Sapphire & Frost
```

**What a palette changes — and what it never does.** A palette swaps the *ground,
surface warmth and the left-rail hue* — the dominant visual identity. It leaves
**ink and semantic colours from `LIGHT_T` untouched**, so text contrast and the
meaning of red/amber/green stay constant across every theme. You can't pick a
palette that makes the UI unreadable or makes "risk red" ambiguous.

Mechanically, each palette is a *partial override* applied over the canonical
`LIGHT_T` ground:

```js
export function applyPalette(id){
  Object.assign(T, LIGHT_T, paletteById(id).tokens);   // ground, then palette
  return T;
}
```

The left rail (dark in every palette) is dressed by a separate `rail` object with
its own inks and a radial-gradient wash, so the sidebar always reads as a distinct,
grounded plane regardless of theme.

---

## 4. Colour semantics

Colour is a vocabulary, and it is used consistently everywhere:

| Colour | Meaning |
| --- | --- |
| **Green** | Healthy · on-track · Scale-ready |
| **Blue** | Informational · Continue · in-progress |
| **Amber** | Attention · Improve · variance |
| **Red** | Risk · blocked · Retire · breach |
| **Gold** | The VerisZone accent — AI, recommendations, the brand moment |

Decision language is derived, never arbitrary: a feedback set resolves to
**Scale / Continue / Improve / Retire** (`feedbackDecision`), and a *failing risk
score caps the outcome regardless of the average* — the design encodes the
governance rule that risk can veto optimism.

---

## 5. Layout & surface language

- **Hairline everything.** Borders are 1px and low-contrast (`border` → `borderC`).
  Structure comes from spacing and tone, not heavy rules or drop shadows.
- **One elevation.** A single calibrated `shadow` token. Cards lift *slightly*;
  nothing floats dramatically. Elevation is earned by surface tone
  (`s1`→`s5`), not by stacking shadows.
- **Cards as the unit of thought.** Each `Card` holds one coherent idea. Dense
  executive screens are compositions of calm cards, never one busy canvas.
- **Eyebrows orient.** 9px uppercase, wide-tracked labels (`Eyebrow`) name a
  region before the eye reaches its content — quiet signage throughout.
- **Left rail as anchor.** The dark, gradient-washed sidebar is the fixed point of
  the workspace; the bright content plane changes, the rail stays home.

---

## 6. Accessibility floor

Accessibility is a **constraint the token system enforces**, not a later audit:

- Muted inks (`ink3`, `ink4`) are tuned to hold **WCAG AA (≥4.5:1)** on the cream
  surfaces — being "muted" never means being unreadable.
- Gold text is routed to `AI_GOLD_INK` precisely because the brand gold fails AA
  as text (see §2.1).
- Semantic colours are fixed across all palettes so red/amber/green never lose
  their meaning to a theme choice.
- Interactive elements carry accessible names; icon-only controls get
  `aria-label`/`title`.

---

## 7. Motion

Framer Motion is used for **continuity, not spectacle**: entrances settle rather
than bounce, toggles slide (~150ms), drawers and spotlights guide attention during
the guided tour. Motion explains a state change; it never performs for its own
sake. Nothing important is conveyed by motion alone.

---

## 8. Determinism & SSR safety

Because VerisZone server-renders and must produce identical, auditable output:

- **No `Date.now()` / `Math.random()` in render paths.** Anything time- or
  randomness-derived is passed in or stamped outside render, so the same inputs
  always paint the same screen. A governance record that renders differently on
  two machines is not a governance record.

---

## 9. Responsive posture

The platform is width-responsive (the app's `isMobile` is a width breakpoint, not
a touch heuristic). The rule at narrow widths: **reflow, never clip.**

- Multi-column grids use `repeat(auto-fit, minmax(min(100%, Npx), 1fr))` so they
  collapse to fewer columns — down to one — instead of overflowing the viewport.
- Flex rows wrap rather than push content off-screen.
- Every surface is verified at **390px** to report **0 horizontal overflow**;
  the page body never scrolls sideways.

---

## 10. The honesty rules (non-negotiable)

These are the principles a contributor may **not** trade away for visual appeal:

1. **No number without lineage.** If you add a metric, add its trace.
2. **No colour without meaning.** Reach for a semantic token, not a nice hue.
3. **No literal that freezes `T`.** Style helpers that read `T` are functions.
4. **No hard-coded hex in feature code.** Go through the token system.
5. **No lens that contradicts another lens.** All roles read one source of truth.
6. **No decoration that survives failing a decision-maker.** Cut it.

If a change violates one of these, it is wrong no matter how good it looks.

---

*This philosophy is implemented primarily in `components/platform/core.jsx`
(tokens, palettes, primitives) and enforced across the 30 platform surfaces and
the engines in `lib/`. When in doubt, read `core.jsx` — it is the constitution.*

© Geniaz — VerisZone.
