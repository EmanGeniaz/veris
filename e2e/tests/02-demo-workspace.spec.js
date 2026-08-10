// @ts-check
const { test, expect } = require('@playwright/test');
const { collectPageHealth, expectHealthy, enterDemoWorkspace } = require('./helpers');

test.describe('Demo workspace dashboard', () => {
  test('entering the demo loads the governance dashboard with no errors', async ({ page }) => {
    const health = collectPageHealth(page);

    await enterDemoWorkspace(page);

    // Dashboard landmarks.
    await expect(page.getByText(/Good morning/i)).toBeVisible();
    await expect(page.getByText(/Governance Score/i).first()).toBeVisible();

    expectHealthy(health);
  });

  test('the /api/bus data endpoints all succeed', async ({ page }) => {
    const statuses = [];
    page.on('response', (res) => {
      if (res.url().includes('/api/bus/')) statuses.push({ url: res.url(), status: res.status() });
    });

    await enterDemoWorkspace(page);
    await page.waitForTimeout(1500); // let dashboard fetches settle

    expect(statuses.length, 'expected several /api/bus calls').toBeGreaterThan(0);
    for (const s of statuses) {
      expect(s.status, `endpoint ${s.url}`).toBeLessThan(400);
    }
  });
});
