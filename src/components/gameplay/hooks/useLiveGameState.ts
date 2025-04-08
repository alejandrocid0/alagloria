
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveGameState as useCoreLiveGameState } from '@/hooks/useLiveGameState';
import { gameNotifications } from '@/components/ui/notification-toast';
import { adaptQuestionToQuizFormat } from '../utils/gameDataAdapters';

export const useLiveGameState = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  
  // Estado para controlar cuando redirigir a la sala de espera
  const [redirectToWaiting, setRedirectToWaiting] = useState(false);
  const [lastGameStatus, setLastGameStatus] = useState<string | null>(null);
  
  // Get the core game state from the live game hook
  const {
    gameState,
    questions,
    leaderboard: leaderboardData,
    currentQuestion,
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
  } = useCoreLiveGameState();
  
  // Hook para manejar los cambios de estado del juego
  useEffect(() => {
    if (gameState && lastGameStatus !== gameState.status) {
      // Al cambiar de estado, actualizar la referencia de estado anterior
      setLastGameStatus(gameState.status);
      
      // Notificar al usuario del cambio de estado
      if (gameState.status === 'question') {
        gameNotifications.newQuestion();
      } else if (gameState.status === 'result') {
        gameNotifications.showingResults();
      } else if (gameState.status === 'leaderboard') {
        gameNotifications.showingLeaderboard();
      } else if (gameState.status === 'finished') {
        gameNotifications.gameCompleted(myRank);
      } else if (gameState.status === 'waiting') {
        // Si vuelve al estado de espera, redirigir a la sala de espera
        setRedirectToWaiting(true);
      }
    }
  }, [gameState?.status, myRank, lastGameStatus]);
  
  // Comprobar si el juego está en estado de espera
  useEffect(() => {
    // Solo si tenemos información de la partida y no está cargando
    if (!isLoading && gameState && gameState.status === 'waiting') {
      setRedirectToWaiting(true);
    }
  }, [isLoading, gameState]);
  
  // Redireccionar a la sala de espera si es necesario
  useEffect(() => {
    if (redirectToWaiting && gameId) {
      navigate(`/game/${gameId}/waiting`);
    }
  }, [redirectToWaiting, gameId, navigate]);
  
  // Mostrar notificaciones en cambios de estado importantes
  useEffect(() => {
    if (isConnected && reconnectAttempts > 0) {
      gameNotifications.connectSuccess();
    } else if (!isConnected && reconnectAttempts > 0) {
      gameNotifications.connectionLost();
    }
  }, [isConnected, reconnectAttempts]);

  // Notificar cuando hay resultados de respuestas
  useEffect(() => {
    if (lastAnswerResult) {
      if (lastAnswerResult.is_correct && lastPoints > 0) {
        gameNotifications.correctAnswer(lastPoints);
      } else if (!lastAnswerResult.is_correct) {
        gameNotifications.wrongAnswer();
      }
    }
  }, [lastAnswerResult, lastPoints]);
  
  // Adaptar la pregunta actual al formato requerido
  const adaptedCurrentQuestion = currentQuestion ? adaptQuestionToQuizFormat(currentQuestion) : null;
  
  // Ejecutar actualización inicial al cargar el componente
  useEffect(() => {
    if (gameId) {
      refreshGameState();
    }
  }, [gameId, refreshGameState]);
  
  return {
    gameId,
    gameState,
    questions,
    leaderboardData,
    currentQuestion,
    adaptedCurrentQuestion,
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
