// @ts-check
const { test, expect } = require('@playwright/test');
const { collectPageHealth, expectHealthy } = require('./helpers');

/**
 * AUTHENTICATED / WRITE-ACTION TESTS — the flows that actually matter.
 *
 * These are AUTO-GATED: they run only when a throwaway staging account is
 * provided via env, because they require a real login and exercise write
 * actions (workspace creation, approvals) that must NEVER run against
 * production data. When the env is absent (normal CI, local demo), the whole
 * describe is skipped — so wiring this into CI is safe today and the specs
 * light up automatically once staging has real auth (issue #142).
 *
 * To enable (issue #145):
 *   1. Copy .env.example → .env.
 *   2. Set BASE_URL to your STAGING url, TEST_EMAIL / TEST_PASSWORD for a
 *      THROWAWAY account, and ONBOARD_TOKEN for the workspace-creation test.
 *
 * Selectors are grounded in the real sign-in UI (components/GenVerisPlatform):
 *   - a "Sign in to" <select> (aria-label) whose "employee" option is
 *     "Employee Login — …",
 *   - aria-labelled "Email" / "Password" inputs,
 *   - the form's submit button (text is role-dependent: "Enter … Workspace").
 */
const HAS_CREDS = !!(process.env.TEST_EMAIL && process.env.TEST_PASSWORD);
const HAS_ONBOARD = !!process.env.ONBOARD_TOKEN;

/** Log in as the throwaway employee account. Leaves the page authenticated. */
async function signIn(page) {
  await page.goto('/');
  // Choose the Employee Login sign-in mode (value "employee").
  await page.getByRole('combobox', { name: 'Sign in to' }).selectOption('employee').catch(() => {});
  await page.getByRole('textbox', { name: 'Email' }).fill(String(process.env.TEST_EMAIL));
  await page.locator('input[aria-label="Password"]').fill(String(process.env.TEST_PASSWORD));
  // The submit button's label is role-dependent ("Enter <role> Workspace"), so
  // target the form's submit control rather than its text.
  await page.locator('form button[type="submit"]').click();
}

test.describe('Authenticated flows (staging only)', () => {
  test.skip(!HAS_CREDS, 'No TEST_EMAIL/TEST_PASSWORD set — see .env.example');

  test('employee can log in and reach their workspace', async ({ page }) => {
    const health = collectPageHealth(page);
    await signIn(page);
    // Authenticated landmark: the app routes a signed-in user to /workspace/<profile>.
    await expect(page).toHaveURL(/\/workspace\//, { timeout: 15000 });
    // A signed-in session exposes the profile / sign-out control that the
    // public demo entry screen does not.
    await expect(page.locator('button.vz-profile-btn').first()).toBeVisible({ timeout: 15000 });
    expectHealthy(health);
  });

  test('approving a pending item updates its status (WRITE ACTION)', async ({ page }) => {
    const health = collectPageHealth(page);
    await signIn(page);
    await expect(page).toHaveURL(/\/workspace\//, { timeout: 15000 });

    // Find the first actionable Approve control anywhere in the authenticated
    // workspace (approvals live on the governance/HITL surfaces). If the test
    // account has nothing pending, skip rather than fail — a green run must
    // assert a real state change, not the absence of work.
    const approve = page.getByRole('button', { name: /approve/i }).first();
    if (!(await approve.count())) test.skip(true, 'No pending approvals for the test account');
    await expect(approve).toBeVisible({ timeout: 15000 });
    await approve.click();

    // The item should reflect an approved state, and it should persist across a
    // reload (proving the write hit the store, not just local component state).
    await expect(page.getByText(/approved/i).first()).toBeVisible({ timeout: 15000 });
    await page.reload();
    await expect(page.getByText(/approved/i).first()).toBeVisible({ timeout: 15000 });
    expectHealthy(health);
  });

  test('creating a new workspace succeeds (WRITE ACTION)', async ({ page }) => {
    test.skip(!HAS_ONBOARD, 'No ONBOARD_TOKEN set — required to create a tenant');
    const health = collectPageHealth(page);
    await page.goto('/');

    // Open the workspace-creation panel on the entry screen.
    await page.getByRole('button', { name: /Create a new workspace/i }).click();
    const slug = `e2e-${Date.now().toString(36)}`;
    await page.getByPlaceholder('Organization name').fill(`E2E Test Org ${slug}`);
    await page.getByPlaceholder(/Workspace slug/i).fill(slug);
    await page.locator('input[placeholder="Onboarding token"]').fill(String(process.env.ONBOARD_TOKEN));
    await page.getByRole('button', { name: /^Create workspace$/i }).click();

    // The result line confirms creation and echoes the created slug.
    await expect(page.getByText(new RegExp(`created`, 'i'))).toBeVisible({ timeout: 20000 });
    await expect(page.getByText(new RegExp(slug))).toBeVisible({ timeout: 20000 });
    expectHealthy(health);
  });
});
