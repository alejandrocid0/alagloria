
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Service for handling all real-time sync operations
 */
export const realTimeSync = {
  subscribeToTable: (
    channelName: string,
    table: string,
    filter: Record<string, any>,
    callback: (payload: any) => void
  ): RealtimeChannel => {
    console.log(`[RealTimeSync] Subscribing to ${table} with filter:`, filter);
    
    // Crear un nombre único para el canal basado en los parámetros
    const channelId = `${channelName}-${table}-${JSON.stringify(filter)}`;
    
    try {
      // Crear un nuevo canal de Supabase con configuración específica
      const channel = supabase.channel(channelId, {
        config: {
          broadcast: { self: true },
          presence: { key: channelId },
        },
      });

      // Configurar el listener para cambios en la base de datos usando el método correcto
      channel.on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: table,
          filter: filter
        },
        (payload) => {
          console.log(`[RealTimeSync] Received update for ${table}:`, payload);
          callback(payload);
        }
      );

      // Suscribirse al canal y manejar el estado de la conexión
      channel.subscribe((status) => {
        console.log(`[RealTimeSync] Channel ${channelId} status:`, status);
        
        if (status === 'SUBSCRIBED') {
          console.log(`[RealTimeSync] Successfully subscribed to ${table}`);
        }
        
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.error(`[RealTimeSync] Channel error or closed for ${table}`);
          // Intentar reconectar después de un error
          setTimeout(() => {
            console.log(`[RealTimeSync] Attempting to reconnect to ${table}`);
            channel.subscribe();
          }, 5000);
        }
      });

      return channel;
    } catch (error) {
      console.error('[RealTimeSync] Error creating channel:', error);
      throw error;
    }
  },

  subscribeToGameState: (gameId: string, callback: (payload: any) => void): RealtimeChannel => {
    return realTimeSync.subscribeToTable(
      `game-state-${gameId}`,
      'live_games',
      { id: `eq.${gameId}` },
      callback
    );
  },

  subscribeToParticipants: (gameId: string, callback: (payload: any) => void): RealtimeChannel => {
    return realTimeSync.subscribeToTable(
      `participants-${gameId}`,
      'game_participants',
      { game_id: `eq.${gameId}` },
      callback
    );
  },

  subscribeToAnswers: (gameId: string, callback: (payload: any) => void): RealtimeChannel => {
    return realTimeSync.subscribeToTable(
      `answers-${gameId}`,
      'live_game_answers',
      { game_id: `eq.${gameId}` },
      callback
    );
  },

  subscribeToLeaderboard: (gameId: string, callback: (payload: any) => void): RealtimeChannel => {
    return realTimeSync.subscribeToTable(
      `leaderboard-${gameId}`,
      'live_game_answers',
      { game_id: `eq.${gameId}` },
      callback
    );
  },

  unsubscribe: (channel: RealtimeChannel): void => {
    if (channel) {
      console.log('[RealTimeSync] Unsubscribing from channel');
      supabase.removeChannel(channel);
    }
  }
};
