// @ts-check
const { test, expect } = require('@playwright/test');
const { collectPageHealth, expectHealthy } = require('./helpers');

/**
 * AUTHENTICATED / WRITE-ACTION TESTS — the flows that actually matter.
 *
 * These are SKIPPED until you provide staging credentials, because:
 *   - they require a real login (Employee Login / AI Central), and
 *   - they exercise write actions (approvals, workspace creation) that must
 *     NEVER run against production with real data.
 *
 * To enable:
 *   1. Create a .env file (copy .env.example).
 *   2. Set BASE_URL to your STAGING url, plus TEST_EMAIL / TEST_PASSWORD
 *      for a THROWAWAY test account.
 *   3. Remove the `test.skip(...)` guard below and finish the TODOs.
 */
const HAS_CREDS = !!(process.env.TEST_EMAIL && process.env.TEST_PASSWORD);

test.describe('Authenticated flows (staging only)', () => {
  test.skip(!HAS_CREDS, 'No TEST_EMAIL/TEST_PASSWORD set — see .env.example');

  test('employee can log in and reach their workspace', async ({ page }) => {
    const health = collectPageHealth(page);
    await page.goto('/');

    // TODO: select "Employee Login" in the sign-in mode dropdown.
    await page.getByRole('combobox').selectOption({ label: /Employee Login/i }).catch(() => {});
    await page.getByRole('textbox', { name: /Email/i }).fill(process.env.TEST_EMAIL);
    await page.getByRole('textbox', { name: /Password/i }).fill(process.env.TEST_PASSWORD);

    // TODO: confirm the real submit control's accessible name on staging.
    await page.getByRole('button', { name: /sign in|enter|log ?in/i }).first().click();

    // TODO: replace with a landmark that only appears when authenticated.
    await expect(page).toHaveURL(/\/workspace\//, { timeout: 15000 });
    expectHealthy(health);
  });

  test.fixme('approving a pending item updates its status (WRITE ACTION)', async ({ page }) => {
    // TODO: log in, open a pending approval, approve it, assert the status
    // changes AND that a fresh load reflects the change. Staging only.
  });

  test.fixme('creating a new workspace succeeds (WRITE ACTION)', async ({ page }) => {
    // TODO: exercise "Create a new workspace" end to end on staging.
  });
});
