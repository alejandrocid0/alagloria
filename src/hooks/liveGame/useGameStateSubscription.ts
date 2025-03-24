
import { useState, useEffect, useCallback, useRef } from 'react';
import { LiveGameState } from '@/types/liveGame';
import { fetchGameState, subscribeToGameStateUpdates } from './gameStateUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useGameStateSubscription = (gameId: string | undefined) => {
  const [gameState, setGameState] = useState<LiveGameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  
  // References for reconnection logic
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastConnectionAttemptRef = useRef<number>(0);
  const reconnectAttemptsRef = useRef<number>(0);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Fetch game state from the server
  const fetchGameStateData = useCallback(async () => {
    if (!gameId) return;

    try {
      const state = await fetchGameState(gameId);
      
      if (state) {
        setGameState(state);
        
        // Set up auto-advancement if needed
        if (state.countdown > 0) {
          // Clear any existing timer
          if (autoAdvanceTimerRef.current) {
            clearTimeout(autoAdvanceTimerRef.current);
          }
          
          // Set up new timer for auto-advancement
          autoAdvanceTimerRef.current = setupAutoAdvance(
            gameId, 
            state.status, 
            state.countdown,
            () => {
              console.log(`State auto-advanced from ${state.status}`);
              // Additional callback logic if needed
            }
          );
        }
        
        // Update connection state to connected if we successfully fetched the state
        if (!isConnected) {
          setIsConnected(true);
          toast({
            title: "Conexión recuperada",
            description: "Te has vuelto a conectar a la partida",
            variant: "default",
          });
          reconnectAttemptsRef.current = 0;
        }
      }
    } catch (err) {
      console.error('Error fetching game state:', err);
      setError('No se pudo cargar el estado del juego');
      
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
      scheduleReconnect();
    }
  }, [gameId, isConnected]);

  // Function to handle reconnection attempts with exponential backoff
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }

    const now = Date.now();
    const timeSinceLastAttempt = now - lastConnectionAttemptRef.current;
    
    // If we've tried reconnecting recently, back off exponentially
    const baseDelay = 1000; // Start with 1 second
    const maxDelay = 30000; // Cap at 30 seconds
    const attemptsCount = reconnectAttemptsRef.current;

    // Calculate delay with exponential backoff
    const delay = Math.min(
      baseDelay * Math.pow(1.5, attemptsCount),
      maxDelay
    );
    
    // Schedule reconnection
    reconnectTimerRef.current = setTimeout(() => {
      lastConnectionAttemptRef.current = Date.now();
      reconnectAttemptsRef.current += 1;
      console.log(`Reconnection attempt ${reconnectAttemptsRef.current} after ${delay}ms`);
      
      // Attempt to fetch data and reestablish subscriptions
      fetchGameStateData();
    }, delay);
  }, [fetchGameStateData]);

  // Handle game state changes
  const handleGameStateChange = useCallback((payload: any) => {
    console.log('Game state changed:', payload);
    fetchGameStateData();
  }, [fetchGameStateData]);

  // Function to trigger automatic state advancement based on countdown
  const setupAutoAdvance = (gameId: string, status: string, countdown: number, callback?: () => void) => {
    if (!gameId || countdown <= 0) return null;
    
    console.log(`Setting up auto-advance for ${status} state in ${countdown} seconds`);
    
    // Set a timer that will advance the state when countdown reaches zero
    const timer = setTimeout(async () => {
      console.log(`Auto-advancing game ${gameId} from ${status} state after ${countdown} seconds`);
      
      // Call the callback if it exists
      if (callback) {
        callback();
      }
    }, countdown * 1000); // Convert seconds to milliseconds
    
    // Return the timer so it can be cleared if needed
    return timer;
  };

  // Set up subscriptions for real-time updates
  useEffect(() => {
    let gameStateChannel: any = null;
    
    if (gameId) {
      gameStateChannel = subscribeToGameStateUpdates(gameId, handleGameStateChange);
    }
    
    // Clean up subscriptions when unmounting
    return () => {
      if (gameStateChannel) supabase.removeChannel(gameStateChannel);
      
      // Clear any auto-advance timer
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
      
      // Clear reconnect timer
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [gameId, handleGameStateChange]);

  return {
    gameState,
    isLoading,
    error,
    isConnected,
    fetchGameStateData,
    scheduleReconnect
  };
};
