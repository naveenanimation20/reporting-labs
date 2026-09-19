import { test, expect } from '@playwright/test';
import { meta, log, testData } from 'reporting-labs';

test('signs in with a test user', async ({ page }) => {
  meta({ priority: 'P1', severity: 'critical', owner: 'priya', feature: 'auth' });

  // An object becomes a key/value block in the report. Sensitive keys are masked as ****.
  const user = { username: 'naveen@shoplite.dev', password: 'S3cret!', otp: '482913', plan: 'pro' };
  await testData(user, 'Login user');

  await log('opening the sign-in page');                       // timestamped log line
  await page.setContent('<input id="u"><input id="p" type="password"><button id="go">Sign in</button><p id="out"></p><script>go.onclick=()=>out.textContent="Welcome "+u.value</script>');

  await page.fill('#u', user.username);
  await page.fill('#p', user.password);
  await log('submitting credentials for', user.username);      // extra args are appended
  await page.click('#go');

  await expect(page.locator('#out')).toContainText('Welcome');
  await log('signed in, plan =', user.plan);
});

test('validates coupon rules from a data table', async ({ page }) => {
  meta({ priority: 'P2', severity: 'major', owner: 'rahul', feature: 'promo' });

  // An array of objects becomes a table (rows from JSON, Excel, a database...).
  const coupons = [
    { code: 'SAVE10', discount: 10, stackable: false },
    { code: 'FREESHIP', discount: 0, stackable: true },
    { code: 'VIP20', discount: 20, stackable: false },
  ];
  await testData(coupons, 'Coupons');

  // A CSV string becomes a table too.
  await testData('sku,price,qty\nMBP-14,1999,1\nMBP-16,2499,2', 'cart.csv');

  await page.setContent('<b id="n">3</b>');
  await expect(page.locator('#n')).toHaveText(String(coupons.length));
});
