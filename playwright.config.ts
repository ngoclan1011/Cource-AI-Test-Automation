import { defineConfig, devices } from '@playwright/test';
import { ENV, STORAGE_STATE } from './src/config/env';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  timeout: ENV.timeout,
  expect: { timeout: 10_000 },

  fullyParallel: true,
  forbidOnly: ENV.isCI,
  // The public demo instance throttles concurrent traffic, so a retry keeps
  // an occasional slow response from failing an otherwise good run.
  retries: ENV.retries,
  workers: ENV.isCI ? 2 : ENV.workers,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html-report', open: 'never' }],
    ['junit', { outputFile: 'reports/junit/results.xml' }],
    ['json', { outputFile: 'reports/json/results.json' }],
  ],

  use: {
    baseURL: ENV.baseURL,
    headless: ENV.headless,
    launchOptions: { slowMo: ENV.slowMo },
    actionTimeout: 20_000,
    navigationTimeout: 60_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
    testIdAttribute: 'data-testid',
  },

  projects: [
    // Logs in once and saves the session; other projects can reuse it.
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium',
      testIgnore: [/.*\.setup\.ts/, /.*\.auth\.spec\.ts/],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testIgnore: [/.*\.setup\.ts/, /.*\.auth\.spec\.ts/],
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testIgnore: [/.*\.setup\.ts/, /.*\.auth\.spec\.ts/],
      use: { ...devices['Desktop Safari'] },
    },
    // Tests that need an already-authenticated session.
    {
      name: 'authenticated',
      testMatch: /.*\.auth\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
    },
  ],
});
