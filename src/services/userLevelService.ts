
import { supabase } from '@/integrations/supabase/client';
import { UserLevel, UserLevelProgress, UserLevelWithProgress } from '@/types/userLevels';

// Obtener todos los niveles
export async function fetchUserLevels(): Promise<UserLevel[]> {
  const { data, error } = await supabase
    .from('user_levels')
    .select('*')
    .order('level_order', { ascending: true });

  if (error) {
    console.error('Error al obtener niveles:', error);
    return [];
  }

  return data || [];
}

// Obtener niveles por categoría
export async function fetchUserLevelsByCategory(category: string = 'cofrade'): Promise<UserLevel[]> {
  const { data, error } = await supabase
    .from('user_levels')
    .select('*')
    .eq('category', category)
    .order('level_order', { ascending: true });

  if (error) {
    console.error(`Error al obtener niveles de categoría ${category}:`, error);
    return [];
  }

  return data || [];
}

// Obtener el nivel actual de un usuario
export async function fetchCurrentUserLevel(userId: string): Promise<UserLevel | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('current_level_id, current_level:current_level_id(id, name, description, icon_name, required_correct_answers, level_order, category)')
    .eq('id', userId)
    .single();

  if (error || !data || !data.current_level) {
    console.error('Error al obtener nivel actual del usuario:', error);
    return null;
  }

  return data.current_level as UserLevel;
}

// Crear un nuevo nivel (solo admin)
export async function createUserLevel(level: Omit<UserLevel, 'id' | 'created_at' | 'created_by'>): Promise<UserLevel | null> {
  const { data, error } = await supabase
    .from('user_levels')
    .insert({
      ...level,
      created_by: (await supabase.auth.getSession()).data.session?.user.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error al crear nivel:', error);
    return null;
  }

  return data;
}

// Eliminar un nivel (solo admin)
export async function deleteUserLevel(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_levels')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar nivel:', error);
    return false;
  }

  return true;
}

// Obtener niveles con progreso del usuario
export async function fetchUserLevelsWithProgress(
  userId: string,
  category: string = 'cofrade'
): Promise<UserLevelWithProgress[]> {
  try {
    // Obtener todos los niveles de la categoría
    const levels = await fetchUserLevelsByCategory(category);
    
    // Obtener el perfil del usuario para las estadísticas
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('current_level_id, current_level_progress, correct_answers_by_category')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('Error al obtener el perfil del usuario:', profileError);
      return [];
    }
    
    // Obtener el número de respuestas correctas para la categoría
    const correctAnswers = profile?.correct_answers_by_category?.[category] || 0;
    const currentLevelId = profile?.current_level_id;
    
    // Ordenar los niveles por orden
    const sortedLevels = levels.sort((a, b) => a.level_order - b.level_order);
    
    // Mapear los niveles con progreso
    return sortedLevels.map(level => {
      const isCurrentLevel = level.id === currentLevelId;
      const isAchieved = correctAnswers >= level.required_correct_answers;
      
      // Encontrar el siguiente nivel para calcular el progreso
      const nextLevelIndex = sortedLevels.findIndex(l => l.id === level.id) + 1;
      const nextLevel = nextLevelIndex < sortedLevels.length ? sortedLevels[nextLevelIndex] : null;
      
      let progress = 0;
      
      if (isAchieved) {
        progress = 100;
      } else if (nextLevel && level.required_correct_answers < nextLevel.required_correct_answers) {
        // Calcular progreso hacia el siguiente nivel
        const levelRange = nextLevel.required_correct_answers - level.required_correct_answers;
        const userProgress = correctAnswers - level.required_correct_answers;
        progress = Math.min(99, Math.max(0, Math.floor((userProgress / levelRange) * 100)));
      }
      
      return {
        level,
        isCurrentLevel,
        isAchieved,
        progress,
        currentAnswers: correctAnswers,
        nextLevelAnswers: nextLevel?.required_correct_answers
      };
    });
  } catch (error) {
    console.error('Error al obtener niveles con progreso:', error);
    return [];
  }
}
