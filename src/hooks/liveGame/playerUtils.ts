
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
    const { data: answerData, error: answerError } = await supabase
      .rpc('submit_game_answer', {
        p_game_id: gameId,
        p_user_id: userId,
        p_question_position: questionPosition,
        p_selected_option: selectedOption,
        p_answer_time_ms: answerTimeMs
      });
    
    if (answerError) {
      console.error('Error submitting answer:', answerError);
      throw new Error(`Error al enviar respuesta: ${answerError.message}`);
    }
    
    return answerData as AnswerResult;
  } catch (err: any) {
    console.error('Error in submitAnswer:', err);
    throw err;
  }
}
