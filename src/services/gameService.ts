
import { supabase } from '@/integrations/supabase/client';
import { GameFormValues } from '@/components/admin/schemas/gameFormSchema';

export const gameService = {
  async createGame(data: GameFormValues, userId: string) {
    const gameDateTime = new Date(`${data.gameDate}T${data.gameTime}`);
    
    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .insert({
        title: data.title,
        description: data.description,
        date: gameDateTime.toISOString(),
        created_by: userId
      })
      .select()
      .single();
    
    if (gameError) {
      throw new Error(`Error al crear la partida: ${gameError.message}`);
    }
    
    return gameData;
  },
  
  async updateGameImage(gameId: string, imageUrl: string) {
    const { error: updateError } = await supabase
      .from('games')
      .update({ image_url: imageUrl })
      .eq('id', gameId);
    
    if (updateError) {
      console.error('Error updating game with image URL:', updateError);
      throw new Error(`Error al actualizar la imagen: ${updateError.message}`);
    }
  },
  
  async createQuestion(gameId: string, questionText: string, correctOption: string, position: number) {
    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .insert({
        game_id: gameId,
        question_text: questionText,
        correct_option: correctOption,
        position: position,
      })
      .select()
      .single();
    
    if (questionError) {
      throw new Error(`Error al crear la pregunta ${position}: ${questionError.message}`);
    }
    
    return questionData;
  },
  
  async createOption(questionId: string, optionText: string, optionId: string, position: number) {
    const { error: optionError } = await supabase
      .from('options')
      .insert({
        question_id: questionId,
        option_text: optionText,
        option_id: optionId,
        position: position,
      });
    
    if (optionError) {
      throw new Error(`Error al crear la opción ${optionId}: ${optionError.message}`);
    }
  }
};
