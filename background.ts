import useEvaluationCheck from "~app/libs/useEvaluationCheck";
import { Storage } from "@plasmohq/storage";

const isWorkday = (date: Date): boolean => {
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday
    return day >= 1 && day <= 5; // Workdays are Monday (1) through Friday (5)
};

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
            // Open a new tab to the desired URL
            chrome.tabs.create({ url: `https://student.themarkers.nl/hu:open-ict/projects/${fetchedProject}/create-evidence/14` });
        }
    } catch (error) {
        console.error("Error during evaluation check:", error);
    }
};

const scheduleTask = () => {
    const now = new Date();
    const nextRun = new Date();

    nextRun.setHours(11, 0, 0, 0);

    while (!isWorkday(nextRun) || now >= nextRun) {
        nextRun.setDate(nextRun.getDate() + 1); 
        nextRun.setHours(11, 0, 0, 0);
    }

    const delay = nextRun.getTime() - now.getTime();

    console.log(`Scheduled to run at: ${nextRun.toLocaleString()}`);

    setTimeout(() => {
        console.log("Loading...");
        runTask(); 
        scheduleTask();
    }, delay);
};

const checkImmediateRun = () => {
    const now = new Date();
    if (now.getHours() >= 11 && now.getMinutes() >= 0) {
        console.log("It's past 11:00 AM, running task immediately.");
        runTask();
    }
};

const load = () => {
    if (isWorkday(new Date())) {
        checkImmediateRun();
    }
    scheduleTask(); 
};

load();