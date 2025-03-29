
import { useCallback, useEffect } from 'react';

/**
 * Hook to monitor system health and log activity
 */
export const useGameStateMonitor = (
  gameId: string | undefined,
  gameState: any,
  isConnected: boolean,
  lastSyncTimestamp: number,
  setLastSyncTimestamp: (time: number) => void,
  reconnectAttempts: number,
  networkReconnectAttempts: number,
  networkStatus: string,
  clientTimeOffset: number,
  syncAttempts: number,
  leaderboard: any[],
  questions: any[],
  actions: {
    fetchGameStateData: () => Promise<void>,
    fetchLeaderboardData: () => Promise<void>,
    fetchQuestionsData: () => Promise<void>,
    syncWithServer: () => Promise<boolean>
  }
) => {
  // Monitor system health and log activity
  useEffect(() => {
    // Log system health every minute
    const monitorInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastSync = now - lastSyncTimestamp;
      
      console.log('[System Monitor] Status Report:', {
        gameId,
        gameState: gameState?.status,
        currentQuestion: gameState?.current_question,
        networkStatus,
        isConnected,
        reconnectAttempts,
        networkReconnectAttempts,
        clientTimeOffset,
        syncAttempts,
        timeSinceLastSync: `${Math.round(timeSinceLastSync / 1000)}s ago`,
        leaderboardSize: leaderboard.length,
        questionsLoaded: questions.length
      });
      
      // Trigger reconnection if we haven't synced in more than 2 minutes
      if (timeSinceLastSync > 120000 && gameState && gameState.status !== 'finished') {
        console.log('[System Monitor] Detected stale data, forcing refresh');
        actions.fetchGameStateData();
        actions.fetchLeaderboardData();
        actions.fetchQuestionsData();
        actions.syncWithServer();
        setLastSyncTimestamp(now);
      }
    }, 60000);
    
    return () => clearInterval(monitorInterval);
  }, [
    clientTimeOffset, actions.fetchGameStateData, actions.fetchLeaderboardData, 
    actions.fetchQuestionsData, gameId, gameState, isConnected, lastSyncTimestamp, 
    leaderboard.length, networkReconnectAttempts, networkStatus, questions.length, 
    reconnectAttempts, syncAttempts, actions.syncWithServer, setLastSyncTimestamp
  ]);
};
