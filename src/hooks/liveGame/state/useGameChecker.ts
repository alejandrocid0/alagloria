
import { useCallback, useRef } from 'react';
import { runGameStateManager, checkScheduledGames } from '../gameStateUtils';

/**
 * Hook to periodically check game state and scheduled games
 */
export const useGameChecker = (gameId: string | undefined) => {
  const gameCheckerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize periodic check for game state
  const initializeGameChecker = useCallback(() => {
    if (gameCheckerIntervalRef.current) {
      clearInterval(gameCheckerIntervalRef.current);
    }
    
    console.log('Inicializando verificador periódico de estado de juego...');
    
    // Check immediately
    runGameStateManager()
      .then(result => console.log('Resultado de verificación inicial:', result))
      .catch(err => console.error('Error en verificación inicial:', err));
    
    checkScheduledGames()
      .then(result => console.log('Resultado de verificación de partidas programadas:', result))
      .catch(err => console.error('Error en verificación de partidas programadas:', err));
    
    // Set up periodic check (every 30 seconds)
    gameCheckerIntervalRef.current = setInterval(() => {
      console.log('Ejecutando verificación periódica de estado de juego...');
      
      // Solo ejecutar si hay un gameId
      if (gameId) {
        runGameStateManager().catch(err => console.error('Error en verificación periódica:', err));
        checkScheduledGames().catch(err => console.error('Error en verificación periódica de partidas programadas:', err));
      }
    }, 30000); // 30 seconds
    
    return () => {
      if (gameCheckerIntervalRef.current) {
        clearInterval(gameCheckerIntervalRef.current);
        gameCheckerIntervalRef.current = null;
      }
    };
  }, [gameId]);

  return {
    initializeGameChecker
  };
};
