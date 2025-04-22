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

const WaitingRoomContainer = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { gameState, refreshGameState, isConnected: liveGameStateIsConnected, reconnectAttempts: liveGameStateReconnectAttempts } = useLiveGameState();
  const gameInfo = useGameInfo(gameId);
  const [isJoining, setIsJoining] = useState(false);
  const [gameStartTransitionActive, setGameStartTransitionActive] = useState(false);
  const { syncWithServer } = useTimeSync();
  
  // Obtener los participantes del juego
  const { playersOnline } = useParticipants(gameId);
  
  // Estado y acciones de la sala de espera
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
  
  // Sincronizar tiempo con el servidor al inicio
  useEffect(() => {
    console.log('[WaitingRoom] Synchronizing time with server');
    syncWithServer();
  }, [syncWithServer]);
  
  // Determinar tiempo inicial para la cuenta regresiva
  const initialCountdown = gameState?.countdown || 0;
  const gameDate = gameInfo?.date ? new Date(gameInfo.date) : null;
  const currentTime = new Date();
  const millisecondsUntilStart = gameDate ? Math.max(0, gameDate.getTime() - currentTime.getTime()) : 0;
  const secondsUntilStart = Math.max(0, Math.floor(millisecondsUntilStart / 1000));
  
  // Hook de cuenta regresiva con la implementación refactorizada
  const {
    countdown,
    hasGameStarted,
    showPulse,
    isWithinFiveMinutes,
    formatTimeRemaining,
    setHasGameStarted,
    syncCountdown
  } = useCountdown(initialCountdown > 0 ? initialCountdown : secondsUntilStart, gameId);

  // Verificación de partidas programadas
  useScheduledGamesCheck({
    gameId,
    countdown,
    refreshGameState
  });
  
  // Sincronizar countdown con el servidor cuando cambie
  useEffect(() => {
    if (gameState?.countdown) {
      syncCountdown(gameState.countdown);
    }
  }, [gameState?.countdown, syncCountdown]);

  // Verificar si la partida ya comenzó
  useEffect(() => {
    if (gameState?.status === 'question' || hasGameStarted) {
      console.log('[WaitingRoom] Game has started, transitioning to question state');
      
      if (!gameStartTransitionActive) {
        setGameStartTransitionActive(true);
        setHasGameStarted(true);
        
        // Mostrar notificación
        gameNotifications.gameStarting();
        
        // Redireccionar tras un breve retraso
        setTimeout(() => {
          setIsJoining(true);
          navigate(`/game/${gameId}`);
        }, 1500);
      }
    }
  }, [gameState, hasGameStarted, setHasGameStarted, gameId, navigate, gameStartTransitionActive]);
  
  // Iniciar transición automática cuando el contador llega a cero
  useEffect(() => {
    if (countdown === 0 && !hasGameStarted && !gameStartTransitionActive) {
      console.log('[WaitingRoom] Countdown reached zero, starting game transition');
      setGameStartTransitionActive(true);
      setHasGameStarted(true);
      
      // Notificar al usuario
      gameNotifications.gameStarting();
      
      // Intentar actualizar el estado del juego
      refreshGameState().then(() => {
        // Redireccionar incluso si refreshGameState falla
        setTimeout(() => {
          setIsJoining(true);
          navigate(`/game/${gameId}`);
        }, 1500);
      });
    }
  }, [countdown, hasGameStarted, refreshGameState, gameId, navigate, gameStartTransitionActive]);
  
  // Actualizar estado del juego al cargar
  useEffect(() => {
    if (gameId) {
      console.log('[WaitingRoom] Refreshing game state on component mount');
      refreshGameState();
    }
  }, [gameId, refreshGameState]);

  // Use our new game sync hook
  const { isConnected, reconnectAttempts } = useGameSync(gameId);
  
  // Si estamos en proceso de unirse a la partida, mostrar indicador de carga
  if (isJoining) {
    return <LoadingIndicator />;
  }
  
  return (
    <>
      <ConnectionStatus 
        isConnected={isConnected} 
        reconnectAttempts={reconnectAttempts}
      />
      <WaitingRoom 
        gameTitle={gameInfo.title || "Partida"}
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
    </>
  );
};

export default WaitingRoomContainer;
