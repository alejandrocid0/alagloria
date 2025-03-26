
import { useState, useEffect, useCallback } from 'react';
import { LiveGameState } from '@/types/liveGame';
import { Player } from '@/types/game';
import { useAuth } from '@/contexts/AuthContext';

export const useGameStateValues = (
  gameState: LiveGameState | null,
  currentQuestion: any,
  leaderboardData: Player[],
  lastAnswerResult: any,
  submitAnswerFunction: (optionId: string, answerTimeMs: number) => Promise<any>
) => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [myRank, setMyRank] = useState(0);
  const [myPoints, setMyPoints] = useState(0);
  const [lastPoints, setLastPoints] = useState(0);
  const [answerStartTime, setAnswerStartTime] = useState<number | null>(null);

  // Update leaderboard when data changes
  useEffect(() => {
    if (leaderboardData && leaderboardData.length > 0) {
      setLeaderboard(leaderboardData);
      
      // Find user's rank and points
      const userPlayer = leaderboardData.find(player => player.id === user?.id);
      if (userPlayer) {
        setMyRank(userPlayer.rank);
        setMyPoints(userPlayer.points);
      }
    }
  }, [leaderboardData, user?.id]);

  // Update when we get answer results
  useEffect(() => {
    if (lastAnswerResult) {
      const points = lastAnswerResult.points || 0;
      setLastPoints(points);
    }
  }, [lastAnswerResult]);

  // Reset selected option when question changes
  useEffect(() => {
    if (gameState?.status === 'question' && currentQuestion) {
      setSelectedOption(null);
      
      // Store the time when question was presented
      setAnswerStartTime(Date.now());
    }
  }, [gameState?.status, currentQuestion]);

  // Handler for selecting an option
  const handleSelectOption = useCallback(async (optionId: string) => {
    if (selectedOption || !gameState || gameState.status !== 'question') return;
    
    setSelectedOption(optionId);
    
    try {
      // Calculate time taken to answer
      const answerTime = answerStartTime ? Date.now() - answerStartTime : 0;
      
      // Submit answer with time taken
      await submitAnswerFunction(optionId, answerTime);
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  }, [selectedOption, gameState, submitAnswerFunction, answerStartTime]);

  return {
    leaderboard,
    selectedOption,
    setSelectedOption,
    myRank,
    myPoints,
    lastPoints,
    handleSelectOption
  };
};

export default useGameStateValues;
