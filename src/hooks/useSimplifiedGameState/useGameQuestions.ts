
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useGameQuestions = (gameId: string | undefined, currentQuestionIndex: number | undefined) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<any | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [errorQuestions, setErrorQuestions] = useState<string | null>(null);
  
  const loadQuestions = useCallback(async () => {
    if (!gameId) return;
    
    try {
      setIsLoadingQuestions(true);
      setErrorQuestions(null);
      
      // Obtener lista de preguntas para este juego
      const { data: gameQuestions, error: questionsError } = await supabase
        .from('questions')
        .select('id, position, question_text, correct_option, game_id')
        .eq('game_id', gameId)
        .order('position');
      
      if (questionsError) throw questionsError;
      
      if (gameQuestions && gameQuestions.length > 0) {
        // Para cada pregunta, obtener sus opciones
        const questionsWithOptions = await Promise.all(
          gameQuestions.map(async (question) => {
            const { data: options, error: optionsError } = await supabase
              .from('options')
              .select('id, option_id, option_text, position')
              .eq('question_id', question.id)
              .order('position');
            
            if (optionsError) throw optionsError;
            
            return {
              id: question.id,
              position: question.position,
              question: question.question_text,
              options: options || [],
              category: 'general', // Categoría por defecto
              correctOption: question.correct_option
            };
          })
        );
        
        setQuestions(questionsWithOptions);
      }
    } catch (err) {
      console.error('Error al cargar preguntas:', err);
      setErrorQuestions('No se pudieron cargar las preguntas del juego');
    } finally {
      setIsLoadingQuestions(false);
    }
  }, [gameId]);
  
  // Actualizar la pregunta actual cuando cambia el índice de pregunta
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex !== undefined && currentQuestionIndex < questions.length) {
      setCurrentQuestion(questions[currentQuestionIndex]);
    } else {
      setCurrentQuestion(null);
    }
  }, [currentQuestionIndex, questions]);
  
  return {
    questions,
    currentQuestion,
    loadQuestions,
    isLoadingQuestions,
    errorQuestions
  };
};
