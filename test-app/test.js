const fs = require('fs');
const path = require('path');

//! Absolute path for deployment
const DEBUG_LOG = path.join(__dirname, 'debug.log');
const DATA_BOOK = path.join(__dirname, 'data.json');

function readData() {
    try {
        const jsonData = fs.readFileSync(DATA_BOOK, 'utf8');
        const data = JSON.parse(jsonData);
        return data;

    } catch (err) {
        //- handle later
        console.error('Error reading or parsing data.json:', err);
    }
}
const DATA = readData();
const SAMPLE_SCRAPE = [{
    site: "mvidia", data: [{
        job_title: "developer",
        job_req: "19342",
        application_status: "accepted",
        date_submitted: "324292"
    },
    {
        job_title: "engineer",
        job_req: "19342",
        application_status: "accepted",
        date_submitted: "324292"
    }]
},
{
    site: "foogle", data: [{
        job_title: "senior developer",
        job_req: "19342",
        application_status: "accepted",
        date_submitted: "324292"
    },
    {
        job_title: "senior engineer",
        job_req: "19342",
        application_status: "accepted",
        date_submitted: "324292"
    }]
}
]

function logDebug(message) {
    try {
        fs.appendFileSync(DEBUG_LOG, `[${new Date().toISOString()}] ${message}\n`);
    } catch (e) {
        // Can't log error - risk of disconnection
    }
}

function readMessage() {
    try {
        const buffer = Buffer.alloc(4);
        const bytesRead = fs.readSync(process.stdin.fd, buffer, 0, 4);

        if (bytesRead === 0) {
            logDebug('No bytes read for length header');
            return null;
        }

        const msgLength = buffer.readUInt32LE(0);
        logDebug(`Expected message length: ${msgLength}`);

        if (msgLength === 0 || msgLength > 1024 * 1024) { // 1MB limit
            logDebug(`Invalid message length: ${msgLength}`);
            return null;
        }

        const msgBuffer = Buffer.alloc(msgLength);
        const msgBytesRead = fs.readSync(process.stdin.fd, msgBuffer, 0, msgLength);

        if (msgBytesRead !== msgLength) {
            logDebug(`Expected ${msgLength} bytes, got ${msgBytesRead}`);
            return null;
        }

        const jsonStr = msgBuffer.toString('utf8');
        logDebug(`Raw message: ${jsonStr}`);

        return JSON.parse(jsonStr);
    } catch (error) {
        logDebug(`Read error: ${error.message}`);
        return null;
    }
}

function sendMessage(msg) {
    try {
        const json = JSON.stringify(msg);
        const jsonBuffer = Buffer.from(json, 'utf8');
        const lengthBuffer = Buffer.alloc(4);

        lengthBuffer.writeUInt32LE(jsonBuffer.length, 0);

        logDebug(`Sending message length: ${jsonBuffer.length}, content: ${json}`);

        process.stdout.write(lengthBuffer);
        process.stdout.write(jsonBuffer);

        logDebug('Message sent successfully');
    } catch (error) {
        logDebug(`Send error: ${error.message}`);
    }
}

function handleCommand(message) {
    logDebug(`Processing command: ${JSON.stringify(message)}`);

    const { action, data } = message;

    switch (action) {
        case '/scrape':
            logDebug('^--Command: Scrape');
            return {
                success: true,
                result: SAMPLE_SCRAPE,
                command: 'scrape_response',
                timestamp: new Date().toISOString()
            };

        case '/add-site':
            logDebug('^--Command: Scrape');
            return {
                success: true,
                result: `Scraped data from: ${data?.url || 'unknown URL'}`,
                command: 'scrape_response',
                timestamp: new Date().toISOString()
            };

        case '/get-credentials':
            logDebug('^--Command: getcredentials');
            return {
                success: true,
                result: {
                    username: DATA.username,
                    password: DATA.password
                },
                command: 'get-credentials-response',
                timestamp: new Date().toISOString()
            }
        case '/scrape':
            logDebug('^--Command: Scrape');
            return {
                success: true,
                result: `Scraped data from: ${data?.url || 'unknown URL'}`,
                command: 'scrape_response',
                timestamp: new Date().toISOString()
            };

        default:
            logDebug('^--Command: UnKnown');
            return {
                success: true,
                result: 'Hello from native host! lol ',
                command: 'default_response',
                receivedCommand: action,
                got: { message, action, data },
                timestamp: new Date().toISOString()
            };
    }
}

async function startMessageLoop() {
    logDebug('Native host starting up');

    try {
        while (true) {
            logDebug('Waiting for message...');

            const msg = readMessage();

            if (msg === null) {
                logDebug('Received null message, continuing...');
                await new Promise(resolve => setTimeout(resolve, 100));
                continue;
            }

            logDebug(`Received message: ${JSON.stringify(msg)}`);

            // Process commands
            if (msg.command === '/shutdown') {
                logDebug('Shutdown command received');
                sendMessage({ success: true, result: 'Shutting down', command: 'shutdown_response' });
                break;
            }

            const response = handleCommand(msg);
            sendMessage(response);

            logDebug(`Sent response: ${JSON.stringify(response)}`);
        }
    } catch (error) {
        logDebug(`Main loop error: ${error.message}`);
        logDebug(`Stack trace: ${error.stack}`);
    }

    logDebug('Native host shutting down');
}

process.on('SIGINT', () => {
    logDebug('SIGINT received, shutting down\n');
    process.exit(0);
});

process.on('SIGTERM', () => {
    logDebug('SIGTERM received, shutting down\n');
    process.exit(0);
});

process.on('exit', (code) => {
    logDebug(`Process exiting with code: ${code}\n`);
});

startMessageLoop();