
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
import PlayersListSection from '@/components/gameplay/waiting-room/PlayersListSection';

const WaitingRoomContainer = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [playersOnline, setPlayersOnline] = useState<any[]>([]);
  const { gameState, refreshGameState } = useLiveGameState();
  const gameInfo = useGameInfo(gameId);
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  
  // Determinar tiempo inicial para la cuenta regresiva
  // Si tenemos estado de juego, usamos su countdown
  // Si no, calculamos desde la fecha programada
  const initialCountdown = gameState?.countdown || 0;
  const gameDate = gameInfo?.date ? new Date(gameInfo.date) : null;
  const currentTime = new Date();
  const millisecondsUntilStart = gameDate ? Math.max(0, gameDate.getTime() - currentTime.getTime()) : 0;
  const secondsUntilStart = Math.max(0, Math.floor(millisecondsUntilStart / 1000));
  
  // Determinar si el usuario es el anfitrión de la partida
  const isGameHost = gameInfo?.created_by === user?.id;

  // Hook de cuenta regresiva (prioriza el countdown del servidor si existe)
  const {
    countdown,
    hasGameStarted,
    showPulse,
    isWithinFiveMinutes,
    formatTimeRemaining,
    setHasGameStarted,
    syncCountdown
  } = useCountdown(initialCountdown > 0 ? initialCountdown : secondsUntilStart, gameId);

  // Sincronizar countdown con el servidor cuando cambie
  useEffect(() => {
    if (gameState?.countdown) {
      syncCountdown(gameState.countdown);
    }
  }, [gameState?.countdown, syncCountdown]);

  // Función para verificar partidas programadas (auto-inicio)
  const checkScheduledGames = useCallback(async () => {
    if (!autoCheckEnabled || !gameId) return;
    
    try {
      console.log('[WaitingRoom] Checking scheduled games');
      await supabase.functions.invoke('check-scheduled-games');
      // La respuesta no es necesaria procesarla ya que el servidor actualizará 
      // los datos y recibiremos los cambios a través de la suscripción
      console.log("[WaitingRoom] Scheduled games check completed");
      
      // Actualizar estado del juego después de la verificación
      refreshGameState();
    } catch (err) {
      console.error('[WaitingRoom] Error checking scheduled games:', err);
    }
  }, [autoCheckEnabled, gameId, refreshGameState]);

  // Efectos para comprobar si la partida ya ha comenzado
  useEffect(() => {
    if (gameState?.status === 'question') {
      console.log('[WaitingRoom] Game has started, transitioning to question state');
      setHasGameStarted(true);
      
      // Mostrar notificación
      gameNotifications.gameStarting();
      
      // Redireccionar tras un breve retraso para dar tiempo a que se muestre la notificación
      setTimeout(() => {
        setIsJoining(true);
        navigate(`/game/${gameId}`);
      }, 1500);
    }
  }, [gameState, setHasGameStarted, gameId, navigate]);
  
  // Actualizar estado del juego al cargar
  useEffect(() => {
    if (gameId) {
      console.log('[WaitingRoom] Refreshing game state on component mount');
      refreshGameState();
    }
  }, [gameId, refreshGameState]);
  
  // Configurar verificación periódica de partidas programadas
  useEffect(() => {
    if (!gameId) return;
    
    // Verificar partidas programadas inmediatamente al cargar
    checkScheduledGames();
    
    // Verificación más frecuente a medida que se acerca la hora de inicio
    let intervalTime = 60000; // 1 minuto por defecto
    
    if (countdown < 60) {
      intervalTime = 5000; // Cada 5 segundos en el último minuto
    } else if (countdown < 300) {
      intervalTime = 15000; // Cada 15 segundos en los últimos 5 minutos
    } else if (countdown < 600) {
      intervalTime = 30000; // Cada 30 segundos en los últimos 10 minutos
    }
    
    console.log(`[WaitingRoom] Setting up scheduled games check interval: ${intervalTime}ms`);
    const intervalId = setInterval(checkScheduledGames, intervalTime);
    
    return () => {
      clearInterval(intervalId);
      setAutoCheckEnabled(false);
    };
  }, [gameId, checkScheduledGames, countdown]);
  
  // Suscribirse a actualizaciones de participantes
  useEffect(() => {
    if (!gameId) return;
    
    console.log('[WaitingRoom] Configurando suscripción a participantes del juego:', gameId);
    fetchParticipants();
    
    // Usar un canal específico con un nombre único para esta instancia
    const channelName = `game-participants-${gameId}-${Math.random().toString(36).substring(2, 9)}`;
    console.log('[WaitingRoom] Creando canal de tiempo real:', channelName);
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'game_participants',
          filter: `game_id=eq.${gameId}`
        },
        (payload) => {
          console.log('[WaitingRoom] Cambio detectado en participantes:', payload);
          fetchParticipants();
        }
      )
      .subscribe((status) => {
        console.log(`[WaitingRoom] Estado de la suscripción a participantes: ${status}`);
      });
      
    return () => {
      console.log('[WaitingRoom] Limpiando suscripción a participantes');
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  const fetchParticipants = async () => {
    if (!gameId) return;
    
    try {
      console.log('[WaitingRoom] Obteniendo participantes para el juego:', gameId);
      
      // Primero obtener los IDs de usuario que participan en este juego
      const { data: participantsData, error: participantsError } = await supabase
        .from('game_participants')
        .select('user_id')
        .eq('game_id', gameId);
        
      if (participantsError) {
        console.error('[WaitingRoom] Error obteniendo participantes:', participantsError);
        throw participantsError;
      }
      
      if (participantsData && participantsData.length > 0) {
        console.log(`[WaitingRoom] Encontrados ${participantsData.length} participantes`);
        
        // Extraer los IDs de usuario y obtener sus perfiles
        const userIds = participantsData.map(p => p.user_id);
        
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', userIds);
          
        if (profilesError) {
          console.error('[WaitingRoom] Error obteniendo perfiles:', profilesError);
          throw profilesError;
        }
        
        if (profiles) {
          console.log(`[WaitingRoom] Obtenidos ${profiles.length} perfiles de usuario`);
          
          // Convertir los perfiles al formato requerido para la lista de jugadores
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
      } else {
        console.log('[WaitingRoom] No se encontraron participantes para este juego');
        setPlayersOnline([]);
      }
    } catch (err) {
      console.error('[WaitingRoom] Error en fetchParticipants:', err);
      toast({
        title: "Error",
        description: "No se pudieron cargar los participantes",
        variant: "destructive"
      });
    }
  };
  
  // Manejar la acción de jugar ahora
  const handlePlayNow = () => {
    if (gameId) {
      console.log('[WaitingRoom] User clicked "Play Now" button');
      gameNotifications.gameStarting();
      
      // Pequeño retraso para dar tiempo a que se muestre la notificación
      setTimeout(() => {
        setIsJoining(true);
        console.log('[WaitingRoom] Navigating to game:', gameId);
        navigate(`/game/${gameId}`);
      }, 1500);
    }
  };
  
  // Manejar inicio manual de la partida (solo para anfitriones)
  const handleStartGame = async () => {
    if (!gameId || !isGameHost) return;
    
    try {
      console.log('[WaitingRoom] Host attempting to start game:', gameId);
      
      const { error } = await supabase.rpc('start_live_game', { game_id: gameId });
      
      if (error) {
        console.error('[WaitingRoom] Error starting game:', error);
        toast({
          title: "Error",
          description: "No se pudo iniciar la partida",
          variant: "destructive"
        });
        return;
      }
      
      console.log('[WaitingRoom] Game started successfully');
      gameNotifications.gameStarting();
      
      // Pequeño retraso para dar tiempo a que se muestre la notificación
      setTimeout(() => {
        setIsJoining(true);
        navigate(`/game/${gameId}`);
      }, 1500);
    } catch (err) {
      console.error('[WaitingRoom] Error starting game:', err);
    }
  };
  
  // Si estamos en proceso de unirse a la partida, mostrar indicador de carga
  if (isJoining) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden p-8">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-gloria-purple border-t-transparent rounded-full animate-spin mb-4"></div>
          <h3 className="text-xl font-serif font-bold text-gloria-purple mb-2">Uniendo a la partida...</h3>
          <p className="text-gray-500">Cargando preguntas y preparando el juego</p>
        </div>
      </div>
    );
  }
  
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
