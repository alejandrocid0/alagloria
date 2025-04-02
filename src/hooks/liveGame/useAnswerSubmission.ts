
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AnswerResult } from '@/types/liveGame';
import { User } from '@supabase/supabase-js';

interface UseAnswerSubmissionProps {
  gameId: string | undefined;
  user: User | null;
  setLastAnswerResult: (result: AnswerResult | null) => void;
  setLastPoints: (points: number) => void;
  fetchLeaderboardData: () => Promise<any>;
}

export const useAnswerSubmission = ({
  gameId,
  user,
  setLastAnswerResult,
  setLastPoints,
  fetchLeaderboardData
}: UseAnswerSubmissionProps) => {
  
  // Enviar respuesta
  const submitAnswer = useCallback(async (questionPosition: number, optionId: string, answerTimeMs: number = 0) => {
    if (!gameId || !user) return null;
    
    try {
      console.log(`[AnswerSubmission] Submitting answer for user ${user.id}, question ${questionPosition}, option ${optionId}`);
      
      // Submit answer
      const { data, error } = await supabase.rpc(
        'submit_game_answer',
        {
          p_game_id: gameId,
          p_user_id: user.id,
          p_question_position: questionPosition,
          p_selected_option: optionId,
          p_answer_time_ms: answerTimeMs
        }
      );
      
      if (error) {
        console.error('[AnswerSubmission] Error submitting answer:', error);
        return null;
      }
      
      if (data && data.length > 0) {
        console.log(`[AnswerSubmission] Answer submitted, result:`, data[0]);
        
        const result = {
          is_correct: data[0].is_correct,
          points: data[0].points,
          correctOption: data[0].correctoption
        };
        
        setLastAnswerResult(result);
        setLastPoints(result.points);
        
        // Actualizar la tabla de clasificación después de responder
        fetchLeaderboardData();
        
        return result;
      }
      
      return null;
    } catch (err) {
      console.error('[AnswerSubmission] Error submitting answer:', err);
      return null;
    }
  }, [gameId, user, fetchLeaderboardData, setLastAnswerResult, setLastPoints]);

  return { submitAnswer };
};

export default useAnswerSubmission;
