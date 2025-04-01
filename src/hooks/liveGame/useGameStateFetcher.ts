
import { useState, useCallback } from 'react';
import { LiveGameState } from '@/types/liveGame';
import { fetchGameState } from './gameStateUtils';
import { gameNotifications } from '@/components/ui/notification-toast';

export const useGameStateFetcher = (gameId: string | undefined) => {
  const [gameState, setGameState] = useState<LiveGameState | null>(null);
  const [prevGameState, setPrevGameState] = useState<LiveGameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  
  // Fetch game state from the server
  const fetchGameStateData = useCallback(async (forceFetch: boolean = false) => {
    if (!gameId) return null;

    // Throttle requests - don't allow more than one fetch every 2 seconds
    // Unless forceFetch is true
    const now = Date.now();
    if (!forceFetch && now - lastFetchTime < 2000) {
      console.log(`[GameState] Throttling fetch request (${Math.floor((now - lastFetchTime)/1000)}s since last fetch)`);
      return null;
    }
    
    setLastFetchTime(now);

    try {
      setIsLoading(true);
      setError(null);
      
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
          
          // Check if we need to notify about state change
          if (gameState && gameState.status !== state.status) {
            notifyStateChange(gameState.status, state.status);
          }
        } else {
          console.log(`[GameState] El estado no ha cambiado significativamente, omitiendo actualización`);
        }
        
        return state;
      } else {
        console.log(`[GameState] No se encontró estado para el juego ${gameId}`);
        return null;
      }
    } catch (err) {
      console.error('[GameState] Error fetching game state:', err);
      setError('No se pudo cargar el estado del juego');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [gameId, lastFetchTime, gameState]);

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
      // We'll handle the finished state in the main component with rank info
    }
  };

  return {
    gameState,
    prevGameState,
    isLoading,
    error,
    fetchGameStateData,
    setGameState,
    setPrevGameState
  };
};
