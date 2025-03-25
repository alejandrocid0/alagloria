
import { useState, useEffect, useCallback } from 'react';

interface UseQuestionTimerProps {
  timeRemaining: number;
  selectedOption: string | null;
  onTimeExpired?: () => void;
}

interface UseQuestionTimerReturn {
  secondsLeft: number;
  isWarning: boolean;
  isUrgent: boolean;
  flashWarning: boolean;
  hasPulsed: boolean;
  potentialPoints: number;
}

// Constants for timer thresholds
const WARNING_THRESHOLD = 5;
const URGENT_THRESHOLD = 3;
const MAX_POTENTIAL_POINTS = 200;

export const useQuestionTimer = ({ 
  timeRemaining,
  selectedOption,
  onTimeExpired
}: UseQuestionTimerProps): UseQuestionTimerReturn => {
  // State initialization
  const [secondsLeft, setSecondsLeft] = useState(timeRemaining);
  const [isWarning, setIsWarning] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [potentialPoints, setPotentialPoints] = useState(MAX_POTENTIAL_POINTS);
  const [flashWarning, setFlashWarning] = useState(false);
  const [hasPulsed, setHasPulsed] = useState(false);
  
  // Pulse animation handler
  const handlePulseAnimation = useCallback(() => {
    if (!hasPulsed) {
      document.body.classList.add('pulse-animation');
      setTimeout(() => {
        document.body.classList.remove('pulse-animation');
      }, 300);
      setHasPulsed(true);
    }
  }, [hasPulsed]);
  
  // Calculate points based on remaining time
  const calculatePoints = useCallback((secondsRemaining: number) => {
    const pointsPercent = Math.max(0, secondsRemaining / timeRemaining);
    return Math.round(MAX_POTENTIAL_POINTS * pointsPercent);
  }, [timeRemaining]);
  
  // Check warning threshold
  const checkWarningThreshold = useCallback((seconds: number) => {
    if (seconds <= WARNING_THRESHOLD && !isWarning) {
      setIsWarning(true);
      handlePulseAnimation();
    }
    
    if (seconds <= URGENT_THRESHOLD && !isUrgent) {
      setIsUrgent(true);
      setFlashWarning(true);
      setTimeout(() => setFlashWarning(false), 200);
    }
  }, [isWarning, isUrgent, handlePulseAnimation]);
  
  // Main timer effect
  useEffect(() => {
    // Reset timer when timeRemaining changes
    setSecondsLeft(timeRemaining);
    
    // Don't start timer if an option is already selected
    if (selectedOption) return;
    
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        const newValue = prev - 1;
        
        // Check for warning thresholds
        checkWarningThreshold(newValue);
        
        // Calculate points based on time percentage
        setPotentialPoints(calculatePoints(newValue));
        
        // Check if time has expired
        if (newValue <= 0) {
          clearInterval(timer);
          if (onTimeExpired) {
            onTimeExpired();
          }
          return 0;
        }
        
        return Math.max(0, newValue);
      });
    }, 1000);
    
    // Clean up timer on unmount or when dependencies change
    return () => clearInterval(timer);
  }, [timeRemaining, selectedOption, onTimeExpired, checkWarningThreshold, calculatePoints]);

  return {
    secondsLeft,
    isWarning,
    isUrgent,
    flashWarning,
    hasPulsed,
    potentialPoints
  };
};

export default useQuestionTimer;
