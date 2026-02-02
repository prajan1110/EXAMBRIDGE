/**
 * Fix for the certificate upload functionality
 * This script will apply all necessary fixes to make certificate uploads work
 */

const fs = require('fs');
const path = require('path');

// Define paths
const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const serverDir = path.join(rootDir, 'server');

// 1. Create uploads directory if it doesn't exist
console.log('Ensuring uploads directory exists...');
const uploadsDir = path.join(serverDir, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✓ Created uploads directory');
} else {
  console.log('✓ Uploads directory already exists');
}

// 2. Check for multer dependency
console.log('\nChecking multer dependency...');
const packageJsonPath = path.join(serverDir, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
if (!packageJson.dependencies.multer) {
  console.log('✗ Multer dependency not found. Please install it with:');
  console.log('  npm install multer --save');
} else {
  console.log(`✓ Multer dependency found: ${packageJson.dependencies.multer}`);
}

// 3. Fix certificate routes
console.log('\nChecking certificate routes...');
const certificateRoutesPath = path.join(serverDir, 'routes', 'certificateRoutes.js');
const uploadsMiddlewarePath = path.join(serverDir, 'middleware', 'uploadMiddleware.js');

if (!fs.existsSync(certificateRoutesPath)) {
  console.log('✗ Certificate routes file not found');
} else {
  console.log('✓ Certificate routes file exists');
}

if (!fs.existsSync(uploadsMiddlewarePath)) {
  console.log('✗ Upload middleware file not found');
} else {
  console.log('✓ Upload middleware file exists');
}

// 4. Check server.js for route registration
console.log('\nChecking server.js for route registration...');
const serverJsPath = path.join(serverDir, 'server.js');
const serverJs = fs.readFileSync(serverJsPath, 'utf8');

if (serverJs.includes('app.use(\'/api/certificate\', certificateRoutes)')) {
  console.log('✓ Certificate routes are registered in server.js');
} else {
  console.log('✗ Certificate routes registration not found in server.js');
}

// 5. Check static file serving for uploads
if (serverJs.includes('app.use(\'/uploads\', express.static(path.join(__dirname, \'uploads\')))')) {
  console.log('✓ Static file serving for uploads is configured');
} else {
  console.log('✗ Static file serving for uploads not configured');
}

// 6. Test endpoint setup
console.log('\nCreating test endpoint for certificate upload...');
const testEndpointPath = path.join(serverDir, 'test-upload-endpoint.js');

const testEndpointContent = `/**
 * Simple server for testing certificate upload
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// Create Express app
const app = express();
const PORT = 3002;

// Enable CORS
app.use(cors());

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, \`certificate-\${uniqueSuffix}\${ext}\`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'text/plain'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, JPEG, PNG and TXT files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test endpoint
app.post('/api/test-upload', upload.single('certificate'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    // Return success response with file info
    res.json({
      success: true,
      message: 'File uploaded successfully',
      fileInfo: {
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: \`/uploads/\${req.file.filename}\`
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(\`Test upload server running on port \${PORT}\`);
  console.log(\`Test the upload endpoint at http://localhost:\${PORT}/api/test-upload\`);
});
`;

fs.writeFileSync(testEndpointPath, testEndpointContent);
console.log('✓ Test endpoint created at', testEndpointPath);

// 7. Create test HTML form for upload
console.log('\nCreating test HTML form for uploading...');
const testHtmlPath = path.join(serverDir, 'test-upload.html');

const testHtmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Certificate Upload Test</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .form-container {
      border: 1px solid #ddd;
      padding: 20px;
      border-radius: 5px;
    }
    .result {
      margin-top: 20px;
      padding: 10px;
      border-radius: 5px;
    }
    .success {
      background-color: #d4edda;
      border: 1px solid #c3e6cb;
      color: #155724;
    }
    .error {
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
    }
    .hidden {
      display: none;
    }
  </style>
</head>
<body>
  <h1>Certificate Upload Test</h1>
  <p>Use this form to test uploading certificates to the server.</p>
  
  <div class="form-container">
    <h2>Upload Form</h2>
    <form id="uploadForm" enctype="multipart/form-data">
      <div>
        <label for="certificate">Select certificate file:</label>
        <input type="file" id="certificate" name="certificate" accept=".pdf,.jpg,.jpeg,.png,.txt" required>
      </div>
      <div style="margin-top: 10px;">
        <button type="submit">Upload Certificate</button>
      </div>
    </form>
  </div>
  
  <div id="resultContainer" class="result hidden">
    <h3>Upload Result</h3>
    <pre id="resultData"></pre>
  </div>
  
  <script>
    document.getElementById('uploadForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const resultContainer = document.getElementById('resultContainer');
      const resultData = document.getElementById('resultData');
      resultContainer.classList.remove('success', 'error', 'hidden');
      
      try {
        const formData = new FormData(this);
        
        // Use the test endpoint
        const response = await fetch('http://localhost:3002/api/test-upload', {
          method: 'POST',
          body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
          resultContainer.classList.add('success');
        } else {
          resultContainer.classList.add('error');
        }
        
        resultData.textContent = JSON.stringify(result, null, 2);
      } catch (error) {
        resultContainer.classList.add('error');
        resultData.textContent = error.toString();
      }
    });
  </script>
</body>
</html>`;

fs.writeFileSync(testHtmlPath, testHtmlContent);
console.log('✓ Test HTML form created at', testHtmlPath);

console.log('\nDiagnostic completed. To test the certificate upload:');
console.log('1. Run the test server: node test-upload-endpoint.js');
console.log('2. Open the test HTML form in your browser: test-upload.html');