
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
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

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
  
  // Comprobar si es el momento de la partida
  const currentTime = new Date();
  const scheduledTime = gameInfo.scheduledTime ? new Date(gameInfo.scheduledTime) : null;
  const isBeforeGameStart = scheduledTime && currentTime < scheduledTime;
  
  // Calcular el tiempo hasta el inicio (para determinar si estamos en los 5 minutos previos)
  const timeUntilStartInMinutes = scheduledTime 
    ? Math.max(0, Math.floor((scheduledTime.getTime() - currentTime.getTime()) / (1000 * 60))) 
    : 0;
  
  // Calcular segundos exactos para más precisión en la sala de espera dinámica
  const timeUntilStartInSeconds = scheduledTime 
    ? Math.max(0, Math.floor((scheduledTime.getTime() - currentTime.getTime()) / 1000)) 
    : 0;
  
  // Determinar si estamos en los 5 minutos previos al inicio (sala de espera inmediata)
  const isWithinFiveMinutes = timeUntilStartInMinutes <= 5;

  // Si estamos más de 5 minutos antes del inicio de la partida
  if (isBeforeGameStart && !isWithinFiveMinutes) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-medium text-gloria-purple mb-4">
          La partida aún no ha comenzado
        </h2>
        <p className="text-gray-600 mb-4">
          Esta partida está programada para comenzar en más de 5 minutos. 
          Por favor, ve a la sala de espera hasta que sea el momento.
        </p>
        <a 
          href={`/game/${gameId}/waiting`} 
          className="inline-block bg-gloria-purple text-white px-4 py-2 rounded hover:bg-gloria-purple/90 transition-colors"
        >
          Ir a la sala de espera
        </a>
      </div>
    );
  }

  // Si estamos dentro de los 5 minutos previos, mostrar la sala de espera inmediata (Kahoot-style)
  if (isBeforeGameStart && isWithinFiveMinutes) {
    return (
      <div className="p-4 md:p-6 text-center">
        <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6 inline-flex items-center">
          <CheckCircle2 className="text-green-500 mr-2 h-5 w-5" />
          <p className="text-green-700 font-medium">
            Estás en la sala de espera dinámica
          </p>
        </div>
        
        <WaitingRoom 
          gameTitle={gameInfo.title} 
          scheduledTime={gameInfo.scheduledTime}
          playersOnline={leaderboard || []}
          timeUntilStart={timeUntilStartInSeconds}
          isGameActive={gameState.status !== 'waiting'}
        />
        
        {gameState.status === 'waiting' && (
          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-3">
              La partida comenzará automáticamente al llegar la hora programada
            </p>
            <Button 
              disabled 
              className="opacity-70"
              variant="outline"
            >
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Esperando inicio...
            </Button>
          </div>
        )}
      </div>
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
