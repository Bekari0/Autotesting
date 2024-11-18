const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { writeFileSync } = require('fs');
const path = require('path'); 

const Elements = {
    MENU_BUTTON: By.className('hamburger'),
    STUDENT_SECTION: By.xpath('//a[@title="Обучающимся"]'),
    TIMETABLE_SECTION: By.xpath('//a[@title="Расписания"]'),
    TIMETABLE_WEBSITE: By.xpath('//a[@href="https://rasp.dmami.ru/"]'),
    SEARCH_BAR: By.className('groups'),
    GROUP_OPTION: By.id('221-322'),  
    DAY_CONTAINER: By.className('schedule-day'),
    DAY_TITLE: By.className('schedule-day__title'),
};

class SchedulePage {
    constructor() {
        this.url = 'https://mospolytech.ru/';
        let chromeOptions = new chrome.Options();
        chromeOptions.addArguments('--start-maximized', '--disable-gpu', '--no-sandbox');

        const chromeDriverPath = path.resolve(__dirname, '..', 'drivers', 'chromedriver.exe');
        this.browser = new Builder()
            .forBrowser('chrome')
            .setChromeOptions(chromeOptions)
            .setChromeService(new chrome.ServiceBuilder(chromeDriverPath))
            .build();
    }

    async locateElement(locator, timeout = 5000) {
        return await this.browser.wait(until.elementLocated(locator), timeout)
            .catch(() => {
                throw new Error(`Элемент не найден: ${locator}`);
            });
    }

    async locateElements(locator, timeout = 5000) {
        return await this.browser.wait(until.elementsLocated(locator), timeout)
            .catch(() => {
                throw new Error(`Элементы не найдены: ${locator}`);
            });
    }

    async launchSession() {
        await this.browser.get(this.url);
    }

    async closeSession() {
        await this.browser.quit();
    }

    async captureScreenshot(testCaseName) {
        const screenshot = await this.browser.takeScreenshot();
        const timestamp = new Date();
        const formattedTime = `${timestamp.toLocaleDateString('ru-RU')}_${timestamp.getHours()}_${timestamp.getMinutes()}_${timestamp.getSeconds()}`;
        const filename = `${testCaseName}_${formattedTime}.png`;
        writeFileSync(filename, screenshot, 'base64');
        console.error(`Скриншот сохранён как: ${filename}`);
    }

    async openMenu() {
        await (await this.locateElement(Elements.MENU_BUTTON)).click();
        await this.browser.sleep(1000);
        const studentLinks = await this.locateElements(Elements.STUDENT_SECTION);
        return studentLinks.length;
    }

    async goToTimetable() {
        const studentLink = (await this.locateElements(Elements.STUDENT_SECTION))[1];
        await this.browser.actions({ bridge: true }).move({ origin: studentLink }).perform();
        await this.browser.sleep(2000); 
        const timetableLink = (await this.locateElements(Elements.TIMETABLE_SECTION))[0];
        await timetableLink.click();
        await this.browser.sleep(2000);
        const timetablePage = (await this.locateElements(Elements.TIMETABLE_WEBSITE))[0];
        await timetablePage.click();
        await this.browser.wait(until.titleIs("Расписания"), 10000);
        return await this.browser.getTitle();
    }

    async searchSchedule() {
        const handles = await this.browser.getAllWindowHandles();
        await this.browser.switchTo().window(handles[1]);
        await (await this.locateElement(Elements.SEARCH_BAR)).sendKeys('221-322');  
        await (await this.locateElement(Elements.GROUP_OPTION)).click();
        await this.browser.sleep(1000);
    }

    async getScheduleForDay(day) {
    if (day === 'Sunday') {  // Пропускаем воскресенье, если это необходимо
        console.log("Sunday is skipped.");
        return null;
    }

    // Преобразуем день в локализованный формат
    const dayMapping = {
        "Sunday": "Воскресенье",
        "Monday": "Понедельник",
        "Tuesday": "Вторник",
        "Wednesday": "Среда",
        "Thursday": "Четверг",
        "Friday": "Пятница",
        "Saturday": "Суббота"
    };

    const localizedDay = dayMapping[day];
    console.log(`Localized day: ${localizedDay}`);

    // Улучшенный XPath
    const xpath = `//div[contains(@class, 'schedule-day') and .//div[contains(text(), '${localizedDay}')]]`;
    
    return await this.locateElement(By.xpath(xpath));
}

}

module.exports = SchedulePage;
