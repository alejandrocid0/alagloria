
export interface LiveGameState {
  id: string;
  status: 'waiting' | 'question' | 'result' | 'leaderboard' | 'finished';
  current_question: number;
  countdown?: number;
  started_at?: string;
  updated_at?: string;
}

export interface Player {
  user_id: string;
  name: string;
  total_points: number;
  avatar?: string;
  rank?: number;
  lastAnswer?: 'correct' | 'incorrect' | null;
}

export interface AnswerResult {
  is_correct: boolean;
  points: number;
  correctOption: string;
}
