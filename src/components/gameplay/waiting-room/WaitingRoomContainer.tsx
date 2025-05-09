import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import WaitingRoom from '@/components/gameplay/WaitingRoom';
import { gameNotifications } from '@/components/ui/notification-toast';
import { useLiveGameState } from '@/hooks/useLiveGameState';
import { useGameInfo } from '@/components/gameplay/hooks/useGameInfo';
import { useWaitingRoomState } from './hooks/useWaitingRoomState';
import { useParticipants } from './hooks/useParticipants';
import { useCountdown } from './hooks/useCountdown';
import { useScheduledGamesCheck } from './hooks/useScheduledGamesCheck';
import { useTimeSync } from '@/hooks/liveGame/useTimeSync';
import { useGameSync } from '@/hooks/liveGame/useGameSync';
import LoadingIndicator from './LoadingIndicator';
import ConnectionStatus from '../ConnectionStatus';
import { useHeartbeat } from '@/hooks/liveGame/useHeartbeat';
import { useActiveParticipants } from './hooks/useActiveParticipants';
import { toast } from '@/components/ui/use-toast';
import { gameStateSync } from '@/services/games/gameStateSync';
import { supabase } from '@/integrations/supabase/client';

const WaitingRoomContainer = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { gameState, refreshGameState, isConnected: liveGameStateIsConnected, reconnectAttempts: liveGameStateReconnectAttempts } = useLiveGameState();
  const gameInfo = useGameInfo(gameId);
  const [isJoining, setIsJoining] = useState(false);
  const [gameStartTransitionActive, setGameStartTransitionActive] = useState(false);
  const { syncWithServer } = useTimeSync();
  const [lastCheckTime, setLastCheckTime] = useState<number>(0);
  
  const { activeParticipants, isLoading: isLoadingParticipants, error: participantsError, refetch: refetchParticipants } = useActiveParticipants(gameId);
  
  // Mostrar error si hay problemas al cargar participantes
  useEffect(() => {
    if (participantsError) {
      console.error("[WaitingRoom] Error loading participants:", participantsError);
      toast({
        title: "Error de conexión",
        description: "Hubo un problema al cargar los participantes. Intentando reconectar...",
        variant: "destructive",
      });
      
      // Intentar recargar después de un breve retraso
      const retryTimer = setTimeout(() => {
        refetchParticipants();
      }, 5000);
      
      return () => clearTimeout(retryTimer);
    }
  }, [participantsError, refetchParticipants]);
  
  // Fix: Change the type of handlePlayNow and handleStartGame to return a Promise
  const { 
    isGameHost,
    handlePlayNow,
    handleStartGame
  } = useWaitingRoomState({
    gameId,
    gameInfo,
    user,
    navigate,
    setIsJoining
  });
  
  useEffect(() => {
    console.log('[WaitingRoom] Synchronizing time with server');
    syncWithServer();
  }, [syncWithServer]);
  
  const initialCountdown = gameState?.countdown || 0;
  const gameDate = gameInfo?.date ? new Date(gameInfo.date) : null;
  const currentTime = new Date();
  const millisecondsUntilStart = gameDate ? Math.max(0, gameDate.getTime() - currentTime.getTime()) : 0;
  const secondsUntilStart = Math.max(0, Math.floor(millisecondsUntilStart / 1000));
  
  console.log(`[WaitingRoom] Game scheduled time: ${gameDate?.toISOString()}, current time: ${currentTime.toISOString()}, seconds until start: ${secondsUntilStart}`);
  
  const {
    countdown,
    hasGameStarted,
    showPulse,
    isWithinFiveMinutes,
    formatTimeRemaining,
    setHasGameStarted,
    syncCountdown
  } = useCountdown(initialCountdown > 0 ? initialCountdown : secondsUntilStart, gameId);

  useScheduledGamesCheck({
    gameId,
    countdown,
    refreshGameState
  });
  
  // Verificar manualmente el estado del juego cada 15 segundos como respaldo
  const checkGameStateManually = async () => {
    if (!gameId) return;
    
    // Evitar verificaciones demasiado frecuentes
    const now = Date.now();
    if (now - lastCheckTime < 15000) return;
    
    setLastCheckTime(now);
    console.log('[WaitingRoom] Manually checking game state');
    
    try {
      // Primero, verificar si la partida tiene configurado auto_start
      const { data: gameConfig, error: gameConfigError } = await supabase
        .from('games')
        .select('auto_start, date')
        .eq('id', gameId)
        .single();
      
      if (gameConfigError) {
        console.error('[WaitingRoom] Error fetching game config:', gameConfigError);
        return;
      }
      
      // Ensure gameConfig exists and has the properties we need before accessing them
      const isAutoStart = gameConfig && gameConfig.auto_start === true;
      const scheduledTime = gameConfig && gameConfig.date ? new Date(gameConfig.date) : null;
      const shouldHaveStarted = scheduledTime ? currentTime >= scheduledTime : false;
      
      console.log(`[WaitingRoom] Game config: auto_start=${isAutoStart}, scheduled=${scheduledTime?.toISOString()}, should have started=${shouldHaveStarted}`);
      
      // Intentar obtener el estado actual del juego directamente
      const currentState = await gameStateSync.getGameState(gameId);
      console.log('[WaitingRoom] Manual game state check result:', currentState);
      
      // Verificar si hay inconsistencias en el estado
      if (currentState?.status === 'waiting' && shouldHaveStarted && isAutoStart) {
        console.warn('[WaitingRoom] Potential state inconsistency: Game should have auto-started but is still in waiting state');
        // No forzamos nada, dejamos que sea el servidor quien lo resuelva
      } else if (currentState?.status === 'question' && scheduledTime && !shouldHaveStarted) {
        console.warn('[WaitingRoom] Potential state inconsistency: Game is in question state but scheduled time has not been reached yet');
      }
      
      // Solo redirigir si la partida ya ha comenzado oficialmente
      if (currentState && (currentState.status === 'question' || currentState.status === 'result' || currentState.status === 'leaderboard')) {
        // Verificación adicional: Si no debería haber comenzado y no es auto_start, no redirigir automáticamente
        if (!shouldHaveStarted && !isAutoStart) {
          console.warn('[WaitingRoom] Game has started prematurely and auto_start is disabled. Not redirecting automatically.');
          return;
        }
        
        console.log('[WaitingRoom] Game has started, transitioning to active game screen');
        setHasGameStarted(true);
        setGameStartTransitionActive(true);
        
        gameNotifications.gameStarting();
        
        setTimeout(() => {
          setIsJoining(true);
          navigate(`/game/${gameId}`);
        }, 1500);
      }
    } catch (err) {
      console.error('[WaitingRoom] Error manually checking game state:', err);
    }
  };
  
  // Verificar periódicamente si el juego ha comenzado
  useEffect(() => {
    const checkInterval = setInterval(checkGameStateManually, 15000);
    
    // Verificar inmediatamente al montar el componente
    checkGameStateManually();
    
    return () => clearInterval(checkInterval);
  }, [gameId, lastCheckTime]);
  
  // Sincronizar countdown con el servidor cuando cambie
  useEffect(() => {
    if (gameState?.countdown) {
      syncCountdown(gameState.countdown);
    }
  }, [gameState?.countdown, syncCountdown]);

  // Detectar cambios en el estado del juego para redirigir si ha comenzado
  useEffect(() => {
    if (gameState?.status === 'question' || hasGameStarted) {
      console.log('[WaitingRoom] Game has started, transitioning to question state');
      
      if (!gameStartTransitionActive) {
        setGameStartTransitionActive(true);
        setHasGameStarted(true);
        
        gameNotifications.gameStarting();
        
        setTimeout(() => {
          setIsJoining(true);
          navigate(`/game/${gameId}`);
        }, 1500);
      }
    }
  }, [gameState, hasGameStarted, setHasGameStarted, gameId, navigate, gameStartTransitionActive]);
  
  // Manejar caso especial cuando el contador llega a cero
  useEffect(() => {
    if (countdown === 0 && !hasGameStarted && !gameStartTransitionActive) {
      console.log('[WaitingRoom] Countdown reached zero, verifying game start conditions');
      
      // Verificar si realmente es el momento de comenzar la partida
      if (gameDate && new Date() >= gameDate) {
        console.log('[WaitingRoom] Scheduled time has been reached, starting game transition');
        setGameStartTransitionActive(true);
        setHasGameStarted(true);
        
        gameNotifications.gameStarting();
        
        // Verificar estado del juego para confirmar que ha iniciado
        refreshGameState().then(() => {
          setTimeout(() => {
            setIsJoining(true);
            navigate(`/game/${gameId}`);
          }, 1500);
        });
      } else {
        console.log('[WaitingRoom] Countdown reached zero, but scheduled time has not been reached yet');
        // Re-verificar el estado de la partida con el servidor
        refreshGameState();
      }
    }
  }, [countdown, hasGameStarted, refreshGameState, gameId, navigate, gameStartTransitionActive, gameDate]);
  
  // Comprobar si la hora actual es posterior a la hora programada
  useEffect(() => {
    if (gameDate && currentTime >= gameDate && !hasGameStarted && !gameStartTransitionActive) {
      console.log(`[WaitingRoom] Current time (${currentTime.toISOString()}) is past scheduled time (${gameDate.toISOString()}), checking game state`);
      
      // Primero verificar si el estado actual es realmente "waiting"
      if (gameState?.status === 'waiting') {
        console.log('[WaitingRoom] Game is still in waiting state despite scheduled time being reached, manually checking game state');
        
        // Verificar si la partida debe iniciarse automáticamente o requiere acción del anfitrión
        // Nota: Como no tenemos acceso directo a la propiedad auto_start, siempre hacemos la verificación manual
        console.log('[WaitingRoom] Checking if game should auto-start or requires manual host action');
        
        // Forzar verificación del estado actual del juego para ver si debería haberse iniciado
        checkGameStateManually();
      } else {
        // Si el estado ya no es "waiting", verificar directamente
        checkGameStateManually();
      }
    }
  }, [gameDate, currentTime, hasGameStarted, gameStartTransitionActive, gameState?.status, checkGameStateManually]);
  
  // Cargar estado inicial al montar componente
  useEffect(() => {
    if (gameId) {
      console.log('[WaitingRoom] Refreshing game state on component mount');
      refreshGameState();
    }
  }, [gameId, refreshGameState]);

  const { isConnected, reconnectAttempts } = useGameSync(gameId);
  
  useHeartbeat(gameId);
  
  if (isJoining) {
    return <LoadingIndicator />;
  }
  
  // Fix: Wrap the function calls in promises to match the expected type
  const handlePlayNowWrapper = () => {
    return Promise.resolve(handlePlayNow());
  };
  
  const handleStartGameWrapper = () => {
    return Promise.resolve(handleStartGame());
  };
  
  return (
    <>
      <ConnectionStatus 
        isConnected={isConnected} 
        reconnectAttempts={reconnectAttempts}
      />
      <WaitingRoom 
        gameTitle={gameInfo.title || "Partida"}
        playersOnline={activeParticipants}
        isGameHost={isGameHost}
        countdown={countdown}
        hasGameStarted={hasGameStarted}
        showPulse={showPulse}
        isWithinFiveMinutes={isWithinFiveMinutes}
        formatTimeRemaining={formatTimeRemaining}
        onPlayNow={handlePlayNowWrapper}
        onStartGame={handleStartGameWrapper}
        isLoadingPlayers={isLoadingParticipants}
      />
    </>
  );
};

export default WaitingRoomContainer;
