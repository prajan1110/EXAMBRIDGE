import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, analyticsAPI } from '../services/api';
import { toast } from 'sonner';
import { accessibilityPalettes, applyColorPalette } from '@/lib/color-utils';

export type DisabilityType = 'none' | 'dyslexia' | 'low-vision' | 'hearing' | 'motor' | 'adhd';
export type VerificationStatus = 'none' | 'pending' | 'verified' | 'rejected';

export interface AccessibilityFeatures {
  tts: boolean;
  stt: boolean; // Adding Speech-to-Text feature
  dyslexicFont: boolean;
  highContrast: boolean;
  fontSize: number;
  darkMode: boolean;
  extraTime: boolean;
  keyboardOnly: boolean;
  // Enhanced accessibility features
  wordSpacing: number;
  colorTheme: 'default' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'monochrome';
  lineFocusMode: boolean;
  screenMagnifier: boolean;
  // New features
  customColorPalette: string; // Name of the color palette from color-utils.ts
  lineHeight: number; // Line height for text readability
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  disabilityType: DisabilityType;
  verificationStatus: VerificationStatus;
  certificateUrl?: string;
  recommendedFeatures: string[];
  accessibilityFeatures?: AccessibilityFeatures;
  languagePreference?: string;
}

interface AccessibilityContextType {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  features: AccessibilityFeatures;
  updateFeature: <T extends keyof AccessibilityFeatures>(key: T, value: AccessibilityFeatures[T]) => void;
  applyRecommendedFeatures: (features: string[]) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: 'student' | 'teacher', disabilityType?: DisabilityType) => Promise<void>;
  signup: (email: string, password: string, name: string, role: 'student' | 'teacher', disabilityType?: DisabilityType, languagePreference?: string) => Promise<void>;
  logout: () => void;
  uploadCertificate: (url: string) => Promise<void>;
  updateVerificationStatus: (userId: string, status: VerificationStatus, features?: string[]) => Promise<void>;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const defaultFeatures: AccessibilityFeatures = {
  tts: false,
  stt: false, // Added Speech-to-Text feature
  dyslexicFont: false,
  highContrast: false,
  fontSize: 16,
  darkMode: false,
  extraTime: false,
  keyboardOnly: false,
  // Enhanced accessibility features with default values
  wordSpacing: 0, // 0 = normal spacing, positive values increase spacing
  colorTheme: 'default',
  lineFocusMode: false,
  screenMagnifier: false,
  // New features
  customColorPalette: 'Default',
  lineHeight: 1.5, // Default line height for readability
};

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [features, setFeatures] = useState<AccessibilityFeatures>(defaultFeatures);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const hasAppliedVerificationRef = React.useRef<string | null>(null);

  // Determine which features are permitted for the current user profile
  const getAllowedFeaturesForProfile = (): Set<keyof AccessibilityFeatures> => {
    // Standard features available to everyone
    const alwaysAllowed: Array<keyof AccessibilityFeatures> = ['darkMode', 'fontSize', 'tts'];
    if (!profile || profile.verificationStatus !== 'verified') {
      return new Set(alwaysAllowed);
    }
    // If verified, allow all features
    return new Set(Object.keys(defaultFeatures) as Array<keyof AccessibilityFeatures>);
  };

  // Filter provided features against policy
  const filterFeaturesByPolicy = (incoming: AccessibilityFeatures): AccessibilityFeatures => {
    const allowed = getAllowedFeaturesForProfile();
    const result: AccessibilityFeatures = { ...defaultFeatures };
    (Object.keys(incoming) as Array<keyof AccessibilityFeatures>).forEach((key) => {
      if (allowed.has(key)) {
        // @ts-expect-error index
        result[key] = incoming[key];
      }
    });
    return result;
  };

  // Load only feature preferences from localStorage on mount (no auto-login)
  useEffect(() => {
    const storedFeatures = localStorage.getItem('a11yFeatures');
    if (storedFeatures) {
      setFeatures(JSON.parse(storedFeatures));
    }
    // Ensure we start logged out regardless of any leftover data
    setProfile(null);
    setIsAuthenticated(false);
    // Optional: clear stale profile cache if it exists
    if (localStorage.getItem('userProfile')) {
      localStorage.removeItem('userProfile');
    }
  }, []);

  // Apply features to DOM (with policy filter)
  useEffect(() => {
    const effective = filterFeaturesByPolicy(features);
    if (features.dyslexicFont) {
      document.body.classList.add('dyslexic-font');
    } else {
      document.body.classList.remove('dyslexic-font');
    }

    if (features.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    if (features.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply enhanced word spacing - specifically target quiz elements
    document.documentElement.style.setProperty('--word-spacing', `${features.wordSpacing}px`);
    
    // Apply directly to all quiz elements for better specificity
    document.querySelectorAll('.quiz-question, .quiz-option, .quiz-content p, .quiz-content li').forEach(el => {
      (el as HTMLElement).style.wordSpacing = `${features.wordSpacing}px`;
    });
    
    // Apply to additional text elements that might be dynamically added
    const styleTag = document.getElementById('accessibility-styles') || document.createElement('style');
    if (!styleTag.id) {
      styleTag.id = 'accessibility-styles';
      document.head.appendChild(styleTag);
    }
    
    // Use !important to ensure styles are applied with highest priority
    styleTag.textContent = `
      .quiz-question, 
      .quiz-option,
      .quiz-content p,
      .quiz-content li,
      .option-letter,
      [data-option],
      .quiz-container * {
        word-spacing: ${features.wordSpacing}px !important;
      }
    `;

    // Apply color theme
    document.documentElement.setAttribute('data-color-theme', effective.colorTheme);
    document.body.classList.remove(
      'theme-protanopia', 
      'theme-deuteranopia', 
      'theme-tritanopia', 
      'theme-monochrome'
    );
    if (effective.colorTheme !== 'default') {
      document.body.classList.add(`theme-${features.colorTheme}`);
      
      // Log theme application for debugging
      console.log(`Applied color theme: ${features.colorTheme}`);
      
      // Apply grayscale filter specifically for monochrome theme
      if (effective.colorTheme === 'monochrome') {
        document.body.style.filter = 'grayscale(1)';
      } else {
        document.body.style.filter = '';
      }
    }
    
    // Apply custom color palette if color theme is default
    if (effective.colorTheme === 'default' && effective.customColorPalette) {
      const selectedPalette = accessibilityPalettes.find(
        palette => palette.name === effective.customColorPalette
      );
      
      if (selectedPalette) {
        applyColorPalette(selectedPalette);
        console.log(`Applied custom color palette: ${effective.customColorPalette}`);
      }
    }
    
    // Apply line height
    document.body.style.lineHeight = `${effective.lineHeight}`;
    // Apply specifically to quiz elements for better readability
    document.querySelectorAll('.quiz-question, .quiz-option, .quiz-content p, .quiz-content li').forEach(el => {
      (el as HTMLElement).style.lineHeight = `${features.lineHeight}`;
    });

    // Apply improved line focus mode
    if (features.lineFocusMode) {
      document.documentElement.classList.add('line-focus-mode');
      // Create or update the line focus overlay if it doesn't exist
      let focusOverlay = document.getElementById('line-focus-overlay');
      if (!focusOverlay) {
        focusOverlay = document.createElement('div');
        focusOverlay.id = 'line-focus-overlay';
        document.body.appendChild(focusOverlay);
      }
    } else {
      document.documentElement.classList.remove('line-focus-mode');
      const focusOverlay = document.getElementById('line-focus-overlay');
      if (focusOverlay) {
        focusOverlay.remove();
      }
    }

    // Apply improved screen magnifier
    if (features.screenMagnifier) {
    document.documentElement.classList.add('screen-magnifier-enabled');
      // Create the magnifier element if it doesn't exist
      let magnifier = document.getElementById('screen-magnifier');
      if (!magnifier) {
        magnifier = document.createElement('div');
        magnifier.id = 'screen-magnifier';
        magnifier.className = 'screen-magnifier';
        
        const magnifierContent = document.createElement('div');
        magnifierContent.className = 'screen-magnifier-content';
        magnifier.appendChild(magnifierContent);
        
        document.body.appendChild(magnifier);
        
        // Add mouse move event listener for the magnifier
        document.addEventListener('mousemove', (e) => {
          if (!features.screenMagnifier) return;
          
          const x = e.clientX;
          const y = e.clientY;
          
          magnifier.style.left = `${x}px`;
          magnifier.style.top = `${y}px`;
          
          // Get the element under the cursor
          const elemBelow = document.elementFromPoint(x, y);
          if (elemBelow && elemBelow !== magnifier) {
            magnifierContent.innerHTML = elemBelow.outerHTML || '';
            magnifierContent.style.transform = `scale(1.75)`;
          }
        });
      }
    } else {
      document.documentElement.classList.remove('screen-magnifier-enabled');
      const magnifier = document.getElementById('screen-magnifier');
      if (magnifier) {
        magnifier.remove();
      }
    }

    document.documentElement.style.fontSize = `${effective.fontSize}px`;

    localStorage.setItem('a11yFeatures', JSON.stringify(effective));
  }, [features, profile]);

  // Auto-apply recommended features once when account becomes verified
  useEffect(() => {
    if (!profile) {
      hasAppliedVerificationRef.current = null;
      return;
    }

    const key = `${profile.id}|${profile.verificationStatus}`;
    if (
      profile.verificationStatus === 'verified' &&
      hasAppliedVerificationRef.current !== key
    ) {
      // Use server-provided recommended features when present; otherwise derive sensible defaults by disability type
      const defaultByType: Record<NonNullable<UserProfile['disabilityType']>, string[]> = {
        'none': [],
        'dyslexia': ['dyslexicFont', 'wordSpacing', 'fontSize', 'tts', 'extraTime'],
        'low-vision': ['highContrast', 'fontSize', 'tts', 'extraTime'],
        'hearing': ['captions', 'extraTime'],
        'motor': ['keyboardOnly', 'extraTime', 'stt'],
        'adhd': ['lineFocusMode', 'fontSize', 'extraTime'],
      };
      const featuresToApply = (Array.isArray(profile.recommendedFeatures) && profile.recommendedFeatures.length > 0)
        ? profile.recommendedFeatures
        : defaultByType[profile.disabilityType] || [];
      applyRecommendedFeatures(featuresToApply);
      hasAppliedVerificationRef.current = key;
    }
  }, [profile]);

  const updateFeature = <T extends keyof AccessibilityFeatures>(key: T, value: AccessibilityFeatures[T]) => {
    const allowed = getAllowedFeaturesForProfile();
    if (!allowed.has(key)) {
      toast.warning('This accessibility feature is available after verification and based on your profile.');
      return;
    }
    setFeatures(prev => ({ ...prev, [key]: value }));
  };

  const applyRecommendedFeatures = (recommendedFeatures: string[]) => {
    const newFeatures = { ...defaultFeatures };
    
    // Process each recommended feature
    recommendedFeatures.forEach(feature => {
      // Handle boolean features
      if (typeof defaultFeatures[feature as keyof AccessibilityFeatures] === 'boolean') {
        (newFeatures as any)[feature] = true;
      } 
      // Handle numeric features with default values when recommended
      else if (feature === 'wordSpacing') {
        newFeatures.wordSpacing = 3; // Default recommended word spacing (3px)
      }
      else if (feature === 'fontSize') {
        newFeatures.fontSize = 18; // Default recommended font size (18px)
      }
    });
    
    // Special handling for specific disability types if available
    if (profile) {
      switch(profile.disabilityType) {
        case 'dyslexia':
          newFeatures.dyslexicFont = true;
          newFeatures.wordSpacing = 3;
          break;
        case 'low-vision':
          newFeatures.fontSize = 20;
          newFeatures.highContrast = true;
          break;
        case 'hearing':
          // No specific font settings needed for hearing impairment
          break;
        case 'motor':
          newFeatures.keyboardOnly = true;
          break;
        case 'adhd':
          newFeatures.lineFocusMode = true;
          break;
        default:
          break;
      }
    }
    
    setFeatures(filterFeaturesByPolicy(newFeatures));
    
    // Also save to localStorage for persistence
    localStorage.setItem('a11yFeatures', JSON.stringify(newFeatures));
  };

  const login = async (email: string, password: string, role: 'student' | 'teacher', disabilityType: DisabilityType = 'none') => {
    try {
      // Track analytics
      analyticsAPI.trackVisit();
      
      // Call login API
      const response = await authAPI.login(email, password);
      
      // Set user profile
      setProfile(response.user);
      setIsAuthenticated(true);
      
      // Apply user's saved accessibility features if they exist
      if (response.user.accessibilityFeatures) {
        setFeatures(response.user.accessibilityFeatures);
      } else if (disabilityType === 'none') {
        // Apply basic features for users without disabilities
        setFeatures(prev => ({ ...prev, tts: false, dyslexicFont: false, highContrast: false }));
      }
      
      toast.success('Successfully logged in!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login');
      throw error;
    }
  };
  
  const signup = async (email: string, password: string, name: string, role: 'student' | 'teacher', disabilityType: DisabilityType = 'none', languagePreference: string = 'english') => {
    try {
      // Call signup API
      const response = await authAPI.signup({
        email,
        password,
        name,
        role,
        disabilityType,
        languagePreference
      });
      // Set user profile
      setProfile(response.user);
      setIsAuthenticated(true);
      // Apply basic features
      if (disabilityType === 'none') {
        setFeatures(prev => ({ ...prev, tts: false, dyslexicFont: false, highContrast: false }));
      }
      toast.success('Account created successfully!');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account');
      throw error;
    }
  };

  const uploadCertificate = async (url: string) => {
    try {
      if (!profile) {
        throw new Error('You must be logged in to upload a certificate');
      }
      
      // Call upload API
      const response = await authAPI.uploadCertificate(url);
      
      // Update profile
      setProfile(response.user);
      
      toast.success('Certificate uploaded successfully! Awaiting verification.');
    } catch (error) {
      console.error('Certificate upload error:', error);
      toast.error(error.message || 'Failed to upload certificate');
      throw error;
    }
  };
  
  const updateVerificationStatus = async (userId: string, status: VerificationStatus, recommendedFeatures: string[] = []) => {
    try {
      if (!profile || profile.role !== 'teacher') {
        throw new Error('Only teachers can update verification status');
      }
      
      // Log the recommended features for debugging
      console.log('Applying recommended features:', recommendedFeatures);
      
      // Call verification API
      const response = await authAPI.updateVerification(userId, status, recommendedFeatures);
      
      // Apply recommended features immediately if this is for the current user
      if (profile.id === userId) {
        applyRecommendedFeatures(recommendedFeatures);
        toast.success('Verification status updated and accessibility features applied!');
      } else {
        toast.success('Verification status updated successfully!');
      }
      
      return response;
    } catch (error) {
      console.error('Update verification error:', error);
      toast.error(error.message || 'Failed to update verification status');
      throw error;
    }
  };

  const logout = () => {
    // Call logout API
    authAPI.logout();
    
    // Clear local state
    setProfile(null);
    setIsAuthenticated(false);
    setFeatures(defaultFeatures);
    
    toast.info('Logged out successfully');
  };

  return (
    <AccessibilityContext.Provider
      value={{
        profile,
        setProfile,
        features,
        updateFeature,
        applyRecommendedFeatures,
        isAuthenticated,
        login,
        signup,
        logout,
        uploadCertificate,
        updateVerificationStatus
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};
