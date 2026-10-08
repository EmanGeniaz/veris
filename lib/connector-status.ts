/* ── Connector honesty vocabulary (#182) ─────────────────────────────────
   One state set + one label for every connector / integration card, so a demo
   connector never reads as live. This is the connector analogue of the
   TelemetryBadge Live/Demo signal: a single, truthful vocabulary reused across
   the platform surfaces. Pure (no db, no node, no React) — safe to import
   anywhere and unit-tested in isolation.

   The honesty invariant: `live` is true ONLY for a real integration. Today that
   is Anthropic/Claude (the one wired model egress) and Entra/Google SSO
   (real Auth.js providers, active when configured) — everything else in the
   connector catalogue is aspirational and must resolve to a non-live state. */

export const CONNECTOR_STATES = [
  "connected",            // a real, live integration is connected right now
  "live-when-configured", // a real integration — live when its credential/env is set, else demo
  "enterprise",           // a genuinely entitlement-gated integration, not connected in this workspace
  "roadmap",              // planned — not built yet
  "disconnected",         // no integration connected
] as const;
export type ConnectorState = (typeof CONNECTOR_STATES)[number];

export type ConnectorTone = "good" | "info" | "warn" | "muted";

export interface ConnectorStateMeta {
  label: string;         // badge text shown on the card
  tone: ConnectorTone;   // maps to a theme colour at the render site
  live: boolean;         // TRUE only for a real integration — never for a demo/aspirational card
  title: string;         // honest tooltip
}

export const CONNECTOR_STATE_META: Record<ConnectorState, ConnectorStateMeta> = {
  "connected": {
    label: "Connected", tone: "good", live: true,
    title: "A live integration is connected.",
  },
  "live-when-configured": {
    label: "Live when configured", tone: "good", live: true,
    title: "A real integration — active when its credential/environment is configured; demo otherwise.",
  },
  "enterprise": {
    label: "Requires Enterprise", tone: "warn", live: false,
    title: "A licensed integration — not connected in this workspace; requires the enterprise product and production credentials.",
  },
  "roadmap": {
    label: "Roadmap", tone: "muted", live: false,
    title: "Planned integration — not yet built. Shown for direction, not available to connect.",
  },
  "disconnected": {
    label: "Not connected", tone: "muted", live: false,
    title: "No live integration is connected in this workspace.",
  },
};

export function isConnectorState(v: unknown): v is ConnectorState {
  return typeof v === "string" && (CONNECTOR_STATES as readonly string[]).includes(v);
}

/* Resolve a state's meta. An unknown value falls back to `disconnected` — the
   honest default that never overclaims a live connection. */
export function connectorStateMeta(state: unknown): ConnectorStateMeta {
  return isConnectorState(state) ? CONNECTOR_STATE_META[state] : CONNECTOR_STATE_META.disconnected;
}

/* True only when the state denotes a genuinely live/real integration. */
export function connectorIsLive(state: unknown): boolean {
  return connectorStateMeta(state).live;
}
