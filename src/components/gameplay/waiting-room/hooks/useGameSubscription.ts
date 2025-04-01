
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Player } from '@/types/liveGame';

export const useGameSubscription = (
  gameId?: string,
  setHasGameStarted?: (value: boolean) => void,
  setPlayersOnline?: (players: Player[]) => void
) => {
  // Subscribe to game state changes
  useEffect(() => {
    if (!gameId || !setHasGameStarted) return;
    
    const channel = supabase
      .channel(`game-state-${gameId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'live_games',
          filter: `id=eq.${gameId}`
        },
        (payload) => {
          console.log('Game state change detected:', payload);
          
          // Check if the game has started
          if (payload.new && payload.new.status !== 'waiting') {
            setHasGameStarted(true);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, setHasGameStarted]);
  
  // Subscribe to player updates
  useEffect(() => {
    if (!gameId || !setPlayersOnline) return;
    
    // Initial fetch of players
    const fetchPlayers = async () => {
      try {
        const { data, error } = await supabase
          .from('game_participants')
          .select('user_id, profiles:user_id(name, avatar_url)')
          .eq('game_id', gameId);
        
        if (error) throw error;
        
        if (data) {
          const formattedPlayers: Player[] = data.map((player, index) => ({
            id: player.user_id,
            name: player.profiles?.name || `Player ${index + 1}`,
            points: 0,
            rank: index + 1,
            avatar: player.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.profiles?.name || 'Player')}`,
            lastAnswer: null
          }));
          
          setPlayersOnline(formattedPlayers);
        }
      } catch (err) {
        console.error('Error fetching players:', err);
      }
    };
    
    fetchPlayers();
    
    // Subscribe to player join/leave events
    const channel = supabase
      .channel(`players-${gameId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'game_participants',
          filter: `game_id=eq.${gameId}`
        },
        () => {
          // Refetch players on any change
          fetchPlayers();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, setPlayersOnline]);
};
