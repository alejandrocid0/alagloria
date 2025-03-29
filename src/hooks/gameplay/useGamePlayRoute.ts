
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { fetchGameState } from '@/hooks/liveGame/gameStateUtils';
import { gameNotifications } from '@/components/ui/notification-toast';
import { useGameInfo } from '@/components/gameplay/hooks/useGameInfo';

export const useGamePlayRoute = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { gameId, mode } = useParams<{ gameId: string; mode?: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isWithinFiveMinutes, setIsWithinFiveMinutes] = useState(false);
  
  // Get game info
  const gameInfo = useGameInfo(gameId);
  
  // Determine if we're in waiting mode
  const isWaitingMode = mode === 'waiting';
  
  // Check if game is active
  const checkGameActive = useCallback(async () => {
    if (!gameId) return;
    
    try {
      console.log('[GamePlayRoute] Verificando estado del juego:', gameId);
      const gameState = await fetchGameState(gameId);
      
      if (gameState) {
        console.log('[GamePlayRoute] Estado del juego:', gameState.status);
        // Si el juego está en cualquier estado diferente a "pending", se considera activo
        const active = gameState.status !== 'pending';
        setIsGameActive(active);
        
        // Si estamos en modo espera pero el juego ya está activo, redirigir a juego en vivo
        if (isWaitingMode && active && gameState.status !== 'waiting') {
          console.log('[GamePlayRoute] Juego activo detectado mientras estábamos en sala de espera, redirigiendo a juego en vivo');
          gameNotifications.gameStarting();
          
          setTimeout(() => {
            navigate(`/game/${gameId}`);
          }, 1500);
        }
      }
    } catch (err) {
      console.error('[GamePlayRoute] Error al verificar estado del juego:', err);
    }
  }, [gameId, isWaitingMode, navigate]);
  
  // Handle redirect to login if not authenticated
  useEffect(() => {
    if (user) {
      setIsLoading(false);
    } else {
      const timeout = setTimeout(() => {
        setIsLoading(false);
        if (!user) {
          navigate('/login', { state: { from: location.pathname } });
        }
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [user, navigate]);
  
  // Check if game is active and update isWithinFiveMinutes
  useEffect(() => {
    checkGameActive();
    
    // Check if we're within 5 minutes of game start
    if (gameInfo.scheduledTime) {
      const currentTime = new Date();
      const scheduledTime = new Date(gameInfo.scheduledTime);
      const timeUntilStart = Math.max(0, Math.floor((scheduledTime.getTime() - currentTime.getTime()) / 1000));
      
      setIsWithinFiveMinutes(timeUntilStart <= 300); // 5 minutes = 300 seconds
      console.log(`[GamePlayRoute] Tiempo hasta el inicio: ${timeUntilStart}s, dentro de 5 minutos: ${timeUntilStart <= 300}`);
    }
    
    // Periodically check if game became active
    const intervalId = setInterval(() => {
      if (isWaitingMode) {
        checkGameActive();
      }
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [gameId, isWaitingMode, navigate, checkGameActive, gameInfo.scheduledTime]);
  
  // Check if we should redirect based on scheduled time
  useEffect(() => {
    if (!isLoading && !isWaitingMode && gameInfo.scheduledTime) {
      const currentTime = new Date();
      const scheduledTime = new Date(gameInfo.scheduledTime);
      const isBeforeGameStart = currentTime < scheduledTime;
      
      // Calculate minutes until start
      const minutesUntilStart = isBeforeGameStart 
        ? Math.ceil((scheduledTime.getTime() - currentTime.getTime()) / (1000 * 60)) 
        : 0;
      
      // If more than 5 minutes before start and not in waiting room, redirect
      if (isBeforeGameStart && minutesUntilStart > 5 && !isWaitingMode) {
        console.log(`[GamePlayRoute] Partida programada para dentro de ${minutesUntilStart} minutos, redirigiendo a sala de espera...`);
        navigate(`/game/${gameId}/waiting`);
      }
    }
  }, [isLoading, gameInfo.scheduledTime, isWaitingMode, gameId, navigate]);
  
  return {
    gameId,
    user,
    isLoading,
    isWaitingMode,
    gameInfo,
    isGameActive,
    isWithinFiveMinutes
  };
};
