
import { motion, AnimatePresence } from 'framer-motion';
import { QuizQuestion } from '@/types/quiz';
import { Player } from '@/types/game';
import WaitingState from './WaitingState';
import QuestionState from './QuestionState';
import ResultState from './ResultState';
import LeaderboardState from './LeaderboardState';
import FinishedState from './FinishedState';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import WaitingRoom from './WaitingRoom';
import ProgressBar from './ProgressBar';

interface GameStateRendererProps {
  gameId: string | undefined;
  gameState: any;
  isLoading: boolean;
  error: string | null;
  gameInfo: {
    title: string;
    scheduledTime: string;
    prizePool: number;
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
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (error || !gameState) {
    return <ErrorState errorMessage={error || "No hay datos de juego disponibles"} />;
  }
  
  // Renderizar la sala de espera si el juego aún no ha comenzado y estamos en momento previo
  // Esta es una nueva condición que verifica si la partida programada aún no ha comenzado
  const currentTime = new Date();
  const scheduledTime = gameInfo.scheduledTime ? new Date(gameInfo.scheduledTime) : null;
  const isBeforeGameStart = scheduledTime && currentTime < scheduledTime;

  if (isBeforeGameStart) {
    const timeUntilStart = Math.max(0, Math.floor((scheduledTime.getTime() - currentTime.getTime()) / 1000));
    
    return (
      <WaitingRoom 
        gameTitle={gameInfo.title} 
        scheduledTime={gameInfo.scheduledTime}
        playersOnline={leaderboard || []}
        prizePool={gameInfo.prizePool}
        timeUntilStart={timeUntilStart}
      />
    );
  }

  return (
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
            gameId={gameId}
          />
        )}
        
        {gameState.status === 'question' && adaptedCurrentQuestion && (
          <QuestionState 
            currentQuestionData={adaptedCurrentQuestion}
            timeRemaining={gameState.countdown || 20}
            myRank={myRank}
            selectedOption={selectedOption}
            handleSelectOption={handleSelectOption}
          />
        )}
        
        {gameState.status === 'result' && adaptedCurrentQuestion && (
          <ResultState 
            currentQuestionData={adaptedCurrentQuestion}
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
            ranking={leaderboard.map(player => ({
              id: player.id,
              name: player.name, 
              points: player.points,
              rank: player.rank, 
              avatar: player.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=5D3891&color=fff`,
              lastAnswer: player.lastAnswer
            }))}
            myPoints={myPoints}
            myRank={myRank}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameStateRenderer;
