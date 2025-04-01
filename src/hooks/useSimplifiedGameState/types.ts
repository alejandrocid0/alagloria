
import { LiveGameState, Player } from '@/types/liveGame';

export interface SimplifiedGameStateReturn {
  gameState: LiveGameState | null;
  questions: any[];
  leaderboard: Player[];
  currentQuestion: any | null;
  myRank: number;
  myPoints: number;
  lastPoints: number;
  selectedOption: string | null;
  lastAnswerResult: any | null;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  reconnectAttempts: number;
  setSelectedOption: (option: string | null) => void;
  handleSelectOption: (optionId: string) => void;
  submitAnswer: (questionIdx: number, optionId: string, answerTimeMs: number) => Promise<any | null>;
  refreshGameState: () => Promise<void>;
  refreshLeaderboard: () => Promise<any[]>;
  saveGameResults: (stats: any) => Promise<boolean>;
}

export interface GameStats {
  rank?: number;
  correctAnswers?: number;
  totalAnswers?: number;
  totalQuestions?: number;
}
