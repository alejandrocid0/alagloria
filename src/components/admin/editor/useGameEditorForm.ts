
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  gameFormSchema, 
  GameFormValues, 
  Question, 
  Option,
  DIFFICULTY_LEVELS
} from './types';

export function useGameEditorForm(
  game: {
    id: string;
    title: string;
    description: string;
    date: string;
    image_url?: string;
    category?: string;
  }, 
  onClose: () => void
) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(game.image_url || null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: {
      title: game.title,
      description: game.description,
      gameDate: '',
      gameTime: '',
      category: (game.category as any) || 'curiosidades',
      questions: [],
    },
  });

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        setIsLoading(true);

        // Parse date and time
        const gameDate = new Date(game.date);
        const dateStr = gameDate.toISOString().split('T')[0];
        const timeStr = gameDate.toTimeString().slice(0, 5);

        form.setValue('gameDate', dateStr);
        form.setValue('gameTime', timeStr);

        // Fetch questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('game_id', game.id)
          .order('position', { ascending: true });

        if (questionsError) throw questionsError;
        setQuestions(questionsData || []);

        // Fetch options for all questions
        if (questionsData && questionsData.length > 0) {
          const questionIds = questionsData.map(q => q.id);
          
          const { data: optionsData, error: optionsError } = await supabase
            .from('options')
            .select('*')
            .in('question_id', questionIds)
            .order('position', { ascending: true });

          if (optionsError) throw optionsError;
          setOptions(optionsData || []);

          // Format questions and options for the form
          const formattedQuestions = questionsData.map(question => {
            const questionOptions = optionsData?.filter(o => o.question_id === question.id) || [];
            
            // Make sure to validate the difficulty is one of the allowed values
            const rawDifficulty = question.difficulty as string | undefined;
            let validDifficulty: typeof DIFFICULTY_LEVELS[number] = 'sevillano';
            
            if (rawDifficulty && DIFFICULTY_LEVELS.includes(rawDifficulty as any)) {
              validDifficulty = rawDifficulty as typeof DIFFICULTY_LEVELS[number];
            }
            
            return {
              id: question.id,
              text: question.question_text,
              correctOption: question.correct_option,
              position: question.position,
              difficulty: validDifficulty,
              options: questionOptions.map(option => ({
                id: option.option_id,
                text: option.option_text,
                option_id: option.id,
                position: option.position,
                question_id: option.question_id,
              })),
            };
          });

          form.setValue('questions', formattedQuestions);
        }
      } catch (error) {
        console.error('Error fetching game details:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los detalles de la partida',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameDetails();
  }, [game.id, game.date, game.title, game.description, game.category, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (gameId: string): Promise<string | null> => {
    if (!imageFile) return null;
    
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${gameId}.${fileExt}`;
      const filePath = `game-images/${fileName}`;
      
      setUploadProgress(10);
      
      const { error: uploadError } = await supabase.storage
        .from('game-images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Set upload as complete
      setUploadProgress(100);
      
      const { data: { publicUrl } } = supabase.storage
        .from('game-images')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "No se pudo subir la imagen",
        variant: "destructive",
      });
      return null;
    }
  };

  const onSubmit = async (data: GameFormValues) => {
    setIsSaving(true);
    
    try {
      console.log("Updating game:", data);
      
      // Combine date and time for game date
      const gameDateTime = new Date(`${data.gameDate}T${data.gameTime}`);
      
      // 1. Upload image if provided
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(game.id);
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
        .eq('id', game.id);
      
      if (gameError) {
        throw new Error(`Error al actualizar la partida: ${gameError.message}`);
      }
      
      // 2. Handle questions (update existing, delete removed, add new)
      const existingQuestionIds = questions.map(q => q.id);
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
              game_id: game.id,
              question_text: question.text,
              correct_option: question.correctOption,
              position: i + 1,
              difficulty: question.difficulty,
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
              position: i + 1,
              difficulty: question.difficulty,
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
      
      toast({
        title: "¡Éxito!",
        description: "La partida ha sido actualizada correctamente",
      });
      
      onClose();
    } catch (error) {
      console.error("Error updating game:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ha ocurrido un error al actualizar la partida",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    form,
    isLoading,
    isSaving,
    imageFile,
    imagePreview,
    uploadProgress,
    handleImageChange,
    onSubmit
  };
}
