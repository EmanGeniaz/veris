/* ── Canonical initiative registry ──────────────────────────────────
   An AI initiative is ONE object. Before this, the CEO portfolio program
   and the AI Central governed record were two disconnected lists — the
   same initiative addressed by name in one place and by id in another,
   with no way to navigate from one lens to the other. This registry gives
   every initiative a single canonical id and lets any surface resolve the
   same record and see which other surfaces are lenses on it.

   Financial scalars still live on their authoring lens (the CEO spine and
   the governed record); this layer unifies IDENTITY and NAVIGATION, so a
   board program and its governed object are provably the same thing. */

import { PORTFOLIO } from "./portfolio";
import { AI_ASSETS, assetById } from "./ai-assets";

/* The four programs that are also fully-governed AI Central objects. */
export const GOVERNED_IDS = new Set(AI_ASSETS.map((a) => a.id));

export function isGoverned(id) {
  return GOVERNED_IDS.has(id);
}

export function programFor(id) {
  return PORTFOLIO.find((p) => p.id === id) || null;
}

/* Resolve any initiative id to its unified record: the CEO portfolio lens
   merged with the governed object when one exists. `depth` says how deeply
   the initiative is modelled; `object` is the governed record or null. */
export function initiativeById(id) {
  const program = programFor(id);
  const object = isGoverned(id) ? assetById(id) : null;
  if (!program && !object) return null;
  return {
    id,
    name: (program && program.name) || (object && object.name) || id,
    unit: (object && object.unit) || (program && program.unit) || "",
    program,
    object,
    depth: object ? "governed" : "portfolio",
  };
}

/* Every initiative, unified. Portfolio order is the canonical order. */
export const INITIATIVES = PORTFOLIO.map((p) => initiativeById(p.id));

/* The surfaces that are a lens on this one object — used to render the
   "unified record" strip and to navigate between lenses. A governed
   initiative appears on every governance surface; a portfolio-only one is
   the board summary plus value tracking, pending a governed record. */
export function surfacesFor(id) {
  const governed = isGoverned(id);
  const list = [
    { key: "portfolio", label: "CEO Portfolio", target: "enterpriseHealth", ctx: {} },
  ];
  if (governed) {
    list.push(
      { key: "initiative", label: "AI Central", target: "initiative", ctx: { id, initTab: "overview" } },
      { key: "governance", label: "Governance", target: "governance", ctx: { id } },
      { key: "risk", label: "Risk Center", target: "monitoring", ctx: { id } },
      { key: "value", label: "Value", target: "value", ctx: { id } },
      { key: "evidence", label: "Evidence", target: "evidence", ctx: {} },
    );
  } else {
    list.push({ key: "value", label: "Value", target: "portfolioValue", ctx: {} });
  }
  return list;
}

/* Does this program open a governed object? (drives the CEO drill-in.) */
export function governedTarget(id) {
  return isGoverned(id)
    ? { target: "initiative", ctx: { id, initTab: "overview" } }
    : null;
}
