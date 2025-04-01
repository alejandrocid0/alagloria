
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LiveGameState, Player, AnswerResult } from "@/types/liveGame";
import { QuizQuestion } from "@/types/quiz";
import { toast } from "@/hooks/use-toast";
import { gameNotifications } from "@/components/ui/notification-toast";

export const useLiveGameState = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useAuth();
  
  // Game state
  const [gameState, setGameState] = useState<LiveGameState | null>(null);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [gameInfo, setGameInfo] = useState<{ title: string; scheduledTime: string; }>({ 
    title: '', 
    scheduledTime: '' 
  });
  
  // Player state
  const [currentQuestion, setCurrentQuestion] = useState<any | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [myPoints, setMyPoints] = useState(0);
  const [myRank, setMyRank] = useState(0);
  const [lastPoints, setLastPoints] = useState(0);
  const [lastAnswerResult, setLastAnswerResult] = useState<AnswerResult | null>(null);
  
  // Connection state
  const [isConnected, setIsConnected] = useState(true); 
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  
  // Fetch game state data - con protección contra bucles
  const fetchGameStateData = useCallback(async (forceFetch: boolean = false) => {
    if (!gameId) {
      console.log("No gameId provided, skipping fetchGameStateData");
      return null;
    }
    
    // Limitar la frecuencia de peticiones - no permitir más de una cada 2 segundos
    // A menos que forceFetch sea true
    const now = Date.now();
    if (!forceFetch && now - lastFetchTime < 2000) {
      console.log(`[LiveGameState] Throttling fetch request (${Math.floor((now - lastFetchTime)/1000)}s since last fetch)`);
      return null;
    }
    
    setLastFetchTime(now);
    
    try {
      console.log(`[LiveGameState] Fetching game state for game: ${gameId}`);
      
      const { data, error: fetchError } = await supabase
        .rpc('get_live_game_state', { game_id: gameId });
      
      if (fetchError) {
        console.error('[LiveGameState] Error fetching game state:', fetchError);
        throw fetchError;
      }
      
      // Update game state
      if (data && data.length > 0) {
        const status = data[0].status as "waiting" | "question" | "result" | "leaderboard" | "finished";
        
        console.log(`[LiveGameState] Game state fetched successfully, status: ${status}, current question: ${data[0].current_question}`);
        
        const gameStateData: LiveGameState = {
          id: data[0].id,
          status: status,
          current_question: data[0].current_question,
          countdown: data[0].countdown,
          started_at: data[0].started_at,
          updated_at: data[0].updated_at
        };
        
        // Evitar actualizaciones innecesarias del estado si es igual
        if (!gameState || 
            gameState.status !== gameStateData.status || 
            gameState.current_question !== gameStateData.current_question ||
            gameState.updated_at !== gameStateData.updated_at) {
          
          setGameState(gameStateData);
          
          // If question state, get current question - solo si tenemos preguntas cargadas
          if (gameStateData.status === 'question' && questions.length > 0) {
            const questionIndex = gameStateData.current_question;
            
            if (questionIndex < questions.length) {
              console.log(`[LiveGameState] Setting current question: ${questionIndex}`);
              setCurrentQuestion(questions[questionIndex]);
            }
          }
        }
        
        setError(null);
        return gameStateData;
      } else {
        console.warn('[LiveGameState] No game state data returned from server');
        return null;
      }
    } catch (err) {
      console.error('[LiveGameState] Error fetching game state:', err);
      setError('Error al cargar el estado del juego');
      gameNotifications.error('No se pudo cargar el estado del juego');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [gameId, gameState, lastFetchTime, questions.length]);
  
  // Fetch game leaderboard - con protección contra bucles
  const fetchLeaderboardData = useCallback(async () => {
    if (!gameId) return;
    
    try {
      console.log(`[LiveGameState] Fetching leaderboard for game: ${gameId}`);
      
      const { data: leaderboardData, error } = await supabase
        .rpc('get_game_leaderboard', { game_id: gameId });
      
      if (error) throw error;
      
      if (leaderboardData) {
        console.log(`[LiveGameState] Leaderboard fetched, ${leaderboardData.length} players`);
        
        // Format and set leaderboard data
        const formattedLeaderboard = leaderboardData.map((player: any, index: number) => ({
          id: player.user_id,
          name: player.name,
          points: player.total_points,
          lastAnswer: player.last_answer,
          rank: index + 1,
          avatar: player.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=5D3891&color=fff`
        }));
        
        setLeaderboard(formattedLeaderboard);
        
        // Find current user in leaderboard
        if (user) {
          const myData = formattedLeaderboard.find(player => player.id === user.id);
          if (myData) {
            setMyPoints(myData.points);
            setMyRank(myData.rank);
          }
        }
      }
    } catch (err) {
      console.error('[LiveGameState] Error fetching leaderboard:', err);
    }
  }, [gameId, user]);
  
  // Fetch game questions - con protección contra bucles
  const fetchQuestionsData = useCallback(async () => {
    if (!gameId) {
      console.log("[LiveGameState] No gameId provided, skipping fetchQuestionsData");
      return;
    }
    
    try {
      console.log(`[LiveGameState] Fetching questions for game: ${gameId}`);
      
      // First, get the list of questions for this game
      const { data: gameQuestions, error: gameQuestionsError } = await supabase
        .from('questions')
        .select('id, position, question_text, correct_option, game_id')
        .eq('game_id', gameId)
        .order('position');
      
      if (gameQuestionsError) {
        console.error('[LiveGameState] Error fetching game questions:', gameQuestionsError);
        throw gameQuestionsError;
      }
      
      if (!gameQuestions || gameQuestions.length === 0) {
        console.warn(`[LiveGameState] No questions found for game ${gameId}`);
        return;
      }
      
      console.log(`[LiveGameState] Found ${gameQuestions.length} questions for game ${gameId}`);
      
      try {
        // For each question, get its options
        const questionsWithOptions = await Promise.all(
          gameQuestions.map(async (question) => {
            console.log(`[LiveGameState] Fetching options for question: ${question.id}`);
            
            const { data: options, error: optionsError } = await supabase
              .from('options')
              .select('id, option_id, option_text, position')
              .eq('question_id', question.id)
              .order('position');
            
            if (optionsError) {
              console.error(`[LiveGameState] Error fetching options for question ${question.id}:`, optionsError);
              throw optionsError;
            }
            
            console.log(`[LiveGameState] Found ${options?.length || 0} options for question ${question.id}`);
            
            return {
              id: question.id,
              position: question.position,
              question: question.question_text,
              options: options || [],
              category: 'general', // Default category
              correctOption: question.correct_option
            };
          })
        );
        
        console.log(`[LiveGameState] Processed ${questionsWithOptions.length} questions with options`);
        setQuestions(questionsWithOptions);
        
        // Solo actualizar la pregunta actual si estamos en estado question y ya tenemos las preguntas
        if (gameState && gameState.status === 'question') {
          const currentQuestionIndex = gameState.current_question;
          
          if (currentQuestionIndex < questionsWithOptions.length) {
            console.log(`[LiveGameState] Setting current question to index: ${currentQuestionIndex}`);
            setCurrentQuestion(questionsWithOptions[currentQuestionIndex]);
          }
        }
      } catch (optionsErr) {
        console.error('[LiveGameState] Error processing options for questions:', optionsErr);
        setError('Error al cargar las opciones de las preguntas');
      }
    } catch (err) {
      console.error('[LiveGameState] Error fetching questions:', err);
      setError('Error al cargar las preguntas del juego');
    }
  }, [gameId, gameState]);
  
  // Fetch game information - con protección contra bucles
  const fetchGameInfo = useCallback(async () => {
    if (!gameId) return;
    
    try {
      const { data, error } = await supabase
        .from('games')
        .select('title, date')
        .eq('id', gameId)
        .single();
      
      if (error) {
        console.error('[LiveGameState] Error fetching game info:', error);
        throw error;
      }
      
      setGameInfo({
        title: data.title,
        scheduledTime: data.date
      });
    } catch (err) {
      console.error('[LiveGameState] Error fetching game info:', err);
    }
  }, [gameId]);

  // Para reintentar la conexión
  const refreshGameState = useCallback(async () => {
    setReconnectAttempts(prev => prev + 1);
    try {
      await fetchGameStateData(true);
      await fetchLeaderboardData();
      await fetchQuestionsData();
      setIsConnected(true);
      gameNotifications.success('Conexión reestablecida');
    } catch (err) {
      console.error('Error reconectando:', err);
      setIsConnected(false);
    }
  }, [fetchGameStateData, fetchLeaderboardData, fetchQuestionsData]);

  // Enviar respuesta
  const submitAnswer = useCallback(async (questionPosition: number, optionId: string, answerTimeMs: number = 0) => {
    if (!gameId || !user) return null;
    
    try {
      console.log(`[LiveGameState] Submitting answer for user ${user.id}, question ${questionPosition}, option ${optionId}`);
      
      // Submit answer
      const { data, error } = await supabase.rpc(
        'submit_game_answer',
        {
          p_game_id: gameId,
          p_user_id: user.id,
          p_question_position: questionPosition,
          p_selected_option: optionId,
          p_answer_time_ms: answerTimeMs
        }
      );
      
      if (error) {
        console.error('[LiveGameState] Error submitting answer:', error);
        return null;
      }
      
      if (data && data.length > 0) {
        console.log(`[LiveGameState] Answer submitted, result:`, data[0]);
        
        const result = {
          is_correct: data[0].is_correct,
          points: data[0].points,
          correctOption: data[0].correctoption
        };
        
        setLastAnswerResult(result);
        setLastPoints(result.points);
        
        return result;
      }
      
      return null;
    } catch (err) {
      console.error('[LiveGameState] Error submitting answer:', err);
      return null;
    }
  }, [gameId, user]);

  // Subscribe to game state updates - con protección contra bucles
  useEffect(() => {
    if (!gameId) return;
    
    console.log(`[LiveGameState] Setting up subscription for game state updates: ${gameId}`);
    
    const channel = supabase
      .channel(`game-state-${gameId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'live_games',
          filter: `id=eq.${gameId}`
        },
        (payload) => {
          console.log('[LiveGameState] Game state change detected:', payload);
          
          // Pequeño retraso para evitar múltiples actualizaciones muy seguidas
          setTimeout(() => {
            fetchGameStateData(true);
          }, 300);
        }
      )
      .subscribe((status) => {
        console.log(`[LiveGameState] Subscription status for game state: ${status}`);
      });
    
    return () => {
      console.log('[LiveGameState] Cleaning up game state subscription');
      supabase.removeChannel(channel);
    };
  }, [gameId, fetchGameStateData]);

  // Subscribe to leaderboard updates - con protección contra bucles
  useEffect(() => {
    if (!gameId) return;
    
    console.log(`[LiveGameState] Setting up subscription for leaderboard updates: ${gameId}`);
    
    const channel = supabase
      .channel(`leaderboard-${gameId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'live_game_answers',
          filter: `game_id=eq.${gameId}`
        },
        (payload) => {
          console.log('[LiveGameState] Leaderboard update detected:', payload);
          
          // Pequeño retraso para evitar múltiples actualizaciones muy seguidas
          setTimeout(() => {
            fetchLeaderboardData();
          }, 300);
        }
      )
      .subscribe((status) => {
        console.log(`[LiveGameState] Subscription status for leaderboard: ${status}`);
      });
    
    return () => {
      console.log('[LiveGameState] Cleaning up leaderboard subscription');
      supabase.removeChannel(channel);
    };
  }, [gameId, fetchLeaderboardData]);

  // Cargar los datos iniciales con una secuencia optimizada
  useEffect(() => {
    if (!gameId) {
      console.warn('[LiveGameState] No gameId provided, skipping initial data load');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    // Definir una secuencia asíncrona ordenada para cargar los datos iniciales
    const loadInitialData = async () => {
      try {
        console.log(`[LiveGameState] Starting initial data load for game: ${gameId}`);
        
        // Cargar datos en secuencia controlada
        await fetchGameInfo();
        
        // Cargar preguntas primero, ya que las necesitamos para asignar la pregunta actual
        await fetchQuestionsData();
        
        // Luego cargar el estado actual del juego
        const gameStateResult = await fetchGameStateData(true);
        
        // Finalmente cargar la tabla de clasificación
        await fetchLeaderboardData();
        
        console.log('[LiveGameState] Initial data load completed successfully');
        setIsConnected(true);
      } catch (err) {
        console.error('[LiveGameState] Error during initial data load:', err);
        setError('Error al cargar los datos iniciales');
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
    
    // Establecer una actualización periódica
    const periodicUpdate = setInterval(() => {
      console.log('[LiveGameState] Performing periodic data refresh');
      fetchGameStateData(false);
    }, 15000); // Cada 15 segundos
    
    return () => {
      clearInterval(periodicUpdate);
    };
  }, [gameId, fetchGameInfo, fetchQuestionsData, fetchGameStateData, fetchLeaderboardData]);

  // Actualizar la pregunta actual cuando cambie el estado o las preguntas
  useEffect(() => {
    if (gameState && gameState.status === 'question' && questions.length > 0) {
      const questionIndex = gameState.current_question;
      
      if (questionIndex < questions.length && (!currentQuestion || 
          currentQuestion.position !== questionIndex)) {
        console.log(`[LiveGameState] Updating current question based on state change to: ${questionIndex}`);
        setCurrentQuestion(questions[questionIndex]);
        setSelectedOption(null); // Resetear opción seleccionada
      }
    }
  }, [gameState, questions, currentQuestion]);

  return {
    gameState,
    questions,
    leaderboard,
    currentQuestion,
    submitAnswer,
    lastAnswerResult,
    isLoading,
    error,
    myPoints,
    myRank,
    lastPoints,
    selectedOption,
    setSelectedOption,
    isConnected,
    reconnectAttempts,
    refreshGameState
  };
};

export default useLiveGameState;
