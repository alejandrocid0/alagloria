
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { gameStateSync } from '@/services/games/gameStateSync';
import { gameNotifications } from '@/components/ui/notification-toast';
import { supabase } from '@/integrations/supabase/client';
import { LiveGameState, Player } from '@/types/liveGame';

// Estado simplificado para gestionar el juego
export const useSimplifiedGameState = (gameId: string | undefined) => {
  const { user } = useAuth();
  
  // Estado del juego
  const [gameState, setGameState] = useState<LiveGameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<any | null>(null);
  
  // Estado del jugador
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [myRank, setMyRank] = useState(0);
  const [myPoints, setMyPoints] = useState(0);
  const [lastPoints, setLastPoints] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [lastAnswerResult, setLastAnswerResult] = useState<any | null>(null);
  
  // Estado de conexión
  const [isConnected, setIsConnected] = useState(true);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  // Cargar estado del juego
  const loadGameState = useCallback(async () => {
    if (!gameId) return;
    
    try {
      setIsLoading(true);
      
      // Obtener el estado actual del juego
      const gameStateData = await gameStateSync.getGameState(gameId);
      
      if (gameStateData) {
        setGameState(gameStateData);
        
        // Si el estado es "question", actualizar la pregunta actual
        if (gameStateData.status === 'question' && 
            questions.length > 0 && 
            gameStateData.current_question < questions.length) {
          setCurrentQuestion(questions[gameStateData.current_question]);
        }
      }
      
      setIsConnected(true);
      setReconnectAttempts(0);
    } catch (err) {
      console.error('Error al cargar el estado del juego:', err);
      setError('No se pudo cargar el estado del juego');
      setIsConnected(false);
      scheduleReconnect();
    } finally {
      setIsLoading(false);
    }
  }, [gameId, questions]);
  
  // Cargar preguntas
  const loadQuestions = useCallback(async () => {
    if (!gameId) return;
    
    try {
      // Obtener lista de preguntas para este juego
      const { data: gameQuestions, error: questionsError } = await supabase
        .from('questions')
        .select('id, position, question_text, correct_option, game_id')
        .eq('game_id', gameId)
        .order('position');
      
      if (questionsError) throw questionsError;
      
      if (gameQuestions && gameQuestions.length > 0) {
        // Para cada pregunta, obtener sus opciones
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
              category: 'general', // Categoría por defecto
              correctOption: question.correct_option
            };
          })
        );
        
        setQuestions(questionsWithOptions);
        
        // Actualizar pregunta actual si estamos en estado "question"
        if (gameState && gameState.status === 'question') {
          const currentQuestionIndex = gameState.current_question;
          if (currentQuestionIndex < questionsWithOptions.length) {
            setCurrentQuestion(questionsWithOptions[currentQuestionIndex]);
          }
        }
      }
    } catch (err) {
      console.error('Error al cargar preguntas:', err);
    }
  }, [gameId, gameState]);
  
  // Cargar leaderboard
  const loadLeaderboard = useCallback(async () => {
    if (!gameId) return;
    
    try {
      const { data: leaderboardData, error } = await supabase
        .rpc('get_game_leaderboard', { game_id: gameId });
      
      if (error) throw error;
      
      if (leaderboardData) {
        // Formatear y establecer datos del leaderboard
        const formattedLeaderboard = leaderboardData.map((player: any, index: number) => ({
          id: player.user_id,
          name: player.name,
          points: player.total_points,
          lastAnswer: player.last_answer,
          rank: index + 1,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=5D3891&color=fff`
        }));
        
        setLeaderboard(formattedLeaderboard);
        
        // Encontrar usuario actual en el leaderboard
        if (user) {
          const myData = formattedLeaderboard.find(player => player.id === user.id);
          if (myData) {
            setMyPoints(myData.points);
            setMyRank(myData.rank);
          }
        }
      }
    } catch (err) {
      console.error('Error al cargar leaderboard:', err);
    }
  }, [gameId, user]);
  
  // Programar reconexión
  const scheduleReconnect = useCallback(() => {
    setReconnectAttempts(prev => {
      const attempts = prev + 1;
      const delay = Math.min(30000, Math.pow(2, attempts) * 1000); // Backoff exponencial con máx 30s
      
      setTimeout(loadGameState, delay);
      return attempts;
    });
  }, [loadGameState]);
  
  // Enviar respuesta
  const submitAnswer = useCallback(async (questionIdx: number, optionId: string, answerTimeMs: number) => {
    if (!gameId || !user || !gameState || gameState.status !== 'question') return null;
    
    try {
      // Enviar respuesta al servidor
      const { data, error } = await supabase.rpc('submit_game_answer', {
        p_game_id: gameId,
        p_user_id: user.id,
        p_question_position: questionIdx,
        p_selected_option: optionId,
        p_answer_time_ms: answerTimeMs || 0
      });
      
      if (error) {
        console.error('Error al enviar respuesta:', error);
        return null;
      }
      
      // Actualizar puntos y resultado
      if (data && data[0]) {
        setLastPoints(data[0].points || 0);
        setLastAnswerResult({
          is_correct: data[0].is_correct,
          points: data[0].points,
          correctOption: data[0].correctoption
        });
        
        // Mostrar notificación según resultado
        if (data[0].is_correct) {
          gameNotifications.correctAnswer(data[0].points);
        } else {
          gameNotifications.wrongAnswer();
        }
        
        return data[0];
      }
      
      return null;
    } catch (err) {
      console.error('Error al enviar respuesta:', err);
      return null;
    }
  }, [gameId, user, gameState]);
  
  // Manejar cambios de estado del juego
  const handleGameStateChange = useCallback(() => {
    // Recargar el estado con un pequeño retraso para permitir que la base de datos se actualice
    setTimeout(() => {
      loadGameState();
      loadLeaderboard();
    }, 300);
  }, [loadGameState, loadLeaderboard]);
  
  // Manejar selección de opción
  const handleSelectOption = useCallback((optionId: string) => {
    if (selectedOption || !gameState || gameState.status !== 'question') return;
    
    setSelectedOption(optionId);
    
    // Calcular tiempo de respuesta (simplificado)
    const answerTime = 1000; // Valor predeterminado
    
    // Enviar respuesta
    submitAnswer(gameState.current_question, optionId, answerTime);
  }, [selectedOption, gameState, submitAnswer]);
  
  // Suscribirse a cambios en el estado del juego
  useEffect(() => {
    if (!gameId) return;
    
    const subscription = gameStateSync.subscribeToGameChanges(gameId, handleGameStateChange);
    
    // Cargar datos iniciales
    loadGameState();
    loadQuestions();
    loadLeaderboard();
    
    // Configurar actualizaciones periódicas
    const refreshInterval = setInterval(() => {
      loadGameState();
      loadLeaderboard();
    }, 15000);
    
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      clearInterval(refreshInterval);
    };
  }, [gameId, loadGameState, loadQuestions, loadLeaderboard, handleGameStateChange]);
  
  // Restablecer opción seleccionada cuando cambia la pregunta
  useEffect(() => {
    if (gameState && gameState.status === 'question') {
      setSelectedOption(null);
    }
  }, [gameState?.current_question, gameState?.status]);
  
  // Exportar estado y funciones
  return {
    gameState,
    questions,
    currentQuestion,
    leaderboard,
    myRank,
    myPoints,
    lastPoints,
    selectedOption,
    lastAnswerResult,
    isLoading,
    error,
    isConnected,
    reconnectAttempts,
    setSelectedOption,
    handleSelectOption,
    submitAnswer,
    refreshGameState: loadGameState,
    refreshLeaderboard: loadLeaderboard,
    saveGameResults: (stats: any) => {
      if (!gameId || !user) return Promise.resolve(false);
      return gameStateSync.saveGameResults(gameId, user.id, stats);
    }
  };
};
