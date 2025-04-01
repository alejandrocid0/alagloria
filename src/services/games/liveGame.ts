
import { supabase } from '@/integrations/supabase/client';

/**
 * Get the current state of a live game
 */
export async function getLiveGameState(gameId: string) {
  if (!gameId) return null;
  
  try {
    const { data, error } = await supabase
      .rpc('get_live_game_state', { game_id: gameId });
    
    if (error) {
      console.error('Error fetching live game state:', error);
      return null;
    }
    
    return data?.[0] || null;
  } catch (err) {
    console.error('Error fetching game state:', err);
    return null;
  }
}

/**
 * Subscribe to game state updates
 */
export function subscribeToGameUpdates(gameId: string, callback: (payload: any) => void) {
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

/**
 * Submit an answer to a question
 */
export async function submitAnswer(
  gameId: string, 
  userId: string, 
  questionPosition: number, 
  optionId: string, 
  answerTimeMs: number = 0
) {
  if (!gameId) return null;
  
  try {
    // Submit the answer
    const { data, error } = await supabase.rpc(
      'submit_game_answer',
      {
        p_game_id: gameId,
        p_user_id: userId,
        p_question_position: questionPosition,
        p_selected_option: optionId,
        p_answer_time_ms: answerTimeMs
      }
    );

    if (error) {
      console.error('Error submitting answer:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (err) {
    console.error('Error submitting answer:', err);
    return null;
  }
}

/**
 * Get the current leaderboard for a game
 */
export async function getGameLeaderboard(gameId: string) {
  if (!gameId) return [];
  
  try {
    const { data, error } = await supabase
      .rpc('get_game_leaderboard', { game_id: gameId });
    
    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    return [];
  }
}

/**
 * Subscribe to leaderboard updates
 */
export function subscribeToLeaderboardUpdates(gameId: string, callback: (payload: any) => void) {
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
