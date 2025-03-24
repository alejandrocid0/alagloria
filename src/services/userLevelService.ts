
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

// Obtener progreso de nivel de un usuario
export async function fetchUserLevelProgress(userId: string): Promise<UserLevelProgress[]> {
  const { data, error } = await supabase
    .from('user_level_progress')
    .select('*, user_level:current_level_id(*)')
    .eq('user_id', userId);

  if (error) {
    console.error('Error al obtener progreso de nivel del usuario:', error);
    return [];
  }

  return data || [];
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

// Actualizar un nivel (solo admin)
export async function updateUserLevel(id: string, level: Partial<Omit<UserLevel, 'id' | 'created_at' | 'created_by'>>): Promise<UserLevel | null> {
  const { data, error } = await supabase
    .from('user_levels')
    .update(level)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar nivel:', error);
    return null;
  }

  return data;
}

// Obtener niveles con progreso para un usuario
export async function fetchUserLevelsWithProgress(
  userId: string,
  category: string = 'cofrade'
): Promise<UserLevelWithProgress[]> {
  try {
    // Obtener todos los niveles de la categoría
    const levels = await fetchUserLevelsByCategory(category);
    
    // Obtener el perfil del usuario para el nivel actual y progreso
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
    
    // Ordenar niveles por orden
    const sortedLevels = [...levels].sort((a, b) => a.level_order - b.level_order);
    
    // Calcular el siguiente nivel (si existe)
    const currentLevelIndex = sortedLevels.findIndex(level => level.id === profile?.current_level_id);
    const nextLevel = currentLevelIndex >= 0 && currentLevelIndex < sortedLevels.length - 1
      ? sortedLevels[currentLevelIndex + 1]
      : undefined;
    
    // Mapear los niveles con progreso
    return sortedLevels.map(level => {
      const isCurrentLevel = level.id === profile?.current_level_id;
      const isAchieved = isCurrentLevel || 
        (level.required_correct_answers <= correctAnswers);
      
      // Calcular progreso hacia el siguiente nivel o para el nivel actual
      let progress = 0;
      let requiredForNextLevel = 0;
      
      if (isCurrentLevel && nextLevel) {
        requiredForNextLevel = nextLevel.required_correct_answers - level.required_correct_answers;
        const progressTowardsNext = correctAnswers - level.required_correct_answers;
        progress = Math.min(
          100,
          Math.floor((progressTowardsNext / requiredForNextLevel) * 100)
        );
      } else if (isCurrentLevel) {
        // Ya está en el nivel máximo
        progress = 100;
      } else if (!isAchieved && level.required_correct_answers > 0) {
        // Calcular progreso hacia este nivel
        progress = Math.min(
          100,
          Math.floor((correctAnswers / level.required_correct_answers) * 100)
        );
      } else if (isAchieved) {
        // Ya ha superado este nivel
        progress = 100;
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

// Obtener el nivel actual del usuario
export async function fetchCurrentUserLevel(
  userId: string,
  category: string = 'cofrade'
): Promise<UserLevelWithProgress | null> {
  try {
    const levelsWithProgress = await fetchUserLevelsWithProgress(userId, category);
    return levelsWithProgress.find(lwp => lwp.isCurrentLevel) || null;
  } catch (error) {
    console.error('Error al obtener nivel actual del usuario:', error);
    return null;
  }
}
