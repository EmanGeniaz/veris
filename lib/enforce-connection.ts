/* ── Veris Enforce connection + honest state (WS2 · #167 sub-task 2) ──────
   The second half of the entitlement seam: WHERE a tenant's Enforce engine is
   and WHETHER a surface may show it live. Entitlement (sub-task 1) says the
   tenant owns Enforce; this module adds the per-tenant connection (gateway URL +
   a sealed credential reference) and resolves the honest state a surface renders.

   Pure (no db / no node APIs) so it is unit-tested in isolation and safe to
   import anywhere. The live-from-Enforce read itself is sub-task 3 — so this
   resolver never returns a "live" state; the furthest it goes is
   "awaiting-connection". A surface stays on its demo/governance view until that
   adapter lands, and is badged truthfully throughout. */

export type ConnectionState =
  | "not-entitled"        // tenant does not own Enforce → governance/demo only
  | "awaiting-config"     // entitled, but no connection configured yet
  | "awaiting-connection" // entitled + configured, engine not yet connected/verified (live read is sub-task 3)
  | "live";               // reserved for sub-task 3 — never produced here

export interface ConnectionStateView {
  state: ConnectionState;
  badge: "Live" | "Demo";
  label: string;
  live: boolean;
}

/* Resolve the honest state from entitlement + whether a connection row exists +
   whether the secret store can open its credential. Default-empty and
   demo-first: anything short of a verified live engine is badged Demo. */
export function connectionState(input: {
  entitled: boolean;
  hasConnection: boolean;
  secretsReady?: boolean;
}): ConnectionStateView {
  if (!input.entitled) {
    return { state: "not-entitled", badge: "Demo", live: false, label: "Veris Enforce not licensed — governance & demo only" };
  }
  if (!input.hasConnection) {
    return { state: "awaiting-config", badge: "Demo", live: false, label: "Enforce entitled — awaiting engine configuration" };
  }
  // Configured. The live read (and its reachability verification) is sub-task 3,
  // so we stop at awaiting-connection and never claim Live here. If the secret
  // store can't open the credential, say so plainly in the label.
  const usable = input.secretsReady !== false;
  return {
    state: "awaiting-connection",
    badge: "Demo",
    live: false,
    label: usable
      ? "Enforce configured — awaiting engine connection"
      : "Enforce configured — secret store unavailable, credential cannot be opened",
  };
}

/* ── Gateway URL safety (SSRF guard) ──────────────────────────────────────
   The operator-supplied Enforce gateway URL is validated before it is ever
   stored or fetched: HTTPS only, and never a loopback / private / link-local /
   cloud-metadata destination (the same SSRF class egress policy closes for
   agent tool calls). A live fetch (sub-task 3) still passes egress controls;
   this is the first, declarative gate. */

const PRIVATE_V4 = [
  /^127\./,                                   // loopback
  /^10\./,                                    // private
  /^192\.168\./,                              // private
  /^169\.254\./,                              // link-local incl. 169.254.169.254 metadata
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,           // private 172.16.0.0/12
  /^0\./,                                     // this-host
  /^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./, // CGNAT 100.64/10
];

function hostIsBlockedLiteral(host: string): boolean {
  const h = host.toLowerCase().replace(/^\[|\]$/g, ""); // strip IPv6 brackets
  if (h === "localhost" || h.endsWith(".localhost")) return true;
  if (h === "::1" || h === "0:0:0:0:0:0:0:1") return true;      // IPv6 loopback
  if (h.startsWith("fe80:") || h.startsWith("fc") || h.startsWith("fd")) return true; // link-local / ULA
  if (PRIVATE_V4.some((re) => re.test(h))) return true;
  return false;
}

export function isSafeEnforceUrl(raw: string): { ok: boolean; reason?: string; host?: string } {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return { ok: false, reason: "not a valid URL" };
  }
  if (u.protocol !== "https:") return { ok: false, reason: "must be https" };
  const host = u.hostname;
  if (!host) return { ok: false, reason: "missing host" };
  // Require a dotted FQDN or bracketed IPv6; reject bare single-label hosts
  // (e.g. "enforce", "intranet") that resolve only inside a private network.
  const isIpv6 = raw.includes("[") && raw.includes("]");
  if (!isIpv6 && !host.includes(".")) return { ok: false, reason: "host must be a fully-qualified domain" };
  if (hostIsBlockedLiteral(host)) return { ok: false, reason: "host is private, loopback, link-local or metadata — refused (SSRF)" };
  return { ok: true, host };
}

/* ── Display mask ─────────────────────────────────────────────────────────
   Everything an API may return about a connection: the gateway URL (not a
   secret) and whether a credential is set, with a non-secret fingerprint. The
   sealed token itself never leaves the server. */
export interface ConnectionRowish {
  gatewayUrl?: string | null;
  sealedToken?: string | null;
  credentialFp?: string | null;
}
export function maskConnection(row: ConnectionRowish | null | undefined): {
  configured: boolean;
  gatewayUrl: string | null;
  credentialSet: boolean;
  credentialFingerprint: string | null;
} {
  if (!row) return { configured: false, gatewayUrl: null, credentialSet: false, credentialFingerprint: null };
  return {
    configured: !!row.gatewayUrl,
    gatewayUrl: row.gatewayUrl ?? null,
    credentialSet: !!row.sealedToken,
    credentialFingerprint: row.credentialFp ?? null,
  };
}
