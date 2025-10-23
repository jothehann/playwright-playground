import { defineConfig, devices } from '@playwright/test';
require('dotenv').config();

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 1,
    workers: process.env.CI ? 1 : 5,
    reporter: [['json', { outputFile: 'test-results/results.json' }], ['junit', { outputFile: 'test-results/results.xml' }], ['allure-playwright']],
    use: {
        trace: 'on-first-retry',
        baseURL: 'https://conduit.bondaracademy.com/',
        browserName: 'chromium',
        channel: 'chrome',
        headless: false,
        viewport: { width: 1920, height: 1080 },
        storageState: 'auth/conduit-user.json',
        extraHTTPHeaders: {
            Authorization: `Token ${process.env.ACCESS_TOKEN}`,
        },
        video: {
            mode: 'retain-on-failure',
            size: { width: 1920, height: 1080 },
        },
    },
    globalSetup: require.resolve('./tests/conduit/utility/global.setup.ts'),
    globalTeardown: require.resolve('./tests/conduit/utility/global.teardown.ts'),

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'setup',
            testMatch: 'auth.setup.ts',
        },
        {
            name: 'articleSetup',
            testMatch: 'newArticle.setup.ts',
            dependencies: ['setup'],
            teardown: 'articleCleanUp',
        },
        {
            name: 'articleCleanUp',
            testMatch: 'articleCleanUp.setup.ts',
        },
        {
            name: 'regression',
            testIgnore: ['likesCounter.spec.ts', 'likesCounterGlobal.spec.ts'],
            dependencies: ['setup'],
        },
        {
            name: 'likeCounter',
            testMatch: 'likesCounter.spec.ts',
            dependencies: ['articleSetup'],
        },
        {
            name: 'likeCounterGlobal',
            testMatch: 'likesCounterGlobal.spec.ts',
        },
        {
            name: 'mobile',
            testMatch: 'testMobile.spec.ts',
            use: {
                ...devices['iPhone 15 Pro Max'],
            },
            dependencies: ['setup'],
        },
    ],
});
