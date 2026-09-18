# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api/orders.api.spec.ts >> Orders API >> updates shipping method
- Location: tests/api/orders.api.spec.ts:30:7

# Error details

```
Error: expected 200 from PATCH /orders

expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 500
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { sleep } from '../helpers';
  3  | import { meta, api, log } from '../../../dist/index.js';
  4  | 
  5  | const H = { 'Content-Type': 'application/json', Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJuYXZlZW4ifQ.k9Xz1r2vQ8yT3aBcDeFgHiJkLmNoPqRsTuVwXyZ0123' };
  6  | 
  7  | test.describe('Orders API', () => {
  8  |   test('creates an order', { tag: ['@api', '@smoke'] }, async () => {
  9  |     meta({ priority: 'P0', severity: 'blocker', owner: 'naveen', feature: 'orders-api', epic: 'EPIC-18', story: 'API-301' });
  10 |     await test.step('POST /orders', async () => {
  11 |       await sleep(140);
  12 |       await api({ method: 'POST', url: 'https://api.shoplite.example.com/v1/orders', status: 201, duration: 138,
  13 |         requestHeaders: H, requestBody: { items: [{ sku: 'TR-42', qty: 1 }], paymentToken: 'tok_live_9f8e7d6c5b4a', shipping: 'standard' },
  14 |         responseHeaders: { 'content-type': 'application/json', 'x-request-id': 'req_8f2a' }, responseBody: { id: 'ord_10422', status: 'created', total: 89.1 } });
  15 |       await log('order created: ord_10422');
  16 |     });
  17 |     await test.step('GET /orders/ord_10422', async () => {
  18 |       await sleep(60);
  19 |       await api({ method: 'GET', url: 'https://api.shoplite.example.com/v1/orders/ord_10422', status: 200, duration: 52, requestHeaders: H,
  20 |         responseHeaders: { 'content-type': 'application/json' }, responseBody: { id: 'ord_10422', status: 'created', items: 1, total: 89.1 } });
  21 |       expect(200).toBe(200);
  22 |     });
  23 |   });
  24 |   test('rejects order without items', { tag: ['@api', '@negative'] }, async () => {
  25 |     meta({ priority: 'P1', severity: 'major', owner: 'naveen', feature: 'orders-api', epic: 'EPIC-18', story: 'API-302' });
  26 |     await sleep(90);
  27 |     await api({ method: 'POST', url: 'https://api.shoplite.example.com/v1/orders', status: 400, duration: 41, requestHeaders: H, requestBody: { items: [] },
  28 |       responseBody: { error: 'validation_error', message: 'items must not be empty' } });
  29 |   });
  30 |   test('updates shipping method', { tag: ['@api'] }, async () => {
  31 |     meta({ priority: 'P2', severity: 'major', owner: 'priya', feature: 'orders-api', epic: 'EPIC-18', story: 'API-305' });
  32 |     await sleep(110);
  33 |     await api({ method: 'PATCH', url: 'https://api.shoplite.example.com/v1/orders/ord_10422', status: 500, duration: 2210, requestHeaders: H, requestBody: { shipping: 'express' },
  34 |       responseHeaders: { 'content-type': 'application/json', 'x-request-id': 'req_c11d' }, responseBody: { error: 'internal', message: 'shipping service timeout', requestId: 'req_c11d' } });
  35 |     await log('ERROR: PATCH returned 500 (shipping service timeout)');
> 36 |     expect(500, 'expected 200 from PATCH /orders').toBe(200);
     |                                                    ^ Error: expected 200 from PATCH /orders
  37 |   });
  38 |   test('deletes a draft order', { tag: ['@api'] }, async () => {
  39 |     meta({ priority: 'P2', severity: 'minor', owner: 'priya', feature: 'orders-api', epic: 'EPIC-18', story: 'API-306' });
  40 |     await sleep(70);
  41 |     await api({ method: 'DELETE', url: 'https://api.shoplite.example.com/v1/orders/ord_draft_1', status: 204, duration: 33, requestHeaders: H });
  42 |   });
  43 | });
  44 | 
```