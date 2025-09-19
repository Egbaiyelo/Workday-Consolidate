const puppeteer = require('puppeteer');
const fs = require('fs');
const jsdom = require('jsdom');
const account = require('./credentials');

// account format 
/**
 * {
 *      context: { // group of websites with same email and password, usually just one
 *          email:
 *          password:
 *          websites:
 *      }, ...
 * }
 */

const context = account.me;

async function webScraper(context) {
    const browser = await puppeteer.launch({ headless: false, dumpio: true });

    //- parse contexes?
    //- Needs rate limiting! 10 at a time?
    for (const site of context.websites) {
        await scrapper(browser, site);
    }

    // const batchSize = 10;
    // for (let i = 0; i < context.websites.length; i += batchSize) {
    //     const batch = context.websites.slice(i, i + batchSize);
    //     await Promise.all(batch.map(site => scrapper(browser, site)));
    // }

    // Cleanup
    await browser.close();
    process.exit(0);
};

async function sayhello() {
    return {
        say: "say hello world",
        note: "hello"
    }
}

module.exports = { sayhello, webScraper }


async function scrapper(browser, accountSite) {

    if (!accountSite) return;
    try {
        const page = await browser.newPage();

        await page.goto(accountSite, { waitUntil: 'networkidle0' });

        // Click Sign In - Dont think this will ever come up again
        // const signInButton = await page.waitForSelector('[data-automation-id="utilityButtonSignIn"]');
        // console.log("got ", signInButton);
        // const html = await signInButt    on.evaluate(el => el.outerHTML);
        // console.log("HTML of sign-in button:", html);
        // signInButton.click();
        // console.log("signinbut clicked");


        // Try SignIn
        try {
            const signInForm = await page.$('[data-automation-id="signInContent"]', { timeout: 3000 });

            // Enter Email
            const emailBut = await page.waitForSelector('[data-automation-id="email"]');
            await page.type('[data-automation-id="email"]', context.email, { delay: 50 });
            const butHTML = await emailBut.evaluate(el => el.outerHTML);
            // console.log("html", butHTML)

            // Enter Password
            const passBut = await page.waitForSelector('[data-automation-id="password"]');
            await page.type('[data-automation-id="password"]', context.password, { delay: 50 });
            const passHTML = await passBut.evaluate(el => el.outerHTML);
            // console.log("html", passHTML);

            const submitBut = await page.waitForSelector('[data-automation-id="signInSubmitButton"]');

            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle0' }),
                submitBut.click()
            ]);

            console.log("log in Success ______check");

        } catch (error) {
            // Checking if already logged in
            const navHome = await page.$('[data-automation-id="navigationItem-Candidate Home"]');

            if (navHome) console.log("Already Logged in?");
            else { console.log("Log in error"); console.log(error) };
        }

        // Little check
        const currentUrl = page.url();
        console.log("Current URL:", currentUrl);
        if (currentUrl.includes("error") || currentUrl.includes("doesn't-exist")) {
            console.error("! Redirected to error page – login may have failed.");
        }

        // Usually Home already
        const goHomeBut = await page.waitForSelector('[data-automation-id="navigationItem-Candidate Home"]');
        goHomeBut.click();
        // console.log("went home");

        // Expand applications Sections div
        await page.click('[data-automation-id="applicationsSectionHeading-CHEVRON"]');

        // Just for debugging
        // const pageContent = await page.content();
        // fs.writeFileSync('page-snapshot.html', pageContent);
        // console.log("Snapshot saved to page-snapshot.html");

        const bodyText = await page.evaluate(() => document.body.innerText);
        // console.log("Body text after login:\n", bodyText);

        console.log("===========================\n\n\n\n===========================");

        const applications = await page.$('[data-automation-id="applicationsSectionHeading"]');
        const applicationsHTML = await applications.evaluate(el => el.outerHTML);
        console.log(applicationsHTML)
        const jsonofall = readApplicationStatus(accountSite, applicationsHTML);
        console.log(jsonofall)

        await new Promise(r => setTimeout(r, 30_000));

        // Try get jobs
        // try {
        //     const taskList = await page.waitForSelector('[data-automation-id="taskListContainer"]');
        //     const taskListHTML = await taskList.evaluate(el => el.outerHTML);
        //     console.log("fetched", taskListHTML);
        // } catch (error) {
        //     const noApplications = page.$('[data-automation-id="noApplications"]');
        //     if (noApplications) console.log("no Applications found");
        //     else { console.log("Get Jobs error"); console.log(error) };
        // }

        console.log("success");

        //- Maybe try get css later
        // const computedStyles = await page.evaluate(() => {
        //     const el = document.querySelector('body');
        //     const styles = window.getComputedStyle(el);
        //     return Object.fromEntries([...styles].map(key => [key, styles.getPropertyValue(key)]));
        // });

        // console.log("Computed body styles:\n", computedStyles);

        // const cssLinks = await page.$$eval('link[rel="stylesheet"]', links =>
        //     links.map(link => link.href)
        // );

        // for (const url of cssLinks) {
        //     try {
        //         const cssResponse = await page.goto(url);
        //         const cssContent = await cssResponse.text();
        //         // 
        //         // console.log(`CSS from ${url}:\n`, cssContent);
        //         fs.writeFileSync('styles.css', cssContent);
        //     } catch (err) {
        //         console.warn(`Failed to fetch CSS from ${url}`, err);
        //     }
        // }

        console.log("success");
    }
    catch (error) {
        console.log("Got error => \n", error);
    }
};

// scrapper(account.test.websites[0]);


function ensureSignIn(page) {

}


// Should maybe reverse the logic, check if signed in then sign in? check if applications then get applications

// Reduce HTML to Json
function readApplicationStatus(site, containerHTML) {

    
    console.log("gor\n==============================",containerHTML);
    console.log("\n============================")
    // const parser = new DOMParser();
    // const doc = parser.parseFromString(containerHTML, 'text/html');
    const { JSDOM } = jsdom;
    const doc = new JSDOM(containerHTML);

    function getRows(panelId) {
        const panel = doc.window.document.querySelector(`${panelId}`);
        if (!panel) return []; 

        const rows = [];
        panel.querySelectorAll('tr[data-automation-id="taskListRow"]').forEach(row => {
            const jobTitle = row.querySelector('[data-automation-id="applicationTitle"]')?.textContent.trim();
            const jobReq = row.querySelector('.css-x4yhc3')?.textContent.trim();
            const status = row.querySelector('[data-automation-id="applicationStatus"]')?.textContent.trim();
            const date = row.querySelector('.css-62prxo')?.textContent.trim();

            rows.push({
                job_title: jobTitle,
                job_req: jobReq,
                application_status: status,
                date_submitted: date
            });
        });

        return rows;
    }

    // Quick logic to get site name
    const name = site.split('/')[2].split('.')[0];

    const result = {
        [name]: {
            // format is something like tabpanel-code-0 for active and ~-1 for inactive
            active: getRows('[id^="tabpanel"][id$="0"]'),
            inactive: getRows('[id^="tabpanel"][id$="1"]'),
        }
    };

    console.log(JSON.stringify(result, null, 2))
    return result;
    //- Maybe get tasks too???
}
