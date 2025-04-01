
import { QuizQuestion } from '@/types/quiz';
import { Player } from '@/types/game';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import GameContent from './states/GameContent';
import { useState, useEffect } from 'react';
import { gameNotifications } from '@/components/ui/notification-toast';

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
  const [retryCount, setRetryCount] = useState(0);
  const [hasNotifiedMissingQuestion, setHasNotifiedMissingQuestion] = useState(false);
  
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
  
  // Handler for retrying on error
  const handleRetry = () => {
    console.log(`[GameStateRenderer] Retry attempt ${retryCount + 1}`);
    setRetryCount(prev => prev + 1);
    window.location.reload();
  };
  
  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }
  
  // Error state with retry button
  if (error || !gameState) {
    // Log detailed information to help debug
    console.error('[GameStateRenderer] Error rendering game state:', { 
      error, 
      gameState, 
      gameId,
      questionsLoaded: questions.length > 0,
      currentQuestionLoaded: !!currentQuestion
    });
    
    return (
      <ErrorState 
        errorMessage={error || "No hay datos de juego disponibles"} 
        onRetry={handleRetry}
      />
    );
  }
  
  // Warn if critical data is missing - evitar notificaciones múltiples
  if (gameState.status === 'question' && !adaptedCurrentQuestion && !hasNotifiedMissingQuestion) {
    console.warn('[GameStateRenderer] Missing current question data in question state:', {
      gameState,
      currentQuestion,
      adaptedCurrentQuestion,
      questions
    });
    
    // Solo mostrar notificación una vez
    if (retryCount > 0) {
      gameNotifications.warning('Datos de preguntas incompletos. Intentando recuperar.');
      setHasNotifiedMissingQuestion(true);
    }
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
