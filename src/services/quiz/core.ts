
import { supabase } from '@/integrations/supabase/client';
import { Quiz, QuizWithDetails } from './types';

/**
 * Obtiene todos los quizzes disponibles
 */
export const getAllQuizzes = async (): Promise<Quiz[]> => {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

/**
 * Obtiene un quiz por su ID
 */
export const getQuizById = async (id: string): Promise<QuizWithDetails | null> => {
  const { data, error } = await supabase
    .from('games_with_details')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching quiz by id:', error);
    return null;
  }
  
  return data;
};

/**
 * Obtiene quizzes por categoría
 */
export const getQuizzesByCategory = async (category: string): Promise<Quiz[]> => {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};
