
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useGameStats = (gameId: string | undefined) => {
  const [playersCount, setPlayersCount] = useState(0);
  const [answersCount, setAnswersCount] = useState(0);

  const loadPlayersCount = useCallback(async () => {
    if (!gameId) return;
    
    try {
      const { count, error } = await supabase
        .from('game_participants')
        .select('*', { count: 'exact', head: true })
        .eq('game_id', gameId);
      
      if (error) throw error;
      setPlayersCount(count || 0);
    } catch (err) {
      console.error('Error loading players count:', err);
    }
  }, [gameId]);

  const loadAnswersCount = useCallback(async () => {
    if (!gameId) return;
    
    try {
      const { count, error } = await supabase
        .from('live_game_answers')
        .select('*', { count: 'exact', head: true })
        .eq('game_id', gameId);
      
      if (error) throw error;
      setAnswersCount(count || 0);
    } catch (err) {
      console.error('Error loading answers count:', err);
    }
  }, [gameId]);

  return {
    playersCount,
    setPlayersCount,
    answersCount,
    setAnswersCount,
    loadPlayersCount,
    loadAnswersCount
  };
};
