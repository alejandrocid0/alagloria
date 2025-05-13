
import { useState, useEffect } from 'react';
import { getQuizById } from '@/services/quiz';
import { Question } from '@/types/liveGame';

interface GameInfo {
  title: string;
  gameId: string;
}

export const useGameInitialization = (gameId: string | undefined) => {
  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
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
      const quizData = await getQuizById(gameId);
      if (quizData && quizData.questions) {
        setGameQuestions(quizData.questions);
        setGameInfo({ title: quizData.title, gameId });
      } else {
        throw new Error('Quiz data not found');
      }
    } catch (error: any) {
      console.error('Error initializing game:', error);
      setError(error.message || 'Failed to initialize game');
    } finally {
      setIsLoading(false);
    }
  };

  return { gameQuestions, gameInfo, isLoading, error };
};
