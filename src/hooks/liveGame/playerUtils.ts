
import { supabase } from '@/integrations/supabase/client';
import { AnswerResult } from '@/types/liveGame';

/**
 * Función para enviar la respuesta de un jugador a una pregunta
 */
export async function submitAnswer(
  gameId: string,
  userId: string,
  questionPosition: number,
  optionId: string,
  answerTimeMs: number = 0
): Promise<AnswerResult | null> {
  try {
    console.log(`[PlayerUtils] Enviando respuesta para usuario ${userId}, pregunta ${questionPosition}, opción ${optionId}`);
    
    // Llamar a la función RPC de Supabase para enviar la respuesta
    const { data, error } = await supabase.rpc(
      'submit_game_answer',
      {
        p_game_id: gameId,
        p_user_id: userId,
        p_question_position: questionPosition,
        p_selected_option: optionId,
        p_answer_time_ms: answerTimeMs
      }
    );
    
    if (error) {
      console.error('[PlayerUtils] Error al enviar respuesta:', error);
      return null;
    }
    
    if (data && data.length > 0) {
      console.log(`[PlayerUtils] Respuesta enviada, resultado:`, data[0]);
      
      return {
        is_correct: data[0].is_correct,
        points: data[0].points,
        correctOption: data[0].correctoption
      };
    }
    
    return null;
  } catch (err) {
    console.error('[PlayerUtils] Error inesperado al enviar respuesta:', err);
    return null;
  }
}

/**
 * Función para obtener información del jugador actual
 */
export async function getCurrentPlayerInfo(gameId: string, userId: string) {
  try {
    // Obtener datos del leaderboard para este usuario
    const { data, error } = await supabase
      .rpc('get_game_leaderboard', { game_id: gameId })
      .select()
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('[PlayerUtils] Error al obtener info del jugador:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('[PlayerUtils] Error inesperado al obtener info del jugador:', err);
    return null;
  }
}
