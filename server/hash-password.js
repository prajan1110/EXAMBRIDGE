/**
 * Password hasher
 */
const bcrypt = require('bcryptjs');

async function hashPassword() {
  const password = 'password123';
  
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash password
    const hash = await bcrypt.hash(password, salt);
    
    console.log('Password:', password);
    console.log('Hash:', hash);
    
    // Verify
    const isMatch = await bcrypt.compare(password, hash);
    console.log('Verification:', isMatch);
  } catch (error) {
    console.error('Error:', error);
  }
}

hashPassword();