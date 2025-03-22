
import { supabase } from '@/integrations/supabase/client';
import { LiveGameState } from '@/types/liveGame';

export async function fetchGameState(gameId: string): Promise<LiveGameState | null> {
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
    
    // Convert the status string to the required type
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

// Function for manual game start (for admins)
export async function startGame(gameId: string) {
  if (!gameId) return false;
  
  try {
    const { data, error } = await supabase
      .rpc('start_live_game', { game_id: gameId });
    
    if (error) {
      console.error('Error starting game:', error);
      throw new Error(`Error al iniciar la partida: ${error.message}`);
    }
    
    return true;
  } catch (err) {
    console.error('Error starting game:', err);
    return false;
  }
}

// Function to advance game state
export async function advanceGameState(gameId: string, forceState?: "waiting" | "question" | "result" | "leaderboard" | "finished") {
  if (!gameId) return false;
  
  try {
    const body: any = { gameId };
    if (forceState) {
      body.forceState = forceState;
    }
    
    const { data, error } = await supabase.functions.invoke('advance-game-state', {
      body
    });
    
    if (error) {
      console.error('Error advancing game state:', error);
      return false;
    }
    
    return data?.success || false;
  } catch (err) {
    console.error('Error advancing game state:', err);
    return false;
  }
}

// Function to trigger automatic state advancement based on countdown
export function setupAutoAdvance(gameId: string, status: string, countdown: number, callback?: () => void) {
  if (!gameId || countdown <= 0) return null;
  
  console.log(`Setting up auto-advance for ${status} state in ${countdown} seconds`);
  
  // Set a timer that will advance the state when countdown reaches zero
  const timer = setTimeout(async () => {
    console.log(`Auto-advancing game ${gameId} from ${status} state after ${countdown} seconds`);
    const success = await advanceGameState(gameId);
    
    if (success && callback) {
      callback();
    }
  }, countdown * 1000); // Convert seconds to milliseconds
  
  // Return the timer so it can be cleared if needed
  return timer;
}
