
import { supabase } from '@/integrations/supabase/client';
import { LiveGameState } from '@/types/liveGame';

// Función para invocar el edge function de verificación de partidas programadas
export async function checkScheduledGames() {
  try {
    const { data, error } = await supabase.functions.invoke('check-scheduled-games');
    
    if (error) {
      console.error('Error checking scheduled games:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Unexpected error checking scheduled games:', err);
    return false;
  }
}

// Función para obtener el estado actual de una partida
export async function fetchLiveGameState(gameId: string): Promise<LiveGameState | null> {
  if (!gameId) return null;
  
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
    
    // Convertir el estado a LiveGameState
    return {
      id: data[0].id,
      status: data[0].status as "waiting" | "question" | "result" | "leaderboard" | "finished",
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

// Función para suscribirse a los cambios en el estado de la partida
export function subscribeToGameStateUpdates(
  gameId: string, 
  callback: (payload: any) => void
) {
  if (!gameId) return null;
  
  return supabase
    .channel(`game-state-${gameId}`)
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
