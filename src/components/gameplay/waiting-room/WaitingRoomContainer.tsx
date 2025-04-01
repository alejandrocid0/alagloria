
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import WaitingRoom from '@/components/gameplay/WaitingRoom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { gameNotifications } from '@/components/ui/notification-toast';
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
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(true);
  
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

  // Función para verificar partidas programadas (auto-inicio)
  const checkScheduledGames = useCallback(async () => {
    if (!autoCheckEnabled) return;
    
    try {
      await supabase.functions.invoke('check-scheduled-games');
      // No necesitamos procesar la respuesta, ya que el servidor actualizará 
      // los datos y recibiremos los cambios a través de la suscripción
    } catch (err) {
      console.error('Error checking scheduled games:', err);
    }
  }, [autoCheckEnabled]);

  // Efectos para comprobar si la partida ya ha comenzado
  useEffect(() => {
    if (gameState?.status === 'question') {
      setHasGameStarted(true);
      
      // Mostrar notificación
      gameNotifications.gameStarting();
      
      // Redireccionar tras un breve retraso para dar tiempo a que se muestre la notificación
      setTimeout(() => {
        navigate(`/game/${gameId}`);
      }, 1500);
    }
  }, [gameState, setHasGameStarted, gameId, navigate]);
  
  // Actualizar estado del juego al cargar
  useEffect(() => {
    if (gameId) {
      refreshGameState();
    }
  }, [gameId, refreshGameState]);
  
  // Configurar verificación periódica de partidas programadas
  useEffect(() => {
    if (!gameId || !isWithinFiveMinutes) return;
    
    // Verificar partidas programadas cada 10 segundos si estamos en los últimos 5 minutos
    const intervalId = setInterval(checkScheduledGames, 10000);
    
    // Verificar inmediatamente al entrar en los últimos 5 minutos
    checkScheduledGames();
    
    return () => {
      clearInterval(intervalId);
      setAutoCheckEnabled(false);
    };
  }, [gameId, isWithinFiveMinutes, checkScheduledGames]);
  
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
      gameNotifications.gameStarting();
      
      // Pequeño retraso para dar tiempo a que se muestre la notificación
      setTimeout(() => {
        navigate(`/game/${gameId}`);
      }, 1500);
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
      
      gameNotifications.gameStarting();
      
      // Pequeño retraso para dar tiempo a que se muestre la notificación
      setTimeout(() => {
        navigate(`/game/${gameId}`);
      }, 1500);
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
