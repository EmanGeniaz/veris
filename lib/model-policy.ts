/* ── GenVeris · Model policy (allowlist / routing enforcement) ────────────
   Which model ids the gateway is permitted to call. Closes the gap where the
   policy engine's `model` detector was a no-op and the gateway used whatever
   VZ_GATEWAY_MODEL said with no allowlist. Deterministic, dependency-free.

   The allowlist is VZ_MODEL_ALLOWLIST (comma-separated) or a safe default set.
   A request may name a model; a model not on the allowlist is blocked at the
   gateway and the effective model is always allow-listed. */

export const DEFAULT_MODEL = "claude-sonnet-5";

const DEFAULT_ALLOWLIST = [
  "claude-sonnet-5",
  "claude-opus-5",
  "claude-opus-4-8",
  "claude-sonnet-4-5",
  "claude-haiku-4-5",
];

export function modelAllowlist(): string[] {
  const env = (process.env.VZ_MODEL_ALLOWLIST || "").split(",").map((s) => s.trim()).filter(Boolean);
  return env.length ? env : DEFAULT_ALLOWLIST;
}

export function modelAllowed(model: string | null | undefined): boolean {
  const m = String(model || "").trim();
  return m.length > 0 && modelAllowlist().includes(m);
}

export type ModelResolution = { model: string; blocked: boolean; requested: boolean; reason: string | null };

/* Resolve the model to use for a request. A caller-supplied model must be on
   the allowlist or the request is blocked; with none supplied, the configured
   default (VZ_GATEWAY_MODEL) is used. */
export function resolveModel(requested?: string | null): ModelResolution {
  const fallback = process.env.VZ_GATEWAY_MODEL || DEFAULT_MODEL;
  const req = String(requested || "").trim();
  if (req) {
    if (!modelAllowed(req)) {
      return { model: fallback, blocked: true, requested: true, reason: `Model "${req}" is not on the allowlist.` };
    }
    return { model: req, blocked: false, requested: true, reason: null };
  }
  return { model: fallback, blocked: false, requested: false, reason: null };
}

/* Ingress heuristic: a prompt trying to force a disallowed model
   ("use model <id>", "route to model <id>"). Complements gateway enforcement. */
export function detectModelOverride(text: string): boolean {
  const m = String(text || "").match(/\b(?:use|switch to|route to|call)\s+(?:the\s+)?model\s+([A-Za-z0-9._:-]{3,})/i);
  return m ? !modelAllowed(m[1]) : false;
}
