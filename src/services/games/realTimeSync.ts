
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

/**
 * Service for handling all real-time sync operations
 * Using the correct Supabase v2 Realtime API
 */
export const realTimeSync = {
  /**
   * Subscribe to changes in a specific table with filters
   */
  subscribeToTable: (
    channelName: string,
    table: string,
    filter: Record<string, any>,
    callback: (payload: RealtimePostgresChangesPayload<any>) => void
  ): RealtimeChannel => {
    console.log(`[RealTimeSync] Subscribing to ${table} with filter:`, filter);
    
    // Create a unique name for the channel based on parameters
    const channelId = `${channelName}-${table}-${JSON.stringify(filter)}`;
    
    try {
      // Create a new channel with the unique ID
      const channel = supabase.channel(channelId);
      
      // Configure the channel to listen for database changes
      // Using the correct format for Supabase Realtime v2
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
      )
      .subscribe((status) => {
        console.log(`[RealTimeSync] Channel ${channelId} status:`, status);
        
        if (status === 'SUBSCRIBED') {
          console.log(`[RealTimeSync] Successfully subscribed to ${table}`);
        }
        
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.error(`[RealTimeSync] Channel error or closed for ${table}`);
          // Try to reconnect after an error
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

  /**
   * Subscribe to game state changes
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
   * Subscribe to participants changes
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
   * Subscribe to answers changes
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
   * Subscribe to leaderboard changes
   */
  subscribeToLeaderboard: (gameId: string, callback: (payload: any) => void): RealtimeChannel => {
    return realTimeSync.subscribeToTable(
      `leaderboard-${gameId}`,
      'live_game_answers',
      { game_id: `eq.${gameId}` },
      callback
    );
  },

  /**
   * Unsubscribe from a channel
   */
  unsubscribe: (channel: RealtimeChannel): void => {
    if (channel) {
      console.log('[RealTimeSync] Unsubscribing from channel');
      supabase.removeChannel(channel);
    }
  }
};
