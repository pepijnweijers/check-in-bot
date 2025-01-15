import useEvaluationCheck from "~app/libs/useEvaluationCheck";
import { Storage } from "@plasmohq/storage";
import browser from 'webextension-polyfill';

const now = new Date();

const isWorkday = (date: Date): boolean => {
    const day = date.getDay();
    return day >= 1 && day <= 5; 
};

const getTimeToEleven = (): number => {
    let nextRun = new Date();
    nextRun.setHours(11, 0, 0, 0);

    while (!isWorkday(nextRun) || now >= nextRun) {
        nextRun.setDate(nextRun.getDate() + 1); 
        nextRun.setHours(11, 0, 0, 0);
    }

    while (nextRun.getHours() !== 11 || nextRun.getMinutes() !== 0 || nextRun.getSeconds() !== 0 || !isWorkday(nextRun)) {
        console.warn("Verification failed, retrying...");
        nextRun.setDate(nextRun.getDate() + 1);
        nextRun.setHours(11, 0, 0, 0);
    }

    const delay = nextRun.getTime() - now.getTime();

    return delay / 1000;
};

const scheduleTask = () => {
    if (now.getHours() >= 11 && now.getMinutes() >= 0 && isWorkday(now)) {
        console.log("It's past 11:00 AM, running task immediately.");
        runTask();
    }

    console.log(`Scheduled to run at: ${Date.now() + getTimeToEleven() * 1000}`);
    if (browser.alarms) {
        browser.alarms.create('taskAlarm', {
            when: Date.now() + getTimeToEleven() * 1000,
        });
    } else {
        console.error("browser.alarms is undefined. Check your permissions in manifest.json.");
    }
}

const OpenProject = async () => {
    const storage = new Storage();
    const fetchedProject = await storage.get("project");
    
    if (!fetchedProject) {
        console.error("No project found in storage.");
        return;
    }
    
    const evaluation = await useEvaluationCheck(Number(fetchedProject));

    if (!evaluation.checkedIn) {
        browser.tabs.create({ url: `https://student.themarkers.nl/hu:open-ict/projects/${fetchedProject}/create-evidence/14` });
    }
}

const runTask = async () => {
    const storage = new Storage();

    try {
        const fetchedProject = await storage.get("project");
        if (!fetchedProject) {
            console.error("No project found in storage.");
            return;
        }

        const evaluation = await useEvaluationCheck(Number(fetchedProject));

        console.log("CheckedIn status:", evaluation.checkedIn);

        if (!evaluation.checkedIn) {
            browser.notifications.create('open-link', {
                type: 'basic',
                iconUrl: '/assets/logo.png',
                title: 'Check-in Reminder',
                message: 'Click here to open your check-in.',
            }).then(() => {
                console.log('Notification created.');
            });
            
            browser.notifications.onClosed.addListener((notificationId) => {
                if (notificationId === 'open-link') {
                    OpenProject();
                }
            });
            browser.notifications.onClicked.addListener((notificationId) => {
                if (notificationId === 'open-link') {
                    OpenProject();
                }
            });
        }
    } catch (error) {
        console.error("Error during evaluation check:", error);
    }
};

const onAlarm = (alarm: browser.Alarms.Alarm) => {
    if (alarm.name === 'taskAlarm') {
        console.log("Running task due to alarm...");
        runTask();
        scheduleTask();
    }
};

browser.runtime.onStartup.addListener(() => {
    console.log("Browser started. Rescheduling task...");
    scheduleTask();
});

browser.runtime.onInstalled.addListener(() => {
    console.log("Extension installed or updated. Rescheduling task...");
    scheduleTask();
});
browser.idle.onStateChanged.addListener((state) => {
    if (state === "active") {
        console.log("System became active. Rescheduling task...");
        scheduleTask();
    }
});
scheduleTask();
browser.alarms.onAlarm.addListener(onAlarm);