import { test, expect } from '@playwright/test';
import { meta } from 'reporting-labs';

// Priority, severity, owner, feature, epic, story... The report builds "Needs attention",
// owner rollups, feature breakdowns and Jira links from these values.
// Everything below is plain Playwright; meta() at the end is an optional one-line shortcut.

// 1. Tags on a describe block apply to every test inside it.
test.describe('Checkout', { tag: ['@feature:payment', '@owner:naveen', '@epic:EPIC-18'] }, () => {

  // 2. Tags on a test: @P0..@P4 for priority, @blocker/@critical/@major/@minor/@trivial for severity,
  //    and @key:value for anything else (story, issue, component, team...).
  test('completes purchase with saved card', { tag: ['@P0', '@blocker', '@story:SHOP-250'] }, async ({ page }) => {
    await page.setContent('<button id="pay">Pay now</button><p id="msg"></p><script>pay.onclick=()=>msg.textContent="Order placed"</script>');
    await page.click('#pay');
    await expect(page.locator('#msg')).toHaveText('Order placed');
  });

  // 3. Or Playwright annotations, when a value has spaces or you prefer the explicit form.
  test('applies a coupon', {
    tag: ['@P2', '@major'],
    annotation: [{ type: 'story', description: 'SHOP-231' }, { type: 'owner', description: 'rahul' }],
  }, async ({ page }) => {
    await page.setContent('<input id="c"><b id="total">100</b><script>c.oninput=()=>total.textContent=c.value==="SAVE10"?"90":"100"</script>');
    await page.fill('#c', 'SAVE10');
    await expect(page.locator('#total')).toHaveText('90');
  });
});

// 4. Annotations can also be pushed from inside the test, for example after reading a data file.
test('search suggests products', async ({ page }) => {
  test.info().annotations.push({ type: 'priority', description: 'P1' }, { type: 'owner', description: 'priya' }, { type: 'feature', description: 'search' });
  await page.setContent('<input id="q"><ul id="s"></ul><script>q.oninput=()=>s.innerHTML="<li>macbook pro</li>"</script>');
  await page.fill('#q', 'mac');
  await expect(page.locator('#s li')).toHaveText('macbook pro');
});

// 5. Optional shortcut: one meta() call sets the same values as annotations.
test('shows empty cart message', async ({ page }) => {
  meta({ priority: 'P3', severity: 'minor', owner: 'amit', feature: 'cart', story: 'SHOP-102' });
  await page.setContent('<p id="cart">Your cart is empty</p>');
  await expect(page.locator('#cart')).toContainText('empty');
});
