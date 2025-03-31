
import { supabase } from '@/integrations/supabase/client';

interface GameResultData {
  gameId: string;
  gameTitle: string;
  position: number;
  correctAnswers: number;
  totalAnswers: number;
  entryFee?: number;
}

/**
 * Guarda los resultados de una partida finalizada en la base de datos
 */
export async function saveGameResult(data: GameResultData) {
  try {
    // Verificar si el usuario está autenticado
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error('Usuario no autenticado');
    }

    const userId = sessionData.session.user.id;
    
    // Validaciones adicionales para prevenir resultados incorrectos
    if (data.position <= 0) {
      console.warn('Posición inválida, no se guardarán resultados:', data.position);
      return null;
    }
    
    if (data.totalAnswers <= 0) {
      console.warn('No hay respuestas para guardar:', data.totalAnswers);
      return null;
    }
    
    // Verificar si el juego está realmente en estado "finished"
    const { data: gameState, error: gameStateError } = await supabase
      .rpc('get_live_game_state', { game_id: data.gameId });
      
    if (gameStateError) {
      console.error('Error al verificar estado del juego:', gameStateError);
      throw gameStateError;
    }
    
    // Solo guardar si la partida realmente ha terminado
    if (!gameState || gameState.length === 0 || gameState[0].status !== 'finished') {
      console.warn('El juego no está en estado "finished", no se guardarán resultados');
      return null;
    }
    
    // Verificar si el usuario realmente ha participado (tiene respuestas registradas)
    const { count, error: answersError } = await supabase
      .from('live_game_answers')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', data.gameId)
      .eq('user_id', userId);
      
    if (answersError) {
      console.error('Error al verificar respuestas del usuario:', answersError);
      throw answersError;
    }
    
    if (!count || count <= 0) {
      console.warn('El usuario no ha respondido ninguna pregunta, no se guardarán resultados');
      return null;
    }

    // Verificar si ya existe un resultado para evitar duplicados
    const existingResult = await checkExistingGameResult(data.gameId);
    if (existingResult) {
      console.log('Ya existe un resultado para este juego y usuario');
      return null;
    }

    // Guardar resultados en la tabla game_results
    const { data: result, error } = await supabase
      .from('game_results')
      .insert({
        user_id: userId,
        game_id: data.gameId,
        game_title: data.gameTitle,
        position: data.position,
        correct_answers: data.correctAnswers,
        total_answers: data.totalAnswers,
        entry_fee: data.entryFee || 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error al guardar resultados del juego:', error);
      throw error;
    }

    return result;
  } catch (err) {
    console.error('Error en saveGameResult:', err);
    throw err;
  }
}

/**
 * Verifica si ya existe un resultado guardado para este juego y usuario
 */
export async function checkExistingGameResult(gameId: string) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      return false;
    }

    const userId = sessionData.session.user.id;

    const { data, error } = await supabase
      .from('game_results')
      .select('id')
      .eq('game_id', gameId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error al verificar resultados existentes:', error);
      return false;
    }

    return !!data;
  } catch (err) {
    console.error('Error en checkExistingGameResult:', err);
    return false;
  }
}
