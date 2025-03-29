
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
  
  // Obtenemos la función para sincronizar tiempo
  const { syncWithServer } = useTimeSync();
  
  // Fetch game state from the server
  const fetchGameStateData = useCallback(async () => {
    if (!gameId) return;

    try {
      // Sincronizar con el servidor antes de obtener el estado
      await syncWithServer();
      
      const state = await fetchGameState(gameId);
      
      if (state) {
        console.log(`Estado del juego ${gameId} obtenido:`, state);
        setGameState(state);
        setIsLoading(false);
        
        // Update stale data checker
        updateLastStateTimestamp();
        
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
        
        // Configurar un timer para auto-avanzar basado en el countdown
        autoAdvanceTimer.setupAutoAdvanceTimer(state);
      } else {
        console.log(`No se encontró estado para el juego ${gameId}`);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error fetching game state:', err);
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
  }, [gameId, isConnected, syncWithServer]);

  // Initialize reconnection handler
  const reconnection = useReconnection(isConnected, fetchGameStateData);
  
  // Initialize auto-advance timer
  const autoAdvanceTimer = useAutoAdvanceTimer(fetchGameStateData);

  // Initialize stale data checker
  const { updateLastStateTimestamp } = useStaleDataCheck(isConnected, gameState, fetchGameStateData);

  // Initialize game checker
  const gameChecker = useGameChecker(gameId);

  // Handle game state changes from subscription
  const handleGameStateChange = useCallback(() => {
    // Update timestamp and fetch new state
    updateLastStateTimestamp();
    
    // Sync with server before fetching new state
    syncWithServer().then(() => {
      fetchGameStateData();
    });
  }, [fetchGameStateData, syncWithServer]);

  // Set up subscription to game state changes
  useGameSubscription(gameId, handleGameStateChange);

  // Set up initial data loading and clean up on unmount
  useEffect(() => {
    if (gameId) {
      // Fetch initial state
      fetchGameStateData();
      
      // Initialize game checker
      const cleanupGameChecker = gameChecker.initializeGameChecker();
      
      return () => {
        // Clean up game checker
        cleanupGameChecker();
        
        // Clean up auto-advance timer
        autoAdvanceTimer.cleanup();
        
        // Clean up reconnection timer
        reconnection.cleanup();
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
