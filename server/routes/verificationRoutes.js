/**
 * Routes for teacher/admin verification of student certificates
 */

const express = require('express');
const router = express.Router();
const { getUserById, updateUser, getAllUsers } = require('../utils/dataUtils');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Middleware to check if user is a teacher/admin
 */
const teacherAuthMiddleware = (req, res, next) => {
  try {
    const user = getUserById(req.userId);
    
    if (!user || user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied. Teacher role required.' });
    }
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authorization error' });
  }
};

/**
 * @route   GET /api/verify/pending
 * @desc    Get all users with pending verification
 * @access  Private (teachers only)
 */
router.get('/pending', authMiddleware, teacherAuthMiddleware, (req, res) => {
  try {
    const users = getAllUsers()
      .filter(user => user.verificationStatus === 'pending')
      .map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        disabilityType: user.disabilityType,
        certificateUrl: user.certificateUrl,
        recommendedFeatures: user.recommendedFeatures,
        aiConfidence: user.aiConfidence
      }));
    
    res.status(200).json({ pendingUsers: users });
  } catch (error) {
    console.error('Get pending verifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/verify/:userId
 * @desc    Update verification status for a user
 * @access  Private (teachers only)
 */
router.put('/:userId', authMiddleware, teacherAuthMiddleware, (req, res) => {
  try {
    const { userId } = req.params;
    const { status, recommendedFeatures } = req.body;
    
    // Validate status
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid verification status' });
    }
    
    // Get user
    const user = getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user verification status
    const updates = {
      verificationStatus: status
    };
    
    // If custom recommended features provided, use those
    if (recommendedFeatures && Array.isArray(recommendedFeatures)) {
      updates.recommendedFeatures = recommendedFeatures;
    }
    
    // If verification is successful, apply recommended features
    if (status === 'verified') {
      updates.accessibilityFeatures = {
        tts: false,
        stt: false,
        dyslexicFont: false,
        highContrast: false,
        fontSize: 16,
        darkMode: false,
        extraTime: false,
        captions: false,
        keyboardOnly: false
      };
      
      // Enable features based on recommendations
      (updates.recommendedFeatures || user.recommendedFeatures || []).forEach(feature => {
        if (feature in updates.accessibilityFeatures) {
          if (typeof updates.accessibilityFeatures[feature] === 'boolean') {
            updates.accessibilityFeatures[feature] = true;
          } else if (feature === 'fontSize') {
            updates.accessibilityFeatures.fontSize = 20; // Larger font size
          }
        }
      });
    }
    
    // Update user
    const result = updateUser(userId, updates);
    
    if (!result.success) {
      return res.status(500).json({ message: 'Failed to update verification status' });
    }
    
    res.status(200).json({
      message: `Verification ${status === 'verified' ? 'approved' : 'rejected'} successfully`,
      user: result.user
    });
  } catch (error) {
    console.error('Update verification status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
