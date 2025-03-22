
import { supabase } from '@/integrations/supabase/client';
import { Player } from '@/types/liveGame';

// Función para obtener el leaderboard utilizando la función RPC
export async function fetchGameLeaderboard(gameId: string): Promise<Player[]> {
  try {
    // Utilizamos la nueva función RPC get_game_leaderboard
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
      lastAnswer: player.last_answer // Map to lastAnswer instead of last_answer
    }));
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    return [];
  }
}

// Function alias for backward compatibility
export const getGameLeaderboard = fetchGameLeaderboard;

// Función para suscribirse a cambios en el leaderboard
export function subscribeToLeaderboardUpdates(
  gameId: string, 
  callback: (payload: any) => void
): any {
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
