
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface GameResult {
  id: string;
  gameId: string;
  gameTitle: string;
  date: Date;
  position: number;
  entryFee: number;
  correctAnswers: number;
  totalAnswers: number;
}

interface UserStats {
  gamesPlayed: GameResult[];
  totalSpent: number;
  correctAnswers: number;
  totalAnswers: number;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  stats: UserStats;
}

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  session: Session | null;
  logout: () => Promise<void>;
  getUserProfile: () => UserProfile | null;
  updateUserStats: (gameResult: GameResult) => void;
  signUp: (email: string, password: string, name: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setIsAuthenticated(!!session);
        
        if (session) {
          await fetchUserProfile(session.user.id);
        } else {
          setCurrentUser(null);
        }
        
        setLoading(false);
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthenticated(!!session);
      
      if (session) {
        fetchUserProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile from Supabase
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      // Get stats from localStorage for now
      // In a real implementation, you would store stats in Supabase too
      const localUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const stats = localUser.stats || {
        gamesPlayed: [],
        totalSpent: 0,
        correctAnswers: 0,
        totalAnswers: 0
      };

      setCurrentUser({
        id: data.id,
        name: data.name,
        email: data.email,
        stats
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });

      if (error) {
        return { user: null, error };
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Error during sign up:', error);
      return { user: null, error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { user: null, error };
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Error during sign in:', error);
      return { user: null, error: error as AuthError };
    }
  };

  const updateUserStats = (gameResult: GameResult) => {
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      stats: {
        gamesPlayed: [...currentUser.stats.gamesPlayed, gameResult],
        totalSpent: currentUser.stats.totalSpent + gameResult.entryFee,
        correctAnswers: currentUser.stats.correctAnswers + gameResult.correctAnswers,
        totalAnswers: currentUser.stats.totalAnswers + gameResult.totalAnswers
      }
    };

    setCurrentUser(updatedUser);

    // For now, still updating localStorage for backward compatibility
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('currentUser');
      setCurrentUser(null);
      setIsAuthenticated(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión correctamente",
        variant: "destructive"
      });
    }
  };

  const getUserProfile = (): UserProfile | null => {
    return currentUser;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        session,
        logout,
        getUserProfile,
        updateUserStats,
        signUp,
        signIn,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
