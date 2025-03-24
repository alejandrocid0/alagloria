
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { gameService } from '@/services/gameService';
import { fetchGamesFromSupabase } from '@/components/games/gamesUtils';
import { Game } from '@/components/games/types';
import { supabase } from '@/integrations/supabase/client';
import { useCheckGameJoin } from '@/hooks/useCheckGameJoin';

export const useJoinGame = (gameId: string | undefined) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [gameData, setGameData] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Use our custom hook to check if the user has already joined
  const { hasJoined: paymentComplete, checkingStatus } = useCheckGameJoin(
    gameId || '', 
    user?.id || null
  );
  
  const fetchGameData = useCallback(async () => {
    try {
      setLoading(true);
      setConnectionError(null);
      
      const games = await fetchGamesFromSupabase();
      const game = games.find(g => g.id === gameId);
      
      if (!game) {
        toast({
          title: "Partida no encontrada",
          description: "No se pudo encontrar la partida especificada",
          variant: "destructive"
        });
        navigate("/games");
        return;
      }
      
      setGameData(game);
    } catch (error) {
      console.error("Error fetching game:", error);
      setConnectionError("Error de conexión al cargar la partida");
      toast({
        title: "Error al cargar la partida",
        description: "No se pudo cargar la información de la partida. Comprueba tu conexión.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [gameId, navigate]);

  // Handler for retry fetching in case of connection issues
  const handleRetry = () => {
    fetchGameData();
  };
  
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Inicia sesión para unirte",
        description: "Necesitas iniciar sesión para participar en las partidas",
        variant: "destructive"
      });
      navigate("/login", { state: { redirectTo: `/join/${gameId}` } });
      return;
    }
    
    fetchGameData();
    
    // Set up real-time subscription for updates
    if (gameId) {
      const channel = supabase
        .channel(`game-${gameId}`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'game_participants',
            filter: `game_id=eq.${gameId}`
          }, 
          () => {
            fetchGameData();
          }
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            console.error('Subscription error');
            // Handle subscription error silently without disrupting UX
          }
        });
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [gameId, isAuthenticated, navigate, user, fetchGameData]);
  
  const handleJoinGame = async () => {
    if (!user || !gameId || !gameData) return;
    
    setIsProcessing(true);
    
    try {
      await gameService.joinGame(gameId, user.id);
      
      toast({
        title: "¡Inscripción completada!",
        description: "Te has unido a la partida correctamente",
      });
    } catch (error) {
      console.error("Error joining game:", error);
      toast({
        title: "Error al unirse",
        description: "No se pudo completar la inscripción. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return {
    gameData,
    loading,
    checkingStatus,
    paymentComplete,
    isProcessing,
    connectionError,
    handleJoinGame,
    handleRetry,
    formatDate
  };
};
