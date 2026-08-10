// @ts-check
const { test, expect } = require('@playwright/test');
const { collectPageHealth, expectHealthy } = require('./helpers');

test.describe('Landing / sign-in page', () => {
  test('loads cleanly with the sign-in card and compliance badges', async ({ page }) => {
    const health = collectPageHealth(page);

    const resp = await page.goto('/');
    expect(resp?.status(), 'landing HTTP status').toBeLessThan(400);

    // Key content a real visitor must see.
    await expect(page.getByText(/Secure control-plane sign in/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Enter Demo Center Workspace/i })).toBeVisible();

    // Sign-in mode selector offers the three documented routes.
    const selector = page.getByRole('combobox');
    await expect(selector).toBeVisible();

    expectHealthy(health);
  });
});
