/**
 * Routes for managing accessibility features
 */

const express = require('express');
const router = express.Router();
const { getUserById, updateUser, trackFeatureUsage } = require('../utils/dataUtils');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @route   GET /api/features
 * @desc    Get user's accessibility features
 * @access  Private
 */
router.get('/', authMiddleware, (req, res) => {
  try {
    const user = getUserById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
      // Return user's accessibility features
    res.status(200).json({
      disabilityType: user.disabilityType,
      verificationStatus: user.verificationStatus,
      features: user.accessibilityFeatures || {
        tts: false,
        stt: false,
        dyslexicFont: false,
        highContrast: false,
        fontSize: 16,
        darkMode: false,
        extraTime: false,
        captions: false,
        keyboardOnly: false,
        // New accessibility features
        textHighlighter: false,
        wordSpacing: 0,
        colorTheme: 'default',
        lineFocusMode: false,
        screenMagnifier: false,
        voiceCommands: false
      },
      recommendedFeatures: user.recommendedFeatures || []
    });
  } catch (error) {
    console.error('Get features error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/features
 * @desc    Update user's accessibility features
 * @access  Private
 */
router.put('/', authMiddleware, (req, res) => {
  try {
    const { features } = req.body;
    
    if (!features) {
      return res.status(400).json({ message: 'No features provided' });
    }
    
    const user = getUserById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prepare updates
    const updates = {
      accessibilityFeatures: {
        ...(user.accessibilityFeatures || {
          tts: false,
          stt: false,
          dyslexicFont: false,
          highContrast: false,
          fontSize: 16,
          darkMode: false,
          extraTime: false,
          captions: false,
          keyboardOnly: false,
          // New accessibility features
          textHighlighter: false,
          wordSpacing: 0,
          colorTheme: 'default',
          lineFocusMode: false,
          screenMagnifier: false,
          voiceCommands: false
        }),
        ...features
      }
    };
    
    // Update user
    const result = updateUser(user.id, updates);
    
    if (!result.success) {
      return res.status(500).json({ message: 'Failed to update features' });
    }
    
    // Track feature usage for analytics
    Object.keys(features).forEach(feature => {
      if (features[feature] === true) {
        trackFeatureUsage(feature);
      }
    });
    
    res.status(200).json({
      message: 'Features updated successfully',
      features: result.user.accessibilityFeatures
    });
  } catch (error) {
    console.error('Update features error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/features/reset
 * @desc    Reset to recommended features
 * @access  Private
 */
router.post('/reset', authMiddleware, (req, res) => {
  try {
    const user = getUserById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Only proceed if user has verified disability
    if (user.verificationStatus !== 'verified') {
      return res.status(403).json({ 
        message: 'Features reset requires verified disability status' 
      });
    }
    
    // Apply recommended features
    const defaultFeatures = {
      tts: false,
      stt: false,
      dyslexicFont: false,
      highContrast: false,
      fontSize: 16,
      darkMode: false,
      extraTime: false,
      captions: false,
      keyboardOnly: false,
      // New accessibility features
      textHighlighter: false,
      wordSpacing: 0,
      colorTheme: 'default',
      lineFocusMode: false,
      screenMagnifier: false,
      voiceCommands: false
    };
    
    // Enable features based on recommendations
    const recommendedFeatures = user.recommendedFeatures || [];
    recommendedFeatures.forEach(feature => {
      if (feature in defaultFeatures) {
        if (typeof defaultFeatures[feature] === 'boolean') {
          defaultFeatures[feature] = true;
        } else if (feature === 'fontSize') {
          defaultFeatures.fontSize = 20; // Larger font size
        }
      }
    });
    
    // Update user
    const updates = {
      accessibilityFeatures: defaultFeatures
    };
    
    const result = updateUser(user.id, updates);
    
    if (!result.success) {
      return res.status(500).json({ message: 'Failed to reset features' });
    }
    
    res.status(200).json({
      message: 'Features reset to recommended values',
      features: result.user.accessibilityFeatures
    });
  } catch (error) {
    console.error('Reset features error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
