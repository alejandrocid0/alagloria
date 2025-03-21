
import { supabase } from '@/integrations/supabase/client';

export async function createQuestion(gameId: string, questionText: string, correctOption: string, position: number, difficulty: string = 'sevillano') {
  const { data: questionData, error: questionError } = await supabase
    .from('questions')
    .insert({
      game_id: gameId,
      question_text: questionText,
      correct_option: correctOption,
      position: position,
      difficulty: difficulty,
    })
    .select()
    .single();
  
  if (questionError) {
    console.error('Error creating question:', questionError);
    throw new Error(`Error al crear la pregunta ${position}: ${questionError.message}`);
  }
  
  return questionData;
}

export async function createOption(questionId: string, optionText: string, optionId: string, position: number) {
  const { error: optionError } = await supabase
    .from('options')
    .insert({
      question_id: questionId,
      option_text: optionText,
      option_id: optionId,
      position: position,
    });
  
  if (optionError) {
    console.error('Error creating option:', optionError);
    throw new Error(`Error al crear la opción ${optionId}: ${optionError.message}`);
  }
}
