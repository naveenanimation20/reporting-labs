import type { ReportingLabsOptions } from 'reporting-labs';

// Every option is optional. Delete what you do not need.
const config: ReportingLabsOptions = {
  title: 'ShopLite – examples',
  outputFolder: 'reporting-labs',              // where index.html goes

  // Shown under the title.
  project: { name: 'ShopLite Web', version: '2.4.0', team: 'QA Platform', url: 'https://shoplite.example.com' },

  // Chips in the header. `build` also labels the run in the history/trend.
  metadata: { env: process.env.TEST_ENV ?? 'local', build: process.env.BUILD_ID ?? 'local' },

  // Turn story / epic / issue keys from meta() into links.
  links: {
    story: 'https://shoplite.atlassian.net/browse/{id}',
    epic: 'https://shoplite.atlassian.net/browse/{id}',
    issue: 'https://shoplite.atlassian.net/browse/{id}',
  },

  // Which meta keys get charts and filters (these are the defaults plus two more).
  dimensions: ['priority', 'severity', 'feature', 'owner', 'epic', 'story'],

  // Videos inside the HTML: one file to share, no folder permission issues.
  embedVideos: true,

  // Extra keys to mask in logs, test data and API panels (passwords, tokens etc. are masked already).
  maskKeys: ['otp'],

  // Free text below the summary. HTML allowed.
  sections: [{ title: 'Release notes', html: '<p>Checkout v2 at 50% rollout. Known issue: <code>PROMO-118</code>.</p>' }],
};

export default config;
