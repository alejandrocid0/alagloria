
import { useState, useEffect } from 'react';

type GameState = 'waiting' | 'question' | 'result' | 'leaderboard' | 'finished';

interface UseGameCountdownProps {
  currentState: GameState;
  selectedOption: string | null;
  currentQuestion: number;
  gameQuestionsLength: number;
  onStateChange: (newState: GameState) => void;
  onCurrentQuestionChange: (newQuestion: number) => void;
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
}: UseGameCountdownProps) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (currentState === 'waiting') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            onStateChange('question');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
    
    if (currentState === 'question') {
      const timer = setInterval(() => {
        // Corregido: Ahora actualizamos directamente con un número en lugar de usar una función callback
        const newValue = timeRemaining - 1;
        if (newValue <= 0) {
          clearInterval(timer);
          // Auto advance when time runs out, regardless of user selection
          onStateChange('result');
          if (!selectedOption) {
            onSelectedOptionChange('timeout'); // Mark as timeout
          }
          onTimeRemainingChange(0);
        } else {
          onTimeRemainingChange(newValue);
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
    
    if (currentState === 'result') {
      const timer = setTimeout(() => {
        if (currentQuestion < gameQuestionsLength - 1) {
          onStateChange('leaderboard');
        } else {
          onStateChange('finished');
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
    
    if (currentState === 'leaderboard') {
      const timer = setTimeout(() => {
        onCurrentQuestionChange(currentQuestion + 1);
        onSelectedOptionChange(null);
        onTimeRemainingChange(20);
        onStateChange('question');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [
    currentState, 
    currentQuestion, 
    selectedOption, 
    gameQuestionsLength, 
    onStateChange, 
    onCurrentQuestionChange, 
    onSelectedOptionChange,
    onTimeRemainingChange
  ]);

  return {
    countdown
  };
};
