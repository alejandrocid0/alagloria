
import { useState, useEffect } from 'react';

interface UseQuestionTimerProps {
  timeRemaining: number;
  selectedOption: string | null;
}

interface UseQuestionTimerReturn {
  secondsLeft: number;
  isWarning: boolean;
  isUrgent: boolean;
  flashWarning: boolean;
  hasPulsed: boolean;
  potentialPoints: number;
}

export const useQuestionTimer = ({ 
  timeRemaining,
  selectedOption 
}: UseQuestionTimerProps): UseQuestionTimerReturn => {
  const [secondsLeft, setSecondsLeft] = useState(timeRemaining);
  const [isWarning, setIsWarning] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [potentialPoints, setPotentialPoints] = useState(200);
  const [flashWarning, setFlashWarning] = useState(false);
  const [hasPulsed, setHasPulsed] = useState(false);
  
  useEffect(() => {
    if (selectedOption) return;
    
    setSecondsLeft(timeRemaining);
    
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        const newValue = prev - 1;
        
        if (newValue <= 5 && !isWarning) {
          setIsWarning(true);
          if (!hasPulsed) {
            document.body.classList.add('pulse-animation');
            setTimeout(() => {
              document.body.classList.remove('pulse-animation');
            }, 300);
            setHasPulsed(true);
          }
        }
        
        if (newValue <= 3 && !isUrgent) {
          setIsUrgent(true);
          setFlashWarning(true);
          setTimeout(() => setFlashWarning(false), 200);
        }
        
        // Calculate points based purely on time percentage with max 200 points
        const pointsPercent = Math.max(0, newValue / timeRemaining);
        setPotentialPoints(Math.round(200 * pointsPercent));
        
        return Math.max(0, newValue);
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining, selectedOption, isWarning, isUrgent, hasPulsed]);

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
