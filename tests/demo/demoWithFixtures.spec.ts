import { testFixture } from '../demo/fixtures/demo.fixture';

testFixture('Where is my candy', async ({ helloWorld, cupOfCoffee }) => {
    console.log(helloWorld);
    console.log('Where is my candy');
    console.log(cupOfCoffee);
});

testFixture('I am alive', async ({ greatDay, cupOfCoffee }) => {
    console.log(greatDay);
    console.log('I am alive');
    console.log(cupOfCoffee);
});
