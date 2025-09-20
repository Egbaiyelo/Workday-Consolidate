
// Add site
// Login
// 
// 


//-- 1. ADD SITE

// The first functionality is adding sites to the watch list, all sites with a workday domain
// can be tracked and viewed anytime.
//- Issue -> User might not have made account on the site yet so I need to confirm that before trying to login
//  --- Also need to handle failed login
//  --- Maybe check if user ever signed in?
const siteURL = window.location.href;

// Adds site to the watch list
function addSite() {
    // Company name in format like 
    // bmo.wd3.myworkdayjobs
    const companyName = window.location.hostname.split('.')[0];

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
// - or put a button that does it all, probably put a button at the top to let use sign in without the form (from the utility bar)
function siteStatus() {

    const observer = new MutationObserver(() => {

        // Mostly from sites like Linkedin that lead directly to the application
        // If user goes there themselves and wants to apply eventually, it still pops up
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


//-- 3.Add MyWorkday Button

// button for home page
// Button for sign in / sign up

// Issue -> Might move buttons somewhere else, login/register button and then the home button

// Adds link to home page
//! Expects utilitybuttonbar to be present
function AddLinkToHome(utilityButtonBar, targetColor) {
    const { targetButtonDiv, barDivider } = createHomeLink(targetColor);
    console.log(targetButtonDiv, barDivider)
    console.log('then', utilityButtonBar)

    //- Probably use mutation observer somehow to make sure its the last element
    if (utilityButtonBar) {
        console.log("inserting utility button bar")
        console.log({ "utilitybuttonbar I got": utilityButtonBar })
        utilityButtonBar.insertBefore(barDivider, null);
        utilityButtonBar.insertBefore(targetButtonDiv, null);
    }
}

const generalObserver = new MutationObserver(() => {

    const utilButtonBar = document.querySelector("[data-automation-id='utilityButtonBar']");
    const signInFormo = document.querySelector("[data-automation-id='signInFormo']");

    if (utilButtonBar) {

        // Given the way the page routes, better to keep checking and ensure adding the link
        const itemPresent = document.querySelector('#myWorkday-button-div');
        if (!itemPresent) {
            // Getting the base text color for blending in
            const utilButton = utilButtonBar.querySelector('button');
            const utilColor = getComputedStyle(utilButton).color;
            console.log("util button", utilButton, utilColor);
            console.log("util button color", utilColor);

            //- Probably check for my element instead and add it if not there based on Status
            AddLinkToHome(utilButtonBar, utilColor);
            // generalObserver.disconnect();
        }
    }

    if (signInFormo) {

        //- New flow -> user clicks sign in and can then register or login with myWorkday
        //- maybe offer to register if not and if user logs in maybe save pass info
        const formType = document.getElementById('authViewTitle').textContent;
        if (formType == 'Sign In') {
            //- onclick signin and then click button
            // signIn("hellp", "word");

            const signInHelper = document.querySelector('#myWorkday-signIn-helper');
            if (!signInHelper) {
                const element = createAccountHelper('Sign in with MyWorkday', () => {});
                element.id = 'myWorkday-signIn-helper';
                console.log('elemento', element);
                signInFormo.appendChild(element);
            }
            

        } else if (formType == 'Create Account') {
            // createAccount("hellp", "word");

            const registerHelper = document.querySelector('#myWorkday-register-helper');
            if (!registerHelper) {
                const element = createAccountHelper('Register with MyWorkday',() => {});
                element.id = 'myWorkday-register-helper';
                signInFormo.appendChild(element);
            }

        }

    }
});

//- maybe observe the button bar instead?
generalObserver.observe(document.body, {
    childList: true,
    subtree: true
});

//- probably move this above the other method for easy read
//- Need to add to hamburger menu too in case it gets squashed or on mobile

// returns bardivider and button element
function createHomeLink(targetColor = 'white') {

    // Icon div and style
    const targetIcon = document.createElement('span');
    // Fetching account icon
    fetch(chrome.runtime.getURL('icons/account-folder.svg'))
        .then(res => res.text())
        .then(svgContent => {
            Object.assign(targetIcon.style, {
                display: 'inline-block',
                margin: '0 3px',
                opacity: '0.5',
                color: targetColor,
                width: 20,
                height: 20,
                alt: 'Account icon'
            });

            targetIcon.innerHTML = svgContent;

            // Overiding size
            const svg = targetIcon.querySelector('svg');
            console.log('&&&svg', targetIcon)
            if (svg) {
                svg.setAttribute('width', '20');
                svg.setAttribute('height', '20');
            }
        });

    // Button text and style
    const targetText = document.createElement('span');
    targetText.textContent = "MyWorkday";
    Object.assign(targetText.style, {
        color: targetColor,
        fontSize: '12px',
        fontWeight: '500',
        lineHeight: '14px',
        margin: '0px 3px',
        opacity: '1',
        textDecorationSkipInk: 'none'
    })


    // Button
    const targetButton = document.createElement('button');
    targetButton.setAttribute('aria-expanded', 'false');
    targetButton.setAttribute('aria-haspopup', 'listbox');
    targetButton.setAttribute('color', '#FFFFFF');
    targetButton.setAttribute('data-automation-id', 'UtilityMenuButton');
    Object.assign(targetButton.style, {
        WebkitBoxAlign: 'center',
        alignItems: 'center',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'inline-flex',
        height: '21px',
        margin: '0px 9px',
        padding: '0px',
        whiteSpace: 'nowrap',
        textDecorationSkipInk: 'none',
        color: 'rgb(255, 255, 255)',
    })
    targetButton.append(targetIcon);
    targetButton.append(targetText);
    targetButton.onclick = () => {
        const homeURL = chrome.runtime.getURL('pages/myWorkday-home.html');
        window.open(homeURL);
    };


    // Bardivider and style
    const barDivider = document.createElement('div');
    barDivider.setAttribute('data-automation-id', 'utility-button-bar-divider');
    barDivider.setAttribute('color', '#FFFFFF');
    // barDivider.setAttribute('color', targetColor);
    Object.assign(barDivider.style, {
        backgroundColor: targetColor,
        height: ' 12px',
        margin: ' 0px',
        opacity: ' 0.5',
        width: ' 1px'
    })


    const targetButtonDiv = document.createElement('div');
    targetButtonDiv.setAttribute('data-automation-id', 'utilityButtonTarget');
    targetButtonDiv.style.height = '21px';
    targetButtonDiv.append(targetButton);
    targetButtonDiv.id = "myWorkday-button-div";
    Object.assign(targetButtonDiv.style, {
        //- for style update
        //- also add hover thingy for style update
        // border: `1px solid ${targetColor}`,
        // borderRadius: '2px',
        // padding: '2px',
        height: '21px'
    })

    return { targetButtonDiv, barDivider }
}

//- add button and link later
function createAccountHelper(helperText, onClickHandler) {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.marginTop = '20px';

    // OR Separator
    const separator = document.createElement('div');
    separator.style.display = 'flex';
    separator.style.alignItems = 'center';
    separator.style.textAlign = 'center';
    separator.style.color = '#999';
    separator.style.fontSize = '12px';
    separator.style.margin = '20px 0';
    separator.style.width = '100%';
    separator.innerHTML = `
        <span style="flex: 1; border-bottom: 1px solid #ccc; margin-right: 10px;"></span>
        <span>OR</span>
        <span style="flex: 1; border-bottom: 1px solid #ccc; margin-left: 10px;"></span>
    `;

    // MyWorkday Sign In Button
    const button = document.createElement('button');
    button.textContent = helperText;
    button.style.padding = '10px 16px';
    button.style.border = '1px solid #ccc';
    button.style.borderRadius = '4px';
    button.style.backgroundColor = '#f7f7f7';
    button.style.cursor = 'pointer';
    button.style.fontWeight = 'bold';
    button.style.color = '#333';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.gap = '8px';

    // icon
    // const icon = document.createElement('img');
    // icon.src = chrome.runtime.getURL('icons/workday-icon.svg'); 
    // icon.alt = 'Workday icon';
    // icon.style.width = '20px';
    // icon.style.height = '20px';
    // button.prepend(icon);

    // signin/register event listener
    if (onClickHandler) {
        button.addEventListener('click', onClickHandler);
    }

    container.appendChild(separator);
    container.appendChild(button);

    return container;
}




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

