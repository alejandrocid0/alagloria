
import React, { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLiveGameState } from '@/hooks/useLiveGameState';
import WaitingState from './WaitingState';
import QuestionState from './QuestionState';
import ResultState from './ResultState';
import LeaderboardState from './LeaderboardState';
import FinishedState from './FinishedState';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import GameHeader from './GameHeader';
import ProgressBar from './ProgressBar';

const LiveGameRenderer = () => {
  const {
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
    leaderboard,
    myRank,
    myPoints,
    submitAnswer,
    startGame,
    isGameHost
  } = useLiveGameState();

  useEffect(() => {
    // Log para debug
    console.log("Game state:", gameState);
    console.log("Current question:", currentQuestionData);
    console.log("Leaderboard:", leaderboard);
  }, [gameState, currentQuestionData, leaderboard]);
  
  if (loading) {
    return <LoadingState />;
  }
  
  if (error || !gameState || questions.length === 0) {
    return <ErrorState errorMessage={error || "No hay datos de juego disponibles"} />;
  }
  
  // Calcular tiempo restante (para futuras implementaciones)
  const timeRemaining = 20; // Esto se implementará más adelante
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <GameHeader 
        quizTitle={gameDetails?.title || "Partida en vivo"} 
        playersCount={leaderboard.length} 
        myPoints={myPoints} 
        isDemoGame={false} 
      />
      
      <div className="p-4 md:p-6">
        {gameState.status !== 'waiting' && gameState.status !== 'finished' && (
          <ProgressBar 
            currentQuestion={gameState.current_question} 
            totalQuestions={questions.length} 
            myPoints={myPoints} 
          />
        )}
        
        <AnimatePresence mode="wait">
          {gameState.status === 'waiting' && (
            <WaitingState 
              countdown={gameState.countdown || 5} 
              onStartGame={isGameHost ? startGame : undefined} 
            />
          )}
          
          {gameState.status === 'question' && currentQuestionData && (
            <QuestionState 
              currentQuestionData={currentQuestionData}
              timeRemaining={timeRemaining}
              myRank={myRank}
              selectedOption={selectedOption}
              handleSelectOption={submitAnswer}
            />
          )}
          
          {gameState.status === 'result' && currentQuestionData && (
            <ResultState 
              currentQuestionData={currentQuestionData}
              selectedOption={selectedOption}
              lastPoints={lastPoints}
            />
          )}
          
          {gameState.status === 'leaderboard' && (
            <LeaderboardState ranking={leaderboard} />
          )}
          
          {gameState.status === 'finished' && (
            <FinishedState 
              gameId={gameId || ''}
              ranking={leaderboard}
              myPoints={myPoints}
              myRank={myRank}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LiveGameRenderer;
