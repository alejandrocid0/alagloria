
import { motion, AnimatePresence } from 'framer-motion';
import { QuizQuestion } from '@/types/quiz';
import { Player } from '@/types/game';
import WaitingState from '../WaitingState';
import QuestionState from '../QuestionState';
import ResultState from '../ResultState';
import LeaderboardState from '../LeaderboardState';
import FinishedState from '../FinishedState';
import ProgressBar from '../ProgressBar';

interface GameContentProps {
  gameId: string | undefined;
  gameState: any;
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
  gameInfo: {
    title: string;
    scheduledTime: string;
    prizePool?: number;
  };
}

const GameContent = ({
  gameId,
  gameState,
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
  gameInfo
}: GameContentProps) => {
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

export default GameContent;
