
import { supabase } from '@/integrations/supabase/client';
import { Achievement, UserAchievement, AchievementWithProgress } from '@/types/achievements';

// Obtener todos los logros
export async function fetchAchievements(): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('required_correct_answers', { ascending: true });

  if (error) {
    console.error('Error al obtener logros:', error);
    return [];
  }

  return data || [];
}

// Obtener logros por categoría
export async function fetchAchievementsByCategory(category: string = 'cofrade'): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('category', category)
    .order('required_correct_answers', { ascending: true });

  if (error) {
    console.error(`Error al obtener logros de categoría ${category}:`, error);
    return [];
  }

  return data || [];
}

// Obtener logros de un usuario
export async function fetchUserAchievements(userId: string): Promise<UserAchievement[]> {
  const { data, error } = await supabase
    .from('user_achievements')
    .select('*, achievement:achievement_id(*)')
    .eq('user_id', userId);

  if (error) {
    console.error('Error al obtener logros del usuario:', error);
    return [];
  }

  return data || [];
}

// Crear un nuevo logro (solo admin)
export async function createAchievement(achievement: Omit<Achievement, 'id' | 'created_at' | 'created_by'>): Promise<Achievement | null> {
  const { data, error } = await supabase
    .from('achievements')
    .insert({
      ...achievement,
      created_by: (await supabase.auth.getSession()).data.session?.user.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error al crear logro:', error);
    return null;
  }

  return data;
}

// Eliminar un logro (solo admin)
export async function deleteAchievement(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('achievements')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar logro:', error);
    return false;
  }

  return true;
}

// Obtener logros con progreso del usuario
export async function fetchUserAchievementsWithProgress(
  userId: string,
  category: string = 'cofrade'
): Promise<AchievementWithProgress[]> {
  try {
    // Obtener todos los logros de la categoría
    const achievements = await fetchAchievementsByCategory(category);
    
    // Obtener los logros ganados por el usuario
    const userAchievements = await fetchUserAchievements(userId);
    
    // Obtener el perfil del usuario para las estadísticas
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('correct_answers_by_category')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('Error al obtener el perfil del usuario:', profileError);
      return [];
    }
    
    // Obtener el número de respuestas correctas para la categoría
    const correctAnswers = profile?.correct_answers_by_category?.[category] || 0;
    
    // Mapear los logros con progreso
    return achievements.map(achievement => {
      const earnedAchievement = userAchievements.find(ua => 
        ua.achievement_id === achievement.id
      );
      
      const progress = Math.min(
        100,
        Math.floor((correctAnswers / achievement.required_correct_answers) * 100)
      );
      
      return {
        achievement,
        earned: !!earnedAchievement,
        earned_at: earnedAchievement?.earned_at,
        progress,
        current_count: correctAnswers
      };
    });
  } catch (error) {
    console.error('Error al obtener logros con progreso:', error);
    return [];
  }
}
