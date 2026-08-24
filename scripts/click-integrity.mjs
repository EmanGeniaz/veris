/* ── VerisZone click-integrity harness (milestone M-TEST · charter D10) ──────
   Walks every role × every surface in the demo workspace, exercises the
   clickable elements, and records — per element — its LOCATION (role · surface
   · element), the CONSOLE LOGS it produced, and whether the click was clean.
   Emits a machine report (JSON) and a human report (Markdown).

   A finding is a HARD FAILURE when a navigation or click produces a console
   error / pageerror, or a surface renders blank (no heading). "A click with no
   visible effect" is NOT flagged — many controls legitimately no-op — so the
   report stays honest and low-false-positive.

   Usage (a dev/preview server must already be running):
     BASE_URL=http://localhost:3950 node scripts/click-integrity.mjs      # every role × surface: nav clickability + render + console (the gate)
     ROLES=cgo,ciso node scripts/click-integrity.mjs                       # scope to roles
     MAX_BTNS=3 node scripts/click-integrity.mjs                           # also sample content buttons (slower: derailing clicks force a cockpit reset)
   Default is the nav+render walk (MAX_BTNS=0): fast, deterministic, and it
   already exercises every sidebar surface and catches blank surfaces + console
   errors. Exit code is non-zero if any hard failure is found. */

import { writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";

/* resolve playwright: prefer a local dep, fall back to the sandbox global. */
async function loadChromium() {
  for (const spec of ["playwright", "/opt/node22/lib/node_modules/playwright/index.js"]) {
    try { const req = createRequire(import.meta.url); const p = req(spec); if (p?.chromium) return p.chromium; } catch {}
    try { const m = await import(spec); if (m?.chromium) return m.chromium; if (m?.default?.chromium) return m.default.chromium; } catch {}
  }
  throw new Error("Playwright not found. `npm i -D playwright` or run in an env that provides it.");
}

const BASE_URL = process.env.BASE_URL || "http://localhost:3943";
const ENTRY = "/workspace/aicentral";
const ALL_ROLES = ["CEO","COO","CFO","CHRO","CISO","CAIO","CIO","CDPO","CGO","CRO","Legal","Employee","Manager"];
const ROLES = (process.env.ROLES ? process.env.ROLES.split(",").map(s => s.trim()) : ALL_ROLES)
  .map(r => ALL_ROLES.find(a => a.toLowerCase() === r.toLowerCase()) || r);
const MAX_BTNS = Number(process.env.MAX_BTNS ?? 0);   // primary buttons sampled per surface (0 = nav+render walk only, the fast reliable gate; set >0 for deeper button sampling)
const OUT_DIR = "docs/test-reports";

const chromium = await loadChromium();
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 2000 } });

/* console capture tagged with the live location */
let ctx = { role: "-", surface: "-" };
const logs = [];      // every console message, with location
const failures = [];  // hard failures only
page.on("console", m => {
  const rec = { ...ctx, type: m.type(), text: m.text().slice(0, 300) };
  logs.push(rec);
  if (m.type() === "error" && !/ERR_CONNECTION_RESET|favicon|Failed to load resource/.test(m.text()))
    failures.push({ ...rec, kind: "console.error" });
});
page.on("pageerror", e => failures.push({ ...ctx, kind: "pageerror", text: String(e.message).slice(0, 300) }));

const sleep = ms => page.waitForTimeout(ms);
async function killTour() {
  for (const s of ['button[aria-label="Close"]', 'button:has-text("Skip")', 'button:has-text("Dismiss")']) {
    const el = page.locator(s).first(); if (await el.count()) { try { await el.click({ timeout: 600 }); } catch {} }
  }
  await page.keyboard.press("Escape").catch(() => {});
}

const surfaces = [];  // { role, surface, navLabel, rendered, heading, buttonsTested, deadButtons, errorsHere }
const DENY = /sign out|log ?out|log ?in|sign in|create.*account|new workspace|buy|purchase|upgrade|delete|remove|switch|demo center/i;

/* count of nav items currently rendered */
async function navCount() { return page.locator(".vz-nav-btn").count(); }

const roleBtn = rl => page.locator("button", { hasText: new RegExp(`^${rl}$`) }).first();

/* make sure we are in the demo cockpit on `roleLabel`. If this role's switcher
   button isn't present (a click derailed us to another view), hard-reset via
   the entry flow, then re-select the role. */
async function ensureCockpit(roleLabel) {
  if (!(await roleBtn(roleLabel).count())) {
    await page.goto(BASE_URL + ENTRY, { waitUntil: "domcontentloaded" }).catch(() => {});
    await sleep(700);
    const enter = page.locator("button", { hasText: /Enter Demo Center/i }).first();
    if (await enter.count()) { await enter.click().catch(() => {}); await sleep(1100); }
    await killTour();
  }
  const rb = roleBtn(roleLabel);
  if (await rb.count()) { await rb.click({ force: true }).catch(() => {}); for (let i = 0; i < 25; i++) { await sleep(120); if ((await navCount()) > 2) break; } }
  return (await navCount()) > 2;
}

async function walkRole(roleLabel) {
  ctx = { role: roleLabel, surface: "(switch)" };
  await ensureCockpit(roleLabel); await killTour();
  const rb = page.locator("button", { hasText: new RegExp(`^${roleLabel}$`) }).first();
  if (!(await rb.count())) { failures.push({ role: roleLabel, surface: "-", kind: "role-missing", text: `role button ${roleLabel} not found` }); return; }
  await rb.click({ force: true });
  // wait for the rail to re-render for this role
  for (let i = 0; i < 25; i++) { await sleep(120); if ((await navCount()) > 2) break; }
  await sleep(300);

  const nav = page.locator(".vz-nav-btn");
  const n = await nav.count();
  const labels = [];
  for (let i = 0; i < n; i++) { const l = await nav.nth(i).getAttribute("aria-label").catch(() => null); if (l) labels.push(l); }

  for (const label of labels) {
   try {
    ctx = { role: roleLabel, surface: label };
    const errBefore = failures.length;
    const sel = `.vz-nav-btn[aria-label="${label.replace(/"/g, '\\"')}"]`;
    let item = page.locator(sel).first();
    if (!(await item.count())) { await ensureCockpit(roleLabel); item = page.locator(sel).first(); }  // wrong/lost rail — restore this role
    if (process.env.DEBUG) process.stderr.write(`  [${roleLabel}] ${label} nav=${await navCount()} found=${await item.count()}\n`);
    if (!(await item.count())) continue;
    try { await item.click({ timeout: 4000 }); } catch { await item.click({ force: true }).catch(() => {}); }
    await sleep(550);
    const heading = await page.locator("h1,h2").first().innerText().catch(() => "");
    // "rendered" = the content pane (not the sidebar) has real content. Roles with
    // bespoke command centres use styled divs, not <h> tags, so measure content.
    const mainTxt = await page.locator('[data-testid="vz-main"]').first().innerText().catch(() => "");
    const contentLen = mainTxt.replace(/\s+/g, " ").trim().length;
    const rendered = contentLen > 40;
    if (!rendered) failures.push({ role: roleLabel, surface: label, kind: "blank-surface", text: `content length ${contentLen}` });

    // sample primary buttons in the main content (exclude the sidebar rail)
    let tested = 0, dead = 0;
    const btns = page.locator("main button, [role='main'] button, button").filter({ hasNotText: /^$/ });
    const bcount = Math.min(await btns.count(), 60);
    for (let i = 0; i < bcount && tested < MAX_BTNS; i++) {
      try {
        const b = btns.nth(i);
        if (!(await b.isVisible({ timeout: 500 }).catch(() => false))) continue;
        const txt = ((await b.getAttribute("aria-label").catch(() => "")) || (await b.innerText({ timeout: 500 }).catch(() => "")) || "").trim().slice(0, 40);
        if (!txt || ALL_ROLES.includes(txt) || /Tour|Search/.test(txt) || DENY.test(txt)) continue;  // skip role bar / chrome / destructive
        const box = await b.boundingBox().catch(() => null);
        if (!box || box.x < 240) continue;                                            // skip the left nav rail
        ctx = { role: roleLabel, surface: label, element: txt };
        try { await b.click({ timeout: 1500 }); tested++; await sleep(120); await killTour(); }
        catch { dead++; }
        // if a click swapped the rail (left the surface / changed role), restore and stop sampling it
        if (!(await page.locator(sel).count())) {
          await ensureCockpit(roleLabel);
          const back = page.locator(sel).first();
          if (await back.count()) { await back.click({ force: true }).catch(() => {}); await sleep(400); }
          break;
        }
      } catch { /* element detached / re-rendered — skip defensively */ }
    }
    // click the first data row if present (expandable registers)
    try {
      const row = page.locator("tbody tr").first();
      if (await row.count()) { ctx = { role: roleLabel, surface: label, element: "first-row" }; await row.click({ timeout: 1500 }).catch(() => {}); await sleep(120); }
    } catch {}

    surfaces.push({ role: roleLabel, surface: label, rendered, heading: (heading || mainTxt).replace(/\s+/g, " ").trim().slice(0, 60), contentLen, buttonsTested: tested, deadButtons: dead, errorsHere: failures.length - errBefore });
   } catch (e) { failures.push({ role: roleLabel, surface: label, kind: "harness-error", text: String(e.message || e).slice(0, 200) }); }
  }
  ctx = { role: roleLabel, surface: "(switch)" };
}

/* ── run ── */
await page.goto(BASE_URL + ENTRY, { waitUntil: "networkidle" });
await sleep(700);
const enter = page.locator("button", { hasText: /Enter Demo Center/i }).first();
if (await enter.count()) { await enter.click(); await sleep(1200); }
await killTour(); await sleep(300); await killTour();

for (const role of ROLES) { await walkRole(role); }
await browser.close();

/* ── report ── */
mkdirSync(OUT_DIR, { recursive: true });
const totalSurfaces = surfaces.length;
const blank = surfaces.filter(s => !s.rendered).length;
const hardFail = failures.length;
const buttonsTested = surfaces.reduce((a, s) => a + s.buttonsTested, 0);
const byRole = ROLES.map(r => ({ role: r, surfaces: surfaces.filter(s => s.role === r).length, errors: failures.filter(f => f.role === r).length }));

const summary = {
  base: BASE_URL, roles: ROLES, rolesWalked: byRole,
  totals: { surfaces: totalSurfaces, blankSurfaces: blank, buttonsTested, consoleMessages: logs.length, hardFailures: hardFail },
  failures, surfaces,
};
writeFileSync(`${OUT_DIR}/click-integrity.json`, JSON.stringify(summary, null, 2));

const md = [];
md.push(`# VerisZone — Click-integrity report (M-TEST)`);
md.push(``);
md.push(`> Automated walk of role × surface. Location = role · surface · element. Generated by \`scripts/click-integrity.mjs\`.`);
md.push(``);
md.push(`**Base:** ${BASE_URL}  ·  **Roles:** ${ROLES.join(", ")}`);
md.push(``);
md.push(`| Metric | Value |`);
md.push(`|---|---|`);
md.push(`| Surfaces walked | ${totalSurfaces} |`);
md.push(`| Blank surfaces | ${blank} |`);
md.push(`| Buttons exercised | ${buttonsTested} |`);
md.push(`| Console messages | ${logs.length} |`);
md.push(`| **Hard failures** | **${hardFail}** |`);
md.push(``);
md.push(`## Coverage by role`);
md.push(`| Role | Surfaces | Errors |`);
md.push(`|---|---|---|`);
for (const r of byRole) md.push(`| ${r.role} | ${r.surfaces} | ${r.errors} |`);
md.push(``);
md.push(`## Hard failures (location + reason)`);
if (!failures.length) md.push(`_None. Every surface rendered and every exercised click was clean._`);
else { md.push(`| Role | Surface | Element | Kind | Detail |`); md.push(`|---|---|---|---|---|`); for (const f of failures) md.push(`| ${f.role} | ${f.surface} | ${f.element || "—"} | ${f.kind} | ${(f.text || "").replace(/\|/g, "\\|")} |`); }
md.push(``);
md.push(`## Console log tail (last 40, with location)`);
md.push("```");
for (const l of logs.slice(-40)) md.push(`[${l.role} · ${l.surface}${l.element ? " · " + l.element : ""}] ${l.type}: ${l.text}`);
md.push("```");
writeFileSync(`${OUT_DIR}/click-integrity.md`, md.join("\n"));

console.log(`M-TEST done: ${totalSurfaces} surfaces, ${buttonsTested} buttons, ${blank} blank, ${hardFail} hard failures.`);
console.log(`Report: ${OUT_DIR}/click-integrity.md`);
process.exitCode = hardFail > 0 ? 1 : 0;
