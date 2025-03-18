
import React, { createContext } from 'react';
import { Session } from '@supabase/supabase-js';
import { UserProfile } from './types';

export interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  session: Session | null;
  loading: boolean;
  authChecked: boolean;
  logout: () => Promise<void>;
  getUserProfile: () => UserProfile | null;
  updateUserStats: (gameResult: any) => void;
  signUp: (email: string, password: string, name: string) => Promise<{ user: any | null; error: any | null }>;
  signIn: (email: string, password: string) => Promise<{ user: any | null; error: any | null }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
