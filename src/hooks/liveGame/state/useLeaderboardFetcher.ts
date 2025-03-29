
import { useCallback } from 'react';

/**
 * Hook to provide a wrapper for fetching leaderboard data
 */
export const useLeaderboardFetcher = (
  gameId: string | undefined,
  isConnected: boolean,
  fetchLeaderboardData: () => Promise<void>,
  setLastSyncTimestamp: (time: number) => void
) => {
  // Create a proper Promise-returning function for leaderboard data fetching
  const fetchLeaderboardDataWrapper = useCallback(async (): Promise<void> => {
    if (gameId && isConnected) {
      try {
        await fetchLeaderboardData();
        setLastSyncTimestamp(Date.now());
        return Promise.resolve();
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        return Promise.reject(error);
      }
    }
    return Promise.resolve();
  }, [fetchLeaderboardData, gameId, isConnected, setLastSyncTimestamp]);

  return fetchLeaderboardDataWrapper;
};
