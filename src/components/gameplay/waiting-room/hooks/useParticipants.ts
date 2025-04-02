
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Player } from '@/types/liveGame';

export const useParticipants = (gameId: string | undefined) => {
  const [playersOnline, setPlayersOnline] = useState<Player[]>([]);

  // Función para obtener los participantes del juego
  const fetchParticipants = useCallback(async () => {
    if (!gameId) return;
    
    try {
      console.log('[Participants] Obteniendo participantes para el juego:', gameId);
      
      // Primero obtener los IDs de usuario que participan en este juego
      const { data: participantsData, error: participantsError } = await supabase
        .from('game_participants')
        .select('user_id')
        .eq('game_id', gameId);
        
      if (participantsError) {
        console.error('[Participants] Error obteniendo participantes:', participantsError);
        throw participantsError;
      }
      
      if (participantsData && participantsData.length > 0) {
        console.log(`[Participants] Encontrados ${participantsData.length} participantes`);
        
        // Extraer los IDs de usuario y obtener sus perfiles
        const userIds = participantsData.map(p => p.user_id);
        
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', userIds);
          
        if (profilesError) {
          console.error('[Participants] Error obteniendo perfiles:', profilesError);
          throw profilesError;
        }
        
        if (profiles) {
          console.log(`[Participants] Obtenidos ${profiles.length} perfiles de usuario`);
          
          // Convertir los perfiles al formato requerido para la lista de jugadores
          const participants = profiles.map((profile, index) => ({
            id: profile.id,
            name: profile.name,
            points: 0,
            rank: index + 1,
            lastAnswer: null,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=5D3891&color=fff`
          }));
          
          setPlayersOnline(participants);
        }
      } else {
        console.log('[Participants] No se encontraron participantes para este juego');
        setPlayersOnline([]);
      }
    } catch (err) {
      console.error('[Participants] Error en fetchParticipants:', err);
      toast({
        title: "Error",
        description: "No se pudieron cargar los participantes",
        variant: "destructive"
      });
    }
  }, [gameId]);

  // Suscribirse a cambios en los participantes
  useEffect(() => {
    if (!gameId) return;
    
    console.log('[Participants] Configurando suscripción a participantes del juego:', gameId);
    fetchParticipants();
    
    // Usar un canal específico con un nombre basado en el ID del juego
    const channelName = `game-participants-${gameId}`;
    console.log('[Participants] Creando canal de tiempo real:', channelName);
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'game_participants',
          filter: `game_id=eq.${gameId}`
        },
        (payload) => {
          console.log('[Participants] Cambio detectado en participantes:', payload);
          fetchParticipants();
        }
      )
      .subscribe((status) => {
        console.log(`[Participants] Estado de la suscripción a participantes: ${status}`);
      });
      
    return () => {
      console.log('[Participants] Limpiando suscripción a participantes');
      supabase.removeChannel(channel);
    };
  }, [gameId, fetchParticipants]);

  return { playersOnline, fetchParticipants };
};

export default useParticipants;
