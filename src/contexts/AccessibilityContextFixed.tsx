import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, analyticsAPI } from '../services/api';
import { certificateAPI } from '../services/certificateAPI';
import { toast } from 'sonner';

export type DisabilityType = 'none' | 'dyslexia' | 'low-vision' | 'hearing' | 'motor' | 'adhd';
export type VerificationStatus = 'none' | 'pending' | 'verified' | 'rejected';

export interface AccessibilityFeatures {
  tts: boolean;
  dyslexicFont: boolean;
  highContrast: boolean;
  fontSize: number;
  darkMode: boolean;
  extraTime: boolean;
  keyboardOnly: boolean;
  // Remaining enhanced accessibility features
  wordSpacing: number;
  colorTheme: 'default' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'monochrome';
  lineFocusMode: boolean;
  screenMagnifier: boolean;
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
}

interface AccessibilityContextType {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  features: AccessibilityFeatures;
  updateFeature: (key: keyof AccessibilityFeatures, value: boolean | number) => void;
  applyRecommendedFeatures: (features: string[]) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: 'student' | 'teacher', disabilityType?: DisabilityType) => Promise<void>;
  signup: (email: string, password: string, name: string, role: 'student' | 'teacher', disabilityType?: DisabilityType) => Promise<void>;
  logout: () => void;
  uploadCertificate: (file: File) => Promise<void>;
  updateVerificationStatus: (userId: string, status: VerificationStatus, features?: string[]) => Promise<void>;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const defaultFeatures: AccessibilityFeatures = {
  tts: false,
  dyslexicFont: false,
  highContrast: false,
  fontSize: 16,
  darkMode: false,
  extraTime: false,
  keyboardOnly: false,
  // Remaining enhanced accessibility features with default values
  wordSpacing: 0, // 0 = normal spacing, positive values increase spacing
  colorTheme: 'default',
  lineFocusMode: false,
  screenMagnifier: false,
};

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [features, setFeatures] = useState<AccessibilityFeatures>(defaultFeatures);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Refs for event listeners and observers
  const wordSpacingObserverRef = React.useRef<MutationObserver | null>(null);
  const mouseMoveListenerRef = React.useRef<((e: MouseEvent) => void) | null>(null);
  const lineFocusListenerRef = React.useRef<((e: MouseEvent) => void) | null>(null);
  const keyboardNavListenerRef = React.useRef<((e: KeyboardEvent) => void) | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const storedProfile = localStorage.getItem('userProfile');
    const storedFeatures = localStorage.getItem('a11yFeatures');
    
    if (storedProfile) {
      const parsedProfile = JSON.parse(storedProfile);
      setProfile(parsedProfile);
      setIsAuthenticated(true);
    }
    
    if (storedFeatures) {
      setFeatures(JSON.parse(storedFeatures));
    }
    
    // Cleanup function for component unmount
    return () => {
      // Clean up any observers and event listeners
      if (wordSpacingObserverRef.current) {
        wordSpacingObserverRef.current.disconnect();
        wordSpacingObserverRef.current = null;
      }
      
      if (mouseMoveListenerRef.current) {
        document.removeEventListener('mousemove', mouseMoveListenerRef.current);
        mouseMoveListenerRef.current = null;
      }
      
      if (lineFocusListenerRef.current) {
        document.removeEventListener('mousemove', lineFocusListenerRef.current);
        lineFocusListenerRef.current = null;
      }
      
      if (keyboardNavListenerRef.current) {
        document.removeEventListener('keydown', keyboardNavListenerRef.current);
        keyboardNavListenerRef.current = null;
      }
      
      // Remove any created elements
      const elements = [
        'screen-magnifier',
        'line-focus-overlay',
        'focus-tracker'
      ];
      
      elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.remove();
      });
    };
  }, []);

  // Apply features to DOM
  useEffect(() => {
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

    // Store a reference to the word spacing observer
    const wordSpacingObserverRef = React.useRef<MutationObserver | null>(null);
    
    // Apply enhanced word spacing - safely with error handling
    try {
      // Set global CSS variable
      document.documentElement.style.setProperty('--word-spacing', `${features.wordSpacing}px`);
      
      // Apply to specific elements with error handling for each element
      const quizElements = document.querySelectorAll('.quiz-question, .quiz-option, .quiz-content p, .quiz-content li');
      quizElements.forEach(el => {
        try {
          (el as HTMLElement).style.wordSpacing = `${features.wordSpacing}px`;
          (el as HTMLElement).style.setProperty('word-spacing', `${features.wordSpacing}px`, 'important');
        } catch (error) {
          console.warn('Failed to apply word spacing to element:', error);
        }
      });
      
      // Simpler mutation observer approach
      if (features.wordSpacing > 0) {
        // Clean up previous observer if it exists
        if (wordSpacingObserverRef.current) {
          wordSpacingObserverRef.current.disconnect();
        }
        
        // Create a new observer with proper error handling
        try {
          wordSpacingObserverRef.current = new MutationObserver(mutations => {
            try {
              mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                  mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                      try {
                        const addedElement = node as Element;
                        const textElements = addedElement.querySelectorAll('p, .quiz-question, .quiz-option');
                        textElements.forEach(el => {
                          try {
                            (el as HTMLElement).style.wordSpacing = `${features.wordSpacing}px`;
                          } catch (err) {
                            // Silently fail for individual elements
                          }
                        });
                      } catch (err) {
                        // Silently fail for individual nodes
                      }
                    }
                  });
                }
              });
            } catch (observerError) {
              console.warn('Word spacing observer error:', observerError);
            }
          });
          
          // Start observing with a more limited scope
          wordSpacingObserverRef.current.observe(document.body, { 
            childList: true, 
            subtree: true 
          });
        } catch (err) {
          console.warn('Failed to create word spacing observer:', err);
        }
      } else if (wordSpacingObserverRef.current) {
        // Safely disconnect observer
        try {
          wordSpacingObserverRef.current.disconnect();
          wordSpacingObserverRef.current = null;
        } catch (err) {
          console.warn('Error disconnecting word spacing observer:', err);
        }
      }
    } catch (wordSpacingError) {
      console.error('Word spacing application error:', wordSpacingError);
    }

    // Apply color theme
    document.documentElement.setAttribute('data-color-theme', features.colorTheme);
    document.documentElement.classList.remove(
      'theme-protanopia', 
      'theme-deuteranopia', 
      'theme-tritanopia', 
      'theme-monochrome'
    );
    if (features.colorTheme !== 'default') {
      document.documentElement.classList.add(`theme-${features.colorTheme}`);
    }

    // Apply enhanced line focus mode with dynamic reading guide
    if (features.lineFocusMode) {
      document.documentElement.classList.add('line-focus-mode');
      
      // Create or update the line focus overlay if it doesn't exist
      let focusOverlay = document.getElementById('line-focus-overlay');
      if (!focusOverlay) {
        focusOverlay = document.createElement('div');
        focusOverlay.id = 'line-focus-overlay';
        document.body.appendChild(focusOverlay);
      }
      
      // Create a focus tracker element if it doesn't exist
      let focusTracker = document.getElementById('focus-tracker');
      if (!focusTracker) {
        focusTracker = document.createElement('div');
        focusTracker.id = 'focus-tracker';
        document.body.appendChild(focusTracker);
        
        // Helper function to get focusable text elements
        const getFocusableElements = () => {
          return document.querySelectorAll('.quiz-content p, .quiz-question, .quiz-option, p, li');
        };
        
        // Create reference to current focused element
        let currentFocusedElement: Element | null = null;
        
        // Function to position the tracker over an element
        const positionTrackerOnElement = (element: Element) => {
          if (!element) return;
          
          const rect = element.getBoundingClientRect();
          focusTracker.style.width = `${rect.width + 16}px`;
          focusTracker.style.top = `${rect.top + window.scrollY}px`;
          focusTracker.style.left = `${rect.left - 8}px`;
          focusTracker.style.height = `${rect.height}px`;
          
          // Highlight the element
          currentFocusedElement = element;
          element.classList.add('focus-highlight');
          
          // Ensure element is in view
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };
        
        // Create mouse move handler for dynamic focus
        const mouseMoveHandler = (e: MouseEvent) => {
          // Get elements that can be focused
          const elements = getFocusableElements();
          
          // Find the element under the mouse
          for (const element of elements) {
            const rect = element.getBoundingClientRect();
            
            if (
              e.clientY >= rect.top &&
              e.clientY <= rect.bottom &&
              e.clientX >= rect.left &&
              e.clientX <= rect.right
            ) {
              // Position the tracker on this element
              positionTrackerOnElement(element);
              break;
            }
          }
        };
        
        // Create keyboard navigation handler
        const keyboardNavHandler = (e: KeyboardEvent) => {
          if (!features.lineFocusMode) return;
          
          const elements = Array.from(getFocusableElements());
          if (elements.length === 0) return;
          
          let currentIndex = -1;
          if (currentFocusedElement) {
            currentIndex = elements.indexOf(currentFocusedElement);
          }
          
          // Navigate with arrow keys
          switch (e.key) {
            case 'ArrowDown':
              e.preventDefault();
              currentIndex = Math.min(elements.length - 1, currentIndex + 1);
              break;
            case 'ArrowUp':
              e.preventDefault();
              currentIndex = Math.max(0, currentIndex - 1);
              break;
            default:
              return;
          }
          
          // Remove highlight from all elements
          elements.forEach(el => el.classList.remove('focus-highlight'));
          
          // Position tracker on the new element
          positionTrackerOnElement(elements[currentIndex]);
        };
        
        // Store references for cleanup
        lineFocusListenerRef.current = mouseMoveHandler;
        keyboardNavListenerRef.current = keyboardNavHandler;
        
        // Add event listeners
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('keydown', keyboardNavHandler);
        
        // Initial focus on first element if available
        const firstElement = document.querySelector('.quiz-question, .quiz-content p');
        if (firstElement) {
          setTimeout(() => positionTrackerOnElement(firstElement), 300);
        }
      }
    } else {
      document.documentElement.classList.remove('line-focus-mode');
      
      // Clean up overlay
      const focusOverlay = document.getElementById('line-focus-overlay');
      if (focusOverlay) {
        focusOverlay.remove();
      }
      
      // Clean up focus tracker
      const focusTracker = document.getElementById('focus-tracker');
      if (focusTracker) {
        focusTracker.remove();
      }
      
      // Remove event listeners
      if (lineFocusListenerRef.current) {
        document.removeEventListener('mousemove', lineFocusListenerRef.current);
        lineFocusListenerRef.current = null;
      }
      
      if (keyboardNavListenerRef.current) {
        document.removeEventListener('keydown', keyboardNavListenerRef.current);
        keyboardNavListenerRef.current = null;
      }
      
      // Remove highlight class from any elements
      document.querySelectorAll('.focus-highlight').forEach(el => {
        el.classList.remove('focus-highlight');
      });
    }

    // Apply enhanced screen magnifier with better performance
    if (features.screenMagnifier) {
      document.documentElement.classList.add('screen-magnifier-enabled');
      // Create the magnifier element if it doesn't exist
      let magnifier = document.getElementById('screen-magnifier');
      
      if (!magnifier) {
        magnifier = document.createElement('div');
        magnifier.id = 'screen-magnifier';
        
        const magnifierContent = document.createElement('div');
        magnifierContent.className = 'screen-magnifier-content';
        magnifier.appendChild(magnifierContent);
        
        // Add controls for zoom level
        const controls = document.createElement('div');
        controls.id = 'magnifier-controls';
        
        const zoomInBtn = document.createElement('button');
        zoomInBtn.innerHTML = '+';
        zoomInBtn.setAttribute('aria-label', 'Increase zoom');
        zoomInBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const currentZoom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--magnifier-zoom'));
          if (currentZoom < 4) {
            document.documentElement.style.setProperty('--magnifier-zoom', (currentZoom + 0.5).toString());
          }
        });
        
        const zoomOutBtn = document.createElement('button');
        zoomOutBtn.innerHTML = '-';
        zoomOutBtn.setAttribute('aria-label', 'Decrease zoom');
        zoomOutBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const currentZoom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--magnifier-zoom'));
          if (currentZoom > 1.5) {
            document.documentElement.style.setProperty('--magnifier-zoom', (currentZoom - 0.5).toString());
          }
        });
        
        controls.appendChild(zoomOutBtn);
        controls.appendChild(zoomInBtn);
        magnifier.appendChild(controls);
        
        document.body.appendChild(magnifier);
        
        // Use a throttled mouse move event for better performance
        let lastUpdate = 0;
        const updateFrequency = 20; // ms
        
        const mouseMoveListener = (e: MouseEvent) => {
          const now = Date.now();
          if (now - lastUpdate < updateFrequency) return;
          lastUpdate = now;
          
          if (!features.screenMagnifier) return;
          
          const x = e.clientX;
          const y = e.clientY;
          
          // Update magnifier position
          magnifier.style.left = `${x}px`;
          magnifier.style.top = `${y}px`;
          
          // Use fallback rendering method that's safer
          const magnifierContent = magnifier.querySelector('.screen-magnifier-content') as HTMLElement;
          if (magnifierContent) {
            try {
              // Temporarily hide magnifier to get element below
              magnifier.style.display = 'none';
              const elemBelow = document.elementFromPoint(x, y);
              magnifier.style.display = 'block';
              
              if (elemBelow && elemBelow !== magnifier && !magnifier.contains(elemBelow)) {
                // Get element text content for simple magnifier
                const text = elemBelow.textContent || '';
                const tag = (elemBelow as HTMLElement).tagName.toLowerCase();
                
                // Clear previous content
                magnifierContent.innerHTML = '';
                
                // Create a simple element to display
                const displayElem = document.createElement('div');
                displayElem.textContent = text;
                displayElem.style.fontSize = '16px';
                displayElem.style.maxWidth = '80%';
                displayElem.style.maxHeight = '80%';
                displayElem.style.overflow = 'hidden';
                displayElem.style.textAlign = 'center';
                
                // Append simple element to magnifier
                magnifierContent.appendChild(displayElem);
                
                // Apply styling based on element type
                if (tag === 'button' || tag === 'a') {
                  displayElem.style.color = 'blue';
                } else if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
                  displayElem.style.fontWeight = 'bold';
                }
              }
            } catch (err) {
              console.error("Screen magnifier rendering error:", err);
            }
          }
        };
        
        // Store reference for cleanup
        mouseMoveListenerRef.current = mouseMoveListener;
        
        // Add event listener
        document.addEventListener('mousemove', mouseMoveListener);
        
        // Handle keyboard control for accessibility
        document.addEventListener('keydown', (e) => {
          if (!features.screenMagnifier) return;
          
          // Arrow keys to move the magnifier
          const step = 10;
          const currentX = parseInt(magnifier.style.left || '0');
          const currentY = parseInt(magnifier.style.top || '0');
          
          switch (e.key) {
            case 'ArrowUp':
              magnifier.style.top = `${currentY - step}px`;
              break;
            case 'ArrowDown':
              magnifier.style.top = `${currentY + step}px`;
              break;
            case 'ArrowLeft':
              magnifier.style.left = `${currentX - step}px`;
              break;
            case 'ArrowRight':
              magnifier.style.left = `${currentX + step}px`;
              break;
          }
        });
      }
    } else {
      document.documentElement.classList.remove('screen-magnifier-enabled');
      const magnifier = document.getElementById('screen-magnifier');
      if (magnifier) {
        // Remove event listeners before removing element
        if (mouseMoveListenerRef.current) {
          document.removeEventListener('mousemove', mouseMoveListenerRef.current);
          mouseMoveListenerRef.current = null;
        }
        magnifier.remove();
      }
    }

    document.documentElement.style.fontSize = `${features.fontSize}px`;

    localStorage.setItem('a11yFeatures', JSON.stringify(features));
  }, [features]);

  const updateFeature = (key: keyof AccessibilityFeatures, value: boolean | number) => {
    setFeatures(prev => ({ ...prev, [key]: value }));
  };

  // Enhanced function to apply and filter features based on disability type
  const applyRecommendedFeatures = (recommendedFeatures: string[], disabilityType: DisabilityType = 'none') => {
    try {
      const newFeatures = { ...defaultFeatures };
      
      // Apply recommended features
      recommendedFeatures.forEach(feature => {
        if (feature in newFeatures) {
          (newFeatures as any)[feature] = true;
        }
      });
      
      // Apply disability-specific features and filters
      switch (disabilityType) {
        case 'dyslexia':
          // Enable dyslexic font, word spacing, and color themes
          newFeatures.dyslexicFont = true;
          newFeatures.wordSpacing = Math.max(newFeatures.wordSpacing, 2); // Minimum word spacing of 2px
          break;
          
        case 'low-vision':
          // Enable high contrast, larger font, screen magnifier
          newFeatures.highContrast = true;
          newFeatures.fontSize = Math.max(newFeatures.fontSize, 18); // Minimum font size of 18px
          newFeatures.screenMagnifier = true;
          break;
          
        case 'hearing':
          // No specific features needed as we removed captions/STT
          // But could enable visual indicators
          newFeatures.highContrast = true;
          break;
          
        case 'motor':
          // Enable keyboard navigation features
          newFeatures.keyboardOnly = true;
          break;
          
        case 'adhd':
          // Enable line focus mode to help with concentration
          newFeatures.lineFocusMode = true;
          break;
          
        case 'none':
        default:
          // Disable advanced features for users without disabilities
          newFeatures.dyslexicFont = false;
          newFeatures.screenMagnifier = false;
          newFeatures.lineFocusMode = false;
          break;
      }
      
      // Apply the filtered and enhanced features
      setFeatures(newFeatures);
      
      // Log application of features for debugging
      console.log(`Applied features for ${disabilityType} disability:`, newFeatures);
      
    } catch (error) {
      console.error('Error applying recommended features:', error);
      // Fallback to default features
      setFeatures(defaultFeatures);
    }
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
      } else {
        // Apply disability-specific features using the enhanced function
        // Use user's disability type from response or fall back to provided one
        const userDisabilityType = response.user.disabilityType || disabilityType;
        
        // Get recommended features for this disability type (could be from API)
        let recommendedFeatures: string[] = [];
        
        if (response.user.recommendedFeatures && response.user.recommendedFeatures.length > 0) {
          // Use features from user profile if available
          recommendedFeatures = response.user.recommendedFeatures;
        } else {
          // Default recommended features by disability type
          switch (userDisabilityType) {
            case 'dyslexia':
              recommendedFeatures = ['dyslexicFont', 'wordSpacing'];
              break;
            case 'low-vision':
              recommendedFeatures = ['highContrast', 'fontSize', 'screenMagnifier'];
              break;
            case 'hearing':
              recommendedFeatures = ['highContrast'];
              break;
            case 'motor':
              recommendedFeatures = ['keyboardOnly'];
              break;
            case 'adhd':
              recommendedFeatures = ['lineFocusMode'];
              break;
          }
        }
        
        // Apply the filtered features
        applyRecommendedFeatures(recommendedFeatures, userDisabilityType);
      }
      
      toast.success('Successfully logged in!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login');
      throw error;
    }
  };
  
  const signup = async (email: string, password: string, name: string, role: 'student' | 'teacher', disabilityType: DisabilityType = 'none') => {
    try {
      // Call signup API
      const response = await authAPI.signup({
        email,
        password,
        name,
        role,
        disabilityType
      });
      
      // Set user profile
      setProfile(response.user);
      setIsAuthenticated(true);
      
      // Apply disability-specific features based on the disability type
      // Default recommended features by disability type
      let recommendedFeatures: string[] = [];
      
      switch (disabilityType) {
        case 'dyslexia':
          recommendedFeatures = ['dyslexicFont', 'wordSpacing'];
          break;
        case 'low-vision':
          recommendedFeatures = ['highContrast', 'fontSize', 'screenMagnifier'];
          break;
        case 'hearing':
          recommendedFeatures = ['highContrast'];
          break;
        case 'motor':
          recommendedFeatures = ['keyboardOnly'];
          break;
        case 'adhd':
          recommendedFeatures = ['lineFocusMode'];
          break;
      }
      
      // Apply the filtered features
      applyRecommendedFeatures(recommendedFeatures, disabilityType);
      
      toast.success('Account created successfully!');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account');
      throw error;
    }
  };

  // Updated to use proper certificate file upload
  const uploadCertificate = async (file: File) => {
    try {
      if (!profile) {
        throw new Error('You must be logged in to upload a certificate');
      }
      
      // Call certificate upload API
      const response = await certificateAPI.uploadCertificate(file);
      
      // Get current user after upload to ensure profile is updated
      const updatedUserData = await authAPI.getCurrentUser();
      
      // Update profile
      setProfile(updatedUserData);
      
      toast.success('Certificate uploaded successfully! Awaiting verification.');
      return response;
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
      
      // Call verification API
      const response = await authAPI.updateVerification(userId, status, recommendedFeatures);
      
      toast.success('Verification status updated successfully!');
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