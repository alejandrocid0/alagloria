
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GameFormValues, gameFormSchema, DIFFICULTY_LEVELS } from '../schemas/gameFormSchema';
import { toast } from '@/hooks/use-toast';

export function useGameForm() {
  // Función para crear opciones vacías
  const createEmptyOptions = () => {
    return Array(5).fill(0).map((_, i) => ({
      id: String.fromCharCode(65 + i), // A, B, C, D, E
      text: '',
    }));
  };

  // Función para crear preguntas predeterminadas con diferentes niveles de dificultad
  const createDefaultQuestions = () => {
    const questions = [];
    // Crear 4 preguntas para cada nivel de dificultad (total 20 preguntas)
    for (const difficulty of DIFFICULTY_LEVELS) {
      for (let i = 0; i < 4; i++) {
        questions.push({
          id: crypto.randomUUID(),
          text: '',
          correctOption: '',
          options: createEmptyOptions(),
          difficulty: difficulty, // Correctly typed as one of the DIFFICULTY_LEVELS
        });
      }
    }
    return questions;
  };

  const form = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: {
      title: '',
      description: '',
      gameDate: new Date().toISOString().split('T')[0],
      gameTime: '18:00',
      category: 'curiosidades', // Default a la primera categoría
      questions: createDefaultQuestions(),
    },
  });
  
  const { fields: questionsFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  const handleAddQuestion = () => {
    // Determinar cuál es el nivel de dificultad menos representado
    const difficultyCount = DIFFICULTY_LEVELS.reduce((counts, level) => {
      counts[level] = 0;
      return counts;
    }, {} as Record<string, number>);
    
    // Contar preguntas por nivel de dificultad
    form.getValues().questions.forEach(question => {
      if (question.difficulty) {
        difficultyCount[question.difficulty]++;
      }
    });
    
    // Encontrar el nivel con menos preguntas
    let lowestDifficulty = DIFFICULTY_LEVELS[0];
    let lowestCount = Number.MAX_SAFE_INTEGER;
    
    for (const [difficulty, count] of Object.entries(difficultyCount)) {
      if (count < lowestCount) {
        lowestCount = count;
        lowestDifficulty = difficulty as typeof DIFFICULTY_LEVELS[number];
      }
    }

    appendQuestion({
      id: crypto.randomUUID(),
      text: '',
      correctOption: '',
      options: createEmptyOptions(),
      difficulty: lowestDifficulty,
    });
  };

  const handleRemoveQuestion = (index: number, questionsLength: number, onError: (message: string) => void) => {
    if (questionsLength > 1) {
      removeQuestion(index);
    } else {
      onError("Debe haber al menos una pregunta");
    }
  };

  return {
    form,
    questionsFields,
    handleAddQuestion,
    handleRemoveQuestion
  };
}
