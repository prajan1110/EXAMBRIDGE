/**
 * Data storage utility
 * Handles persistence of user data and analytics in JSON files
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// File paths
const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');

/**
 * Initialize data files if they don't exist
 */
function initializeDataFiles() {
  // Create data directory if it doesn't exist
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  // Create users file if it doesn't exist
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  }
  
  // Create analytics file if it doesn't exist
  if (!fs.existsSync(ANALYTICS_FILE)) {
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify({
      visits: 0,
      signups: 0,
      logins: 0,
      accessibilityFeatureUsage: {
        tts: 0,
        stt: 0,
        dyslexicFont: 0,
        highContrast: 0,
        darkMode: 0,
        extraTime: 0,
        captions: 0,
        keyboardOnly: 0
      },
      disabilityStats: {
        none: 0,
        dyslexia: 0,
        'low-vision': 0,
        hearing: 0,
        motor: 0,
        adhd: 0
      },
      verificationStats: {
        pending: 0,
        verified: 0,
        rejected: 0
      }
    }));
  }
}

/**
 * Get all users
 */
function getAllUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
}

/**
 * Save all users
 */
function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing users file:', error);
    return false;
  }
}

/**
 * Get user by email
 */
function getUserByEmail(email) {
  const users = getAllUsers();
  return users.find(user => user.email === email);
}

/**
 * Get user by ID
 */
function getUserById(id) {
  const users = getAllUsers();
  return users.find(user => user.id === id);
}

/**
 * Create a new user
 */
async function createUser(userData) {
  try {
    // Check if user already exists
    const existingUser = getUserByEmail(userData.email);
    if (existingUser) {
      return { success: false, message: 'Email already in use' };
    }

    const users = getAllUsers();
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);
    
    users.push(userData);
    saveUsers(users);
    
    // Update analytics
    incrementAnalytic('signups');
    incrementDisabilityStatistic(userData.disabilityType);
    
    if (userData.disabilityType !== 'none') {
      incrementVerificationStatistic('pending');
    }
    
    return { success: true, user: userData };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, message: 'Error creating user' };
  }
}

/**
 * Update user by ID
 */
function updateUser(id, updates) {
  try {
    const users = getAllUsers();
    const index = users.findIndex(user => user.id === id);
    
    if (index === -1) {
      return { success: false, message: 'User not found' };
    }
    
    // If verification status changed, update analytics
    if (updates.verificationStatus && updates.verificationStatus !== users[index].verificationStatus) {
      if (users[index].verificationStatus === 'pending') {
        decrementVerificationStatistic('pending');
      }
      incrementVerificationStatistic(updates.verificationStatus);
    }
    
    // Merge updates with existing user
    users[index] = { ...users[index], ...updates };
    saveUsers(users);
    
    return { success: true, user: users[index] };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, message: 'Error updating user' };
  }
}

/**
 * Delete user by ID
 */
function deleteUser(id) {
  try {
    let users = getAllUsers();
    const userToDelete = users.find(user => user.id === id);
    
    if (!userToDelete) {
      return { success: false, message: 'User not found' };
    }
    
    users = users.filter(user => user.id !== id);
    saveUsers(users);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, message: 'Error deleting user' };
  }
}

/**
 * Get analytics data
 */
function getAnalytics() {
  try {
    const data = fs.readFileSync(ANALYTICS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading analytics file:', error);
    return null;
  }
}

/**
 * Save analytics data
 */
function saveAnalytics(data) {
  try {
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing analytics file:', error);
    return false;
  }
}

/**
 * Increment a top-level analytic
 */
function incrementAnalytic(key) {
  try {
    const analytics = getAnalytics();
    if (analytics && analytics[key] !== undefined) {
      analytics[key] += 1;
      saveAnalytics(analytics);
    }
  } catch (error) {
    console.error(`Error incrementing analytic ${key}:`, error);
  }
}

/**
 * Increment a disability statistic
 */
function incrementDisabilityStatistic(disabilityType) {
  try {
    const analytics = getAnalytics();
    if (analytics && analytics.disabilityStats && analytics.disabilityStats[disabilityType] !== undefined) {
      analytics.disabilityStats[disabilityType] += 1;
      saveAnalytics(analytics);
    }
  } catch (error) {
    console.error(`Error incrementing disability statistic ${disabilityType}:`, error);
  }
}

/**
 * Decrement a disability statistic
 */
function decrementDisabilityStatistic(disabilityType) {
  try {
    const analytics = getAnalytics();
    if (analytics && analytics.disabilityStats && analytics.disabilityStats[disabilityType] !== undefined) {
      analytics.disabilityStats[disabilityType] = Math.max(0, analytics.disabilityStats[disabilityType] - 1);
      saveAnalytics(analytics);
    }
  } catch (error) {
    console.error(`Error decrementing disability statistic ${disabilityType}:`, error);
  }
}

/**
 * Increment a verification statistic
 */
function incrementVerificationStatistic(status) {
  try {
    const analytics = getAnalytics();
    if (analytics && analytics.verificationStats && analytics.verificationStats[status] !== undefined) {
      analytics.verificationStats[status] += 1;
      saveAnalytics(analytics);
    }
  } catch (error) {
    console.error(`Error incrementing verification statistic ${status}:`, error);
  }
}

/**
 * Decrement a verification statistic
 */
function decrementVerificationStatistic(status) {
  try {
    const analytics = getAnalytics();
    if (analytics && analytics.verificationStats && analytics.verificationStats[status] !== undefined) {
      analytics.verificationStats[status] = Math.max(0, analytics.verificationStats[status] - 1);
      saveAnalytics(analytics);
    }
  } catch (error) {
    console.error(`Error decrementing verification statistic ${status}:`, error);
  }
}

/**
 * Track accessibility feature usage
 */
function trackFeatureUsage(feature) {
  try {
    const analytics = getAnalytics();
    if (analytics && analytics.accessibilityFeatureUsage && analytics.accessibilityFeatureUsage[feature] !== undefined) {
      analytics.accessibilityFeatureUsage[feature] += 1;
      saveAnalytics(analytics);
    }
  } catch (error) {
    console.error(`Error tracking feature usage ${feature}:`, error);
  }
}

module.exports = {
  initializeDataFiles,
  getAllUsers,
  getUserByEmail,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAnalytics,
  incrementAnalytic,
  trackFeatureUsage
};