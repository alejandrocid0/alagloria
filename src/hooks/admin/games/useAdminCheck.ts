
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminCheck = () => {
  const [isAdminLoaded, setIsAdminLoaded] = useState(false);

  const checkAdmin = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        setIsAdminLoaded(data?.is_admin || false);
      }
    } catch (err) {
      console.error('Error checking admin status:', err);
      setIsAdminLoaded(false);
    }
  }, []);

  return {
    isAdminLoaded,
    checkAdmin
  };
};
