
import { supabase } from '@/integrations/supabase/client';
import { Question } from '@/types/liveGame';

export async function fetchQuestions(gameId: string): Promise<Question[]> {
  if (!gameId) return [];

  try {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        id,
        question_text,
        correct_option,
        position,
        options (
          id,
          option_id,
          option_text
        )
      `)
      .eq('game_id', gameId)
      .order('position');
    
    if (error) throw error;
    
    if (data) {
      return data.map((q) => ({
        id: q.id,
        text: q.question_text,
        correctOption: q.correct_option,
        timeLimit: 20, // Default time limit in seconds
        options: q.options.map((o) => o.option_text)
      }));
    }
    
    return [];
  } catch (err) {
    console.error('Error fetching questions:', err);
    throw new Error('No se pudieron cargar las preguntas');
  }
}
