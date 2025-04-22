
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Player } from '@/types/liveGame';

const INACTIVE_THRESHOLD = 60000; // 60 segundos sin heartbeat = inactivo

// Tipo para los datos de participantes que recibimos de Supabase
interface ParticipantData {
  user_id: string;
  profiles: {
    name: string;
    // Podríamos añadir más campos del perfil si los necesitamos
  } | null;
}

export const useActiveParticipants = (gameId: string | undefined) => {
  const [activeParticipants, setActiveParticipants] = useState<Player[]>([]);

  useEffect(() => {
    if (!gameId) return;

    // Configurar canal de tiempo real
    const channel = supabase.channel(`active-players-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_participants',
          filter: `game_id=eq.${gameId}`
        },
        () => {
          fetchActiveParticipants();
        }
      )
      .subscribe();

    // Función para obtener participantes activos
    const fetchActiveParticipants = async () => {
      try {
        const { data, error } = await supabase
          .from('game_participants')
          .select(`
            user_id,
            profiles:profiles!user_id(name)
          `)
          .eq('game_id', gameId)
          .gte('last_heartbeat', new Date(Date.now() - INACTIVE_THRESHOLD).toISOString());

        if (error) {
          console.error('[ActiveParticipants] Error fetching active participants:', error);
          return;
        }

        // Asegurarnos de que data es del tipo correcto con aserción de tipo
        const participants = data as unknown as ParticipantData[];
        
        const activePlayers: Player[] = participants.map(participant => ({
          id: participant.user_id,
          name: participant.profiles?.name || 'Unknown Player',
          points: 0,
          rank: 0,
          lastAnswer: null
        }));

        setActiveParticipants(activePlayers);
      } catch (err) {
        console.error('[ActiveParticipants] Error fetching active participants:', err);
      }
    };

    // Obtener participantes iniciales
    fetchActiveParticipants();

    // Configurar intervalo para actualizar la lista
    const interval = setInterval(fetchActiveParticipants, INACTIVE_THRESHOLD / 2);

    // Limpieza
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  return activeParticipants;
};
