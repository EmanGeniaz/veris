# GenVeris → Veris Enforce — porting brief

**Status:** Active brief · **Owner:** Platform / Architecture · **Audience:** the
Veris Enforce build team/session · **Decision recorded:** **strictly-Enforce**
(see §4).

> GenVeris (the governance control plane) prototyped several **runtime** guardrails
> that, per the ratified three-plane carve-up, belong in the **Veris Enforce
> engine**. This brief specifies each one — proven logic + exact thresholds — so
> Enforce can reimplement it in the Go data plane **without needing to read
> GenVeris's code**. After Enforce ships and the entitlement seam is live,
> GenVeris **removes** its version (§4) to avoid duplication.

---

## 0 · Naming (read first)

**VerisZone was rebranded to GenVeris (Sep 2026)**; the tagline is now *"Govern AI
with certainty."* The company is still **Geniaz**. Sub-plane names are unchanged:
**Veris Enforce · Veris Discover · Veris Intelligence.**

So everywhere the Enforce docs say **"VerisZone"** (SPEC §12, STATUS,
ARCHITECTURE-ALIGNMENT, the *"feeds VerisZone"* line, open-question #7) → it means
**GenVeris**, the control plane this engine feeds. Please do a terminology pass
(VerisZone → GenVeris) and resolve SPEC open-question #7 as:

> **Veris Enforce is a product within the GenVeris platform (company: Geniaz).**

The family, once: **Geniaz** (company) → **GenVeris** (platform / control plane,
*formerly VerisZone*) → **Veris Enforce / Discover / Intelligence** (planes).

---

## 1 · Build conventions

- Reimplement in the **Go data plane**, deterministic-first (your stated
  preference — "deterministic > ML by default").
- Every new control **emits a governed decision + audit event** (decision,
  reason-code, metadata — **never raw content**) through the existing audit /
  `/admin/api`, so GenVeris can consume it as telemetry. Same shape as your
  existing decisions.
- Tested with **stored logs** (per your TESTING.md), honest caveats, EN/AR console
  surfaces where user-facing, **no GA claims**.
- Update ARCHITECTURE-ALIGNMENT status honestly as each lands.

---

## 2 · P1 — build first (each closes a gap Enforce named in STATUS/ARCH-ALIGNMENT)

### 2.1 Circuit breaker — graduated per-session risk + real-time revocation
*Enforce gap: "Agent Kill Switch… not a session kill-switch" (🟡).*
- **Score 0–100** = `min(100, Σ active-signal weights)`:
  `injection 35 · egress 30 · guardrail 18 · sensitive-data-volume 15 ·
  behavioural-drift(PSI) 12 · tool-call-rate 10`.
- **State by score:** `Normal ≥0` (full grants, monitor) · `Downscope ≥40`
  (revoke non-read caps, read-only) · `Suspend ≥65` (halt autonomous action →
  human) · `Halt ≥85` (terminate session, revoke all tokens).
- **Real-time revocation:** capability tokens short-lived (~90s) + per-call; on a
  trip, add the agent's tokens to a **revocation list** so the next issuance is
  refused instantly (don't wait for TTL). Trigger = highest-weight active signal.
  Audit each trip with signal, state, accountable owner.
- Sits **above** your M5 HITL: HITL gates one action; the breaker escalates the
  whole session. PSI/volume can begin from inputs you already have.

### 2.2 Runtime + cost guard — OWASP LLM10 (unbounded consumption)
*Enforce gap: "rate limits/budgets ✕ (LLM10)"; "Cost & Usage Monitoring later."*
- **Admit each tool call in order loop → concurrency → rate:**
  - **Loop:** inspect last **6** actions; same action **≥3×** → loop; or an
    **A↔B cycle** (≥2 cycles in the window) → loop. Ignore human chat turns so
    ordinary conversation isn't flagged.
  - **Concurrency:** per-session in-flight cap; over cap → throttle.
  - **Rate:** calls-per-rolling-window cap; burst → throttle.
  - **Latency:** record every completed call; flag SLO breach.
- **Cost ceiling:** per-request token ceiling + per-tenant monthly budget from a
  price book (blended $/1M per provider); block when exceeded.

### 2.3 MCP supply-chain provenance — pin & quarantine (OWASP LLM03)
*You enforce tool-CALLS (M11); this guards the SERVER itself.*
- **Deterministic manifest hash** over a server's declared tools + scopes.
- **Pin** the hash at approval; require a **trusted publisher signature**.
- **Statuses:** `verified` (pinned+signed+hash matches) · `rugpull` (current hash
  ≠ pinned → quarantine) · `unsigned` (no trusted signature → refuse) · `unpinned`
  (not yet approved → no binding).
- **Refuse** issuing any capability token against a server whose current manifest
  hash ≠ pinned, or that is unsigned. Runs at server-resolve time. It's a hash
  compare, not classification — survives a more capable model.

---

## 3 · P2 / P3

**P2 — deterministic floors Enforce deferred as "needs ML" (they don't):**

- **Input sanitization** — strip invisible instruction-smuggling *before anything*:
  zero-width `[U+200B–200D, 2060, FEFF, 180E]`, Unicode-Tag `[U+E0000–E007F]`,
  bidi-override, control chars; neutralize `<script>`. Sanitized text is what the
  pipeline sees. Plus attachment MIME-allowlist w/ matching extension, **25 MB**
  cap, optional AV (fail-closed by flag); text cap ~**8000**; per-session ingress
  rate limit.
- **Output toxicity — deterministic lexicon:** weights `self_harm 5 · violence 4 ·
  hate 4 · sexual 3 · harassment 2 · profanity 1`. Severity `maxWeight≥4 high
  (BLOCK) · ≥2 medium · ≥1 low`. Union categories; combine with DLP/egress findings
  → allow/flag/block; fail-open to floor. Expose a pluggable `Classifier` (like
  your M9) so ML drops in later.
- **Hallucination / faithfulness — deterministic tier (no model call):** per claim,
  figures must appear in retrieved context; salient-token overlap **≥0.34**;
  penalize overconfident absolutes (**−15**). Score 0–100 → `grounded ≥80 ·
  mixed ≥50 · ungrounded <50`. Optional LLM-judge second pass, env-gated, only on
  the uncertain minority. Caveat: a floor, not semantic truth.

**P3 — only if Enforce wants these planes (else they stay control-plane):**

- **Governed memory retention/expiry** — class windows `Public 30d · Internal 7d ·
  Confidential 24h · Restricted never-persisted (refuse)`. Stamp `expiresAt`;
  recall filters `expiresAt>now` + class clearance + tenant/agent/session
  partition; scheduled sweep deletes expired.
- **Retrieval trust for RAG passages** — source tiers `trusted 1.0 / internal 0.8
  / unverified 0.4 / blocked 0.0 (drop)`; only registered sources earn "trusted";
  freshness `staleAfterDays 180 / maxAgeDays 365`; chunk DLP (block secret-bearing,
  mask PII); re-rank by relevance × trust × recency.

Priority order: **P1 → P2 → P3.**

---

## 4 · De-duplication — strictly-Enforce (DECISION)

**Decision:** enforcement is **strictly a Veris Enforce entitlement.** A customer
with **GenVeris but not Enforce** gets **governance + demo only** — GenVeris does
**no live runtime enforcement** on its own. Therefore GenVeris **removes** its
embedded runtime engines once Enforce owns the capability.

**Build-first, remove-second — never a coverage gap.** GenVeris keeps the
**governance view** (surfaces that *read* Enforce telemetry), the **Evidence
Fabric/audit**, and an **honest demo fallback**; it deletes the embedded engines.

| Phase | GenVeris action | Gated on |
|---|---|---|
| A | **WS1 — Evidence Fabric** (the sink Enforce emits into) | approval (scoped) |
| B | **WS2 — entitlement seam** (surfaces flip live-from-Enforce; BL-04 built the switch) | WS1 |
| C | **Per-capability delete** (same order Enforce ships — breaker → runtime/cost → MCP → …): once the surface reads Enforce telemetry, delete GenVeris's `lib/*.js` engine + its gateway writer. One reviewable PR each. | Enforce shipped + WS2 |

GenVeris engines to retire once Enforce ships the equivalent: `circuit-breaker.js`,
`runtime-guard.js` (+ cost ceiling in `cost-engine.ts`), `mcp-registry.js`
provenance, `input-guard.js`, `output-guard.js`, `hallucination.js`, and
(if P3) `memory*.{js,ts}`, `retrieval-guard.js`.

---

## 5 · Honest caveats

- This brief compares **GenVeris code** against **Enforce's own docs** — confirm
  against Enforce's actual source; it may already have some of these deeper than
  its docs say.
- GenVeris's implementations are JS/TS; porting to Go is a **reimplementation** —
  the transferable asset is the **logic + thresholds + coverage**, not the code.
- The strongest, ship-now ports are the **deterministic** ones (breaker, runtime/
  rate, MCP provenance, input sanitization, cost ceiling, toxicity lexicon).
