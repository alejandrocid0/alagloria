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
  isAdmin: boolean;
}

interface AuthContextType {
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log("Setting up auth state listener");
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        setSession(session);
        setIsAuthenticated(!!session);
        
        if (session) {
          await fetchUserProfile(session.user.id);
        } else {
          setCurrentUser(null);
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session?.user?.id);
      setSession(session);
      setIsAuthenticated(!!session);
      
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }

      // Check if user is an admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_roles')
        .select('*')
        .eq('user_id', userId)
        .single();

      const userIsAdmin = !adminError && adminData;
      console.log("Admin check result:", userIsAdmin, adminData);
      setIsAdmin(!!userIsAdmin);

      // Fetch game results
      const { data: gameResults, error: gameResultsError } = await supabase
        .from('game_results')
        .select('*')
        .eq('user_id', userId);

      if (gameResultsError) {
        console.error("Error fetching game results:", gameResultsError);
        throw gameResultsError;
      }

      // Transform game results to GameResult type
      const formattedGameResults: GameResult[] = gameResults ? gameResults.map((result) => ({
        id: result.id,
        gameId: result.game_id,
        gameTitle: result.game_title,
        date: new Date(result.date),
        position: result.position,
        entryFee: result.entry_fee,
        correctAnswers: result.correct_answers,
        totalAnswers: result.total_answers
      })) : [];

      // Calculate stats
      const totalSpent = formattedGameResults.reduce((sum, game) => sum + game.entryFee, 0);
      const correctAnswers = formattedGameResults.reduce((sum, game) => sum + game.correctAnswers, 0);
      const totalAnswers = formattedGameResults.reduce((sum, game) => sum + game.totalAnswers, 0);

      setCurrentUser({
        id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        stats: {
          gamesPlayed: formattedGameResults,
          totalSpent,
          correctAnswers,
          totalAnswers
        },
        isAdmin: !!userIsAdmin
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del usuario",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      console.log("Signing up user:", email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          },
          emailRedirectTo: window.location.origin + '/login'
        }
      });

      if (error) {
        console.error("Sign up error:", error);
        return { user: null, error };
      }

      console.log("Sign up successful:", data.user);
      return { user: data.user, error: null };
    } catch (error) {
      console.error('Error during sign up:', error);
      return { user: null, error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in user:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Sign in error:", error);
        return { user: null, error };
      }

      console.log("Sign in successful:", data.user);
      return { user: data.user, error: null };
    } catch (error) {
      console.error('Error during sign in:', error);
      return { user: null, error: error as AuthError };
    }
  };

  const updateUserStats = async (gameResult: GameResult) => {
    if (!currentUser) return;

    try {
      // Insert the game result into Supabase
      const { error } = await supabase
        .from('game_results')
        .insert({
          user_id: currentUser.id,
          game_id: gameResult.gameId,
          game_title: gameResult.gameTitle,
          date: gameResult.date.toISOString(),
          position: gameResult.position,
          entry_fee: gameResult.entryFee,
          correct_answers: gameResult.correctAnswers,
          total_answers: gameResult.totalAnswers
        });

      if (error) {
        throw error;
      }

      // Update the local state
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
    } catch (error) {
      console.error('Error updating user stats:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los resultados de la partida",
        variant: "destructive"
      });
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
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
        isAdmin,
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
