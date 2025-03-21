
export interface Player {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  rank: number;
  lastAnswer: 'correct' | 'incorrect' | null;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
  timeLimit: number;
}
