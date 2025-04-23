
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGameAnswers } from './useGameAnswers';
import { useGameData } from './useGameData';
import { useGameSubscriptions } from './useGameSubscriptions';

export const useLiveGameState = (gameId?: string) => {
  const { user } = useAuth();
  
  const {
    lastAnswerResult,
    selectedOption,
    setSelectedOption,
    lastPoints,
    myPoints,
    submitAnswer
  } = useGameAnswers(gameId, user?.id);

  const {
    gameState,
    questions,
    currentQuestion,
    leaderboard,
    myRank,
    isLoading,
    error,
    refreshGameState
  } = useGameData(gameId, user?.id);

  const {
    isConnected,
    reconnectAttempts,
    handleConnectionLost
  } = useGameSubscriptions(
    gameId,
    refreshGameState,
    refreshGameState
  );

  // Reset selected option when question changes
  useEffect(() => {
    if (gameState?.status === 'question') {
      setSelectedOption(null);
    }
  }, [gameState?.current_question]);

  // Initial load
  useEffect(() => {
    refreshGameState();
  }, [refreshGameState]);

  return {
    gameState,
    questions,
    leaderboard,
    currentQuestion,
    selectedOption,
    setSelectedOption,
    submitAnswer,
    lastAnswerResult,
    isLoading,
    error,
    isConnected,
    reconnectAttempts,
    refreshGameState,
    myRank,
    myPoints,
    lastPoints
  };
};
