/**
 * File upload middleware for handling certificate uploads
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.txt'; // Default to .txt if no extension
    cb(null, `certificate-${uniqueSuffix}${ext}`);
  }
});

// File filter to allow PDFs, images and text files (for testing)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'text/plain'];
  
  // Check if mimetype is allowed
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // For development, log the mimetype that was rejected
    console.log(`Rejected file with mimetype: ${file.mimetype}`);
    cb(new Error('Only PDF, JPEG, PNG and TXT files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: fileFilter
});

module.exports = { upload };
