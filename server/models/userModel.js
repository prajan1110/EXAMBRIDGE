/**
 * User model definition
 * Contains all user data including authentication and accessibility details
 */

class User {
  constructor(data) {
    this.id = data.id || Math.random().toString(36).substring(2, 15);
    this.name = data.name || '';
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || 'student';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.lastLogin = data.lastLogin || null;
    
    // Accessibility related fields
    this.disabilityType = data.disabilityType || 'none'; 
    this.verificationStatus = data.disabilityType === 'none' ? 'none' : 'pending';
    this.certificateUrl = data.certificateUrl || null;
    this.recommendedFeatures = data.recommendedFeatures || [];
    
    // User preferences for accessibility features
    this.accessibilityFeatures = data.accessibilityFeatures || {
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
  }

  // Remove sensitive data before sending to client
  toPublic() {
    const { password, ...publicData } = this;
    return publicData;
  }
}

module.exports = User;