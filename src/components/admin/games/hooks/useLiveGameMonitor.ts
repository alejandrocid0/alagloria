
import { useState, useEffect } from 'react';
import { realTimeSync } from '@/services/games/realTimeSync';
import { useGameStateManagement } from '@/hooks/admin/games/useGameStateManagement';
import { useGameStats } from '@/hooks/admin/games/useGameStats';
import { useAdminCheck } from '@/hooks/admin/games/useAdminCheck';
import { fetchGameState } from '@/hooks/liveGame/gameStateUtils';

export const useLiveGameMonitor = (gameId: string | undefined) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    gameState,
    setGameState,
    lastUpdate,
    setLastUpdate,
    handleStartGame,
    handleAdvanceState,
    handleForceState
  } = useGameStateManagement(gameId);

  const {
    playersCount,
    setPlayersCount,
    answersCount,
    setAnswersCount,
    loadPlayersCount,
    loadAnswersCount
  } = useGameStats(gameId);

  const { isAdminLoaded, checkAdmin } = useAdminCheck();

  // Initial data load
  const loadGameState = async () => {
    if (!gameId) return;
    
    try {
      setLoading(true);
      const state = await fetchGameState(gameId);
      
      if (state) {
        setGameState(state);
        setLastUpdate(new Date());
      } else {
        setError('No se encontró la partida');
      }
    } catch (err) {
      console.error('Error loading game state:', err);
      setError('Error al cargar el estado de la partida');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!gameId) return;

    // Initial data load
    loadGameState();
    loadPlayersCount();
    loadAnswersCount();
    checkAdmin();
    
    // Subscribe to game state changes
    const gameSubscription = realTimeSync.subscribeToGameState(gameId, () => {
      console.log('[GameMonitor] Estado del juego actualizado');
      loadGameState();
    });
    
    // Subscribe to participants changes
    const participantsSubscription = realTimeSync.subscribeToParticipants(gameId, () => {
      console.log('[GameMonitor] Lista de participantes actualizada');
      loadPlayersCount();
    });
    
    // Subscribe to answers changes
    const answersSubscription = realTimeSync.subscribeToAnswers(gameId, () => {
      console.log('[GameMonitor] Nuevas respuestas registradas');
      loadAnswersCount();
    });
    
    // Refresh interval
    const intervalId = setInterval(() => {
      loadGameState();
      loadPlayersCount();
      loadAnswersCount();
    }, 30000);
    
    return () => {
      clearInterval(intervalId);
      realTimeSync.unsubscribe(gameSubscription);
      realTimeSync.unsubscribe(participantsSubscription);
      realTimeSync.unsubscribe(answersSubscription);
    };
  }, [gameId]);

  return {
    gameState,
    loading,
    error,
    playersCount,
    answersCount,
    lastUpdate,
    isAdminLoaded,
    loadGameState,
    handleStartGame,
    handleAdvanceState,
    handleForceState
  };
};
