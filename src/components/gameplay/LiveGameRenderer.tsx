
import React from 'react';
import { toast } from '@/hooks/use-toast';
import useLiveGameState from './hooks/useLiveGameState';
import GameContainer from './GameContainer';

const LiveGameRenderer = () => {
  const {
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
  } = useLiveGameState();
  
  const handleManualRefresh = () => {
    toast({
      title: "Actualizando datos",
      description: "Recargando información de la partida"
    });
    
    refreshGameState();
  };
  
  return (
    <>
      <GameContainer 
        gameState={gameState}
        questions={questions}
        currentQuestion={currentQuestion}
        adaptedCurrentQuestion={adaptedCurrentQuestion}
        leaderboardData={leaderboardData}
        lastAnswerResult={lastAnswerResult}
        isLoading={isLoading}
        error={error}
        isConnected={isConnected}
        reconnectAttempts={reconnectAttempts}
        submitAnswer={refreshGameState}
        gameId={gameId}
        myRank={myRank}
        myPoints={myPoints}
        lastPoints={lastPoints}
      />
    </>
  );
};

export default LiveGameRenderer;
