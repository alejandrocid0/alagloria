
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserLevelWithProgress } from '@/types/userLevels';
import { fetchUserLevelsWithProgress, fetchCurrentUserLevel } from '@/services/userLevelService';
import { supabase } from '@/integrations/supabase/client';

export function useUserLevels(category: string = 'cofrade') {
  const { user } = useAuth();
  const [levels, setLevels] = useState<UserLevelWithProgress[]>([]);
  const [currentLevel, setCurrentLevel] = useState<UserLevelWithProgress | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Cargar niveles y suscribirse a cambios
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
        // Cargar niveles con progreso
        const levelsWithProgress = await fetchUserLevelsWithProgress(user.id, category);
        setLevels(levelsWithProgress);
        
        // Establecer nivel actual
        const current = await fetchCurrentUserLevel(user.id, category);
        setCurrentLevel(current);
      } catch (error) {
        console.error('Error al cargar niveles:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadLevels();
    
    // Suscribirse a cambios en el perfil del usuario (para nivel actual)
    const profileChannel = supabase
      .channel('profile-changes')
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
    
    // Suscribirse a cambios en respuestas de juegos (para actualizar progreso)
    const answersChannel = supabase
      .channel('game-answers-changes')
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
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(answersChannel);
    };
  }, [user, category]);
  
  return {
    levels,
    currentLevel,
    loading
  };
}
