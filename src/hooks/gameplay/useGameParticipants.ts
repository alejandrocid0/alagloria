
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useGameParticipants = (gameId: string | undefined) => {
  const [playersCount, setPlayersCount] = useState(0);
  const [playersOnline, setPlayersOnline] = useState<any[]>([]);
  
  // Load game participants
  useEffect(() => {
    if (!gameId) return;
    
    const loadParticipants = async () => {
      try {
        const { data, error } = await supabase
          .from('game_participants')
          .select('user_id, profiles:user_id(name, avatar_url)')
          .eq('game_id', gameId);
          
        if (error) throw error;
        
        if (data) {
          console.log('Participantes cargados:', data);
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
        console.error('Error al cargar participantes:', err);
      }
    };
    
    loadParticipants();
    
    // Subscribe to changes in participants
    const participantsChannel = supabase
      .channel(`game-participants-${gameId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'game_participants',
          filter: `game_id=eq.${gameId}`
        }, 
        () => {
          console.log('Cambio en participantes detectado, recargando');
          loadParticipants();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(participantsChannel);
    };
  }, [gameId]);
  
  return {
    playersCount,
    playersOnline
  };
};
