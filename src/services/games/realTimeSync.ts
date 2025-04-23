
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
    
    const fullChannelName = `${channelName}-${table}-${JSON.stringify(filter)}`;
    
    // Create channel
    const channel = supabase
      .channel(fullChannelName)
      .on(
        'postgres_changes', 
        { 
          event: '*',  // Listen for all event types (INSERT, UPDATE, DELETE)
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
        console.log(`[RealTimeSync] Subscription status for ${table}: ${status}`);
      });
    
    return channel;
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
      console.log('[RealTimeSync] Unsubscribing');
      supabase.removeChannel(channel);
    }
  }
};
