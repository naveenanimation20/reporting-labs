import { test, expect } from '@playwright/test';
import { meta, api } from 'reporting-labs';
import * as http from 'http';

// Nothing special in these tests: plain Playwright `request` calls.
// `import 'reporting-labs/auto'` in playwright.config.ts records every one of them
// (method, URL, status, timing, headers, request + response body, a cURL command)
// in the test detail and the API tab. Secrets are masked automatically.

// A tiny local API so the example runs offline. In your project, point `request` at your real backend.
let server: http.Server; let base = '';
test.beforeAll(async () => {
  server = http.createServer((req, res) => {
    let body = ''; req.on('data', c => body += c);
    req.on('end', () => {
      res.setHeader('content-type', 'application/json');
      const path = (req.url ?? '').split('?')[0];
      if (req.method === 'POST' && path === '/v1/orders') { res.statusCode = 201; res.end(JSON.stringify({ id: 'ord_10422', total: 1999, items: JSON.parse(body).qty })); }
      else if (path === '/v1/orders/ord_10422') { res.end(JSON.stringify({ id: 'ord_10422', status: 'paid' })); }
      else { res.statusCode = 404; res.end(JSON.stringify({ error: 'not found' })); }
    });
  });
  await new Promise<void>(r => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${(server.address() as any).port}`;
});
test.afterAll(() => new Promise<void>(r => server.close(() => r())));

test.describe('Orders API', () => {
  test('creates an order', async ({ request }) => {
    meta({ priority: 'P0', severity: 'blocker', owner: 'naveen', feature: 'orders-api', story: 'API-301' });

    const res = await request.post(`${base}/v1/orders`, {
      headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.demo.token' },   // shown as **** in the report
      data: { sku: 'MBP-14', qty: 2, card: { number: '4111111111111111', cvv: '123' } },
    });

    expect(res.status()).toBe(201);
    expect((await res.json()).id).toBe('ord_10422');
  });

  test('reads the order back', async ({ request }) => {
    meta({ priority: 'P1', severity: 'major', owner: 'naveen', feature: 'orders-api', story: 'API-302' });

    const res = await request.get(`${base}/v1/orders/ord_10422`, { params: { expand: 'items' } });
    expect((await res.json()).status).toBe('paid');
  });

  test('calls made from a page are recorded too', async ({ page }) => {
    meta({ priority: 'P2', severity: 'minor', owner: 'priya', feature: 'orders-api' });

    const res = await page.request.get(`${base}/v1/orders/ord_10422`);
    expect(res.ok()).toBeTruthy();
  });

  test('records a call made with another client', async () => {
    meta({ priority: 'P2', severity: 'minor', owner: 'priya', feature: 'orders-api' });

    // Only needed when the HTTP call does not go through Playwright (axios, fetch, a Java service...).
    await api({
      method: 'DELETE', url: `${base}/v1/orders/ord_draft_1`,
      status: 204, duration: 33,
      requestHeaders: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.demo.token' },
    });
  });

  test('rejects an unknown order', async ({ request }) => {
    meta({ priority: 'P2', severity: 'minor', owner: 'priya', feature: 'orders-api' });

    const res = await request.get(`${base}/v1/orders/nope`);
    expect(res.status()).toBe(404);                      // a 4xx/5xx call is highlighted in the API tab
  });
});
