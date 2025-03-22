
// Define the structure for answer results
export interface AnswerResult {
  is_correct: boolean;
  points: number;
  correctOption: string;
}

export interface Player {
  id: string;
  name: string;
  points: number; // changed from total_points to match game.ts
  rank: number;
  avatar?: string;
  lastAnswer: 'correct' | 'incorrect' | null; // changed from last_answer
}

export interface LiveGameState {
  id: string;
  status: "waiting" | "question" | "result" | "leaderboard" | "finished";
  current_question: number;
  countdown: number;
  started_at: string;
  updated_at: string;
}
