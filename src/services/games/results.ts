
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
