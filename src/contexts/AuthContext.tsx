
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: any | null;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Inicializar con la sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Escuchar cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Estado de autenticación cambiado:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Obtener perfil del usuario
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error al obtener el perfil:', error);
        return null;
      }

      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error inesperado al obtener el perfil:', error);
      return null;
    }
  };

  // Registro de usuario
  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        toast({
          title: 'Error en el registro',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }

      toast({
        title: 'Registro exitoso',
        description: 'Revisa tu correo para confirmar tu cuenta',
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Error en el registro',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Inicio de sesión
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: 'Error al iniciar sesión',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }

      toast({
        title: '¡Bienvenido!',
        description: 'Has iniciado sesión correctamente',
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Error al iniciar sesión',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Cierre de sesión
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error al cerrar sesión',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const value = {
    session,
    user,
    profile,
    signUp,
    signIn,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
