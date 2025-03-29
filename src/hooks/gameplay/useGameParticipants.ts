
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Player } from '@/types/liveGame';
import { toast } from '@/hooks/use-toast';

export const useGameParticipants = (gameId: string | undefined) => {
  const [playersCount, setPlayersCount] = useState(0);
  const [playersOnline, setPlayersOnline] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
  
  // Función para cargar los participantes
  const loadParticipants = useCallback(async () => {
    if (!gameId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`[GameParticipants] Cargando participantes para juego ${gameId}`);
      
      const { data, error } = await supabase
        .from('game_participants')
        .select('user_id, profiles:user_id(name, avatar_url)')
        .eq('game_id', gameId);
          
      if (error) throw error;
      
      if (data) {
        console.log('[GameParticipants] Participantes cargados:', data.length);
        
        const formattedPlayers = data.map((p, index) => {
          const profileData = p.profiles as any;
          return {
            id: p.user_id,
            name: profileData?.name || `Jugador ${index + 1}`,
            points: 0,
            rank: index + 1,
            avatar: profileData?.avatar_url || undefined,
            lastAnswer: null
          };
        });
        
        setPlayersOnline(formattedPlayers);
        setPlayersCount(data.length);
        setLastRefreshTime(Date.now());
      }
    } catch (err) {
      console.error('[GameParticipants] Error al cargar participantes:', err);
      setError('Error al cargar participantes');
      
      // Notificar al usuario del error solo si no se ha notificado recientemente
      const timeSinceLastRefresh = Date.now() - lastRefreshTime;
      if (timeSinceLastRefresh > 30000) { // Solo mostrar toast cada 30 segundos
        toast({
          title: "Error al cargar participantes",
          description: "No se pudieron cargar los participantes. Intenta refrescar la página.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [gameId, lastRefreshTime]);
  
  // Función para reintentar la carga después de un error
  const retryLoading = useCallback(() => {
    loadParticipants();
  }, [loadParticipants]);
  
  // Carga inicial y suscripción a cambios
  useEffect(() => {
    if (!gameId) return;
    
    // Carga inicial
    loadParticipants();
    
    // Suscribirse a cambios en participantes con una mejor configuración
    const participantsChannel = supabase
      .channel(`game-participants-${gameId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'game_participants',
          filter: `game_id=eq.${gameId}`
        }, 
        (payload) => {
          console.log('[GameParticipants] Cambio en participantes detectado:', payload);
          // Usar un pequeño delay para permitir que la base de datos se actualice completamente
          setTimeout(() => {
            loadParticipants();
          }, 300);
        }
      )
      .subscribe((status) => {
        console.log('[GameParticipants] Estado de suscripción:', status);
        if (status === 'SUBSCRIBED') {
          console.log('[GameParticipants] Suscripción a participantes activa');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[GameParticipants] Error en canal de suscripción');
          setError('Error en la conexión en tiempo real');
        }
      });
      
    // Configurar un refresco periódico como respaldo
    const refreshInterval = setInterval(() => {
      console.log('[GameParticipants] Refresco periódico de participantes');
      loadParticipants();
    }, 30000); // Cada 30 segundos
    
    return () => {
      console.log('[GameParticipants] Cancelando suscripción a participantes');
      supabase.removeChannel(participantsChannel);
      clearInterval(refreshInterval);
    };
  }, [gameId, loadParticipants]);
  
  return {
    playersCount,
    playersOnline,
    isLoading,
    error,
    reloadParticipants: loadParticipants,
    retryLoading
  };
};
