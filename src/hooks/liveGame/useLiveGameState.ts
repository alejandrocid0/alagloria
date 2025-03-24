
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Player, Question, LiveGameState, AnswerResult } from '@/types/liveGame';
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
  
  // Connection state tracking
  const [isConnected, setIsConnected] = useState(true);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastConnectionAttemptRef = useRef<number>(0);
  const reconnectAttemptsRef = useRef<number>(0);
  
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
        
        // Update connection state to connected if we successfully fetched the state
        if (!isConnected) {
          setIsConnected(true);
          toast({
            title: "Conexión recuperada",
            description: "Te has vuelto a conectar a la partida",
            variant: "default",
          });
          reconnectAttemptsRef.current = 0;
        }
      }
    } catch (err) {
      console.error('Error fetching game state:', err);
      setError('No se pudo cargar el estado del juego');
      
      // Mark as disconnected if fetch fails
      if (isConnected) {
        setIsConnected(false);
        toast({
          title: "Conexión perdida",
          description: "Intentando reconectar...",
          variant: "destructive",
        });
      }
      
      // Schedule reconnection attempt with exponential backoff
      scheduleReconnect();
    }
  }, [gameId, questions, isConnected]);

  // Function to handle reconnection attempts with exponential backoff
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }

    const now = Date.now();
    const timeSinceLastAttempt = now - lastConnectionAttemptRef.current;
    
    // If we've tried reconnecting recently, back off exponentially
    const baseDelay = 1000; // Start with 1 second
    const maxDelay = 30000; // Cap at 30 seconds
    const attemptsCount = reconnectAttemptsRef.current;

    // Calculate delay with exponential backoff
    const delay = Math.min(
      baseDelay * Math.pow(1.5, attemptsCount),
      maxDelay
    );
    
    // Schedule reconnection
    reconnectTimerRef.current = setTimeout(() => {
      lastConnectionAttemptRef.current = Date.now();
      reconnectAttemptsRef.current += 1;
      console.log(`Reconnection attempt ${reconnectAttemptsRef.current} after ${delay}ms`);
      
      // Attempt to fetch data and reestablish subscriptions
      fetchGameStateData();
      
      // Also refresh leaderboard data
      if (gameId) {
        fetchGameLeaderboard(gameId).then(setLeaderboard).catch(err => {
          console.error('Error fetching leaderboard during reconnect:', err);
        });
      }
    }, delay);
  }, [fetchGameStateData, gameId]);

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
      // This fixes the TypeScript error by properly transforming is_correct to isCorrect
      setLastAnswerResult({
        isCorrect: result.is_correct,
        points: result.points,
        correctOption: result.correctOption
      });
      
      // Update the leaderboard after submitting the answer
      fetchGameLeaderboard(gameId).then(setLeaderboard);
      
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
        setIsConnected(false);
        scheduleReconnect();
      }
    }
  }, [gameId, user, gameState, scheduleReconnect]);

  // Handle game state changes
  const handleGameStateChange = useCallback((payload: any) => {
    console.log('Game state changed:', payload);
    fetchGameStateData();
  }, [fetchGameStateData]);

  // Event handler for network status changes
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network connection restored');
      setIsConnected(true);
      fetchGameStateData();
      
      if (gameId) {
        fetchGameLeaderboard(gameId).then(setLeaderboard);
      }
      
      toast({
        title: "Conexión restablecida",
        description: "Te has vuelto a conectar a la partida",
        variant: "default",
      });
    };
    
    const handleOffline = () => {
      console.log('Network connection lost');
      setIsConnected(false);
      
      toast({
        title: "Conexión perdida",
        description: "Intentando reconectar...",
        variant: "destructive",
      });
      
      scheduleReconnect();
    };
    
    // Listen for browser's online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [gameId, fetchGameStateData, scheduleReconnect]);

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
        setIsConnected(false);
        scheduleReconnect();
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
      
      // Clear reconnect timer
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [gameId, fetchGameStateData, handleGameStateChange, scheduleReconnect]);

  return {
    gameState,
    questions,
    currentQuestion,
    leaderboard,
    submitAnswer,
    lastAnswerResult,
    isLoading,
    error,
    isConnected
  };
};

export default useLiveGameState;
