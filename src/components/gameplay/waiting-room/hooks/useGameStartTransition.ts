
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameNotifications } from '@/components/ui/notification-toast';
import { useTimeSync } from '@/hooks/liveGame/useTimeSync';

interface UseGameStartTransitionProps {
  gameId: string | undefined;
  countdown: number | null;
  gameDate: Date | null;
  gameState: any;
  refreshGameState: () => void;
}

export const useGameStartTransition = ({
  gameId,
  countdown,
  gameDate,
  gameState,
  refreshGameState
}: UseGameStartTransitionProps) => {
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [gameStartTransitionActive, setGameStartTransitionActive] = useState(false);
  const { syncWithServer } = useTimeSync();

  // Función centralizada para manejar transición cuando inicia el juego
  const handleGameStartDetected = useCallback(() => {
    if (gameStartTransitionActive) return;
    
    console.log('[WaitingRoom] Iniciando transición a juego activo');
    setGameStartTransitionActive(true);
    setHasGameStarted(true);
    
    gameNotifications.gameStarting();
    
    setTimeout(() => {
      setIsJoining(true);
      if (gameId) {
        navigate(`/game/${gameId}`);
      }
    }, 1500);
  }, [gameStartTransitionActive, navigate, gameId]);

  // Detectar cambios en el estado del juego para redirigir si ha comenzado
  useEffect(() => {
    if (gameState?.status === 'question' || hasGameStarted) {
      console.log('[WaitingRoom] Game has started, transitioning to question state');
      handleGameStartDetected();
    }
  }, [gameState?.status, hasGameStarted, handleGameStartDetected]);
  
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
    const currentTime = new Date();
    if (gameDate && currentTime >= gameDate && !hasGameStarted && !gameStartTransitionActive) {
      console.log(`[WaitingRoom] Current time (${currentTime.toISOString()}) is past scheduled time (${gameDate.toISOString()}), checking game state`);
      refreshGameState();
    }
  }, [gameDate, hasGameStarted, gameStartTransitionActive, refreshGameState]);

  // Sincronizar hora con el servidor al cargar
  useEffect(() => {
    console.log('[WaitingRoom] Synchronizing time with server');
    syncWithServer();
  }, [syncWithServer]);
  
  return {
    isJoining,
    setIsJoining,
    hasGameStarted,
    setHasGameStarted,
    handleGameStartDetected,
    gameStartTransitionActive
  };
};
