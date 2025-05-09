
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import WaitingRoom from '@/components/gameplay/WaitingRoom';
import { gameNotifications } from '@/components/ui/notification-toast';
import { useGameInfo } from '@/components/gameplay/hooks/useGameInfo';
import { useWaitingRoomState } from './hooks/useWaitingRoomState';
import { useActiveParticipants } from './hooks/useActiveParticipants';
import { useCountdown } from './hooks/useCountdown';
import { useTimeSync } from '@/hooks/liveGame/useTimeSync';
import { useGameSync } from '@/hooks/liveGame/useGameSync';
import { useHeartbeat } from '@/hooks/liveGame/useHeartbeat';
import { useGameStateManager } from '@/hooks/liveGame/useGameStateManager';
import LoadingIndicator from './LoadingIndicator';
import ConnectionStatus from '../ConnectionStatus';
import { toast } from '@/components/ui/use-toast';

const WaitingRoomContainer = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const gameInfo = useGameInfo(gameId);
  const [isJoining, setIsJoining] = useState(false);
  const [gameStartTransitionActive, setGameStartTransitionActive] = useState(false);
  const { syncWithServer } = useTimeSync();
  
  const { activeParticipants, isLoading: isLoadingParticipants, error: participantsError, refetch: refetchParticipants } = useActiveParticipants(gameId);
  
  // Usar nuestro nuevo hook para manejar el estado del juego
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
  
  // Sincronizar hora con el servidor al cargar
  useEffect(() => {
    console.log('[WaitingRoom] Synchronizing time with server');
    syncWithServer();
  }, [syncWithServer]);
  
  // Configurar countdown basado en el estado del juego o fecha programada
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

  // Función centralizada para manejar transición cuando inicia el juego
  const handleGameStartDetected = () => {
    if (gameStartTransitionActive) return;
    
    console.log('[WaitingRoom] Iniciando transición a juego activo');
    setGameStartTransitionActive(true);
    setHasGameStarted(true);
    
    gameNotifications.gameStarting();
    
    setTimeout(() => {
      setIsJoining(true);
      navigate(`/game/${gameId}`);
    }, 1500);
  };
  
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
      handleGameStartDetected();
    }
  }, [gameState?.status, hasGameStarted]);
  
  // Manejar caso especial cuando el contador llega a cero
  useEffect(() => {
    if (countdown === 0 && !hasGameStarted && !gameStartTransitionActive) {
      console.log('[WaitingRoom] Countdown reached zero, verifying game start conditions');
      
      // Verificar si realmente es el momento de comenzar la partida
      if (gameDate && new Date() >= gameDate) {
        console.log('[WaitingRoom] Scheduled time has been reached, starting game transition');
        
        // Verificar estado del juego para confirmar que ha iniciado
        refreshGameState();
      } else {
        console.log('[WaitingRoom] Countdown reached zero, but scheduled time has not been reached yet');
        // Re-verificar el estado de la partida con el servidor
        refreshGameState();
      }
    }
  }, [countdown, hasGameStarted, refreshGameState, gameDate, gameStartTransitionActive]);
  
  // Comprobar si la hora actual es posterior a la hora programada
  useEffect(() => {
    if (gameDate && currentTime >= gameDate && !hasGameStarted && !gameStartTransitionActive) {
      console.log(`[WaitingRoom] Current time (${currentTime.toISOString()}) is past scheduled time (${gameDate.toISOString()}), checking game state`);
      refreshGameState();
    }
  }, [gameDate, currentTime, hasGameStarted, gameStartTransitionActive, refreshGameState]);

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
    return (
      <div className="flex flex-col items-center justify-center h-64 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-red-600 mb-2">Error de conexión</h2>
        <p className="text-gray-700 mb-4">{gameStateError}</p>
        <button 
          onClick={() => refreshGameState()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
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
