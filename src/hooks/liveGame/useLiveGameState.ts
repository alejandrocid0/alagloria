
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LiveGameState, Player } from "@/types/liveGame";
import { QuizQuestion } from "@/types/quiz";
import { fetchGameState } from "./gameStateUtils";
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
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch game state data
  const fetchGameStateData = useCallback(async () => {
    if (!gameId) return;
    
    try {
      const gameStateData = await fetchGameState(gameId);
      
      // Update game state
      if (gameStateData) {
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
      const { data: questionsData, error } = await supabase
        .from('game_questions')
        .select('question_id, position, game_options')
        .eq('game_id', gameId)
        .order('position');
      
      if (error) throw error;
      
      if (questionsData && questionsData.length > 0) {
        const questionIds = questionsData.map(q => q.question_id);
        
        // Get actual questions content
        const { data: questionsContent, error: questionsError } = await supabase
          .from('questions')
          .select('id, question_text, category')
          .in('id', questionIds);
        
        if (questionsError) throw questionsError;
        
        // Merge questions data
        if (questionsContent) {
          const mergedQuestions = questionsData.map(gameQuestion => {
            const questionContent = questionsContent.find(q => q.id === gameQuestion.question_id);
            
            return {
              id: gameQuestion.question_id,
              position: gameQuestion.position,
              question: questionContent?.question_text || '',
              category: questionContent?.category || '',
              options: gameQuestion.game_options || []
            };
          });
          
          setQuestions(mergedQuestions);
          
          // Update current question if in question state
          if (gameState && gameState.status === 'question') {
            const currentQuestionIndex = gameState.current_question;
            if (currentQuestionIndex < mergedQuestions.length) {
              setCurrentQuestion(mergedQuestions[currentQuestionIndex]);
            }
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
      category: currentQuestion.category,
      options: currentQuestion.options.map((opt: any) => ({
        id: opt.id,
        text: opt.text,
        isCorrect: opt.is_correct || false
      }))
    };
  }, [currentQuestion]);

  // Function to handle option selection
  const handleSelectOption = useCallback(async (optionId: string) => {
    if (!gameId || !user || !gameState || gameState.status !== 'question' || selectedOption) return;
    
    setSelectedOption(optionId);
    
    try {
      // Submit answer to server
      const { data, error } = await supabase.rpc('submit_game_answer', {
        p_game_id: gameId,
        p_user_id: user.id,
        p_question_position: gameState.current_question,
        p_selected_option: optionId,
        p_answer_time_ms: 0 // No time tracking now
      });
      
      if (error) {
        console.error('Error submitting answer:', error);
        toast({
          title: "Error",
          description: "No se pudo enviar tu respuesta",
          variant: "destructive"
        });
        return;
      }
      
      // Update last points
      if (data && data[0]) {
        setLastPoints(data[0].points || 0);
      }
    } catch (err) {
      console.error('Error selecting option:', err);
    }
  }, [gameId, user, gameState, selectedOption]);

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
    currentQuestion: gameState?.current_question || 0,
    adaptedCurrentQuestion: adaptCurrentQuestion(),
    questions,
    leaderboard,
    myPoints,
    myRank,
    lastPoints,
    selectedOption,
    isLoading,
    error,
    isGameHost,
    setSelectedOption,
    handleSelectOption,
    startGame,
    refreshGameState: fetchGameStateData,
    refreshLeaderboard: fetchLeaderboardData
  };
};
