// @ts-check
const { test, expect } = require('@playwright/test');
const { collectPageHealth, expectHealthy, enterDemoWorkspace } = require('./helpers');

test.describe('Universal search', () => {
  test('typing a query returns live results', async ({ page }) => {
    const health = collectPageHealth(page);
    await enterDemoWorkspace(page);

    const search = page.getByRole('textbox', { name: /Universal search/i });
    await search.click();
    await search.fill('fraud');

    // A results dropdown should surface at least one relevant hit.
    await expect(page.getByText(/Fraud Detection/i).first()).toBeVisible({ timeout: 8000 });

    expectHealthy(health);
  });
});
