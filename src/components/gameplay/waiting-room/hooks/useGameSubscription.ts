
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { gameNotifications } from '@/components/ui/notification-toast';
import { subscribeToGameStateUpdates } from '@/hooks/liveGame/gameStateUtils';
import { subscribeToLeaderboardUpdates } from '@/hooks/liveGame/leaderboardUtils';

export const useGameSubscription = (
  gameId: string | undefined, 
  setHasGameStarted: (value: boolean) => void,
  setPlayersOnline: (players: any[]) => void
) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!gameId) return;
    
    // Channel for game state
    const gameStateChannel = subscribeToGameStateUpdates(gameId, (payload) => {
      console.log('Game state change detected:', payload);
      
      // If game has changed to 'waiting' state or later, mark as started
      if (payload.new && (payload.new.status !== 'pending')) {
        setHasGameStarted(true);
        gameNotifications.gameStarting();
        
        // Auto-redirect to game after a short delay
        setTimeout(() => {
          navigate(`/game/${gameId}`);
        }, 1500);
      }
    });
    
    // Channel for leaderboard updates (player list)
    const leaderboardChannel = subscribeToLeaderboardUpdates(gameId, async () => {
      // Update player list from server
      try {
        const { data: gameParticipants } = await supabase
          .from('game_participants')
          .select('user_id, profiles:user_id(name, avatar_url)')
          .eq('game_id', gameId);
        
        if (gameParticipants) {
          const players = gameParticipants.map((p, index) => {
            // Safely access properties using optional chaining
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
          
          setPlayersOnline(players);
        }
      } catch (err) {
        console.error('Error getting participants:', err);
      }
    });
    
    // Load initial participants
    const loadInitialParticipants = async () => {
      try {
        const { data: gameParticipants, error } = await supabase
          .from('game_participants')
          .select('user_id, profiles:user_id(name, avatar_url)')
          .eq('game_id', gameId);
        
        if (error) throw error;
        
        if (gameParticipants && gameParticipants.length > 0) {
          const players = gameParticipants.map((p, index) => {
            // Safely access properties using optional chaining
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
          
          setPlayersOnline(players);
        }
      } catch (err) {
        console.error('Error getting initial participants:', err);
      }
    };
    
    loadInitialParticipants();
    
    // Clean up subscriptions on unmount
    return () => {
      supabase.removeChannel(gameStateChannel);
      supabase.removeChannel(leaderboardChannel);
    };
  }, [gameId, navigate, setHasGameStarted, setPlayersOnline]);
};
