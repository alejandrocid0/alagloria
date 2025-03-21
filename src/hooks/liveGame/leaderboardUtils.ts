
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
    
    // Añadir ranks a los jugadores
    return data.map((player: any, index: number) => ({
      user_id: player.user_id,
      name: player.name,
      total_points: player.total_points,
      rank: index + 1,
      lastAnswer: player.last_answer,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=5D3891&color=fff`
    }));
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    return [];
  }
}

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
