
import { useState, useCallback } from 'react';
import { submitAnswer as submitPlayerAnswer } from './playerUtils';
import { AnswerResult } from '@/types/liveGame';

export const useGameAnswers = (gameId: string | undefined, userId: string | undefined) => {
  const [lastAnswerResult, setLastAnswerResult] = useState<AnswerResult | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [lastPoints, setLastPoints] = useState(0);
  const [myPoints, setMyPoints] = useState(0);

  const submitAnswer = useCallback(async (questionPosition: number, optionId: string, answerTimeMs: number = 0) => {
    if (!gameId || !userId) return null;
    
    try {
      const result = await submitPlayerAnswer(
        gameId, 
        userId, 
        questionPosition, 
        optionId, 
        answerTimeMs
      );
      
      if (result) {
        setLastAnswerResult(result);
        
        if (result.is_correct) {
          setLastPoints(result.points);
          setMyPoints(prev => prev + result.points);
        }
      }
      
      return result;
    } catch (err) {
      console.error('[GameAnswers] Error al enviar respuesta:', err);
      return null;
    }
  }, [gameId, userId]);

  return {
    lastAnswerResult,
    selectedOption,
    setSelectedOption,
    lastPoints,
    myPoints,
    submitAnswer
  };
};
