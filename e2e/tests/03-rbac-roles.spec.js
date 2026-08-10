// @ts-check
const { test, expect } = require('@playwright/test');
const { collectPageHealth, expectHealthy, enterDemoWorkspace } = require('./helpers');

/**
 * RBAC is a core VerisZone feature: each role tab must present a distinct
 * persona and content. We verify the view actually changes between roles.
 */
test.describe('Role-based views (RBAC)', () => {
  test('switching CEO -> CFO changes persona and content', async ({ page }) => {
    const health = collectPageHealth(page);
    await enterDemoWorkspace(page);

    // Default (CAIO/CEO-ish) governance view.
    await page.getByRole('button', { name: 'CEO', exact: true }).click();
    const ceoHeading = await page.getByText(/Good morning,/i).first().innerText();

    // Switch to CFO — expect a finance persona + ROI framing.
    await page.getByRole('button', { name: 'CFO', exact: true }).click();
    const cfoHeading = await page.getByText(/Good morning,/i).first().innerText();

    expect(cfoHeading, 'greeting should differ between roles').not.toEqual(ceoHeading);
    await expect(page.getByText(/Portfolio ROI/i).first()).toBeVisible();

    expectHealthy(health);
  });

  // Smoke-check every role tab renders without a runtime error.
  const ROLES = ['CEO', 'COO', 'CFO', 'CHRO', 'CISO', 'CAIO', 'CIO', 'CDPO', 'CGO', 'CRO', 'Legal', 'Employee', 'Manager'];
  for (const role of ROLES) {
    test(`role tab "${role}" renders without errors`, async ({ page }) => {
      const health = collectPageHealth(page);
      await enterDemoWorkspace(page);
      await page.getByRole('button', { name: role, exact: true }).click();
      await expect(page.getByText(/Good morning/i).first()).toBeVisible();
      expectHealthy(health);
    });
  }
});
