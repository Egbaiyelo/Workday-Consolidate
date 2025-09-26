const display = document.getElementById('temp-display');

// document.referrer

chrome.runtime.sendMessage({ action: 'getData' }, (response) => {
    if (chrome.runtime.lastError) {
        console.error('Error messaging extension:', chrome.runtime.lastError.message);
        return;
    }   


    if (response) {
        response.forEach(element => {
            console.log(element)
        });
    } else {
        console.error('Invalid credentials received from nativeHost');
    }
});