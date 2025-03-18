
import { supabase } from '@/integrations/supabase/client';

/**
 * Esta función asigna el rol de administrador a un usuario con el correo electrónico especificado.
 * IMPORTANTE: Esta función debe ser ejecutada solo una vez y desde la consola del navegador
 * por un usuario con acceso al código de la aplicación.
 * 
 * @param email El correo electrónico del usuario a convertir en administrador
 * @returns Un mensaje indicando si la operación fue exitosa o falló
 */
export const createAdmin = async (email: string): Promise<string> => {
  try {
    // Verificar si el usuario existe
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      console.error('Error al buscar usuario:', userError);
      return `Error: No se encontró un usuario con el correo ${email}. El usuario debe registrarse primero.`;
    }

    // Verificar si ya es administrador
    const { data: existingAdmin, error: adminCheckError } = await supabase
      .from('admin_roles')
      .select('*')
      .eq('user_id', userData.id)
      .single();

    if (!adminCheckError && existingAdmin) {
      return `El usuario con correo ${email} ya es administrador.`;
    }

    // Asignar rol de administrador
    const { error: insertError } = await supabase
      .from('admin_roles')
      .insert({
        user_id: userData.id
      });

    if (insertError) {
      console.error('Error al asignar rol de administrador:', insertError);
      return `Error al asignar rol de administrador: ${insertError.message}`;
    }

    return `¡Éxito! El usuario con correo ${email} ahora es administrador.`;
  } catch (error) {
    console.error('Error inesperado:', error);
    return `Error inesperado: ${error instanceof Error ? error.message : String(error)}`;
  }
};

/**
 * INSTRUCCIONES PARA CREAR UN ADMINISTRADOR:
 * 
 * 1. Primero, regístrese como un usuario normal en la aplicación
 * 2. Abra la consola del navegador (F12 o clic derecho -> Inspeccionar -> Consola)
 * 3. Ejecute el siguiente código, reemplazando 'tucorreo@ejemplo.com' con su correo:
 * 
 * import { createAdmin } from './src/utils/admin/createAdmin';
 * createAdmin('tucorreo@ejemplo.com').then(console.log);
 * 
 * 4. Cierre sesión y vuelva a iniciar sesión para que los cambios surtan efecto
 */
