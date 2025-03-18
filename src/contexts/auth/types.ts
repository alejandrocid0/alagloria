
import { Session, User } from '@supabase/supabase-js';

export type Profile = {
  id: string;
  name: string;
  email: string;
  is_admin?: boolean;
  created_at?: string;
  [key: string]: any;
};

export type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
  currentUser: User | null;
};
