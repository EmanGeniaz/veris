/* VerisZone interactive feature test - exercises the platform's
   mutating flows end-to-end against a running local build.
   Usage: node scripts/feature-test.js */
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const R = [];
  const errs = [];
  page.on('pageerror', e => errs.push(String(e).slice(0, 120)));
  let downloads = 0;
  page.on('download', () => downloads++);
  const test = async (name, fn) => { try { await fn(); R.push(['PASS', name]); } catch (e) { R.push(['FAIL', name + ' :: ' + String(e).slice(0, 100)]); } };
  const body = () => page.locator('body').innerText();

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const email = page.locator('input').first();
  if (!(await email.inputValue())) await email.fill('demo@veriszone.com');
  await page.click('text=Enter Demo Center Workspace');
  await page.waitForTimeout(2200);

  // ── CAIO: create initiative ──
  await page.locator('button', { hasText: /^CAIO$/ }).first().click(); await page.waitForTimeout(900);
  await test('Create AI Initiative', async () => {
    await page.locator('nav button', { hasText: 'AI Central' }).first().click(); await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'AI Lifecycle', exact: true }).first().click(); await page.waitForTimeout(800);
    await page.getByRole('button', { name: 'Initiative Workspaces', exact: true }).first().click(); await page.waitForTimeout(700);
    await page.locator('button:has-text("New AI Initiative")').first().click(); await page.waitForTimeout(600);
    const labels=[['Initiative name','Feature Test Initiative'],['Business unit','QA Lab'],['Business owner','Test Owner'],['Executive sponsor','Test Sponsor'],['Expected value','$1.0M']];
    for(const [l,v] of labels){ await page.locator(`label:has-text("${l}") input`).first().fill(v); }
    await page.locator('button:has-text("Create")').last().click(); await page.waitForTimeout(1100);
    if (!(await body()).includes('Feature Test Initiative')) throw new Error('created initiative not visible');
  });

  // ── Insights: feedback edit + decision ──
  await test('Feedback sliders + gate decision visible', async () => {
    await page.getByRole('button', { name: 'AI Lifecycle', exact: true }).first().click(); await page.waitForTimeout(700);
    await page.getByRole('button', { name: 'Initiative Workspaces', exact: true }).first().click(); await page.waitForTimeout(700);
    await page.locator('button:has-text("Finance Close Automation")').first().click(); await page.waitForTimeout(800);
    await page.getByRole('button', { name: 'Value', exact: true }).first().click(); await page.waitForTimeout(700);
    const t = await body();
    if (!/Recommend: (Scale|Continue|Improve|Retire)/.test(t)) throw new Error('no recommendation');
    if (!t.includes('Generate Executive Briefing')) throw new Error('no briefing button');
  });
  await test('Generate Executive Briefing (download)', async () => {
    const before = downloads;
    await page.locator('button:has-text("Generate Executive Briefing")').first().click();
    await page.waitForTimeout(1200);
    if (downloads <= before) throw new Error('no download fired');
  });

  // Every role now runs a command center. The deep platform Risk Center is
  // reachable from the CAIO command center ("Open full Risk Center →"); the
  // platform Reports (board pack / CSV) is delegated to each role's Reports.

  // ── Risk Center: treatment advance (edit/save + evidence) ──
  await test('Risk treatment advance records evidence', async () => {
    await page.locator('button', { hasText: /^CAIO$/ }).first().click(); await page.waitForTimeout(900);
    await page.locator('nav button', { hasText: 'Risk Center' }).first().click(); await page.waitForTimeout(700);
    await page.locator('button:has-text("Open full Risk Center")').first().click(); await page.waitForTimeout(900);
    await page.locator('button:has-text("Treatments")').first().click(); await page.waitForTimeout(600);
    const evBefore = await page.evaluate(() => JSON.parse(localStorage.getItem('vz-gw-evidence') || '[]').length);
    await page.locator('button:has-text("Start treatment")').first().click(); await page.waitForTimeout(700);
    const evAfter = await page.evaluate(() => JSON.parse(localStorage.getItem('vz-gw-evidence') || '[]').length);
    if (evAfter <= evBefore) throw new Error('evidence not recorded');
  });

  // ── Reports: generated packs (platform Reports via a role's Reports surface) ──
  await test('Board pack + risk CSV downloads', async () => {
    await page.locator('button', { hasText: /^COO$/ }).first().click(); await page.waitForTimeout(700);
    await page.locator('nav button', { hasText: /^Reports$/ }).first().click(); await page.waitForTimeout(900);
    const before = downloads;
    await page.locator('button:has-text("Executive Board Pack")').first().click(); await page.waitForTimeout(800);
    await page.locator('button:has-text("Risk Register")').first().click(); await page.waitForTimeout(800);
    if (downloads < before + 2) throw new Error(`expected 2 downloads, got ${downloads - before}`);
  });

  // ── Academy: assign path ──
  await test('Academy assign learning path', async () => {
    await page.locator('nav button', { hasText: 'Governance Academy' }).first().click(); await page.waitForTimeout(900);
    await page.locator('button:has-text("Assign path")').first().click(); await page.waitForTimeout(1200);
    if (!(await body()).match(/Learning path assigned/)) throw new Error('no assignment confirmation');
  });

  // ── Employee: workbench send, mask, block + idea submit ──
  await page.locator('button', { hasText: /^Employee$/ }).first().click(); await page.waitForTimeout(1200);
  await page.locator('nav button', { hasText: 'AI Assistant' }).first().click(); await page.waitForTimeout(1000);
  const composer = () => page.locator('input[placeholder*="through the Gateway"]').first();
  await test('Workbench normal prompt gets reply', async () => {
    await composer().fill('Summarize our AI governance posture');
    await page.keyboard.press('Enter'); await page.waitForTimeout(4500);
    if (!(await body()).match(/Done|Draft generated|Source:/)) throw new Error('no reply');
  });
  await test('Workbench masks card number', async () => {
    await composer().fill('Customer card 4111 1111 1111 1111 complaint draft');
    await page.keyboard.press('Enter'); await page.waitForTimeout(4500);
    if (!(await body()).includes('[card-masked]') && !(await body()).match(/masked/i)) throw new Error('not masked');
  });
  await test('Workbench blocks credential prompt', async () => {
    await composer().fill('my password: hunter2 please store it');
    await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
    if (!(await body()).match(/blocked/i)) throw new Error('not blocked');
  });
  await test('Employee task action mints evidence', async () => {
    await page.locator('nav button', { hasText: 'My Tasks' }).first().click(); await page.waitForTimeout(900);
    await page.locator('button:has-text("Acknowledge")').first().click(); await page.waitForTimeout(700);
    if (!(await body()).match(/recorded/i)) throw new Error('no evidence recorded');
  });

  console.log('\n=== FEATURE TEST RESULTS ===');
  R.forEach(([s, n]) => console.log(s, '-', n));
  console.log('downloads fired:', downloads, '| page errors:', errs.length);
  errs.slice(0, 3).forEach(e => console.log('[err]', e));
  await browser.close();
  process.exit(R.some(([s]) => s === 'FAIL') ? 1 : 0);
})();
