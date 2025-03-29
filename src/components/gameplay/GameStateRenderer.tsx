
import { QuizQuestion } from '@/types/quiz';
import { Player } from '@/types/game';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import GameContent from './states/GameContent';
import EarlyWaitingState from './states/EarlyWaitingState';
import DynamicWaitingState from './states/DynamicWaitingState';
import { calculateTimeValues } from './utils/timeCalculations';

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
  startGame,
  clientTimeOffset
}: GameStateRendererProps) => {
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (error || !gameState) {
    return <ErrorState errorMessage={error || "No hay datos de juego disponibles"} />;
  }
  
  const {
    isBeforeGameStart,
    timeUntilStartInMinutes,
    timeUntilStartInSeconds,
    isWithinFiveMinutes
  } = calculateTimeValues(gameInfo.scheduledTime);

  if (isBeforeGameStart && !isWithinFiveMinutes) {
    return <EarlyWaitingState gameId={gameId} />;
  }

  if (isBeforeGameStart && isWithinFiveMinutes) {
    return (
      <DynamicWaitingState
        gameTitle={gameInfo.title}
        scheduledTime={gameInfo.scheduledTime}
        leaderboard={leaderboard}
        timeUntilStartInSeconds={timeUntilStartInSeconds}
        gameStatus={gameState.status}
      />
    );
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
