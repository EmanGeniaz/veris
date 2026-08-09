// @ts-check
const { expect } = require('@playwright/test');

/**
 * Attach console + page-error + failed-response collectors to a page.
 * Returns an object whose arrays fill up as the page runs; assert on them
 * at the end of a test to catch runtime breakage users would hit.
 */
function collectPageHealth(page) {
  const health = { consoleErrors: [], pageErrors: [], badResponses: [] };
  page.on('console', (msg) => {
    if (msg.type() === 'error') health.consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => health.pageErrors.push(String(err)));
  page.on('response', (res) => {
    const s = res.status();
    // Ignore 3xx redirects; flag 4xx/5xx on first-party requests.
    if (s >= 400 && res.url().includes('veriszone')) {
      health.badResponses.push(`${s} ${res.url()}`);
    }
  });
  return health;
}

/** Assert the collected health is clean. Call at end of a test. */
function expectHealthy(health) {
  expect(health.pageErrors, 'uncaught page errors').toEqual([]);
  expect(health.badResponses, '4xx/5xx first-party responses').toEqual([]);
  // Console errors are a softer signal; assert but easy to relax per-app.
  expect(health.consoleErrors, 'console errors').toEqual([]);
}

/**
 * Enter the public Demo Center workspace from the landing page.
 * Uses the demo credentials the app pre-fills; no secrets required.
 */
async function enterDemoWorkspace(page) {
  await page.goto('/');
  // The primary CTA is a semantic <button> (was an <a> in the original build).
  await page.getByRole('button', { name: /Enter Demo Center Workspace/i }).click();
  await expect(page).toHaveURL(/\/workspace\/demo\/home/);
}

module.exports = { collectPageHealth, expectHealthy, enterDemoWorkspace };
