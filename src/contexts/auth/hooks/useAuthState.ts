
import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { UserProfile } from '../types';

export function useAuthState() {
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
      const { data: adminData } = await supabase
        .from('admin_roles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      // Obtenemos los resultados de los juegos del usuario
      const { data: gameResults } = await supabase
        .from('game_results')
        .select('*')
        .eq('user_id', userId);

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
        // Obtenemos la sesión actual (si existe)
        const { data } = await supabase.auth.getSession();
        
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
      async (event, session) => {
        console.log("Estado de autenticación cambiado:", event, session?.user?.id);
        
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
      }
    );

    // Limpiamos la suscripción al desmontar
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    currentUser,
    setCurrentUser,
    session,
    setSession,
    isAuthenticated,
    setIsAuthenticated,
    isAdmin,
    setIsAdmin,
    loading,
    setLoading,
    fetchUserProfile
  };
}
