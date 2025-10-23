import { expect, request } from '@playwright/test';
import { test } from '../conduit/fixtures/test-options';

test('Likes counter increments', async ({ pageManager }) => {
    await pageManager.conduit.gotoHome();
    await pageManager.globalFeed.clickGlobalFeed();
    await expect(pageManager.globalFeed.firstArticlePreviewLocator()).toContainText('0');
    await pageManager.globalFeed.clickFirstArticlePreview();
    await expect(pageManager.globalFeed.firstArticlePreviewLocator()).toContainText('1');
});
