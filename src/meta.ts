import type { ApiCall, TestMeta } from './types';

function info() {
  // Lazy require so importing reporting-labs in playwright.config never loads the test runtime.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { test } = require('@playwright/test');
  return test.info();
}

/**
 * Attach report metadata to the current test. Call it first thing inside the test body.
 *
 * @example
 * meta({ priority: 'P1', severity: 'critical', owner: 'naveen', feature: 'checkout', story: 'SHOP-231' });
 */
export function meta(values: TestMeta) {
  const i = info();
  for (const [k, v] of Object.entries(values)) {
    if (v === undefined) continue;
    i.annotations.push({ type: k.toLowerCase(), description: String(v) });
  }
}

/**
 * Add a timestamped log line to the current test. Lines containing "error"/"fail" show red, "warn" amber.
 * Secrets like `password=...`, `Bearer ...`, JWTs are masked in the report.
 * @example await log('cart total before coupons: $99.00');
 */
export async function log(message: string, ...rest: unknown[]) {
  const msg = [message, ...rest.map(r => (typeof r === 'string' ? r : JSON.stringify(r)))].join(' ');
  await info().attach('rl:log', { body: JSON.stringify({ t: Date.now(), msg }), contentType: 'application/x-rl-log' });
}

/**
 * Attach the data used by this test.
 * - object            → key/value block
 * - array of objects  → table (rows from JSON / Excel / DB)
 * - CSV string        → table
 * Sensitive keys (password, token, secret, apiKey, authorization, cookie...) are masked as ****.
 * @param data  the data
 * @param name  heading shown in the report (default "Test data")
 * @example await testData({ username: 'naveen', password: 'S3cret' }, 'Login');
 */
export async function testData(data: unknown, name = 'Test data') {
  await info().attach(name, { body: JSON.stringify(typeof data === 'string' ? { csv: data } : data), contentType: 'application/x-rl-data' });
}

/**
 * Record an API request/response for this test. Shows up in the test detail and the API tab.
 * Authorization/Cookie headers, tokens and secret-looking fields are masked.
 * @example
 * await api({ method: 'POST', url: '/v1/orders', status: 201, duration: 138, requestBody, responseBody });
 */
export async function api(call: ApiCall) {
  await info().attach(call.name ?? `${call.method.toUpperCase()} ${call.url}`, { body: JSON.stringify(call), contentType: 'application/x-rl-api' });
}

/**
 * @deprecated Import `test` from 'reporting-labs/test' instead: every `request.*` call is then recorded
 * without a wrapper. Kept for projects that already use it.
 */
export async function recordApi<T extends { status(): number; headers(): Record<string, string>; text(): Promise<string>; url(): string }>(
  method: string, url: string, options: { headers?: Record<string, string>; data?: unknown; name?: string } | undefined, run: () => Promise<T>,
): Promise<T> {
  const t0 = Date.now();
  const res = await run();
  let body: unknown = await res.text();
  try { body = JSON.parse(body as string); } catch { /* keep text */ }
  await api({ method, url, status: res.status(), duration: Date.now() - t0, requestHeaders: options?.headers, requestBody: options?.data, responseHeaders: res.headers(), responseBody: body, name: options?.name });
  return res;
}
