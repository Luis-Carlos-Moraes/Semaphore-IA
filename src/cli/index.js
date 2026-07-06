const net = require('net');
const os = require('os');

// Parse arguments
const args = process.argv.slice(2);
if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log('Usage:');
  console.log('  Set State: node index.js <green|yellow|red> [session_id]');
  console.log('  Prompt:    node index.js prompt <question> <options_comma_separated> [session_id]');
  process.exit(0);
}

const command = args[0].toLowerCase();
const ipcPath = os.platform() === 'win32'
  ? '\\\\.\\pipe\\semaphore-js'
  : '/tmp/semaphore-js.sock';

if (command === 'prompt') {
  if (args.length < 3) {
    console.error('Error: Question and options are required for prompt.');
    process.exit(1);
  }
  const question = args[1];
  const options = args[2];
  const session = args[3] || 'default';

  const client = net.createConnection(ipcPath, () => {
    const payload = JSON.stringify({ cmd: 'prompt', question, options, session, workspace: process.cwd() });
    client.write(payload);
  });

  client.on('data', (data) => {
    try {
      const response = JSON.parse(data.toString());
      if (response && response.result !== undefined) {
        console.log(response.result);
        client.end();
      }
    } catch (err) {
      process.exit(1);
    }
  });

  client.on('error', (err) => {
    console.error('Error: Semaphore app is not running.');
    process.exit(1);
  });

  client.on('close', () => {
    process.exit(0);
  });
} else {
  // Set state
  const state = command;
  let session = 'default';

  // Handle second arg or --session option
  if (args.length > 1) {
    if (args[1] === '--session' && args[2]) {
      session = args[2];
    } else {
      session = args[1];
    }
  }

  const client = net.createConnection(ipcPath, () => {
    const payload = JSON.stringify({ cmd: 'set', state, session, workspace: process.cwd() });
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
}
