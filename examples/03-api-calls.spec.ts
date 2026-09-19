import { test, expect } from '@playwright/test';
import { meta, api, recordApi } from 'reporting-labs';
import * as http from 'http';

// A tiny local API so the example runs offline. In your project, point `request` at your real backend.
let server: http.Server; let base = '';
test.beforeAll(async () => {
  server = http.createServer((req, res) => {
    let body = ''; req.on('data', c => body += c);
    req.on('end', () => {
      res.setHeader('content-type', 'application/json');
      if (req.method === 'POST' && req.url === '/v1/orders') { res.statusCode = 201; res.end(JSON.stringify({ id: 'ord_10422', total: 1999, items: JSON.parse(body).qty })); }
      else if (req.url === '/v1/orders/ord_10422') { res.end(JSON.stringify({ id: 'ord_10422', status: 'paid' })); }
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

    // recordApi wraps the call: method, URL, status, duration, headers and both bodies land in the report
    // (test detail + API tab). Authorization headers and secret-looking fields are masked automatically.
    const headers = { Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.demo.token', 'Content-Type': 'application/json' };
    const data = { sku: 'MBP-14', qty: 2, card: { number: '4111111111111111', cvv: '123' } };
    const res = await recordApi('POST', `${base}/v1/orders`, { headers, data },
      () => request.post(`${base}/v1/orders`, { headers, data }));

    expect(res.status()).toBe(201);
    expect((await res.json()).id).toBe('ord_10422');
  });

  test('reads the order back', async ({ request }) => {
    meta({ priority: 'P1', severity: 'major', owner: 'naveen', feature: 'orders-api', story: 'API-302' });

    const res = await recordApi('GET', `${base}/v1/orders/ord_10422`, undefined, () => request.get(`${base}/v1/orders/ord_10422`));
    expect((await res.json()).status).toBe('paid');
  });

  test('records a call made elsewhere', async () => {
    meta({ priority: 'P2', severity: 'minor', owner: 'priya', feature: 'orders-api' });

    // When the HTTP call happens in a helper or another client, record it manually.
    await api({
      method: 'DELETE', url: `${base}/v1/orders/ord_draft_1`,
      status: 204, duration: 33,
      requestHeaders: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.demo.token' },
    });
  });

  test('rejects an unknown order', async ({ request }) => {
    meta({ priority: 'P2', severity: 'minor', owner: 'priya', feature: 'orders-api' });

    const res = await recordApi('GET', `${base}/v1/orders/nope`, undefined, () => request.get(`${base}/v1/orders/nope`));
    expect(res.status()).toBe(404);                      // a 4xx/5xx call is highlighted in the API tab
  });
});
