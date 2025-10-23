import { expect, request } from '@playwright/test';
import { ConduitPage } from '../pages/conduit.page';

export default async function globalTeardown() {
    const context = await request.newContext();
    const deleteArticleResponse = await ConduitPage.deleteArticleViaApi(context, String(process.env.SLUG_ID), process.env.ACCESS_TOKEN);
    expect(deleteArticleResponse.status()).toEqual(204);
}
