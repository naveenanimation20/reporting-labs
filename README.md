<p align="center"><img src="assets/logo-wordmark.svg" alt="reportingLabs" width="320"></p>

# reportingLabs

Beautiful, single-file HTML test reports. One line of config, zero setup.

reportingLabs is runner-agnostic by design: the report is built from a plain JSON model, and adapters feed it. The Playwright adapter ships today; WebdriverIO, Cypress and Jest/Vitest adapters are on the roadmap.

```bash
npm i -D reporting-labs
```

```ts
// playwright.config.ts (Playwright adapter)
export default defineConfig({
  reporter: [['reporting-labs', { title: 'My app – regression' }]],
});
```

Run your tests. Open `reporting-labs/index.html`. That's it.

## What you get

- Run strip: every test as a cell, colored by outcome. See the whole run in one glance, click any cell to open it.
- Timeline by worker, slowest tests, per-project breakdown.
- Searchable test list with status and project filters.
- Steps tree, errors with stack traces, screenshots (inline, click to zoom), traces/videos as links, console output, annotations, tags.
- Retries shown as tabs. Flaky tests flagged.
- New vs known failures: every failure says `NEW` or `since #1838`, the Failed tile counts them, and the Failures view exports to CSV/JSON.
- Blue and white look with light and dark theme, follows your OS. Toggle in the header.
- Single HTML file – attach it to CI, email it, open it anywhere.

## Priority, severity, owner, feature

Tag each test once; the report builds charts, filters and a "Needs attention" list from it.

```ts
import { meta } from 'reporting-labs';

test('completes purchase', async ({ page }) => {
  meta({ priority: 'P0', severity: 'blocker', owner: 'naveen', feature: 'payment', story: 'SHOP-250' });
  // ...
});
```

Tags work too: `{ tag: ['@P1', '@severity:critical', '@owner:priya'] }`. Plain annotations (`test.info().annotations.push({ type: 'priority', description: 'P1' })`) are picked up as well.

Change which keys count as dimensions with `dimensions: ['priority', 'severity', 'team']`, and their order with `dimensionOrder: { severity: ['blocker', 'critical', 'major', 'minor'] }`.

## Charts and widgets

Outcome donut · Needs attention (highest-priority failures first) · stacked bars per dimension (click to filter) · timeline by worker · duration spread · slowest tests · by project · tags. Turn any off with `widgets: { tags: false }`.

## Logs, test data and API calls

```ts
import { meta, log, testData, api, recordApi } from 'reporting-labs';

test('creates an order', async ({ request }) => {
  meta({ priority: 'P0', owner: 'naveen', feature: 'orders', epic: 'EPIC-18', story: 'API-301' });

  await log('starting with an empty cart');                 // timestamped log lines

  await testData({ user: 'naveen@x.com', password: 'S3cret' }, 'Login');   // object → key/value block
  await testData(rowsFromExcelOrJson, 'Coupons');                          // array of objects → table
  await testData(fs.readFileSync('data/users.csv', 'utf8'), 'users.csv');  // CSV string → table

  const res = await recordApi('POST', '/v1/orders', { headers, data }, () => request.post('/v1/orders', { headers, data }));
  // or record manually: await api({ method, url, status, duration, requestHeaders, requestBody, responseHeaders, responseBody })
});
```

Passwords, tokens, API keys, `Authorization`/`Cookie` headers, JWTs and `Bearer …` values are masked as `****` everywhere – logs, tables, request/response panels. Add your own keys with `maskKeys: ['otp', 'pan']`.

## Links to Jira, epics, stories

```ts
links: { story: 'https://acme.atlassian.net/browse/{id}', epic: 'https://acme.atlassian.net/browse/{id}', issue: '...' }
```

Any meta key with a template becomes a clickable chip. Values that are already URLs are linked automatically.

## Project block, workers, spec/folder views, trend

- `project: { name, version, team, url }` shows under the title next to your `logo`.
- Workers card: how many ran in parallel, how busy each was, wall clock vs total test time.
- Test list groups by spec file, folder tree, or flat. "By spec file" chart shows which files are red.
- Trend: the reporter keeps `reporting-labs.history.json` next to your config (last 30 runs by default) and draws pass rate, fail rate and duration across runs. Commit the file or cache it in CI to keep the history.

## Triage across runs

The history file also stores each test's outcome and duration per run, so the report can answer the questions you ask first:

- New vs known: a failure that passed in the previous run is badged `NEW`; one that has been red for a while shows `since #1838`. The Failed tile splits the count (`2 new · 10 known`), the Needs attention list, the Failures table, the test detail and the copied summary all carry it.
- Flaky history: every failed or flaky test shows its last 10 runs as dots (green/red/amber), and a Flakiest tests card ranks tests by flaky retries and pass/fail flips.
- Duration regression: the Slowest card gets a Got slower tab with tests that took 2× longer than in the previous run (and at least 500 ms more).
- Sparklines on the KPI tiles show how passed, failed, flaky and skipped counts moved over the last 12 runs.

## Failures view

Failure clusters, Needs attention, and a By owner card that groups failures per owner so you know exactly who to ping (click an owner to filter the test list). Download CSV / Download JSON export the failed and flaky tests with title, spec, project, priority, severity, owner, ticket, attempts, duration, first error line and the new/known status, ready for Jira or a sheet. Copy summary adds a `By owner:` line.

## Environment, heatmap, skipped reasons

- Environment card: runner (e.g. Playwright) and Node versions, OS, browsers from your projects, a link to the CI job (GitHub Actions, GitLab, Jenkins, CircleCI, Azure, Bitbucket) and the git commit with author and message. Add your own rows with `env: { 'App build': '2.4.0-rc3' }`.
- Heatmap: with more than one project, the Breakdown card gains a feature × project grid. Red cells mean failures (darker = larger share), amber flaky, green clean. Click a cell to filter.
- Skipped card lists skipped tests with the reason from `test.skip(cond, 'reason')` / `test.fixme`, and the reason also shows in the test list.

## Everything Playwright knows, in the report

- Outcomes: passed, failed, flaky (passed on retry), skipped (with the `test.skip` / `test.fixme` reason), timed out (with the timeout that was exceeded) and interrupted.
- `test.fail()` tests that fail as expected count as passed and carry an "Expected failure" badge; one that unexpectedly passes is reported as failed with a note telling you to remove the marker.
- Every error shows its location (linked to VS Code), Playwright's code snippet, the message and the stack. Multiple errors per attempt are all listed.
- Errors outside tests (a spec that throws at load, global setup, a worker crash) get their own card at the top of the overview, together with any console output that was not attributed to a test.
- Interrupted runs (Ctrl+C) and global timeouts show a banner with how many tests did not finish, and the copied summary is flagged.
- Shard (`--shard=2/4`) and worker count appear in the Environment card. Result-level annotations are merged with the test's own.

## Inside a test

- Expected vs received diff: `expect` failures render side by side with the differing characters highlighted, and `- Expected / + Received` object diffs are colored line by line. The full message and stack stay one click away.
- Step timeline: every step has a bar showing its share of the test duration, amber when a single step takes 30 % or more.
- Open in VS Code: a link on every test opens the spec at the right line (`vscode://file/...`). Turn it off with `editorLinks: false`.

## BDD

Works with playwright-bdd or any Given/When/Then `test.step` titles: keywords are highlighted, describe blocks show as Features, tests as Scenarios. Force it with `bdd: true`.

## Screenshots, videos, traces

Nothing extra to do. Use your runner's own settings (Playwright shown) and the report picks the attachments up:

```ts
use: {
  screenshot: 'only-on-failure',   // shown inline, click to zoom
  video: 'retain-on-failure',      // inline player (copied to ./assets, or embedded with embedVideos: true)
  trace: 'on-first-retry',         // trace card with download + how to open
}
```

`toHaveScreenshot` failures get a visual comparison viewer: slider, side by side, and diff. Anything you attach yourself with `test.info().attach()` shows up too – images inline, text/JSON as a code block, everything else as a download.

## Look and feel

Four built-in palettes, each with light and dark: `lab` (blue + white, default), `ocean`, `ember`, `mono`. The header, outcome stripe and view tabs sit on a deep blue band; the overview opens with clickable KPI tiles (pass rate with a ring and the delta from the previous run, then passed / failed / flaky / skipped) that filter the test list. Set `palette: 'ocean'` in config; viewers can switch from the header and their choice is remembered. `accent: '#hex'` overrides the accent with your brand color. The thin stripe above the header shows the run's pass/flaky/fail proportions.

## Nice to have, built in

- Failure clusters: failed tests grouped by error signature, so 30 red tests with one root cause read as one problem.
- Copy summary: one click gives a Slack/Teams-ready summary with top failures, owners and ticket keys.
- Copy link / copy error on every test.
- Keyboard: `j` `k` next/prev test, `f` failed only, `/` search, `Esc` close.
- Print stylesheet for PDF export.

## Customize

```ts
reporter: [['reporting-labs', {
  title: 'ShopLite – nightly regression',
  logo: 'https://example.com/logo.svg',
  palette: 'lab',                    // 'lab' (blue, default) | 'ocean' | 'ember' | 'mono'
  accent: '#7C3AED',                 // optional: override the palette accent with your brand color
  theme: 'auto',                     // 'light' | 'dark' | 'auto'
  outputFolder: 'reporting-labs',
  metadata: { env: 'staging', branch: process.env.GIT_BRANCH ?? 'main', build: process.env.BUILD_ID ?? 'local' },
  widgets: { runStrip: true, outcome: true, attention: true, dimensions: true, timeline: true, durations: true, slowest: true, projects: true, tags: true, flaky: true, environment: true, skipped: true },
  env: { 'App build': '2.4.0-rc3' }, // extra rows for the Environment card
  editorLinks: true,                 // "Open in VS Code" link on every test
  dimensions: ['priority', 'severity', 'feature', 'owner'],
  sections: [{ title: 'Release notes', html: '<p>Checkout v2 at 50% rollout.</p>' }],
  customCss: '.hdr h1 { text-transform: uppercase }',
  embedAttachments: true,            // inline screenshots as base64
  embedLimit: 2 * 1024 * 1024,       // larger files are copied to ./assets
  embedVideos: false,                // true = single file with videos inside (big)
  embedFonts: true,                  // IBM Plex bundled in the HTML (~140 KB); false = load from Google Fonts
}]]
```

`npx reporting-labs init` writes a starter `reporting-labs.config.ts`.

## Roadmap

- WebdriverIO, Cypress, Jest/Vitest, JUnit XML adapters via the shared JSON schema
- AI summary and failure clustering (bring your own API key)
- Hosted history dashboard across branches/projects

## License

MIT © Naveen Automation Labs
