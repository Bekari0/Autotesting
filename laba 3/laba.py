import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import re

# Функция для очистки строки с ценой от ненужных символов
def clean_price(price_str):
    # Удаляем все символы, кроме цифр и символа "₽"
    cleaned_price = re.sub(r'[^\d]', '', price_str)  # Убираем все, что не цифры
    return cleaned_price

@pytest.fixture
def setup_browser():
    browser = webdriver.Chrome()
    yield browser
    browser.quit()

def test_price_sorting_verification(setup_browser):
    driver = setup_browser
    explicit_wait = WebDriverWait(driver, 20)
    driver.get("https://market.yandex.ru")

    # Кликаем по кнопке каталога
    catalog = explicit_wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button._30-fz.button-focus-ring")))
    catalog.click()

    # Наводим мышь на раздел "Ноутбуки и компьютеры"
    laptops_and_pcs = explicit_wait.until(EC.presence_of_element_located((By.XPATH, "//span[text()='Ноутбуки и компьютеры']")))
    ActionChains(driver).move_to_element(laptops_and_pcs).perform()

    # Выбираем внутренние жесткие диски
    hdd_category = explicit_wait.until(EC.element_to_be_clickable((By.XPATH, "//a[contains(@href, '/catalog--vnutrennie-zhestkie-diski')]")))
    hdd_category.click()

    # Дожидаемся отображения списка товаров
    explicit_wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "div[data-apiary-widget-name='@light/Organic']")))

    # Извлекаем первые 5 товаров перед сортировкой
    initial_items = driver.find_elements(By.CSS_SELECTOR, "div[data-apiary-widget-name='@light/Organic']")[:5]
    print("Список первых 5 товаров до сортировки:")
    prices_before = []
    for item in initial_items:
        try:
            product_name = item.find_element(By.CSS_SELECTOR, "a[data-auto='snippet-link']").text
            product_price = item.find_element(By.CSS_SELECTOR, "span[data-auto='snippet-price-current']").text
            print(f"Товар: {product_name}, Стоимость: {product_price}")

            # Чистим цену перед преобразованием
            cleaned_price = clean_price(product_price)
            prices_before.append(int(cleaned_price))

        except Exception as error:
            print(f"Ошибка извлечения данных: {error}")

    # Активируем сортировку по цене
    price_sort_btn = explicit_wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[data-autotest-id='aprice']")))
    price_sort_btn.click()

    # Дожидаемся обновления списка товаров после сортировки
    print("Ожидаем завершение сортировки...")
    explicit_wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "div[data-apiary-widget-name='@light/Organic']")))
    
    # Даем больше времени для динамической подгрузки товаров
    WebDriverWait(driver, 30).until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "div[data-apiary-widget-name='@light/Organic']")))

    # Извлекаем первые 10 товаров после сортировки
    sorted_items = driver.find_elements(By.CSS_SELECTOR, "div[data-apiary-widget-name='@light/Organic']")[:10]
    print("\nПервые 10 товаров после сортировки:")
    sorted_prices = []
    for item in sorted_items:
        try:
            product_name = item.find_element(By.CSS_SELECTOR, "a[data-auto='snippet-link']").text
            product_price = item.find_element(By.CSS_SELECTOR, "span[data-auto='snippet-price-current']").text
            print(f"Товар: {product_name}, Стоимость: {product_price}")

            # Чистим цену перед преобразованием
            cleaned_price = clean_price(product_price)
            sorted_prices.append(int(cleaned_price))

        except Exception as error:
            print(f"Ошибка извлечения данных: {error}")

    # Убедимся, что сортировка корректна
    assert len(sorted_prices) >= 10, "Недостаточно товаров для проверки сортировки!"

    # Печатаем для диагностики, какие цены до и после сортировки
    print("Цены после сортировки:", sorted_prices)

    # Проверим, что список цен отсортирован по возрастанию
    assert sorted_prices == sorted(sorted_prices), "Цены не отсортированы по возрастанию!"
