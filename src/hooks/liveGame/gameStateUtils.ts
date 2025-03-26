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

export const getLiveGameState = fetchGameState;

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

// Function to advance game state through the edge function
export async function advanceGameState(gameId: string, forceState?: "waiting" | "question" | "result" | "leaderboard" | "finished") {
  if (!gameId) return false;
  
  try {
    const body: any = { gameId };
    if (forceState) {
      body.forceState = forceState;
    }
    
    // Llamar a la edge function para avanzar el estado del juego
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

// Function to run the game state manager
export async function runGameStateManager() {
  try {
    // Llamar a la edge function para gestionar el estado del juego
    const { data, error } = await supabase.functions.invoke('game-state-manager');
    
    if (error) {
      console.error('Error running game state manager:', error);
      return false;
    }
    
    console.log('Game state manager result:', data);
    return true;
  } catch (err) {
    console.error('Error running game state manager:', err);
    return false;
  }
}

// Function to check scheduled games
export async function checkScheduledGames() {
  try {
    // Llamar a la edge function para verificar partidas programadas
    const { data, error } = await supabase.functions.invoke('check-scheduled-games');
    
    if (error) {
      console.error('Error checking scheduled games:', error);
      return false;
    }
    
    console.log('Check scheduled games result:', data);
    return true;
  } catch (err) {
    console.error('Error checking scheduled games:', err);
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
    
    // Intentar usar la edge function primero por mayor robustez
    let success = await runGameStateManager();
    
    // Si falla, intentar con el método directo
    if (!success) {
      success = await advanceGameState(gameId);
    }
    
    if (success && callback) {
      callback();
    }
  }, countdown * 1000); // Convert seconds to milliseconds
  
  // Return the timer so it can be cleared if needed
  return timer;
}

// Initialize periodic check for scheduled games
export function initializeGameChecker() {
  console.log('Initializing game state checker...');
  
  // Check immediately on startup
  checkScheduledGames()
    .then(result => console.log('Initial check result:', result))
    .catch(err => console.error('Initial check error:', err));
  
  // Set up periodic check (every 60 seconds)
  const intervalId = setInterval(async () => {
    console.log('Running periodic game state check...');
    try {
      await checkScheduledGames();
      await runGameStateManager();
    } catch (error) {
      console.error('Error in periodic game check:', error);
    }
  }, 60000); // 60 seconds
  
  return intervalId;
}
