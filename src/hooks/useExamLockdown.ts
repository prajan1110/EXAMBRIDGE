import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface ExamLockdownOptions {
  onExitLockdown?: () => void;
  allowAccessibilityFeatures?: boolean;
  trackAttempts?: boolean;
  autoSubmitOnViolation?: boolean;
  allowedAccessibilityFeatures?: string[];
  loggingEnabled?: boolean;
  maxWarnings?: number;
}

interface SecurityViolation {
  type: string;
  timestamp: number;
  details?: string;
}

export const useExamLockdown = (options: ExamLockdownOptions = {}) => {
  const [isLockdownActive, setIsLockdownActive] = useState(false);
  const [securityViolations, setSecurityViolations] = useState<SecurityViolation[]>([]);
  const [showSecurityNotice, setShowSecurityNotice] = useState(false);
  const [hideNavbar, setHideNavbar] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [examStartTime, setExamStartTime] = useState<number | null>(null);
  const [lastActivityTime, setLastActivityTime] = useState<number | null>(null);
  const inactivityTimer = useRef<number | null>(null);
  const pingInterval = useRef<number | null>(null);

  const maxWarnings = options.maxWarnings || 3;
  const loggingEnabled = options.loggingEnabled !== false;
  const autoSubmitOnViolation = options.autoSubmitOnViolation !== false;

  // Log security violation
  const logViolation = useCallback((type: string, details?: string) => {
    const violation: SecurityViolation = {
      type,
      timestamp: Date.now(),
      details
    };
    
    setSecurityViolations(prev => [...prev, violation]);
    setWarningCount(prevCount => {
      const newCount = prevCount + 1;
      
      if (newCount >= maxWarnings && autoSubmitOnViolation) {
        // Too many violations - trigger submission
        if (options.onExitLockdown) {
          setTimeout(() => {
            toast.error('Maximum security violations reached. Exam submitted.');
            options.onExitLockdown?.();
          }, 500);
        }
      }
      
      return newCount;
    });
    
    // Send to server if logging enabled
    if (loggingEnabled) {
      // This would normally call a server API to log the violation
      console.warn('Security violation:', violation);
      // In a real implementation, this would send data to the server:
      // api.logSecurityViolation(violation);
    }
  }, [maxWarnings, autoSubmitOnViolation, options, loggingEnabled]);

  // Track when the user tries to exit fullscreen
  const handleFullscreenChange = useCallback(() => {
    if (isLockdownActive && !document.fullscreenElement) {
      // User exited fullscreen
      logViolation('FULLSCREEN_EXIT');
      toast.error('Exiting fullscreen is not permitted during the exam');
      
      // Try to re-enter fullscreen
      try {
        document.documentElement.requestFullscreen();
      } catch (error) {
        console.error('Failed to re-enter fullscreen', error);
        
        if (autoSubmitOnViolation && options.onExitLockdown) {
          toast.error('Failed to maintain secure environment. Exam submitted.');
          options.onExitLockdown();
        }
      }
    }
  }, [isLockdownActive, logViolation, autoSubmitOnViolation, options]);

  // Track when user tries to leave the page or switch tabs
  const handleVisibilityChange = useCallback(() => {
    if (isLockdownActive && document.visibilityState === 'hidden') {
      logViolation('PAGE_VISIBILITY_CHANGE', 'Switched tabs or minimized window');
      toast.error('Leaving the exam page is not permitted');
      
      if (autoSubmitOnViolation && options.onExitLockdown) {
        setTimeout(() => {
          toast.error('Security violation: Page visibility changed. Exam submitted.');
          options.onExitLockdown();
        }, 500);
      }
    }
  }, [isLockdownActive, logViolation, autoSubmitOnViolation, options]);

  // Track user activity to detect inactivity or potential cheating patterns
  const trackUserActivity = useCallback(() => {
    setLastActivityTime(Date.now());
  }, []);

  // Keyboard shortcuts prevention
  const preventKeyboardShortcuts = useCallback((event: KeyboardEvent) => {
    if (!isLockdownActive) return;

    // Track activity
    trackUserActivity();

    // Prevent common shortcuts
    const isCmdOrCtrl = event.ctrlKey || event.metaKey;
    const isAlt = event.altKey;
    const isShift = event.shiftKey;
    
    const shortcutCombination = [
      isCmdOrCtrl ? 'Ctrl/Cmd' : '',
      isAlt ? 'Alt' : '',
      isShift ? 'Shift' : '',
      event.key
    ].filter(Boolean).join('+');
    
    // Common browser shortcuts to block
    if (
      // Prevent printing
      (isCmdOrCtrl && event.key === 'p') ||
      // Prevent copying/pasting
      (isCmdOrCtrl && (event.key === 'c' || event.key === 'v' || event.key === 'x')) ||
      // Prevent new tab/window
      (isCmdOrCtrl && event.key === 't') ||
      (isCmdOrCtrl && event.key === 'n') ||
      // Prevent refreshing
      (event.key === 'F5' || (isCmdOrCtrl && event.key === 'r')) ||
      // Prevent browser dev tools
      (event.key === 'F12' || (isCmdOrCtrl && isShift && event.key === 'i')) ||
      // Prevent task manager and system shortcuts on Windows
      (isCmdOrCtrl && isAlt && event.key === 'Delete') ||
      // Prevent Alt+Tab (as much as possible)
      (isAlt && event.key === 'Tab') ||
      // Prevent function keys
      (event.key.match(/^F\d+$/) && event.key !== 'F1')
    ) {
      event.preventDefault();
      event.stopPropagation();
      
      logViolation('KEYBOARD_SHORTCUT', shortcutCombination);
      toast.error('Keyboard shortcuts are disabled during the exam');
      return false;
    }
    
    // Allow accessibility-related shortcuts if enabled
    if (options.allowAccessibilityFeatures && options.allowedAccessibilityFeatures) {
      // Whitelist of allowed shortcuts for accessibility
      const isAllowedShortcut = options.allowedAccessibilityFeatures.some(shortcut => 
        shortcutCombination.includes(shortcut)
      );
      
      if (isAllowedShortcut) {
        return true;
      }
    }
  }, [isLockdownActive, trackUserActivity, logViolation, options.allowAccessibilityFeatures, options.allowedAccessibilityFeatures]);
  
  // Prevent right-click context menu
  const preventContextMenu = useCallback((event: MouseEvent) => {
    if (isLockdownActive) {
      event.preventDefault();
      logViolation('CONTEXT_MENU');
      toast.error('Context menu is disabled during the exam');
      return false;
    }
  }, [isLockdownActive, logViolation]);

  // Prevent copy/paste
  const preventCopyPaste = useCallback((event: ClipboardEvent) => {
    if (isLockdownActive) {
      event.preventDefault();
      logViolation('CLIPBOARD_OPERATION', event.type);
      toast.error('Copy/paste operations are disabled during the exam');
      return false;
    }
  }, [isLockdownActive, logViolation]);

  // Detect if browser developer tools are open (not 100% reliable but adds a layer)
  const detectDevTools = useCallback(() => {
    const threshold = 160;
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    
    if (isLockdownActive && (widthThreshold || heightThreshold)) {
      logViolation('DEV_TOOLS_OPEN', `Width diff: ${window.outerWidth - window.innerWidth}, Height diff: ${window.outerHeight - window.innerHeight}`);
      toast.error('Developer tools are not allowed during the exam');
      
      if (autoSubmitOnViolation && options.onExitLockdown) {
        toast.error('Security violation: Developer tools detected. Exam submitted.');
        options.onExitLockdown();
      }
    }
  }, [isLockdownActive, logViolation, autoSubmitOnViolation, options]);

  // Monitor for multiple display setups
  const detectMultipleDisplays = useCallback(() => {
    if (isLockdownActive && window.screen?.availWidth && window.screen?.width) {
      // This is not 100% reliable but can detect some multiple display setups
      if (window.screen.availWidth !== window.screen.width) {
        logViolation('MULTIPLE_DISPLAYS_SUSPECTED');
        toast.warning('Multiple displays detected. This may not be allowed by your instructor.');
      }
    }
  }, [isLockdownActive, logViolation]);

  // Start the secure exam environment
  const startSecureExam = useCallback(async () => {
    try {
      // Request fullscreen
      await document.documentElement.requestFullscreen();
      
      // Hide navbar
      setHideNavbar(true);
      
      // Add class to hide navbar in body
      document.body.classList.add('exam-lockdown-mode');
      
      // Set start time
      const startTime = Date.now();
      setExamStartTime(startTime);
      setLastActivityTime(startTime);
      
      // Activate lockdown mode
      setIsLockdownActive(true);
      setSecurityViolations([]);
      setWarningCount(0);
      
      // Focus window
      window.focus();
      
      toast.success('Secure exam environment activated');
      
      return true;
    } catch (error) {
      console.error('Failed to start secure exam:', error);
      toast.error('Failed to start secure exam. Please ensure fullscreen is allowed.');
      return false;
    }
  }, []);
  
  // End the secure exam environment
  const endSecureExam = useCallback(async () => {
    setIsLockdownActive(false);
    setHideNavbar(false);
    
    // Remove class that hides navbar
    document.body.classList.remove('exam-lockdown-mode');
    
    // Exit fullscreen if currently in fullscreen mode
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
    
    // Clear timers
    if (inactivityTimer.current) {
      window.clearInterval(inactivityTimer.current);
      inactivityTimer.current = null;
    }
    
    if (pingInterval.current) {
      window.clearInterval(pingInterval.current);
      pingInterval.current = null;
    }
    
    toast.info('Exam environment deactivated');
    
    // Return exam duration and violations for reporting
    const endTime = Date.now();
    return {
      examDuration: examStartTime ? endTime - examStartTime : 0,
      securityViolations
    };
  }, [examStartTime, securityViolations]);

  // Toggle security notice modal
  const toggleSecurityNotice = useCallback((show: boolean) => {
    setShowSecurityNotice(show);
  }, []);

  // Check if user has been inactive for too long (potential cheating indicator)
  useEffect(() => {
    if (isLockdownActive && lastActivityTime) {
      inactivityTimer.current = window.setInterval(() => {
        const now = Date.now();
        const inactiveTime = now - lastActivityTime!;
        
        // If inactive for more than 2 minutes, log a warning
        if (inactiveTime > 2 * 60 * 1000) {
          logViolation('EXTENDED_INACTIVITY', `Inactive for ${Math.floor(inactiveTime/1000)}s`);
          toast.warning('Extended inactivity detected. Please continue your exam.');
          
          // Reset timer to prevent multiple warnings
          setLastActivityTime(now);
        }
      }, 30000) as unknown as number; // Check every 30 seconds
    }
    
    return () => {
      if (inactivityTimer.current) {
        window.clearInterval(inactivityTimer.current);
      }
    };
  }, [isLockdownActive, lastActivityTime, logViolation]);

  // Periodically check for developer tools and other potential violations
  useEffect(() => {
    if (isLockdownActive) {
      pingInterval.current = window.setInterval(() => {
        detectDevTools();
        detectMultipleDisplays();
      }, 5000) as unknown as number; // Check every 5 seconds
    }
    
    return () => {
      if (pingInterval.current) {
        window.clearInterval(pingInterval.current);
      }
    };
  }, [isLockdownActive, detectDevTools, detectMultipleDisplays]);

  // Set up and tear down event listeners
  useEffect(() => {
    if (isLockdownActive) {
      // Add all event listeners
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('keydown', preventKeyboardShortcuts);
      document.addEventListener('contextmenu', preventContextMenu);
      document.addEventListener('copy', preventCopyPaste);
      document.addEventListener('cut', preventCopyPaste);
      document.addEventListener('paste', preventCopyPaste);
      
      // Track mouse movement and clicks
      document.addEventListener('mousemove', trackUserActivity);
      document.addEventListener('click', trackUserActivity);
      document.addEventListener('keypress', trackUserActivity);
      document.addEventListener('scroll', trackUserActivity);
      
      // Disable browser back button
      window.history.pushState(null, '', window.location.href);
      const handlePopState = () => {
        window.history.pushState(null, '', window.location.href);
        logViolation('BROWSER_NAVIGATION', 'Back button');
        toast.error('Navigation is disabled during the exam');
      };
      window.addEventListener('popstate', handlePopState);
      
      // Disable browser beforeunload 
      const handleBeforeUnload = (event: BeforeUnloadEvent) => {
        logViolation('PAGE_UNLOAD_ATTEMPT');
        event.preventDefault();
        event.returnValue = '';
        return '';
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      // Listen for blur event
      const handleBlur = () => {
        if (document.visibilityState === 'visible') { // Only if the page is still visible (not tab switch)
          logViolation('WINDOW_BLUR');
          toast.warning('Window focus lost. Please stay in the exam window.');
          window.focus(); // Try to refocus
        }
      };
      window.addEventListener('blur', handleBlur);
      
      // Clean up function
      return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('keydown', preventKeyboardShortcuts);
        document.removeEventListener('contextmenu', preventContextMenu);
        document.removeEventListener('copy', preventCopyPaste);
        document.removeEventListener('cut', preventCopyPaste);
        document.removeEventListener('paste', preventCopyPaste);
        document.removeEventListener('mousemove', trackUserActivity);
        document.removeEventListener('click', trackUserActivity);
        document.removeEventListener('keypress', trackUserActivity);
        document.removeEventListener('scroll', trackUserActivity);
        window.removeEventListener('popstate', handlePopState);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('blur', handleBlur);
      };
    }
  }, [
    isLockdownActive, 
    handleFullscreenChange, 
    handleVisibilityChange, 
    preventKeyboardShortcuts,
    preventContextMenu,
    preventCopyPaste,
    trackUserActivity,
    logViolation
  ]);

  return {
    isLockdownActive,
    securityViolations,
    warningCount,
    startSecureExam,
    endSecureExam,
    showSecurityNotice,
    toggleSecurityNotice,
    hideNavbar,
    examStartTime,
    getExamDuration: () => examStartTime ? Date.now() - examStartTime : 0,
  };
};