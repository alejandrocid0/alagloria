import { connectionManager } from '../websocket/ConnectionManager';

/**
 * Versión mejorada del servicio de sincronización en tiempo real
 * que usa el gestor centralizado de conexiones
 */
export const enhancedRealTimeSync = {
  /**
   * Suscribirse a cambios en una tabla específica con filtros
   */
  subscribeToTable: (
    channelName: string,
    table: string,
    filter: Record<string, any>,
    callback: (payload: any) => void
  ): { channel: string, unsubscribe: () => void } => {
    console.log(`[EnhancedRealTimeSync] Suscribiendo a ${table} con filtro:`, filter);
    
    try {
      // Usar el gestor de conexiones centralizado
      const callbackId = connectionManager.subscribeToTable(
        table,
        filter,
        '*', // Todos los eventos (INSERT, UPDATE, DELETE)
        callback
      );
      
      // Devolver objeto con método para cancelar suscripción
      return { 
        channel: callbackId,
        unsubscribe: () => connectionManager.unsubscribe(callbackId)
      };
    } catch (error) {
      console.error('[EnhancedRealTimeSync] Error creando suscripción:', error);
      throw error;
    }
  },

  /**
   * Suscribirse a cambios en el estado del juego
   */
  subscribeToGameState: (gameId: string, callback: (payload: any) => void): { channel: string, unsubscribe: () => void } => {
    return enhancedRealTimeSync.subscribeToTable(
      `game-state-${gameId}`,
      'live_games',
      { id: `eq.${gameId}` },
      callback
    );
  },

  /**
   * Suscribirse a cambios en los participantes
   */
  subscribeToParticipants: (gameId: string, callback: (payload: any) => void): { channel: string, unsubscribe: () => void } => {
    return enhancedRealTimeSync.subscribeToTable(
      `participants-${gameId}`,
      'game_participants',
      { game_id: `eq.${gameId}` },
      callback
    );
  },

  /**
   * Suscribirse a cambios en las respuestas
   */
  subscribeToAnswers: (gameId: string, callback: (payload: any) => void): { channel: string, unsubscribe: () => void } => {
    return enhancedRealTimeSync.subscribeToTable(
      `answers-${gameId}`,
      'live_game_answers',
      { game_id: `eq.${gameId}` },
      callback
    );
  },

  /**
   * Suscribirse a cambios en el leaderboard
   */
  subscribeToLeaderboard: (gameId: string, callback: (payload: any) => void): { channel: string, unsubscribe: () => void } => {
    return enhancedRealTimeSync.subscribeToTable(
      `leaderboard-${gameId}`,
      'live_game_answers',
      { game_id: `eq.${gameId}` },
      callback
    );
  },

  /**
   * Obtener el estado actual de la conexión
   */
  getConnectionStatus: () => {
    return connectionManager.getConnectionStatus();
  },

  /**
   * Obtener el número de intentos de reconexión
   */
  getReconnectionAttempts: () => {
    return connectionManager.getReconnectionAttempts();
  },

  /**
   * Suscribirse a cambios en el estado de la conexión
   */
  onConnectionChange: (callback: (status: string) => void) => {
    return connectionManager.onConnectionChange(callback);
  },

  /**
   * Forzar reconexión de todos los canales
   */
  reconnectAll: () => {
    connectionManager.reconnectAll();
  }
};
