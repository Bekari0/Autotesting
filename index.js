const { Builder, By, until } = require('selenium-webdriver');

async function testTodoApp() {
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        // Шаг 1: Перейти по ссылке
        await driver.get('https://lambdatest.github.io/sample-todo-app/');

        // Проверка заголовка страницы
        let title = await driver.getTitle();
        if (title === 'Sample page - lambdatest.com') {
            console.log('Заголовок страницы корректен.');
        } else {
            console.log('Неверный заголовок страницы.');
        }

        // Шаг 2: Проверить, что присутствует текст “5 of 5 remaining”
        let remainingTextElement = await driver.findElement(By.xpath("//span[@class='ng-binding']"));
        let remainingText = await remainingTextElement.getText();
        if (remainingText === '5 of 5 remaining') {
            console.log('Текст "5 of 5 remaining" присутствует.');
        } else {
            console.log('Текст "5 of 5 remaining" отсутствует или неверен.');
        }

        // Шаги 3 и 4: Проверить, что первый элемент списка не зачеркнут и поставить галочку
        let firstItemCheckbox = await driver.findElement(By.name('li1'));
        let firstItemLabel = await driver.findElement(By.xpath("//li[1]/span"));

        let isCrossed = await firstItemLabel.getCssValue('text-decoration');
        if (!isCrossed.includes('line-through')) {
            console.log('Первый элемент не зачеркнут.');
        } else {
            console.log('Первый элемент уже зачеркнут.');
        }

        await firstItemCheckbox.click();

        isCrossed = await firstItemLabel.getCssValue('text-decoration');
        if (isCrossed.includes('line-through')) {
            console.log('Первый элемент теперь зачеркнут.');
        } else {
            console.log('Первый элемент не стал зачеркнутым.');
        }

        // Проверка уменьшения числа оставшихся элементов
        let updatedRemainingText = await remainingTextElement.getText();
        console.log(`Оставшихся элементов: ${updatedRemainingText}`);

        // Шаг 5: Повторить для остальных элементов
        for (let i = 2; i <= 5; i++) {
            let itemCheckbox = await driver.findElement(By.name(`li${i}`));
            let itemLabel = await driver.findElement(By.xpath(`//li[${i}]/span`));

            isCrossed = await itemLabel.getCssValue('text-decoration');
            if (!isCrossed.includes('line-through')) {
                console.log(`Элемент ${i} не зачеркнут.`);
            } else {
                console.log(`Элемент ${i} уже зачеркнут.`);
            }

            await itemCheckbox.click();

            isCrossed = await itemLabel.getCssValue('text-decoration');
            if (isCrossed.includes('line-through')) {
                console.log(`Элемент ${i} теперь зачеркнут.`);
            } else {
                console.log(`Элемент ${i} не стал зачеркнутым.`);
            }

            updatedRemainingText = await remainingTextElement.getText();
            console.log(`Оставшихся элементов: ${updatedRemainingText}`);
        }

        // Шаг 6: Добавить новый элемент списка
        let inputField = await driver.findElement(By.id('sampletodotext'));
        await inputField.sendKeys('Новый элемент');
        let addButton = await driver.findElement(By.id('addbutton'));
        await addButton.click();

        // Проверка добавления нового элемента
        let newItemLabel = await driver.findElement(By.xpath("//li[last()]/span"));
        let newItemText = await newItemLabel.getText();
        if (newItemText === 'Новый элемент') {
            console.log('Новый элемент добавлен и не зачеркнут.');
        } else {
            console.log('Новый элемент не добавлен.');
        }

        // Проверка увеличения общего числа и числа оставшихся элементов
        updatedRemainingText = await remainingTextElement.getText();
        console.log(`Оставшихся элементов после добавления: ${updatedRemainingText}`);

        // Шаг 7: Нажать на новый элемент списка
        let newItemCheckbox = await driver.findElement(By.xpath("//li[last()]/input"));
        await newItemCheckbox.click();

        // Проверка зачёркивания нового элемента
        isCrossed = await newItemLabel.getCssValue('text-decoration');
        if (isCrossed.includes('line-through')) {
            console.log('Новый элемент теперь зачеркнут.');
        } else {
            console.log('Новый элемент не стал зачеркнутым.');
        }

        updatedRemainingText = await remainingTextElement.getText();
        console.log(`Оставшихся элементов после зачёркивания нового элемента: ${updatedRemainingText}`);

    } catch (error) {
        console.error('Произошла ошибка:', error);
    } finally {
        // Закрытие браузера
        await driver.quit();
    }
}

testTodoApp();
