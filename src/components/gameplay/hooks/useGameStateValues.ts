
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { adaptLeaderboardData } from '../utils/gameDataAdapters';

export const useGameStateValues = (
  gameState: any,
  currentQuestion: any,
  leaderboardData: any[],
  lastAnswerResult: any,
  submitAnswer: (optionId: string, answerTimeMs: number) => void
) => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [myRank, setMyRank] = useState<number>(0);
  const [myPoints, setMyPoints] = useState<number>(0);
  const [lastPoints, setLastPoints] = useState<number>(0);

  useEffect(() => {
    // Log for debug
    console.log("Game state:", gameState);
    console.log("Current question:", currentQuestion);
    console.log("Leaderboard:", leaderboardData);
    console.log("Last answer result:", lastAnswerResult);

    // Update leaderboard data
    if (leaderboardData && leaderboardData.length > 0) {
      const adaptedLeaderboard = adaptLeaderboardData(leaderboardData);
      
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

  // Handler for selecting an option
  const handleSelectOption = (optionId: string) => {
    if (selectedOption !== null) return; // Prevent multiple selections
    
    setSelectedOption(optionId);
    // Sample answer time in milliseconds (could be calculated based on actual timing)
    const answerTimeMs = 5000;
    submitAnswer(optionId, answerTimeMs);
  };

  return {
    leaderboard,
    selectedOption,
    setSelectedOption,
    myRank,
    myPoints,
    lastPoints,
    handleSelectOption
  };
};
