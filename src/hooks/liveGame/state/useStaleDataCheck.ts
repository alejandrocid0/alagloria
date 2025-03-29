
import { useEffect, useRef } from 'react';
import { LiveGameState } from '@/types/liveGame';

/**
 * Hook to check for stale game data and trigger refresh
 */
export const useStaleDataCheck = (
  isConnected: boolean,
  gameState: LiveGameState | null,
  fetchGameStateData: () => Promise<void>
) => {
  const lastGameStateUpdateRef = useRef<number>(Date.now());

  // Initialize last update timestamp
  useEffect(() => {
    if (gameState) {
      lastGameStateUpdateRef.current = Date.now();
    }
  }, [gameState]);
  
  // Verificar si no hay actualizaciones por un tiempo prolongado
  useEffect(() => {
    // Crear un intervalo para verificar si no hay actualizaciones recientes
    const staleCheckInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastGameStateUpdateRef.current;
      
      // Si han pasado más de 45 segundos sin actualizaciones y estamos conectados
      if (timeSinceLastUpdate > 45000 && isConnected && gameState) {
        console.log(`No hay actualizaciones desde hace ${Math.floor(timeSinceLastUpdate / 1000)}s, verificando estado del juego`);
        
        // Verificar nuevamente el estado del juego
        fetchGameStateData();
      }
    }, 15000); // Verificar cada 15 segundos
    
    return () => clearInterval(staleCheckInterval);
  }, [isConnected, gameState, fetchGameStateData]);

  return {
    updateLastStateTimestamp: () => {
      lastGameStateUpdateRef.current = Date.now();
    }
  };
};
