
// Look for what to do, sign up, sign in
function ensureAccount() {
    const observer = new MutationObserver(() => {

        // Ensure signed in? or signed up?
        const utilityButtonBar = document.querySelector('[data-automation-id="utilityButtonBar"]');
        const signInButton = document.querySelector('[data-automation-id="utilityButtonSignIn"]');


    });
}

const observer = new MutationObserver(() => {

    const utilityButtonBar = document.querySelector('[data-automation-id="utilityButtonBar"]');
    const signInButton = document.querySelector('[data-automation-id="utilityButtonSignIn"]');


    console.log(utilityButtonBar)
    if (!utilityButtonBar) {
        console.log("Failed to find");
        return;
    };

    if (signInButton) {
        console.log("signing in");
        const signInResponse = SignIn(signInButton);
    }

    observer.disconnect();
})

observer.observe(document.body, { subtree: true, childList: true });


function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const observer = new MutationObserver(() => {
            const element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                resolve(element);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        setTimeout(() => {
            observer.disconnect();
            reject(new Error('Element not found within timeout'));
        }, timeout);
    });
}



const creds = { email: "I am email", password: "I am password" };

function SignIn(signInButton) {
    console.log(signInButton);
    if (!signInButton || signInButton.getAttribute('data-automation-id') !== "utilityButtonSignIn") {
        console.log("Received falsy sign in button");
        return false;
    }

    signInButton.click();


    waitForElement('[data-automation-id="signInContent"]')
    .then(signInContent => {
        console.log("here!!!")
        console.log("sign inc onten")
        const emailBox = document.querySelector('[data-automation-id="email"]');
        const passwordBox = document.querySelector('[data-automation-id="password"]');
        if (!emailBox || !passwordBox) {console.log("didnt finds");return false};

        console.log(emailBox, passwordBox, "setting", creds)
        emailBox.value = creds.email;
        emailBox.dispatchEvent(new Event('input', { bubbles: true }));
        passwordBox.value = creds.password;

        passwordBox.dispatchEvent(new Event('input', { bubbles: true }));

        return true;
    })
    .catch(error => {
        console.log("Sign-in form not loaded:", error);
        return false;
    });


    // // const closeButton = document.querySelector('[aria-label="close"]');
    // awaitElement('[data-automation-id="signInContent"]');
    // const signInContent = document.querySelector('[data-automation-id="signInContent"]');
    // console.log(signInContent)
    // if (!signInContent) { console.log("Received falsy form"); return false; }

    // const emailBox = document.querySelector('[data-automation-id="email"]');
    // emailBox.value = creds.email;

    // const passwordBox = document.querySelector('[data-automation-id="password"]');
    // passwordBox.value = creds.password;

    // return true;
}

function awaitElement(selector) {
    // really shouldnt take too much time

    if (document.querySelector(selector)) { console.log("1"); console.log(document.querySelector(selector)); return };

    const observer = new MutationObserver(() => {
        //- check added node instead maybe
        if (document.querySelector(selector)) { console.log("2"); console.log(document.querySelector(selector)); return };

    })
    observer.observe(document.body, { subtree: true, childList: true })
    //- maybe return the elemnt and set timeout if it never appeared
    console.log("reached")
}

function AddLinkToConsolidate(utilityButtonBar) {
    const { targetButtonDiv, barDivider } = AddLinkToConsolidate();

    if (utilityButtonBar){
        console.log("inserting utility button bar")
        console.log({"utilitybutonbar I got": utilityButtonBar})
        utilityButtonBar.insertBefore(barDivider, null);
        utilityButtonBar.insertBefore(targetButtonDiv, null);
        utilityButtonBar.insertBefore(barDivider, null);
    }
}


function createConsolidateLink() {

    // Icon and name
    const targetIcon = document.createElement('span');
    targetIcon.className = "css-53a7ht";

    const targetText = document.createElement('span');
    targetText.textContent = "Target";
    targetText.className = "css-1xtbc5b";


    // Button
    const targetButton = document.createElement('button');
    targetButton.setAttribute('aria-expanded', 'false');
    targetButton.setAttribute('aria-haspopup', 'listbox');
    targetButton.setAttribute('color', '#FFFFFF');
    targetButton.setAttribute('data-automation-id', 'UtilityMenuButton');
    targetButton.className = "css-myllji";
    targetButton.append(targetIcon);
    targetButton.append(targetText);


    // 
    const barDivider = document.createElement('div');
    barDivider.setAttribute('data-automation-id', 'utility-button-bar-divider');
    barDivider.setAttribute('color', '#FFFFFF');
    barDivider.className = 'css-1c0okss';

    const targetButtonDiv = document.createElement('div');
    targetButtonDiv.setAttribute('data-automation-id', 'utilityButtonTarget');
    targetButtonDiv.className = "css-wjaruy";
    // targetButtonDiv.className = 'css-1c0okss';
    targetButtonDiv.append(targetButton);

    // console.log({ targetButtonDiv: targetButtonDiv })

    return { targetButtonDiv, barDivider }
}



// const observer = new MutationObserver((mutations) => {
//     for (const mutation of mutations) {
//         console.log("Here")
//         for (const node of mutation.addedNodes) {
//             console.log("there")
//             console.log("node", node)
//             if (node.nodeType === 1 && node.matches('[data-automation-id="utilityButtonBar"]')) {
//                 console.log("level 1")
//                 observer.disconnect();
//                 console.log("level 2")


//                 node.append(barDivider);
//                 node.append(targetButtonDiv);
//                 console.log({ added: node })


//                 return;
//             }
//         }
//     }
// });

// observer.observe(document.body, { childList: true, subtree: true });