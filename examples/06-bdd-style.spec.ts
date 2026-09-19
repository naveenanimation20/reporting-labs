import { test, expect } from '@playwright/test';
import { meta } from 'reporting-labs';

// Given / When / Then step titles are rendered as Gherkin: keywords highlighted,
// describe blocks shown as Features, tests as Scenarios. Works with playwright-bdd too.
test.describe('Feature: Guest checkout', () => {
  test('Scenario: Guest can buy with a card', async ({ page }) => {
    meta({ priority: 'P0', severity: 'blocker', owner: 'naveen', feature: 'checkout', story: 'SHOP-250' });

    await test.step('Given a guest with one item in the cart', async () => {
      await page.setContent('<b id="items">1</b><input id="email"><button id="pay">Pay</button><p id="out"></p><script>pay.onclick=()=>out.textContent=email.value?"Order placed":"Email is required"</script>');
    });
    await test.step('When they pay with a valid card', async () => {
      await page.fill('#email', 'guest@shoplite.dev');
      await page.click('#pay');
    });
    await test.step('Then the order is placed', async () => {
      await expect(page.locator('#out')).toHaveText('Order placed');
    });
    await test.step('And a confirmation email is sent', async () => {
      // your assertion here
    });
  });
});
