
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useGameStateSubscription } from './useGameStateSubscription';
import { useNetworkStatus } from './useNetworkStatus';
import { usePlayerAnswers } from './usePlayerAnswers';
import { useLeaderboardData } from './useLeaderboardData';
import { useGameQuestions } from './useGameQuestions';
import { useGameInitialization } from './useGameInitialization';
import { useTimeSync } from './useTimeSync';
import { toast } from '@/hooks/use-toast';
import { gameNotifications } from '@/components/ui/notification-toast';
import { AnswerResult } from '@/types/liveGame';

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
  
  // Monitor system health and log activity
  useEffect(() => {
    // Log system health every minute
    const monitorInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastSync = now - lastSyncTimestamp;
      
      console.log('[System Monitor] Status Report:', {
        gameId,
        gameState: gameState?.status,
        currentQuestion: gameState?.current_question,
        networkStatus,
        isConnected,
        reconnectAttempts,
        networkReconnectAttempts,
        clientTimeOffset,
        syncAttempts,
        timeSinceLastSync: `${Math.round(timeSinceLastSync / 1000)}s ago`,
        leaderboardSize: leaderboard.length,
        questionsLoaded: questions.length
      });
      
      // Trigger reconnection if we haven't synced in more than 2 minutes
      if (timeSinceLastSync > 120000 && gameState && gameState.status !== 'finished') {
        console.log('[System Monitor] Detected stale data, forcing refresh');
        fetchGameStateData();
        fetchLeaderboardData();
        fetchQuestionsData();
        syncWithServer();
        setLastSyncTimestamp(now);
      }
    }, 60000);
    
    return () => clearInterval(monitorInterval);
  }, [clientTimeOffset, fetchGameStateData, fetchLeaderboardData, fetchQuestionsData, 
      gameId, gameState, isConnected, lastSyncTimestamp, leaderboard.length, 
      networkReconnectAttempts, networkStatus, questions.length, reconnectAttempts, 
      syncAttempts, syncWithServer]);
  
  // Enhanced answer submission with better error handling and monitoring
  const enhancedSubmitAnswer = useCallback(async (
    questionPosition: number,
    selectedOption: string,
    answerTimeMs: number
  ): Promise<AnswerResult | null> => {
    // Update last sync timestamp
    setLastSyncTimestamp(Date.now());
    
    // Show notification if network is poor
    if (networkStatus !== 'online' || !isConnected) {
      console.log('[Answer] Submitting with poor connection, showing notification');
      
      // Use toast directly instead of connectionIssue
      toast({
        title: "Problemas de conexión",
        description: "Estamos experimentando problemas de conexión. Tu respuesta se enviará cuando se recupere la conexión.",
        variant: "destructive",
      });
    }
    
    try {
      const result = await submitAnswer(questionPosition, selectedOption, answerTimeMs);
      
      if (result) {
        // Log successful submission
        console.log('[Answer] Submission successful', result);
        return result;
      }
      
      // Handle submission failure
      if (submitError) {
        console.error('[Answer] Submission failed with error:', submitError);
        toast({
          title: "Error al enviar respuesta",
          description: submitError,
          variant: "destructive",
        });
      }
      
      return null;
    } catch (err) {
      console.error('[Answer] Unexpected error during submission:', err);
      
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error al enviar tu respuesta. Intentaremos guardarla cuando se recupere la conexión.",
        variant: "destructive",
      });
      
      return null;
    }
  }, [isConnected, networkStatus, setLastSyncTimestamp, submitAnswer, submitError]);

  // Create a proper Promise-returning function for leaderboard data fetching
  const fetchLeaderboardDataWrapper = useCallback(async (): Promise<void> => {
    if (gameId && isConnected) {
      try {
        await fetchLeaderboardData();
        setLastSyncTimestamp(Date.now());
        return Promise.resolve();
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        return Promise.reject(error);
      }
    }
    return Promise.resolve();
  }, [fetchLeaderboardData, gameId, isConnected]);

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
