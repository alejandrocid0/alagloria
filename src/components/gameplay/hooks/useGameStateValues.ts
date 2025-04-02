
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [hasAnsweredCurrentQuestion, setHasAnsweredCurrentQuestion] = useState(false);
  
  // Ref para controlar actualizaciones múltiples
  const processingAnswerRef = useRef<boolean>(false);
  const currentQuestionIdRef = useRef<string | null>(null);

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
      const currentQuestionId = currentQuestion.id;
      
      // Solo resetear el estado si es una pregunta nueva
      if (currentQuestionIdRef.current !== currentQuestionId) {
        console.log(`[GameStateValues] New question detected: ${currentQuestionId}`);
        currentQuestionIdRef.current = currentQuestionId;
        
        setSelectedOption(null);
        setHasAnsweredCurrentQuestion(false);
        processingAnswerRef.current = false;
        
        // Store the time when question was presented
        setAnswerStartTime(Date.now());
      }
    }
  }, [gameState?.status, currentQuestion]);

  // Handler for selecting an option
  const handleSelectOption = useCallback(async (optionId: string) => {
    // Evitar múltiples envíos de respuesta
    if (processingAnswerRef.current || hasAnsweredCurrentQuestion || selectedOption || !gameState || gameState.status !== 'question') {
      console.log('[GameStateValues] Ignoring option selection - already answered or not in question state');
      return;
    }
    
    console.log(`[GameStateValues] Selected option: ${optionId}`);
    processingAnswerRef.current = true;
    setSelectedOption(optionId);
    setHasAnsweredCurrentQuestion(true);
    
    try {
      // Calculate time taken to answer
      const answerTime = answerStartTime ? Date.now() - answerStartTime : 0;
      console.log(`[GameStateValues] Answer time: ${answerTime}ms`);
      
      // Submit answer with time taken
      await submitAnswerFunction(optionId, answerTime);
    } catch (error) {
      console.error('[GameStateValues] Error submitting answer:', error);
    } finally {
      processingAnswerRef.current = false;
    }
  }, [selectedOption, gameState, submitAnswerFunction, answerStartTime, hasAnsweredCurrentQuestion]);

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
