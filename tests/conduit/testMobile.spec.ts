import { test } from '../conduit/fixtures/test-options';
import { expect } from '@playwright/test';
import tagsTestData from './test-data/tags.json';

test.beforeEach(async ({ page, pageManager }) => {
    await page.route('*/**/api/tags', async (route) => {
        await route.fulfill({
            body: JSON.stringify(tagsTestData),
        });
    });

    // Navigate to the base URL before each test
    await pageManager.conduit.gotoHome();
    await pageManager.conduit.dismissCookieIfVisible();
});

test('Verify Conduit Title - Mobile', async ({ page, pageManager }, testInfo) => {
    if (testInfo.retry) {
        // Simulate a flaky failure on retry for demonstration purposes
        // Usually to clean data or reset state when using this in real tests
        throw new Error('Simulated flaky failure on retry');
    }

    // const manager = new PageManager(page); replaced by fixture
    const conduit = pageManager.conduit;
    const globalFeed = pageManager.globalFeed;

    await page.route('*/**/articles*', async (route) => {
        try {
            const response = await route.fetch();
            const responseBody = await response.json();
            responseBody.articles[0].title = 'This is a MOCK test title';
            responseBody.articles[0].description = 'This is a MOCK test description';

            await route.fulfill({
                body: JSON.stringify(responseBody),
            });
        } catch (err) {
            // If the page/context was closed while the route callback was running, abort the route to avoid unhandled errors.
            try {
                await route.abort();
            } catch (e) {
                // ignore abort errors
            }
        }
    });

    await globalFeed.clickGlobalFeed();

    // Verify that the page title/brand is correct using the page object
    await expect(conduit.navbarBrandLocator()).toHaveText('conduit');

    await expect(globalFeed.firstArticleTitleLocator()).toContainText('This is a MOCK test title');
    await expect(globalFeed.firstArticleDescriptionLocator()).toContainText('This is a MOCK test description');
    await page.screenshot({ path: 'screenshots/conduit/conduit-homepage-full-page.png', fullPage: true });
    await page.locator('.sidebar').screenshot({ path: 'screenshots/conduit/conduit-homepage-tags.png' });
});
