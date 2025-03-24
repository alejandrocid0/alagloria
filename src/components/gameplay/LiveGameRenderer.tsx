
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveGameState } from '@/hooks/useLiveGameState';
import GameHeader from './GameHeader';
import GameStateRenderer from './GameStateRenderer';
import { useGameInfo } from './hooks/useGameInfo';
import { useGameStateValues } from './hooks/useGameStateValues';
import { adaptQuestionToQuizFormat } from './utils/gameDataAdapters';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { gameNotifications } from '@/components/ui/notification-toast';

const LiveGameRenderer = () => {
  const { gameId } = useParams<{ gameId: string }>();
  
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
    isConnected
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
    submitAnswer
  );
  
  // Mostrar notificaciones en cambios de estado importantes
  useEffect(() => {
    if (isConnected) {
      gameNotifications.connectSuccess();
    } else if (gameState && !isConnected) {
      gameNotifications.connectionLost();
    }
  }, [isConnected]);

  // Notificar cuando hay resultados de respuestas
  useEffect(() => {
    if (lastAnswerResult) {
      if (lastAnswerResult.correct && lastPoints > 0) {
        gameNotifications.correctAnswer(lastPoints);
      } else if (!lastAnswerResult.correct) {
        gameNotifications.wrongAnswer();
      }
    }
  }, [lastAnswerResult, lastPoints]);

  // Detectar cambio al estado 'finished' para mostrar notificación
  useEffect(() => {
    if (gameState?.status === 'finished') {
      gameNotifications.gameCompleted(myRank);
    } else if (gameState?.status === 'waiting' && gameState.countdown === 5) {
      gameNotifications.gameStarting();
    }
  }, [gameState?.status, myRank]);
  
  // Mock function for game host - would be implemented based on permissions
  const isGameHost = false;
  const startGame = async () => {
    console.log("Starting game...");
    // Implementation would go here
  };

  // Helper function to adapt the current question
  const adaptedCurrentQuestion = currentQuestion ? adaptQuestionToQuizFormat(currentQuestion) : null;
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <GameHeader 
        quizTitle={gameInfo.title} 
        playersCount={leaderboard.length} 
        myPoints={myPoints} 
        isDemoGame={false} 
      />
      
      <AnimatePresence>
        {!isConnected && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-yellow-50 border-l-4 border-yellow-400 p-4 flex items-center space-x-3"
          >
            <div className="flex-shrink-0 relative">
              <WifiOff className="h-5 w-5 text-yellow-500" />
              <motion.div
                className="absolute inset-0"
                animate={{
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <Wifi className="h-5 w-5 text-yellow-500" />
              </motion.div>
            </div>
            <div>
              <p className="text-sm text-yellow-700">
                Conexión perdida. Intentando reconectar...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
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
      />
    </div>
  );
};

export default LiveGameRenderer;
