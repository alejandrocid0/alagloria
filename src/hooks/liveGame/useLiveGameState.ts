
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGameStateSubscription } from './useGameStateSubscription';
import { useNetworkStatus } from './useNetworkStatus';
import { usePlayerAnswers } from './usePlayerAnswers';
import { useLeaderboardData } from './useLeaderboardData';
import { useGameQuestions } from './useGameQuestions';
import { useGameInitialization } from './useGameInitialization';
import { useTimeSync } from './useTimeSync';
import { supabase } from '@/integrations/supabase/client';

export const useLiveGameState = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [isLoading, setIsLoading] = useState(true);

  // Get time synchronization with server
  const { 
    clientTimeOffset, 
    syncWithServer, 
    getAdjustedTime 
  } = useTimeSync();

  // Get game state and connection status
  const {
    gameState,
    error,
    isConnected,
    fetchGameStateData,
    scheduleReconnect
  } = useGameStateSubscription(gameId);

  // Monitor network status
  const { 
    networkStatus, 
    reconnectAttempts, 
    checkNetworkStatus 
  } = useNetworkStatus(isConnected, fetchGameStateData, scheduleReconnect, gameId);

  // Get leaderboard data
  const { leaderboard, setLeaderboard } = useLeaderboardData(gameId);

  // Get player answer submission functionality
  const { lastAnswerResult, submitAnswer } = usePlayerAnswers(
    gameId,
    gameState,
    setLeaderboard,
    isConnected,
    scheduleReconnect
  );

  // Get questions data
  const { questions, currentQuestion } = useGameQuestions(gameId, gameState);

  // Create a proper Promise-returning function for leaderboard data fetching
  const fetchLeaderboardDataWrapper = async (): Promise<void> => {
    if (leaderboard.length > 0) {
      return Promise.resolve();
    } else {
      return Promise.resolve(setLeaderboard([]));
    }
  };

  // Initialize game data
  useGameInitialization({
    gameId,
    fetchGameStateData,
    fetchLeaderboardData: fetchLeaderboardDataWrapper,
    isLoading,
    setIsLoading,
    scheduleReconnect
  });

  return {
    gameState,
    questions,
    currentQuestion,
    leaderboard,
    submitAnswer,
    lastAnswerResult,
    isLoading,
    error,
    isConnected,
    reconnectAttempts,
    networkStatus,
    clientTimeOffset,
    syncWithServer,
    getAdjustedTime
  };
};

export default useLiveGameState;

// Re-export to maintain compatibility with the original module
export * from './gameStateUtils';
export * from './leaderboardUtils';
export * from './playerUtils';
export * from './questionsUtils';
