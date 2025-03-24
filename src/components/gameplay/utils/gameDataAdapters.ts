
import { Player } from '@/types/game';
import { QuizQuestion } from '@/types/quiz';

// Helper function to adapt Question to QuizQuestion format
export const adaptQuestionToQuizFormat = (question: any): QuizQuestion => {
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

// Transform leaderboard data to standard format
export const adaptLeaderboardData = (leaderboardData: any[]): Player[] => {
  if (!leaderboardData || leaderboardData.length === 0) return [];
  
  return leaderboardData.map(player => ({
    id: player.id,
    name: player.name,
    points: player.points,
    rank: player.rank,
    avatar: player.avatar,
    lastAnswer: player.lastAnswer
  }));
};
