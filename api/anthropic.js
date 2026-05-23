// Vercel Serverless Function: POST /api/anthropic
//
// This is what makes the AI features in VERIS work without exposing your
// Anthropic API key to the browser. The frontend calls /api/anthropic;
// this function adds the secret key from Vercel's env vars and forwards
// the call to Anthropic. The key never leaves the server.
//
// Required Vercel environment variable:
//   ANTHROPIC_API_KEY = sk-ant-...

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "missing_api_key",
      message:
        "ANTHROPIC_API_KEY is not set on this deployment. In Vercel: Project → Settings → Environment Variables → add ANTHROPIC_API_KEY, then redeploy.",
    });
  }

  try {
    const { model, max_tokens, system, messages } = req.body || {};
    if (!model || !messages) {
      return res
        .status(400)
        .json({ error: "bad_request", message: "model and messages are required" });
    }

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: max_tokens || 1024,
        ...(system ? { system } : {}),
        messages,
      }),
    });

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (err) {
    console.error("[api/anthropic]", err);
    return res
      .status(500)
      .json({ error: "proxy_error", message: err.message });
  }
}
