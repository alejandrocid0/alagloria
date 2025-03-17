
import { Session, User, AuthError } from '@supabase/supabase-js';

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

export interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  session: Session | null;
  logout: () => Promise<void>;
  getUserProfile: () => UserProfile | null;
  updateUserStats: (gameResult: GameResult) => void;
  signUp: (email: string, password: string, name: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  loading: boolean;
}
