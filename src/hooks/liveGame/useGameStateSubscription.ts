
import { useCallback, useEffect, useRef } from 'react';
import { subscribeToGameStateUpdates } from './gameStateUtils';
import { useTimeSync } from './useTimeSync';
import { useConnectionStatus } from './useConnectionStatus';
import { useGameStateFetcher } from './useGameStateFetcher';
import { gameNotifications } from '@/components/ui/notification-toast';

export const useGameStateSubscription = (gameId: string | undefined) => {
  // Use composed hooks
  const { serverTimeOffset, syncWithServer } = useTimeSync();
  const { 
    gameState, 
    prevGameState, 
    isLoading, 
    error, 
    fetchGameStateData 
  } = useGameStateFetcher(gameId);
  
  // Create a void-returning wrapper for useConnectionStatus
  const fetchGameStateWrapper = useCallback(async () => {
    if (!gameId) return;
    await fetchGameStateData(true);
  }, [fetchGameStateData, gameId]);
  
  const { 
    isConnected, 
    reconnectAttempts, 
    setIsConnected, 
    scheduleReconnect 
  } = useConnectionStatus(fetchGameStateWrapper);

  // Ref para evitar actualizaciones múltiples
  const lastUpdateTimestampRef = useRef<number>(0);
  const notificationShownRef = useRef<boolean>(false);

  // Handle game state changes from subscription
  const handleGameStateChange = useCallback((payload: any) => {
    console.log('[GameState] Cambio detectado por suscripción:', payload);
    
    // Evitar procesamiento de eventos demasiado cercanos en el tiempo (throttling)
    const now = Date.now();
    if (now - lastUpdateTimestampRef.current < 1000) {
      console.log('[GameState] Ignorando cambio por throttling');
      return;
    }
    
    lastUpdateTimestampRef.current = now;
    
    // Check if this is a new state by comparing timestamps
    if (gameState && payload.new && new Date(payload.new.updated_at) <= new Date(gameState.updated_at)) {
      console.log('[GameState] El estado recibido es más antiguo o igual que el actual, ignorando');
      return;
    }
    
    // Sync with server before fetching new state
    syncWithServer().then(() => {
      // Add small delay to allow database to settle
      setTimeout(() => {
        fetchGameStateData(true);
      }, 300);
    });
  }, [fetchGameStateData, syncWithServer, gameState]);

  // Update connection state based on fetch results
  useEffect(() => {
    if (error) {
      if (isConnected) {
        setIsConnected(false);
        if (!notificationShownRef.current) {
          gameNotifications.connectionLost();
          notificationShownRef.current = true;
          setTimeout(() => {
            notificationShownRef.current = false;
          }, 5000);
        }
      }
      scheduleReconnect();
    } else if (gameState) {
      if (!isConnected) {
        setIsConnected(true);
        if (!notificationShownRef.current && reconnectAttempts > 0) {
          gameNotifications.connectSuccess();
          notificationShownRef.current = true;
          setTimeout(() => {
            notificationShownRef.current = false;
          }, 5000);
        }
      }
    }
  }, [error, gameState, setIsConnected, scheduleReconnect, isConnected, reconnectAttempts]);

  // Set up subscription to game state changes
  useEffect(() => {
    if (!gameId) return;
    
    const subscription = subscribeToGameStateUpdates(gameId, handleGameStateChange);
    
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [gameId, handleGameStateChange]);

  // Set up initial data loading and periodic refresh - con throttling 
  useEffect(() => {
    if (gameId) {
      // Fetch initial state
      fetchGameStateData(true);
      
      // Set up a periodic refresh to make sure we stay in sync (every 15s)
      const periodicRefreshInterval = setInterval(() => {
        console.log('[GameState] Realizando actualización periódica');
        fetchGameStateData(false);
      }, 15000);
      
      return () => {
        clearInterval(periodicRefreshInterval);
      };
    }
  }, [gameId, fetchGameStateData]);

  return {
    gameState,
    prevGameState,
    isLoading,
    error,
    isConnected,
    fetchGameStateData,
    scheduleReconnect,
    reconnectAttempts,
    serverTimeOffset
  };
};

export default useGameStateSubscription;
