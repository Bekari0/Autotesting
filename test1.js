const {assert} = require('chai');
const {describe, it, beforeEach, afterEach} = require('mocha');
const {Builder, Browser, By, until} = require('selenium-webdriver');
const Market = require('./Market');
const fs = require('fs');
const timers = require("node:timers");

describe('Markets Test Suite', function () {
    let driver;
    let marketPage;

    beforeEach(async function () {
        driver = await new Builder().forBrowser(Browser.FIREFOX).build();
        marketPage = new MarketPage(driver);
        await marketPage.open();
    });

    afterEach(async function () {
        if (this.currentTest.state === 'failed') {
            const timestamp = new Date()
            const testCaseName = 'get_hdd_top_5_lowest_price';

            const screenshotFilename = `${testCaseName}_${timestamp.toLocaleDateString("ru-RU")}_${timestamp.getHours()}_${timestamp.getMinutes()}_${timestamp.getSeconds()}.png`;

            const screenshot = await driver.takeScreenshot();
            fs.writeFileSync(screenshotFilename, screenshot, 'base64');

            console.error(`Тест упал по причине ошибки: ${this.currentTest.err.message}. Скриншот сохранен в файл: ${screenshotFilename}`);
        }
        await driver.quit();
    });

    it('get_hdd_top_5_lowest_price', async function () {
        await driver.get("https://market.yandex.ru");
        await marketPage.navigateToHDD();

        await driver.sleep(3000);
        const firstFiveProducts = await marketPage.getFirstFiveProducts();
        console.log("Первые пять товаров:");
        console.log(firstFiveProducts);

        await marketPage.setSortByPrice();
        await driver.sleep(3000);
        const firstFiveSortedProducts = await marketPage.getFirstTenProducts();
        console.log("Первые пять отсортированных товаров:");
        console.log(firstFiveSortedProducts)
        const flag = await marketPage.isSorted(firstFiveSortedProducts);
        console.log("Список отсортирован:", flag);
    });
});