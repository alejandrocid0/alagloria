
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Player } from '@/types/liveGame';

export const useGameParticipants = (gameId: string | undefined) => {
  const [playersCount, setPlayersCount] = useState(0);
  const [playersOnline, setPlayersOnline] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Función para cargar los participantes
  const loadParticipants = useCallback(async () => {
    if (!gameId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`[GameParticipants] Cargando participantes para juego ${gameId}`);
      
      const { data, error } = await supabase
        .from('game_participants')
        .select('user_id, profiles:user_id(name, avatar_url)')
        .eq('game_id', gameId);
          
      if (error) throw error;
      
      if (data) {
        console.log('[GameParticipants] Participantes cargados:', data.length);
        
        const formattedPlayers = data.map((p, index) => {
          const profileData = p.profiles as any;
          return {
            id: p.user_id,
            name: profileData?.name || `Jugador ${index + 1}`,
            points: 0,
            rank: index + 1,
            avatar: profileData?.avatar_url || undefined,
            lastAnswer: null
          };
        });
        
        setPlayersOnline(formattedPlayers);
        setPlayersCount(data.length);
      }
    } catch (err) {
      console.error('[GameParticipants] Error al cargar participantes:', err);
      setError('Error al cargar participantes');
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);
  
  // Carga inicial y suscripción a cambios
  useEffect(() => {
    if (!gameId) return;
    
    // Carga inicial
    loadParticipants();
    
    // Suscribirse a cambios en participantes
    const participantsChannel = supabase
      .channel(`game-participants-${gameId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'game_participants',
          filter: `game_id=eq.${gameId}`
        }, 
        (payload) => {
          console.log('[GameParticipants] Cambio en participantes detectado:', payload);
          loadParticipants();
        }
      )
      .subscribe();
      
    return () => {
      console.log('[GameParticipants] Cancelando suscripción a participantes');
      supabase.removeChannel(participantsChannel);
    };
  }, [gameId, loadParticipants]);
  
  return {
    playersCount,
    playersOnline,
    isLoading,
    error,
    reloadParticipants: loadParticipants
  };
};
