
import { useState, useEffect, useCallback, useRef } from 'react';
import { Question } from '@/types/liveGame';
import { fetchQuestions } from './questionsUtils';

export const useGameQuestions = (
  gameId: string | undefined,
  gameState: any
) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  
  // Refs para control de estado
  const currentQuestionIdRef = useRef<number | null>(null);
  const loadingQuestionsRef = useRef<boolean>(false);
  
  // Fetch questions data
  const fetchQuestionsData = useCallback(async () => {
    if (!gameId) return [];
    
    if (loadingQuestionsRef.current) {
      console.log("[GameQuestions] Already loading questions, skipping duplicate request");
      return [];
    }
    
    loadingQuestionsRef.current = true;
    
    try {
      console.log(`[GameQuestions] Fetching questions for game: ${gameId}`);
      const data = await fetchQuestions(gameId);
      
      console.log(`[GameQuestions] Fetched ${data.length} questions`);
      setQuestions(data);
      
      // Si estamos en el estado de pregunta, actualizar la pregunta actual
      if (gameState && gameState.status === 'question' && gameState.current_question < data.length) {
        setCurrentQuestion(data[gameState.current_question]);
        currentQuestionIdRef.current = gameState.current_question;
      }
      
      return data;
    } catch (err) {
      console.error('[GameQuestions] Error fetching questions:', err);
      return [];
    } finally {
      loadingQuestionsRef.current = false;
    }
  }, [gameId, gameState]);
  
  // Update current question when game state changes
  useEffect(() => {
    if (gameState && questions.length > 0) {
      if (gameState.status === 'question') {
        // Si la pregunta actual ha cambiado o es la primera vez
        if (currentQuestionIdRef.current !== gameState.current_question) {
          console.log(`[GameQuestions] Updating current question to position: ${gameState.current_question}`);
          
          if (gameState.current_question < questions.length) {
            setCurrentQuestion(questions[gameState.current_question]);
            currentQuestionIdRef.current = gameState.current_question;
          } else {
            console.error(`[GameQuestions] Question index out of bounds: ${gameState.current_question}, questions length: ${questions.length}`);
            
            // Intentar cargar las preguntas si el índice está fuera de rango
            if (!loadingQuestionsRef.current) {
              fetchQuestionsData();
            }
          }
        }
      } else if (gameState.status !== 'result') {
        // Si no estamos en resultado (donde se muestra la pregunta anterior)
        setCurrentQuestion(null);
        currentQuestionIdRef.current = null;
      }
    }
  }, [gameState, questions, fetchQuestionsData]);
  
  // Fetch questions on mount
  useEffect(() => {
    if (gameId && !loadingQuestionsRef.current && questions.length === 0) {
      fetchQuestionsData();
    }
  }, [gameId, fetchQuestionsData, questions.length]);

  return { questions, currentQuestion, fetchQuestionsData };
};

export default useGameQuestions;
