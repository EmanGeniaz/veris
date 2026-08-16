/* Policy inspection endpoint — the same DLP/classification engine the AI
   Gateway uses, exposed as a stateless verdict service so a CASB, a forward
   proxy, or a browser extension can enforce the SAME rulebook on AI traffic
   that never touches the in-app gateway (the "shadow AI" path).

   It does not call a model. It only judges text (and, optionally, the
   destination host) and returns allow | mask | block, with the masked text
   to substitute. Every verdict appends to the Article 12 audit hash chain —
   storing a hash of the text plus the categories/rule-ids, never the raw
   sensitive content.

   Auth: a shared inspection key in `VZ_INSPECT_KEY` (issued to the CASB /
   extension fleet), sent as `x-veris-key`. When the env var is unset the route
   runs in open dev mode (no key required) so the demo works out of the box. */

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { evaluateRules, classify } from "@/lib/policy-rules";
import { egressDecision } from "@/lib/egress";
import { db } from "@/lib/db";
import { auditAppend } from "@/lib/audit";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, x-veris-key",
};
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: CORS });
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

/* Best-effort audit: never breaks the verdict, no-ops without a database. */
async function logVerdict(tenantSlug: string, ev: {
  decision: string; dataClass: string; categories: string[]; rules: string[];
  destination?: string; channel?: string; actor?: string; sha: string;
}) {
  try {
    const prisma = db();
    if (!prisma) return;
    const t = await prisma.tenant.findUnique({ where: { slug: String(tenantSlug || "demo") } });
    if (!t) return;
    await auditAppend(
      prisma, t.id, `egress-inspect:${ev.decision}`, ev.dataClass,
      JSON.stringify({ channel: ev.channel, actor: ev.actor, destination: ev.destination,
        categories: ev.categories, rules: ev.rules, sha: ev.sha }),
      ev.actor || ev.channel || "casb",
    );
  } catch { /* logging must never break the response */ }
}

export async function POST(req: NextRequest) {
  // 1 · Authn — enforce the shared key only when one is configured.
  const configured = process.env.VZ_INSPECT_KEY;
  if (configured && req.headers.get("x-veris-key") !== configured) {
    return json({ error: "unauthorized" }, 401);
  }

  let payload: { text?: string; context?: string; egressHost?: string; tenant?: string; actor?: string; channel?: string };
  try { payload = await req.json(); } catch { return json({ error: "invalid json" }, 400); }

  const text = String(payload.text || "").slice(0, 100_000);
  const context = payload.context ? String(payload.context) : "";       // AI host being used (logged only)
  const egressHost = payload.egressHost ? String(payload.egressHost) : ""; // optional: run the egress allow-list
  const tenant = String(payload.tenant || "demo");
  const actor = payload.actor ? String(payload.actor) : undefined;
  const channel = payload.channel ? String(payload.channel) : "casb";

  // 2 · Optional egress gate — ONLY when the caller explicitly asks to check a
  // destination against the data-exfiltration allow-list (deny-by-default).
  // Browser content inspection does NOT set this: the AI host the user is on is
  // context, not an egress target, so it must not be denied by default here.
  if (egressHost) {
    const eg = egressDecision(egressHost);
    if (eg.decision !== "allow") {
      const cls = classify(text);
      await logVerdict(tenant, { decision: "block", dataClass: "Restricted", categories: cls.categories,
        rules: [], destination: egressHost, channel, actor, sha: sha256(text) });
      return json({
        decision: "block", detector: eg.decision === "ssrf" ? "Egress · SSRF" : "Egress policy",
        destination: egressHost, category: eg.category, reason: eg.note, redacted: "", dataClass: "Restricted", categories: cls.categories,
      });
    }
  }

  // 3 · Content — the exact DLP rules + masking the gateway applies.
  const guard = evaluateRules(text);   // { decision, blocked, masked, didMask, matches, primary }
  const cls = classify(text);          // { dataClass, categories }
  const decision = guard.blocked ? "block" : guard.didMask ? "mask" : "allow";
  const rules = guard.matches.map((m) => m.ruleId);

  // 4 · Audit — hash of the text + what fired, never the raw sensitive text.
  await logVerdict(tenant, { decision, dataClass: cls.dataClass, categories: cls.categories, rules, destination: context, channel, actor, sha: sha256(text) });

  return json({
    decision,                                  // allow | mask | block
    dataClass: cls.dataClass,                  // Public | Internal | Confidential | Restricted
    categories: cls.categories,                // e.g. ["PII","PCI"]
    redacted: guard.masked,                     // substitute this text on "mask"
    didMask: guard.didMask,
    reason: guard.primary?.name || null,        // which rule fired
    clauseRef: guard.primary?.clauseRef || null,
    policyKey: guard.primary?.policyKey || null,
    violations: guard.matches.map((m) => ({ ruleId: m.ruleId, name: m.name, action: m.action, severity: m.severity })),
  });
}
