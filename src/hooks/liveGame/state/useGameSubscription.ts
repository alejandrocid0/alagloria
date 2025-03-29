
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
    console.log('[GameSubscription] Cambio en el estado del juego detectado:', payload);
    
    // Call the provided callback with the payload
    onGameStateChange(payload);
  }, [onGameStateChange]);

  // Set up subscriptions for real-time updates
  useEffect(() => {
    let gameStateChannel: any = null;
    
    if (gameId) {
      console.log(`[GameSubscription] Suscribiendo a actualizaciones para el juego ${gameId}`);
      
      // Create subscription
      gameStateChannel = subscribeToGameStateUpdates(gameId, handleGameStateChange);
      
      // Check if subscription was successful
      if (gameStateChannel) {
        console.log(`[GameSubscription] Suscripción creada con éxito`);
      } else {
        console.error(`[GameSubscription] Error al crear la suscripción`);
      }
      
      return () => {
        console.log(`[GameSubscription] Cancelando suscripción para el juego ${gameId}`);
        if (gameStateChannel) {
          const result = supabase.removeChannel(gameStateChannel);
          console.log('[GameSubscription] Resultado de cancelar suscripción:', result);
        }
      };
    }
    
    return () => {
      if (gameStateChannel) {
        supabase.removeChannel(gameStateChannel);
      }
    };
  }, [gameId, handleGameStateChange]);
};
