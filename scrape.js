const puppeteer = require('puppeteer');
const fs = require('fs');
const creds = require('./credentials');

const destSite = creds.website;

console.log("hello");

// test values
let values = {
    email: "testemail@gmail.com",
    password: "testPassword"
};

values = creds;

(async () => {
    let browser;
    try {

        browser = await puppeteer.launch({ headless: false, dumpio: true });
        const page = await browser.newPage();

        await page.goto(destSite, { waitUntil: 'networkidle0' });

        // Clisck Sign In
        // const signInButton = await page.waitForSelector('[data-automation-id="utilityButtonSignIn"]');
        // console.log("got ", signInButton);
        // const html = await signInButt    on.evaluate(el => el.outerHTML);
        // console.log("HTML of sign-in button:", html);
        // signInButton.click();
        // console.log("signinbut clicked");


        const emailBut = await page.waitForSelector('[data-automation-id="email"]');
        await page.type('[data-automation-id="email"]', values.email, {delay: 50}); 
        const butHTML = await emailBut.evaluate(el => el.outerHTML);
        // console.log("html", butHTML)


        const passBut = await page.waitForSelector('[data-automation-id="password"]');
        await page.type('[data-automation-id="password"]', values.password, {delay: 50}); 
        const passHTML = await passBut.evaluate(el => el.outerHTML);
        // console.log("html", passHTML);


        const submitBut = await page.waitForSelector('[data-automation-id="signInSubmitButton"]');
        // await Promise.all([
        //     page.waitForNavigation({ waitUntil: 'networkidle0' }),
        //     submitBut.click()
        // ]);
        submitBut.click();
        await new Promise(r => setTimeout(r, 3000))

        // submitBut.click();

        await page.evaluate(() => window.scrollBy(0, 500));
        await new Promise(r => setTimeout(r, 3000))


        const currentUrl = page.url();
        console.log("Current URL:", currentUrl);
        await page.click('[data-automation-id="applicationsSectionHeading-CHEVRON"]');

        if (currentUrl.includes("error") || currentUrl.includes("doesn't-exist")) {
            console.error("!!!!!!!!!!!!!!!!!!!!! Redirected to error page – login may have failed.");
        }


        // Just for debugginf
        const pageContent = await page.content(); 
        fs.writeFileSync('page-snapshot.html', pageContent);

        console.log("Snapshot saved to page-snapshot.html");
        
        const bodyText = await page.evaluate(() => document.body.innerText);
        console.log("Body text after login:\n", bodyText);

    
        // console.log(page.)
        // if this not here, failed
        const goHomeBut = await page.waitForSelector('[data-automation-id="navigationItem-Candidate Home"]');
        goHomeBut.click();
        console.log("went home");


        console.log("===========================\n\n\n\n===========================")


        const want = await page.waitForSelector('[data-automation-id="taskListContainer"]');
        const wantHTML = await want.evaluate(el => el.outerHTML);
        console.log("fetched", wantHTML);
    
        // await page.waitForSelector('[data-automation-id="password"]');
        console.log("success");

    }
    catch (error) {
        console.log("Got error", error);
        
    } finally {
        if (browser) await browser.close();
        process.exit(0);
    }
})();

