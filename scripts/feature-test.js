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

  // ── Profile module menu (bottom-left) ──
  await test('Profile menu opens with options', async () => {
    await page.locator('button.vz-profile-btn').first().click(); await page.waitForTimeout(400);
    const t = await body();
    if (!t.includes('Account Settings')) throw new Error('no Account Settings');
    if (!t.includes('Admin Console')) throw new Error('no Admin');
    if (!t.includes('Sign out')) throw new Error('no Sign out');
    await page.locator('button[role="menuitem"]', { hasText: 'Account Settings' }).first().click(); await page.waitForTimeout(700);
    await page.keyboard.press('Escape');
  });

  // ── CAIO: create initiative ──
  await page.locator('button', { hasText: /^CAIO$/ }).first().click(); await page.waitForTimeout(900);
  await test('Create AI Initiative', async () => {
    await page.locator('nav button', { hasText: 'AI Central' }).first().click(); await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'AI Lifecycle', exact: true }).first().click(); await page.waitForTimeout(800);
    await page.getByRole('button', { name: 'Initiative Workspaces', exact: true }).first().click(); await page.waitForTimeout(700);
    await page.locator('button:has-text("New AI Initiative")').first().click(); await page.waitForTimeout(600);
    await page.locator('label:has-text("Initiative name") input').first().fill('Feature Test Initiative');
    await page.locator('label:has-text("Expected value") input').first().fill('1.0');
    // Business unit is a governed SmartSelect — open it, type an existing value, Enter to select the exact match
    await page.getByText('Choose or add a business unit', { exact: true }).first().click(); await page.waitForTimeout(400);
    await page.keyboard.type('Retail Banking'); await page.waitForTimeout(250);
    await page.keyboard.press('Enter'); await page.waitForTimeout(400);
    await page.locator('button:has-text("Create initiative")').last().click(); await page.waitForTimeout(1100);
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

  // ── Command palette (⌘K): open + keyboard navigate ──
  await test('Command palette opens and navigates', async () => {
    await page.locator('button', { hasText: /^CAIO$/ }).first().click(); await page.waitForTimeout(800);
    await page.keyboard.press('Control+k'); await page.waitForTimeout(500);
    if (!(await body()).includes('CAIO view')) throw new Error('palette did not open');
    await page.keyboard.type('Risk Center'); await page.waitForTimeout(400);
    await page.keyboard.press('Enter'); await page.waitForTimeout(800);
    if (!(await body()).includes('system of record for every AI risk')) throw new Error('palette navigation failed');
  });

  // ── Governed create form: register an AI model (SmartSelect fields) ──
  await test('Register AI model via governed form', async () => {
    await page.keyboard.press('Control+k'); await page.waitForTimeout(500);
    await page.keyboard.type('AI Model Registry'); await page.waitForTimeout(400);
    await page.keyboard.press('Enter'); await page.waitForTimeout(900);
    await page.locator('button:has-text("Register model")').first().click(); await page.waitForTimeout(500);
    await page.locator('label:has-text("Model name") input').first().fill('Feature Test Model');
    await page.locator('label:has-text("AI system") input').first().fill('Feature Test System');
    await page.locator('button:has-text("Register model")').last().click(); await page.waitForTimeout(800);
    if (!(await body()).includes('Registered this session')) throw new Error('model not registered');
  });

  // ── Taxonomy request lands in the owner's Approvals inbox + approve ──
  await test('Taxonomy request approved in inbox', async () => {
    await page.keyboard.press('Control+k'); await page.waitForTimeout(500);
    await page.keyboard.type('Approvals inbox'); await page.waitForTimeout(400);
    await page.keyboard.press('Enter'); await page.waitForTimeout(900);
    if (!(await body()).includes('Taxonomy requests')) throw new Error('no taxonomy inbox');
    if (!(await body()).includes('Multi-Agent Orchestration')) throw new Error('seeded request missing');
    const taxRow = page.locator('div').filter({ hasText: 'Multi-Agent Orchestration' }).filter({ has: page.locator('button', { hasText: 'Approve' }) }).last();
    await taxRow.getByRole('button', { name: 'Approve' }).click(); await page.waitForTimeout(700);
    if (!(await body()).match(/added to the taxonomy/)) throw new Error('approval did not record');
  });

  // ── CISO: incident register drill-in drawer (project + treatment plan) ──
  await test('CISO incident drills into project + plan', async () => {
    await page.locator('button', { hasText: /^CISO$/ }).first().click(); await page.waitForTimeout(1000);
    await page.locator('nav button', { hasText: 'AI Incidents' }).first().click(); await page.waitForTimeout(900);
    await page.locator('tr.vz-reg-row').first().click(); await page.waitForTimeout(600);
    const t = await body();
    if (!t.includes('Customer Resolution Copilot')) throw new Error('no project link in drawer');
    if (!/treatment plan/i.test(t)) throw new Error('no action/treatment plan');
    if (!t.includes('Open project workspace')) throw new Error('no drill-through action');
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
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
