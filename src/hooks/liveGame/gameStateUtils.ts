
import { supabase } from '@/integrations/supabase/client';
import { LiveGameState } from '@/types/liveGame';

export async function fetchLiveGameState(gameId: string): Promise<LiveGameState | null> {
  try {
    const { data, error } = await supabase
      .rpc('get_live_game_state', { game_id: gameId });
    
    if (error) {
      console.error('Error fetching live game state:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      return null;
    }
    
    // Convert the RPC response to the expected LiveGameState type
    // Make sure to convert the status string to the required type
    const status = data[0].status as "waiting" | "question" | "result" | "leaderboard" | "finished";
    
    return {
      id: data[0].id,
      status: status,
      current_question: data[0].current_question,
      countdown: data[0].countdown,
      started_at: data[0].started_at,
      updated_at: data[0].updated_at
    };
  } catch (err) {
    console.error('Error fetching game state:', err);
    return null;
  }
}

export function subscribeToGameStateUpdates(
  gameId: string, 
  callback: (payload: any) => void
): any {
  return supabase
    .channel(`game-${gameId}`)
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'live_games',
        filter: `id=eq.${gameId}`
      },
      callback
    )
    .subscribe();
}
