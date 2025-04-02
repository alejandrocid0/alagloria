
import { useState, useCallback, useEffect, useRef } from 'react';
import { LiveGameState } from '@/types/liveGame';
import { fetchGameState, subscribeToGameStateUpdates } from './gameStateUtils';
import { gameNotifications } from '@/components/ui/notification-toast';
import { supabase } from '@/integrations/supabase/client';

export const useGameStateSubscription = (gameId: string | undefined) => {
  const [gameState, setGameState] = useState<LiveGameState | null>(null);
  const [prevGameState, setPrevGameState] = useState<LiveGameState | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  
  // Refs para control de estados
  const lastUpdateTimestampRef = useRef<number>(0);
  const processingUpdateRef = useRef<boolean>(false);
  const notificationShownRef = useRef<boolean>(false);
  
  // Fetch game state from the server with throttling
  const fetchGameStateData = useCallback(async (forceFetch: boolean = false) => {
    if (!gameId) return null;
    
    if (processingUpdateRef.current && !forceFetch) {
      console.log('[GameStateSubscription] Already processing an update, skipping');
      return null;
    }
    
    // Throttle requests - don't allow more than one fetch every 2 seconds
    // Unless forceFetch is true
    const now = Date.now();
    if (!forceFetch && now - lastFetchTime < 2000) {
      console.log(`[GameStateSubscription] Throttling fetch request (${Math.floor((now - lastFetchTime)/1000)}s since last fetch)`);
      return null;
    }
    
    processingUpdateRef.current = true;
    setLastFetchTime(now);

    try {
      console.log(`[GameStateSubscription] Fetching game state for game: ${gameId}`);
      
      const state = await fetchGameState(gameId);
      
      if (state) {
        console.log(`[GameStateSubscription] Game state fetched successfully, status: ${state.status}, current question: ${state.current_question}`);
        
        // Save previous state before updating
        if (gameState) {
          setPrevGameState(gameState);
        }
        
        // Only update state if it's actually different
        if (!gameState || 
            gameState.status !== state.status || 
            gameState.current_question !== state.current_question ||
            gameState.countdown !== state.countdown ||
            new Date(state.updated_at) > new Date(gameState.updated_at)) {
          
          setGameState(state);
          
          // Notificar cambios de estado importantes
          if (gameState && gameState.status !== state.status) {
            notifyStateChange(gameState.status, state.status);
          }
        }
        
        return state;
      } else {
        console.log(`[GameStateSubscription] No game state data returned for ${gameId}`);
        return null;
      }
    } catch (err) {
      console.error('[GameStateSubscription] Error fetching game state:', err);
      throw err;
    } finally {
      processingUpdateRef.current = false;
    }
  }, [gameId, lastFetchTime, gameState]);
  
  // Notify about game state changes
  const notifyStateChange = useCallback((prevStatus: string, newStatus: string) => {
    // Evitar notificaciones repetidas
    if (notificationShownRef.current) return;
    
    notificationShownRef.current = true;
    setTimeout(() => { notificationShownRef.current = false; }, 5000);
    
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
        gameNotifications.gameCompleted(0); // El rango se actualizará en el componente
        break;
    }
  }, []);
  
  // Function to schedule reconnect attempts
  const scheduleReconnect = useCallback(() => {
    console.log('[GameStateSubscription] Scheduling reconnect');
    setTimeout(() => {
      fetchGameStateData(true);
    }, 3000);
  }, [fetchGameStateData]);
  
  // Handle game state changes from subscription
  const handleGameStateChange = useCallback((payload: any) => {
    console.log('[GameStateSubscription] Game state change detected:', payload);
    
    // Evitar procesamiento de eventos demasiado cercanos en el tiempo (throttling)
    const now = Date.now();
    if (now - lastUpdateTimestampRef.current < 1000) {
      console.log('[GameStateSubscription] Ignoring change due to throttling');
      return;
    }
    
    lastUpdateTimestampRef.current = now;
    
    // Check if this is a new state by comparing timestamps
    if (gameState && payload.new && new Date(payload.new.updated_at) <= new Date(gameState.updated_at)) {
      console.log('[GameStateSubscription] Received state is older or equal to current, ignoring');
      return;
    }
    
    // Add small delay to allow database to settle
    setTimeout(() => {
      fetchGameStateData(true);
    }, 300);
  }, [fetchGameStateData, gameState]);
  
  // Set up subscription to game state changes
  useEffect(() => {
    if (!gameId) return;
    
    // Initial fetch
    fetchGameStateData(true);
    
    // Subscribe to changes
    const subscription = subscribeToGameStateUpdates(gameId, handleGameStateChange);
    console.log(`[GameStateSubscription] Set up subscription for game state updates: ${gameId}`);
    
    // Set up a periodic refresh to make sure we stay in sync
    const periodicRefreshInterval = setInterval(() => {
      console.log('[GameStateSubscription] Performing periodic refresh');
      fetchGameStateData(false);
    }, 15000);
    
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      clearInterval(periodicRefreshInterval);
      console.log('[GameStateSubscription] Cleaned up subscription and interval');
    };
  }, [gameId, fetchGameStateData, handleGameStateChange]);

  return {
    gameState,
    prevGameState,
    fetchGameStateData,
    scheduleReconnect
  };
};

export default useGameStateSubscription;
