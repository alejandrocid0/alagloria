
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const HEARTBEAT_INTERVAL = 30000; // 30 segundos

export const useHeartbeat = (gameId: string | undefined) => {
  const { user } = useAuth();
  const heartbeatRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!gameId || !user) return;

    // Función para enviar heartbeat
    const sendHeartbeat = async () => {
      try {
        const { error } = await supabase
          .from('game_participants')
          .update({ 
            updated_at: new Date().toISOString(),
          })
          .eq('game_id', gameId)
          .eq('user_id', user.id);

        if (error) {
          console.error('[Heartbeat] Error updating heartbeat:', error);
        }
      } catch (err) {
        console.error('[Heartbeat] Failed to send heartbeat:', err);
      }
    };

    // Enviar heartbeat inicial
    sendHeartbeat();

    // Configurar intervalo de heartbeat
    heartbeatRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    // Limpieza al desmontar
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, [gameId, user]);
};
