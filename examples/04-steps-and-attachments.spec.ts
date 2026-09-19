import { test, expect } from '@playwright/test';
import { meta } from 'reporting-labs';

// Each test.step() gets a bar in the report showing its share of the test time.
test('downloads an invoice', async ({ page }) => {
  meta({ priority: 'P2', severity: 'minor', owner: 'priya', feature: 'account', story: 'ACC-33' });

  await test.step('open order #10422', async () => {
    await page.setContent('<h1>Order #10422</h1><button id="dl">Download invoice</button><p id="ok"></p><script>dl.onclick=()=>ok.textContent="invoice.pdf ready"</script>');
  });

  await test.step('click download', async () => {
    await page.click('#dl');
    await expect(page.locator('#ok')).toHaveText('invoice.pdf ready');
  });

  await test.step('verify file', async () => {
    // Anything you attach shows up: images inline, JSON/text as a code block, other files as a download.
    await test.info().attach('invoice-meta', { body: JSON.stringify({ size: 48213, pages: 1 }, null, 2), contentType: 'application/json' });
    await test.info().attach('page-after-download', { body: await page.screenshot(), contentType: 'image/png' });
  });
});

// Name three images <name>-expected, <name>-actual, <name>-diff and the report shows a visual
// comparison viewer (slider, side by side, diff). toHaveScreenshot() failures do this automatically.
test('header matches the design', async ({ page }) => {
  meta({ priority: 'P1', severity: 'major', owner: 'amit', feature: 'home', story: 'UI-77' });

  await page.setContent('<header style="background:#1A56DB;color:#fff;padding:24px;font:20px sans-serif">ShopLite</header>');
  const expected = await page.screenshot();
  await page.setContent('<header style="background:#E0294A;color:#fff;padding:24px;font:20px sans-serif">ShopLite</header>');
  const actual = await page.screenshot();

  await test.info().attach('header-expected.png', { body: expected, contentType: 'image/png' });
  await test.info().attach('header-actual.png', { body: actual, contentType: 'image/png' });

  expect(expected.length).toBeGreaterThan(0);
});
