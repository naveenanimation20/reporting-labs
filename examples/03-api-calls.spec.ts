import { test, expect } from '@playwright/test';
import { meta, api } from 'reporting-labs';

// Nothing special in these tests: plain Playwright `request` calls against the public
// https://gorest.in API. `import 'reporting-labs/auto'` in playwright.config.ts records every
// one of them (method, URL, status, timing, headers, request + response body, a cURL command)
// in the test detail and the API tab. The Bearer token is masked automatically.
//
// gorest.in: GET is open. POST / PUT / PATCH / DELETE need `Authorization: Bearer <any string>`.
// The token `blocked-token` always returns 403, handy for error-handling tests.

const BASE = 'https://gorest.in/public/v2';
const auth = { Authorization: 'Bearer demo-token' };
let userId = 0;

test.describe.configure({ mode: 'serial' });   // the tests share the user created in the first one

test.describe('Users API', () => {
  test('creates a user', async ({ request }) => {
    meta({ priority: 'P0', severity: 'blocker', owner: 'naveen', feature: 'users-api', story: 'API-301' });

    const res = await request.post(`${BASE}/users`, {
      headers: auth,                                            // shown as **** in the report
      data: { name: 'Aarav Sharma', email: `aarav.${Date.now()}@example.com`, gender: 'male', status: 'active' },
    });

    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.name).toBe('Aarav Sharma');
    userId = body.id;
  });

  test('reads the user back', async ({ request }) => {
    meta({ priority: 'P1', severity: 'major', owner: 'naveen', feature: 'users-api', story: 'API-302' });

    const res = await request.get(`${BASE}/users/${userId}`);
    expect(res.ok()).toBeTruthy();
    expect((await res.json()).id).toBe(userId);
  });

  test('updates part of the user', async ({ request }) => {
    meta({ priority: 'P1', severity: 'major', owner: 'naveen', feature: 'users-api', story: 'API-303' });

    const res = await request.patch(`${BASE}/users/${userId}`, { headers: auth, data: { status: 'inactive' } });
    expect(res.ok()).toBeTruthy();
    expect((await res.json()).status).toBe('inactive');
  });

  test('lists users with filters', async ({ page }) => {
    meta({ priority: 'P2', severity: 'minor', owner: 'priya', feature: 'users-api' });

    // page.request is recorded too. `params` become the query string in the report and the cURL.
    const res = await page.request.get(`${BASE}/users`, { params: { status: 'active', per_page: 5 } });
    expect(res.ok()).toBeTruthy();
    expect((await res.json()).length).toBeGreaterThan(0);
  });

  test('deletes the user', async ({ request }) => {
    meta({ priority: 'P1', severity: 'major', owner: 'naveen', feature: 'users-api', story: 'API-304' });

    const res = await request.delete(`${BASE}/users/${userId}`, { headers: auth });
    expect([200, 204]).toContain(res.status());
  });

  test('rejects a blocked token', async ({ request }) => {
    meta({ priority: 'P2', severity: 'minor', owner: 'priya', feature: 'users-api' });

    const res = await request.post(`${BASE}/users`, {
      headers: { Authorization: 'Bearer blocked-token' },
      data: { name: 'Nobody', email: `nobody.${Date.now()}@example.com`, gender: 'female', status: 'active' },
    });
    expect(res.status()).toBe(403);                      // a 4xx/5xx call is highlighted in the API tab
  });

  test('records a call made with another client', async () => {
    meta({ priority: 'P2', severity: 'minor', owner: 'priya', feature: 'users-api' });

    // Only needed when the HTTP call does not go through Playwright (fetch, axios, a Java service...).
    const t0 = Date.now();
    const res = await fetch(`${BASE}/users?per_page=1`);
    await api({ method: 'GET', url: `${BASE}/users?per_page=1`, status: res.status, duration: Date.now() - t0, responseBody: await res.json() });
    expect(res.ok).toBeTruthy();
  });
});
