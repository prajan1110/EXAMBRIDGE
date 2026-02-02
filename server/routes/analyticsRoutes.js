/**
 * Analytics routes
 * Handles tracking of user activity and feature usage
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { 
  getAnalytics, 
  incrementAnalytic, 
  trackFeatureUsage,
  getUserById
} = require('../utils/dataUtils');

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'exam-bridge-secret-key';

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
    
    // Check if user exists and is an admin for sensitive routes
    if (req.path === '/dashboard') {
      const user = getUserById(req.userId);
      if (!user || user.role !== 'teacher') {
        return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
      }
    }
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

/**
 * @route   POST /api/analytics/track-visit
 * @desc    Track page visit
 * @access  Public
 */
router.post('/track-visit', (req, res) => {
  try {
    incrementAnalytic('visits');
    res.status(200).json({ message: 'Visit tracked' });
  } catch (error) {
    console.error('Track visit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/analytics/track-feature
 * @desc    Track accessibility feature usage
 * @access  Private
 */
router.post('/track-feature', authMiddleware, (req, res) => {
  try {
    const { feature } = req.body;
    
    if (!feature) {
      return res.status(400).json({ message: 'Feature name is required' });
    }
    
    trackFeatureUsage(feature);
    res.status(200).json({ message: 'Feature usage tracked' });
  } catch (error) {
    console.error('Track feature error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get analytics dashboard data
 * @access  Private (teachers only)
 */
router.get('/dashboard', authMiddleware, (req, res) => {
  try {
    const analytics = getAnalytics();
    
    if (!analytics) {
      return res.status(500).json({ message: 'Error fetching analytics' });
    }
    
    res.status(200).json({ analytics });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;