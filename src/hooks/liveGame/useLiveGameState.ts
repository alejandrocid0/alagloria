
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { QuizQuestion } from '@/types/quiz';
import { LiveGameState, Player, AnswerResult } from '@/types/liveGame';
import { supabase } from '@/integrations/supabase/client';
import { 
  fetchLiveGameState, 
  fetchGameQuestions, 
  startGame as startGameUtil,
  subscribeToGameUpdates
} from './gameStateUtils';
import {
  fetchGameLeaderboard,
  subscribeToLeaderboardUpdates
} from './leaderboardUtils';
import {
  submitAnswer as submitAnswerUtil
} from './playerUtils';

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
  const [lastAnswer, setLastAnswer] = useState<AnswerResult | null>(null);
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
        const { data: gamesData, error: gamesError } = await supabase
          .from('games_with_details')
          .select()
          .eq('id', gameId)
          .single();
        
        if (gamesError) {
          throw new Error("Partida no encontrada");
        }
        
        setGameDetails(gamesData);

        // Obtener preguntas del juego
        const questionsList = await fetchGameQuestions(gameId);
        setQuestions(questionsList);

        // Obtener el estado actual del juego en vivo
        const liveGameState = await fetchLiveGameState(gameId);
        if (liveGameState) {
          setGameState(liveGameState);
        } else {
          // Si no existe un estado de juego, creamos uno por defecto
          setGameState({
            id: gameId,
            status: 'waiting',
            current_question: 0
          });
        }

        // Obtener el leaderboard inicial usando la nueva función RPC
        const leaderboardData = await fetchGameLeaderboard(gameId);
        setLeaderboard(leaderboardData);
        
        // Encontrar mi posición y puntos
        const myPosition = leaderboardData.findIndex(p => p.user_id === user.id);
        if (myPosition !== -1) {
          setMyRank(myPosition + 1);
          setMyPoints(leaderboardData[myPosition].total_points);
        }

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
    const gameSubscription = subscribeToGameUpdates(
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
    const leaderboardSubscription = subscribeToLeaderboardUpdates(
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
      const leaderboardData = await fetchGameLeaderboard(gameId);
      setLeaderboard(leaderboardData);
      
      // Encontrar mi posición y puntos
      const myPosition = leaderboardData.findIndex(p => p.user_id === user.id);
      if (myPosition !== -1) {
        setMyRank(myPosition + 1);
        setMyPoints(leaderboardData[myPosition].total_points);
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
      
      const result = await submitAnswerUtil(
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

  // Función para iniciar el juego
  const startGame = useCallback(async () => {
    if (!gameId || !user) return;
    
    try {
      await startGameUtil(gameId);
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
