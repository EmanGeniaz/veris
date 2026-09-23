/* ── Gateway request validation (BL-06) ──────────────────────────────────
   The gateway is a public POST surface: it must not trust its request body.
   This pure validator rejects a malformed / oversized / mistyped payload with
   an honest status + reason *before* any guardrail, regex or model call runs —
   so a giant string can't be fed to the classifiers, a non-string prompt can't
   throw deep in the pipeline, and a client error is reported as a 4xx rather
   than being silently swallowed and mislabelled "gateway disabled".

   Kept separate from the route so it is unit-testable without booting Next. */

export const MAX_PROMPT_CHARS = 100_000;   // hard ceiling; ingress further caps to TEXT_SIZE_CAP for the model
export const MAX_ATTACHMENTS = 10;
export const MAX_FIELD_CHARS = 256;        // identifier fields (tenant/agent/tool/…)

const STRING_FIELDS = ["tenant", "agent", "tool", "mcpServer", "dest", "session", "model"] as const;

export interface ChatRequest {
  prompt: string;
  tenant: string;
  agent?: string;
  tool?: string;
  mcpServer?: string;
  dest?: string;
  value: number | null;
  session?: string;
  attachments?: unknown[];
  model?: string;
}

export type ValidationResult =
  | { ok: true; value: ChatRequest }
  | { ok: false; status: number; reason: string };

export function validateChatRequest(body: unknown): ValidationResult {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, status: 400, reason: "bad_request" };
  }
  const b = body as Record<string, unknown>;

  const prompt = b.prompt;
  if (typeof prompt !== "string") return { ok: false, status: 400, reason: "invalid_prompt" };
  if (prompt.trim().length === 0) return { ok: false, status: 400, reason: "empty_prompt" };
  if (prompt.length > MAX_PROMPT_CHARS) return { ok: false, status: 413, reason: "prompt_too_large" };

  for (const f of STRING_FIELDS) {
    const v = b[f];
    if (v !== undefined && v !== null && (typeof v !== "string" || v.length > MAX_FIELD_CHARS)) {
      return { ok: false, status: 400, reason: `invalid_${f}` };
    }
  }

  let value: number | null = null;
  if (b.value !== undefined && b.value !== null) {
    const n = Number(b.value);
    if (!Number.isFinite(n)) return { ok: false, status: 400, reason: "invalid_value" };
    value = n;
  }

  if (b.attachments !== undefined && b.attachments !== null) {
    if (!Array.isArray(b.attachments)) return { ok: false, status: 400, reason: "invalid_attachments" };
    if (b.attachments.length > MAX_ATTACHMENTS) return { ok: false, status: 413, reason: "too_many_attachments" };
  }

  return {
    ok: true,
    value: {
      prompt,
      tenant: (b.tenant as string) ?? "demo",
      agent: b.agent as string | undefined,
      tool: b.tool as string | undefined,
      mcpServer: b.mcpServer as string | undefined,
      dest: b.dest as string | undefined,
      value,
      session: b.session as string | undefined,
      attachments: b.attachments as unknown[] | undefined,
      model: b.model as string | undefined,
    },
  };
}
