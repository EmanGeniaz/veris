# graphify — Claude Code plugin

Packages [graphify](https://github.com/Graphify-Labs/graphify) 0.9.84 as a Claude
Code plugin. graphify maps a folder of code, docs, PDFs, images or video into a
knowledge graph (`graphify-out/graph.json`, `GRAPH_REPORT.md`, `graph.html`) that
Claude queries instead of grepping through files. Code is parsed locally with
tree-sitter; no API key is needed.

The plugin replaces `graphify install` / `graphify claude install`. Those commands
write into `~/.claude` and the project's `CLAUDE.md` / settings. The plugin keeps
everything self-contained and removable with `/plugin uninstall`.

## What's in it

| Component | Path | What it does |
|---|---|---|
| Skill | `skills/graphify/` | The `/graphify` workflow: build, update, query, path, explain, exports. Reference docs load on demand. |
| Hooks | `hooks/` | `PreToolUse` on `Bash\|Grep` and `Read\|Glob`. When the project has a graph, adds a nudge to use `graphify query` instead of raw search. |
| MCP server | `.mcp.json` | `graphify` server with `query_graph`, `get_node`, `get_neighbors`, `shortest_path`, `god_nodes` and related tools. |

## Requirements

- **Python 3.10+** and **[uv](https://docs.astral.sh/uv/)**.
  - The MCP server runs through `uvx`.
  - The skill installs the `graphifyy` CLI with `uv tool install` on first use, falling back to `pip`.
- The hooks call `graphify` from `PATH`. Until the CLI is installed, or while the project has no graph, they exit silently and never block a tool call.

## Install

From a clone of this repo:

```
/plugin marketplace add ./
/plugin install graphify@geniaz
```

Or from GitHub:

```
/plugin marketplace add EmanGeniaz/veris
/plugin install graphify@geniaz
```

To try it without installing:

```
claude --plugin-dir plugins/graphify
```

## Use

```
/graphify .                            # build the graph for the current project
/graphify . --update                   # incremental re-extract of changed files
/graphify query "how does auth work?"  # scoped subgraph for a question
/graphify path "middleware" "prisma"   # how two things connect
/graphify explain "rate-limit"         # one concept and its neighbours
```

Plugin skills are namespaced, so the skill also appears as `/graphify:graphify`.
Run `/graphify --help` for the full flag list.

Once `graphify-out/graph.json` exists, Claude reaches for the graph first on
codebase questions. The skill's description says so, and the hooks remind it on
search and read calls.

## Configuration

| Variable | Effect |
|---|---|
| `GRAPHIFY_OUT` | Output directory (default `graphify-out`). Honoured by the hook and the CLI. |
| `GRAPHIFY_HOOK_STRICT=1` | Deny the first raw `Read` of indexed source per session and redirect to `graphify query`. After that, it falls back to the nudge. |
| `GEMINI_API_KEY` / `GOOGLE_API_KEY` | Optional. Uses Gemini for the semantic pass over docs/PDFs/images; otherwise Claude does it with subagents. |

## Updating graphify

The skill text and the package version are pinned together (`0.9.84`): the skill
calls graphify's Python API directly, so they must match. To move to a newer
release:

1. Copy `graphify/skill.md` → `skills/graphify/SKILL.md`.
2. Copy `graphify/skills/claude/references/*.md` → `skills/graphify/references/`.
3. Re-apply the version pin in Step 1 of `SKILL.md`.
4. Bump the version in `.mcp.json`, `.claude-plugin/plugin.json`, the root
   `.claude-plugin/marketplace.json` and `NOTICE`.
5. Run `claude plugin validate --strict plugins/graphify`.

## License

Apache-2.0. The skill and reference docs come from graphify; see `NOTICE` for
attribution and the changes made here.
