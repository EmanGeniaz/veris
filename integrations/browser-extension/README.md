# VerisZone AI Guard — reference browser extension + inspection endpoint

Closes the "shadow AI" gap: it governs prompts, pastes and uploads to **public**
AI tools (claude.ai, chatgpt.com, gemini, copilot) using the **same policy
engine** as the in-app AI Gateway — so one rulebook covers the sanctioned path
*and* the browser.

## How it works

```
Browser (paste / upload / send)
        │  content.js
        ▼
   background.js  ──POST──►  /api/policy/inspect         ← this repo, app/api/policy/inspect/route.ts
        │                        │  reuses lib/policy-rules.ts + lib/egress.js
        │                        ├─ egressDecision(host)   → block disallowed AI hosts
        │                        ├─ evaluateRules(text)    → DLP block / mask (same rules as the gateway)
        │                        ├─ classify(text)         → data class + categories
        │                        └─ auditAppend()          → Article 12 hash chain (stores a hash, not the text)
        ▼
   verdict: allow | mask | block
```

Because `/api/policy/inspect` imports the exact functions the gateway calls
(`evaluateRules`, `classify`, `egressDecision`), a policy authored in
**Policies & Standards** and cascaded by **Super Admin** governs the assistant,
agents, this extension, and any CASB identically.

## The endpoint

`POST /api/policy/inspect`

```jsonc
// request — content inspection (the browser-extension case)
{ "text": "…", "context": "claude.ai", "tenant": "acme", "actor": "user@acme.com", "channel": "browser-ext" }
// response
{ "decision": "mask", "dataClass": "Confidential", "categories": ["PII"],
  "redacted": "email [MASKED-EMAIL] …", "reason": "PII in prompt", "violations": [ … ] }

// request — optional egress allow-list check (the CASB coarse-mode case)
{ "text": "…", "egressHost": "unknown-endpoint.example.com" }
// → { "decision": "block", "detector": "Egress policy", "reason": "Unknown destination — denied by default" }
```

- `context` is the AI host the user is on — **logged only**, never egress-gated
  (deny-by-default is for exfiltration targets, not the site you're inspecting on).
- `egressHost` is optional and opt-in — set it only to test a destination against
  the data-exfiltration allow-list (`egressDecision`).

- **Auth:** set `VZ_INSPECT_KEY` in the app env and send it as `x-veris-key`.
  If the env var is unset, the route runs in open dev mode (no key required).
- **Privacy:** the audit row stores `sha256(text)` + categories + rule ids — never the raw sensitive text.
- No model is called; it is a pure verdict service (microsecond engine + one network hop).

## Install the extension (dev)

1. Open `chrome://extensions`, enable **Developer mode**, **Load unpacked**, and
   select this `integrations/browser-extension/` folder.
2. Open the extension **Options** and set the **Inspection endpoint** (e.g.
   `https://acme.veriszone.ai/api/policy/inspect`), the **tenant key**, and the
   **actor** email. Toggle **Fail closed** if input should be blocked when
   VerisZone is unreachable.
3. Visit claude.ai and paste a fake card number / email — it is masked or the
   paste is blocked, with a toast, and a verdict is logged to VerisZone.

> Reference implementation. Composer selectors and file handling may need
> tuning per site as their UIs change; ship via Chrome Enterprise / MDM policy
> for a fleet.

## CASB / forward proxy (no extension)

Point the CASB's "call external API for a DLP verdict" action at the same
endpoint. Two modes:

- **Body inspection (inline):** the proxy sends the request body destined for
  `api.anthropic.com` / claude.ai to `/api/policy/inspect`; on `block` it returns
  a block page, on `mask` it rewrites the body with `redacted`.
- **Host allow-list (coarse):** enforce `egressDecision()` at the host level —
  allow `api.anthropic.com` only from the VerisZone gateway egress IP and block
  direct user access, forcing all AI through the governed path. No body
  inspection required.
