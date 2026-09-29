/* ── Discover → GenVeris ingestion contract (WS1 / #166) ──────────────────────
   The single seam by which Veris Discover writes a discovered AI estate into the
   Evidence Fabric. Pure validation of the ingest request, kept out of the route
   so it is deterministic and unit-tested. The route adds auth (token), tenant
   binding, and the persistence loop (fabricAppend).

   The contract, enforced here:
     • Enterprise-tier only — ingestion is an Enterprise-tier capability; a
       non-enterprise request is refused whole (402/403).
     • Metadata, not content — a record whose fields classify as Secret-class
       (Restricted: secrets / PCI / PHI) is rejected. Discover sends governance
       metadata and references, never raw sensitive content.
     • Known kinds only — a record must be one of the canonical Fabric kinds.
     • Partial success — valid records are accepted and the rest are reported with
       a reason, so one bad record never drops a whole batch.
     • Provenance integrity is the ROUTE's job: it stamps source = "discover" on
       every accepted record, so a caller can never claim source = "human".
*/
import { classify } from "./policy-rules";
import { FABRIC_KINDS, type FabricKind } from "./evidence-fabric";

const MAX_RECORDS = 500;

export type IngestRecordIn = { kind?: unknown; entityId?: unknown; confidence?: unknown; fields?: unknown };
export type AcceptedRecord = { kind: FabricKind; entityId: string; confidence: number; fields: Record<string, unknown> };
export type RejectedRecord = { entityId: string; reason: string };
export type IngestValidation =
  | { ok: false; status: number; reason: string }
  | { ok: true; status: 200; accepted: AcceptedRecord[]; rejected: RejectedRecord[] };

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const clampConfidence = (v: unknown): number => {
  const n = typeof v === "number" ? v : 1;
  if (!Number.isFinite(n)) return 1;
  return Math.max(0, Math.min(1, n));
};

/* Validate a Discover ingest request. `body` is the parsed JSON:
   { tenant?, tier, records: [{ kind, entityId, confidence?, fields }] }. */
export function validateDiscoverIngest(body: unknown): IngestValidation {
  if (!isObj(body)) return { ok: false, status: 400, reason: "bad_request" };
  // Enterprise-tier gate — the whole request is refused if the tier isn't enterprise.
  if (String(body.tier || "").toLowerCase() !== "enterprise") {
    return { ok: false, status: 403, reason: "enterprise_tier_required" };
  }
  const records = body.records;
  if (!Array.isArray(records) || records.length === 0) return { ok: false, status: 400, reason: "no_records" };
  if (records.length > MAX_RECORDS) return { ok: false, status: 413, reason: "too_many_records" };

  const accepted: AcceptedRecord[] = [];
  const rejected: RejectedRecord[] = [];
  for (const raw of records as IngestRecordIn[]) {
    const entityId = typeof raw?.entityId === "string" ? raw.entityId.trim() : "";
    const kind = typeof raw?.kind === "string" ? raw.kind : "";
    const label = entityId || "(no entityId)";
    if (!entityId) { rejected.push({ entityId: label, reason: "missing entityId" }); continue; }
    if (!FABRIC_KINDS.includes(kind as FabricKind)) { rejected.push({ entityId: label, reason: `unknown kind "${kind}"` }); continue; }
    if (!isObj(raw.fields)) { rejected.push({ entityId: label, reason: "fields must be an object" }); continue; }
    // Metadata-only: reject a Secret-class payload (secrets / PCI / PHI in the fields).
    if (classify(JSON.stringify(raw.fields)).dataClass === "Restricted") {
      rejected.push({ entityId: label, reason: "secret-class payload rejected — send metadata, not raw content" });
      continue;
    }
    accepted.push({ kind: kind as FabricKind, entityId, confidence: clampConfidence(raw.confidence), fields: raw.fields });
  }
  return { ok: true, status: 200, accepted, rejected };
}
