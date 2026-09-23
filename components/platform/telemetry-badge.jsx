"use client";

import { useState, useEffect } from "react";
import { T, F } from "./core";

/* ── Truthful telemetry badge (BL-03) ────────────────────────────────────
   An honest provenance pill for any surface that shows governance / cost /
   framework numbers. When no real database is configured those figures are
   seeded demonstration data, and this badge says so ("Demo data") so no one
   mistakes them for live governance telemetry; with a database it reads "Live".

   The live-vs-demo signal is the server's authoritative telemetryMode
   (/api/auth-status → telemetry). The fetch is cached module-wide so dropping
   the badge on many panels costs one request, and it fails safe to "Demo data"
   (the honest default) if the signal can't be read. */

let cached = null; // Promise<{mode,label,live}>
function fetchTelemetry() {
  if (cached) return cached;
  cached = (typeof fetch === "undefined"
    ? Promise.resolve(null)
    : fetch("/api/auth-status")
        .then((r) => r.json())
        .then((d) => (d && d.telemetry ? d.telemetry : null))
        .catch(() => null));
  return cached;
}

export function TelemetryBadge({ style }) {
  // Honest default before/while the signal loads: assume demo (never overclaim "Live").
  const [info, setInfo] = useState({ label: "Demo data", live: false });
  useEffect(() => {
    let on = true;
    fetchTelemetry().then((t) => { if (on && t) setInfo({ label: t.label, live: !!t.live }); });
    return () => { on = false; };
  }, []);
  const c = info.live ? T.green : T.amber;
  const title = info.live
    ? "Live telemetry — figures are computed from your configured database."
    : "Demonstration data — figures are seeded and illustrative. Connect a database for live telemetry.";
  return (
    <span title={title} aria-label={`Data source: ${info.label}`}
      style={{ display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0, background: c + "1c", border: `1px solid ${c}55`, borderRadius: 999, padding: "2px 9px", fontSize: 9, fontWeight: 900, fontFamily: F.m, letterSpacing: "0.06em", textTransform: "uppercase", color: c, ...style }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}88` }} />
      {info.label}
    </span>
  );
}
