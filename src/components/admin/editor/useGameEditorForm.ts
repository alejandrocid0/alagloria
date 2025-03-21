
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { 
  gameFormSchema, 
  GameFormValues
} from './types';
import { GameData, GameEditorFormData } from './types/gameEditorTypes';
import { fetchGameData, formatQuestionsForForm } from './utils/fetchGameData';
import { saveGameData, saveQuestionsAndOptions } from './utils/saveGameData';

export function useGameEditorForm(game: GameData, onClose: () => void): GameEditorFormData {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);
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
    const loadGameData = async () => {
      setIsLoading(true);
      
      const result = await fetchGameData(game.id, game.date, form.setValue);
      
      if (result) {
        setQuestions(result.questions);
        setOptions(result.options);
        
        // Format questions for form if we have any
        if (result.questions.length > 0) {
          const formattedQuestions = formatQuestionsForForm(result.questions, result.options);
          form.setValue('questions', formattedQuestions);
        }
      }
      
      setIsLoading(false);
    };

    loadGameData();
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

  const onSubmit = async (data: GameFormValues) => {
    setIsSaving(true);
    
    try {
      // 1. Save game metadata and image
      const gameUpdated = await saveGameData(
        game.id, 
        data, 
        imageFile, 
        setUploadProgress,
        onClose
      );
      
      if (!gameUpdated) {
        throw new Error("No se pudo actualizar la información de la partida");
      }
      
      // 2. Save questions and options
      const questionsUpdated = await saveQuestionsAndOptions(
        game.id,
        data,
        questions
      );
      
      if (!questionsUpdated) {
        throw new Error("No se pudieron actualizar las preguntas y opciones");
      }
      
      // Success!
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
