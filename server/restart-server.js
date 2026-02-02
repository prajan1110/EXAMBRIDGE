/**
 * Restart Server Utility
 * 
 * This script helps automatically kill any process running on the server port
 * and then restart the server. It's useful for development environments where
 * you might have zombie processes or port conflicts.
 */

const { execSync } = require('child_process');
const { spawn } = require('child_process');
const PORT = process.env.PORT || 3001;

console.log(`🔍 Checking for processes running on port ${PORT}...`);

try {
  // Find the PID of any process running on the port
  // This command works on Windows
  const findCommand = `netstat -ano | findstr :${PORT}`;
  const output = execSync(findCommand).toString();
  
  // Extract PIDs from the output
  const lines = output.split('\n').filter(line => line.includes('LISTENING'));
  
  if (lines.length > 0) {
    console.log(`✅ Found ${lines.length} process(es) using port ${PORT}`);
    
    lines.forEach(line => {
      // The PID is the last number in each line
      const pid = line.trim().split(/\s+/).pop();
      
      if (pid) {
        try {
          console.log(`🛑 Terminating process ${pid}...`);
          execSync(`taskkill /F /PID ${pid}`);
          console.log(`✅ Successfully terminated process ${pid}`);
        } catch (killError) {
          console.error(`❌ Failed to terminate process ${pid}: ${killError.message}`);
        }
      }
    });
  } else {
    console.log(`✅ No processes found using port ${PORT}`);
  }
} catch (error) {
  // If the find command returns nothing or fails, that means no process is using the port
  console.log(`✅ No processes found using port ${PORT}`);
}

console.log(`🚀 Starting server...`);

// Start the server
const server = spawn('node', ['server.js'], { 
  stdio: 'inherit',
  cwd: __dirname 
});

server.on('error', (err) => {
  console.error(`❌ Failed to start server: ${err.message}`);
});

console.log(`✅ Server process started with PID ${server.pid}`);