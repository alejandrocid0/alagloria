
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, Profile } from './auth/types';
import { useAuthActions } from './auth/useAuthActions';
import { useProfile } from './auth/useProfile';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const isAuthenticated = !!user;
  const currentUser = user;
  
  const { fetchProfile } = useProfile();
  const { signUp, signIn, signOut, resetPassword, updatePassword } = useAuthActions(setLoading, setProfile);

  // Función para enviar una sugerencia
  const sendSuggestion = async (message: string) => {
    if (!user) {
      return { error: new Error('Debes estar autenticado para enviar una sugerencia') };
    }

    try {
      const { error } = await supabase
        .from('user_suggestions')
        .insert({
          user_id: user.id,
          email: user.email || profile?.email || '',
          message,
        });

      if (error) {
        console.error('Error al enviar sugerencia:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Error en sendSuggestion:', error);
      return { error };
    }
  };

  // Función para cargar el perfil de usuario
  const loadUserProfile = async (userId: string, userObj: User) => {
    try {
      const profileData = await fetchProfile(userId, userObj);
      if (profileData) {
        console.log('Perfil cargado con éxito:', profileData);
        setProfile(profileData);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initialize with the current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Intentamos obtener el perfil, pero no esperamos demasiado tiempo
        loadUserProfile(session.user.id, session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes in the authentication state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserProfile(session.user.id, session.user);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    profile,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    sendSuggestion,
    loading,
    isAuthenticated,
    currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
