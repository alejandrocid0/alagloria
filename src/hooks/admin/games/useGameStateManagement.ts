
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { LiveGameState } from '@/types/liveGame';
import { advanceGameState, startGame } from '@/hooks/liveGame/gameStateUtils';

export const useGameStateManagement = (gameId: string | undefined) => {
  const [gameState, setGameState] = useState<LiveGameState | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const handleStartGame = useCallback(async () => {
    if (!gameId) return;
    
    try {
      await startGame(gameId);
      toast({
        title: "Partida iniciada",
        description: "La partida se ha iniciado correctamente.",
      });
    } catch (err) {
      console.error('Error starting game:', err);
      toast({
        title: "Error al iniciar la partida",
        description: err instanceof Error ? err.message : "Error desconocido",
        variant: "destructive",
      });
    }
  }, [gameId]);

  const handleAdvanceState = useCallback(async () => {
    if (!gameId) return;
    
    try {
      await advanceGameState(gameId);
      toast({
        title: "Estado avanzado",
        description: "El estado de la partida se ha avanzado correctamente.",
      });
    } catch (err) {
      console.error('Error advancing game state:', err);
      toast({
        title: "Error al avanzar el estado",
        description: err instanceof Error ? err.message : "Error desconocido",
        variant: "destructive",
      });
    }
  }, [gameId]);

  const handleForceState = useCallback(async (state: "waiting" | "question" | "result" | "leaderboard" | "finished") => {
    if (!gameId) return;
    
    try {
      await advanceGameState(gameId, state);
      toast({
        title: "Estado forzado",
        description: `La partida se ha movido al estado "${state}".`,
      });
    } catch (err) {
      console.error('Error forcing game state:', err);
      toast({
        title: "Error al forzar el estado",
        description: err instanceof Error ? err.message : "Error desconocido",
        variant: "destructive",
      });
    }
  }, [gameId]);

  return {
    gameState,
    setGameState,
    lastUpdate,
    setLastUpdate,
    handleStartGame,
    handleAdvanceState,
    handleForceState
  };
};
