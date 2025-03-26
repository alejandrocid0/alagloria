
import { useState, useEffect, useCallback } from 'react';
import { Question } from '@/types/liveGame';
import { fetchQuestions } from './questionsUtils';

export const useGameQuestions = (
  gameId: string | undefined,
  gameState: any
) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  
  // Fetch questions data
  const fetchQuestionsData = useCallback(async () => {
    if (!gameId) return [];
    
    try {
      const data = await fetchQuestions(gameId);
      setQuestions(data);
      return data;
    } catch (err) {
      console.error('Error fetching questions:', err);
      return [];
    }
  }, [gameId]);
  
  // Update current question when game state changes
  useEffect(() => {
    if (gameState && questions.length > 0 && gameState.current_question !== undefined) {
      setCurrentQuestion(questions[gameState.current_question]);
    } else {
      setCurrentQuestion(null);
    }
  }, [gameState, questions]);
  
  // Fetch questions on mount
  useEffect(() => {
    fetchQuestionsData();
  }, [fetchQuestionsData]);

  return { questions, currentQuestion, fetchQuestionsData };
};
