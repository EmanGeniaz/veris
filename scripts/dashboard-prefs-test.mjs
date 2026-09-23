/* GenVeris · Dashboard personalization tests
   Locks the pure preference logic behind the user-customizable cockpit: which
   sections a user chooses to see. Browser-free (the merge logic is pure);
   runs in CI. Run: node scripts/dashboard-prefs-test.mjs */
import { CEO_SECTIONS, CAIO_SECTIONS, ROLE_CENTER_SECTIONS, COCKPIT_SECTIONS, normalizeSections } from "../lib/dashboard-prefs.js";

const R = [];
const check = (name, cond) => { R.push([cond ? "PASS" : "FAIL", name]); };
const keysOf = (sections) => sections.map((s) => s.key);
const allTrue = (m, keys) => keys.every((k) => m[k] === true);

const CATALOGS = [["CEO", CEO_SECTIONS], ["CAIO", CAIO_SECTIONS], ["role-center", ROLE_CENTER_SECTIONS], ["cockpit", COCKPIT_SECTIONS]];

/* ── catalogs ── */
for (const [name, cat] of CATALOGS) {
  const keys = keysOf(cat);
  check(`${name} catalog is non-empty`, cat.length >= 1);
  check(`${name} every section has key/label/desc`, cat.every((s) => s.key && s.label && s.desc));
  check(`${name} section keys are unique`, new Set(keys).size === keys.length);
}
check("cockpit has its core sections", ["kpis", "snapshot", "attention", "activity", "decisions", "narrative"].every((k) => keysOf(COCKPIT_SECTIONS).includes(k)));
check("CEO has its core sections", ["oversight", "attention", "kpis", "lifecycle", "exposure", "adoption"].every((k) => keysOf(CEO_SECTIONS).includes(k)));
check("CAIO has its core sections", ["attention", "metrics", "govcompliance", "risksincidents", "quickaccess"].every((k) => keysOf(CAIO_SECTIONS).includes(k)));
check("role-center has its core sections", ["facet", "attention", "kpis", "panels"].every((k) => keysOf(ROLE_CENTER_SECTIONS).includes(k)));

/* ── normalizeSections (the merge) — exercised against each catalog ── */
for (const [, cat] of CATALOGS) {
  const keys = keysOf(cat);
  const first = keys[0];
  check("default (null) shows everything", allTrue(normalizeSections(null, keys), keys));
  check("non-object input shows everything", allTrue(normalizeSections("nope", keys), keys) && allTrue(normalizeSections(42, keys), keys) && allTrue(normalizeSections([1, 2], keys), keys));
  check("an explicit false hides just that section", (() => { const m = normalizeSections({ [first]: false }, keys); return m[first] === false && keys.filter((k) => k !== first).every((k) => m[k] === true); })());
  check("only genuine false hides (truthy stays visible)", (() => { const m = normalizeSections({ [first]: 0 }, keys); return m[first] === true; })());
  check("unknown keys are ignored (forward-compatible)", (() => { const m = normalizeSections({ bogus: false, [first]: false }, keys); return !("bogus" in m) && m[first] === false; })());
  check("result covers exactly the catalog keys", (() => { const m = normalizeSections({ [first]: false }, keys); return Object.keys(m).sort().join(",") === [...keys].sort().join(","); })());
  check("all-off is representable", (() => { const m = normalizeSections(Object.fromEntries(keys.map((x) => [x, false])), keys); return keys.every((k) => m[k] === false); })());
}
check("empty keys yields empty map", Object.keys(normalizeSections({ a: false }, [])).length === 0);

const failed = R.filter(([s]) => s === "FAIL");
for (const [s, n] of R) console.log(`${s}  ${n}`);
console.log(`\n${R.length - failed.length}/${R.length} passed`);
process.exit(failed.length ? 1 : 0);
