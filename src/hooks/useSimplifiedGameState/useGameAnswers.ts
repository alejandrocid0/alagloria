
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { gameNotifications } from '@/components/ui/notification-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useGameAnswers = (gameId: string | undefined, gameState: any) => {
  const { user } = useAuth();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [lastPoints, setLastPoints] = useState(0);
  const [lastAnswerResult, setLastAnswerResult] = useState<any | null>(null);
  
  // Enviar respuesta
  const submitAnswer = useCallback(async (questionIdx: number, optionId: string, answerTimeMs: number) => {
    if (!gameId || !user || !gameState || gameState.status !== 'question') return null;
    
    try {
      // Enviar respuesta al servidor
      const { data, error } = await supabase.rpc('submit_game_answer', {
        p_game_id: gameId,
        p_user_id: user.id,
        p_question_position: questionIdx,
        p_selected_option: optionId,
        p_answer_time_ms: answerTimeMs || 0
      });
      
      if (error) {
        console.error('Error al enviar respuesta:', error);
        return null;
      }
      
      // Actualizar puntos y resultado
      if (data && data[0]) {
        setLastPoints(data[0].points || 0);
        setLastAnswerResult({
          is_correct: data[0].is_correct,
          points: data[0].points,
          correctOption: data[0].correctoption
        });
        
        // Mostrar notificación según resultado
        if (data[0].is_correct) {
          gameNotifications.correctAnswer(data[0].points);
        } else {
          gameNotifications.wrongAnswer();
        }
        
        return data[0];
      }
      
      return null;
    } catch (err) {
      console.error('Error al enviar respuesta:', err);
      return null;
    }
  }, [gameId, user, gameState]);
  
  // Manejar selección de opción
  const handleSelectOption = useCallback((optionId: string) => {
    if (selectedOption || !gameState || gameState.status !== 'question') return;
    
    setSelectedOption(optionId);
    
    // Calcular tiempo de respuesta (simplificado)
    const answerTime = 1000; // Valor predeterminado
    
    // Enviar respuesta
    submitAnswer(gameState.current_question, optionId, answerTime);
  }, [selectedOption, gameState, submitAnswer]);
  
  return {
    selectedOption,
    setSelectedOption,
    lastPoints,
    lastAnswerResult,
    submitAnswer,
    handleSelectOption
  };
};
