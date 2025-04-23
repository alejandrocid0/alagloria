
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Player } from '@/types/liveGame';
import { toast } from '@/components/ui/use-toast';

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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Función para obtener los participantes activos
  const fetchActiveParticipants = useCallback(async () => {
    if (!gameId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Calculamos la fecha límite para considerar a un participante como activo
      const activeThreshold = new Date(Date.now() - INACTIVE_THRESHOLD).toISOString();
      
      console.log(`[ActiveParticipants] Fetching active participants for game: ${gameId}, threshold: ${activeThreshold}`);
      
      const { data, error } = await supabase
        .from('game_participants')
        .select(`
          user_id,
          profiles:profiles!user_id(name)
        `)
        .eq('game_id', gameId)
        .gte('last_heartbeat', activeThreshold);

      if (error) {
        console.error('[ActiveParticipants] Error fetching active participants:', error);
        setError(new Error(`Error fetching participants: ${error.message}`));
        return;
      }

      // Asegurarnos de que data es del tipo correcto con aserción de tipo
      const participants = data as unknown as ParticipantData[];
      
      console.log(`[ActiveParticipants] Found ${participants.length} active participants`);
      
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
      setError(err instanceof Error ? err : new Error('Unknown error fetching participants'));
      
      // Notificación al usuario sobre el error
      toast({
        title: "Error",
        description: "No se pudieron cargar los participantes activos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

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
          console.log('[ActiveParticipants] Received real-time update for participants');
          fetchActiveParticipants();
        }
      )
      .subscribe((status) => {
        console.log(`[ActiveParticipants] Subscription status: ${status}`);
      });

    // Obtener participantes iniciales
    fetchActiveParticipants();

    // Configurar intervalo para actualizar la lista
    const interval = setInterval(fetchActiveParticipants, INACTIVE_THRESHOLD / 2);

    // Limpieza
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [gameId, fetchActiveParticipants]);

  return { activeParticipants, isLoading, error, refetch: fetchActiveParticipants };
};
