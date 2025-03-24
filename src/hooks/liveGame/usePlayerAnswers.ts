
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AnswerResult } from '@/types/liveGame';
import { submitPlayerAnswer } from './playerUtils';
import { fetchGameLeaderboard } from './leaderboardUtils';
import { toast } from '@/hooks/use-toast';

export const usePlayerAnswers = (
  gameId: string | undefined,
  gameState: any,
  setLeaderboard: (leaderboard: any[]) => void,
  isConnected: boolean,
  scheduleReconnect: () => void
) => {
  const { user } = useAuth();
  const [lastAnswerResult, setLastAnswerResult] = useState<{
    isCorrect: boolean;
    points: number;
    correctOption: string;
  } | null>(null);

  // Submit answer to the server
  const submitAnswer = useCallback(async (selectedOption: string, answerTimeMs: number) => {
    if (!gameId || !user || !gameState) {
      toast({
        title: "Error",
        description: "No se pudo enviar la respuesta",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await submitPlayerAnswer(
        gameId,
        user.id,
        gameState.current_question,
        selectedOption,
        answerTimeMs
      );
      
      // Map the result to match our expected state format
      setLastAnswerResult({
        isCorrect: result.is_correct,
        points: result.points,
        correctOption: result.correctOption
      });
      
      // Update the leaderboard after submitting the answer
      if (gameId) {
        const leaderboardData = await fetchGameLeaderboard(gameId);
        setLeaderboard(leaderboardData);
      }
      
      return result;
    } catch (err) {
      console.error('Error submitting answer:', err);
      toast({
        title: "Error",
        description: "No se pudo enviar la respuesta",
        variant: "destructive",
      });
      
      // If submission fails due to connectivity, mark as disconnected
      if (err instanceof Error && err.message.includes('network')) {
        scheduleReconnect();
      }
    }
  }, [gameId, user, gameState, scheduleReconnect, setLeaderboard]);

  return { lastAnswerResult, submitAnswer };
};
