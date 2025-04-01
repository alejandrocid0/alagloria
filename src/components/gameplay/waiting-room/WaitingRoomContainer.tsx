
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import WaitingRoom from '@/components/gameplay/WaitingRoom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLiveGameState } from '@/hooks/useLiveGameState';
import { useCountdown } from '@/components/gameplay/waiting-room/hooks/useCountdown';
import { useGameInfo } from '@/components/gameplay/hooks/useGameInfo';

const WaitingRoomContainer = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [playersOnline, setPlayersOnline] = useState<any[]>([]);
  const { gameState, refreshGameState } = useLiveGameState();
  const gameInfo = useGameInfo(gameId);
  
  // Calcular tiempo hasta el inicio programado
  const gameDate = gameInfo?.date ? new Date(gameInfo.date) : null;
  const currentTime = new Date();
  const millisecondsUntilStart = gameDate ? gameDate.getTime() - currentTime.getTime() : 0;
  const secondsUntilStart = Math.max(0, Math.floor(millisecondsUntilStart / 1000));
  
  // Determinar si el usuario es el anfitrión de la partida
  const isGameHost = gameInfo?.created_by === user?.id;

  // Hook de cuenta regresiva
  const {
    countdown,
    hasGameStarted,
    showPulse,
    isWithinFiveMinutes,
    formatTimeRemaining,
    setHasGameStarted
  } = useCountdown(secondsUntilStart, gameId);

  // Efectos para comprobar si la partida ya ha comenzado
  useEffect(() => {
    if (gameState?.status === 'question') {
      setHasGameStarted(true);
    }
  }, [gameState, setHasGameStarted]);
  
  // Actualizar estado del juego al cargar
  useEffect(() => {
    if (gameId) {
      refreshGameState();
    }
  }, [gameId, refreshGameState]);
  
  // Suscribirse a actualizaciones de participantes
  useEffect(() => {
    if (!gameId) return;
    
    fetchParticipants();
    
    const channel = supabase
      .channel(`game-participants-${gameId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'game_participants',
          filter: `game_id=eq.${gameId}`
        },
        () => {
          fetchParticipants();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  const fetchParticipants = async () => {
    if (!gameId) return;
    
    try {
      const { data, error } = await supabase
        .from('game_participants')
        .select('user_id')
        .eq('game_id', gameId);
        
      if (error) throw error;
      
      if (data) {
        // Get user profiles
        const userIds = data.map(p => p.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', userIds);
          
        if (profilesError) throw profilesError;
        
        const participants = profiles.map((profile, index) => ({
          id: profile.id,
          name: profile.name,
          points: 0,
          rank: index + 1,
          lastAnswer: null,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=5D3891&color=fff`
        }));
        
        setPlayersOnline(participants);
      }
    } catch (err) {
      console.error('Error fetching participants:', err);
    }
  };
  
  // Manejar la acción de jugar ahora
  const handlePlayNow = () => {
    if (gameId) {
      navigate(`/game/${gameId}`);
    }
  };
  
  // Manejar inicio manual de la partida (solo para anfitriones)
  const handleStartGame = async () => {
    if (!gameId || !isGameHost) return;
    
    try {
      const { error } = await supabase.rpc('start_live_game', { game_id: gameId });
      
      if (error) {
        console.error('Error starting game:', error);
        toast({
          title: "Error",
          description: "No se pudo iniciar la partida",
          variant: "destructive"
        });
        return;
      }
      
      navigate(`/game/${gameId}`);
    } catch (err) {
      console.error('Error starting game:', err);
    }
  };
  
  return (
    <WaitingRoom 
      gameTitle={gameInfo.title}
      playersOnline={playersOnline}
      isGameHost={isGameHost}
      countdown={countdown}
      hasGameStarted={hasGameStarted}
      showPulse={showPulse}
      isWithinFiveMinutes={isWithinFiveMinutes}
      formatTimeRemaining={formatTimeRemaining}
      onPlayNow={handlePlayNow}
      onStartGame={handleStartGame}
    />
  );
};

export default WaitingRoomContainer;
