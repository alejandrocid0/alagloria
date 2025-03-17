
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AuthContextType, UserProfile, GameResult } from './types';
import { fetchUserProfile } from './utils';

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        // Get current session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error al obtener la sesión:", error);
          return;
        }
        
        if (data.session) {
          setSession(data.session);
          setIsAuthenticated(true);
          const userProfile = await fetchUserProfile(data.session.user.id);
          if (userProfile) {
            setCurrentUser(userProfile);
            setIsAdmin(userProfile.isAdmin);
          }
        } else {
          setCurrentUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error al inicializar la autenticación:", error);
      } finally {
        setLoading(false);
      }
    };

    // Initialize auth
    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Estado de autenticación cambiado:", event, newSession?.user?.id);
        
        if (newSession) {
          setSession(newSession);
          setIsAuthenticated(true);
          const userProfile = await fetchUserProfile(newSession.user.id);
          if (userProfile) {
            setCurrentUser(userProfile);
            setIsAdmin(userProfile.isAdmin);
          }
        } else {
          setSession(null);
          setCurrentUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up function
  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      
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
        return { user: null, error };
      }

      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { user: null, error };
      }

      setSession(data.session);
      setIsAuthenticated(true);
      
      if (data.user) {
        const userProfile = await fetchUserProfile(data.user.id);
        if (userProfile) {
          setCurrentUser(userProfile);
          setIsAdmin(userProfile.isAdmin);
        }
      }
      
      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  // Update user stats
  const updateUserStats = async (gameResult: GameResult) => {
    if (!currentUser) return;

    try {
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
      console.error('Error al actualizar las estadísticas del usuario:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los resultados de la partida",
        variant: "destructive"
      });
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setCurrentUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión correctamente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Get user profile
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

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
