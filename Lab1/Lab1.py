import time
from selenium import webdriver
from selenium.webdriver.common.by import By

BASE_URL = "https://lambdatest.github.io/sample-todo-app/"
EXPECTED_COUNT = "5 of 5 remaining"
TASK_TO_COMPLETE = "First Item"

browser = webdriver.Chrome(options=webdriver.ChromeOptions())
browser.get(BASE_URL)

current_count = browser.find_element(By.CLASS_NAME, "ng-binding").text
assert current_count == EXPECTED_COUNT, "Ошибка: неверное количество задач"

pending_tasks = [item.text for item in browser.find_elements(By.CLASS_NAME, "done-false")]

for index, task_name in enumerate(pending_tasks):
    if task_name == TASK_TO_COMPLETE:
        task_position = index + 1
        try:
            browser.find_element(By.NAME, f"li{task_position}").click()
            completed_tasks = [done_task.text for done_task in browser.find_elements(By.CLASS_NAME, "done-true")]
            assert TASK_TO_COMPLETE == completed_tasks[-1], "Ошибка: задача не завершена"
            print(completed_tasks[-1])
            TASK_TO_COMPLETE = pending_tasks[task_position]
        except Exception:
            time.sleep(1)
            new_task_input = browser.find_element(By.ID, "sampletodotext")
            new_task_input.send_keys("New element")
            time.sleep(1)
            browser.find_element(By.CLASS_NAME, "btn-primary").click()
            time.sleep(1)
            browser.find_element(By.NAME, f"li{task_position + 1}").click()
    time.sleep(1)

final_completed = [item.text for item in browser.find_elements(By.CLASS_NAME, "done-true")]
assert final_completed[-1] == "New element", "Ошибка: последняя задача не завершена"
