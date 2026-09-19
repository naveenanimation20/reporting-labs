import { test, expect } from '@playwright/test';
import { meta } from 'reporting-labs';

// Every Playwright outcome has its own place in the report.

test('remembers the session after reload', async () => {
  meta({ priority: 'P2', owner: 'priya', feature: 'auth' });
  test.skip(true, 'Blocked by AUTH-231 (session cookie flag)');   // Skipped card shows the reason
});

test('stacks two coupons', async () => {
  meta({ priority: 'P3', owner: 'rahul', feature: 'promo' });
  test.fixme(true, 'PROMO-140: stacking rules not decided yet');   // shown as skipped with "fixme:" reason
});

test('totals ignore the discount (known bug)', async ({ page }) => {
  meta({ priority: 'P2', owner: 'amit', feature: 'cart', issue: 'PROMO-118' });
  test.fail(true, 'PROMO-118 is not fixed yet');                   // counted as passed, badge "Expected failure"
  await page.setContent('<b id="t">100</b>');
  await expect(page.locator('#t')).toHaveText('90');
});

test('search results load within budget', async ({ page }) => {
  meta({ priority: 'P1', severity: 'major', owner: 'priya', feature: 'search' });
  test.setTimeout(800);                                            // "Timed out" with the exceeded timeout in the report
  await page.setContent('<ul id="r"></ul>');
  await page.waitForTimeout(2000);
});

test('guest checkout requires an email', async ({ page }) => {
  meta({ priority: 'P1', severity: 'critical', owner: 'priya', feature: 'checkout', story: 'SHOP-271' });
  await page.setContent('<p id="err">Email is required</p>');
  // A plain failure: the report shows expected vs received side by side, the code snippet, and a VS Code link.
  await expect(page.locator('#err')).toHaveText('E-mail is required');
});

test('flaky: passes on the second attempt', async ({ page }) => {
  meta({ priority: 'P0', severity: 'blocker', owner: 'naveen', feature: 'payment' });
  await page.setContent('<b id="a">' + test.info().retry + '</b>');
  await expect(page.locator('#a')).toHaveText('1');                // fails on attempt 1, passes on retry → "Flaky"
});
