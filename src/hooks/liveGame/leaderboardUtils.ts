
import { supabase } from '@/integrations/supabase/client';
import { Player } from '@/types/liveGame';

// Function to fetch game leaderboard using the RPC function
export async function fetchGameLeaderboard(gameId: string): Promise<Player[]> {
  if (!gameId) return [];
  
  try {
    // Use the RPC function get_game_leaderboard
    const { data, error } = await supabase
      .rpc('get_game_leaderboard', { game_id: gameId });
    
    if (error) {
      console.error('Error fetching leaderboard with RPC:', error);
      throw error;
    }
    
    // Convert the response to Player type with correct property names
    return data.map((player: any, index: number) => ({
      id: player.user_id, // Use user_id as id
      name: player.name,
      points: player.total_points, // Map to points instead of total_points
      rank: index + 1, // Add rank property
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=5D3891&color=fff`,
      lastAnswer: player.last_answer as 'correct' | 'incorrect' | null // Map to lastAnswer
    }));
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    return [];
  }
}

// Function to subscribe to leaderboard updates
export function subscribeToLeaderboardUpdates(
  gameId: string, 
  callback: (payload: any) => void
) {
  if (!gameId) return null;
  
  return supabase
    .channel(`leaderboard-${gameId}`)
    .on(
      'postgres_changes',
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'live_game_answers',
        filter: `game_id=eq.${gameId}`
      },
      callback
    )
    .subscribe();
}
