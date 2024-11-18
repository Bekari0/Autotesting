const { describe, it, before, after, afterEach } = require("mocha");
const assert = require("assert");
const SchedulePage = require("../pages/SchedulePage");

describe("SchedulePage Test Cases", function () {
    let schedulePage;
    this.timeout(120000);

    before(async () => {
        schedulePage = new SchedulePage();
        try {
            await schedulePage.launchSession();
        } catch (error) {
            console.error("Failed to initialize browser session:", error);
        }
    });

    after(async () => {
        try {
            await schedulePage.closeSession();
        } catch (error) {
            console.error("Error during session termination:", error);
        }
    });

    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            await schedulePage.captureScreenshot(this.currentTest.title);
        }
    });

    it("should validate menu functionality and student link count", async () => {
        const numberOfLinks = await schedulePage.openMenu();
        assert.equal(numberOfLinks, 3, "Unexpected number of student links.");
    });

    it("should navigate to the timetable and check its title", async () => {
        const title = await schedulePage.goToTimetable();
        assert.strictEqual(title, "Расписания", "Timetable page title mismatch.");
    });

    it("should perform a search for the schedule of a specific group", async () => {
        await schedulePage.searchSchedule();
    });

    it("should confirm today's schedule is highlighted", async () => {
        const weekdays = [
            "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
        ];
        const todayIndex = new Date().getDay();
        const todayName = weekdays[todayIndex];

        console.log(`Current day: ${todayName}`);

        const scheduleElement = await schedulePage.getScheduleForDay(todayName);
        const classList = await scheduleElement.getAttribute("class");
        assert(classList.includes("schedule-day_today"), "Current day is not marked in the schedule.");
    });
});
