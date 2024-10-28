const {By, until} = require('selenium-webdriver');

class Market {
    constructor(driver) {
        this.driver = driver;
        this.catalogMenu = By.xpath("//button[.//span[text()='Каталог']]");
        this.categoryMenu = By.xpath("//a/span[text()='Ноутбуки и компьютеры']");
        this.hddMenu = By.xpath("//a[text()='Внутренние жесткие диски']");
        this.sortOption = By.xpath("//div[.//h2[text()='Сортировка']]//button[text()='подешевле']");
        this.productCard = By.xpath("//div[@data-auto-themename='listDetailed' and .//button[@title='Добавить в избранное']]");
        this.productTitle = By.xpath(".//h3[@data-auto='snippet-title']");
        this.productPrice = By.xpath(".//span[@data-auto='snippet-price-current']//span[1]");
    }

    async open() {
        await this.driver.get("https://market.yandex.ru ");
        await this.driver.manage().addCookie({
            name: "spravka",
            value: ""
        });
        await this.driver.get("https://market.yandex.ru ");
        await this.driver.manage().window().maximize();
        await this.driver.wait(until.elementLocated(this.catalogMenu), 5000, 'Заголовок не появился');
    }

    async navigateToHDD() {
        await this.driver.wait(until.elementLocated(this.catalogMenu), 5000);
        const catalogMenu = await this.driver.findElement(this.catalogMenu);
        await catalogMenu.click();
        await this.driver.wait(until.elementLocated(this.categoryMenu), 5000);
        const categoryMenu = await this.driver.findElement(this.categoryMenu);
        await categoryMenu.click();
        await this.driver.wait(until.elementLocated(this.hddMenu), 5000);
        const hddMenu = await this.driver.findElement(this.hddMenu);
        await hddMenu.click();
    }

    async setSortByPrice() {
        await this.driver.wait(until.elementLocated(this.sortOption), 5000);
        const sortOption = await this.driver.findElement(this.sortOption);
        await sortOption.click();
    }

    async getFirstFiveProducts() {
        const products = await this.driver.findElements(this.productCard);
        const elements = [];
        let count = 0;
        for (let i = 0; i < products.length && count < 5; i++) {
            const productName = await products[i].findElement(this.productTitle).getText();
            const productPrice = await products[i].findElement(this.productPrice).getText();
            elements.push({ name: productName, price: productPrice });
            count++;
        }
        return elements;
    }

    async getFirstTenProducts() {
        const products = await this.driver.findElements(this.productCard);
        const elements = [];
        let count = 0;
        for (let i = 0; i < products.length && count < 10; i++) {
            const productName = await products[i].findElement(this.productTitle).getText();
            const productPrice = await products[i].findElement(this.productPrice).getText();
            elements.push({ name: productName, price: productPrice });
            count++;
        }
        return elements;
    }

    async isSorted(products) {
        for (let i = 1; i < products.length; i++) {
            if (Number(products[i - 1].price) > Number(products[i].price)) {
                return false;
            }
        }
        return true;
    }
}

module.exports = Market;