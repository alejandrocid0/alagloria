
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Profile } from './types';

export const useAuthActions = (
  setLoading: (loading: boolean) => void,
  setProfile: (profile: Profile | null) => void
) => {
  // User registration
  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      console.log('Attempting to sign up user:', email, name);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      console.log('Sign up response:', data, error);

      if (error) {
        console.error('Error in registration:', error);
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
      console.error('Unexpected error in registration:', error);
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

  // Login
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Attempting to sign in user:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Sign in response:', data, error);

      if (error) {
        console.error('Error signing in:', error);
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
      console.error('Unexpected error signing in:', error);
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

  // Sign out
  const signOut = async () => {
    try {
      console.log('Attempting to sign out user');
      await supabase.auth.signOut();
      console.log('User signed out successfully');
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente',
      });
    } catch (error: any) {
      console.error('Error closing session:', error);
      toast({
        title: 'Error al cerrar sesión',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Password reset
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      console.log('Attempting to send password reset email to:', email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      console.log('Password reset response:', error);

      if (error) {
        console.error('Error sending password reset email:', error);
        toast({
          title: 'Error al enviar el correo',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }

      toast({
        title: 'Correo enviado',
        description: 'Revisa tu correo para restablecer tu contraseña',
      });
      
      return { error: null };
    } catch (error: any) {
      console.error('Unexpected error sending password reset:', error);
      toast({
        title: 'Error al enviar el correo',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const updatePassword = async (newPassword: string) => {
    try {
      setLoading(true);
      console.log('Attempting to update password');
      
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });

      if (error) {
        console.error('Error updating password:', error);
        toast({
          title: 'Error al actualizar contraseña',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }

      toast({
        title: 'Contraseña actualizada',
        description: 'Tu contraseña ha sido actualizada correctamente',
      });
      
      return { error: null };
    } catch (error: any) {
      console.error('Unexpected error updating password:', error);
      toast({
        title: 'Error al actualizar contraseña',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword
  };
};
