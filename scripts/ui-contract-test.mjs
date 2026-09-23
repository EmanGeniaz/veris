/* GenVeris · UI contract tests (BL-08 self-hosted fonts, BL-09 non-blocking tour)
   Static, deterministic guardrails that lock two UI invariants which have no
   DOM test runner to cover them, so they can't silently regress. No browser,
   no network, no DB — pure source + file-system checks, so they run in CI next
   to the other suites. Run: node scripts/ui-contract-test.mjs

   BL-08 — the platform must self-host its fonts (air-gap safe): no runtime
   reference to a font CDN, every @font-face src points at a committed
   /public/fonts/*.woff2, and each referenced file exists and is a real woff2.

   BL-09 — the guided tour is a full-screen modal that intercepts clicks, so it
   must never auto-launch under automation and must expose stable test hooks. */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(resolve(ROOT, p), "utf8");

const R = [];
const check = (name, cond) => { R.push([cond ? "PASS" : "FAIL", name]); };

/* ── BL-08 · self-hosted fonts ── */
{
  const core = read("components/platform/core.jsx");
  // isolate the injected FONTS block so we only assert on font declarations
  const m = /export const FONTS = `([\s\S]*?)`;/.exec(core);
  check("core.jsx exposes a FONTS block", !!m);
  const fonts = m ? m[1] : "";

  check("no runtime font-CDN reference in FONTS", !/fonts\.(googleapis|gstatic)\.com/.test(fonts));
  check("no @import (removed with the CDN dependency)", !/@import/.test(fonts));
  check("no JetBrains Mono (dropped — was never referenced)", !/JetBrains/i.test(fonts));

  const srcs = [...fonts.matchAll(/url\(['"]?([^'")]+)['"]?\)/g)].map((x) => x[1]);
  check("FONTS declares at least one self-hosted face", srcs.length > 0);
  check("every font src is a local /fonts/*.woff2", srcs.length > 0 && srcs.every((s) => /^\/fonts\/[\w.-]+\.woff2$/.test(s)));

  let allExist = srcs.length > 0;
  let allMagic = srcs.length > 0;
  for (const s of srcs) {
    const p = resolve(ROOT, "public" + s);
    if (!existsSync(p)) { allExist = false; continue; }
    const buf = readFileSync(p);
    if (buf.slice(0, 4).toString("latin1") !== "wOF2") allMagic = false;
  }
  check("every referenced woff2 exists on disk", allExist);
  check("every referenced woff2 has the wOF2 signature", allMagic);

  // the font families the design system actually references must be declared
  check("Manrope face declared", /font-family:\s*'Manrope'/.test(fonts));
  check("DM Serif Display face declared", /font-family:\s*'DM Serif Display'/.test(fonts));
}

/* ── BL-09 · non-blocking tour + stable test hooks ── */
{
  const platform = read("components/GenVerisPlatform.jsx");
  const tour = read("components/platform/tour.jsx");

  // the auto-launch effect must be suppressed for automation / explicit opt-out
  check("tour auto-launch suppressed under navigator.webdriver", /navigator\.webdriver/.test(platform));
  check("tour auto-launch honours a ?tour=off opt-out", /tour["']?\)\s*===\s*["']off["']|get\(["']tour["']\)\s*===\s*["']off["']/.test(platform));

  // stable, i18n-proof hooks so automation can find/dismiss the modal
  check("tour dialog exposes data-testid=\"vz-tour\"", /data-testid="vz-tour"/.test(tour));
  check("tour skip button exposes data-testid=\"vz-tour-skip\"", /data-testid="vz-tour-skip"/.test(tour));

  // the click-integrity harness should prefer the stable hook
  const harness = read("scripts/click-integrity.mjs");
  check("click-integrity harness uses the stable skip hook", /data-testid="vz-tour-skip"/.test(harness));
}

const failed = R.filter(([s]) => s === "FAIL");
for (const [s, n] of R) console.log(`${s}  ${n}`);
console.log(`\n${R.length - failed.length}/${R.length} passed`);
process.exit(failed.length ? 1 : 0);
