
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useGameStateUtils = () => {
  // Fetch game information
  const fetchGameInfo = useCallback(async (gameId: string) => {
    if (!gameId) return null;
    
    try {
      const { data, error } = await supabase
        .from('games')
        .select('title, date, category')
        .eq('id', gameId)
        .single();
      
      if (error) {
        console.error('[GameUtils] Error fetching game info:', error);
        throw error;
      }
      
      return {
        title: data.title,
        scheduledTime: data.date,
        category: data.category
      };
    } catch (err) {
      console.error('[GameUtils] Error fetching game info:', err);
      return null;
    }
  }, []);
  
  // Check if a gameState has changed meaningfully
  const hasGameStateChanged = useCallback((oldState: any, newState: any) => {
    if (!oldState) return true;
    if (!newState) return false;
    
    return (
      oldState.status !== newState.status ||
      oldState.current_question !== newState.current_question ||
      oldState.countdown !== newState.countdown ||
      new Date(newState.updated_at) > new Date(oldState.updated_at)
    );
  }, []);

  return {
    fetchGameInfo,
    hasGameStateChanged
  };
};

export default useGameStateUtils;
