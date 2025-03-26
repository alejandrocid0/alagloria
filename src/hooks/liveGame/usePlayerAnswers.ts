
import { useState, useCallback } from 'react';
import { LiveGameState, AnswerResult, Player } from '@/types/liveGame';
import { gameService } from '@/services/games';
import { useAuth } from '@/contexts/AuthContext';

export const usePlayerAnswers = (
  gameId?: string,
  gameState: LiveGameState | null = null,
  updateLeaderboard: (players: Player[]) => void,
  isConnected: boolean = true,
  scheduleReconnect: () => void
) => {
  const { user } = useAuth();
  const [lastAnswerResult, setLastAnswerResult] = useState<AnswerResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Function to handle answer submission with retry mechanism
  const submitAnswer = useCallback(async (
    questionPosition: number,
    selectedOption: string,
    answerTimeMs: number,
    retryCount: number = 0
  ): Promise<AnswerResult | null> => {
    // Clear previous state
    setSubmitError(null);
    
    // Don't submit if we're already submitting or not connected
    if (isSubmitting) {
      console.log('[Answer] Already submitting an answer, ignoring');
      return null;
    }
    
    if (!isConnected) {
      console.error('[Answer] Cannot submit answer: not connected to server');
      setSubmitError('No hay conexión al servidor. Intenta de nuevo cuando se restablezca la conexión.');
      scheduleReconnect();
      return null;
    }
    
    // Check if we have all the required data
    if (!gameId || !user || !user.id || !gameState) {
      console.error('[Answer] Cannot submit answer: missing required data', {
        gameId, userId: user?.id, gameState: !!gameState
      });
      setSubmitError('No se puede enviar la respuesta: faltan datos requeridos');
      return null;
    }
    
    try {
      setIsSubmitting(true);
      console.log(`[Answer] Submitting answer for question ${questionPosition}, option ${selectedOption}, time ${answerTimeMs}ms`);
      
      // Submit the answer
      const result = await gameService.submitAnswer(
        gameId,
        user.id,
        questionPosition,
        selectedOption,
        answerTimeMs
      );
      
      console.log('[Answer] Result:', result);
      
      if (result) {
        // Update the last answer result
        setLastAnswerResult(result);
        
        // Update the leaderboard
        try {
          const updatedLeaderboard = await gameService.getGameLeaderboard(gameId);
          console.log('[Answer] Updated leaderboard:', updatedLeaderboard);
          updateLeaderboard(updatedLeaderboard);
        } catch (error) {
          console.error('[Answer] Failed to fetch updated leaderboard:', error);
        }
        
        return result;
      } else {
        throw new Error('No se recibió respuesta del servidor');
      }
    } catch (error) {
      console.error('[Answer] Error submitting answer:', error);
      
      // Implement retry logic
      if (retryCount < 2) {
        console.log(`[Answer] Retrying submission (attempt ${retryCount + 1})...`);
        setIsSubmitting(false);
        
        // Wait a short time before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return submitAnswer(questionPosition, selectedOption, answerTimeMs, retryCount + 1);
      }
      
      setSubmitError(`Error al enviar respuesta: ${error instanceof Error ? error.message : 'error desconocido'}`);
      scheduleReconnect();
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [gameId, user, gameState, isConnected, isSubmitting, scheduleReconnect, updateLeaderboard]);
  
  return {
    lastAnswerResult,
    submitAnswer,
    submitError,
    isSubmitting
  };
};
