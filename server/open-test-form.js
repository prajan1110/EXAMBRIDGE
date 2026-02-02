// This script opens the test upload HTML file in the default browser

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const htmlPath = path.join(__dirname, 'test-upload.html');
const absolutePath = path.resolve(htmlPath);

// Convert to file URL
const fileUrl = `file:///${absolutePath.replace(/\\/g, '/')}`;

console.log(`Opening ${fileUrl} in your default browser...`);

// Open in default browser
if (process.platform === 'win32') {
  exec(`start "" "${fileUrl}"`);
} else if (process.platform === 'darwin') {
  exec(`open "${fileUrl}"`);
} else {
  exec(`xdg-open "${fileUrl}"`);
}

console.log('\nTest Instructions:');
console.log('1. Use the form to upload a test certificate file');
console.log('2. Verify that the file uploads successfully');
console.log('3. Check the server console for upload logs');