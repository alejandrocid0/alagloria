
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
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

  // Función para obtener el perfil del usuario
  const fetchUserProfile = async (userId: string) => {
    try {
      // Obtenemos el perfil del usuario
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) throw profileError;

      // Verificamos si el usuario es administrador
      const { data: adminData, error: adminError } = await supabase
        .from('admin_roles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (adminError) {
        console.error('Error al verificar rol de administrador:', adminError);
      }

      // Obtenemos los resultados de los juegos del usuario
      const { data: gameResults, error: gameError } = await supabase
        .from('game_results')
        .select('*')
        .eq('user_id', userId);

      if (gameError) {
        console.error('Error al obtener resultados de juegos:', gameError);
      }

      // Formateamos los resultados de los juegos
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
      }
      
    } catch (error) {
      console.error('Error al obtener el perfil del usuario:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del usuario",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    // Función para inicializar la sesión al cargar la página
    const initializeAuth = async () => {
      try {
        setLoading(true);
        // Obtenemos la sesión actual (si existe)
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error al obtener la sesión:", error);
          return;
        }
        
        if (data.session) {
          setSession(data.session);
          setIsAuthenticated(true);
          await fetchUserProfile(data.session.user.id);
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

    // Inicializamos la autenticación
    initializeAuth();

    // Configuramos el listener para cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Estado de autenticación cambiado:", event, newSession?.user?.id);
        
        if (newSession) {
          setSession(newSession);
          setIsAuthenticated(true);
          await fetchUserProfile(newSession.user.id);
        } else {
          setSession(null);
          setCurrentUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    // Limpiamos la suscripción al desmontar
    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
        return { user: null, error };
      }

      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  // Función para iniciar sesión
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
        await fetchUserProfile(data.user.id);
      }
      
      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar las estadísticas del usuario
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

  // Función para cerrar sesión
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

  // Función para obtener el perfil del usuario
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
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
