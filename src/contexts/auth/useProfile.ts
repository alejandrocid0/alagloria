
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Profile } from './types';

export const useProfile = () => {
  // Get user profile with timeout handling
  const fetchProfile = async (userId: string, user: User | null) => {
    try {
      // Establecemos un tiempo límite para la obtención del perfil
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      // Consulta para verificar si el usuario es administrador
      const adminCheckPromise = supabase
        .from('admin_roles')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      // Si en 3 segundos no hay respuesta, continuamos de todos modos
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 3000);
      });
      
      // Race entre la obtención del perfil y el timeout
      const [profileResult, adminResult] = await Promise.all([
        Promise.race([
          profilePromise,
          timeoutPromise.then(() => ({ data: null, error: new Error('Timeout') }))
        ]),
        Promise.race([
          adminCheckPromise,
          timeoutPromise.then(() => ({ data: null, error: new Error('Timeout') }))
        ])
      ]);

      const { data, error } = profileResult as any;

      if (error && error.message !== 'Timeout') {
        console.warn('Non-timeout error getting profile:', error);
        return null;
      }

      console.log('Profile fetched:', data);
      console.log('Admin check result:', adminResult);

      // Determinar si el usuario es administrador
      const isAdmin = !adminResult.error && adminResult.data !== null;
      
      if (data) {
        // Añadir la información de administrador al perfil
        return {
          ...data,
          is_admin: isAdmin
        } as Profile;
      } else {
        // Si no hay datos, creamos un perfil básico basado en el email
        const basicProfile: Profile = {
          id: userId,
          name: user?.email?.split('@')[0] || 'Usuario',
          email: user?.email || '',
          is_admin: isAdmin
        };
        return basicProfile;
      }
    } catch (error) {
      console.warn('Unexpected error getting profile:', error);
      // Creamos un perfil básico para no bloquear la UI
      const basicProfile: Profile = {
        id: userId,
        name: user?.email?.split('@')[0] || 'Usuario',
        email: user?.email || '',
        is_admin: false
      };
      return basicProfile;
    }
  };

  return { fetchProfile };
};
