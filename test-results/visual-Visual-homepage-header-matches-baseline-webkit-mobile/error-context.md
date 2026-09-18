# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual.spec.ts >> Visual >> homepage header matches baseline
- Location: tests/visual.spec.ts:6:7

# Error details

```
Error: Screenshot comparison failed: 1842 pixels (ratio 0.03) differ

expect(received).toBe(expected) // Object.is equality

Expected: 0
Received: 1
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { sleep, visualDiff } from './helpers';
  3  | import { meta, log, testData } from '../../dist/index.js';
  4  | 
  5  | test.describe('Visual', () => {
  6  |   test('homepage header matches baseline', { tag: ['@visual'] }, async () => {
  7  |     meta({ priority: 'P1', severity: 'major', owner: 'amit', feature: 'home', story: 'UI-77' });
  8  |     await test.step('open homepage', async () => { await sleep(150); });
  9  |     await test.step('compare header snapshot', async () => {
  10 |       await visualDiff('homepage-header');
> 11 |       expect(1, 'Screenshot comparison failed: 1842 pixels (ratio 0.03) differ').toBe(0);
     |                                                                                  ^ Error: Screenshot comparison failed: 1842 pixels (ratio 0.03) differ
  12 |     });
  13 |   });
  14 |   test('product card matches baseline', { tag: ['@visual'] }, async () => {
  15 |     meta({ priority: 'P2', severity: 'minor', owner: 'amit', feature: 'catalog', story: 'UI-78' });
  16 |     await test.step('compare card snapshot', async () => { await sleep(120); });
  17 |   });
  18 | });
  19 | 
```