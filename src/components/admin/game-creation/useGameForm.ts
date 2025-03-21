import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { gameService } from '@/services/games';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// Define the shape of the form data
interface GameFormData {
  title: string;
  description: string;
  date: string;
  category: string;
  image: FileList;
  questions: {
    questionText: string;
    correctOption: string;
    difficulty: string;
    options: {
      optionText: string;
      optionId: string;
    }[];
  }[];
}

// Define the validation schema using yup
const gameSchema = yup.object().shape({
  title: yup.string().required('El título es obligatorio'),
  description: yup.string().notRequired(),
  date: yup.string().required('La fecha es obligatoria'),
  category: yup.string().required('La categoría es obligatoria'),
  image: yup.mixed().notRequired(),
  questions: yup.array().of(
    yup.object().shape({
      questionText: yup.string().required('La pregunta es obligatoria'),
      correctOption: yup.string().required('La opción correcta es obligatoria'),
      difficulty: yup.string().notRequired(),
      options: yup.array().of(
        yup.object().shape({
          optionText: yup.string().required('El texto de la opción es obligatorio'),
          optionId: yup.string().required('El ID de la opción es obligatorio'),
        })
      ),
    })
  ),
});

const useGameForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Initialize the form hook
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GameFormData>({
    resolver: yupResolver(gameSchema),
  });

  const onSubmit = async (data: GameFormData) => {
    setIsLoading(true);

    // Basic validation to prevent sending empty questions or options
    if (!data.questions || data.questions.length === 0) {
      toast({
        title: "Error",
        description: "Debes añadir al menos una pregunta.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    for (const question of data.questions) {
      if (!question.options || question.options.length === 0) {
        toast({
          title: "Error",
          description: "Cada pregunta debe tener al menos una opción.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
    }

    try {
      // Create the game
      const gameData = await gameService.createGame({
        title: data.title,
        description: data.description,
        date: data.date,
        category: data.category
      });

      // Handle image uploading
      if (data.image && data.image[0]) {
        const imageFile = data.image[0];
        const imageUrl = await gameService.updateGameImage(gameData.id, imageFile);

        if (!imageUrl) {
          toast({
            title: "Error",
            description: "Error al subir la imagen del juego.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
      }

      // Add questions and options
      for (let i = 0; i < data.questions.length; i++) {
        const q = data.questions[i];
        
        // Fix the type for difficulty - allow any valid difficulty value
        const difficulty = q.difficulty as "guiri" | "sevillano" | "nazareno" | "costalero" | "capataz";
        
        const questionData = await gameService.createQuestion(
          gameData.id,
          q.questionText,
          q.correctOption,
          i + 1,
          difficulty
        );

        // Create options for the question
        for (let j = 0; j < q.options.length; j++) {
          const option = q.options[j];
          await gameService.createOption(questionData.id, option.optionText, option.optionId, j + 1);
        }
      }

      toast({
        title: "Éxito",
        description: "Juego creado correctamente.",
      });
      navigate('/admin/games');
    } catch (error: any) {
      console.error("Error al crear el juego:", error);
      toast({
        title: "Error",
        description: `Error al crear el juego: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isLoading
  };
};

export default useGameForm;
