// @ts-check
const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

/**
 * BASE_URL controls what environment the suite runs against.
 *  - Defaults to the live public demo (safe: read-only flows only).
 *  - For authenticated / write tests, point this at your STAGING url and
 *    supply TEST_EMAIL / TEST_PASSWORD in a .env file. NEVER production.
 */
const BASE_URL = process.env.BASE_URL || 'https://console.veriszone.com';

module.exports = defineConfig({
  testDir: './tests',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Optional egress proxy (corporate networks / sandboxes). No-op unless
    // PW_PROXY is set. Bypass keeps a locally-served app direct while external
    // assets (e.g. web fonts) still resolve through the proxy.
    ...(process.env.PW_PROXY
      ? { proxy: { server: process.env.PW_PROXY, bypass: process.env.PW_PROXY_BYPASS || 'localhost,127.0.0.1' } }
      : {}),
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Uncomment to broaden coverage once the suite is green on chromium:
    // { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ],
});
