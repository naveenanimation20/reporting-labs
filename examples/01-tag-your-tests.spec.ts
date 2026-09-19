import { test, expect } from '@playwright/test';
import { meta } from 'reporting-labs';

// One meta() call per test. The report builds "Needs attention", owner rollups,
// feature breakdowns and Jira links from these values.
test.describe('Checkout', () => {
  test('completes purchase with saved card', async ({ page }) => {
    meta({ priority: 'P0', severity: 'blocker', owner: 'naveen', feature: 'payment', epic: 'EPIC-18', story: 'SHOP-250' });

    await page.setContent('<button id="pay">Pay now</button><p id="msg"></p><script>pay.onclick=()=>msg.textContent="Order placed"</script>');
    await page.click('#pay');
    await expect(page.locator('#msg')).toHaveText('Order placed');
  });

  test('applies a coupon', async ({ page }) => {
    meta({ priority: 'P2', severity: 'major', owner: 'rahul', feature: 'promo', story: 'SHOP-231' });

    await page.setContent('<input id="c"><b id="total">100</b><script>c.oninput=()=>total.textContent=c.value==="SAVE10"?"90":"100"</script>');
    await page.fill('#c', 'SAVE10');
    await expect(page.locator('#total')).toHaveText('90');
  });
});

test('search suggests products', async ({ page }) => {
  meta({ priority: 'P1', severity: 'major', owner: 'priya', feature: 'search', story: 'SHOP-188' });

  await page.setContent('<input id="q"><ul id="s"></ul><script>q.oninput=()=>s.innerHTML="<li>macbook pro</li>"</script>');
  await page.fill('#q', 'mac');
  await expect(page.locator('#s li')).toHaveText('macbook pro');
});

// Your own Playwright tags keep working next to meta(); the report shows them on the test.
test('shows empty cart message', { tag: ['@sanity'] }, async ({ page }) => {
  meta({ priority: 'P3', severity: 'minor', owner: 'amit', feature: 'cart' });

  await page.setContent('<p id="cart">Your cart is empty</p>');
  await expect(page.locator('#cart')).toContainText('empty');
});
