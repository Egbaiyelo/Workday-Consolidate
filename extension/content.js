
//


//-- 1. ADD SITE
// The first functionality is adding sites to the watch list, all sites with a workday domain
// can be tracked and viewed anytime.
//- Issue -> User might not have mad account on the site yet so I need to confirm that before trying to login
//  --- Also need to handle failed login
const siteURL = window.location.href;

// Adds site to the watch list
function addSite() {
    // Company name in format like 
    // bmo.wd3.myworkdayjobs
    const companyName = window.location.hostname.split('.')[0];
    // console.log('Company name', companyName);

    const segments = siteURL.split('/');
    const baseURL = segments.slice(0, 5).join('/');

    // Save to local
    // Redundant storage, given some may not have the app or maybe the app isnt working, it at least keeps them 
    // in local storage first
    //- maybe use sync instead
    chrome.storage.local.get("companySites", function (result) {
        const companySites = result.companySites || {};
        console.log("result, companysites", result, companySites);

        // Shouldn't have duplicates but just checking
        // If the company name exists but doesnt have the same data as the baseURL
        if (companySites[companyName] && companySites[companyName] != baseURL) {
            console.log("!duplicate");
            console.log(companySites[companyName])
        }
        companySites[companyName] = baseURL;

        chrome.storage.local.set({ companySites }, function () {
            console.log(`Saved ${companyName}: ${baseURL}`);
        });
    });

    // Example full format
    // "https://bmo.wd3.myworkdayjobs.com/en-US/External/userHome"
}

addSite();


//-- 2.LOGIN
//- Issue -> Cant decide if should wait for autofill and wait for user to click 
// -(can be messy with other autocompletes I think)
// - or put a button that does it all, probably put a button at the to let use sign in without the form (from the utility bar)
function siteStatus() {

    const observer = new MutationObserver(() => {

        // Mostly from sites like Linkedin that lead directly to the application
        // If user goes there themselves and wants to apply eventually, 
        // - it still pops up
        const signInForm = document.querySelector('[data-automation-id="signInContent"]');

        if (signInForm) {
            clearTimeout(timeoutId);

            const formType = document.getElementById('authViewTitle').textContent;
            if (formType == 'Sign In') {
                console.log('sign in')
                signIn("hellp", "word");
            } else if (formType == 'Create Account') {
                console.log('create account')
                createAccount("hellp", "word")
            } 
            //- Else put button in the utility bbar as said above

            // else {
            //     alert("Can't identify the form");
            // }

            observer.disconnect();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    const timeoutId = setTimeout(() => {
        //- What to do with this part?
        // console.warn("Timeout: Sign-in form not found.");
        observer.disconnect();
        // alert("Login/Register form did not appear.");
    }, 5000);
}
siteStatus();

// Autofills Sign In info
//! Assumes all needed elements are present 
function signIn(email, password) {
    const emailBox = document.querySelector('[data-automation-id="email"]');
    const passwordBox = document.querySelector('[data-automation-id="password"]');
    if (!emailBox || !passwordBox) { console.log("didnt finds"); return false };

    emailBox.value = email;
    emailBox.dispatchEvent(new Event('input', { bubbles: true }));
    passwordBox.value = password;
    passwordBox.dispatchEvent(new Event('input', { bubbles: true }));

    // await user sign in? or ask specifically ahead of time
    // sign in for now
    // const signInButton = document.querySelector("[data-automation-id='signInSubmitButton']");
    // signInButton.click();
}

// Autofills Account info
//! Assumes all needed elements are present
function createAccount(email, password) {
    const emailBox = document.querySelector('[data-automation-id="email"]');
    const passwordBox = document.querySelector('[data-automation-id="password"]');
    const verifyPasswordBox = document.querySelector('[data-automation-id="verifyPassword"]');
    if (!emailBox || !passwordBox) { console.log("didnt finds"); return false };

    emailBox.value = email;
    emailBox.dispatchEvent(new Event('input', { bubbles: true }));
    passwordBox.value = password;
    passwordBox.dispatchEvent(new Event('input', { bubbles: true }));
    verifyPasswordBox.value = password;
    verifyPasswordBox.dispatchEvent(new Event('input', { bubbles: true }));

    const createAccountCB = document.querySelector("[data-automation-id='createAccountCheckbox']");
    if (createAccountCB) createAccountCB.checked = true;

    // const createAccountButton = document.querySelector("[data-automation-id='createAccountSubmitButton']");
    // createAccountButton.click();
}


//-- Add Buttons
// button for home page
// Button for sign in / sign up



function uploadFile() {
    const dummyContent = "Experience:\n Service worker \n Engineer University ";
    const dummyFile = new File([dummyContent], "resume.txt", { type: "text/plain" });

    const observer = new MutationObserver(() => {
        const input = document.querySelector('[data-automation-id="file-upload-input-ref"]');

        if (input) {
            console.log("File input found!");

            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(dummyFile);

            input.files = dataTransfer.files;
            input.dispatchEvent(new Event('change', { bubbles: true }));

            observer.disconnect();
        }
    });

    observer.observe(document.body, {
        childList: true, 
        subtree: true
    })

}


uploadFile();

// Look for what to do, sign up, sign in
// function ensureAccount() {
//     const observer = new MutationObserver(() => {

//         // Ensure signed in? or signed up?
//         const utilityButtonBar = document.querySelector('[data-automation-id="utilityButtonBar"]');
//         const signInButton = document.querySelector('[data-automation-id="utilityButtonSignIn"]');


//     });
// }

// const observer = new MutationObserver(() => {

//     const utilityButtonBar = document.querySelector('[data-automation-id="utilityButtonBar"]');
//     const signInButton = document.querySelector('[data-automation-id="utilityButtonSignIn"]');


//     console.log(utilityButtonBar)
//     if (!utilityButtonBar) {
//         console.log("Failed to find");
//         return;
//     };

//     if (signInButton) {
//         console.log("signing in");
//         const signInResponse = SignIn(signInButton);
//     }

//     observer.disconnect();
// })

// observer.observe(document.body, { subtree: true, childList: true });


// function waitForElement(selector, timeout = 5000) {
//     return new Promise((resolve, reject) => {
//         const observer = new MutationObserver(() => {
//             const element = document.querySelector(selector);
//             if (element) {
//                 observer.disconnect();
//                 resolve(element);
//             }
//         });

//         observer.observe(document.body, { childList: true, subtree: true });

//         setTimeout(() => {
//             observer.disconnect();
//             reject(new Error('Element not found within timeout'));
//         }, timeout);
//     });
// }



// const creds = { email: "I am email", password: "I am password" };

// function SignIn(signInButton) {
//     console.log(signInButton);
//     if (!signInButton || signInButton.getAttribute('data-automation-id') !== "utilityButtonSignIn") {
//         console.log("Received falsy sign in button");
//         return false;
//     }

//     signInButton.click();


//     waitForElement('[data-automation-id="signInContent"]')
//         .then(signInContent => {
//             console.log("here!!!")
//             console.log("sign inc onten")
//             const emailBox = document.querySelector('[data-automation-id="email"]');
//             const passwordBox = document.querySelector('[data-automation-id="password"]');
//             if (!emailBox || !passwordBox) { console.log("didnt finds"); return false };

//             console.log(emailBox, passwordBox, "setting", creds)
//             emailBox.value = creds.email;
//             emailBox.dispatchEvent(new Event('input', { bubbles: true }));
//             passwordBox.value = creds.password;

//             passwordBox.dispatchEvent(new Event('input', { bubbles: true }));

//             return true;
//         })
//         .catch(error => {
//             console.log("Sign-in form not loaded:", error);
//             return false;
//         });


//     // // const closeButton = document.querySelector('[aria-label="close"]');
//     // awaitElement('[data-automation-id="signInContent"]');
//     // const signInContent = document.querySelector('[data-automation-id="signInContent"]');
//     // console.log(signInContent)
//     // if (!signInContent) { console.log("Received falsy form"); return false; }

//     // const emailBox = document.querySelector('[data-automation-id="email"]');
//     // emailBox.value = creds.email;

//     // const passwordBox = document.querySelector('[data-automation-id="password"]');
//     // passwordBox.value = creds.password;

//     // return true;
// }

// function awaitElement(selector) {
//     // really shouldnt take too much time

//     if (document.querySelector(selector)) { console.log("1"); console.log(document.querySelector(selector)); return };

//     const observer = new MutationObserver(() => {
//         //- check added node instead maybe
//         if (document.querySelector(selector)) { console.log("2"); console.log(document.querySelector(selector)); return };

//     })
//     observer.observe(document.body, { subtree: true, childList: true })
//     //- maybe return the elemnt and set timeout if it never appeared
//     console.log("reached")
// }

// function AddLinkToConsolidate(utilityButtonBar) {
//     const { targetButtonDiv, barDivider } = AddLinkToConsolidate();

//     if (utilityButtonBar) {
//         console.log("inserting utility button bar")
//         console.log({ "utilitybutonbar I got": utilityButtonBar })
//         utilityButtonBar.insertBefore(barDivider, null);
//         utilityButtonBar.insertBefore(targetButtonDiv, null);
//         utilityButtonBar.insertBefore(barDivider, null);
//     }
// }


// function createConsolidateLink() {

//     // Icon and name
//     const targetIcon = document.createElement('span');
//     targetIcon.className = "css-53a7ht";

//     const targetText = document.createElement('span');
//     targetText.textContent = "Target";
//     targetText.className = "css-1xtbc5b";


//     // Button
//     const targetButton = document.createElement('button');
//     targetButton.setAttribute('aria-expanded', 'false');
//     targetButton.setAttribute('aria-haspopup', 'listbox');
//     targetButton.setAttribute('color', '#FFFFFF');
//     targetButton.setAttribute('data-automation-id', 'UtilityMenuButton');
//     targetButton.className = "css-myllji";
//     targetButton.append(targetIcon);
//     targetButton.append(targetText);


//     //
//     const barDivider = document.createElement('div');
//     barDivider.setAttribute('data-automation-id', 'utility-button-bar-divider');
//     barDivider.setAttribute('color', '#FFFFFF');
//     barDivider.className = 'css-1c0okss';

//     const targetButtonDiv = document.createElement('div');
//     targetButtonDiv.setAttribute('data-automation-id', 'utilityButtonTarget');
//     targetButtonDiv.className = "css-wjaruy";
//     // targetButtonDiv.className = 'css-1c0okss';
//     targetButtonDiv.append(targetButton);

//     // console.log({ targetButtonDiv: targetButtonDiv })

//     return { targetButtonDiv, barDivider }
// }



// // const observer = new MutationObserver((mutations) => {
// //     for (const mutation of mutations) {
// //         console.log("Here")
// //         for (const node of mutation.addedNodes) {
// //             console.log("there")
// //             console.log("node", node)
// //             if (node.nodeType === 1 && node.matches('[data-automation-id="utilityButtonBar"]')) {
// //                 console.log("level 1")
// //                 observer.disconnect();
// //                 console.log("level 2")


// //                 node.append(barDivider);
// //                 node.append(targetButtonDiv);
// //                 console.log({ added: node })


// //                 return;
// //             }
// //         }
// //     }
// // });

// // observer.observe(document.body, { childList: true, subtree: true });





// Form data

/**experience
 * 
 * Job title
 * company
 * 
 * Currently work here
 * 
 * From
 * To
 * Role Description
 * 
 */

/**Education
 * 
 * School or Uni
 * 
 * Degree
 * Field of Study
 * Overall Result
 * 
 * From 
 * To
 */

/**Language
 * 
 * Language
 * I am flient
 * Reading
 * Speaking
 * Writing
 * Listening
 * Overall
 */

/**Skills
 * *
 */

/**Social Networks
 * 
 * LinkeDin
 * Github
 */

/**Other
 * race
 * gender
 * sexuality
 */

