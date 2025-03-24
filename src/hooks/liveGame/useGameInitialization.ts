
import { useEffect } from 'react';

interface UseGameInitializationProps {
  gameId: string | undefined;
  fetchGameStateData: () => Promise<void>;
  fetchLeaderboardData: () => Promise<void>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  scheduleReconnect: () => void;
}

export const useGameInitialization = ({
  gameId,
  fetchGameStateData,
  fetchLeaderboardData,
  isLoading,
  setIsLoading,
  scheduleReconnect
}: UseGameInitializationProps) => {
  // Load initial data and set up subscriptions
  useEffect(() => {
    if (!gameId) return;
    
    setIsLoading(true);
    
    // Load initial data
    const loadInitialData = async () => {
      try {
        // Fetch game state
        await fetchGameStateData();
        
        // Fetch leaderboard
        await fetchLeaderboardData();
      } catch (err) {
        console.error('Error loading initial data:', err);
        scheduleReconnect();
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, [gameId, fetchGameStateData, fetchLeaderboardData, setIsLoading, scheduleReconnect]);
};
