
import { AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import useGamePlayState from '@/hooks/useGamePlayState';
import WaitingState from '@/components/gameplay/WaitingState';
import QuestionState from '@/components/gameplay/QuestionState';
import ResultState from '@/components/gameplay/ResultState';
import LeaderboardState from '@/components/gameplay/LeaderboardState';
import FinishedState from '@/components/gameplay/FinishedState';
import LoadingState from '@/components/gameplay/LoadingState';
import ErrorState from '@/components/gameplay/ErrorState';
import GameHeader from '@/components/gameplay/GameHeader';
import ProgressBar from '@/components/gameplay/ProgressBar';

const GamePlay = () => {
  const {
    gameId,
    quizTitle,
    loading,
    error,
    currentState,
    countdown,
    currentQuestion,
    selectedOption,
    timeRemaining,
    myPoints,
    ranking,
    myRank,
    lastPoints,
    gameQuestions,
    startGame,
    handleSelectOption
  } = useGamePlayState();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <LoadingState />
          </div>
        </div>
      </div>
    );
  }
  
  if (error || gameQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <ErrorState errorMessage={error} />
          </div>
        </div>
      </div>
    );
  }
  
  const currentQuestionData = gameQuestions[currentQuestion];
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <GameHeader 
              quizTitle={quizTitle} 
              playersCount={ranking.length} 
              myPoints={myPoints} 
              isDemoGame={gameId === 'demo-123'} 
            />
            
            <div className="p-6">
              {currentState !== 'waiting' && currentState !== 'finished' && (
                <ProgressBar 
                  currentQuestion={currentQuestion} 
                  totalQuestions={gameQuestions.length} 
                  myPoints={myPoints} 
                />
              )}
              
              <AnimatePresence mode="wait">
                {currentState === 'waiting' && (
                  <WaitingState 
                    countdown={countdown} 
                    onStartGame={startGame} 
                  />
                )}
                
                {currentState === 'question' && currentQuestionData && (
                  <QuestionState 
                    currentQuestionData={currentQuestionData}
                    timeRemaining={timeRemaining}
                    myRank={myRank}
                    selectedOption={selectedOption}
                    handleSelectOption={handleSelectOption}
                  />
                )}
                
                {currentState === 'result' && currentQuestionData && (
                  <ResultState 
                    currentQuestionData={currentQuestionData}
                    selectedOption={selectedOption}
                    lastPoints={lastPoints}
                  />
                )}
                
                {currentState === 'leaderboard' && (
                  <LeaderboardState 
                    ranking={ranking} 
                  />
                )}
                
                {currentState === 'finished' && (
                  <FinishedState 
                    gameId={gameId}
                    ranking={ranking}
                    myPoints={myPoints}
                    myRank={myRank}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePlay;
