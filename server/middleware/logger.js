/**
 * Logger middleware
 * Logs all requests to the server
 */

const fs = require('fs');
const path = require('path');

// Log file path
const LOG_DIR = path.join(__dirname, '../data');
const LOG_FILE = path.join(LOG_DIR, 'server.log');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Log request to file
 */
function logRequest(req, res, next) {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;
  
  const logEntry = `[${timestamp}] ${method} ${url} - IP: ${ip}\n`;
  
  // Append to log file
  fs.appendFile(LOG_FILE, logEntry, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
  
  next();
}

module.exports = { logRequest };