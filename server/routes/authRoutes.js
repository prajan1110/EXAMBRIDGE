/**
 * Authentication routes
 * Handles user registration, login, and profile management
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/userModel');
const { 
  getUserByEmail, 
  createUser, 
  updateUser, 
  getUserById, 
  incrementAnalytic 
} = require('../utils/dataUtils');
const { sendWelcomeEmail } = require('../utils/emailUtils');

// JWT secret key - must be provided via environment variable for security
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set. Please define JWT_SECRET in server/.env');
  process.exit(1);
}

/**
 * Middleware to verify JWT token
 */
const authMiddleware = (req, res, next) => {
  try {
    // Get token from authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, role, disabilityType } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    
    // Check if user already exists
    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Create new user
    const userData = new User({
      name,
      email,
      password, // Will be hashed in createUser
      role: role || 'student',
      disabilityType: disabilityType || 'none',
    });
    
    const result = await createUser(userData);
    
    if (!result.success) {
      return res.status(500).json({ message: result.message });
    }
    
    // Create JWT token
    const token = jwt.sign({ id: result.user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    // Send welcome email
    sendWelcomeEmail(email, name)
      .then(success => {
        if (success) {
          console.log(`Welcome email sent successfully to ${email}`);
        } else {
          console.warn(`Failed to send welcome email to ${email}`);
        }
      })
      .catch(emailError => {
        console.error('Failed to send welcome email:', emailError);
      });
    
    // Return user and token
    return res.status(201).json({
      token,
      user: result.user.toPublic ? result.user.toPublic() : { ...result.user, password: undefined }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    
    // Check if user exists
    const user = getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    // Update last login
    const now = new Date().toISOString();
    updateUser(user.id, { lastLogin: now });
    
    // Track login
    incrementAnalytic('logins');
    
    // Create JWT token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    // Return user and token
    return res.status(200).json({
      token,
      user: user.toPublic ? user.toPublic() : { ...user, password: undefined }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authMiddleware, (req, res) => {
  try {
    // Get user
    const user = getUserById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user
    return res.status(200).json({
      user: user.toPublic ? user.toPublic() : { ...user, password: undefined }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    // Get fields to update
    const { name, disabilityType, accessibilityFeatures, certificateUrl } = req.body;
    
    // Create update object with only valid fields
    const updates = {};
    if (name) updates.name = name;
    if (disabilityType) updates.disabilityType = disabilityType;
    if (accessibilityFeatures) updates.accessibilityFeatures = accessibilityFeatures;
    if (certificateUrl) {
      updates.certificateUrl = certificateUrl;
      updates.verificationStatus = 'pending'; // Reset to pending when new certificate uploaded
    }
    
    // Update user
    const result = updateUser(req.userId, updates);
    
    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }
    
    // Return updated user
    return res.status(200).json({
      user: result.user.toPublic ? result.user.toPublic() : { ...result.user, password: undefined }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/auth/verification
 * @desc    Update verification status (for admin/AI verification)
 * @access  Private
 */
router.put('/verification', authMiddleware, async (req, res) => {
  try {
    const { userId, verificationStatus, recommendedFeatures } = req.body;
    
    // This should be protected further with admin role check in a real app
    
    // Update user
    const updates = { 
      verificationStatus
    };
    
    if (recommendedFeatures) {
      updates.recommendedFeatures = recommendedFeatures;
    }
    
    const result = updateUser(userId, updates);
    
    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }
    
    // Return success message
    return res.status(200).json({
      message: 'Verification status updated',
      user: result.user.toPublic ? result.user.toPublic() : { ...result.user, password: undefined }
    });
  } catch (error) {
    console.error('Update verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/auth/password
 * @desc    Update password
 * @access  Private
 */
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user
    const user = getUserById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    const result = updateUser(req.userId, { password: hashedPassword });
    
    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }
    
    // Return success message
    return res.status(200).json({
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;