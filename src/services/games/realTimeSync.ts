
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Servicio para manejar todas las operaciones de sincronización en tiempo real
 */
export const realTimeSync = {
  /**
   * Crea una suscripción a una tabla específica
   * @param channelName Nombre único para el canal
   * @param table Nombre de la tabla a suscribirse
   * @param filter Condición de filtrado (opcional)
   * @param callback Función a ejecutar cuando se reciben cambios
   * @returns Canal de tiempo real para limpieza posterior
   */
  subscribeToTable: (
    channelName: string,
    table: string,
    filter: Record<string, any>,
    callback: (payload: any) => void
  ): RealtimeChannel => {
    console.log(`[RealTimeSync] Suscribiéndose a ${table} con filtro:`, filter);
    
    // Crear un nombre de canal específico
    const fullChannelName = `${channelName}-${table}-${JSON.stringify(filter)}`;
    
    // Configurar la suscripción con los filtros adecuados
    const channel = supabase.channel(fullChannelName);
      
    channel.on(
      'postgres_changes',
      { 
        event: '*',  // Escuchar todos los eventos (INSERT, UPDATE, DELETE)
        schema: 'public', 
        table: table,
        filter: filter
      },
      (payload) => {
        console.log(`[RealTimeSync] Evento recibido en ${table}:`, payload);
        callback(payload);
      }
    )
    .subscribe((status) => {
      console.log(`[RealTimeSync] Estado de la suscripción a ${table}: ${status}`);
    });
    
    return channel;
  },

  /**
   * Crea una suscripción específica para cambios en el estado del juego
   * @param gameId ID del juego
   * @param callback Función a ejecutar cuando cambia el estado del juego
   * @returns Canal de tiempo real para limpieza posterior
   */
  subscribeToGameState: (gameId: string, callback: (payload: any) => void): RealtimeChannel => {
    return realTimeSync.subscribeToTable(
      `game-state-${gameId}`,
      'live_games',
      { id: `eq.${gameId}` },
      callback
    );
  },

  /**
   * Crea una suscripción específica para cambios en los participantes de un juego
   * @param gameId ID del juego
   * @param callback Función a ejecutar cuando cambian los participantes
   * @returns Canal de tiempo real para limpieza posterior
   */
  subscribeToParticipants: (gameId: string, callback: (payload: any) => void): RealtimeChannel => {
    return realTimeSync.subscribeToTable(
      `participants-${gameId}`,
      'game_participants',
      { game_id: `eq.${gameId}` },
      callback
    );
  },

  /**
   * Crea una suscripción específica para cambios en las respuestas de un juego
   * @param gameId ID del juego
   * @param callback Función a ejecutar cuando hay nuevas respuestas
   * @returns Canal de tiempo real para limpieza posterior
   */
  subscribeToAnswers: (gameId: string, callback: (payload: any) => void): RealtimeChannel => {
    return realTimeSync.subscribeToTable(
      `answers-${gameId}`,
      'live_game_answers',
      { game_id: `eq.${gameId}` },
      callback
    );
  },

  /**
   * Crea una suscripción específica para cambios en el leaderboard de un juego
   * @param gameId ID del juego
   * @param callback Función a ejecutar cuando cambia el leaderboard
   * @returns Canal de tiempo real para limpieza posterior
   */
  subscribeToLeaderboard: (gameId: string, callback: (payload: any) => void): RealtimeChannel => {
    // Para el leaderboard, monitoreamos los cambios en las respuestas ya que es lo que afecta al leaderboard
    return realTimeSync.subscribeToTable(
      `leaderboard-${gameId}`,
      'live_game_answers',
      { game_id: `eq.${gameId}` },
      callback
    );
  },

  /**
   * Elimina una suscripción cuando ya no es necesaria
   * @param channel Canal a eliminar
   */
  unsubscribe: (channel: RealtimeChannel): void => {
    if (channel) {
      console.log('[RealTimeSync] Eliminando suscripción');
      supabase.removeChannel(channel);
    }
  }
};
