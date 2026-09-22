/* ── Enforcement telemetry source selection (pure) ───────────────────────
   The enforcement engines are real, but several UI surfaces read SEEDED windows
   that demonstrate the mechanism rather than reflect live traffic. The fix
   (issue #144) is: read live decisions from the audit/ledger store when a
   database is configured, and fall back to the seeded window only in demo mode —
   ALWAYS clearly labelled so no one mistakes a demo window for live governance.

   This module is the single, testable decision for that fallback. It is pure:
   the caller passes whether a DB is configured and the (already fetched) live
   rows; this picks the source and stamps the mode. Surfaces and API routes share
   it so the live/demo label is consistent everywhere.

   Scope note: this is the reusable core. Per-surface wiring (tool-call ledger,
   circuit breaker, egress, memory, runtime, retrieval) lands incrementally; the
   Article-12 inference log already reads live audit-chain rows this way. */

export type TelemetryMode = "live" | "demo";

export type TelemetryModeInfo = {
  mode: TelemetryMode;
  label: string;   // short badge text for the surface
  live: boolean;
};

/* Whether a surface should present live or demo data. Live requires a
   configured database; without one the surface is honestly in demo mode. */
export function telemetryMode(dbConfigured: boolean): TelemetryModeInfo {
  return dbConfigured
    ? { mode: "live", label: "Live", live: true }
    : { mode: "demo", label: "Demo data", live: false };
}

/* Pick the rows a surface should render, with the mode stamped. Live rows are
   used only when a DB is configured AND live rows exist; otherwise the seeded
   window is returned, labelled demo. A configured DB that currently has no live
   rows is still "live" (an empty live ledger is a truthful state, not a reason
   to show seeded data as if it were real). */
export function pickTelemetry<T>(opts: {
  dbConfigured: boolean;
  liveRows?: T[] | null;
  seededRows: T[];
}): { mode: TelemetryMode; label: string; live: boolean; rows: T[]; source: "live" | "seeded" } {
  const info = telemetryMode(opts.dbConfigured);
  if (info.live) {
    return { ...info, rows: opts.liveRows ?? [], source: "live" };
  }
  return { ...info, rows: opts.seededRows, source: "seeded" };
}
