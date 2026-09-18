# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: checkout.spec.ts >> Checkout >> guest checkout requires email
- Location: tests/checkout.spec.ts:53:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "Please enter your email"
Received: "Email is required"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { shot, sleep, flakyOnce, video, trace } from './helpers';
  3  | import { meta, log, testData } from '../../dist/index.js';
  4  | 
  5  | test.describe('Checkout', () => {
  6  |   test('adds item to cart and updates total', { tag: ['@smoke', '@cart'] }, async () => {
  7  |     meta({ priority: 'P0', severity: 'blocker', owner: 'rahul', feature: 'cart', epic: 'EPIC-18', story: 'SHOP-201' });
  8  |     await test.step('add "Trail Runner" to cart', async () => { await sleep(140); });
  9  |     await test.step('verify cart badge shows 1', async () => { await sleep(60); await shot('cart-badge'); });
  10 |   });
  11 |   test('applies a valid coupon', { tag: ['@cart', '@promo'] }, async () => {
  12 |     meta({ priority: 'P1', severity: 'major', owner: 'rahul', feature: 'promo', epic: 'EPIC-18', story: 'SHOP-210' });
  13 |     await test.step('open coupon field', async () => { await sleep(90); });
  14 |     await test.step('apply SAVE10', async () => { await sleep(300); });
  15 |     await test.step('verify discount line', async () => {
  16 |       const total = 89.10; await shot('coupon-applied');
  17 |       expect(total).toBeCloseTo(89.10, 2);
  18 |     });
  19 |   });
  20 |   test('stacks two coupons', { tag: ['@promo'] }, async () => {
  21 |     meta({ priority: 'P2', severity: 'major', owner: 'rahul', feature: 'promo', epic: 'EPIC-18', story: 'SHOP-231' });
  22 |     test.info().annotations.push({ type: 'issue', description: 'PROMO-118' });
  23 |     await testData([
  24 |       { code: 'SAVE10', type: 'percent', value: 10, stackable: true },
  25 |       { code: 'FREESHIP', type: 'shipping', value: 5, stackable: true },
  26 |     ], 'Coupons under test');
  27 |     await log('cart total before coupons: $99.00');
  28 |     await test.step('apply SAVE10', async () => { await sleep(120); });
  29 |     await test.step('apply FREESHIP', async () => { await sleep(120); await log('ERROR: order summary still shows one discount line'); await shot('after-second-coupon', 'bad'); });
  30 |     await test.step('verify both discounts applied', async () => {
  31 |       const lines = ['SAVE10 -$9.90'];
  32 |       expect(lines, 'second coupon should appear in order summary').toContain('FREESHIP -$5.00');
  33 |     });
  34 |   });
  35 |   test('completes purchase with saved card', { tag: ['@smoke', '@payment'] }, async ({ }, testInfo) => {
  36 |     meta({ priority: 'P0', severity: 'blocker', owner: 'naveen', feature: 'payment', epic: 'EPIC-18', story: 'SHOP-250' });
  37 |     await test.step('select saved Visa ending 4417', async () => { await sleep(110); });
  38 |     await test.step('place order', async () => {
  39 |       await sleep(400);
  40 |       if (testInfo.project.name === 'webkit-mobile' && flakyOnce('purchase')) {
  41 |         await shot('order-spinner', 'bad'); await video(); await trace();
  42 |         throw new Error('Timed out waiting for order confirmation: spinner still visible after 30000ms\n  locator: getByRole("heading", { name: "Order confirmed" })');
  43 |       }
  44 |       await shot('order-confirmed');
  45 |     });
  46 |     await test.step('verify confirmation number', async () => { await sleep(50); });
  47 |   });
  48 |   test('shows out-of-stock message', { tag: ['@cart'] }, async () => {
  49 |     meta({ priority: 'P2', severity: 'minor', owner: 'priya', feature: 'cart', epic: 'EPIC-18', story: 'SHOP-260' });
  50 |     await test.step('open discontinued product', async () => { await sleep(100); });
  51 |     await test.step('verify message', async () => { await sleep(40); });
  52 |   });
  53 |   test('guest checkout requires email', { tag: ['@checkout'] }, async () => {
  54 |     meta({ priority: 'P1', severity: 'critical', owner: 'priya', feature: 'checkout', epic: 'EPIC-18', story: 'SHOP-271' });
  55 |     await test.step('continue as guest', async () => { await sleep(70); });
  56 |     await test.step('submit without email', async () => { await sleep(90); });
  57 |     await test.step('verify validation', async () => {
  58 |       await shot('guest-validation', 'bad'); await video();
> 59 |       expect('Email is required').toBe('Please enter your email');
     |                                   ^ Error: expect(received).toBe(expected) // Object.is equality
  60 |     });
  61 |   });
  62 | });
  63 | 
```