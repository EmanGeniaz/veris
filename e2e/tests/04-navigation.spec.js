// @ts-check
const { test, expect } = require('@playwright/test');
const { collectPageHealth, expectHealthy, enterDemoWorkspace } = require('./helpers');

test.describe('Workspace navigation', () => {
  test('CFO sub-page (Investment Portfolio) navigates and renders', async ({ page }) => {
    const health = collectPageHealth(page);
    await enterDemoWorkspace(page);

    await page.getByRole('button', { name: 'CFO', exact: true }).click();

    // Sidebar nav items are icon buttons; target by their visible text label.
    await page.getByText('Investment Portfolio', { exact: true }).click();

    await expect(page).toHaveURL(/\/workspace\/demo\/cfo_portfolio/);
    await expect(page.getByText(/Budget/i).first()).toBeVisible();

    expectHealthy(health);
  });
});
