import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useExamLockdown } from '@/hooks/useExamLockdown';

interface SecurityViolation {
  type: string;
  timestamp: number;
  details?: string;
}

interface ExamLockdownContextProps {
  hideNavbar: boolean;
  isLockdownActive: boolean;
  securityViolations: SecurityViolation[];
  warningCount: number;
  startSecureExam: () => Promise<boolean>;
  endSecureExam: () => Promise<{
    examDuration: number;
    securityViolations: SecurityViolation[];
  }>;
  showSecurityNotice: boolean;
  toggleSecurityNotice: (show: boolean) => void;
  examStartTime: number | null;
  getExamDuration: () => number;
}

interface ExamLockdownProviderProps {
  children: ReactNode;
  allowAccessibilityFeatures?: boolean;
  allowedAccessibilityFeatures?: string[];
  autoSubmitOnViolation?: boolean;
  maxWarnings?: number;
  loggingEnabled?: boolean;
  onExitLockdown?: () => void;
}

const ExamLockdownContext = createContext<ExamLockdownContextProps | undefined>(undefined);

export const ExamLockdownProvider: React.FC<ExamLockdownProviderProps> = ({ 
  children,
  allowAccessibilityFeatures = true,
  allowedAccessibilityFeatures = [
    'Ctrl+Alt+z', // Example accessibility shortcut
    'Alt+1',      // Example screen reader shortcut
  ],
  autoSubmitOnViolation = true,
  maxWarnings = 3,
  loggingEnabled = true,
  onExitLockdown
}) => {
  const { 
    hideNavbar, 
    isLockdownActive, 
    securityViolations,
    warningCount,
    startSecureExam, 
    endSecureExam, 
    showSecurityNotice, 
    toggleSecurityNotice,
    examStartTime,
    getExamDuration
  } = useExamLockdown({
    allowAccessibilityFeatures,
    allowedAccessibilityFeatures,
    autoSubmitOnViolation,
    maxWarnings,
    loggingEnabled,
    onExitLockdown
  });

  return (
    <ExamLockdownContext.Provider
      value={{
        hideNavbar,
        isLockdownActive,
        securityViolations,
        warningCount,
        startSecureExam,
        endSecureExam,
        showSecurityNotice,
        toggleSecurityNotice,
        examStartTime,
        getExamDuration
      }}
    >
      {children}
    </ExamLockdownContext.Provider>
  );
};

export const useExamLockdownContext = (): ExamLockdownContextProps => {
  const context = useContext(ExamLockdownContext);
  if (!context) {
    throw new Error('useExamLockdownContext must be used within an ExamLockdownProvider');
  }
  return context;
};