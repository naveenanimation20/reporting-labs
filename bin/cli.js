#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const [cmd] = process.argv.slice(2);

if (cmd === 'init') {
  const file = path.resolve('reporting-labs.config.ts');
  if (fs.existsSync(file)) { console.log('reporting-labs.config.ts already exists.'); process.exit(0); }
  fs.writeFileSync(file, `import 'reporting-labs/auto';   // records every request.* / page.request call in the report
import type { ReportingLabsOptions } from 'reporting-labs';

const config: ReportingLabsOptions = {
  title: 'My app – regression',
  // logo: 'https://example.com/logo.svg',
  palette: 'lab',            // 'lab' (blue) | 'ocean' | 'ember' | 'mono'
  theme: 'auto',
  metadata: { env: process.env.TEST_ENV ?? 'local', branch: process.env.GIT_BRANCH ?? 'main' },
  links: { story: 'https://acme.atlassian.net/browse/{id}' },
  sections: [],
};
export default config;
`);
  console.log('Created reporting-labs.config.ts');
  console.log('');
  console.log('Now in playwright.config.ts:');
  console.log("  import reportingLabs from './reporting-labs.config';");
  console.log("  reporter: [['list'], ['reporting-labs', reportingLabs]],");
} else {
  console.log(`reporting-labs

  npx reporting-labs init     create a starter config file

Usage in playwright.config.ts:
  reporter: [['reporting-labs', { title: 'My report' }]]
`);
}
