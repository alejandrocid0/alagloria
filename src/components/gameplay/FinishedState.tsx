
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import HeaderSection from './finished/HeaderSection';
import PlayersRankingList from './finished/PlayersRankingList';
import WinnersPodium from './finished/WinnersPodium';
import UserStatsCards from './finished/UserStatsCards';
import ActionButtons from './finished/ActionButtons';
import FeedbackDialog from './finished/FeedbackDialog';
import { useConfettiEffect } from './finished/useConfettiEffect';
import { useGameResultSaver } from './finished/useGameResultSaver';
import { gameNotifications } from '@/components/ui/notification-toast';
import { useState } from 'react';

interface FinishedStateProps {
  gameId: string;
  ranking: {
    id: string;
    name: string;
    points: number;
    rank: number;
    avatar?: string;
    lastAnswer?: string | null;
  }[];
  myPoints: number;
  myRank: number;
  questions: any[];
  gameTitle: string;
}

const FinishedState = ({ gameId, ranking, myPoints, myRank, questions, gameTitle }: FinishedStateProps) => {
  const navigate = useNavigate();
  const confettiRef = useRef<HTMLDivElement>(null);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  
  // Call useConfettiEffect and pass in the top 3 condition
  useConfettiEffect(confettiRef, myRank <= 3);
  
  // Count correct answers
  const myPlayer = ranking.find(player => player.rank === myRank);
  const correctAnswers = questions.filter((_, index) => {
    // We don't have direct access to correctness of each answer,
    // so we approximate based on points (if player has points for this question)
    // This is an approximation, a more accurate method would require storing correct answers
    return myPoints > 0;
  }).length;
  
  // Game result saving logic
  const { saveResult, isSaved, isLoading } = useGameResultSaver({
    gameId,
    gameTitle,
    rank: myRank,
    totalPoints: myPoints,
    totalQuestions: questions.length,
    correctAnswers
  });
  
  // Navigate to results page after a delay
  useEffect(() => {
    // Only auto-navigate if results have been saved
    if (isSaved) {
      // Set a timeout to navigate to the results page after 10 seconds
      const timeoutId = setTimeout(() => {
        navigate(`/results/${gameId}`);
      }, 15000); // 15 seconds delay
      
      return () => clearTimeout(timeoutId);
    }
  }, [isSaved, gameId, navigate]);
  
  // Trigger confetti effect on initial render if user is in top 3
  useEffect(() => {
    // Show game completed notification with rank
    gameNotifications.gameCompleted(myRank);
    
    // Save results if not already saved
    if (!isSaved && !isLoading) {
      saveResult();
    }
  }, [myRank, isSaved, isLoading, saveResult]);
  
  // Calculate top three players
  const topThreePlayers = [...ranking]
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 3);
  
  return (
    <motion.div 
      ref={confettiRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4"
    >
      <HeaderSection 
        title={gameTitle} 
        myRank={myRank} 
        resultsSaved={isSaved}
      />
      
      <WinnersPodium topPlayers={topThreePlayers} />
      
      <UserStatsCards 
        rank={myRank}
        points={myPoints}
        playTime="3:24" // Placeholder time value
      />
      
      <PlayersRankingList 
        players={ranking} 
        startPosition={4}
      />
      
      <ActionButtons 
        onExit={() => navigate('/games')}
      />
      
      <FeedbackDialog 
        isOpen={showFeedbackDialog}
        onOpenChange={setShowFeedbackDialog}
        gameTitle={gameTitle}
      />
    </motion.div>
  );
};

export default FinishedState;
