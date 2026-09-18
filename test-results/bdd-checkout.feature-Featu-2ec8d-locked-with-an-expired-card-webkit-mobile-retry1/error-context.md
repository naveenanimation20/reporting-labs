# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bdd/checkout.feature.spec.ts >> Feature: Guest checkout >> Scenario: Guest is blocked with an expired card
- Location: tests/bdd/checkout.feature.spec.ts:13:7

# Error details

```
Error: expected specific expiry message

expect(received).toBe(expected) // Object.is equality

Expected: "Card expired"
Received: "Payment failed"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { sleep, shot } from '../helpers';
  3  | import { meta } from '../../../dist/index.js';
  4  | 
  5  | test.describe('Feature: Guest checkout', () => {
  6  |   test('Scenario: Guest can buy with a card', { tag: ['@bdd', '@smoke'] }, async () => {
  7  |     meta({ priority: 'P0', severity: 'blocker', owner: 'rahul', feature: 'checkout', epic: 'EPIC-18', story: 'SHOP-280' });
  8  |     await test.step('Given a guest with 1 item in the cart', async () => { await sleep(90); });
  9  |     await test.step('When they check out with a valid card', async () => { await sleep(260); });
  10 |     await test.step('And they confirm the order', async () => { await sleep(120); await shot('confirmation'); });
  11 |     await test.step('Then they see an order confirmation number', async () => { await sleep(40); });
  12 |   });
  13 |   test('Scenario: Guest is blocked with an expired card', { tag: ['@bdd', '@negative'] }, async () => {
  14 |     meta({ priority: 'P1', severity: 'critical', owner: 'rahul', feature: 'checkout', epic: 'EPIC-18', story: 'SHOP-281' });
  15 |     await test.step('Given a guest with 1 item in the cart', async () => { await sleep(80); });
  16 |     await test.step('When they check out with an expired card', async () => { await sleep(210); });
  17 |     await test.step('Then they see "Card expired" and stay on the payment page', async () => {
  18 |       await shot('expired-card', 'bad');
> 19 |       expect('Payment failed', 'expected specific expiry message').toBe('Card expired');
     |                                                                    ^ Error: expected specific expiry message
  20 |     });
  21 |   });
  22 | });
  23 | 
```