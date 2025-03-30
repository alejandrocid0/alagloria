
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveGameState } from '@/hooks/useLiveGameState';
import GameHeader from './GameHeader';
import GameStateRenderer from './GameStateRenderer';
import { useGameInfo } from './hooks/useGameInfo';
import { useGameStateValues } from './hooks/useGameStateValues';
import { adaptQuestionToQuizFormat } from './utils/gameDataAdapters';
import { motion, AnimatePresence } from 'framer-motion';
import { gameNotifications } from '@/components/ui/notification-toast';
import ConnectionStatus from './ConnectionStatus';

const LiveGameRenderer = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  
  // Estado para controlar cuando redirigir a la sala de espera
  const [redirectToWaiting, setRedirectToWaiting] = useState(false);
  const [lastGameStatus, setLastGameStatus] = useState<string | null>(null);
  
  // Get game info (title, scheduled time)
  const gameInfo = useGameInfo(gameId);
  
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
    clientTimeOffset,
    syncWithServer,
    getAdjustedTime
  } = useLiveGameState();
  
  // Get derived state values and handlers
  const {
    leaderboard,
    selectedOption,
    setSelectedOption,
    myRank,
    myPoints,
    lastPoints,
    handleSelectOption
  } = useGameStateValues(
    gameState,
    currentQuestion,
    leaderboardData,
    lastAnswerResult,
    (optionId: string, answerTimeMs: number) => {
      // Adapter function to match the expected signature
      if (currentQuestion && gameState) {
        return submitAnswer(gameState.current_question, optionId, answerTimeMs);
      }
      return Promise.resolve(null);
    }
  );
  
  // Sincronizar con el servidor al iniciar
  useEffect(() => {
    if (gameId) {
      syncWithServer();
    }
  }, [gameId, syncWithServer]);
  
  // Detectar cambios de estado del juego y mostrar notificaciones
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
  
  // Comprobar si es el momento de la partida
  useEffect(() => {
    // Solo si tenemos información de la partida y no está cargando
    if (!isLoading && gameInfo.scheduledTime) {
      const currentTime = getAdjustedTime();
      const scheduledTime = new Date(gameInfo.scheduledTime).getTime();
      const timeUntilStartInMs = scheduledTime - currentTime;
      
      const isBeforeGameStart = timeUntilStartInMs > 0;
      
      // Determinar si estamos más de 5 minutos antes del inicio de la partida
      // O si el juego está en estado de espera/waiting
      if ((isBeforeGameStart && timeUntilStartInMs > 300000) || (gameState && gameState.status === 'waiting')) {
        console.log(`Redirigiendo a sala de espera: ${Math.floor(timeUntilStartInMs/60000)} minutos para inicio o estado de espera`);
        setRedirectToWaiting(true);
      }
    }
  }, [isLoading, gameInfo.scheduledTime, gameState, getAdjustedTime]);
  
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

  // Helper function to adapt the current question
  const adaptedCurrentQuestion = currentQuestion ? adaptQuestionToQuizFormat(currentQuestion) : null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-md overflow-hidden"
    >
      <GameHeader 
        quizTitle={gameInfo.title} 
        playersCount={leaderboard.length} 
        myPoints={myPoints} 
        isDemoGame={false} 
      />
      
      {/* Componente de estado de conexión mejorado */}
      <ConnectionStatus 
        isConnected={isConnected} 
        reconnectAttempts={reconnectAttempts} 
      />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={gameState?.status || 'loading'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <GameStateRenderer
            gameId={gameId}
            gameState={gameState}
            isLoading={isLoading}
            error={error}
            gameInfo={gameInfo}
            questions={questions}
            currentQuestion={currentQuestion}
            adaptedCurrentQuestion={adaptedCurrentQuestion}
            leaderboard={leaderboard}
            myPoints={myPoints}
            myRank={myRank}
            lastPoints={lastPoints}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            handleSelectOption={handleSelectOption}
            isGameHost={false}
            startGame={() => Promise.resolve()}
            clientTimeOffset={clientTimeOffset}
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default LiveGameRenderer;
