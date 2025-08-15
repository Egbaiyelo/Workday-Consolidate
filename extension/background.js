

let nativePort = null;

chrome.runtime.onInstalled.addListener(() => {
    console.log("$$...Installed");
    connectToNativeHost();
});

function connectToNativeHost() {
    console.log("Connecting to native host...");
    
    if (nativePort) {
        nativePort.disconnect();
    }
    
    nativePort = chrome.runtime.connectNative('com.me.my_workday');
    
    nativePort.onMessage.addListener((msg) => {
        console.log("Received from native host:", msg);
        
        switch (msg.command) {
            default:
                console.warn("Received message: ", msg.result, "\nThis can't be handled");
        }
    });
    
    nativePort.onDisconnect.addListener(() => {
        if (chrome.runtime.lastError) {
            console.error("Native host disconnected with error:", chrome.runtime.lastError.message);
            
            setTimeout(() => {
                console.log("Attempting to reconnect...");
                connectToNativeHost();
            }, 2000);
        } else {
            console.log("Native host disconnected normally");
        }
        nativePort = null;
    });
    

}


function sendNativeCommand(command, data) {
    return new Promise((resolve, reject) => {
        if (!nativePort) {
            console.error("No native port connection for command:", command);
            connectToNativeHost();
            reject(new Error('No native connection'));
            return;
        }
        
        console.log(`Sending command: ${command}`, data);
        
        // Create a one-time listener for this specific command
        const listener = (msg) => {
            if (msg.command === `${command.replace('/', '')}_response`) {
                nativePort.onMessage.removeListener(listener);
                resolve(msg);
            }
        };
        
        nativePort.onMessage.addListener(listener);
        
        setTimeout(() => {
            nativePort.onMessage.removeListener(listener);
            reject(new Error(`Command ${command} timed out`));
        }, 5000);
        
        nativePort.postMessage({ command, data });
    });
}

globalThis.sendNativeCommand = sendNativeCommand;
globalThis.connectToNativeHost = connectToNativeHost;

globalThis.testNative = () => {
    sendNativeCommand('/scrape', { url: 'https://google.com' })
        .then(response => console.log('Scrape result:', response))
        .catch(error => console.error('Scrape error:', error));
};


