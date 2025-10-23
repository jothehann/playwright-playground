import { test as base } from '@playwright/test';
type MyFixtures = {
    helloWorld: string;
    greatDay: string;
};

type WorkerFixtures = {
    cupOfCoffee: string;
};

export const testFixture = base.extend<MyFixtures, WorkerFixtures>({
    helloWorld: async ({}, use) => {
        const myWorld = 'Before Hello World';
        await use(myWorld);
        console.log('After Hello World');
    },

    greatDay: async ({ helloWorld }, use) => {
        const myDay = helloWorld + ' and have a great day!';
        await use(myDay);
        console.log('Have a great night!');
    },

    cupOfCoffee: [
        async ({}, use, workerInfo) => {
            const cup = 'The cup of coffee No:  ' + workerInfo.workerIndex;
            await use(cup);
        },
        { scope: 'worker' },
    ],
});
