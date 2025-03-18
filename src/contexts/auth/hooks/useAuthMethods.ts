
import { AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { GameResult } from '../types';

export function useAuthMethods(authState: any) {
  const {
    setCurrentUser,
    setSession,
    setIsAuthenticated,
    setIsAdmin,
    setLoading,
    fetchUserProfile,
    currentUser
  } = authState;

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
  const getUserProfile = () => {
    return currentUser;
  };

  return {
    signUp,
    signIn,
    logout,
    getUserProfile,
    updateUserStats
  };
}
