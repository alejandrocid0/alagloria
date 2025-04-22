
import { useState, useEffect, useCallback } from 'react';
import { realTimeSync } from '@/services/games/realTimeSync';
import { RealtimeChannel } from '@supabase/supabase-js';
import { LiveGameState } from '@/types/liveGame';

export const useGameSync = (gameId: string | undefined) => {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // Handle game state updates
  const handleGameStateUpdate = useCallback((payload: any) => {
    console.log('[GameSync] Game state updated:', payload);
    setLastUpdate(new Date());
    setIsConnected(true);
  }, []);

  // Set up subscriptions
  useEffect(() => {
    if (!gameId) return;

    console.log('[GameSync] Setting up game synchronization for:', gameId);
    let channels: RealtimeChannel[] = [];

    try {
      // Subscribe to game state changes
      const gameStateChannel = realTimeSync.subscribeToGameState(gameId, handleGameStateUpdate);
      channels.push(gameStateChannel);
      
      setIsConnected(true);
      
    } catch (error) {
      console.error('[GameSync] Error setting up game sync:', error);
      setIsConnected(false);
      setReconnectAttempts(prev => prev + 1);
    }

    // Cleanup subscriptions
    return () => {
      console.log('[GameSync] Cleaning up game sync subscriptions');
      channels.forEach(channel => realTimeSync.unsubscribe(channel));
      setIsConnected(false);
    };
  }, [gameId, handleGameStateUpdate]);

  return {
    lastUpdate,
    isConnected,
    reconnectAttempts
  };
};

