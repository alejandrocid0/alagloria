
import { useState, useEffect } from 'react';

interface QuestionTimerProps {
  timeRemaining: number;
  selectedOption: string | null;
  onTimeExpired?: () => void;
}

export const useQuestionTimer = ({ 
  timeRemaining,
  selectedOption,
  onTimeExpired
}: QuestionTimerProps) => {
  const [secondsLeft, setSecondsLeft] = useState(timeRemaining);
  const [hasPulsed, setHasPulsed] = useState(false);
  const [potentialPoints, setPotentialPoints] = useState(1000);
  const [flashWarning, setFlashWarning] = useState(false);
  
  const isWarning = secondsLeft <= 10;
  const isUrgent = secondsLeft <= 5;
  
  // Timer effect
  useEffect(() => {
    // Reset when new question appears
    setSecondsLeft(timeRemaining);
    setPotentialPoints(1000);
    setHasPulsed(false);
    
    // Only run timer if no option is selected
    if (selectedOption) return;
    
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          // Time's up!
          clearInterval(timer);
          if (onTimeExpired) onTimeExpired();
          return 0;
        }
        return prev - 1;
      });
      
      // Calculate potential points (decreases as time passes)
      setPotentialPoints(prev => {
        const newPoints = Math.max(prev - (1000 / timeRemaining), 100);
        return Math.floor(newPoints);
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining, selectedOption, onTimeExpired]);
  
  // Flash warning effect
  useEffect(() => {
    if (isUrgent && !hasPulsed) {
      setFlashWarning(true);
      setHasPulsed(true);
      
      setTimeout(() => {
        setFlashWarning(false);
      }, 1000);
    }
  }, [isUrgent, hasPulsed]);
  
  return {
    secondsLeft,
    isWarning,
    isUrgent,
    flashWarning,
    hasPulsed,
    potentialPoints
  };
};
