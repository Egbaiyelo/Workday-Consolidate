
// might turn into an object

// null check evaluates and clicks

const puppeteer = require('puppeteer');
const fs = require('fs');
const jsdom = require('jsdom');
const path = require('path');
const accountpath = path.join(__dirname, "account.js");
const accountMod = require(accountpath);
const account = accountMod.getData();

// account format 
//- If there is an account with different email needing to be tracked Id have a new value to say that,
// - so now the contexts are subsidiary and there is one main context, where more can be added on
/**
 * {
 *     username:
 *     password:
 *     websites: obj*
 *     contexes: obj* -> { [username, pass, websites], ... }
 * }
 */



/**
 * @typedef {object} CompanyJobStatusObject
 * @property {object} active
 * @property {object} inactive
 */

/**
 * Calls the respective scrapper to scrape the relevant information from the main context
 * 
 * @returns {[]} An array of company job status objects from each site
 */
async function webScraper() {
    const browser = await puppeteer.launch({ headless: 'new', dumpio: true, args: ['--window-size=1400,900', '--disable-background-timer-throttling'] });

    //- parse contexes? - if there be any
    //- Needs rate limiting! 10 at a time?
    // for (const site of Object.values(account.websites)) {
    //     //- scraping '/userhome' because thats user home page data
    //     await scrapper(browser, site + "/userHome");
    // }
    console.log("starting", Object.keys(account.websites).length)

    const batchSize = 4;
    // Object.keys(account.websites).length
    for (let i = 0; i < 5; i += batchSize) {
        console.log("paral");
        const batch = Object.values(account.websites).slice(i, i + batchSize);
        console.log(batch)
        await Promise.all(batch.map(site => scrapper(browser, site + "/userHome")));
    }

    // Cleanup
    await browser.close();
    process.exit(0);
};

(async function () { await webScraper() })();


async function sayhello() {
    return {
        say: "say hello world",
        note: "hello"
    }
}


/**
 * 
 * @param {*} browser The browser object for the scrapping tool
 * @param {string} accountSite The account site to be scraped
 * @returns 
 */
async function scrapper(browser, accountSite) {

    console.log("Scraping", accountSite)

    if (!accountSite) { console.log("Nothing to scrape at:", accountSite); return };

    try {
        const page = await browser.newPage();
        await page.setViewport({
            width: 1400,
            height: 900
        });

        await page.setRequestInterception(true);
        page.on('request', (request) => {
            if (['image', 'font', 'media'].includes(request.resourceType())) {
                request.abort();
            } else {
                request.continue();
            }
        });

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
            await page.type('[data-automation-id="email"]', account.username, { delay: 50 });
            const butHTML = await emailBut.evaluate(el => el.outerHTML);
            // console.log("html", butHTML)

            // Enter Password
            const passBut = await page.waitForSelector('[data-automation-id="password"]');
            await page.type('[data-automation-id="password"]', account.password, { delay: 50 });
            const passHTML = await passBut.evaluate(el => el.outerHTML);
            // console.log("html", passHTML);

            const submitBut = await page.waitForSelector('[data-automation-id="signInSubmitButton"]');

            page.bringToFront();
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle0' }),
                submitBut.click()
            ]);

            // await submitBut.click()

            // await page.evaluate(() => {
            //     Object.defineProperty(document, 'hidden', { value: false });
            //     document.dispatchEvent(new Event('visibilitychange'));
            // });

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
        //- I guess only for smaller screens?
        // await page.click('[data-automation-id="applicationsSectionHeading-CHEVRON"]');

        // Just for debugging
        // const pageContent = await page.content();
        // fs.writeFileSync('page-snapshot.html', pageContent);
        // console.log("Snapshot saved to page-snapshot.html");

        const bodyText = await page.evaluate(() => document.body.innerText);
        // console.log("Body text after login:\n", bodyText);

        console.log("===========================\n\n\n\n===========================");

        const applications = await page.waitForSelector('[data-automation-id="applicationsSectionHeading"]');
        if (!applications) console.log("no applications")
        const applicationsHTML = await applications.evaluate(el => el.outerHTML);
        // console.log(applicationsHTML)
        const jsonofall = await readApplicationStatus(accountSite, applicationsHTML);
        console.log(jsonofall)

        // await new Promise(r => setTimeout(r, 30_000));

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

        // console.log("success");

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

        await page.close();
        console.log("success");
    }
    catch (error) {
        console.log("Got error => \n", error);
    }
};

/**
 * Testing Object
 */
// (async function () {

//     const browsertry = await puppeteer.launch({ headless: false, dumpio: true });
//     scrapper(browsertry, Object.values(account.websites)[3] + "/userHome");
// })();


function ensureSignIn(page) {

}


// Should maybe reverse the logic, check if signed in then sign in? check if applications then get applications

/**
 * Reads the HTML and scrapes it for job status information
 * @param {string} site The site url
 * @param {HTMLElement} containerHTML The HTML to be scraped notably the tasklistcontainer element
 * @returns {JSON} The scraped data
 */
async function readApplicationStatus(site, containerHTML) {


    // console.log("read application status\n==============================", containerHTML);
    // console.log("\n============================")
    // const parser = new DOMParser();
    // const doc = parser.parseFromString(containerHTML, 'text/html');
    const { JSDOM } = jsdom;
    const doc = new JSDOM(containerHTML);

    function getRows(panelId) {
        const panel = doc.window.document.querySelector(`${panelId}`);
        if (!panel) return [];

        const rows = [];
        panel.querySelectorAll('tr[data-automation-id="taskListRow"]').forEach(row => {

            //- Working this out, dont trust working with generated class names for getting data
            // const [jobTitle, jobReq, status, date, _] = [...row.children].map(item => item.textContent.trim());
            // const data = [jobTitle, jobReq, status, date];
            // console.log("here children", data);

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



module.exports = { sayhello, webScraper }
