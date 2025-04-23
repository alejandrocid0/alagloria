
import { useEffect, useRef, useState } from 'react';
import { realTimeSync } from '@/services/games/realTimeSync';
import { RealtimeChannel } from '@supabase/supabase-js';

export const useGameSubscriptions = (
  gameId: string | undefined,
  onGameStateUpdate: () => void,
  onLeaderboardUpdate: () => void
) => {
  const [isConnected, setIsConnected] = useState(true);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const subscriptionsRef = useRef<{
    gameState?: RealtimeChannel;
    leaderboard?: RealtimeChannel;
  }>({});

  useEffect(() => {
    if (!gameId) return;

    // Subscribe to game state changes
    const gameStateSubscription = realTimeSync.subscribeToGameState(gameId, () => {
      setIsConnected(true);
      onGameStateUpdate();
    });

    // Subscribe to leaderboard changes
    const leaderboardSubscription = realTimeSync.subscribeToLeaderboard(gameId, () => {
      setIsConnected(true);
      onLeaderboardUpdate();
    });

    // Store subscriptions
    subscriptionsRef.current = {
      gameState: gameStateSubscription,
      leaderboard: leaderboardSubscription
    };

    // Cleanup
    return () => {
      if (subscriptionsRef.current.gameState) {
        realTimeSync.unsubscribe(subscriptionsRef.current.gameState);
      }
      if (subscriptionsRef.current.leaderboard) {
        realTimeSync.unsubscribe(subscriptionsRef.current.leaderboard);
      }
    };
  }, [gameId, onGameStateUpdate, onLeaderboardUpdate]);

  const handleConnectionLost = () => {
    setIsConnected(false);
    setReconnectAttempts(prev => prev + 1);
  };

  return {
    isConnected,
    reconnectAttempts,
    handleConnectionLost
  };
};
