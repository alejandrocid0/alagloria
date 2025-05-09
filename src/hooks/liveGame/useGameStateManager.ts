
import { useState, useCallback, useEffect } from 'react';
import { gameStateSync } from '@/services/games/gameStateSync';
import { LiveGameState } from '@/types/liveGame';
import { toast } from '@/components/ui/use-toast';
import { gameNotifications } from '@/components/ui/notification-toast';
import { supabase } from '@/integrations/supabase/client';

interface UseGameStateManagerProps {
  gameId?: string;
  onStateChange?: (newState: LiveGameState) => void;
  onGameStart?: () => void;
  refreshInterval?: number;
}

export const useGameStateManager = ({
  gameId,
  onStateChange,
  onGameStart,
  refreshInterval = 15000
}: UseGameStateManagerProps) => {
  const [gameState, setGameState] = useState<LiveGameState | null>(null);
  const [previousStatus, setPreviousStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Función principal para obtener el estado del juego
  const fetchGameState = useCallback(async (force: boolean = false) => {
    if (!gameId) return null;
    
    // Evitar múltiples peticiones simultáneas
    if (isRefreshing && !force) return null;
    
    // Implementar throttling para evitar demasiadas peticiones
    const now = Date.now();
    if (!force && now - lastCheckTime < 2000) {
      console.log('[GameStateManager] Evitando petición muy frecuente');
      return null;
    }
    
    try {
      setIsRefreshing(true);
      setLastCheckTime(now);
      
      console.log(`[GameStateManager] Obteniendo estado para partida ${gameId}`);
      const newState = await gameStateSync.getGameState(gameId);
      
      if (newState) {
        // Almacenar el estado anterior para detectar cambios
        const oldStatus = gameState?.status || null;
        setPreviousStatus(oldStatus);
        
        // Actualizar estado y notificar cambios
        setGameState(newState);
        setError(null);
        
        // Notificar al componente padre si hay cambio de estado
        if (onStateChange && (oldStatus !== newState.status || !gameState)) {
          onStateChange(newState);
        }
        
        // Detectar inicio de juego
        if (oldStatus === 'waiting' && newState.status === 'question' && onGameStart) {
          console.log('[GameStateManager] Juego iniciado, notificando al componente padre');
          onGameStart();
        }
        
        // Notificar cambios importantes de estado
        if (oldStatus !== newState.status) {
          notifyStateChange(oldStatus, newState.status);
        }
        
        return newState;
      } else {
        console.log(`[GameStateManager] No se encontró información para la partida ${gameId}`);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('[GameStateManager] Error obteniendo estado:', errorMessage);
      setError(`Error al obtener estado del juego: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [gameId, gameState, lastCheckTime, isRefreshing, onStateChange, onGameStart]);

  // Función para notificar cambios de estado
  const notifyStateChange = (oldStatus: string | null, newStatus: string) => {
    if (!oldStatus) return; // No notificar en carga inicial
    
    switch (newStatus) {
      case 'question':
        gameNotifications.newQuestion();
        break;
      case 'result':
        gameNotifications.showingResults();
        break;
      case 'leaderboard':
        gameNotifications.showingLeaderboard();
        break;
      case 'finished':
        gameNotifications.gameCompleted(0); // El rank se actualizará en otro lugar
        break;
    }
  };

  // Función para verificar específicamente si un juego debería estar en curso
  const checkGameStartCondition = useCallback(async () => {
    if (!gameId) return false;
    
    try {
      console.log('[GameStateManager] Verificando condiciones de inicio automático');
      
      // Obtener configuración del juego
      const { data: gameConfig, error: configError } = await supabase
        .from('games')
        .select('auto_start, date')
        .eq('id', gameId)
        .single();
      
      if (configError) {
        console.error('[GameStateManager] Error al obtener la configuración del juego:', configError);
        return false;
      }
      
      // Verificar si debería haberse iniciado automáticamente
      if (gameConfig) {
        const isAutoStart = gameConfig.auto_start === true;
        const scheduledTime = gameConfig.date ? new Date(gameConfig.date) : null;
        const currentTime = new Date();
        const shouldHaveStarted = scheduledTime && currentTime >= scheduledTime;
        
        console.log(`[GameStateManager] Condiciones: auto_start=${isAutoStart}, programado=${scheduledTime?.toISOString()}, pasado=${shouldHaveStarted}`);
        
        if (shouldHaveStarted && isAutoStart && gameState?.status === 'waiting') {
          console.warn('[GameStateManager] Se detectó inconsistencia: el juego debería haber iniciado automáticamente');
          
          // Forzar verificación del estado actual
          return true;
        }
      }
      
      return false;
    } catch (err) {
      console.error('[GameStateManager] Error al verificar condiciones de inicio:', err);
      return false;
    }
  }, [gameId, gameState]);

  // Iniciar verificación de estado al montar el componente
  useEffect(() => {
    if (gameId) {
      console.log(`[GameStateManager] Inicializando para juego ${gameId}`);
      fetchGameState(true);
    }
  }, [gameId, fetchGameState]);

  // Configurar escucha de cambios en el estado de la partida
  useEffect(() => {
    if (!gameId) return;
    
    // Suscripción a cambios en la tabla live_games
    const subscription = gameStateSync.subscribeToGameChanges(gameId, () => {
      console.log('[GameStateManager] Cambio detectado en el estado del juego');
      // Pequeño retraso para permitir que la DB se actualice completamente
      setTimeout(() => fetchGameState(true), 300);
    });
    
    // Actualización periódica como respaldo
    const intervalId = setInterval(() => {
      console.log('[GameStateManager] Verificación periódica de estado');
      fetchGameState();
      
      // Verificar inconsistencias de estado
      checkGameStartCondition().then(shouldRefresh => {
        if (shouldRefresh) {
          console.log('[GameStateManager] Forzando actualización por inconsistencia');
          fetchGameState(true);
        }
      });
    }, refreshInterval);
    
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      clearInterval(intervalId);
    };
  }, [gameId, fetchGameState, refreshInterval, checkGameStartCondition]);

  // Función para forzar inicio manual de partida (para anfitriones)
  const startGame = useCallback(async () => {
    if (!gameId) return false;
    
    try {
      console.log('[GameStateManager] Iniciando partida manualmente');
      const success = await gameStateSync.startGame(gameId);
      
      if (success) {
        gameNotifications.gameStarting();
        // Actualizar estado inmediatamente
        fetchGameState(true);
        return true;
      } else {
        toast({
          title: "Error",
          description: "No se pudo iniciar la partida",
          variant: "destructive"
        });
        return false;
      }
    } catch (err) {
      console.error('[GameStateManager] Error al iniciar partida:', err);
      toast({
        title: "Error",
        description: "Error al iniciar la partida",
        variant: "destructive"
      });
      return false;
    }
  }, [gameId, fetchGameState]);

  return {
    gameState,
    isLoading,
    error,
    refreshGameState: () => fetchGameState(true),
    startGame,
    checkGameStartCondition
  };
};
