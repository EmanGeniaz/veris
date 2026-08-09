// @ts-check
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const { enterDemoWorkspace } = require('./helpers');

/**
 * Accessibility guardrail for the demo workspace (axe, WCAG 2.1 A/AA).
 *
 * History:
 *  - The original QA pass found the sidebar/toolbar icon buttons had no
 *    accessible name (WCAG 4.1.2). That is FIXED — aria-label / aria-current
 *    were added to every nav control — so axe no longer reports `button-name`,
 *    and the first test below actively guards against that regression.
 *  - The workspace's dark-theme `color-contrast` gap (WCAG 1.4.3) has since been
 *    fixed at the token level (muted inks and gold text darkened to meet AA on
 *    the cream surfaces), so this is now a strict guardrail: ANY serious/critical
 *    WCAG 2.1 A/AA violation fails the suite.
 */
test.describe('Accessibility', () => {
  test('workspace has no serious/critical axe violations', async ({ page }) => {
    await enterDemoWorkspace(page);
    // Let the dashboard finish mounting/animating so axe scans the settled
    // state a user actually sees (the helper only waits for the route).
    await page.waitForTimeout(2000);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    if (serious.length) {
      console.log('Serious/critical a11y violations:',
        serious.map((v) => `${v.id} (${v.nodes.length})`).join(', '));
    }
    expect(serious, 'serious/critical WCAG violations').toEqual([]);
  });
});
