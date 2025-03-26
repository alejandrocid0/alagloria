
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
    syncWithServer
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
  
  // Comprobar si es el momento de la partida
  useEffect(() => {
    // Solo si tenemos información de la partida y no está cargando
    if (!isLoading && gameInfo.scheduledTime) {
      const currentTime = new Date();
      const scheduledTime = new Date(gameInfo.scheduledTime);
      const isBeforeGameStart = currentTime < scheduledTime;
      
      // Calcular el tiempo hasta el inicio (minutos)
      const timeUntilStartInMinutes = Math.max(0, Math.floor((scheduledTime.getTime() - currentTime.getTime()) / (1000 * 60)));
      
      // Determinar si estamos más de 5 minutos antes del inicio de la partida
      if (isBeforeGameStart && timeUntilStartInMinutes > 5) {
        console.log(`Partida programada para dentro de ${timeUntilStartInMinutes} minutos, redirigiendo a sala de espera...`);
        setRedirectToWaiting(true);
      }
    }
  }, [isLoading, gameInfo.scheduledTime]);
  
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
    } else if (gameState && !isConnected && reconnectAttempts > 0) {
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

  // Detectar cambio al estado 'finished' para mostrar notificación
  useEffect(() => {
    if (gameState?.status === 'finished') {
      gameNotifications.gameCompleted(myRank);
      gameNotifications.resultsSaved();
    } else if (gameState?.status === 'waiting' && gameState.countdown === 5) {
      gameNotifications.gameStarting();
    } else if (gameState?.status === 'waiting' && gameState.countdown === 300) {
      // 5 minutos de aviso
      gameNotifications.fiveMinutesWarning();
    }
  }, [gameState?.status, myRank, gameState?.countdown]);
  
  // Mock function for game host - would be implemented based on permissions
  const isGameHost = false;
  const startGame = async () => {
    console.log("Starting game...");
    // Implementation would go here
  };

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
        isDemoGame={gameId === 'demo-123'} 
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
            isGameHost={isGameHost}
            startGame={startGame}
            clientTimeOffset={clientTimeOffset}
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default LiveGameRenderer;
