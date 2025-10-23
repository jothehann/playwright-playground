import { test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    console.log('Hello World');
});

test('Where is my candy', async ({ page }) => {
    console.log('Where is my candy');
});

test('I am alive', async ({ page }) => {
    console.log('I am alive');
});
