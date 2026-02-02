import React, { useState, useEffect } from 'react';
import { Clock, Shield, AlertTriangle } from 'lucide-react';

interface ExamTimerProps {
  startTime: number | null;
  duration?: number; // Duration in minutes
  warningTime?: number; // Time in minutes to start warning
  securityViolations?: number;
  maxViolations?: number;
  onTimeUp?: () => void;
}

export const ExamTimer: React.FC<ExamTimerProps> = ({
  startTime,
  duration = 60, // Default 60 minutes
  warningTime = 5, // Default 5 minutes warning
  securityViolations = 0,
  maxViolations = 3,
  onTimeUp
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (!startTime) return;
    
    const endTime = startTime + (duration * 60 * 1000);
    
    const updateTime = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      
      setTimeRemaining(remaining);
      
      // Check if we should show the warning
      setIsWarning(remaining <= warningTime * 60 * 1000);
      
      // Check if time is up
      if (remaining <= 0 && onTimeUp) {
        onTimeUp();
      }
    };
    
    // Initial update
    updateTime();
    
    // Update every second
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, [startTime, duration, warningTime, onTimeUp]);
  
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const elapsedTime = startTime ? formatTime(Date.now() - startTime) : '00:00';
  
  const securityStatusColor = 
    securityViolations === 0 ? 'text-green-500' :
    securityViolations / maxViolations > 0.66 ? 'text-red-500' :
    securityViolations / maxViolations > 0.33 ? 'text-orange-500' :
    'text-yellow-500';

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-background border-t border-border shadow-sm">
      <div className="flex items-center space-x-2">
        <Clock className={`h-4 w-4 ${isWarning ? 'text-warning animate-pulse' : 'text-muted-foreground'}`} />
        <div className="text-sm font-medium">
          {timeRemaining === null ? (
            <span className="text-muted-foreground">Not started</span>
          ) : (
            <div className="flex flex-col">
              <span className={isWarning ? 'text-warning font-bold' : ''}>
                Remaining: {formatTime(timeRemaining)}
              </span>
              <span className="text-xs text-muted-foreground">
                Elapsed: {elapsedTime}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {securityViolations > 0 ? (
          <AlertTriangle className={`h-4 w-4 ${securityStatusColor}`} />
        ) : (
          <Shield className="h-4 w-4 text-green-500" />
        )}
        <span className={`text-sm font-medium ${securityStatusColor}`}>
          {securityViolations === 0 
            ? 'Secure' 
            : `Violations: ${securityViolations}/${maxViolations}`
          }
        </span>
      </div>
    </div>
  );
};