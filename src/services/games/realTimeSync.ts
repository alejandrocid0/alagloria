
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

/**
 * Temporary placeholder service while rebuilding real-time sync
 */
export const realTimeSync = {
  subscribeToTable: (
    channelName: string,
    table: string,
    filter: Record<string, any>,
    callback: (payload: any) => void
  ): RealtimeChannel => {
    console.warn('[RealTimeSync] Temporary implementation - rebuilding in progress');
    return supabase.channel('temp');
  },

  subscribeToGameState: (gameId: string, callback: (payload: any) => void): RealtimeChannel => {
    return realTimeSync.subscribeToTable('temp', 'live_games', {}, callback);
  },

  subscribeToParticipants: (gameId: string, callback: (payload: any) => void): RealtimeChannel => {
    return realTimeSync.subscribeToTable('temp', 'game_participants', {}, callback);
  },

  subscribeToAnswers: (gameId: string, callback: (payload: any) => void): RealtimeChannel => {
    return realTimeSync.subscribeToTable('temp', 'live_game_answers', {}, callback);
  },

  subscribeToLeaderboard: (gameId: string, callback: (payload: any) => void): RealtimeChannel => {
    return realTimeSync.subscribeToTable('temp', 'live_game_answers', {}, callback);
  },

  unsubscribe: (channel: RealtimeChannel): void => {
    if (channel) {
      console.warn('[RealTimeSync] Temporary implementation - unsubscribe');
      supabase.removeChannel(channel);
    }
  }
};

