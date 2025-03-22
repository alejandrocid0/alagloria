
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
import WaitingRoom from './WaitingRoom';
import { useParams } from 'react-router-dom';
import { Player } from '@/types/game';
import { QuizQuestion } from '@/types/quiz';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Helper function to adapt Question to QuizQuestion format
const adaptQuestionToQuizFormat = (question: any): QuizQuestion => {
  return {
    id: question.id,
    question: question.text,
    correctOption: question.correctOption,
    position: 0, // Default position
    options: question.options.map((text: string, index: number) => ({
      id: String(index),
      text
    }))
  };
};

const LiveGameRenderer = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [myRank, setMyRank] = useState<number>(0);
  const [myPoints, setMyPoints] = useState<number>(0);
  const [lastPoints, setLastPoints] = useState<number>(0);
  const [gameInfo, setGameInfo] = useState<{
    title: string;
    scheduledTime: string;
    prizePool: number;
  }>({
    title: "Partida en vivo",
    scheduledTime: "",
    prizePool: 100
  });
  
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

  // Fetch game details
  useEffect(() => {
    const fetchGameDetails = async () => {
      if (!gameId) return;
      
      try {
        const { data, error } = await fetch(`/api/games/${gameId}`).then(res => res.json());
        
        if (error) throw new Error(error.message);
        
        if (data) {
          const formattedDate = format(
            new Date(data.date), 
            "EEEE d 'de' MMMM, HH:mm", 
            { locale: es }
          );
          
          setGameInfo({
            title: data.title || "Partida en vivo",
            scheduledTime: formattedDate,
            prizePool: data.prizePool || 100
          });
        }
      } catch (err) {
        console.error("Error fetching game details:", err);
        // Fallback to defaults, silently fail to not disrupt the experience
      }
    };
    
    fetchGameDetails();
  }, [gameId]);
  
  // Mock function for game host - would be implemented based on permissions
  const isGameHost = false;
  const startGame = async () => {
    console.log("Starting game...");
    // Implementation would go here
  };

  useEffect(() => {
    // Log for debug
    console.log("Game state:", gameState);
    console.log("Current question:", currentQuestion);
    console.log("Leaderboard:", leaderboardData);
    console.log("Last answer result:", lastAnswerResult);

    // Update leaderboard data
    if (leaderboardData && leaderboardData.length > 0) {
      const adaptedLeaderboard = leaderboardData.map(player => ({
        id: player.id,
        name: player.name,
        points: player.points,
        rank: player.rank,
        avatar: player.avatar,
        lastAnswer: player.lastAnswer
      }));
      
      setLeaderboard(adaptedLeaderboard);
      
      // Calculate my rank and points based on user ID
      // This would be implemented in a real app
      setMyRank(1);
      if (adaptedLeaderboard[0]) {
        setMyPoints(adaptedLeaderboard[0].points || 0);
      }
    }
    
    // Reset selected option when moving to a new question
    if (gameState?.status === 'question') {
      setSelectedOption(null);
    }
    
    // Set last points when we get an answer result
    if (lastAnswerResult) {
      setLastPoints(lastAnswerResult.points);
      
      // Show toast notification for points earned
      if (lastAnswerResult.isCorrect) {
        toast({
          title: "¡Respuesta correcta!",
          description: `Has ganado ${lastAnswerResult.points} puntos`,
          variant: "default",
        });
      } else {
        toast({
          title: "Respuesta incorrecta",
          description: "No has sumado puntos en esta pregunta",
          variant: "destructive",
        });
      }
    }
  }, [gameState, currentQuestion, leaderboardData, lastAnswerResult]);

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
        playersOnline={leaderboardData || []}
        prizePool={gameInfo.prizePool}
        timeUntilStart={timeUntilStart}
      />
    );
  }

  // Helper function to adapt the current question
  const adaptedCurrentQuestion = currentQuestion ? adaptQuestionToQuizFormat(currentQuestion) : null;

  // Handler for selecting an option
  const handleSelectOption = (optionId: string) => {
    if (selectedOption !== null) return; // Prevent multiple selections
    
    setSelectedOption(optionId);
    // Sample answer time in milliseconds (could be calculated based on actual timing)
    const answerTimeMs = 5000;
    submitAnswer(optionId, answerTimeMs);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <GameHeader 
        quizTitle={gameInfo.title} 
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
    </div>
  );
};

export default LiveGameRenderer;
