
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Player, Question, LiveGameState } from '@/types/liveGame';
import { toast } from '@/hooks/use-toast';
import { fetchGameState, subscribeToGameStateUpdates } from './gameStateUtils';
import { fetchQuestions } from './questionsUtils';
import { fetchGameLeaderboard, subscribeToLeaderboardUpdates } from './leaderboardUtils';
import { submitPlayerAnswer } from './playerUtils';
import { supabase } from '@/integrations/supabase/client';

export const useLiveGameState = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useAuth();
  const [gameState, setGameState] = useState<LiveGameState | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch game state from the server
  const fetchGameStateData = useCallback(async () => {
    if (!gameId) return;

    try {
      const state = await fetchGameState(gameId);
      
      if (state) {
        setGameState(state);
        
        // If there's a change in the current question, update it
        if (state.current_question !== undefined && questions.length > 0) {
          setCurrentQuestion(questions[state.current_question]);
        }
      }
    } catch (err) {
      console.error('Error fetching game state:', err);
      setError('No se pudo cargar el estado del juego');
    }
  }, [gameId, questions]);

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
      const data = await submitPlayerAnswer(
        gameId,
        user.id,
        gameState.current_question,
        selectedOption,
        answerTimeMs
      );
      
      // Update the leaderboard after submitting the answer
      fetchGameLeaderboard(gameId).then(setLeaderboard);
      
      return data;
    } catch (err) {
      console.error('Error submitting answer:', err);
      toast({
        title: "Error",
        description: "No se pudo enviar la respuesta",
        variant: "destructive"
      });
    }
  }, [gameId, user, gameState]);

  // Load initial data and set up subscriptions
  useEffect(() => {
    setIsLoading(true);
    
    // Load initial data
    const loadInitialData = async () => {
      try {
        await fetchGameStateData();
        
        if (gameId) {
          const questionData = await fetchQuestions(gameId);
          setQuestions(questionData);
          
          const leaderboardData = await fetchGameLeaderboard(gameId);
          setLeaderboard(leaderboardData);
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
    
    // Set up subscriptions for real-time updates
    let gameStateChannel: any = null;
    let leaderboardChannel: any = null;
    
    if (gameId) {
      gameStateChannel = subscribeToGameStateUpdates(gameId, () => {
        fetchGameStateData();
      });
      
      leaderboardChannel = subscribeToLeaderboardUpdates(gameId, () => {
        fetchGameLeaderboard(gameId).then(setLeaderboard);
      });
    }
    
    // Clean up subscriptions when unmounting
    return () => {
      if (gameStateChannel) supabase.removeChannel(gameStateChannel);
      if (leaderboardChannel) supabase.removeChannel(leaderboardChannel);
    };
  }, [gameId, fetchGameStateData]);

  return {
    gameState,
    questions,
    currentQuestion,
    leaderboard,
    submitAnswer,
    isLoading,
    error
  };
};

export default useLiveGameState;
