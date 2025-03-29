
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useGameStateSubscription } from './useGameStateSubscription';
import { useNetworkStatus } from './useNetworkStatus';
import { usePlayerAnswers } from './usePlayerAnswers';
import { useLeaderboardData } from './useLeaderboardData';
import { useGameQuestions } from './useGameQuestions';
import { useGameInitialization } from './useGameInitialization';
import { useTimeSync } from './useTimeSync';
import { AnswerResult } from '@/types/liveGame';
import { useGameStateMonitor } from './state/useGameStateMonitor';
import { useEnhancedAnswerSubmission } from './state/useEnhancedAnswerSubmission';
import { useLeaderboardFetcher } from './state/useLeaderboardFetcher';

export const useLiveGameState = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<number>(Date.now());

  // Get time synchronization with server
  const { 
    clientTimeOffset, 
    syncWithServer, 
    getAdjustedTime,
    syncAttempts
  } = useTimeSync();

  // Get game state and connection status
  const {
    gameState,
    error,
    isConnected,
    fetchGameStateData,
    scheduleReconnect,
    reconnectAttempts
  } = useGameStateSubscription(gameId);

  // Monitor network status
  const { 
    networkStatus, 
    reconnectAttempts: networkReconnectAttempts,
    checkNetworkStatus 
  } = useNetworkStatus(isConnected, fetchGameStateData, scheduleReconnect, gameId);

  // Get leaderboard data
  const { leaderboard, setLeaderboard, fetchLeaderboardData } = useLeaderboardData(gameId);

  // Get player answer submission functionality
  const { 
    lastAnswerResult, 
    submitAnswer,
    submitError, 
    isSubmitting 
  } = usePlayerAnswers(
    gameId,
    gameState,
    setLeaderboard,
    isConnected,
    scheduleReconnect
  );

  // Get questions data
  const { questions, currentQuestion, fetchQuestionsData } = useGameQuestions(gameId, gameState);

  // Create a proper Promise-returning function for leaderboard data fetching
  const fetchLeaderboardDataWrapper = useLeaderboardFetcher(
    gameId,
    isConnected,
    fetchLeaderboardData,
    setLastSyncTimestamp
  );

  // Enhanced answer submission with better error handling and monitoring
  const enhancedSubmitAnswer = useEnhancedAnswerSubmission(
    submitAnswer,
    submitError,
    isConnected,
    networkStatus,
    setLastSyncTimestamp
  );

  // Monitor system health and log activity
  useGameStateMonitor(
    gameId,
    gameState,
    isConnected,
    lastSyncTimestamp,
    setLastSyncTimestamp,
    reconnectAttempts,
    networkReconnectAttempts,
    networkStatus,
    clientTimeOffset,
    syncAttempts,
    leaderboard,
    questions,
    {
      fetchGameStateData,
      fetchLeaderboardData: fetchLeaderboardDataWrapper,
      fetchQuestionsData,
      syncWithServer
    }
  );

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
    submitAnswer: enhancedSubmitAnswer,
    lastAnswerResult,
    isLoading,
    error,
    isConnected,
    reconnectAttempts,
    networkStatus,
    clientTimeOffset,
    syncWithServer,
    getAdjustedTime,
    isSubmitting,
    submitError
  };
};

export default useLiveGameState;

// Re-export to maintain compatibility with the original module
export * from './gameStateUtils';
export * from './leaderboardUtils';
export * from './playerUtils';
export * from './questionsUtils';
