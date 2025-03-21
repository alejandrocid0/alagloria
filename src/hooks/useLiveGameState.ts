
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { gameService } from '@/services/gameService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { QuizQuestion } from '@/types/quiz';

// Tipos para el estado del juego en vivo
export interface LiveGameState {
  id: string;
  status: 'waiting' | 'question' | 'result' | 'leaderboard' | 'finished';
  current_question: number;
  countdown?: number;
  started_at?: string;
  updated_at?: string;
}

// Tipos para el jugador
export interface Player {
  user_id: string;
  name: string;
  total_points: number;
  avatar?: string;
  rank?: number;
  lastAnswer?: 'correct' | 'incorrect' | null;
}

export const useLiveGameState = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Estado del juego
  const [gameState, setGameState] = useState<LiveGameState | null>(null);
  const [gameDetails, setGameDetails] = useState<any>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [myRank, setMyRank] = useState<number>(0);
  const [myPoints, setMyPoints] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [lastAnswer, setLastAnswer] = useState<any>(null);
  const [lastPoints, setLastPoints] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  
  // Estado de carga y errores
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar los detalles del juego
  useEffect(() => {
    if (!gameId || !user) return;

    const fetchGameData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener detalles del juego
        const gamesData = await gameService.fetchGames();
        const game = gamesData.find(g => g.id === gameId);
        
        if (!game) {
          throw new Error("Partida no encontrada");
        }
        
        setGameDetails(game);

        // Obtener preguntas del juego
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select(`
            id,
            question_text,
            correct_option,
            position,
            options (
              id,
              option_id,
              option_text,
              position
            )
          `)
          .eq('game_id', gameId)
          .order('position', { ascending: true });

        if (questionsError) {
          throw questionsError;
        }

        // Formatear las preguntas para que sean compatibles con QuizQuestion
        const formattedQuestions: QuizQuestion[] = questionsData.map(q => ({
          id: q.id,
          question: q.question_text,
          correctOption: q.correct_option,
          position: q.position,
          options: q.options.map(opt => ({
            id: opt.option_id,
            text: opt.option_text
          }))
        }));

        setQuestions(formattedQuestions);

        // Obtener el estado actual del juego en vivo
        const liveGameState = await gameService.getLiveGameState(gameId);
        setGameState(liveGameState);

        // Obtener el leaderboard inicial
        await refreshLeaderboard();

      } catch (err: any) {
        console.error("Error cargando datos del juego:", err);
        setError(err.message || "Error al cargar los datos del juego");
        toast({
          title: "Error",
          description: err.message || "No se pudieron cargar los datos del juego",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [gameId, user]);

  // Suscribirse a cambios en el estado del juego
  useEffect(() => {
    if (!gameId || !user) return;

    // Suscribirse a actualizaciones del estado del juego
    const gameSubscription = gameService.subscribeToGameUpdates(
      gameId,
      (payload) => {
        console.log("Game state updated:", payload);
        
        const newState = payload.new;
        setGameState(newState);
        
        // Si cambia el estado, resetear algunas variables
        if (newState.status === 'question') {
          setSelectedOption(null);
          setStartTime(Date.now());
        }
      }
    );

    // Suscribirse a actualizaciones del leaderboard
    const leaderboardSubscription = gameService.subscribeToLeaderboardUpdates(
      gameId,
      async () => {
        // Cada vez que hay un cambio en las respuestas, actualizar el leaderboard
        await refreshLeaderboard();
      }
    );

    return () => {
      // Limpiar suscripciones
      supabase.removeChannel(gameSubscription);
      supabase.removeChannel(leaderboardSubscription);
    };
  }, [gameId, user]);

  // Función para refrescar el leaderboard
  const refreshLeaderboard = async () => {
    if (!gameId || !user) return;
    
    try {
      const leaderboardData = await gameService.getGameLeaderboard(gameId);
      
      // Añadir ranks a los jugadores
      const rankedLeaderboard = leaderboardData.map((player, index) => ({
        ...player,
        rank: index + 1,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=5D3891&color=fff`
      }));
      
      setLeaderboard(rankedLeaderboard);
      
      // Encontrar mi posición y puntos
      const myPosition = rankedLeaderboard.findIndex(p => p.user_id === user.id);
      if (myPosition !== -1) {
        setMyRank(myPosition + 1);
        setMyPoints(rankedLeaderboard[myPosition].total_points);
      }
    } catch (err: any) {
      console.error("Error refreshing leaderboard:", err);
    }
  };

  // Función para enviar una respuesta
  const submitAnswer = useCallback(async (optionId: string) => {
    if (!gameId || !user || !gameState || selectedOption) return;
    
    try {
      const endTime = Date.now();
      const answerTimeMs = startTime ? endTime - startTime : 10000; // Default a 10s si no hay startTime
      
      setSelectedOption(optionId);
      
      const result = await gameService.submitAnswer(
        gameId,
        user.id,
        gameState.current_question,
        optionId,
        answerTimeMs
      );
      
      setLastAnswer(result);
      setLastPoints(result.points);
      
      // Mostrar toast según el resultado
      if (result.is_correct) {
        toast({
          title: "¡Respuesta correcta!",
          description: `Has ganado ${result.points} puntos`,
          variant: "default"
        });
      } else {
        toast({
          title: "Respuesta incorrecta",
          description: "No has ganado puntos en esta pregunta",
          variant: "destructive"
        });
      }
      
      // Actualizar leaderboard después de enviar respuesta
      await refreshLeaderboard();
      
    } catch (err: any) {
      console.error("Error submitting answer:", err);
      toast({
        title: "Error",
        description: err.message || "No se pudo enviar tu respuesta",
        variant: "destructive"
      });
    }
  }, [gameId, user, gameState, selectedOption, startTime]);

  // Función para iniciar el juego manualmente (solo para pruebas)
  const startGame = useCallback(async () => {
    if (!gameId || !user) return;
    
    try {
      const { error } = await supabase
        .from('live_games')
        .upsert({
          id: gameId,
          status: 'question',
          current_question: 0,
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      setStartTime(Date.now());
      
    } catch (err: any) {
      console.error("Error starting game:", err);
      toast({
        title: "Error",
        description: err.message || "No se pudo iniciar la partida",
        variant: "destructive"
      });
    }
  }, [gameId, user]);

  // Determinar si el usuario actual es el host del juego
  const isGameHost = gameDetails?.created_by === user?.id;

  // Obtener la pregunta actual
  const currentQuestionData = gameState && questions.length > 0 
    ? questions.find(q => q.position === gameState.current_question) || null
    : null;

  return {
    // Estado del juego
    gameId,
    gameState,
    gameDetails,
    loading,
    error,
    questions,
    currentQuestionData,
    selectedOption,
    lastAnswer,
    lastPoints,
    
    // Estado del jugador
    leaderboard,
    myRank,
    myPoints,
    
    // Funciones
    submitAnswer,
    startGame,
    isGameHost
  };
};

export default useLiveGameState;
