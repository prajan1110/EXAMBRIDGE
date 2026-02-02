/**
 * Server startup script for testing
 * This script starts the server with all the new routes for accessibility features
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initializeDataFiles } = require('./utils/dataUtils');

// Import routes
const authRoutes = require('./routes/authRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const featureRoutes = require('./routes/featureRoutes');

// Initialize data files if needed
initializeDataFiles();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/certificate', certificateRoutes);
app.use('/api/verify', verificationRoutes);
app.use('/api/features', featureRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Welcome to ExamBridge API', 
    endpoints: [
      '/api/auth',
      '/api/certificate',
      '/api/verify',
      '/api/features',
    ],
    documentation: 'Visit /api/docs for API documentation'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    features: {
      auth: true,
      certificate: true,
      verification: true,
      accessibilityFeatures: true
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`You can access the API at http://localhost:${PORT}/`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});