
import { useEffect, useState } from 'react';

interface GameCountdownProps {
  currentState: string;
  selectedOption: string | null;
  currentQuestion: number;
  gameQuestionsLength: number;
  onStateChange: (state: string) => void;
  onCurrentQuestionChange: (question: number) => void;
  onSelectedOptionChange: (option: string | null) => void;
  onTimeRemainingChange: (time: number) => void;
}

export const useGameCountdown = ({
  currentState,
  selectedOption,
  currentQuestion,
  gameQuestionsLength,
  onStateChange,
  onCurrentQuestionChange,
  onSelectedOptionChange,
  onTimeRemainingChange
}: GameCountdownProps) => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(20);
  
  // Handle state transitions based on timers
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    // Only setup countdown timers for certain game states
    if (currentState === 'question' && !selectedOption) {
      // Question countdown
      const questionTime = 20; // Default time per question in seconds
      setTimeRemaining(questionTime);
      onTimeRemainingChange(questionTime);
      
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          const newValue = prev <= 1 ? 0 : prev - 1;
          onTimeRemainingChange(newValue);
          
          if (newValue === 0) {
            clearInterval(timer!);
            // Auto-submit when time runs out
            onStateChange('result');
          }
          return newValue;
        });
      }, 1000);
    } 
    else if (currentState === 'result') {
      // Result review countdown
      setCountdown(5);
      
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev !== null && prev <= 1) {
            clearInterval(timer!);
            
            // If there are more questions, go to next one
            if (currentQuestion < gameQuestionsLength - 1) {
              onCurrentQuestionChange(currentQuestion + 1);
              onSelectedOptionChange(null);
              onStateChange('question');
            } else {
              // Game is complete
              onStateChange('finished');
            }
            return null;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [
    currentState, 
    selectedOption, 
    currentQuestion, 
    gameQuestionsLength, 
    onStateChange, 
    onCurrentQuestionChange, 
    onSelectedOptionChange,
    onTimeRemainingChange
  ]);
  
  return { countdown, timeRemaining };
};

export default useGameCountdown;
