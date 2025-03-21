
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Question, Option, DIFFICULTY_LEVELS } from '../types';
import { UseFormSetValue } from 'react-hook-form';
import { GameFormValues } from '../types';

type FetchGameDataResult = {
  questions: Question[];
  options: Option[];
  dateStr: string;
  timeStr: string;
};

export const fetchGameData = async (
  gameId: string,
  date: string,
  setValue: UseFormSetValue<GameFormValues>
): Promise<FetchGameDataResult | null> => {
  try {
    // Parse date and time
    const gameDate = new Date(date);
    const dateStr = gameDate.toISOString().split('T')[0];
    const timeStr = gameDate.toTimeString().slice(0, 5);

    setValue('gameDate', dateStr);
    setValue('gameTime', timeStr);

    // Fetch questions
    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('game_id', gameId)
      .order('position', { ascending: true });

    if (questionsError) throw questionsError;
    
    // Early return if no questions
    if (!questionsData || questionsData.length === 0) {
      return {
        questions: [],
        options: [],
        dateStr,
        timeStr
      };
    }

    // Fetch options for all questions
    const questionIds = questionsData.map(q => q.id);
    
    const { data: optionsData, error: optionsError } = await supabase
      .from('options')
      .select('*')
      .in('question_id', questionIds)
      .order('position', { ascending: true });

    if (optionsError) throw optionsError;

    // Format and return the data
    return {
      questions: questionsData,
      options: optionsData || [],
      dateStr,
      timeStr
    };
  } catch (error) {
    console.error('Error fetching game details:', error);
    toast({
      title: 'Error',
      description: 'No se pudieron cargar los detalles de la partida',
      variant: 'destructive',
    });
    return null;
  }
};

export const formatQuestionsForForm = (
  questions: any[],
  options: Option[]
) => {
  return questions.map(question => {
    const questionOptions = options.filter(o => o.question_id === question.id) || [];
    
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
};
