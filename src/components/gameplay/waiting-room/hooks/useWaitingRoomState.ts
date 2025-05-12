
import { useState, useCallback } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { gameNotifications } from '@/components/ui/notification-toast';

interface UseWaitingRoomStateProps {
  gameId: string | undefined;
  gameInfo: any;
  user: User | null;
  navigate: NavigateFunction;
  setIsJoining: (value: boolean) => void;
}

export const useWaitingRoomState = ({
  gameId,
  gameInfo,
  user,
  navigate,
  setIsJoining
}: UseWaitingRoomStateProps) => {
  // Determinar si el usuario es el anfitrión de la partida
  // Para la demo o si no hay usuario, no consideramos al usuario como anfitrión
  const isGameHost = user && gameInfo?.created_by === user?.id;
  
  // Manejar la acción de jugar ahora
  const handlePlayNow = useCallback(() => {
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
  }, [gameId, navigate, setIsJoining]);
  
  // Manejar inicio manual de la partida (solo para anfitriones)
  const handleStartGame = useCallback(async () => {
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
  }, [gameId, isGameHost, navigate, setIsJoining]);

  return {
    isGameHost,
    handlePlayNow,
    handleStartGame
  };
};

export default useWaitingRoomState;
