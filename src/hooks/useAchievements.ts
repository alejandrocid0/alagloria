
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AchievementWithProgress } from '@/types/achievements';
import { fetchUserAchievementsWithProgress } from '@/services/achievementService';
import { supabase } from '@/integrations/supabase/client';

export function useAchievements(category: string = 'cofrade') {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<AchievementWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [earnedCount, setEarnedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  // Suscribirse a los cambios en los logros
  useEffect(() => {
    if (!user) {
      setAchievements([]);
      setLoading(false);
      return;
    }
    
    const loadAchievements = async () => {
      setLoading(true);
      try {
        const achievementsWithProgress = await fetchUserAchievementsWithProgress(user.id, category);
        setAchievements(achievementsWithProgress);
        setEarnedCount(achievementsWithProgress.filter(a => a.earned).length);
        setTotalCount(achievementsWithProgress.length);
      } catch (error) {
        console.error('Error al cargar logros:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAchievements();
    
    // Suscribirse a cambios en logros
    const channel = supabase
      .channel('public:user_achievements')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_achievements',
          filter: `user_id=eq.${user.id}` 
        }, 
        () => {
          loadAchievements();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, category]);
  
  return {
    achievements,
    loading,
    earnedCount,
    totalCount,
    progress: totalCount > 0 ? Math.floor((earnedCount / totalCount) * 100) : 0
  };
}
