
import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { subscribeToGameStateUpdates } from '../gameStateUtils';

/**
 * Hook to handle game state subscription
 */
export const useGameSubscription = (
  gameId: string | undefined,
  onGameStateChange: (payload: any) => void
) => {
  // Reference to track the channel for proper cleanup
  const gameStateChannelRef = useRef<any>(null);
  
  // Handle game state changes
  const handleGameStateChange = useCallback((payload: any) => {
    console.log('[GameSubscription] Cambio en el estado del juego detectado:', payload);
    
    // Call the provided callback with the payload
    onGameStateChange(payload);
  }, [onGameStateChange]);

  // Set up subscriptions for real-time updates
  useEffect(() => {
    if (!gameId) return;
    
    console.log(`[GameSubscription] Suscribiendo a actualizaciones para el juego ${gameId}`);
    
    // Create subscription
    const gameStateChannel = subscribeToGameStateUpdates(gameId, handleGameStateChange);
    
    // Store the channel reference for cleanup
    gameStateChannelRef.current = gameStateChannel;
    
    // Check if subscription was successful
    if (gameStateChannel) {
      console.log(`[GameSubscription] Suscripción creada con éxito`);
    } else {
      console.error(`[GameSubscription] Error al crear la suscripción`);
    }
    
    // Cleanup function
    return () => {
      console.log(`[GameSubscription] Cancelando suscripción para el juego ${gameId}`);
      if (gameStateChannelRef.current) {
        supabase.removeChannel(gameStateChannelRef.current);
        console.log('[GameSubscription] Suscripción cancelada');
        gameStateChannelRef.current = null;
      }
    };
  }, [gameId, handleGameStateChange]);
};
