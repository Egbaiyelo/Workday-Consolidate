
// import { SignIn } from "./account";


const observer = new MutationObserver(() => {

    //
    const {targetButtonDiv, barDivider} = AddLinkToConsolidate();

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
    
    if (utilityButtonBar){
        console.log("inserting")
        utilityButtonBar.insertBefore(barDivider, null);
        utilityButtonBar.insertBefore(targetButtonDiv, null);
        utilityButtonBar.insertBefore(barDivider, null);
    }

    observer.disconnect();
})        

observer.observe(document.body, {subtree: true, childList: true});






const creds = { email: "I am email", password: "I am password"};

function SignIn(signInButton) {
    console.log(signInButton);
    if (!signInButton || signInButton.getAttribute('data-automation-id') !== "utilityButtonSignIn") {
        console.log("Received falsy sign in");
        return false;
    }

    signInButton.click();

    // const signInContent = document.querySelector('[data-automation-id="signInContent"]');
    // if (!signInContent) {console.log("Received falsy form"); return false;}

    const emailBox = document.querySelector('[data-automation-id="email"]');
    emailBox.value = creds.email;

    const passwordBox = document.querySelector('[data-automation-id="password"]');
    passwordBox.value = creds.password; 

    return true;
}


function AddLinkToConsolidate() {

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

    console.log({ targetButtonDiv: targetButtonDiv })

    return {targetButtonDiv, barDivider}
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