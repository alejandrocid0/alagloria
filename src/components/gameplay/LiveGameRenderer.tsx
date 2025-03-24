
import React from 'react';
import { useParams } from 'react-router-dom';
import { useLiveGameState } from '@/hooks/useLiveGameState';
import GameHeader from './GameHeader';
import GameStateRenderer from './GameStateRenderer';
import { useGameInfo } from './hooks/useGameInfo';
import { useGameStateValues } from './hooks/useGameStateValues';
import { adaptQuestionToQuizFormat } from './utils/gameDataAdapters';

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
    error
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
