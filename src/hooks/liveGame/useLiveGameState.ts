
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { realTimeSync } from '@/services/games/realTimeSync';
import { fetchGameState } from './gameStateUtils';
import { fetchGameLeaderboard } from './leaderboardUtils';
import { fetchGameQuestions } from './questionsUtils';
import { submitAnswer as submitPlayerAnswer } from './useAnswerSubmission';
import { LiveGameState, Player, Question, AnswerResult } from '@/types/liveGame';

export const useLiveGameState = (gameId?: string) => {
  // State hooks
  const [gameState, setGameState] = useState<LiveGameState | null>(null);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [lastAnswerResult, setLastAnswerResult] = useState<AnswerResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [myRank, setMyRank] = useState(0);
  const [myPoints, setMyPoints] = useState(0);
  const [lastPoints, setLastPoints] = useState(0);
  
  // Referencias para las suscripciones y evitar efectos duplicados
  const subscriptionsRef = useRef<{
    gameState?: any,
    leaderboard?: any,
    participants?: any
  }>({});
  const loadingRef = useRef(false);
  
  // Get user information
  const { user } = useAuth();
  
  // Función para actualizar todos los datos de la partida
  const refreshGameState = useCallback(async () => {
    if (!gameId) return;
    
    try {
      // Prevenir múltiples llamadas simultáneas
      if (loadingRef.current) return;
      loadingRef.current = true;
      
      setIsLoading(true);
      setError(null);
      
      console.log(`[LiveGameState] Refrescando estado para partida: ${gameId}`);
      
      // Obtener estado del juego
      const newGameState = await fetchGameState(gameId);
      
      if (newGameState) {
        setGameState(newGameState);
        setIsConnected(true);
        
        // Si hay una pregunta actual, cargarla
        if (newGameState.current_question > 0) {
          const gameQuestions = await fetchGameQuestions(gameId);
          setQuestions(gameQuestions);
          
          // Encontrar la pregunta actual
          const currentQ = gameQuestions.find(q => q.id === newGameState.current_question.toString());
          if (currentQ) {
            setCurrentQuestion(currentQ);
          }
        }
        
        // Cargar leaderboard
        const leaderboardData = await fetchGameLeaderboard(gameId);
        setLeaderboard(leaderboardData);
        
        // Actualizar rango y puntos del jugador si está autenticado
        if (user) {
          const playerData = leaderboardData.find(p => p.id === user.id);
          if (playerData) {
            setMyRank(playerData.rank);
            setMyPoints(playerData.points);
          }
        }
      } else {
        console.warn(`[LiveGameState] No se pudo obtener estado para la partida ${gameId}`);
      }
      
    } catch (err) {
      console.error('[LiveGameState] Error al refrescar estado:', err);
      setError('Error al cargar los datos de la partida');
      setIsConnected(false);
      setReconnectAttempts(prev => prev + 1);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [gameId, user]);
  
  // Función para enviar una respuesta
  const submitAnswer = useCallback(async (questionPosition: number, optionId: string, answerTimeMs: number = 0) => {
    if (!gameId || !user) return null;
    
    try {
      const result = await submitPlayerAnswer(
        gameId, 
        user.id, 
        questionPosition, 
        optionId, 
        answerTimeMs
      );
      
      // Actualizar resultado de la respuesta
      if (result) {
        setLastAnswerResult(result);
        
        if (result.is_correct) {
          setLastPoints(result.points);
          setMyPoints(prev => prev + result.points);
        }
      }
      
      return result;
    } catch (err) {
      console.error('[LiveGameState] Error al enviar respuesta:', err);
      return null;
    }
  }, [gameId, user]);
  
  // Efecto para configurar las suscripciones en tiempo real
  useEffect(() => {
    if (!gameId) return;
    
    console.log(`[LiveGameState] Configurando suscripciones para partida: ${gameId}`);
    
    // Cargar datos iniciales
    refreshGameState();
    
    // Suscribirse a cambios en el estado del juego
    const gameStateSubscription = realTimeSync.subscribeToGameState(gameId, (payload) => {
      console.log('[LiveGameState] Actualización de estado recibida:', payload);
      refreshGameState();
    });
    
    // Suscribirse a cambios en el leaderboard
    const leaderboardSubscription = realTimeSync.subscribeToLeaderboard(gameId, (payload) => {
      console.log('[LiveGameState] Actualización de leaderboard recibida:', payload);
      
      // Solo actualizar el leaderboard sin recargar todo el estado
      fetchGameLeaderboard(gameId).then(leaderboardData => {
        setLeaderboard(leaderboardData);
        
        if (user) {
          const playerData = leaderboardData.find(p => p.id === user.id);
          if (playerData) {
            setMyRank(playerData.rank);
            // No actualizamos myPoints aquí para evitar sobrescribir los puntos ya sumados localmente
          }
        }
      });
    });
    
    // Guardar referencias de las suscripciones
    subscriptionsRef.current = {
      gameState: gameStateSubscription,
      leaderboard: leaderboardSubscription
    };
    
    // Actualización periódica como respaldo
    const intervalId = setInterval(() => {
      if (!isConnected || Math.random() < 0.2) { // Actualizar siempre si está desconectado, o a veces si está conectado
        console.log(`[LiveGameState] Actualizando datos periódicamente`);
        refreshGameState();
      }
    }, 15000);
    
    // Limpieza al desmontar
    return () => {
      clearInterval(intervalId);
      
      // Cancelar todas las suscripciones
      if (subscriptionsRef.current.gameState) {
        realTimeSync.unsubscribe(subscriptionsRef.current.gameState);
      }
      if (subscriptionsRef.current.leaderboard) {
        realTimeSync.unsubscribe(subscriptionsRef.current.leaderboard);
      }
    };
  }, [gameId, refreshGameState, user, isConnected]);
  
  // Restablecer la opción seleccionada cuando cambia la pregunta
  useEffect(() => {
    if (gameState?.status === 'question') {
      setSelectedOption(null);
    }
  }, [gameState?.current_question]);
  
  return {
    gameState,
    questions,
    leaderboard,
    currentQuestion,
    selectedOption,
    setSelectedOption,
    submitAnswer,
    lastAnswerResult,
    isLoading,
    error,
    isConnected,
    reconnectAttempts,
    refreshGameState,
    myRank,
    myPoints,
    lastPoints
  };
};

export default useLiveGameState;
