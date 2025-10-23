import { test as setup, expect } from '@playwright/test';
import { ConduitPage } from '../pages/conduit.page';

setup('delete article', async ({ request }) => {
    const deleteArticleResponse = await ConduitPage.deleteArticleViaApi(request, String(process.env.SLUG_ID), process.env.ACCESS_TOKEN);
    expect(deleteArticleResponse.status()).toEqual(204);
});
