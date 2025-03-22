
import { supabase } from '@/integrations/supabase/client';
import { AnswerResult } from '@/types/liveGame';

// Function to submit an answer
export async function submitPlayerAnswer(
  gameId: string, 
  userId: string, 
  questionPosition: number, 
  selectedOption: string, 
  answerTimeMs: number
): Promise<AnswerResult> {
  try {
    // Use RPC instead of directly querying the table
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
    
    // Map the response to match the expected type
    return {
      is_correct: data[0].is_correct,
      points: data[0].points,
      correctOption: data[0].correctoption
    };
  } catch (err: any) {
    console.error('Error in submitPlayerAnswer:', err);
    throw err;
  }
}
