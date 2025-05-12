
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameHeader from './GameHeader';
import GameStateRenderer from './GameStateRenderer';
import ConnectionStatus from './ConnectionStatus';
import { useGameInfo } from './hooks/useGameInfo';
import { useGameStateValues } from './hooks/useGameStateValues';

interface GameContainerProps {
  gameState: any;
  questions: any[];
  currentQuestion: any;
  adaptedCurrentQuestion: any;
  leaderboardData: any[];
  lastAnswerResult: any;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  reconnectAttempts: number;
  submitAnswer: any;
  gameId: string | undefined;
  myRank: number;
  myPoints: number;
  lastPoints: number;
}

const GameContainer: React.FC<GameContainerProps> = ({
  gameState,
  questions,
  currentQuestion,
  adaptedCurrentQuestion,
  leaderboardData,
  lastAnswerResult,
  isLoading,
  error,
  isConnected,
  reconnectAttempts,
  submitAnswer,
  gameId,
  myRank,
  myPoints,
  lastPoints
}) => {
  // Get game info (title, scheduled time)
  const gameInfo = useGameInfo(gameId);
  
  // Get derived state values and handlers
  const {
    leaderboard,
    selectedOption,
    setSelectedOption,
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
      
      <ConnectionStatus 
        connectionStatus={isConnected ? 'connected' : 'disconnected'} 
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
            gameInfo={{
              title: gameInfo.title,
              scheduledTime: gameInfo.scheduledTime,
              prizePool: gameInfo.prizePool
            }}
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
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default GameContainer;
