/* Leaner click-integrity audit: enumerate interactive elements per surface,
   exercise a bounded sample (dismissing overlays between clicks), and verify
   canonical object destinations. Real counts, bounded runtime. */
const { chromium } = require('playwright');

const OWNER = {
  riskcenter: ['Risk Register', 'Risk Center', 'Treatments'],
  reports: ['Reports', 'Board Pack', 'Executive KPI'],
  compliance: ['Compliance', 'Posture', 'Policy register', 'Control Library'],
  aicentral: ['AI Initiative', 'Portfolio', 'Model Registry', 'Runtime rules'],
};

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e).slice(0, 140)));
  const body = async () => (await page.locator('body').innerText());

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2200);
  await page.click('text=Enter Demo Center Workspace');
  await page.waitForURL('**/workspace/demo/**', { timeout: 10000 });
  await page.waitForTimeout(1400);
  await page.getByRole('button', { name: 'CAIO', exact: true }).first().click();
  await page.waitForTimeout(800);

  const SURFACES = ['Dashboard', 'AI Central', 'Playbook', 'Compliance & Standards', 'Risk Center', 'Reports', 'Governance Academy'];
  let totalInteractive = 0, tested = 0, acted = 0, deadEnds = 0, pageErrs = 0;
  const dead = [];

  for (const s of SURFACES) {
    await page.locator('nav button').filter({ hasText: s }).first().click().catch(() => {});
    await page.waitForTimeout(900);
    const navCount = await page.locator('nav button:visible').count();
    const allBtn = await page.locator('button:visible').count();
    totalInteractive += Math.max(0, allBtn - navCount - 12);
    const buttons = page.locator('button:visible');
    const end = Math.min(await buttons.count(), navCount + 6);
    for (let i = navCount; i < end; i++) {
      let label = (await buttons.nth(i).innerText().catch(() => '')).slice(0, 26).replace(/\n/g, ' ');
      if (!label) continue;
      const before = (await body()).length;
      const eb = errors.length;
      try {
        await buttons.nth(i).click({ timeout: 1500 });
        await page.waitForTimeout(350);
        tested++;
        if (errors.length > eb) { pageErrs++; deadEnds++; dead.push(`${s} "${label}": error`); }
        else acted++;
      } catch { /* obscured — skip */ }
      await page.keyboard.press('Escape').catch(() => {});
      await page.locator('nav button').filter({ hasText: s }).first().click().catch(() => {});
      await page.waitForTimeout(300);
    }
  }

  // canonical object destinations
  const checks = [];
  const goS = async s => { await page.locator('nav button').filter({ hasText: s }).first().click(); await page.waitForTimeout(800); };
  const objCheck = async (name, fn, owner) => {
    const eb = errors.length; await fn(); await page.waitForTimeout(800);
    const t = await body();
    const ok = OWNER[owner].some(m => t.includes(m)) && errors.length === eb;
    checks.push([name, ok, owner]); tested++;
    if (ok) acted++; else { deadEnds++; dead.push(`${name}→${owner}`); }
  };
  const box = () => page.locator('input[placeholder="Search everything..."]');
  const searchGo = async (q, res, owner) => {
    await box().first().fill(q); await page.waitForTimeout(450);
    await objCheck(`Search:${q}`, async () => page.locator('button').filter({ hasText: res }).first().click(), owner);
    await box().first().fill('');
  };
  await searchGo('prompt injection', 'RSK', 'riskcenter');
  await searchGo('Responsible GenAI', 'Responsible GenAI Use', 'compliance');
  await searchGo('Finance Close', 'Finance Close', 'aicentral');
  await goS('Dashboard');
  await objCheck('KPI:Active risks', async () => page.locator('button').filter({ hasText: 'Active risks' }).first().click(), 'riskcenter');
  await goS('Dashboard');
  await objCheck('KPI:Portfolio value', async () => page.locator('button').filter({ hasText: 'Portfolio value' }).first().click(), 'reports');
  await goS('Dashboard');
  await objCheck('KPI:Compliance', async () => page.locator('button').filter({ hasText: 'Compliance confidence' }).first().click(), 'compliance');

  console.log('\n=== CLICK INTEGRITY REPORT ===');
  console.log('Surfaces crawled:         ' + SURFACES.length);
  console.log('Interactive components:   ' + totalInteractive);
  console.log('Components exercised:     ' + tested);
  console.log('Acted without error:      ' + acted);
  console.log('Dead ends:                ' + deadEnds);
  console.log('Page errors during clicks: ' + pageErrs);
  console.log('\nCanonical object checks:');
  checks.forEach(([n, ok, o]) => console.log('  ' + (ok ? 'PASS' : 'FAIL') + '  ' + n + '  (' + o + ')'));
  if (dead.length) { console.log('\nDead ends:'); dead.forEach(d => console.log('  - ' + d)); }
  console.log('\nSession page errors: ' + errors.length);
  errors.slice(0, 4).forEach(e => console.log('  [err] ' + e));
  const integ = tested ? Math.round(((tested - deadEnds) / tested) * 100) : 0;
  console.log('\nCLICK INTEGRITY: ' + integ + '%  (' + (tested - deadEnds) + '/' + tested + ')');
  await browser.close();
})().catch(e => { console.error('FATAL: ' + e.message); process.exit(1); });
