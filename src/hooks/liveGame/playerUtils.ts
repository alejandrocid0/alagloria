
import { supabase } from '@/integrations/supabase/client';
import { AnswerResult } from '@/types/liveGame';

// Función para enviar una respuesta
export async function submitAnswer(
  gameId: string, 
  userId: string, 
  questionPosition: number, 
  selectedOption: string, 
  answerTimeMs: number
): Promise<AnswerResult> {
  try {
    // Usamos RPC en lugar de consultar directamente la tabla
    const { data, error } = await supabase
      .rpc('submit_game_answer', {
        p_game_id: gameId,
        p_user_id: userId,
        p_question_position: questionPosition,
        p_selected_option: selectedOption,
        p_answer_time_ms: answerTimeMs
      });
    
    if (error) {
      console.error('Error submitting answer:', error);
      throw new Error(`Error al enviar respuesta: ${error.message}`);
    }
    
    // Fix the mapping to match the expected type
    return {
      is_correct: data[0].is_correct,
      points: data[0].points,
      correctOption: data[0].correctoption
    };
  } catch (err: any) {
    console.error('Error in submitAnswer:', err);
    throw err;
  }
}
