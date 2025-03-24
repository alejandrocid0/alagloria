
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserLevelWithProgress } from '@/types/userLevels';
import { fetchUserLevelsWithProgress } from '@/services/userLevelService';
import { supabase } from '@/integrations/supabase/client';

export function useUserLevels(category: string = 'cofrade') {
  const { user } = useAuth();
  const [levels, setLevels] = useState<UserLevelWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentLevel, setCurrentLevel] = useState<UserLevelWithProgress | null>(null);
  
  // Suscribirse a los cambios en los niveles
  useEffect(() => {
    if (!user) {
      setLevels([]);
      setCurrentLevel(null);
      setLoading(false);
      return;
    }
    
    const loadLevels = async () => {
      setLoading(true);
      try {
        const levelsWithProgress = await fetchUserLevelsWithProgress(user.id, category);
        setLevels(levelsWithProgress);
        
        // Identificar el nivel actual
        const current = levelsWithProgress.find(l => l.isCurrentLevel) || null;
        setCurrentLevel(current);
      } catch (error) {
        console.error('Error al cargar niveles:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadLevels();
    
    // Suscribirse a cambios en perfiles (para actualizaciones de nivel)
    const profilesChannel = supabase
      .channel('profiles_changes')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles',
          filter: `id=eq.${user.id}` 
        }, 
        () => {
          loadLevels();
        }
      )
      .subscribe();
    
    // Suscribirse a cambios en las respuestas del juego
    const answersChannel = supabase
      .channel('game_answers_changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'live_game_answers',
          filter: `user_id=eq.${user.id}` 
        }, 
        () => {
          loadLevels();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(answersChannel);
    };
  }, [user, category]);
  
  return {
    levels,
    loading,
    currentLevel,
    hasPreviousLevel: currentLevel 
      ? levels.some(l => l.level.level_order < currentLevel.level.level_order && l.isAchieved) 
      : false,
    hasNextLevel: currentLevel 
      ? levels.some(l => l.level.level_order > currentLevel.level.level_order) 
      : false
  };
}
