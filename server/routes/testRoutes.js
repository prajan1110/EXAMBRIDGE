/**
 * Test email route for verifying email functionality
 */

const express = require('express');
const router = express.Router();
const { sendWelcomeEmail } = require('../utils/emailUtils');

/**
 * @route   POST /api/test/email
 * @desc    Test email sending functionality
 * @access  Public (for testing only, should be protected in production)
 */
router.post('/email', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    // Basic validation
    if (!email || !name) {
      return res.status(400).json({ message: 'Please provide email and name' });
    }
    
    // Send test email
    const success = await sendWelcomeEmail(email, name);
    
    if (success) {
      return res.status(200).json({ message: 'Test email sent successfully' });
    } else {
      return res.status(500).json({ message: 'Failed to send test email' });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;