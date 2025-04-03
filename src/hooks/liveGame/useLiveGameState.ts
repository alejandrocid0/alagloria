
import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LiveGameState, AnswerResult } from '@/types/liveGame';
import { gameNotifications } from '@/components/ui/notification-toast';
import useGameStateSubscription from './useGameStateSubscription';
import useGameQuestions from './useGameQuestions';
import useLeaderboardData from './useLeaderboardData';
import useGameStateUtils from './useGameStateUtils';
import useAnswerSubmission from './useAnswerSubmission';
import useGameInitialization from './useGameInitialization';

export const useLiveGameState = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useAuth();
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [lastAnswerResult, setLastAnswerResult] = useState<AnswerResult | null>(null);
  const [lastPoints, setLastPoints] = useState(0);
  const [myPoints, setMyPoints] = useState(0);
  const [myRank, setMyRank] = useState(0);
  
  // Connection state tracking
  const [isConnected, setIsConnected] = useState(true);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  // Get game state subscriptions and updates
  const {
    gameState,
    fetchGameStateData,
    scheduleReconnect
  } = useGameStateSubscription(gameId);
  
  // Get questions data
  const {
    questions,
    currentQuestion,
    fetchQuestionsData
  } = useGameQuestions(gameId, gameState);
  
  // Get leaderboard data
  const {
    leaderboard,
    fetchLeaderboardData
  } = useLeaderboardData(gameId);
  
  // Utilities like fetch game info
  const { fetchGameInfo } = useGameStateUtils();
  
  // Answer submission handler
  const { submitAnswer } = useAnswerSubmission({
    gameId,
    user,
    setLastAnswerResult,
    setLastPoints,
    fetchLeaderboardData
  });
  
  // Find user in leaderboard and update points/rank
  const updateUserStats = useCallback(() => {
    if (user && leaderboard.length > 0) {
      const myData = leaderboard.find(player => player.id === user.id);
      if (myData) {
        setMyPoints(myData.points);
        setMyRank(myData.rank);
      }
    }
  }, [user, leaderboard]);
  
  // Process leaderboard data when it changes
  useCallback(() => {
    updateUserStats();
  }, [leaderboard, updateUserStats]);
  
  // Handler for manual refresh
  const refreshGameState = useCallback(async () => {
    try {
      setIsConnected(false); // Establecer desconectado durante la reconexión
      const gameStateData = await fetchGameStateData(true);
      await fetchLeaderboardData();
      
      if (gameStateData && gameStateData.status === 'question') {
        await fetchQuestionsData();
      }
      
      setIsConnected(true); // Solo establecer conectado si todas las operaciones tuvieron éxito
      setReconnectAttempts(prev => prev + 1); // Incrementar intentos solo para propósitos de seguimiento
    } catch (err) {
      console.error('Error reconnecting:', err);
      setIsConnected(false);
      scheduleReconnect(); // Solo programar reconexión si falló
    }
  }, [fetchGameStateData, fetchLeaderboardData, fetchQuestionsData, scheduleReconnect]);
  
  // Initialize game data
  useGameInitialization({
    gameId,
    isLoading,
    setIsLoading,
    setError,
    fetchGameInfo,
    fetchGameStateData,
    fetchLeaderboardData,
    isConnected,
    scheduleReconnect
  });
  
  return {
    gameState,
    questions,
    leaderboard,
    currentQuestion,
    submitAnswer,
    lastAnswerResult,
    isLoading,
    error,
    myPoints,
    myRank,
    lastPoints,
    selectedOption,
    setSelectedOption,
    isConnected,
    reconnectAttempts,
    refreshGameState
  };
};

export default useLiveGameState;
