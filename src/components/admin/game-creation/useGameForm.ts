
import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { gameService } from '@/services/games';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { gameFormSchema, type GameFormValues } from '../schemas/gameFormSchema';
import { v4 as uuidv4 } from 'uuid';

const useGameForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Initialize the form with Zod resolver
  const form = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: {
      title: '',
      description: '',
      gameDate: '',
      gameTime: '',
      category: 'curiosidades',
      questions: [
        {
          id: uuidv4(),
          text: '',
          correctOption: '',
          options: [
            { id: 'A', text: '' },
            { id: 'B', text: '' },
            { id: 'C', text: '' },
            { id: 'D', text: '' },
            { id: 'E', text: '' },
          ],
        }
      ]
    }
  });

  // Setup field array for questions
  const questionsFields = useFieldArray({
    control: form.control,
    name: "questions",
  });
  
  // Add question handler
  const handleAddQuestion = () => {
    questionsFields.append({
      id: uuidv4(),
      text: '',
      correctOption: '',
      options: [
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' },
        { id: 'E', text: '' },
      ],
    });
  };

  // Remove question handler with notification function
  const handleRemoveQuestion = (index: number, length: number, notifyUser: (message: string) => void) => {
    if (length > 1) {
      questionsFields.remove(index);
    } else {
      notifyUser("Debe haber al menos una pregunta");
    }
  };

  const handleSubmit = async (data: GameFormValues) => {
    setIsSubmitting(true);

    try {
      // Format date and time for backend
      const gameDateTime = new Date(`${data.gameDate}T${data.gameTime}`);
      
      // Create the game
      const gameData = await gameService.createGame({
        title: data.title,
        description: data.description,
        gameDate: data.gameDate,
        gameTime: data.gameTime,
        category: data.category,
        questions: data.questions
      }, "current-user-id"); // This second param is needed based on the error

      // Process questions and options
      for (let i = 0; i < data.questions.length; i++) {
        const question = data.questions[i];
        
        const questionData = await gameService.createQuestion(
          gameData.id,
          question.text,
          question.correctOption,
          i + 1
        );
        
        // Create options for each question
        for (let j = 0; j < question.options.length; j++) {
          const option = question.options[j];
          
          await gameService.createOption(
            questionData.id,
            option.text,
            option.id,
            j + 1
          );
        }
      }
      
      toast({
        title: "¡Éxito!",
        description: "La partida ha sido creada correctamente",
      });
      
      // Navigate to games list after successful creation
      navigate("/admin?tab=games-list");
      
      return true;
    } catch (error: any) {
      console.error("Error submitting game:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ha ocurrido un error al crear la partida",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    questionsFields,
    handleAddQuestion,
    handleRemoveQuestion,
    isSubmitting
  };
};

export default useGameForm;
