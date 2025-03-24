
import { useState, useEffect, useCallback } from 'react';
import { Player } from '@/types/liveGame';
import { fetchGameLeaderboard, subscribeToLeaderboardUpdates } from './leaderboardUtils';
import { supabase } from '@/integrations/supabase/client';

export const useLeaderboardData = (gameId: string | undefined) => {
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);

  // Fetch leaderboard data
  const fetchLeaderboardData = useCallback(async () => {
    if (!gameId) return;
    
    try {
      const data = await fetchGameLeaderboard(gameId);
      setLeaderboard(data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
  }, [gameId]);
  
  // Handle leaderboard updates
  const handleLeaderboardUpdate = useCallback(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);
  
  // Set up subscriptions for leaderboard updates
  useEffect(() => {
    let leaderboardChannel: any = null;
    
    if (gameId) {
      // Initial fetch
      fetchLeaderboardData();
      
      // Subscribe to updates
      leaderboardChannel = subscribeToLeaderboardUpdates(gameId, handleLeaderboardUpdate);
    }
    
    // Clean up subscriptions when unmounting
    return () => {
      if (leaderboardChannel) supabase.removeChannel(leaderboardChannel);
    };
  }, [gameId, fetchLeaderboardData, handleLeaderboardUpdate]);

  return { leaderboard, setLeaderboard };
};
