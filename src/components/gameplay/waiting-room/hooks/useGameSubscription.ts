
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
    
    // Canal para el estado del juego
    const gameStateChannel = subscribeToGameStateUpdates(gameId, (payload) => {
      console.log('Game state change detected:', payload);
      
      // Si el juego ha cambiado a estado 'waiting' o posterior, marcarlo como iniciado
      if (payload.new && (payload.new.status !== 'pending')) {
        setHasGameStarted(true);
        gameNotifications.gameStarting();
        
        // Auto-redirección al juego después de un breve retraso
        setTimeout(() => {
          navigate(`/game/${gameId}`);
        }, 1500);
      }
    });
    
    // Canal para actualizaciones de clasificación (lista de jugadores)
    const leaderboardChannel = subscribeToLeaderboardUpdates(gameId, async () => {
      // Actualizar la lista de jugadores desde el servidor
      try {
        const { data: gameParticipants } = await supabase
          .from('game_participants')
          .select('user_id, profiles:user_id(name, avatar_url)')
          .eq('game_id', gameId);
        
        if (gameParticipants) {
          const players = gameParticipants.map((p, index) => {
            // Acceder a propiedades de forma segura usando optional chaining
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
    
    // Cargar participantes iniciales
    const loadInitialParticipants = async () => {
      try {
        const { data: gameParticipants, error } = await supabase
          .from('game_participants')
          .select('user_id, profiles:user_id(name, avatar_url)')
          .eq('game_id', gameId);
        
        if (error) throw error;
        
        if (gameParticipants && gameParticipants.length > 0) {
          const players = gameParticipants.map((p, index) => {
            // Acceder a propiedades de forma segura usando optional chaining
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
    
    // Limpiar suscripciones al desmontar
    return () => {
      supabase.removeChannel(gameStateChannel);
      supabase.removeChannel(leaderboardChannel);
    };
  }, [gameId, navigate, setHasGameStarted, setPlayersOnline]);
};
