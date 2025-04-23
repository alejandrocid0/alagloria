
import { useState, useCallback } from 'react';
import { LiveGameState, Question, Player } from '@/types/liveGame';
import { fetchGameState } from './gameStateUtils';
import { fetchQuestions } from './questionsUtils';
import { fetchGameLeaderboard } from './leaderboardUtils';

export const useGameData = (gameId: string | undefined, userId: string | undefined) => {
  const [gameState, setGameState] = useState<LiveGameState | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [myRank, setMyRank] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshGameState = useCallback(async () => {
    if (!gameId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const newGameState = await fetchGameState(gameId);
      
      if (newGameState) {
        setGameState(newGameState);
        
        if (newGameState.current_question > 0) {
          const gameQuestions = await fetchQuestions(gameId);
          setQuestions(gameQuestions);
          
          const currentQ = gameQuestions.find(q => q.id === newGameState.current_question.toString());
          if (currentQ) {
            setCurrentQuestion(currentQ);
          }
        }
        
        const leaderboardData = await fetchGameLeaderboard(gameId);
        setLeaderboard(leaderboardData);
        
        if (userId) {
          const playerData = leaderboardData.find(p => p.id === userId);
          if (playerData) {
            setMyRank(playerData.rank);
          }
        }
      }
    } catch (err) {
      console.error('[GameData] Error al refrescar estado:', err);
      setError('Error al cargar los datos de la partida');
    } finally {
      setIsLoading(false);
    }
  }, [gameId, userId]);

  return {
    gameState,
    questions,
    currentQuestion,
    leaderboard,
    myRank,
    isLoading,
    error,
    refreshGameState
  };
};
