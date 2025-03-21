// Define the structure for answer results
export interface AnswerResult {
  is_correct: boolean;
  points: number;
  correctOption: string;
}

export interface Player {
  id: string;
  name: string;
  total_points: number;
  last_answer: string;
}

export interface LiveGameState {
  id: string;
  status: "waiting" | "question" | "result" | "leaderboard" | "finished";
  current_question: number;
  countdown: number;
  started_at: string;
  updated_at: string;
}
