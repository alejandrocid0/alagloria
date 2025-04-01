
import { useState, useCallback } from 'react';
import { LiveGameState } from '@/types/liveGame';
import { gameStateSync } from '@/services/games/gameStateSync';

export const useGameState = (gameId: string | undefined) => {
  const [gameState, setGameState] = useState<LiveGameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const loadGameState = useCallback(async () => {
    if (!gameId) return;
    
    try {
      setIsLoading(true);
      
      // Obtener el estado actual del juego
      const gameStateData = await gameStateSync.getGameState(gameId);
      
      if (gameStateData) {
        // Asegurarse de que el status sea un valor válido antes de asignarlo
        const validStatus = gameStateData.status as "waiting" | "question" | "result" | "leaderboard" | "finished";
        
        setGameState({
          id: gameStateData.id,
          status: validStatus,
          current_question: gameStateData.current_question,
          countdown: gameStateData.countdown,
          started_at: gameStateData.started_at,
          updated_at: gameStateData.updated_at
        });
      }
      
      setError(null);
    } catch (err) {
      console.error('Error al cargar el estado del juego:', err);
      setError('No se pudo cargar el estado del juego');
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);
  
  return {
    gameState,
    isLoading,
    error,
    loadGameState
  };
};
