import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, X } from 'lucide-react';
import { cva } from 'class-variance-authority';

interface SecurityWarningProps {
  message: string;
  type: 'warning' | 'error' | 'info';
  onDismiss?: () => void;
  autoDismiss?: boolean;
  dismissTime?: number;
  violationCount?: number;
  maxViolations?: number;
}

const warningVariants = cva(
  "fixed z-[9999] px-4 py-2 rounded-lg border shadow-md flex items-center gap-3 transition-all duration-500 max-w-lg",
  {
    variants: {
      type: {
        warning: "bg-warning/20 border-warning text-warning-foreground",
        error: "bg-destructive/20 border-destructive text-destructive-foreground",
        info: "bg-primary/20 border-primary text-primary-foreground"
      },
      position: {
        top: "top-4 left-1/2 -translate-x-1/2",
        bottom: "bottom-4 left-1/2 -translate-x-1/2"
      }
    },
    defaultVariants: {
      type: "warning",
      position: "top"
    }
  }
);

export const ExamSecurityWarning: React.FC<SecurityWarningProps> = ({
  message,
  type = 'warning',
  onDismiss,
  autoDismiss = true,
  dismissTime = 5000,
  violationCount = 0,
  maxViolations = 3
}) => {
  const [visible, setVisible] = useState(true);
  const [animation, setAnimation] = useState('animate-in fade-in slide-in-from-top');

  useEffect(() => {
    let timeout: number;
    
    if (autoDismiss) {
      timeout = window.setTimeout(() => {
        setAnimation('animate-out fade-out slide-out-to-top');
        window.setTimeout(() => {
          setVisible(false);
          if (onDismiss) onDismiss();
        }, 500);
      }, dismissTime) as unknown as number;
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [autoDismiss, dismissTime, onDismiss]);

  const handleDismiss = () => {
    setAnimation('animate-out fade-out slide-out-to-top');
    window.setTimeout(() => {
      setVisible(false);
      if (onDismiss) onDismiss();
    }, 500);
  };

  if (!visible) return null;

  return (
    <div className={`${warningVariants({ type })} ${animation}`}>
      {type === 'warning' && <AlertTriangle className="h-5 w-5 text-warning" />}
      {type === 'error' && <AlertTriangle className="h-5 w-5 text-destructive" />}
      {type === 'info' && <Shield className="h-5 w-5 text-primary" />}
      
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
        
        {maxViolations > 0 && (
          <div className="mt-1 flex items-center">
            <div className="w-full bg-muted rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${
                  violationCount / maxViolations > 0.75 
                    ? 'bg-destructive' 
                    : violationCount / maxViolations > 0.5 
                      ? 'bg-warning' 
                      : 'bg-primary'
                }`} 
                style={{ width: `${Math.min(100, (violationCount / maxViolations) * 100)}%` }}
              />
            </div>
            <span className="ml-2 text-xs font-medium">
              {violationCount}/{maxViolations}
            </span>
          </div>
        )}
      </div>
      
      <button 
        className="h-5 w-5 rounded-full hover:bg-muted/50 flex items-center justify-center"
        onClick={handleDismiss}
        aria-label="Dismiss"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
};