
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
  
  // Fetch game state data
  const fetchGameStateData = useCallback(async () => {
    if (!gameId) {
      console.log("No gameId provided, skipping fetchGameStateData");
      return;
    }
    
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
        
        setGameState(gameStateData);
        
        // If question state, get current question
        if (gameStateData.status === 'question') {
          const questionIndex = gameStateData.current_question;
          
          // Get current question if we have it loaded
          if (questions.length > 0 && questionIndex < questions.length) {
            console.log(`[LiveGameState] Setting current question: ${questionIndex}`);
            setCurrentQuestion(questions[questionIndex]);
          } else {
            console.log(`[LiveGameState] Questions not loaded yet or invalid index: ${questionIndex}, questions length: ${questions.length}`);
            // If questions aren't loaded yet, trigger a fetch
            fetchQuestionsData();
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
    }
  }, [gameId, questions]);
  
  // Fetch game leaderboard
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
  
  // Fetch game questions - IMPROVED ERROR HANDLING
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
      
      console.log(`[LiveGameState] Found ${gameQuestions?.length || 0} questions for game ${gameId}`);
      
      if (gameQuestions && gameQuestions.length > 0) {
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
          
          // Update current question if in question state
          if (gameState && gameState.status === 'question') {
            const currentQuestionIndex = gameState.current_question;
            console.log(`[LiveGameState] Current question index: ${currentQuestionIndex}, Questions length: ${questionsWithOptions.length}`);
            
            if (currentQuestionIndex < questionsWithOptions.length) {
              console.log(`[LiveGameState] Setting current question to index: ${currentQuestionIndex}`);
              setCurrentQuestion(questionsWithOptions[currentQuestionIndex]);
            } else {
              console.warn(`[LiveGameState] Current question index out of bounds: ${currentQuestionIndex}`);
            }
          }
        } catch (optionsErr) {
          console.error('[LiveGameState] Error processing options for questions:', optionsErr);
          setError('Error al cargar las opciones de las preguntas');
        }
      } else {
        console.warn(`[LiveGameState] No questions found for game ${gameId}`);
      }
    } catch (err) {
      console.error('[LiveGameState] Error fetching questions:', err);
      setError('Error al cargar las preguntas del juego');
    }
  }, [gameId, gameState]);
  
  // Fetch game information
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

  // Subscribe to game state updates
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
          fetchGameStateData();
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

  // Subscribe to leaderboard updates
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
          fetchLeaderboardData();
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

  // Load initial data - IMPROVED SEQUENCE & ERROR HANDLING
  useEffect(() => {
    const loadInitialData = async () => {
      if (!gameId) {
        console.warn('[LiveGameState] No gameId provided, skipping initial data load');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log(`[LiveGameState] Starting initial data load for game: ${gameId}`);
        
        // Load in sequence to ensure dependencies are respected
        await fetchGameInfo();
        const gameStateResult = await fetchGameStateData();
        await fetchLeaderboardData();
        
        // Only fetch questions if we have a valid game state
        if (gameStateResult) {
          await fetchQuestionsData();
        }
        
        console.log('[LiveGameState] Initial data load completed successfully');
      } catch (err) {
        console.error('[LiveGameState] Error loading initial data:', err);
        setError('Error al cargar los datos del juego');
        
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del juego",
          variant: "destructive"
        });
        
        // Still mark as loaded even if there was an error to prevent infinite loading state
      } finally {
        setIsLoading(false);
      }
    };
    
    if (gameId) {
      loadInitialData();
    }
  }, [gameId, fetchGameInfo, fetchGameStateData, fetchLeaderboardData, fetchQuestionsData]);

  // Reset selected option when question changes
  useEffect(() => {
    if (gameState && gameState.status === 'question') {
      console.log('[LiveGameState] Resetting selected option for new question');
      setSelectedOption(null);
    }
  }, [gameState?.current_question, gameState?.status]);

  // Function to adapt current question to QuizQuestion format
  const adaptCurrentQuestion = useCallback((): QuizQuestion | null => {
    if (!currentQuestion) return null;
    
    return {
      id: currentQuestion.id.toString(),
      question: currentQuestion.question,
      correctOption: currentQuestion.correctOption,
      position: currentQuestion.position,
      options: currentQuestion.options.map((opt: any) => ({
        id: opt.id,
        text: opt.option_text,
        isCorrect: opt.option_id === currentQuestion.correctOption
      }))
    };
  }, [currentQuestion]);

  // Function to submit an answer
  const submitAnswer = useCallback(async (questionIdx: number, optionId: string, answerTimeMs: number) => {
    if (!gameId || !user || !gameState || gameState.status !== 'question') {
      console.warn('[LiveGameState] Cannot submit answer - prerequisites not met', {
        gameId, userId: user?.id, gameState: gameState?.status
      });
      return null;
    }
    
    try {
      console.log(`[LiveGameState] Submitting answer: Game: ${gameId}, Question: ${questionIdx}, Option: ${optionId}, Time: ${answerTimeMs}ms`);
      
      // Submit answer to server
      const { data, error } = await supabase.rpc('submit_game_answer', {
        p_game_id: gameId,
        p_user_id: user.id,
        p_question_position: questionIdx,
        p_selected_option: optionId,
        p_answer_time_ms: answerTimeMs || 0
      });
      
      if (error) {
        console.error('[LiveGameState] Error submitting answer:', error);
        toast({
          title: "Error",
          description: "No se pudo enviar tu respuesta",
          variant: "destructive"
        });
        return null;
      }
      
      console.log('[LiveGameState] Answer submitted successfully:', data);
      
      // Update last points and set result
      if (data && data[0]) {
        setLastPoints(data[0].points || 0);
        setLastAnswerResult({
          is_correct: data[0].is_correct,
          points: data[0].points,
          correctOption: data[0].correctoption
        });
        return data[0];
      }
      
      return null;
    } catch (err) {
      console.error('[LiveGameState] Error submitting answer:', err);
      return null;
    }
  }, [gameId, user, gameState]);

  // Handle reconnection
  const scheduleReconnect = useCallback(() => {
    setReconnectAttempts(prev => {
      const attempts = prev + 1;
      console.log(`[LiveGameState] Scheduling reconnection attempt ${attempts} in 2 seconds`);
      setTimeout(() => {
        console.log('[LiveGameState] Executing reconnection attempt');
        fetchGameStateData();
      }, 2000);
      return attempts;
    });
  }, [fetchGameStateData]);
  
  // Function to start game (for host)
  const startGame = useCallback(async () => {
    if (!gameId) {
      console.warn('[LiveGameState] No gameId provided, cannot start game');
      return;
    }
    
    try {
      console.log(`[LiveGameState] Attempting to start game: ${gameId}`);
      
      const { data, error } = await supabase.rpc('start_live_game', { game_id: gameId });
      
      if (error) {
        console.error('[LiveGameState] Error starting game:', error);
        toast({
          title: "Error",
          description: "No se pudo iniciar la partida",
          variant: "destructive"
        });
        return;
      }
      
      console.log('[LiveGameState] Game started successfully:', data);
      gameNotifications.success('¡La partida ha comenzado!');
      fetchGameStateData();
    } catch (err) {
      console.error('[LiveGameState] Error starting game:', err);
    }
  }, [gameId, fetchGameStateData]);

  // Public API
  return {
    gameId,
    gameState,
    gameInfo,
    currentQuestion,
    adaptedCurrentQuestion: adaptCurrentQuestion(),
    questions,
    leaderboard,
    myPoints,
    myRank,
    lastPoints,
    selectedOption,
    lastAnswerResult,
    isLoading,
    error,
    isConnected,
    reconnectAttempts,
    isGameHost: false, // Simplificado
    setSelectedOption,
    handleSelectOption: (optionId: string) => submitAnswer(gameState?.current_question || 0, optionId, 0),
    submitAnswer,
    startGame,
    scheduleReconnect,
    refreshGameState: fetchGameStateData,
    refreshLeaderboard: fetchLeaderboardData
  };
};

export default useLiveGameState;
