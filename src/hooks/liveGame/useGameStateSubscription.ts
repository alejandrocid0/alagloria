
import { useState, useCallback, useEffect } from 'react';
import { LiveGameState } from '@/types/liveGame';
import { fetchGameState } from './gameStateUtils';
import { toast } from '@/hooks/use-toast';
import { useTimeSync } from './useTimeSync';
import { useReconnection } from './state/useReconnection';
import { useAutoAdvanceTimer } from './state/useAutoAdvanceTimer';
import { useStaleDataCheck } from './state/useStaleDataCheck';
import { useGameChecker } from './state/useGameChecker';
import { useGameSubscription } from './state/useGameSubscription';

export const useGameStateSubscription = (gameId: string | undefined) => {
  const [gameState, setGameState] = useState<LiveGameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  
  // Obtenemos la función para sincronizar tiempo
  const { syncWithServer } = useTimeSync();
  
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
          
          // Update stale data checker
          updateLastStateTimestamp();
          
          // Configurar un timer para auto-avanzar basado en el countdown
          autoAdvanceTimer.setupAutoAdvanceTimer(state);
        } else {
          console.log(`[GameState] El estado no ha cambiado significativamente, omitiendo actualización`);
        }
        
        // Update connection state to connected if we successfully fetched the state
        if (!isConnected) {
          setIsConnected(true);
          toast({
            title: "Conexión recuperada",
            description: "Te has vuelto a conectar a la partida",
            variant: "default",
          });
          reconnection.reconnectAttemptsRef.current = 0;
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
        toast({
          title: "Conexión perdida",
          description: "Intentando reconectar...",
          variant: "destructive",
        });
      }
      
      // Schedule reconnection attempt with exponential backoff
      reconnection.scheduleReconnect();
    }
  }, [gameId, isConnected, syncWithServer, lastFetchTime, gameState]);

  // Initialize reconnection handler
  const reconnection = useReconnection(isConnected, fetchGameStateData);
  
  // Initialize auto-advance timer
  const autoAdvanceTimer = useAutoAdvanceTimer(fetchGameStateData);

  // Initialize stale data checker
  const { updateLastStateTimestamp } = useStaleDataCheck(isConnected, gameState, fetchGameStateData);

  // Initialize game checker
  const gameChecker = useGameChecker(gameId);

  // Handle game state changes from subscription
  const handleGameStateChange = useCallback((payload: any) => {
    console.log('[GameState] Cambio detectado por suscripción:', payload);
    
    // Check if this is a new state by comparing timestamps
    if (gameState && payload.new && new Date(payload.new.updated_at) <= new Date(gameState.updated_at)) {
      console.log('[GameState] El estado recibido es más antiguo o igual que el actual, ignorando');
      return;
    }
    
    // Update timestamp
    updateLastStateTimestamp();
    
    // Fetch new state rather than directly using payload to ensure consistency
    // Sync with server before fetching new state
    syncWithServer().then(() => {
      // Add small delay to allow database to settle
      setTimeout(() => {
        fetchGameStateData();
      }, 300);
    });
  }, [fetchGameStateData, syncWithServer, updateLastStateTimestamp, gameState]);

  // Set up subscription to game state changes
  useGameSubscription(gameId, handleGameStateChange);

  // Set up initial data loading and clean up on unmount
  useEffect(() => {
    if (gameId) {
      // Fetch initial state
      fetchGameStateData();
      
      // Initialize game checker
      const cleanupGameChecker = gameChecker.initializeGameChecker();
      
      // Set up a periodic refresh to make sure we stay in sync (every 15s)
      const periodicRefreshInterval = setInterval(() => {
        console.log('[GameState] Realizando actualización periódica');
        fetchGameStateData();
      }, 15000);
      
      return () => {
        // Clean up game checker
        cleanupGameChecker();
        
        // Clean up auto-advance timer
        autoAdvanceTimer.cleanup();
        
        // Clean up reconnection timer
        reconnection.cleanup();
        
        // Clean up periodic refresh
        clearInterval(periodicRefreshInterval);
      };
    }
  }, [gameId, fetchGameStateData, gameChecker, autoAdvanceTimer, reconnection]);

  return {
    gameState,
    isLoading,
    error,
    isConnected,
    fetchGameStateData,
    scheduleReconnect: reconnection.scheduleReconnect,
    reconnectAttempts: reconnection.reconnectAttemptsRef.current
  };
};
