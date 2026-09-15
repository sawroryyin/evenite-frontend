import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    launchOptions: {
      slowMo: 1800,
    },
    // viewport: {
    //   width: 495,
    //   height: 600,
    // },

  },

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 490, height: 875 } },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"], viewport: { width: 490, height: 875 } },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"], viewport: { width: 490, height: 875 } },
    },
  ],
});