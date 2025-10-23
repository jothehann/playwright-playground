import { Page, APIRequestContext } from '@playwright/test';
import { ConduitPage } from './conduit.page';
import { GlobalFeedPage } from './globalFeed.page';
import { ArticlePage } from './article.page';
import { DeleteArticlePage } from './deleteArticle.page';

// PageManager centralizes creation and quick access to commonly used page objects.
export class PageManager {
    readonly page: Page;
    readonly conduit: ConduitPage;
    readonly globalFeed: GlobalFeedPage;
    readonly article: ArticlePage;
    readonly deleteArticle: DeleteArticlePage;

    constructor(page: Page) {
        this.page = page;
        this.conduit = new ConduitPage(page);

        // provide direct properties for ease of use in tests
        // assign concrete instances from conduit (reuse created instances)
        this.globalFeed = this.conduit.globalFeed;
        this.article = this.conduit.article;
        this.deleteArticle = this.conduit.deleteArticle;
    }

    // re-export API helpers from ConduitPage for convenience
    static createArticleViaApi(request: APIRequestContext, article: { title: string; description: string; body: string; tagList?: string[] }, token?: string) {
        return ConduitPage.createArticleViaApi(request, article, token);
    }

    static deleteArticleViaApi(request: APIRequestContext, slug: string, token?: string) {
        return ConduitPage.deleteArticleViaApi(request, slug, token);
    }
}
