
import { useState, useCallback, useEffect } from 'react';
import { LiveGameState } from '@/types/liveGame';
import { fetchGameState, subscribeToGameStateUpdates } from './gameStateUtils';
import { toast } from '@/hooks/use-toast';
import { gameNotifications } from '@/components/ui/notification-toast';

export const useGameStateSubscription = (gameId: string | undefined) => {
  const [gameState, setGameState] = useState<LiveGameState | null>(null);
  const [prevGameState, setPrevGameState] = useState<LiveGameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [serverTimeOffset, setServerTimeOffset] = useState<number>(0);
  
  // Sync local time with server time
  const syncWithServer = useCallback(async () => {
    try {
      const startTime = Date.now();
      const response = await fetch('https://worldtimeapi.org/api/ip');
      const endTime = Date.now();
      const roundTripTime = endTime - startTime;
      
      if (!response.ok) {
        console.error('Time sync failed: Server responded with status', response.status);
        return;
      }
      
      const data = await response.json();
      const serverTime = new Date(data.datetime).getTime();
      const clientTime = Date.now();
      
      // Adjust for round-trip latency (approximation)
      const adjustedOffset = serverTime - (clientTime - Math.floor(roundTripTime / 2));
      setServerTimeOffset(adjustedOffset);
      
      console.log('Time sync complete. Offset:', adjustedOffset, 'ms');
    } catch (err) {
      console.error('Time sync failed:', err);
    }
  }, []);
  
  // Fetch game state from the server
  const fetchGameStateData = useCallback(async () => {
    if (!gameId) return;

    // Throttle requests - don't allow more than one fetch every 2 seconds
    const now = Date.now();
    if (now - lastFetchTime < 2000) {
      console.log(`[GameState] Throttling fetch request (${Math.floor((now - lastFetchTime)/1000)}s since last fetch)`);
      return;
    }
    
    setLastFetchTime(now);

    try {
      // Sincronizar con el servidor antes de obtener el estado
      await syncWithServer();
      
      const state = await fetchGameState(gameId);
      
      if (state) {
        console.log(`[GameState] Estado del juego ${gameId} obtenido:`, state);
        
        // Save previous state before updating
        if (gameState) {
          setPrevGameState(gameState);
        }
        
        // Only update state if it's actually different from current state
        // or if it's the same status but the updated_at timestamp is newer
        if (!gameState || 
            gameState.status !== state.status || 
            gameState.current_question !== state.current_question ||
            gameState.countdown !== state.countdown ||
            new Date(state.updated_at) > new Date(gameState.updated_at)) {
          
          console.log(`[GameState] Actualizando estado del juego:`, state);
          setGameState(state);
          setIsLoading(false);
          
          // Check if we need to notify about state change
          if (gameState && gameState.status !== state.status) {
            notifyStateChange(gameState.status, state.status);
          }
        } else {
          console.log(`[GameState] El estado no ha cambiado significativamente, omitiendo actualización`);
        }
        
        // Update connection state to connected if we successfully fetched the state
        if (!isConnected) {
          setIsConnected(true);
          gameNotifications.connectSuccess();
          setReconnectAttempts(0);
        }
      } else {
        console.log(`[GameState] No se encontró estado para el juego ${gameId}`);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('[GameState] Error fetching game state:', err);
      setError('No se pudo cargar el estado del juego');
      setIsLoading(false);
      
      // Mark as disconnected if fetch fails
      if (isConnected) {
        setIsConnected(false);
        gameNotifications.connectionLost();
      }
      
      // Schedule reconnection attempt with exponential backoff
      scheduleReconnect();
    }
  }, [gameId, isConnected, syncWithServer, lastFetchTime, gameState]);

  // Notify about game state changes
  const notifyStateChange = (prevStatus: string, newStatus: string) => {
    switch (newStatus) {
      case 'question':
        gameNotifications.newQuestion();
        break;
      case 'result':
        gameNotifications.showingResults();
        break;
      case 'leaderboard':
        gameNotifications.showingLeaderboard();
        break;
      case 'finished':
        // We'll handle the finished state in the main component with rank info
        break;
    }
  };

  // Simple reconnection logic
  const scheduleReconnect = useCallback(() => {
    setReconnectAttempts(prev => {
      const attempts = prev + 1;
      const delay = Math.min(30000, Math.pow(2, attempts) * 1000); // Exponential backoff with 30s max
      
      console.log(`[GameState] Scheduling reconnect attempt ${attempts} in ${delay}ms`);
      setTimeout(fetchGameStateData, delay);
      
      return attempts;
    });
  }, [fetchGameStateData]);

  // Handle game state changes from subscription
  const handleGameStateChange = useCallback((payload: any) => {
    console.log('[GameState] Cambio detectado por suscripción:', payload);
    
    // Check if this is a new state by comparing timestamps
    if (gameState && payload.new && new Date(payload.new.updated_at) <= new Date(gameState.updated_at)) {
      console.log('[GameState] El estado recibido es más antiguo o igual que el actual, ignorando');
      return;
    }
    
    // Fetch new state rather than directly using payload
    // Sync with server before fetching new state
    syncWithServer().then(() => {
      // Add small delay to allow database to settle
      setTimeout(() => {
        fetchGameStateData();
      }, 300);
    });
  }, [fetchGameStateData, syncWithServer, gameState]);

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

  // Set up initial data loading
  useEffect(() => {
    if (gameId) {
      // Fetch initial state
      fetchGameStateData();
      
      // Sync time with server
      syncWithServer();
      
      // Set up a periodic refresh to make sure we stay in sync (every 15s)
      const periodicRefreshInterval = setInterval(() => {
        console.log('[GameState] Realizando actualización periódica');
        fetchGameStateData();
      }, 15000);
      
      // Re-sync with the server every 5 minutes
      const timeSyncInterval = setInterval(() => {
        console.log('[GameState] Re-sincronizando reloj con el servidor');
        syncWithServer();
      }, 300000); // 5 minutes
      
      return () => {
        clearInterval(periodicRefreshInterval);
        clearInterval(timeSyncInterval);
      };
    }
  }, [gameId, fetchGameStateData, syncWithServer]);

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
