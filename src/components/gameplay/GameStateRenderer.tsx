
import { QuizQuestion } from '@/types/quiz';
import { Player } from '@/types/game';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import GameContent from './states/GameContent';
import { useState, useEffect } from 'react';

interface GameStateRendererProps {
  gameId: string | undefined;
  gameState: any;
  isLoading: boolean;
  error: string | null;
  gameInfo: {
    title: string;
    scheduledTime: string;
    prizePool?: number;
  };
  questions: any[];
  currentQuestion: any;
  adaptedCurrentQuestion: QuizQuestion | null;
  leaderboard: Player[];
  myPoints: number;
  myRank: number;
  lastPoints: number;
  selectedOption: string | null;
  setSelectedOption: (option: string | null) => void;
  handleSelectOption: (optionId: string) => void;
  isGameHost: boolean;
  startGame: () => Promise<void>;
  clientTimeOffset?: number;
}

const GameStateRenderer = ({
  gameId,
  gameState,
  isLoading,
  error,
  gameInfo,
  questions,
  currentQuestion,
  adaptedCurrentQuestion,
  leaderboard,
  myPoints,
  myRank,
  lastPoints,
  selectedOption,
  setSelectedOption,
  handleSelectOption,
  isGameHost,
  startGame
}: GameStateRendererProps) => {
  const [shouldShowWaiting, setShouldShowWaiting] = useState(false);
  
  // Simple effect to check if scheduled time is in the future
  useEffect(() => {
    if (gameInfo.scheduledTime) {
      const gameTime = new Date(gameInfo.scheduledTime).getTime();
      const currentTime = new Date().getTime();
      
      // If game time is in the future
      if (gameTime > currentTime) {
        setShouldShowWaiting(true);
      } else {
        setShouldShowWaiting(false);
      }
    }
  }, [gameInfo.scheduledTime]);
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (error || !gameState) {
    return <ErrorState errorMessage={error || "No hay datos de juego disponibles"} />;
  }

  return (
    <GameContent
      gameId={gameId}
      gameState={gameState}
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
      gameInfo={gameInfo}
    />
  );
};

export default GameStateRenderer;
