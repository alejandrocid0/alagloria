
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { fetchGameState } from '@/hooks/liveGame/gameStateUtils';
import { useTimeSync } from '@/hooks/liveGame/useTimeSync';

export const useGamePlayRoute = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isWaitingMode, setIsWaitingMode] = useState(true);
  const [gameInfo, setGameInfo] = useState<{ title: string; scheduledTime: string | null; }>({ 
    title: '', 
    scheduledTime: null 
  });
  const [isGameActive, setIsGameActive] = useState(false);
  const { getAdjustedTime } = useTimeSync();
  
  // Función para verificar si la URL actual es para modo de espera
  const checkIfWaitingMode = useCallback(() => {
    const isWaiting = window.location.pathname.includes('/waiting');
    setIsWaitingMode(isWaiting);
  }, []);
  
  // Función para obtener información del juego
  const fetchGameInfo = useCallback(async () => {
    if (!gameId) return;
    
    try {
      const { data, error } = await supabase
        .from('games')
        .select('title, date')
        .eq('id', gameId)
        .single();
      
      if (error) throw error;
      
      setGameInfo({
        title: data.title,
        scheduledTime: data.date
      });
    } catch (err) {
      console.error('Error fetching game info:', err);
    }
  }, [gameId]);
  
  // Función para verificar si el juego está activo
  const checkGameActive = useCallback(async () => {
    if (!gameId) return;
    
    try {
      const gameState = await fetchGameState(gameId);
      
      // El juego está activo si existe y no está en estado de espera
      const isActive = gameState && gameState.status !== 'waiting';
      setIsGameActive(isActive);
      
      return isActive;
    } catch (err) {
      console.error('Error checking if game is active:', err);
      return false;
    }
  }, [gameId]);
  
  // Función para actualizar todos los datos (expuesta para permitir recargas manuales)
  const refreshGameState = useCallback(async () => {
    if (!gameId) return;
    
    const isActive = await checkGameActive();
    
    // Si el juego está activo pero estamos en modo espera, verificar si debemos redirigir
    if (isActive && isWaitingMode) {
      // Verificar si ya es hora del juego
      if (gameInfo.scheduledTime) {
        const currentTime = getAdjustedTime();
        const gameTime = new Date(gameInfo.scheduledTime).getTime();
        
        // Si ya pasó la hora programada, considerar el juego activo
        if (currentTime >= gameTime) {
          setIsGameActive(true);
        }
      }
    }
  }, [gameId, checkGameActive, isWaitingMode, gameInfo.scheduledTime, getAdjustedTime]);
  
  // Efecto inicial para cargar todos los datos necesarios
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      checkIfWaitingMode();
      
      await fetchGameInfo();
      await checkGameActive();
      
      setIsLoading(false);
    };
    
    initialize();
    
    // También subscribirse a cambios en la navegación
    const handleLocationChange = () => {
      checkIfWaitingMode();
    };
    
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [gameId, checkIfWaitingMode, fetchGameInfo, checkGameActive]);
  
  // Efecto para verificar periódicamente si el juego está activo
  useEffect(() => {
    if (!gameId || !isWaitingMode) return;
    
    // Verificar cada 10 segundos si el juego está activo
    const intervalId = setInterval(refreshGameState, 10000);
    
    return () => clearInterval(intervalId);
  }, [gameId, isWaitingMode, refreshGameState]);
  
  return {
    gameId,
    user,
    isLoading,
    isWaitingMode,
    gameInfo,
    isGameActive,
    refreshGameState
  };
};
