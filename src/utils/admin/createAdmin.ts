
import { supabase } from '@/lib/supabase';

/**
 * This utility function can be used to create an admin user.
 * Replace 'your-email@example.com' with the email you want to make an admin.
 * This should be run only once in development or through a secure admin interface.
 */
export const createAdmin = async (adminEmail: string) => {
  try {
    // First, find the user by email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', adminEmail)
      .single();
    
    if (userError) {
      throw new Error(`User not found with email: ${adminEmail}`);
    }
    
    // Check if user is already an admin
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admin_roles')
      .select('*')
      .eq('user_id', userData.id)
      .single();
    
    if (!checkError && existingAdmin) {
      console.log(`User ${adminEmail} is already an admin.`);
      return;
    }
    
    // Add the user to admin_roles table
    const { data, error } = await supabase
      .from('admin_roles')
      .insert({
        user_id: userData.id
      })
      .select();
    
    if (error) {
      throw error;
    }
    
    console.log(`User ${adminEmail} is now an admin!`);
    return data;
  } catch (error) {
    console.error('Error making user admin:', error);
    throw error;
  }
};

// You can run this function directly from the browser console:
// import { createAdmin } from './utils/admin/createAdmin';
// createAdmin('your-email@example.com');
