
import { useCallback } from 'react';
import { checkScheduledGames, runGameStateManager } from '@/hooks/liveGame/gameStateUtils';

export const useGameChecker = (gameId?: string) => {
  // Función para verificar el estado actual del juego
  const checkGameState = useCallback(async () => {
    try {
      // Intentar avanzar el estado del juego si es necesario
      const stateManagerResult = await runGameStateManager();
      console.log(`[GameChecker] Estado del gestor de juego: ${stateManagerResult ? 'ejecutado' : 'fallido'}`);
      
      return stateManagerResult;
    } catch (error) {
      console.error('[GameChecker] Error al verificar estado del juego:', error);
      return false;
    }
  }, []);
  
  // Función para inicializar el verificador de juegos programados
  const initializeGameChecker = useCallback(() => {
    console.log('[GameChecker] Inicializando verificador de estado de juego...');
    
    // Verificar de inmediato al iniciar
    checkScheduledGames()
      .then(result => console.log('[GameChecker] Verificación inicial de juegos programados:', result))
      .catch(err => console.error('[GameChecker] Error en verificación inicial:', err));
    
    checkGameState()
      .then(result => console.log('[GameChecker] Verificación inicial de estado:', result))
      .catch(err => console.error('[GameChecker] Error en verificación inicial de estado:', err));
    
    // Configurar verificación periódica (cada 30 segundos)
    const intervalId = setInterval(async () => {
      console.log('[GameChecker] Ejecutando verificación periódica...');
      try {
        await checkScheduledGames();
        await checkGameState();
      } catch (error) {
        console.error('[GameChecker] Error en verificación periódica:', error);
      }
    }, 30000);
    
    // Devolver función para limpiar el intervalo
    return () => {
      clearInterval(intervalId);
      console.log('[GameChecker] Verificador de juegos detenido');
    };
  }, [checkGameState]);
  
  return {
    checkGameState,
    initializeGameChecker
  };
};
