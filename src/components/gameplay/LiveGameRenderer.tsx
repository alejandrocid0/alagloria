
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
import { useParams } from 'react-router-dom';
import { Player as GamePlayer } from '@/types/game';
import { Player as LiveGamePlayer } from '@/types/liveGame';

const LiveGameRenderer = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [leaderboard, setLeaderboard] = useState<LiveGamePlayer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [myRank, setMyRank] = useState<number>(0);
  const [myPoints, setMyPoints] = useState<number>(0);
  const [lastPoints, setLastPoints] = useState<number>(0);
  
  const {
    gameState,
    questions,
    leaderboard: leaderboardData,
    currentQuestion,
    submitAnswer,
    isLoading,
    error
  } = useLiveGameState();

  // Sample game details object
  const gameDetails = {
    title: "Live Game",
    description: "Game in progress"
  };
  
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

    // Update leaderboard data
    if (leaderboardData && leaderboardData.length > 0) {
      setLeaderboard(leaderboardData);
      
      // Calculate my rank and points based on user ID
      // This would be implemented in a real app
      setMyRank(1);
      setMyPoints(leaderboardData[0]?.total_points || 0);
    }
  }, [gameState, currentQuestion, leaderboardData]);

  if (isLoading) {
    return <LoadingState />;
  }
  
  if (error || !gameState || questions.length === 0) {
    return <ErrorState errorMessage={error || "No hay datos de juego disponibles"} />;
  }

  // Handler for selecting an option
  const handleSelectOption = (optionId: string) => {
    setSelectedOption(optionId);
    // Sample answer time in milliseconds
    const answerTimeMs = 1000;
    submitAnswer(optionId, answerTimeMs);
  };
  
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
          
          {gameState.status === 'question' && currentQuestion && (
            <QuestionState 
              currentQuestionData={currentQuestion}
              timeRemaining={20}
              myRank={myRank}
              selectedOption={selectedOption || ""}
              handleSelectOption={handleSelectOption}
            />
          )}
          
          {gameState.status === 'result' && currentQuestion && (
            <ResultState 
              currentQuestionData={currentQuestion}
              selectedOption={selectedOption || ""}
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
                points: player.total_points,
                rank: 0, // This would be calculated based on position
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=5D3891&color=fff`,
                lastAnswer: player.last_answer === 'correct' ? 'correct' : 'incorrect'
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
