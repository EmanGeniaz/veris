/* ── Request schemas (security baseline · control 2) ─────────────────────
   Every JSON body an API route accepts is described here: type, length,
   format and enum. A body that doesn't match is rejected with 400 by
   lib/api-guard `parseJson`, never coerced and passed through.

   Unknown keys: `.strict()` rejects them. The one deliberate exception is
   the persistence bus: the client mirrors its UI records verbatim
   (lib/bus.js pushBus), and those carry display-only fields such as `time`
   or `at`. For the bus, only the known fields are validated and persisted;
   everything else is dropped (zod's default strip) and never reaches the
   database. */
import { z, type ZodType, type ZodTypeDef } from "zod";
import { CAPS, MODULES, RBAC_ROLES } from "@/lib/rbac";
import { FABRIC_KINDS } from "@/lib/evidence-fabric";
import { PLANES } from "@/lib/entitlements";

const text = (max: number) => z.string().max(max);
/* Bus mirror fields: a scalar the UI may send as a number or boolean, stored
   as a bounded string. Objects/arrays are rejected. */
const scalar = (max: number) =>
  z.union([z.string(), z.number(), z.boolean()]).transform(String).pipe(z.string().max(max)).optional();

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().toLowerCase().max(254).email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(256),
  org: z.string().trim().max(120).optional(),
  role: text(40).optional(), // ignored — self-registration is always least-privilege (lib/identity)
}).strict();

export const demoLoginSchema = z.object({ password: z.string().min(1).max(256) }).strict();

/* Knowledge "upload": the client reads a text file (.txt/.md/.csv/.json/.log)
   and posts its contents. The content must be text: binary payloads (NULs,
   executable/archive/PDF signatures, or mostly undecodable bytes) are refused. */
export const KNOWLEDGE_MAX_CHARS = 200_000;
/* Most binaries (zip/docx/xlsx, EXE, ELF, images) contain NULs; PDF is the
   common one that may not, so its signature is checked explicitly. */
const BINARY_SIGNATURES = ["%PDF-", "PK\u0003\u0004", "\u007fELF"];
export function looksBinary(s: string): boolean {
  if (s.includes("\u0000")) return true;
  if (BINARY_SIGNATURES.some((sig) => s.startsWith(sig))) return true;
  const sample = s.slice(0, 4096);
  const bad = (sample.match(/[\uFFFD\u0001-\u0008\u000E-\u001F]/g) || []).length;
  return sample.length > 0 && bad / sample.length > 0.1;
}
export const knowledgeSchema = z.object({
  tenant: text(64).optional(),
  title: text(255).optional(),
  source: text(120).optional(),
  content: z.string().max(KNOWLEDGE_MAX_CHARS)
    .refine((s) => s.trim().length > 0, "content required")
    .refine((s) => !looksBinary(s), "content must be plain text"),
  addedBy: text(120).optional(),
}).strict();

export const tenantCreateSchema = z.object({
  slug: z.string().trim().toLowerCase().min(1).max(40).regex(/^[a-z0-9-]+$/, "slug may only contain a-z, 0-9 and -"),
  name: z.string().trim().min(1).max(80),
  mode: z.enum(["clean", "demo"]).default("clean"),
  token: text(512).optional(), // the onboarding console also sends its token in the body; auth uses the header
}).strict();

export const inspectSchema = z.object({
  text: text(100_000).optional(),
  context: text(512).optional(),
  egressHost: text(253).optional(),
  tenant: text(64).optional(),
  actor: text(254).optional(),
  channel: text(64).optional(),
}).strict();

/* GenVeris workflow → canonical Fabric write (#166): a session-bound governance
   action records a canonical record. `source` is constrained to GenVeris-origin
   values so a client can never claim source="discover"/"enforce"; the route also
   rejects Secret-class payloads (metadata, not raw content). */
export const fabricWriteSchema = z.object({
  tenant: text(64).optional(),
  kind: z.enum(FABRIC_KINDS as unknown as [string, ...string[]]),
  entityId: z.string().trim().min(1).max(120),
  source: z.enum(["human", "genveris", "reviewer"]).default("human"),
  actor: text(120).optional(),
  confidence: z.coerce.number().min(0).max(1).optional(),
  fields: z.record(z.string(), z.unknown()),
  supersedes: text(120).optional(),
}).strict();

/* Operator entitlement grant (WS2 / #167): a platform operator grants, revokes
   or suspends a tenant's plane entitlement, and/or sets the tenant's small plan
   reference. Operates on an explicitly named tenant (not session-bound) and is
   guarded by VZ_ONBOARD_TOKEN at the route — the same server-authoritative admin
   path as tenant provisioning, so a client can never grant itself a plane.
   `plane`+`action`, or `plan`, or both — at least one must be present. */
export const entitlementGrantSchema = z.object({
  tenant: z.string().trim().toLowerCase().min(1).max(64), // target tenant slug (required for an operator grant)
  plane: z.enum(PLANES as unknown as [string, ...string[]]).optional(),
  action: z.enum(["grant", "revoke", "suspend"]).default("grant"),
  plan: text(40).nullable().optional(), // null clears it; a string sets the plan label
  actor: text(120).optional(),
}).strict().refine(
  (v) => v.plane !== undefined || v.plan !== undefined,
  { message: "provide a plane (with action) and/or a plan" },
);

/* Operator Enforce-connection config (WS2 / #167 sub-task 2): a platform operator
   sets or clears a tenant's Veris Enforce gateway URL + credential. Guarded by
   VZ_ONBOARD_TOKEN at the route (server-authoritative, like entitlement grants).
   The token is sealed by lib/secrets before storage and never echoed; on `set`
   a gatewayUrl is required (and SSRF-validated at the route). */
export const enforceConnectionSchema = z.object({
  tenant: z.string().trim().toLowerCase().min(1).max(64),
  action: z.enum(["set", "clear"]).default("set"),
  gatewayUrl: text(2048).optional(),
  token: text(4096).optional(),
  actor: text(120).optional(),
}).strict().refine(
  (v) => v.action !== "set" || (typeof v.gatewayUrl === "string" && v.gatewayUrl.length > 0),
  { message: "gatewayUrl is required when action is 'set'" },
);

/* Governed agent run (#182 §08): trigger a monitoring/governance agent under the
   runtime's governance envelope. Session-bound; the server plans the run
   (entitlement / breaker / HITL / least-privilege) and records it — a client
   cannot grant an agent more than its declared capabilities. */
export const agentRunSchema = z.object({
  tenant: text(64).optional(),
  agentId: z.string().trim().min(1).max(64),
  trigger: z.enum(["manual", "scheduled"]).default("manual"),
}).strict();

/* HITL approval of a propose-agent proposal (#182 §08 step 3): a human approves
   or rejects a pending proposal. Session-bound; the decision is attributed to the
   person, and only an approval has an effect. */
export const agentApproveSchema = z.object({
  tenant: text(64).optional(),
  proposalId: z.string().trim().min(1).max(120),
  decision: z.enum(["approve", "reject"]),
  note: text(2000).optional(),
}).strict();

/* AIMS task-inbox write-back: acknowledging or flagging a governance task
   appends a `task:<decision>` row to the tenant's audit chain (#168). */
export const taskActionSchema = z.object({
  tenant: text(64).optional(),
  taskId: z.string().trim().min(1).max(120),
  entityId: z.string().trim().min(1).max(120),
  kind: z.enum(["assessment", "review", "finding"]),
  decision: z.enum(["acknowledge", "flag"]),
  note: text(2000).optional(),
}).strict();

/* ── Persistence bus (see the header note on unknown keys) ── */
const roles = RBAC_ROLES as [string, ...string[]];
const modules = MODULES.map(([k]) => k) as [string, ...string[]];

export const busSchemas = {
  adminAudit: z.object({ action: scalar(200), target: scalar(300), actor: scalar(120) }),
  rbacPolicy: z.object({ role: z.enum(roles), module: z.enum(modules), capability: z.enum(CAPS) }),
  evidence: z.object({
    item: scalar(500), initiative: scalar(200), scope: scalar(200), control: scalar(300), risk: scalar(300),
    owner: scalar(120), status: scalar(60), approval: scalar(120), version: scalar(20),
  }),
  decisions: z.object({ initiativeId: scalar(120), decision: scalar(500), rationale: scalar(4000), decidedBy: scalar(120) }),
  taxonomyAdds: z.object({ vocab: scalar(120), value: scalar(200), noun: scalar(120), addedBy: scalar(160), status: scalar(40) }),
  taxonomyRequests: z.object({ vocab: scalar(120), value: scalar(200), noun: scalar(120), owner: scalar(120), requestedBy: scalar(160), status: scalar(40) }),
  policies: z.object({
    key: scalar(80), name: scalar(200), category: scalar(120), status: scalar(40), owner: scalar(120),
    reviewCycleDays: z.coerce.number().int().min(1).max(3650).optional(),
  }),
  violations: z.object({
    ruleId: scalar(120), action: scalar(40), severity: z.coerce.number().int().min(0).max(10).optional(),
    model: scalar(120), classification: scalar(60),
  }),
  ideas: z.object({ title: scalar(200), problem: scalar(4000), unit: scalar(120), submitter: scalar(120), stage: scalar(40) }),
} as const;

export type BusStore = keyof typeof busSchemas;
/* A validated bus record: only the store's known scalar fields. */
export type BusRecord = Record<string, string | number | undefined>;
export const busSchemaFor = (store: BusStore) =>
  busSchemas[store] as unknown as ZodType<BusRecord, ZodTypeDef, unknown>;
