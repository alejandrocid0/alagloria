
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

const WaitingRoomContainer = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { gameState, refreshGameState, isConnected: liveGameStateIsConnected, reconnectAttempts: liveGameStateReconnectAttempts } = useLiveGameState();
  const gameInfo = useGameInfo(gameId);
  const [isJoining, setIsJoining] = useState(false);
  const [gameStartTransitionActive, setGameStartTransitionActive] = useState(false);
  const { syncWithServer } = useTimeSync();
  
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
  
  useEffect(() => {
    if (gameState?.countdown) {
      syncCountdown(gameState.countdown);
    }
  }, [gameState?.countdown, syncCountdown]);

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
  
  useEffect(() => {
    if (countdown === 0 && !hasGameStarted && !gameStartTransitionActive) {
      console.log('[WaitingRoom] Countdown reached zero, starting game transition');
      setGameStartTransitionActive(true);
      setHasGameStarted(true);
      
      gameNotifications.gameStarting();
      
      refreshGameState().then(() => {
        setTimeout(() => {
          setIsJoining(true);
          navigate(`/game/${gameId}`);
        }, 1500);
      });
    }
  }, [countdown, hasGameStarted, refreshGameState, gameId, navigate, gameStartTransitionActive]);
  
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
