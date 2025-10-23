import { test as setup, expect } from '@playwright/test';
import { ConduitPage } from '../pages/conduit.page';

setup('create new article', async ({ request }) => {
    const articleResponse = await ConduitPage.createArticleViaApi(
        request,
        {
            title: 'Likes test article',
            description: 'This is a new description',
            body: 'This is a test body',
            tagList: [],
        },
        process.env.ACCESS_TOKEN
    );

    expect(articleResponse.status()).toEqual(201);
    const response = await articleResponse.json();
    const slugId = response.article.slug;
    process.env['SLUG_ID'] = slugId;
});
