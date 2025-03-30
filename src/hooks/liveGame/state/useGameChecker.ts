
import { useCallback } from 'react';
import { 
  checkScheduledGames, 
  runGameStateManager, 
  advanceGameState 
} from '@/hooks/liveGame/gameStateUtils';
import { toast } from '@/hooks/use-toast';

/**
 * Hook para verificar y gestionar el estado de un juego
 */
export const useGameChecker = (gameId: string | undefined) => {
  // Función para verificar el estado del juego
  const checkGameState = useCallback(async () => {
    if (!gameId) return false;
    
    try {
      // Primero ejecutar el gestor de estado global
      const managerResult = await runGameStateManager();
      
      if (managerResult) {
        console.log('El gestor de estado ha ejecutado correctamente');
        return true;
      }
      
      // Si falla, intentar avanzar específicamente este juego
      const advanceResult = await advanceGameState(gameId);
      
      if (advanceResult) {
        console.log(`El juego ${gameId} ha avanzado correctamente`);
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error al verificar el estado del juego:', err);
      return false;
    }
  }, [gameId]);
  
  // Función para inicializar el verificador automático
  const initializeGameChecker = useCallback(() => {
    if (!gameId) return () => {};
    
    console.log(`Inicializando verificador de estado para el juego ${gameId}`);
    
    // Comprobar juegos programados inmediatamente
    checkScheduledGames()
      .then(result => {
        if (result) {
          console.log('Verificación de juegos programados completada');
        }
      })
      .catch(err => {
        console.error('Error al verificar juegos programados:', err);
      });
    
    // Comprobar el estado del juego actual
    checkGameState()
      .then(result => {
        if (result) {
          console.log(`Verificación inicial del juego ${gameId} completada`);
        }
      })
      .catch(err => {
        console.error(`Error en verificación inicial del juego ${gameId}:`, err);
      });
    
    // Establecer verificación periódica
    const intervalId = setInterval(() => {
      runGameStateManager()
        .catch(err => {
          console.error('Error en la verificación periódica del gestor de estado:', err);
        });
    }, 60000); // Cada minuto
    
    return () => {
      clearInterval(intervalId);
      console.log(`Limpieza del verificador de estado para el juego ${gameId}`);
    };
  }, [gameId, checkGameState]);
  
  // Función para forzar el inicio de un juego (solo para administradores)
  const forceStartGame = useCallback(async () => {
    if (!gameId) return false;
    
    try {
      const result = await advanceGameState(gameId, 'waiting');
      
      if (result) {
        toast({
          title: "Partida iniciada",
          description: "La partida ha sido iniciada manualmente",
          variant: "default",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: "No se pudo iniciar la partida",
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      console.error('Error al forzar el inicio del juego:', err);
      toast({
        title: "Error",
        description: "Error al iniciar la partida",
        variant: "destructive",
      });
      return false;
    }
  }, [gameId]);
  
  return {
    checkGameState,
    initializeGameChecker,
    forceStartGame
  };
};
