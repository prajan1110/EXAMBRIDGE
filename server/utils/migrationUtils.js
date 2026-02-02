/**
 * Database migration utility
 * Handles separation of student and teacher collections while maintaining backward compatibility
 */

const { getUserByEmail, getAllUsers } = require('../utils/dataUtils');

// Collection prefixes for role-based separation
const STUDENT_PREFIX = 'student_';
const TEACHER_PREFIX = 'teacher_';

/**
 * Get the appropriate collection name based on user role
 * @param {string} role - User role ('student' or 'teacher')
 * @returns {string} Collection name with appropriate prefix
 */
function getCollectionName(role) {
  return role === 'teacher' ? `${TEACHER_PREFIX}users` : `${STUDENT_PREFIX}users`;
}

/**
 * Get user by email from appropriate collection
 * @param {string} email - User email
 * @returns {Promise<Object>} User object
 */
async function getRoleBasedUser(email) {
  // First try student collection
  let user = await getUserByEmail(email, getCollectionName('student'));
  if (!user) {
    // If not found, try teacher collection
    user = await getUserByEmail(email, getCollectionName('teacher'));
  }
  return user;
}

/**
 * Migrate existing users to role-based collections
 * @returns {Promise<void>}
 */
async function migrateUsers() {
  try {
    console.log('Starting user migration...');
    const users = await getAllUsers();
    
    for (const user of users) {
      const collection = getCollectionName(user.role);
      // Move user to appropriate collection
      // Note: Implement actual database operations based on your DB system
      console.log(`Migrating user ${user.email} to ${collection}`);
    }
    
    console.log('User migration completed successfully');
  } catch (error) {
    console.error('Error during user migration:', error);
    throw error;
  }
}

module.exports = {
  getCollectionName,
  getRoleBasedUser,
  migrateUsers,
  STUDENT_PREFIX,
  TEACHER_PREFIX
};