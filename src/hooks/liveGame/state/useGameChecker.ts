
import { useCallback, useRef, useEffect } from 'react';
import { runGameStateManager, checkScheduledGames } from '../gameStateUtils';
import { toast } from '@/hooks/use-toast';

/**
 * Hook para verificar periódicamente el estado de los juegos programados
 * y detectar cuando una partida debe comenzar
 */
export const useGameChecker = (gameId: string | undefined) => {
  const gameCheckerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastCheckTimeRef = useRef<number>(0);

  // Inicializar la verificación periódica del estado del juego
  const initializeGameChecker = useCallback(() => {
    if (gameCheckerIntervalRef.current) {
      clearInterval(gameCheckerIntervalRef.current);
    }
    
    console.log('Inicializando verificador periódico de estado de juego...');
    
    // Verificar inmediatamente
    const performInitialCheck = async () => {
      try {
        // Verificar partidas programadas
        const scheduledResult = await checkScheduledGames();
        console.log('Resultado de verificación de partidas programadas:', scheduledResult);
        
        // Verificar estado de juegos activos
        const stateResult = await runGameStateManager();
        console.log('Resultado de verificación de estados de juego:', stateResult);
        
        lastCheckTimeRef.current = Date.now();
      } catch (err) {
        console.error('Error en verificación inicial:', err);
      }
    };
    
    performInitialCheck();
    
    // Configurar verificación periódica (cada 20 segundos)
    gameCheckerIntervalRef.current = setInterval(async () => {
      console.log('Ejecutando verificación periódica de estado de juego...');
      
      try {
        // Limitar la frecuencia de verificación
        const now = Date.now();
        if (now - lastCheckTimeRef.current < 10000) { // No verificar más de una vez cada 10 segundos
          console.log('Omitiendo verificación, demasiado pronto desde la última');
          return;
        }
        
        // Solo ejecutar si hay un gameId o si estamos en la página principal (para detectar nuevos juegos)
        const scheduledResult = await checkScheduledGames();
        console.log('Resultado de verificación periódica de partidas programadas:', scheduledResult);
        
        if (gameId) {
          const stateResult = await runGameStateManager();
          console.log('Resultado de verificación periódica de estados de juego:', stateResult);
        }
        
        lastCheckTimeRef.current = now;
      } catch (err) {
        console.error('Error en verificación periódica:', err);
      }
    }, 20000); // 20 segundos
    
    return () => {
      if (gameCheckerIntervalRef.current) {
        clearInterval(gameCheckerIntervalRef.current);
        gameCheckerIntervalRef.current = null;
      }
    };
  }, [gameId]);

  // Limpiar el intervalo cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (gameCheckerIntervalRef.current) {
        clearInterval(gameCheckerIntervalRef.current);
        gameCheckerIntervalRef.current = null;
      }
    };
  }, []);

  // Establecer un intervalo de verificación en modo de espera diferente al de juego
  const setupWaitingModeChecker = useCallback((timeUntilStart: number) => {
    // Si faltan menos de 20 segundos, verificar más frecuentemente
    if (timeUntilStart <= 20) {
      // Limpiar intervalo existente
      if (gameCheckerIntervalRef.current) {
        clearInterval(gameCheckerIntervalRef.current);
      }
      
      console.log('Configurando verificador de alta frecuencia para inicio inminente...');
      
      // Verificar cada 3 segundos cuando el inicio es inminente
      gameCheckerIntervalRef.current = setInterval(async () => {
        try {
          console.log('Verificación de alta frecuencia para inicio inminente...');
          await checkScheduledGames();
          if (gameId) {
            await runGameStateManager();
          }
          lastCheckTimeRef.current = Date.now();
        } catch (err) {
          console.error('Error en verificación de alta frecuencia:', err);
        }
      }, 3000); // Cada 3 segundos
      
      return true;
    }
    return false;
  }, [gameId]);

  return {
    initializeGameChecker,
    setupWaitingModeChecker
  };
};
