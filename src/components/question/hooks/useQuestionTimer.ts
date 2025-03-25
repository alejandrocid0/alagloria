
import { useState, useEffect } from 'react';

interface UseQuestionTimerProps {
  timeLimit: number;
  answered: boolean;
  selectedIdx?: number;
  onAnswer: (optionIndex: number, timeRemaining: number) => void;
}

const useQuestionTimer = ({ timeLimit, answered, selectedIdx, onAnswer }: UseQuestionTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [animateTimeWarning, setAnimateTimeWarning] = useState(false);
  
  // Handle countdown timer
  useEffect(() => {
    if (answered || timeRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-submit when timer reaches zero and there's a selection
          if (selectedIdx !== undefined) {
            onAnswer(selectedIdx, 0);
          } else {
            // Auto-submit with time out when timer reaches zero, regardless of selection
            onAnswer(-1, 0); // Use -1 to indicate timeout without selection
          }
          return 0;
        }
        
        // Trigger warning animation when less than 30% time remaining
        if (prev / timeLimit <= 0.3 && !animateTimeWarning) {
          setAnimateTimeWarning(true);
        }
        
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [answered, timeRemaining, timeLimit, animateTimeWarning, selectedIdx, onAnswer]);

  return {
    timeRemaining, 
    animateTimeWarning
  };
};

export default useQuestionTimer;
