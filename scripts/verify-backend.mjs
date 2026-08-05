/* Live backend verification. Run locally, against your own running dev server
   and your own .env (Supabase + Anthropic key) — this script talks to the app,
   it does not carry secrets. It proves the four things a real backend enables:

     1. Live AI            — the gateway does real inference (not the simulation)
     2. Least-privilege    — an out-of-scope agent tool call is blocked
     3. Policy guardrail   — a prompt with a card number is masked or blocked
     4. Art.12 logging     — inference events land in the SHA-256 audit chain

   Usage (from the repo root, with the dev server running):
       node scripts/verify-backend.mjs
   Optionally point at a specific origin:
       VZ_BASE=http://localhost:3001 node scripts/verify-backend.mjs
*/
import "dotenv/config";

const results = [];
const line = (pass, name, detail) => {
  results.push(pass);
  console.log((pass ? "PASS" : "FAIL").padEnd(5) + name.padEnd(30) + " — " + detail);
};

async function findBase() {
  const candidates = [process.env.VZ_BASE, "http://localhost:3000", "http://localhost:3001"].filter(Boolean);
  for (const b of candidates) {
    try { const r = await fetch(b, { method: "GET" }); if (r.status < 500) return b; } catch { /* try next */ }
  }
  return null;
}

const post = (base, body) =>
  fetch(base + "/api/gateway/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
    .then(r => r.json());

const base = await findBase();
if (!base) {
  console.log("No dev server reachable on :3000 or :3001 — start it with `npm run dev`, or set VZ_BASE.");
  process.exit(1);
}
console.log("Verifying live backend at:", base, "\n");

// 1. Live AI — the gateway does real inference
try {
  const a = await post(base, { prompt: "In one sentence, what is AI governance?", tenant: "demo" });
  line(a.enabled === true && !!a.text, "Live AI (real inference)",
    a.enabled ? "“" + String(a.text).slice(0, 60).replace(/\s+/g, " ") + "…”" : "enabled:false → ANTHROPIC_API_KEY not loaded by the server");
} catch (e) { line(false, "Live AI (real inference)", e.message); }

// 2. Agent least-privilege — out-of-scope tool call is blocked (runs only with a key set)
try {
  const b = await post(base, { prompt: "x", agent: "agent-crc", tool: "delete_database" });
  line(b.blocked === true, "Agent least-privilege block", b.blocked ? "blocked · " + (b.detector || "") : "not blocked");
} catch (e) { line(false, "Agent least-privilege block", e.message); }

// 3. Policy guardrail — a card number is masked or blocked at the gateway
try {
  const c = await post(base, { prompt: "my card is 4111 1111 1111 1111, summarise it", tenant: "demo" });
  line(c.blocked === true || c.masked === true, "Policy guardrail (PII)", c.blocked ? "blocked" : c.masked ? "masked at ingress" : "neither blocked nor masked");
} catch (e) { line(false, "Policy guardrail (PII)", e.message); }

// 4. Art.12 inference logging — events landed in the audit hash chain (queries YOUR db)
try {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  const n = await prisma.auditLog.count({ where: { action: { startsWith: "inference:" } } });
  line(n > 0, "Art.12 inference logging", n + " inference events in the SHA-256 audit chain");
  await prisma.$disconnect();
} catch (e) { line(false, "Art.12 inference logging", "DB query failed: " + e.message); }

const passed = results.filter(Boolean).length;
console.log("\n" + passed + "/" + results.length + " checks passed");
process.exit(passed === results.length ? 0 : 1);
