
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GameFormValues, gameFormSchema } from '../schemas/gameFormSchema';

export function useGameForm() {
  const form = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: {
      title: '',
      description: '',
      gameDate: new Date().toISOString().split('T')[0],
      gameTime: '18:00',
      category: 'semana-santa', // Default to Semana Santa
      questions: [
        {
          id: crypto.randomUUID(),
          text: '',
          correctOption: '',
          options: Array(5).fill(0).map((_, i) => ({
            id: String.fromCharCode(65 + i), // A, B, C, D, E
            text: '',
          })),
        },
      ],
    },
  });
  
  const { fields: questionsFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  const handleAddQuestion = () => {
    appendQuestion({
      id: crypto.randomUUID(),
      text: '',
      correctOption: '',
      options: Array(5).fill(0).map((_, i) => ({
        id: String.fromCharCode(65 + i), // A, B, C, D, E
        text: '',
      })),
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
