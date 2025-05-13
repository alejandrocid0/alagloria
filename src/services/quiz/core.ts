
import { supabase } from '@/integrations/supabase/client';
import type { QuizQuestion, QuizSubmission } from './types';

/**
 * Fetch questions for a quiz
 */
export async function fetchQuizQuestions(quizId: string): Promise<QuizQuestion[]> {
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
      .eq('game_id', quizId)
      .order('position');

    if (error) throw error;
    
    return data.map(q => ({
      id: q.id,
      text: q.question_text,
      position: q.position,
      correctOption: q.correct_option,
      options: q.options.map(o => ({
        id: o.id,
        optionId: o.option_id,
        text: o.option_text
      }))
    }));
  } catch (err) {
    console.error('Error fetching quiz questions:', err);
    return [];
  }
}

/**
 * Submit an answer to a quiz question
 */
export async function submitQuizAnswer(submission: QuizSubmission): Promise<{
  correct: boolean;
  points: number;
  correctOption: string;
} | null> {
  try {
    const { data, error } = await supabase.rpc(
      'submit_game_answer',
      {
        p_game_id: submission.gameId,
        p_user_id: submission.userId,
        p_question_position: submission.questionPosition,
        p_selected_option: submission.selectedOption,
        p_answer_time_ms: submission.answerTimeMs || 0
      }
    );

    if (error) throw error;
    
    if (!data || data.length === 0) return null;
    
    return {
      correct: data[0].is_correct,
      points: data[0].points,
      correctOption: data[0].correctoption
    };
  } catch (err) {
    console.error('Error submitting quiz answer:', err);
    return null;
  }
}
