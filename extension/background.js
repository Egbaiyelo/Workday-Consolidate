// globalThis.sendNativeCommand = sendNativeCommand;
// globalThis.connectToNativeHost = connectToNativeHost;

// globalThis.testNative = () => {
//     sendNativeCommand('/scrape', { url: 'https://google.com' })
//         .then(response => console.log('Scrape result:', response))
//         .catch(error => console.error('Scrape error:', error));
// };


// maybe the action and message should be the same string
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getCredentials') {

        chrome.runtime.sendNativeMessage('com.me.my_workday', { action: '/get-credentials' }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Native messaging error:', chrome.runtime.lastError.message);
            }

            console.log('Received from native app:', response);
            sendResponse(response.result);
        })

        return true;
    }
    else if (message.action === 'getData') {

        chrome.runtime.sendNativeMessage('com.me.my_workday', { action: '/scrape' }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Native messaging error:', chrome.runtime.lastError.message);
            }

            console.log('Received from native app:', response);
            sendResponse(response.result);
        })

        return true;
    }
    else if (message.action === 'addSite') {
        chrome.runtime.sendNativeMessage('com.me.my_workday', { action: '/add-site', data: message.data }, (response) => {
            console.log('addsite command received');
            if (chrome.runtime.lastError) {
                console.error('Native messaging error:', chrome.runtime.lastError.message);
            }

            console.log('Received add site data from native app:', response);
            sendResponse(response.result);
        })
    }
    else {console.log('unknown command'); sendResponse('command unknown')}
});


