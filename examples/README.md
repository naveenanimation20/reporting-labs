# Examples

Small, self-contained spec files that show every reportingLabs feature. They use `page.setContent()` and `page.route()` instead of a real website, so they run anywhere in a few seconds. Only `03-api-calls` goes online: it talks to the free public API at [gorest.in](https://gorest.in/).

| File | Shows |
|---|---|
| [01-tag-your-tests.spec.ts](01-tag-your-tests.spec.ts) | `meta()` for priority, severity, owner, feature, story; the same via tags and annotations |
| [02-logs-and-test-data.spec.ts](02-logs-and-test-data.spec.ts) | `log()` lines, `testData()` as key/value, table and CSV; secrets masked |
| [03-api-calls.spec.ts](03-api-calls.spec.ts) | Plain `request.post` / `patch` / `delete` and `page.request` calls against gorest.in, recorded automatically; a 403; `api()` for other clients |
| [04-steps-and-attachments.spec.ts](04-steps-and-attachments.spec.ts) | `test.step()` bars, screenshots, JSON and text attachments, visual comparison |
| [05-outcomes.spec.ts](05-outcomes.spec.ts) | skip with a reason, fixme, expected failure (`test.fail`), timeout, retries |
| [06-bdd-style.spec.ts](06-bdd-style.spec.ts) | Given / When / Then steps rendered as Gherkin |
| [reporting-labs.config.ts](reporting-labs.config.ts) | A complete reporter config with comments |
| [playwright.config.ts](playwright.config.ts) | How the reporter is wired in, next to the built-in reporters |

## Run them

```bash
git clone https://github.com/naveenautomationlabs/reporting-labs
cd reporting-labs/examples
npm install
npx playwright test
open reporting-labs/index.html
```

Run the suite two or three times to see the history features (new vs known failures, flaky dots, got slower, trend).
