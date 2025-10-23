import { Page, APIRequestContext } from '@playwright/test';
import { GlobalFeedPage } from './globalFeed.page';
import { ArticlePage } from './article.page';
import { DeleteArticlePage } from './deleteArticle.page';
import { ApiHelper } from '../../helper/api.helper';

export class ConduitPage {
    readonly page: Page;
    readonly globalFeed: GlobalFeedPage;
    readonly article: ArticlePage;
    readonly deleteArticle: DeleteArticlePage;

    constructor(page: Page) {
        this.page = page;
        this.globalFeed = new GlobalFeedPage(page);
        this.article = new ArticlePage(page);
        this.deleteArticle = new DeleteArticlePage(page);
    }

    // Navigation
    async gotoHome() {
        await this.page.goto('/');
    }

    // Cookie/banner helper (site may not have it but keep safe)
    async dismissCookieIfVisible() {
        const continueBtn = this.page.getByRole('button', { name: /continue/i });
        if ((await continueBtn.count()) > 0) {
            try {
                await continueBtn.click();
            } catch (e) {
                // ignore
            }
        }
    }

    async clickNewArticle() {
        await this.page.getByText('New Article').click();
    }

    // Header / site brand
    navbarBrandLocator() {
        return this.page.locator('.navbar-brand');
    }

    // Article form interactions
    titleInput() {
        return this.page.getByRole('textbox', { name: 'Article Title' });
    }

    aboutInput() {
        return this.page.getByRole('textbox', { name: /What's this article about\?/i });
    }

    bodyInput() {
        return this.page.getByRole('textbox', { name: /Write your article/i });
    }

    async fillArticleForm({ title, about, body }: { title: string; about: string; body: string }) {
        await this.titleInput().fill(title);
        await this.aboutInput().fill(about);
        await this.bodyInput().fill(body);
    }

    publishButton() {
        return this.page.getByRole('button', { name: 'Publish Article' });
    }

    async publishAndWaitForPost() {
        const [response] = await Promise.all([
            this.page.waitForResponse((r) => r.url().includes('/api/articles') && r.request().method() === 'POST'),
            this.publishButton().click(),
        ]);
        return response;
    }

    // API helpers for creating/deleting via REST when request context is available
    static async createArticleViaApi(
        request: APIRequestContext,
        article: { title: string; description: string; body: string; tagList?: string[] },
        token?: string
    ) {
        const path = '/articles/';
        const body = { article: { title: article.title, description: article.description, body: article.body, tagList: article.tagList || [] } };
        if (token) {
            return ApiHelper.httpAuthPost(request, path, body, token);
        }
        return ApiHelper.httpPost(request, path, body);
    }

    static async deleteArticleViaApi(request: APIRequestContext, slug: string, token?: string) {
        const path = `/articles/${slug}`;
        if (token) return ApiHelper.httpAuthDelete(request, path, token);
        return ApiHelper.httpDelete(request, path);
    }
}
