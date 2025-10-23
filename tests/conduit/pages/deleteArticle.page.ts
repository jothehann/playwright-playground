import { Page, Locator } from '@playwright/test';

export class DeleteArticlePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    deleteArticleButton(): Locator {
        return this.page.getByRole('button', { name: 'Delete Article' }).first();
    }

    async deleteCurrentArticle() {
        await this.deleteArticleButton().click();
    }
}
