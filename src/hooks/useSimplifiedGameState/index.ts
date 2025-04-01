
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { gameStateSync } from '@/services/games/gameStateSync';
import { useGameState } from './useGameState';
import { useGameQuestions } from './useGameQuestions';
import { useLeaderboard } from './useLeaderboard';
import { useGameAnswers } from './useGameAnswers';
import { useConnectionStatus } from './useConnectionStatus';
import { useGameResults } from './useGameResults';
import { SimplifiedGameStateReturn } from './types';

export const useSimplifiedGameState = (gameId: string | undefined): SimplifiedGameStateReturn => {
  const { user } = useAuth();
  
  // Obtener estado del juego
  const { gameState, isLoading, error, loadGameState } = useGameState(gameId);
  
  // Obtener datos de preguntas
  const { questions, currentQuestion, loadQuestions } = useGameQuestions(
    gameId,
    gameState?.current_question
  );
  
  // Obtener datos del leaderboard
  const { leaderboard, myRank, myPoints, loadLeaderboard } = useLeaderboard(gameId);
  
  // Gestionar respuestas del jugador
  const { 
    selectedOption, 
    setSelectedOption, 
    lastPoints, 
    lastAnswerResult, 
    submitAnswer, 
    handleSelectOption 
  } = useGameAnswers(gameId, gameState);
  
  // Gestionar estado de conexión
  const { 
    isConnected, 
    setIsConnected, 
    reconnectAttempts, 
    setReconnectAttempts,
    scheduleReconnect 
  } = useConnectionStatus(loadGameState);
  
  // Gestionar guardado de resultados
  const { saveGameResults } = useGameResults(gameId);
  
  // Manejar cambios de estado del juego
  const handleGameStateChange = useCallback(() => {
    // Recargar el estado con un pequeño retraso para permitir que la base de datos se actualice
    setTimeout(() => {
      loadGameState();
      loadLeaderboard();
    }, 300);
  }, [loadGameState, loadLeaderboard]);
  
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
  
  // Actualizar estado de conexión
  useEffect(() => {
    if (error) {
      setIsConnected(false);
      scheduleReconnect();
    } else {
      setIsConnected(true);
      setReconnectAttempts(0);
    }
  }, [error, setIsConnected, scheduleReconnect, setReconnectAttempts]);
  
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
    saveGameResults
  };
};

export * from './types';
