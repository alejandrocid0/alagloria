
import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { UserProfile } from './types';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Función para obtener el perfil del usuario
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching user profile for userId:", userId);
      
      // Obtenemos el perfil del usuario
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }

      console.log("Profile data:", profileData);

      // Verificamos si el usuario es administrador
      const { data: adminData, error: adminError } = await supabase
        .from('admin_roles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (adminError) {
        console.error("Error checking admin status:", adminError);
      }

      console.log("Admin data:", adminData);

      // Obtenemos los resultados de los juegos del usuario
      const { data: gameResults, error: gameResultsError } = await supabase
        .from('game_results')
        .select('*')
        .eq('user_id', userId);

      if (gameResultsError) {
        console.error("Error fetching game results:", gameResultsError);
      }

      console.log("Game results:", gameResults);

      // Formateamos los resultados de los juegos
      const formattedGameResults = gameResults ? gameResults.map((result) => ({
        id: result.id,
        gameId: result.game_id,
        gameTitle: result.game_title,
        date: new Date(result.date),
        position: result.position,
        entryFee: result.entry_fee,
        correctAnswers: result.correct_answers,
        totalAnswers: result.total_answers
      })) : [];

      // Calculamos las estadísticas del usuario
      const totalSpent = formattedGameResults.reduce((sum, game) => sum + game.entryFee, 0);
      const correctAnswers = formattedGameResults.reduce((sum, game) => sum + game.correctAnswers, 0);
      const totalAnswers = formattedGameResults.reduce((sum, game) => sum + game.totalAnswers, 0);

      if (profileData) {
        // Creamos el perfil del usuario
        const userProfile = {
          id: profileData.id,
          name: profileData.name,
          email: profileData.email,
          stats: {
            gamesPlayed: formattedGameResults,
            totalSpent,
            correctAnswers,
            totalAnswers
          },
          isAdmin: !!adminData
        };
        
        setCurrentUser(userProfile);
        setIsAdmin(!!adminData);
        return userProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error al obtener el perfil del usuario:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del usuario",
        variant: "destructive"
      });
      return null;
    }
  };

  // Función para registrar un nuevo usuario
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
        console.error("Signup error:", error);
        return { user: null, error };
      }

      console.log("Signup success:", data);
      return { user: data.user, error: null };
    } catch (error: any) {
      console.error("Unexpected signup error:", error);
      return { user: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Función para iniciar sesión
  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting sign in for:", email);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Sign in error:", error);
        return { user: null, error };
      }

      console.log("Sign in success, session:", data.session);
      setSession(data.session);
      setIsAuthenticated(true);
      
      if (data.user) {
        const profile = await fetchUserProfile(data.user.id);
        console.log("User profile after sign in:", profile);
      }
      
      return { user: data.user, error: null };
    } catch (error: any) {
      console.error("Unexpected sign in error:", error);
      return { user: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar las estadísticas del usuario
  const updateUserStats = async (gameResult: any) => {
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

  // Función para cerrar sesión
  const logout = async () => {
    try {
      console.log("Attempting to log out");
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error logging out:", error);
        throw error;
      }
      
      console.log("Logout successful");
      setCurrentUser(null);
      setSession(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
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

  // Función para obtener el perfil del usuario
  const getUserProfile = () => {
    return currentUser;
  };

  useEffect(() => {
    console.log("AuthProvider initialized, checking session");
    
    // Función para inicializar la sesión al cargar la página
    const initializeAuth = async () => {
      try {
        // Obtenemos la sesión actual (si existe)
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          throw error;
        }
        
        console.log("Current session:", data.session);
        
        if (data.session) {
          setSession(data.session);
          setIsAuthenticated(true);
          await fetchUserProfile(data.session.user.id);
        } else {
          console.log("No active session found");
          setCurrentUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error initializing authentication:", error);
      } finally {
        setLoading(false);
        setAuthChecked(true);
        console.log("Auth check completed");
      }
    };

    // Inicializamos la autenticación
    initializeAuth();

    // Configuramos el listener para cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        if (session) {
          setSession(session);
          setIsAuthenticated(true);
          await fetchUserProfile(session.user.id);
        } else {
          setSession(null);
          setCurrentUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
        setLoading(false);
        setAuthChecked(true);
      }
    );

    // Limpiamos la suscripción al desmontar
    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  // Combinamos el estado y los métodos para el contexto
  const authContextValue = {
    currentUser,
    isAuthenticated,
    isAdmin,
    session,
    loading,
    authChecked,
    signUp,
    signIn,
    logout,
    getUserProfile,
    updateUserStats
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
