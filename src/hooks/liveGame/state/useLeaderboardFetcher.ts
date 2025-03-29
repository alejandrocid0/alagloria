
import { Player } from '@/types/liveGame';

export const useLeaderboardFetcher = (
  gameId: string | undefined,
  isConnected: boolean,
  fetchLeaderboardData: () => Promise<Player[]>,
  setLastSyncTimestamp: (timestamp: number) => void
) => {
  return async (): Promise<void> => {
    if (!gameId || !isConnected) return;
    
    try {
      await fetchLeaderboardData();
      setLastSyncTimestamp(Date.now());
    } catch (err) {
      console.error('Error fetching leaderboard data:', err);
    }
  };
};
