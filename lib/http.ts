/* ── Robust outbound HTTP (BL-06) ────────────────────────────────────────
   Every server-side call to a third party (the model provider, the LLM judge,
   an external AV scanner) must be bounded: a hung upstream must never hang the
   request. `fetchWithTimeout` wraps fetch with an AbortController so the socket
   is actually cancelled on timeout, and additionally races a timer so even a
   fetch implementation that ignores the abort signal (e.g. a stub in a test)
   still rejects deterministically. Pure + injectable — pass a `fetchImpl` to
   test without a network. */

export const DEFAULT_UPSTREAM_TIMEOUT_MS = 30_000;

export class TimeoutError extends Error {
  readonly timeoutMs: number;
  constructor(timeoutMs: number) {
    super(`request timed out after ${timeoutMs}ms`);
    this.name = "TimeoutError";
    this.timeoutMs = timeoutMs;
  }
}

type FetchLike = (url: string, init?: Record<string, unknown>) => Promise<Response>;

export async function fetchWithTimeout(
  url: string,
  init: Record<string, unknown> = {},
  timeoutMs: number = DEFAULT_UPSTREAM_TIMEOUT_MS,
  fetchImpl: FetchLike | undefined = (globalThis as { fetch?: FetchLike }).fetch,
): Promise<Response> {
  if (typeof fetchImpl !== "function") throw new Error("fetch is not available in this environment");
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new TimeoutError(timeoutMs));
    }, timeoutMs);
  });
  // Start the request with the abort signal wired in. Swallow a post-race
  // rejection (the request losing to the timer) so it never surfaces as an
  // unhandled rejection.
  const request = fetchImpl(url, { ...init, signal: controller.signal });
  request.catch(() => {});
  try {
    return await Promise.race([request, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
