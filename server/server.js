// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initializeDataFiles } = require('./utils/dataUtils');
const authRoutes = require('./routes/authRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const testRoutes = require('./routes/testRoutes');
const { logRequest } = require('./middleware/logger');
const certificateRoutes = require('./routes/certificateRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const featureRoutes = require('./routes/featureRoutes');

// Create Express app
const app = express();
const DEFAULT_PORT = 3001;
const PORT = process.env.PORT || DEFAULT_PORT;

// Function to find an available port
const findAvailablePort = async (startPort) => {
  const net = require('net');
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

// Initialize data storage on startup
initializeDataFiles();

// Configure CORS with proper options
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = ['http://localhost:8080', 'http://localhost:3000', 'http://localhost:5173'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // Parse JSON request body
app.use(logRequest); // Log all requests

// Routes

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/test', testRoutes);
app.use('/api/certificate', certificateRoutes);
app.use('/api/verify', verificationRoutes);
app.use('/api/features', featureRoutes);

// Serve static files from the frontend build if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start the server with proper error handling
const startServer = async () => {
  try {
    let port = PORT;
    
    // If the default port is in use, find an available one
    if (process.env.NODE_ENV !== 'production') {
      port = await findAvailablePort(PORT);
    }
    
    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      // Write the port to a file so the frontend can use it
      fs.writeFileSync(path.join(__dirname, 'port.txt'), port.toString());
    });

    server.on('error', (error) => {
      console.error('Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Please try these solutions:`);
        console.error(`1. Stop any other server running on port ${port}`);
        console.error(`2. Use a different port by setting the PORT environment variable`);
        console.error(`3. Run 'npx kill-port ${port}' to terminate processes on this port`);
      }
      process.exit(1);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();