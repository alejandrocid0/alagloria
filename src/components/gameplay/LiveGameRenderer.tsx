import React, { useEffect, useState } from 'react';
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

// Import Player type from the correct location
import { LiveGameState, Player as LiveGamePlayer } from '@/types/liveGame';

// Define a separate Player type for the component that matches what's expected
interface Player {
  id: number;
  name: string;
  points: number;
  avatar: string;
}

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
    leaderboardData,
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
    console.log("Leaderboard:", leaderboardData);
  }, [gameState, currentQuestionData, leaderboardData]);
  
  if (loading) {
    return <LoadingState />;
  }
  
  if (error || !gameState || questions.length === 0) {
    return <ErrorState errorMessage={error || "No hay datos de juego disponibles"} />;
  }
  
  // Calcular tiempo restante (para futuras implementaciones)
  const timeRemaining = 20; // Esto se implementará más adelante

  useEffect(() => {
    if (gameState) {
      const transformedLeaderboard = leaderboardData.map((player, index) => ({
        id: index + 1, // Ensure id is a number
        name: player.name,
        points: player.total_points,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=random&color=fff`
      })) as Player[];

      setLeaderboard(transformedLeaderboard);
    }
  }, [gameState, leaderboardData]);

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
