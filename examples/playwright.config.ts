import 'reporting-labs/auto';             // records every request.* / page.request call in the report
import { defineConfig } from '@playwright/test';
import reportingLabs from './reporting-labs.config';

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  retries: 1,                                  // lets the report show retries and flaky tests
  workers: 2,
  reporter: [
    ['list'],                                  // terminal output
    ['reporting-labs', reportingLabs],         // the HTML report, options come from reporting-labs.config.ts
  ],
  use: {
    screenshot: 'only-on-failure',             // picked up automatically
    video: 'retain-on-failure',                // picked up automatically
    trace: 'on-first-retry',                   // picked up automatically
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
