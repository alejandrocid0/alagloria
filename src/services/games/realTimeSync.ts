
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Service for handling all real-time sync operations
 */
export const realTimeSync = {
  /**
   * Creates a subscription to a specific table
   * @param channelName Name of the channel
   * @param table Name of the table to subscribe to
   * @param filter Filter condition (optional)
   * @param callback Function to execute when changes are received
   * @returns Real-time channel for cleanup later
   */
  subscribeToTable: (
    channelName: string,
    table: string,
    filter: Record<string, any>,
    callback: (payload: any) => void
  ): RealtimeChannel => {
    console.log(`[RealTimeSync] Subscribing to ${table} with filter:`, filter);
    
    const fullChannelName = `${channelName}-${table}-${JSON.stringify(filter)}`;
    
    // Create channel and subscribe to changes
    const channel = supabase
      .channel(fullChannelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: table,
        filter: filter
      }, (payload) => {
        console.log(`[RealTimeSync] Received update for ${table}:`, payload);
        callback(payload);
      });

    // Subscribe to the channel
    channel.subscribe((status) => {
      console.log(`[RealTimeSync] Subscription status for ${table}: ${status}`);
    });
    
    return channel;
  },

  /**
   * Creates a subscription specifically for game state changes
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
   * Creates a subscription specifically for participant changes
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
   * Creates a subscription specifically for answer changes
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
   * Creates a subscription specifically for leaderboard changes
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
   * Unsubscribes from a channel when no longer needed
   */
  unsubscribe: (channel: RealtimeChannel): void => {
    if (channel) {
      console.log('[RealTimeSync] Unsubscribing');
      supabase.removeChannel(channel);
    }
  }
};
