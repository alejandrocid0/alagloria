
import { useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { subscribeToGameStateUpdates } from '../gameStateUtils';

/**
 * Hook to handle game state subscription
 */
export const useGameSubscription = (
  gameId: string | undefined,
  onGameStateChange: (payload: any) => void
) => {
  // Handle game state changes
  const handleGameStateChange = useCallback((payload: any) => {
    console.log('Cambio en el estado del juego detectado:', payload);
    
    // Call the provided callback
    onGameStateChange(payload);
  }, [onGameStateChange]);

  // Set up subscriptions for real-time updates
  useEffect(() => {
    let gameStateChannel: any = null;
    
    if (gameId) {
      console.log(`Suscribiendo a actualizaciones para el juego ${gameId}`);
      gameStateChannel = subscribeToGameStateUpdates(gameId, handleGameStateChange);
      
      return () => {
        console.log(`Cancelando suscripción para el juego ${gameId}`);
        if (gameStateChannel) supabase.removeChannel(gameStateChannel);
      };
    }
    
    return () => {
      if (gameStateChannel) supabase.removeChannel(gameStateChannel);
    };
  }, [gameId, handleGameStateChange]);
};
