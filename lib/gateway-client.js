/* Client helper: ask Veris Intelligence through the SERVER gateway
   (/api/gateway/chat) — never the model provider directly from the browser.

   Calling api.anthropic.com from client components bypassed the gateway's
   policy enforcement, output validation and cost metering, couldn't carry a
   key safely, and shipped hand-written system prompts (some with stale
   figures). Route everything here instead.

   Returns { enabled, text, blocked? }. When the gateway has no model key it
   returns { enabled:false }; callers then show an honest "unavailable" state
   rather than fabricating a result. */
export async function askGateway(prompt, tenant = "demo") {
  try {
    const res = await fetch("/api/gateway/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, tenant }),
    });
    const d = await res.json();
    if (!d || d.enabled === false) return { enabled: false, text: "" };
    if (d.blocked) return { enabled: true, blocked: true, text: d.detector ? `Blocked by policy: ${d.detector}.` : "Blocked by policy." };
    return { enabled: true, text: d.text || "" };
  } catch {
    return { enabled: false, text: "" };
  }
}
