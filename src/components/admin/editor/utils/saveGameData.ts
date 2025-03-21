
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { GameFormValues } from '../types';
import { uploadGameImage } from './imageUpload';

export const saveGameData = async (
  gameId: string,
  data: GameFormValues,
  imageFile: File | null,
  setUploadProgress: (progress: number) => void,
  onClose: () => void
) => {
  try {
    console.log("Updating game:", data);
    
    // Combine date and time for game date
    const gameDateTime = new Date(`${data.gameDate}T${data.gameTime}`);
    
    // 1. Upload image if provided
    let imageUrl = null;
    if (imageFile) {
      imageUrl = await uploadGameImage(gameId, imageFile, setUploadProgress);
    }
    
    // 2. Update game
    const updateData: any = {
      title: data.title,
      description: data.description,
      date: gameDateTime.toISOString(),
      updated_at: new Date().toISOString(),
      category: data.category,
    };
    
    // Add image URL if available
    if (imageUrl) {
      updateData.image_url = imageUrl;
    }
    
    const { error: gameError } = await supabase
      .from('games')
      .update(updateData)
      .eq('id', gameId);
    
    if (gameError) {
      throw new Error(`Error al actualizar la partida: ${gameError.message}`);
    }
    
    // Return true for success
    return true;
  } catch (error) {
    console.error("Error updating game metadata:", error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Ha ocurrido un error al actualizar la partida",
      variant: "destructive",
    });
    return false;
  }
};

export const saveQuestionsAndOptions = async (
  gameId: string,
  data: GameFormValues,
  existingQuestions: any[]
) => {
  try {
    const existingQuestionIds = existingQuestions.map(q => q.id);
    const formQuestionIds = data.questions
      .filter(q => q.question_id) // Only consider existing questions
      .map(q => q.id);
    
    // Delete questions that are no longer in the form
    const questionsToDelete = existingQuestionIds.filter(id => !formQuestionIds.includes(id));
    
    if (questionsToDelete.length > 0) {
      const { error: deleteQuestionsError } = await supabase
        .from('questions')
        .delete()
        .in('id', questionsToDelete);
      
      if (deleteQuestionsError) {
        throw new Error(`Error al eliminar preguntas: ${deleteQuestionsError.message}`);
      }
    }
    
    // Update or insert questions
    for (let i = 0; i < data.questions.length; i++) {
      const question = data.questions[i];
      const isNewQuestion = !question.question_id;
      
      if (isNewQuestion) {
        // Insert new question
        const { data: newQuestion, error: newQuestionError } = await supabase
          .from('questions')
          .insert({
            game_id: gameId,
            question_text: question.text,
            correct_option: question.correctOption,
            position: i + 1
          })
          .select()
          .single();
        
        if (newQuestionError) {
          throw new Error(`Error al crear la pregunta ${i+1}: ${newQuestionError.message}`);
        }
        
        // Insert new options
        for (let j = 0; j < question.options.length; j++) {
          const option = question.options[j];
          
          const { error: newOptionError } = await supabase
            .from('options')
            .insert({
              question_id: newQuestion.id,
              option_text: option.text,
              option_id: option.id,
              position: j + 1,
            });
          
          if (newOptionError) {
            throw new Error(`Error al crear la opción ${option.id} para la pregunta ${i+1}: ${newOptionError.message}`);
          }
        }
      } else {
        // Update existing question
        const { error: updateQuestionError } = await supabase
          .from('questions')
          .update({
            question_text: question.text,
            correct_option: question.correctOption,
            position: i + 1
          })
          .eq('id', question.id);
        
        if (updateQuestionError) {
          throw new Error(`Error al actualizar la pregunta ${i+1}: ${updateQuestionError.message}`);
        }
        
        // Handle options (update existing)
        for (let j = 0; j < question.options.length; j++) {
          const option = question.options[j];
          
          if (option.option_id) {
            // Update existing option
            const { error: updateOptionError } = await supabase
              .from('options')
              .update({
                option_text: option.text,
                position: j + 1,
              })
              .eq('id', option.option_id);
            
            if (updateOptionError) {
              throw new Error(`Error al actualizar la opción ${option.id} para la pregunta ${i+1}: ${updateOptionError.message}`);
            }
          } else {
            // Insert new option
            const { error: newOptionError } = await supabase
              .from('options')
              .insert({
                question_id: question.id,
                option_text: option.text,
                option_id: option.id,
                position: j + 1,
              });
            
            if (newOptionError) {
              throw new Error(`Error al crear la opción ${option.id} para la pregunta ${i+1}: ${newOptionError.message}`);
            }
          }
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error updating questions and options:", error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Ha ocurrido un error al actualizar las preguntas",
      variant: "destructive",
    });
    return false;
  }
};
