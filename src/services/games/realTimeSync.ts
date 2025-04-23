
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Service for handling all real-time sync operations
 * Properly implemented according to Supabase v2 API
 */
export const realTimeSync = {
  subscribeToTable: (
    channelName: string,
    table: string,
    filter: Record<string, any>,
    callback: (payload: any) => void
  ): RealtimeChannel => {
    console.log(`[RealTimeSync] Subscribing to ${table} with filter:`, filter);
    
    // Create a unique name for the channel based on parameters
    const channelId = `${channelName}-${table}-${JSON.stringify(filter)}`;
    
    try {
      // Create a new Supabase channel with specific configuration
      const channel = supabase.channel(channelId);

      // Configure the listener for database changes using the correct syntax
      // THIS IS THE FIX: using the channel.on() method with the correct parameters
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

      // Subscribe to the channel and handle connection state
      channel.subscribe((status) => {
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
