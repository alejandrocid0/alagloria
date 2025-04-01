
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LiveGameState, Player, AnswerResult } from "@/types/liveGame";
import { QuizQuestion } from "@/types/quiz";
import { toast } from "@/hooks/use-toast";

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
  
  // Connection and sync state
  const [isConnected, setIsConnected] = useState(true); 
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [clientTimeOffset, setClientTimeOffset] = useState(0);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch game state data
  const fetchGameStateData = useCallback(async () => {
    if (!gameId) return;
    
    try {
      const { data, error } = await supabase
        .rpc('get_live_game_state', { game_id: gameId });
      
      if (error) throw error;
      
      // Update game state
      if (data && data.length > 0) {
        const gameStateData: LiveGameState = {
          id: data[0].id,
          status: data[0].status,
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
            setCurrentQuestion(questions[questionIndex]);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching game state:', err);
      setError('Error al cargar el estado del juego');
    }
  }, [gameId, questions]);
  
  // Fetch game leaderboard
  const fetchLeaderboardData = useCallback(async () => {
    if (!gameId) return;
    
    try {
      const { data: leaderboardData, error } = await supabase
        .rpc('get_game_leaderboard', { game_id: gameId });
      
      if (error) throw error;
      
      if (leaderboardData) {
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
      console.error('Error fetching leaderboard:', err);
    }
  }, [gameId, user]);
  
  // Fetch game questions
  const fetchQuestionsData = useCallback(async () => {
    if (!gameId) return;
    
    try {
      // First, get the list of questions for this game
      const { data: gameQuestions, error: gameQuestionsError } = await supabase
        .from('questions')
        .select('id, position, question_text, correct_option, game_id')
        .eq('game_id', gameId)
        .order('position');
      
      if (gameQuestionsError) throw gameQuestionsError;
      
      if (gameQuestions && gameQuestions.length > 0) {
        // For each question, get its options
        const questionsWithOptions = await Promise.all(
          gameQuestions.map(async (question) => {
            const { data: options, error: optionsError } = await supabase
              .from('options')
              .select('id, option_id, option_text, position')
              .eq('question_id', question.id)
              .order('position');
            
            if (optionsError) throw optionsError;
            
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
        
        setQuestions(questionsWithOptions);
        
        // Update current question if in question state
        if (gameState && gameState.status === 'question') {
          const currentQuestionIndex = gameState.current_question;
          if (currentQuestionIndex < questionsWithOptions.length) {
            setCurrentQuestion(questionsWithOptions[currentQuestionIndex]);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
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
      
      if (error) throw error;
      
      setGameInfo({
        title: data.title,
        scheduledTime: data.date
      });
    } catch (err) {
      console.error('Error fetching game info:', err);
    }
  }, [gameId]);

  // Subscribe to game state updates
  useEffect(() => {
    if (!gameId) return;
    
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
          console.log('Game state change detected:', payload);
          fetchGameStateData();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, fetchGameStateData]);

  // Subscribe to leaderboard updates
  useEffect(() => {
    if (!gameId) return;
    
    const channel = supabase
      .channel(`leaderboard-${gameId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'live_game_answers',
          filter: `game_id=eq.${gameId}`
        },
        () => {
          fetchLeaderboardData();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, fetchLeaderboardData]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchGameInfo(),
          fetchGameStateData(),
          fetchLeaderboardData(),
          fetchQuestionsData()
        ]);
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Error al cargar los datos del juego');
        
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del juego",
          variant: "destructive"
        });
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
    if (!gameId || !user || !gameState || gameState.status !== 'question') return null;
    
    try {
      // Submit answer to server
      const { data, error } = await supabase.rpc('submit_game_answer', {
        p_game_id: gameId,
        p_user_id: user.id,
        p_question_position: questionIdx,
        p_selected_option: optionId,
        p_answer_time_ms: answerTimeMs || 0
      });
      
      if (error) {
        console.error('Error submitting answer:', error);
        toast({
          title: "Error",
          description: "No se pudo enviar tu respuesta",
          variant: "destructive"
        });
        return null;
      }
      
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
      console.error('Error submitting answer:', err);
      return null;
    }
  }, [gameId, user, gameState]);

  // Time sync and connection related methods (simplified versions)
  const syncWithServer = useCallback(() => {
    // Simplified time sync implementation
    console.log('Time sync with server initiated');
    setReconnectAttempts(prev => prev + 1);
    setIsConnected(true);
  }, []);
  
  const getAdjustedTime = useCallback(() => {
    return Date.now() + clientTimeOffset;
  }, [clientTimeOffset]);
  
  // Function to start game (for host)
  const startGame = useCallback(async () => {
    if (!gameId) return;
    
    try {
      const { data, error } = await supabase.rpc('start_live_game', { game_id: gameId });
      
      if (error) {
        console.error('Error starting game:', error);
        toast({
          title: "Error",
          description: "No se pudo iniciar la partida",
          variant: "destructive"
        });
        return;
      }
      
      console.log('Game started:', data);
      fetchGameStateData();
    } catch (err) {
      console.error('Error starting game:', err);
    }
  }, [gameId, fetchGameStateData]);

  // Check if user is game host
  const isGameHost = false; // Simplified, without host check

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
    clientTimeOffset,
    isGameHost,
    setSelectedOption,
    handleSelectOption: (optionId: string) => submitAnswer(gameState?.current_question || 0, optionId, 0),
    submitAnswer,
    startGame,
    syncWithServer,
    getAdjustedTime,
    refreshGameState: fetchGameStateData,
    refreshLeaderboard: fetchLeaderboardData
  };
};

export default useLiveGameState;
