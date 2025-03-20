
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCheckGameJoin = (gameId: string, userId: string | null) => {
  const [hasJoined, setHasJoined] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const checkJoinStatus = async () => {
      if (!userId) {
        setCheckingStatus(false);
        return;
      }

      try {
        setCheckingStatus(true);
        const { data, error } = await supabase
          .from('game_participants')
          .select()
          .eq('game_id', gameId)
          .eq('user_id', userId);

        if (error) {
          console.error('Error checking game join status:', error);
          setHasJoined(false);
        } else {
          setHasJoined(data && data.length > 0);
        }
      } catch (err) {
        console.error('Error in join status check:', err);
        setHasJoined(false);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkJoinStatus();
  }, [gameId, userId]);

  return {
    hasJoined,
    checkingStatus
  };
};
