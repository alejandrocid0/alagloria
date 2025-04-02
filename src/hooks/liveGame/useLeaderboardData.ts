
import { useState, useEffect, useCallback } from 'react';
import { Player } from '@/types/liveGame';
import { fetchGameLeaderboard, subscribeToLeaderboardUpdates } from './leaderboardUtils';
import { supabase } from '@/integrations/supabase/client';

export const useLeaderboardData = (gameId: string | undefined) => {
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);

  // Fetch leaderboard data with throttling
  const fetchLeaderboardData = useCallback(async () => {
    if (!gameId) return [];
    
    // Simple throttling to prevent excessive calls
    const now = Date.now();
    if (now - lastUpdateTime < 1000) {
      console.log('[LeaderboardData] Throttling leaderboard update');
      return leaderboard;
    }
    
    setLastUpdateTime(now);
    
    try {
      console.log(`[LeaderboardData] Fetching leaderboard for game: ${gameId}`);
      const data = await fetchGameLeaderboard(gameId);
      setLeaderboard(data);
      return data;
    } catch (err) {
      console.error('[LeaderboardData] Error fetching leaderboard:', err);
      return [];
    }
  }, [gameId, lastUpdateTime, leaderboard]);
  
  // Handle leaderboard updates from realtime subscription
  const handleLeaderboardUpdate = useCallback(() => {
    console.log('[LeaderboardData] Received leaderboard update');
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
      console.log(`[LeaderboardData] Subscribed to leaderboard updates for game: ${gameId}`);
    }
    
    // Clean up subscriptions when unmounting
    return () => {
      if (leaderboardChannel) {
        console.log('[LeaderboardData] Unsubscribing from leaderboard updates');
        supabase.removeChannel(leaderboardChannel);
      }
    };
  }, [gameId, fetchLeaderboardData, handleLeaderboardUpdate]);

  return { leaderboard, fetchLeaderboardData };
};

export default useLeaderboardData;
