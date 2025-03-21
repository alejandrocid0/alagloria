import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Player, LiveGameState } from '@/types/liveGame';
import { QuizQuestion } from '@/types/quiz';
import { useParams } from 'react-router-dom';
import { fetchLiveGameState, subscribeToGameStateUpdates } from './gameStateUtils';
import { subscribeToLeaderboardUpdates, getGameLeaderboard } from './leaderboardUtils';
import { submitAnswer } from './playerUtils';
import { toast } from '@/hooks/use-toast';
import { getQuizById } from '@/services/quiz';

interface UseLiveGameStateResult {
  gameState: LiveGameState | null;
  questions: QuizQuestion[];
  leaderboard: Player[];
  currentQuestion: QuizQuestion | undefined;
  submitAnswer: (selectedOption: string, answerTimeMs: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useLiveGameState = (): UseLiveGameStateResult => {
  const { gameId } = useParams<{ gameId: string }>();
  const [gameState, setGameState] = useState<LiveGameState | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) {
      setError('Game ID is required');
      setIsLoading(false);
      return;
    }

    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch game state
        const gameStateData = await fetchLiveGameState(gameId);
        setGameState(gameStateData);

        // Fetch questions
        const quiz = getQuizById(gameId);
        if (quiz) {
          setQuestions(quiz.questions);
        } else {
          setError('Quiz not found');
        }

        // Fetch leaderboard
        const leaderboardData = await getGameLeaderboard(gameId);
        setLeaderboard(leaderboardData.map((player, index) => ({
          id: index + 1,
          name: player.name,
          points: player.total_points,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=random&color=fff`
        })));
      } catch (err: any) {
        setError(err.message || 'Failed to load initial data');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();

    // Set up subscriptions
    const gameStateSubscription = subscribeToGameStateUpdates(gameId, (payload: any) => {
      if (payload.new) {
        // Convert the status string to the required type
        const status = payload.new.status as "waiting" | "question" | "result" | "leaderboard" | "finished";

        setGameState({
          id: payload.new.id,
          status: status,
          current_question: payload.new.current_question,
          countdown: payload.new.countdown,
          started_at: payload.new.started_at,
          updated_at: payload.new.updated_at
        });
      }
    });

    const leaderboardSubscription = subscribeToLeaderboardUpdates(gameId, (payload: any) => {
      setLeaderboard(payload.new.map((player: any, index: number) => ({
        id: index + 1,
        name: player.name,
        points: player.total_points,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=random&color=fff`
      })));
    });

    return () => {
      supabase.removeChannel(gameStateSubscription);
      supabase.removeChannel(leaderboardSubscription);
    };
  }, [gameId]);

  const submitAnswerHandler = async (selectedOption: string, answerTimeMs: number) => {
    if (!gameId || !gameState) {
      toast({
        title: "Error",
        description: "Game ID or Game State is missing",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!gameState.current_question) {
        console.warn("No current question available.");
        return;
      }

      const userId = supabase.auth.currentUser?.id;
      if (!userId) {
        console.error("User not authenticated.");
        return;
      }

      const answerResult = await submitAnswer(
        gameId,
        userId,
        gameState.current_question,
        selectedOption,
        answerTimeMs
      );

      if (answerResult.is_correct) {
        toast({
          title: "Correct!",
          description: `You earned ${answerResult.points} points.`,
        });
      } else {
        toast({
          title: "Incorrect",
          description: `The correct answer was ${answerResult.correctOption}.`,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Error submitting answer:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to submit answer",
        variant: "destructive",
      });
    }
  };

  const currentQuestion = gameState ? questions[gameState.current_question] : undefined;

  return {
    gameState,
    questions,
    leaderboard,
    currentQuestion,
    submitAnswer: submitAnswerHandler,
    isLoading,
    error,
  };
};
