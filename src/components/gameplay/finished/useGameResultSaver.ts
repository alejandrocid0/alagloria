
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { gameNotifications } from '@/components/ui/notification-toast';
import { toast } from '@/hooks/use-toast';

export interface GameResultData {
  gameId: string;
  gameTitle: string;
  rank: number;
  totalPoints: number;
  totalQuestions: number;
  correctAnswers: number;
}

export const useGameResultSaver = (result: GameResultData) => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to check if results were already saved
  const checkResultExists = useCallback(async () => {
    if (!user || !result.gameId) return false;
    
    try {
      const { data, error } = await supabase
        .from('game_results')
        .select('id')
        .eq('game_id', result.gameId)
        .eq('user_id', user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking for existing results:', error);
        return false;
      }
      
      return !!data;
    } catch (err) {
      console.error('Error checking game results:', err);
      return false;
    }
  }, [user, result.gameId]);

  // Function to save game results
  const saveResult = useCallback(async () => {
    if (!user || !result.gameId || isSaved) return;
    
    // First check if results already exist
    const exists = await checkResultExists();
    if (exists) {
      console.log('Results already saved for this game');
      setIsSaved(true);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Save game result to database
      const { error: saveError } = await supabase
        .from('game_results')
        .insert({
          game_id: result.gameId,
          user_id: user.id,
          game_title: result.gameTitle,
          position: result.rank,
          correct_answers: result.correctAnswers,
          total_answers: result.totalQuestions,
          entry_fee: 0 // Default to free games for now
        });
        
      if (saveError) {
        console.error('Error saving game results:', saveError);
        setError('No se pudieron guardar los resultados');
        toast({
          title: "Error",
          description: "No se pudieron guardar los resultados del juego",
          variant: "destructive"
        });
      } else {
        setIsSaved(true);
        gameNotifications.resultsSaved();
      }
    } catch (err) {
      console.error('Error saving results:', err);
      setError('Ocurrió un error al guardar los resultados');
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar los resultados",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, result, isSaved, checkResultExists]);

  // Check for existing results and save on component mount
  useEffect(() => {
    if (user && result.gameId && !isSaved) {
      // First check if results already exist
      checkResultExists().then(exists => {
        if (exists) {
          setIsSaved(true);
        } else {
          // Auto-save results if they don't exist yet
          saveResult();
        }
      });
    }
  }, [user, result.gameId, isSaved, checkResultExists, saveResult]);

  return {
    saveResult,
    isSaved,
    isLoading,
    error
  };
};
