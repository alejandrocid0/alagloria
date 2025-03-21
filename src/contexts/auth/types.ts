
import { Session, User } from '@supabase/supabase-js';

// Re-export the User type
export type { User };

export type Profile = {
  id: string;
  name: string;
  email: string;
  is_admin?: boolean;
  created_at?: string;
  [key: string]: any;
};

export type Suggestion = {
  id: string;
  email: string;
  message: string;
  created_at: string;
  status: 'pending' | 'reviewed' | 'implemented';
};

export type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  sendSuggestion: (message: string) => Promise<{ error: any }>;
  loading: boolean;
  isAuthenticated: boolean;
  currentUser: User | null;
};
