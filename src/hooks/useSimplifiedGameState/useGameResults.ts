
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { gameStateSync } from '@/services/games/gameStateSync';
import { GameStats } from './types';

export const useGameResults = (gameId: string | undefined) => {
  const { user } = useAuth();
  
  const saveGameResults = useCallback((stats: GameStats) => {
    if (!gameId || !user) return Promise.resolve(false);
    return gameStateSync.saveGameResults(gameId, user.id, stats);
  }, [gameId, user]);
  
  return { saveGameResults };
};
