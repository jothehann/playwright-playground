import { Page, Locator } from '@playwright/test';

export class GlobalFeedPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async clickGlobalFeed() {
        await this.page.getByText('Global Feed').click();
    }

    firstArticleTitleLocator(): Locator {
        return this.page.locator('app-article-list h1').first();
    }

    firstArticleDescriptionLocator(): Locator {
        return this.page.locator('app-article-list p').first();
    }

    firstArticlePreviewLocator(): Locator {
        return this.page.locator('app-article-preview').first().locator('button');
    }

    async clickFirstArticlePreview() {
        await this.firstArticlePreviewLocator().click();
    }

    async openArticleByTitle(title: string) {
        await this.page.getByText(title).click();
    }
}
