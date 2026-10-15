#!/bin/sh
# PreToolUse guard: hands the tool call to `graphify hook-guard <search|read>`,
# which prints a nudge toward `graphify query` when a graph exists.
#
# Fails open. A missing graphify install or a project without a graph exits 0
# with no output, so no tool call is ever blocked or slowed by this plugin.
# The graph check is done here in shell, mirroring hook-guard's own
# out_path("graph.json").is_file() test, to skip a Python start-up on every
# Bash/Grep/Read/Glob call in projects that have no graph.
case "$1" in
  search|read) ;;
  *) exit 0 ;;
esac

[ -f "${GRAPHIFY_OUT:-graphify-out}/graph.json" ] || exit 0
command -v graphify >/dev/null 2>&1 || exit 0

graphify hook-guard "$1"
exit 0
