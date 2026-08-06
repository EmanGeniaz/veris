/* ── Veris Enforce — MCP supply-chain control ───────────────────────────
   Agents reach tools through MCP servers, and an MCP server is third-party
   code that can change under you. The rug-pull (handbook §9.4, OWASP LLM03):
   a server you approved silently broadens its manifest — adds a tool, widens a
   scope — after you trusted it, and every agent wired to it inherits the new
   capability without anyone re-approving.

   The control is provenance, not detection: pin the manifest by hash at
   approval, require a trusted signature, and refuse any server whose CURRENT
   manifest hash no longer matches the PINNED one. Deterministic — it survives a
   more capable model, because it never classifies text; it compares a hash. A
   drifted manifest is quarantined before an agent can be issued a capability
   token against its tools.

   Pure + client-safe. The seeded registry below is a representative estate;
   the same status derivation runs at the gateway when a server is resolved. */

/* Deterministic manifest hash — the signature over a server's declared tool
   set (name + scope, order-independent). Stands in for the SHA-256 the gateway
   computes; changing any tool or scope changes the hash. */
function manifestHash(tools) {
  const canon = (tools || []).map(t => `${t.name}:${(t.scopes || []).slice().sort().join(",")}`).sort().join("|");
  let h = 5381;
  for (let i = 0; i < canon.length; i++) h = ((h << 5) + h + canon.charCodeAt(i)) >>> 0;
  return "sha256:" + h.toString(16).padStart(8, "0");
}

/* Each MCP server is a governed supply-chain object. `approvedTools` is the
   manifest that was pinned at approval; `currentTools` is what it presents now.
   A mismatch is a rug-pull. */
export const MCP_SERVERS = [
  { id: "mcp-fs", name: "Filesystem MCP", vendor: "Anthropic", publisher: "modelcontextprotocol", trust: "verified", transport: "stdio", endpoint: "npx @mcp/filesystem", signed: true, pinned: true, owner: "Platform AI",
    approvedTools: [{ name: "read_file", scopes: ["/workspace"] }, { name: "list_dir", scopes: ["/workspace"] }],
    currentTools:  [{ name: "read_file", scopes: ["/workspace"] }, { name: "list_dir", scopes: ["/workspace"] }] },
  { id: "mcp-gh", name: "GitHub MCP", vendor: "GitHub", publisher: "github", trust: "verified", transport: "http", endpoint: "https://mcp.github.com", signed: true, pinned: true, owner: "Platform AI",
    approvedTools: [{ name: "read_repo", scopes: ["read"] }, { name: "list_prs", scopes: ["read"] }, { name: "create_issue", scopes: ["write:issues"] }],
    currentTools:  [{ name: "read_repo", scopes: ["read"] }, { name: "list_prs", scopes: ["read"] }, { name: "create_issue", scopes: ["write:issues"] }] },
  { id: "mcp-search", name: "Web-Search MCP", vendor: "OpenTools", publisher: "opentools-community", trust: "community", transport: "http", endpoint: "https://mcp.opentools.dev/search", signed: true, pinned: true, owner: "Customer Ops AI",
    // RUG-PULL: a data-exfiltration tool + a widened fetch scope appeared after approval.
    approvedTools: [{ name: "web_search", scopes: ["public"] }, { name: "get_page", scopes: ["public"] }],
    currentTools:  [{ name: "web_search", scopes: ["public"] }, { name: "get_page", scopes: ["public", "internal"] }, { name: "post_webhook", scopes: ["egress"] }] },
  { id: "mcp-pg", name: "Postgres MCP", vendor: "Supabase", publisher: "supabase", trust: "verified", transport: "stdio", endpoint: "npx @mcp/postgres", signed: true, pinned: true, owner: "Data Platform",
    approvedTools: [{ name: "query_ro", scopes: ["read:analytics"] }],
    currentTools:  [{ name: "query_ro", scopes: ["read:analytics"] }] },
  { id: "mcp-pdf", name: "PDF-Tools MCP", vendor: "pdf-tools.io", publisher: "unknown", trust: "unknown", transport: "http", endpoint: "https://pdf-tools.io/mcp", signed: false, pinned: false, owner: "Unassigned",
    approvedTools: [],
    currentTools:  [{ name: "extract_text", scopes: ["upload"] }, { name: "fetch_remote", scopes: ["egress"] }] },
  { id: "mcp-slack", name: "Slack MCP", vendor: "Slack", publisher: "slack", trust: "verified", transport: "http", endpoint: "https://mcp.slack.com", signed: true, pinned: false, owner: "Platform AI",
    approvedTools: [],
    currentTools:  [{ name: "read_channel", scopes: ["read"] }, { name: "post_message", scopes: ["write"] }] },
];

export const MCP_STATUS_META = {
  rugpull:  { label: "Manifest drift", tone: "crit", desc: "Current manifest hash ≠ pinned — tools changed after approval (rug-pull)." },
  unsigned: { label: "Unsigned",       tone: "crit", desc: "No trusted publisher signature — provenance cannot be verified." },
  unpinned: { label: "Unpinned",       tone: "warn", desc: "Manifest not yet pinned — pending approval before agents may bind." },
  unvetted: { label: "Unvetted",       tone: "warn", desc: "Publisher not on the trust list — vet before pinning." },
  verified: { label: "Verified",       tone: "good", desc: "Signed, pinned, and the current manifest matches the pinned hash." },
};

/* Derive a server's status. Rug-pull outranks everything: a drifted manifest
   is the active supply-chain attack, whether or not it's otherwise trusted. */
export function mcpServerStatus(s) {
  const pinnedHash = manifestHash(s.approvedTools);
  const currentHash = manifestHash(s.currentTools);
  const drift = s.pinned && pinnedHash !== currentHash;
  let status;
  if (drift) status = "rugpull";
  else if (!s.signed) status = "unsigned";
  else if (!s.pinned) status = "unpinned";
  else if (s.trust === "unknown") status = "unvetted";
  else status = "verified";
  // The tools added/removed vs the pinned manifest — the rug-pull evidence.
  const app = new Set((s.approvedTools || []).map(t => t.name));
  const cur = new Set((s.currentTools || []).map(t => t.name));
  const added = [...cur].filter(n => !app.has(n));
  const removed = [...app].filter(n => !cur.has(n));
  // Scope widening on a kept tool (e.g. public → public+internal).
  const widened = (s.currentTools || []).filter(ct => {
    const at = (s.approvedTools || []).find(a => a.name === ct.name);
    return at && ct.scopes.some(sc => !at.scopes.includes(sc));
  }).map(ct => ct.name);
  const blocked = status === "rugpull" || status === "unsigned" || (status === "unpinned");
  return { status, pinnedHash, currentHash, added, removed, widened, blocked };
}

export function mcpRows() {
  return MCP_SERVERS.map(s => ({ server: s, ...mcpServerStatus(s) }));
}

export function mcpStats() {
  const rows = mcpRows();
  const by = st => rows.filter(r => r.status === st).length;
  const bound = rows.filter(r => !r.blocked).length; // servers agents may actually bind to
  return {
    total: rows.length,
    verified: by("verified"),
    rugpull: by("rugpull"),
    unsigned: by("unsigned"),
    unpinned: by("unpinned"),
    unvetted: by("unvetted"),
    bindable: bound,
    blocked: rows.length - bound,
  };
}
