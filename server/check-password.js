/**
 * Simple login tester script
 */
const bcrypt = require('bcryptjs');

// Test password
const password = 'password123';
const hash = '$2a$10$DaXyXRZUd1HGk9PJ6ICk1.POGfhh7F3BvKXtHCFHpVpGUxtu.7cKi';

// Compare the passwords
bcrypt.compare(password, hash, (err, isMatch) => {
  if (err) {
    console.error('Error comparing passwords:', err);
  } else {
    console.log('Password match:', isMatch);
  }
});