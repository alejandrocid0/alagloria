
import { useEffect } from 'react';
import { Player } from '@/types/liveGame';
import { supabase } from '@/integrations/supabase/client';

export const useGameSubscription = (
  gameId: string | undefined,
  setHasGameStarted: (hasStarted: boolean) => void,
  setPlayersOnline: (players: Player[]) => void
) => {
  useEffect(() => {
    if (!gameId) return;
    
    // Subscribe to live game updates
    const gameChannel = supabase
      .channel(`game-state-${gameId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'live_games',
          filter: `id=eq.${gameId}`
        },
        (payload) => {
          console.log('Game state update received:', payload);
          // Check if payload has new data with a status property
          if (payload.new && typeof payload.new === 'object' && 'status' in payload.new) {
            // If status is anything other than 'waiting', game has started
            if (payload.new.status !== 'waiting') {
              setHasGameStarted(true);
            }
          }
        }
      )
      .subscribe();
    
    // Fetch initial participants list
    const fetchParticipants = async () => {
      try {
        const { data, error } = await supabase
          .from('game_participants')
          .select(`
            user_id,
            profiles:user_id (
              name,
              avatar_url
            )
          `)
          .eq('game_id', gameId);
        
        if (error) {
          console.error('Error fetching participants:', error);
          return;
        }
        
        if (data) {
          // Transform data to match Player type
          const players: Player[] = data.map((item, index) => {
            // Safely extract profile data
            const profile = item.profiles || {};
            const name = typeof profile === 'object' && 'name' in profile ? String(profile.name) : 'Anonymous';
            const avatarUrl = typeof profile === 'object' && 'avatar_url' in profile 
              ? String(profile.avatar_url) 
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=5D3891&color=fff`;
            
            return {
              id: item.user_id,
              name: name,
              points: 0,
              rank: index + 1,
              avatar: avatarUrl,
              lastAnswer: null
            };
          });
          
          setPlayersOnline(players);
        }
      } catch (err) {
        console.error('Error in fetchParticipants:', err);
      }
    };
    
    // Call once at start
    fetchParticipants();
    
    // Subscribe to participant changes
    const participantsChannel = supabase
      .channel(`participants-${gameId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'game_participants',
          filter: `game_id=eq.${gameId}`
        },
        () => {
          // Just refetch the entire list
          fetchParticipants();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(gameChannel);
      supabase.removeChannel(participantsChannel);
    };
  }, [gameId, setHasGameStarted, setPlayersOnline]);
};
