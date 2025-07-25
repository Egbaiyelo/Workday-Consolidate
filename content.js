

// Login

//
//
//
//
//

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


const observer = new MutationObserver(() => {

    //
    const utilityButtonBar = document.querySelector('[data-automation-id="utilityButtonBar"]');

    console.log(utilityButtonBar)
    if (!utilityButtonBar) {
        console.log("Failed to find");
        return;
    };
    observer.disconnect()

    if (utilityButtonBar){

        utilityButtonBar.insertBefore(barDivider, null);
        utilityButtonBar.insertBefore(targetButtonDiv, null);
        utilityButtonBar.insertBefore(barDivider, null);
    }
})        

observer.observe(document.body, {subtree: true, childList: true});













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