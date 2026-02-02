/**
 * Run accessibility tests
 * This script starts the test server and then runs the accessibility tests
 */

require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting test server...');

// Start the test server
const server = spawn('node', [path.join(__dirname, 'start-test-server.js')], {
  stdio: 'inherit'
});

// Wait for server to start
setTimeout(() => {
  console.log('\nServer should be running. Starting accessibility tests...');
  console.log('-----------------------------------------------------------\n');
  
  // Run the accessibility tests
  const tests = spawn('node', [path.join(__dirname, 'test-e2e-accessibility.js')], {
    stdio: 'inherit'
  });
  
  // When tests finish, kill the server
  tests.on('exit', (code) => {
    console.log(`\nTests completed with exit code ${code}`);
    console.log('Shutting down test server...');
    server.kill();
    process.exit(code);
  });
  
}, 3000); // Give the server 3 seconds to start

// Handle CTRL+C to gracefully shut down both processes
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT. Shutting down...');
  server.kill();
  process.exit(0);
});