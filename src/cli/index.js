const net = require('net');
const os = require('os');

// Parse arguments
// Usage: node index.js <green|yellow|red> [session_id]
const args = process.argv.slice(2);
if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log('Usage: node index.js <green|yellow|red> [session_id]');
  process.exit(0);
}

const state = args[0].toLowerCase();
let session = 'default';

// Handle second arg or --session option
if (args.length > 1) {
  if (args[1] === '--session' && args[2]) {
    session = args[2];
  } else {
    session = args[1];
  }
}

// IPC Path (must match the Electron server)
const ipcPath = os.platform() === 'win32'
  ? '\\\\.\\pipe\\semaphore-js'
  : '/tmp/semaphore-js.sock';

const client = net.createConnection(ipcPath, () => {
  const payload = JSON.stringify({ cmd: 'set', state, session });
  client.write(payload);
  client.end();
});

client.on('error', (err) => {
  // Silent fallback if server is not running
  process.exit(0);
});

client.on('close', () => {
  process.exit(0);
});
