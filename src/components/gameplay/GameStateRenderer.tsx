
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
  clientTimeOffset?: number; // Add the missing prop
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
  
  // Comprobar si es el momento de la partida
  const currentTime = new Date();
  const scheduledTime = gameInfo.scheduledTime ? new Date(gameInfo.scheduledTime) : null;
  const isBeforeGameStart = scheduledTime && currentTime < scheduledTime;
  
  // Calcular el tiempo hasta el inicio (para determinar si estamos en los 5 minutos previos)
  const timeUntilStartInMinutes = scheduledTime 
    ? Math.max(0, Math.floor((scheduledTime.getTime() - currentTime.getTime()) / (1000 * 60))) 
    : 0;
  
  // Determinar si estamos en los 5 minutos previos al inicio (sala de espera inmediata)
  const isWithinFiveMinutes = timeUntilStartInMinutes <= 5;

  // Si estamos más de 5 minutos antes del inicio de la partida
  if (isBeforeGameStart && !isWithinFiveMinutes) {
    // Redirigir a la sala de espera previa
    window.location.href = `/game/${gameId}/waiting`;
    return <LoadingState />;
  }

  // Si estamos dentro de los 5 minutos previos, mostrar la sala de espera inmediata (Kahoot-style)
  if (isBeforeGameStart && isWithinFiveMinutes) {
    const timeUntilStart = Math.max(0, Math.floor((scheduledTime.getTime() - currentTime.getTime()) / 1000));
    
    return (
      <WaitingRoom 
        gameTitle={gameInfo.title} 
        scheduledTime={gameInfo.scheduledTime}
        playersOnline={leaderboard || []}
        timeUntilStart={timeUntilStart}
      />
    );
  }

  // Si ya es la hora de la partida o está en curso, mostrar la interfaz de juego
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
            questions={questions}
            gameTitle={gameInfo.title}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameStateRenderer;
