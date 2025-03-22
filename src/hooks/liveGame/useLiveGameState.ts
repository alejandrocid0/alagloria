
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Player, Question } from '@/types/game';
import { LiveGameState } from '@/types/liveGame';

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
  const fetchGameState = useCallback(async () => {
    if (!gameId) return;

    try {
      const { data, error } = await supabase
        .rpc('get_live_game_state', { game_id: gameId });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const state = {
          id: data[0].id,
          status: data[0].status as "waiting" | "question" | "result" | "leaderboard" | "finished",
          current_question: data[0].current_question,
          countdown: data[0].countdown,
          started_at: data[0].started_at,
          updated_at: data[0].updated_at
        };
        
        setGameState(state);
        
        // Si hay un cambio en la pregunta actual, actualizarla
        if (state.current_question !== undefined && questions.length > 0) {
          setCurrentQuestion(questions[state.current_question]);
        }
      }
    } catch (err) {
      console.error('Error fetching game state:', err);
      setError('No se pudo cargar el estado del juego');
    }
  }, [gameId, questions]);

  // Fetch questions for the game
  const fetchQuestions = useCallback(async () => {
    if (!gameId) return;

    try {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          id,
          question_text,
          correct_option,
          position,
          options (
            id,
            option_id,
            option_text
          )
        `)
        .eq('game_id', gameId)
        .order('position');
      
      if (error) throw error;
      
      if (data) {
        const formattedQuestions = data.map((q) => ({
          id: q.id,
          text: q.question_text,
          correctOption: q.correct_option,
          timeLimit: 20, // Default time limit in seconds
          options: q.options.map((o) => o.option_text)
        }));
        
        setQuestions(formattedQuestions);
        
        // Si hay un estado de juego, actualizar la pregunta actual
        if (gameState && gameState.current_question !== undefined) {
          setCurrentQuestion(formattedQuestions[gameState.current_question]);
        }
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('No se pudieron cargar las preguntas');
    }
  }, [gameId, gameState]);

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async () => {
    if (!gameId) return;

    try {
      const { data, error } = await supabase
        .rpc('get_game_leaderboard', { game_id: gameId });
      
      if (error) throw error;
      
      if (data) {
        const formattedLeaderboard = data.map((player, index) => ({
          id: player.user_id,
          name: player.name,
          points: player.total_points,
          rank: index + 1,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=5D3891&color=fff`,
          lastAnswer: player.last_answer as 'correct' | 'incorrect' | null
        }));
        
        setLeaderboard(formattedLeaderboard);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
  }, [gameId]);

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
      const { data, error } = await supabase
        .rpc('submit_game_answer', {
          p_game_id: gameId,
          p_user_id: user.id,
          p_question_position: gameState.current_question,
          p_selected_option: selectedOption,
          p_answer_time_ms: answerTimeMs
        });
      
      if (error) throw error;
      
      // Actualizar el tablero después de enviar la respuesta
      fetchLeaderboard();
      
      return data;
    } catch (err) {
      console.error('Error submitting answer:', err);
      toast({
        title: "Error",
        description: "No se pudo enviar la respuesta",
        variant: "destructive"
      });
    }
  }, [gameId, user, gameState, fetchLeaderboard]);

  // Load initial data and set up subscriptions
  useEffect(() => {
    setIsLoading(true);
    
    // Cargar datos iniciales
    const loadInitialData = async () => {
      try {
        await fetchGameState();
        await fetchQuestions();
        await fetchLeaderboard();
      } catch (err) {
        console.error('Error loading initial data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
    
    // Configurar suscripciones para actualizaciones en tiempo real
    const gameStateChannel = supabase
      .channel(`game-state-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_games',
          filter: `id=eq.${gameId}`
        },
        () => {
          fetchGameState();
        }
      )
      .subscribe();
    
    const leaderboardChannel = supabase
      .channel(`leaderboard-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_game_answers',
          filter: `game_id=eq.${gameId}`
        },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();
    
    // Limpiar suscripciones al desmontar
    return () => {
      supabase.removeChannel(gameStateChannel);
      supabase.removeChannel(leaderboardChannel);
    };
  }, [gameId, fetchGameState, fetchQuestions, fetchLeaderboard]);

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
