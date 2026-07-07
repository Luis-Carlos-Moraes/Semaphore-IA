#!/usr/bin/env node
const net = require('net');
const os = require('os');
const fs = require('fs');
const path = require('path');

function logError(err) {
  try {
    const logFilePath = path.join(__dirname, '../../cli-errors.log');
    const logMessage = `[${new Date().toISOString()}] Error: ${err.message}\n` +
                       `Stack: ${err.stack}\n` +
                       `CWD: ${process.cwd()}\n` +
                       `PATH: ${process.env.PATH}\n` +
                       `ARGS: ${process.argv.join(' ')}\n\n`;
    fs.appendFileSync(logFilePath, logMessage, 'utf8');
  } catch (e) {
    // Ignore log errors
  }
}

function logInvocation() {
  try {
    const logFilePath = path.join(__dirname, '../../cli-calls.log');
    const logMessage = `[${new Date().toISOString()}] Invocado com ARGS: ${process.argv.slice(2).join(' ')} | CWD: ${process.cwd()}\n`;
    fs.appendFileSync(logFilePath, logMessage, 'utf8');
  } catch (e) {
    // Ignore
  }
}


// Parse arguments
const args = process.argv.slice(2);
logInvocation();
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
  const session = args[3] || process.cwd();

  const client = net.createConnection(ipcPath, () => {
    const payload = JSON.stringify({ cmd: 'prompt', question, options, session });
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
    logError(err);
    console.error('Error: Semaphore app is not running.');
    process.exit(1);
  });

  client.on('close', () => {
    process.exit(0);
  });
} else {
  // Set state
  const state = command;
  let session = process.cwd();

  // Handle second arg or --session option
  if (args.length > 1) {
    if (args[1] === '--session' && args[2]) {
      session = args[2];
    } else {
      session = args[1];
    }
  }

  const client = net.createConnection(ipcPath, () => {
    const payload = JSON.stringify({ cmd: 'set', state, session });
    client.write(payload);
    client.end();
  });

  client.on('error', (err) => {
    logError(err);
    // Silent fallback if server is not running
    process.exit(0);
  });

  client.on('close', () => {
    process.exit(0);
  });
}
