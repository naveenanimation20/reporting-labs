<p align="center"><img src="https://raw.githubusercontent.com/naveenautomationlabs/reporting-labs/main/assets/logo-wordmark.svg" alt="reportingLabs" width="320"></p>

# reportingLabs

**One HTML file that tells you what broke, who owns it, and whether it is new.**

reportingLabs turns a test run into a single, self-contained HTML report. No server, no upload, no dashboard to log into. Open the file, or attach it to a CI job, an email or a Slack message.

It is runner-agnostic by design: the report is built from a plain JSON model that adapters feed. The **Playwright adapter ships today**; WebdriverIO, Cypress and Jest/Vitest adapters are on the roadmap.

<p align="center"><img src="https://raw.githubusercontent.com/naveenautomationlabs/reporting-labs/main/docs/overview.png" alt="Overview page of a reportingLabs report" width="900"></p>

## Quick start

**1. Install**

```bash
npm i -D reporting-labs
```

**2. Add the reporter to `playwright.config.ts`**

```ts
export default defineConfig({
  reporter: [['reporting-labs', { title: 'My app – regression' }]],
});
```

**3. Run your tests and open the report**

```bash
npx playwright test
open reporting-labs/index.html
```

That is all. Everything below is optional.

## Keep the reporter options in their own file (recommended)

As soon as you set more than a title, put the reportingLabs options in a separate file. Your `playwright.config.ts` stays short, and all report settings live in one place.

**Step 1.** Create the file (or let the CLI do it with `npx reporting-labs init`):

```ts
// reporting-labs.config.ts  (next to playwright.config.ts)
import type { ReportingLabsOptions } from 'reporting-labs';

const config: ReportingLabsOptions = {
  title: 'My app – regression',
  outputFolder: 'reports/reporting-labs',
  embedVideos: true,
  metadata: { env: process.env.TEST_ENV ?? 'local' },
  // links: { story: 'https://yourteam.atlassian.net/browse/{id}' },
};

export default config;
```

**Step 2.** Import it in `playwright.config.ts` and add one line to your reporter list. Your other reporters keep working as before.

```ts
import { defineConfig } from '@playwright/test';
import reportingLabs from './reporting-labs.config';

export default defineConfig({
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['reporting-labs', reportingLabs],   // <- this line
  ],
});
```

That is it. The `ReportingLabsOptions` type gives you autocomplete for every option in your editor.

If your reporter list differs between CI and local (a common pattern), add the same line to both branches:

```ts
reporter: process.env.CI
  ? [['blob'], ['html', { open: 'never' }], ['reporting-labs', reportingLabs]]
  : [['list'], ['html', { open: 'never' }], ['reporting-labs', reportingLabs]],
```

## Examples you can copy

The [`examples/`](https://github.com/naveenautomationlabs/reporting-labs/tree/main/examples) folder has one small spec per feature. Each one runs in a few seconds (only the API example goes online, to the free [gorest.in](https://gorest.in/) API), so you can read it, run it, and copy what you need.

| Spec | What it shows |
|---|---|
| [01-tag-your-tests.spec.ts](https://github.com/naveenautomationlabs/reporting-labs/blob/main/examples/01-tag-your-tests.spec.ts) | `meta()` with priority, severity, owner, feature, story; the same via tags and annotations |
| [02-logs-and-test-data.spec.ts](https://github.com/naveenautomationlabs/reporting-labs/blob/main/examples/02-logs-and-test-data.spec.ts) | `log()` lines and `testData()` as key/value, table and CSV, with secrets masked |
| [03-api-calls.spec.ts](https://github.com/naveenautomationlabs/reporting-labs/blob/main/examples/03-api-calls.spec.ts) | Plain `request.post` / `patch` / `delete` and `page.request` calls against gorest.in, recorded automatically, a 403 in the API tab, `api()` for other clients |
| [04-steps-and-attachments.spec.ts](https://github.com/naveenautomationlabs/reporting-labs/blob/main/examples/04-steps-and-attachments.spec.ts) | `test.step()` bars, screenshot / JSON attachments, visual comparison viewer |
| [05-outcomes.spec.ts](https://github.com/naveenautomationlabs/reporting-labs/blob/main/examples/05-outcomes.spec.ts) | skip with a reason, fixme, expected failure, timeout, a plain failure, a flaky test |
| [06-bdd-style.spec.ts](https://github.com/naveenautomationlabs/reporting-labs/blob/main/examples/06-bdd-style.spec.ts) | Given / When / Then steps rendered as Gherkin |
| [reporting-labs.config.ts](https://github.com/naveenautomationlabs/reporting-labs/blob/main/examples/reporting-labs.config.ts) | A complete reporter config, every option commented |
| [playwright.config.ts](https://github.com/naveenautomationlabs/reporting-labs/blob/main/examples/playwright.config.ts) | How the reporter sits next to the built-in reporters |

```bash
git clone https://github.com/naveenautomationlabs/reporting-labs
cd reporting-labs/examples && npm install && npx playwright test
open reporting-labs/index.html
```

## A tour of the report

### Overview: the state of the run in one screen

- **Tiles**: pass rate with a ring and the change from the previous run, then passed / failed / flaky / skipped. Click a tile to see those tests.
- **Run strip**: every test as one cell, in run order. Hover for the name, click to open.
- **Needs attention**: failures ranked by priority and severity, with the spec file, the owner, and whether the failure is new or has been failing since a given build.
- **Failure clusters**: failures grouped by error message, so 30 red tests with one root cause read as one problem.
- **Breakdown**: stacked bars per priority, severity, feature, owner, spec file, project or tag. Click a row to filter the test list. With more than one project you also get a feature × project heatmap.
- **Slowest tests** and **Got slower** (tests that took 2× longer than last run), **Flakiest tests**, **Skipped** (with reasons), **Environment** and the **Trend** across runs.

<p align="center"><img src="https://raw.githubusercontent.com/naveenautomationlabs/reporting-labs/main/docs/heatmap.png" alt="Breakdown card with the feature by project heatmap" width="900"></p>

<p align="center"><img src="https://raw.githubusercontent.com/naveenautomationlabs/reporting-labs/main/docs/trend.png" alt="Trend chart with hover tooltip" width="900"></p>

### Failures: everything you need to triage

- **By owner**: who to ping, with failed and flaky counts. Click an owner to filter.
- **Download CSV / JSON**: the failed and flaky tests with title, spec, project, priority, owner, ticket, attempts, duration, first error line and new/known status. Ready for Jira or a sheet.
- **Copy summary**: a Slack/Teams-ready message with top failures, owners, ticket keys and an owner breakdown.
- The table shows every failed or flaky test with its history over the last runs as dots.

<p align="center"><img src="https://raw.githubusercontent.com/naveenautomationlabs/reporting-labs/main/docs/failures.png" alt="Failures page" width="900"></p>

### Test detail: the error, the steps, the evidence

- **Expected vs received** side by side with the difference highlighted. Object diffs are colored line by line.
- Error **location** (linked to VS Code), Playwright's **code snippet**, full message and stack.
- **Steps** with a bar per step showing its share of the test time. Given/When/Then titles are styled as Gherkin.
- Retries as tabs, screenshots inline (click to zoom), videos, traces, console output, logs, test data and API calls.
- **Open in VS Code** jumps to the failing line.

<p align="center"><img src="https://raw.githubusercontent.com/naveenautomationlabs/reporting-labs/main/docs/test-detail.png" alt="Test detail with expected vs received diff and step bars" width="900"></p>

### Timeline: how the run used its workers

<p align="center"><img src="https://raw.githubusercontent.com/naveenautomationlabs/reporting-labs/main/docs/timeline.png" alt="Timeline by worker" width="900"></p>

## Make the report smarter: tag your tests

One line per test gives you priority ranking, owner rollups, feature breakdowns and Jira links.

```ts
import { meta } from 'reporting-labs';

test('completes purchase', async ({ page }) => {
  meta({ priority: 'P0', severity: 'blocker', owner: 'naveen', feature: 'payment', story: 'SHOP-250' });
  // ...
});
```

Full example: [examples/01-tag-your-tests.spec.ts](https://github.com/naveenautomationlabs/reporting-labs/blob/main/examples/01-tag-your-tests.spec.ts). Tags work too: `{ tag: ['@P1', '@severity:critical', '@owner:priya'] }`. Plain annotations (`test.info().annotations.push({ type: 'priority', description: 'P1' })`) are picked up as well.

Turn story, epic or issue keys into links:

```ts
links: { story: 'https://acme.atlassian.net/browse/{id}', epic: 'https://acme.atlassian.net/browse/{id}' }
```

## Logs and test data

```ts
import { log, testData } from 'reporting-labs';

test('creates an order', async ({ request }) => {
  await log('starting with an empty cart');                                 // timestamped log line

  await testData({ user: 'naveen@x.com', password: 'S3cret' }, 'Login');    // object → key/value block
  await testData(rowsFromExcelOrJson, 'Coupons');                           // array of objects → table
  await testData(fs.readFileSync('data/users.csv', 'utf8'), 'users.csv');   // CSV string → table
});
```

## API calls, recorded automatically

Add one line to `playwright.config.ts`:

```ts
import 'reporting-labs/auto';
```

That is all. Every call your tests make through Playwright's `request` fixture, `page.request`, `context.request` or `playwright.request.newContext()` is recorded as it happens. No wrapper, no helper, your test code stays plain Playwright:

```ts
test('creates an order', async ({ request }) => {
  const res = await request.post('/v1/orders', { headers, data });
  expect(res.status()).toBe(201);
});
```

Each call shows up in the test detail and in the **API** tab with method, URL, status, time taken, request and response headers and bodies, and a **Copy as cURL** button so you can replay it from a terminal. Failed calls (4xx / 5xx, or no connection) are highlighted. Binary responses are summarised instead of dumped, and bodies over 200 KB are truncated.

Calls that do not go through Playwright (axios, `fetch`, a Java service in the same pipeline) can still be recorded by hand with `api({ method, url, status, duration, requestBody, responseBody })`.

Full examples: [02-logs-and-test-data.spec.ts](https://github.com/naveenautomationlabs/reporting-labs/blob/main/examples/02-logs-and-test-data.spec.ts) and [03-api-calls.spec.ts](https://github.com/naveenautomationlabs/reporting-labs/blob/main/examples/03-api-calls.spec.ts). Passwords, tokens, API keys, `Authorization` / `Cookie` headers, JWTs and `Bearer …` values are masked as `****` everywhere. Add your own keys with `maskKeys: ['otp', 'pan']`.

## Run history: new vs known, flaky, slower

The reporter keeps `reporting-labs.history.json` next to your config (last 30 runs by default). Commit it, or cache it in CI, and the report starts answering the questions you ask first:

| Question | Where it shows |
|---|---|
| Did this break just now, or has it been red for days? | `new this run` / `failing since #1838` on every failure; the Failed tile splits the count |
| Which tests are flaky? | Last-10-runs dots on every failure, plus the Flakiest tests card |
| What got slower? | Got slower tab on the Slowest card (2× slower than last run) |
| Are we trending up or down? | Trend chart with pass rate, fail rate and duration per run, hover for details |

The first run has nothing to compare with; these cards fill in from the second run.

## Screenshots, videos, traces

Nothing extra to do. Use your runner's own settings and the report picks the attachments up:

```ts
use: {
  screenshot: 'only-on-failure',   // shown inline, click to zoom
  video: 'retain-on-failure',      // inline player (copied to ./assets, or embedded with embedVideos: true)
  trace: 'on-first-retry',         // trace card with download and how to open it
}
```

`toHaveScreenshot` failures get a visual comparison viewer: slider, side by side, and diff. Anything you attach with `test.info().attach()` shows up too: images inline, text/JSON as a code block, everything else as a download.

## What the report covers

Every outcome Playwright can produce is shown, not just pass/fail:

- passed, failed, flaky (passed on retry), skipped with the `test.skip` / `test.fixme` reason, timed out with the exceeded timeout, interrupted
- `test.fail()` tests that fail as expected count as passed with an "Expected failure" badge; one that unexpectedly passes is reported as failed with a note
- errors outside tests (a spec that throws at load, global setup, a worker crash) get their own card at the top of the overview
- interrupted runs and global timeouts show a banner with how many tests did not finish
- shard and worker count in the Environment card, together with Playwright and Node versions, OS, browsers, the CI job link (GitHub Actions, GitLab, Jenkins, CircleCI, Azure, Bitbucket) and the git commit

## Options

All options are optional. Pass them as the second element of the reporter tuple.

| Option | Default | What it does |
|---|---|---|
| `title` | `'Test report'` | Report title in the header |
| `logo` | – | Path or data URI of your logo, shown next to the title |
| `project` | – | `{ name, version, team, url }` shown under the title |
| `metadata` | `{}` | Key/value chips in the header, e.g. `{ env: 'staging', build: '#1842' }`. `build` labels the run in history; in CI the run number is used when it is not set |
| `env` | – | Extra rows for the Environment card, e.g. `{ 'App build': '2.4.0-rc3' }` |
| `dimensions` | `['priority','severity','feature','owner']` | Meta keys that get charts and filters |
| `dimensionOrder` | P0…P4, blocker…trivial | Sort order per dimension, e.g. `{ severity: ['blocker','critical','major','minor'] }` |
| `links` | `{}` | URL templates per meta key, `{id}` is replaced by the value |
| `maskKeys` | `[]` | Extra keys to mask in logs, data and API panels |
| `widgets` | all on | Hide cards: `{ tags: false, timeline: false, flaky: false, environment: false, skipped: false, ... }` |
| `sections` | `[]` | Extra HTML sections below the summary, e.g. release notes |
| `history` | `{ enabled: true, keep: 30 }` | Run history file; `file` sets a custom path |
| `palette` | `'lab'` | `'lab'` (blue), `'ocean'`, `'ember'`, `'mono'`. Viewers can switch in the header |
| `accent` | palette accent | Override the accent with your brand color |
| `theme` | `'auto'` | `'light'`, `'dark'` or follow the OS |
| `customCss` | `''` | CSS appended to the report |
| `editorLinks` | `true` locally, `false` in CI | "Open in VS Code" links |
| `bdd` | auto | Style Given/When/Then steps as Gherkin |
| `outputFolder` | `'reporting-labs'` | Where the report and copied assets go |
| `outputFile` | `'index.html'` | Report file name |
| `embedAttachments` | `true` | Inline screenshots as base64 (single file) |
| `embedLimit` | 2 MB | Larger attachments are copied to `./assets` instead |
| `embedVideos` | `false` | Inline videos too (big file) |
| `embedFonts` | `true` | Bundle IBM Plex (~140 KB) so the report looks the same offline |
| `announce` | `true` | Print the report path after the run |

A fuller example:

```ts
reporter: [['reporting-labs', {
  title: 'ShopLite – nightly regression',
  project: { name: 'ShopLite Web', version: '2.4.0', team: 'QA Platform' },
  metadata: { env: 'staging', branch: process.env.GIT_BRANCH ?? 'main', build: process.env.BUILD_ID ?? 'local' },
  links: { story: 'https://acme.atlassian.net/browse/{id}' },
  sections: [{ title: 'Release notes', html: '<p>Checkout v2 at 50% rollout.</p>' }],
}]]
```

`npx reporting-labs init` writes a starter `reporting-labs.config.ts`; see [Keep the reporter options in their own file](#keep-the-reporter-options-in-their-own-file-recommended).

## Running in CI

The report is a plain file written next to your tests, so it works anywhere `npx playwright test` runs: locally, GitHub Actions, GitLab, Jenkins, CircleCI, Azure Pipelines, Bitbucket. Nothing phones home and no fonts are fetched, so it also works in locked-down networks.

What happens automatically in CI:

- The Environment card links the CI job and the commit (GitHub Actions, GitLab, Jenkins, CircleCI, Azure, Bitbucket are detected from their environment variables).
- The run is labelled with the CI run number in the history and the trend chart, unless you set `metadata.build` yourself.
- "Open in VS Code" links are off when the `CI` variable is set, because they would point at the runner's paths. Set `editorLinks: true` to force them.

Two things to set up:

1. **Publish the report.** Upload `reporting-labs/` as a build artifact (or archive it in Jenkins). Screenshots and fonts are inside `index.html`; videos and large files sit in `reporting-labs/assets/`.
2. **Keep the history.** `reporting-labs.history.json` is what powers the trend, new vs known failures, flaky history and duration regressions. On GitHub Actions restore and save it with `actions/cache`; on Jenkins the workspace usually persists on its own.

Ready-to-copy samples: [docs/ci/github-actions.yml](https://github.com/naveenautomationlabs/reporting-labs/blob/main/docs/ci/github-actions.yml) and [docs/ci/Jenkinsfile](https://github.com/naveenautomationlabs/reporting-labs/blob/main/docs/ci/Jenkinsfile).

```yaml
# GitHub Actions, the two steps that matter
- uses: actions/cache@v4
  with:
    path: reporting-labs.history.json
    key: reporting-labs-history-${{ github.ref_name }}-${{ github.run_id }}
    restore-keys: reporting-labs-history-${{ github.ref_name }}-
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: test-report
    path: reporting-labs/
```

**Jenkins HTML Publisher note.** Jenkins' default Content-Security-Policy blocks inline JavaScript, so a single-file report shows up blank inside Jenkins (Playwright's own HTML report has the same issue). Either download the archived artifact and open it locally, or have an admin relax the policy in the script console: `System.setProperty("hudson.model.DirectoryBrowserSupport.CSP", "")`.

## Good to know

- **Single file.** Screenshots and fonts are embedded, so `index.html` works from a mail attachment or a CI artifact. Videos and large files go to `./assets` next to it, so keep the folder together when you move or share the report.
- **Re-running tests replaces the report.** The previous report stays intact until the new run finishes, then `index.html` and `assets/` are replaced. A report tab opened from an earlier run will lose its videos at that point; archive the folder if you need to keep it.
- **Videos on macOS.** If the report lives in Downloads, Desktop or Documents and you open it as a file, Chrome may be blocked from reading the sibling `assets/` files (the player shows a clear message). Allow Chrome under System Settings → Privacy & Security → Files and Folders, move the project elsewhere, or set `embedVideos: true` to put videos inside the HTML.
- **Video download.** Served over http (CI artifact viewer, a local server) the download link saves the file; opened as a plain file the browser opens the video in a new tab instead, where the player's menu offers Save.
- **Keyboard.** `j` / `k` next and previous test, `f` failed only, `/` search, `1`–`5` switch views, `Esc` close.
- **Print.** A print stylesheet is included for PDF export.
- **Themes.** Light and dark follow the OS; the toggle in the header remembers the choice.

## Roadmap

- WebdriverIO, Cypress, Jest/Vitest, JUnit XML adapters via the shared JSON schema
- AI summary and failure clustering (bring your own API key)
- Hosted history dashboard across branches/projects

## License

MIT © Naveen Automation Labs
