
import { useState, useEffect } from 'react';
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

  // Use our custom hook to check if the user has already joined
  const { hasJoined: paymentComplete, checkingStatus } = useCheckGameJoin(
    gameId || '', 
    user?.id || null
  );
  
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
    
    const fetchGameData = async () => {
      try {
        setLoading(true);
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
        
        // Add mock prize distribution if not already present
        if (!game.prizeDistribution) {
          game.prizeDistribution = [
            { position: 1, percentage: 50, amount: Math.round(game.prizePool * 0.5) },
            { position: 2, percentage: 30, amount: Math.round(game.prizePool * 0.3) },
            { position: 3, percentage: 20, amount: Math.round(game.prizePool * 0.2) }
          ];
        }
        
        setGameData(game);
      } catch (error) {
        console.error("Error fetching game:", error);
        toast({
          title: "Error al cargar la partida",
          description: "No se pudo cargar la información de la partida",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchGameData();
    
    // Configurar suscripción en tiempo real para actualizaciones
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
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [gameId, isAuthenticated, navigate, user]);
  
  const handleJoinGame = async () => {
    if (!user || !gameId || !gameData) return;
    
    setIsProcessing(true);
    
    try {
      await gameService.joinGame(gameId, user.id);
      
      toast({
        title: "¡Pago completado!",
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
    handleJoinGame,
    formatDate
  };
};
