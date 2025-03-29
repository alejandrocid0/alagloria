
import { useCallback } from 'react';
import { AnswerResult } from '@/types/liveGame';
import { toast } from '@/hooks/use-toast';

/**
 * Hook providing enhanced answer submission with better error handling
 */
export const useEnhancedAnswerSubmission = (
  submitAnswer: (questionPosition: number, selectedOption: string, answerTimeMs: number) => Promise<AnswerResult | null>,
  submitError: string | null,
  isConnected: boolean,
  networkStatus: string,
  setLastSyncTimestamp: (time: number) => void
) => {
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

  return enhancedSubmitAnswer;
};
