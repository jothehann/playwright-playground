import { test as base } from '@playwright/test';
import { PageManager } from '../pages/pageManager';

export type TestOptions = {
    pageManager: PageManager;
};

export const test = base.extend<TestOptions>({
    pageManager: async ({ page }, use) => {
        const manager = new PageManager(page);
        await use(manager);
    },
});
