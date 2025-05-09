
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import WaitingRoom from '@/components/gameplay/WaitingRoom';
import { useGameInfo } from '@/components/gameplay/hooks/useGameInfo';
import { useWaitingRoomState } from './hooks/useWaitingRoomState';
import { useActiveParticipants } from './hooks/useActiveParticipants';
import { useCountdown } from './hooks/useCountdown';
import { useGameStateManager } from '@/hooks/liveGame/useGameStateManager';
import { useGameSync } from '@/hooks/liveGame/useGameSync';
import { useHeartbeat } from '@/hooks/liveGame/useHeartbeat';
import { useGameStartTransition } from './hooks/useGameStartTransition';
import { useParticipantsError } from './hooks/useParticipantsError';
import LoadingIndicator from './LoadingIndicator';
import ConnectionStatus from '../ConnectionStatus';
import ErrorView from './ErrorView';

const WaitingRoomContainer = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const gameInfo = useGameInfo(gameId);
  
  // Obtener participantes activos
  const { 
    activeParticipants, 
    isLoading: isLoadingParticipants, 
    error: participantsError, 
    refetch: refetchParticipants 
  } = useActiveParticipants(gameId);
  
  // Manejar errores de participantes
  useParticipantsError(participantsError, refetchParticipants);
  
  // Estado del juego
  const { 
    gameState, 
    isLoading: isLoadingGameState, 
    error: gameStateError,
    refreshGameState
  } = useGameStateManager({
    gameId,
    onStateChange: (newState) => {
      console.log(`[WaitingRoom] Estado del juego actualizado: ${newState.status}`);
    },
    onGameStart: () => {
      console.log('[WaitingRoom] Juego iniciado, preparando transición');
      handleGameStartDetected();
    }
  });
  
  // Configurar countdown basado en el estado del juego o fecha programada
  const initialCountdown = gameState?.countdown || 0;
  const gameDate = gameInfo?.date ? new Date(gameInfo.date) : null;
  const currentTime = new Date();
  const millisecondsUntilStart = gameDate ? Math.max(0, gameDate.getTime() - currentTime.getTime()) : 0;
  const secondsUntilStart = Math.max(0, Math.floor(millisecondsUntilStart / 1000));
  
  console.log(`[WaitingRoom] Game scheduled time: ${gameDate?.toISOString()}, current time: ${currentTime.toISOString()}, seconds until start: ${secondsUntilStart}`);
  
  // Gestión de transición al inicio del juego
  const {
    isJoining,
    setIsJoining,
    hasGameStarted,
    setHasGameStarted,
    handleGameStartDetected
  } = useGameStartTransition({
    gameId,
    countdown: initialCountdown > 0 ? initialCountdown : secondsUntilStart,
    gameDate,
    gameState,
    refreshGameState
  });
  
  // Configurar el contador de tiempo
  const {
    countdown,
    showPulse,
    isWithinFiveMinutes,
    formatTimeRemaining,
    syncCountdown
  } = useCountdown(
    initialCountdown > 0 ? initialCountdown : secondsUntilStart, 
    gameId
  );
  
  // Sincronizar countdown con el servidor cuando cambie
  useEffect(() => {
    if (gameState?.countdown) {
      syncCountdown(gameState.countdown);
    }
  }, [gameState?.countdown, syncCountdown]);
  
  // Acciones de la sala de espera
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
  
  // Sincronización y heartbeat
  const { isConnected, reconnectAttempts } = useGameSync(gameId);
  useHeartbeat(gameId);
  
  if (isJoining) {
    return <LoadingIndicator />;
  }
  
  // Mostrar pantalla de carga mientras se obtiene el estado inicial
  if (isLoadingGameState && !gameState) {
    return <LoadingIndicator />;
  }
  
  // Mostrar error si hay problemas con el estado del juego
  if (gameStateError && !gameState) {
    return <ErrorView error={gameStateError} onRetry={refreshGameState} />;
  }
  
  // Funciones wrapper con promise para mantener compatibilidad
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
