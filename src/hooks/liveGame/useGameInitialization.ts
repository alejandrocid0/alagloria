
import { useEffect, useRef } from 'react';

interface UseGameInitializationProps {
  gameId: string | undefined;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchGameInfo: (gameId: string) => Promise<any>;
  fetchGameStateData: (forceFetch: boolean) => Promise<any>;
  fetchLeaderboardData: () => Promise<any>;
  isConnected: boolean;
  scheduleReconnect: () => void;
}

export const useGameInitialization = ({
  gameId,
  isLoading,
  setIsLoading,
  setError,
  fetchGameInfo,
  fetchGameStateData,
  fetchLeaderboardData,
  isConnected,
  scheduleReconnect
}: UseGameInitializationProps) => {
  // Ref para controlar la carga inicial
  const isInitialLoadCompletedRef = useRef<boolean>(false);
  const retryAttemptsRef = useRef<number>(0);
  const periodicRefreshRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef<boolean>(false);
  
  // Cargar los datos iniciales con una secuencia optimizada
  useEffect(() => {
    if (!gameId) {
      console.warn('[GameInitialization] No gameId provided, skipping initial data load');
      return;
    }
    
    // Marcar el componente como montado (importante para evitar actualizaciones después de desmontar)
    isUnmountedRef.current = false;
    
    // Definir una secuencia asíncrona ordenada para cargar los datos iniciales
    const loadInitialData = async () => {
      // Si ya se completó la carga inicial, no volver a cargar
      if (isInitialLoadCompletedRef.current) {
        return;
      }

      try {
        console.log(`[GameInitialization] Starting initial data load for game: ${gameId}`);
        setIsLoading(true);
        setError(null);
        
        // Cargar información básica del juego primero
        await fetchGameInfo(gameId);
        
        // Luego cargar el estado actual del juego
        const gameStateResult = await fetchGameStateData(true);
        console.log('[GameInitialization] Game state loaded:', gameStateResult);
        
        // Cargar la tabla de clasificación
        await fetchLeaderboardData();
        
        console.log('[GameInitialization] Initial data load completed successfully');
        
        if (!isUnmountedRef.current) {
          isInitialLoadCompletedRef.current = true;
          retryAttemptsRef.current = 0;
          setIsLoading(false);
        }
      } catch (err) {
        console.error('[GameInitialization] Error during initial data load:', err);
        
        if (!isUnmountedRef.current) {
          setError('Error al cargar los datos iniciales');
          setIsLoading(false);
          
          // Incrementar contador de reintentos y programar un reintento
          retryAttemptsRef.current++;
          const retryDelay = Math.min(2000 * retryAttemptsRef.current, 10000); // Backoff exponencial con máximo de 10 segundos
          
          console.log(`[GameInitialization] Scheduling retry attempt ${retryAttemptsRef.current} in ${retryDelay}ms`);
          
          // Usar un timeout que podamos limpiar si el componente se desmonta
          const retryTimeout = setTimeout(() => {
            if (!isUnmountedRef.current) {
              console.log('[GameInitialization] Retrying data load');
              isInitialLoadCompletedRef.current = false; // Permitir reintento
              scheduleReconnect();
              loadInitialData(); // Intentar cargar de nuevo
            }
          }, retryDelay);
          
          // Limpiar el timeout si el componente se desmonta
          return () => clearTimeout(retryTimeout);
        }
      }
    };
    
    // Iniciar la carga de datos
    loadInitialData();
    
    // Establecer una actualización periódica
    // Usar una referencia para poder cancelarla correctamente
    periodicRefreshRef.current = setInterval(() => {
      if (isConnected && !isUnmountedRef.current) {
        console.log('[GameInitialization] Performing periodic data refresh');
        fetchGameStateData(false)
          .then(gameState => {
            if (gameState) {
              console.log('[GameInitialization] Periodic refresh updated game state:', gameState);
            }
          })
          .catch(error => {
            console.error('[GameInitialization] Error in periodic refresh:', error);
          });
      }
    }, 15000); // Cada 15 segundos
    
    return () => {
      // Marcar el componente como desmontado para evitar actualizaciones
      isUnmountedRef.current = true;
      
      // Limpiar el intervalo de actualización periódica
      if (periodicRefreshRef.current) {
        clearInterval(periodicRefreshRef.current);
        periodicRefreshRef.current = null;
      }
    };
  }, [
    gameId, 
    fetchGameInfo, 
    fetchGameStateData, 
    fetchLeaderboardData, 
    isConnected, 
    setIsLoading, 
    setError, 
    scheduleReconnect
  ]);
};

export default useGameInitialization;
