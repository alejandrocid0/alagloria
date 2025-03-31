
import { supabase } from '@/integrations/supabase/client';

export async function getLiveGameState(gameId: string) {
  // Using the RPC function instead of direct table access
  const { data, error } = await supabase
    .rpc('get_live_game_state', { game_id: gameId });
  
  if (error) {
    console.error('Error fetching live game state:', error);
    throw new Error(`Error al obtener el estado de la partida: ${error.message}`);
  }
  
  // Return the first item if it's an array since we expect a single game state
  return data && data.length > 0 ? data[0] : null;
}

export function subscribeToGameUpdates(gameId: string, callback: (payload: any) => void) {
  // Subscribe to changes in the live game state via Postgres changes
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

export async function submitAnswer(gameId: string, userId: string, questionPosition: number, selectedOption: string, answerTimeMs: number) {
  // Verificar primero si el juego está en estado de pregunta
  const { data: gameState, error: stateError } = await supabase
    .rpc('get_live_game_state', { game_id: gameId });
    
  if (stateError) {
    console.error('Error verificando estado del juego:', stateError);
    throw new Error(`Error al verificar estado de la partida: ${stateError.message}`);
  }
  
  // Solo permitir enviar respuestas si el juego está en estado 'question'
  if (!gameState || gameState.length === 0 || gameState[0].status !== 'question') {
    console.error('No se puede enviar respuesta: el juego no está en estado de pregunta');
    throw new Error('No se puede enviar respuesta ahora');
  }
  
  // Verificar que sea la pregunta actual
  if (gameState[0].current_question !== questionPosition) {
    console.error('No se puede enviar respuesta: es para una pregunta diferente a la actual');
    throw new Error('La pregunta ya no está activa');
  }
  
  // Using the RPC function to submit the answer
  const { data, error } = await supabase
    .rpc('submit_game_answer', {
      p_game_id: gameId,
      p_user_id: userId,
      p_question_position: questionPosition,
      p_selected_option: selectedOption,
      p_answer_time_ms: answerTimeMs
    });
  
  if (error) {
    console.error('Error submitting answer:', error);
    throw new Error(`Error al enviar respuesta: ${error.message}`);
  }
  
  // The RPC returns the result directly
  return data && data.length > 0 ? {
    is_correct: data[0].is_correct,
    points: data[0].points,
    correctOption: data[0].correctoption
  } : null;
}

export async function getGameLeaderboard(gameId: string) {
  // Using the RPC function to get the leaderboard
  const { data, error } = await supabase
    .rpc('get_game_leaderboard', { game_id: gameId });
  
  if (error) {
    console.error('Error fetching leaderboard with RPC:', error);
    throw new Error(`Error al obtener la clasificación: ${error.message}`);
  }
  
  // Format the results to add rank and avatar
  return data.map((player: any, index: number) => ({
    id: player.user_id,
    name: player.name,
    points: player.total_points,
    lastAnswer: player.last_answer,
    rank: index + 1,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=5D3891&color=fff`
  }));
}

export function subscribeToLeaderboardUpdates(gameId: string, callback: (payload: any) => void) {
  // Subscribe to changes in the live game answers
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

// Función para iniciar manualmente una partida (para administradores)
export async function startGame(gameId: string) {
  // Verificar primero si el juego existe y está en estado correcto para iniciar
  const { data: gameState, error: stateError } = await supabase
    .rpc('get_live_game_state', { game_id: gameId });
    
  if (stateError) {
    console.error('Error verificando estado del juego:', stateError);
    throw new Error(`Error al verificar estado de la partida: ${stateError.message}`);
  }
  
  // Si el juego ya está en curso o finalizado, no permitir iniciarlo
  if (gameState && gameState.length > 0 && 
      (gameState[0].status !== 'waiting' && gameState[0].status !== 'pending')) {
    console.error('No se puede iniciar: el juego ya está en curso o finalizado');
    throw new Error('La partida ya está en curso o ha finalizado');
  }
  
  const { data, error } = await supabase
    .rpc('start_live_game', { game_id: gameId });
  
  if (error) {
    console.error('Error starting game:', error);
    throw new Error(`Error al iniciar la partida: ${error.message}`);
  }
  
  return true;
}
