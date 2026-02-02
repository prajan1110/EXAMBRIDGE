const fs = require('fs');
const path = require('path');
const net = require('net');

// Function to find an available port
const findAvailablePort = async (startPort) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on('error', () => {
      resolve(findAvailablePort(startPort + 1));
    });
    server.listen(startPort, () => {
      server.close(() => {
        resolve(startPort);
      });
    });
  });
};

// Function to get the current server port
const getServerPort = () => {
  try {
    const portFile = path.join(__dirname, '..', 'port.txt');
    if (fs.existsSync(portFile)) {
      return parseInt(fs.readFileSync(portFile, 'utf-8'), 10);
    }
  } catch (error) {
    console.error('Error reading server port:', error);
  }
  return 3001; // Default port
};

module.exports = {
  findAvailablePort,
  getServerPort
};