import { createHash } from 'node:crypto';
import { defineConfig, devices } from '@playwright/test';

/**
 * Each checkout (the main folder or a git worktree) serves the site on its own
 * port, derived from its path, so two worktrees never test each other's server.
 * Set E2E_PORT to override it.
 */
const port =
    Number(process.env.E2E_PORT) ||
    4400 + (parseInt(createHash('sha1').update(process.cwd()).digest('hex').slice(0, 8), 16) % 600);
const baseURL = `http://localhost:${port}`;

// Options: https://playwright.dev/docs/test-configuration
export default defineConfig({
    testDir: './e2e-tests',
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : 5,
    reporter: process.env.CI ? 'github' : 'list',
    use: {
        baseURL,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        actionTimeout: 10000,
        navigationTimeout: 15000,
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    webServer: {
        /*
         * --ignore-lock keeps `astro preview` in the foreground: when an agent such
         * as Claude Code runs the tests, Astro 7 would otherwise move it to the
         * background on macOS and Linux, and Playwright would see it exit early.
         */
        command: `npm run build && npm run preview -- --port ${port} --ignore-lock`,
        url: baseURL,
        /* Never reuse a running server: it may serve an old build. */
        reuseExistingServer: false,
        timeout: 120 * 1000, // 2 minutes to allow for build + seed
    },
});
