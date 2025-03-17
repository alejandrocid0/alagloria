
export interface GameResult {
  id: string;
  gameId: string;
  gameTitle: string;
  date: Date;
  position: number;
  entryFee: number;
  correctAnswers: number;
  totalAnswers: number;
}

export interface UserStats {
  gamesPlayed: GameResult[];
  totalSpent: number;
  correctAnswers: number;
  totalAnswers: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  stats: UserStats;
  isAdmin: boolean;
}
