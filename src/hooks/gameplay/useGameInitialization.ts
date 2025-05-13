import { useState, useEffect } from 'react';
import { quizService } from '@/services/quiz';
import { LiveQuestion } from '@/types/liveGame';

interface GameInfo {
  title: string;
  gameId: string;
}

export const useGameInitialization = (gameId: string | undefined) => {
  const [gameQuestions, setGameQuestions] = useState<LiveQuestion[]>([]);
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) {
      setError('Game ID is required');
      setIsLoading(false);
      return;
    }

    initializeGame();
  }, [gameId]);

  const initializeGame = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const quizData = await quizService.getQuizById(gameId);
      setGameQuestions(quizData.questions);
      setGameInfo({ title: quizData.title, gameId });
    } catch (error: any) {
      console.error('Error initializing game:', error);
      setError(error.message || 'Failed to initialize game');
    } finally {
      setIsLoading(false);
    }
  };

  return { gameQuestions, gameInfo, isLoading, error };
};
