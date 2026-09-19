import { test, expect } from '@playwright/test';
import { log, testData } from 'reporting-labs';

// Everything here works with plain Playwright. The two helpers from 'reporting-labs'
// are optional shortcuts, shown side by side with the native way.

test('signs in with a test user', { tag: ['@P1', '@severity:critical', '@owner:priya', '@feature:auth'] }, async ({ page }) => {
  // Test data, plain Playwright: attach JSON and the report shows a key/value block. Sensitive keys are masked as ****.
  const user = { username: 'naveen@shoplite.dev', password: 'S3cret!', otp: '482913', plan: 'pro' };
  await test.info().attach('Login user', { body: JSON.stringify(user), contentType: 'application/json' });

  // Logs, plain Playwright: console.log lines from the test land in the report, secrets masked.
  console.log('opening the sign-in page');
  await page.setContent('<input id="u"><input id="p" type="password"><button id="go">Sign in</button><p id="out"></p><script>go.onclick=()=>out.textContent="Welcome "+u.value</script>');

  await page.fill('#u', user.username);
  await page.fill('#p', user.password);
  console.log('submitting credentials for', user.username, 'password=' + user.password);   // password is masked
  await page.click('#go');

  await expect(page.locator('#out')).toContainText('Welcome');
  await log('signed in, plan =', user.plan);                     // optional shortcut: same thing with a timestamp
});

test('validates coupon rules from a data table', { tag: ['@P2', '@severity:major', '@owner:rahul', '@feature:promo'] }, async ({ page }) => {
  // An array of objects becomes a table (rows from JSON, Excel, a database...).
  const coupons = [
    { code: 'SAVE10', discount: 10, stackable: false },
    { code: 'FREESHIP', discount: 0, stackable: true },
    { code: 'VIP20', discount: 20, stackable: false },
  ];
  await test.info().attach('Coupons', { body: JSON.stringify(coupons), contentType: 'application/json' });

  // A CSV attachment becomes a table too.
  await test.info().attach('cart.csv', { body: 'sku,price,qty\nMBP-14,1999,1\nMBP-16,2499,2', contentType: 'text/csv' });

  // The optional shortcut does the same in one call: object → key/value, array → table, CSV string → table.
  await testData({ region: 'IN', currency: 'INR', apiKey: 'sk_live_1234567890abcdef' }, 'Checkout settings');

  await page.setContent('<b id="n">3</b>');
  await expect(page.locator('#n')).toHaveText(String(coupons.length));
});
