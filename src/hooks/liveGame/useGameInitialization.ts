
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
  
  // Cargar los datos iniciales con una secuencia optimizada
  useEffect(() => {
    if (!gameId) {
      console.warn('[GameInitialization] No gameId provided, skipping initial data load');
      return;
    }
    
    if (isInitialLoadCompletedRef.current) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    // Definir una secuencia asíncrona ordenada para cargar los datos iniciales
    const loadInitialData = async () => {
      try {
        console.log(`[GameInitialization] Starting initial data load for game: ${gameId}`);
        
        // Cargar información básica del juego primero
        await fetchGameInfo(gameId);
        
        // Luego cargar el estado actual del juego
        const gameStateResult = await fetchGameStateData(true);
        
        // Cargar la tabla de clasificación
        await fetchLeaderboardData();
        
        console.log('[GameInitialization] Initial data load completed successfully');
        isInitialLoadCompletedRef.current = true;
      } catch (err) {
        console.error('[GameInitialization] Error during initial data load:', err);
        setError('Error al cargar los datos iniciales');
        
        // Programar un reintento
        setTimeout(() => {
          isInitialLoadCompletedRef.current = false; // Permitir reintento
          scheduleReconnect();
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
    
    // Establecer una actualización periódica
    const periodicUpdate = setInterval(() => {
      if (isConnected) {
        console.log('[GameInitialization] Performing periodic data refresh');
        fetchGameStateData(false);
      }
    }, 15000); // Cada 15 segundos
    
    return () => {
      clearInterval(periodicUpdate);
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
