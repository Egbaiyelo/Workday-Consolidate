const { spawn } = require('child_process');

function sendNativeMessage(message) {
    const json = JSON.stringify(message);
    const lengthBuffer = Buffer.alloc(4);
    lengthBuffer.writeUInt32LE(Buffer.byteLength(json), 0);

    const child = spawn('node', ['../app/nativehost.js'], {
        stdio: ['pipe', 'pipe', 'pipe']
    });

    child.stdin.write(lengthBuffer);
    child.stdin.write(json);

    child.stdout.on('data', (data) => {
        console.log('Response from native host:', data.toString());
    });

    child.stderr.on('data', (err) => {
        console.error('Error from native host:', err.toString());
    });

    child.on('exit', (code) => {
        console.log(`Native host exited with code ${code}`);
    });
}

sendNativeMessage({ text: "Hello from test!" });