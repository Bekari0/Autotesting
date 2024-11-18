from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
import unittest
import time

class PageBase:
    def __init__(self):
        self.URL = "https://lambdatest.github.io/sample-todo-app/"
        options = webdriver.EdgeOptions()
        options.add_argument("--start-maximized")
        self.driver = webdriver.Edge(options=options)

    def find_element(self, locator, time=15):
        return WebDriverWait(self.driver, time).until(
            EC.presence_of_element_located(locator),
            message=f"Can't find element by locator {locator}"
        )

    def find_elements(self, locator, time=15):
        return WebDriverWait(self.driver, time).until(
            EC.presence_of_all_elements_located(locator),
            message=f"Can't find elements by locator {locator}"
        )

    def start_session(self):
        self.driver.get(self.URL)

    def stop_session(self):
        self.driver.quit()

class LocatorDefinitions:
    START_TEXT = (By.CLASS_NAME, "ng-binding")
    UNCLICKED_ELEMS = (By.CLASS_NAME, "done-false")
    CLICKED_ELEMS = (By.CLASS_NAME, "done-true")
    BTN = (By.CLASS_NAME, "btn-primary")
    INPUT = (By.ID, "sampletodotext")
    NEW_EL = "NEW_ELEMENT"

class TodoPage(PageBase):
    def cheking_start_text(self):
        txt = self.find_element(LocatorDefinitions.START_TEXT).text
        return txt

    def take_first_elem(self):
        return list(map(lambda x: x.text, self.find_elements(LocatorDefinitions.UNCLICKED_ELEMS)))[0]

    def action_click_elements(self):
        elements = list(map(lambda x: x.text, self.find_elements(LocatorDefinitions.UNCLICKED_ELEMS)))
        for i in range(len(elements)):
            position = i + 1
            self.find_element((By.NAME, f"li{position}")).click()
            last_el = list(map(lambda x: x.text, self.find_elements(LocatorDefinitions.CLICKED_ELEMS)))[-1]
            time.sleep(1)

        self.find_element(LocatorDefinitions.INPUT).send_keys(LocatorDefinitions.NEW_EL)
        time.sleep(1)
        self.find_element(LocatorDefinitions.BTN).click()
        time.sleep(1)
        self.find_element((By.NAME, f"li{position + 1}")).click()
        time.sleep(1)
        return last_el

    def check_action_click_element(self):
        last_el = list(map(lambda x: x.text, self.find_elements(LocatorDefinitions.CLICKED_ELEMS)))[-1]
        return last_el

    def check_count(self):
        return len(list(map(lambda x: x.text, self.find_elements(LocatorDefinitions.CLICKED_ELEMS))))

class TodoAppTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pg = TodoPage()
        cls.pg.start_session()

    @classmethod
    def tearDownClass(cls):
        cls.pg.stop_session()

    def test_1(self):
        res = self.pg.cheking_start_text()
        self.assertEqual(res, "5 of 5 remaining")

    def test_2(self):
        res = self.pg.take_first_elem()
        self.assertEqual(res, "First Item")

    def test_3(self):
        res = self.pg.action_click_elements()
        self.assertEqual(res, "Fifth Item")

    def test_4(self):
        res = self.pg.check_action_click_element()
        self.assertEqual(res, LocatorDefinitions.NEW_EL)

    def test_5(self):
        res = self.pg.check_count()
        self.assertEqual(res, 6)

if __name__ == '__main__':
    unittest.main(warnings='ignore')
