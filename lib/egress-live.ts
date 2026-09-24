/* ── Live Egress attempts from the audit chain (BL-04 / #144) ─────────────
   The Egress surface has always rendered a seeded window. But every egress
   destination decision — allow / deny / SSRF — is a real per-request signal:
   the gateway's inline egress gate and the policy-inspect (CASB) path both
   append it to the tenant's tamper-evident audit chain as an `egress-inspect:*`
   row carrying the destination, category and reason (`kind:"egress"`). This
   module turns those live rows into the surface's event shape and re-verifies
   the SHA-256 chain, so the containment record reflects what tools ACTUALLY
   tried to reach instead of a demo window — falling back to the seed only when
   no database is configured.

   Pure + deterministic: the caller passes the already-fetched audit rows (in
   write order); this filters, maps + verifies. Chain verification is shared
   with the Tool-Call Ledger (lib/enforce-live.ts) so both surfaces prove the
   same immutable trail. */
import { auditChainIntact, type AuditRow } from "./enforce-live";
import { EGRESS_POLICY } from "@/lib/egress";

export type LiveEgressRow = {
  seq: number; id: string; ts: string;
  agent: string; tool: string; dest: string;
  decision: string; reason: string;
  prevHash: string; hash: string;
};

/* The destination verdicts the egress surface renders. A row's action suffix
   carries the real decision that was made at the time (allow/deny/ssrf); an
   unknown suffix is treated as a denial (deny-by-default, never silently
   allowed). */
const EGRESS_DECISIONS = new Set(["allow", "deny", "ssrf"]);

/* An audit row is a live egress attempt iff it is an `egress-inspect:*` row that
   was tagged `kind:"egress"` — i.e. an actual destination decision, not a
   content-DLP verdict (which also rides `egress-inspect:*` but whose
   `destination` is the AI host being used as context, never an egress target). */
function isEgressDecision(r: AuditRow): boolean {
  if (typeof r.action !== "string" || !r.action.startsWith("egress-inspect:")) return false;
  try { return (JSON.parse(r.detail || "{}") as { kind?: string }).kind === "egress"; }
  catch { return false; }
}

/* Map the egress-decision subset of the audit chain to surface rows, and report
   whether the (full) chain verifies. Non-egress rows still count toward chain
   verification but stay out of the egress view. */
export function liveEgressFromAudit(all: AuditRow[]): { rows: LiveEgressRow[]; intact: boolean } {
  const intact = auditChainIntact(all);
  const eg = all.filter(isEgressDecision);
  const rows = eg.map((r, i) => {
    let d: { destination?: string; agent?: string; tool?: string; reason?: string; category?: string } = {};
    try { d = JSON.parse(r.detail || "{}"); } catch { /* leave empty */ }
    const raw = r.action.replace("egress-inspect:", "");
    const decision = EGRESS_DECISIONS.has(raw) ? raw : "deny";
    return {
      seq: i + 1,
      id: "EG-" + (r.id ? String(r.id).slice(-6) : String(2200 + i)),
      ts: r.createdAt ? new Date(r.createdAt).toISOString().replace("T", " ").replace(/\.\d+Z$/, "Z") : "",
      agent: d.agent || r.actor || "agent",
      tool: d.tool || "—",
      dest: d.destination || "—",
      decision,
      reason: d.reason || "",
      prevHash: r.prevHash,
      hash: r.hash,
    };
  });
  return { rows, intact };
}

/* Stats over live egress rows, matching the fields the surface's KPI row reads
   from the seeded egressStats (total / allowed / denied / ssrf / exfilBlocked /
   allowlisted / denyRate), plus the chain verdict. `allowlisted` is the count of
   explicit allow-list destinations in the (static) policy, not a traffic count. */
export function liveEgressStats(rows: LiveEgressRow[], intact: boolean) {
  const by = (d: string) => rows.filter((r) => r.decision === d).length;
  const denied = by("deny") + by("ssrf");
  const total = rows.length;
  return {
    total,
    allowed: by("allow"),
    denied,
    ssrf: by("ssrf"),
    exfilBlocked: denied,
    allowlisted: EGRESS_POLICY.filter((p: { category: string }) => p.category === "allow").length,
    denyRate: total ? Math.round((denied / total) * 100) : 0,
    intact,
  };
}
