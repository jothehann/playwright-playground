import { Page, Locator } from '@playwright/test';

export class ArticlePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    articleTitleLocator(): Locator {
        return this.page.locator('.article-page h1');
    }

    async goHome() {
        await this.page.getByText('Home').click();
    }
}
