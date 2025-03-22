
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Player, Question, LiveGameState } from '@/types/liveGame';
import { toast } from '@/hooks/use-toast';
import { fetchGameState, subscribeToGameStateUpdates, setupAutoAdvance } from './gameStateUtils';
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
  const [lastAnswerResult, setLastAnswerResult] = useState<{
    isCorrect: boolean;
    points: number;
    correctOption: string;
  } | null>(null);
  
  // Timer references for auto-advancement
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        
        // Set up auto-advancement if needed
        if (state.countdown > 0) {
          // Clear any existing timer
          if (autoAdvanceTimerRef.current) {
            clearTimeout(autoAdvanceTimerRef.current);
          }
          
          // Set up new timer for auto-advancement
          autoAdvanceTimerRef.current = setupAutoAdvance(
            gameId, 
            state.status, 
            state.countdown,
            () => {
              console.log(`State auto-advanced from ${state.status}`);
              // Additional callback logic if needed
              
              // For result state, reset the last answer result when moving to leaderboard
              if (state.status === 'result') {
                setLastAnswerResult(null);
              }
            }
          );
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
      const result = await submitPlayerAnswer(
        gameId,
        user.id,
        gameState.current_question,
        selectedOption,
        answerTimeMs
      );
      
      // Store the answer result for showing in the Result state
      setLastAnswerResult(result);
      
      // Update the leaderboard after submitting the answer
      fetchGameLeaderboard(gameId).then(setLeaderboard);
      
      return result;
    } catch (err) {
      console.error('Error submitting answer:', err);
      toast({
        title: "Error",
        description: "No se pudo enviar la respuesta",
        variant: "destructive"
      });
    }
  }, [gameId, user, gameState]);

  // Handle game state changes
  const handleGameStateChange = useCallback((payload: any) => {
    console.log('Game state changed:', payload);
    fetchGameStateData();
  }, [fetchGameStateData]);

  // Load initial data and set up subscriptions
  useEffect(() => {
    setIsLoading(true);
    
    // Load initial data
    const loadInitialData = async () => {
      try {
        if (gameId) {
          const questionData = await fetchQuestions(gameId);
          setQuestions(questionData);
          
          const leaderboardData = await fetchGameLeaderboard(gameId);
          setLeaderboard(leaderboardData);
          
          await fetchGameStateData();
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
      gameStateChannel = subscribeToGameStateUpdates(gameId, handleGameStateChange);
      
      leaderboardChannel = subscribeToLeaderboardUpdates(gameId, () => {
        fetchGameLeaderboard(gameId).then(setLeaderboard);
      });
    }
    
    // Clean up subscriptions and timers when unmounting
    return () => {
      if (gameStateChannel) supabase.removeChannel(gameStateChannel);
      if (leaderboardChannel) supabase.removeChannel(leaderboardChannel);
      
      // Clear any auto-advance timer
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, [gameId, fetchGameStateData, handleGameStateChange]);

  return {
    gameState,
    questions,
    currentQuestion,
    leaderboard,
    submitAnswer,
    lastAnswerResult,
    isLoading,
    error
  };
};

export default useLiveGameState;
