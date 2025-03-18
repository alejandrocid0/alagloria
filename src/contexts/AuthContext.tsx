
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, Profile } from './auth/types';
import { useAuthActions } from './auth/useAuthActions';
import { useProfile } from './auth/useProfile';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const isAuthenticated = !!user;
  const currentUser = user;
  
  const { fetchProfile } = useProfile();
  const { signUp, signIn, signOut } = useAuthActions(setLoading, setProfile);

  useEffect(() => {
    // Initialize with the current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Intentamos obtener el perfil, pero no esperamos demasiado tiempo
        fetchProfile(session.user.id, session.user)
          .then(profileData => {
            if (profileData) {
              setProfile(profileData);
            }
          })
          .catch(err => {
            console.error('Error fetching profile on init:', err);
            // Si hay error al obtener perfil, no bloqueamos la UI
          })
          .finally(() => {
            // Incluso si hay error al obtener el perfil, terminamos la carga
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    // Listen for changes in the authentication state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            const profileData = await fetchProfile(session.user.id, session.user);
            if (profileData) {
              setProfile(profileData);
            }
          } catch (err) {
            console.error('Error fetching profile on auth change:', err);
            // Si hay error al obtener perfil, no bloqueamos la UI
          }
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

  const value = {
    session,
    user,
    profile,
    signUp,
    signIn,
    signOut,
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
