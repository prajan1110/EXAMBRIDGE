/**
 * Routes for certificate upload and verification
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const { upload } = require('../middleware/uploadMiddleware');
const { analyzeCertificate } = require('../services/verificationService');
const { getUserById, updateUser } = require('../utils/dataUtils');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @route   POST /api/certificate/upload
 * @desc    Upload and analyze a medical certificate
 * @access  Private (student only)
 */
router.post('/upload', authMiddleware, (req, res) => {
  // Use upload middleware with error handling
  upload.single('certificate')(req, res, async (err) => {
    try {
      // Handle multer errors
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({ 
          message: err.message || 'Error uploading file',
          error: err.toString()
        });
      }
      
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ 
          message: 'No file uploaded',
          requestBody: req.body
        });
      }
      
      // Get the user
      const user = getUserById(req.userId);
      
      if (!user) {
        // If file was uploaded but user wasn't found, clean up the file
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupErr) {
          console.error('Error cleaning up file:', cleanupErr);
        }
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Log file info for debugging
      console.log('File uploaded:', {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      });
      
      let certificateText = '';
      
      // Try to read the file content if it's a text file
      if (req.file.mimetype === 'text/plain') {
        try {
          certificateText = fs.readFileSync(req.file.path, 'utf8');
        } catch (readErr) {
          console.error('Error reading file:', readErr);
          certificateText = req.file.originalname; // Fallback to using filename
        }
      } else {
        // For non-text files (like PDFs and images), we'd need OCR in production
        // For now, just use the file name
        certificateText = req.file.originalname;
      }
      
      // Analyze certificate with AI
      console.log('Analyzing certificate with text:', certificateText.substring(0, 100) + '...');
      const analysisResult = await analyzeCertificate(certificateText);
      console.log('Analysis result:', analysisResult);
      
      // Prepare certificate URL
      const certificateUrl = `/uploads/${req.file.filename}`;
      
      // Update user with certificate information
      const updates = {
        certificateUrl: certificateUrl,
        certificateText: certificateText.substring(0, 1000), // Limit stored text
        verificationStatus: 'pending', // Set to pending until reviewed
        recommendedFeatures: analysisResult.recommended_features || [],
        disabilityType: analysisResult.disability_type.toLowerCase().replace(/\s+/g, '-'),
        aiConfidence: analysisResult.confidence_score
      };
      
      // Update user in database
      const result = updateUser(user.id, updates);
      
      if (!result.success) {
        return res.status(500).json({ message: 'Failed to update user profile' });
      }
      
      // Return verification result
      res.status(200).json({
        message: 'Certificate uploaded and analyzed successfully',
        verificationResult: {
          status: analysisResult.confidence_score > 0.7 ? 'Valid' : 'Invalid',
          disability_type: analysisResult.disability_type,
          recommended_features: analysisResult.recommended_features,
          confidence: analysisResult.confidence_score
        }
      });
    } catch (error) {
      console.error('Certificate upload error:', error);
      res.status(500).json({ 
        message: 'Server error processing certificate',
        error: error.toString()
      });
    }
  });
});

/**
 * @route   GET /api/certificate/status
 * @desc    Get certificate verification status
 * @access  Private
 */
router.get('/status', authMiddleware, (req, res) => {
  try {
    const user = getUserById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return verification status information
    res.status(200).json({
      verificationStatus: user.verificationStatus || 'none',
      disabilityType: user.disabilityType || 'none',
      recommendedFeatures: user.recommendedFeatures || [],
      certificateUrl: user.certificateUrl || null
    });
  } catch (error) {
    console.error('Get certificate status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

/**
 * @route   POST /api/certificate/demo-verify
 * @desc    Demo verification: directly set disability and recommended features
 * @access  Private
 */
